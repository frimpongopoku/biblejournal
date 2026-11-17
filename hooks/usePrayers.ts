"use client";

import { useEffect, useState } from "react";
import { subscribeToPrayers } from "@/services/prayer.service";
import { useAuthStore } from "@/store/auth.store";
import type { Prayer } from "@/types";
import { devDataMode, devPrayers } from "@/lib/dev/prayerFixtures";

export function usePrayers() {
  const user = useAuthStore((s) => s.user);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToPrayers(user.uid, (data) => {
      setPrayers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  // DEV ONLY: break-ui fixtures (?data=worst|empty|one|huge).
  const [fixture] = useState(() => devPrayers(devDataMode()));
  if (fixture) return { prayers: fixture, loading: false };
  return { prayers, loading };
}
