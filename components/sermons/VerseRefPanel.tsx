"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, BookOpen, Hash, ChevronLeft, ChevronRight, Maximize2, Copy, Check } from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";
import { useBibleStore } from "@/store/bible.store";
import { fontPairs } from "@/lib/fonts";
import type { FontPairId } from "@/lib/fonts";
import type { SermonRef } from "@/types";

const REF_FONT_KEY = "bj-ref-font";
const REF_SIZE_KEY = "bj-ref-size";
const REF_SIZES = [
  { label: "S", value: 13 },
  { label: "M", value: 15 },
  { label: "L", value: 18 },
  { label: "XL", value: 22 },
];

const VERSIONS = ["ESV", "KJV", "NIV", "AMP", "MSG", "ASV", "NKJV", "NLT"];

// ── Suggestion types & helpers (mirrors QuickRefInput) ────

type BookSug    = { type: "book";    book: string; label: string };
type ChapterSug = { type: "chapter"; book: string; chapter: number; label: string };
type VerseSug   = { type: "verse";   book: string; chapter: number; verse: number; verseEnd?: number; label: string };
type Suggestion = BookSug | ChapterSug | VerseSug;

function matchBooks(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const numMatch = q.match(/^(\d)\s*(.*)$/);
  let results: string[];
  if (numMatch) {
    const num = numMatch[1];
    const rest = numMatch[2].trim();
    results = PROTESTANT_BOOKS.filter((b) => {
      const bl = b.toLowerCase();
      return bl.startsWith(`${num} `) && (!rest || bl.slice(2).startsWith(rest));
    });
  } else {
    const byPrefix = PROTESTANT_BOOKS.filter((b) => b.toLowerCase().startsWith(q));
    const byWordPart = PROTESTANT_BOOKS.filter((b) => {
      const bl = b.toLowerCase();
      if (!/^\d /.test(bl)) return false;
      return bl.replace(/^\d+ /, "").startsWith(q);
    });
    results = [...new Set([...byPrefix, ...byWordPart])];
  }
  return results.slice(0, 6);
}

function getSuggestions(input: string): Suggestion[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  if (trimmed.includes(":")) {
    const parsed = parseRef(trimmed);
    if (parsed?.verse !== undefined) {
      const label = parsed.verseEnd
        ? `${parsed.book} ${parsed.chapter}:${parsed.verse}-${parsed.verseEnd}`
        : `${parsed.book} ${parsed.chapter}:${parsed.verse}`;
      return [{
        type: "verse",
        book: parsed.book, chapter: parsed.chapter, verse: parsed.verse,
        verseEnd: parsed.verseEnd,
        label,
      }];
    }
    return [];
  }

  const parsed = parseRef(trimmed);
  if (parsed) {
    const totalCh = CHAPTER_COUNTS[parsed.book] ?? 1;
    const ch = Math.min(parsed.chapter, totalCh);
    return [ch - 1, ch, ch + 1]
      .filter((c) => c >= 1 && c <= totalCh)
      .map((c) => ({ type: "chapter" as const, book: parsed.book, chapter: c, label: `${parsed.book} ${c}` }));
  }

  if (input.endsWith(" ")) {
    const book = PROTESTANT_BOOKS.find((b) => b.toLowerCase() === trimmed.toLowerCase());
    if (book) {
      const total = CHAPTER_COUNTS[book] ?? 1;
      return Array.from({ length: Math.min(total, 8) }, (_, i) => ({
        type: "chapter" as const, book, chapter: i + 1, label: `${book} ${i + 1}`,
      }));
    }
  }

  return matchBooks(trimmed).map((b) => ({ type: "book" as const, book: b, label: b }));
}

// ── Preview state ─────────────────────────────────────────

interface PreviewVerse {
  ref: string;
  text: string;
  book: string;
  chapter: number;
  verse?: number;
  verseEnd?: number;
  version: string;
}

// ── Props ─────────────────────────────────────────────────

interface Props {
  refs: SermonRef[];
  onAdd: (ref: SermonRef) => Promise<void>;
  onUpdateNote: (id: string, note: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

// ── Main component ────────────────────────────────────────

export function VerseRefPanel({ refs, onAdd, onUpdateNote, onRemove }: Props) {
  const { version, setVersion } = useBibleStore();
  const [value, setValue]           = useState("");
  const [open, setOpen]             = useState(false);
  const [selected, setSelected]     = useState(0);
  const [preview, setPreview]       = useState<PreviewVerse | null>(null);
  const [fetching, setFetching]     = useState(false);
  const [adding, setAdding]         = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = getSuggestions(value);
  const sortedRefs = [...refs].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  const [refFontId, setRefFontId] = useState<FontPairId>(() =>
    typeof window !== "undefined" ? (localStorage.getItem(REF_FONT_KEY) as FontPairId) ?? "classic" : "classic"
  );
  const [refFontSize, setRefFontSize] = useState<number>(() =>
    typeof window !== "undefined" ? Number(localStorage.getItem(REF_SIZE_KEY)) || 15 : 15
  );

  function chooseRefFont(id: FontPairId) {
    setRefFontId(id);
    localStorage.setItem(REF_FONT_KEY, id);
  }
  function chooseRefSize(size: number) {
    setRefFontSize(size);
    localStorage.setItem(REF_SIZE_KEY, String(size));
  }

  const refFontPair = fontPairs.find((f) => f.id === refFontId) ?? fontPairs[0];

  // Sync dropdown open state
  useEffect(() => {
    setSelected(0);
    setOpen(suggestions.length > 0 && value.trim().length > 0);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch preview when version changes
  useEffect(() => {
    setPreview(null);
  }, [version]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch verse preview when value resolves to a valid ref
  useEffect(() => {
    const parsed = parseRef(value);
    if (!parsed) { setPreview(null); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `/api/bible/${version}/${encodeURIComponent(parsed.book)}/${parsed.chapter}`
        );
        if (!res.ok) { setPreview(null); return; }
        const data = await res.json();
        let text: string;
        let refLabel: string;

        if (parsed.verse !== undefined) {
          if (parsed.verseEnd !== undefined) {
            // Range: collect verses and embed verse-number markers [N]
            const rangeVerses: { n: number; text: string }[] = (data.verses ?? [])
              .filter((v: { n: number }) => v.n >= parsed.verse! && v.n <= parsed.verseEnd!);
            if (!rangeVerses.length) { setPreview(null); return; }
            text = rangeVerses.map((v) => `[${v.n}] ${v.text}`).join(" ");
            refLabel = `${parsed.book} ${parsed.chapter}:${parsed.verse}-${parsed.verseEnd}`;
          } else {
            const verse = data.verses?.find((v: { n: number }) => v.n === parsed.verse);
            if (!verse) { setPreview(null); return; }
            text = verse.text;
            refLabel = `${parsed.book} ${parsed.chapter}:${parsed.verse}`;
          }
        } else {
          const verse = data.verses?.[0];
          if (!verse) { setPreview(null); return; }
          text = verse.text;
          refLabel = `${parsed.book} ${parsed.chapter}`;
        }

        setPreview({
          ref: refLabel, text,
          book: parsed.book, chapter: parsed.chapter,
          verse: parsed.verse, verseEnd: parsed.verseEnd,
          version,
        });
      } finally {
        setFetching(false);
      }
    }, 400);
  }, [value]);

  function commit(sug: Suggestion) {
    if (sug.type === "book") {
      setValue(sug.book + " ");
      inputRef.current?.focus();
      return;
    }
    // Chapter or verse — fill input and let the fetch effect run
    setValue(sug.label);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setValue(""); setOpen(false); setPreview(null);
      inputRef.current?.blur();
      return;
    }
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(suggestions[selected]);
    }
  }

  async function handleAdd() {
    if (!preview) return;
    setAdding(true);
    const newRef: SermonRef = {
      id: crypto.randomUUID(),
      book: preview.book, chapter: preview.chapter,
      ...(preview.verse !== undefined && { verse: preview.verse }),
      ...(preview.verseEnd !== undefined && { endVerse: preview.verseEnd }),
      text: preview.text, note: "", version: preview.version,
      addedAt: new Date().toISOString(),
    };
    await onAdd(newRef);
    setValue(""); setPreview(null);
    setAdding(false);
  }

  return (
    <>
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={13} style={{ color: "var(--bj-gold)" }} />
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wider flex-1" style={{ color: "var(--bj-ink4)" }}>
            Verse References
          </h3>
          <RefFontPicker
            fontId={refFontId} fontSize={refFontSize}
            onFont={chooseRefFont} onSize={chooseRefSize}
          />
        </div>

        {/* Search with suggestions */}
        <div ref={wrapRef} className="relative">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
          >
            <Search size={11} style={{ color: "var(--bj-ink4)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); setPreview(null); }}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setOpen(false), 160)}
              onFocus={() => {
                if (suggestions.length > 0 && value.trim()) setOpen(true);
              }}
              placeholder="John 3:16, Ps 23…"
              className="flex-1 bg-transparent outline-none font-sans text-xs"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
              autoComplete="off"
              spellCheck={false}
            />
            {value && (
              <button
                onClick={() => { setValue(""); setPreview(null); setOpen(false); }}
                className="bj-btn-icon w-4 h-4 rounded flex items-center justify-center"
                style={{ color: "var(--bj-ink4)" }}
              >
                <X size={9} />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {open && suggestions.length > 0 && (
            <div
              className="absolute left-0 right-0 rounded-xl overflow-hidden"
              style={{
                top: "calc(100% + 4px)",
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line)",
                boxShadow: "0 8px 28px color-mix(in oklch, var(--bj-ink) 16%, transparent)",
                zIndex: 9999,
              }}
            >
              {suggestions.map((sug, i) => {
                const isSelected = i === selected;
                return (
                  <button
                    key={sug.label}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); commit(sug); }}
                    onMouseEnter={() => setSelected(i)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-left"
                    style={{
                      background: isSelected ? "var(--bj-gold-tint)" : "transparent",
                      transition: "background 0.08s ease",
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: isSelected ? "var(--bj-gold)" : "var(--bj-bg-soft)" }}
                    >
                      {sug.type === "book"    && <BookOpen size={9} style={{ color: isSelected ? "white" : "var(--bj-ink3)" }} />}
                      {sug.type === "chapter" && <span style={{ fontSize: 8, fontWeight: 600, color: isSelected ? "white" : "var(--bj-ink3)" }}>{sug.chapter}</span>}
                      {sug.type === "verse"   && <Hash size={9} style={{ color: isSelected ? "white" : "var(--bj-ink3)" }} />}
                    </span>
                    <span
                      className="font-sans text-xs flex-1"
                      style={{
                        color: isSelected ? "var(--bj-gold-deep)" : "var(--bj-ink)",
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {sug.label}
                    </span>
                    <span className="font-sans shrink-0" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>
                      {sug.type === "book" ? `${CHAPTER_COUNTS[sug.book] ?? "?"} ch` : "↵"}
                    </span>
                  </button>
                );
              })}
              <div className="px-3 py-1.5 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
                <p className="font-sans" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>
                  Try{" "}
                  <span style={{ color: "var(--bj-ink3)" }}>John 3:16</span>
                  {" · "}
                  <span style={{ color: "var(--bj-ink3)" }}>Ps 23</span>
                  {" · "}
                  <span style={{ color: "var(--bj-ink3)" }}>1 Cor 13</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Version pills */}
        <div className="flex flex-wrap gap-1 mt-2">
          {VERSIONS.map((v) => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className="font-sans px-2 py-0.5 rounded-md"
              style={{
                fontSize: 10,
                fontWeight: version === v ? 600 : 400,
                background: version === v ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                color: version === v ? "white" : "var(--bj-ink4)",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => { if (version !== v) { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-line)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink)"; } }}
              onMouseLeave={(e) => { if (version !== v) { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink4)"; } }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Verse preview */}
        <AnimatePresence>
          {(fetching || preview) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 px-3 py-2.5 rounded-xl"
                style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}
              >
                {fetching ? (
                  <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>Looking up…</p>
                ) : preview ? (
                  <>
                    <p className="font-sans font-semibold uppercase tracking-wider mb-1" style={{ fontSize: 10, color: "var(--bj-gold-deep)" }}>
                      {preview.ref} · {version}
                    </p>
                    <p className="mb-2" style={{
                      fontFamily: `var(${refFontPair.displayVar})`,
                      fontStyle: refFontId === "dyslexic" ? "normal" : "italic",
                      fontSize: 13, color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.6,
                      display: "-webkit-box", WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      &ldquo;<VerseText text={preview.text} />&rdquo;
                    </p>
                    <button
                      onClick={handleAdd}
                      disabled={adding}
                      className="bj-btn-primary font-sans text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: "var(--bj-gold)", color: "white" }}
                    >
                      <Plus size={10} /> {adding ? "Adding…" : "Add reference"}
                    </button>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reference list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {refs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)", lineHeight: 1.6 }}>
              Search a verse above to add it to your sermon notes
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedRefs.map((ref, i) => (
              <RefCard
                key={ref.id}
                ref_={ref}
                index={i}
                onUpdateNote={onUpdateNote}
                onRemove={onRemove}
                onExpand={() => setExpandedIndex(i)}
                fontId={refFontId}
                fontSize={refFontSize}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>

    <AnimatePresence>
      {expandedIndex !== null && sortedRefs[expandedIndex] && (
        <RefExpandModal
          refs={sortedRefs}
          index={expandedIndex}
          onClose={() => setExpandedIndex(null)}
          onNavigate={setExpandedIndex}
          fontId={refFontId}
          fontSize={refFontSize}
        />
      )}
    </AnimatePresence>
    </>
  );
}

// ── Individual ref card ───────────────────────────────────

interface RefCardProps {
  ref_: SermonRef;
  index: number;
  onUpdateNote: (id: string, note: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onExpand: () => void;
  fontId: FontPairId;
  fontSize: number;
}

function RefCard({ ref_, index, onUpdateNote, onRemove, onExpand, fontId, fontSize }: RefCardProps) {
  const pair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];
  const [note, setNote] = useState(ref_.note);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refLabel = ref_.verse
    ? ref_.endVerse
      ? `${ref_.book} ${ref_.chapter}:${ref_.verse}-${ref_.endVerse}`
      : `${ref_.book} ${ref_.chapter}:${ref_.verse}`
    : `${ref_.book} ${ref_.chapter}`;

  function handleNoteChange(val: string) {
    setNote(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdateNote(ref_.id, val), 1000);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.03, duration: 0.2 }}
      className="rounded-xl p-3"
      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="font-sans font-semibold px-2 py-0.5 rounded-full"
          style={{ fontSize: 10, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
        >
          {refLabel}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onExpand}
            className="bj-btn-action w-5 h-5 rounded flex items-center justify-center"
            style={{ color: "var(--bj-ink4)" }}
            title="Expand"
          >
            <Maximize2 size={9} />
          </button>
          <button
            onClick={() => onRemove(ref_.id)}
            className="bj-btn-action w-5 h-5 rounded flex items-center justify-center"
            data-danger
            style={{ color: "var(--bj-ink4)" }}
            title="Remove"
          >
            <X size={9} />
          </button>
        </div>
      </div>

      <p className="mb-2" style={{
        fontFamily: `var(${pair.displayVar})`,
        fontStyle: fontId === "dyslexic" ? "normal" : "italic",
        fontSize, color: "var(--bj-ink2)", fontWeight: 400, lineHeight: 1.65,
        display: "-webkit-box", WebkitLineClamp: 4,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        &ldquo;<VerseText text={ref_.text} />&rdquo;
      </p>

      <input
        value={note}
        onChange={(e) => handleNoteChange(e.target.value)}
        placeholder="Add a note…"
        className="w-full bg-transparent outline-none font-sans text-xs"
        style={{
          color: "var(--bj-ink2)", caretColor: "var(--bj-gold)",
          borderTop: "1px solid var(--bj-line-soft)", paddingTop: 6,
        }}
      />
    </motion.div>
  );
}

// ── Expanded verse modal ──────────────────────────────────

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RefExpandModalProps {
  refs: SermonRef[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
  fontId: FontPairId;
  fontSize: number;
}

function RefExpandModal({ refs, index, onClose, onNavigate, fontId, fontSize }: RefExpandModalProps) {
  const pair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];
  const ref_ = refs[index];
  const [copied, setCopied] = useState(false);

  const refLabel = ref_.verse
    ? ref_.endVerse
      ? `${ref_.book} ${ref_.chapter}:${ref_.verse}-${ref_.endVerse}`
      : `${ref_.book} ${ref_.chapter}:${ref_.verse}`
    : `${ref_.book} ${ref_.chapter}`;

  useEffect(() => { setCopied(false); }, [index]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index < refs.length - 1) onNavigate(index + 1);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [index, refs.length, onClose, onNavigate]);

  function handleCopy() {
    navigator.clipboard.writeText(`${refLabel} — ${ref_.text}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 12 }}
        transition={{ ease: EASE_OUT, duration: 0.22 }}
        className="relative w-full max-w-lg rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: "var(--bj-bg-panel)",
          border: "1px solid var(--bj-line)",
          boxShadow: "0 24px 80px color-mix(in oklch, var(--bj-ink) 28%, transparent)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-sans font-semibold px-2.5 py-1 rounded-full"
            style={{ fontSize: 11, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
          >
            {refLabel} · {ref_.version}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: copied ? "var(--bj-gold)" : "var(--bj-ink4)" }}
              title="Copy text"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <button
              onClick={onClose}
              className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: "var(--bj-ink4)" }}
              title="Close"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Verse text */}
        <div className="px-1">
          <p style={{
            fontFamily: `var(${pair.displayVar})`,
            fontStyle: fontId === "dyslexic" ? "normal" : "italic",
            fontSize: Math.max(fontSize, 16),
            color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.8,
          }}>
            &ldquo;<VerseText text={ref_.text} />&rdquo;
          </p>
          {ref_.note && (
            <p
              className="font-sans text-sm mt-4 pt-3 border-t"
              style={{ color: "var(--bj-ink3)", borderColor: "var(--bj-line-soft)" }}
            >
              {ref_.note}
            </p>
          )}
        </div>

        {/* Prev / Next */}
        {refs.length > 1 && (
          <div
            className="flex items-center justify-between pt-3 border-t"
            style={{ borderColor: "var(--bj-line-soft)" }}
          >
            <button
              onClick={() => onNavigate(index - 1)}
              disabled={index === 0}
              className="bj-chip flex items-center gap-1.5 font-sans text-xs px-3 py-2 rounded-xl disabled:opacity-30 min-h-[36px]"
              style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
            >
              <ChevronLeft size={12} /> Prev
            </button>
            <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
              {index + 1} of {refs.length}
            </span>
            <button
              onClick={() => onNavigate(index + 1)}
              disabled={index === refs.length - 1}
              className="bj-chip flex items-center gap-1.5 font-sans text-xs px-3 py-2 rounded-xl disabled:opacity-30 min-h-[36px]"
              style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── VerseText — renders [N] verse-number markers as superscripts ──

function VerseText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/);
  if (parts.length <= 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => {
        const num = part.match(/^\[(\d+)\]$/);
        if (num) {
          return (
            <span
              key={i}
              style={{
                fontSize: "0.62em",
                verticalAlign: "super",
                lineHeight: 0,
                color: "var(--bj-gold-deep)",
                fontWeight: 700,
                fontStyle: "normal",
                fontFamily: "var(--bj-ui)",
                marginRight: 2,
                marginLeft: i === 0 ? 0 : 4,
                letterSpacing: 0,
              }}
            >
              {num[1]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── RefFontPicker ─────────────────────────────────────────

function RefFontPicker({ fontId, fontSize, onFont, onSize }: {
  fontId: FontPairId;
  fontSize: number;
  onFont: (id: FontPairId) => void;
  onSize: (s: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activePair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Font & size"
        className="bj-btn-icon h-6 px-1.5 rounded flex items-center gap-1"
        style={{
          fontFamily: `var(${activePair.displayVar})`,
          fontSize: 13,
          fontStyle: fontId === "dyslexic" ? "normal" : "italic",
          background: open ? "var(--bj-gold-tint)" : "transparent",
          color: open ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
        }}
      >
        Aa
      </button>

      {open && (
        <div
          className="absolute right-0 rounded-xl overflow-hidden z-50"
          style={{
            top: "calc(100% + 4px)",
            background: "var(--bj-bg-panel)",
            border: "1px solid var(--bj-line)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
            minWidth: 168,
          }}
        >
          <p className="px-3 pt-2.5 pb-1 font-sans text-[9px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
            Font
          </p>
          {fontPairs.map((pair) => {
            const active = fontId === pair.id;
            return (
              <button
                key={pair.id}
                onClick={() => onFont(pair.id)}
                className="flex items-center gap-2.5 w-full px-3 py-1.5"
                style={{ background: active ? "var(--bj-gold-tint)" : "transparent", transition: "background 0.1s ease" }}
              >
                <span style={{
                  fontFamily: `var(${pair.displayVar})`,
                  fontSize: 16,
                  fontStyle: pair.id === "dyslexic" ? "normal" : "italic",
                  color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
                  lineHeight: 1, width: 24, textAlign: "center", display: "block",
                }}>
                  Aa
                </span>
                <span className="font-sans text-xs flex-1 text-left" style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink)", fontWeight: active ? 500 : 400 }}>
                  {pair.label}
                </span>
                {active && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--bj-gold)" }} />}
              </button>
            );
          })}

          <div className="px-3 py-2.5 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
            <p className="font-sans text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>
              Size
            </p>
            <div className="flex gap-1">
              {REF_SIZES.map((s) => {
                const active = fontSize === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => onSize(s.value)}
                    className="flex-1 py-1 rounded-lg font-sans text-xs font-medium"
                    style={{
                      background: active ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                      color: active ? "white" : "var(--bj-ink3)",
                      border: `1px solid ${active ? "transparent" : "var(--bj-line-soft)"}`,
                      transition: "all 0.12s ease",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
