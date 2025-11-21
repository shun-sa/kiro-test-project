import { useThemeStore } from '../../store/useThemeStore';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { value: 'light' as const, icon: '☀️', label: 'ライト' },
    { value: 'dark' as const, icon: '🌙', label: 'ダーク' },
    { value: 'system' as const, icon: '💻', label: 'システム' },
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${
            theme === t.value
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title={t.label}
        >
          <span className="text-sm">{t.icon}</span>
          <span className="text-xs hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
