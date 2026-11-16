"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { NotesByVerse, AskPane, DockComposer, type DockMode } from "@/components/study/ReadingDock";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { lastInputWasKeyboard } from "@/lib/inputMode";
import { gSequencePending } from "@/lib/nav";
import Link from "next/link";
import { NotebookPen, Info } from "lucide-react";
import { AnnotationPanel } from "@/components/study/AnnotationPanel";
import { COMMENTARY_SOURCES, commentarySource } from "@/lib/commentary-sources";
import { CommentaryNote, CommentaryLede } from "@/components/study/CommentaryNote";
import { studyColorHex } from "@/lib/study-colors";
import { previewText } from "@/lib/tiptap-preview";
import { cachedDocText } from "@/components/journal/JournalParts";
import type { StudyNote, CommentaryChapter, JournalEntry } from "@/types";

const card = "rounded-xl p-3.5 mb-3";
const cardStyle = { background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" } as const;
const label = "font-sans text-[10.5px] font-semibold uppercase mb-2";
const labelStyle = { letterSpacing: "0.07em", color: "var(--bj-ink4)" } as const;

/** Journal entries that quote or mention this chapter. */
export function entriesForChapter(entries: JournalEntry[], book: string, chapter: number) {
  const needle = new RegExp(`(?<![0-9] )\\b${book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} ${chapter}(?::|\\b)`);
  return entries.filter((e) => needle.test(e.content) || needle.test(cachedDocText(e.content)));
}

// ── Read mode: what you've left in the margin ─────────────────

export function ReadMargin({ book, chapter, verses, notes, entries, onVerse }: {
  book: string;
  chapter: number;
  verses: Map<number, string>;
  notes: StudyNote[];
  entries: JournalEntry[];
  onVerse: (n: number, openNotes?: boolean) => void;
}) {
  const highlights = notes.filter((n) => n.kind === "highlight").sort((a, b) => a.scripture.verse - b.scripture.verse);
  const written = notes.filter((n) => n.kind !== "highlight").sort((a, b) => a.scripture.verse - b.scripture.verse);
  const linked = useMemo(() => entriesForChapter(entries, book, chapter).slice(0, 4), [entries, book, chapter]);

  return (
    <div className="px-5 py-5">
      <p className="font-sans text-[12px] font-medium mb-3.5" style={{ color: "var(--bj-ink4)" }}>In the margin · {book} {chapter}</p>

      {written.length === 0 && highlights.length === 0 && linked.length === 0 && (
        <p className="font-display italic text-[17px] leading-snug px-1" style={{ color: "var(--bj-ink4)" }}>
          Select a verse to highlight it, leave a note, or reflect on it in your journal.
        </p>
      )}

      {written.map((n) => (
        <button key={n.id} type="button" onClick={() => onVerse(n.scripture.verse, true)} className={`${card} block w-full text-left bj-list-row`} style={cardStyle}>
          <p className={label} style={{ ...labelStyle, color: n.kind === "question" ? "var(--bj-gold-deep)" : "var(--bj-sage)" }}>
            {n.kind === "question" ? (n.resolved ? "Answered question" : "Open question") : "Your note"} · v{n.scripture.verse}
          </p>
          <p className="font-display text-[16px] leading-snug" style={{ color: "var(--bj-ink)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
            {previewText(n.content) || "—"}
          </p>
          <p className="font-sans text-[11.5px] mt-1.5" style={{ color: "var(--bj-ink4)" }}>
            {n.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </button>
      ))}

      {highlights.length > 0 && (
        <div className={card} style={cardStyle}>
          <p className={label} style={labelStyle}>Highlights</p>
          {highlights.map((h) => (
            <button key={h.id} type="button" onClick={() => onVerse(h.scripture.verse)}
              className="flex gap-2.5 w-full text-left py-1 rounded-md bj-list-row">
              <i className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: studyColorHex(h.color) }} />
              <span className="font-sans text-[12.5px] leading-snug min-w-0" style={{ color: "var(--bj-ink3)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                <b className="font-semibold" style={{ color: "var(--bj-ink)" }}>v{h.scripture.verse}</b> {verses.get(h.scripture.verse) ?? ""}
              </span>
            </button>
          ))}
        </div>
      )}

      {linked.length > 0 && (
        <div className={card} style={cardStyle}>
          <p className={label} style={labelStyle}>In your journal</p>
          {linked.map((e) => (
            <Link key={e.id} href={`/journal?entry=${e.id}`} className="flex items-start gap-2 py-1.5 rounded-md bj-list-row">
              <NotebookPen size={13} className="mt-0.5 shrink-0" style={{ color: "var(--bj-ink4)" }} />
              <span className="min-w-0">
                <span className="block font-sans text-[13px] font-medium truncate" style={{ color: "var(--bj-ink)" }}>{e.title || "Untitled"}</span>
                <span className="block font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>
                  {e.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Study mode: commentary that follows the reader + notes ─────────

export type StudyTab = "commentary" | "notes" | "ask" | "questions";

export function StudyMargin({
  tab, onTab, uid, book, chapter, version, notes, selectedVerse, onSelectVerse,
  commentary, commentaryError, source, onSource, currentVerse, onVerse, onAbout, verses,
}: {
  tab: StudyTab;
  onTab: (t: StudyTab) => void;
  uid: string;
  book: string;
  chapter: number;
  version: string;
  notes: StudyNote[];
  selectedVerse: number | null;
  onSelectVerse: (n: number | null) => void;
  commentary: CommentaryChapter | null;
  commentaryError: string | null;
  source: string;
  onSource: (id: string) => void;
  currentVerse: number | null;
  onVerse: (n: number) => void;
  onAbout: () => void;
  verses?: Map<number, string>;
}) {
  const [detail, setDetail] = useState<number | null>(null);
  const [mode, setMode] = useState<DockMode>("note");
  const composer = useRef<HTMLTextAreaElement | null>(null);
  const target = selectedVerse ?? currentVerse ?? 1;
  const listRef = useRef<HTMLDivElement>(null);
  const lastVerse = commentary?.entries.length ? Math.max(...commentary.entries.map((e) => e.endVerse ?? e.verse)) : 0;
  const activeIdx = useMemo(() => {
    if (!commentary || currentVerse == null) return -1;
    let idx = -1;
    commentary.entries.forEach((e, i) => { if (e.verse <= currentVerse && (e.endVerse ?? lastVerse) >= currentVerse) idx = i; });
    if (idx < 0) commentary.entries.forEach((e, i) => { if (e.verse <= currentVerse) idx = i; });
    return idx;
  }, [commentary, currentVerse, lastVerse]);

  // Follow the reader: keep the commentary for the verse in view visible.
  useEffect(() => {
    if (activeIdx < 0) return;
    listRef.current?.querySelector(`[data-entry="${activeIdx}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx]);

  const openQ = notes.filter((n) => n.kind === "question" && !n.resolved).length;
  const nCount = notes.filter((n) => n.kind !== "highlight").length;
  const openAsk = useFloatWindowsStore((s) => s.openAsk);

  // N / ? / A from anywhere in the reader (not while typing).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (el && (el.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(el.tagName)))) return;
      if (gSequencePending() || e.defaultPrevented) return;
      const m: DockMode | null = e.key === "n" ? "note" : e.key === "?" ? "question" : e.key === "a" ? "ask" : null;
      if (!m) return;
      e.preventDefault();
      setDetail(null);
      setMode(m);
      onTab(m === "ask" ? "ask" : m === "question" ? "questions" : "notes");
      requestAnimationFrame(() => composer.current?.focus());
    }
    // Capture, so "?" here wins over the global shortcuts sheet.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onTab]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 pt-3 pb-3 shrink-0 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
        <div className="flex gap-0.5 p-0.5 rounded-[12px] bj-well" role="tablist">
          {([["notes", "Notes", nCount], ["commentary", "Commentary", 0], ["ask", "Ask", 0], ["questions", "Questions", openQ]] as const).map(([id, l, n]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => { onTab(id); setDetail(null); if (id === "ask") setMode("ask"); else if (id === "questions") setMode("question"); else if (mode === "ask") setMode("note"); }}
              className="relative flex-1 h-8 rounded-[10px] font-sans text-[12px] font-medium flex items-center justify-center gap-1"
              style={{ color: tab === id ? "var(--bj-ink)" : "var(--bj-ink4)" }}>
              {tab === id && <motion.span layoutId="dock-tab" className="absolute inset-0 rounded-[10px] bj-raised" transition={lastInputWasKeyboard() ? { duration: 0 } : { type: "spring", duration: 0.34, bounce: 0.12 }} />}
              <span className="relative">{l}</span>
              {n > 0 && <span className="relative tabular-nums text-[10.5px]" style={{ color: id === "questions" ? "#86AEE0" : "var(--bj-ink4)" }}>{n}</span>}
            </button>
          ))}
        </div>
      </div>

      {tab !== "commentary" ? (
        detail != null ? (
          <div className="flex-1 min-h-0">
            <AnnotationPanel uid={uid} book={book} chapter={chapter} version={version} verseText={verses?.get(detail)}
              selectedVerse={detail} notes={notes} onSelectVerse={(n) => { setDetail(n); if (n) onSelectVerse(n); }} onClose={() => setDetail(null)} />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-3">
              {tab === "ask" ? (
                <AskPane book={book} chapter={chapter} verse={target} text={verses?.get(target)} onPick={(q) => openAsk(q)} />
              ) : (
                <NotesByVerse uid={uid} notes={notes} verses={verses} active={selectedVerse ?? null}
                  only={tab === "questions" ? "question" : undefined}
                  onVerse={(v) => { onSelectVerse(v); onVerse(v); }} onOpen={(v) => { onSelectVerse(v); setDetail(v); }} />
              )}
            </div>
            <div className="px-3 pb-3 pt-1 shrink-0">
              <DockComposer uid={uid} book={book} chapter={chapter} version={version} verse={target} mode={mode} onMode={(m) => { setMode(m); if (m === "ask") onTab("ask"); else if (tab === "ask") onTab(m === "question" ? "questions" : "notes"); }} inputRef={composer}
                onSaved={(k) => { if (k === "question" && tab !== "questions") onTab("notes"); }} />
              <p className="font-sans text-[10.5px] mt-1.5 px-1 flex gap-2.5" style={{ color: "var(--bj-ink4)" }}>
                <span><kbd className="bj-kbd">N</kbd> note</span><span><kbd className="bj-kbd">?</kbd> question</span><span><kbd className="bj-kbd">A</kbd> ask</span>
              </p>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="flex items-center gap-1.5 px-4 pt-3 shrink-0 flex-wrap">
            {COMMENTARY_SOURCES.map((s) => (
              <button key={s.id} type="button" onClick={() => onSource(s.id)} title={s.label} aria-pressed={source === s.id} data-active={source === s.id || undefined}
                className="bj-chip h-6 px-2.5 rounded-full font-sans text-[11.5px] font-medium"
                style={{
                  border: `1px solid ${source === s.id ? "var(--bj-gold)" : "var(--bj-line)"}`,
                  color: source === s.id ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                }}>
                {s.shortLabel}
              </button>
            ))}
            <button type="button" onClick={onAbout} aria-label="About these commentaries" className="bj-btn-icon w-6 h-6 rounded-full flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
              <Info size={12} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 pt-2.5 pb-2 shrink-0">
            {currentVerse != null ? (
              <span className="h-6 px-2.5 rounded-full flex items-center gap-1.5 font-sans text-[11.5px] font-medium" style={{ background: "color-mix(in oklch, var(--bj-gold) 13%, transparent)", color: "var(--bj-gold)" }}>
                <span className="w-1.5 h-1.5 rounded-full bj-glow" style={{ background: "var(--bj-gold)" }} /> Following v{currentVerse}
              </span>
            ) : (
              <span className="font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>Follows your reading.</span>
            )}
            <span className="font-sans text-[11px] ml-auto" style={{ color: "var(--bj-ink4)" }}>Tap a line to jump</span>
          </div>
          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-3 pb-6">
            {commentaryError ? (
              <p className="font-sans text-[13px] py-6" style={{ color: "var(--bj-ink4)" }}>{commentaryError}</p>
            ) : !commentary ? (
              [0, 1, 2].map((i) => <div key={i} className="h-28 rounded-xl mb-3 animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />)
            ) : (
              <>
                {commentary.introduction?.trim() && (
                  <div className={card} style={cardStyle}>
                    <p className={label} style={labelStyle}>Introduction</p>
                    <p className="font-sans text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--bj-ink2)" }}>{commentary.introduction.trim()}</p>
                  </div>
                )}
                {commentary.entries.map((e, i) => {
                  const end = e.endVerse ?? (i < commentary.entries.length - 1 ? commentary.entries[i + 1].verse - 1 : lastVerse);
                  const src = commentarySource(source)!;
                  return (
                    <div key={i} data-entry={i} className={i === activeIdx ? "my-2 commentary-focus" : ""}>
                      {i === activeIdx
                        ? <CommentaryNote entry={e} source={src} book={book} chapter={chapter} end={end} onAbout={onAbout} />
                        : <CommentaryLede entry={e} source={src} end={end} onClick={() => onVerse(e.verse)} />}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

