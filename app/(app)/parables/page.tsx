"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Wheat, Search, X, Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { ParablesIcon } from "@/components/parables/ParablesIcon";
import { ParableCard } from "@/components/parables/ParableCard";
import { useParablesStore } from "@/store/parables.store";
import {
  PARABLE_ENTRIES, PARABLE_PARTS, getParableEntryById, parableOfTheDay,
  type ParablePartId,
} from "@/lib/data/parables";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.04, 0.3), duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const PART_IDS = new Set(PARABLE_PARTS.map((p) => p.id));

function ParablesView() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [part, setPart] = useState<ParablePartId | null>(() => {
    const p = searchParams.get("part");
    return p && PART_IDS.has(p as ParablePartId) ? (p as ParablePartId) : null;
  });

  const bookmarks = useParablesStore((s) => s.bookmarks);
  const bookmarkedEntries = useMemo(
    () => bookmarks.map((id) => getParableEntryById(id)).filter((p): p is NonNullable<typeof p> => !!p),
    [bookmarks]
  );

  const daily = useMemo(() => parableOfTheDay(), []);

  const q = query.trim().toLowerCase();
  const filtersActive = q.length > 0 || part !== null;

  const filtered = useMemo(() => {
    return PARABLE_ENTRIES.filter((e) => {
      if (part && e.part !== part) return false;
      if (q) {
        const haystack = `${e.title} ${e.summary} ${e.context} ${e.symbols.map((s) => s.term).join(" ")} ${e.references.map((r) => r.label).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [part, q]);

  function clearFilters() {
    setQuery("");
    setPart(null);
  }

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-8 md:pt-12 pb-24" style={{ maxWidth: 1080 }}>

        {/* ── Header ───────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Wheat size={16} style={{ color: "var(--bj-gold)" }} />
            <p className="font-sans text-xs" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Parables
            </p>
          </div>
          <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "var(--bj-ink)", fontWeight: 400, letterSpacing: "-0.01em" }}>
            Every story he told to open a hidden door.
          </h1>
          <p className="font-sans text-sm max-w-xl" style={{ color: "var(--bj-ink4)", lineHeight: 1.65 }}>
            All {PARABLE_ENTRIES.length} parables recorded in the Gospels, with the first-century Galilean and
            Judean world each one assumes — what a denarius bought, why a Samaritan&apos;s help was scandalous,
            what leaven meant at a Passover table, why a shepherd&apos;s voice mattered.
          </p>
        </motion.div>

        {/* ── Parable of the day ─────────────────────────────── */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="mb-8">
          <Link
            href={`/parables/${daily.id}`}
            className="bj-list-row flex flex-col sm:flex-row sm:items-center gap-5 p-6 md:p-7 rounded-3xl relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklch, var(--bj-gold) 10%, var(--bj-bg-panel)), var(--bj-bg-panel))`,
              border: "1px solid var(--bj-gold-soft)",
            }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--bj-gold-tint)" }}>
              <Sparkles size={18} style={{ color: "var(--bj-gold-deep)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--bj-gold-deep)" }}>
                Today&apos;s parable
              </p>
              <h2 className="font-display italic mb-1" style={{ fontSize: "1.2rem", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.4 }}>
                {daily.title}
              </h2>
              <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{daily.references[0].label}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--bj-gold-deep)" }} />
          </Link>
        </motion.div>

        {/* ── Search + Part filter ─────────────────────────────── */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="mb-6 flex flex-col gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
          >
            <Search size={14} style={{ color: "var(--bj-ink4)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by word, symbol, or reference…"
              className="flex-1 bg-transparent outline-none font-sans text-sm"
              style={{ color: "var(--bj-ink2)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="bj-btn-icon w-5 h-5 rounded-md flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setPart(null)}
              data-active={part === null || undefined}
              className="bj-chip font-sans text-xs px-3 py-1.5 rounded-full"
              style={{
                background: part === null ? "var(--bj-gold-tint)" : "var(--bj-bg-panel)",
                color: part === null ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                border: `1px solid ${part === null ? "var(--bj-gold-soft)" : "var(--bj-line-soft)"}`,
              }}
            >
              All parts
            </button>
            {PARABLE_PARTS.map((p) => {
              const active = part === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPart(active ? null : p.id)}
                  data-active={active || undefined}
                  className="bj-chip font-sans text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  style={{
                    background: active ? `color-mix(in oklch, ${p.color} 16%, var(--bj-bg))` : "var(--bj-bg-panel)",
                    color: active ? p.color : "var(--bj-ink3)",
                    border: `1px solid ${active ? `color-mix(in oklch, ${p.color} 40%, transparent)` : "var(--bj-line-soft)"}`,
                  }}
                >
                  <ParablesIcon name={p.icon} size={11} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Bookmarks ────────────────────────────────────── */}
        {bookmarkedEntries.length > 0 && !filtersActive && (
          <motion.section variants={fadeUp} custom={3} initial="hidden" animate="show" className="mb-9">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark size={12} style={{ color: "var(--bj-gold-deep)" }} />
              <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                Your bookmarks
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarkedEntries.map((e) => (
                <ParableCard key={e.id} entry={e} showPart />
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Results ──────────────────────────────────────── */}
        {filtersActive ? (
          <motion.section variants={fadeUp} custom={3} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                {filtered.length} {filtered.length === 1 ? "parable" : "parables"}
              </h2>
              <button onClick={clearFilters} className="bj-chip font-sans text-xs flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: "var(--bj-ink4)" }}>
                <X size={10} /> Clear filters
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((e) => (
                  <ParableCard key={e.id} entry={e} showPart />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="font-display italic mb-1" style={{ fontSize: "1.1rem", color: "var(--bj-ink3)" }}>
                  Nothing matches that search.
                </p>
                <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>Try a different word or clear your filters.</p>
              </div>
            )}
          </motion.section>
        ) : (
          <div className="flex flex-col gap-10">
            {PARABLE_PARTS.map((p, pi) => {
              const items = PARABLE_ENTRIES.filter((e) => e.part === p.id);
              return (
                <motion.section key={p.id} variants={fadeUp} custom={4 + pi * 0.4} initial="hidden" animate="show">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in oklch, ${p.color} 16%, var(--bj-bg))` }}>
                      <ParablesIcon name={p.icon} size={12} style={{ color: p.color }} />
                    </div>
                    <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>{p.partNumber}</span>
                    <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                      {p.label}
                    </h2>
                    <span className="font-display italic text-xs" style={{ color: "var(--bj-ink4)" }}>— {p.blurb}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {items.map((e) => (
                      <ParableCard key={e.id} entry={e} />
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParablesPage() {
  return (
    <Suspense fallback={null}>
      <ParablesView />
    </Suspense>
  );
}
