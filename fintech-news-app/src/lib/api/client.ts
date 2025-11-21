import type { Article, Category } from '../../types';

/**
 * APIクライアント
 * モックAPIと本番APIを切り替え可能な抽象化レイヤー
 */

// API_BASE_URLが設定されていない場合は相対パス（MSWがインターセプト）
// 設定されている場合は絶対パス（AppSync GraphQL Endpoint）
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

/**
 * APIリクエストを実行
 * MSWが有効な場合は相対パスでインターセプトされる
 * MSWが無効な場合はAPI_BASE_URLを使用
 */
function buildUrl(path: string): string {
  // API_BASE_URLが設定されている場合は使用
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  // 設定されていない場合は相対パス（MSWがインターセプト）
  return path;
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

    const url = buildUrl(`/api/articles${searchParams.toString() ? `?${searchParams}` : ''}`);
    const response = await fetch(url);
    return handleResponse(response);
  },

  /**
   * 個別記事を取得
   */
  async getArticle(id: string): Promise<Article> {
    const url = buildUrl(`/api/articles/${id}`);
    const response = await fetch(url);
    return handleResponse(response);
  },

  /**
   * カテゴリ一覧を取得
   */
  async getCategories(): Promise<Category[]> {
    const url = buildUrl('/api/categories');
    const response = await fetch(url);
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
    const url = buildUrl(`/api/articles/search?${searchParams}`);
    const response = await fetch(url);
    return handleResponse(response);
  },
};
