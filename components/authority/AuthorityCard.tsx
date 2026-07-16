"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { AuthorityIcon } from "@/components/authority/AuthorityIcon";
import { useAuthorityStore } from "@/store/authority.store";
import { getAuthorityCategory, getAuthorityKind, type AuthorityEntry } from "@/lib/data/authority";

export function AuthorityCard({ entry, showCategory = false }: { entry: AuthorityEntry; showCategory?: boolean }) {
  const category = getAuthorityCategory(entry.category);
  const kind = getAuthorityKind(entry.kind);
  const bookmarked = useAuthorityStore((s) => s.isBookmarked(entry.id));
  const toggleBookmark = useAuthorityStore((s) => s.toggleBookmark);

  return (
    <Link
      href={`/authority/${entry.id}`}
      className="bj-list-row flex flex-col gap-3 p-5 rounded-2xl h-full group relative"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line-soft)",
        boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-ink) 3%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{
            background: `color-mix(in oklch, ${kind.color} 16%, var(--bj-bg))`,
            color: kind.color,
          }}
        >
          {kind.label}
        </span>
        <button
          onClick={(e) => { e.preventDefault(); toggleBookmark(entry.id); }}
          className="bj-btn-action w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ color: bookmarked ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}
          title={bookmarked ? "Remove bookmark" : "Bookmark this"}
        >
          <Bookmark size={13} fill={bookmarked ? "var(--bj-gold-deep)" : "none"} />
        </button>
      </div>

      {showCategory && (
        <span
          className="font-sans text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit"
          style={{
            background: `color-mix(in oklch, ${category.color} 14%, var(--bj-bg))`,
            color: category.color,
            border: `1px solid color-mix(in oklch, ${category.color} 30%, transparent)`,
          }}
        >
          <AuthorityIcon name={category.icon} size={10} />
          {category.label}
        </span>
      )}

      <div className="flex-1">
        <h3
          className="font-display mb-1.5"
          style={{
            fontSize: "1.02rem", color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {entry.title}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>
          {entry.reference}
        </span>
      </div>
    </Link>
  );
}
