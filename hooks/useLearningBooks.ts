"use client";

import { useEffect, useState } from "react";
import { subscribeToBooks } from "@/services/learning.service";
import { useAuthStore } from "@/store/auth.store";
import type { LearningBook } from "@/types";

export function useLearningBooks() {
  const user = useAuthStore((s) => s.user);
  const [books, setBooks] = useState<LearningBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToBooks(user.uid, (data) => {
      setBooks(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return { books, loading };
}
