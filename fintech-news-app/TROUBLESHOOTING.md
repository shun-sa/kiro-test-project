# トラブルシューティングガイド

このドキュメントでは、FinTech News Appの開発・デプロイ時によくある問題と解決方法を説明します。

## AWS認証エラー

### エラーメッセージ

```
AWS access credentials can not be found.
Error: Command failed with exit code 1
```

### 原因

AWS Amplifyがデプロイ時にAWS認証情報にアクセスできない。

### 解決方法

#### 方法1: AWS CLIの設定を確認

```bash
# AWS CLIが正しく設定されているか確認
aws configure list

# 認証情報を再設定
aws configure
```

以下の情報を入力：
- AWS Access Key ID
- AWS Secret Access Key
- Default region name: `ap-northeast-1`
- Default output format: `json`

#### 方法2: 環境変数を設定

```bash
# Windows (PowerShell)
$env:AWS_ACCESS_KEY_ID="your-access-key-id"
$env:AWS_SECRET_ACCESS_KEY="your-secret-access-key"
$env:AWS_DEFAULT_REGION="ap-northeast-1"

# macOS/Linux
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_DEFAULT_REGION="ap-northeast-1"
```

#### 方法3: AWS認証情報ファイルを確認

認証情報ファイルの場所：
- Windows: `C:\Users\<username>\.aws\credentials`
- macOS/Linux: `~/.aws/credentials`

ファイル内容：
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

#### 方法4: IAM権限を確認

使用しているIAMユーザーに以下の権限があることを確認：
- `AdministratorAccess-Amplify`（推奨）
- または `AdministratorAccess`（開発環境用）

### 確認コマンド

```bash
# AWS認証情報が正しく設定されているか確認
aws sts get-caller-identity

# 出力例：
# {
#     "UserId": "AIDAI...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/username"
# }
```

## Amplify Sandboxエラー

### エラー: Cannot find package '@aws-amplify/codegen-ui'

#### 解決方法

```bash
npm install --save-dev @aws-amplify/codegen-ui
```

### エラー: Cannot find package '@aws-amplify/data-construct'

#### 解決方法

```bash
npm install --save-dev @aws-amplify/data-construct
```

### エラー: GraphQL module conflict

#### 解決方法

package.jsonに以下を追加：

```json
{
  "overrides": {
    "graphql": "^16.8.1"
  }
}
```

その後：

```bash
rm -rf node_modules package-lock.json
npm install
```

## ビルドエラー

### エラー: Cannot find module 'swr'

#### 解決方法

```bash
npm install swr
```

### エラー: Cannot find module 'web-push'

#### 解決方法

```bash
npm install --save-dev web-push @types/web-push
```

### エラー: TypeScript compilation errors

#### 解決方法

```bash
# TypeScriptキャッシュをクリア
rm -rf node_modules/.cache
rm -rf dist

# 再ビルド
npm run build
```

## デプロイエラー

### AWS Amplify Hostingでのビルド失敗

#### 原因1: 環境変数が設定されていない

**解決方法:**

1. AWS Amplify Console → アプリを選択
2. 環境変数 → 追加
3. 必要な環境変数を設定：
   - `VITE_USE_MOCK_API=false`
   - `NEWS_API_KEY=your-api-key`
   - `VAPID_PUBLIC_KEY=your-public-key`
   - `VAPID_PRIVATE_KEY=your-private-key`

#### 原因2: ビルド設定が正しくない

**解決方法:**

`amplify.yml`を確認：

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

#### 原因3: Node.jsバージョンが古い

**解決方法:**

Amplify Consoleでビルド設定を更新：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 20
        - nvm use 20
        - npm ci
```

## ローカル開発エラー

### モックAPIが動作しない

#### 解決方法

1. MSWが正しくインストールされているか確認：

```bash
npm install msw
```

2. Service Workerを再生成：

```bash
npx msw init public/ --save
```

3. `.env.local`を確認：

```env
VITE_USE_MOCK_API=true
```

### ポート3000が使用中

#### 解決方法

```bash
# Windowsの場合
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linuxの場合
lsof -ti:5173 | xargs kill -9
```

または、別のポートを使用：

```bash
npm run dev -- --port 3001
```

## DynamoDBエラー

### エラー: Table not found

#### 原因

Amplify Sandboxが完全に起動していない。

#### 解決方法

1. Sandboxを再起動：

```bash
# Ctrl+Cで停止
npm run amplify:sandbox
```

2. CloudFormationスタックを確認：

```bash
aws cloudformation describe-stacks --region ap-northeast-1
```

### エラー: Access denied

#### 原因

Lambda関数にDynamoDBへのアクセス権限がない。

#### 解決方法

`amplify/backend.ts`を確認：

```typescript
backend.data.resources.tables['Article'].grantWriteData(
  backend.newsFetcher.resources.lambda
);
```

## Lambda関数エラー

### エラー: Function timeout

#### 原因

Lambda関数の実行時間が制限を超えている。

#### 解決方法

`amplify/functions/*/resource.ts`でタイムアウトを延長：

```typescript
export const newsFetcher = defineFunction({
  name: 'news-fetcher',
  entry: './handler.ts',
  timeoutSeconds: 300, // 5分に延長
  memoryMB: 512,
});
```

### エラー: Module not found in Lambda

#### 原因

Lambda関数のpackage.jsonに依存関係が記載されていない。

#### 解決方法

`amplify/functions/*/package.json`を確認：

```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.936.0",
    "@aws-sdk/lib-dynamodb": "^3.936.0"
  }
}
```

## パフォーマンス問題

### ページロードが遅い

#### 解決方法

1. Lighthouseで分析：

```bash
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

2. バンドルサイズを確認：

```bash
npm run build
# dist/stats.htmlを確認
```

3. 画像を最適化
4. キャッシュ戦略を見直し

### メモリリーク

#### 解決方法

1. Chrome DevToolsのMemoryプロファイラーで分析
2. useEffectのクリーンアップ関数を確認：

```typescript
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe(); // クリーンアップ
  };
}, []);
```

## プッシュ通知エラー

### エラー: VAPID keys not configured

#### 解決方法

1. VAPID鍵を生成：

```bash
npm run generate:vapid
```

2. 環境変数に設定：

```bash
export VAPID_PUBLIC_KEY="..."
export VAPID_PRIVATE_KEY="..."
export VAPID_SUBJECT="mailto:your-email@example.com"
```

### エラー: Push subscription failed

#### 原因

ブラウザがプッシュ通知をサポートしていない、または許可されていない。

#### 解決方法

1. HTTPSで実行（localhostは例外）
2. ブラウザの通知許可を確認
3. Service Workerが正しく登録されているか確認

## その他の問題

### Git関連エラー

#### 大きなファイルのコミットエラー

**解決方法:**

`.gitignore`を確認：

```
node_modules/
dist/
.amplify/
amplify_outputs.json
*.log
```

### 依存関係の競合

#### 解決方法

```bash
# package-lock.jsonを削除して再インストール
rm package-lock.json
rm -rf node_modules
npm install
```

## サポートリソース

### 公式ドキュメント

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

### コミュニティ

- [AWS Amplify Discord](https://discord.gg/amplify)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/aws-amplify)

### ログの確認

#### CloudWatch Logs

```bash
# Lambda関数のログを確認
aws logs tail /aws/lambda/news-fetcher --follow --region ap-northeast-1

# AppSyncのログを確認
aws logs tail /aws/appsync/apis/<api-id> --follow --region ap-northeast-1
```

#### ブラウザコンソール

1. Chrome DevToolsを開く（F12）
2. Consoleタブでエラーを確認
3. Networkタブでリクエストを確認

## 問題が解決しない場合

1. エラーメッセージの全文をコピー
2. 実行したコマンドを記録
3. 環境情報を収集：

```bash
node --version
npm --version
aws --version
```

4. GitHubのIssueを作成、またはサポートに連絡

## よくある質問

### Q: Amplify Sandboxの起動に時間がかかる

A: 初回起動時は5-10分かかることがあります。CloudFormationスタックの作成を待ちます。

### Q: モックAPIと本番APIを切り替えるには？

A: `.env.local`の`VITE_USE_MOCK_API`を変更：
- `true`: モックAPI
- `false`: 本番API（Amplify Backend）

### Q: デプロイ後に環境変数を変更するには？

A: AWS Amplify Console → 環境変数 → 編集 → 再デプロイ

### Q: コストを抑えるには？

A: 
- DynamoDBをオンデマンドモードに設定
- Lambda関数のメモリとタイムアウトを最適化
- 不要なリソースを削除
- AWS Budgetsでアラートを設定
