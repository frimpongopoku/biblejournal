"use client";

import { useEffect, useState } from "react";
import { subscribeToTopics } from "@/services/learning.service";
import { useAuthStore } from "@/store/auth.store";
import type { LearningTopic } from "@/types";

export function useLearningTopics() {
  const user = useAuthStore((s) => s.user);
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToTopics(user.uid, (data) => {
      setTopics(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return { topics, loading };
}
