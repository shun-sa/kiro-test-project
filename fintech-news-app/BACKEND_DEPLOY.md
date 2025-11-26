# バックエンドのデプロイ手順

AWS Amplify Hostingの`@parcel/watcher`問題により、バックエンドは手動でデプロイする必要があります。

## 前提条件

- AWS CLIがインストールされ、設定されていること
- 適切なAWS認証情報が設定されていること

## デプロイ手順

### 1. ローカル環境でバックエンドをデプロイ

```bash
cd fintech-news-app
npm run amplify:deploy
```

このコマンドは以下を実行します：
- Amplify Gen 2バックエンドをAWSにデプロイ
- DynamoDBテーブルを作成
- GraphQL APIを作成
- Lambda関数をデプロイ
- `amplify_outputs.json`を生成

### 2. amplify_outputs.jsonをコミット

デプロイが完了したら、生成された`amplify_outputs.json`をGitにコミットします：

```bash
git add amplify_outputs.json
git commit -m "Add Amplify backend outputs"
git push
```

### 3. フロントエンドの再デプロイ

AWS Amplify Hostingが自動的にフロントエンドを再ビルドし、バックエンドに接続します。

## 注意事項

- バックエンドの変更を行った場合は、再度`npm run amplify:deploy`を実行してください
- `amplify_outputs.json`は機密情報を含まないため、Gitにコミットしても安全です
- 本番環境とステージング環境で異なるバックエンドを使用する場合は、環境ごとに手動デプロイが必要です

## トラブルシューティング

### デプロイが失敗する場合

1. AWS認証情報を確認：
```bash
aws sts get-caller-identity
```

2. Amplify CLIのバージョンを確認：
```bash
npx ampx --version
```

3. ログを確認：
```bash
npm run amplify:deploy -- --verbose
```

### バックエンドを削除する場合

```bash
cd fintech-news-app
npx ampx delete
```
