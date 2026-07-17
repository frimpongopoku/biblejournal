import { create } from "zustand";

export interface BibleTarget {
  book: string;
  chapter: number;
  verse?: number;
}

interface FloatWindowsState {
  bibleOpen: boolean;
  askOpen: boolean;
  bibleTarget: BibleTarget | null;
  toggleBible: () => void;
  toggleAsk: () => void;
  closeBible: () => void;
  closeAsk: () => void;
  /** Opens (or jumps, if already open) the floating Bible to a specific reference. */
  openBibleAt: (target: BibleTarget) => void;
  clearBibleTarget: () => void;
}

export const useFloatWindowsStore = create<FloatWindowsState>((set) => ({
  bibleOpen: false,
  askOpen: false,
  bibleTarget: null,
  toggleBible: () => set((s) => ({ bibleOpen: !s.bibleOpen })),
  toggleAsk: () => set((s) => ({ askOpen: !s.askOpen })),
  closeBible: () => set({ bibleOpen: false }),
  closeAsk: () => set({ askOpen: false }),
  openBibleAt: (target) => set({ bibleOpen: true, bibleTarget: target }),
  clearBibleTarget: () => set({ bibleTarget: null }),
}));
