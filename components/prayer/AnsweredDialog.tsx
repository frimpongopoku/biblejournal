"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";
import { useWritingStore, writingFontStyle } from "@/store/writing.store";
import { dayNumber, docToText, logOf, plural, shortDate } from "@/lib/prayer";
import type { Prayer } from "@/types";

/** "God answered": your request sits above, you write how he answered. */
export function AnsweredDialog({ open, prayer, onClose, onConfirm }: {
  open: boolean; prayer: Prayer | null; onClose: () => void; onConfirm: (testimony: string) => Promise<void>;
}) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && prayer && <Body key="answered" prayer={prayer} onClose={onClose} onConfirm={onConfirm} />}
    </AnimatePresence>,
    document.body,
  );
}

// Mounted fresh each time it opens, so the text always starts empty.
function Body({ prayer, onClose, onConfirm }: { prayer: Prayer; onClose: () => void; onConfirm: (testimony: string) => Promise<void> }) {
  const font = useWritingStore((s) => s.font);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => areaRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  async function confirm() {
    if (saving) return;
    setSaving(true);
    try { await onConfirm(text); onClose(); } catch (e) { console.error(e); setSaving(false); }
  }

  const asked = docToText(prayer.body) || prayer.title;
  const times = logOf(prayer).length;

  return (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-2 sm:p-4">
          <motion.div className="absolute inset-0 bj-scrim" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
          <motion.div role="dialog" aria-modal="true" aria-label="God answered"
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, transition: { duration: 0.14 } }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="bj-window relative w-full sm:max-w-[640px] max-h-[92dvh] overflow-y-auto px-5 sm:px-7 pt-6 pb-5 sm:pb-6"
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-[34px] h-[34px] rounded-[11px] flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--bj-sage) 16%, transparent)" }}>
                <Check size={16} strokeWidth={2.4} style={{ color: "var(--bj-sage)" }} />
              </span>
              <h2 className="font-display flex-1" style={{ fontSize: 26, fontWeight: 500, color: "var(--bj-ink)" }}>God answered</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="bj-btn-icon w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}><X size={15} /></button>
            </div>

            <div className="bj-well rounded-2xl px-4 py-3.5 mb-4">
              <p className="font-sans text-[10.5px] font-semibold uppercase mb-1.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.07em" }}>
                You asked · {shortDate(prayer.createdAt, true)}{times > 0 ? ` · prayed ${plural(times, "time")}` : ""} over {plural(dayNumber(prayer), "day")}
              </p>
              <p className="line-clamp-4" style={{ ...writingFontStyle(font, 17), lineHeight: 1.5, color: "var(--bj-ink3)", whiteSpace: "pre-line" }}>{asked}</p>
            </div>

            <label htmlFor="answer-text" className="block font-sans text-[13px] font-medium mb-2" style={{ color: "var(--bj-ink2)" }}>How did he answer?</label>
            <textarea data-writing-surface id="answer-text" ref={areaRef} value={text} onChange={(e) => setText(e.target.value)} rows={5}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void confirm(); } }}
              placeholder="Write what happened, so you remember it…"
              className="bj-raised w-full rounded-2xl px-4 py-3.5 outline-none resize-none"
              style={{ ...writingFontStyle(font, 19), lineHeight: 1.6, color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />

            <div className="flex items-center gap-2.5 mt-4">
              <span className="hidden sm:inline font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }}>It goes on your answered wall.</span>
              <button type="button" onClick={confirm} disabled={saving}
                className="ml-auto h-11 px-5 rounded-xl font-sans text-[13.5px] font-semibold flex items-center gap-2 disabled:opacity-60 active:scale-[0.97] transition-transform w-full sm:w-auto justify-center"
                style={{
                  background: "linear-gradient(180deg, color-mix(in oklch, var(--bj-sage), white 22%), var(--bj-sage))",
                  color: "color-mix(in oklch, var(--bj-sage) 15%, black)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.4), 0 8px 20px -6px color-mix(in oklch, var(--bj-sage) 55%, transparent)",
                }}>
                {saving ? "Saving…" : "Put it on the wall"} <kbd className="bj-kbd hidden sm:inline-flex" style={{ color: "inherit", background: "transparent", borderColor: "currentColor", opacity: 0.55 }}>⌘↵</kbd>
              </button>
            </div>
          </motion.div>
        </div>
  );
}
