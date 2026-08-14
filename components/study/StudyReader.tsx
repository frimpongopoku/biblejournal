"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Copy, Check, PenLine, CircleHelp, NotebookPen, MessageSquare } from "lucide-react";
import { BookPickerSheet } from "@/components/bible/BookPickerSheet";
import { QuickRefInput } from "@/components/bible/QuickRefInput";
import { AnnotationPanel } from "@/components/study/AnnotationPanel";
import { studyColorHex } from "@/lib/study-colors";
import { previewText } from "@/lib/tiptap-preview";
import type { useBibleChapter } from "@/hooks/useBibleChapter";
import type { StudyNote } from "@/types";

const VERSIONS = ["ESV", "KJV", "NIV", "AMP", "MSG", "ASV", "NKJV", "NLT"];

function relativeTime(d: Date): string {
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface HoverAnchor {
  verse: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const CARD_WIDTH = 280;
const CARD_MARGIN = 10;
const CARD_MIN_ROOM = 190; // comfortable minimum space to prefer opening upward

/** Comment-bubble hover card (Docs/Sheets-style) previewing a verse's
 *  annotations. Portaled to <body> and positioned in fixed (viewport)
 *  coordinates so it always escapes the scroll container's clipping and
 *  the nav bar, flipping above/below and clamping sideways to fit. */
function VerseHoverPreview({
  notes, anchor, onMouseEnter, onMouseLeave,
}: {
  notes: StudyNote[];
  anchor: HoverAnchor;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const highlight = notes.find((n) => n.kind === "highlight");
  const comments = notes
    .filter((n) => n.kind !== "highlight")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const spaceAbove = anchor.top;
  const spaceBelow = vh - anchor.bottom;
  const openBelow = spaceAbove < CARD_MIN_ROOM && spaceBelow > spaceAbove;

  const left = Math.min(Math.max(anchor.right - CARD_WIDTH, 8), vw - CARD_WIDTH - 8);
  const markerCenter = anchor.right - 15; // CommentMarker sits ~15px in from the row's right edge
  const tailLeft = Math.min(Math.max(markerCenter - left, 14), CARD_WIDTH - 14);

  const maxHeight = openBelow
    ? Math.max(160, spaceBelow - CARD_MARGIN - 8)
    : Math.max(160, spaceAbove - CARD_MARGIN - 8);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: openBelow ? -6 : 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: openBelow ? -6 : 6, scale: 0.94 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed z-[999]"
      style={{
        left,
        width: CARD_WIDTH,
        ...(openBelow ? { top: anchor.bottom + CARD_MARGIN } : { bottom: vh - anchor.top + CARD_MARGIN }),
        transformOrigin: openBelow ? "top" : "bottom",
      }}
    >
      <div
        className="rounded-xl overflow-y-auto"
        style={{
          maxHeight: Math.min(maxHeight, 360),
          background: "var(--bj-bg-panel)",
          border: "1px solid var(--bj-line)",
          boxShadow: "0 14px 36px color-mix(in oklch, var(--bj-ink) 22%, transparent)",
        }}
      >
        {highlight && (
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 sticky top-0"
            style={{
              borderBottom: comments.length ? "1px solid var(--bj-line-soft)" : "none",
              background: `color-mix(in srgb, var(--bj-bg-panel) 80%, ${studyColorHex(highlight.color)} 12%)`,
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: studyColorHex(highlight.color) }} />
            <span className="font-sans text-[11px] font-medium" style={{ color: "var(--bj-ink3)" }}>Highlighted</span>
          </div>
        )}
        {comments.map((note, i) => (
          <div key={note.id} className="px-3.5 py-3" style={{ borderTop: i > 0 ? "1px solid var(--bj-line-soft)" : "none" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: note.kind === "question" && !note.resolved ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                  color: note.kind === "question" && !note.resolved ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                }}
              >
                {note.kind === "question" ? <CircleHelp size={10} /> : <PenLine size={10} />}
              </span>
              <span className="font-sans text-[11px] font-semibold flex-1" style={{ color: "var(--bj-ink)" }}>
                {note.kind === "question" ? (note.resolved ? "Resolved question" : "Open question") : "Note"}
              </span>
              <span className="font-sans text-[10px] shrink-0" style={{ color: "var(--bj-ink4)" }}>{relativeTime(note.updatedAt)}</span>
            </div>
            <p className="font-sans text-[12.5px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--bj-ink2)" }}>
              {previewText(note.content) || "—"}
            </p>
            {note.kind === "question" && note.answer && (
              <div className="mt-2 pl-2.5 flex flex-col gap-0.5" style={{ borderLeft: "2px solid var(--bj-line-soft)" }}>
                <p className="font-sans text-[9px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>Answer</p>
                <p className="font-sans text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--bj-ink3)" }}>
                  {previewText(note.answer)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Pointer tail — anchors the bubble to the corner marker */}
      <div style={{ position: "absolute", [openBelow ? "top" : "bottom"]: -7, left: tailLeft, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", [openBelow ? "borderBottom" : "borderTop"]: "7px solid var(--bj-line)" }} />
      <div style={{ position: "absolute", [openBelow ? "top" : "bottom"]: -6, left: tailLeft + 1, width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", [openBelow ? "borderBottom" : "borderTop"]: "6px solid var(--bj-bg-panel)" }} />
    </motion.div>,
    document.body
  );
}

/** Always-visible corner indicator (Sheets-style) that a verse has notes/questions. */
function CommentMarker({ hasUnresolved, count }: { hasUnresolved: boolean; count: number }) {
  return (
    <span
      className="absolute top-1.5 right-1.5 rounded-full flex items-center justify-center shadow-sm"
      style={{
        width: 18, height: 18,
        background: hasUnresolved ? "var(--bj-gold)" : "var(--bj-bg-soft)",
        color: hasUnresolved ? "white" : "var(--bj-ink3)",
        border: hasUnresolved ? "none" : "1px solid var(--bj-line-soft)",
      }}
    >
      <MessageSquare size={9} fill={hasUnresolved ? "white" : "none"} />
      {count > 1 && (
        <span
          className="absolute -top-1 -right-1 rounded-full flex items-center justify-center font-sans"
          style={{ width: 12, height: 12, fontSize: 8, fontWeight: 700, background: "var(--bj-ink)", color: "var(--bj-bg-panel)" }}
        >
          {count}
        </span>
      )}
    </span>
  );
}

interface Props {
  uid: string;
  chapterState: ReturnType<typeof useBibleChapter>;
  studyNotes: StudyNote[];
}

export function StudyReader({ uid, chapterState, studyNotes }: Props) {
  const {
    book, chapter, targetVerse, version,
    data, loading, error, scrollRef,
    setVersion, setBook, setChapter, setTargetVerse,
    fetchChapter, navigate, handleQuickRef,
    prev, next,
  } = chapterState;

  const [showPicker, setShowPicker] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [hoverAnchor, setHoverAnchor] = useState<HoverAnchor | null>(null);
  const hoverHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleVerseEnter(n: number, hasNotes: boolean, el: HTMLElement) {
    if (!hasNotes) return;
    if (hoverHideTimeout.current) clearTimeout(hoverHideTimeout.current);
    const r = el.getBoundingClientRect();
    setHoverAnchor({ verse: n, top: r.top, bottom: r.bottom, left: r.left, right: r.right });
  }
  function handleVerseLeave() {
    hoverHideTimeout.current = setTimeout(() => setHoverAnchor(null), 150);
  }
  function handleCardEnter() {
    if (hoverHideTimeout.current) clearTimeout(hoverHideTimeout.current);
  }

  useEffect(() => {
    return () => { if (hoverHideTimeout.current) clearTimeout(hoverHideTimeout.current); };
  }, []);

  const chapterNotes = useMemo(
    () => studyNotes.filter((n) => n.scripture.book === book && n.scripture.chapter === chapter),
    [studyNotes, book, chapter]
  );

  // Deep-link / jump-from-notebook: auto-select + open the target verse.
  useEffect(() => {
    if (targetVerse) {
      setSelectedVerse(targetVerse);
      setPanelOpen(true);
      setMobilePanelOpen(true);
    } else {
      setSelectedVerse(null);
    }
  }, [book, chapter, targetVerse]);

  function selectVerse(n: number) {
    setSelectedVerse(n);
    setPanelOpen(true);
    setMobilePanelOpen(true);
  }

  function copyVerse(n: number, text: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(`${book} ${chapter}:${n} — ${text}`).then(() => {
      setCopiedVerse(n);
      setTimeout(() => setCopiedVerse(null), 2000);
    });
  }

  const prevText = prev, nextText = next;
  const selectedVerseText = data?.verses.find((v) => v.n === selectedVerse)?.text;

  const panel = (
    <AnnotationPanel
      uid={uid}
      book={book}
      chapter={chapter}
      version={version}
      selectedVerse={selectedVerse}
      verseText={selectedVerseText}
      notes={chapterNotes}
      onSelectVerse={(n) => setSelectedVerse(n)}
      onClose={() => { setPanelOpen(false); setMobilePanelOpen(false); }}
    />
  );

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--bj-bg)" }}>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* ── Nav bar ─────────────────────────────── */}
        <div
          className="flex items-center gap-1.5 px-3 md:px-5 border-b shrink-0 flex-wrap md:flex-nowrap"
          style={{ minHeight: 52, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
        >
          <button
            onClick={() => navigate(prevText)}
            disabled={!prevText}
            className="bj-btn-icon p-2 rounded-lg disabled:opacity-30 shrink-0"
            style={{ color: "var(--bj-ink3)" }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setShowPicker(true)}
            className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0"
          >
            <span className="font-display text-base font-medium" style={{ color: "var(--bj-ink)" }}>{book}</span>
            <span style={{ color: "var(--bj-ink4)" }}>·</span>
            <span className="font-display text-base" style={{ color: "var(--bj-ink2)" }}>Ch. {chapter}</span>
          </button>

          <button
            onClick={() => navigate(nextText)}
            disabled={!nextText}
            className="bj-btn-icon p-2 rounded-lg disabled:opacity-30 shrink-0"
            style={{ color: "var(--bj-ink3)" }}
          >
            <ChevronRight size={16} />
          </button>

          <QuickRefInput onNavigate={handleQuickRef} />

          <div className="flex-1" />

          <div className="flex gap-1 overflow-x-auto shrink-0" style={{ scrollbarWidth: "none", maxWidth: "min(220px, 34vw)" }}>
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

          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="hidden md:flex items-center gap-1.5 font-sans text-xs px-2.5 py-1.5 rounded-xl shrink-0"
            style={{
              background: panelOpen ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
              color: panelOpen ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
              border: `1px solid ${panelOpen ? "var(--bj-gold-soft)" : "var(--bj-line-soft)"}`,
            }}
          >
            <NotebookPen size={12} />
            Notes {chapterNotes.length > 0 && <span className="font-sans text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--bj-gold)", color: "white" }}>{chapterNotes.length}</span>}
          </button>
        </div>

        <div className="md:hidden px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}>
          <QuickRefInput onNavigate={handleQuickRef} fullWidth />
        </div>

        {/* ── Reading area ─────────────────────── */}
        <div
          ref={scrollRef}
          onScroll={() => { if (hoverHideTimeout.current) clearTimeout(hoverHideTimeout.current); setHoverAnchor(null); }}
          className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-16 py-8"
        >
          <div style={{ maxWidth: 660, margin: "0 auto" }}>

            <motion.div
              key={`${version}-${book}-${chapter}-hd`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <p className="font-sans text-[11px] mb-2" style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {version} · {book} {chapter} · Study
              </p>
              <h1 className="font-display" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.1 }}>
                {book} <span style={{ color: "var(--bj-ink3)", fontWeight: 300 }}>{chapter}</span>
              </h1>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--bj-gold)" }} />
                <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
              </div>
            </motion.div>

            {loading && (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-5 h-3 rounded animate-pulse shrink-0 mt-1" style={{ background: "var(--bj-bg-soft)" }} />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-4 rounded animate-pulse" style={{ background: "var(--bj-bg-soft)", width: `${60 + (i * 13 % 40)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

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

            {data && !loading && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${version}-${book}-${chapter}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                  className="flex flex-col gap-0.5"
                >
                  {data.verses.map((v) => {
                    const vNotes = chapterNotes.filter((n) => n.scripture.verse === v.n);
                    const highlight = vNotes.find((n) => n.kind === "highlight");
                    const comments = vNotes.filter((n) => n.kind !== "highlight");
                    const hasUnresolvedQuestion = comments.some((n) => n.kind === "question" && !n.resolved);
                    const isSelected = v.n === selectedVerse && panelOpen;
                    const isTarget = v.n === targetVerse;

                    return (
                      <div
                        key={v.n}
                        id={`verse-${v.n}`}
                        onClick={() => selectVerse(v.n)}
                        onMouseEnter={(e) => handleVerseEnter(v.n, vNotes.length > 0, e.currentTarget)}
                        onMouseLeave={handleVerseLeave}
                        className="bj-list-row group relative flex gap-3 px-3 py-3 rounded-xl"
                        style={{
                          background: isSelected ? "var(--bj-gold-tint)" : isTarget ? "var(--bj-bg-soft)" : "transparent",
                          border: isSelected ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                        }}
                      >
                        <span
                          className="font-sans text-xs shrink-0 pt-0.5 w-6 text-right leading-relaxed select-none"
                          style={{ color: isSelected ? "var(--bj-gold-deep)" : "var(--bj-ink4)", fontWeight: 600, fontSize: 11 }}
                        >
                          {v.n}
                        </span>

                        <p
                          className="font-sans flex-1 select-text"
                          style={{ fontSize: 16, color: isSelected ? "var(--bj-ink)" : "var(--bj-ink2)", fontWeight: 400, lineHeight: 1.85, letterSpacing: "0.01em" }}
                        >
                          {highlight ? (
                            <span
                              style={{
                                background: `color-mix(in srgb, ${studyColorHex(highlight.color)} 35%, transparent)`,
                                borderRadius: 3,
                                boxDecorationBreak: "clone",
                                WebkitBoxDecorationBreak: "clone",
                                padding: "0.15em 0.1em",
                              }}
                            >
                              {v.text}
                            </span>
                          ) : v.text}
                        </p>

                        <button
                          onClick={(e) => copyVerse(v.n, v.text, e)}
                          className="bj-btn-action w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mt-0.5"
                          style={{ color: copiedVerse === v.n ? "var(--bj-gold)" : "var(--bj-ink4)", marginRight: comments.length > 0 ? 18 : 0 }}
                          title="Copy verse"
                        >
                          {copiedVerse === v.n ? <Check size={11} /> : <Copy size={11} />}
                        </button>

                        {comments.length > 0 && (
                          <CommentMarker hasUnresolved={hasUnresolvedQuestion} count={comments.length} />
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}

            <AnimatePresence>
              {hoverAnchor && (
                <VerseHoverPreview
                  key={hoverAnchor.verse}
                  notes={chapterNotes.filter((n) => n.scripture.verse === hoverAnchor.verse)}
                  anchor={hoverAnchor}
                  onMouseEnter={handleCardEnter}
                  onMouseLeave={handleVerseLeave}
                />
              )}
            </AnimatePresence>

            {data && !loading && (
              <div className="flex justify-between items-center mt-12 pt-8 border-t gap-2" style={{ borderColor: "var(--bj-line-soft)" }}>
                <button
                  onClick={() => navigate(prevText)}
                  disabled={!prevText}
                  className="bj-chip flex items-center gap-1.5 font-sans text-sm px-4 py-2.5 rounded-xl disabled:opacity-30 min-h-[44px]"
                  style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <ChevronLeft size={14} />
                  <span className="truncate">{prevText ? `${prevText.book} ${prevText.chapter}` : "Start"}</span>
                </button>
                <span className="font-sans text-xs shrink-0" style={{ color: "var(--bj-ink4)" }}>{book} {chapter}</span>
                <button
                  onClick={() => navigate(nextText)}
                  disabled={!nextText}
                  className="bj-chip flex items-center gap-1.5 font-sans text-sm px-4 py-2.5 rounded-xl disabled:opacity-30 min-h-[44px]"
                  style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <span className="truncate">{nextText ? `${nextText.book} ${nextText.chapter}` : "End"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop annotation panel ──────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            key="study-panel-desktop"
            className="hidden md:flex flex-col shrink-0 overflow-hidden border-l"
            style={{ width: 320, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
            initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.26 }}
          >
            {panel}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile FAB ───────────────────────────── */}
      {!mobilePanelOpen && (
        <button
          onClick={() => setMobilePanelOpen(true)}
          className="md:hidden fixed flex items-center gap-2 font-sans text-sm px-4 py-2.5 rounded-2xl shadow-lg z-40"
          style={{
            bottom: "calc(5.5rem + env(safe-area-inset-bottom))", right: 16,
            background: "var(--bj-gold)", color: "white",
            boxShadow: "0 4px 20px color-mix(in oklch, var(--bj-gold) 40%, transparent)",
          }}
        >
          <NotebookPen size={14} />
          Notes {chapterNotes.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)", fontSize: 10 }}>{chapterNotes.length}</span>}
        </button>
      )}

      {/* ── Mobile bottom sheet ──────────────────── */}
      <AnimatePresence>
        {mobilePanelOpen && (
          <>
            <motion.div
              key="study-panel-scrim" className="md:hidden fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.4)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobilePanelOpen(false)}
            />
            <motion.div
              key="study-panel-sheet"
              className="md:hidden fixed left-0 right-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
              style={{ height: "78vh", background: "var(--bj-bg-panel)" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
            >
              <div className="flex justify-center pt-2 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
              </div>
              <div className="flex-1 min-h-0">{panel}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BookPickerSheet
        open={showPicker}
        currentBook={book}
        currentChapter={chapter}
        onSelect={(b, ch) => { setBook(b); setChapter(ch); setTargetVerse(undefined); }}
        onClose={() => setShowPicker(false)}
      />
    </div>
  );
}
