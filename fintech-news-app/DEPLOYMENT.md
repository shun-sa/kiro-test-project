# デプロイメントガイド

このドキュメントでは、FinTech News Appを本番環境にデプロイする手順を説明します。

## デプロイ方法の選択

### 1. AWS Amplify Hosting（推奨）

AWS Amplify Hostingを使用すると、GitリポジトリからCI/CDパイプラインを自動構築できます。

### 2. 手動デプロイ

ビルドしたファイルを任意のホスティングサービスにデプロイします。

## AWS Amplify Hostingへのデプロイ

### 前提条件

- GitHubまたはGitLabリポジトリ
- AWS アカウント
- AWS CLI がインストールされ、設定されていること

### ステップ1: Gitリポジトリの準備

プロジェクトをGitリポジトリにプッシュ：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repository-url>
git push -u origin main
```

### ステップ2: Amplify Hostingアプリの作成

#### AWS Consoleから

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify/)を開く
2. 「新しいアプリ」→「ホストWebアプリ」をクリック
3. Gitプロバイダー（GitHub/GitLab）を選択
4. リポジトリとブランチを選択
5. ビルド設定を確認（自動検出されます）

#### AWS CLIから

```bash
# Amplify CLIをインストール
npm install -g @aws-amplify/cli

# Amplifyアプリを作成
amplify init

# ホスティングを追加
amplify add hosting

# デプロイ
amplify publish
```

### ステップ3: ビルド設定

`amplify.yml`が自動生成されますが、以下の設定を確認：

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
        - npx ampx generate outputs --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### ステップ4: 環境変数の設定

AWS Amplify Consoleで環境変数を設定：

1. アプリの設定 → 環境変数
2. 以下を追加：

```
VITE_USE_MOCK_API=false
```

### ステップ5: デプロイの確認

1. ビルドが完了するまで待つ（5-10分）
2. 提供されたURLでアプリにアクセス
3. 動作確認

## 手動デプロイ

### ステップ1: ビルド

```bash
npm run build
```

### ステップ2: Amplify Backendのデプロイ

```bash
npm run amplify:deploy
```

`amplify_outputs.json`が生成されます。

### ステップ3: 再ビルド

Amplify設定を含めて再ビルド：

```bash
npm run build
```

### ステップ4: 静的ファイルのアップロード

`dist/`ディレクトリの内容を以下のいずれかにアップロード：

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Vercel

```bash
npm install -g vercel
vercel --prod
```

#### AWS S3 + CloudFront

```bash
# S3バケットを作成
aws s3 mb s3://fintech-news-app

# 静的ウェブサイトホスティングを有効化
aws s3 website s3://fintech-news-app --index-document index.html

# ファイルをアップロード
aws s3 sync dist/ s3://fintech-news-app --delete

# CloudFrontディストリビューションを作成（オプション）
```

## カスタムドメインの設定

### AWS Amplify Hosting

1. Amplify Console → ドメイン管理
2. 「カスタムドメインを追加」
3. ドメインを入力（例: news.example.com）
4. DNS設定を更新（CNAMEレコード）
5. SSL証明書が自動発行されるまで待つ

### Netlify

1. Site settings → Domain management
2. Add custom domain
3. DNS設定を更新

### Vercel

1. Project settings → Domains
2. Add domain
3. DNS設定を更新

## 環境別設定

### 開発環境

```env
VITE_USE_MOCK_API=true
```

### ステージング環境

```env
VITE_USE_MOCK_API=false
```

### 本番環境

```env
VITE_USE_MOCK_API=false
```

## CI/CDパイプライン

### GitHub Actions

`.github/workflows/deploy.yml`を作成：

```yaml
name: Deploy to AWS Amplify

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Amplify
        run: npm run amplify:deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュをクリア
rm -rf node_modules dist
npm install
npm run build
```

### Amplify Backendに接続できない

1. `amplify_outputs.json`が存在するか確認
2. AWS認証情報が正しいか確認
3. IAM権限を確認

### 環境変数が反映されない

1. ビルド前に環境変数を設定
2. キャッシュをクリアして再ビルド

## モニタリング

### AWS CloudWatch

- Lambda関数のログ
- AppSync APIのメトリクス
- エラー率の監視

### Amplify Console

- ビルドログ
- デプロイ履歴
- アクセスログ

## バックアップ

### DynamoDBのバックアップ

```bash
# オンデマンドバックアップ
aws dynamodb create-backup \
  --table-name <table-name> \
  --backup-name fintech-news-backup-$(date +%Y%m%d)

# ポイントインタイムリカバリを有効化
aws dynamodb update-continuous-backups \
  --table-name <table-name> \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

## ロールバック

### Amplify Hosting

1. Amplify Console → デプロイ履歴
2. 以前のデプロイを選択
3. 「再デプロイ」をクリック

### 手動デプロイ

```bash
# 以前のコミットに戻す
git revert <commit-hash>
git push

# または
git reset --hard <commit-hash>
git push --force
```

## セキュリティ

### HTTPS強制

AWS Amplify Hostingでは自動的にHTTPSが有効化されます。

### セキュリティヘッダー

`amplify.yml`にカスタムヘッダーを追加：

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Frame-Options'
        value: 'DENY'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-XSS-Protection'
        value: '1; mode=block'
```

## コスト最適化

### AWS Amplify

- 無料枠: 月1000ビルド分、15GB転送
- 超過分: ビルド時間とデータ転送量に応じて課金

### DynamoDB

- オンデマンドモード推奨（トラフィックが予測不可能な場合）
- プロビジョニングモード（安定したトラフィックの場合）

### Lambda

- 無料枠: 月100万リクエスト
- メモリとタイムアウトを最適化

## 参考リンク

- [AWS Amplify Hosting Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Amplify Gen 2 Documentation](https://docs.amplify.aws/react/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
