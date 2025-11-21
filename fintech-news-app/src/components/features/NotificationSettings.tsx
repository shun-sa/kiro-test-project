import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotificationStore } from '../../store/useNotificationStore';
import { mockCategories } from '../../mocks/categories';
import { sendBrowserNotification } from '../../lib/notificationLogic';
import { mockArticles } from '../../mocks/articles';

export function NotificationSettings() {
  const { settings, updateSettings, toggleCategory, requestPermission, isInQuietHours } =
    useNotificationStore();
  const [isRequesting, setIsRequesting] = useState(false);

  const frequencies = [
    { value: 'immediate' as const, label: '即座', description: '新着記事ごとに通知' },
    { value: 'hourly' as const, label: '1時間毎', description: 'まとめて通知' },
    { value: 'daily' as const, label: '1日1回', description: '朝にまとめて通知' },
  ];

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        updateSettings({ enabled: true });
      } else {
        alert('通知を有効にするには、ブラウザの設定で通知を許可してください。');
      }
    } catch (error) {
      console.error('通知許可の取得に失敗しました:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = async () => {
    if (!settings.enabled) {
      alert('通知を有効にしてください');
      return;
    }

    try {
      const testArticle = mockArticles[0];
      await sendBrowserNotification('FinTech News - テスト通知', testArticle.title, testArticle);
    } catch (error) {
      console.error('通知送信エラー:', error);
      alert(`通知の送信に失敗しました: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 通知ON/OFF */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              プッシュ通知
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              新着記事の通知を受け取る
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              settings.enabled
                ? updateSettings({ enabled: false })
                : handleEnableNotifications()
            }
            disabled={isRequesting}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            } ${isRequesting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <motion.div
              animate={{ x: settings.enabled ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
            />
          </motion.button>
        </div>
      </div>

      {settings.enabled && (
        <>
          {/* 通知頻度 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              通知頻度
            </h3>
            <div className="space-y-3">
              {frequencies.map((freq) => (
                <motion.button
                  key={freq.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateSettings({ frequency: freq.value })}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    settings.frequency === freq.value
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {freq.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {freq.description}
                      </div>
                    </div>
                    {settings.frequency === freq.value && (
                      <span className="text-primary text-xl">✓</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* カテゴリ選択 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              通知するカテゴリ
            </h3>
            <div className="space-y-2">
              {mockCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleCategory(category.slug)}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    settings.categories.includes(category.slug)
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                  {settings.categories.includes(category.slug) && (
                    <span className="text-primary text-xl">✓</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 静寂時間 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  静寂時間
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  指定した時間帯は通知しない
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  updateSettings({
                    quietHours: {
                      ...settings.quietHours,
                      enabled: !settings.quietHours.enabled,
                    },
                  })
                }
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.quietHours.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <motion.div
                  animate={{ x: settings.quietHours.enabled ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
                />
              </motion.button>
            </div>

            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    開始時刻
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) =>
                      updateSettings({
                        quietHours: { ...settings.quietHours, start: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    終了時刻
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) =>
                      updateSettings({
                        quietHours: { ...settings.quietHours, end: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 通知テスト */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              通知テスト
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                現在の設定で通知がどのように表示されるかテストできます
              </p>
              {isInQuietHours() && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    🌙 現在は静寂時間中です（緊急ニュースのみ通知されます）
                  </p>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTestNotification}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
              >
                テスト通知を送信
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
