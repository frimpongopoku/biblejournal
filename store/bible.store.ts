import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BibleState {
  version: string;
  setVersion: (v: string) => void;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set) => ({
      version: "ESV",
      setVersion: (version) => set({ version }),
    }),
    { name: "bj-bible" }
  )
);
