// 型定義
export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description: string;
}

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'AI・機械学習',
    slug: 'ai-ml',
    color: '#3B82F6',
    icon: '🤖',
    description: 'AI、機械学習、ディープラーニング関連のニュース',
  },
  {
    id: '2',
    name: 'ブロックチェーン',
    slug: 'blockchain',
    color: '#8B5CF6',
    icon: '⛓️',
    description: 'ブロックチェーン、暗号資産、Web3関連のニュース',
  },
  {
    id: '3',
    name: 'クラウド技術',
    slug: 'cloud',
    color: '#10B981',
    icon: '☁️',
    description: 'AWS、Azure、GCP等のクラウドサービス関連のニュース',
  },
  {
    id: '4',
    name: 'フィンテック',
    slug: 'fintech',
    color: '#F59E0B',
    icon: '💰',
    description: '金融テクノロジー、決済、デジタルバンキング関連のニュース',
  },
  {
    id: '5',
    name: 'セキュリティ',
    slug: 'security',
    color: '#EF4444',
    icon: '🔒',
    description: 'サイバーセキュリティ、脆弱性、セキュリティ対策関連のニュース',
  },
  {
    id: '6',
    name: 'スタートアップ',
    slug: 'startup',
    color: '#EC4899',
    icon: '🚀',
    description: 'スタートアップ、資金調達、ベンチャー関連のニュース',
  },
];
