"use client";

import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Highlighter, BookMarked, Copy, Check } from "lucide-react";
import { BookPickerSheet } from "@/components/bible/BookPickerSheet";
import { QuickRefInput } from "@/components/bible/QuickRefInput";
import { useBibleChapter } from "@/hooks/useBibleChapter";

const VERSIONS = ["ESV", "KJV", "NIV", "AMP", "MSG", "ASV", "NKJV", "NLT"];

function BibleReader() {
  const {
    book, chapter, targetVerse, version,
    data, loading, error, scrollRef,
    setVersion, setBook, setChapter, setTargetVerse,
    fetchChapter, navigate, handleQuickRef,
    prev, next,
  } = useBibleChapter();
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);

  useEffect(() => {
    // Reset highlights when chapter changes, keep targetVerse for scrolling
    setHighlighted(targetVerse ? new Set([targetVerse]) : new Set());
  }, [version, book, chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleHighlight(n: number) {
    setHighlighted((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  function copyVerse(n: number, text: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(`${book} ${chapter}:${n} — ${text}`).then(() => {
      setCopiedVerse(n);
      setTimeout(() => setCopiedVerse(null), 2000);
    });
  }

  return (
    <>
      <div className="flex h-full" style={{ background: "var(--bj-bg)" }}>
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

          {/* ── Nav bar ─────────────────────────────── */}
          <div
            className="flex items-center gap-1.5 px-3 md:px-5 border-b shrink-0 flex-wrap md:flex-nowrap"
            style={{ minHeight: 52, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
          >
            {/* Prev */}
            <button
              onClick={() => navigate(prev)}
              disabled={!prev}
              className="bj-btn-icon p-2 rounded-lg disabled:opacity-30 shrink-0"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Book · Chapter — taps open picker */}
            <button
              onClick={() => setShowPicker(true)}
              className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0"
            >
              <span className="font-display text-base font-medium" style={{ color: "var(--bj-ink)" }}>{book}</span>
              <span style={{ color: "var(--bj-ink4)" }}>·</span>
              <span className="font-display text-base" style={{ color: "var(--bj-ink2)" }}>Ch. {chapter}</span>
            </button>

            {/* Next */}
            <button
              onClick={() => navigate(next)}
              disabled={!next}
              className="bj-btn-icon p-2 rounded-lg disabled:opacity-30 shrink-0"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ChevronRight size={16} />
            </button>

            {/* Quick ref input */}
            <QuickRefInput onNavigate={handleQuickRef} />

            <div className="flex-1" />

            {/* Version pills — scrollable, hidden labels on mobile */}
            <div
              className="flex gap-1 overflow-x-auto shrink-0"
              style={{ scrollbarWidth: "none", maxWidth: "min(260px, 40vw)" }}
            >
              {VERSIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVersion(v)}
                  data-active={version === v || undefined}
                  className="bj-chip font-sans text-[11px] px-2.5 py-1 rounded-lg shrink-0"
                  title={version === v ? `${v} — your default` : `Switch to ${v}`}
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

          </div>

          {/* ── Mobile search row ────────────────── */}
          <div
            className="md:hidden px-3 py-2 border-b shrink-0"
            style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
          >
            <QuickRefInput onNavigate={handleQuickRef} fullWidth />
          </div>

          {/* ── Reading area ─────────────────────── */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-20 py-8">
            <div style={{ maxWidth: 660, margin: "0 auto" }}>

              {/* Chapter heading */}
              <motion.div
                key={`${version}-${book}-${chapter}-hd`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                  style={{
                    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                    color: "var(--bj-ink)",
                    fontWeight: 400,
                    lineHeight: 1.1,
                  }}
                >
                  {book} <span style={{ color: "var(--bj-ink3)", fontWeight: 300 }}>{chapter}</span>
                </h1>
                <div className="flex items-center gap-2 mt-4">
                  <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
                  <div className="w-1 h-1 rounded-full" style={{ background: "var(--bj-gold)" }} />
                  <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
                </div>
              </motion.div>

              {/* Loading skeleton */}
              {loading && (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-5 h-3 rounded animate-pulse shrink-0 mt-1" style={{ background: "var(--bj-bg-soft)" }} />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-4 rounded animate-pulse" style={{ background: "var(--bj-bg-soft)", width: `${60 + (i * 13 % 40)}%` }} />
                        {i % 3 === 0 && <div className="h-4 rounded animate-pulse" style={{ background: "var(--bj-bg-soft)", width: `${40 + (i * 7 % 30)}%` }} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="flex flex-col items-center py-16 gap-3">
                  <p className="font-display italic text-lg" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>{error}</p>
                  <button
                    onClick={() => fetchChapter(version, book, chapter)}
                    className="bj-chip font-sans text-sm px-4 py-2 rounded-xl"
                    style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Verses */}
              {data && !loading && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${version}-${book}-${chapter}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-0.5"
                  >
                    {data.verses.map((v) => {
                      const isHighlighted = highlighted.has(v.n);
                      const isTarget = v.n === targetVerse;
                      return (
                        <div
                          key={v.n}
                          id={`verse-${v.n}`}
                          onClick={() => toggleHighlight(v.n)}
                          className="bj-list-row group relative flex gap-3 px-3 py-3 rounded-xl"
                          style={{
                            background: isHighlighted
                              ? "var(--bj-gold-tint)"
                              : isTarget
                              ? "var(--bj-bg-soft)"
                              : "transparent",
                            border: isHighlighted
                              ? "1px solid var(--bj-gold-soft)"
                              : isTarget
                              ? "1px solid var(--bj-line)"
                              : "1px solid transparent",
                          }}
                        >
                          {/* Verse number */}
                          <span
                            className="font-sans text-xs shrink-0 pt-0.5 w-6 text-right leading-relaxed select-none"
                            style={{
                              color: isHighlighted ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          >
                            {v.n}
                          </span>

                          {/* Verse text — readable sans-serif */}
                          <p
                            className="font-sans flex-1 select-text"
                            style={{
                              fontSize: 16,
                              color: isHighlighted ? "var(--bj-ink)" : "var(--bj-ink2)",
                              fontWeight: 400,
                              lineHeight: 1.85,
                              letterSpacing: "0.01em",
                            }}
                          >
                            {v.text}
                          </p>

                          {/* Hover actions — visible on hover (desktop) or always in expanded (mobile via tap) */}
                          <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 pt-0.5">
                            <button
                              onClick={(e) => copyVerse(v.n, v.text, e)}
                              className="bj-btn-action w-6 h-6 rounded flex items-center justify-center"
                              style={{ color: copiedVerse === v.n ? "var(--bj-gold)" : "var(--bj-ink4)" }}
                              title="Copy verse"
                            >
                              {copiedVerse === v.n ? <Check size={11} /> : <Copy size={11} />}
                            </button>
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

              {/* Chapter-end navigation */}
              {data && !loading && (
                <div
                  className="flex justify-between items-center mt-12 pt-8 border-t gap-2"
                  style={{ borderColor: "var(--bj-line-soft)" }}
                >
                  <button
                    onClick={() => navigate(prev)}
                    disabled={!prev}
                    className="bj-chip flex items-center gap-1.5 font-sans text-sm px-4 py-2.5 rounded-xl disabled:opacity-30 min-h-[44px]"
                    style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                  >
                    <ChevronLeft size={14} />
                    <span className="truncate">{prev ? `${prev.book} ${prev.chapter}` : "Start"}</span>
                  </button>
                  <span className="font-sans text-xs shrink-0" style={{ color: "var(--bj-ink4)" }}>
                    {book} {chapter}
                  </span>
                  <button
                    onClick={() => navigate(next)}
                    disabled={!next}
                    className="bj-chip flex items-center gap-1.5 font-sans text-sm px-4 py-2.5 rounded-xl disabled:opacity-30 min-h-[44px]"
                    style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                  >
                    <span className="truncate">{next ? `${next.book} ${next.chapter}` : "End"}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookPickerSheet
        open={showPicker}
        currentBook={book}
        currentChapter={chapter}
        onSelect={(b, ch) => { setBook(b); setChapter(ch); setTargetVerse(undefined); }}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}

export default function BiblePage() {
  return (
    <Suspense fallback={null}>
      <BibleReader />
    </Suspense>
  );
}
