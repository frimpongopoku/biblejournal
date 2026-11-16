"use client";

import { useEffect, useRef, useState } from "react";
import { Star, HelpCircle, Trash2, BookOpen, Check, CornerDownLeft, ArrowUpRight } from "lucide-react";
import { clock } from "@/lib/youtube-player";
import type { SermonMoment, SermonMomentKind } from "@/types";

export function refLabel(r: NonNullable<SermonMoment["ref"]>) {
  return `${r.book} ${r.chapter}${r.verse ? `:${r.verse}${r.endVerse && r.endVerse !== r.verse ? `–${r.endVerse}` : ""}` : ""}`;
}

function wallClock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", "");
}

const KIND_COLOR: Record<SermonMomentKind, string> = {
  note: "var(--bj-ink3)",
  takeaway: "var(--bj-gold)",
  question: "#86AEE0",
};

/** The time chip: video time when there is one, the clock time otherwise. */
export function Stamp({ m, onClick, live }: { m: { t: number | null; at: string }; onClick?: () => void; live?: boolean }) {
  const label = m.t != null ? clock(m.t) : wallClock(m.at);
  const cls = "shrink-0 h-[22px] px-[7px] rounded-[7px] flex items-center font-sans text-[11px] font-semibold tabular-nums";
  const style: React.CSSProperties = live
    ? { background: "color-mix(in oklch, var(--bj-gold) 16%, transparent)", color: "var(--bj-gold)" }
    : { color: "var(--bj-gold)" };
  return onClick
    ? <button type="button" onClick={onClick} title={m.t != null ? "Jump here" : undefined} className={`${cls} bj-well sermon-stamp`} style={style}>{label}</button>
    : <span className={`${cls} ${live ? "" : "bj-well"}`} style={style}>{label}</span>;
}

export function MomentItem({
  m, current, onSeek, onChange, onRemove, onOpenRef,
}: {
  m: SermonMoment;
  current: boolean;
  onSeek?: () => void;
  onChange: (patch: Partial<SermonMoment>) => void;
  onRemove: () => void;
  onOpenRef: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(m.text);
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (editing && area.current) {
      area.current.focus();
      area.current.setSelectionRange(draft.length, draft.length);
    }
    // only when entering edit mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function commit() {
    setEditing(false);
    const v = draft.trim();
    if (v && v !== m.text) onChange({ text: v });
    else setDraft(m.text);
  }

  return (
    <div className="sermon-moment group relative flex gap-3" data-current={current || undefined}>
      <Stamp m={m} onClick={m.t != null ? onSeek : undefined} />
      <div className="flex-1 min-w-0">
        {editing ? (
          <textarea
            ref={area} value={draft} rows={Math.max(1, Math.ceil(draft.length / 48))}
            onChange={(e) => setDraft(e.target.value)} onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); }
              if (e.key === "Escape") { setDraft(m.text); setEditing(false); }
            }}
            className="font-write w-full bg-transparent outline-none resize-none text-[17px] leading-[1.5]"
            style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
          />
        ) : m.text ? (
          <p onClick={() => { setDraft(m.text); setEditing(true); }}
            className="font-write text-[17px] leading-[1.5] whitespace-pre-wrap cursor-text"
            style={{ color: m.kind === "takeaway" ? "var(--bj-ink)" : "var(--bj-ink2)", overflowWrap: "anywhere" }}>
            {m.text}
          </p>
        ) : null}

        {m.ref && (
          <button type="button" onClick={onOpenRef}
            className="bj-raised bj-lift mt-2 w-full text-left rounded-xl px-3 py-2.5 flex flex-col gap-1"
            style={{ borderColor: "color-mix(in oklch, var(--bj-gold) 20%, var(--m-edge))" }}>
            <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5" style={{ color: "var(--bj-gold)" }}>
              <BookOpen size={11} /> {refLabel(m.ref)} <ArrowUpRight size={11} className="ml-auto opacity-70" />
            </span>
            {m.ref.text && (
              <span className="font-read italic text-[15.5px] leading-snug line-clamp-3" style={{ color: "var(--bj-ink2)" }}>“{m.ref.text}”</span>
            )}
          </button>
        )}

        {m.kind !== "note" && (
          <span className="inline-flex items-center gap-1 mt-1.5 font-sans text-[11px] font-medium" style={{ color: KIND_COLOR[m.kind] }}>
            {m.kind === "takeaway" ? <Star size={11} fill="currentColor" /> : <HelpCircle size={11} />}
            {m.kind === "takeaway" ? (m.done ? "Takeaway · lived" : "Takeaway") : "Question"}
          </span>
        )}
      </div>

      {/* Hover tools */}
      <div className="sermon-tools absolute right-0 -top-1 flex items-center gap-0.5 rounded-lg bj-glass p-0.5">
        <button type="button" title={m.kind === "takeaway" ? "Not a takeaway" : "Mark as takeaway"}
          onClick={() => onChange({ kind: m.kind === "takeaway" ? "note" : "takeaway" })}
          className="bj-btn-icon w-7 h-7 rounded-md flex items-center justify-center" style={{ color: m.kind === "takeaway" ? "var(--bj-gold)" : "var(--bj-ink3)" }}>
          <Star size={13} fill={m.kind === "takeaway" ? "currentColor" : "none"} />
        </button>
        <button type="button" title={m.kind === "question" ? "Not a question" : "Mark as question"}
          onClick={() => onChange({ kind: m.kind === "question" ? "note" : "question" })}
          className="bj-btn-icon w-7 h-7 rounded-md flex items-center justify-center" style={{ color: m.kind === "question" ? "#86AEE0" : "var(--bj-ink3)" }}>
          <HelpCircle size={13} />
        </button>
        <button type="button" title="Delete" onClick={onRemove}
          className="bj-btn-icon w-7 h-7 rounded-md flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

const KINDS: { id: SermonMomentKind; label: string; icon?: React.ReactNode }[] = [
  { id: "note", label: "Note" },
  { id: "takeaway", label: "Takeaway", icon: <Star size={12} /> },
  { id: "question", label: "Question", icon: <HelpCircle size={12} /> },
];

/**
 * Where notes are written. The time is caught the moment you start typing
 * (that's what you're reacting to), and Enter saves.
 */
export function Composer({
  now, hasVideo, onSave, onVerse, inputRef,
}: {
  now: number;
  hasVideo: boolean;
  onSave: (text: string, kind: SermonMomentKind, t: number | null) => void;
  onVerse: (raw: string, t: number | null) => Promise<boolean>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<SermonMomentKind>("note");
  const [stamped, setStamped] = useState<number | null>(null);
  const [verseMode, setVerseMode] = useState(false);
  const [verseErr, setVerseErr] = useState(false);

  const t = hasVideo ? (stamped ?? now) : null;

  function change(v: string) {
    if (!text && v && hasVideo) setStamped(now);
    if (!v) setStamped(null);
    setText(v);
    setVerseErr(false);
  }

  async function submit() {
    const v = text.trim();
    if (!v) return;
    if (verseMode) {
      const ok = await onVerse(v, t);
      if (!ok) { setVerseErr(true); return; }
      setVerseMode(false);
    } else {
      onSave(v, kind, t);
    }
    setText("");
    setStamped(null);
    setKind("note");
  }

  // Grow with the text, up to a few lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text, inputRef]);

  return (
    <div className="bj-glass rounded-[16px] p-2 flex flex-col gap-1.5">
      <div className="flex items-start gap-2.5 px-1.5 pt-1">
        {hasVideo && (
          <button type="button" onClick={() => setStamped(now)} title={stamped != null ? "Caught when you started typing — click to re-stamp to now" : "Notes are stamped with this time"}
            className="mt-[3px] shrink-0">
            <Stamp m={{ t, at: new Date().toISOString() }} live />
          </button>
        )}
        <textarea
          ref={inputRef}
          value={text}
          rows={1}
          onChange={(e) => change(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); }
            if (e.key === "Escape" && verseMode) { setVerseMode(false); setText(""); }
          }}
          placeholder={verseMode ? "Type a reference — 1 Kings 17:7" : hasVideo ? `Note at ${clock(now)}…` : "Write what stands out…"}
          aria-label="Write a note"
          className={`${verseMode ? "font-sans text-[15px]" : "font-write text-[17px]"} flex-1 min-w-0 bg-transparent outline-none resize-none leading-[1.45] py-0.5`}
          style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
        />
      </div>
      {verseErr && <p className="font-sans text-[12px] px-2" style={{ color: "#E08A7A" }}>That doesn’t look like a reference. Try “Psalm 46:10”.</p>}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 rounded-[11px] bj-well p-0.5">
          {KINDS.map((k) => (
            <button key={k.id} type="button" onClick={() => { setKind(k.id); setVerseMode(false); inputRef.current?.focus(); }}
              data-active={kind === k.id && !verseMode || undefined}
              className="sermon-kind h-7 px-2.5 rounded-[9px] flex items-center gap-1.5 font-sans text-[12px] font-medium"
              style={{ color: kind === k.id && !verseMode ? (k.id === "note" ? "var(--bj-ink)" : KIND_COLOR[k.id]) : "var(--bj-ink4)" }}>
              {k.icon}{k.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => { setVerseMode((v) => !v); setVerseErr(false); inputRef.current?.focus(); }}
          data-active={verseMode || undefined}
          className="sermon-kind h-8 px-2.5 rounded-[10px] flex items-center gap-1.5 font-sans text-[12px] font-medium"
          style={{ color: verseMode ? "var(--bj-gold)" : "var(--bj-ink3)" }} title="Catch a verse">
          <BookOpen size={13} /> Verse
        </button>
        <button type="button" onClick={() => void submit()} disabled={!text.trim()}
          className="bj-gold ml-auto h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12px] font-semibold disabled:opacity-40 disabled:pointer-events-none">
          Save <CornerDownLeft size={12} />
        </button>
      </div>
    </div>
  );
}

export function TakeawayRow({ m, sub, onToggle, onSeek }: { m: SermonMoment; sub?: string; onToggle: () => void; onSeek?: () => void }) {
  return (
    <div className="bj-raised rounded-[13px] px-3 py-2.5 flex gap-2.5 items-start">
      <button type="button" onClick={onToggle} aria-label={m.done ? "Mark as not lived yet" : "Mark as lived"}
        className={`sermon-check mt-0.5 w-[19px] h-[19px] rounded-[6px] shrink-0 flex items-center justify-center ${m.done ? "" : "bj-well"}`}
        data-done={m.done || undefined}
        style={m.done ? { background: "#8DB59A" } : undefined}>
        {m.done && <Check size={12} strokeWidth={3} color="#10251a" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-write text-[15.5px] leading-snug" style={{ color: m.done ? "var(--bj-ink4)" : "var(--bj-ink2)", textDecoration: m.done ? "line-through" : undefined, overflowWrap: "anywhere" }}>{m.text}</p>
        {(sub || (onSeek && m.t != null)) && (
          <p className="font-sans text-[11px] mt-1 flex items-center gap-1.5" style={{ color: "var(--bj-ink4)" }}>
            {sub && <span className="truncate">{sub}</span>}
            {onSeek && m.t != null && <button type="button" onClick={onSeek} className="tabular-nums hover:underline" style={{ color: "var(--bj-gold)" }}>{clock(m.t)}</button>}
          </p>
        )}
      </div>
    </div>
  );
}
