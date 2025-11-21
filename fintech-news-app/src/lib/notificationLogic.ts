import type { Article } from '../types';
import type { NotificationSettings } from '../store/useNotificationStore';

/**
 * 記事の重要度を判定（モック実装）
 * 実際の実装では、キーワード分析やソースの信頼性などを考慮
 */
export function calculateArticleImportance(article: Article): 'high' | 'medium' | 'low' {
  // 緊急性の高いキーワード
  const urgentKeywords = [
    '速報',
    '緊急',
    '重大',
    '発表',
    'breaking',
    'urgent',
    '規制',
    '法案',
    'セキュリティ',
    '脆弱性',
    '障害',
  ];

  // 重要なキーワード
  const importantKeywords = [
    '新機能',
    'リリース',
    '買収',
    '提携',
    '資金調達',
    'IPO',
    '決算',
    'AI',
    'ブロックチェーン',
  ];

  const titleLower = article.title.toLowerCase();
  const summaryLower = article.summary?.toLowerCase() || '';
  const content = titleLower + ' ' + summaryLower;

  // 緊急キーワードが含まれる場合は高重要度
  if (urgentKeywords.some((keyword) => content.includes(keyword.toLowerCase()))) {
    return 'high';
  }

  // 重要キーワードが含まれる場合は中重要度
  if (importantKeywords.some((keyword) => content.includes(keyword.toLowerCase()))) {
    return 'medium';
  }

  return 'low';
}

/**
 * 記事が緊急ニュースかどうかを判定
 */
export function isUrgentNews(article: Article): boolean {
  const importance = calculateArticleImportance(article);
  return importance === 'high';
}

/**
 * 通知設定に基づいて記事を通知すべきかを判定
 */
export function shouldNotifyArticle(
  article: Article,
  settings: NotificationSettings,
  isInQuietHours: boolean
): boolean {
  // 通知が無効の場合は通知しない
  if (!settings.enabled) {
    return false;
  }

  // カテゴリフィルタリング
  if (settings.categories.length > 0) {
    const hasMatchingCategory = settings.categories.includes(article.category);
    if (!hasMatchingCategory) {
      return false;
    }
  }

  // 緊急ニュースは静寂時間でも通知
  if (isUrgentNews(article)) {
    return true;
  }

  // 静寂時間中は通知しない
  if (isInQuietHours) {
    return false;
  }

  return true;
}

/**
 * 通知頻度に基づいて通知をバッチ処理すべきかを判定
 */
export function shouldBatchNotifications(frequency: 'immediate' | 'hourly' | 'daily'): boolean {
  return frequency !== 'immediate';
}

/**
 * 次の通知バッチ送信時刻を計算
 */
export function getNextBatchTime(frequency: 'immediate' | 'hourly' | 'daily'): Date {
  const now = new Date();

  if (frequency === 'immediate') {
    return now;
  }

  if (frequency === 'hourly') {
    // 次の正時
    const next = new Date(now);
    next.setHours(now.getHours() + 1, 0, 0, 0);
    return next;
  }

  // daily: 次の朝9時
  const next = new Date(now);
  next.setHours(9, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/**
 * 通知メッセージを生成
 */
export function generateNotificationMessage(
  articles: Article[],
  frequency: 'immediate' | 'hourly' | 'daily'
): { title: string; body: string } {
  if (articles.length === 0) {
    return {
      title: 'FinTech News',
      body: '新着記事はありません',
    };
  }

  if (articles.length === 1) {
    const article = articles[0];
    const importance = calculateArticleImportance(article);
    const prefix = importance === 'high' ? '🔴 速報: ' : '';
    return {
      title: 'FinTech News',
      body: `${prefix}${article.title}`,
    };
  }

  // 複数記事の場合
  const urgentCount = articles.filter(isUrgentNews).length;
  const frequencyText = frequency === 'hourly' ? '1時間' : '本日';

  if (urgentCount > 0) {
    return {
      title: 'FinTech News',
      body: `🔴 緊急ニュース${urgentCount}件を含む${articles.length}件の新着記事があります`,
    };
  }

  return {
    title: 'FinTech News',
    body: `${frequencyText}の新着記事が${articles.length}件あります`,
  };
}

/**
 * ブラウザ通知を送信（モック実装）
 */
export async function sendBrowserNotification(
  title: string,
  body: string,
  article?: Article
): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知をサポートしていません');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('通知の許可が得られていません');
    return;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: article?.id || 'fintech-news',
      requireInteraction: false,
      silent: false,
    });

    // 通知でエラーが発生したとき
    notification.onerror = (error) => {
      console.error('通知エラー:', error);
    };

    // 通知クリック時の処理
    notification.onclick = () => {
      window.focus();
      if (article) {
        window.location.href = `/article/${article.id}`;
      }
      notification.close();
    };

    // 自動的に閉じる（5秒後）
    setTimeout(() => {
      notification.close();
    }, 5000);
  } catch (error) {
    console.error('通知の送信に失敗しました:', error);
    throw error;
  }
}
