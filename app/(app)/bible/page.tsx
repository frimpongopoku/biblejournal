"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Highlighter, BookMarked, SlidersHorizontal,
} from "lucide-react";
import { BookPickerSheet } from "@/components/bible/BookPickerSheet";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";

const VERSIONS = ["ESV", "KJV", "NIV", "AMP", "MSG", "ASV", "NKJV", "NLT"];
const DEFAULT_BOOK = "John";
const DEFAULT_CHAPTER = 1;

interface Verse {
  n: number;
  text: string;
}

interface ChapterData {
  version: string;
  book: string;
  chapter: number;
  totalChapters: number;
  verses: Verse[];
}

function prevLocation(book: string, chapter: number): { book: string; chapter: number } | null {
  if (chapter > 1) return { book, chapter: chapter - 1 };
  const idx = PROTESTANT_BOOKS.indexOf(book as never);
  if (idx <= 0) return null;
  const prevBook = PROTESTANT_BOOKS[idx - 1];
  return { book: prevBook, chapter: CHAPTER_COUNTS[prevBook] ?? 1 };
}

function nextLocation(book: string, chapter: number, total: number): { book: string; chapter: number } | null {
  if (chapter < total) return { book, chapter: chapter + 1 };
  const idx = PROTESTANT_BOOKS.indexOf(book as never);
  if (idx >= PROTESTANT_BOOKS.length - 1) return null;
  return { book: PROTESTANT_BOOKS[idx + 1], chapter: 1 };
}

export default function BiblePage() {
  const [version, setVersion] = useState("ESV");
  const [book, setBook] = useState(DEFAULT_BOOK);
  const [chapter, setChapter] = useState(DEFAULT_CHAPTER);
  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const fetchChapter = useCallback(async (ver: string, bk: string, ch: number) => {
    setLoading(true);
    setError(null);
    setHighlighted(new Set());
    try {
      const res = await fetch(
        `/api/bible/${ver}/${encodeURIComponent(bk)}/${ch}`
      );
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not load this chapter.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapter(version, book, chapter);
  }, [version, book, chapter, fetchChapter]);

  function navigate(dest: { book: string; chapter: number } | null) {
    if (!dest) return;
    setBook(dest.book);
    setChapter(dest.chapter);
  }

  function toggleHighlight(n: number) {
    setHighlighted((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  const prev = prevLocation(book, chapter);
  const next = data ? nextLocation(book, chapter, data.totalChapters) : null;

  return (
    <>
      <div className="flex h-full" style={{ background: "var(--bj-bg)" }}>

        {/* ── Main reading column ─────────────────────── */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

          {/* Nav bar */}
          <div
            className="flex items-center gap-2 px-4 md:px-6 border-b shrink-0"
            style={{ height: 52, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
          >
            <button
              onClick={() => navigate(prev)}
              disabled={!prev}
              className="bj-btn-icon p-2 rounded-lg disabled:opacity-30"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Book + chapter — tappable to open picker */}
            <button
              onClick={() => setShowPicker(true)}
              className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            >
              <span className="font-display text-base font-medium" style={{ color: "var(--bj-ink)" }}>
                {book}
              </span>
              <span style={{ color: "var(--bj-ink4)" }}>·</span>
              <span className="font-display text-base" style={{ color: "var(--bj-ink2)" }}>
                Ch. {chapter}
              </span>
            </button>

            <button
              onClick={() => navigate(next)}
              disabled={!next}
              className="bj-btn-icon p-2 rounded-lg disabled:opacity-30"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ChevronRight size={16} />
            </button>

            <div className="flex-1" />

            {/* Version picker — scrollable pills */}
            <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {VERSIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  data-active={version === v || undefined}
                  className="bj-chip font-sans text-[11px] px-2.5 py-1 rounded-lg shrink-0"
                  style={{
                    background: version === v ? "var(--bj-gold)" : "transparent",
                    color: version === v ? "white" : "var(--bj-ink4)",
                    fontWeight: version === v ? 500 : 400,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="h-4 w-px shrink-0" style={{ background: "var(--bj-line-soft)" }} />
            <button
              className="bj-btn-icon p-1.5 rounded-lg shrink-0"
              style={{ color: "var(--bj-ink3)" }}
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          {/* Verses */}
          <div className="flex-1 overflow-y-auto px-5 md:px-14 lg:px-20 py-8">
            <div style={{ maxWidth: 640, margin: "0 auto" }}>

              {/* Chapter heading */}
              <motion.div
                key={`${version}-${book}-${chapter}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-8"
              >
                <p
                  className="font-sans text-[11px] mb-2"
                  style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  {version} · {book} {chapter}
                </p>
                <h1
                  className="font-display"
                  style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1 }}
                >
                  {book} <span style={{ color: "var(--bj-ink3)" }}>{chapter}</span>
                </h1>
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
                  <div className="w-1 h-1 rounded-full" style={{ background: "var(--bj-gold)" }} />
                  <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
                </div>
              </motion.div>

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col gap-3 mt-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-5 rounded-lg animate-pulse"
                      style={{
                        background: "var(--bj-bg-soft)",
                        width: `${70 + Math.random() * 30}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <p className="font-display italic text-lg" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                    {error}
                  </p>
                  <button
                    onClick={() => fetchChapter(version, book, chapter)}
                    className="bj-chip font-sans text-sm px-4 py-2 rounded-xl"
                    style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Verse list */}
              {data && !loading && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${version}-${book}-${chapter}-verses`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-0.5"
                  >
                    {data.verses.map((v) => {
                      const isHighlighted = highlighted.has(v.n);
                      return (
                        <div
                          key={v.n}
                          onClick={() => toggleHighlight(v.n)}
                          className="bj-list-row group relative flex gap-3 px-4 py-3 rounded-xl"
                          style={{
                            background: isHighlighted ? "var(--bj-gold-tint)" : "transparent",
                            border: isHighlighted
                              ? "1px solid var(--bj-gold-soft)"
                              : "1px solid transparent",
                          }}
                        >
                          <sup
                            className="font-sans text-xs shrink-0 pt-1.5 w-6 text-right leading-none"
                            style={{
                              color: isHighlighted ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
                              fontWeight: 500,
                            }}
                          >
                            {v.n}
                          </sup>
                          <p
                            className="font-display text-lg leading-relaxed flex-1"
                            style={{
                              color: isHighlighted ? "var(--bj-ink)" : "var(--bj-ink2)",
                              fontWeight: 300,
                              lineHeight: 1.75,
                            }}
                          >
                            {v.text}
                          </p>
                          {/* Hover / tap actions */}
                          <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 pt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleHighlight(v.n); }}
                              className="bj-btn-action w-6 h-6 rounded flex items-center justify-center"
                              style={{ color: isHighlighted ? "var(--bj-gold)" : "var(--bj-ink4)" }}
                              title="Highlight"
                            >
                              <Highlighter size={11} />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="bj-btn-action w-6 h-6 rounded flex items-center justify-center"
                              style={{ color: "var(--bj-ink4)" }}
                              title="Bookmark"
                            >
                              <BookMarked size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Chapter end nav */}
              {data && !loading && (
                <div
                  className="flex justify-between items-center mt-12 pt-8 border-t"
                  style={{ borderColor: "var(--bj-line-soft)" }}
                >
                  <button
                    onClick={() => navigate(prev)}
                    disabled={!prev}
                    className="bj-chip flex items-center gap-2 font-sans text-sm px-4 py-2.5 rounded-xl disabled:opacity-30"
                    style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                  >
                    <ChevronLeft size={14} />
                    {prev ? `${prev.book} ${prev.chapter}` : "Start"}
                  </button>
                  <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                    {book} {chapter}
                  </span>
                  <button
                    onClick={() => navigate(next)}
                    disabled={!next}
                    className="bj-chip flex items-center gap-2 font-sans text-sm px-4 py-2.5 rounded-xl disabled:opacity-30"
                    style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                  >
                    {next ? `${next.book} ${next.chapter}` : "End"}
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book picker sheet */}
      <BookPickerSheet
        open={showPicker}
        currentBook={book}
        currentChapter={chapter}
        onSelect={(b, ch) => { setBook(b); setChapter(ch); }}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}
