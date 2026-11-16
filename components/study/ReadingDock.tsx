"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PenLine, CircleHelp, MessageSquare, CheckCircle2, Circle, CornerDownLeft, ChevronRight, Sparkles } from "lucide-react";
import { createStudyNote, toggleQuestionResolved } from "@/services/studyNotes.service";
import { studyColorHex } from "@/lib/study-colors";
import { previewText } from "@/lib/tiptap-preview";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import type { StudyNote } from "@/types";

export type DockMode = "note" | "question" | "ask";

const docOf = (text: string) => JSON.stringify({
  type: "doc",
  content: text.split(/\n+/).map((line) => line.trim() ? { type: "paragraph", content: [{ type: "text", text: line }] } : { type: "paragraph" }),
});

function VerseHead({ v, text, color, active, onClick }: { v: number; text?: string; color?: string | null; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="dock-verse w-full flex items-baseline gap-2.5 text-left rounded-lg px-1.5 py-1 -mx-1.5" data-active={active || undefined}>
      <span className="font-sans text-[11px] font-semibold tabular-nums shrink-0" style={{ color: active ? "var(--bj-gold)" : "var(--bj-ink3)" }}>v{v}</span>
      {color && <i className="w-2.5 h-2.5 rounded-[3px] shrink-0 self-center" style={{ background: studyColorHex(color) }} />}
      {text && <span className="font-read italic text-[14px] leading-snug truncate min-w-0" style={{ color: "var(--bj-ink3)" }}>{text}</span>}
    </button>
  );
}

/** Everything left on this chapter, grouped under the verse it belongs to. */
export function NotesByVerse({
  uid, notes, verses, active, onVerse, onOpen, only,
}: {
  uid: string;
  notes: StudyNote[];
  verses?: Map<number, string>;
  active: number | null;
  onVerse: (v: number) => void;
  onOpen: (v: number) => void;
  only?: "question";
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => {
    const by = new Map<number, StudyNote[]>();
    for (const n of notes) {
      if (only && n.kind !== only) continue;
      const v = n.scripture.verse;
      by.set(v, [...(by.get(v) ?? []), n]);
    }
    return [...by.entries()].sort((a, b) => a[0] - b[0]);
  }, [notes, only]);

  useEffect(() => {
    if (active == null) return;
    wrap.current?.querySelector(`[data-group="${active}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  if (!groups.length) {
    return (
      <div className="px-2 py-10 text-center flex flex-col items-center gap-2">
        {only ? <CircleHelp size={18} style={{ color: "var(--bj-gold)" }} /> : <PenLine size={18} style={{ color: "var(--bj-gold)" }} />}
        <p className="font-display text-[19px]" style={{ color: "var(--bj-ink)" }}>{only ? "No questions yet" : "Nothing in the margin yet"}</p>
        <p className="font-sans text-[12.5px] max-w-[260px]" style={{ color: "var(--bj-ink3)" }}>
          {only ? "Something you don’t understand? Ask it here. It stays open until you’ve found the answer." : "Pick a verse and write below, or press N. Your notes gather here under the verse they belong to."}
        </p>
      </div>
    );
  }

  return (
    <div ref={wrap} className="flex flex-col gap-4">
      {groups.map(([v, items]) => {
        const hl = items.find((n) => n.kind === "highlight");
        const rest = items.filter((n) => n.kind !== "highlight").sort((a, b) => +a.createdAt - +b.createdAt);
        const isActive = v === active;
        return (
          <section key={v} data-group={v} className="dock-group" data-active={isActive || undefined}>
            <VerseHead v={v} text={verses?.get(v)} color={hl?.color} active={isActive} onClick={() => onVerse(v)} />
            {rest.length > 0 && (
              <div className="mt-1.5 flex flex-col gap-1.5">
                {rest.map((n) => n.kind === "question" ? (
                  <div key={n.id} className="dock-item rounded-[12px] px-3 py-2.5 flex gap-2.5 items-start">
                    <button type="button" onClick={() => void toggleQuestionResolved(uid, n.id, !n.resolved)} aria-label={n.resolved ? "Reopen question" : "Mark answered"}
                      className="mt-0.5 shrink-0" style={{ color: n.resolved ? "var(--bj-sage)" : "#86AEE0" }}>
                      {n.resolved ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    </button>
                    <button type="button" onClick={() => onOpen(v)} className="min-w-0 flex-1 text-left">
                      <p className="font-write text-[15.5px] leading-snug" style={{ color: n.resolved ? "var(--bj-ink3)" : "var(--bj-ink)" }}>{previewText(n.content ?? "") || "—"}</p>
                      {n.answer ? (
                        <p className="font-sans text-[12.5px] leading-snug mt-1 line-clamp-2" style={{ color: "var(--bj-ink3)" }}><span style={{ color: "var(--bj-sage)" }}>Answer · </span>{previewText(n.answer)}</p>
                      ) : !n.resolved && (
                        <p className="font-sans text-[11.5px] mt-1" style={{ color: "#86AEE0" }}>Open question</p>
                      )}
                    </button>
                  </div>
                ) : (
                  <button key={n.id} type="button" onClick={() => onOpen(v)} className="dock-item rounded-[12px] px-3 py-2.5 text-left flex gap-2.5 items-start">
                    <PenLine size={13} className="mt-1 shrink-0" style={{ color: "var(--bj-ink4)" }} />
                    <p className="font-write text-[15.5px] leading-snug min-w-0 line-clamp-5" style={{ color: "var(--bj-ink2)" }}>{previewText(n.content ?? "") || "—"}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Ask: a few good first questions for the verse you're on. */
export function AskPane({ book, chapter, verse, text, onPick }: { book: string; chapter: number; verse: number; text?: string; onPick: (q: string) => void }) {
  const ref = `${book} ${chapter}:${verse}`;
  const qs = [
    `What does ${ref} mean?`,
    `Why does ${ref} say it this way? What did it mean to the first readers?`,
    `Where else does the Bible talk about this? (${ref})`,
    `How could I live out ${ref} this week?`,
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[14px] bj-well px-3.5 py-3">
        <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: "var(--bj-gold)" }}>{ref}</p>
        <p className="font-read italic text-[16px] leading-snug line-clamp-4" style={{ color: "var(--bj-ink)" }}>{text ? `“${text}”` : "Pick a verse in the text."}</p>
      </div>
      <p className="font-sans text-[11.5px] px-0.5" style={{ color: "var(--bj-ink4)" }}>Start with one of these, or write your own below.</p>
      <div className="flex flex-col gap-1.5">
        {qs.map((q) => (
          <button key={q} type="button" onClick={() => onPick(q)} className="bj-raised bj-lift rounded-[12px] px-3 py-2.5 text-left flex items-center gap-2.5">
            <Sparkles size={13} className="shrink-0" style={{ color: "var(--bj-gold)" }} />
            <span className="font-sans text-[13px] leading-snug flex-1" style={{ color: "var(--bj-ink2)" }}>{q}</span>
            <ChevronRight size={13} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

const MODES: { id: DockMode; label: string; key: string; icon: React.ElementType }[] = [
  { id: "note", label: "Note", key: "N", icon: PenLine },
  { id: "question", label: "Question", key: "?", icon: CircleHelp },
  { id: "ask", label: "Ask", key: "A", icon: MessageSquare },
];

/** One box for everything you'd say about a verse. ⌘↵ saves. */
export function DockComposer({
  uid, book, chapter, version, verse, mode, onMode, inputRef, onSaved,
}: {
  uid: string; book: string; chapter: number; version: string;
  verse: number;
  mode: DockMode;
  onMode: (m: DockMode) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onSaved?: (kind: "note" | "question") => void;
}) {
  const openAsk = useFloatWindowsStore((s) => s.openAsk);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text, inputRef]);

  async function submit() {
    const v = text.trim();
    if (!v || saving) return;
    if (mode === "ask") {
      openAsk(`${book} ${chapter}:${verse}: ${v}`);
      setText("");
      return;
    }
    setSaving(true);
    try {
      await createStudyNote(uid, { scripture: { book, chapter, verse, version }, kind: mode, content: docOf(v) });
      setText("");
      onSaved?.(mode);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bj-glass rounded-[16px] p-2 flex flex-col gap-1.5">
      <div className="flex items-start gap-2 px-1.5 pt-1">
        <span className="mt-[3px] h-[22px] px-[7px] rounded-[7px] flex items-center font-sans text-[11px] font-semibold tabular-nums shrink-0"
          style={{ background: "color-mix(in oklch, var(--bj-gold) 15%, transparent)", color: "var(--bj-gold)" }}>v{verse}</span>
        <textarea ref={inputRef} value={text} rows={1} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey || mode === "ask")) { e.preventDefault(); void submit(); }
            if (e.key === "Escape") { e.preventDefault(); (e.target as HTMLTextAreaElement).blur(); }
          }}
          placeholder={mode === "note" ? "A note on this verse…" : mode === "question" ? "What don’t you understand yet?" : "Ask anything about this verse…"}
          aria-label={mode === "note" ? "Write a note" : mode === "question" ? "Write a question" : "Ask a question"}
          className={`${mode === "ask" ? "font-sans text-[14.5px]" : "font-write text-[16.5px]"} flex-1 min-w-0 bg-transparent outline-none resize-none leading-[1.45] py-0.5`}
          style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 rounded-[11px] bj-well p-0.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const on = mode === m.id;
            return (
              <button key={m.id} type="button" onClick={() => { onMode(m.id); inputRef.current?.focus(); }} data-active={on || undefined}
                title={`${m.label} (${m.key})`}
                className="sermon-kind h-7 px-2.5 rounded-[9px] flex items-center gap-1.5 font-sans text-[12px] font-medium"
                style={{ color: on ? (m.id === "question" ? "#86AEE0" : m.id === "ask" ? "var(--bj-gold)" : "var(--bj-ink)") : "var(--bj-ink4)" }}>
                <Icon size={12} />{m.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => void submit()} disabled={!text.trim() || saving}
          className="bj-gold ml-auto h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12px] font-semibold disabled:opacity-40 disabled:pointer-events-none">
          {mode === "ask" ? "Ask" : "Save"} <span className="opacity-70 text-[11px]">{mode === "ask" ? "↵" : "⌘↵"}</span>
          {mode === "ask" && <CornerDownLeft size={12} className="hidden" />}
        </button>
      </div>
    </div>
  );
}
