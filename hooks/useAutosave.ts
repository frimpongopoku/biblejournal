"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "offline" | "error";

/**
 * Debounced autosave that never drops an edit.
 *
 * - Patches for the same document MERGE (editing the title then the body
 *   saves both — the old single-timer pattern silently discarded the title).
 * - Each document has its own timer, so switching documents never cancels
 *   the previous document's pending save.
 * - Everything pending is flushed on unmount, tab hide and page close.
 */
export function useAutosave<P extends object>(
  save: (id: string, patch: P) => Promise<unknown>,
  delay = 900,
) {
  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; });
  const pending = useRef(new Map<string, P>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const inflight = useRef(0);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const flush = useCallback((id?: string) => {
    const run = (ids: string[]) => {
    for (const key of ids) {
      const t = timers.current.get(key);
      if (t) clearTimeout(t);
      timers.current.delete(key);
      const patch = pending.current.get(key);
      if (!patch) continue;
      pending.current.delete(key);
      inflight.current++;
      setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "saving");
      saveRef.current(key, patch)
        .then(() => {
          inflight.current--;
          if (inflight.current === 0 && pending.current.size === 0) setStatus("saved");
        })
        .catch(() => {
          inflight.current--;
          // Put the patch back (under any newer edits) so the next flush retries it.
          const newer = pending.current.get(key);
          pending.current.set(key, { ...patch, ...(newer ?? {}) } as P);
          setStatus("error");
          if (!timers.current.has(key)) timers.current.set(key, setTimeout(() => run([key]), 3000));
        });
    }
    };
    run(id ? [id] : [...pending.current.keys()]);
  }, []);

  const schedule = useCallback(
    (id: string, patch: P) => {
      pending.current.set(id, { ...(pending.current.get(id) ?? {}), ...patch } as P);
      setStatus("pending");
      const t = timers.current.get(id);
      if (t) clearTimeout(t);
      timers.current.set(id, setTimeout(() => flush(id), delay));
    },
    [delay, flush],
  );

  useEffect(() => {
    const flushAll = () => flush();
    const onVis = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flushAll);
    window.addEventListener("beforeunload", flushAll);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flushAll);
      window.removeEventListener("beforeunload", flushAll);
      document.removeEventListener("visibilitychange", onVis);
      flush();
    };
  }, [flush]);

  return { schedule, flush, status, hasPending: () => pending.current.size > 0 };
}

export function saveStatusLabel(s: SaveStatus): string {
  switch (s) {
    case "pending":
    case "saving": return "Saving…";
    case "saved": return "Saved";
    case "offline": return "Saved on this device";
    case "error": return "Couldn't save — retrying";
    default: return "";
  }
}
