import { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content?: string;
}

interface ProcessedArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: string;
  techLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * カテゴリを自動分類
 */
function categorizeArticle(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes('ai') ||
    text.includes('machine learning') ||
    text.includes('artificial intelligence') ||
    text.includes('機械学習') ||
    text.includes('人工知能')
  ) {
    return 'ai-ml';
  }

  if (
    text.includes('blockchain') ||
    text.includes('crypto') ||
    text.includes('bitcoin') ||
    text.includes('ethereum') ||
    text.includes('ブロックチェーン') ||
    text.includes('暗号資産')
  ) {
    return 'blockchain';
  }

  if (
    text.includes('cloud') ||
    text.includes('aws') ||
    text.includes('azure') ||
    text.includes('gcp') ||
    text.includes('クラウド')
  ) {
    return 'cloud';
  }

  if (
    text.includes('security') ||
    text.includes('cyber') ||
    text.includes('hack') ||
    text.includes('セキュリティ') ||
    text.includes('サイバー')
  ) {
    return 'security';
  }

  if (
    text.includes('startup') ||
    text.includes('funding') ||
    text.includes('venture') ||
    text.includes('スタートアップ') ||
    text.includes('資金調達')
  ) {
    return 'startup';
  }

  return 'fintech';
}

/**
 * 技術レベルを判定
 */
function determineTechLevel(
  title: string,
  description: string
): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | undefined {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes('beginner') ||
    text.includes('introduction') ||
    text.includes('getting started') ||
    text.includes('初心者') ||
    text.includes('入門')
  ) {
    return 'BEGINNER';
  }

  if (
    text.includes('advanced') ||
    text.includes('expert') ||
    text.includes('deep dive') ||
    text.includes('上級') ||
    text.includes('エキスパート')
  ) {
    return 'ADVANCED';
  }

  if (
    text.includes('intermediate') ||
    text.includes('practical') ||
    text.includes('中級') ||
    text.includes('実践')
  ) {
    return 'INTERMEDIATE';
  }

  return undefined;
}

/**
 * 読了時間を計算（分）
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * NewsAPIから記事を取得
 */
async function fetchFromNewsAPI(): Promise<NewsAPIArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('NEWS_API_KEY not configured, skipping NewsAPI fetch');
    return [];
  }

  const queries = [
    'fintech',
    'financial technology',
    'blockchain',
    'cryptocurrency',
    'artificial intelligence finance',
  ];

  const allArticles: NewsAPIArticle[] = [];

  for (const query of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`NewsAPI error for query "${query}":`, response.statusText);
        continue;
      }

      const data = (await response.json()) as { articles?: NewsAPIArticle[] };
      if (data.articles) {
        allArticles.push(...data.articles);
      }
    } catch (error) {
      console.error(`Error fetching from NewsAPI for query "${query}":`, error);
    }
  }

  return allArticles;
}

/**
 * RSS Feedから記事を取得（簡易実装）
 */
async function fetchFromRSSFeeds(): Promise<NewsAPIArticle[]> {
  // 実際のRSSパーサーを使用する場合は、rss-parserなどのライブラリを使用
  // ここでは簡易的な実装
  console.log('RSS feed fetching not implemented yet');
  return [];
}

/**
 * 記事を処理してDynamoDBに保存
 */
async function processAndSaveArticles(
  articles: NewsAPIArticle[]
): Promise<number> {
  const tableName = process.env.ARTICLE_TABLE_NAME;
  if (!tableName) {
    throw new Error('ARTICLE_TABLE_NAME environment variable not set');
  }

  let savedCount = 0;

  for (const article of articles) {
    try {
      const now = new Date().toISOString();
      const category = categorizeArticle(article.title, article.description || '');
      const techLevel = determineTechLevel(article.title, article.description || '');
      const content = article.content || article.description || '';

      const processedArticle: ProcessedArticle = {
        id: uuidv4(),
        title: article.title,
        summary: article.description || article.title,
        content,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        category,
        techLevel,
        readingTime: calculateReadingTime(content),
        createdAt: now,
        updatedAt: now,
      };

      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: processedArticle,
        })
      );

      savedCount++;
    } catch (error) {
      console.error('Error saving article:', error);
    }
  }

  return savedCount;
}

/**
 * Lambda handler
 */
export const handler: Handler = async (event) => {
  console.log('News fetcher started', { event });

  try {
    // NewsAPIから記事を取得
    const newsAPIArticles = await fetchFromNewsAPI();
    console.log(`Fetched ${newsAPIArticles.length} articles from NewsAPI`);

    // RSS Feedから記事を取得
    const rssArticles = await fetchFromRSSFeeds();
    console.log(`Fetched ${rssArticles.length} articles from RSS feeds`);

    // 全記事を結合
    const allArticles = [...newsAPIArticles, ...rssArticles];

    // 重複を除去（URLベース）
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.url, article])).values()
    );

    console.log(`Processing ${uniqueArticles.length} unique articles`);

    // 記事を処理して保存
    const savedCount = await processAndSaveArticles(uniqueArticles);

    console.log(`Successfully saved ${savedCount} articles`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'News fetcher completed successfully',
        articlesProcessed: uniqueArticles.length,
        articlesSaved: savedCount,
      }),
    };
  } catch (error) {
    console.error('Error in news fetcher:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error fetching news',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
