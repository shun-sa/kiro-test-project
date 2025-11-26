/**
 * Amplify Gen 2 バックエンドにテストデータを投入するスクリプト
 * 
 * 使用方法:
 * node scripts/seed-data.mjs
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { readFile } from 'fs/promises';

// amplify_outputs.jsonを読み込み
const outputs = JSON.parse(
  await readFile(new URL('../amplify_outputs.json', import.meta.url))
);

Amplify.configure(outputs);

const client = generateClient();

// カテゴリデータ
const categories = [
  {
    name: 'FinTech',
    slug: 'fintech',
    color: '#F59E0B',
    icon: '💰',
    description: '金融テクノロジー関連のニュース',
  },
  {
    name: 'AI・機械学習',
    slug: 'ai-ml',
    color: '#3B82F6',
    icon: '🤖',
    description: 'AI・機械学習関連のニュース',
  },
  {
    name: 'ブロックチェーン',
    slug: 'blockchain',
    color: '#8B5CF6',
    icon: '⛓️',
    description: 'ブロックチェーン・暗号資産関連のニュース',
  },
  {
    name: 'クラウド',
    slug: 'cloud',
    color: '#10B981',
    icon: '☁️',
    description: 'クラウドコンピューティング関連のニュース',
  },
  {
    name: 'セキュリティ',
    slug: 'security',
    color: '#EF4444',
    icon: '🔒',
    description: 'サイバーセキュリティ関連のニュース',
  },
  {
    name: 'スタートアップ',
    slug: 'startup',
    color: '#EC4899',
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
  const techLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const categoryIds = ['fintech', 'ai-ml', 'blockchain', 'cloud', 'security', 'startup'];

  for (let i = 0; i < 30; i++) {
    const publishedAt = new Date(now.getTime() - i * 3600000); // 1時間ずつ過去
    const title = `${titles[i % titles.length]} - Part ${Math.floor(i / titles.length) + 1}`;
    
    articles.push({
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
    });
  }

  return articles;
}

// カテゴリを投入
async function seedCategories() {
  console.log('📦 カテゴリデータを投入中...');
  
  for (const category of categories) {
    try {
      const { data, errors } = await client.models.Category.create(category);
      if (errors) {
        console.error(`❌ カテゴリ投入失敗: ${category.name}`, errors);
      } else {
        console.log(`✅ カテゴリ投入: ${category.name} (ID: ${data.id})`);
      }
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
      const { data, errors } = await client.models.Article.create(article);
      if (errors) {
        console.error(`❌ 記事投入失敗: ${article.title}`, errors);
      } else {
        console.log(`✅ 記事投入: ${article.title} (ID: ${data.id})`);
      }
    } catch (error) {
      console.error(`❌ 記事投入失敗: ${article.title}`, error.message);
    }
  }
}

// データ確認
async function verifyData() {
  console.log('\n🔍 データ確認中...');
  
  try {
    const { data: categories } = await client.models.Category.list();
    console.log(`📊 カテゴリ数: ${categories.length}`);

    const { data: articles } = await client.models.Article.list();
    console.log(`📊 記事数: ${articles.length}`);
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
