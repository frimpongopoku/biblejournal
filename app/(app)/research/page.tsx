"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, X, Send, NotebookPen, BookOpen, Sparkles, ArrowUpRight, Loader2 } from "lucide-react";
import { parseRef, type ParsedRef } from "@/lib/bible-ref-parser";
import { useBibleStore } from "@/store/bible.store";
import { useAuthStore } from "@/store/auth.store";
import { useWritingStore, readingFontStyle, writingFontStyle } from "@/store/writing.store";
import { subscribeToResearch, keepResearch, forgetResearch, type ResearchNote } from "@/services/research.service";
import { createEntry } from "@/services/journal.service";
import { textToDoc } from "@/lib/prayer";

/* ──────────────────────────────────────────────────────────────
   Research: one box for a passage, a word or a question. A passage
   opens in the middle and you look at it through lenses — Read,
   Compare, Context, Cross-refs. Click any word to study it. Ask about
   the passage beside it. Anything you keep lands in a notebook that
   lives with your account.
   ────────────────────────────────────────────────────────────── */

interface Verse { n: number; text: string }
interface CommentaryResult { summary: string; themes: string[]; context: string; crossRefs: { ref: string; note: string }[]; application: string }
interface AskResult { answer: string; keyVerses: { ref: string; text: string }[]; furtherReading: string[] }
interface WordResult {
  word: string;
  original: { language: string; term: string; transliteration: string; strongsNumber: string };
  definition: string; usageCount: number; nuances: string[];
  keyOccurrences: { ref: string; note: string }[]; insight: string;
}
type Lens = "read" | "compare" | "context" | "refs";
type WordAsk = { word: string; book?: string; chapter?: number; verse?: number };

const LENSES: { id: Lens; label: string }[] = [
  { id: "read", label: "Read" }, { id: "compare", label: "Compare" }, { id: "context", label: "Context" }, { id: "refs", label: "Cross-refs" },
];
const COMPARE = ["ESV", "NIV", "AMP", "MSG", "KJV", "NLT", "NKJV", "ASV"];
const LABEL = "font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em]";
const SUGGEST = ["John 15", "What is grace, really?", "shalom", "Psalm 23", "Who was Melchizedek?"];

const refLabel = (p: ParsedRef) => `${p.book} ${p.chapter}${p.verse ? `:${p.verse}${p.verseEnd && p.verseEnd !== p.verse ? `–${p.verseEnd}` : ""}` : ""}`;
const isWord = (s: string) => /^[\p{L}'’-]{2,24}$/u.test(s.trim());
const clean = (w: string) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");

/** Fetch JSON for a key; null key = idle. Loading is "the key changed and nothing came back yet". */
function useJson<T>(key: string | null, run: () => Promise<Response>) {
  const [got, setGot] = useState<{ key: string; data?: T; error?: string } | null>(null);
  const runRef = useRef(run);
  useEffect(() => { runRef.current = run; });
  useEffect(() => {
    if (!key) return;
    let live = true;
    runRef.current()
      .then(async (r) => { const d = await r.json(); if (!r.ok || d.error) throw new Error(d.error || "Something went wrong"); return d as T; })
      .then((data) => { if (live) setGot({ key, data }); })
      .catch((e: Error) => { if (live) setGot({ key, error: e.message.includes("not configured") ? "Research needs the AI key set up on the server." : e.message }); });
    return () => { live = false; };
  }, [key]);
  const mine = got && got.key === key ? got : null;
  return { data: mine?.data, error: mine?.error, loading: !!key && !mine };
}

const post = (url: string, body: unknown) => () => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function ResearchPage() {
  return <Suspense fallback={null}><Research /></Suspense>;
}

function Research() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const version = useBibleStore((s) => s.version);
  const readFont = useWritingStore((s) => s.readFont);
  const writeFont = useWritingStore((s) => s.font);

  // What's on the desk comes from the URL, so back/forward and links work.
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const [draftFor, setDraftFor] = useState(q);
  if (draftFor !== q) { setDraftFor(q); setDraft(q); }

  const passage = useMemo(() => parseRef(q), [q]);
  const mode: "passage" | "word" | "answer" | null = !q.trim() ? null : passage ? "passage" : isWord(q) ? "word" : "answer";
  const topic = passage ? refLabel(passage) : q.trim();

  const [lens, setLens] = useState<Lens>("read");
  const [lensFor, setLensFor] = useState(q);
  const [wordAsk, setWordAsk] = useState<WordAsk | null>(null);
  if (lensFor !== q) { setLensFor(q); setLens("read"); setWordAsk(null); }

  function look(text: string) {
    const t = text.trim();
    if (!t) return;
    router.push(`/research?q=${encodeURIComponent(t)}`);
  }

  // ── Data ──
  const chapterKey = passage ? `${version}/${passage.book}/${passage.chapter}` : null;
  const chapter = useJson<{ verses: Verse[] }>(chapterKey, () => fetch(`/api/bible/${version}/${encodeURIComponent(passage!.book)}/${passage!.chapter}`));
  const [compareOn, setCompareOn] = useState<string[]>(["ESV", "NIV", "AMP", "MSG"]);
  const compareKey = passage && lens === "compare" ? `${passage.book}/${passage.chapter}/${compareOn.join(",")}` : null;
  const compare = useJson<Record<string, Verse[]>>(compareKey, async () => {
    const pairs = await Promise.all(compareOn.map((v) => fetch(`/api/bible/${v}/${encodeURIComponent(passage!.book)}/${passage!.chapter}`).then((r) => r.json()).then((d) => [v, d.verses ?? []] as const)));
    return new Response(JSON.stringify(Object.fromEntries(pairs)));
  });
  const commKey = passage && (lens === "context" || lens === "refs") ? `${passage.book}/${passage.chapter}/${version}` : null;
  const commentary = useJson<CommentaryResult>(commKey, post("/api/research/commentary", { book: passage?.book, chapter: passage?.chapter, version }));
  const wordTarget: WordAsk | null = mode === "word" ? { word: q.trim() } : wordAsk;
  const wordKey = wordTarget ? JSON.stringify(wordTarget) : null;
  const word = useJson<WordResult>(wordKey, post("/api/research/word-study", wordTarget ?? {}));
  const answerKey = mode === "answer" ? `${version}/${q}` : null;
  const answer = useJson<AskResult>(answerKey, post("/api/research/ask", { question: q, version }));

  // ── Notebook ──
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  useEffect(() => (user ? subscribeToResearch(user.uid, setNotes) : undefined), [user]);
  const keptKeys = useMemo(() => new Set(notes.map((n) => `${n.topic}|${n.title}`)), [notes]);
  const keep = (kind: ResearchNote["kind"], title: string, body: string, ref?: string) => {
    if (!user || keptKeys.has(`${topic}|${title}`)) return;
    keepResearch(user.uid, { topic, kind, title, body, ...(ref ? { ref } : {}) });
  };
  const isKept = (title: string) => keptKeys.has(`${topic}|${title}`);

  const versesShown = useMemo(() => {
    const vs = chapter.data?.verses ?? [];
    return vs;
  }, [chapter.data]);
  const inRange = (n: number) => !!passage?.verse && n >= passage.verse && n <= (passage.verseEnd ?? passage.verse);
  const readRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!passage?.verse || !versesShown.length) return;
    readRef.current?.querySelector("[data-target]")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [passage?.verse, versesShown.length]);

  const studyWord = (w: string, verse: number) => {
    const c = clean(w);
    if (c.length < 2 || !passage) return;
    setWordAsk({ word: c.toLowerCase(), book: passage.book, chapter: passage.chapter, verse });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
      <main className="flex-1 min-w-0 lg:overflow-y-auto px-4 md:px-8 lg:px-10 pt-6 md:pt-8 pb-10">
        <div className="max-w-[760px] mx-auto">
          <div className="flex items-end gap-3 mb-5">
            <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1 }}>Research</h1>
            {notes.length > 0 && <span className="font-sans text-[12.5px] pb-1" style={{ color: "var(--bj-ink4)" }}>{notes.length} kept</span>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); look(draft); }} className="bj-well flex items-center gap-3 h-14 pl-4 pr-2 rounded-[18px] mb-3">
            <Search size={16} style={{ color: "var(--bj-ink4)" }} />
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="A passage, a word, or a question" aria-label="Look something up"
              className="flex-1 min-w-0 bg-transparent outline-none" style={{ ...writingFontStyle(writeFont, 19), color: "var(--bj-ink)" }} />
            <span className="hidden md:inline font-sans text-[11.5px] shrink-0" style={{ color: "var(--bj-ink4)" }}>John 15 · grace · Who was…?</span>
            <button type="submit" className="bj-gold h-10 px-4 rounded-[12px] font-sans text-[13px] font-semibold shrink-0">Look</button>
          </form>

          {mode === null && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGEST.map((s) => (
                <button key={s} type="button" onClick={() => look(s)} className="bj-chip h-8 px-3 rounded-full font-sans text-[12.5px]" style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line)" }}>{s}</button>
              ))}
              <p className="w-full mt-8 font-display italic text-[19px]" style={{ color: "var(--bj-ink4)" }}>
                Start from a passage and look at it through lenses — or ask anything.
              </p>
            </div>
          )}

          {/* ── A passage ── */}
          {mode === "passage" && passage && (
            <section className="mt-5">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <h2 className="font-display flex-1 min-w-0" style={{ fontSize: 34, color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1.05 }}>{refLabel(passage)}</h2>
                <div role="tablist" aria-label="Lenses" className="bj-well inline-flex gap-0.5 p-0.5 rounded-[11px]">
                  {LENSES.map((l) => (
                    <button key={l.id} role="tab" type="button" aria-selected={lens === l.id} onClick={() => setLens(l.id)}
                      className={`bj-nav-item h-8 px-3 rounded-[9px] font-sans text-[12.5px] ${lens === l.id ? "bj-raised" : ""}`}
                      data-active={lens === l.id ? "" : undefined}
                      style={{ color: lens === l.id ? "var(--bj-ink)" : "var(--bj-ink3)", fontWeight: lens === l.id ? 500 : 400, border: lens === l.id ? undefined : "1px solid transparent" }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {lens === "read" && (
                <>
                  <p className="font-sans text-[11.5px] mb-3" style={{ color: "var(--bj-ink4)" }}>{version} · click any word to study it</p>
                  {chapter.loading && <Wait label="Opening the passage…" />}
                  {chapter.error && <Problem text={chapter.error} />}
                  <div ref={readRef} className="rs-read" style={{ ...readingFontStyle(readFont, 20.5), lineHeight: 1.8, color: "var(--bj-ink2)" }}>
                    {versesShown.map((v) => (
                      <span key={v.n} data-target={inRange(v.n) ? "" : undefined} className="rs-verse">
                        <sup className="font-sans text-[11px] mr-1 select-none" style={{ color: "var(--bj-ink4)" }}>{v.n}</sup>
                        {v.text.split(/(\s+)/).map((w, i) => (/\s/.test(w) || !clean(w)
                          ? w
                          : <span key={i} className="rs-w" data-on={wordAsk?.verse === v.n && wordAsk.word === clean(w).toLowerCase() ? "" : undefined}
                              role="button" tabIndex={-1} onClick={() => studyWord(w, v.n)}>{w}</span>))}
                        {" "}
                      </span>
                    ))}
                  </div>
                  {wordAsk && (
                    // Pinned to the bottom of the reading column, so it opens where you are — not under the chapter.
                    <div className="sticky bottom-3 mt-6 z-10">
                      <div className="max-h-[46vh] overflow-y-auto rounded-[18px]" style={{ boxShadow: "0 24px 60px -18px var(--m-shade)" }}>
                        <WordCard ask={wordAsk} res={word} onClose={() => setWordAsk(null)} isKept={isKept} keep={keep} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {lens === "compare" && (
                <>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {COMPARE.map((v) => {
                      const on = compareOn.includes(v);
                      return (
                        <button key={v} type="button" aria-pressed={on}
                          onClick={() => setCompareOn((c) => (on ? (c.length > 1 ? c.filter((x) => x !== v) : c) : [...c, v]))}
                          className="bj-chip h-7 px-2.5 rounded-full font-sans text-[11.5px] font-medium" data-active={on ? "" : undefined}
                          style={{ color: on ? "var(--bj-ink)" : "var(--bj-ink4)", background: on ? "var(--m-hover)" : undefined, border: `1px solid ${on ? "color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "var(--bj-line)"}` }}>
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  {compare.loading && <Wait label="Laying the translations side by side…" />}
                  {compare.error && <Problem text={compare.error} />}
                  {compare.data && (
                    <div className="flex flex-col gap-3">
                      {(compare.data[compareOn[0]] ?? [])
                        .filter((v) => !passage.verse || inRange(v.n))
                        .map((v) => (
                          <div key={v.n} className="bj-raised rounded-[16px] px-4 py-3.5">
                            <p className={LABEL} style={{ color: "var(--bj-gold)" }}>Verse {v.n}</p>
                            <div className="mt-2 flex flex-col gap-1.5">
                              {compareOn.map((ver) => {
                                const t = compare.data![ver]?.find((x) => x.n === v.n)?.text;
                                return t ? (
                                  <p key={ver} style={{ ...readingFontStyle(readFont, 17), lineHeight: 1.5, color: "var(--bj-ink2)" }}>
                                    <b className="font-sans text-[10.5px] font-semibold mr-2 tracking-[0.06em]" style={{ color: "var(--bj-ink4)" }}>{ver}</b>{t}
                                  </p>
                                ) : null;
                              })}
                            </div>
                            <KeepBtn kept={isKept(`${passage.book} ${passage.chapter}:${v.n} · ${compareOn.join("/")}`)}
                              onKeep={() => keep("verse", `${passage.book} ${passage.chapter}:${v.n} · ${compareOn.join("/")}`,
                                compareOn.map((ver) => `${ver}: ${compare.data![ver]?.find((x) => x.n === v.n)?.text ?? ""}`).join("\n"), `${passage.book} ${passage.chapter}:${v.n}`)} />
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}

              {(lens === "context" || lens === "refs") && (
                <>
                  {commentary.loading && <Wait label="Reading around the passage…" />}
                  {commentary.error && <Problem text={commentary.error} />}
                  {commentary.data && lens === "context" && (
                    <div className="flex flex-col gap-3">
                      <Card tag="In short">
                        <p style={{ ...writingFontStyle(writeFont, 18.5), lineHeight: 1.6, color: "var(--bj-ink2)" }}>{commentary.data.summary}</p>
                        {commentary.data.themes?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">{commentary.data.themes.map((t) => <span key={t} className="h-6 px-2.5 rounded-full flex items-center font-sans text-[11.5px]" style={{ background: "var(--m-hover)", color: "var(--bj-ink3)" }}>{t}</span>)}</div>
                        )}
                        <KeepBtn kept={isKept("In short")} onKeep={() => keep("context", "In short", `${commentary.data!.summary}\nThemes: ${commentary.data!.themes.join(", ")}`)} />
                      </Card>
                      <Card tag="Setting">
                        <p style={{ ...writingFontStyle(writeFont, 18), lineHeight: 1.6, color: "var(--bj-ink2)" }}>{commentary.data.context}</p>
                        <KeepBtn kept={isKept("Setting")} onKeep={() => keep("context", "Setting", commentary.data!.context)} />
                      </Card>
                      <Card tag="Living it">
                        <p style={{ ...writingFontStyle(writeFont, 18), lineHeight: 1.6, color: "var(--bj-ink2)" }}>{commentary.data.application}</p>
                        <KeepBtn kept={isKept("Living it")} onKeep={() => keep("context", "Living it", commentary.data!.application)} />
                      </Card>
                    </div>
                  )}
                  {commentary.data && lens === "refs" && (
                    <div className="flex flex-col gap-2">
                      {commentary.data.crossRefs.map((r) => (
                        <div key={r.ref} className="bj-raised rounded-[16px] px-4 py-3.5 flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <button type="button" onClick={() => look(r.ref)} className="font-sans text-[13.5px] font-semibold inline-flex items-center gap-1 hover:underline" style={{ color: "var(--bj-gold)" }}>
                              {r.ref} <ArrowUpRight size={12} />
                            </button>
                            <p className="mt-1" style={{ ...writingFontStyle(writeFont, 17), lineHeight: 1.5, color: "var(--bj-ink2)" }}>{r.note}</p>
                          </div>
                          <KeepBtn small kept={isKept(r.ref)} onKeep={() => keep("verse", r.ref, r.note, r.ref)} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* ── A word ── */}
          {mode === "word" && wordTarget && (
            <section className="mt-6"><WordCard ask={wordTarget} res={word} isKept={isKept} keep={keep} /></section>
          )}

          {/* ── A question ── */}
          {mode === "answer" && (
            <section className="mt-6 flex flex-col gap-3">
              {answer.loading && <Wait label="Searching the Scriptures…" />}
              {answer.error && <Problem text={answer.error} />}
              {answer.data && (
                <>
                  <Card tag="Answer · with the verses">
                    <p style={{ ...writingFontStyle(writeFont, 19), lineHeight: 1.65, color: "var(--bj-ink2)", whiteSpace: "pre-line" }}>{answer.data.answer}</p>
                    <KeepBtn kept={isKept("Answer")} onKeep={() => keep("answer", "Answer", answer.data!.answer)} />
                  </Card>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {answer.data.keyVerses.map((v) => (
                      <div key={v.ref} className="bj-raised rounded-[16px] px-4 py-3.5">
                        <button type="button" onClick={() => look(v.ref)} className={`${LABEL} inline-flex items-center gap-1 hover:underline`} style={{ color: "var(--bj-gold)" }}>{v.ref} <ArrowUpRight size={11} /></button>
                        <p className="mt-2" style={{ ...readingFontStyle(readFont, 17), lineHeight: 1.5, color: "var(--bj-ink)" }}>“{v.text}”</p>
                        <KeepBtn kept={isKept(v.ref)} onKeep={() => keep("verse", v.ref, v.text, v.ref)} />
                      </div>
                    ))}
                  </div>
                  {answer.data.furtherReading?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={LABEL} style={{ color: "var(--bj-ink4)" }}>Read on</span>
                      {answer.data.furtherReading.map((r) => (
                        <button key={r} type="button" onClick={() => look(r)} className="bj-chip h-7 px-2.5 rounded-full font-sans text-[12px]" style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line)" }}>{r}</button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </main>

      <aside className="w-full lg:w-[340px] shrink-0 p-4 lg:pl-0 lg:h-full">
        <div className="bj-glass rounded-[20px] h-full flex flex-col overflow-hidden min-h-[420px]">
          {mode === "passage" && passage && <AskPassage key={`${passage.book}/${passage.chapter}`} passage={passage} version={version} keep={keep} isKept={isKept} />}
          <Notebook notes={notes} topic={topic} uid={user?.uid} onOpen={look}
            onJournal={async (t) => {
              if (!user) return;
              const mine = notes.filter((n) => n.topic === t).reverse();
              const text = mine.map((n) => `${n.title}${n.ref && n.ref !== n.title ? ` (${n.ref})` : ""}\n${n.body}`).join("\n\n");
              const id = await createEntry(user.uid, { title: `Studying ${t}`, content: textToDoc(text) });
              router.push(`/journal?entry=${id}`);
            }} />
        </div>
      </aside>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────── */

function Wait({ label }: { label: string }) {
  return <p className="flex items-center gap-2 font-sans text-[13px] py-6" style={{ color: "var(--bj-ink4)" }}><Loader2 size={14} className="animate-spin" />{label}</p>;
}
function Problem({ text }: { text: string }) {
  return <p className="font-sans text-[13px] py-4" style={{ color: "var(--bj-ember)" }}>{text}</p>;
}
function Card({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <div className="bj-raised rounded-[18px] px-5 py-4">
      <p className={`${LABEL} mb-2.5`} style={{ color: "var(--bj-gold)" }}>{tag}</p>
      {children}
    </div>
  );
}
function KeepBtn({ kept, onKeep, small }: { kept: boolean; onKeep: () => void; small?: boolean }) {
  return (
    <button type="button" onClick={onKeep} disabled={kept} aria-label={kept ? "Kept in your notebook" : "Keep in your notebook"}
      className={`bj-chip ${small ? "shrink-0" : "mt-3"} h-7 px-2.5 rounded-[9px] inline-flex items-center gap-1.5 font-sans text-[11.5px] font-medium`}
      style={{ color: kept ? "var(--bj-gold)" : "var(--bj-ink3)", border: "1px solid var(--bj-line)" }}>
      <Star size={12} fill={kept ? "currentColor" : "none"} /> {kept ? "Kept" : "Keep"}
    </button>
  );
}

function WordCard({ ask, res, onClose, isKept, keep }: {
  ask: WordAsk; res: { data?: WordResult; error?: string; loading: boolean }; onClose?: () => void;
  isKept: (t: string) => boolean; keep: (k: ResearchNote["kind"], t: string, b: string, r?: string) => void;
}) {
  const readFont = useWritingStore((s) => s.readFont);
  const writeFont = useWritingStore((s) => s.font);
  const d = res.data;
  const title = d ? `${d.word} · ${d.original.transliteration}` : ask.word;
  return (
    <div className="bj-raised rounded-[18px] px-5 py-4 relative">
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Close word study" className="bj-btn-icon absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}><X size={14} /></button>
      )}
      <p className={LABEL} style={{ color: "var(--bj-gold)" }}>
        {ask.word}{d ? ` · ${d.original.term} · ${d.original.transliteration} · ${d.original.strongsNumber}` : ""}{ask.book ? ` · ${ask.book} ${ask.chapter}:${ask.verse}` : ""}
      </p>
      {res.loading && <Wait label={`Finding the ${ask.book ? "original word" : "word"}…`} />}
      {res.error && <Problem text={res.error} />}
      {d && (
        <>
          <p className="font-display mt-2" style={{ fontSize: d.definition.length > 70 ? 21 : 28, lineHeight: 1.15, color: "var(--bj-ink)", fontWeight: 500 }}>{d.definition}</p>
          <p className="mt-3" style={{ ...writingFontStyle(writeFont, 17.5), lineHeight: 1.6, color: "var(--bj-ink2)" }}>{d.insight}</p>
          {d.nuances?.length > 0 && <ul className="mt-3 flex flex-col gap-1">{d.nuances.map((n) => <li key={n} className="font-sans text-[13px] flex gap-2" style={{ color: "var(--bj-ink3)" }}><span style={{ color: "var(--bj-gold)" }}>·</span>{n}</li>)}</ul>}
          {d.keyOccurrences?.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>Where else · {d.usageCount}×</p>
              {d.keyOccurrences.map((o) => (
                <p key={o.ref} style={{ ...readingFontStyle(readFont, 15.5), lineHeight: 1.45, color: "var(--bj-ink3)" }}>
                  <b className="font-sans text-[12px] font-semibold mr-1.5" style={{ color: "var(--bj-ink2)" }}>{o.ref}</b>{o.note}
                </p>
              ))}
            </div>
          )}
          <KeepBtn kept={isKept(title)} onKeep={() => keep("word", title, `${d.definition}. ${d.insight}`, ask.book ? `${ask.book} ${ask.chapter}:${ask.verse}` : undefined)} />
        </>
      )}
    </div>
  );
}

function AskPassage({ passage, version, keep, isKept }: {
  passage: ParsedRef; version: string;
  keep: (k: ResearchNote["kind"], t: string, b: string, r?: string) => void; isKept: (t: string) => boolean;
}) {
  const writeFont = useWritingStore((s) => s.font);
  const [thread, setThread] = useState<{ q: string; a?: AskResult; error?: string }[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [thread]);

  function ask() {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    const i = thread.length;
    setThread((t) => [...t, { q }]);
    fetch("/api/research/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, version, passage: { book: passage.book, chapter: passage.chapter } }) })
      .then(async (r) => { const d = await r.json(); if (!r.ok || d.error) throw new Error(d.error || "Something went wrong"); return d as AskResult; })
      .then((a) => setThread((t) => t.map((x, k) => (k === i ? { ...x, a } : x))))
      .catch((e: Error) => setThread((t) => t.map((x, k) => (k === i ? { ...x, error: e.message } : x))));
  }

  return (
    <div className="flex flex-col min-h-0 max-h-[55%] border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
      <p className="font-display px-4 pt-4 pb-2 text-[20px]" style={{ color: "var(--bj-ink)" }}>Ask about {passage.book} {passage.chapter}</p>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-2.5">
        {!thread.length && <p className="font-display italic text-[15px]" style={{ color: "var(--bj-ink4)" }}>Why this word? What did it mean to them? Ask with the passage in view.</p>}
        {thread.map((t, i) => (
          <div key={i} className="flex flex-col gap-2">
            <p className="bj-raised self-end max-w-[88%] px-3 py-2 rounded-[14px] rounded-br-[4px] font-sans text-[13px]" style={{ color: "var(--bj-ink)" }}>{t.q}</p>
            {!t.a && !t.error && <Wait label="Thinking it through…" />}
            {t.error && <Problem text={t.error} />}
            {t.a && (
              <div>
                <p style={{ ...writingFontStyle(writeFont, 15.5), lineHeight: 1.55, color: "var(--bj-ink2)", whiteSpace: "pre-line" }}>{t.a.answer}</p>
                <KeepBtn kept={isKept(t.q)} onKeep={() => keep("answer", t.q, t.a!.answer)} />
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="bj-well m-3 flex items-center gap-2 h-11 pl-3 pr-1.5 rounded-[13px]">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask a question…" aria-label={`Ask about ${passage.book} ${passage.chapter}`}
          className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[13px]" style={{ color: "var(--bj-ink)" }} />
        <button type="submit" disabled={!draft.trim()} aria-label="Ask" className="bj-gold w-8 h-8 rounded-[9px] flex items-center justify-center disabled:opacity-40"><Send size={13} /></button>
      </form>
    </div>
  );
}

function Notebook({ notes, topic, uid, onOpen, onJournal }: {
  notes: ResearchNote[]; topic: string; uid?: string; onOpen: (t: string) => void; onJournal: (topic: string) => void;
}) {
  const writeFont = useWritingStore((s) => s.font);
  const groups = useMemo(() => {
    const m = new Map<string, ResearchNote[]>();
    for (const n of notes) m.set(n.topic, [...(m.get(n.topic) ?? []), n]);
    // The topic on the desk first, then most recent.
    return [...m.entries()].sort((a, b) => (a[0] === topic ? -1 : b[0] === topic ? 1 : +b[1][0].createdAt - +a[1][0].createdAt));
  }, [notes, topic]);
  const day = (d: Date) => d.toDateString() === new Date().toDateString() ? "today" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const here = groups.find(([t]) => t === topic);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-4 pb-1">
        <NotebookPen size={15} style={{ color: "var(--bj-gold)" }} />
        <p className="font-display text-[20px] flex-1" style={{ color: "var(--bj-ink)" }}>Notebook</p>
      </div>
      <p className="px-4 font-sans text-[11.5px] mb-2" style={{ color: "var(--bj-ink4)" }}>Saved to your account, gathered by what you studied</p>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 flex flex-col gap-4">
        {!groups.length && (
          <p className="font-display italic text-[15px] mt-2 flex items-start gap-2" style={{ color: "var(--bj-ink4)" }}>
            <Sparkles size={14} className="mt-1 shrink-0" style={{ color: "var(--bj-gold)" }} /> Press Keep on anything worth remembering. It waits here for Sunday.
          </p>
        )}
        {groups.map(([t, items]) => (
          <section key={t}>
            <button type="button" onClick={() => onOpen(t)} className={`${LABEL} mb-2 hover:underline text-left`} style={{ color: t === topic ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
              {t} · {day(items[0].createdAt)}
            </button>
            <div className="flex flex-col gap-1.5">
              {(t === topic ? items : items.slice(0, 2)).map((n) => (
                <div key={n.id} className="group bj-raised rounded-[13px] px-3 py-2.5 relative">
                  <p className="font-sans text-[12px] font-semibold pr-5" style={{ color: "var(--bj-ink2)" }}>{n.title}</p>
                  <p className="mt-0.5 line-clamp-3" style={{ ...writingFontStyle(writeFont, 14.5), lineHeight: 1.45, color: "var(--bj-ink3)", whiteSpace: "pre-line" }}>{n.body}</p>
                  {uid && (
                    <button type="button" onClick={() => void forgetResearch(uid, n.id)} aria-label={`Remove ${n.title}`}
                      className="bj-btn-icon absolute top-1.5 right-1.5 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity" style={{ color: "var(--bj-ink4)" }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {t !== topic && items.length > 2 && <button type="button" onClick={() => onOpen(t)} className="font-sans text-[11.5px] text-left px-1 hover:underline" style={{ color: "var(--bj-ink4)" }}>+{items.length - 2} more</button>}
            </div>
          </section>
        ))}
      </div>
      {here && (
        <div className="p-3 pt-0">
          <button type="button" onClick={() => onJournal(topic)} className="bj-gold w-full h-10 rounded-[12px] flex items-center justify-center gap-2 font-sans text-[13px] font-semibold">
            <BookOpen size={14} /> Turn into a journal entry
          </button>
        </div>
      )}
    </div>
  );
}
