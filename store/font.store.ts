import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FontPairId } from "@/lib/fonts";

interface FontState {
  fontPairId: FontPairId;
  setFontPair: (id: FontPairId) => void;
}

export const useFontStore = create<FontState>()(
  persist(
    (set) => ({
      fontPairId: "classic",
      setFontPair: (fontPairId) => set({ fontPairId }),
    }),
    { name: "bj-font" }
  )
);
