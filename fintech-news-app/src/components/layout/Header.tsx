import { ThemeToggle } from '../features/ThemeToggle';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              FinTech News
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                ホーム
              </a>
              <a href="/bookmarks" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                ブックマーク
              </a>
              <a href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                設定
              </a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
