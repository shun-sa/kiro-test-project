# FinTech News App デプロイガイド（Amplify Gen 2）

このガイドでは、AWS Amplify Gen 2を使用してフロントエンドとバックエンドの両方をデプロイする手順を説明します。

## 前提条件

- AWSアカウント
- GitHubリポジトリにコードがプッシュされていること
- AWS IAM権限（AdministratorAccess-Amplifyまたは同等の権限）

## デプロイ手順

### ステップ1: AWS Amplify Consoleにアクセス

1. [AWS Management Console](https://console.aws.amazon.com/)にログイン
2. リージョンを**東京（ap-northeast-1）**に設定
3. サービス検索で「Amplify」を検索
4. AWS Amplify Consoleを開く

### ステップ2: 新しいアプリを作成

1. **「Create new app」**をクリック
2. **「Host web app」**を選択
3. **GitHub**を選択して「Continue」
4. GitHubアカウントを認証（初回のみ）
5. リポジトリ: **`kiro-test-project`**を選択
6. ブランチ: **`main`**を選択
7. 「Next」をクリック

### ステップ3: アプリ設定

1. **App name**: `fintech-news-app`
2. **Monorepo detection**: 
   - Amplifyが自動的に`fintech-news-app`ディレクトリを検出します
   - 「Connecting a monorepo? Pick a folder.」で`fintech-news-app`を選択

### ステップ4: ビルド設定の確認

Amplifyが`amplify.yml`を自動検出します。内容を確認：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
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

**重要**: `amplify.yml`に`backend`セクションは不要です。Amplifyが`amplify/`ディレクトリを自動検出してバックエンドをデプロイします。

### ステップ5: バックエンドの検出

Amplifyは以下を自動的に検出します：

- `fintech-news-app/amplify/backend.ts` - バックエンド定義
- `fintech-news-app/amplify/data/resource.ts` - GraphQL API
- `fintech-news-app/package.json` - 依存関係

**「Backend detected」**というメッセージが表示されることを確認してください。

### ステップ6: 環境変数の設定（オプション）

必要に応じて環境変数を追加：

| キー | 値 | 説明 |
|------|-----|------|
| `NEWS_API_KEY` | `your-api-key` | News APIキー（Lambda関数用） |
| `VAPID_PUBLIC_KEY` | `your-public-key` | プッシュ通知用 |
| `VAPID_PRIVATE_KEY` | `your-private-key` | プッシュ通知用 |

**注意**: 初回デプロイでは環境変数なしでも動作します。

### ステップ7: サービスロールの設定

1. **「Create and use a new service role」**を選択
2. Amplifyが自動的に必要な権限を持つIAMロールを作成します
3. ロール名: `amplifyconsole-backend-role`（自動生成）

### ステップ8: 確認とデプロイ

1. 設定内容を確認
2. **「Save and deploy」**をクリック
3. デプロイが開始されます

### ステップ9: デプロイの進行状況

デプロイは以下のフェーズで進行します：

1. **Provision** (1-2分)
   - バックエンドリソースの準備
   - CloudFormationスタックの作成

2. **Build** (3-5分)
   - バックエンドのデプロイ
     - DynamoDBテーブル作成
     - AppSync GraphQL API作成
     - Lambda関数デプロイ
   - フロントエンドのビルド
     - `npm ci`で依存関係インストール
     - `npm run build`でビルド

3. **Deploy** (1-2分)
   - CloudFrontへのデプロイ
   - `amplify_outputs.json`の生成

4. **Verify** (30秒)
   - デプロイの検証

**合計時間**: 約5-10分

### ステップ10: デプロイ完了

デプロイが完了すると：

1. **URL**が表示されます
   - 例: `https://main.d3n77tolnncx6j.amplifyapp.com`
2. **Backend resources**セクションに以下が表示されます：
   - GraphQL API endpoint
   - DynamoDB tables
   - Lambda functions

### ステップ11: 動作確認

1. 表示されたURLをクリック
2. アプリが正常に表示されることを確認
3. 以下の機能をテスト：
   - ニュース記事の表示（実際のDynamoDBから取得）
   - カテゴリフィルター
   - 記事詳細表示
   - レスポンシブデザイン

---

## トラブルシューティング

### ビルドが失敗する場合

#### 1. バックエンドが検出されない

**症状**: 「Backend detected」が表示されない

**解決方法**:
- `fintech-news-app/amplify/backend.ts`が存在することを確認
- `fintech-news-app/package.json`に`@aws-amplify/backend`が含まれることを確認
- モノレポ設定で`fintech-news-app`ディレクトリが選択されていることを確認

#### 2. IAM権限エラー

**症状**: 「Access Denied」エラー

**解決方法**:
- サービスロールに必要な権限があることを確認
- Amplify Consoleで「Service role settings」を確認
- 必要に応じて`AdministratorAccess-Amplify`ポリシーをアタッチ

#### 3. npm ciが失敗する

**症状**: 「npm ERR! The `npm ci` command can only install with an existing package-lock.json」

**解決方法**:
```bash
# ローカルでpackage-lock.jsonを生成
cd fintech-news-app
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

#### 4. ビルドタイムアウト

**症状**: ビルドが15分でタイムアウト

**解決方法**:
- Amplify Consoleで「Build settings」→「Build timeout」を30分に延長
- 依存関係のキャッシュが有効になっていることを確認

---

## 継続的デプロイ

### 自動デプロイ

Amplifyは自動的にGitHubと連携し、以下の場合に自動デプロイされます：

1. `main`ブランチにプッシュ
2. プルリクエストがマージされた時

### プレビュー環境

プルリクエストごとにプレビュー環境を自動作成：

1. Amplify Console → アプリを選択
2. 「Previews」タブ
3. 「Enable previews」をクリック
4. プルリクエストを作成すると自動的にプレビューURLが生成されます

### ブランチ管理

複数のブランチをデプロイ：

1. Amplify Console → アプリを選択
2. 「App settings」→「Branch settings」
3. 「Connect branch」で新しいブランチを追加
4. 各ブランチが独立した環境を持ちます

---

## バックエンドの管理

### DynamoDBテーブル

Amplify Consoleから確認：

1. アプリを選択
2. 「Backend environments」タブ
3. 「Data」セクションでテーブルを確認

または、DynamoDB Consoleで直接確認：
- テーブル名: `Article-<環境ID>`

### GraphQL API

AppSync Consoleで確認：

1. AppSync Consoleを開く
2. API名: `fintech-news-app-<環境ID>`
3. クエリエディタでテスト可能

### Lambda関数

Lambda Consoleで確認：

1. Lambda Consoleを開く
2. 関数名:
   - `news-fetcher-<環境ID>`
   - `push-subscription-<環境ID>`
   - `push-sender-<環境ID>`

---

## コスト管理

### 無料枠

- **Amplify Hosting**: 
  - ビルド時間: 1,000分/月
  - ホスティング: 15GB/月
  - データ転送: 15GB/月

- **DynamoDB**: 
  - 25GB ストレージ
  - 25 読み込み/書き込みユニット

- **Lambda**: 
  - 100万リクエスト/月
  - 400,000 GB-秒/月

### コスト削減

1. 不要なブランチのデプロイを無効化
2. DynamoDBをオンデマンドモードに設定
3. Lambda関数のメモリとタイムアウトを最適化
4. CloudWatchログの保持期間を短縮

### コスト監視

AWS Budgetsでアラートを設定：

1. AWS Billing Consoleを開く
2. 「Budgets」→「Create budget」
3. 月額予算を設定（例: $10）
4. アラート閾値を設定（例: 80%）

---

## カスタムドメイン

### ドメインの追加

1. Amplify Console → アプリを選択
2. 「Domain management」→「Add domain」
3. ドメイン名を入力（例: `news.example.com`）
4. DNS設定を更新：
   - Route 53を使用する場合: 自動設定
   - 他のDNSプロバイダー: CNAMEレコードを追加

### SSL証明書

Amplifyが自動的にSSL/TLS証明書を発行します（無料）：
- Let's Encryptを使用
- 自動更新
- HTTPSが強制されます

---

## モニタリング

### アクセスログ

Amplify Consoleで確認：

1. アプリを選択
2. 「Monitoring」タブ
3. リクエスト数、エラー率、レスポンスタイムを確認

### CloudWatch Logs

Lambda関数のログ：

```bash
# AWS CLIでログを確認
aws logs tail /aws/lambda/news-fetcher-<環境ID> --follow
```

### アラート設定

CloudWatch Alarmsで設定：

1. CloudWatch Consoleを開く
2. 「Alarms」→「Create alarm」
3. メトリクス:
   - Lambda errors
   - DynamoDB throttles
   - API Gateway 5xx errors

---

## ロールバック

### 以前のデプロイに戻す

1. Amplify Console → アプリを選択
2. 「Deployments」タブ
3. 以前のデプロイを選択
4. 「Redeploy this version」をクリック

### バックエンドのロールバック

CloudFormationスタックから：

1. CloudFormation Consoleを開く
2. スタック名: `amplify-<app-id>-<branch>-<環境ID>`
3. 「Stack actions」→「Roll back」

---

## 削除

### アプリ全体を削除

1. Amplify Console → アプリを選択
2. 「App settings」→「General」
3. 「Delete app」をクリック
4. 確認のためアプリ名を入力

**注意**: バックエンドリソース（DynamoDB、Lambda等）も削除されます。

### 特定のブランチのみ削除

1. Amplify Console → アプリを選択
2. 削除したいブランチを選択
3. 「Actions」→「Delete branch」

---

## サポート

問題が発生した場合：

1. **ビルドログを確認**: Amplify Console → 「Deployments」タブ
2. **CloudWatch Logsを確認**: Lambda関数のエラーログ
3. **公式ドキュメント**: https://docs.amplify.aws/
4. **AWS Support**: サポートケースを作成

---

## 参考リンク

- [Amplify Gen 2 Documentation](https://docs.amplify.aws/react/)
- [Amplify Hosting](https://docs.amplify.aws/react/deploy-and-host/)
- [Amplify Backend](https://docs.amplify.aws/react/build-a-backend/)
- [GitHub Integration](https://docs.amplify.aws/react/deploy-and-host/fullstack-branching/monorepos/)
