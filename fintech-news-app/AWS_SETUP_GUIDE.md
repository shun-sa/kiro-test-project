# AWS統合セットアップガイド

このガイドでは、FinTech News AppをAWSに統合する手順を説明します。

## 前提条件

- AWSアカウント
- AWS CLI インストール済み
- Node.js 18以上
- npm または yarn

## アーキテクチャ概要

```
┌─────────────┐
│   ユーザー   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   AWS Amplify (ホスティング)    │
│   - React SPA                   │
│   - CI/CD                       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   AWS AppSync (GraphQL API)     │
│   - リアルタイムデータ同期       │
│   - 認証・認可                   │
└──────┬──────────────────────────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  DynamoDB   │  │   Lambda    │  │ EventBridge │
│  - Articles │  │  - News取得 │  │ - スケジュール│
│  - Users    │  │  - 通知配信 │  │ - 15分毎実行 │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Phase 1: AWS Amplify環境構築

### 1.1 AWS Amplify CLIのインストール

```bash
npm install -g @aws-amplify/cli
```

### 1.2 AWS認証情報の設定

```bash
amplify configure
```

以下の手順に従います：
1. AWSコンソールにサインイン
2. IAMユーザーを作成（AdministratorAccess権限）
3. アクセスキーとシークレットキーを取得
4. CLIに認証情報を設定

### 1.3 Amplifyプロジェクトの初期化

プロジェクトルートで以下を実行：

```bash
cd fintech-news-app
amplify init
```

設定例：
```
? Enter a name for the project: fintechnewsapp
? Initialize the project with the above configuration? No
? Enter a name for the environment: dev
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building: javascript
? What javascript framework are you using: react
? Source Directory Path: src
? Distribution Directory Path: dist
? Build Command: npm run build
? Start Command: npm run dev
? Do you want to use an AWS profile? Yes
? Please choose the profile you want to use: default
```

## Phase 2: AppSync GraphQL API設定

### 2.1 GraphQL APIの追加

```bash
amplify add api
```

設定例：
```
? Select from one of the below mentioned services: GraphQL
? Here is the GraphQL API that we will create. Select a setting to edit or continue: Continue
? Choose a schema template: Blank Schema
? Do you want to edit the schema now? Yes
```

### 2.2 GraphQLスキーマの定義

`amplify/backend/api/fintechnewsapp/schema.graphql` を編集：

```graphql
type Article @model @auth(rules: [{ allow: public }]) {
  id: ID!
  title: String!
  summary: String!
  content: String!
  url: String!
  imageUrl: String
  publishedAt: AWSDateTime!
  source: String!
  category: String!
  techLevel: String
  readingTime: Int!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Category @model @auth(rules: [{ allow: public }]) {
  id: ID!
  name: String!
  slug: String!
  icon: String!
  description: String
}

type PushSubscription @model @auth(rules: [{ allow: public }]) {
  id: ID!
  endpoint: String!
  keys: AWSJSON!
  userId: String
  categories: [String]
  frequency: String!
  quietHoursEnabled: Boolean!
  quietHoursStart: String!
  quietHoursEnd: String!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Query {
  searchArticles(query: String!, limit: Int): [Article]
    @function(name: "searchArticles-${env}")
}
```

### 2.3 APIのデプロイ

```bash
amplify push
```

確認プロンプトで `Yes` を選択してデプロイを実行します。

### 2.4 AppSync GraphQL Endpointの確認

デプロイ完了後、以下の方法でGraphQL Endpointを確認できます：

#### 方法1: Amplify CLIで確認

```bash
amplify status
```

出力例：
```
Current Environment: dev

| Category | Resource name      | Operation | Provider plugin   |
| -------- | ------------------ | --------- | ----------------- |
| Api      | fintechnewsapp     | No Change | awscloudformation |

GraphQL endpoint: https://xxxxxxxxxxxxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql
GraphQL API KEY: da2-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 方法2: AWS AppSync Consoleで確認

1. **AWS AppSync Consoleにアクセス**
   - https://console.aws.amazon.com/appsync/

2. **APIを選択**
   - 作成したAPI（例: fintechnewsapp）をクリック

3. **Settingsタブを開く**
   - 「API URL」がGraphQL Endpointです
   - 例: `https://xxxxxxxxxxxxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql`

4. **API Keyを確認**
   - 「API Keys」タブで確認
   - 例: `da2-xxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 方法3: aws-exports.jsから確認

Amplify CLIが自動生成する設定ファイルから確認：

```bash
cat src/aws-exports.js
```

出力例：
```javascript
const awsmobile = {
    "aws_appsync_graphqlEndpoint": "https://xxxxxxxxxxxxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql",
    "aws_appsync_region": "ap-northeast-1",
    "aws_appsync_authenticationType": "API_KEY",
    "aws_appsync_apiKey": "da2-xxxxxxxxxxxxxxxxxxxxxxxxxx"
};
```

#### 方法4: AWS CLIで確認

```bash
# AppSync APIのリストを取得
aws appsync list-graphql-apis --region ap-northeast-1

# 特定のAPIの詳細を取得
aws appsync get-graphql-api --api-id YOUR_API_ID --region ap-northeast-1
```

### 2.5 Endpointの設定

確認したEndpointをAmplifyの環境変数に設定：

1. **Amplify Consoleにアクセス**
   - https://console.aws.amazon.com/amplify/

2. **アプリを選択**

3. **Environment variables**タブ

4. **変数を追加**
   ```
   VITE_USE_MOCK_API = false
   VITE_API_BASE_URL = https://xxxxxxxxxxxxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql
   ```

5. **再デプロイ**
   - 「Redeploy this version」をクリック

## Phase 3: Lambda関数の実装

### 3.1 ニュース取得Lambda関数

```bash
amplify add function
```

設定例：
```
? Select which capability you want to add: Lambda function
? Provide an AWS Lambda function name: fetchNews
? Choose the runtime that you want to use: NodeJS
? Choose the function template that you want to use: Hello World
? Do you want to configure advanced settings? No
? Do you want to edit the local lambda function now? Yes
```

### 3.2 Lambda関数コードの実装

`amplify/backend/function/fetchNews/src/index.js`:

```javascript
const axios = require('axios');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const TABLE_NAME = process.env.API_FINTECHNEWSAPP_ARTICLETABLE_NAME;

exports.handler = async (event) => {
  try {
    // NewsAPIから記事を取得
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'fintech OR blockchain OR cryptocurrency OR banking',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 50,
        apiKey: NEWS_API_KEY,
      },
    });

    const articles = response.data.articles;

    // DynamoDBに保存
    for (const article of articles) {
      const item = {
        id: generateId(article.url),
        title: article.title,
        summary: article.description || '',
        content: article.content || '',
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        category: categorizeArticle(article),
        techLevel: determineTechLevel(article),
        readingTime: calculateReadingTime(article.content),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dynamodb.put({
        TableName: TABLE_NAME,
        Item: item,
      }).promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Articles fetched successfully', count: articles.length }),
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function generateId(url) {
  return Buffer.from(url).toString('base64').substring(0, 32);
}

function categorizeArticle(article) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  if (text.includes('ai') || text.includes('machine learning')) return 'ai-ml';
  if (text.includes('blockchain') || text.includes('crypto')) return 'blockchain';
  if (text.includes('cloud') || text.includes('aws') || text.includes('azure')) return 'cloud';
  if (text.includes('security') || text.includes('cyber')) return 'security';
  if (text.includes('startup') || text.includes('funding')) return 'startup';
  
  return 'fintech';
}

function determineTechLevel(article) {
  const text = (article.title + ' ' + article.description).toLowerCase();
  
  if (text.includes('advanced') || text.includes('expert')) return 'advanced';
  if (text.includes('beginner') || text.includes('introduction')) return 'beginner';
  
  return 'intermediate';
}

function calculateReadingTime(content) {
  if (!content) return 3;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200); // 200 words per minute
}
```

### 3.3 依存関係の追加

`amplify/backend/function/fetchNews/src/package.json`:

```json
{
  "name": "fetchnews",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "dependencies": {
    "axios": "^1.6.0",
    "aws-sdk": "^2.1490.0"
  }
}
```

依存関係をインストール：

```bash
cd amplify/backend/function/fetchNews/src
npm install
cd ../../../../../
```

### 3.4 環境変数の設定

```bash
amplify update function
```

環境変数 `NEWS_API_KEY` を追加します。

## Phase 4: EventBridgeスケジューラーの設定

### 4.1 スケジュールルールの作成

AWSコンソールで以下を設定：

1. EventBridge → Rules → Create rule
2. Rule name: `FetchNewsSchedule`
3. Rule type: Schedule
4. Schedule pattern: Rate expression `rate(15 minutes)`
5. Target: Lambda function `fetchNews`

または、AWS CLIで：

```bash
aws events put-rule \
  --name FetchNewsSchedule \
  --schedule-expression "rate(15 minutes)"

aws events put-targets \
  --rule FetchNewsSchedule \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:fetchNews"
```

## Phase 5: フロントエンドの統合

### 5.1 Amplifyライブラリのインストール

```bash
npm install aws-amplify @aws-amplify/ui-react
```

### 5.2 Amplify設定の追加

`src/main.tsx` に追加：

```typescript
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
```

### 5.3 環境変数の設定

`.env.production`:

```
VITE_API_BASE_URL=
VITE_USE_MOCK_API=false
```

`.env.development`:

```
VITE_API_BASE_URL=
VITE_USE_MOCK_API=true
```

### 5.4 APIクライアントの更新

既存の `src/lib/api/client.ts` は環境変数で切り替え可能になっています。

## Phase 6: デプロイ

### 6.1 Amplifyホスティングの追加

```bash
amplify add hosting
```

設定例：
```
? Select the plugin module to execute: Hosting with Amplify Console
? Choose a type: Manual deployment
```

### 6.2 デプロイの実行

```bash
amplify publish
```

## Phase 7: プッシュ通知Lambda

### 7.1 通知配信Lambda関数

```bash
amplify add function
```

設定例：
```
? Provide an AWS Lambda function name: sendNotifications
? Choose the runtime: NodeJS
? Choose the function template: Hello World
```

### 7.2 Lambda関数コード

`amplify/backend/function/sendNotifications/src/index.js`:

```javascript
const AWS = require('aws-sdk');
const webpush = require('web-push');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const SUBSCRIPTIONS_TABLE = process.env.API_FINTECHNEWSAPP_PUSHSUBSCRIPTIONTABLE_NAME;

// VAPID keys (環境変数から取得)
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async (event) => {
  try {
    // 新着記事を取得（eventから）
    const newArticles = event.articles || [];

    // 全てのサブスクリプションを取得
    const subscriptions = await dynamodb.scan({
      TableName: SUBSCRIPTIONS_TABLE,
    }).promise();

    // 各サブスクリプションに通知を送信
    for (const sub of subscriptions.Items) {
      // フィルタリングロジック
      const shouldNotify = filterArticles(newArticles, sub);
      
      if (shouldNotify.length > 0) {
        const payload = JSON.stringify({
          title: 'FinTech News',
          body: `${shouldNotify.length}件の新着記事があります`,
          icon: '/vite.svg',
          data: { articles: shouldNotify },
        });

        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: JSON.parse(sub.keys),
          },
          payload
        );
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notifications sent' }),
    };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function filterArticles(articles, subscription) {
  // カテゴリフィルター
  if (subscription.categories && subscription.categories.length > 0) {
    articles = articles.filter(a => subscription.categories.includes(a.category));
  }

  // 静寂時間チェック
  if (subscription.quietHoursEnabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { quietHoursStart, quietHoursEnd } = subscription;
    
    if (quietHoursStart > quietHoursEnd) {
      if (currentTime >= quietHoursStart || currentTime <= quietHoursEnd) {
        return []; // 静寂時間中
      }
    } else {
      if (currentTime >= quietHoursStart && currentTime <= quietHoursEnd) {
        return []; // 静寂時間中
      }
    }
  }

  return articles;
}
```

## トラブルシューティング

### 問題: Amplify pushが失敗する

**解決策**:
- AWS認証情報を確認
- IAM権限を確認
- `amplify status` でリソース状態を確認

### 問題: GraphQL APIが動作しない

**解決策**:
- AppSyncコンソールでクエリをテスト
- CloudWatch Logsでエラーを確認
- スキーマの構文エラーを確認

### 問題: Lambda関数がタイムアウトする

**解決策**:
- タイムアウト設定を延長（デフォルト3秒→30秒）
- メモリ設定を増やす
- 処理を最適化

## 次のステップ

1. ✅ AWS環境のセットアップ
2. ✅ GraphQL APIの構築
3. ✅ Lambda関数の実装
4. ✅ フロントエンドの統合
5. ⏭️ 監視とログの設定
6. ⏭️ パフォーマンス最適化
7. ⏭️ セキュリティ強化

## 参考リンク

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
