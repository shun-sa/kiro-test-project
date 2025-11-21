import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

export const themeColors = {
  blue: { name: 'ブルー', primary: '#3B82F6', hover: '#2563EB' },
  purple: { name: 'パープル', primary: '#8B5CF6', hover: '#7C3AED' },
  green: { name: 'グリーン', primary: '#10B981', hover: '#059669' },
  orange: { name: 'オレンジ', primary: '#F59E0B', hover: '#D97706' },
  pink: { name: 'ピンク', primary: '#EC4899', hover: '#DB2777' },
  red: { name: 'レッド', primary: '#EF4444', hover: '#DC2626' },
};

export type ThemeColor = keyof typeof themeColors;

interface ThemeState {
  theme: Theme;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor) => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      themeColor: 'blue',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme, get().themeColor);
      },
      setThemeColor: (color) => {
        set({ themeColor: color });
        applyThemeColor(color);
      },
      getEffectiveTheme: () => {
        const { theme } = get();
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

function applyTheme(theme: Theme, color: ThemeColor) {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
  
  applyThemeColor(color);
}

function applyThemeColor(color: ThemeColor) {
  const root = document.documentElement;
  const colors = themeColors[color];
  
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-hover', colors.hover);
}

// 初期化時にテーマを適用
const initialState = useThemeStore.getState();
applyTheme(initialState.theme, initialState.themeColor);

// システムテーマの変更を監視
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const state = useThemeStore.getState();
  if (state.theme === 'system') {
    applyTheme('system', state.themeColor);
  }
});
