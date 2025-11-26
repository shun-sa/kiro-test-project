# FinTech News App - プロジェクトサマリー

## プロジェクト概要

30代金融系ITエンジニア向けのレスポンシブWebアプリケーション。金融・IT分野のニュースを効率的に収集・表示し、ユーザーの趣味嗜好に合わせたUX/UIを提供します。

## 技術スタック

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **Framer Motion** - アニメーション
- **Zustand** - 軽量状態管理
- **React Router** - ルーティング
- **SWR** - データフェッチング・キャッシュ
- **MSW** - モックAPI

### バックエンド
- **AWS Amplify Gen 2** - バックエンドフレームワーク
- **AWS AppSync** - GraphQL API
- **Amazon DynamoDB** - NoSQLデータベース
- **AWS Lambda** - サーバーレス関数
- **Amazon EventBridge** - スケジューラー
- **Web Push API** - プッシュ通知

## 実装済み機能

### ✅ Phase 0-6: フロントエンド機能

1. **レスポンシブデザイン**
   - スマートフォン・PC対応
   - Tailwind CSSブレークポイント
   - モバイルファースト設計

2. **ダーク/ライトモード**
   - システム設定との連携
   - ローカルストレージで永続化
   - スムーズな切り替えアニメーション

3. **ニュース表示**
   - カテゴリ別フィルター（6カテゴリ）
   - 無限スクロール
   - 記事詳細表示
   - 技術レベルバッジ
   - 読了時間表示

4. **検索機能**
   - キーワード検索
   - リアルタイム検索結果
   - 検索履歴

5. **ブックマーク機能**
   - ワンクリック保存
   - ローカルストレージ管理
   - カテゴリ別整理
   - 保存日時順ソート

6. **通知設定UI**
   - カテゴリ別ON/OFF
   - 通知頻度設定
   - 静寂時間設定
   - ローカルストレージ保存

### ✅ Phase 7: AWS統合とバックエンド

1. **AWS Amplify Gen 2環境**
   - バックエンド定義
   - GraphQLスキーマ
   - DynamoDBテーブル
   - API Key認証

2. **ニュース取得Lambda**
   - NewsAPI統合
   - RSS Feed対応（基本構造）
   - カテゴリ自動分類
   - 技術レベル判定
   - 読了時間計算
   - 15分毎の自動実行

3. **プッシュ通知Lambda**
   - サブスクリプション管理
   - Web Push API統合
   - ユーザー設定フィルタリング
   - 静寂時間・通知頻度制御

### ✅ Phase 8: パフォーマンス最適化

1. **コード分割**
   - React.lazy動的インポート
   - ルートベース分割
   - Suspenseローディング

2. **画像最適化**
   - 遅延読み込み
   - Intersection Observer
   - プレースホルダー
   - フェードインアニメーション

3. **キャッシュ戦略**
   - SWR導入
   - 適切なキャッシュ時間
   - 自動再検証
   - オフライン対応基盤

### ✅ Phase 10: 最終調整

1. **エラーハンドリング**
   - ErrorBoundary
   - エラーメッセージコンポーネント
   - オフラインインジケーター
   - ユーザーフレンドリーなエラー表示

## プロジェクト構造

```
fintech-news-app/
├── amplify/                    # AWS Amplify Gen 2
│   ├── backend.ts             # バックエンド定義
│   ├── data/                  # データモデル
│   │   ├── resource.ts       # Article, Category
│   │   └── push-subscriptions.ts
│   └── functions/             # Lambda関数
│       ├── news-fetcher/     # ニュース取得
│       ├── push-subscription/ # サブスクリプション管理
│       └── push-sender/      # 通知配信
├── src/
│   ├── components/           # Reactコンポーネント
│   │   ├── features/        # 機能別コンポーネント
│   │   ├── layout/          # レイアウト
│   │   ├── news/            # ニュース関連
│   │   └── ui/              # UI基本コンポーネント
│   ├── hooks/               # カスタムHooks
│   │   ├── useArticles.ts  # SWR記事取得
│   │   ├── useArticle.ts   # SWR個別記事
│   │   └── useCategories.ts # SWRカテゴリ
│   ├── lib/                 # ユーティリティ
│   │   └── api/            # APIクライアント
│   ├── mocks/              # モックデータ・ハンドラー
│   ├── pages/              # ページコンポーネント
│   ├── store/              # Zustand状態管理
│   └── types/              # TypeScript型定義
├── scripts/                # ユーティリティスクリプト
│   ├── seed-data.mjs      # 初期データ投入
│   └── generate-vapid-keys.mjs # VAPID鍵生成
└── public/                 # 静的ファイル
```

## ドキュメント

| ドキュメント | 説明 |
|------------|------|
| [README.md](./README.md) | プロジェクト概要・セットアップ |
| [AMPLIFY_GEN2_SETUP.md](./AMPLIFY_GEN2_SETUP.md) | Amplify Gen 2セットアップ |
| [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md) | AWS環境構築 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | デプロイメント手順 |
| [LAMBDA_FUNCTIONS.md](./LAMBDA_FUNCTIONS.md) | Lambda関数ガイド |
| [PERFORMANCE.md](./PERFORMANCE.md) | パフォーマンス最適化 |
| [NOTIFICATION_GUIDE.md](./NOTIFICATION_GUIDE.md) | 通知機能ガイド |

## 開発環境

### ローカル開発（モックAPI）

```bash
cd fintech-news-app
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### AWS統合開発（Amplify Sandbox）

```bash
# AWS認証情報を設定
aws configure

# Sandboxを起動
npm run amplify:sandbox

# 別のターミナルで開発サーバー起動
npm run dev
```

## デプロイ

### 本番環境デプロイ

```bash
# ビルド
npm run build

# Amplifyデプロイ
npm run amplify:deploy
```

### AWS Amplify Hosting

1. GitHubリポジトリを接続
2. ビルド設定を確認
3. 環境変数を設定
4. デプロイ

## 環境変数

### 開発環境

```env
VITE_USE_MOCK_API=true
```

### 本番環境

```env
VITE_USE_MOCK_API=false
NEWS_API_KEY=your-api-key
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

## パフォーマンス指標

### 最適化結果

- ✅ コード分割による初期バンドルサイズ削減
- ✅ 画像遅延読み込みによるページロード高速化
- ✅ SWRキャッシュによるAPIリクエスト削減
- ✅ エラーハンドリングによるユーザー体験向上

### 目標値

| 指標 | 目標 |
|------|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| 初期バンドル | < 200KB |

## セキュリティ

- ✅ XSS対策（Content Security Policy）
- ✅ HTTPS強制
- ✅ API Key管理（環境変数）
- ✅ DynamoDB暗号化
- ✅ VAPID鍵管理

## 今後の拡張予定

### 機能追加

- [ ] ユーザー認証（AWS Cognito）
- [ ] 複数デバイス間での設定同期
- [ ] パーソナライゼーション
- [ ] 記事推薦機能
- [ ] コメント機能
- [ ] ソーシャルシェア

### 技術改善

- [ ] Service Worker（PWA）
- [ ] 仮想スクロール
- [ ] WebP画像対応
- [ ] GraphQL Subscription（リアルタイム更新）
- [ ] E2Eテスト（Playwright）
- [ ] CI/CDパイプライン

## ライセンス

MIT

## 開発チーム

このプロジェクトは、Spec駆動開発手法に基づいて構築されました。

- 要件定義 → 設計 → 実装 → テスト
- 段階的な機能追加
- ドキュメント重視
- パフォーマンス最適化

## サポート

問題が発生した場合は、以下のドキュメントを参照してください：

1. [README.md](./README.md) - 基本的なセットアップ
2. [AMPLIFY_GEN2_SETUP.md](./AMPLIFY_GEN2_SETUP.md) - Amplify関連
3. [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイ関連
4. [PERFORMANCE.md](./PERFORMANCE.md) - パフォーマンス関連

## 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- React
- Vite
- Tailwind CSS
- Framer Motion
- AWS Amplify
- SWR
- その他多数

すべての貢献者に感謝します。
