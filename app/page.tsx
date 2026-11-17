"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, MotionConfig } from "framer-motion";
import { ArrowRight, PenLine, CalendarDays, BookOpen, Lock, Camera } from "lucide-react";
import { Mark } from "@/components/brand/Mark";
import { useAuth } from "@/hooks/useAuth";
import pkg from "@/version.json";

/* The front door. Writing first: one honest look at the journal, three short
   reasons, privacy said plainly, one way in. */

const EASE = [0.23, 1, 0.32, 1] as const;

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 16 }} animate={seen ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

function Start({ big }: { big?: boolean }) {
  const { user } = useAuth();
  return (
    <Link href={user ? "/journal" : "/login"}
      className={`bj-gold bj-lift inline-flex items-center justify-center gap-2 rounded-[14px] font-sans font-semibold ${big ? "h-12 px-6 text-[15px]" : "h-12 px-5 text-[14.5px]"}`}>
      {user ? "Open your journal" : "Start writing — it’s free"} <ArrowRight size={16} strokeWidth={2.2} />
    </Link>
  );
}

function Nav() {
  const { user } = useAuth();
  return (
    <header className="relative z-10 h-[76px] px-4 sm:px-8 md:px-14 flex items-center gap-3">
      <Link href="/" className="flex items-center gap-2.5" aria-label="BibJournal home">
        <Mark size={30} />
        <span className="font-display text-[21px]" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>BibJournal</span>
      </Link>
      <nav className="ml-auto hidden sm:flex items-center gap-7 font-sans text-[13.5px]" style={{ color: "var(--bj-ink3)" }}>
        <a href="#inside" className="hover:text-[var(--bj-ink)] transition-colors">How it works</a>
        <a href="#privacy" className="hover:text-[var(--bj-ink)] transition-colors">Privacy</a>
      </nav>
      <Link href={user ? "/journal" : "/login"} className="bj-raised bj-lift ml-auto sm:ml-6 h-9 px-3.5 rounded-[11px] flex items-center font-sans text-[13px] font-medium" style={{ color: "var(--bj-ink2)" }}>
        {user ? "Open" : "Sign in"}
      </Link>
    </header>
  );
}

// ── A truthful look at the journal ──────────────────────────

const ROWS = [
  { d: "17", w: "TUE", t: "Morning light", f: "var(--bj-gold)", x: "The kettle, the window, Psalm 5 before the emails.", photo: true },
  { d: "16", w: "MON", t: "Kofi and the visa", f: "", x: "", locked: true },
  { d: "14", w: "SAT", t: "The valley isn’t the end", f: "var(--bj-sky, #7FA7D9)", x: "Drove home the long way. Psalm 23:4 kept coming back." },
  { d: "12", w: "THU", t: "Slow to speak", f: "var(--bj-sage)", x: "I said less than I wanted to, and it was right." },
];
const PHOTO = "linear-gradient(135deg,#C99A62 0%,#8A5E3A 55%,#3E2A1C 100%)";

function JournalPeek() {
  return (
    <div className="bj-window rounded-[22px] flex overflow-hidden text-left mx-auto max-w-[1080px]"
      style={{ height: "clamp(380px, 46vw, 560px)", boxShadow: "0 0 0 1px var(--bj-line-soft), 0 60px 120px -40px rgba(0,0,0,.75)" }}>
      <div className="hidden md:flex w-[290px] shrink-0 flex-col gap-1 px-3 py-[18px]" style={{ borderRight: "1px solid var(--bj-line-soft)" }}>
        <p className="font-display text-[24px] px-2 mb-2.5" style={{ color: "var(--bj-ink)" }}>Journal</p>
        {ROWS.map((r, i) => (
          <div key={r.t} className={`flex gap-2.5 p-2.5 rounded-xl ${i === 0 ? "bj-raised" : ""}`} style={i ? { border: "1px solid transparent" } : undefined}>
            {r.photo
              ? <span className="w-10 h-10 rounded-[9px] shrink-0" style={{ background: PHOTO }} />
              : <span className="bj-well w-10 h-10 rounded-[9px] shrink-0 flex flex-col items-center justify-center font-display text-[14px] leading-none" style={{ color: "var(--bj-ink2)" }}>
                  {r.d}<span className="font-sans text-[7.5px] font-semibold mt-0.5" style={{ color: "var(--bj-ink4)" }}>{r.w}</span>
                </span>}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink)" }}>
                {r.locked ? <Lock size={10} style={{ color: "var(--bj-gold)" }} /> : <i className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.f }} />}
                <span className="truncate">{r.t}</span>
              </p>
              {r.locked
                ? <span className="block mt-2 h-[7px] w-[70%] rounded" style={{ background: "color-mix(in oklch, var(--bj-ink) 7%, transparent)" }} />
                : <p className="mt-1 font-display text-[12.5px] truncate" style={{ color: "var(--bj-ink3)" }}>{r.x}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-1 min-w-0 px-6 sm:px-11 py-8 sm:py-9">
        <p className="font-sans text-[12px] font-medium mb-2.5" style={{ color: "var(--bj-ink3)" }}>Tuesday, Nov 17 · 7:12 AM</p>
        <div className="flex gap-1.5 mb-5">
          <span className="h-6 px-2.5 rounded-full flex items-center gap-1.5 font-sans text-[12px]" style={{ background: "var(--m-hover)", color: "var(--bj-ink2)" }}>
            <i className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--bj-gold)" }} />Grateful
          </span>
          <span className="h-6 pl-[3px] pr-2.5 rounded-full flex items-center gap-1.5 font-sans text-[12px]" style={{ background: "var(--m-hover)", color: "var(--bj-ink2)" }}>
            <i className="w-[18px] h-[18px] rounded-md" style={{ background: PHOTO }} />1 photo
          </span>
        </div>
        <p className="font-display mb-4" style={{ fontSize: "clamp(28px, 3.4vw, 40px)", lineHeight: 1.1, color: "var(--bj-ink)", fontWeight: 500 }}>Morning light</p>
        <p className="max-w-[560px]" style={{ fontFamily: "var(--font-newsreader), serif", fontSize: "clamp(16px, 1.6vw, 19px)", lineHeight: 1.75, color: "var(--bj-ink2)" }}>
          The kettle, the window, and Psalm 5 before the emails.{" "}
          <span style={{ color: "var(--bj-gold)", borderBottom: "1px dashed color-mix(in oklch, var(--bj-gold) 55%, transparent)" }}>Psalm 5:3</span>
          {" "}— in the morning you hear my voice. I want the first words of the day to be to you, not about the day.
        </p>
        <div className="bj-glass absolute left-6 sm:left-11 bottom-5 h-[38px] rounded-xl hidden sm:flex items-center gap-3.5 px-3.5 font-sans text-[12.5px]" style={{ color: "var(--bj-ink3)" }}>
          112 words
          <span className="flex items-center gap-1.5" style={{ color: "var(--bj-gold)" }}><Camera size={13} />Photo</span>
          <span className="flex items-center gap-1.5"><BookOpen size={13} />Verse</span>
        </div>
      </div>
    </div>
  );
}

const REASONS = [
  { Icon: PenLine, title: "Write the day", body: "A page that gets out of the way: how you felt, a photo of the moment, and verses that turn into links as you type." },
  { Icon: CalendarDays, title: "See the seasons", body: "Month and year views show what you wrote, how you felt and which prayers were answered — any stretch, read back in order." },
  { Icon: BookOpen, title: "Read beside it", body: "The Bible, word studies and your sermon notes open next to the page, so a verse goes straight into what you’re writing." },
];

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bj-opening min-h-screen overflow-x-hidden" style={{ color: "var(--bj-ink)" }}>
        <Nav />

        <section className="text-center px-4 pt-14 sm:pt-20">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <p className="font-sans text-[10.5px] sm:text-[11px] font-semibold uppercase mb-5" style={{ letterSpacing: "0.14em", color: "var(--bj-gold)" }}>A journal for life with God</p>
            <h1 className="font-display mx-auto" style={{ fontSize: "clamp(2.9rem, 7vw, 4.9rem)", lineHeight: 1.02, letterSpacing: "-0.015em", fontWeight: 500, maxWidth: 760 }}>
              A quiet place <br className="hidden sm:block" />to write with God.
            </h1>
            <p className="font-sans mx-auto mt-6 max-w-[560px] text-[15px] sm:text-[17px]" style={{ lineHeight: 1.6, color: "var(--bj-ink3)" }}>
              Write what you’re carrying, keep the verse that met you, and look back over months to see where He was. The Bible, your prayers and your notes sit beside the page.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-2.5 justify-center items-stretch sm:items-center max-w-[340px] sm:max-w-none mx-auto">
              <Start />
              <a href="#inside" className="bj-raised bj-lift h-12 px-5 rounded-[14px] inline-flex items-center justify-center font-sans text-[14.5px] font-medium" style={{ color: "var(--bj-ink2)" }}>See inside</a>
            </div>
            <p className="font-sans text-[12px] mt-4" style={{ color: "var(--bj-ink4)" }}>Sign in with Google · Works on phone and desktop</p>
          </motion.div>
        </section>

        <motion.div id="inside" className="px-4 sm:px-8 mt-14 sm:mt-[70px] scroll-mt-6" style={{ perspective: 1600 }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: EASE }}>
          <div style={{ transform: "rotateX(6deg)", transformOrigin: "top center" }}>
            <JournalPeek />
          </div>
        </motion.div>

        <section className="px-4 sm:px-8 md:px-[120px] pt-24 sm:pt-28 max-w-[1240px] mx-auto">
          <Reveal className="text-center">
            <p className="font-sans text-[10.5px] font-semibold uppercase mb-3" style={{ letterSpacing: "0.08em", color: "var(--bj-ink4)" }}>What it’s for</p>
            <h2 className="font-display mb-10" style={{ fontSize: "clamp(2rem, 4.4vw, 2.75rem)", lineHeight: 1.1, fontWeight: 500 }}>Writing first. Everything else beside it.</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REASONS.map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="bj-raised rounded-[20px] p-6 h-full">
                  <span className="bj-glass w-[38px] h-[38px] rounded-xl flex items-center justify-center mb-4"><Icon size={17} style={{ color: "var(--bj-gold)" }} /></span>
                  <h3 className="font-display text-[22px] mb-2" style={{ lineHeight: 1.2, fontWeight: 500 }}>{title}</h3>
                  <p className="font-sans text-[13.5px]" style={{ lineHeight: 1.6, color: "var(--bj-ink3)" }}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-4">
            <div id="privacy" className="bj-glass rounded-[24px] p-6 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-9 scroll-mt-6">
              <span className="bj-raised w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0"><Lock size={26} style={{ color: "var(--bj-gold)" }} /></span>
              <div>
                <h2 className="font-display mb-2" style={{ fontSize: "clamp(1.6rem, 3vw, 1.9rem)", lineHeight: 1.15, fontWeight: 500 }}>Some pages are only for you and God.</h2>
                <p className="font-sans text-[14px] max-w-[640px]" style={{ lineHeight: 1.6, color: "var(--bj-ink3)" }}>
                  Turn on encryption and your journal and prayers are sealed with a passphrase only you know — not even we can read them. Lock single pages or whole folders with a code.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="text-center px-4 pt-28 sm:pt-32">
          <Reveal>
            <Mark size={56} className="mx-auto" />
            <h2 className="font-display mt-6 mb-3" style={{ fontSize: "clamp(2.3rem, 5vw, 3.1rem)", lineHeight: 1.1, fontWeight: 500 }}>Start tonight’s page.</h2>
            <p className="font-display italic text-[18px] mb-8" style={{ color: "var(--bj-ink3)" }}>“In the morning you hear my voice.” — Psalm 5:3</p>
            <Start big />
          </Reveal>
        </section>

        <footer className="mt-28 px-4 sm:px-14 py-6 flex items-center gap-2.5 font-sans text-[12.5px]" style={{ borderTop: "1px solid var(--bj-line-soft)", color: "var(--bj-ink4)" }}>
          <Mark size={20} />
          <span className="font-display text-[15px]" style={{ color: "var(--bj-ink3)" }}>BibJournal</span>
          <span className="ml-auto" style={{ fontVariantNumeric: "tabular-nums" }}>v{pkg.version} · © {new Date().getFullYear()}</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
