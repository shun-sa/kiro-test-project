import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { NewsFeed } from '../components/news/NewsFeed';
import { SearchBar } from '../components/features/SearchBar';
import { PageTransition } from '../components/layout/PageTransition';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSelectedCategory(null); // 検索時はカテゴリフィルターをクリア
    }
  };

  return (
    <PageTransition>
      <div className="flex gap-6">
        {/* サイドバー（PC版） */}
        <Sidebar
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setSearchQuery(''); // カテゴリ選択時は検索をクリア
          }}
        />

        {/* メインコンテンツ */}
        <div className="flex-1 pb-20 md:pb-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {searchQuery
                ? `🔍 検索結果: "${searchQuery}"`
                : selectedCategory
                ? '📂 カテゴリ別ニュース'
                : '📰 最新ニュース'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              金融・IT業界の最新情報をお届けします
            </p>
          </div>

          {/* 検索バー */}
          <div className="mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="キーワードで記事を検索（例: AI、ブロックチェーン、クラウド）"
            />
          </div>

          <NewsFeed selectedCategory={selectedCategory} searchQuery={searchQuery} />
      </div>

      {/* ボトムナビゲーション（モバイル版） */}
      <BottomNavigation
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      </div>
    </PageTransition>
  );
}
