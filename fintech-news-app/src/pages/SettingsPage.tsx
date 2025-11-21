import { PageTransition } from '../components/layout/PageTransition';
import { ThemeColorPicker } from '../components/features/ThemeColorPicker';
import { ThemeToggle } from '../components/features/ThemeToggle';
import { NotificationSettings } from '../components/features/NotificationSettings';

export function SettingsPage() {
  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pb-20 md:pb-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          ⚙️ 設定
        </h1>

        <div className="space-y-6">
          {/* テーマ設定 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              表示設定
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  テーマモード
                </label>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* カラー設定 */}
          <ThemeColorPicker />

          {/* 通知設定 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              通知設定
            </h2>
            <NotificationSettings />
          </div>

          {/* アプリ情報 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              アプリ情報
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>FinTech News App v1.0.0</p>
              <p>30代金融系ITエンジニア向けニュースアプリ</p>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                © 2024 FinTech News. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
