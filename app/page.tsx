"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  BookOpen, NotebookPen, HeartHandshake, Mic,
  Compass, Megaphone, ArrowRight, Sparkles,
  Check, Languages, FlaskConical, MessageSquare,
  Globe, Flame,
} from "lucide-react";
import pkg from "@/version.json";

// ── Animation helpers ──────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] } }),
};

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

// ── Nav ────────────────────────────────────────────────────

function Nav() {
  const [hov, setHov] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10"
      style={{ height: 60, background: "color-mix(in oklch, var(--bj-bg) 85%, transparent)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--bj-line-soft)" }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--bj-gold)", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
            <path d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z" fill="white" fillOpacity="0.55" />
          </svg>
        </div>
        <span className="font-display text-base" style={{ color: "var(--bj-ink)", letterSpacing: "0.04em" }}>BibJournal</span>
      </Link>

      {/* CTA */}
      <Link href="/login"
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="flex items-center gap-2 font-sans text-sm px-4 py-2 rounded-xl"
        style={{
          background: hov ? "var(--bj-gold)" : "var(--bj-gold-tint)",
          color: hov ? "white" : "var(--bj-gold-deep)",
          border: "1px solid var(--bj-gold-soft)",
          transition: "all 0.15s ease",
          transform: hov ? "translateY(-1px)" : "none",
          boxShadow: hov ? "0 4px 16px color-mix(in oklch, var(--bj-gold) 30%, transparent)" : "none",
        }}>
        Sign in <ArrowRight size={14} />
      </Link>
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-20 overflow-hidden text-center">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 70% 55% at 50% 100%, color-mix(in oklch, var(--bj-gold-soft) 45%, transparent) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 20% 20%, color-mix(in oklch, var(--bj-gold-tint) 70%, transparent) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 80% 15%, color-mix(in oklch, var(--bj-gold-soft) 30%, transparent) 0%, transparent 55%),
          var(--bj-bg)
        `
      }} />
      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px"
      }} />
      {/* Decorative rings */}
      <svg className="pointer-events-none absolute opacity-[0.07]" style={{ bottom: -80, left: -80 }} width="560" height="560" viewBox="0 0 560 560" fill="none">
        <circle cx="280" cy="280" r="268" stroke="var(--bj-gold)" strokeWidth="1" />
        <circle cx="280" cy="280" r="210" stroke="var(--bj-gold)" strokeWidth="0.6" />
      </svg>
      <svg className="pointer-events-none absolute opacity-[0.06]" style={{ top: -60, right: -60 }} width="380" height="380" viewBox="0 0 380 380" fill="none">
        <circle cx="190" cy="190" r="178" stroke="var(--bj-gold)" strokeWidth="0.8" />
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
          style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
          <Sparkles size={12} style={{ color: "var(--bj-gold)" }} />
          <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.06em" }}>
            Your sacred space for Scripture &amp; reflection
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mb-6" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
          Where faith meets<br />
          <span style={{ color: "var(--bj-gold)", fontStyle: "italic" }}>reflection</span>
        </motion.h1>

        {/* Scripture */}
        <motion.blockquote initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.7 }}
          className="mb-10 max-w-xl mx-auto">
          <p className="font-display italic text-xl md:text-2xl" style={{ color: "var(--bj-ink3)", fontWeight: 300, lineHeight: 1.5 }}>
            "Your word is a lamp to my feet<br className="hidden md:block" /> and a light to my path."
          </p>
          <cite className="block mt-3 font-sans text-xs not-italic tracking-widest uppercase" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.14em" }}>
            Psalm 119 · 105
          </cite>
        </motion.blockquote>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <HeroButton href="/login" primary>Begin your journey</HeroButton>
          <HeroButton href="#features">Explore features</HeroButton>
        </motion.div>
      </div>

      {/* Hero mockup */}
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-20 w-full max-w-5xl mx-auto">
        <HeroMockup />
      </motion.div>
    </section>
  );
}

function HeroButton({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center gap-2 font-sans text-sm font-medium px-6 py-3 rounded-2xl"
      style={{
        background: primary ? (hov ? "color-mix(in oklch, var(--bj-gold) 88%, black)" : "var(--bj-gold)") : (hov ? "var(--bj-line-soft)" : "var(--bj-bg-soft)"),
        color: primary ? "white" : (hov ? "var(--bj-ink)" : "var(--bj-ink2)"),
        border: primary ? "none" : "1px solid var(--bj-line-soft)",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov && primary ? "0 8px 24px color-mix(in oklch, var(--bj-gold) 35%, transparent)" : "none",
        transition: "all 0.16s ease",
      }}>
      {children} {primary && <ArrowRight size={15} />}
    </Link>
  );
}

// ── Hero Mockup ────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 900 }}>
      {/* Main window */}
      <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "0 32px 80px color-mix(in oklch, var(--bj-ink) 18%, transparent)" }}>
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-soft)" }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
          <div className="flex-1 mx-4">
            <div className="mx-auto rounded-md px-3 py-1 text-center font-sans" style={{ fontSize: 11, maxWidth: 240, background: "var(--bj-bg)", color: "var(--bj-ink4)", border: "1px solid var(--bj-line-soft)" }}>
              bibjournal.app
            </div>
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ height: 420 }}>
          {/* Sidebar */}
          <div className="hidden md:flex flex-col border-r shrink-0" style={{ width: 200, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}>
            <div className="px-3 pt-4 pb-3 border-b flex items-center gap-2" style={{ borderColor: "var(--bj-line-soft)" }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--bj-gold)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" /></svg>
              </div>
              <span className="font-display text-xs font-medium" style={{ color: "var(--bj-ink)" }}>BibJournal</span>
            </div>
            <nav className="px-2 py-2 flex-1">
              {[
                { icon: NotebookPen, label: "Journal", active: true },
                { icon: BookOpen, label: "Bible" },
                { icon: HeartHandshake, label: "Prayer" },
                { icon: Mic, label: "Sermons" },
                { icon: Megaphone, label: "Proclamations" },
                { icon: Compass, label: "Research" },
              ].map(({ icon: Icon, label, active }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-0.5"
                  style={{ background: active ? "var(--bj-gold-tint)" : "transparent", color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)" }}>
                  <Icon size={12} />
                  <span className="font-sans" style={{ fontSize: 11 }}>{label}</span>
                </div>
              ))}
            </nav>
          </div>

          {/* Journal list */}
          <div className="hidden sm:flex flex-col border-r shrink-0" style={{ width: 220, borderColor: "var(--bj-line-soft)" }}>
            <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm" style={{ color: "var(--bj-ink)" }}>Journal</span>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--bj-gold)" }}>
                  <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>+</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {[
                { title: "Morning devotion", tag: "faith", feeling: "😊", date: "Today" },
                { title: "Romans 8 study", tag: "study", feeling: "✨", date: "Yesterday" },
                { title: "Prayer answered!", tag: "testimony", feeling: "🙏", date: "3 days ago" },
              ].map((e, i) => (
                <div key={i} className="px-4 py-3 border-b"
                  style={{ borderColor: "var(--bj-line-soft)", background: i === 0 ? "var(--bj-gold-tint)" : "transparent", borderLeft: i === 0 ? "2px solid var(--bj-gold)" : "2px solid transparent" }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-sans font-medium truncate" style={{ fontSize: 11, color: "var(--bj-ink)" }}>{e.title}</span>
                    <span style={{ fontSize: 11 }}>{e.feeling}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans px-1.5 py-0.5 rounded" style={{ fontSize: 9, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}>#{e.tag}</span>
                    <span className="font-sans ml-auto" style={{ fontSize: 9, color: "var(--bj-ink4)" }}>{e.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-sans text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>Today</span>
                <span className="font-sans text-xs px-2 py-0.5 rounded-lg flex items-center gap-1" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>😊 Grateful</span>
              </div>
              <p className="font-display" style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: "var(--bj-ink)", fontWeight: 400 }}>Morning devotion</p>
            </div>
            <div className="flex-1 px-6 py-5 overflow-hidden" style={{ background: "var(--bj-bg)" }}>
              <p className="font-display italic mb-3" style={{ fontSize: 15, color: "var(--bj-ink2)", lineHeight: 1.85, fontWeight: 300 }}>
                This morning I was reading Romans 8 and was struck by the promise...
              </p>
              <div className="px-4 py-3 rounded-xl mb-3" style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
                <p className="font-sans" style={{ fontSize: 10, color: "var(--bj-gold-deep)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Romans 8:28 · ESV</p>
                <p className="font-display italic" style={{ fontSize: 13, color: "var(--bj-ink)", lineHeight: 1.6, fontWeight: 300 }}>"And we know that for those who love God all things work together for good..."</p>
              </div>
              <p className="font-display italic" style={{ fontSize: 15, color: "var(--bj-ink3)", lineHeight: 1.85, fontWeight: 300 }}>
                I&apos;m reminded that even in difficult seasons, there is purpose...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating label */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "0 4px 20px color-mix(in oklch, var(--bj-ink) 10%, transparent)" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "var(--bj-gold)" }} />
        <span className="font-sans text-xs" style={{ color: "var(--bj-ink3)" }}>Auto-saving your words</span>
      </div>
    </div>
  );
}

// ── Features Grid ──────────────────────────────────────────

const FEATURES = [
  { icon: NotebookPen, label: "Journal", color: "var(--bj-gold)", desc: "Rich text writing with mood tracking, floating Bible panels, and AI assistance as you reflect." },
  { icon: BookOpen, label: "Bible Reader", color: "var(--bj-sage)", desc: "8 translations, live verse predictions, tap-to-highlight, and seamless chapter navigation." },
  { icon: HeartHandshake, label: "Prayer", color: "var(--bj-ember)", desc: "Log prayers, track streaks, and mark answered prayers with a testimony of God's faithfulness." },
  { icon: Mic, label: "Sermons", color: "var(--bj-gold)", desc: "Embed YouTube sermons with live notes and a verse reference panel that knows the Bible." },
  { icon: Compass, label: "Research", color: "var(--bj-sage)", desc: "AI commentary, semantic search, Greek/Hebrew word studies, and translation comparisons." },
  { icon: Megaphone, label: "Proclamations", color: "var(--bj-ember)", desc: "Declare scripture over your life. Organise into folders and share publicly with a link." },
];

function FeaturesGrid() {
  return (
    <section id="features" className="px-5 md:px-10 py-24 md:py-32">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal className="text-center mb-16">
          <p className="font-sans text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--bj-gold-deep)" }}>Everything you need</p>
          <h2 className="font-display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1.1 }}>
            A complete spiritual companion
          </h2>
          <p className="font-sans text-base mt-4 max-w-xl mx-auto" style={{ color: "var(--bj-ink3)", lineHeight: 1.7 }}>
            Every tool you need to go deeper in Scripture, prayer, and reflection — beautifully designed and always in reach.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.07}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, label, color, desc }: typeof FEATURES[0]) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="rounded-2xl p-6"
      style={{
        background: hov ? "var(--bj-bg-panel)" : "var(--bj-bg-soft)",
        border: `1px solid ${hov ? "var(--bj-line)" : "var(--bj-line-soft)"}`,
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 12px 36px color-mix(in oklch, var(--bj-ink) 8%, transparent)" : "none",
        transition: "all 0.18s ease",
        cursor: "default",
      }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `color-mix(in oklch, ${color} 14%, var(--bj-bg))` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <h3 className="font-display text-xl mb-2" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>{label}</h3>
      <p className="font-sans text-sm" style={{ color: "var(--bj-ink3)", lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

// ── Spotlight Sections ─────────────────────────────────────

function SpotlightSection({ reverse, eyebrow, title, desc, bullets, children }: {
  reverse?: boolean; eyebrow: string; title: string; desc: string;
  bullets: string[]; children: React.ReactNode;
}) {
  return (
    <section className="px-5 md:px-10 py-20 md:py-28">
      <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-20`}
        style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Text */}
        <Reveal className="flex-1 min-w-0">
          <p className="font-sans text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--bj-gold-deep)" }}>{eyebrow}</p>
          <h2 className="font-display mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1.15 }}>{title}</h2>
          <p className="font-sans text-base mb-6" style={{ color: "var(--bj-ink3)", lineHeight: 1.75 }}>{desc}</p>
          <ul className="flex flex-col gap-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
                  <Check size={10} style={{ color: "var(--bj-gold-deep)" }} />
                </div>
                <span className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.6 }}>{b}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Mockup */}
        <Reveal delay={0.15} className="flex-1 min-w-0 w-full">
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)", boxShadow: "0 20px 60px color-mix(in oklch, var(--bj-ink) 12%, transparent)" }}>
            {children}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Bible mockup ───────────────────────────────────────────

function BibleMockup() {
  return (
    <div>
      {/* Nav bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-soft)" }}>
        <span className="font-display text-sm" style={{ color: "var(--bj-ink)" }}>John</span>
        <span style={{ color: "var(--bj-ink4)" }}>·</span>
        <span className="font-display text-sm" style={{ color: "var(--bj-ink3)" }}>Ch. 3</span>
        <div className="flex-1" />
        {["ESV", "KJV", "NIV", "AMP"].map((v, i) => (
          <span key={v} className="font-sans px-2 py-0.5 rounded-md" style={{ fontSize: 10, background: i === 0 ? "var(--bj-gold)" : "transparent", color: i === 0 ? "white" : "var(--bj-ink4)", fontWeight: i === 0 ? 500 : 400 }}>{v}</span>
        ))}
      </div>

      {/* Verse input */}
      <div className="px-4 py-2 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
          <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>Go to verse…</span>
          <div className="ml-auto flex gap-1">
            {["John 3", "John 4", "John 5"].map((s, i) => (
              <span key={s} className="font-sans px-2 py-0.5 rounded-md" style={{ fontSize: 9, background: i === 0 ? "var(--bj-gold-tint)" : "transparent", color: i === 0 ? "var(--bj-gold-deep)" : "var(--bj-ink4)", border: i === 0 ? "1px solid var(--bj-gold-soft)" : "none" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Verses */}
      <div className="px-6 py-5">
        {[
          { n: 14, text: "And as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up,", highlight: true },
          { n: 15, text: "that whoever believes in him may have eternal life." },
          { n: 16, text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", highlight: true },
          { n: 17, text: "For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him." },
        ].map((v) => (
          <div key={v.n} className="flex gap-3 py-2 px-2 rounded-xl mb-1"
            style={{ background: v.highlight ? "var(--bj-gold-tint)" : "transparent", border: `1px solid ${v.highlight ? "var(--bj-gold-soft)" : "transparent"}` }}>
            <span className="font-sans shrink-0 w-5 text-right pt-0.5" style={{ fontSize: 10, color: v.highlight ? "var(--bj-gold-deep)" : "var(--bj-ink4)", fontWeight: 600 }}>{v.n}</span>
            <p className="font-sans text-sm" style={{ color: v.highlight ? "var(--bj-ink)" : "var(--bj-ink2)", lineHeight: 1.75 }}>{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Research mockup ────────────────────────────────────────

function ResearchMockup() {
  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 pb-3 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
        {[
          { icon: Languages, label: "Compare", active: false },
          { icon: MessageSquare, label: "Ask", active: true },
          { icon: FlaskConical, label: "Word Study", active: false },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: active ? "var(--bj-gold)" : "var(--bj-bg-soft)", color: active ? "white" : "var(--bj-ink3)", fontSize: 11 }}>
            <Icon size={10} /> {label}
          </div>
        ))}
      </div>

      {/* Ask interface */}
      <div className="p-4">
        <div className="px-3 py-2.5 rounded-xl mb-3 font-sans text-xs" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink3)" }}>
          What does the Bible say about forgiveness?
        </div>
        <div className="rounded-xl p-4 mb-3" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
          <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>Answer</p>
          <p className="font-sans text-xs" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>
            Forgiveness is central to the biblical narrative. Jesus teaches in Matthew 6:14 that forgiving others is directly linked to receiving God&apos;s forgiveness...
          </p>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
          <p className="font-sans" style={{ fontSize: 10, color: "var(--bj-gold-deep)", fontWeight: 600, marginBottom: 4 }}>Matthew 6:14 · ESV</p>
          <p className="font-display italic text-xs" style={{ color: "var(--bj-ink)", lineHeight: 1.6, fontWeight: 300 }}>"For if you forgive others their trespasses, your heavenly Father will also forgive you..."</p>
        </div>
      </div>
    </div>
  );
}

// ── Prayer mockup ──────────────────────────────────────────

function PrayerMockup() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>Prayer Journal</p>
          <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>3 active · 2 answered</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
          <Flame size={11} style={{ color: "var(--bj-gold)" }} />
          <span className="font-sans text-xs font-semibold" style={{ color: "var(--bj-gold-deep)" }}>7d streak</span>
        </div>
      </div>
      {[
        { title: "Healing for my father", days: "14d", answered: false },
        { title: "Provision for this month", days: "5d", answered: false },
        { title: "Career direction — answered!", days: "", answered: true },
      ].map((p, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2"
          style={{ background: "var(--bj-bg-soft)", border: `1px solid ${p.answered ? "color-mix(in oklch, var(--bj-sage) 30%, transparent)" : "var(--bj-line-soft)"}` }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: p.answered ? "color-mix(in oklch, var(--bj-sage) 15%, transparent)" : "color-mix(in oklch, var(--bj-ember) 12%, transparent)" }}>
            {p.answered
              ? <Check size={13} style={{ color: "var(--bj-sage)" }} />
              : <HeartHandshake size={13} style={{ color: "var(--bj-ember)" }} />}
          </div>
          <span className="font-sans text-sm flex-1" style={{ color: "var(--bj-ink)", fontWeight: 500, textDecoration: p.answered ? "line-through" : "none", opacity: p.answered ? 0.6 : 1 }}>{p.title}</span>
          {!p.answered && (
            <span className="font-sans text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "color-mix(in oklch, var(--bj-ember) 12%, transparent)", color: "var(--bj-ember)" }}>{p.days}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Proclamations mockup ───────────────────────────────────

function ProclamationsMockup() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>Declarations</p>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
          <Globe size={10} style={{ color: "var(--bj-ink4)" }} />
          <span className="font-sans" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>Public link</span>
        </div>
      </div>
      {[
        { num: 1, title: "I am more than a conqueror", body: "Romans 8:37 — through Him who loved us." },
        { num: 2, title: "I walk in divine health", body: "By His stripes I am healed. — Isaiah 53:5" },
        { num: 3, title: "My steps are ordered by the Lord", body: "Psalm 37:23 — He delights in my way." },
      ].map((d) => (
        <div key={d.num} className="flex gap-3 px-4 py-3.5 rounded-2xl mb-2"
          style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
          <span className="font-sans font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ fontSize: 10, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}>{d.num}</span>
          <div>
            <p className="font-sans font-semibold text-sm mb-0.5" style={{ color: "var(--bj-ink)", fontSize: 12 }}>{d.title}</p>
            <p className="font-display italic" style={{ fontSize: 11, color: "var(--bj-ink3)", fontWeight: 300 }}>{d.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CTA ────────────────────────────────────────────────────

function CTA() {
  const [hov, setHov] = useState(false);
  return (
    <section className="px-5 md:px-10 py-24 md:py-36 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 50%, color-mix(in oklch, var(--bj-gold-soft) 50%, transparent) 0%, transparent 70%), var(--bj-bg-soft)`
      }} />
      <Reveal className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12" style={{ background: "var(--bj-gold-soft)" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--bj-gold)" }} />
          <div className="h-px w-12" style={{ background: "var(--bj-gold-soft)" }} />
        </div>
        <h2 className="font-display mb-4" style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1.1 }}>
          Begin your<br />
          <span style={{ color: "var(--bj-gold)", fontStyle: "italic" }}>spiritual journey</span>
        </h2>
        <p className="font-sans text-base mb-10" style={{ color: "var(--bj-ink3)", lineHeight: 1.7 }}>
          Everything you need to go deeper in Scripture, prayer, and reflection.<br className="hidden md:block" />
          Free to start. Always with you.
        </p>
        <Link href="/login"
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          className="inline-flex items-center gap-2.5 font-sans text-base font-medium px-8 py-4 rounded-2xl"
          style={{
            background: hov ? "color-mix(in oklch, var(--bj-gold) 88%, black)" : "var(--bj-gold)",
            color: "white",
            transform: hov ? "translateY(-3px)" : "none",
            boxShadow: hov ? "0 12px 36px color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "0 4px 20px color-mix(in oklch, var(--bj-gold) 25%, transparent)",
            transition: "all 0.18s ease",
          }}>
          Get started with Google <ArrowRight size={16} />
        </Link>
        <p className="font-sans text-xs mt-5" style={{ color: "var(--bj-ink4)" }}>Free · No credit card · Works on all devices</p>
      </Reveal>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="px-5 md:px-10 py-8 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4" style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--bj-gold)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" /></svg>
          </div>
          <span className="font-display text-sm" style={{ color: "var(--bj-ink3)" }}>BibJournal</span>
          <span style={{ color: "var(--bj-line)" }}>·</span>
          <span className="font-sans" style={{ fontSize: 11, color: "var(--bj-ink4)" }}>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)", letterSpacing: "0.04em" }}>
            v{pkg.version}
          </span>
          <span className="font-sans text-xs italic" style={{ color: "var(--bj-ink4)" }}>{pkg.codename}</span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bj-bg)", minHeight: "100vh" }}>
      <Nav />
      <Hero />

      <FeaturesGrid />

      <SpotlightSection
        eyebrow="Journal"
        title={"Write freely.\nProcess the Word."}
        desc="A distraction-free writing space that stays out of your way. Rich formatting, mood tracking, floating Bible and AI panels — everything you need flows naturally as you reflect."
        bullets={[
          "10 mood indicators to capture how you feel each day",
          "Floating Bible reader while you write — no tab switching",
          "Ask AI any biblical question without leaving your entry",
          "5 beautiful writing fonts to match your tone",
          "Table view to see all entries at a glance",
        ]}
      >
        <HeroMockup />
      </SpotlightSection>

      <SpotlightSection
        reverse
        eyebrow="Bible"
        title="The Word, across\nevery translation."
        desc="Read, compare, and highlight scripture across 8 translations. As you type a reference, intelligent predictions guide you to the exact verse — then navigate the whole Bible without friction."
        bullets={[
          "ESV, KJV, NIV, AMP, MSG, ASV, NKJV and NLT built-in",
          "Live suggestions as you type — John 3, Ps 23, 1 Cor 13",
          "Tap any verse to highlight it in gold",
          "Compare the same passage across all translations at once",
        ]}
      >
        <BibleMockup />
      </SpotlightSection>

      <SpotlightSection
        eyebrow="Research · AI"
        title="Scripture study,\npowered by AI."
        desc="Ask any biblical question and receive a cited, scripture-backed answer drawn from semantic search across all 31,000 ESV verses. Generate chapter commentary, study Greek and Hebrew roots, and compare translations side by side."
        bullets={[
          "Semantic vector search — finds passages by meaning, not just keywords",
          "AI chapter commentary: themes, context, cross-references",
          "Greek & Hebrew word studies with Strongs numbers",
          "Research journaling mode — save findings, add reflections, finalise",
        ]}
      >
        <ResearchMockup />
      </SpotlightSection>

      <SpotlightSection
        reverse
        eyebrow="Prayer"
        title="Never forget what\nGod has answered."
        desc="Log every prayer, watch your streak grow, and mark answered prayers with a testimony. A faithful record of God's faithfulness over your life."
        bullets={[
          "Prayer streaks — stay consistent with daily logging",
          "Mark as answered and record the testimony",
          "Day-counter badges show how long you've been praying",
          "Separate views for active and answered prayers",
        ]}
      >
        <PrayerMockup />
      </SpotlightSection>

      <SpotlightSection
        eyebrow="Proclamations"
        title="Declare what\nGod says."
        desc="Write declarations of scripture over your life. Organise them into folders, share them publicly with a link, and speak them as living words — not just text."
        bullets={[
          "Organise declarations into themed folders",
          "Share any folder publicly with a single link",
          "Beautiful typography designed for proclamation",
          "In-place editing — always easy to update",
        ]}
      >
        <ProclamationsMockup />
      </SpotlightSection>

      <CTA />
      <Footer />
    </div>
  );
}
