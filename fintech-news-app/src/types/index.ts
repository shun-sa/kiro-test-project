// 型定義の再エクスポート
export type { Article, TechLevel } from '../mocks/articles';
export type { Category } from '../mocks/categories';

// ユーザー設定の型定義
export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
    categories: string[];
    quietHours: {
      start: string;
      end: string;
    };
  };
  layout: {
    cardSize: 'compact' | 'comfortable';
    showImages: boolean;
    showSummary: boolean;
  };
  bookmarks: string[];
  readArticles: string[];
  createdAt: string;
  updatedAt: string;
}
