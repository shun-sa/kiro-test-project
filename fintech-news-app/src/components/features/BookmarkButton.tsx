import { motion } from 'framer-motion';
import { useBookmarkStore } from '../../store/useBookmarkStore';

interface BookmarkButtonProps {
  articleId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookmarkButton({ articleId, size = 'md' }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const bookmarked = isBookmarked(articleId);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        toggleBookmark(articleId);
      }}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-colors ${
        bookmarked
          ? 'bg-primary text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      title={bookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
    >
      <motion.span
        animate={bookmarked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {bookmarked ? '🔖' : '📑'}
      </motion.span>
    </motion.button>
  );
}
