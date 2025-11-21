# 設計文書

## 概要

FinTech News Appは、30代金融系ITエンジニア向けのレスポンシブWebアプリケーションです。React + TypeScript + Next.jsをベースとし、モダンなWebテクノロジーを活用してパフォーマンスと開発効率を両立します。

## アーキテクチャ

### 全体アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  External APIs  │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│  (News Sources) │
│                 │    │                 │    │                 │
│ - React UI      │    │ - News Fetcher  │    │ - NewsAPI       │
│ - State Mgmt    │    │ - Data Process  │    │ - RSS Feeds     │
│ - PWA Features  │    │ - Cache Layer   │    │ - Financial APIs│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Storage │    │   Database      │    │   CDN/Cache     │
│   - Bookmarks   │    │ Dev: SQLite     │    │   - Images      │
│   - Preferences │    │ Prod: PostgreSQL│    │   - Static      │
│   - Cache       │    │   - Articles    │    │   - Assets      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック

**フロントエンド:**
- **React 18**: SPA（Single Page Application）
- **TypeScript**: 型安全性
- **Tailwind CSS**: レスポンシブデザイン、ダークモード
- **Framer Motion**: アニメーション、マイクロインタラクション
- **Zustand**: 軽量状態管理
- **AWS Amplify SDK**: AWS サービス統合

**バックエンド (AWS Serverless):**
- **AWS AppSync**: GraphQL API、リアルタイム機能
- **AWS Lambda**: サーバーレス関数（ビジネスロジック）
- **データベース**: 環境別構成
  - **開発環境**: SQLite（ローカルファイル）
  - **本番環境**: Amazon DynamoDB（NoSQL）
- **AWS Amplify CLI**: インフラ管理、デプロイ

**外部サービス:**
- **NewsAPI**: 一般ニュース生データ取得（英語・日本語）
- **RSS Feeds**: 専門メディア生データ取得
  - TechCrunch Japan
  - ITmedia
  - 日経xTECH
  - Fintech Journal
- **Web Push API**: プッシュ通知配信
- **AWS Services**: Amplify、AppSync、DynamoDB、Lambda、S3、CloudFront

## コンポーネントとインターフェース

### フロントエンドコンポーネント構成

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── news/              # ニュース関連ページ
│   └── api/               # API Routes
├── components/            # UIコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   ├── news/             # ニュース関連コンポーネント
│   └── features/         # 機能別コンポーネント
├── lib/                  # ユーティリティ・設定
├── hooks/                # カスタムHooks
├── store/                # 状態管理
└── types/                # TypeScript型定義
```

### 主要コンポーネント

**1. レイアウトコンポーネント**
- `Header`: ナビゲーション、テーマ切り替え
- `Sidebar`: カテゴリフィルター（PC版）
- `BottomNav`: ナビゲーション（モバイル版）
- `Layout`: レスポンシブレイアウト管理

**2. ニュースコンポーネント**
- `NewsFeed`: ニュース一覧表示
- `NewsCard`: 個別ニュース項目
- `NewsDetail`: 記事詳細表示
- `CategoryFilter`: カテゴリ絞り込み

**3. 機能コンポーネント**
- `BookmarkButton`: ブックマーク機能
- `ThemeToggle`: ダーク/ライトモード切り替え
- `NotificationSettings`: 通知設定
- `SearchBar`: 記事検索

### ユーザー体験設計

**匿名ユーザー（デフォルト）:**
- ローカルストレージでのみデータ管理
- デバイス固有の設定・ブックマーク
- サーバーサイドにユーザー情報なし
- プライバシー重視（GDPR準拠）

**認証ユーザー（オプション）:**
- AWS Cognito による認証
- 複数デバイス間での設定同期
- クラウドバックアップ
- 高度な機能（パーソナライゼーション）

### 通知システム設計

**Web Push Notifications (匿名ユーザー対応)**

```typescript
// Push Subscription管理
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;          // ローカル生成UUID
  preferences: {
    categories: string[];
    frequency: 'immediate' | 'hourly' | 'daily';
    quietHours: {
      start: string;
      end: string;
    };
  };
  createdAt: string;
  lastNotified: string;
}
```

**通知フロー:**
1. **ユーザー**: ブラウザで通知許可
2. **React App**: Push Subscription取得
3. **AppSync Mutation**: サブスクリプション登録（DynamoDB保存）
4. **Lambda News Fetch**: 新記事取得時
5. **Lambda Push Sender**: 条件に合致するサブスクリプションに通知送信
6. **Service Worker**: ブラウザで通知表示

**DynamoDB PushSubscriptions テーブル:**
```typescript
interface PushSubscriptionRecord {
  PK: string;              // "PUSH#${userId}"
  SK: string;              // "SUBSCRIPTION"
  endpoint: string;
  keys: object;
  preferences: object;
  isActive: boolean;
  lastNotified: string;
  createdAt: string;
}
```

**通知配信ロジック:**
- 新記事投稿時にLambdaが全サブスクリプションをチェック
- ユーザー設定（カテゴリ、頻度、静寂時間）に基づいてフィルタリング
- Web Push APIで個別配信

### API インターフェース

**AppSync GraphQL Schema**

```graphql
type Article {
  id: ID!
  title: String!
  summary: String!
  content: String!
  url: String!
  imageUrl: String
  publishedAt: AWSDateTime!
  source: String!
  category: String!
  techLevel: TechLevel
  readingTime: Int!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Category {
  id: ID!
  name: String!
  slug: String!
  color: String!
  icon: String!
  description: String!
}

enum TechLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

type Query {
  listArticles(category: String, limit: Int, nextToken: String): ArticleConnection
  getArticle(id: ID!): Article
  listCategories: [Category!]!
  searchArticles(query: String!, limit: Int): [Article!]!
}

type Mutation {
  createArticle(input: CreateArticleInput!): Article
  updateArticle(input: UpdateArticleInput!): Article
  deleteArticle(id: ID!): Article
}

type Subscription {
  onArticleCreated(category: String): Article
    @aws_subscribe(mutations: ["createArticle"])
}

type ArticleConnection {
  items: [Article!]!
  nextToken: String
}
```

**AppSync Resolver 設定**

**Direct Resolvers (VTL Templates):**
```vtl
## listArticles - Request Template
{
  "version": "2017-02-28",
  "operation": "Query",
  "query": {
    "expression": "GSI1PK = :category",
    "expressionValues": {
      ":category": {"S": "CATEGORY#$ctx.args.category"}
    }
  },
  "limit": $util.defaultIfNull($ctx.args.limit, 20),
  "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.args.nextToken, null))
}

## getArticle - Request Template  
{
  "version": "2017-02-28",
  "operation": "GetItem",
  "key": {
    "PK": {"S": "ARTICLE#$ctx.args.id"},
    "SK": {"S": "METADATA"}
  }
}
```

**Lambda Resolvers (複雑なロジック用):**
```typescript
// 検索機能（全文検索）
export const searchArticlesResolver = async (event: AppSyncResolverEvent<{
  query: string;
  limit?: number;
}>) => {
  // DynamoDB Scan with FilterExpression
  // または OpenSearch Service 連携
};

// 人気記事取得（集計ロジック）
export const getTrendingArticlesResolver = async () => {
  // 複雑な集計処理
  // キャッシュ戦略
};
```

## データモデル

### データベーススキーマ

```typescript
**Articles テーブル (DynamoDB):**
```typescript
interface Article {
  PK: string;           // "ARTICLE#${id}"
  SK: string;           // "METADATA"
  GSI1PK: string;       // "CATEGORY#${categoryId}"
  GSI1SK: string;       // "${publishedAt}#${id}"
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;  // ISO string
  source: string;
  category: string;
  techLevel?: 'beginner' | 'intermediate' | 'advanced';
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}
```

**Categories テーブル (DynamoDB):**
```typescript
interface Category {
  PK: string;           // "CATEGORY#${id}"
  SK: string;           // "METADATA"
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
}
```

### ユーザー管理戦略

**Phase 1: ローカルストレージのみ（MVP）**
```typescript
interface UserPreferences {
  userId: string;          // UUID (ローカル生成)
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
    categories: string[];
    quietHours: {
      start: string; // HH:mm
      end: string;   // HH:mm
    };
  };
  layout: {
    cardSize: 'compact' | 'comfortable';
    showImages: boolean;
    showSummary: boolean;
  };
  bookmarks: string[];     // Article IDs
  readArticles: string[];  // 既読記事管理
  createdAt: string;
  updatedAt: string;
}
```

**Phase 2: オプション認証（将来拡張）**
```typescript
// AWS Cognito User Pool (オプション)
interface AuthenticatedUser {
  cognitoId: string;       // Cognito User ID
  email?: string;          // オプション
  preferences: UserPreferences;
  syncEnabled: boolean;    // 同期機能ON/OFF
}

// DynamoDB UserProfiles テーブル
interface UserProfile {
  PK: string;              // "USER#${cognitoId}"
  SK: string;              // "PROFILE"
  preferences: UserPreferences;
  devices: {
    deviceId: string;
    lastSync: string;
  }[];
}
```
```

### 状態管理

```typescript
// Zustand Store
interface AppState {
  // ニュース関連
  articles: Article[];
  categories: Category[];
  selectedCategory: string | null;
  loading: boolean;
  
  // UI状態
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // ユーザー設定
  preferences: UserPreferences;
  
  // アクション
  fetchArticles: (category?: string, page?: number) => Promise<void>;
  toggleBookmark: (articleId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}
```

## エラーハンドリング

### エラー分類と対応

**1. ネットワークエラー**
- オフライン状態の検出
- キャッシュされたコンテンツの表示
- 再接続時の自動同期

**2. API エラー**
- レート制限対応（指数バックオフ）
- フォールバック データソース
- ユーザーフレンドリーなエラーメッセージ

**3. データエラー**
- 不正なデータの検証とフィルタリング
- デフォルト値の提供
- ログ記録と監視

### エラーバウンダリ

```typescript
// React Error Boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// エラー回復機能
interface ErrorRecovery {
  retry: () => void;
  fallback: React.ComponentType;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
}
```

## テスト戦略

### テスト構成

**1. 単体テスト (Jest + React Testing Library)**
- コンポーネントの動作テスト
- カスタムHooksのテスト
- ユーティリティ関数のテスト

**2. 統合テスト**
- API エンドポイントのテスト
- データベース操作のテスト
- 外部API統合のテスト

**3. E2Eテスト (Playwright)**
- ユーザーフローのテスト
- レスポンシブデザインのテスト
- パフォーマンステスト

### テスト対象

**優先度高:**
- ニュース取得・表示機能
- ブックマーク機能
- レスポンシブデザイン
- テーマ切り替え

**優先度中:**
- 検索機能
- カテゴリフィルタリング
- 通知機能

### レンダリング戦略 (SPA + AWS Amplify)

**1. 静的ホスティング (S3 + CloudFront)**
- React SPAとして構築
- 初期ロード時にアプリケーションシェル表示
- 動的コンテンツはAppSync経由で取得

**2. クライアントサイドレンダリング**
- 全ページCSRで実装
- AppSyncのリアルタイム機能活用
- オフライン対応（Service Worker）

**3. SEO対策**
- React Helmet でメタタグ管理
- プリレンダリング（必要に応じて）
- OGP対応（動的メタタグ生成）

### パフォーマンス最適化

**1. フロントエンド最適化**
- コード分割（Dynamic Import）
- 画像最適化（Next.js Image）
- 仮想スクロール（大量データ対応）
- Service Worker（PWA機能）

**2. データ取得最適化**
- SWR/React Query（キャッシュ戦略）
- 増分静的再生成（ISR）
- CloudFront CDN活用
- S3での画像最適化
- Lambda での定期ニュース取得
- クライアントサイドキャッシュ（軽い操作）

**3. バンドル最適化**
- Tree Shaking
- 不要な依存関係の除去
- 圧縮とminification

### デプロイメント戦略

**開発環境:**
- ローカル開発: SQLite（ファイルベース）
- 簡単なセットアップ、マイグレーション不要

**本番環境 (AWS Amplify):**
- **AWS Amplify**: フロントエンドホスティング・CI/CD
- **Amazon S3**: 静的サイトホスティング
- **Amazon CloudFront**: CDN（グローバル配信）
- **AWS AppSync**: GraphQL API（Direct + Lambda Resolvers、リアルタイム機能）
- **Amazon DynamoDB**: NoSQLデータベース
- **AWS Lambda**: サーバーレス関数（複雑なResolver、ニュース取得）
- **Amazon EventBridge**: 定期実行スケジューラー

**AWS Amplify アーキテクチャ:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   S3 Static     │    │   AppSync       │
│   (CDN)         │◄──►│   (React SPA)   │◄──►│   (GraphQL API) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       │                       ▼
┌─────────────────┐              │              ┌─────────────────┐
│   S3 Bucket     │              │              │   DynamoDB      │
│   (Images)      │              │              │ - Articles      │
└─────────────────┘              │              │ - PushSubs      │
                                 │              └─────────────────┘
                                 │                       ▲
                                 │                       │
┌─────────────────┐              │              ┌─────────────────┐
│   EventBridge   │              │              │   Lambda        │
│   (Scheduler)   │──────────────┼─────────────►│   (News Fetch)  │
└─────────────────┘              │              └─────────────────┘
                                 │                       │
                                 │                       ▼
                                 │              ┌─────────────────┐
                                 │              │   Lambda        │
                                 │              │   (Push Sender) │
                                 │              └─────────────────┘
                                 │                       │
                                 │                       ▼
                                 │              ┌─────────────────┐
                                 │              │   Web Push API  │
                                 │              │   (Browsers)    │
                                 │              └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   External APIs │
                        │   (NewsAPI/RSS) │
                        └─────────────────┘
```

### External APIs vs DynamoDB の役割分担

**External APIs（データソース）:**
- **NewsAPI**: 一般的なニュース記事の生データ取得
- **RSS Feeds**: 金融・IT専門メディアの最新記事
- **役割**: 外部からの記事情報収集のみ
- **データ形式**: 各APIの独自フォーマット
- **更新頻度**: リアルタイム（外部依存）

**DynamoDB（アプリケーションDB）:**
- **Articles テーブル**: 加工済み記事データの永続化
- **役割**: アプリケーション用に最適化されたデータ保存
- **データ形式**: アプリケーション統一フォーマット
- **付加価値**: カテゴリ分類、技術レベル判定、読了時間計算

**データ変換プロセス:**
```typescript
// External API → DynamoDB 変換例
interface ExternalNewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string };
  urlToImage?: string;
}

// ↓ Lambda News Fetch で変換 ↓

interface ProcessedArticle {
  id: string;              // UUID生成
  title: string;           // そのまま
  summary: string;         // description → summary
  content: string;         // 本文取得（スクレイピング）
  url: string;             // そのまま
  imageUrl?: string;       // urlToImage → imageUrl
  publishedAt: string;     // ISO形式に統一
  source: string;          // source.name → source
  category: string;        // AI/ルールベースで分類
  techLevel?: TechLevel;   // コンテンツ解析で判定
  readingTime: number;     // 文字数から計算
  createdAt: string;       // 処理時刻
  updatedAt: string;       // 処理時刻
}
```

**データフロー:**
1. **React SPA** → **AppSync GraphQL** (クエリ・ミューテーション)
2. **AppSync Direct Resolvers** ↔ **DynamoDB** (加工済みデータ操作)
3. **EventBridge** → **Lambda News Fetch** (定期実行: 15分毎)
4. **Lambda News Fetch** → **External APIs** (生データ取得)
5. **Lambda News Fetch** → **データ加工・分類処理**
6. **Lambda News Fetch** → **DynamoDB** (加工済み記事保存)
7. **Lambda News Fetch** → **Lambda Push Sender** (通知トリガー)
8. **Lambda Push Sender** → **Web Push API** (ブラウザ通知)
9. **AppSync Subscription** → **React SPA** (リアルタイム更新通知)

**Resolver 戦略:**
- **Direct Resolvers**: 単純なCRUD操作（記事取得、カテゴリ一覧）
- **Lambda Resolvers**: 複雑なロジック（検索、集計、外部API連携）

**環境変数管理:**
```
# 開発環境
DATABASE_URL="file:./dev.db"
NODE_ENV="development"

# 本番環境 (AWS Amplify)
AWS_REGION="ap-northeast-1"
APPSYNC_GRAPHQL_ENDPOINT="https://xxx.appsync-api.ap-northeast-1.amazonaws.com/graphql"
APPSYNC_API_KEY="da2-xxx"
DYNAMODB_TABLE_NAME="FinTechNewsApp-Articles"
S3_BUCKET_NAME="fintech-news-images"
NEWSAPI_KEY="..."
NODE_ENV="production"
```

### セキュリティ考慮事項

**1. データ保護**
- XSS対策（Content Security Policy）
- CSRF対策
- 入力値検証・サニタイゼーション

**2. API セキュリティ**
- レート制限
- API キーの環境変数管理（AWS Systems Manager Parameter Store）
- HTTPS強制
- RDS暗号化（保存時・転送時）
- VPC内でのセキュアな通信

**3. プライバシー**
- ローカルストレージの暗号化
- 個人情報の最小化
- GDPR準拠（必要に応じて）