"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Quote, MessageSquare, ScrollText, BookOpen } from "lucide-react";
import { shapeCommentary } from "@/lib/commentary-shape";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { useAuthStore } from "@/store/auth.store";
import { startEntry } from "@/lib/startEntry";
import type { CommentaryEntry } from "@/types";
import type { CommentarySource } from "@/lib/commentary-sources";

function rangeLabel(verse: number, end: number | null | undefined) {
  return end && end > verse ? `vv. ${verse}–${end}` : `v. ${verse}`;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * A commentary entry as a note you can scan: the key thought, numbered
 * points, the word it turns on, the passages it cites, and the full text
 * one tap away.
 */
export function CommentaryNote({
  entry, source, book, chapter, end, onAbout, flat = false,
}: {
  entry: CommentaryEntry;
  source: CommentarySource;
  book?: string;
  chapter?: number;
  /** Last verse this entry covers, when the entry doesn't say. */
  end?: number;
  onAbout?: () => void;
  /** Inline in the text (phones): no card chrome. */
  flat?: boolean;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const openAsk = useFloatWindowsStore((s) => s.openAsk);
  const [full, setFull] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());

  const shaped = useMemo(
    () => shapeCommentary(entry.text, source.id, book && chapter ? { book, chapter } : undefined),
    [entry.text, source.id, book, chapter],
  );
  const range = rangeLabel(entry.verse, entry.endVerse ?? end);
  const where = book && chapter ? `${book} ${chapter}:${entry.verse}${(entry.endVerse ?? end) && (entry.endVerse ?? end)! > entry.verse ? `–${entry.endVerse ?? end}` : ""}` : range;

  async function quote() {
    if (!user) return;
    const content = {
      type: "doc",
      content: [
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: cap(shaped.key) }] }] },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: `${source.author}, on ${where}` }] },
        { type: "paragraph" },
      ],
    };
    await startEntry(user.uid, router.push, { title: `On ${where}`, content: JSON.stringify(content) }, "body");
  }

  return (
    <div className={flat ? "py-1" : "bj-raised rounded-[16px] p-4"} style={flat ? undefined : { borderColor: "color-mix(in oklch, var(--bj-gold) 26%, var(--m-edge))" }}>
      {/* Who and where */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--bj-gold)" }}>{range}</span>
        <span className="font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>· {source.author}</span>
        {onAbout && (
          <button type="button" onClick={onAbout} aria-label={`About ${source.label}`} className="bj-btn-icon w-6 h-6 rounded-full flex items-center justify-center ml-auto" style={{ color: "var(--bj-ink4)" }}>
            <Info size={12} />
          </button>
        )}
      </div>

      {full ? (
        <div className="font-sans text-[13.5px] leading-[1.75] whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-1" style={{ color: "var(--bj-ink2)" }}>{entry.text.trim()}</div>
      ) : (
        <>
          {/* The key thought */}
          <p className="font-read text-[19px] leading-[1.45]" style={{ color: "var(--bj-ink)" }}>{cap(shaped.key)}</p>

          {/* Points */}
          {shaped.points.length > 0 && (
            <ol className="mt-3.5 flex flex-col gap-2.5">
              {shaped.points.map((p, i) => {
                const isOpen = open.has(i);
                return (
                  <li key={i} className="flex gap-2.5">
                    <span className="w-[19px] h-[19px] mt-[1px] rounded-full bj-well shrink-0 flex items-center justify-center font-sans text-[10.5px] font-semibold tabular-nums" style={{ color: "var(--bj-gold)" }}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      {p.phrase && <p className="font-read italic text-[15.5px] leading-snug" style={{ color: "var(--bj-gold)" }}>{p.phrase}</p>}
                      <p className="font-sans text-[13.5px] leading-[1.55] font-medium" style={{ color: "var(--bj-ink2)" }}>{cap(p.lead)}</p>
                      {p.body && (
                        <>
                          <p className={`font-sans text-[13px] leading-[1.6] mt-0.5 ${isOpen ? "" : "line-clamp-2"}`} style={{ color: "var(--bj-ink3)" }}>{p.body}</p>
                          {p.body.length > 150 && (
                            <button type="button" onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                              className="font-sans text-[11.5px] font-medium mt-0.5 hover:underline" style={{ color: "var(--bj-ink4)" }}>
                              {isOpen ? "Less" : "More"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {/* The word it turns on */}
          {shaped.word && (
            <div className="mt-3.5 rounded-[12px] bj-well px-3 py-2.5 flex gap-3 items-baseline">
              <span className="font-read text-[20px] leading-none shrink-0" style={{ color: "var(--bj-ink)" }}>{shaped.word.word}</span>
              <span className="font-sans text-[12px] leading-snug min-w-0" style={{ color: "var(--bj-ink3)" }}>{shaped.word.context}</span>
            </div>
          )}
        </>
      )}

      {/* Passages it cites */}
      {shaped.refs.length > 0 && !full && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {shaped.refs.slice(0, 6).map((r) => (
            <button key={r.label} type="button" onClick={() => openBibleAt({ book: r.book, chapter: r.chapter, verse: r.verse })}
              className="bj-chip h-6 px-2 rounded-full bj-well inline-flex items-center gap-1 font-sans text-[11.5px]" style={{ color: "var(--bj-ink2)" }}>
              <BookOpen size={10} style={{ color: "var(--bj-gold)" }} />{r.label}
            </button>
          ))}
          {shaped.refs.length > 6 && <span className="h-6 px-1 inline-flex items-center font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>+{shaped.refs.length - 6}</span>}
        </div>
      )}

      {/* Do something with it */}
      <div className="mt-3.5 pt-3 flex items-center gap-1 flex-wrap" style={{ borderTop: "1px solid var(--bj-line-soft)" }}>
        <button type="button" onClick={() => void quote()} className="bj-btn-ghost h-7 px-2 rounded-lg flex items-center gap-1.5 font-sans text-[12px]" style={{ color: "var(--bj-ink2)" }}>
          <Quote size={12} style={{ color: "var(--bj-gold)" }} /> Quote in journal
        </button>
        <button type="button" onClick={() => openAsk(`${where}: ${source.author} says “${cap(shaped.key)}” What does this mean for me?`)}
          className="bj-btn-ghost h-7 px-2 rounded-lg flex items-center gap-1.5 font-sans text-[12px]" style={{ color: "var(--bj-ink2)" }}>
          <MessageSquare size={12} style={{ color: "var(--bj-gold)" }} /> Ask
        </button>
        <button type="button" onClick={() => setFull((f) => !f)} aria-pressed={full}
          className="bj-btn-ghost h-7 px-2 rounded-lg flex items-center gap-1.5 font-sans text-[12px] ml-auto" style={{ color: "var(--bj-ink3)" }}>
          <ScrollText size={12} /> {full ? "Summary" : "Full note"}
        </button>
      </div>
    </div>
  );
}

/** One line per entry, for scanning the chapter. */
export function CommentaryLede({ entry, source, end, onClick }: { entry: CommentaryEntry; source: CommentarySource; end?: number; onClick: () => void }) {
  const lede = useMemo(() => shapeCommentary(entry.text, source.id).lede, [entry.text, source.id]);
  return (
    <button type="button" onClick={onClick} className="commentary-lede w-full text-left rounded-[11px] px-2.5 py-2 flex gap-2.5 items-baseline">
      <span className="font-sans text-[11px] font-semibold tabular-nums shrink-0 w-[46px]" style={{ color: "var(--bj-ink4)" }}>{rangeLabel(entry.verse, entry.endVerse ?? end).replace("vv. ", "").replace("v. ", "")}</span>
      <span className="font-sans text-[13px] leading-snug min-w-0 line-clamp-2" style={{ color: "var(--bj-ink3)" }}>{cap(lede)}</span>
    </button>
  );
}
