import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import webpush from 'web-push';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  preferences: {
    categories: string[];
    frequency: 'immediate' | 'hourly' | 'daily';
    quietHours: {
      start: string;
      end: string;
    };
  };
  isActive: boolean;
  lastNotified?: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  url: string;
}

/**
 * VAPID設定を初期化
 */
function initializeVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not configured, push notifications will not work');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

/**
 * 全てのアクティブなサブスクリプションを取得
 */
async function getAllSubscriptions(): Promise<PushSubscription[]> {
  const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE_NAME;
  if (!tableName) {
    throw new Error('PUSH_SUBSCRIPTIONS_TABLE_NAME environment variable not set');
  }

  const result = await docClient.send(
    new ScanCommand({
      TableName: tableName,
      FilterExpression: 'isActive = :active',
      ExpressionAttributeValues: {
        ':active': true,
      },
    })
  );

  return (result.Items as PushSubscription[]) || [];
}

/**
 * 静寂時間内かどうかをチェック
 */
function isInQuietHours(quietHours: { start: string; end: string }): boolean {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const { start, end } = quietHours;

  // 静寂時間が設定されていない場合
  if (!start || !end) {
    return false;
  }

  // 同日内の静寂時間
  if (start < end) {
    return currentTime >= start && currentTime < end;
  }

  // 日をまたぐ静寂時間
  return currentTime >= start || currentTime < end;
}

/**
 * 通知頻度をチェック
 */
function shouldNotify(
  subscription: PushSubscription,
  frequency: 'immediate' | 'hourly' | 'daily'
): boolean {
  if (frequency === 'immediate') {
    return true;
  }

  if (!subscription.lastNotified) {
    return true;
  }

  const lastNotified = new Date(subscription.lastNotified);
  const now = new Date();
  const diffMs = now.getTime() - lastNotified.getTime();

  if (frequency === 'hourly') {
    return diffMs >= 60 * 60 * 1000; // 1時間
  }

  if (frequency === 'daily') {
    return diffMs >= 24 * 60 * 60 * 1000; // 24時間
  }

  return false;
}

/**
 * プッシュ通知を送信
 */
async function sendPushNotification(
  subscription: PushSubscription,
  article: Article
): Promise<boolean> {
  const payload = JSON.stringify({
    title: '新着記事',
    body: article.title,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: `/articles/${article.id}`,
      articleId: article.id,
    },
  });

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      payload
    );

    // 最終通知時刻を更新
    const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE_NAME;
    if (tableName) {
      await docClient.send(
        new UpdateCommand({
          TableName: tableName,
          Key: { userId: subscription.userId },
          UpdateExpression: 'SET lastNotified = :now',
          ExpressionAttributeValues: {
            ':now': new Date().toISOString(),
          },
        })
      );
    }

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);

    // サブスクリプションが無効な場合は非アクティブ化
    if (error instanceof Error && (error.message.includes('410') || error.message.includes('404'))) {
      const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE_NAME;
      if (tableName) {
        await docClient.send(
          new UpdateCommand({
            TableName: tableName,
            Key: { userId: subscription.userId },
            UpdateExpression: 'SET isActive = :inactive',
            ExpressionAttributeValues: {
              ':inactive': false,
            },
          })
        );
      }
    }

    return false;
  }
}

/**
 * 記事に対して通知を送信
 */
async function notifySubscribers(article: Article): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  const subscriptions = await getAllSubscriptions();
  console.log(`Found ${subscriptions.length} active subscriptions`);

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const subscription of subscriptions) {
    try {
      // カテゴリフィルター
      if (
        subscription.preferences.categories.length > 0 &&
        !subscription.preferences.categories.includes(article.category)
      ) {
        skipped++;
        continue;
      }

      // 静寂時間チェック
      if (isInQuietHours(subscription.preferences.quietHours)) {
        skipped++;
        continue;
      }

      // 通知頻度チェック
      if (!shouldNotify(subscription, subscription.preferences.frequency)) {
        skipped++;
        continue;
      }

      // 通知送信
      const success = await sendPushNotification(subscription, article);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
      failed++;
    }
  }

  return { sent, failed, skipped };
}

/**
 * Lambda handler
 */
export const handler: Handler = async (event) => {
  console.log('Push sender handler', { event });

  // VAPID設定を初期化
  if (!initializeVapid()) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'VAPID keys not configured',
      }),
    };
  }

  try {
    // イベントから記事情報を取得
    const article: Article = event.article || JSON.parse(event.body || '{}').article;

    if (!article || !article.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Article data is required',
        }),
      };
    }

    console.log(`Processing notifications for article: ${article.id}`);

    // 通知を送信
    const result = await notifySubscribers(article);

    console.log('Notification results:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Push notifications sent',
        ...result,
      }),
    };
  } catch (error) {
    console.error('Error in push sender:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
