"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  NotebookPen, BookOpen, HeartHandshake, Mic, Megaphone,
  ArrowRight, Flame, Plus, Play,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreakStore } from "@/store/streak.store";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { usePrayers } from "@/hooks/usePrayers";
import { useSermons } from "@/hooks/useSermons";
import { useProclamationFolders } from "@/hooks/useProclamationFolders";
import { createEntry } from "@/services/journal.service";
import { useAuthStore } from "@/store/auth.store";
import { youTubeThumbnail } from "@/lib/youtube-parser";

// ── Helpers ───────────────────────────────────────────────

interface DailyVerse {
  ref: string;
  text: string;
  version: string;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function extractExcerpt(content: string, max = 90): string {
  try {
    const doc = JSON.parse(content);
    const parts: string[] = [];
    const walk = (n: { text?: string; content?: typeof n[] }) => {
      if (n.text) parts.push(n.text);
      n.content?.forEach(walk);
    };
    walk(doc);
    const full = parts.join(" ").trim();
    return full.length > max ? full.slice(0, max) + "…" : full;
  } catch { return ""; }
}


// ── Animation variants ────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ── Skeleton card ─────────────────────────────────────────

function Skeleton({ h = 120 }: { h?: number }) {
  return <div className="rounded-2xl animate-pulse" style={{ height: h, background: "var(--bj-bg-soft)" }} />;
}

// ── Section card wrapper ──────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)", boxShadow: "0 2px 16px color-mix(in oklch, var(--bj-ink) 4%, transparent)" }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
      <h2 className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>{title}</h2>
      <Link href={href} className="bj-chip font-sans text-xs flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: "var(--bj-gold-deep)" }}>
        View all <ArrowRight size={11} />
      </Link>
    </div>
  );
}

// ── Section empty states ──────────────────────────────────

function SectionEmpty({ icon: Icon, message, cta, href }: { icon: React.ElementType; message: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 gap-3 text-center">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bj-bg-soft)" }}>
        <Icon size={18} style={{ color: "var(--bj-ink4)" }} />
      </div>
      <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", lineHeight: 1.55 }}>{message}</p>
      <Link href={href} className="bj-chip font-sans text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
        <Plus size={11} /> {cta}
      </Link>
    </div>
  );
}

// ── Onboarding screen (brand new user) ───────────────────

const FEATURES = [
  { icon: NotebookPen, label: "Journal",        desc: "Write freely. Process the Word. Capture revelation.",         href: "/journal",        color: "var(--bj-gold)" },
  { icon: BookOpen,    label: "Bible",           desc: "Read, highlight, and reference across 8 translations.",      href: "/bible",           color: "var(--bj-sage)" },
  { icon: HeartHandshake, label: "Prayer",       desc: "Track your prayers. Mark what God answers.",                 href: "/prayer",          color: "var(--bj-ember)" },
  { icon: Mic,         label: "Sermons",         desc: "Follow a sermon with notes, verses, and a live video.",      href: "/sermons",         color: "var(--bj-gold)" },
  { icon: Megaphone,   label: "Proclamations",   desc: "Declare what God says. Share your folders publicly.",        href: "/proclamations",   color: "var(--bj-sage)" },
];

function OnboardingScreen({ firstName }: { firstName: string }) {
  return (
    <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-8">
      <div className="text-center py-4">
        <p className="font-display italic mb-2" style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)", color: "var(--bj-ink)", fontWeight: 300 }}>
          Your spiritual life, beautifully organised.
        </p>
        <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", maxWidth: 400, margin: "0 auto", lineHeight: 1.65 }}>
          BibJournal brings together everything you need to go deeper — journaling, scripture, prayer, sermons, and declarations. Start anywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, label, desc, href, color }, i) => (
          <motion.div key={label} custom={i + 3} variants={fadeUp} initial="hidden" animate="show">
            <Link
              href={href}
              className="bj-list-row flex flex-col gap-4 p-5 rounded-2xl h-full"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-ink) 3%, transparent)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in oklch, ${color} 12%, var(--bj-bg))` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="font-sans font-semibold text-sm mb-1" style={{ color: "var(--bj-ink)" }}>{label}</p>
                <p className="font-sans text-xs leading-relaxed" style={{ color: "var(--bj-ink4)" }}>{desc}</p>
              </div>
              <div className="flex items-center gap-1 mt-auto font-sans text-xs font-medium" style={{ color }}>
                Open {label} <ArrowRight size={11} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="text-center font-display italic" style={{ color: "var(--bj-ink4)", fontWeight: 300, fontSize: "0.9rem" }}>
        "Every great spiritual journey starts with a single step."
      </p>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const authUser = useAuthStore((s) => s.user);
  const router = useRouter();
  const firstName = user?.displayName?.split(" ")[0] ?? "Friend";
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);

  useEffect(() => {
    fetch("/api/bible/daily")
      .then((r) => r.json())
      .then(setDailyVerse)
      .catch(() => {
        // Fallback so the hero never crashes
        setDailyVerse({ ref: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path.", version: "ESV" });
      });
  }, []);

  const { entries, loading: jLoading } = useJournalEntries();
  const { prayers, loading: pLoading } = usePrayers();
  const { sermons, loading: sLoading } = useSermons();
  const { folders, loading: fLoading } = useProclamationFolders();

  const allLoading = jLoading || pLoading || sLoading || fLoading;
  const allEmpty = !allLoading && entries.length === 0 && prayers.length === 0 && sermons.length === 0 && folders.length === 0;

  const activePrayers = prayers.filter((p) => p.status === "active");
  const recentJournal = entries.slice(0, 3);
  const recentSermons = sermons.slice(0, 2);

  const { streak, weekDots } = useStreakStore();

  async function handleNewEntry() {
    if (!authUser) return;
    const id = await createEntry(authUser.uid);
    router.push(`/journal`);
  }

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-8 md:pt-12 pb-20" style={{ maxWidth: 960 }}>

        {/* ── Header ─────────────────────────────────────── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
          className="flex items-start justify-between gap-4 mb-8"
        >
          <div>
            <p className="font-sans text-xs mb-1" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {formatDate()}
            </p>
            <h1 className="font-display leading-none" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--bj-ink)", fontWeight: 400, letterSpacing: "-0.01em" }}>
              {getGreeting()}, {firstName}.
            </h1>
          </div>
          <div className="flex items-center gap-2 pt-1 shrink-0">
            <button
              onClick={handleNewEntry}
              className="bj-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 14px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}
            >
              <NotebookPen size={14} />
              <span className="hidden sm:inline">New Entry</span>
            </button>
            <Link href="/bible" className="bj-btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink2)" }}>
              <BookOpen size={14} />
              <span className="hidden sm:inline">Bible</span>
            </Link>
          </div>
        </motion.div>

        {/* ── Daily Verse ─────────────────────────────────── */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="mb-7">
          <div
            className="relative overflow-hidden rounded-2xl px-6 md:px-10 py-7 md:py-9"
            style={{
              background: `radial-gradient(ellipse 70% 80% at 10% 50%, color-mix(in oklch, var(--bj-gold-soft) 50%, transparent), transparent 65%),
                radial-gradient(ellipse 50% 60% at 90% 20%, color-mix(in oklch, var(--bj-gold-tint) 80%, transparent), transparent 60%),
                var(--bj-bg-soft)`,
              border: "1px solid var(--bj-gold-soft)",
              boxShadow: "0 4px 32px color-mix(in oklch, var(--bj-gold) 10%, transparent)",
            }}
          >
            <svg className="absolute -right-10 -top-10 pointer-events-none" style={{ opacity: 0.06 }} width="240" height="240" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" stroke="var(--bj-gold)" strokeWidth="1" fill="none" />
              <circle cx="120" cy="120" r="80" stroke="var(--bj-gold)" strokeWidth="0.6" fill="none" />
            </svg>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--bj-gold-deep)" }}>Today's verse</span>
                {dailyVerse && (
                  <span className="font-sans text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>{dailyVerse.version}</span>
                )}
              </div>

              {dailyVerse ? (
                <>
                  <p className="font-sans mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "var(--bj-gold-deep)", fontWeight: 600, textTransform: "uppercase" }}>
                    {dailyVerse.ref}
                  </p>
                  <blockquote className="font-display italic mb-6" style={{ fontSize: "clamp(1.2rem, 2.8vw, 1.7rem)", color: "var(--bj-ink)", fontWeight: 300, maxWidth: 580, lineHeight: 1.35 }}>
                    &ldquo;{dailyVerse.text}&rdquo;
                  </blockquote>
                </>
              ) : (
                <div className="mb-6 flex flex-col gap-2.5">
                  <div className="h-3 rounded-lg animate-pulse w-32" style={{ background: "var(--bj-gold-soft)" }} />
                  <div className="h-7 rounded-lg animate-pulse w-full max-w-lg" style={{ background: "var(--bj-gold-soft)" }} />
                  <div className="h-7 rounded-lg animate-pulse w-3/4" style={{ background: "var(--bj-gold-soft)" }} />
                </div>
              )}

              {/* Streak */}
              <div className="flex items-center gap-4 pt-5 border-t" style={{ borderColor: "var(--bj-gold-soft)" }}>
                <div className="flex items-center gap-1.5">
                  <Flame size={12} style={{ color: "var(--bj-gold)" }} />
                  <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>
                    {streak > 0 ? `${streak} day streak` : "Start your streak today"}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {weekDots.map((dot, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-5 h-5 rounded-md" style={{ background: dot.on ? "var(--bj-gold)" : "var(--bj-gold-soft)", boxShadow: dot.on ? "0 1px 6px color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "none" }} />
                      <span className="font-sans" style={{ fontSize: 9, color: "var(--bj-gold-deep)" }}>{dot.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Loading ─────────────────────────────────────── */}
        {allLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton h={180} />
            <Skeleton h={180} />
            <Skeleton h={140} />
            <Skeleton h={140} />
          </div>
        )}

        {/* ── Onboarding (brand new user) ─────────────────── */}
        {!allLoading && allEmpty && (
          <OnboardingScreen firstName={firstName} />
        )}

        {/* ── Dashboard (has data) ─────────────────────────── */}
        {!allLoading && !allEmpty && (
          <div className="flex flex-col gap-5">

            {/* Stats bar */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                { icon: NotebookPen, label: "Journal",      value: entries.length,        href: "/journal",       color: "var(--bj-gold)" },
                { icon: HeartHandshake, label: "Prayers",   value: activePrayers.length,  href: "/prayer",        color: "var(--bj-ember)", suffix: " active" },
                { icon: Mic,         label: "Sermons",      value: sermons.length,        href: "/sermons",       color: "var(--bj-gold)" },
                { icon: Megaphone,   label: "Declarations", value: folders.reduce((a, f) => a + f.entryCount, 0), href: "/proclamations", color: "var(--bj-sage)" },
              ].map(({ icon: Icon, label, value, href, color, suffix = "" }) => (
                <Link
                  key={label}
                  href={href}
                  className="bj-list-row flex items-center gap-3 px-4 py-4 rounded-2xl"
                  style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in oklch, ${color} 12%, var(--bj-bg))` }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans font-bold text-lg leading-none" style={{ color: "var(--bj-ink)" }}>
                      {value}<span className="font-sans text-xs font-normal" style={{ color: "var(--bj-ink4)" }}>{suffix}</span>
                    </p>
                    <p className="font-sans text-xs mt-0.5 truncate" style={{ color: "var(--bj-ink4)" }}>{label}</p>
                  </div>
                </Link>
              ))}
            </motion.div>

            {/* Journal + Prayers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Recent Journal */}
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show">
                <Card>
                  <SectionHeader title="Journal" href="/journal" />
                  {recentJournal.length === 0 ? (
                    <SectionEmpty icon={NotebookPen} message="No entries yet. Start writing your thoughts, reflections, and discoveries." cta="Write first entry" href="/journal" />
                  ) : (
                    recentJournal.map((entry, i) => {
                      const excerpt = extractExcerpt(entry.content);
                      return (
                        <Link
                          key={entry.id}
                          href="/journal"
                          className="bj-list-row flex items-start gap-3 px-5 py-4 group"
                          style={{ borderBottom: i < recentJournal.length - 1 ? "1px solid var(--bj-line-soft)" : "none" }}
                        >
                          {entry.isPinned && <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--bj-gold)" }} />}
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-sm font-semibold truncate mb-0.5" style={{ color: "var(--bj-ink)" }}>
                              {entry.title || "Untitled entry"}
                            </p>
                            {excerpt && (
                              <p className="font-sans text-xs mb-1.5" style={{ color: "var(--bj-ink3)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {excerpt}
                              </p>
                            )}
                            <span className="font-sans text-[10px]" style={{ color: "var(--bj-ink4)" }}>
                              {entry.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <ArrowRight size={12} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--bj-ink4)" }} />
                        </Link>
                      );
                    })
                  )}
                </Card>
              </motion.div>

              {/* Active Prayers */}
              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
                <Card>
                  <SectionHeader title="Prayers" href="/prayer" />
                  {activePrayers.length === 0 ? (
                    <SectionEmpty icon={HeartHandshake} message="No active prayers. Bring your requests to God and track His faithfulness." cta="Add a prayer" href="/prayer" />
                  ) : (
                    activePrayers.slice(0, 3).map((p, i) => {
                      const days = Math.max(1, Math.floor((Date.now() - p.createdAt.getTime()) / 86400000));
                      return (
                        <Link
                          key={p.id}
                          href="/prayer"
                          className="bj-list-row flex items-center gap-3 px-5 py-4"
                          style={{ borderBottom: i < Math.min(activePrayers.length, 3) - 1 ? "1px solid var(--bj-line-soft)" : "none" }}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--bj-ember)" }} />
                          <span className="font-sans text-sm flex-1 truncate" style={{ color: "var(--bj-ink2)" }}>{p.title}</span>
                          <span className="font-sans text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))", color: "var(--bj-ember)", border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)" }}>
                            {days}d
                          </span>
                        </Link>
                      );
                    })
                  )}
                </Card>
              </motion.div>
            </div>

            {/* Sermons */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show">
              <Card>
                <SectionHeader title="Sermon Notes" href="/sermons" />
                {recentSermons.length === 0 ? (
                  <SectionEmpty icon={Mic} message="No sermon notes yet. Follow a sermon with live notes, verse references, and a YouTube player." cta="Log a sermon" href="/sermons" />
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentSermons.map((sermon) => (
                      <Link
                        key={sermon.id}
                        href={`/sermons/${sermon.id}`}
                        className="bj-list-row flex items-center gap-3 p-3 rounded-xl"
                        style={{ border: "1px solid var(--bj-line-soft)" }}
                      >
                        <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--bj-bg-soft)" }}>
                          {sermon.videoId ? (
                            <img src={youTubeThumbnail(sermon.videoId)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Mic size={14} style={{ color: "var(--bj-ink4)" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold truncate" style={{ color: "var(--bj-ink)" }}>
                            {sermon.title || "Untitled"}
                          </p>
                          {sermon.speaker && <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink4)" }}>{sermon.speaker}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Quick Capture */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
              <div
                className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4"
                style={{ background: "var(--bj-bg-panel)", border: "1.5px dashed var(--bj-line)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[11px] mb-1 uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>Quick Capture</p>
                  <p className="font-display italic" style={{ fontSize: "1.1rem", color: "var(--bj-ink3)", fontWeight: 300 }}>
                    A thought, a verse, a revelation…
                  </p>
                </div>
                <button
                  onClick={handleNewEntry}
                  className="bj-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shrink-0"
                  style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
                >
                  <NotebookPen size={14} /> Write now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
