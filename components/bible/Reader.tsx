"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ChevronDown, Columns2, AlignLeft, List, Check, X, NotebookPen, NotebookText,
} from "lucide-react";
import { useBibleChapter, type Verse } from "@/hooks/useBibleChapter";
import { useStudyNotes } from "@/hooks/useStudyNotes";
import { useCommentary } from "@/hooks/useCommentary";
import { useAuthStore } from "@/store/auth.store";
import { useJournalStore } from "@/store/journal.store";
import { useCommentaryStore } from "@/store/commentary.store";
import { useWritingStore, readingFontStyle, WIDTHS } from "@/store/writing.store";
import { useReadingStore, chapterKey } from "@/store/reading.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { createStudyNote, deleteStudyNote, updateStudyNote } from "@/services/studyNotes.service";
import { createEntry } from "@/services/journal.service";
import { fetchChapter, getCachedChapter } from "@/lib/bible-client";
import { STUDY_COLORS, studyColorHex } from "@/lib/study-colors";
import { toParagraphs, rangeLabel } from "@/lib/bible-layout";
import { gSequencePending } from "@/lib/nav";
import { commentarySource } from "@/lib/commentary-sources";
import { OSIS_ID_TO_NAME } from "@/lib/bible-books";
import { WritingSettingsButton } from "@/components/journal/WritingSettings";
import { AnnotationPanel } from "@/components/study/AnnotationPanel";
import { CommentaryBlock } from "@/components/study/CommentaryBlock";
import { CommentaryAboutModal } from "@/components/study/CommentaryAboutModal";
import { StudyNotebook } from "@/components/study/StudyNotebook";
import { JumpPicker } from "./JumpPicker";
import { VerseActionBar, VerseSheet, type VerseActionHandlers } from "./VerseActions";
import { ReadMargin, StudyMargin, type StudyTab } from "./ReaderMargin";
import type { StudyNote, CommentaryEntry } from "@/types";

const VERSIONS = ["ESV", "KJV", "NIV", "NKJV", "NLT", "AMP", "MSG", "ASV"];
const VERSION_NAMES: Record<string, string> = {
  ESV: "English Standard Version", KJV: "King James Version", NIV: "New International Version",
  NKJV: "New King James Version", NLT: "New Living Translation", AMP: "Amplified Bible", MSG: "The Message", ASV: "American Standard Version",
};

interface Sel { from: number; to: number }

const SHORT_BOOK: Record<string, string> = Object.fromEntries(
  Object.entries(OSIS_ID_TO_NAME).map(([id, name]) => [name, id.replace(/^(\d)/, "$1 ")]),
);
/** "1 Thessalonians" → "1 Thess" on narrow screens. */
const shortBook = (b: string) => (b.length > 9 ? SHORT_BOOK[b] ?? b : b);

/** Inline commentary (phones/tablets): clamped so it never buries the text. */
function InlineCommentary({ entry, sourceId, onAbout, book, chapter }: { entry: CommentaryEntry; sourceId: string; onAbout: () => void; book: string; chapter: number }) {
  return (
    <div className="mb-5 -mx-3 relative" style={{ fontFamily: "var(--bj-ui, var(--font-inter)), system-ui" }} onClick={(e) => e.stopPropagation()}>
      <CommentaryBlock entry={entry} source={commentarySource(sourceId)!} onInfoClick={onAbout} book={book} chapter={chapter} />
    </div>
  );
}

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
}

function VersionMenu({ value, onChange, exclude, compact }: { value: string; onChange: (v: string) => void; exclude?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); window.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Translation: ${VERSION_NAMES[value] ?? value}`}
        className={`bj-btn-ghost flex items-center gap-1.5 rounded-lg font-sans font-medium ${compact ? "h-7 px-2 text-[12.5px]" : "h-8 px-2.5 text-[12.5px]"}`}
        style={{ color: "var(--bj-ink2)", border: "1px solid var(--bj-line)" }}>
        {compact ? value : <>{value}<span className="hidden xl:inline font-normal whitespace-nowrap" style={{ color: "var(--bj-ink4)" }}> · {VERSION_NAMES[value]}</span></>}
        <ChevronDown size={12} style={{ color: "var(--bj-ink4)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }} transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
            role="listbox" aria-label="Translation"
            className="absolute right-0 top-full mt-1.5 z-50 w-64 p-1 rounded-xl"
            style={{ transformOrigin: "top right", background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)" }}>
            {VERSIONS.filter((v) => v !== exclude).map((v) => (
              <button key={v} type="button" role="option" aria-selected={v === value} onClick={() => { onChange(v); setOpen(false); }}
                className="bj-list-row w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-left font-sans text-[13px]"
                style={{ color: v === value ? "var(--bj-ink)" : "var(--bj-ink2)" }}>
                <span className="w-11 font-semibold" style={{ color: v === value ? "var(--bj-gold-deep)" : "var(--bj-ink3)" }}>{v}</span>
                <span className="truncate flex-1">{VERSION_NAMES[v]}</span>
                {v === value && <Check size={13} style={{ color: "var(--bj-gold-deep)" }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Reader() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const ch = useBibleChapter();
  const { book, chapter, version, data, loading, error, scrollRef, targetVerse, prev, next } = ch;
  const { studyNotes } = useStudyNotes();
  const entries = useJournalStore((s) => s.entries);
  const openAsk = useFloatWindowsStore((s) => s.openAsk);

  const mode = useReadingStore((s) => s.mode);
  const layout = useReadingStore((s) => s.layout);
  const parallel = useReadingStore((s) => s.parallel);
  const readMap = useReadingStore((s) => s.read);
  const { setMode, setLayout, setParallel, markRead, visit } = useReadingStore.getState();

  const font = useWritingStore((s) => s.readFont);
  const size = useWritingStore((s) => s.readSize);
  const width = useWritingStore((s) => s.width);

  const { source: commentaryId, setSource: setCommentaryId } = useCommentaryStore();
  const study = mode === "study";
  const { data: commentary, error: commentaryError } = useCommentary(book, chapter, commentaryId, study);

  const wide = useMedia("(min-width: 1280px)");
  const phone = useMedia("(max-width: 767px)");

  const [sel, setSel] = useState<Sel | null>(null);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [bar, setBar] = useState<{ top: number; left: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [picker, setPicker] = useState(false);
  const [notesFor, setNotesFor] = useState<number | null | undefined>(undefined); // undefined = drawer closed
  const [studyTab, setStudyTab] = useState<StudyTab>("commentary");
  const [about, setAbout] = useState(false);
  const [notebook, setNotebook] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [parallelData, setParallelData] = useState<Verse[] | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // ?mode=study (old /study links)
  useEffect(() => {
    const m = params.get("mode");
    if (m === "study" || m === "read") setMode(m);
  }, [params, setMode]);

  // /bible with no passage in the URL resumes where you left off.
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    const last = useReadingStore.getState().last;
    if (!params.get("book") && last && (last.book !== book || last.chapter !== chapter)) ch.navigate({ book: last.book, chapter: last.chapter });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Remember where you are.
  useEffect(() => {
    if (data && data.book === book && data.chapter === chapter) visit(book, chapter);
  }, [data, book, chapter, visit]);

  // New chapter: clear selection, or select a deep-linked verse.
  useEffect(() => {
    setSel(targetVerse ? { from: targetVerse, to: targetVerse } : null);
    setAnchor(targetVerse ?? null);
    setCurrentVerse(null);
  }, [book, chapter, targetVerse]);

  // Second translation for parallel reading.
  useEffect(() => {
    if (!parallel) { setParallelData(null); return; }
    const hit = getCachedChapter(parallel, book, chapter);
    if (hit) { setParallelData(hit.verses); return; }
    let alive = true;
    setParallelData(null);
    fetchChapter(parallel, book, chapter).then((c) => { if (alive) setParallelData(c.verses); }).catch(() => { if (alive) setParallelData([]); });
    return () => { alive = false; };
  }, [parallel, book, chapter]);

  const verses = useMemo(() => data?.verses ?? [], [data]);
  const verseText = useMemo(() => new Map(verses.map((v) => [v.n, v.text])), [verses]);
  const chapterNotes = useMemo(
    () => studyNotes.filter((n) => n.scripture.book === book && n.scripture.chapter === chapter),
    [studyNotes, book, chapter],
  );
  const highlightOf = useMemo(() => {
    const m = new Map<number, StudyNote>();
    for (const n of chapterNotes) if (n.kind === "highlight") m.set(n.scripture.verse, n);
    return m;
  }, [chapterNotes]);
  const notedVerses = useMemo(() => new Set(chapterNotes.filter((n) => n.kind !== "highlight").map((n) => n.scripture.verse)), [chapterNotes]);

  const selLabel = sel ? rangeLabel(book, chapter, sel.from, sel.to) : "";
  const selVerses = useMemo(() => (sel ? verses.filter((v) => v.n >= sel.from && v.n <= sel.to) : []), [sel, verses]);
  const selText = selVerses.map((v) => v.text).join(" ");
  const selColor = sel && selVerses.every((v) => highlightOf.get(v.n)?.color === highlightOf.get(sel.from)?.color)
    ? highlightOf.get(sel.from)?.color ?? null : null;

  // ── Actions ──

  const clear = useCallback(() => { setSel(null); setAnchor(null); }, []);

  const colorSelection = useCallback(async (colorId: string) => {
    if (!user || !sel) return;
    const removing = selVerses.every((v) => highlightOf.get(v.n)?.color === colorId);
    await Promise.all(selVerses.map((v) => {
      const h = highlightOf.get(v.n);
      if (removing) return h ? deleteStudyNote(user.uid, h.id) : null;
      if (h) return h.color === colorId ? null : updateStudyNote(user.uid, h.id, { color: colorId });
      return createStudyNote(user.uid, { scripture: { book, chapter, verse: v.n, version }, kind: "highlight", color: colorId });
    }));
  }, [user, sel, selVerses, highlightOf, book, chapter, version]);

  const openNotes = useCallback((verse: number | null) => {
    if (study && wide) { setStudyTab("notes"); setNotesFor(undefined); setAnchor(verse); }
    else setNotesFor(verse);
  }, [study, wide]);

  const reflect = useCallback(async () => {
    if (!user) return;
    // The selection, or else everything you highlighted in this chapter.
    const groups: { from: number; to: number }[] = [];
    if (sel) groups.push(sel);
    else {
      for (const v of verses) {
        if (!highlightOf.has(v.n)) continue;
        const g = groups[groups.length - 1];
        if (g && g.to === v.n - 1) g.to = v.n; else groups.push({ from: v.n, to: v.n });
      }
    }
    const blocks = groups.map((g) => ({
      type: "scriptureBlock",
      attrs: { reference: rangeLabel(book, chapter, g.from, g.to), version },
      content: [{ type: "text", text: verses.filter((v) => v.n >= g.from && v.n <= g.to).map((v) => v.text).join(" ") }],
    }));
    const title = sel ? `On ${rangeLabel(book, chapter, sel.from, sel.to)}` : `Reflections on ${book} ${chapter}`;
    const id = await createEntry(user.uid, {
      title,
      content: JSON.stringify({ type: "doc", content: [...blocks, { type: "paragraph" }] }),
      scriptures: groups.map((g) => ({ book, chapter, verse: g.from, ...(g.to > g.from ? { endVerse: g.to } : {}), version })),
    });
    router.push(`/journal?entry=${id}`);
  }, [user, sel, verses, highlightOf, book, chapter, version, router]);

  const compare = useCallback(() => {
    setParallel(parallel ?? (version === "KJV" ? "ESV" : "KJV"));
  }, [parallel, version, setParallel]);

  const ask = useCallback(() => {
    if (!sel) return;
    openAsk(`Help me understand ${selLabel} (${version}): "${selText.slice(0, 600)}"`);
  }, [sel, selLabel, selText, version, openAsk]);

  const copy = useCallback(() => {
    if (!sel) return;
    void navigator.clipboard?.writeText(`“${selText}” — ${selLabel} (${version})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }, [sel, selText, selLabel, version]);

  const go = useCallback((b: string, c: number, v?: number) => { setPicker(false); ch.navigate({ book: b, chapter: c }, v); }, [ch]);

  // ── Selecting verses: click, shift-click, or drag across text ──

  function verseFrom(node: Node | null): number | null {
    const el = (node instanceof Element ? node : node?.parentElement)?.closest("[data-verse]") as HTMLElement | null;
    return el ? Number(el.dataset.verse) : null;
  }

  function onArticleClick(e: React.MouseEvent) {
    const s = window.getSelection();
    if (s && !s.isCollapsed) return; // handled on mouseup
    const n = verseFrom(e.target as Node);
    if (n == null) return;
    if (e.shiftKey && anchor != null) {
      setSel({ from: Math.min(anchor, n), to: Math.max(anchor, n) });
      return;
    }
    if (sel && sel.from === n && sel.to === n) { clear(); return; }
    setSel({ from: n, to: n });
    setAnchor(n);
  }

  function onArticleMouseUp() {
    const s = window.getSelection();
    if (!s || s.isCollapsed || !articleRef.current?.contains(s.anchorNode)) return;
    const a = verseFrom(s.anchorNode), b = verseFrom(s.focusNode);
    if (a == null || b == null) return;
    setSel({ from: Math.min(a, b), to: Math.max(a, b) });
    setAnchor(Math.min(a, b));
    s.removeAllRanges();
  }

  // Position the action bar just above the first selected verse.
  useLayoutEffect(() => {
    if (!sel || phone || !articleRef.current) { setBar(null); return; }
    const el = articleRef.current.querySelector(`[data-verse="${sel.from}"]`) as HTMLElement | null;
    if (!el) { setBar(null); return; }
    const box = articleRef.current.getBoundingClientRect();
    const r = el.getClientRects()[0] ?? el.getBoundingClientRect();
    const maxLeft = Math.max(0, box.width - 600);
    setBar({ top: r.top - box.top - 52, left: Math.min(Math.max(0, r.left - box.left - 8), maxLeft) });
  }, [sel, phone, layout, parallel, parallelData, size, font, width, data, study, commentary]);

  // ── Which verse is being read (drives the study margin) ──
  useEffect(() => {
    if (!study || !wide || !data) return;
    const root = scrollRef.current;
    if (!root) return;
    const visible = new Set<number>();
    const io = new IntersectionObserver((list) => {
      for (const en of list) {
        const n = Number((en.target as HTMLElement).dataset.verse);
        if (en.isIntersecting) visible.add(n); else visible.delete(n);
      }
      if (visible.size) setCurrentVerse(Math.min(...visible));
    }, { root, rootMargin: "-15% 0px -55% 0px" });
    articleRef.current?.querySelectorAll("[data-verse]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [study, wide, data, layout, parallel, parallelData, scrollRef]);

  // ── Finished the chapter ──
  useEffect(() => {
    const el = endRef.current;
    const root = scrollRef.current;
    if (!el || !root || !data) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) markRead(book, chapter); }, { root, threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [data, book, chapter, markRead, scrollRef]);

  // ── Keyboard ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || e.defaultPrevented) return;
      if (picker || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (gSequencePending()) return;
      const k = e.key.toLowerCase();
      if (e.key === "ArrowLeft" && prev) { e.preventDefault(); go(prev.book, prev.chapter); return; }
      if (e.key === "ArrowRight" && next) { e.preventDefault(); go(next.book, next.chapter); return; }
      if (k === "j") { e.preventDefault(); setPicker(true); return; }
      if (e.key === "Escape" && sel) { e.preventDefault(); clear(); return; }
      if (k === "r") { e.preventDefault(); void reflect(); return; }
      if (!sel) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < STUDY_COLORS.length) { e.preventDefault(); void colorSelection(STUDY_COLORS[idx].id); return; }
      if (k === "n") { e.preventDefault(); openNotes(sel.from); return; }
      if (k === "c") { e.preventDefault(); copy(); return; }
      if (k === "a") { e.preventDefault(); ask(); return; }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picker, prev, next, go, sel, clear, reflect, colorSelection, openNotes, copy, ask]);

  // ── Rendering helpers ──

  const commentaryStarts = useMemo(() => {
    const m = new Map<number, CommentaryEntry[]>();
    if (study && !wide && commentary) for (const e of commentary.entries) m.set(e.verse, [...(m.get(e.verse) ?? []), e]);
    return m;
  }, [study, wide, commentary]);

  const paragraphs = useMemo(
    () => (layout === "verses" ? verses.map((v) => [v]) : toParagraphs(verses, new Set(commentaryStarts.keys()))),
    [verses, layout, commentaryStarts],
  );

  function verseSpan(v: Verse) {
    const selected = !!sel && v.n >= sel.from && v.n <= sel.to;
    const h = highlightOf.get(v.n);
    return (
      <span key={v.n}>
        <span
          id={`verse-${v.n}`}
          data-verse={v.n}
          className="bj-verse"
          data-selected={selected || undefined}
          style={h ? { ["--hl" as string]: studyColorHex(h.color) } : undefined}
          data-hl={h ? "" : undefined}
        >
          <sup className="bj-vnum" aria-label={`verse ${v.n}`}>{v.n}</sup>{v.text}
        </span>
        {notedVerses.has(v.n) && (
          <button type="button" className="bj-vnote" aria-label={`Notes on verse ${v.n}`} title="Your notes"
            onClick={(e) => { e.stopPropagation(); openNotes(v.n); }} />
        )}{" "}
      </span>
    );
  }

  const handlers: VerseActionHandlers = {
    label: selLabel, activeColor: selColor, copied,
    onColor: (id) => void colorSelection(id), onNote: () => sel && openNotes(sel.from), onReflect: () => void reflect(),
    onCompare: compare, onAsk: ask, onCopy: copy, onClear: clear,
  };

  const readMins = Math.max(1, Math.round(verses.reduce((n, v) => n + v.text.split(" ").length, 0) / 230));
  const hlCount = highlightOf.size;
  const noteCount = chapterNotes.length - hlCount;
  const isRead = !!readMap[chapterKey(book, chapter)];
  const textStyle = readingFontStyle(font, phone ? Math.min(size, 21) : size);
  const showRail = wide && !parallel;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bj-bg)" }}>
      {/* ── Header ── */}
      <header className="flex items-center gap-1 px-2 md:px-5 shrink-0 border-b" style={{ height: 52, borderColor: "var(--bj-line-soft)" }}>
        <button type="button" onClick={() => prev && go(prev.book, prev.chapter)} disabled={!prev} aria-label="Previous chapter" title="Previous chapter (←)"
          className="bj-btn-icon w-8 h-8 rounded-lg hidden md:flex items-center justify-center disabled:opacity-30" style={{ color: "var(--bj-ink3)" }}>
          <ChevronLeft size={17} />
        </button>
        <button type="button" onClick={() => setPicker(true)} aria-label={`${book} ${chapter} — go to passage`} title="Go to passage (J)"
          className="bj-btn-ghost flex items-center gap-2 h-9 pl-3 pr-2 rounded-xl min-w-0"
          style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
          <span className="font-display text-[19px] font-medium truncate whitespace-nowrap" style={{ color: "var(--bj-ink)" }}>{phone ? shortBook(book) : book} {chapter}</span>
          {isRead && <Check size={13} className="shrink-0" style={{ color: "var(--bj-sage)" }} aria-label="read" />}
          <ChevronDown size={13} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
          <kbd className="bj-kbd hidden md:inline-flex">J</kbd>
        </button>
        <button type="button" onClick={() => next && go(next.book, next.chapter)} disabled={!next} aria-label="Next chapter" title="Next chapter (→)"
          className="bj-btn-icon w-8 h-8 rounded-lg hidden md:flex items-center justify-center disabled:opacity-30" style={{ color: "var(--bj-ink3)" }}>
          <ChevronRight size={17} />
        </button>
        <div className="flex-1" />
        <div className="flex gap-0.5 p-0.5 rounded-[10px] mr-1" role="tablist" aria-label="Reader mode" style={{ background: "var(--bj-bg-soft)" }}>
          {(["read", "study"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
              className="h-7 px-2.5 md:px-3 rounded-lg font-sans text-[12.5px] capitalize"
              style={{ background: mode === m ? "var(--bj-line)" : "transparent", color: mode === m ? "var(--bj-ink)" : "var(--bj-ink3)", fontWeight: mode === m ? 500 : 400 }}>
              {m}
            </button>
          ))}
        </div>
        {study && (
          <button type="button" onClick={() => setNotebook(true)} aria-label="Notebook — all your notes" title="Notebook"
            className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center mr-0.5" style={{ color: "var(--bj-ink3)" }}>
            <NotebookText size={15} />
          </button>
        )}
        <VersionMenu value={version} onChange={ch.setVersion} compact={phone} exclude={parallel ?? undefined} />
        <button type="button" onClick={() => setParallel(parallel ? null : version === "KJV" ? "ESV" : "KJV")} aria-pressed={!!parallel}
          aria-label="Parallel translations" title="Parallel translations"
          className="hidden md:flex bj-btn-icon w-8 h-8 rounded-lg items-center justify-center"
          style={{ color: parallel ? "var(--bj-gold-deep)" : "var(--bj-ink3)", background: parallel ? "var(--bj-gold-tint)" : "transparent" }}>
          <Columns2 size={15} />
        </button>
        <button type="button" onClick={() => setLayout(layout === "paragraphs" ? "verses" : "paragraphs")}
          aria-label={layout === "paragraphs" ? "Show one verse per line" : "Show paragraphs"} title={layout === "paragraphs" ? "Verse per line" : "Paragraphs"}
          className="hidden md:flex bj-btn-icon w-8 h-8 rounded-lg items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
          {layout === "paragraphs" ? <List size={15} /> : <AlignLeft size={15} />}
        </button>
        <WritingSettingsButton role="read" />
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Text ── */}
        <div ref={scrollRef} className="flex-1 min-w-0 overflow-y-auto" onScroll={() => bar && phone && clear()}>
          {loading && !data ? (
            <div className="mx-auto px-6 pt-14" style={{ maxWidth: WIDTHS[width] + 80 }}>
              <div className="h-4 w-40 rounded mb-3 animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
              <div className="h-12 w-56 rounded mb-10 animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
              {[92, 100, 96, 70, 100, 88].map((w, i) => <div key={i} className="h-5 rounded mb-4 animate-pulse" style={{ width: `${w}%`, background: "var(--bj-bg-soft)" }} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 px-6 text-center">
              <p className="font-display italic text-xl" style={{ color: "var(--bj-ink3)" }}>{error}</p>
              <button type="button" onClick={() => ch.fetchChapter(version, book, chapter)} className="bj-btn-ghost font-sans text-sm px-3 h-8 rounded-lg" style={{ color: "var(--bj-ink2)", border: "1px solid var(--bj-line)" }}>Try again</button>
            </div>
          ) : (
            <div
              className="mx-auto px-5 md:px-10 pt-8 md:pt-12"
              style={{ maxWidth: parallel ? 1180 : WIDTHS[width] + 80, paddingBottom: phone && sel ? 260 : 120 }}
            >
              {/* Chapter heading */}
              <p className="font-sans text-[12px] mb-1" style={{ color: "var(--bj-ink4)" }}>{book}</p>
              <h1 className="font-display mb-1.5" style={{ fontSize: "clamp(2.2rem, 4.5vw, 2.9rem)", fontWeight: 500, color: "var(--bj-ink)", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
                Chapter {chapter}
              </h1>
              <p className="font-sans text-[12.5px] mb-8" style={{ color: "var(--bj-ink4)" }}>
                {verses.length} verses · {readMins} min
                {(hlCount > 0 || noteCount > 0) && (
                  <span style={{ color: "var(--bj-sage)" }}>
                    {" · "}{[hlCount && `${hlCount} highlight${hlCount === 1 ? "" : "s"}`, noteCount > 0 && `${noteCount} note${noteCount === 1 ? "" : "s"}`].filter(Boolean).join(", ")}
                  </span>
                )}
                {phone ? null : <span className="hidden lg:inline"> · tap a verse to highlight, note or reflect</span>}
              </p>

              <div
                ref={articleRef}
                className={`bj-reader relative ${layout === "verses" ? "bj-reader-verses" : ""}`}
                style={textStyle}
                onClick={onArticleClick}
                onMouseUp={onArticleMouseUp}
              >
                <AnimatePresence>{bar && sel && <VerseActionBar key={`${sel.from}-${sel.to}`} h={handlers} top={bar.top} left={bar.left} />}</AnimatePresence>

                {parallel ? (
                  <div role="table" aria-label={`${version} and ${parallel}`}>
                    <div role="row" className="grid gap-6 md:gap-8 pb-3 mb-2 border-b font-sans text-[12.5px]"
                      style={{ gridTemplateColumns: phone ? "22px 1fr" : "28px 1fr 1fr", borderColor: "var(--bj-line-soft)", fontFamily: "var(--bj-ui, var(--font-inter)), system-ui" }}>
                      <span />
                      <span className={phone ? "hidden" : "font-medium"} style={{ color: "var(--bj-ink)" }}>{VERSION_NAMES[version] ?? version}</span>
                      <span className="flex items-center gap-2">
                        {phone && <span className="font-medium" style={{ color: "var(--bj-ink)" }}>{version} with</span>}
                        <VersionMenu value={parallel} onChange={setParallel} exclude={version} compact />
                        <button type="button" onClick={() => setParallel(null)} aria-label="Close parallel view" className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center ml-auto" style={{ color: "var(--bj-ink4)" }}><X size={14} /></button>
                      </span>
                    </div>
                    {verses.map((v) => {
                      const selected = !!sel && v.n >= sel.from && v.n <= sel.to;
                      const h = highlightOf.get(v.n);
                      const other = parallelData?.find((p) => p.n === v.n);
                      return (
                        <div key={v.n} role="row" id={`verse-${v.n}`} data-verse={v.n} data-selected={selected || undefined}
                          className="bj-prow grid gap-6 md:gap-8 px-2 py-2.5 -mx-2 rounded-xl"
                          style={{ gridTemplateColumns: phone ? "22px 1fr" : "28px 1fr 1fr", ...(h ? { ["--hl" as string]: studyColorHex(h.color) } : {}) }} data-hl={h ? "" : undefined}>
                          <span className="bj-vnum-col">{v.n}</span>
                          <p style={{ margin: 0 }}>{v.text}</p>
                          <p style={{ margin: 0, color: "var(--bj-ink3)", ...(phone ? { gridColumn: 2, marginTop: -14, fontSize: "0.92em" } : {}) }}>{parallelData ? (other?.text ?? "—") : <span className="block h-5 w-3/4 rounded animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  paragraphs.map((p) => (
                    <div key={p[0].n}>
                      {(commentaryStarts.get(p[0].n) ?? []).map((entry) => (
                        <InlineCommentary key={`${commentaryId}-${entry.verse}-${entry.endVerse}`} entry={entry} sourceId={commentaryId} onAbout={() => setAbout(true)} book={book} chapter={chapter} />
                      ))}
                      <p className="bj-para">{p.map(verseSpan)}</p>
                    </div>
                  ))
                )}
              </div>

              {/* ── End of chapter ── */}
              {verses.length > 0 && (
                <div ref={endRef} className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)", maxWidth: WIDTHS[width] }}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: isRead ? "color-mix(in oklch, var(--bj-sage) 18%, transparent)" : "var(--bj-bg-soft)" }}>
                      <Check size={16} style={{ color: isRead ? "var(--bj-sage)" : "var(--bj-ink4)" }} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-sans text-[15px] font-medium" style={{ color: "var(--bj-ink)" }}>{book} {chapter}{isRead ? " · read" : ""}</p>
                      <p className="font-sans text-[12.5px]" style={{ color: "var(--bj-ink4)" }}>
                        {readMins} min{hlCount ? ` · ${hlCount} highlight${hlCount === 1 ? "" : "s"}` : ""}{noteCount > 0 ? ` · ${noteCount} note${noteCount === 1 ? "" : "s"}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-3 mt-4">
                    <button type="button" onClick={() => void reflect()}
                      className="bj-btn-ghost text-left rounded-xl p-4" style={{ background: "var(--bj-gold-tint)", boxShadow: "inset 0 0 0 1px color-mix(in oklch, var(--bj-gold-soft) 60%, transparent)" }}>
                      <span className="flex items-center gap-2 font-sans text-[14px] font-semibold" style={{ color: "var(--bj-gold-deep)" }}>
                        <NotebookPen size={15} /> Reflect on {book} {chapter} <kbd className="bj-kbd hidden md:inline-flex">R</kbd>
                      </span>
                      <span className="block font-sans text-[12.5px] mt-1.5 leading-relaxed" style={{ color: "var(--bj-ink3)" }}>
                        {hlCount ? "Opens a new journal entry with your highlighted verses already quoted." : "Opens a new journal entry about this chapter."}
                      </span>
                    </button>
                    {next && (
                      <button type="button" onClick={() => go(next.book, next.chapter)} className="bj-btn-ghost text-left rounded-xl p-4" style={{ border: "1px solid var(--bj-line)" }}>
                        <span className="flex items-center gap-2 font-sans text-[14px] font-semibold" style={{ color: "var(--bj-ink)" }}>
                          {next.book} {next.chapter} <ChevronRight size={15} style={{ color: "var(--bj-ink3)" }} />
                          <kbd className="bj-kbd ml-auto hidden md:inline-flex">→</kbd>
                        </span>
                        <span className="block font-sans text-[12.5px] mt-1.5" style={{ color: "var(--bj-ink3)" }}>Continue reading</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Margin ── */}
        {showRail && user && (
          <aside aria-label={study ? "Study margin" : "Margin"} className="shrink-0 border-l overflow-y-auto"
            style={{ width: study ? 400 : 320, borderColor: "var(--bj-line-soft)" }}>
            {study ? (
              <StudyMargin
                tab={studyTab} onTab={setStudyTab} uid={user.uid} book={book} chapter={chapter} version={version}
                notes={chapterNotes} selectedVerse={anchor}
                onSelectVerse={(n) => { setAnchor(n); setSel(n ? { from: n, to: n } : null); }}
                commentary={commentary} commentaryError={commentaryError} source={commentaryId} onSource={setCommentaryId}
                currentVerse={currentVerse}
                onVerse={(n) => document.getElementById(`verse-${n}`)?.scrollIntoView({ block: "center", behavior: "smooth" })}
                onAbout={() => setAbout(true)}
                verses={verseText}
              />
            ) : (
              <ReadMargin book={book} chapter={chapter} verses={verseText} notes={chapterNotes} entries={entries}
                onVerse={(n, open) => {
                  document.getElementById(`verse-${n}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
                  setSel({ from: n, to: n }); setAnchor(n);
                  if (open) openNotes(n);
                }} />
            )}
          </aside>
        )}
      </div>

      {/* ── Notes drawer (when there's no study margin) ── */}
      <AnimatePresence>
        {notesFor !== undefined && user && (
          <>
            <motion.div key="nd-bd" className="fixed inset-0 z-[70]" style={{ background: "rgba(0,0,0,0.35)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              onClick={() => setNotesFor(undefined)} />
            <motion.div key="nd" role="dialog" aria-modal="true" aria-label={`Notes on ${book} ${chapter}`}
              className="fixed z-[71] flex flex-col right-0 bottom-0 left-0 h-[78dvh] rounded-t-[20px] md:left-auto md:top-0 md:h-auto md:w-[400px] md:rounded-none"
              style={{ background: "var(--bj-bg-panel)", borderLeft: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)", paddingBottom: "env(safe-area-inset-bottom)" }}
              initial={phone ? { y: "100%" } : { x: "100%" }} animate={phone ? { y: 0 } : { x: 0 }} exit={phone ? { y: "100%" } : { x: "100%" }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.28 }}>
              <AnnotationPanel uid={user.uid} book={book} chapter={chapter} version={version}
                selectedVerse={notesFor} verseText={notesFor != null ? verseText.get(notesFor) : undefined}
                notes={chapterNotes} onSelectVerse={(n) => setNotesFor(n)} onClose={() => setNotesFor(undefined)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Notebook: every note across the Bible ── */}
      <AnimatePresence>
        {notebook && (
          <>
            <motion.div key="nb-bd" className="fixed inset-0 z-[70]" style={{ background: "rgba(0,0,0,0.35)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              onClick={() => setNotebook(false)} />
            <motion.div key="nb" role="dialog" aria-modal="true" aria-label="Notebook"
              className="fixed z-[71] flex flex-col right-0 bottom-0 left-0 h-[85dvh] rounded-t-[20px] md:left-auto md:top-0 md:h-auto md:w-[480px] md:rounded-none"
              style={{ background: "var(--bj-bg)", borderLeft: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)", paddingBottom: "env(safe-area-inset-bottom)" }}
              initial={phone ? { y: "100%" } : { x: "100%" }} animate={phone ? { y: 0 } : { x: 0 }} exit={phone ? { y: "100%" } : { x: "100%" }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.28 }}>
              <div className="flex items-center px-4 shrink-0 border-b" style={{ height: 52, borderColor: "var(--bj-line-soft)" }}>
                <p className="font-display text-[18px]" style={{ color: "var(--bj-ink)" }}>Notebook</p>
                <button type="button" onClick={() => setNotebook(false)} aria-label="Close" className="bj-btn-icon ml-auto w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}><X size={15} /></button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <StudyNotebook studyNotes={studyNotes} onJump={(s) => { setNotebook(false); go(s.book, s.chapter, s.verse); }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Phone: verse sheet ── */}
      <AnimatePresence>{phone && sel && notesFor === undefined && <VerseSheet key="sheet" h={handlers} />}</AnimatePresence>

      {picker && <JumpPicker book={book} chapter={chapter} version={version} onGo={go} onClose={() => setPicker(false)} />}
      <CommentaryAboutModal open={about} onClose={() => setAbout(false)} />
    </div>
  );
}
