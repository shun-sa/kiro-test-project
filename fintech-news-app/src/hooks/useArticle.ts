import useSWR from 'swr';
import { apiClient } from '../lib/api/client';
import type { Article } from '../types';

interface UseArticleReturn {
  article: Article | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * 個別記事を取得するカスタムフック（SWRでキャッシュ）
 */
export function useArticle(id: string | undefined): UseArticleReturn {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['article', id] : null,
    async () => {
      if (!id) return null;
      return await apiClient.getArticle(id);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5分間キャッシュ
    }
  );

  return {
    article: data || null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
