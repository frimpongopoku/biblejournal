"use client";

import { useEffect, useState } from "react";
import { subscribeToEntries } from "@/services/journal.service";
import { useAuthStore } from "@/store/auth.store";
import type { JournalEntry } from "@/types";

export function useJournalEntries() {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToEntries(user.uid, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return { entries, loading };
}
