# デプロイメントガイド

このドキュメントでは、FinTech News Appのデプロイ手順を説明します。

## デプロイ方法の選択

### オプション1: AWS Amplify（推奨）
- フルマネージドCI/CD
- 自動スケーリング
- カスタムドメイン対応
- 簡単なロールバック

### オプション2: 手動デプロイ
- 静的ホスティング（S3 + CloudFront）
- より細かい制御が可能

## オプション1: AWS Amplifyでのデプロイ

### 前提条件
- AWSアカウント
- GitHubリポジトリ（またはGitLab、Bitbucket）
- AWS Amplify CLI インストール済み

### ステップ1: Amplifyアプリの作成

#### 方法A: Amplify Console（推奨）

1. **AWS Amplify Consoleにアクセス**
   - https://console.aws.amazon.com/amplify/

2. **新しいアプリを作成**
   - 「Host web app」をクリック
   - GitHubを選択して認証
   - リポジトリとブランチを選択

3. **ビルド設定**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd fintech-news-app
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: fintech-news-app/dist
       files:
         - '**/*'
     cache:
       paths:
         - fintech-news-app/node_modules/**/*
   ```

4. **環境変数の設定**
   - `VITE_USE_MOCK_API`: `false`
   - `VITE_API_BASE_URL`: （AppSync GraphQL Endpoint）

5. **デプロイ**
   - 「Save and deploy」をクリック

#### 方法B: Amplify CLI

```bash
cd fintech-news-app
amplify init
amplify add hosting
amplify publish
```

### ステップ2: カスタムドメインの設定

1. **Amplify Consoleでドメイン管理**
   - 「Domain management」タブ
   - 「Add domain」をクリック

2. **ドメインの検証**
   - DNSレコードを追加
   - SSL証明書の自動発行を待つ

3. **サブドメインの設定**
   - `www.yourdomain.com`
   - `app.yourdomain.com`

### ステップ3: CI/CDの設定

Amplifyは自動的にCI/CDを設定します：

- **自動ビルド**: GitHubへのpush時
- **プレビュー環境**: Pull Request作成時
- **ロールバック**: 以前のデプロイに戻す

## オプション2: 手動デプロイ（S3 + CloudFront）

### ステップ1: ビルド

```bash
cd fintech-news-app
npm run build
```

### ステップ2: S3バケットの作成

```bash
aws s3 mb s3://fintech-news-app-prod
```

### ステップ3: 静的ウェブサイトホスティングの有効化

```bash
aws s3 website s3://fintech-news-app-prod \
  --index-document index.html \
  --error-document index.html
```

### ステップ4: ファイルのアップロード

```bash
aws s3 sync dist/ s3://fintech-news-app-prod \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.json"

aws s3 cp dist/index.html s3://fintech-news-app-prod/index.html \
  --cache-control "public, max-age=0, must-revalidate"
```

### ステップ5: CloudFrontディストリビューションの作成

```bash
aws cloudfront create-distribution \
  --origin-domain-name fintech-news-app-prod.s3.amazonaws.com \
  --default-root-object index.html
```

## 環境別デプロイ

### 開発環境（dev）

```bash
# モックAPIを使用
VITE_USE_MOCK_API=true npm run build
amplify publish --environment dev
```

### ステージング環境（staging）

```bash
# 本番APIを使用（テストデータ）
VITE_USE_MOCK_API=false npm run build
amplify publish --environment staging
```

### 本番環境（prod）

```bash
# 本番APIを使用
VITE_USE_MOCK_API=false npm run build
amplify publish --environment prod
```

## デプロイ後の確認

### 1. 動作確認チェックリスト

- [ ] トップページが表示される
- [ ] 記事一覧が取得できる
- [ ] カテゴリフィルターが動作する
- [ ] 検索機能が動作する
- [ ] 記事詳細ページが表示される
- [ ] ブックマーク機能が動作する
- [ ] 通知設定が保存される
- [ ] ダーク/ライトモード切り替えが動作する

### 2. パフォーマンス確認

```bash
# Lighthouse スコアを確認
npm install -g lighthouse
lighthouse https://your-domain.com --view
```

目標スコア：
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### 3. エラー監視

- CloudWatch Logsでエラーを確認
- Amplify Consoleでビルドログを確認
- ブラウザのコンソールでエラーを確認

## ロールバック手順

### Amplify Console

1. 「Deployments」タブを開く
2. 以前のデプロイを選択
3. 「Redeploy this version」をクリック

### 手動デプロイ

```bash
# 以前のビルドを再デプロイ
aws s3 sync backup/dist-v1.0.0/ s3://fintech-news-app-prod --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## トラブルシューティング

### 問題: ビルドが失敗する

**原因**: 依存関係のエラー

**解決策**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 問題: デプロイ後に404エラー

**原因**: SPAのルーティング設定

**解決策**: 
- S3: エラードキュメントを `index.html` に設定
- CloudFront: カスタムエラーレスポンスを設定（404 → 200, /index.html）

### 問題: 環境変数が反映されない

**原因**: ビルド時に環境変数が設定されていない

**解決策**:
```bash
# .env.production を確認
cat .env.production

# 環境変数を明示的に設定してビルド
VITE_USE_MOCK_API=false npm run build
```

### 問題: APIリクエストが失敗する

**原因**: CORS設定

**解決策**:
- AppSyncでCORS設定を確認
- APIクライアントのベースURLを確認

## セキュリティチェックリスト

- [ ] HTTPS強制
- [ ] セキュリティヘッダー設定
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
- [ ] API認証設定
- [ ] 環境変数の暗号化
- [ ] IAM権限の最小化

## パフォーマンス最適化

### 1. キャッシュ戦略

```
# 静的アセット（1年）
/assets/* - max-age=31536000, immutable

# HTML（キャッシュなし）
/index.html - max-age=0, must-revalidate

# API（5分）
/api/* - max-age=300
```

### 2. 画像最適化

- WebP形式の使用
- 遅延読み込み
- レスポンシブ画像

### 3. コード分割

- ルートベースの分割（実装済み）
- コンポーネントの動的インポート

## 監視とアラート

### CloudWatch Alarms

```bash
# エラー率アラーム
aws cloudwatch put-metric-alarm \
  --alarm-name fintech-news-high-error-rate \
  --alarm-description "Error rate > 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

### ログ分析

```bash
# Lambda関数のログを確認
aws logs tail /aws/lambda/fetchNews --follow

# AppSyncのログを確認
aws logs tail /aws/appsync/apis/YOUR_API_ID --follow
```

## コスト最適化

### 推定月額コスト（1000ユーザー想定）

- Amplify Hosting: $15
- AppSync: $4
- DynamoDB: $5
- Lambda: $1
- CloudWatch: $3
- **合計: 約$28/月**

### コスト削減のヒント

1. DynamoDBのオンデマンドモードを使用
2. Lambda関数のメモリを最適化
3. CloudFrontのキャッシュを活用
4. 不要なログを削除

## 次のステップ

1. ✅ 本番環境へのデプロイ
2. ⏭️ カスタムドメインの設定
3. ⏭️ 監視とアラートの設定
4. ⏭️ バックアップ戦略の実装
5. ⏭️ ディザスタリカバリ計画

## サポート

問題が発生した場合：
1. [AWS Support](https://console.aws.amazon.com/support/)
2. [Amplify Discord](https://discord.gg/amplify)
3. [GitHub Issues](https://github.com/your-repo/issues)
