import { motion } from 'framer-motion';
import { useThemeStore, themeColors } from '../../store/useThemeStore';

type ThemeColorKey = keyof typeof themeColors;

export function ThemeColorPicker() {
  const { themeColor, setThemeColor } = useThemeStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        テーマカラー
      </h3>
      <div className="flex flex-wrap gap-3">
        {Object.entries(themeColors).map(([key, value]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setThemeColor(key as ThemeColorKey)}
            className={`relative w-10 h-10 rounded-full transition-all ${
              themeColor === key ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : ''
            }`}
            style={{ backgroundColor: value.primary }}
            title={value.name}
          >
            {themeColor === key && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center text-white text-lg"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
