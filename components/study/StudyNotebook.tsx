"use client";

import { useMemo, useState } from "react";
import { Search, Highlighter, PenLine, CircleHelp } from "lucide-react";
import { PROTESTANT_BOOKS } from "@/lib/bible-books";
import { studyColorHex } from "@/lib/study-colors";
import { previewText } from "@/lib/tiptap-preview";
import type { ScriptureRef, StudyNote, StudyNoteKind } from "@/types";

type Filter = "all" | StudyNoteKind | "open";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "note", label: "Notes" },
  { id: "highlight", label: "Highlights" },
  { id: "question", label: "Questions" },
  { id: "open", label: "Open questions" },
];

const KIND_ICON: Record<StudyNoteKind, React.ElementType> = {
  note: PenLine, question: CircleHelp, highlight: Highlighter,
};

interface Props {
  studyNotes: StudyNote[];
  onJump: (scripture: ScriptureRef) => void;
}

export function StudyNotebook({ studyNotes, onJump }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = studyNotes;
    if (filter === "open") list = list.filter((n) => n.kind === "question" && n.resolved === false);
    else if (filter !== "all") list = list.filter((n) => n.kind === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((n) => {
        const ref = `${n.scripture.book} ${n.scripture.chapter}:${n.scripture.verse}`.toLowerCase();
        return ref.includes(q) || previewText(n.content).toLowerCase().includes(q);
      });
    }
    return list;
  }, [studyNotes, filter, search]);

  const grouped = useMemo(() => {
    const byBook = new Map<string, StudyNote[]>();
    for (const n of filtered) {
      const list = byBook.get(n.scripture.book) ?? [];
      list.push(n);
      byBook.set(n.scripture.book, list);
    }
    for (const list of byBook.values()) {
      list.sort((a, b) => a.scripture.chapter - b.scripture.chapter || a.scripture.verse - b.scripture.verse);
    }
    return [...byBook.entries()].sort(
      ([a], [b]) => PROTESTANT_BOOKS.indexOf(a as never) - PROTESTANT_BOOKS.indexOf(b as never)
    );
  }, [filtered]);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-16 py-8">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="mb-6">
          <p className="font-sans text-[11px] mb-2" style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Study
          </p>
          <h1 className="font-display mb-1" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.1 }}>
            Notebook
          </h1>
          <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)" }}>
            Everything you've highlighted, noted, or asked — across the whole Bible.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
          <Search size={13} style={{ color: "var(--bj-ink4)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes and questions…"
            className="flex-1 bg-transparent outline-none font-sans text-sm"
            style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
          />
        </div>

        {/* Kind filters */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="bj-chip font-sans text-xs px-3 py-1.5 rounded-xl"
                style={{
                  background: active ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                  color: active ? "white" : "var(--bj-ink3)",
                  fontWeight: active ? 500 : 400,
                  border: `1px solid ${active ? "transparent" : "var(--bj-line-soft)"}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {grouped.length === 0 && (
          <p className="font-sans text-sm py-16 text-center" style={{ color: "var(--bj-ink4)" }}>
            {studyNotes.length === 0
              ? "No annotations yet — head to Read and tap a verse to get started."
              : "Nothing matches that search or filter."}
          </p>
        )}

        <div className="flex flex-col gap-8">
          {grouped.map(([book, notes]) => (
            <div key={book}>
              <p className="font-display text-lg mb-3" style={{ color: "var(--bj-ink)" }}>{book}</p>
              <div className="flex flex-col gap-2">
                {notes.map((n) => {
                  const Icon = KIND_ICON[n.kind];
                  return (
                    <button
                      key={n.id}
                      onClick={() => onJump(n.scripture)}
                      className="bj-list-row flex items-start gap-3 px-3 py-2.5 rounded-xl text-left"
                      style={{ border: "1px solid var(--bj-line-soft)" }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: n.kind === "highlight" ? studyColorHex(n.color) : "var(--bj-bg-soft)",
                          color: n.kind === "highlight" ? "white" : n.kind === "question" && n.resolved === false ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                        }}
                      >
                        <Icon size={11} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-xs font-medium" style={{ color: "var(--bj-ink4)" }}>
                          {n.scripture.chapter}:{n.scripture.verse}
                          {n.kind === "question" && (n.resolved ? " · resolved" : " · open")}
                        </p>
                        {n.kind !== "highlight" && (
                          <p className="font-sans text-sm truncate" style={{ color: "var(--bj-ink2)" }}>
                            {previewText(n.content) || "—"}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
