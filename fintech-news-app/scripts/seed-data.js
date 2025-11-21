/**
 * DynamoDBにテストデータを投入するスクリプト
 * 
 * 使用方法:
 * node scripts/seed-data.js
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// AWS設定
const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

// テーブル名（Amplifyが自動生成）
// 実際のテーブル名は AWS Console > DynamoDB で確認してください
const ARTICLE_TABLE = 'Article-rpojqjgpi5dyfp6adgoni4rnxy-dev';
const CATEGORY_TABLE = 'Category-rpojqjgpi5dyfp6adgoni4rnxy-dev';

// カテゴリデータ
const categories = [
  {
    id: 'cat-1',
    name: 'FinTech',
    slug: 'fintech',
    icon: '💰',
    description: '金融テクノロジー関連のニュース',
  },
  {
    id: 'cat-2',
    name: 'AI・機械学習',
    slug: 'ai-ml',
    icon: '🤖',
    description: 'AI・機械学習関連のニュース',
  },
  {
    id: 'cat-3',
    name: 'ブロックチェーン',
    slug: 'blockchain',
    icon: '⛓️',
    description: 'ブロックチェーン・暗号資産関連のニュース',
  },
  {
    id: 'cat-4',
    name: 'クラウド',
    slug: 'cloud',
    icon: '☁️',
    description: 'クラウドコンピューティング関連のニュース',
  },
  {
    id: 'cat-5',
    name: 'セキュリティ',
    slug: 'security',
    icon: '🔒',
    description: 'サイバーセキュリティ関連のニュース',
  },
  {
    id: 'cat-6',
    name: 'スタートアップ',
    slug: 'startup',
    icon: '🚀',
    description: 'スタートアップ・資金調達関連のニュース',
  },
];

// 記事データ生成
function generateArticles() {
  const articles = [];
  const now = new Date();
  
  const titles = [
    'AIによる金融リスク分析の最新動向',
    'ブロックチェーン技術が変える決済システム',
    'クラウドネイティブアーキテクチャの実践',
    'デジタルバンキングの未来予測',
    'ゼロトラストセキュリティの導入事例',
    'フィンテックスタートアップの資金調達トレンド',
    '機械学習モデルの本番運用ベストプラクティス',
    'Web3時代の金融サービス',
    'マルチクラウド戦略の成功事例',
    'オープンバンキングAPIの活用方法',
  ];

  const sources = ['TechCrunch Japan', 'ITmedia', '日経xTECH', 'Fintech Journal', 'ZDNet Japan'];
  const techLevels = ['beginner', 'intermediate', 'advanced'];
  const categoryIds = ['fintech', 'ai-ml', 'blockchain', 'cloud', 'security', 'startup'];

  for (let i = 0; i < 30; i++) {
    const publishedAt = new Date(now.getTime() - i * 3600000); // 1時間ずつ過去
    const title = `${titles[i % titles.length]} - Part ${Math.floor(i / titles.length) + 1}`;
    
    articles.push({
      id: `article-${i + 1}`,
      title,
      summary: `${titles[i % titles.length]}に関する最新情報をお届けします。業界の専門家による分析と実践的なアドバイスを含む詳細なレポートです。`,
      content: `# ${titles[i % titles.length]}\n\nこの記事では、${titles[i % titles.length]}について詳しく解説します。\n\n## 概要\n\n最新の技術動向と実践的な活用方法について、具体的な事例を交えながら説明していきます。\n\n## 詳細\n\n業界のエキスパートによる分析と、実際のプロジェクトでの導入事例を紹介します。`,
      url: `https://example.com/articles/${i + 1}`,
      imageUrl: `https://picsum.photos/seed/${i + 1}/800/400`,
      publishedAt: publishedAt.toISOString(),
      source: sources[i % sources.length],
      category: categoryIds[i % categoryIds.length],
      techLevel: techLevels[i % techLevels.length],
      readingTime: Math.floor(Math.random() * 10) + 3,
      createdAt: publishedAt.toISOString(),
      updatedAt: publishedAt.toISOString(),
    });
  }

  return articles;
}

// カテゴリを投入
async function seedCategories() {
  console.log('📦 カテゴリデータを投入中...');
  
  for (const category of categories) {
    try {
      await docClient.send(new PutCommand({
        TableName: CATEGORY_TABLE,
        Item: category,
      }));
      console.log(`✅ カテゴリ投入: ${category.name}`);
    } catch (error) {
      console.error(`❌ カテゴリ投入失敗: ${category.name}`, error.message);
    }
  }
}

// 記事を投入
async function seedArticles() {
  console.log('📰 記事データを投入中...');
  
  const articles = generateArticles();
  
  for (const article of articles) {
    try {
      await docClient.send(new PutCommand({
        TableName: ARTICLE_TABLE,
        Item: article,
      }));
      console.log(`✅ 記事投入: ${article.title}`);
    } catch (error) {
      console.error(`❌ 記事投入失敗: ${article.title}`, error.message);
    }
  }
}

// データ確認
async function verifyData() {
  console.log('\n🔍 データ確認中...');
  
  try {
    const categoryResult = await docClient.send(new ScanCommand({
      TableName: CATEGORY_TABLE,
      Select: 'COUNT',
    }));
    console.log(`📊 カテゴリ数: ${categoryResult.Count}`);

    const articleResult = await docClient.send(new ScanCommand({
      TableName: ARTICLE_TABLE,
      Select: 'COUNT',
    }));
    console.log(`📊 記事数: ${articleResult.Count}`);
  } catch (error) {
    console.error('❌ データ確認失敗:', error.message);
  }
}

// メイン処理
async function main() {
  console.log('🚀 テストデータ投入を開始します...\n');
  
  try {
    await seedCategories();
    console.log('');
    await seedArticles();
    console.log('');
    await verifyData();
    
    console.log('\n✅ テストデータの投入が完了しました！');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
main();
