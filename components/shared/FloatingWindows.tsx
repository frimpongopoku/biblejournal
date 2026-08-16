"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, GripHorizontal, BookOpen, MessageSquare,
  ChevronLeft, ChevronRight, Search, Loader2, Hash,
} from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";
import { useBibleStore } from "@/store/bible.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";

// ── Types ──────────────────────────────────────────────────

type BookSug    = { type: "book";    book: string; label: string };
type ChapterSug = { type: "chapter"; book: string; chapter: number; label: string };
type VerseSug   = { type: "verse";   book: string; chapter: number; verse: number; label: string };
type Suggestion = BookSug | ChapterSug | VerseSug;

interface Verse { n: number; text: string }

interface AskResult {
  answer: string;
  keyVerses?: { ref: string; text: string }[];
}

// ── Suggestion helpers (same logic as QuickRefInput) ───────

function matchBooks(q: string): string[] {
  const ql = q.toLowerCase().trim();
  if (!ql) return [];
  const num = ql.match(/^(\d)\s*(.*)$/);
  if (num) {
    return PROTESTANT_BOOKS.filter((b) => {
      const bl = b.toLowerCase();
      return bl.startsWith(`${num[1]} `) && (!num[2] || bl.slice(2).startsWith(num[2]));
    }).slice(0, 5);
  }
  const byPrefix = PROTESTANT_BOOKS.filter((b) => b.toLowerCase().startsWith(ql));
  const byWord   = PROTESTANT_BOOKS.filter((b) => /^\d /.test(b.toLowerCase()) && b.toLowerCase().replace(/^\d+ /, "").startsWith(ql));
  return [...new Set([...byPrefix, ...byWord])].slice(0, 5);
}

function getSuggestions(input: string): Suggestion[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  if (trimmed.includes(":")) {
    const p = parseRef(trimmed);
    return p?.verse !== undefined
      ? [{ type: "verse", book: p.book, chapter: p.chapter, verse: p.verse, label: `${p.book} ${p.chapter}:${p.verse}` }]
      : [];
  }
  const p = parseRef(trimmed);
  if (p) {
    const total = CHAPTER_COUNTS[p.book] ?? 1;
    const ch = Math.min(p.chapter, total);
    return [ch - 1, ch, ch + 1].filter((c) => c >= 1 && c <= total)
      .map((c) => ({ type: "chapter" as const, book: p.book, chapter: c, label: `${p.book} ${c}` }));
  }
  if (input.endsWith(" ")) {
    const book = PROTESTANT_BOOKS.find((b) => b.toLowerCase() === trimmed.toLowerCase());
    if (book) {
      const total = CHAPTER_COUNTS[book] ?? 1;
      return Array.from({ length: Math.min(total, 6) }, (_, i) => ({ type: "chapter" as const, book, chapter: i + 1, label: `${book} ${i + 1}` }));
    }
  }
  return matchBooks(trimmed).map((b) => ({ type: "book" as const, book: b, label: b }));
}

// ── Draggable window shell ─────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

interface FloatShellProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  defaultPos?: { x: number; y: number };
  width?: number;
  children: React.ReactNode;
}

export function FloatShell({ title, icon, onClose, defaultPos, width = 360, children }: FloatShellProps) {
  const isMobile = useIsMobile();
  const [pos, setPos] = useState(defaultPos ?? { x: 100, y: 80 });
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });

  // Set a sensible default once we know screen size
  useEffect(() => {
    if (!defaultPos) {
      setPos({ x: Math.max(16, window.innerWidth - width - 24), y: 72 });
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };
    const move = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: start.current.wx + ev.clientX - start.current.mx, y: start.current.wy + ev.clientY - start.current.my });
    };
    const up = () => { dragging.current = false; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [pos]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = { mx: t.clientX, my: t.clientY, wx: pos.x, wy: pos.y };
  }, [pos]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setPos({ x: start.current.wx + t.clientX - start.current.mx, y: start.current.wy + t.clientY - start.current.my });
  }, []);

  if (isMobile) {
    return (
      <>
        <motion.div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.35)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed left-0 right-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
          style={{ height: "75vh", background: "var(--bj-bg-panel)", borderTop: "1px solid var(--bj-line-soft)" }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
            <span style={{ color: "var(--bj-gold)" }}>{icon}</span>
            <span className="font-sans text-sm font-medium flex-1" style={{ color: "var(--bj-ink)" }}>{title}</span>
            <button onClick={onClose} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
        </motion.div>
      </>
    );
  }

  return (
    <motion.div
      className="fixed z-50 flex flex-col rounded-2xl overflow-hidden"
      style={{
        left: pos.x, top: pos.y, width,
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line)",
        boxShadow: "0 12px 48px color-mix(in oklch, var(--bj-ink) 20%, transparent)",
        maxHeight: "72vh",
      }}
      initial={{ opacity: 0, scale: 0.97, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 6 }}
      transition={{ duration: 0.16 }}
    >
      {/* Title bar — drag handle */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="flex items-center gap-2 px-3 py-2.5 shrink-0 border-b select-none"
        style={{ borderColor: "var(--bj-line-soft)", cursor: "grab", background: "var(--bj-bg-soft)" }}
      >
        <GripHorizontal size={13} style={{ color: "var(--bj-ink4)", flexShrink: 0 }} />
        <span style={{ color: "var(--bj-gold)", flexShrink: 0 }}>{icon}</span>
        <span className="font-sans text-xs font-semibold flex-1" style={{ color: "var(--bj-ink2)" }}>{title}</span>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="bj-btn-icon w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ color: "var(--bj-ink4)" }}
        >
          <X size={12} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </motion.div>
  );
}

// ── Floating Bible ─────────────────────────────────────────

export function FloatingBible({ onClose }: { onClose: () => void }) {
  const { version, setVersion } = useBibleStore();
  const bibleTarget = useFloatWindowsStore((s) => s.bibleTarget);
  const clearBibleTarget = useFloatWindowsStore((s) => s.clearBibleTarget);
  const [book, setBook] = useState(() => bibleTarget?.book ?? "John");
  const [chapter, setChapter] = useState(() => bibleTarget?.chapter ?? 3);
  const [targetVerse, setTargetVerse] = useState<number | undefined>(() => bibleTarget?.verse);
  const [data, setData] = useState<{ verses: Verse[]; totalChapters: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Search
  const [query, setQuery] = useState("");
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [sugOpen, setSugOpen] = useState(false);
  const [sugIdx, setSugIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const VERSIONS = ["ESV", "KJV", "NIV", "AMP", "MSG", "ASV", "NKJV", "NLT"];
  const [hoveredV, setHoveredV] = useState<string | null>(null);

  // React to a reference being requested from elsewhere in the app (e.g. a study
  // space's "Read in Bible" button), whether this window is opening fresh or
  // already sitting open on a different passage.
  useEffect(() => {
    if (!bibleTarget) return;
    setBook(bibleTarget.book);
    setChapter(bibleTarget.chapter);
    setTargetVerse(bibleTarget.verse);
    clearBibleTarget();
  }, [bibleTarget, clearBibleTarget]);

  useEffect(() => { setSugs(getSuggestions(query)); setSugIdx(0); }, [query]);
  useEffect(() => { setSugOpen(sugs.length > 0 && query.trim().length > 0); }, [sugs, query]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bible/${version}/${encodeURIComponent(book)}/${chapter}`)
      .then((r) => r.json())
      .then((d) => setData({ verses: d.verses ?? [], totalChapters: d.totalChapters ?? 1 }))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [version, book, chapter]);

  // Scroll to the requested verse once its text has loaded.
  useEffect(() => {
    if (!data || !targetVerse) return;
    const el = document.getElementById(`float-verse-${targetVerse}`);
    if (!el) return;
    const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    return () => clearTimeout(t);
  }, [data, targetVerse]);

  function commit(sug: Suggestion) {
    if (sug.type === "book") { setQuery(sug.book + " "); inputRef.current?.focus(); return; }
    setBook(sug.book); setChapter(sug.chapter); setTargetVerse(sug.type === "verse" ? sug.verse : undefined);
    setQuery(""); setSugOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setQuery(""); setSugOpen(false); return; }
    if (!sugOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx((i) => Math.min(i + 1, sugs.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); commit(sugs[sugIdx]); }
  }

  const prev = chapter > 1 ? { book, chapter: chapter - 1 }
    : PROTESTANT_BOOKS.indexOf(book as never) > 0
      ? { book: PROTESTANT_BOOKS[PROTESTANT_BOOKS.indexOf(book as never) - 1], chapter: CHAPTER_COUNTS[PROTESTANT_BOOKS[PROTESTANT_BOOKS.indexOf(book as never) - 1]] ?? 1 }
      : null;

  const next = data && chapter < data.totalChapters ? { book, chapter: chapter + 1 }
    : PROTESTANT_BOOKS.indexOf(book as never) < PROTESTANT_BOOKS.length - 1
      ? { book: PROTESTANT_BOOKS[PROTESTANT_BOOKS.indexOf(book as never) + 1], chapter: 1 }
      : null;

  return (
    <FloatShell title={`${book} ${chapter}`} icon={<BookOpen size={13} />} onClose={onClose} width={360}
      defaultPos={{ x: typeof window !== "undefined" ? Math.max(16, window.innerWidth - 390) : 16, y: 72 }}>

      <div className="flex flex-col h-full">
        {/* Search + version */}
        <div className="px-3 pt-3 pb-2 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
          {/* Quick-ref search */}
          <div className="relative mb-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
              <Search size={11} style={{ color: "var(--bj-ink4)" }} />
              <input
                ref={inputRef} value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (sugs.length) setSugOpen(true); }}
                onBlur={() => setTimeout(() => setSugOpen(false), 150)}
                placeholder="Go to verse…"
                className="flex-1 bg-transparent outline-none font-sans text-xs"
                style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                autoComplete="off" spellCheck={false}
              />
            </div>
            <AnimatePresence>
              {sugOpen && sugs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 right-0 rounded-xl overflow-hidden z-10"
                  style={{ top: "calc(100% + 4px)", background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "0 8px 24px color-mix(in oklch, var(--bj-ink) 14%, transparent)" }}
                >
                  {sugs.map((s, i) => (
                    <button key={s.label} type="button"
                      onMouseDown={(e) => { e.preventDefault(); commit(s); }}
                      onMouseEnter={() => setSugIdx(i)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left"
                      style={{ background: i === sugIdx ? "var(--bj-gold-tint)" : "transparent" }}>
                      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: i === sugIdx ? "var(--bj-gold)" : "var(--bj-bg-soft)" }}>
                        {s.type === "book" && <BookOpen size={8} style={{ color: i === sugIdx ? "white" : "var(--bj-ink4)" }} />}
                        {s.type === "chapter" && <span style={{ fontSize: 7, fontWeight: 600, color: i === sugIdx ? "white" : "var(--bj-ink4)" }}>{s.chapter}</span>}
                        {s.type === "verse" && <Hash size={8} style={{ color: i === sugIdx ? "white" : "var(--bj-ink4)" }} />}
                      </span>
                      <span className="font-sans text-xs flex-1" style={{ color: i === sugIdx ? "var(--bj-gold-deep)" : "var(--bj-ink)", fontWeight: i === sugIdx ? 500 : 400 }}>{s.label}</span>
                      <span className="font-sans shrink-0" style={{ fontSize: 9, color: "var(--bj-ink4)" }}>
                        {s.type === "book" ? `${CHAPTER_COUNTS[s.book]}ch` : "↵"}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Version pills */}
          <div className="flex flex-wrap gap-1">
            {VERSIONS.map((v) => {
              const active = version === v;
              const hov = hoveredV === v && !active;
              return (
                <button key={v} onClick={() => setVersion(v)}
                  onMouseEnter={() => setHoveredV(v)} onMouseLeave={() => setHoveredV(null)}
                  className="font-sans px-2 py-0.5 rounded-md"
                  style={{
                    fontSize: 10, fontWeight: active ? 600 : 400,
                    background: active ? "var(--bj-gold)" : hov ? "var(--bj-line)" : "var(--bj-bg-soft)",
                    color: active ? "white" : hov ? "var(--bj-ink)" : "var(--bj-ink4)",
                    transform: hov ? "translateY(-1px)" : "none",
                    transition: "all 0.12s ease",
                  }}>{v}</button>
              );
            })}
          </div>
        </div>

        {/* Verses */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={16} className="animate-spin" style={{ color: "var(--bj-ink4)" }} /></div>
          ) : data?.verses.map((v) => (
            <div key={v.n} id={`float-verse-${v.n}`} className="flex gap-2.5 py-1.5 group rounded-lg px-1"
              style={{ background: v.n === targetVerse ? "var(--bj-gold-tint)" : "transparent", transition: "background 0.4s ease" }}
              onMouseEnter={(e) => { if (v.n !== targetVerse) e.currentTarget.style.background = "var(--bj-bg-soft)"; }}
              onMouseLeave={(e) => { if (v.n !== targetVerse) e.currentTarget.style.background = "transparent"; }}>
              <span className="font-sans shrink-0 w-5 text-right select-none pt-0.5" style={{ fontSize: 10, fontWeight: 600, color: "var(--bj-ink4)" }}>{v.n}</span>
              <p className="font-sans text-sm flex-1" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{v.text}</p>
            </div>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center justify-between px-3 py-2 border-t shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
          <button onClick={() => { if (prev) { setBook(prev.book); setChapter(prev.chapter); setTargetVerse(undefined); } }} disabled={!prev}
            className="bj-btn-icon flex items-center gap-1 px-2 py-1.5 rounded-lg font-sans text-xs disabled:opacity-30"
            style={{ color: "var(--bj-ink3)" }}>
            <ChevronLeft size={13} />
            {prev ? `${prev.book} ${prev.chapter}` : "Start"}
          </button>
          <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{book} {chapter}</span>
          <button onClick={() => { if (next) { setBook(next.book); setChapter(next.chapter); setTargetVerse(undefined); } }} disabled={!next}
            className="bj-btn-icon flex items-center gap-1 px-2 py-1.5 rounded-lg font-sans text-xs disabled:opacity-30"
            style={{ color: "var(--bj-ink3)" }}>
            {next ? `${next.book} ${next.chapter}` : "End"}
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </FloatShell>
  );
}

// ── Floating Ask ───────────────────────────────────────────

export function FloatingAsk({ onClose }: { onClose: () => void }) {
  const { version } = useBibleStore();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleAsk() {
    if (!question.trim() || loading) return;
    setLoading(true); setResult(null); setError("");
    try {
      const res = await fetch("/api/research/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, version }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setResult(data);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <FloatShell title="Ask Scripture" icon={<MessageSquare size={13} />} onClose={onClose} width={360}
      defaultPos={{ x: typeof window !== "undefined" ? Math.max(16, window.innerWidth - 760) : 16, y: 72 }}>

      <div className="flex flex-col h-full px-3 py-3 gap-3">
        {/* Input */}
        <div className="flex flex-col gap-2 shrink-0">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder="What does the Bible say about…"
            rows={3}
            className="w-full outline-none resize-none font-sans text-sm rounded-xl px-3 py-2.5"
            style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink)", caretColor: "var(--bj-gold)", lineHeight: 1.6 }}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="w-full font-sans text-sm py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-all duration-150"
            style={{ background: "var(--bj-gold)", color: "white" }}
            onMouseEnter={(e) => { if (!loading && question.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />}
            {loading ? "Searching…" : "Ask"}
          </button>
          {error && (
            <p className="font-sans text-xs px-3 py-2 rounded-lg" style={{ background: "color-mix(in oklch, var(--bj-ember) 10%, transparent)", color: "var(--bj-ember)", border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)" }}>
              {error}
            </p>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
              className="flex flex-col gap-3 overflow-y-auto">
              <div className="rounded-xl p-3" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
                <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>Answer</p>
                <p className="font-sans text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.answer}</p>
              </div>

              {result.keyVerses && result.keyVerses.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>Key Verses</p>
                  {result.keyVerses.map((v) => (
                    <div key={v.ref} className="rounded-xl px-3 py-2.5" style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
                      <p className="font-sans text-[10px] font-semibold mb-1" style={{ color: "var(--bj-gold-deep)" }}>{v.ref} · {version}</p>
                      <p className="font-display italic text-xs" style={{ color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.6 }}>"{v.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FloatShell>
  );
}

// ── Trigger buttons (usable anywhere: toolbars, topbar, FAB) ──

export function BibleFloatTriggers({
  bibleOpen, askOpen, onToggleBible, onToggleAsk,
}: {
  bibleOpen: boolean; askOpen: boolean;
  onToggleBible: () => void; onToggleAsk: () => void;
}) {
  const [hovB, setHovB] = useState(false);
  const [hovA, setHovA] = useState(false);

  const btn = (active: boolean, hov: boolean) => ({
    background: active ? "var(--bj-gold-tint)" : hov ? "var(--bj-bg-soft)" : "transparent",
    color: active ? "var(--bj-gold-deep)" : hov ? "var(--bj-ink)" : "var(--bj-ink4)",
    border: `1px solid ${active ? "var(--bj-gold-soft)" : hov ? "var(--bj-line-soft)" : "transparent"}`,
    transform: hov && !active ? "translateY(-1px)" : "none",
    transition: "all 0.13s ease",
  });

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onToggleBible}
        onMouseEnter={() => setHovB(true)} onMouseLeave={() => setHovB(false)}
        title={bibleOpen ? "Close Bible" : "Open Bible (⌘⌥B)"}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-sans text-xs"
        style={btn(bibleOpen, hovB)}
      >
        <BookOpen size={13} />
        <span className="hidden sm:inline">Bible</span>
      </button>
      <button
        onClick={onToggleAsk}
        onMouseEnter={() => setHovA(true)} onMouseLeave={() => setHovA(false)}
        title={askOpen ? "Close Ask" : "Ask Scripture (⌘⇧A)"}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-sans text-xs"
        style={btn(askOpen, hovA)}
      >
        <MessageSquare size={13} />
        <span className="hidden sm:inline">Ask</span>
      </button>
    </div>
  );
}
