"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, ChevronLeft, ChevronRight,
  Users, MapPin, Landmark,
} from "lucide-react";
import { EraIconGlyph } from "@/components/timeline/EraIconGlyph";
import { EraSourcesBlock } from "@/components/timeline/EraSourcesBlock";
import { AddToNoteButton } from "@/components/timeline/AddToNoteButton";
import { useTimelineStore } from "@/store/timeline.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { TIMELINE_ERAS, getEraById, getEraIndex, type TimelineEvent, type TimelineEra } from "@/lib/data/timeline";
import type { JournalEntry } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.05, 0.4), duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function EventBlock({
  event, era, color, index, entries,
}: {
  event: TimelineEvent; era: TimelineEra; color: string; index: number; entries: JournalEntry[];
}) {
  const bookmarked = useTimelineStore((s) => s.isBookmarked(event.id));
  const toggleBookmark = useTimelineStore((s) => s.toggleBookmark);
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);

  return (
    <motion.div
      variants={fadeUp} custom={index + 4} initial="hidden" animate="show"
      className="rounded-2xl p-5 md:p-6"
      style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-sans text-[11px] font-medium mb-1" style={{ color }}>
            {event.dateLabel}
          </p>
          <h3 className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
            {event.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <AddToNoteButton label={`${era.name} — ${event.title}`} text={event.summary} entries={entries} />
          <button
            onClick={() => toggleBookmark(event.id)}
            className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ color: bookmarked ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}
            title={bookmarked ? "Remove bookmark" : "Bookmark this event"}
          >
            <Bookmark size={13} fill={bookmarked ? "var(--bj-gold-deep)" : "none"} />
          </button>
        </div>
      </div>

      <p className="font-sans text-[14px] mb-4" style={{ color: "var(--bj-ink2)", lineHeight: 1.8 }}>
        {event.summary}
      </p>

      {(event.figures.length > 0 || event.places.length > 0) && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          {event.figures.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Users size={12} className="mt-0.5 shrink-0" style={{ color: "var(--bj-ink4)" }} />
              <span className="font-sans text-[12px]" style={{ color: "var(--bj-ink3)" }}>
                {event.figures.join(" · ")}
              </span>
            </div>
          )}
          {event.places.length > 0 && (
            <div className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0" style={{ color: "var(--bj-ink4)" }} />
              <span className="font-sans text-[12px]" style={{ color: "var(--bj-ink3)" }}>
                {event.places.join(" · ")}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {event.refs.map((ref) => (
          <button
            key={ref.label}
            onClick={() => openBibleAt({ book: ref.book, chapter: ref.chapter, verse: ref.verse })}
            className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-[11px]"
            style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink2)" }}
          >
            <BookOpen size={11} /> {ref.label}
          </button>
        ))}
      </div>

      {event.corroboration && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2.5 mt-1"
          style={{ background: "var(--bj-bg-soft)" }}
        >
          <Landmark size={12} className="mt-0.5 shrink-0" style={{ color: "var(--bj-ink4)" }} />
          <p className="font-sans text-[11.5px]" style={{ color: "var(--bj-ink3)", lineHeight: 1.7 }}>
            <span style={{ color: "var(--bj-ink4)", fontWeight: 500 }}>Historical note: </span>
            {event.corroboration}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function TimelineEraPage() {
  const params = useParams<{ id: string }>();
  const era = getEraById(params.id);
  const markVisited = useTimelineStore((s) => s.markVisited);
  const { entries } = useJournalEntries();

  const index = useMemo(() => (era ? getEraIndex(era.id) : -1), [era]);
  const prev = index > 0 ? TIMELINE_ERAS[index - 1] : null;
  const next = index >= 0 && index < TIMELINE_ERAS.length - 1 ? TIMELINE_ERAS[index + 1] : null;

  useEffect(() => {
    if (era) markVisited(era.id);
  }, [era, markVisited]);

  if (!era) return notFound();

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-6 md:pt-10 pb-24" style={{ maxWidth: 760 }}>

        {/* ── Back ─────────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-6">
          <Link
            href="/timeline"
            className="bj-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs"
            style={{ color: "var(--bj-ink3)" }}
          >
            <ArrowLeft size={13} />
            The Trail
          </Link>
        </motion.div>

        {/* ── Era header ───────────────────────────────── */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="flex items-start gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in oklch, ${era.color} 16%, var(--bj-bg))`, color: era.color }}
          >
            <EraIconGlyph name={era.icon} size={22} />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-[10px] uppercase tracking-widest mb-1" style={{ color: era.color }}>
              Era {String(era.order).padStart(2, "0")} of {TIMELINE_ERAS.length}
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.3 }}>
              {era.name}
            </h1>
          </div>
        </motion.div>

        <motion.p variants={fadeUp} custom={2} initial="hidden" animate="show" className="font-sans text-sm font-medium mb-6" style={{ color: "var(--bj-ink3)" }}>
          {era.dateRange}
        </motion.p>

        <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="flex items-start gap-2 mb-10">
          <p className="font-sans flex-1" style={{ color: "var(--bj-ink2)", fontSize: 16, lineHeight: 1.9 }}>
            {era.summary}
          </p>
          <AddToNoteButton label={era.name} text={era.summary} entries={entries} />
        </motion.div>

        {/* ── Events ───────────────────────────────────── */}
        <div className="flex flex-col gap-4 mb-10">
          {era.events.map((event, i) => (
            <EventBlock key={event.id} event={event} era={era} color={era.color} index={i} entries={entries} />
          ))}
        </div>

        {/* ── Sources ──────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={era.events.length + 4} initial="hidden" animate="show" className="mb-10">
          <EraSourcesBlock sources={era.sources} dateCaveat={era.dateCaveat} />
        </motion.div>

        {/* ── Prev / Next ──────────────────────────────── */}
        <motion.div variants={fadeUp} custom={era.events.length + 5} initial="hidden" animate="show" className="flex items-stretch gap-3">
          {prev ? (
            <Link
              href={`/timeline/${prev.id}`}
              className="bj-list-row flex-1 flex items-center gap-2 px-4 py-3 rounded-xl min-w-0"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <ChevronLeft size={14} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
              <div className="min-w-0">
                <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>Previous era</p>
                <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink2)" }}>{prev.name}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link
              href={`/timeline/${next.id}`}
              className="bj-list-row flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl min-w-0 text-right"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <div className="min-w-0">
                <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>Next era</p>
                <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink2)" }}>{next.name}</p>
              </div>
              <ChevronRight size={14} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
            </Link>
          ) : <div className="flex-1" />}
        </motion.div>
      </div>
    </div>
  );
}
