"use client";

import { useEffect, useState } from "react";
import { subscribeToInsights, subscribeToTopicInsights } from "@/services/learning.service";
import { useAuthStore } from "@/store/auth.store";
import type { Insight } from "@/types";

export function useInsights(topicId?: string) {
  const user = useAuthStore((s) => s.user);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = topicId
      ? subscribeToTopicInsights(user.uid, topicId, (data) => { setInsights(data); setLoading(false); })
      : subscribeToInsights(user.uid, (data) => { setInsights(data); setLoading(false); });
    return () => unsub();
  }, [user?.uid, topicId]);

  return { insights, loading };
}
