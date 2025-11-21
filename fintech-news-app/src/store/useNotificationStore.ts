import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  categories: string[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

interface NotificationState {
  settings: NotificationSettings;
  subscription: PushSubscription | null;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  toggleCategory: (categorySlug: string) => void;
  isInQuietHours: () => boolean;
  requestPermission: () => Promise<boolean>;
  setSubscription: (subscription: PushSubscription | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      settings: {
        enabled: false,
        frequency: 'daily',
        categories: [],
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
        },
      },
      subscription: null,
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      toggleCategory: (categorySlug) => {
        set((state) => {
          const categories = state.settings.categories.includes(categorySlug)
            ? state.settings.categories.filter((c) => c !== categorySlug)
            : [...state.settings.categories, categorySlug];
          return {
            settings: { ...state.settings, categories },
          };
        });
      },
      isInQuietHours: () => {
        const { settings } = get();
        if (!settings.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`;

        const { start, end } = settings.quietHours;

        // 静寂時間が日をまたぐ場合の処理
        if (start > end) {
          return currentTime >= start || currentTime <= end;
        }

        return currentTime >= start && currentTime <= end;
      },
      requestPermission: async () => {
        if (!('Notification' in window)) {
          console.warn('このブラウザは通知をサポートしていません');
          return false;
        }

        if (Notification.permission === 'granted') {
          return true;
        }

        if (Notification.permission === 'denied') {
          return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
      },
      setSubscription: (subscription) => {
        set({ subscription });
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ settings: state.settings }), // subscriptionは永続化しない
    }
  )
);
