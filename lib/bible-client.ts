"use client";

/**
 * Client-side chapter cache. Bible text never changes, so every chapter is
 * fetched at most once per session, concurrent requests are de-duplicated, and
 * neighbours can be prefetched so prev/next chapter is instant.
 */

export interface ClientVerse { n: number; text: string }
export interface ClientChapter {
  version: string;
  book: string;
  chapter: number;
  totalChapters: number;
  verses: ClientVerse[];
}

const cache = new Map<string, ClientChapter>();
const inflight = new Map<string, Promise<ClientChapter>>();
const MAX = 120;

const key = (v: string, b: string, c: number) => `${v.toUpperCase()}|${b}|${c}`;

export function getCachedChapter(version: string, book: string, chapter: number): ClientChapter | undefined {
  return cache.get(key(version, book, chapter));
}

export function fetchChapter(version: string, book: string, chapter: number): Promise<ClientChapter> {
  const k = key(version, book, chapter);
  const hit = cache.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const p = fetch(`/api/bible/${version}/${encodeURIComponent(book)}/${chapter}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<ClientChapter>;
    })
    .then((data) => {
      if (cache.size >= MAX) cache.delete(cache.keys().next().value as string);
      cache.set(k, data);
      return data;
    })
    .finally(() => inflight.delete(k));
  inflight.set(k, p);
  return p;
}

export function prefetchChapter(version: string, book: string, chapter: number) {
  if (cache.has(key(version, book, chapter))) return;
  const run = () => void fetchChapter(version, book, chapter).catch(() => {});
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1500 });
  else setTimeout(run, 300);
}

export interface PassageRef { book: string; chapter: number; verse?: number; verseEnd?: number }

/** Verses for a reference (whole chapter when no verse). */
export async function fetchPassage(version: string, ref: PassageRef): Promise<{ verses: ClientVerse[]; label: string }> {
  const data = await fetchChapter(version, ref.book, ref.chapter);
  if (!ref.verse) return { verses: data.verses, label: `${ref.book} ${ref.chapter}` };
  const end = Math.max(ref.verse, ref.verseEnd ?? ref.verse);
  const verses = data.verses.filter((v) => v.n >= ref.verse! && v.n <= end);
  const label = `${ref.book} ${ref.chapter}:${ref.verse}${end !== ref.verse ? `–${end}` : ""}`;
  return { verses, label };
}
