import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimelineState {
  bookmarks: string[];
  visitedEras: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  isVisited: (eraId: string) => boolean;
  markVisited: (eraId: string) => void;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      visitedEras: [],
      isBookmarked: (id) => get().bookmarks.includes(id),
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(id)
            ? state.bookmarks.filter((b) => b !== id)
            : [...state.bookmarks, id],
        })),
      isVisited: (eraId) => get().visitedEras.includes(eraId),
      markVisited: (eraId) =>
        set((state) =>
          state.visitedEras.includes(eraId)
            ? state
            : { visitedEras: [...state.visitedEras, eraId] }
        ),
    }),
    { name: "bj-timeline" }
  )
);
