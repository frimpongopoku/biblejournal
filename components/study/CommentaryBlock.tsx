"use client";

import { Info } from "lucide-react";
import type { CommentaryEntry } from "@/types";
import type { CommentarySource } from "@/lib/commentary-sources";

interface Props {
  entry: CommentaryEntry;
  source: CommentarySource;
  onInfoClick: () => void;
}

function verseRangeLabel(verse: number, endVerse: number | null) {
  return endVerse && endVerse > verse ? `vv. ${verse}–${endVerse}` : `v. ${verse}`;
}

export function CommentaryBlock({ entry, source, onInfoClick }: Props) {
  return (
    <div
      className="my-1 mx-3 pl-4 py-3"
      style={{ borderLeft: "2.5px solid var(--bj-gold-soft)" }}
    >
      <button
        onClick={onInfoClick}
        className="bj-btn-ghost flex items-center gap-1.5 mb-2 px-1.5 py-0.5 -ml-1.5 rounded-md"
      >
        <span className="font-sans text-[10.5px] font-semibold uppercase" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.08em" }}>
          {source.author} on {verseRangeLabel(entry.verse, entry.endVerse)}
        </span>
        <Info size={11} style={{ color: "var(--bj-ink4)" }} />
      </button>
      <p
        className="font-sans whitespace-pre-wrap"
        style={{ fontSize: 15, color: "var(--bj-ink2)", lineHeight: 1.8, letterSpacing: "0.01em" }}
      >
        {entry.text}
      </p>
    </div>
  );
}
