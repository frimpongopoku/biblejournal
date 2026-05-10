"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, MessageSquare, Search, FlaskConical, Languages,
  Loader2, AlertCircle, BookmarkPlus, Check, X, Pencil,
  FileText, Copy, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";

// ── Types ──────────────────────────────────────────────────

type Tab = "compare" | "commentary" | "ask" | "word";

const VERSIONS = ["ESV", "KJV", "NIV", "AMP", "MSG", "ASV", "NKJV", "NLT"];

interface NoteItem {
  id: string;
  type: Tab;
  source: string;
  content: string;
  personalNote: string;
  savedAt: number;
}
type SavePayload = Omit<NoteItem, "id" | "personalNote" | "savedAt">;

interface CommentaryResult {
  summary: string; themes: string[];
  context: string; crossRefs: { ref: string; note: string }[]; application: string;
}
interface AskResult {
  answer: string; keyVerses: { ref: string; text: string }[]; furtherReading: string[];
}
interface WordResult {
  word: string;
  original: { language: string; term: string; transliteration: string; strongsNumber: string };
  definition: string; usageCount: number; nuances: string[];
  keyOccurrences: { ref: string; note: string }[]; insight: string;
}

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "compare",    label: "Compare",    icon: Languages,     desc: "Same passage side-by-side across all 8 translations" },
  { id: "commentary", label: "Commentary", icon: BookOpen,      desc: "AI themes, context & cross-references for any chapter" },
  { id: "ask",        label: "Ask",        icon: MessageSquare, desc: "Ask a biblical question — get a cited, scripture-backed answer" },
  { id: "word",       label: "Word Study", icon: FlaskConical,  desc: "Greek & Hebrew root, Strongs number, nuances & usage" },
];

// ── Shared UI ──────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>
      {children}
    </p>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  const noKey = message.includes("not configured");
  return (
    <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{
      background: noKey ? "var(--bj-gold-tint)" : "color-mix(in oklch, var(--bj-ember) 10%, transparent)",
      border: `1px solid ${noKey ? "var(--bj-gold-soft)" : "color-mix(in oklch, var(--bj-ember) 30%, transparent)"}`,
    }}>
      <AlertCircle size={14} style={{ color: noKey ? "var(--bj-gold-deep)" : "var(--bj-ember)", flexShrink: 0, marginTop: 1 }} />
      <div>
        <p className="font-sans text-xs font-medium" style={{ color: noKey ? "var(--bj-gold-deep)" : "var(--bj-ember)" }}>
          {noKey ? "API key required" : "Something went wrong"}
        </p>
        <p className="font-sans text-xs mt-0.5" style={{ color: "var(--bj-ink3)" }}>
          {noKey ? "Add ANTHROPIC_API_KEY to your .env.local to enable AI features." : message}
        </p>
      </div>
    </div>
  );
}

function RefBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 h-fit"
      style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
      {children}
    </span>
  );
}

function SaveBtn({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <button
      onClick={onSave}
      title={saved ? "Saved to notes" : "Save to notes"}
      className="flex items-center gap-1 font-sans text-xs px-2 py-1 rounded-lg shrink-0 transition-all duration-150"
      style={{
        color: saved ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
        background: saved ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
        border: `1px solid ${saved ? "var(--bj-gold-soft)" : "var(--bj-line-soft)"}`,
      }}
    >
      {saved ? <Check size={10} /> : <BookmarkPlus size={10} />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}

// ── Compare Tab ────────────────────────────────────────────

function CompareTab({ onSave }: { onSave: (p: SavePayload) => void }) {
  const [ref, setRef] = useState("");
  const [results, setResults] = useState<Record<string, { n: number; text: string }[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(VERSIONS));
  const [saved, setSaved] = useState<Set<string>>(new Set());

  async function handleCompare() {
    const parsed = parseRef(ref);
    if (!parsed) { setError('Enter a valid reference like "John 3" or "Ps 23:1"'); return; }
    setError(""); setLoading(true); setResults(null); setSaved(new Set());
    try {
      const vers = VERSIONS.filter((v) => selected.has(v));
      const entries = await Promise.all(
        vers.map((v) =>
          fetch(`/api/bible/${v}/${encodeURIComponent(parsed.book)}/${parsed.chapter}`)
            .then((r) => r.json())
            .then((d) => [v, d.verses ?? []] as [string, { n: number; text: string }[]])
        )
      );
      setResults(Object.fromEntries(entries));
    } catch { setError("Failed to load translations."); }
    finally { setLoading(false); }
  }

  function toggleVersion(v: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(v) && next.size > 1) next.delete(v); else next.add(v);
      return next;
    });
  }

  const parsed = parseRef(ref);
  const targetVerse = parsed?.verse;

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionLabel>Reference</SectionLabel>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
            <Languages size={13} style={{ color: "var(--bj-ink4)" }} />
            <input value={ref} onChange={(e) => setRef(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCompare(); }}
              placeholder="John 3, Ps 23:1, Romans 8…"
              className="flex-1 bg-transparent outline-none font-sans text-sm"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
              autoComplete="off" spellCheck={false} />
          </div>
          <div>
            <SectionLabel>Translations</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {VERSIONS.map((v) => (
                <button key={v} onClick={() => toggleVersion(v)}
                  className="font-sans text-xs px-2.5 py-1 rounded-lg transition-all duration-150"
                  style={{
                    background: selected.has(v) ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                    color: selected.has(v) ? "white" : "var(--bj-ink3)",
                    fontWeight: selected.has(v) ? 500 : 400,
                    border: `1px solid ${selected.has(v) ? "transparent" : "var(--bj-line-soft)"}`,
                  }}>{v}</button>
              ))}
            </div>
          </div>
          <button onClick={handleCompare} disabled={loading || !ref.trim()}
            className="font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
            style={{ background: "var(--bj-gold)", color: "white" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
            {loading ? "Loading…" : "Compare"}
          </button>
          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
            {parsed && (
              <p className="font-display italic text-base" style={{ color: "var(--bj-ink3)", fontWeight: 300 }}>
                {parsed.book} {parsed.chapter}{parsed.verse ? `:${parsed.verse}` : ""} — {selected.size} translations
              </p>
            )}
            {Object.entries(results).map(([version, verses]) => {
              const display = targetVerse ? verses.filter((v) => v.n === targetVerse) : verses;
              const key = `${version}-${ref}`;
              return (
                <Card key={version}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <RefBadge>{version}</RefBadge>
                    <SaveBtn saved={saved.has(key)} onSave={() => {
                      setSaved((p) => new Set([...p, key]));
                      onSave({
                        type: "compare",
                        source: `${parsed?.book} ${parsed?.chapter}${parsed?.verse ? `:${parsed.verse}` : ""} — ${version}`,
                        content: display.map((v) => `[${v.n}] ${v.text}`).join(" "),
                      });
                    }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    {display.map((v) => (
                      <div key={v.n} className="flex gap-3">
                        <span className="font-sans shrink-0 w-5 text-right pt-0.5 select-none" style={{ color: "var(--bj-ink4)", fontWeight: 600, fontSize: 11 }}>{v.n}</span>
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

// ── Commentary Tab ─────────────────────────────────────────

function CommentaryTab({ onSave }: { onSave: (p: SavePayload) => void }) {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<CommentaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [currentRef, setCurrentRef] = useState("");

  async function handleGenerate() {
    const parsed = parseRef(ref);
    if (!parsed) { setError('Enter a chapter like "Romans 8"'); return; }
    setError(""); setLoading(true); setResult(null); setSaved(false);
    setCurrentRef(`${parsed.book} ${parsed.chapter}`);
    try {
      const res = await fetch("/api/research/commentary", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: parsed.book, chapter: parsed.chapter }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setResult(data);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  function saveResult() {
    if (!result) return;
    setSaved(true);
    onSave({
      type: "commentary",
      source: `${currentRef} — Commentary`,
      content: [
        `Summary: ${result.summary}`,
        `Themes: ${result.themes.join(", ")}`,
        `Context: ${result.context}`,
        `Application: ${result.application}`,
      ].join("\n\n"),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionLabel>Chapter</SectionLabel>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
            <BookOpen size={13} style={{ color: "var(--bj-ink4)" }} />
            <input value={ref} onChange={(e) => setRef(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
              placeholder="Romans 8, John 15, Ps 91…"
              className="flex-1 bg-transparent outline-none font-sans text-sm"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
              autoComplete="off" spellCheck={false} />
          </div>
          <button onClick={handleGenerate} disabled={loading || !ref.trim()}
            className="font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
            style={{ background: "var(--bj-gold)", color: "white" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
            {loading ? "Generating…" : "Generate Commentary"}
          </button>
          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-display italic text-base" style={{ color: "var(--bj-ink3)", fontWeight: 300 }}>{currentRef}</p>
              <SaveBtn saved={saved} onSave={saveResult} />
            </div>
            <Card>
              <SectionLabel>Summary</SectionLabel>
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.summary}</p>
            </Card>
            <Card>
              <SectionLabel>Key Themes</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {result.themes.map((t) => (
                  <span key={t} className="font-sans text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>{t}</span>
                ))}
              </div>
            </Card>
            <Card>
              <SectionLabel>Historical & Literary Context</SectionLabel>
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.context}</p>
            </Card>
            <Card>
              <SectionLabel>Cross-References</SectionLabel>
              <div className="flex flex-col gap-3">
                {result.crossRefs.map((cr) => (
                  <div key={cr.ref} className="flex gap-3">
                    <RefBadge>{cr.ref}</RefBadge>
                    <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.65 }}>{cr.note}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionLabel>Application</SectionLabel>
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.application}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Ask Tab ────────────────────────────────────────────────

function AskTab({ onSave }: { onSave: (p: SavePayload) => void }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  async function handleAsk() {
    if (!question.trim()) return;
    setError(""); setLoading(true); setResult(null); setSaved(new Set());
    try {
      const res = await fetch("/api/research/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setResult(data);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionLabel>Ask a Biblical Question</SectionLabel>
        <div className="flex flex-col gap-3">
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder="What does the Bible say about forgiveness? Who was Melchizedek? What is the meaning of grace?"
            rows={3} className="w-full bg-transparent outline-none resize-none font-sans text-sm px-3 py-2.5 rounded-xl"
            style={{ color: "var(--bj-ink)", background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", caretColor: "var(--bj-gold)", lineHeight: 1.65 }} />
          <button onClick={handleAsk} disabled={loading || !question.trim()}
            className="font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
            style={{ background: "var(--bj-gold)", color: "white" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
            {loading ? "Searching Scripture…" : "Ask"}
          </button>
          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
            <Card>
              <div className="flex items-start justify-between gap-3 mb-3">
                <SectionLabel>Answer</SectionLabel>
                <SaveBtn saved={saved.has("answer")} onSave={() => {
                  setSaved((p) => new Set([...p, "answer"]));
                  onSave({ type: "ask", source: `Q: ${question.slice(0, 60)}${question.length > 60 ? "…" : ""}`, content: result.answer });
                }} />
              </div>
              <p className="font-sans text-sm whitespace-pre-wrap" style={{ color: "var(--bj-ink2)", lineHeight: 1.8 }}>{result.answer}</p>
            </Card>

            {result.keyVerses?.length > 0 && (
              <Card>
                <SectionLabel>Key Verses</SectionLabel>
                <div className="flex flex-col gap-3">
                  {result.keyVerses.map((v) => (
                    <div key={v.ref} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <RefBadge>{v.ref}</RefBadge>
                        <SaveBtn saved={saved.has(`verse-${v.ref}`)} onSave={() => {
                          setSaved((p) => new Set([...p, `verse-${v.ref}`]));
                          onSave({ type: "ask", source: v.ref, content: `"${v.text}"` });
                        }} />
                      </div>
                      <p className="font-display italic text-sm mt-1" style={{ color: "var(--bj-ink2)", fontWeight: 400, lineHeight: 1.65 }}>"{v.text}"</p>
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
                    <span key={r} className="font-sans text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink3)", border: "1px solid var(--bj-line)" }}>{r}</span>
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

// ── Word Study Tab ─────────────────────────────────────────

function WordStudyTab({ onSave }: { onSave: (p: SavePayload) => void }) {
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<WordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleStudy() {
    if (!word.trim()) return;
    const parsed = context.trim() ? parseRef(context) : null;
    setError(""); setLoading(true); setResult(null); setSaved(false);
    try {
      const res = await fetch("/api/research/word-study", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), book: parsed?.book, chapter: parsed?.chapter, verse: parsed?.verse }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setResult(data);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  function saveResult() {
    if (!result) return;
    setSaved(true);
    onSave({
      type: "word",
      source: `Word Study: ${result.word} (${result.original.term})`,
      content: [
        `${result.original.language} · ${result.original.term} · ${result.original.transliteration} · ${result.original.strongsNumber}`,
        result.definition,
        `Shades of meaning: ${result.nuances.join("; ")}`,
        `Insight: ${result.insight}`,
      ].join("\n\n"),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-col gap-3">
          <div>
            <SectionLabel>Word</SectionLabel>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
              <FlaskConical size={13} style={{ color: "var(--bj-ink4)" }} />
              <input value={word} onChange={(e) => setWord(e.target.value)}
                placeholder="grace, shalom, logos, agape…"
                className="flex-1 bg-transparent outline-none font-sans text-sm"
                style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                autoComplete="off" spellCheck={false} />
            </div>
          </div>
          <div>
            <SectionLabel>Context verse (optional)</SectionLabel>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
              <BookOpen size={13} style={{ color: "var(--bj-ink4)" }} />
              <input value={context} onChange={(e) => setContext(e.target.value)}
                placeholder="John 1:1, Eph 2:8…"
                className="flex-1 bg-transparent outline-none font-sans text-sm"
                style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                autoComplete="off" spellCheck={false} />
            </div>
          </div>
          <button onClick={handleStudy} disabled={loading || !word.trim()}
            className="font-sans text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
            style={{ background: "var(--bj-gold)", color: "white" }}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
            {loading ? "Studying…" : "Study Word"}
          </button>
          {error && <ErrorBox message={error} />}
        </div>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
            <Card>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-display text-2xl" style={{ color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.1 }}>{result.word}</h2>
                  <p className="font-sans text-xs mt-1" style={{ color: "var(--bj-ink4)" }}>
                    {result.original.language} · {result.original.term} · {result.original.transliteration}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-sans text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink3)", border: "1px solid var(--bj-line)" }}>
                    {result.original.strongsNumber}
                  </span>
                  <SaveBtn saved={saved} onSave={saveResult} />
                </div>
              </div>
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>{result.definition}</p>
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
                    <RefBadge>{o.ref}</RefBadge>
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

// ── Notes Panel ────────────────────────────────────────────

function compileNotes(notes: NoteItem[], freeText: string): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const lines: string[] = [`RESEARCH NOTES — ${date}`, ""];
  for (const note of notes) {
    lines.push(`── ${note.source}`);
    lines.push(note.content);
    if (note.personalNote.trim()) lines.push(`\n💭 ${note.personalNote}`);
    lines.push("");
  }
  if (freeText.trim()) {
    lines.push("── MY WRITING ─────────────────────────────");
    lines.push(freeText);
  }
  return lines.join("\n");
}

function NotesPanel({
  notes, onUpdateNote, onRemove, onClose,
}: {
  notes: NoteItem[];
  onUpdateNote: (id: string, note: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [freeText, setFreeText] = useState("");
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const compiled = compileNotes(notes, freeText);

  function handleCopy() {
    navigator.clipboard.writeText(compiled);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bj-bg-panel)", borderLeft: "1px solid var(--bj-line-soft)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
        <Pencil size={13} style={{ color: "var(--bj-gold)" }} />
        <span className="font-sans text-xs font-semibold uppercase tracking-widest flex-1" style={{ color: "var(--bj-ink4)" }}>
          Notes {notes.length > 0 && <span style={{ color: "var(--bj-gold-deep)" }}>({notes.length})</span>}
        </span>
        <button onClick={() => setFinalizeOpen(!finalizeOpen)}
          className="flex items-center gap-1.5 font-sans text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150"
          style={{
            background: finalizeOpen ? "var(--bj-gold)" : "var(--bj-gold-tint)",
            color: finalizeOpen ? "white" : "var(--bj-gold-deep)",
            border: `1px solid var(--bj-gold-soft)`,
          }}>
          <FileText size={11} />
          {finalizeOpen ? "Hide" : "Finalise"}
        </button>
        <button onClick={onClose} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}>
          <X size={14} />
        </button>
      </div>

      {/* Finalize compiled view */}
      <AnimatePresence>
        {finalizeOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden shrink-0 border-b" style={{ borderColor: "var(--bj-line-soft)" }}
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <p className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>Compiled</p>
                <button onClick={handleCopy}
                  className="flex items-center gap-1 font-sans text-xs px-2 py-1 rounded-lg transition-all duration-150"
                  style={{ background: copied ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)", color: copied ? "var(--bj-gold-deep)" : "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}>
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? "Copied!" : "Copy all"}
                </button>
              </div>
              <textarea readOnly value={compiled} rows={8}
                className="w-full font-sans text-xs resize-none rounded-xl px-3 py-2.5 outline-none"
                style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink2)", lineHeight: 1.7 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 min-h-0">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bj-bg-soft)" }}>
              <BookmarkPlus size={18} style={{ color: "var(--bj-ink4)" }} />
            </div>
            <div>
              <p className="font-sans text-xs font-medium mb-1" style={{ color: "var(--bj-ink2)" }}>No saved findings yet</p>
              <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)", lineHeight: 1.6 }}>
                Hit <strong>Save</strong> on any result to collect it here
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notes.map((note, i) => (
              <NoteCard key={note.id} note={note} index={i} onUpdate={onUpdateNote} onRemove={onRemove} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Free writing area */}
      <div className="shrink-0 border-t px-3 py-3" style={{ borderColor: "var(--bj-line-soft)" }}>
        <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>
          My Writing
        </p>
        <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)}
          placeholder="Write your thoughts, reflections, or sermon outline here…"
          rows={5} className="w-full bg-transparent outline-none resize-none font-sans text-xs rounded-xl px-3 py-2.5"
          style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)", border: "1px solid var(--bj-line-soft)", background: "var(--bj-bg-soft)", lineHeight: 1.7 }} />
      </div>
    </div>
  );
}

function NoteCard({ note, index, onUpdate, onRemove }: {
  note: NoteItem; index: number;
  onUpdate: (id: string, note: string) => void;
  onRemove: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const ICON_MAP: Record<Tab, React.ElementType> = {
    compare: Languages, commentary: BookOpen, ask: MessageSquare, word: FlaskConical,
  };
  const Icon = ICON_MAP[note.type];

  return (
    <motion.div layout
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.03, duration: 0.18 }}
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon size={11} style={{ color: "var(--bj-gold)", flexShrink: 0 }} />
        <p className="font-sans text-xs font-medium flex-1 truncate" style={{ color: "var(--bj-ink)" }}>{note.source}</p>
        <button onClick={() => setCollapsed(!collapsed)} className="bj-btn-icon w-5 h-5 flex items-center justify-center rounded shrink-0" style={{ color: "var(--bj-ink4)" }}>
          {collapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
        </button>
        <button onClick={() => onRemove(note.id)} className="bj-btn-icon w-5 h-5 flex items-center justify-center rounded shrink-0" style={{ color: "var(--bj-ink4)" }}
          title="Remove">
          <Trash2 size={10} />
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 flex flex-col gap-2">
              <p className="font-sans text-[11px] leading-relaxed line-clamp-3"
                style={{ color: "var(--bj-ink3)", borderTop: "1px solid var(--bj-line-soft)", paddingTop: 8 }}>
                {note.content}
              </p>
              <input
                value={note.personalNote}
                onChange={(e) => onUpdate(note.id, e.target.value)}
                placeholder="Add your reflection…"
                className="w-full bg-transparent outline-none font-sans text-xs"
                style={{ color: "var(--bj-ink2)", caretColor: "var(--bj-gold)", borderTop: "1px solid var(--bj-line-soft)", paddingTop: 6 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function ResearchPage() {
  const [tab, setTab] = useState<Tab>("compare");
  const [hoveredTab, setHoveredTab] = useState<Tab | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [mobileNotesOpen, setMobileNotesOpen] = useState(false);

  function handleSave(payload: SavePayload) {
    setNotes((prev) => [
      ...prev,
      { ...payload, id: crypto.randomUUID(), personalNote: "", savedAt: Date.now() },
    ]);
    // Auto-open notes panel on first save
    setNotesOpen(true);
  }

  function handleUpdateNote(id: string, note: string) {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, personalNote: note } : n));
  }

  function handleRemove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  const notesPanel = notesOpen ? (
    <NotesPanel notes={notes} onUpdateNote={handleUpdateNote} onRemove={handleRemove} onClose={() => setNotesOpen(false)} />
  ) : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Research content ─────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-4 md:px-8 lg:px-10 py-8 pb-32 md:pb-8" style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Search size={14} style={{ color: "var(--bj-gold)" }} />
                <p className="font-sans text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-gold-deep)" }}>Research</p>
              </div>
              <h1 className="font-display mb-1" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.1 }}>
                Explore Scripture
              </h1>
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", lineHeight: 1.6 }}>
                Compare, study, ask, and save findings to your research notes.
              </p>
            </div>

            {/* Notes toggle button */}
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="hidden md:flex items-center gap-2 font-sans text-sm px-3 py-2 rounded-xl shrink-0 transition-all duration-150"
              style={{
                background: notesOpen ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                color: notesOpen ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                border: `1px solid ${notesOpen ? "var(--bj-gold-soft)" : "var(--bj-line-soft)"}`,
              }}
            >
              <Pencil size={13} />
              Notes {notes.length > 0 && <span className="font-sans text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--bj-gold)", color: "white", fontSize: 10 }}>{notes.length}</span>}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              const hovered = hoveredTab === id && !active;
              return (
                <button key={id} onClick={() => setTab(id)}
                  onMouseEnter={() => setHoveredTab(id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-sm"
                  style={{
                    background: active ? "var(--bj-gold)" : hovered ? "var(--bj-line)" : "var(--bj-bg-soft)",
                    color: active ? "white" : hovered ? "var(--bj-ink)" : "var(--bj-ink3)",
                    fontWeight: active ? 500 : 400,
                    border: active ? "none" : "1px solid var(--bj-line-soft)",
                    transform: hovered ? "translateY(-1px)" : "none",
                    boxShadow: hovered ? "0 2px 8px color-mix(in oklch, var(--bj-ink) 8%, transparent)" : "none",
                    transition: "all 0.14s ease",
                  }}>
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
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }}>
              {tab === "compare"    && <CompareTab    onSave={handleSave} />}
              {tab === "commentary" && <CommentaryTab onSave={handleSave} />}
              {tab === "ask"        && <AskTab        onSave={handleSave} />}
              {tab === "word"       && <WordStudyTab  onSave={handleSave} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Desktop notes panel ──────────────────── */}
      <AnimatePresence>
        {notesOpen && (
          <motion.aside
            key="notes-desktop"
            className="hidden md:flex flex-col shrink-0 overflow-hidden"
            style={{ width: 340 }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.26 }}
          >
            {notesPanel}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile FAB ───────────────────────────── */}
      <button
        onClick={() => setMobileNotesOpen(true)}
        className="md:hidden fixed flex items-center gap-2 font-sans text-sm px-4 py-2.5 rounded-2xl shadow-lg z-40"
        style={{
          bottom: 88, right: 16,
          background: "var(--bj-gold)",
          color: "white",
          boxShadow: "0 4px 20px color-mix(in oklch, var(--bj-gold) 40%, transparent)",
        }}
      >
        <Pencil size={14} />
        Notes {notes.length > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)", fontSize: 10 }}>{notes.length}</span>}
      </button>

      {/* ── Mobile notes bottom sheet ────────────── */}
      <AnimatePresence>
        {mobileNotesOpen && (
          <>
            <motion.div key="notes-scrim" className="md:hidden fixed inset-0 z-40"
              style={{ background: "color-mix(in oklch, var(--bj-ink) 30%, transparent)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileNotesOpen(false)} />
            <motion.div key="notes-sheet"
              className="md:hidden fixed left-0 right-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
              style={{ height: "78vh" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
            >
              <div className="flex justify-center pt-2 pb-1 shrink-0" style={{ background: "var(--bj-bg-panel)" }}>
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
              </div>
              <div className="flex-1 min-h-0">
                <NotesPanel
                  notes={notes}
                  onUpdateNote={handleUpdateNote}
                  onRemove={handleRemove}
                  onClose={() => setMobileNotesOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
