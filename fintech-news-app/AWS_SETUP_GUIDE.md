# AWS セットアップガイド

このガイドでは、FinTech News AppのAWS環境をゼロから構築する手順を説明します。

## 前提条件

- AWSアカウント
- Node.js 18以上
- npm または yarn
- Git

## 1. AWS CLIのインストールと設定

### Windows

```powershell
# Chocolateyを使用
choco install awscli

# または、MSIインストーラーをダウンロード
# https://aws.amazon.com/cli/
```

### macOS

```bash
brew install awscli
```

### Linux

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 設定

```bash
aws configure
```

以下の情報を入力：

- **AWS Access Key ID**: IAMユーザーのアクセスキー
- **AWS Secret Access Key**: IAMユーザーのシークレットキー
- **Default region name**: `ap-northeast-1` (東京リージョン)
- **Default output format**: `json`

## 2. IAMユーザーの作成と権限設定

### AWS Consoleから

1. [IAM Console](https://console.aws.amazon.com/iam/)を開く
2. 「ユーザー」→「ユーザーを追加」
3. ユーザー名を入力（例: amplify-deploy-user）
4. 「プログラムによるアクセス」を選択
5. 権限を設定：
   - 既存のポリシーを直接アタッチ
   - 「AdministratorAccess-Amplify」を選択（推奨）
   - または「AdministratorAccess」（開発環境用）
6. アクセスキーをダウンロード

### 必要な権限

本番環境では、以下の最小権限を推奨：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:*",
        "appsync:*",
        "dynamodb:*",
        "lambda:*",
        "cloudformation:*",
        "s3:*",
        "iam:*",
        "cognito-idp:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 3. Amplify Gen 2のセットアップ

### プロジェクトのクローン

```bash
git clone <repository-url>
cd fintech-news-app
npm install
```

### Amplify Sandboxの起動

開発環境でバックエンドをテスト：

```bash
npm run amplify:sandbox
```

初回起動時の処理：

1. CloudFormationスタックの作成（5-10分）
2. AppSync GraphQL APIのデプロイ
3. DynamoDBテーブルの作成
4. `amplify_outputs.json`の生成

### 確認

Sandboxが起動したら、以下を確認：

```bash
# amplify_outputs.jsonが生成されているか
ls amplify_outputs.json

# AWS Consoleで確認
# - CloudFormation: スタックが作成されているか
# - AppSync: APIが作成されているか
# - DynamoDB: テーブルが作成されているか
```

## 4. 初期データの投入

```bash
node scripts/seed-data.mjs
```

このスクリプトは以下を実行：

- 6つのカテゴリを作成
- 30件のサンプル記事を作成

## 5. 本番環境へのデプロイ

### 方法1: Amplify CLI

```bash
npm run amplify:deploy
```

### 方法2: AWS Amplify Hosting

1. [Amplify Console](https://console.aws.amazon.com/amplify/)を開く
2. 「新しいアプリ」→「ホストWebアプリ」
3. Gitリポジトリを接続
4. ビルド設定を確認
5. デプロイ

## 6. リソースの確認

### AppSync GraphQL API

```bash
# エンドポイントを確認
aws appsync list-graphql-apis --region ap-northeast-1
```

### DynamoDB テーブル

```bash
# テーブル一覧を確認
aws dynamodb list-tables --region ap-northeast-1

# テーブルの詳細を確認
aws dynamodb describe-table --table-name <table-name> --region ap-northeast-1
```

### CloudFormation スタック

```bash
# スタック一覧を確認
aws cloudformation list-stacks --region ap-northeast-1
```

## 7. 環境変数の設定

### ローカル開発環境

`.env.local`を作成：

```env
VITE_USE_MOCK_API=false
```

### Amplify Hosting

AWS Amplify Console → 環境変数で設定：

```
VITE_USE_MOCK_API=false
```

## 8. セキュリティ設定

### API Keyの有効期限

デフォルトでは30日間有効です。本番環境では定期的に更新：

```bash
# API Keyを更新
aws appsync update-api-key \
  --api-id <api-id> \
  --id <key-id> \
  --expires $(date -d "+30 days" +%s)
```

### DynamoDBの暗号化

デフォルトで有効化されています。確認：

```bash
aws dynamodb describe-table \
  --table-name <table-name> \
  --query 'Table.SSEDescription'
```

### VPCの設定（オプション）

Lambda関数をVPC内に配置する場合：

1. VPCを作成
2. サブネットを作成
3. セキュリティグループを設定
4. Lambda関数にVPC設定を追加

## 9. モニタリングとログ

### CloudWatch Logs

```bash
# ログストリームを確認
aws logs describe-log-streams \
  --log-group-name /aws/appsync/apis/<api-id>

# ログを表示
aws logs tail /aws/appsync/apis/<api-id> --follow
```

### CloudWatch Metrics

AWS Console → CloudWatch → メトリクス

- AppSync: リクエスト数、レイテンシー、エラー率
- DynamoDB: 読み取り/書き込みキャパシティ、スロットリング
- Lambda: 実行回数、エラー、期間

### アラームの設定

```bash
# エラー率のアラームを作成
aws cloudwatch put-metric-alarm \
  --alarm-name appsync-error-rate \
  --alarm-description "AppSync error rate > 5%" \
  --metric-name 4XXError \
  --namespace AWS/AppSync \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

## 10. バックアップとリカバリ

### DynamoDBのバックアップ

```bash
# オンデマンドバックアップ
aws dynamodb create-backup \
  --table-name <table-name> \
  --backup-name backup-$(date +%Y%m%d-%H%M%S)

# ポイントインタイムリカバリを有効化
aws dynamodb update-continuous-backups \
  --table-name <table-name> \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### リストア

```bash
# バックアップからリストア
aws dynamodb restore-table-from-backup \
  --target-table-name <new-table-name> \
  --backup-arn <backup-arn>
```

## 11. コスト管理

### 無料枠

- **AppSync**: 月25万リクエスト
- **DynamoDB**: 月25GB、2500万読み取り、250万書き込み
- **Lambda**: 月100万リクエスト、40万GB秒
- **Amplify Hosting**: 月1000ビルド分、15GB転送

### コスト見積もり

[AWS Pricing Calculator](https://calculator.aws/)を使用

### コストアラート

AWS Budgets でコストアラートを設定：

```bash
aws budgets create-budget \
  --account-id <account-id> \
  --budget file://budget.json
```

`budget.json`:

```json
{
  "BudgetName": "FinTech News App Budget",
  "BudgetLimit": {
    "Amount": "50",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

## 12. トラブルシューティング

### Sandboxが起動しない

```bash
# ログを確認
cat ~/.amplify/logs/amplify-sandbox.log

# CloudFormationスタックのステータスを確認
aws cloudformation describe-stacks \
  --stack-name amplify-<app-name>-sandbox-<username>
```

### API接続エラー

1. `amplify_outputs.json`が存在するか確認
2. API Keyが有効か確認
3. ネットワーク接続を確認
4. CORSエラーの場合、AppSyncの設定を確認

### DynamoDBスロットリング

```bash
# テーブルのキャパシティを確認
aws dynamodb describe-table \
  --table-name <table-name> \
  --query 'Table.BillingModeSummary'

# オンデマンドモードに変更
aws dynamodb update-table \
  --table-name <table-name> \
  --billing-mode PAY_PER_REQUEST
```

## 13. リソースのクリーンアップ

### Sandboxの削除

```bash
# Sandboxを停止（Ctrl+C）

# CloudFormationスタックを削除
aws cloudformation delete-stack \
  --stack-name amplify-<app-name>-sandbox-<username>
```

### 本番環境の削除

```bash
# Amplify Hostingアプリを削除
aws amplify delete-app --app-id <app-id>

# CloudFormationスタックを削除
aws cloudformation delete-stack \
  --stack-name amplify-<app-name>-<branch>
```

## 参考リンク

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [Amazon DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [AWS Free Tier](https://aws.amazon.com/free/)
