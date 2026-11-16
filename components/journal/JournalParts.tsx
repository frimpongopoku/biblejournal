"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, X, Smile } from "lucide-react";
import type { JournalEntry } from "@/types";

export function formatRelative(d: Date): string {
  const now = new Date();
  const diff = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** All plain text of a TipTap JSON document. */
export function docText(content: string): string {
  try {
    const doc = JSON.parse(content);
    const parts: string[] = [];
    const walk = (node: { text?: string; content?: typeof node[] }) => {
      if (node.text) parts.push(node.text);
      if (node.content) node.content.forEach(walk);
    };
    walk(doc);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

const textCache = new Map<string, string>();
/** docText with a small cache keyed by the content string itself. */
export function cachedDocText(content: string): string {
  let t = textCache.get(content);
  if (t === undefined) {
    t = docText(content);
    if (textCache.size > 2000) textCache.clear();
    textCache.set(content, t);
  }
  return t;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

export function extractExcerpt(content: string, maxLen = 110): string {
  const full = docText(content);
  return full.length > maxLen ? full.slice(0, maxLen) + "…" : full;
}

// ── Tag editor ────────────────────────────────────────────

export function TagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      commit(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 cursor-text" onClick={() => inputRef.current?.focus()}
      style={{ maxWidth: 680 }}>
      {tags.map((tag) => (
        <span key={tag} title={`#${tag}`} className="flex items-center gap-1 px-2 py-0.5 rounded-full font-sans max-w-[180px] min-w-0"
          style={{ fontSize: 12, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
          <span className="truncate">#{tag}</span>
          <button
            onMouseDown={(e) => { e.preventDefault(); onChange(tags.filter((t) => t !== tag)); }}
            className="flex items-center justify-center rounded-full ml-0.5"
            style={{ color: "var(--bj-gold-deep)", opacity: 0.6, lineHeight: 1 }}
          >
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) commit(input); }}
        placeholder={tags.length === 0 ? "Add tags…" : "+tag"}
        className="bg-transparent outline-none font-sans text-base md:text-xs"
        style={{
          color: "var(--bj-ink4)",
          caretColor: "var(--bj-gold)",
          width: input ? `${Math.max(48, input.length * 8)}px` : tags.length === 0 ? "72px" : "42px",
          maxWidth: "100%",
          minWidth: 32,
          transition: "width 0.1s ease",
        }}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

// ── Feeling data ──────────────────────────────────────────

export const FEELINGS = [
  { emoji: "😊", label: "Grateful" },
  { emoji: "🙏", label: "Prayerful" },
  { emoji: "✨", label: "Inspired" },
  { emoji: "😌", label: "Peaceful" },
  { emoji: "🔥", label: "Excited" },
  { emoji: "🤔", label: "Reflective" },
  { emoji: "😔", label: "Heavy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "💪", label: "Determined" },
];

export function feelingByLabel(label?: string) {
  return FEELINGS.find((f) => f.label === label);
}

// ── Feeling picker modal ──────────────────────────────────

export function FeelingPicker({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const preset = feelingByLabel(value);
  const isCustom = value && !preset;

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus custom input when user starts typing in the modal
  function saveCustom() {
    const trimmed = custom.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setCustom("");
    setOpen(false);
  }

  return (
    <>
      {/* Trigger chip */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={value ? `Feeling: ${value}` : "How are you feeling?"}
        className="bj-chip flex items-center gap-1.5 h-6 px-2.5 rounded-full font-sans text-[12px]"
        style={{
          color: value ? "var(--bj-ink2)" : "var(--bj-ink4)",
          border: `1px solid ${value ? "var(--bj-line)" : "var(--bj-line-soft)"}`,
        }}
      >
        {preset ? <span style={{ fontSize: 12 }}>{preset.emoji}</span> : isCustom ? null : <Smile size={12} />}
        <span className="truncate max-w-[160px]">{value ? (preset?.label ?? value) : "Feeling"}</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="fp-bd" className="fixed inset-0 z-50"
              style={{ background: "var(--m-scrim)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)} />

            <motion.div key="fp-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
              <motion.div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  maxWidth: 420, pointerEvents: "auto",
                  background: "var(--bj-bg-panel)",
                  border: "1px solid var(--bj-line)",
                  boxShadow: "0 24px 60px color-mix(in oklch, var(--bj-ink) 22%, transparent)",
                }}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.22 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                  <h2 className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                    How are you feeling?
                  </h2>
                  <button onClick={() => setOpen(false)} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                    <X size={14} />
                  </button>
                </div>

                {/* Preset grid */}
                <div className="grid grid-cols-2 gap-1.5 p-4">
                  {FEELINGS.map((f) => {
                    const isActive = value === f.label;
                    return (
                      <button key={f.label}
                        onClick={() => { onChange(isActive ? undefined : f.label); setOpen(false); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-100"
                        style={{
                          background: isActive ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                          border: `1px solid ${isActive ? "var(--bj-gold-soft)" : "transparent"}`,
                          transform: "none",
                        }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bj-line-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bj-bg-soft)"; e.currentTarget.style.transform = "none"; } }}
                      >
                        <span style={{ fontSize: 20, lineHeight: 1 }}>{f.emoji}</span>
                        <span className="font-sans text-sm" style={{ color: isActive ? "var(--bj-gold-deep)" : "var(--bj-ink2)", fontWeight: isActive ? 500 : 400 }}>
                          {f.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
                  <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2 mt-3" style={{ color: "var(--bj-ink4)" }}>
                    Or describe it yourself
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveCustom(); }}
                      placeholder="Overwhelmed, grateful beyond words…"
                      className="flex-1 bg-transparent outline-none font-sans text-sm px-3 py-2 rounded-xl"
                      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                    />
                    <button onClick={saveCustom} disabled={!custom.trim()}
                      className="font-sans text-sm px-3 py-2 rounded-xl disabled:opacity-40 transition-all"
                      style={{ background: "var(--bj-gold)", color: "white" }}>
                      Set
                    </button>
                  </div>
                </div>

                {/* Clear */}
                {value && (
                  <button onClick={() => { onChange(undefined); setOpen(false); }}
                    className="w-full font-sans text-xs py-3 border-t"
                    style={{ color: "var(--bj-ink4)", borderColor: "var(--bj-line-soft)" }}>
                    Clear feeling
                  </button>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Table view ────────────────────────────────────────────

export function TableView({ entries, onSelect }: { entries: JournalEntry[]; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>No entries match</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-soft)" }}>
            {["Title", "Feeling", "Date", "Tags"].map((h) => (
              <th key={h} className="text-left font-sans text-[10px] uppercase tracking-widest font-semibold px-4 py-2.5"
                style={{ color: "var(--bj-ink4)", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const feeling = feelingByLabel(entry.feeling);
            const isHov = hovered === entry.id;
            return (
              <tr
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                onMouseEnter={() => setHovered(entry.id)}
                onMouseLeave={() => setHovered(null)}
                className="border-b cursor-pointer"
                style={{
                  borderColor: "var(--bj-line-soft)",
                  background: isHov ? "var(--bj-bg-soft)" : "transparent",
                  transition: "background 0.1s ease",
                }}
              >
                {/* Title */}
                <td className="px-4 py-3" style={{ maxWidth: 360 }}>
                  <div className="flex items-center gap-2">
                    {entry.isPinned && <Pin size={10} style={{ color: "var(--bj-gold)", flexShrink: 0 }} />}
                    <span className="font-sans text-sm font-medium truncate" style={{ color: "var(--bj-ink)" }}>
                      {entry.title || <span style={{ color: "var(--bj-ink4)", fontWeight: 400 }}>Untitled</span>}
                    </span>
                  </div>
                  <p className="font-sans text-xs mt-0.5 truncate" style={{ color: "var(--bj-ink4)", maxWidth: 320 }}>
                    {extractExcerpt(entry.content, 60)}
                  </p>
                </td>

                {/* Feeling */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {feeling ? (
                    <span className="flex items-center gap-1.5">
                      <span style={{ fontSize: 14 }}>{feeling.emoji}</span>
                      <span className="font-sans text-xs" style={{ color: "var(--bj-ink3)" }}>{feeling.label}</span>
                    </span>
                  ) : (
                    <span style={{ color: "var(--bj-line)" }}>—</span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{formatRelative(entry.updatedAt)}</span>
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {entry.tags.slice(0, 3).map((t) => (
                      <span key={t} className="font-sans px-1.5 py-0.5 rounded-md"
                        style={{ fontSize: 10, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}>
                        #{t}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>+{entry.tags.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

