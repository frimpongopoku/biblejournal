"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS, OT_BOOKS } from "@/lib/bible-books";
import { parseRef } from "@/lib/bible-ref-parser";
import { useReadingStore, chapterKey, chaptersReadIn } from "@/store/reading.store";

interface Props {
  book: string;
  chapter: number;
  version: string;
  onGo: (book: string, chapter: number, verse?: number) => void;
  onClose: () => void;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function relDay(at: number) {
  const d = Math.floor((Date.now() - at) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "Go to passage" — opened with J, so it appears instantly (no animation). */
export function JumpPicker({ book, chapter, version, onGo, onClose }: Props) {
  const read = useReadingStore((s) => s.read);
  const recent = useReadingStore((s) => s.recent);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(book);
  const [testament, setTestament] = useState<"OT" | "NT">(OT_BOOKS.has(book as never) ? "OT" : "NT");

  const ref = q.trim() ? parseRef(q.trim()) : null;
  const matches = useMemo(() => {
    const n = norm(q);
    if (!n || ref) return [];
    return PROTESTANT_BOOKS.filter((b) => norm(b).startsWith(n) || norm(b).replace(/^\d/, "").startsWith(n)).slice(0, 8);
  }, [q, ref]);

  const shownBook = ref?.book ?? matches[0] ?? picked;
  // A typed reference shows its own testament.
  const tab = ref ? (OT_BOOKS.has(ref.book as never) ? "OT" : "NT") : testament;
  const books = PROTESTANT_BOOKS.filter((b) => (tab === "OT") === OT_BOOKS.has(b as never));
  const total = CHAPTER_COUNTS[shownBook] ?? 1;
  const doneInBook = chaptersReadIn(read, shownBook);

  function submit() {
    if (ref) return onGo(ref.book, ref.chapter, ref.verse);
    if (matches[0]) { setPicked(matches[0]); setQ(""); setTestament(OT_BOOKS.has(matches[0] as never) ? "OT" : "NT"); }
  }

  return (
    <div className="fixed inset-0 z-[90] flex justify-center px-3" style={{ paddingTop: "min(12vh, 100px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "color-mix(in oklch, var(--bj-bg) 50%, transparent)" }} />
      <div role="dialog" aria-modal="true" aria-label="Go to passage"
        className="relative w-full self-start rounded-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 720, maxHeight: "min(80vh, 640px)", background: "var(--m-pop-bg)", backdropFilter: "blur(24px) saturate(170%)", WebkitBackdropFilter: "blur(24px) saturate(170%)", border: "1px solid var(--m-edge)", boxShadow: "var(--bj-shadow-lg)" }}>
        <div className="flex items-center gap-3 px-4 shrink-0" style={{ height: 54, borderBottom: "1px solid var(--bj-line-soft)" }}>
          <Search size={16} style={{ color: "var(--bj-ink4)" }} aria-hidden="true" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); submit(); }
              if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
            }}
            placeholder="Book or reference — jn 4, ps 23, rom 8:28"
            aria-label="Book or reference"
            className="flex-1 bg-transparent outline-none font-sans text-base sm:text-[15px] min-w-0"
            style={{ color: "var(--bj-ink)" }}
          />
          {ref ? (
            <span className="font-sans text-[12.5px] whitespace-nowrap" style={{ color: "var(--bj-ink3)" }}>
              ↵ {ref.book} {ref.chapter}{ref.verse ? `:${ref.verse}` : ""} · {version}
            </span>
          ) : <kbd className="bj-kbd">esc</kbd>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.05fr] min-h-0 flex-1 overflow-hidden">
          {/* Books */}
          <div className="p-3 sm:border-r overflow-y-auto max-h-[38vh] sm:max-h-none" style={{ borderColor: "var(--bj-line-soft)" }}>
            {matches.length ? (
              <div className="flex flex-col gap-0.5">
                {matches.map((b, i) => (
                  <button key={b} type="button" onClick={() => { setPicked(b); setQ(""); setTestament(OT_BOOKS.has(b as never) ? "OT" : "NT"); }}
                    className="bj-list-row text-left px-3 h-9 rounded-lg font-sans text-[14px]"
                    style={{ color: "var(--bj-ink)", background: i === 0 ? "var(--bj-gold-tint)" : "transparent" }}>
                    {b} <span style={{ color: "var(--bj-ink4)", fontSize: 12 }}>· {CHAPTER_COUNTS[b]} chapters</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-0.5 p-0.5 rounded-lg mb-2" style={{ background: "var(--bj-bg-soft)" }}>
                  {(["OT", "NT"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => { setTestament(t); setQ(""); }} aria-pressed={tab === t}
                      className="flex-1 h-7 rounded-md font-sans text-[12px]"
                      style={{ background: tab === t ? "var(--bj-line)" : "transparent", color: tab === t ? "var(--bj-ink)" : "var(--bj-ink3)" }}>
                      {t === "OT" ? "Old Testament" : "New Testament"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {books.map((b) => {
                    const on = b === shownBook;
                    return (
                      <button key={b} type="button" onClick={() => setPicked(b)} aria-pressed={on} data-active={on || undefined}
                        className="bj-chip px-2 h-8 rounded-lg font-sans text-[13px]"
                        style={{ color: on ? "var(--bj-gold-deep)" : "var(--bj-ink2)", background: on ? "var(--bj-gold-tint)" : "transparent" }}>
                        {b}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Chapters + recent */}
          <div className="p-3 overflow-y-auto">
            <p className="font-sans text-[11.5px] font-medium mb-2 px-1" style={{ color: "var(--bj-ink4)" }}>
              {shownBook} · {total} {total === 1 ? "chapter" : "chapters"}
              {doneInBook > 0 && <span style={{ color: "var(--bj-sage)" }}> · {doneInBook} read</span>}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: total }, (_, i) => i + 1).map((c) => {
                const current = shownBook === book && c === chapter;
                const done = !!read[chapterKey(shownBook, c)];
                return (
                  <button key={c} type="button" onClick={() => onGo(shownBook, c)}
                    aria-label={`${shownBook} ${c}${done ? ", read" : ""}`} data-active={current || undefined}
                    className="bj-chip h-9 rounded-lg font-sans text-[13px] font-medium"
                    style={{
                      background: current ? "var(--bj-gold)" : done ? "var(--bj-bg-soft)" : "transparent",
                      color: current ? "var(--bj-bg)" : done ? "var(--bj-ink)" : "var(--bj-ink3)",
                      border: current || done ? "1px solid transparent" : "1px solid var(--bj-line-soft)",
                    }}>
                    {c}
                  </button>
                );
              })}
            </div>
            {recent.length > 0 && (
              <>
                <p className="font-sans text-[11.5px] font-medium mt-4 mb-1 px-1" style={{ color: "var(--bj-ink4)" }}>Recent</p>
                {recent.slice(0, 5).map((r) => (
                  <button key={`${r.book}-${r.chapter}`} type="button" onClick={() => onGo(r.book, r.chapter)}
                    className="bj-list-row w-full text-left px-2 h-8 rounded-lg font-sans text-[13px] flex items-center"
                    style={{ color: "var(--bj-ink2)" }}>
                    {r.book} {r.chapter}<span className="ml-auto text-[12px]" style={{ color: "var(--bj-ink4)" }}>{relDay(r.at)}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 shrink-0 font-sans text-[11.5px]" style={{ height: 36, borderTop: "1px solid var(--bj-line-soft)", color: "var(--bj-ink4)" }}>
          <span><kbd className="bj-kbd">J</kbd> open anywhere in the reader</span>
          <span><kbd className="bj-kbd">←</kbd> <kbd className="bj-kbd">→</kbd> chapters</span>
          <span className="ml-auto"><kbd className="bj-kbd">↵</kbd> go</span>
        </div>
      </div>
    </div>
  );
}
