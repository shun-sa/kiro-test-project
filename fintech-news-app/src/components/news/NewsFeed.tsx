import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from './NewsCard';
import { SearchResultCard } from './SearchResultCard';
import { useArticleStore } from '../../store/useArticleStore';
import type { Article } from '../../types';

interface NewsFeedProps {
  selectedCategory: string | null;
  searchQuery?: string;
}

export function NewsFeed({ selectedCategory, searchQuery = '' }: NewsFeedProps) {
  const navigate = useNavigate();
  const {
    articles,
    searchResults,
    loading,
    error,
    searchLoading,
    searchError,
    currentPage,
    hasMore,
    fetchArticles,
    searchArticles,
  } = useArticleStore();

  // カテゴリまたは検索クエリが変更されたときに記事を取得
  useEffect(() => {
    if (searchQuery) {
      searchArticles(searchQuery);
    } else {
      fetchArticles({ category: selectedCategory || undefined, page: 1, reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  const loadMore = () => {
    if (!loading && hasMore && !searchQuery) {
      fetchArticles({ category: selectedCategory || undefined, page: currentPage + 1 });
    }
  };

  const handleArticleClick = (article: Article) => {
    // 記事詳細ページへ遷移
    navigate(`/article/${article.id}`);
  };

  // 無限スクロール用のIntersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && !searchQuery) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, currentPage, searchQuery]);

  // 表示する記事リスト
  const displayArticles = searchQuery ? searchResults : articles;
  const isLoading = searchQuery ? searchLoading : loading;
  const displayError = searchQuery ? searchError : error;

  // 初回ローディング
  if (isLoading && displayArticles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // エラー表示
  if (displayError) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-4">⚠️ {displayError}</div>
        <button
          onClick={() =>
            searchQuery
              ? searchArticles(searchQuery)
              : fetchArticles({ category: selectedCategory || undefined, page: 1, reset: true })
          }
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  // 記事がない場合
  if (displayArticles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          {searchQuery ? '検索結果が見つかりませんでした' : '記事がありません'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayArticles.map((article, index) =>
          searchQuery ? (
            <SearchResultCard
              key={article.id}
              article={article}
              searchQuery={searchQuery}
              index={index}
              onClick={() => handleArticleClick(article)}
            />
          ) : (
            <NewsCard
              key={article.id}
              article={article}
              index={index}
              onClick={() => handleArticleClick(article)}
            />
          )
        )}
      </div>

      {/* 無限スクロール用のセンチネル要素 */}
      {!searchQuery && hasMore && (
        <div id="scroll-sentinel" className="mt-8 text-center py-4">
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      )}

      {!searchQuery && !hasMore && displayArticles.length > 0 && (
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          すべての記事を表示しました
        </div>
      )}
    </div>
  );
}
