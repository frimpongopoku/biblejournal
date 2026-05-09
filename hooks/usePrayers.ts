"use client";

import { useEffect, useState } from "react";
import { subscribeToPrayers } from "@/services/prayer.service";
import { useAuthStore } from "@/store/auth.store";
import type { Prayer } from "@/types";

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

  return { prayers, loading };
}
