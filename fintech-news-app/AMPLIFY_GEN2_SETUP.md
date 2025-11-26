# AWS Amplify Gen 2 セットアップガイド

このドキュメントでは、FinTech News AppのAWS Amplify Gen 2バックエンドのセットアップ手順を説明します。

## 前提条件

- Node.js 18以上
- AWS アカウント
- AWS CLI がインストールされ、設定されていること

## 1. AWS認証情報の設定

AWS CLIで認証情報を設定します：

```bash
aws configure
```

以下の情報を入力：
- AWS Access Key ID
- AWS Secret Access Key
- Default region name: `ap-northeast-1` (東京リージョン)
- Default output format: `json`

## 2. Amplify Sandboxの起動（開発環境）

開発環境では、Amplify Sandboxを使用してローカルでバックエンドをテストできます：

```bash
cd fintech-news-app
npm run amplify:sandbox
```

このコマンドは以下を実行します：
- AWS CloudFormationスタックを作成
- AppSync GraphQL APIをデプロイ
- DynamoDBテーブルを作成
- `amplify_outputs.json`を生成（フロントエンドの設定ファイル）

Sandboxが起動したら、別のターミナルで開発サーバーを起動：

```bash
npm run dev
```

## 3. 本番環境へのデプロイ

本番環境にデプロイする場合：

```bash
npm run amplify:deploy
```

## 4. 環境変数の設定

### 開発環境（モックAPI使用）

`.env.local`ファイルを作成：

```env
VITE_USE_MOCK_API=true
```

### 本番環境（Amplify Backend使用）

`.env.production`ファイルを作成：

```env
VITE_USE_MOCK_API=false
```

## 5. データモデル

### Article（記事）

```typescript
{
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: datetime;
  source: string;
  category: string;
  techLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  readingTime: number;
}
```

### Category（カテゴリ）

```typescript
{
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
}
```

## 6. 初期データの投入

Amplify Sandboxまたは本番環境が起動したら、初期データを投入します：

```bash
node scripts/seed-data.js
```

このスクリプトは以下を実行します：
- カテゴリデータの作成
- サンプル記事データの作成

## 7. GraphQL APIの使用

Amplify Gen 2では、型安全なクライアントが自動生成されます：

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

// 記事一覧を取得
const { data: articles } = await client.models.Article.list();

// 記事を作成
const { data: newArticle } = await client.models.Article.create({
  title: 'Sample Article',
  summary: 'This is a summary',
  content: 'Full content here',
  url: 'https://example.com',
  publishedAt: new Date().toISOString(),
  source: 'Example Source',
  category: 'fintech',
  readingTime: 5,
});
```

## 8. トラブルシューティング

### Sandboxが起動しない

1. AWS認証情報が正しく設定されているか確認
2. `~/.aws/credentials`ファイルを確認
3. IAM権限が適切か確認（AdministratorAccess推奨）

### amplify_outputs.jsonが生成されない

1. Sandboxが完全に起動するまで待つ（初回は5-10分かかる場合があります）
2. ターミナルのログを確認してエラーがないか確認

### フロントエンドがバックエンドに接続できない

1. `amplify_outputs.json`が存在するか確認
2. `.env.local`で`VITE_USE_MOCK_API=false`に設定
3. ブラウザのコンソールでエラーを確認

## 9. リソースのクリーンアップ

開発が終了したら、Sandboxリソースを削除：

```bash
# Sandboxを停止（Ctrl+C）
# その後、CloudFormationスタックを削除
aws cloudformation delete-stack --stack-name amplify-fintechnewsapp-sandbox-<username>
```

本番環境のリソースを削除：

```bash
aws cloudformation delete-stack --stack-name amplify-fintechnewsapp-<branch>
```

## 参考リンク

- [AWS Amplify Gen 2 Documentation](https://docs.amplify.aws/react/)
- [Amplify Data (GraphQL API)](https://docs.amplify.aws/react/build-a-backend/data/)
- [Amplify CLI Reference](https://docs.amplify.aws/cli/)
