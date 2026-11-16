"use client";

import type { CommentaryEntry } from "@/types";
import type { CommentarySource } from "@/lib/commentary-sources";
import { CommentaryNote } from "./CommentaryNote";

interface Props {
  entry: CommentaryEntry;
  source: CommentarySource;
  onInfoClick: () => void;
  book?: string;
  chapter?: number;
}

/** Commentary shown inside the text: the same scannable note, without a card. */
export function CommentaryBlock({ entry, source, onInfoClick, book, chapter }: Props) {
  return (
    <div className="my-1 mx-3 pl-4 py-2" style={{ borderLeft: "2.5px solid var(--bj-gold-soft)" }}>
      <CommentaryNote entry={entry} source={source} book={book} chapter={chapter} onAbout={onInfoClick} flat />
    </div>
  );
}
