# FinTech News App

30代金融系ITエンジニア向けのレスポンシブWebアプリケーション。金融・IT分野のニュースを効率的に収集・表示します。

## 🚀 クイックスタート

### ローカル開発（モックAPI）

```bash
cd fintech-news-app
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### 本番デプロイ（AWS Amplify Gen 2）

**AWS Amplify ConsoleのGUIからGitHubリポジトリを連携してデプロイします。**

バックエンド（DynamoDB、GraphQL API、Lambda）とフロントエンドが自動的にデプロイされます。

詳細な手順は **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** を参照してください。

## 技術スタック

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **Framer Motion** - アニメーション
- **Zustand** - 状態管理
- **React Router** - ルーティング
- **SWR** - データフェッチング
- **MSW** - モックAPI

### バックエンド（オプション）
- **AWS Amplify Gen 2** - バックエンドフレームワーク
- **AWS AppSync** - GraphQL API
- **Amazon DynamoDB** - NoSQLデータベース
- **AWS Lambda** - サーバーレス関数

## 📚 ドキュメント

- **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - デプロイ手順（推奨）
- **[AMPLIFY_GEN2_SETUP.md](./AMPLIFY_GEN2_SETUP.md)** - ローカル開発用
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - トラブルシューティング

## セットアップ詳細

### 前提条件

- Node.js 20以上
- npm
- AWS アカウント（デプロイ時のみ）

### インストール

```bash
cd fintech-news-app
npm install

```bash
aws configure
```

#### 2. Amplify Sandboxの起動

```bash
npm run amplify:sandbox
```

初回起動時は5-10分かかる場合があります。`amplify_outputs.json`が生成されるまで待ちます。

#### 3. 初期データの投入

別のターミナルで：

```bash
node scripts/seed-data.mjs
```

#### 4. 環境変数の設定

`.env.local`を編集：

```env
VITE_USE_MOCK_API=false
```

#### 5. 開発サーバーの起動

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

ビルドされたファイルは`dist/`ディレクトリに出力されます。

## プレビュー

ビルドしたアプリをローカルでプレビュー：

```bash
npm run preview
```

## デプロイ

### AWS Amplify Hostingへのデプロイ

```bash
npm run amplify:deploy
```

## プロジェクト構造

```
fintech-news-app/
├── amplify/                 # Amplify Gen 2 バックエンド定義
│   ├── backend.ts          # バックエンド設定
│   └── data/
│       └── resource.ts     # データモデル定義
├── src/
│   ├── components/         # Reactコンポーネント
│   │   ├── features/      # 機能別コンポーネント
│   │   ├── layout/        # レイアウトコンポーネント
│   │   └── news/          # ニュース関連コンポーネント
│   ├── hooks/             # カスタムHooks
│   ├── lib/               # ユーティリティ
│   │   └── api/           # APIクライアント
│   ├── mocks/             # モックデータ・ハンドラー
│   ├── pages/             # ページコンポーネント
│   ├── store/             # Zustand状態管理
│   ├── types/             # TypeScript型定義
│   ├── App.tsx            # ルートコンポーネント
│   └── main.tsx           # エントリーポイント
├── scripts/               # ユーティリティスクリプト
│   └── seed-data.mjs      # 初期データ投入
└── public/                # 静的ファイル
```

## 機能

### 実装済み

- ✅ レスポンシブデザイン（スマホ・PC対応）
- ✅ ダーク/ライトモード切り替え
- ✅ カテゴリ別ニュース表示
- ✅ 記事詳細表示
- ✅ ブックマーク機能
- ✅ 検索機能
- ✅ 無限スクロール
- ✅ アニメーション効果
- ✅ モックAPI（開発環境）
- ✅ AWS Amplify Gen 2統合

### 今後の実装予定

- ⏳ プッシュ通知機能
- ⏳ オフライン閲覧
- ⏳ 外部ニュースAPI統合
- ⏳ Lambda関数による定期ニュース取得

## ドキュメント

- [プロジェクトサマリー](./PROJECT_SUMMARY.md) - 全体概要
- [Amplify Gen 2 セットアップガイド](./AMPLIFY_GEN2_SETUP.md)
- [デプロイメントガイド](./DEPLOYMENT.md)
- [AWS セットアップガイド](./AWS_SETUP_GUIDE.md)
- [Lambda Functions ガイド](./LAMBDA_FUNCTIONS.md)
- [パフォーマンス最適化ガイド](./PERFORMANCE.md)
- [通知機能ガイド](./NOTIFICATION_GUIDE.md)

## ライセンス

MIT
