"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BookOpen, MessageSquare, HeartHandshake, ArrowUpRight, X } from "lucide-react";
import { findProseRefs } from "@/lib/bible-ref-parser";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { feelingColor } from "@/lib/feelings";
import { cachedDocText } from "./JournalParts";
import type { JournalEntry } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { PhotosPanel } from "./EntryPhotos";

const LABEL = "font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-2.5";

/**
 * The glass panel beside the page: what this entry is about, and the
 * other pages it rhymes with. Nothing here needs a click to be useful.
 */
export function Companion({ entry, entries, onClose }: { entry: JournalEntry; entries: JournalEntry[]; onClose: () => void }) {
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const openAsk = useFloatWindowsStore((s) => s.openAsk);
  const text = cachedDocText(entry.content);

  // Passages: saved scripture refs first, then ones written in the text.
  const passages = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; book: string; chapter: number; verse?: number }[] = [];
    for (const s of entry.scriptures ?? []) {
      const label = `${s.book} ${s.chapter}${s.verse ? `:${s.verse}${s.endVerse ? `–${s.endVerse}` : ""}` : ""}`;
      if (!seen.has(label)) { seen.add(label); out.push({ label, book: s.book, chapter: s.chapter, verse: s.verse }); }
    }
    for (const r of findProseRefs(text)) {
      if (!seen.has(r.label)) { seen.add(r.label); out.push({ label: r.label, book: r.ref.book, chapter: r.ref.chapter, verse: r.ref.verse }); }
      if (out.length >= 4) break;
    }
    return out.slice(0, 4);
  }, [entry.scriptures, text]);

  // Echoes: other pages sharing a book, a tag or a feeling — strongest first.
  const echoes = useMemo(() => {
    const books = new Set(passages.map((p) => p.book));
    const tags = new Set(entry.tags);
    return entries
      .filter((e) => e.id !== entry.id)
      .map((e) => {
        let score = 0;
        const why: string[] = [];
        const eBooks = new Set([...(e.scriptures ?? []).map((s) => s.book)]);
        const sharedBook = [...books].find((b) => eBooks.has(b));
        if (sharedBook) { score += 3; why.push(`also ${sharedBook}`); }
        const sharedTag = e.tags.find((t) => tags.has(t));
        if (sharedTag) { score += 2; why.push(`#${sharedTag}`); }
        if (entry.feeling && e.feeling === entry.feeling) { score += 1; why.push(`also ${entry.feeling.toLowerCase()}`); }
        return { e, score, why };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || +b.e.createdAt - +a.e.createdAt)
      .slice(0, 4);
  }, [entries, entry, passages]);

  const uid = useAuthStore((s) => s.user?.uid);
  const photos = useMemo(() => {
    const pool = entries.filter((e) => e.id !== entry.id && e.cover?.url);
    const same = entry.feeling ? pool.filter((e) => e.feeling === entry.feeling) : [];
    return (same.length >= 3 ? same : pool).slice(0, 6);
  }, [entries, entry]);

  return (
    <div className="bj-glass bj-enter h-full rounded-[20px] flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-1">
        <span className="font-display text-[17px] flex-1" style={{ color: "var(--bj-ink)" }}>Beside this page</span>
        <button type="button" onClick={onClose} aria-label="Hide panel" title="Hide (⌘J)"
          className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-3 flex flex-col gap-6 bj-stagger">
        {uid && <PhotosPanel entry={entry} uid={uid} />}
        <section>
          <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>In this entry</p>
          {passages.length ? (
            <div className="flex flex-col gap-2">
              {passages.map((p) => (
                <button key={p.label} type="button" onClick={() => openBibleAt({ book: p.book, chapter: p.chapter, verse: p.verse })}
                  className="bj-raised bj-lift rounded-[14px] px-3.5 py-3 flex items-center gap-2.5 text-left">
                  <BookOpen size={14} style={{ color: "var(--bj-gold)" }} />
                  <span className="font-sans text-[13.5px] font-medium flex-1" style={{ color: "var(--bj-ink)" }}>{p.label}</span>
                  <span className="font-sans text-[11.5px] flex items-center gap-0.5" style={{ color: "var(--bj-gold)" }}>Read <ArrowUpRight size={11} /></span>
                </button>
              ))}
            </div>
          ) : (
            <p className="font-display italic text-[15px] leading-snug" style={{ color: "var(--bj-ink4)" }}>
              Quote a verse with <span className="font-sans not-italic text-[12px] px-1.5 py-0.5 rounded" style={{ background: "var(--m-hover)" }}>/verse</span> or just type a reference like John 3:16.
            </p>
          )}
        </section>

        {echoes.length > 0 && (
          <section>
            <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>Echoes</p>
            <div className="flex flex-col gap-2">
              {echoes.map(({ e, why }) => (
                <Link key={e.id} href={`/journal?entry=${e.id}`} className="bj-raised bj-lift rounded-[14px] p-2.5 flex gap-2.5 items-center">
                  {e.cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.cover.url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="bj-well w-10 h-10 rounded-lg shrink-0 flex flex-col items-center justify-center">
                      <span className="font-display text-[15px] leading-none" style={{ color: "var(--bj-ink2)" }}>{e.createdAt.getDate()}</span>
                      <span className="font-sans text-[8.5px] uppercase mt-0.5" style={{ color: "var(--bj-ink4)" }}>{e.createdAt.toLocaleDateString("en-US", { month: "short" })}</span>
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      {feelingColor(e.feeling) && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: feelingColor(e.feeling)! }} />}
                      <span className="font-sans text-[13px] font-medium truncate" style={{ color: "var(--bj-ink)" }}>{e.title || "Untitled"}</span>
                    </span>
                    <span className="block font-sans text-[11.5px] mt-0.5 truncate" style={{ color: "var(--bj-ink4)" }}>{why.join(" · ")}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section>
            <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>{entry.feeling && photos.every((p) => p.feeling === entry.feeling) ? `Other ${entry.feeling.toLowerCase()} days` : "From your pages"}</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((e) => (
                <Link key={e.id} href={`/journal?entry=${e.id}`} title={e.title || "Untitled"} className="block rounded-[10px] overflow-hidden aspect-square bj-lift"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.cover!.url} alt="" loading="lazy" className="w-full h-full object-cover" style={{ background: e.cover!.tint ?? "var(--bj-bg-soft)" }} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>Tools</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => openAsk(entry.title || undefined)} className="bj-raised bj-lift rounded-[14px] p-3 flex flex-col gap-2 text-left">
              <MessageSquare size={15} style={{ color: "var(--bj-gold)" }} />
              <span className="font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink)" }}>Ask about this</span>
            </button>
            <Link href="/prayer" className="bj-raised bj-lift rounded-[14px] p-3 flex flex-col gap-2">
              <HeartHandshake size={15} style={{ color: "var(--bj-gold)" }} />
              <span className="font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink)" }}>Prayer list</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
