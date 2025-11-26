import { defineFunction } from '@aws-amplify/backend';

export const newsFetcher = defineFunction({
  name: 'news-fetcher',
  entry: './handler.ts',
  timeoutSeconds: 300, // 5分
  memoryMB: 512,
  environment: {
    NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  },
});
