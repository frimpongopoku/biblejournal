"use client";

import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { useWritingStore, readingFontStyle } from "@/store/writing.store";
import { hueFor, initialOf } from "@/lib/prayer";
import type { ScriptureRef } from "@/types";

/** A person's initial in their own steady colour. "Me" when it's for yourself. */
export function PersonDot({ name, size = 28 }: { name?: string; size?: number }) {
  const who = name?.trim() || "Me";
  const c = name?.trim() ? hueFor(who) : "var(--bj-gold)";
  return (
    <span aria-hidden className="rounded-full shrink-0 flex items-center justify-center font-sans font-semibold"
      style={{
        width: size, height: size, fontSize: who === "Me" ? size * 0.36 : size * 0.42,
        color: c, background: `color-mix(in oklch, ${c} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${c} 32%, transparent)`,
      }}>
      {who === "Me" ? "Me" : initialOf(who)}
    </span>
  );
}

export function forLabel(name?: string) {
  return name?.trim() ? `For ${name.trim()}` : "For me";
}

/** Tiny squares, one per day; filled where you prayed. */
export function DayStrip({ days, size = 9, gap = 3 }: { days: boolean[]; size?: number; gap?: number }) {
  return (
    <span className="inline-flex" style={{ gap }} aria-label={`Prayed on ${days.filter(Boolean).length} of the last ${days.length} days`}>
      {days.map((on, i) => (
        <i key={i} className="block rounded-[2px]" style={{
          width: size, height: size,
          background: on ? "var(--bj-gold)" : "color-mix(in oklch, var(--bj-ink) 9%, transparent)",
          opacity: on ? 0.9 : 1,
        }} />
      ))}
    </span>
  );
}

export function refLabel(r: ScriptureRef) {
  return `${r.book} ${r.chapter}${r.verse ? `:${r.verse}${r.endVerse && r.endVerse !== r.verse ? `–${r.endVerse}` : ""}` : ""}`;
}

/** A verse you stand on: tap to open it in the floating Bible. */
export function VerseCard({ r, size = 17.5, onRemove }: { r: ScriptureRef; size?: number; onRemove?: () => void }) {
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const readFont = useWritingStore((s) => s.readFont);
  return (
    <div className="group bj-raised rounded-2xl px-4 py-3.5 relative">
      <button type="button" onClick={() => openBibleAt({ book: r.book, chapter: r.chapter, verse: r.verse })} className="block text-left w-full">
        <span className="block font-sans text-[10.5px] font-semibold uppercase mb-1.5" style={{ color: "var(--bj-gold)", letterSpacing: "0.07em" }}>{refLabel(r)}{r.version ? ` · ${r.version}` : ""}</span>
        {r.text
          ? <span className="block leading-[1.45]" style={{ ...readingFontStyle(readFont, size), color: "var(--bj-ink)" }}>“{r.text}”</span>
          : <span className="block font-sans text-[12.5px]" style={{ color: "var(--bj-ink4)" }}>Open in the Bible</span>}
      </button>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${refLabel(r)}`}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity font-sans text-[14px]"
          style={{ color: "var(--bj-ink4)" }}>×</button>
      )}
    </div>
  );
}

export const STAND_ON: ScriptureRef = {
  book: "Philippians", chapter: 4, verse: 6, version: "ESV",
  text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
};
