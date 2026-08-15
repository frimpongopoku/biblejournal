"use client";

import { useEffect, useState } from "react";
import type { CommentaryChapter } from "@/types";

export function useCommentary(book: string, chapter: number, source: string, enabled: boolean) {
  const [data, setData] = useState<CommentaryChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/bible/commentary/${source}/${encodeURIComponent(book)}/${chapter}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
          setData(null);
        } else {
          setData(json);
        }
      })
      .catch(() => { if (!cancelled) setError("Could not load commentary."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [book, chapter, source, enabled]);

  return { data, loading: enabled && loading, error: enabled ? error : null };
}
