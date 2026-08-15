import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_COMMENTARY } from "@/lib/commentary-sources";

interface CommentaryState {
  enabled: boolean;
  source: string;
  setEnabled: (v: boolean) => void;
  setSource: (id: string) => void;
}

export const useCommentaryStore = create<CommentaryState>()(
  persist(
    (set) => ({
      enabled: true,
      source: DEFAULT_COMMENTARY,
      setEnabled: (enabled) => set({ enabled }),
      setSource: (source) => set({ source }),
    }),
    { name: "bj-commentary" }
  )
);
