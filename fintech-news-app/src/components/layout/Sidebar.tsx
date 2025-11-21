import { mockCategories } from '../../mocks/categories';

interface SidebarProps {
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
}

export function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  return (
    <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        カテゴリ
      </h2>
      <nav className="space-y-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className="mr-2">📰</span>
          すべて
        </button>
        {mockCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
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
      </nav>
    </aside>
  );
}
