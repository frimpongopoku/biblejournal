"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useStreakStore } from "@/store/streak.store";
import { subscribeToEntries } from "@/services/journal.service";
import { subscribeToPrayers } from "@/services/prayer.service";

/**
 * Subscribes to journal entries + prayers in the background,
 * computes the user's writing streak, and writes it to the
 * shared streak store so AppShell and Dashboard both stay in sync.
 *
 * Call this once in app/(app)/layout.tsx.
 */
export function useStreakSync() {
  const user = useAuthStore((s) => s.user);
  const updateStreak = useStreakStore((s) => s.update);

  const journalDates = useRef<Date[]>([]);
  const prayerDates = useRef<Date[]>([]);

  function merge() {
    updateStreak([...journalDates.current, ...prayerDates.current]);
  }

  useEffect(() => {
    if (!user) return;

    const unsubJ = subscribeToEntries(user.uid, (entries) => {
      journalDates.current = entries.map((e) => e.updatedAt);
      merge();
    });

    const unsubP = subscribeToPrayers(user.uid, (prayers) => {
      prayerDates.current = prayers.map((p) => p.updatedAt);
      merge();
    });

    return () => {
      unsubJ();
      unsubP();
    };
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps
}
