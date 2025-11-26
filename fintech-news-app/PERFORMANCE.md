# パフォーマンス最適化ガイド

このドキュメントでは、FinTech News Appのパフォーマンス最適化について説明します。

## 実装済みの最適化

### 1. コード分割（Code Splitting）

#### React.lazy による動的インポート

全てのページコンポーネントを動的にインポートし、初期バンドルサイズを削減：

```typescript
const HomePage = lazy(() => import('./pages/HomePage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
```

**効果:**
- 初期ロード時間の短縮
- 必要なコードのみをダウンロード
- ユーザーが訪問しないページのコードは読み込まれない

### 2. 画像の遅延読み込み

#### LazyImage コンポーネント

Intersection Observer APIを使用して、画像がビューポートに入ったときに読み込む：

```typescript
<LazyImage
  src={article.imageUrl}
  alt={article.title}
  className="w-full h-48 object-cover"
  placeholder="data:image/svg+xml,..."
/>
```

**効果:**
- 初期ページロードの高速化
- 帯域幅の節約
- スムーズなスクロール体験

**設定:**
- `rootMargin: '50px'` - 50px手前から読み込み開始
- プレースホルダー画像でレイアウトシフトを防止
- フェードインアニメーション

### 3. SWRによるキャッシュ戦略

#### データフェッチングの最適化

SWR（stale-while-revalidate）を使用したキャッシュ戦略：

```typescript
// 記事一覧
const { articles, isLoading } = useArticles({ category, page, limit });

// 個別記事
const { article, isLoading } = useArticle(id);

// カテゴリ
const { categories, isLoading } = useCategories();
```

**キャッシュ設定:**

| データ | キャッシュ時間 | 再検証 |
|--------|--------------|--------|
| 記事一覧 | 60秒 | 5分毎に自動更新 |
| 個別記事 | 5分 | 再接続時のみ |
| カテゴリ | 1時間 | なし |

**効果:**
- APIリクエストの削減
- 高速なページ遷移
- オフライン対応の基盤

### 4. バンドル最適化

#### Vite設定

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion'],
          'aws-vendor': ['aws-amplify'],
        },
      },
    },
  },
});
```

**効果:**
- ベンダーコードの分離
- 効率的なキャッシング
- 並列ダウンロード

## パフォーマンス指標

### Core Web Vitals 目標値

| 指標 | 目標 | 現在 |
|------|------|------|
| LCP (Largest Contentful Paint) | < 2.5s | - |
| FID (First Input Delay) | < 100ms | - |
| CLS (Cumulative Layout Shift) | < 0.1 | - |

### バンドルサイズ目標

| バンドル | 目標 | 現在 |
|---------|------|------|
| 初期バンドル | < 200KB | - |
| 総バンドル | < 500KB | - |

## 測定方法

### Lighthouse

```bash
# Chrome DevToolsでLighthouseを実行
# または
npm install -g lighthouse
lighthouse https://your-app-url --view
```

### Bundle Analyzer

```bash
npm install -D rollup-plugin-visualizer
npm run build
# dist/stats.htmlを開く
```

### Performance API

```typescript
// パフォーマンス測定
const navigationTiming = performance.getEntriesByType('navigation')[0];
console.log('Page Load Time:', navigationTiming.loadEventEnd - navigationTiming.fetchStart);
```

## 追加の最適化案

### 1. Service Worker（PWA）

```typescript
// sw.js
const CACHE_NAME = 'fintech-news-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});
```

**効果:**
- オフライン対応
- 高速なリピート訪問
- プッシュ通知

### 2. 仮想スクロール

大量の記事を表示する場合：

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={articles.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <NewsCard article={articles[index]} />
    </div>
  )}
</FixedSizeList>
```

### 3. 画像最適化

#### WebP形式の使用

```typescript
<picture>
  <source srcSet={`${imageUrl}.webp`} type="image/webp" />
  <source srcSet={`${imageUrl}.jpg`} type="image/jpeg" />
  <img src={`${imageUrl}.jpg`} alt={alt} />
</picture>
```

#### レスポンシブ画像

```typescript
<img
  srcSet={`
    ${imageUrl}-320w.jpg 320w,
    ${imageUrl}-640w.jpg 640w,
    ${imageUrl}-1280w.jpg 1280w
  `}
  sizes="(max-width: 640px) 100vw, 640px"
  src={`${imageUrl}-640w.jpg`}
  alt={alt}
/>
```

### 4. プリフェッチ

```typescript
// 次のページをプリフェッチ
const prefetchNextPage = () => {
  const nextPage = page + 1;
  apiClient.getArticles({ category, page: nextPage, limit });
};

// ホバー時にプリフェッチ
<Link
  to={`/article/${article.id}`}
  onMouseEnter={() => apiClient.getArticle(article.id)}
>
```

### 5. メモ化

```typescript
import { memo, useMemo, useCallback } from 'react';

// コンポーネントのメモ化
export const NewsCard = memo(({ article, onClick }) => {
  // ...
});

// 計算のメモ化
const sortedArticles = useMemo(
  () => articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
  [articles]
);

// コールバックのメモ化
const handleClick = useCallback(() => {
  navigate(`/article/${article.id}`);
}, [article.id, navigate]);
```

## ベストプラクティス

### 1. 画像

- WebP形式を使用
- 適切なサイズにリサイズ
- 遅延読み込みを実装
- プレースホルダーを使用

### 2. JavaScript

- コード分割を活用
- Tree Shakingを有効化
- 不要な依存関係を削除
- 動的インポートを使用

### 3. CSS

- 未使用のCSSを削除
- Critical CSSをインライン化
- CSS-in-JSの最適化
- Tailwind CSSのPurge設定

### 4. ネットワーク

- HTTP/2を使用
- CDNを活用
- Gzip/Brotli圧縮
- キャッシュヘッダーの設定

### 5. レンダリング

- 仮想スクロールを使用
- デバウンス/スロットルを実装
- レイアウトシフトを防止
- アニメーションの最適化

## モニタリング

### Real User Monitoring (RUM)

```typescript
// Web Vitals測定
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### エラー追跡

```typescript
// エラーバウンダリ
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // エラーをログに記録
    console.error('Error:', error, errorInfo);
  }
}
```

## トラブルシューティング

### バンドルサイズが大きい

1. Bundle Analyzerで分析
2. 大きな依存関係を特定
3. 動的インポートに変更
4. 代替ライブラリを検討

### ページロードが遅い

1. Lighthouseで分析
2. ネットワークタブで確認
3. 画像を最適化
4. キャッシュ戦略を見直し

### メモリリーク

1. Chrome DevToolsのMemoryプロファイラー
2. イベントリスナーのクリーンアップ
3. useEffectのクリーンアップ関数
4. 大きなオブジェクトの参照を解放

## 参考リンク

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [SWR Documentation](https://swr.vercel.app/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
