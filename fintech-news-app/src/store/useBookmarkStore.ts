import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarkState {
  bookmarks: string[]; // Article IDs
  addBookmark: (articleId: string) => void;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
  toggleBookmark: (articleId: string) => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (articleId) => {
        set((state) => ({
          bookmarks: [...state.bookmarks, articleId],
        }));
      },
      removeBookmark: (articleId) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((id) => id !== articleId),
        }));
      },
      isBookmarked: (articleId) => {
        return get().bookmarks.includes(articleId);
      },
      toggleBookmark: (articleId) => {
        const { isBookmarked, addBookmark, removeBookmark } = get();
        if (isBookmarked(articleId)) {
          removeBookmark(articleId);
        } else {
          addBookmark(articleId);
        }
      },
    }),
    {
      name: 'bookmark-storage',
    }
  )
);
