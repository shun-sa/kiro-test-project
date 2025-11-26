import type { Article, Category, TechLevel } from '../../types';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

/**
 * APIクライアント
 * モックAPIと本番APIを切り替え可能な抽象化レイヤー
 */

// モックAPIを使用するかどうかを判定
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Amplify Data クライアントの初期化（本番環境用）
const client = generateClient<Schema>();

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

/**
 * REST APIリクエストを実行（モックAPI用）
 */
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
 * Amplify Data型からアプリケーション型に変換
 */
function transformArticle(item: Schema['Article']['type']): Article {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    content: item.content,
    url: item.url,
    imageUrl: item.imageUrl || undefined,
    publishedAt: item.publishedAt,
    source: item.source,
    category: item.category,
    techLevel: item.techLevel as TechLevel | undefined,
    readingTime: item.readingTime,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function transformCategory(item: Schema['Category']['type']): Category {
  // カテゴリのカラーマッピング
  const colorMap: Record<string, string> = {
    'ai-ml': '#3B82F6',
    'blockchain': '#8B5CF6',
    'cloud': '#10B981',
    'fintech': '#F59E0B',
    'security': '#EF4444',
    'startup': '#EC4899',
  };

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    color: item.color || colorMap[item.slug] || '#6B7280',
    icon: item.icon,
    description: item.description,
  };
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
    // モックAPIを使用する場合
    if (USE_MOCK_API) {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const url = `/api/articles${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);
      return handleResponse(response);
    }

    // Amplify Data APIを使用する場合
    try {
      const filter = params?.category
        ? { category: { eq: params.category } }
        : undefined;

      const { data: items, nextToken } = await client.models.Article.list({
        filter,
        limit: params?.limit || 20,
      });

      return {
        articles: items.map(transformArticle),
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: items.length,
          hasMore: !!nextToken,
        },
      };
    } catch (error) {
      console.error('Amplify Data Error:', error);
      throw new ApiError('Failed to fetch articles', 500, error);
    }
  },

  /**
   * 個別記事を取得
   */
  async getArticle(id: string): Promise<Article> {
    // モックAPIを使用する場合
    if (USE_MOCK_API) {
      const url = `/api/articles/${id}`;
      const response = await fetch(url);
      return handleResponse(response);
    }

    // Amplify Data APIを使用する場合
    try {
      const { data: item } = await client.models.Article.get({ id });

      if (!item) {
        throw new ApiError('Article not found', 404);
      }

      return transformArticle(item);
    } catch (error) {
      console.error('Amplify Data Error:', error);
      throw new ApiError('Failed to fetch article', 500, error);
    }
  },

  /**
   * カテゴリ一覧を取得
   */
  async getCategories(): Promise<Category[]> {
    // モックAPIを使用する場合
    if (USE_MOCK_API) {
      const url = '/api/categories';
      const response = await fetch(url);
      return handleResponse(response);
    }

    // Amplify Data APIを使用する場合
    try {
      const { data: items } = await client.models.Category.list();
      return items.map(transformCategory);
    } catch (error) {
      console.error('Amplify Data Error:', error);
      throw new ApiError('Failed to fetch categories', 500, error);
    }
  },

  /**
   * 記事を検索
   */
  async searchArticles(query: string, limit = 20): Promise<Article[]> {
    // モックAPIを使用する場合
    if (USE_MOCK_API) {
      const searchParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });
      const url = `/api/articles/search?${searchParams}`;
      const response = await fetch(url);
      return handleResponse(response);
    }

    // Amplify Data APIを使用する場合（タイトルまたはサマリーで検索）
    try {
      const { data: items } = await client.models.Article.list({
        filter: {
          or: [
            { title: { contains: query } },
            { summary: { contains: query } },
          ],
        },
        limit,
      });

      return items.map(transformArticle);
    } catch (error) {
      console.error('Amplify Data Error:', error);
      throw new ApiError('Failed to search articles', 500, error);
    }
  },
};
