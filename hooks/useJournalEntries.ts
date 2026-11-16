"use client";

import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import { ensureJournalSubscription, useJournalStore } from "@/store/journal.store";

export function useJournalEntries() {
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const all = useJournalStore((s) => s.entries);
  const hidden = useJournalStore((s) => s.hidden);
  const loading = useJournalStore((s) => s.loading);

  useEffect(() => { ensureJournalSubscription(uid); }, [uid]);

  const entries = useMemo(() => (hidden.size ? all.filter((e) => !hidden.has(e.id)) : all), [all, hidden]);
  return { entries, loading: loading || !uid };
}
