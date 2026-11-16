import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FontPairId } from "@/lib/fonts";
import type { UiFont } from "@/lib/typeface";

interface FontState {
  /** Kept for the prayer and proclamation display pickers. */
  fontPairId: FontPairId;
  /** The interface face. */
  ui: UiFont;
  setFontPair: (id: FontPairId) => void;
  setUi: (ui: UiFont) => void;
}

export const useFontStore = create<FontState>()(
  persist(
    (set) => ({
      fontPairId: "classic",
      ui: "inter",
      setFontPair: (fontPairId) => set({ fontPairId }),
      setUi: (ui) => set({ ui }),
    }),
    {
      name: "bj-font",
      version: 2,
      migrate: (old, v) => {
        const o = (old ?? {}) as Record<string, unknown>;
        if (v < 2) o.ui = o.fontPairId === "dyslexic" ? "dyslexic" : o.fontPairId === "modern" ? "jakarta" : "inter";
        return o as unknown as FontState;
      },
    },
  ),
);
