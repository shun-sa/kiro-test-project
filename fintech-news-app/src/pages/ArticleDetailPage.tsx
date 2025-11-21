import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { ReadCompleteCelebration } from '../components/features/ReadCompleteCelebration';
import { BookmarkButton } from '../components/features/BookmarkButton';
import { useArticleStore } from '../store/useArticleStore';
import { useState } from 'react';

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentArticle: article, loading, error, fetchArticle } = useArticleStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const articleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 記事の最後まで読んだかを検知
  useEffect(() => {
    if (!article || !articleEndRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !showCelebration) {
          setShowCelebration(true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(articleEndRef.current);

    return () => {
      if (articleEndRef.current) {
        observer.unobserve(articleEndRef.current);
      }
    };
  }, [article, showCelebration]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">⚠️ {error}</h2>
        <div className="space-x-4">
          <button
            onClick={() => id && fetchArticle(id)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            再試行
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          記事が見つかりません
        </h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const getTechLevelBadge = (level?: string) => {
    const badges = {
      beginner: { text: '初級', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      intermediate: { text: '中級', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      advanced: { text: '上級', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    return level ? badges[level as keyof typeof badges] : null;
  };

  const badge = getTechLevelBadge(article.techLevel);

  return (
    <PageTransition>
      <article className="max-w-4xl mx-auto pb-20 md:pb-0">
      {/* 戻るボタン */}
      <motion.button
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span className="mr-2">←</span>
        戻る
      </motion.button>

      {/* 記事ヘッダー */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        )}

        <div className="p-6 md:p-8">
          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{article.source}</span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {new Date(article.publishedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              読了時間: {article.readingTime}分
            </span>
            {badge && (
              <>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                  {badge.text}
                </span>
              </>
            )}
          </div>

          {/* タイトルとブックマークボタン */}
          <div className="flex items-start gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex-1">
              {article.title}
            </h1>
            <BookmarkButton articleId={article.id} size="lg" />
          </div>

          {/* 要約 */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            {article.summary}
          </p>

          {/* 本文 */}
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
              {article.content}
            </div>
          </div>

          {/* 元記事へのリンク */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              元記事を読む
              <motion.span
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </motion.a>
          </div>

          {/* 記事終了マーカー（読了検知用） */}
          <div ref={articleEndRef} className="h-1" />
        </div>
      </div>

      {/* 読了お祝いアニメーション */}
      <ReadCompleteCelebration
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
      />
      </article>
    </PageTransition>
  );
}
