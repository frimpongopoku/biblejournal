"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { SkipForward, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useWritingStore, readingFontStyle, writingFontStyle } from "@/store/writing.store";
import { logPrayer } from "@/services/prayer.service";
import { useMounted } from "@/hooks/useMounted";
import { num, dayNumber, docToText, lastWords } from "@/lib/prayer";
import type { Prayer } from "@/types";
import { PersonDot, forLabel, refLabel } from "./parts";

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * One request at a time, nothing else on screen. "Amen — next" writes what
 * you said (if anything) into that prayer's log; "Not today" just moves on.
 */
export function PrayNow({ queue, onClose }: { queue: Prayer[]; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const readFont = useWritingStore((s) => s.readFont);
  const font = useWritingStore((s) => s.font);
  // The queue is fixed when you start, so praying one doesn't reshuffle the rest.
  const [items] = useState(queue);
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [prayed, setPrayed] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const mounted = useMounted();

  const p = items[i] as Prayer | undefined;
  const done = i >= items.length;

  function next(amen: boolean) {
    if (!p) return;
    if (amen && user) {
      void logPrayer(user.uid, p.id, text).catch((e) => console.error("logPrayer", e));
      setPrayed((n) => n + 1);
    }
    setText("");
    setI((n) => n + 1);
  }
  const nextRef = useRef(next);
  useEffect(() => { nextRef.current = next; });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        if (done) onClose(); else nextRef.current(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose, done]);

  useEffect(() => { if (window.matchMedia("(pointer: fine)").matches) areaRef.current?.focus(); }, [i]);

  function onDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (offset.y > 120 || velocity.y > 600) onClose();
    else if (offset.x < -90 || velocity.x < -500) next(false);
  }

  if (!mounted) return null;
  const verse = p?.scriptures?.[0];
  const said = p ? lastWords(p) : "";
  const body = p ? docToText(p.body) : "";

  return createPortal(
    <motion.div role="dialog" aria-modal="true" aria-label="Pray now" className="pray-room fixed inset-0 z-[95] flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}
      style={{ color: "var(--bj-ink)", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>

      <div className="flex items-center gap-4 px-5 md:px-10 pt-5 md:pt-7 shrink-0">
        <span className="hidden md:inline font-sans text-[12px] font-medium" style={{ color: "var(--bj-ink4)" }}>Pray now</span>
        <div className="flex-1 md:flex-none md:w-[360px] flex gap-1.5" aria-hidden>
          {items.map((_, k) => (
            <i key={k} className="flex-1 h-[3px] rounded-full" style={{
              background: k < i ? "var(--bj-gold)" : k === i ? "color-mix(in oklch, var(--bj-gold) 45%, transparent)" : "color-mix(in oklch, var(--bj-ink) 10%, transparent)",
              transition: "background-color 0.3s ease",
            }} />
          ))}
        </div>
        <span className="font-sans text-[12px] font-medium shrink-0" style={{ color: "var(--bj-ink3)", fontVariantNumeric: "tabular-nums" }}>
          {done ? `${items.length} of ${items.length}` : `${i + 1} of ${items.length}`}
        </span>
        <button type="button" onClick={onClose} className="ml-auto flex items-center gap-2 h-9 px-2 rounded-lg font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }} aria-label="Finish">
          <kbd className="bj-kbd hidden md:inline-flex">esc</kbd><span className="hidden md:inline">finish</span><X size={18} className="md:hidden" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center px-5 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" className="text-center max-w-[560px]"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
              <p className="font-display" style={{ fontSize: "clamp(40px, 7vw, 60px)", fontWeight: 500, lineHeight: 1.05 }}>Amen.</p>
              <p className="font-sans text-[14px] mt-4" style={{ color: "var(--bj-ink3)" }}>
                {prayed === 0 ? "Nothing logged this time. That’s fine." : `You prayed for ${prayed === 1 ? "one thing" : `${prayed} things`}. It’s in each one’s log.`}
              </p>
              <button type="button" onClick={onClose} className="bj-gold mt-8 h-12 px-7 rounded-[14px] font-sans text-[14.5px] font-semibold">Done</button>
            </motion.div>
          ) : p && (
            <motion.div key={p.id} className="w-full max-w-[720px] text-center py-8"
              drag dragSnapToOrigin dragElastic={0.25} dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} onDragEnd={onDragEnd}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.14 } }}
              transition={{ duration: 0.26, ease: EASE }} style={{ touchAction: "pan-y" }}>
              <div className="flex items-center justify-center gap-2.5 mb-5">
                <PersonDot name={p.for} size={30} />
                <span className="font-sans text-[13px] font-medium" style={{ color: "var(--bj-ink3)" }}>{forLabel(p.for)} · day {num(dayNumber(p))}</span>
              </div>
              <h2 className="font-display mx-auto" style={{ fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 500, lineHeight: 1.08, overflowWrap: "anywhere" }}>
                {p.title || "Untitled prayer"}
              </h2>
              {(said || body) && (
                <p className={`mx-auto mt-5 max-w-[600px] ${said ? "" : "line-clamp-4"}`} style={{ ...writingFontStyle(font, 20), lineHeight: 1.6, color: "var(--bj-ink2)" }}>
                  {said ? <>Last time: “{said}”</> : body}
                </p>
              )}
              {verse && (
                <div className="bj-glass inline-block text-left rounded-[18px] px-5 py-4 mt-7 max-w-[560px]">
                  <p className="font-sans text-[10.5px] font-semibold uppercase mb-1.5" style={{ color: "var(--bj-gold)", letterSpacing: "0.07em" }}>{refLabel(verse)}</p>
                  {verse.text && <p style={{ ...readingFontStyle(readFont, 20), lineHeight: 1.5 }}>“{verse.text}”</p>}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!done && (
        <div className="shrink-0 w-full max-w-[560px] mx-auto px-4 pb-6 md:pb-10 flex flex-col gap-3">
          <textarea data-writing-surface ref={areaRef} value={text} onChange={(e) => setText(e.target.value)} rows={2}
            placeholder="Add a word for today… (optional)" aria-label="What you prayed today"
            className="bj-well w-full rounded-2xl px-4 py-3 outline-none resize-none"
            style={{ ...writingFontStyle(font, 18), color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
          <div className="flex gap-2.5">
            <button type="button" onClick={() => next(false)}
              className="bj-raised bj-lift flex-1 md:flex-none h-12 px-5 rounded-[14px] flex items-center justify-center gap-2 font-sans text-[14px] font-medium whitespace-nowrap" style={{ color: "var(--bj-ink3)" }}>
              <SkipForward size={14} className="max-[360px]:hidden" /> Not today
            </button>
            <button type="button" onClick={() => next(true)}
              className="bj-gold flex-[2] h-12 px-6 rounded-[14px] flex items-center justify-center gap-2 font-sans text-[14.5px] font-semibold">
              Amen — next <kbd className="bj-kbd hidden md:inline-flex" style={{ color: "inherit", opacity: 0.6, background: "transparent", borderColor: "currentColor" }}>↵</kbd>
            </button>
          </div>
          <p className="md:hidden text-center font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>Swipe left to skip · down to finish</p>
        </div>
      )}
    </motion.div>,
    document.body,
  );
}
