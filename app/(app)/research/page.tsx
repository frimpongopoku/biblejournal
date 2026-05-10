"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, MessageSquare, Search, FlaskConical,
  Loader2, AlertCircle, Languages,
} from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

type Tab = "compare" | "commentary" | "ask" | "word";

const VERSIONS = ["ESV", "KJV", "NIV", "AMP", "MSG", "ASV", "NKJV", "NLT"];

interface CommentaryResult {
  summary: string;
  themes: string[];
  context: string;
  crossRefs: { ref: string; note: string }[];
  application: string;
}

interface AskResult {
  answer: string;
  keyVerses: { ref: string; text: string }[];
  furtherReading: string[];
}

interface WordResult {
  word: string;
  original: { language: string; term: string; transliteration: string; strongsNumber: string };
  definition: string;
  usageCount: number;
  nuances: string[];
  keyOccurrences: { ref: string; note: string }[];
  insight: string;
}

// ── Shared helpers ────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>
      {children}
    </p>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
    >
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  const isNoKey = message.includes("not configured");
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        background: isNoKey ? "var(--bj-gold-tint)" : "color-mix(in oklch, var(--bj-ember) 10%, transparent)",
        border: `1px solid ${isNoKey ? "var(--bj-gold-soft)" : "color-mix(in oklch, var(--bj-ember) 30%, transparent)"}`,
      }}
    >
      <AlertCircle size={14} style={{ color: isNoKey ? "var(--bj-gold-deep)" : "var(--bj-ember)", flexShrink: 0, marginTop: 1 }} />
      <div>
        <p className="font-sans text-xs font-medium" style={{ color: isNoKey ? "var(--bj-gold-deep)" : "var(--bj-ember)" }}>
          {isNoKey ? "API key required" : "Something went wrong"}
        </p>
        <p className="font-sans text-xs mt-0.5" style={{ color: "var(--bj-ink3)" }}>
          {isNoKey
            ? "Add ANTHROPIC_API_KEY to your .env.local file to enable AI features."
            : message}
        </p>
      </div>
    </div>
  );
}

// ── Compare Translations ──────────────────────────────────

function CompareTab() {
  const [ref, setRef] = useState("");
  const [results, setResults] = useState<Record<string, { n: number; text: string }[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set(VERSIONS));

  async function handleCompare() {
    const parsed = parseRef(ref);
    if (!parsed) { setError("Enter a valid reference like "John 3" or "Ps 23:1""); return; }
    setError(""); setLoading(true); setResults(null);

    try {
      const vers = VERSIONS.filter((v) => selectedVersions.has(v));
      const fetches = vers.map((v) =>
        fetch(`/api/bible/${v}/${encodeURIComponent(parsed.book)}/${parsed.chapter}`)
          .then((r) => r.json())
          .then((d) => [v, d.verses ?? []] as [string, { n: number; text: string }[]])
      );
      const entries = await Promise.all(fetches);
      setResults(Object.fromEntries(entries));
    } catch {
      setError("Failed to load translations.");
    } finally {
      setLoading(false);
    }
  }

  const parsed = parseRef(ref);
  const targetVerse = parsed?.verse;

  function toggleVersion(v: string) {
    setSelectedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(v) && next.size > 1) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionLabel>Reference</SectionLabel>
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
          >
            <Languages size={13} style={{ color: "var(--bj-ink4)" }} />
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCompare(); }}
              placeholder="John 3, Ps 23:1, Romans 8…"
              className="flex-1 bg-transparent outline-none font-sans text-sm"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
              autoComplete="off" spellCheck={false}
            />
          </div>

          <div>
            <SectionLabel>Translations</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {VERSIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleVersion(v)}
                  className="font-sans text-xs px-2.5 py-1 rounded-lg"
                  style={{
                    background: selectedVersions.has(v) ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                    color: selectedVersions.has(v) ? "white" : "var(--bj-ink3)",
                    fontWeight: selectedVersions.has(v) ? 500 : 400,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={loading || !ref.trim()}
            className="bj-btn-primary font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "var(--bj-gold)", color: "white" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
            {loading ? "Loading…" : "Compare"}
          </button>

          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {parsed && (
              <p className="font-display italic text-base" style={{ color: "var(--bj-ink3)", fontWeight: 300 }}>
                {parsed.book} {parsed.chapter}{parsed.verse ? `:${parsed.verse}` : ""} — across {selectedVersions.size} translations
              </p>
            )}
            {Object.entries(results).map(([version, verses]) => {
              const display = targetVerse ? verses.filter((v) => v.n === targetVerse) : verses;
              return (
                <Card key={version}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                    >
                      {version}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {display.map((v) => (
                      <div key={v.n} className="flex gap-3">
                        <span className="font-sans text-xs shrink-0 w-5 text-right pt-0.5 select-none" style={{ color: "var(--bj-ink4)", fontWeight: 600, fontSize: 11 }}>
                          {v.n}
                        </span>
                        <p className="font-sans text-sm flex-1" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{v.text}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Commentary ────────────────────────────────────────────

function CommentaryTab() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<CommentaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    const parsed = parseRef(ref);
    if (!parsed) { setError("Enter a valid chapter reference like "Romans 8""); return; }
    setError(""); setLoading(true); setResult(null);

    try {
      const res = await fetch("/api/research/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: parsed.book, chapter: parsed.chapter }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionLabel>Chapter</SectionLabel>
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
          >
            <BookOpen size={13} style={{ color: "var(--bj-ink4)" }} />
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
              placeholder="Romans 8, John 15, Ps 91…"
              className="flex-1 bg-transparent outline-none font-sans text-sm"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
              autoComplete="off" spellCheck={false}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !ref.trim()}
            className="bj-btn-primary font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "var(--bj-gold)", color: "white" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
            {loading ? "Generating…" : "Generate Commentary"}
          </button>
          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <Card>
              <SectionLabel>Summary</SectionLabel>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.summary}</p>
            </Card>

            <Card>
              <SectionLabel>Key Themes</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {result.themes.map((t) => (
                  <span key={t} className="font-sans text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <SectionLabel>Historical & Literary Context</SectionLabel>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.context}</p>
            </Card>

            <Card>
              <SectionLabel>Cross-References</SectionLabel>
              <div className="flex flex-col gap-3">
                {result.crossRefs.map((cr) => (
                  <div key={cr.ref} className="flex gap-3">
                    <span className="font-sans text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-full h-fit" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
                      {cr.ref}
                    </span>
                    <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.65 }}>{cr.note}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionLabel>Application</SectionLabel>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.application}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Ask Anything ──────────────────────────────────────────

function AskTab() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    if (!question.trim()) return;
    setError(""); setLoading(true); setResult(null);

    try {
      const res = await fetch("/api/research/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionLabel>Ask a Biblical Question</SectionLabel>
        <div className="flex flex-col gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder="What does the Bible say about forgiveness? Who was Melchizedek? What is the meaning of grace?"
            rows={3}
            className="w-full bg-transparent outline-none resize-none font-sans text-sm px-3 py-2.5 rounded-xl"
            style={{ color: "var(--bj-ink)", background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", caretColor: "var(--bj-gold)", lineHeight: 1.65 }}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="bj-btn-primary font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "var(--bj-gold)", color: "white" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
            {loading ? "Searching Scripture…" : "Ask"}
          </button>
          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <Card>
              <SectionLabel>Answer</SectionLabel>
              <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--bj-ink2)", lineHeight: 1.8 }}>
                {result.answer}
              </p>
            </Card>

            {result.keyVerses?.length > 0 && (
              <Card>
                <SectionLabel>Key Verses</SectionLabel>
                <div className="flex flex-col gap-3">
                  {result.keyVerses.map((v) => (
                    <div key={v.ref} className="flex flex-col gap-1">
                      <span className="font-sans text-[11px] font-semibold w-fit px-2 py-0.5 rounded-full" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
                        {v.ref}
                      </span>
                      <p className="font-display italic text-sm" style={{ color: "var(--bj-ink2)", fontWeight: 400, lineHeight: 1.65 }}>
                        "{v.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {result.furtherReading?.length > 0 && (
              <Card>
                <SectionLabel>Further Reading</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {result.furtherReading.map((r) => (
                    <span key={r} className="font-sans text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink3)", border: "1px solid var(--bj-line)" }}>
                      {r}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Word Study ────────────────────────────────────────────

function WordStudyTab() {
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStudy() {
    if (!word.trim()) return;
    const parsed = context.trim() ? parseRef(context) : null;
    setError(""); setLoading(true); setResult(null);

    try {
      const res = await fetch("/api/research/word-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), book: parsed?.book, chapter: parsed?.chapter, verse: parsed?.verse }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-col gap-3">
          <div>
            <SectionLabel>Word</SectionLabel>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
              <FlaskConical size={13} style={{ color: "var(--bj-ink4)" }} />
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="grace, shalom, logos, agape…"
                className="flex-1 bg-transparent outline-none font-sans text-sm"
                style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                autoComplete="off" spellCheck={false}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Context verse (optional)</SectionLabel>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
              <BookOpen size={13} style={{ color: "var(--bj-ink4)" }} />
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="John 1:1, Eph 2:8…"
                className="flex-1 bg-transparent outline-none font-sans text-sm"
                style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                autoComplete="off" spellCheck={false}
              />
            </div>
          </div>

          <button
            onClick={handleStudy}
            disabled={loading || !word.trim()}
            className="bj-btn-primary font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "var(--bj-gold)", color: "white" }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
            {loading ? "Studying…" : "Study Word"}
          </button>
          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <Card>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-display text-2xl" style={{ color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.1 }}>{result.word}</h2>
                  <p className="font-sans text-xs mt-1" style={{ color: "var(--bj-ink4)" }}>
                    {result.original.language} · {result.original.term} · {result.original.transliteration}
                  </p>
                </div>
                <span className="font-sans text-xs px-2.5 py-1 rounded-full shrink-0" style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink3)", border: "1px solid var(--bj-line)" }}>
                  {result.original.strongsNumber}
                </span>
              </div>
              <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.definition}</p>
              {result.usageCount > 0 && (
                <p className="font-sans text-xs mt-2" style={{ color: "var(--bj-ink4)" }}>Appears ~{result.usageCount}× in Scripture</p>
              )}
            </Card>

            <Card>
              <SectionLabel>Shades of Meaning</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {result.nuances.map((n, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: "var(--bj-gold)" }} />
                    <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.65 }}>{n}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionLabel>Notable Uses</SectionLabel>
              <div className="flex flex-col gap-3">
                {result.keyOccurrences.map((o) => (
                  <div key={o.ref} className="flex gap-3">
                    <span className="font-sans text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded-full h-fit" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
                      {o.ref}
                    </span>
                    <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.65 }}>{o.note}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionLabel>Insight</SectionLabel>
              <p className="font-display italic text-base" style={{ color: "var(--bj-ink2)", fontWeight: 400, lineHeight: 1.7 }}>{result.insight}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "compare",    label: "Compare",    icon: Languages,     desc: "Same passage across all 8 translations — no AI key needed" },
  { id: "commentary", label: "Commentary", icon: BookOpen,      desc: "AI-generated themes, context & cross-references" },
  { id: "ask",        label: "Ask",        icon: MessageSquare, desc: "Ask a biblical question and get a cited, scripture-backed answer" },
  { id: "word",       label: "Word Study", icon: FlaskConical,  desc: "Greek & Hebrew definitions, Strongs numbers, usage patterns" },
];

export default function ResearchPage() {
  const [tab, setTab] = useState<Tab>("compare");

  return (
    <AppShell>
      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Search size={14} style={{ color: "var(--bj-gold)" }} />
            <p className="font-sans text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-gold-deep)" }}>
              Research
            </p>
          </div>
          <h1 className="font-display mb-1" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.1 }}>
            Explore Scripture
          </h1>
          <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", lineHeight: 1.65 }}>
            Compare translations, generate commentary, study original languages, and ask AI biblical questions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-sm"
                style={{
                  background: active ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                  color: active ? "white" : "var(--bj-ink3)",
                  fontWeight: active ? 500 : 400,
                  border: active ? "none" : "1px solid var(--bj-line-soft)",
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>

        <p className="font-sans text-xs mb-5" style={{ color: "var(--bj-ink4)" }}>
          {TABS.find((t) => t.id === tab)?.desc}
        </p>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "compare"    && <CompareTab />}
            {tab === "commentary" && <CommentaryTab />}
            {tab === "ask"        && <AskTab />}
            {tab === "word"       && <WordStudyTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
