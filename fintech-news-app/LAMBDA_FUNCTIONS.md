# Lambda Functions ガイド

このドキュメントでは、FinTech News AppのLambda関数について説明します。

## 概要

アプリケーションは以下のLambda関数を使用します：

1. **news-fetcher** - 外部APIからニュース記事を取得し、DynamoDBに保存
2. **push-subscription** - プッシュ通知のサブスクリプション管理
3. **push-sender** - プッシュ通知を配信

## news-fetcher

### 機能

- NewsAPIから金融・IT関連のニュース記事を取得
- RSS Feedから専門メディアの記事を取得（今後実装）
- 記事の自動分類（カテゴリ、技術レベル）
- 読了時間の計算
- DynamoDBへの保存

### 実行スケジュール

EventBridgeスケジューラーにより、15分毎に自動実行されます。

### 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEWS_API_KEY` | NewsAPIのAPIキー | はい |
| `ARTICLE_TABLE_NAME` | DynamoDBテーブル名 | はい（自動設定） |

### データフロー

```
External APIs → Lambda (news-fetcher) → DynamoDB (Articles)
                    ↓
              カテゴリ分類
              技術レベル判定
              読了時間計算
```

### カテゴリ分類ロジック

記事のタイトルと説明から以下のカテゴリに自動分類：

- **ai-ml**: AI、機械学習関連
- **blockchain**: ブロックチェーン、暗号資産関連
- **cloud**: クラウドコンピューティング関連
- **security**: セキュリティ関連
- **startup**: スタートアップ、資金調達関連
- **fintech**: その他金融テクノロジー関連（デフォルト）

### 技術レベル判定

記事の内容から以下のレベルに分類：

- **BEGINNER**: 初心者向け、入門記事
- **INTERMEDIATE**: 中級者向け、実践的な記事
- **ADVANCED**: 上級者向け、専門的な記事

### ローカルテスト

```bash
cd amplify/functions/news-fetcher
npm install

# 環境変数を設定
export NEWS_API_KEY="your-api-key"

# テスト実行
tsx test-handler.ts
```

### デプロイ

Amplify Sandboxまたは本番環境にデプロイ：

```bash
# Sandbox
npm run amplify:sandbox

# 本番環境
npm run amplify:deploy
```

### エラーハンドリング

- NewsAPIのレート制限エラー: 自動的にスキップし、次回実行時に再試行
- DynamoDB書き込みエラー: ログに記録し、他の記事の処理を継続
- ネットワークエラー: ログに記録し、次回実行時に再試行

### モニタリング

CloudWatch Logsで以下を確認できます：

- 取得した記事数
- 保存に成功した記事数
- エラーメッセージ

```bash
# CloudWatch Logsを確認
aws logs tail /aws/lambda/news-fetcher --follow
```

## NewsAPI設定

### APIキーの取得

1. [NewsAPI](https://newsapi.org/)にアクセス
2. アカウントを作成
3. APIキーを取得

### 無料プランの制限

- 1日100リクエストまで
- 過去1ヶ月の記事のみ取得可能
- 商用利用不可

### 環境変数の設定

#### ローカル開発

`.env.local`に追加：

```env
NEWS_API_KEY=your-api-key-here
```

#### Amplify Sandbox

```bash
ampx sandbox --profile default
# 環境変数はAWS Systems Manager Parameter Storeに保存
```

#### 本番環境

AWS Amplify Consoleで設定：

1. Amplify Console → アプリを選択
2. 環境変数 → 追加
3. `NEWS_API_KEY` = `your-api-key`

## RSS Feed統合（今後実装）

以下のRSS Feedから記事を取得予定：

- TechCrunch Japan
- ITmedia
- 日経xTECH
- Fintech Journal

実装には`rss-parser`ライブラリを使用します。

## トラブルシューティング

### Lambda関数がタイムアウトする

- タイムアウト時間を延長（現在: 5分）
- 取得する記事数を減らす
- バッチ処理を実装

### DynamoDBの書き込みスロットリング

- オンデマンドモードに変更
- バッチ書き込みを実装
- 書き込み頻度を調整

### NewsAPIのレート制限

- 有料プランにアップグレード
- キャッシュ戦略を実装
- 複数のAPIキーを使用

## 参考リンク

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [AWS Amplify Functions](https://docs.amplify.aws/react/build-a-backend/functions/)


## push-subscription

### 機能

- プッシュ通知のサブスクリプション登録
- サブスクリプション削除
- サブスクリプション設定の更新
- サブスクリプション情報の取得

### エンドポイント

| メソッド | アクション | 説明 |
|---------|----------|------|
| POST | register | 新しいサブスクリプションを登録 |
| DELETE | unregister | サブスクリプションを削除 |
| GET | - | サブスクリプション情報を取得 |
| PUT | update | サブスクリプション設定を更新 |

### リクエスト例

#### サブスクリプション登録

```json
{
  "action": "register",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    },
    "preferences": {
      "categories": ["fintech", "ai-ml"],
      "frequency": "immediate",
      "quietHours": {
        "start": "22:00",
        "end": "08:00"
      }
    }
  }
}
```

#### レスポンス

```json
{
  "userId": "uuid-here",
  "success": true
}
```

### 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `PUSH_SUBSCRIPTIONS_TABLE_NAME` | DynamoDBテーブル名 | はい（自動設定） |

## push-sender

### 機能

- 新着記事の通知配信
- ユーザー設定に基づくフィルタリング
- 静寂時間の考慮
- 通知頻度の制御

### トリガー

- news-fetcher関数から呼び出し
- 手動実行（テスト用）

### フィルタリングロジック

1. **カテゴリフィルター**: ユーザーが選択したカテゴリの記事のみ通知
2. **静寂時間**: 設定された時間帯は通知を送信しない
3. **通知頻度**: immediate（即座）、hourly（1時間毎）、daily（1日毎）

### 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `PUSH_SUBSCRIPTIONS_TABLE_NAME` | DynamoDBテーブル名 | はい（自動設定） |
| `VAPID_PUBLIC_KEY` | VAPID公開鍵 | はい |
| `VAPID_PRIVATE_KEY` | VAPID秘密鍵 | はい |
| `VAPID_SUBJECT` | VAPID subject（メールアドレス） | はい |

### VAPID鍵の生成

```bash
npm run generate:vapid
```

出力された鍵を環境変数に設定します。

### 通知ペイロード

```json
{
  "title": "新着記事",
  "body": "記事のタイトル",
  "icon": "/icon-192x192.png",
  "badge": "/badge-72x72.png",
  "data": {
    "url": "/articles/article-id",
    "articleId": "article-id"
  }
}
```

### エラーハンドリング

- **410 Gone**: サブスクリプションが無効な場合、自動的に非アクティブ化
- **404 Not Found**: サブスクリプションが見つからない場合、自動的に非アクティブ化
- その他のエラー: ログに記録し、次のサブスクリプションの処理を継続

### モニタリング

CloudWatch Logsで以下を確認：

- 送信成功数
- 送信失敗数
- スキップ数（フィルタリングによる）

## DynamoDBテーブル

### PushSubscriptions

| フィールド | 型 | 説明 |
|-----------|---|------|
| userId | String (PK) | ユーザーID（UUID） |
| endpoint | String | プッシュ通知エンドポイント |
| keys | Object | 暗号化キー（p256dh, auth） |
| preferences | Object | 通知設定 |
| isActive | Boolean | アクティブ状態 |
| lastNotified | String | 最終通知時刻（ISO 8601） |
| createdAt | String | 作成日時（ISO 8601） |

### preferences オブジェクト

```json
{
  "categories": ["fintech", "ai-ml"],
  "frequency": "immediate",
  "quietHours": {
    "start": "22:00",
    "end": "08:00"
  }
}
```

## Web Push統合

### フロントエンド実装

```typescript
// Service Workerの登録
const registration = await navigator.serviceWorker.register('/sw.js');

// プッシュ通知の許可を取得
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // サブスクリプションを作成
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY,
  });

  // バックエンドに登録
  await fetch('/api/push-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'register',
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
        },
        preferences: {
          categories: [],
          frequency: 'immediate',
          quietHours: { start: '22:00', end: '08:00' },
        },
      },
    }),
  });
}
```

### Service Worker

```javascript
// sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

## テスト

### ローカルテスト

```bash
# VAPID鍵を生成
npm run generate:vapid

# 環境変数を設定
export VAPID_PUBLIC_KEY="..."
export VAPID_PRIVATE_KEY="..."
export VAPID_SUBJECT="mailto:test@example.com"

# Lambda関数をテスト
cd amplify/functions/push-sender
npm install
tsx test-handler.ts
```

### 統合テスト

1. Amplify Sandboxを起動
2. フロントエンドでプッシュ通知を許可
3. サブスクリプションを登録
4. news-fetcher関数を手動実行
5. 通知が届くことを確認

## トラブルシューティング

### 通知が届かない

1. VAPID鍵が正しく設定されているか確認
2. サブスクリプションがアクティブか確認
3. 静寂時間内でないか確認
4. カテゴリフィルターが正しく設定されているか確認
5. CloudWatch Logsでエラーを確認

### サブスクリプションが無効になる

- ブラウザでプッシュ通知の許可を取り消した場合
- エンドポイントが無効になった場合（410 Gone）
- 再度サブスクリプションを登録する必要があります

## セキュリティ

### VAPID鍵の管理

- 秘密鍵は絶対に公開しない
- AWS Systems Manager Parameter Storeに保存
- 定期的にローテーション

### エンドポイントの検証

- サブスクリプション登録時にエンドポイントを検証
- 不正なエンドポイントは拒否

### レート制限

- 同一ユーザーからの過度なリクエストを制限
- API Gatewayのレート制限を設定
