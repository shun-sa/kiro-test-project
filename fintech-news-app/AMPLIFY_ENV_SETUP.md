# Amplify環境変数設定ガイド

このガイドでは、AmplifyホスティングでAppSync APIを使用するための環境変数設定手順を説明します。

## 前提条件

- ✅ Amplify Backendが構築済み
- ✅ AppSync GraphQL Endpointが取得済み
- ✅ Amplifyホスティングでアプリがデプロイ済み

## 手順

### 1. Amplify Consoleにアクセス

1. **AWS Amplify Consoleを開く**
   - https://console.aws.amazon.com/amplify/

2. **アプリを選択**
   - アプリ名: `kiro-test-project` または該当のアプリ

3. **「Hosting」セクションを確認**
   - 左サイドバーから「Hosting」→「main」ブランチを選択

### 2. Backend環境の接続

1. **「Backend environments」タブをクリック**

2. **「Connect backend」をクリック**（まだ接続されていない場合）

3. **Backend環境を選択**
   - Environment: `dev`
   - Service role: 既存のロールを選択または新規作成

4. **「Save」をクリック**

### 3. 環境変数の設定

1. **「Environment variables」タブをクリック**

2. **「Manage variables」をクリック**

3. **以下の変数を追加**

#### 変数1: モックAPIの無効化
```
Variable name: VITE_USE_MOCK_API
Value: false
```

#### 変数2: AppSync Endpoint（オプション）
```
Variable name: VITE_API_BASE_URL
Value: https://rpojqjgpi5dyfp6adgoni4rnxy.appsync-api.ap-northeast-1.amazonaws.com/graphql
```

**注意**: Backend環境が接続されている場合、`aws-exports.js`が自動的に生成されるため、`VITE_API_BASE_URL`は不要です。

4. **「Save」をクリック**

### 4. ビルド設定の更新（必要に応じて）

1. **「Build settings」タブをクリック**

2. **「Edit」をクリック**

3. **amplify.ymlを確認**

現在の設定:
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

Backend統合後の推奨設定:
```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - '# Execute Amplify CLI with the helper script'
        - amplifyPush --simple
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

4. **「Save」をクリック**

### 5. 再デプロイ

1. **「Deployments」タブに戻る**

2. **最新のデプロイを選択**

3. **「Redeploy this version」をクリック**

または、GitHubにプッシュして自動デプロイ:
```bash
git add .
git commit -m "feat: integrate AppSync backend"
git push origin main
```

### 6. デプロイの確認

デプロイが完了したら、以下を確認:

1. **ビルドログを確認**
   - Backend buildセクションで`aws-exports.js`が生成されているか
   - Frontend buildが成功しているか

2. **アプリにアクセス**
   - デプロイされたURLを開く
   - ブラウザの開発者ツールを開く（F12）

3. **Consoleログを確認**
   ```
   [MSW] Mocking enabled.  ← これが表示されない場合、モックAPIが無効化されている
   ```

4. **Networkタブを確認**
   - `/api/articles`へのリクエストが404になっていないか
   - AppSyncへのリクエストが送信されているか

## トラブルシューティング

### 問題1: 環境変数が反映されない

**症状**: デプロイ後もモックAPIが使用されている

**解決策**:
1. 環境変数が正しく設定されているか確認
2. 再デプロイを実行
3. ブラウザのキャッシュをクリア（Ctrl + Shift + R）

### 問題2: aws-exports.jsが見つからない

**症状**: ビルドエラー `Cannot find module './aws-exports'`

**解決策**:
1. Backend環境が接続されているか確認
2. ビルド設定に`amplifyPush --simple`が含まれているか確認
3. Service roleに適切な権限があるか確認

### 問題3: AppSyncへのリクエストが失敗する

**症状**: GraphQLエラーまたは401/403エラー

**解決策**:
1. AppSync API Keyが有効か確認（7日間で期限切れ）
2. API Keyを再生成:
   ```bash
   amplify update api
   # API Keyの有効期限を延長
   amplify push
   ```

### 問題4: データが表示されない

**症状**: 記事一覧が空

**原因**: DynamoDBにデータが存在しない

**解決策**: テストデータを投入（次のセクション参照）

## 次のステップ

環境変数の設定が完了したら:

1. ✅ 環境変数の設定
2. ⏭️ テストデータの投入
3. ⏭️ Lambda関数の実装（ニュース取得）
4. ⏭️ 定期実行の設定

## 参考リンク

- [Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [Amplify Backend Environments](https://docs.amplify.aws/cli/teams/overview/)
- [AppSync API Keys](https://docs.aws.amazon.com/appsync/latest/devguide/security-authz.html#api-key-authorization)
