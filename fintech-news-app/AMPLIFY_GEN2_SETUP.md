# Amplify Gen 2 セットアップガイド（ローカル開発用）

このガイドは、ローカル開発環境でAmplify Gen 2バックエンドを使用する場合の手順です。

## 注意事項

**Amplify Hostingでのデプロイには問題があります。**

推奨される方法:
1. **フロントエンドのみ**: Amplify Hostingでデプロイ（モックAPI使用）
2. **バックエンド**: ローカルから手動デプロイ

詳細は`DEPLOYMENT_GUIDE.md`を参照してください。

## ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
cd fintech-news-app
npm install
```

### 2. AWS認証情報の設定

```bash
aws configure
```

以下を入力:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region: `ap-northeast-1`
- Default output format: `json`

### 3. Amplify Sandboxの起動

```bash
npm run amplify:sandbox
```

初回起動には5-10分かかります。

### 4. 開発サーバーの起動

別のターミナルで:

```bash
npm run dev
```

ブラウザで`http://localhost:5173`を開きます。

## バックエンドの手動デプロイ

本番環境用にバックエンドをデプロイする場合:

```bash
npm run amplify:deploy
```

完了すると`amplify_outputs.json`が生成されます。

## トラブルシューティング

### Sandboxが起動しない

```bash
# CloudFormationスタックを確認
aws cloudformation describe-stacks --region ap-northeast-1

# スタックを削除して再起動
npx ampx delete
npm run amplify:sandbox
```

### @parcel/watcherエラー

ローカル開発では通常発生しません。発生した場合:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 参考リンク

- [Amplify Gen 2 Documentation](https://docs.amplify.aws/react/build-a-backend/)
- [Amplify Sandbox](https://docs.amplify.aws/react/deploy-and-host/sandbox-environments/)
