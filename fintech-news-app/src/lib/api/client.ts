import type { Article, Category } from '../../types';

/**
 * APIクライアント
 * モックAPIと本番APIを切り替え可能な抽象化レイヤー
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP Error: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export const apiClient = {
  /**
   * 記事一覧を取得
   */
  async getArticles(params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    articles: Article[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const url = `${API_BASE_URL}/api/articles${searchParams.toString() ? `?${searchParams}` : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  /**
   * 個別記事を取得
   */
  async getArticle(id: string): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
    return handleResponse(response);
  },

  /**
   * カテゴリ一覧を取得
   */
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    return handleResponse(response);
  },

  /**
   * 記事を検索
   */
  async searchArticles(query: string, limit = 20): Promise<Article[]> {
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/api/articles/search?${searchParams}`);
    return handleResponse(response);
  },
};
