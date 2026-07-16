"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { PrincipleIcon } from "@/components/principles/PrincipleIcon";
import { usePrinciplesStore } from "@/store/principles.store";
import { getPrincipleCategory, type Principle } from "@/lib/data/principles";

export function PrincipleCard({ principle, showCategory = false }: { principle: Principle; showCategory?: boolean }) {
  const category = getPrincipleCategory(principle.category);
  const bookmarked = usePrinciplesStore((s) => s.isBookmarked(principle.id));
  const toggleBookmark = usePrinciplesStore((s) => s.toggleBookmark);

  return (
    <Link
      href={`/principles/${principle.id}`}
      className="bj-list-row flex flex-col gap-3 p-5 rounded-2xl h-full group relative"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line-soft)",
        boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-ink) 3%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {showCategory ? (
          <span
            className="font-sans text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1.5"
            style={{
              background: `color-mix(in oklch, ${category.color} 14%, var(--bj-bg))`,
              color: category.color,
              border: `1px solid color-mix(in oklch, ${category.color} 30%, transparent)`,
            }}
          >
            <PrincipleIcon name={category.icon} size={10} />
            {category.label}
          </span>
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in oklch, ${category.color} 16%, var(--bj-bg))` }}
          >
            <PrincipleIcon name={category.icon} size={13} style={{ color: category.color }} />
          </div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleBookmark(principle.id); }}
          className="bj-btn-action w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ color: bookmarked ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}
          title={bookmarked ? "Remove bookmark" : "Bookmark this principle"}
        >
          <Bookmark size={13} fill={bookmarked ? "var(--bj-gold-deep)" : "none"} />
        </button>
      </div>

      <div className="flex-1">
        <h3
          className="font-display mb-1.5"
          style={{
            fontSize: "1.02rem", color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {principle.title}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>
          {principle.reference}
        </span>
      </div>
    </Link>
  );
}
