"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { ParablesIcon } from "@/components/parables/ParablesIcon";
import { ParableCard } from "@/components/parables/ParableCard";
import { useParablesStore } from "@/store/parables.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { PARABLE_ENTRIES, getParableEntryById, getParablePart } from "@/lib/data/parables";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function ParableDetailPage() {
  const params = useParams<{ id: string }>();
  const entry = getParableEntryById(params.id);
  const [copied, setCopied] = useState(false);

  const bookmarked = useParablesStore((s) => (entry ? s.isBookmarked(entry.id) : false));
  const toggleBookmark = useParablesStore((s) => s.toggleBookmark);
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);

  const index = useMemo(() => (entry ? PARABLE_ENTRIES.findIndex((e) => e.id === entry.id) : -1), [entry]);
  const prev = useMemo(() => (index >= 0 ? PARABLE_ENTRIES[(index - 1 + PARABLE_ENTRIES.length) % PARABLE_ENTRIES.length] : null), [index]);
  const next = useMemo(() => (index >= 0 ? PARABLE_ENTRIES[(index + 1) % PARABLE_ENTRIES.length] : null), [index]);

  const related = useMemo(() => {
    if (!entry) return [];
    return PARABLE_ENTRIES.filter((e) => e.part === entry.part && e.id !== entry.id).slice(0, 3);
  }, [entry]);

  if (!entry) return notFound();

  const part = getParablePart(entry.part);

  function copyReference() {
    if (!entry) return;
    const refs = entry.references.map((r) => r.label).join(", ");
    navigator.clipboard.writeText(`${entry.title} — ${refs}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-6 md:pt-10 pb-24" style={{ maxWidth: 760 }}>

        {/* ── Back ─────────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-6">
          <Link
            href="/parables"
            className="bj-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs"
            style={{ color: "var(--bj-ink3)" }}
          >
            <ArrowLeft size={13} />
            All parables
          </Link>
        </motion.div>

        {/* ── Part + genre note ──────────────────────────── */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="flex items-center gap-2 mb-5 flex-wrap">
          <span
            className="font-sans text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
            style={{
              background: `color-mix(in oklch, ${part.color} 14%, var(--bj-bg))`,
              color: part.color,
              border: `1px solid color-mix(in oklch, ${part.color} 30%, transparent)`,
            }}
          >
            <ParablesIcon name={part.icon} size={12} />
            {part.partNumber} · {part.label}
          </span>
          {entry.genreNote && (
            <span
              className="font-sans text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: "color-mix(in oklch, var(--bj-ink3) 14%, var(--bj-bg))", color: "var(--bj-ink3)" }}
            >
              {entry.genreNote}
            </span>
          )}
        </motion.div>

        {/* ── Title + references ──────────────────────────── */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="mb-8">
          <h1
            className="font-display mb-4"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.3, letterSpacing: "-0.005em" }}
          >
            {entry.title}
          </h1>

          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {entry.references.map((ref) => (
              <button
                key={ref.label}
                onClick={() => openBibleAt({ book: ref.book, chapter: ref.chapter, verse: ref.verse })}
                className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-semibold"
                style={{ border: "1px solid var(--bj-line)", color: "var(--bj-gold-deep)" }}
                title={`Read ${ref.label} in Bible`}
              >
                <BookOpen size={12} /> {ref.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={copyReference}
              className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: "var(--bj-ink4)" }}
              title="Copy reference"
            >
              {copied ? <Check size={13} style={{ color: "var(--bj-sage)" }} /> : <Copy size={13} />}
            </button>
            <button
              onClick={() => toggleBookmark(entry.id)}
              className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: bookmarked ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}
              title={bookmarked ? "Remove bookmark" : "Bookmark this"}
            >
              <Bookmark size={13} fill={bookmarked ? "var(--bj-gold-deep)" : "none"} />
            </button>
          </div>
        </motion.div>

        {/* ── Summary ──────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="mb-6">
          <p className="font-sans" style={{ color: "var(--bj-ink2)", fontSize: 16, lineHeight: 1.8 }}>
            {entry.summary}
          </p>
        </motion.div>

        {/* ── Historical context ──────────────────────────────────── */}
        <motion.div
          variants={fadeUp} custom={4} initial="hidden" animate="show"
          className="rounded-2xl p-6 md:p-8 mb-6"
          style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
        >
          <p className="font-sans text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--bj-ink4)" }}>
            Historical &amp; cultural context
          </p>
          <p className="font-sans" style={{ color: "var(--bj-ink2)", fontSize: 15.5, lineHeight: 1.85 }}>
            {entry.context}
          </p>
        </motion.div>

        {/* ── Symbols glossary ──────────────────────────────────── */}
        <motion.div
          variants={fadeUp} custom={5} initial="hidden" animate="show"
          className="rounded-2xl p-6 md:p-8 mb-6"
          style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
        >
          <p className="font-sans text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--bj-ink4)" }}>
            Symbols &amp; figures
          </p>
          <dl className="flex flex-col gap-4">
            {entry.symbols.map((s) => (
              <div key={s.term} className="grid gap-1" style={{ gridTemplateColumns: "minmax(120px, 34%) 1fr" }}>
                <dt className="font-sans text-sm font-semibold" style={{ color: "var(--bj-gold-deep)" }}>{s.term}</dt>
                <dd className="font-sans text-sm" style={{ color: "var(--bj-ink3)", lineHeight: 1.65 }}>{s.meaning}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* ── Sources ──────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" className="mb-10">
          <p className="font-sans text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--bj-ink4)" }}>
            Sources for further study
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {entry.sources.map((src) => (
              <a
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs flex items-center gap-1 hover:underline"
                style={{ color: "var(--bj-ink4)" }}
              >
                {src.label} <ExternalLink size={10} />
              </a>
            ))}
          </div>
          <p className="font-sans text-xs mt-5 pt-5" style={{ color: "var(--bj-ink4)", borderTop: "1px solid var(--bj-line-soft)" }}>
            Read the full passage yourself at{" "}
            <span style={{ color: "var(--bj-gold-deep)", fontWeight: 500 }}>{entry.references.map((r) => r.label).join(" · ")}</span> —
            context helps you understand it, but scripture is always worth reading in its own words.
          </p>
        </motion.div>

        {/* ── Prev / Next ──────────────────────────────── */}
        <motion.div variants={fadeUp} custom={7} initial="hidden" animate="show" className="flex items-stretch gap-3 mb-10">
          {prev && (
            <Link
              href={`/parables/${prev.id}`}
              className="bj-list-row flex-1 flex items-center gap-2 px-4 py-3 rounded-xl min-w-0"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <ChevronLeft size={14} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
              <div className="min-w-0">
                <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>Previous</p>
                <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink2)" }}>{prev.title}</p>
              </div>
            </Link>
          )}
          {next && (
            <Link
              href={`/parables/${next.id}`}
              className="bj-list-row flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl min-w-0 text-right"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <div className="min-w-0">
                <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>Next</p>
                <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink2)" }}>{next.title}</p>
              </div>
              <ChevronRight size={14} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
            </Link>
          )}
        </motion.div>

        {/* ── Related ──────────────────────────────────── */}
        {related.length > 0 && (
          <motion.section variants={fadeUp} custom={8} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                More on {part.label}
              </h2>
              <Link
                href={`/parables?part=${part.id}`}
                className="font-sans text-xs flex items-center gap-1"
                style={{ color: "var(--bj-gold-deep)" }}
              >
                See all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((e) => (
                <ParableCard key={e.id} entry={e} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
