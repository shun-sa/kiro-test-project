import { motion } from 'framer-motion';
import { BookmarkButton } from '../features/BookmarkButton';
import type { Article } from '../../mocks/articles';

interface SearchResultCardProps {
  article: Article;
  onClick: () => void;
  searchQuery: string;
  index?: number;
}

export function SearchResultCard({
  article,
  onClick,
  searchQuery,
  index = 0,
}: SearchResultCardProps) {
  const getTechLevelBadge = (level?: string) => {
    const badges = {
      beginner: {
        text: '初級',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      intermediate: {
        text: '中級',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      },
      advanced: {
        text: '上級',
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
    };
    return level ? badges[level as keyof typeof badges] : null;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-white">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const badge = getTechLevelBadge(article.techLevel);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      {article.imageUrl && (
        <div className="relative">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2">
            <BookmarkButton articleId={article.id} size="sm" />
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{article.source}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{article.readingTime}分</span>
          {badge && (
            <>
              <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
              <span className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>{badge.text}</span>
            </>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {highlightText(article.title, searchQuery)}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {highlightText(article.summary, searchQuery)}
        </p>
        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          {new Date(article.publishedAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>
    </motion.article>
  );
}
