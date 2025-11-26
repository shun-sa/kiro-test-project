/**
 * Lambda関数のローカルテスト用スクリプト
 * 
 * 使用方法:
 * cd amplify/functions/news-fetcher
 * npm install
 * tsx test-handler.ts
 */

import { handler } from './handler';

async function testHandler() {
  console.log('Testing news fetcher handler...\n');

  // テスト用の環境変数を設定
  process.env.NEWS_API_KEY = 'test-api-key'; // 実際のAPIキーに置き換えてください
  process.env.ARTICLE_TABLE_NAME = 'test-articles-table';

  try {
    const result = await handler({}, {} as any, () => {});
    console.log('\nHandler result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\nHandler error:', error);
  }
}

testHandler();
