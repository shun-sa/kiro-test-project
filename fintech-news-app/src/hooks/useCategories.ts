import useSWR from 'swr';
import { apiClient } from '../lib/api/client';
import type { Category } from '../types';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * カテゴリ一覧を取得するカスタムフック（SWRでキャッシュ）
 */
export function useCategories(): UseCategoriesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    'categories',
    async () => {
      return await apiClient.getCategories();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000, // 1時間キャッシュ（カテゴリは頻繁に変わらない）
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
