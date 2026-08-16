import { create } from "zustand";

interface NotepadState {
  open: boolean;
  activeEntryId: string | null;
  /** Bumped whenever a note's content is appended to from outside the open editor (see AddToNoteButton), so the editor can be safely remounted with fresh content instead of risking a stale autosave clobbering the addition. */
  appendVersion: number;
  /** Opens the notepad. Pass an entryId to switch straight to that note; omit to just re-open on whatever was last active. */
  openNotepad: (entryId?: string) => void;
  close: () => void;
  toggle: () => void;
  setActiveEntry: (id: string | null) => void;
  bumpAppendVersion: () => void;
}

export const useNotepadStore = create<NotepadState>((set) => ({
  open: false,
  activeEntryId: null,
  appendVersion: 0,
  openNotepad: (entryId) =>
    set((s) => ({ open: true, activeEntryId: entryId ?? s.activeEntryId })),
  close: () => set({ open: false }),
  toggle: () => set((s) => ({ open: !s.open })),
  setActiveEntry: (id) => set({ activeEntryId: id }),
  bumpAppendVersion: () => set((s) => ({ appendVersion: s.appendVersion + 1 })),
}));
