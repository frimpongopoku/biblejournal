"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";
import { useBibleStore } from "@/store/bible.store";

export interface Verse { n: number; text: string }
export interface ChapterData {
  version: string; book: string; chapter: number;
  totalChapters: number; verses: Verse[];
}

export const DEFAULT_BOOK = "John";
export const DEFAULT_CHAPTER = 1;

export function prevLoc(book: string, ch: number) {
  if (ch > 1) return { book, chapter: ch - 1 };
  const i = PROTESTANT_BOOKS.indexOf(book as never);
  if (i <= 0) return null;
  const pb = PROTESTANT_BOOKS[i - 1];
  return { book: pb, chapter: CHAPTER_COUNTS[pb] ?? 1 };
}

export function nextLoc(book: string, ch: number, total: number) {
  if (ch < total) return { book, chapter: ch + 1 };
  const i = PROTESTANT_BOOKS.indexOf(book as never);
  if (i >= PROTESTANT_BOOKS.length - 1) return null;
  return { book: PROTESTANT_BOOKS[i + 1], chapter: 1 };
}

/** Shared chapter-fetch + navigation state, used by /bible and /study readers. */
export function useBibleChapter() {
  const searchParams = useSearchParams();
  const { version, setVersion } = useBibleStore();
  const [book, setBook] = useState(() => {
    const b = searchParams.get("book");
    return b && (PROTESTANT_BOOKS as readonly string[]).includes(b) ? b : DEFAULT_BOOK;
  });
  const [chapter, setChapter] = useState(() => {
    const c = parseInt(searchParams.get("chapter") ?? "", 10);
    return Number.isFinite(c) && c > 0 ? c : DEFAULT_CHAPTER;
  });
  const [targetVerse, setTargetVerse] = useState<number | undefined>(() => {
    const v = parseInt(searchParams.get("verse") ?? "", 10);
    return Number.isFinite(v) && v > 0 ? v : undefined;
  });
  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChapter = useCallback(async (ver: string, bk: string, ch: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bible/${ver}/${encodeURIComponent(bk)}/${ch}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Could not load this chapter.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapter(version, book, chapter);
  }, [version, book, chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to target verse after data loads
  useEffect(() => {
    if (!data || !targetVerse) return;
    const el = document.getElementById(`verse-${targetVerse}`);
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }, [data, targetVerse]);

  function navigate(dest: { book: string; chapter: number } | null, verse?: number) {
    if (!dest) return;
    setTargetVerse(verse);
    setBook(dest.book);
    setChapter(dest.chapter);
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleQuickRef(bk: string, ch: number, verse?: number) {
    setTargetVerse(verse);
    setBook(bk);
    setChapter(ch);
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }

  const prev = prevLoc(book, chapter);
  const next = data ? nextLoc(book, chapter, data.totalChapters) : null;

  return {
    book, chapter, targetVerse, version,
    data, loading, error,
    scrollRef,
    setVersion, setBook, setChapter, setTargetVerse,
    fetchChapter, navigate, handleQuickRef,
    prev, next,
  };
}
