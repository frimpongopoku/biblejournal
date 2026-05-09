"use client";

import { motion } from "framer-motion";
import { NotebookPen, BookOpen, Star, Headphones, ArrowRight, Flame, Mic } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { dailyVerse, streak, entries, prayers, readingPlan } from "@/lib/mock-data";

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] ?? "Friend";
  const activePrayers = prayers.filter((p) => p.status === "praying").slice(0, 3);
  const progress = Math.round((readingPlan.day / readingPlan.total) * 100);

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-6 md:px-14 pt-10 md:pt-12 pb-16" style={{ maxWidth: 960 }}>

        {/* ── 1. Header ─────────────────────────────────────────── */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="show"
          className="flex items-start justify-between gap-4 mb-10"
        >
          <div>
            <p className="font-sans text-xs mb-1.5" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {formatDate()}
            </p>
            <h1
              className="font-display leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--bj-ink)", fontWeight: 400, letterSpacing: "-0.01em" }}
            >
              {getGreeting()}, {firstName}.
            </h1>
          </div>
          <div className="flex items-center gap-2.5 pt-1 shrink-0">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 14px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}
            >
              <NotebookPen size={14} />
              <span className="hidden sm:inline">New Entry</span>
            </button>
            <Link
              href="/bible"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ border: "1.5px solid var(--bj-line)", color: "var(--bj-ink2)" }}
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Open Bible</span>
            </Link>
          </div>
        </motion.div>

        {/* ── 2. Daily Verse Hero ────────────────────────────────── */}
        <motion.div
          custom={1} variants={fadeUp} initial="hidden" animate="show"
          className="relative overflow-hidden rounded-2xl mb-8 p-8 md:p-10"
          style={{
            background: `radial-gradient(ellipse 70% 80% at 10% 50%, color-mix(in oklch, var(--bj-gold-soft) 55%, transparent), transparent 65%),
              radial-gradient(ellipse 50% 60% at 90% 20%, color-mix(in oklch, var(--bj-gold-tint) 80%, transparent), transparent 60%),
              var(--bj-bg-soft)`,
            border: "1px solid var(--bj-gold-soft)",
            boxShadow: "0 4px 40px color-mix(in oklch, var(--bj-gold) 12%, transparent), 0 1px 3px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
          }}
        >
          {/* Decorative circles */}
          <svg className="absolute -right-12 -top-12" style={{ opacity: 0.07 }} width="280" height="280" viewBox="0 0 280 280" fill="none">
            <circle cx="140" cy="140" r="130" stroke="var(--bj-gold)" strokeWidth="1" />
            <circle cx="140" cy="140" r="100" stroke="var(--bj-gold)" strokeWidth="0.6" />
            <circle cx="140" cy="140" r="70" stroke="var(--bj-gold)" strokeWidth="0.4" />
          </svg>

          <div className="relative z-10 flex items-start justify-between gap-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--bj-gold)" }} />
                <span className="font-sans text-[11px] font-medium" style={{ color: "var(--bj-gold-deep)", textTransform: "uppercase", letterSpacing: "0.16em" }}>
                  Today&rsquo;s verse
                </span>
                <span
                  className="ml-1 px-2 py-0.5 rounded-full font-sans text-[10px]"
                  style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                >
                  {dailyVerse.version}
                </span>
              </div>

              <p
                className="font-display mb-3"
                style={{ fontSize: "0.8rem", letterSpacing: "0.1em", color: "var(--bj-gold-deep)", fontWeight: 500, textTransform: "uppercase" }}
              >
                {dailyVerse.ref}
              </p>

              <blockquote
                className="font-display italic"
                style={{
                  fontSize: "clamp(1.35rem, 2.8vw, 2rem)",
                  color: "var(--bj-ink)",
                  fontWeight: 300,
                  maxWidth: 580,
                  lineHeight: 1.3,
                }}
              >
                &ldquo;{dailyVerse.text}&rdquo;
              </blockquote>
            </div>

            <div className="flex flex-col gap-2.5 shrink-0">
              {[
                { icon: NotebookPen, label: "Reflect" },
                { icon: Star, label: "Save" },
                { icon: Headphones, label: "Listen" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  title={label}
                  className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200"
                  style={{ background: "color-mix(in oklch, var(--bj-bg-panel) 70%, transparent)", border: "1px solid var(--bj-gold-soft)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-gold)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bj-gold)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in oklch, var(--bj-bg-panel) 70%, transparent)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bj-gold-soft)";
                  }}
                >
                  <Icon size={15} style={{ color: "var(--bj-gold-deep)" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Streak strip */}
          <div className="relative z-10 flex items-center gap-4 mt-8 pt-6 border-t" style={{ borderColor: "var(--bj-gold-soft)" }}>
            <div className="flex items-center gap-1.5">
              <Flame size={13} style={{ color: "var(--bj-gold)" }} />
              <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>{streak.days} day streak</span>
            </div>
            <div className="flex gap-1.5">
              {streak.weekDots.map((on, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-5 h-5 rounded-md"
                    style={{
                      background: on ? "var(--bj-gold)" : "var(--bj-gold-soft)",
                      boxShadow: on ? "0 1px 6px color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "none",
                    }}
                  />
                  <span className="font-sans" style={{ fontSize: 9, color: "var(--bj-gold-deep)" }}>{WEEK[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 3. Two-column grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* Continue Writing */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line-soft)",
                boxShadow: "0 2px 16px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
              }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <h2 className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>Continue writing</h2>
                <Link href="/journal" className="font-sans text-xs flex items-center gap-1" style={{ color: "var(--bj-gold-deep)" }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div>
                {entries.slice(0, 3).map((entry, i) => (
                  <div
                    key={entry.id}
                    className="px-6 py-4 cursor-pointer transition-colors duration-150 group"
                    style={{ borderBottom: i < 2 ? "1px solid var(--bj-line-soft)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.pinned && (
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--bj-gold)" }} />
                          )}
                          <p className="font-sans text-sm font-medium truncate" style={{ color: "var(--bj-ink)" }}>{entry.title}</p>
                        </div>
                        <p className="font-sans text-xs mb-2" style={{ color: "var(--bj-ink3)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{entry.excerpt}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-sans px-2 py-0.5 rounded-full"
                            style={{ fontSize: 10, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                          >
                            {entry.folder}
                          </span>
                          <span className="font-sans" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>{entry.date}</span>
                        </div>
                      </div>
                      <ArrowRight size={13} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: "var(--bj-ink4)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Reading Plan + Reflection */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-5">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line-soft)",
                boxShadow: "0 2px 16px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-sans text-[11px] mb-1" style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Reading Plan</p>
                  <p className="font-sans text-xs font-medium" style={{ color: "var(--bj-ink2)" }}>{readingPlan.name}</p>
                </div>
                <span className="font-sans text-[11px]" style={{ color: "var(--bj-gold-deep)" }}>
                  Day {readingPlan.day} of {readingPlan.total}
                </span>
              </div>

              <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "var(--bj-line-soft)" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "var(--bj-gold)", boxShadow: "0 0 8px color-mix(in oklch, var(--bj-gold) 50%, transparent)" }}
                />
              </div>

              <p className="font-sans mb-1" style={{ fontSize: 10, color: "var(--bj-ink4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Today</p>
              <p className="font-display text-xl mb-3" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>{readingPlan.today}</p>

              <div className="flex items-center justify-between">
                <p className="font-sans text-xs" style={{ color: "var(--bj-ink3)" }}>
                  Next: <span style={{ color: "var(--bj-ink2)" }}>{readingPlan.nextUp}</span>
                </p>
                <Link href="/bible"
                  className="font-sans text-xs font-medium px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
                  Begin reading
                </Link>
              </div>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: `radial-gradient(ellipse 100% 100% at 0% 0%, color-mix(in oklch, var(--bj-sage-tint) 60%, transparent), transparent 70%), var(--bj-bg-panel)`,
                border: "1px solid var(--bj-line-soft)",
              }}
            >
              <p className="font-sans text-[11px] mb-3" style={{ color: "var(--bj-sage)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Reflection</p>
              <p
                className="font-display italic leading-snug mb-5"
                style={{ fontSize: "1.05rem", color: "var(--bj-ink2)", fontWeight: 300 }}
              >
                &ldquo;Where in your life are you trying to bear fruit apart from the vine?&rdquo;
              </p>
              <button
                className="font-sans text-xs font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "var(--bj-sage-tint)", color: "var(--bj-sage)", border: "1px solid color-mix(in oklch, var(--bj-sage) 25%, transparent)" }}
              >
                <NotebookPen size={12} />
                Write reflection
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── 4. Bottom row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line-soft)",
                boxShadow: "0 2px 16px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
              }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <h2 className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>Prayer</h2>
                <Link href="/prayer" className="font-sans text-xs flex items-center gap-1" style={{ color: "var(--bj-gold-deep)" }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="px-6 py-4 flex flex-col gap-3">
                {activePrayers.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 cursor-pointer">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--bj-ember)" }} />
                    <span className="font-sans text-sm flex-1" style={{ color: "var(--bj-ink2)" }}>{p.subject}</span>
                    {p.streak > 0 && (
                      <span
                        className="font-sans px-2 py-0.5 rounded-full"
                        style={{ fontSize: 10, background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))", color: "var(--bj-ember)", border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)" }}
                      >
                        {p.streak}d
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
            <div
              className="rounded-2xl p-6 flex flex-col"
              style={{
                background: "var(--bj-bg-panel)",
                border: "1.5px dashed var(--bj-line)",
                minHeight: 160,
              }}
            >
              <p className="font-sans text-[11px] mb-4" style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Quick Capture</p>
              <div className="flex-1 flex items-center">
                <p className="font-display italic text-xl leading-snug" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                  A thought, a verse,<br />a revelation…
                </p>
              </div>
              <div className="flex items-center gap-2.5 mt-5">
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line)" }}
                >
                  <Mic size={15} style={{ color: "var(--bj-ink3)" }} />
                </button>
                <button
                  className="flex items-center gap-2 flex-1 px-4 py-2 rounded-xl text-sm font-medium justify-center"
                  style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
                >
                  <NotebookPen size={14} />
                  Write now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
