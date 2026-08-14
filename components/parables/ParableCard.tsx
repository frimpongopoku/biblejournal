"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ParablesIcon } from "@/components/parables/ParablesIcon";
import { useParablesStore } from "@/store/parables.store";
import { getParablePart, type ParableEntry } from "@/lib/data/parables";

export function ParableCard({ entry, showPart = false }: { entry: ParableEntry; showPart?: boolean }) {
  const part = getParablePart(entry.part);
  const bookmarked = useParablesStore((s) => s.isBookmarked(entry.id));
  const toggleBookmark = useParablesStore((s) => s.toggleBookmark);
  const refLabel = entry.references[0].label + (entry.references.length > 1 ? ` +${entry.references.length - 1}` : "");

  return (
    <Link
      href={`/parables/${entry.id}`}
      className="bj-list-row flex flex-col gap-3 p-5 rounded-2xl h-full group relative"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line-soft)",
        boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-ink) 3%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {entry.genreNote ? (
          <span
            className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: "color-mix(in oklch, var(--bj-ink3) 14%, var(--bj-bg))", color: "var(--bj-ink3)" }}
          >
            Figure of speech
          </span>
        ) : (
          <span
            className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: `color-mix(in oklch, ${part.color} 16%, var(--bj-bg))`, color: part.color }}
          >
            {part.partNumber}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleBookmark(entry.id); }}
          className="bj-btn-action w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ color: bookmarked ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}
          title={bookmarked ? "Remove bookmark" : "Bookmark this"}
        >
          <Bookmark size={13} fill={bookmarked ? "var(--bj-gold-deep)" : "none"} />
        </button>
      </div>

      {showPart && (
        <span
          className="font-sans text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit"
          style={{
            background: `color-mix(in oklch, ${part.color} 14%, var(--bj-bg))`,
            color: part.color,
            border: `1px solid color-mix(in oklch, ${part.color} 30%, transparent)`,
          }}
        >
          <ParablesIcon name={part.icon} size={10} />
          {part.label}
        </span>
      )}

      <div className="flex-1">
        <h3
          className="font-display mb-1.5"
          style={{ fontSize: "1.05rem", color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1.35 }}
        >
          {entry.title}
        </h3>
        <p
          className="font-sans text-xs"
          style={{
            color: "var(--bj-ink4)", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {entry.summary}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>
          {refLabel}
        </span>
      </div>
    </Link>
  );
}
