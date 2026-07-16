import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthorityState {
  bookmarks: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
}

export const useAuthorityStore = create<AuthorityState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      isBookmarked: (id) => get().bookmarks.includes(id),
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(id)
            ? state.bookmarks.filter((b) => b !== id)
            : [...state.bookmarks, id],
        })),
    }),
    { name: "bj-authority-bookmarks" }
  )
);
