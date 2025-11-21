# FinTech News App

30代金融系ITエンジニア向けのニュースアグリゲーションアプリケーション

## 特徴

- 📰 金融・IT・フィンテック関連ニュースの自動収集
- 🎨 ダーク/ライトモード対応
- 🔍 高度な検索機能
- 🔖 ブックマーク機能
- 🔔 プッシュ通知
- 📱 レスポンシブデザイン（PC・モバイル対応）
- ⚡ 高速なページ遷移

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand（状態管理）
- React Router

### バックエンド（AWS）
- AWS Amplify
- AWS AppSync（GraphQL API）
- AWS Lambda
- Amazon DynamoDB
- Amazon EventBridge

## クイックスタート

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-username/fintech-news-app.git
cd fintech-news-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## 開発モード

開発モードでは、モックAPIを使用してAWS環境なしで開発できます：

```bash
# モックAPIを使用（デフォルト）
npm run dev
```

## ビルド

```bash
# 本番ビルド
npm run build

# ビルドのプレビュー
npm run preview
```

## AWS統合

AWS環境への統合については、以下のドキュメントを参照してください：

- [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md) - AWS環境のセットアップ手順
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイメント手順
- [NOTIFICATION_GUIDE.md](./NOTIFICATION_GUIDE.md) - プッシュ通知機能のガイド

## プロジェクト構造

```
fintech-news-app/
├── src/
│   ├── components/      # Reactコンポーネント
│   │   ├── features/    # 機能コンポーネント
│   │   ├── layout/      # レイアウトコンポーネント
│   │   └── news/        # ニュース関連コンポーネント
│   ├── hooks/           # カスタムフック
│   ├── lib/             # ユーティリティ・ライブラリ
│   │   └── api/         # APIクライアント
│   ├── mocks/           # モックデータ（開発用）
│   ├── pages/           # ページコンポーネント
│   ├── store/           # Zustandストア
│   └── types/           # TypeScript型定義
├── public/              # 静的ファイル
└── amplify/             # AWS Amplify設定（AWS統合時）
```

## 主要機能

### 1. ニュース閲覧
- カテゴリ別フィルタリング（AI・ML、ブロックチェーン、クラウド、セキュリティ、スタートアップ）
- 技術レベル表示（初級・中級・上級）
- 読了時間表示
- 無限スクロール

### 2. 検索機能
- キーワード検索
- 検索結果のハイライト表示

### 3. ブックマーク
- ワンクリックでブックマーク
- オフライン閲覧対応
- カテゴリ別整理

### 4. プッシュ通知
- カテゴリ別通知設定
- 通知頻度設定（即座・1時間毎・1日1回）
- 静寂時間設定
- 緊急ニュース即時通知

### 5. テーマカスタマイズ
- ダーク/ライトモード
- 6色のテーマカラー
- システム設定との連携

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルドのプレビュー
npm run preview

# リント
npm run lint

# 型チェック
npm run type-check
```

## 環境変数

`.env.local` ファイルで以下の環境変数を設定：

```
# API設定
VITE_API_BASE_URL=
VITE_USE_MOCK_API=true

# NewsAPI設定（Lambda関数用）
NEWS_API_KEY=your_newsapi_key_here

# Web Push VAPID Keys（Lambda関数用）
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します！

## サポート

問題が発生した場合は、[Issues](https://github.com/your-username/fintech-news-app/issues)を作成してください。

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
