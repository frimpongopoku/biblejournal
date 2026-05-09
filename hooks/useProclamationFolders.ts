"use client";
import { useEffect, useState } from "react";
import { subscribeToProclamationFolders } from "@/services/proclamation.service";
import { useAuthStore } from "@/store/auth.store";
import type { ProclamationFolder } from "@/types";

export function useProclamationFolders() {
  const user = useAuthStore((s) => s.user);
  const [folders, setFolders] = useState<ProclamationFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToProclamationFolders(user.uid, (data) => {
      setFolders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return { folders, loading };
}
