"use client";
import { useEffect, useState } from "react";
import { subscribeToSermons, subscribeToSermon } from "@/services/sermon.service";
import { useAuthStore } from "@/store/auth.store";
import type { Sermon } from "@/types";

export function useSermons() {
  const user = useAuthStore((s) => s.user);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToSermons(user.uid, (data) => { setSermons(data); setLoading(false); });
    return () => unsub();
  }, [user?.uid]);
  return { sermons, loading };
}

export function useSermonDetail(id: string) {
  const user = useAuthStore((s) => s.user);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);
    const unsub = subscribeToSermon(user.uid, id, (data) => { setSermon(data); setLoading(false); });
    return () => unsub();
  }, [user?.uid, id]);
  return { sermon, loading };
}
