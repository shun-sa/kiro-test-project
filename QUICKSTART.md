# クイックスタート - 5分でデプロイ

## 前提条件

- AWSアカウント
- GitHubにコードがプッシュ済み

## デプロイ手順（5ステップ）

### 1. AWS Amplify Consoleを開く

https://console.aws.amazon.com/amplify/ にアクセス

### 2. アプリを作成

1. 「Create new app」→「Host web app」
2. GitHubを選択
3. リポジトリ: `kiro-test-project`
4. ブランチ: `main`

### 3. モノレポ設定

「Connecting a monorepo? Pick a folder.」で **`fintech-news-app`** を選択

### 4. サービスロールを作成

「Create and use a new service role」を選択

### 5. デプロイ開始

「Save and deploy」をクリック

---

## 完了！

5-10分後、以下がデプロイされます：

✅ フロントエンド（React + Vite）  
✅ バックエンド（DynamoDB + GraphQL API + Lambda）  
✅ HTTPS対応のURL

---

## 重要なポイント

### ✅ 正しい設定

- `amplify.yml`に**backendセクションは不要**
- Amplifyが`amplify/`ディレクトリを自動検出
- モノレポ構造（`fintech-news-app`）を指定

### ❌ よくある間違い

- `amplify.yml`にbackendセクションを追加する
- モノレポ設定を忘れる
- ルートディレクトリを指定する

---

## トラブルシューティング

### ビルドが失敗する

1. **package-lock.jsonがない**
   ```bash
   cd fintech-news-app
   npm install
   git add package-lock.json
   git commit -m "Add package-lock.json"
   git push
   ```

2. **モノレポ設定が間違っている**
   - Amplify Console → App settings → Build settings
   - 「Monorepo」で`fintech-news-app`を選択

3. **IAM権限エラー**
   - サービスロールに`AdministratorAccess-Amplify`をアタッチ

---

## 次のステップ

詳細なガイド: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

- カスタムドメインの設定
- 環境変数の追加
- プレビュー環境の有効化
- モニタリングとアラート
