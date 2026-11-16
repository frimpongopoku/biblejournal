import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReaderMode = "read" | "study";
export type ReaderLayout = "paragraphs" | "verses";

interface Place { book: string; chapter: number; at: number }

interface ReadingState {
  mode: ReaderMode;
  layout: ReaderLayout;
  /** Second translation shown side by side, or null for a single column. */
  parallel: string | null;
  /** "Book ch" → when it was finished. */
  read: Record<string, number>;
  last: Place | null;
  recent: Place[];
  setMode: (m: ReaderMode) => void;
  setLayout: (l: ReaderLayout) => void;
  setParallel: (v: string | null) => void;
  markRead: (book: string, chapter: number) => void;
  visit: (book: string, chapter: number) => void;
}

export const chapterKey = (book: string, chapter: number) => `${book} ${chapter}`;

/** Reading progress lives on this device; study notes and highlights are in Firestore. */
export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      mode: "read",
      layout: "paragraphs",
      parallel: null,
      read: {},
      last: null,
      recent: [],
      setMode: (mode) => set({ mode }),
      setLayout: (layout) => set({ layout }),
      setParallel: (parallel) => set({ parallel }),
      markRead: (book, chapter) =>
        set((s) => (s.read[chapterKey(book, chapter)] ? s : { read: { ...s.read, [chapterKey(book, chapter)]: Date.now() } })),
      visit: (book, chapter) =>
        set((s) => {
          const at = Date.now();
          const recent = [{ book, chapter, at }, ...s.recent.filter((p) => !(p.book === book && p.chapter === chapter))].slice(0, 8);
          return { last: { book, chapter, at }, recent };
        }),
    }),
    { name: "bj-reading" },
  ),
);

export function chaptersReadIn(read: Record<string, number>, book: string): number {
  const prefix = `${book} `;
  let n = 0;
  for (const k in read) if (k.startsWith(prefix) && /^\d+$/.test(k.slice(prefix.length))) n++;
  return n;
}
