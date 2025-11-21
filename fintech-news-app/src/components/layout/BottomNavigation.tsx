import { useState } from 'react';
import { mockCategories } from '../../mocks/categories';

interface BottomNavigationProps {
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
}

export function BottomNavigation({ selectedCategory, onCategoryChange }: BottomNavigationProps) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <>
      {/* カテゴリモーダル（モバイル） */}
      {showCategories && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowCategories(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              カテゴリを選択
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onCategoryChange(null);
                  setShowCategories(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">📰</span>
                すべて
              </button>
              {mockCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.slug);
                    setShowCategories(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === category.slug
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.slug ? category.color : undefined,
                  }}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-30">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setShowCategories(true)}
            className="flex flex-col items-center justify-center flex-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <span className="text-xl mb-1">📂</span>
            <span className="text-xs">カテゴリ</span>
          </button>
          <a
            href="/"
            className="flex flex-col items-center justify-center flex-1 text-blue-500 dark:text-blue-400"
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs">ホーム</span>
          </a>
          <a
            href="/bookmarks"
            className="flex flex-col items-center justify-center flex-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <span className="text-xl mb-1">🔖</span>
            <span className="text-xs">保存</span>
          </a>
          <a
            href="/settings"
            className="flex flex-col items-center justify-center flex-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <span className="text-xl mb-1">⚙️</span>
            <span className="text-xs">設定</span>
          </a>
        </div>
      </nav>
    </>
  );
}
