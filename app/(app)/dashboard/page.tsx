"use client";

import { useMemo } from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
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

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

const DAILY_VERSES = [
  { ref: "Lamentations 3:22–23", version: "ESV", text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness." },
  { ref: "Jeremiah 29:11", version: "ESV", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." },
  { ref: "Philippians 4:13", version: "ESV", text: "I can do all things through him who strengthens me." },
  { ref: "Romans 8:28", version: "ESV", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
  { ref: "John 3:16", version: "ESV", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
  { ref: "Psalm 23:1", version: "ESV", text: "The Lord is my shepherd; I shall not want." },
  { ref: "Isaiah 40:31", version: "ESV", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
  { ref: "Proverbs 3:5–6", version: "ESV", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  { ref: "Matthew 6:33", version: "ESV", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you." },
  { ref: "Psalm 46:10", version: "ESV", text: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!" },
  { ref: "John 15:5", version: "ESV", text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing." },
  { ref: "Romans 8:38–39", version: "ESV", text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, will be able to separate us from the love of God in Christ Jesus our Lord." },
  { ref: "2 Corinthians 12:9", version: "ESV", text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me." },
  { ref: "Psalm 119:105", version: "ESV", text: "Your word is a lamp to my feet and a light to my path." },
  { ref: "Ephesians 2:8–9", version: "ESV", text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast." },
  { ref: "Joshua 1:9", version: "ESV", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." },
  { ref: "Romans 5:8", version: "ESV", text: "But God shows his love for us in that while we were still sinners, Christ died for us." },
  { ref: "Philippians 4:6–7", version: "ESV", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts." },
  { ref: "Psalm 37:4", version: "ESV", text: "Delight yourself in the Lord, and he will give you the desires of your heart." },
  { ref: "Matthew 11:28", version: "ESV", text: "Come to me, all who labor and are heavy laden, and I will give you rest." },
  { ref: "1 John 4:19", version: "ESV", text: "We love because he first loved us." },
  { ref: "Hebrews 11:1", version: "ESV", text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
  { ref: "James 1:2–4", version: "ESV", text: "Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness." },
  { ref: "Isaiah 41:10", version: "ESV", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
  { ref: "Galatians 2:20", version: "ESV", text: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God." },
  { ref: "Colossians 3:23", version: "ESV", text: "Whatever you do, work heartily, as for the Lord and not for men." },
  { ref: "Romans 12:2", version: "ESV", text: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God." },
  { ref: "Psalm 27:1", version: "ESV", text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?" },
  { ref: "John 14:6", version: "ESV", text: "Jesus said to him, 'I am the way, and the truth, and the life. No one comes to the Father except through me.'" },
  { ref: "2 Timothy 1:7", version: "ESV", text: "For God gave us a spirit not of fear but of power and love and self-control." },
];

function getDailyVerse() {
  const day = new Date().getDate();
  return DAILY_VERSES[day % DAILY_VERSES.length];
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

function computeActivity(dates: Date[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const active = new Set(dates.map((d) => d.toISOString().slice(0, 10)));

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (active.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }

  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { on: active.has(key), label: WEEK[d.getDay() === 0 ? 6 : d.getDay() - 1] };
  });

  return { streak, weekDots };
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
  const dailyVerse = getDailyVerse();

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
                <span className="font-sans text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>{dailyVerse.version}</span>
              </div>

              <p className="font-sans mb-2" style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "var(--bj-gold-deep)", fontWeight: 600, textTransform: "uppercase" }}>
                {dailyVerse.ref}
              </p>

              <blockquote className="font-display italic mb-6" style={{ fontSize: "clamp(1.2rem, 2.8vw, 1.7rem)", color: "var(--bj-ink)", fontWeight: 300, maxWidth: 580, lineHeight: 1.35 }}>
                &ldquo;{dailyVerse.text}&rdquo;
              </blockquote>

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
