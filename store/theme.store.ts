import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId } from "@/lib/themes";

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: "midnight",
      setTheme: (themeId) => set({ themeId }),
    }),
    { name: "bj-theme" }
  )
);
