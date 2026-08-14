"use client";

import { useEffect, useState } from "react";
import { subscribeToStudyNotes } from "@/services/studyNotes.service";
import { useAuthStore } from "@/store/auth.store";
import type { StudyNote } from "@/types";

export function useStudyNotes() {
  const user = useAuthStore((s) => s.user);
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToStudyNotes(user.uid, (data) => {
      setStudyNotes(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  return { studyNotes, loading };
}
