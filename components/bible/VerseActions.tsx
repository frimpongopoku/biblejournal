"use client";

import { motion } from "framer-motion";
import { PenLine, NotebookPen, Columns2, MessageSquare, Copy, Check, X } from "lucide-react";
import { STUDY_COLORS } from "@/lib/study-colors";

export interface VerseActionHandlers {
  label: string;
  activeColor: string | null;
  copied: boolean;
  onColor: (id: string) => void;
  onNote: () => void;
  onReflect: () => void;
  onCompare: () => void;
  onAsk: () => void;
  onCopy: () => void;
  onClear: () => void;
}

function Swatches({ activeColor, onColor, size }: { activeColor: string | null; onColor: (id: string) => void; size: number }) {
  return (
    <>
      {STUDY_COLORS.map((c, i) => {
        const on = activeColor === c.id;
        return (
          <button key={c.id} type="button" onClick={() => onColor(c.id)}
            aria-label={`${on ? "Remove" : "Highlight"} ${c.label}`} aria-pressed={on} title={`${c.label} (${i + 1})`}
            className="bj-swatch rounded-full shrink-0"
            style={{ width: size, height: size, background: c.hex, boxShadow: on ? `0 0 0 2px var(--bj-bg-panel), 0 0 0 3.5px ${c.hex}` : "none" }} />
        );
      })}
    </>
  );
}

const btn = "flex items-center gap-1.5 h-8 px-2.5 rounded-lg font-sans text-[12.5px] font-medium whitespace-nowrap bj-btn-ghost";

/** Floating bar above the selected verses (desktop). */
export function VerseActionBar({ h, top, left }: { h: VerseActionHandlers; top: number; left: number }) {
  return (
    <motion.div
      role="toolbar"
      aria-label={`Actions for ${h.label}`}
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
      onMouseDown={(e) => e.preventDefault()}
      className="absolute z-20 flex items-center gap-0.5 p-1 rounded-xl"
      style={{
        top, left, transformOrigin: "bottom left",
        background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)",
      }}
    >
      <span className="font-sans text-[12px] font-semibold px-2 whitespace-nowrap" style={{ color: "var(--bj-gold-deep)" }}>{h.label}</span>
      <span className="w-px h-4 mx-1" style={{ background: "var(--bj-line)" }} />
      <div className="flex items-center gap-2 px-1.5"><Swatches activeColor={h.activeColor} onColor={h.onColor} size={16} /></div>
      <span className="w-px h-4 mx-1" style={{ background: "var(--bj-line)" }} />
      <button type="button" onClick={h.onNote} className={btn} style={{ color: "var(--bj-ink2)" }} title="Note (N)"><PenLine size={14} />Note</button>
      <button type="button" onClick={h.onReflect} className={btn} style={{ color: "var(--bj-gold-deep)", background: "var(--bj-gold-tint)" }} title="Reflect in your journal (R)"><NotebookPen size={14} />Reflect</button>
      <button type="button" onClick={h.onCompare} className={btn} style={{ color: "var(--bj-ink2)" }} title="Compare translations"><Columns2 size={14} />Compare</button>
      <button type="button" onClick={h.onAsk} className={btn} style={{ color: "var(--bj-ink2)" }} title="Ask about this passage (A)"><MessageSquare size={14} />Ask</button>
      <button type="button" onClick={h.onCopy} className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center" aria-label="Copy" title="Copy (C)"
        style={{ color: h.copied ? "var(--bj-sage)" : "var(--bj-ink3)" }}>
        {h.copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </motion.div>
  );
}

/** Bottom sheet for the selected verses (phones). */
export function VerseSheet({ h }: { h: VerseActionHandlers }) {
  const item = "flex flex-col items-center justify-center gap-1.5 h-[68px] rounded-2xl font-sans text-[12px] font-medium";
  return (
    <motion.div
      role="dialog"
      aria-label={`Actions for ${h.label}`}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.05, bottom: 0.6 }}
      onDragEnd={(_, info) => { if (info.offset.y > 60 || info.velocity.y > 400) h.onClear(); }}
      className="fixed left-0 right-0 bottom-0 z-[60] md:hidden rounded-t-[20px] px-4 pt-2"
      style={{
        background: "var(--bj-bg-panel)", borderTop: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)",
        paddingBottom: "calc(16px + env(safe-area-inset-bottom))", touchAction: "none",
      }}
    >
      <div className="w-9 h-1 rounded-full mx-auto mb-3" style={{ background: "var(--bj-line)" }} />
      <div className="flex items-center mb-4">
        <span className="font-sans text-[14px] font-semibold" style={{ color: "var(--bj-gold-deep)" }}>{h.label}</span>
        <div className="ml-auto flex items-center gap-3"><Swatches activeColor={h.activeColor} onColor={h.onColor} size={26} /></div>
        <button type="button" onClick={h.onClear} aria-label="Close" className="ml-2 -mr-2 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}><X size={17} /></button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        <button type="button" onClick={h.onReflect} className={item} style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}><NotebookPen size={19} />Reflect</button>
        <button type="button" onClick={h.onNote} className={item} style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink2)" }}><PenLine size={19} />Note</button>
        <button type="button" onClick={h.onCompare} className={item} style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink2)" }}><Columns2 size={19} />Compare</button>
        <button type="button" onClick={h.onAsk} className={item} style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink2)" }}><MessageSquare size={19} />Ask</button>
        <button type="button" onClick={h.onCopy} className={item} style={{ background: "var(--bj-bg-soft)", color: h.copied ? "var(--bj-sage)" : "var(--bj-ink2)" }}>
          {h.copied ? <Check size={19} /> : <Copy size={19} />}{h.copied ? "Copied" : "Copy"}
        </button>
      </div>
    </motion.div>
  );
}
