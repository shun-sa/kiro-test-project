import { create } from 'zustand';
import { apiClient, ApiError } from '../lib/api/client';
import type { Article } from '../types';

interface ArticleState {
  // 記事データ
  articles: Article[];
  currentArticle: Article | null;
  searchResults: Article[];

  // ページネーション
  currentPage: number;
  hasMore: boolean;
  totalArticles: number;

  // フィルター
  selectedCategory: string | null;
  searchQuery: string;

  // ローディング・エラー状態
  loading: boolean;
  error: string | null;
  searchLoading: boolean;
  searchError: string | null;

  // アクション
  fetchArticles: (params?: { category?: string; page?: number; reset?: boolean }) => Promise<void>;
  fetchArticle: (id: string) => Promise<void>;
  searchArticles: (query: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  reset: () => void;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  // 初期状態
  articles: [],
  currentArticle: null,
  searchResults: [],
  currentPage: 1,
  hasMore: true,
  totalArticles: 0,
  selectedCategory: null,
  searchQuery: '',
  loading: false,
  error: null,
  searchLoading: false,
  searchError: null,

  // 記事一覧を取得
  fetchArticles: async (params = {}) => {
    const { category, page = 1, reset = false } = params;
    const state = get();

    // リセットの場合は既存データをクリア
    if (reset) {
      set({ articles: [], currentPage: 1, hasMore: true });
    }

    set({ loading: true, error: null });

    try {
      const categoryParam = category || state.selectedCategory;
      const data = await apiClient.getArticles({
        category: categoryParam || undefined,
        page,
        limit: 20,
      });

      set((state) => ({
        articles: reset ? data.articles : [...state.articles, ...data.articles],
        currentPage: data.pagination.page,
        hasMore: data.pagination.hasMore,
        totalArticles: data.pagination.total,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : '記事の取得に失敗しました';
      set({ error: errorMessage, loading: false });
      console.error('Failed to fetch articles:', error);
    }
  },

  // 個別記事を取得
  fetchArticle: async (id: string) => {
    set({ loading: true, error: null, currentArticle: null });

    try {
      const article = await apiClient.getArticle(id);
      set({ currentArticle: article, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : '記事の取得に失敗しました';
      set({ error: errorMessage, loading: false });
      console.error('Failed to fetch article:', error);
    }
  },

  // 記事を検索
  searchArticles: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], searchQuery: '' });
      return;
    }

    set({ searchLoading: true, searchError: null, searchQuery: query });

    try {
      const results = await apiClient.searchArticles(query, 20);
      set({ searchResults: results, searchLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : '検索に失敗しました';
      set({ searchError: errorMessage, searchLoading: false });
      console.error('Failed to search articles:', error);
    }
  },

  // カテゴリを設定
  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
    // カテゴリ変更時は記事をリセットして再取得
    get().fetchArticles({ category: category || undefined, page: 1, reset: true });
  },

  // 検索クエリを設定
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // 検索をクリア
  clearSearch: () => {
    set({ searchResults: [], searchQuery: '', searchError: null });
  },

  // 状態をリセット
  reset: () => {
    set({
      articles: [],
      currentArticle: null,
      searchResults: [],
      currentPage: 1,
      hasMore: true,
      totalArticles: 0,
      selectedCategory: null,
      searchQuery: '',
      loading: false,
      error: null,
      searchLoading: false,
      searchError: null,
    });
  },
}));
