import type { Article, Category, TechLevel } from '../../types';
import { generateClient } from 'aws-amplify/api';
// @ts-expect-error - GraphQL auto-generated queries
import { listArticles, getArticle as getArticleQuery, listCategories } from '../../graphql/queries';
// @ts-expect-error - AWS Amplify auto-generated file
import awsconfig from '../../aws-exports.js';

/**
 * APIクライアント
 * モックAPIと本番APIを切り替え可能な抽象化レイヤー
 */

// モックAPIを使用するかどうかを判定
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// GraphQL クライアントの初期化（本番環境用）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let graphqlClient: any = null;
if (!USE_MOCK_API && awsconfig?.aws_appsync_graphqlEndpoint) {
  graphqlClient = generateClient();
}

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
 * GraphQL型からアプリケーション型に変換
 */
function transformArticle(item: Record<string, unknown>): Article {
  return {
    id: item.id as string,
    title: item.title as string,
    summary: item.summary as string,
    content: item.content as string,
    url: item.url as string,
    imageUrl: item.imageUrl as string | undefined,
    publishedAt: item.publishedAt as string,
    source: item.source as string,
    category: item.category as string,
    techLevel: item.techLevel as TechLevel | undefined,
    readingTime: item.readingTime as number,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string,
  };
}

function transformCategory(item: Record<string, unknown>): Category {
  // GraphQLスキーマにはcolorフィールドがないため、デフォルト値を設定
  const colorMap: Record<string, string> = {
    'ai-ml': '#3B82F6',
    'blockchain': '#8B5CF6',
    'cloud': '#10B981',
    'fintech': '#F59E0B',
    'security': '#EF4444',
    'startup': '#EC4899',
  };

  const slug = item.slug as string;
  return {
    id: item.id as string,
    name: item.name as string,
    slug,
    color: colorMap[slug] || '#6B7280',
    icon: item.icon as string,
    description: (item.description as string) || '',
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
    if (USE_MOCK_API || !graphqlClient) {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const url = `/api/articles${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);
      return handleResponse(response);
    }

    // GraphQL APIを使用する場合
    try {
      const filter: Record<string, unknown> = {};
      if (params?.category) {
        filter.category = { eq: params.category };
      }

      const result = await graphqlClient.graphql({
        query: listArticles,
        variables: {
          filter,
          limit: params?.limit || 20,
        },
      });

      const items = result.data?.listArticles?.items || [];
      const nextToken = result.data?.listArticles?.nextToken;

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
      console.error('GraphQL Error:', error);
      throw new ApiError('Failed to fetch articles', 500, error);
    }
  },

  /**
   * 個別記事を取得
   */
  async getArticle(id: string): Promise<Article> {
    // モックAPIを使用する場合
    if (USE_MOCK_API || !graphqlClient) {
      const url = `/api/articles/${id}`;
      const response = await fetch(url);
      return handleResponse(response);
    }

    // GraphQL APIを使用する場合
    try {
      const result = await graphqlClient.graphql({
        query: getArticleQuery,
        variables: { id },
      });

      if (!result.data?.getArticle) {
        throw new ApiError('Article not found', 404);
      }

      return transformArticle(result.data.getArticle);
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw new ApiError('Failed to fetch article', 500, error);
    }
  },

  /**
   * カテゴリ一覧を取得
   */
  async getCategories(): Promise<Category[]> {
    // モックAPIを使用する場合
    if (USE_MOCK_API || !graphqlClient) {
      const url = '/api/categories';
      const response = await fetch(url);
      return handleResponse(response);
    }

    // GraphQL APIを使用する場合
    try {
      const result = await graphqlClient.graphql({
        query: listCategories,
      });

      const items = result.data?.listCategories?.items || [];
      return items.map(transformCategory);
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw new ApiError('Failed to fetch categories', 500, error);
    }
  },

  /**
   * 記事を検索
   */
  async searchArticles(query: string, limit = 20): Promise<Article[]> {
    // モックAPIを使用する場合
    if (USE_MOCK_API || !graphqlClient) {
      const searchParams = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });
      const url = `/api/articles/search?${searchParams}`;
      const response = await fetch(url);
      return handleResponse(response);
    }

    // GraphQL APIを使用する場合（タイトルまたはサマリーで検索）
    try {
      const result = await graphqlClient.graphql({
        query: listArticles,
        variables: {
          filter: {
            or: [
              { title: { contains: query } },
              { summary: { contains: query } },
            ],
          },
          limit,
        },
      });

      const items = result.data?.listArticles?.items || [];
      return items.map(transformArticle);
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw new ApiError('Failed to search articles', 500, error);
    }
  },
};
