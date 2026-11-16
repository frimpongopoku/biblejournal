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
import { fetchChapter, getCachedChapter } from "@/lib/bible-client";
import { useWritingStore, readingFontStyle } from "@/store/writing.store";

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
          className="fixed inset-0 z-40 bj-scrim"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed left-0 right-0 bottom-0 z-50 flex flex-col overflow-hidden bj-window-phone"
          style={{ height: "78vh" }}
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.36 }}
        >
          <div className="flex justify-center pt-2 pb-1 shrink-0"><span className="w-9 h-1 rounded-full" style={{ background: "var(--bj-line)" }} /></div>
          <div className="flex items-center gap-2.5 px-4 pb-2.5 shrink-0">
            <span className="w-7 h-7 rounded-[9px] bj-well flex items-center justify-center" style={{ color: "var(--bj-gold)" }}>{icon}</span>
            <span className="font-display text-[19px] flex-1 truncate" style={{ color: "var(--bj-ink)" }}>{title}</span>
            <button onClick={onClose} aria-label="Close" className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
        </motion.div>
      </>
    );
  }

  return (
    <motion.div
      className="fixed z-50 flex flex-col overflow-hidden bj-window"
      style={{ left: pos.x, top: pos.y, width, height: "min(640px, 76vh)", transformOrigin: "top right" }}
      initial={{ opacity: 0, scale: 0.96, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Title bar: the drag handle */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="bj-window-bar flex items-center gap-2.5 pl-3 pr-2 h-12 shrink-0 select-none"
      >
        <span className="w-7 h-7 rounded-[9px] bj-well flex items-center justify-center shrink-0" style={{ color: "var(--bj-gold)" }}>{icon}</span>
        <span className="font-display text-[17px] flex-1 truncate" style={{ color: "var(--bj-ink)" }}>{title}</span>
        <GripHorizontal size={14} className="shrink-0 opacity-50" style={{ color: "var(--bj-ink4)" }} />
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          aria-label="Close"
          className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ color: "var(--bj-ink3)" }}
        >
          <X size={15} />
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
  const readFont = useWritingStore((s) => s.readFont);
  const readSize = useWritingStore((s) => s.readSize);

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
    const hit = getCachedChapter(version, book, chapter);
    if (hit) { setData({ verses: hit.verses, totalChapters: hit.totalChapters }); return; }
    setLoading(true);
    fetchChapter(version, book, chapter)
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
    <FloatShell title={`${book} ${chapter}`} icon={<BookOpen size={14} />} onClose={onClose} width={400}
      defaultPos={{ x: typeof window !== "undefined" ? Math.max(16, window.innerWidth - 430) : 16, y: 72 }}>

      <div className="flex flex-col h-full">
        {/* Go to + translation */}
        <div className="px-3 pt-3 pb-2.5 shrink-0 flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <label className="flex items-center gap-2 h-9 px-3 rounded-[11px] bj-well">
              <Search size={13} style={{ color: "var(--bj-ink4)" }} className="shrink-0" />
              <input
                ref={inputRef} value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (sugs.length) setSugOpen(true); }}
                onBlur={() => setTimeout(() => setSugOpen(false), 150)}
                placeholder="Go to… John 15:5"
                aria-label="Go to a passage"
                className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[13px]"
                style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                autoComplete="off" spellCheck={false}
              />
            </label>
            <AnimatePresence>
              {sugOpen && sugs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute left-0 right-0 z-10 p-1 bj-pop rounded-[13px]"
                  style={{ top: "calc(100% + 6px)", transformOrigin: "top" }}
                >
                  {sugs.map((s, i) => (
                    <button key={s.label} type="button"
                      onMouseDown={(e) => { e.preventDefault(); commit(s); }}
                      onMouseEnter={() => setSugIdx(i)}
                      data-active={i === sugIdx || undefined}
                      className="bj-menu-item flex items-center gap-2.5 w-full h-9 px-2.5 rounded-[9px] text-left">
                      <span className="w-6 h-6 rounded-[7px] bj-well flex items-center justify-center shrink-0 font-sans text-[10px] font-semibold" style={{ color: "var(--bj-gold)" }}>
                        {s.type === "book" ? <BookOpen size={11} /> : s.type === "chapter" ? s.chapter : <Hash size={11} />}
                      </span>
                      <span className="font-sans text-[13px] flex-1 truncate" style={{ color: "var(--bj-ink)" }}>{s.label}</span>
                      <span className="font-sans text-[11px] shrink-0" style={{ color: "var(--bj-ink4)" }}>
                        {s.type === "book" ? `${CHAPTER_COUNTS[s.book]} ch` : "↵"}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <select value={version} onChange={(e) => setVersion(e.target.value)} aria-label="Translation"
            className="h-9 pl-2.5 pr-1 rounded-[11px] bj-raised font-sans text-[12px] font-semibold outline-none cursor-pointer shrink-0"
            style={{ color: "var(--bj-ink2)" }}>
            {VERSIONS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* The text */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-2 pb-5" style={{ borderTop: "1px solid var(--bj-line-soft)" }}>
          {loading ? (
            <div className="flex flex-col gap-3 pt-4">
              {[92, 80, 96, 70, 88, 60].map((w, i) => <div key={i} className="h-3.5 rounded-full animate-pulse" style={{ width: `${w}%`, background: "var(--m-hover)" }} />)}
            </div>
          ) : (
            <>
              <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] pt-3 pb-2" style={{ color: "var(--bj-ink4)" }}>{book} · Chapter {chapter} · {version}</p>
              <div className="font-read" style={{ ...readingFontStyle(readFont, Math.min(readSize, 19)), lineHeight: 1.65, color: "var(--bj-ink)" }}>
                {data?.verses.map((v) => (
                  <span key={v.n} id={`float-verse-${v.n}`} className="float-verse" data-target={v.n === targetVerse || undefined}>
                    <sup className="font-sans text-[10px] font-semibold mr-1 select-none" style={{ color: "var(--bj-gold)" }}>{v.n}</sup>{v.text}{" "}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Previous / next */}
        <div className="flex items-center gap-2 px-3 py-2.5 shrink-0" style={{ borderTop: "1px solid var(--bj-line-soft)" }}>
          <button onClick={() => { if (prev) { setBook(prev.book); setChapter(prev.chapter); setTargetVerse(undefined); } }} disabled={!prev}
            className="bj-raised bj-lift h-8 pl-1.5 pr-2.5 rounded-[10px] flex items-center gap-1 font-sans text-[12px] disabled:opacity-30 disabled:pointer-events-none min-w-0"
            style={{ color: "var(--bj-ink2)" }}>
            <ChevronLeft size={14} className="shrink-0" /><span className="truncate">{prev ? `${prev.book} ${prev.chapter}` : "Start"}</span>
          </button>
          <button onClick={() => { if (next) { setBook(next.book); setChapter(next.chapter); setTargetVerse(undefined); } }} disabled={!next}
            className="bj-raised bj-lift h-8 pl-2.5 pr-1.5 rounded-[10px] flex items-center gap-1 font-sans text-[12px] disabled:opacity-30 disabled:pointer-events-none ml-auto min-w-0"
            style={{ color: "var(--bj-ink2)" }}>
            <span className="truncate">{next ? `${next.book} ${next.chapter}` : "End"}</span><ChevronRight size={14} className="shrink-0" />
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
  const [asked, setAsked] = useState("");
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const askQuery = useFloatWindowsStore((s) => s.askQuery);
  const clearAskQuery = useFloatWindowsStore((s) => s.clearAskQuery);

  useEffect(() => {
    if (!askQuery) return;
    setQuestion(askQuery);
    clearAskQuery();
    void handleAsk(askQuery);
  }, [askQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAsk(override?: string) {
    const q = (override ?? question).trim();
    if (!q || loading) return;
    setLoading(true); setResult(null); setError(""); setAsked(q); setQuestion("");
    try {
      const res = await fetch("/api/research/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, version }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setResult(data);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <FloatShell title="Ask Scripture" icon={<MessageSquare size={14} />} onClose={onClose} width={400}
      defaultPos={{ x: typeof window !== "undefined" ? Math.max(16, window.innerWidth - 850) : 16, y: 72 }}>

      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-4 flex flex-col gap-3">
          {!result && !loading && !error && (
            <div className="flex flex-col gap-2.5 pt-1">
              <p className="font-display text-[22px] leading-tight" style={{ color: "var(--bj-ink)" }}>What would you like to understand?</p>
              <p className="font-sans text-[12.5px]" style={{ color: "var(--bj-ink3)" }}>Answers come from Scripture, with the verses to read for yourself.</p>
              <div className="flex flex-col gap-1.5 mt-1">
                {["What does the Bible say about anxiety?", "Who was Melchizedek?", "What is grace, really?"].map((q) => (
                  <button key={q} type="button" onClick={() => { setQuestion(q); void handleAsk(q); }}
                    className="bj-raised bj-lift rounded-[12px] px-3 py-2.5 text-left font-sans text-[13px]" style={{ color: "var(--bj-ink2)" }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {(result || loading) && asked && (
            <p className="font-display italic text-[19px] leading-snug" style={{ color: "var(--bj-ink)" }}>{asked}</p>
          )}

          {loading && (
            <div className="bj-raised rounded-[14px] p-4 flex flex-col gap-2.5">
              {[95, 88, 92, 60].map((w, i) => <div key={i} className="h-3 rounded-full animate-pulse" style={{ width: `${w}%`, background: "var(--m-hover)" }} />)}
            </div>
          )}

          {error && (
            <p className="font-sans text-[12.5px] px-3 py-2.5 rounded-[12px]" style={{ background: "color-mix(in oklch, var(--bj-ember) 10%, transparent)", color: "var(--bj-ember)" }}>
              {error}
            </p>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col gap-3">
                <div className="bj-raised rounded-[14px] px-4 py-3.5 flex flex-col gap-2.5">
                  {result.answer.split(/\n\s*\n/).filter((p) => p.trim()).map((p, i) => (
                    <p key={i} className="font-sans text-[13.5px] leading-[1.65] whitespace-pre-wrap" style={{ color: i === 0 ? "var(--bj-ink)" : "var(--bj-ink2)" }}>{p.trim()}</p>
                  ))}
                </div>

                {result.keyVerses && result.keyVerses.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="font-sans text-[10.5px] uppercase tracking-[0.08em] font-semibold px-0.5" style={{ color: "var(--bj-ink4)" }}>Read for yourself</p>
                    {result.keyVerses.map((v) => {
                      const r = parseRef(v.ref);
                      return (
                        <button key={v.ref} type="button" disabled={!r} onClick={() => r && openBibleAt({ book: r.book, chapter: r.chapter, verse: r.verse })}
                          className="bj-raised bj-lift rounded-[12px] px-3.5 py-3 text-left" style={{ borderColor: "color-mix(in oklch, var(--bj-gold) 22%, var(--m-edge))" }}>
                          <span className="block font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: "var(--bj-gold)" }}>{v.ref} · {version}</span>
                          <span className="block font-read italic text-[15.5px] leading-[1.5]" style={{ color: "var(--bj-ink)" }}>“{v.text}”</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Composer */}
        <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: "1px solid var(--bj-line-soft)" }}>
          <div className="bj-well rounded-[14px] p-1.5 flex items-end gap-1.5">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
              placeholder={result ? "Ask a follow-up…" : "What does the Bible say about…"}
              aria-label="Your question"
              rows={2}
              className="flex-1 min-w-0 bg-transparent outline-none resize-none font-sans text-[13.5px] px-2 py-1.5"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)", lineHeight: 1.5 }}
            />
            <button onClick={() => handleAsk()} disabled={loading || !question.trim()} aria-label="Ask"
              className="bj-gold h-9 px-3.5 rounded-[11px] flex items-center gap-1.5 font-sans text-[12.5px] font-semibold shrink-0 disabled:opacity-40 disabled:pointer-events-none">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />}
              Ask
            </button>
          </div>
        </div>
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
  return (
    <div className="flex items-center gap-1">
      <button onClick={onToggleBible} title={bibleOpen ? "Close Bible" : "Open Bible (⌘⌥B)"} data-active={bibleOpen || undefined}
        className={`${bibleOpen ? "bj-raised" : "bj-btn-icon"} flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-sans text-[12.5px]`}
        style={{ color: bibleOpen ? "var(--bj-gold)" : "var(--bj-ink3)" }}>
        <BookOpen size={14} />
        <span className="hidden sm:inline">Bible</span>
      </button>
      <button onClick={onToggleAsk} title={askOpen ? "Close Ask" : "Ask Scripture (⌘⇧A)"} data-active={askOpen || undefined}
        className={`${askOpen ? "bj-raised" : "bj-btn-icon"} flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-sans text-[12.5px]`}
        style={{ color: askOpen ? "var(--bj-gold)" : "var(--bj-ink3)" }}>
        <MessageSquare size={14} />
        <span className="hidden sm:inline">Ask</span>
      </button>
    </div>
  );
}
