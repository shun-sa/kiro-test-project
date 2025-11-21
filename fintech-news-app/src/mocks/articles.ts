// 型定義
export type TechLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: string;
  techLevel?: TechLevel;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

const generateArticles = (): Article[] => {
  const categories = ['ai-ml', 'blockchain', 'cloud', 'fintech', 'security', 'startup'];
  const techLevels: TechLevel[] = ['beginner', 'intermediate', 'advanced'];
  const sources = ['TechCrunch Japan', 'ITmedia', '日経xTECH', 'Fintech Journal', 'ZDNet Japan'];
  
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

  const articles: Article[] = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const category = categories[i % categories.length];
    const publishedAt = new Date(now.getTime() - i * 3600000); // 1時間ずつ過去
    
    articles.push({
      id: `article-${i + 1}`,
      title: `${titles[i % titles.length]} - Part ${Math.floor(i / titles.length) + 1}`,
      summary: `${titles[i % titles.length]}に関する最新情報をお届けします。業界の専門家による分析と実践的なアドバイスを含む詳細なレポートです。`,
      content: `# ${titles[i % titles.length]}\n\nこの記事では、${titles[i % titles.length]}について詳しく解説します。\n\n## 概要\n\n最新の技術動向と実践的な活用方法について、具体的な事例を交えながら説明していきます。\n\n## 詳細\n\n業界のエキスパートによる分析と、実際のプロジェクトでの導入事例を紹介します。`,
      url: `https://example.com/articles/${i + 1}`,
      imageUrl: `https://picsum.photos/seed/${i + 1}/800/400`,
      publishedAt: publishedAt.toISOString(),
      source: sources[i % sources.length],
      category,
      techLevel: techLevels[i % techLevels.length],
      readingTime: Math.floor(Math.random() * 10) + 3,
      createdAt: publishedAt.toISOString(),
      updatedAt: publishedAt.toISOString(),
    });
  }

  return articles;
};

export const mockArticles = generateArticles();
