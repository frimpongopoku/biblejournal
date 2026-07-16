"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Search, X, Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { AuthorityIcon } from "@/components/authority/AuthorityIcon";
import { AuthorityCard } from "@/components/authority/AuthorityCard";
import { useAuthorityStore } from "@/store/authority.store";
import {
  AUTHORITY_ENTRIES, AUTHORITY_CATEGORIES, AUTHORITY_KINDS, getAuthorityEntryById, authorityEntryOfTheDay, testamentOf,
  type AuthorityCategoryId, type AuthorityKind,
} from "@/lib/data/authority";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.04, 0.3), duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

type TestamentFilter = "all" | "OT" | "NT";
type KindFilter = "all" | AuthorityKind;

const CATEGORY_IDS = new Set(AUTHORITY_CATEGORIES.map((c) => c.id));

function AuthorityView() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AuthorityCategoryId | null>(() => {
    const c = searchParams.get("category");
    return c && CATEGORY_IDS.has(c as AuthorityCategoryId) ? (c as AuthorityCategoryId) : null;
  });
  const [testament, setTestament] = useState<TestamentFilter>("all");
  const [kind, setKind] = useState<KindFilter>(() => {
    const k = searchParams.get("kind");
    return k && AUTHORITY_KINDS.some((w) => w.id === k) ? (k as AuthorityKind) : "all";
  });

  const bookmarks = useAuthorityStore((s) => s.bookmarks);
  const bookmarkedEntries = useMemo(
    () => bookmarks.map((id) => getAuthorityEntryById(id)).filter((p): p is NonNullable<typeof p> => !!p),
    [bookmarks]
  );

  const daily = useMemo(() => authorityEntryOfTheDay(), []);

  const q = query.trim().toLowerCase();
  const filtersActive = q.length > 0 || category !== null || testament !== "all" || kind !== "all";

  const filtered = useMemo(() => {
    return AUTHORITY_ENTRIES.filter((e) => {
      if (category && e.category !== category) return false;
      if (kind !== "all" && e.kind !== kind) return false;
      if (testament !== "all" && testamentOf(e.book) !== testament) return false;
      if (q) {
        const haystack = `${e.title} ${e.reference} ${e.context}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [category, kind, testament, q]);

  function clearFilters() {
    setQuery("");
    setCategory(null);
    setTestament("all");
    setKind("all");
  }

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-8 md:pt-12 pb-24" style={{ maxWidth: 1080 }}>

        {/* ── Header ───────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} style={{ color: "var(--bj-gold)" }} />
            <p className="font-sans text-xs" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Our Authority in Christ
            </p>
          </div>
          <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "var(--bj-ink)", fontWeight: 400, letterSpacing: "-0.01em" }}>
            The power He has given us.
          </h1>
          <p className="font-sans text-sm max-w-xl" style={{ color: "var(--bj-ink4)", lineHeight: 1.65 }}>
            {AUTHORITY_ENTRIES.length} passages on the believer&apos;s authority over the enemy — always exercised
            under Christ&apos;s lordship, never as a formula of our own. Promises, principles, warnings, and wisdom,
            each with the reference to study for yourself.
          </p>
        </motion.div>

        {/* ── Entry of the day ─────────────────────────────── */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="mb-8">
          <Link
            href={`/authority/${daily.id}`}
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
                Today&apos;s passage
              </p>
              <h2 className="font-display italic mb-1" style={{ fontSize: "1.2rem", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.4 }}>
                {daily.title}
              </h2>
              <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{daily.reference}</p>
            </div>
            <ArrowRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--bj-gold-deep)" }} />
          </Link>
        </motion.div>

        {/* ── Kind filter ──────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="mb-4 flex flex-wrap gap-1.5">
          <button
            onClick={() => setKind("all")}
            data-active={kind === "all" || undefined}
            className="bj-chip font-sans text-xs px-3 py-1.5 rounded-full"
            style={{
              background: kind === "all" ? "var(--bj-gold-tint)" : "var(--bj-bg-panel)",
              color: kind === "all" ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
              border: `1px solid ${kind === "all" ? "var(--bj-gold-soft)" : "var(--bj-line-soft)"}`,
            }}
          >
            All kinds
          </button>
          {AUTHORITY_KINDS.map((k) => {
            const active = kind === k.id;
            return (
              <button
                key={k.id}
                onClick={() => setKind(active ? "all" : k.id)}
                data-active={active || undefined}
                className="bj-chip font-sans text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide"
                style={{
                  background: active ? `color-mix(in oklch, ${k.color} 16%, var(--bj-bg))` : "var(--bj-bg-panel)",
                  color: active ? k.color : "var(--bj-ink3)",
                  border: `1px solid ${active ? `color-mix(in oklch, ${k.color} 40%, transparent)` : "var(--bj-line-soft)"}`,
                }}
              >
                {k.label}s
              </button>
            );
          })}
        </motion.div>

        {/* ── Search + filters ─────────────────────────────── */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show" className="mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div
              className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <Search size={14} style={{ color: "var(--bj-ink4)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search passages, references, or keywords…"
                className="flex-1 bg-transparent outline-none font-sans text-sm"
                style={{ color: "var(--bj-ink2)" }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="bj-btn-icon w-5 h-5 rounded-md flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}>
              {(["all", "OT", "NT"] as TestamentFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTestament(t)}
                  data-active={testament === t || undefined}
                  className="bj-chip font-sans text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    background: testament === t ? "var(--bj-gold-tint)" : "transparent",
                    color: testament === t ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                  }}
                >
                  {t === "all" ? "All" : t === "OT" ? "Old Testament" : "New Testament"}
                </button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategory(null)}
              data-active={category === null || undefined}
              className="bj-chip font-sans text-xs px-3 py-1.5 rounded-full"
              style={{
                background: category === null ? "var(--bj-gold-tint)" : "var(--bj-bg-panel)",
                color: category === null ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                border: `1px solid ${category === null ? "var(--bj-gold-soft)" : "var(--bj-line-soft)"}`,
              }}
            >
              All themes
            </button>
            {AUTHORITY_CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(active ? null : c.id)}
                  data-active={active || undefined}
                  className="bj-chip font-sans text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  style={{
                    background: active ? `color-mix(in oklch, ${c.color} 16%, var(--bj-bg))` : "var(--bj-bg-panel)",
                    color: active ? c.color : "var(--bj-ink3)",
                    border: `1px solid ${active ? `color-mix(in oklch, ${c.color} 40%, transparent)` : "var(--bj-line-soft)"}`,
                  }}
                >
                  <AuthorityIcon name={c.icon} size={11} />
                  {c.label}
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
                <AuthorityCard key={e.id} entry={e} showCategory />
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Results ──────────────────────────────────────── */}
        {filtersActive ? (
          <motion.section variants={fadeUp} custom={3} initial="hidden" animate="show">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                {filtered.length} {filtered.length === 1 ? "passage" : "passages"}
              </h2>
              <button onClick={clearFilters} className="bj-chip font-sans text-xs flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: "var(--bj-ink4)" }}>
                <X size={10} /> Clear filters
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((e) => (
                  <AuthorityCard key={e.id} entry={e} showCategory />
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
            {AUTHORITY_CATEGORIES.map((c, ci) => {
              const items = AUTHORITY_ENTRIES.filter((e) => e.category === c.id);
              return (
                <motion.section key={c.id} variants={fadeUp} custom={4 + ci * 0.4} initial="hidden" animate="show">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in oklch, ${c.color} 16%, var(--bj-bg))` }}>
                      <AuthorityIcon name={c.icon} size={12} style={{ color: c.color }} />
                    </div>
                    <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                      {c.label}
                    </h2>
                    <span className="font-display italic text-xs" style={{ color: "var(--bj-ink4)" }}>— {c.blurb}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((e) => (
                      <AuthorityCard key={e.id} entry={e} />
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

export default function AuthorityPage() {
  return (
    <Suspense fallback={null}>
      <AuthorityView />
    </Suspense>
  );
}
