import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId } from "@/lib/themes";

export type ThemeMode = "manual" | "system";
export type MotionPref = "full" | "reduced" | "system";

interface Prefs {
  /** Pick one theme yourself, or follow the system's light/dark. */
  mode: ThemeMode;
  lightTheme: ThemeId;
  darkTheme: ThemeId;
  motion: MotionPref;
  /** Translucent sidebar and bars. Off is solid and lighter on battery. */
  glass: boolean;
  compactSidebar: boolean;
  /** Blur entry and prayer text in lists until hovered. */
  hidePreviews: boolean;
  /** Key sounds in every text field, not only the writing surfaces. */
  soundsEverywhere: boolean;
  /** Prayers in "Today"; 0 picks enough to come round once a week. */
  prayersPerDay: number;
  set: (patch: Partial<Omit<Prefs, "set">>) => void;
}

function legacyCompact(): boolean {
  try { return localStorage.getItem("bj-sidebar-compact") === "1" || localStorage.getItem("bj-sidebar-compact") === "true"; } catch { return false; }
}

export const usePrefsStore = create<Prefs>()(
  persist(
    (set) => ({
      mode: "manual",
      lightTheme: "warm",
      darkTheme: "midnight",
      motion: "system",
      glass: true,
      compactSidebar: typeof window !== "undefined" ? legacyCompact() : false,
      hidePreviews: false,
      soundsEverywhere: true,
      prayersPerDay: 0,
      set: (patch) => set(patch),
    }),
    { name: "bj-prefs", version: 1 },
  ),
);

/** Settings opens from anywhere (⌘, , the profile menu, ⌘K). */
interface SettingsUi {
  open: boolean;
  section: string;
  show: (section?: string) => void;
  close: () => void;
}
export const useSettingsUi = create<SettingsUi>()((set) => ({
  open: false,
  section: "appearance",
  show: (section) => set((s) => ({ open: true, section: section ?? s.section })),
  close: () => set({ open: false }),
}));
