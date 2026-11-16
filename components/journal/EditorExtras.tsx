"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, Camera, BookOpen, MessageSquare } from "lucide-react";
import type { Editor } from "@tiptap/core";
import { useWritingStore } from "@/store/writing.store";
import { useBibleStore } from "@/store/bible.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { SWITCHES } from "@/lib/typing/keySounds";
import { fetchPassage, type ClientVerse } from "@/lib/bible-client";
import { parseRef, type ParsedRef } from "@/lib/bible-ref-parser";
import { quotePassage } from "@/lib/editor/quote";
import { plural } from "./JournalParts";

// ── Stats bar ──────────────────────────────────────────────

function wordCount(editor: Editor): number {
  const storage = editor.storage as unknown as { characterCount?: { words: () => number } };
  return storage.characterCount?.words() ?? 0;
}

/**
 * Words, reading time, words this session, live typing speed, goal ring.
 * Polls on a light interval rather than re-rendering on every keystroke.
 */
export function WritingStats({ editor, docKey, whisper = false, extra }: {
  editor: Editor;
  docKey: string;
  whisper?: boolean;
  extra?: React.ReactNode;
}) {
  const goal = useWritingStore((s) => s.goal);
  const keySounds = useWritingStore((s) => s.keySounds);
  const switchId = useWritingStore((s) => s.switchId);
  const typewriter = useWritingStore((s) => s.typewriter);
  const [stats, setStats] = useState({ words: 0, session: 0, wpm: 0 });
  const baseline = useRef<number | null>(null);
  const strokes = useRef<number[]>([]);

  // New document → new session baseline (taken once its content has loaded).
  useEffect(() => {
    baseline.current = null;
    strokes.current = [];
    const t = setTimeout(() => { if (!editor.isDestroyed) baseline.current = wordCount(editor); }, 50);
    return () => clearTimeout(t);
  }, [docKey, editor]);

  useEffect(() => {
    const dom = editor.view.dom;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) strokes.current.push(performance.now());
    };
    dom.addEventListener("keydown", onKey);
    const tick = setInterval(() => {
      if (editor.isDestroyed) return;
      const now = performance.now();
      strokes.current = strokes.current.filter((t) => now - t < 30000);
      const s = strokes.current;
      const active = s.length >= 12 && now - s[s.length - 1] < 5000;
      const spanMin = Math.max(10000, now - s[0]) / 60000;
      const wpm = active ? Math.round(s.length / 5 / spanMin) : 0;
      const words = wordCount(editor);
      const session = baseline.current === null ? 0 : Math.max(0, words - baseline.current);
      setStats((p) => (p.words === words && p.session === session && p.wpm === wpm ? p : { words, session, wpm }));
    }, 800);
    return () => { dom.removeEventListener("keydown", onKey); clearInterval(tick); };
  }, [editor]);

  const minutes = Math.max(1, Math.round(stats.words / 230));
  const pct = goal ? Math.min(1, stats.session / goal) : 0;
  const C = 2 * Math.PI * 8;

  const tool = "bj-btn-ghost flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] font-medium";
  const fire = (name: string) => editor.view.dom.dispatchEvent(new CustomEvent(name, { bubbles: true }));

  if (whisper) {
    return (
      <div className="absolute left-0 right-0 bottom-3 flex justify-center pointer-events-none font-sans text-[12px]"
        style={{ color: "var(--bj-ink4)", opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>
        {plural(stats.words, "word")}{stats.session > 0 && <span style={{ color: "var(--bj-sage)" }}>&nbsp;· +{stats.session.toLocaleString()}</span>}
      </div>
    );
  }

  return (
    <div role="toolbar" aria-label="Writing"
      className="bj-glass absolute left-1/2 -translate-x-1/2 bottom-3 md:bottom-4 z-10 flex items-center gap-0.5 p-1 rounded-[14px] font-sans text-[12.5px] whitespace-nowrap max-w-[calc(100%-24px)]"
      style={{ color: "var(--bj-ink3)", fontVariantNumeric: "tabular-nums" }}>
      <span className="px-2.5 flex items-center gap-2" title={`${minutes} min read${stats.wpm ? ` · ${stats.wpm} wpm` : ""}`}>
        {plural(stats.words, "word")}
        {stats.session > 0 && <span className="hidden sm:inline" style={{ color: "var(--bj-sage)" }}>+{stats.session.toLocaleString()}</span>}
        {goal > 0 && (
          <svg width="16" height="16" viewBox="0 0 20 20" role="img" aria-label={`${stats.session} of ${goal} words`}>
            <title>{`${Math.min(stats.session, goal)} / ${goal} words this session`}</title>
            <circle cx="10" cy="10" r="8" fill="none" stroke="var(--bj-line)" strokeWidth="2.5" />
            <circle cx="10" cy="10" r="8" fill="none" stroke={pct >= 1 ? "var(--bj-sage)" : "var(--bj-gold)"} strokeWidth="2.5"
              strokeDasharray={`${pct * C} ${C}`} strokeLinecap="round" transform="rotate(-90 10 10)"
              style={{ transition: "stroke-dasharray 0.4s var(--ease-out)" }} />
          </svg>
        )}
      </span>
      <span className="w-px h-4 mx-0.5" style={{ background: "var(--bj-line)" }} />
      <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => fire("bj:photo-picker")}
        title="Add a photo (⌘⇧P) — or paste / drop one" style={{ color: "var(--bj-gold-deep)" }}>
        <Camera size={14} /><span className="hidden sm:inline">Photo</span>
      </button>
      <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => fire("bj:verse-picker")} title="Quote a verse (/verse)">
        <BookOpen size={14} /><span className="hidden sm:inline">Verse</span>
      </button>
      <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => useFloatWindowsStore.getState().toggleAsk()} title="Ask (⌘⇧A)">
        <MessageSquare size={14} /><span className="hidden sm:inline">Ask</span>
      </button>
      {extra && <span className="px-1.5 flex items-center">{extra}</span>}
      {keySounds && <span className="hidden lg:flex items-center gap-1.5 px-2" style={{ color: "var(--bj-ink4)" }} title="Key sounds"><Keyboard size={13} />{SWITCHES[switchId]?.name}</span>}
      {typewriter && <span className="hidden lg:inline px-2" style={{ color: "var(--bj-ink4)" }}>Typewriter</span>}
    </div>
  );
}

// ── Verse hover card ───────────────────────────────────────

const COMPARE = ["ESV", "KJV", "NIV", "NLT", "NKJV", "AMP"];

export interface RefHover { ref: ParsedRef; label: string; rect: DOMRect; pos: number }

export function VerseHoverCard({ editor, hover, onEnter, onLeave, onDone }: {
  editor: Editor;
  hover: RefHover | null;
  onEnter: () => void;
  onLeave: () => void;
  onDone: () => void;
}) {
  const defaultVersion = useBibleStore((s) => s.version);
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const [version, setVersion] = useState(defaultVersion);
  const [verses, setVerses] = useState<ClientVerse[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setVersion(defaultVersion); }, [hover?.label, defaultVersion]);

  useEffect(() => {
    if (!hover) return;
    let alive = true;
    setFailed(false);
    fetchPassage(version, hover.ref)
      .then((r) => { if (alive) setVerses(r.verses); })
      .catch(() => { if (alive) { setVerses(null); setFailed(true); } });
    return () => { alive = false; };
  }, [hover, version]);

  if (typeof document === "undefined") return null;
  const below = hover ? hover.rect.bottom + 300 < window.innerHeight : true;
  const cardW = Math.min(380, (typeof window !== "undefined" ? window.innerWidth : 400) - 24);
  const left = hover ? Math.max(12, Math.min(hover.rect.left - 16, window.innerWidth - cardW - 12)) : 0;

  return createPortal(
    <AnimatePresence>
      {hover && (
        <motion.div
          key={hover.label}
          role="dialog"
          aria-label={hover.label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
          transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
          className="fixed z-[80] rounded-2xl p-4"
          style={{
            left, width: cardW,
            ...(below ? { top: hover.rect.bottom + 8 } : { bottom: window.innerHeight - hover.rect.top + 8 }),
            transformOrigin: below ? "top left" : "bottom left",
            background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)",
          }}
        >
          <div className="flex items-center gap-x-2 gap-y-1 mb-2.5 flex-wrap">
            <span className="font-sans text-[12px] font-semibold" style={{ color: "var(--bj-gold-deep)" }}>{hover.label}</span>
            <div className="flex gap-0.5 ml-auto">
              {COMPARE.map((v) => (
                <button key={v} type="button" onClick={() => setVersion(v)}
                  className="font-sans text-[10.5px] px-1.5 h-5 rounded-md"
                  style={{
                    color: v === version ? "var(--bj-ink)" : "var(--bj-ink4)",
                    background: v === version ? "var(--bj-line)" : "transparent",
                  }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="font-read italic mb-3.5 overflow-y-auto" style={{ fontSize: 16.5, lineHeight: 1.5, color: "var(--bj-ink)", maxHeight: 200 }}>
            {failed ? (
              <span className="font-sans not-italic text-[13px]" style={{ color: "var(--bj-ink4)" }}>Couldn&apos;t load this passage in {version}.</span>
            ) : !verses ? (
              <span className="block h-12 rounded-lg animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
            ) : (
              verses.map((v) => (
                <span key={v.n}>
                  {verses.length > 1 && <sup className="font-sans not-italic" style={{ fontSize: 10, color: "var(--bj-ink4)", marginRight: 3 }}>{v.n}</sup>}
                  {v.text}{" "}
                </span>
              ))
            )}
          </div>
          <div className="flex gap-1.5">
            <button type="button"
              onClick={() => { void quotePassage(editor, hover.ref, version, hover.pos); onDone(); }}
              className="bj-btn-primary h-7 px-2.5 rounded-lg font-sans text-[12px] font-semibold"
              style={{ background: "var(--bj-gold)", color: "var(--bj-bg)" }}>
              Quote below
            </button>
            <button type="button"
              onClick={() => { openBibleAt({ book: hover.ref.book, chapter: hover.ref.chapter, verse: hover.ref.verse }); onDone(); }}
              className="bj-btn-ghost h-7 px-2.5 rounded-lg font-sans text-[12px]"
              style={{ color: "var(--bj-ink2)", border: "1px solid var(--bj-line)" }}>
              Open in Bible
            </button>
            <span className="ml-auto self-center font-sans text-[10.5px] hidden sm:inline" style={{ color: "var(--bj-ink4)" }}>⌘-click opens</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Verse picker (slash "Quote a verse") ───────────────────

export function VersePicker({ editor, at, onClose }: {
  editor: Editor;
  at: { left: number; top: number } | null;
  onClose: () => void;
}) {
  const version = useBibleStore((s) => s.version);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const parsed = value.trim() ? parseRef(value.trim()) : null;

  useEffect(() => { if (at) { setValue(""); setError(""); } }, [at]);

  async function submit() {
    if (!parsed) { setError("Try a reference like John 3:16 or Psalm 23"); return; }
    setBusy(true);
    const ok = await quotePassage(editor, parsed, version).catch(() => false);
    setBusy(false);
    if (!ok) { setError(`Couldn't find ${value.trim()} in ${version}`); return; }
    onClose();
    editor.commands.focus();
  }

  if (!at || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed z-[80] rounded-xl p-2"
      style={{
        left: Math.max(12, Math.min(at.left, window.innerWidth - Math.min(320, window.innerWidth - 24) - 12)),
        top: at.top + 6, width: Math.min(320, window.innerWidth - 24),
        background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)",
      }}>
      <input
        autoFocus
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(""); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); void submit(); }
          if (e.key === "Escape") { e.preventDefault(); onClose(); editor.commands.focus(); }
        }}
        onBlur={() => setTimeout(onClose, 120)}
        placeholder="Quote a verse — e.g. Romans 8:28–30"
        aria-label="Bible reference to quote"
        className="w-full bg-transparent outline-none font-sans text-base md:text-[14px] px-2 h-8"
        style={{ color: "var(--bj-ink)" }}
      />
      <p className="font-sans text-[11.5px] px-2 pt-1" style={{ color: error ? "var(--bj-ember)" : "var(--bj-ink4)" }}>
        {error || (busy ? "Fetching…" : parsed
          ? <>↵ quote <span style={{ color: "var(--bj-ink2)" }}>{parsed.book} {parsed.chapter}{parsed.verse ? `:${parsed.verse}${parsed.verseEnd ? `–${parsed.verseEnd}` : ""}` : ""}</span> · {version}</>
          : "Type a reference")}
      </p>
    </div>,
    document.body,
  );
}
