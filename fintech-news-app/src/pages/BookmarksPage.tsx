import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { NewsCard } from '../components/news/NewsCard';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { mockCategories } from '../mocks/categories';
import type { Article } from '../mocks/articles';

export function BookmarksPage() {
  const navigate = useNavigate();
  const { bookmarks } = useBookmarkStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadBookmarkedArticles();
  }, [bookmarks]);

  const loadBookmarkedArticles = async () => {
    setLoading(true);
    try {
      // ブックマークされた記事を取得
      const promises = bookmarks.map((id) => fetch(`/api/articles/${id}`).then((r) => r.json()));
      const results = await Promise.all(promises);
      setArticles(results.filter((article) => article !== null));
    } catch (error) {
      console.error('Failed to load bookmarked articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article: Article) => {
    navigate(`/article/${article.id}`);
  };

  // カテゴリでフィルタリング
  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.category === selectedCategory)
    : articles;

  // 保存日時順（新しい順）にソート
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const aIndex = bookmarks.indexOf(a.id);
    const bIndex = bookmarks.indexOf(b.id);
    return bIndex - aIndex; // 新しくブックマークしたものが上
  });

  if (loading) {
    return (
      <PageTransition>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pb-20 md:pb-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🔖 ブックマーク
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            保存した記事: {articles.length}件
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📑</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ブックマークがありません
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              気になる記事をブックマークして、後で読み返しましょう
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              記事を探す
            </button>
          </div>
        ) : (
          <>
            {/* カテゴリフィルター */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                すべて ({articles.length})
              </button>
              {mockCategories.map((category) => {
                const count = articles.filter((a) => a.category === category.slug).length;
                if (count === 0) return null;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug
                        ? 'text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category.slug ? category.color : undefined,
                    }}
                  >
                    {category.icon} {category.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* 記事一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedArticles.map((article, index) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  index={index}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
