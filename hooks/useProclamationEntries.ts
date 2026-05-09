"use client";
import { useEffect, useState } from "react";
import { subscribeToProclamationEntries } from "@/services/proclamation.service";
import { useAuthStore } from "@/store/auth.store";
import type { ProclamationEntry } from "@/types";

export function useProclamationEntries(folderId: string) {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState<ProclamationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !folderId) return;
    setLoading(true);
    const unsub = subscribeToProclamationEntries(user.uid, folderId, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid, folderId]);

  return { entries, loading };
}
