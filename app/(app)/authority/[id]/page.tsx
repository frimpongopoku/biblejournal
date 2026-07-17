"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { AuthorityIcon } from "@/components/authority/AuthorityIcon";
import { AuthorityCard } from "@/components/authority/AuthorityCard";
import { useAuthorityStore } from "@/store/authority.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { AUTHORITY_ENTRIES, getAuthorityCategory, getAuthorityEntryById, getAuthorityKind, testamentOf } from "@/lib/data/authority";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function AuthorityDetailPage() {
  const params = useParams<{ id: string }>();
  const entry = getAuthorityEntryById(params.id);
  const [copied, setCopied] = useState(false);

  const bookmarked = useAuthorityStore((s) => (entry ? s.isBookmarked(entry.id) : false));
  const toggleBookmark = useAuthorityStore((s) => s.toggleBookmark);
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);

  const index = useMemo(() => (entry ? AUTHORITY_ENTRIES.findIndex((e) => e.id === entry.id) : -1), [entry]);
  const prev = useMemo(() => (index >= 0 ? AUTHORITY_ENTRIES[(index - 1 + AUTHORITY_ENTRIES.length) % AUTHORITY_ENTRIES.length] : null), [index]);
  const next = useMemo(() => (index >= 0 ? AUTHORITY_ENTRIES[(index + 1) % AUTHORITY_ENTRIES.length] : null), [index]);

  const related = useMemo(() => {
    if (!entry) return [];
    return AUTHORITY_ENTRIES.filter((e) => e.category === entry.category && e.id !== entry.id).slice(0, 3);
  }, [entry]);

  if (!entry) return notFound();

  const category = getAuthorityCategory(entry.category);
  const kind = getAuthorityKind(entry.kind);
  const testament = testamentOf(entry.book);

  function copyReference() {
    if (!entry) return;
    navigator.clipboard.writeText(`${entry.reference} — ${entry.title}`).then(() => {
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
            href="/authority"
            className="bj-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs"
            style={{ color: "var(--bj-ink3)" }}
          >
            <ArrowLeft size={13} />
            All authority passages
          </Link>
        </motion.div>

        {/* ── Kind + category + testament ───────────────── */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="flex items-center gap-2 mb-5 flex-wrap">
          <span
            className="font-sans text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ background: `color-mix(in oklch, ${kind.color} 16%, var(--bj-bg))`, color: kind.color }}
          >
            {kind.label}
          </span>
          <span
            className="font-sans text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
            style={{
              background: `color-mix(in oklch, ${category.color} 14%, var(--bj-bg))`,
              color: category.color,
              border: `1px solid color-mix(in oklch, ${category.color} 30%, transparent)`,
            }}
          >
            <AuthorityIcon name={category.icon} size={12} />
            {category.label}
          </span>
          <span className="font-sans text-[10px] uppercase tracking-widest px-2 py-1" style={{ color: "var(--bj-ink4)" }}>
            {testament === "OT" ? "Old Testament" : "New Testament"}
          </span>
        </motion.div>

        {/* ── The passage ──────────────────────────────── */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="mb-8">
          <h1
            className="font-display mb-4"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.4, letterSpacing: "-0.005em" }}
          >
            {entry.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-sans text-sm font-semibold" style={{ color: "var(--bj-gold-deep)" }}>
              {entry.reference}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openBibleAt({ book: entry.book, chapter: entry.chapter, verse: entry.verse })}
                className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs"
                style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink2)" }}
              >
                <BookOpen size={12} /> Read in Bible
              </button>
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
          </div>
        </motion.div>

        {/* ── Context ──────────────────────────────────── */}
        <motion.div
          variants={fadeUp} custom={3} initial="hidden" animate="show"
          className="rounded-2xl p-6 md:p-8 mb-10"
          style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
        >
          <p className="font-sans text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--bj-ink4)" }}>
            What this means
          </p>
          <p className="font-sans" style={{ color: "var(--bj-ink2)", fontSize: 16, lineHeight: 1.9 }}>
            {entry.context}
          </p>
          <p className="font-sans text-xs mt-5 pt-5" style={{ color: "var(--bj-ink4)", borderTop: "1px solid var(--bj-line-soft)" }}>
            Read the full passage yourself at <span style={{ color: "var(--bj-gold-deep)", fontWeight: 500 }}>{entry.reference}</span> —
            context helps you understand it, but scripture is always worth reading in its own words.
          </p>
        </motion.div>

        {/* ── Prev / Next ──────────────────────────────── */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="flex items-stretch gap-3 mb-10">
          {prev && (
            <Link
              href={`/authority/${prev.id}`}
              className="bj-list-row flex-1 flex items-center gap-2 px-4 py-3 rounded-xl min-w-0"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <ChevronLeft size={14} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
              <div className="min-w-0">
                <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>Previous</p>
                <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink2)" }}>{prev.reference}</p>
              </div>
            </Link>
          )}
          {next && (
            <Link
              href={`/authority/${next.id}`}
              className="bj-list-row flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl min-w-0 text-right"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <div className="min-w-0">
                <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>Next</p>
                <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink2)" }}>{next.reference}</p>
              </div>
              <ChevronRight size={14} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
            </Link>
          )}
        </motion.div>

        {/* ── Related ──────────────────────────────────── */}
        {related.length > 0 && (
          <motion.section variants={fadeUp} custom={5} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                More on {category.label}
              </h2>
              <Link
                href={`/authority?category=${category.id}`}
                className="font-sans text-xs flex items-center gap-1"
                style={{ color: "var(--bj-gold-deep)" }}
              >
                See all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((e) => (
                <AuthorityCard key={e.id} entry={e} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
