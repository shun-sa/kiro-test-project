import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface NotificationPreviewProps {
  title: string;
  body: string;
  show: boolean;
}

export function NotificationPreview({ title, body, show }: NotificationPreviewProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-0 left-1/2 z-50 w-full max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border-l-4 border-primary">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💰</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{body}</p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
