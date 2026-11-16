"use client";

import { create } from "zustand";
import type { JournalEntry } from "@/types";

/**
 * One live subscription to the journal for the whole session, shared by every
 * screen (Today, Journal, notepad, ⌘K). Navigating between pages no longer
 * tears it down and flashes "Loading…".
 */
interface JournalState {
  uid: string | null;
  entries: JournalEntry[];
  loading: boolean;
  /** Entries hidden while their delete can still be undone. */
  hidden: Set<string>;
  hide: (id: string) => void;
  unhide: (id: string) => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  uid: null,
  entries: [],
  loading: true,
  hidden: new Set(),
  hide: (id) => set((s) => ({ hidden: new Set(s.hidden).add(id) })),
  unhide: (id) => set((s) => { const h = new Set(s.hidden); h.delete(id); return { hidden: h }; }),
}));

let unsub: (() => void) | null = null;

export function ensureJournalSubscription(uid: string | null) {
  const state = useJournalStore.getState();
  if (state.uid === uid && (unsub || !uid)) return;
  unsub?.();
  unsub = null;
  useJournalStore.setState({ uid, entries: [], loading: !!uid });
  if (!uid) return;
  void import("@/services/journal.service").then(({ subscribeToEntries }) => {
    if (useJournalStore.getState().uid !== uid) return;
    unsub = subscribeToEntries(uid, (entries) => useJournalStore.setState({ entries, loading: false }));
  });
}
