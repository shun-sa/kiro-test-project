import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface PushSubscriptionData {
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
}

interface StoredSubscription extends PushSubscriptionData {
  userId: string;
  isActive: boolean;
  createdAt: string;
  lastNotified?: string;
}

/**
 * Push Subscriptionを登録
 */
async function registerSubscription(
  subscriptionData: PushSubscriptionData
): Promise<{ userId: string; success: boolean }> {
  const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE_NAME;
  if (!tableName) {
    throw new Error('PUSH_SUBSCRIPTIONS_TABLE_NAME environment variable not set');
  }

  const userId = uuidv4();
  const now = new Date().toISOString();

  const subscription: StoredSubscription = {
    ...subscriptionData,
    userId,
    isActive: true,
    createdAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: subscription,
    })
  );

  return { userId, success: true };
}

/**
 * Push Subscriptionを削除
 */
async function unregisterSubscription(userId: string): Promise<{ success: boolean }> {
  const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE_NAME;
  if (!tableName) {
    throw new Error('PUSH_SUBSCRIPTIONS_TABLE_NAME environment variable not set');
  }

  await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { userId },
    })
  );

  return { success: true };
}

/**
 * Push Subscriptionを取得
 */
async function getSubscription(userId: string): Promise<StoredSubscription | null> {
  const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE_NAME;
  if (!tableName) {
    throw new Error('PUSH_SUBSCRIPTIONS_TABLE_NAME environment variable not set');
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId },
    })
  );

  return (result.Item as StoredSubscription) || null;
}

/**
 * Push Subscription設定を更新
 */
async function updateSubscription(
  userId: string,
  preferences: PushSubscriptionData['preferences']
): Promise<{ success: boolean }> {
  const tableName = process.env.PUSH_SUBSCRIPTIONS_TABLE_NAME;
  if (!tableName) {
    throw new Error('PUSH_SUBSCRIPTIONS_TABLE_NAME environment variable not set');
  }

  const subscription = await getSubscription(userId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  subscription.preferences = preferences;

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: subscription,
    })
  );

  return { success: true };
}

/**
 * Lambda handler
 */
export const handler: Handler = async (event) => {
  console.log('Push subscription handler', { event });

  try {
    const body = JSON.parse(event.body || '{}');
    const action = body.action || event.httpMethod;

    switch (action) {
      case 'POST':
      case 'register': {
        const result = await registerSubscription(body.subscription);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(result),
        };
      }

      case 'DELETE':
      case 'unregister': {
        const userId = body.userId || event.pathParameters?.userId;
        if (!userId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'userId is required' }),
          };
        }

        const result = await unregisterSubscription(userId);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(result),
        };
      }

      case 'GET': {
        const userId = event.pathParameters?.userId;
        if (!userId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'userId is required' }),
          };
        }

        const subscription = await getSubscription(userId);
        return {
          statusCode: subscription ? 200 : 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(subscription || { error: 'Subscription not found' }),
        };
      }

      case 'PUT':
      case 'update': {
        const userId = body.userId || event.pathParameters?.userId;
        if (!userId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'userId is required' }),
          };
        }

        const result = await updateSubscription(userId, body.preferences);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(result),
        };
      }

      default:
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Error in push subscription handler:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
