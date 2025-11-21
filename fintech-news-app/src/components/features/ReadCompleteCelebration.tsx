import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ReadCompleteCelebrationProps {
  show: boolean;
  onClose: () => void;
}

export function ReadCompleteCelebration({ show, onClose }: ReadCompleteCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (show) {
      // パーティクルを生成
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }));
      setParticles(newParticles);

      // 3秒後に自動的に閉じる
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* 背景オーバーレイ */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 bg-black bg-opacity-20"
          />

          {/* メインメッセージ */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              読了完了！
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              お疲れ様でした
            </p>

            {/* パーティクル */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: particle.x * 3,
                  y: particle.y * 3,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
