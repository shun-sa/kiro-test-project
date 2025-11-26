import useSWR from 'swr';
import { apiClient } from '../lib/api/client';
import type { Article } from '../types';

interface UseArticlesOptions {
  category?: string;
  page?: number;
  limit?: number;
}

interface UseArticlesReturn {
  articles: Article[];
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * 記事一覧を取得するカスタムフック（SWRでキャッシュ）
 */
export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const { category, page = 1, limit = 20 } = options;

  const key = ['articles', category, page, limit];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const result = await apiClient.getArticles({ category, page, limit });
      return result.articles;
    },
    {
      revalidateOnFocus: false, // フォーカス時の再検証を無効化
      revalidateOnReconnect: true, // 再接続時は再検証
      dedupingInterval: 60000, // 60秒間は重複リクエストを防ぐ
      refreshInterval: 300000, // 5分毎に自動更新
    }
  );

  return {
    articles: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
