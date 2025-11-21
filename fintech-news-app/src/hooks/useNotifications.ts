import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import {
  shouldNotifyArticle,
  shouldBatchNotifications,
  generateNotificationMessage,
  sendBrowserNotification,
} from '../lib/notificationLogic';
import type { Article } from '../types';

/**
 * 新着記事の通知を管理するカスタムフック
 */
export function useNotifications(articles: Article[]) {
  const { settings, isInQuietHours } = useNotificationStore();
  const previousArticlesRef = useRef<Set<string>>(new Set());
  const pendingNotificationsRef = useRef<Article[]>([]);

  useEffect(() => {
    if (!settings.enabled) {
      return;
    }

    // 初回実行時は通知しない（既存記事を全て既読として扱う）
    if (previousArticlesRef.current.size === 0) {
      previousArticlesRef.current = new Set(articles.map((a) => a.id));
      return;
    }

    // 新着記事を検出
    const newArticles = articles.filter((article) => !previousArticlesRef.current.has(article.id));

    if (newArticles.length === 0) {
      return;
    }

    // 新着記事を既読リストに追加
    newArticles.forEach((article) => {
      previousArticlesRef.current.add(article.id);
    });

    // 通知すべき記事をフィルタリング
    const articlesToNotify = newArticles.filter((article) =>
      shouldNotifyArticle(article, settings, isInQuietHours())
    );

    if (articlesToNotify.length === 0) {
      return;
    }

    // バッチ通知の場合は保留リストに追加
    if (shouldBatchNotifications(settings.frequency)) {
      pendingNotificationsRef.current.push(...articlesToNotify);
      // 実際の実装では、ここでバッチ送信のスケジューリングを行う
      return;
    }

    // 即座に通知（immediate）
    articlesToNotify.forEach((article) => {
      const { title, body } = generateNotificationMessage([article], settings.frequency);
      sendBrowserNotification(title, body, article);
    });
  }, [articles, settings, isInQuietHours]);

  return {
    pendingCount: pendingNotificationsRef.current.length,
  };
}
