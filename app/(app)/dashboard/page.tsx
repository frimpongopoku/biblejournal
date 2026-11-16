"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, BookOpen, Feather, ArrowRight, RefreshCw, HeartHandshake, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { usePrayers } from "@/hooks/usePrayers";
import { useStudyNotes } from "@/hooks/useStudyNotes";
import { useReadingStore } from "@/store/reading.store";
import { useBibleStore } from "@/store/bible.store";
import { fetchPassage } from "@/lib/bible-client";
import { startEntry } from "@/lib/startEntry";
import { attachCover, pickPhotos, imageFiles } from "@/lib/photos";
import { FEELING_COLORS, feelingColor } from "@/lib/feelings";
import { cachedDocText, feelingByLabel, plural, FEELINGS } from "@/components/journal/JournalParts";
import type { JournalEntry } from "@/types";

// ── Helpers ───────────────────────────────────────────────

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

function greeting(h: number) {
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const PROMPTS = [
  "What is this asking of you today?",
  "Where do you see yourself in this?",
  "What would change if you really believed this?",
  "What does this show you about God?",
  "Which word won’t let go of you — and why?",
  "Who needs to hear this from you this week?",
];

interface Passage { ref: string; book: string; chapter: number; verse: number; endVerse?: number; text: string; version: string; why: string }

function timeOf(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ── Page ──────────────────────────────────────────────────

export default function TodayPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { entries, loading } = useJournalEntries();
  const { prayers } = usePrayers();
  const { studyNotes } = useStudyNotes();
  const last = useReadingStore((s) => s.last);
  const version = useBibleStore((s) => s.version);

  const [now] = useState(() => new Date());
  const firstName = user?.displayName?.split(" ")[0] ?? "";

  // ── Days written ──
  const daysWritten = useMemo(() => new Set(entries.map((e) => dayKey(e.createdAt))).size, [entries]);
  const today = useMemo(() => entries.filter((e) => dayKey(e.createdAt) === dayKey(now)), [entries, now]);
  const wroteToday = today.length > 0;

  // ── From your reading ──
  const [passage, setPassage] = useState<Passage | null>(null);
  const [prompt, setPrompt] = useState(() => now.getDate() % PROMPTS.length);
  const source = useMemo(() => {
    const highlights = studyNotes.filter((n) => n.kind === "highlight").sort((a, b) => +b.createdAt - +a.createdAt);
    const inLast = last ? highlights.find((h) => h.scripture.book === last.book && h.scripture.chapter === last.chapter) : undefined;
    const pick = inLast ?? highlights[0];
    if (pick) {
      const s = pick.scripture;
      return { book: s.book, chapter: s.chapter, verse: s.verse, endVerse: s.endVerse, version: s.version || version, text: s.text, why: inLast ? "You highlighted this" : "A recent highlight" };
    }
    if (last) return { book: last.book, chapter: last.chapter, verse: 1, endVerse: 3, version, text: undefined, why: "Where you were reading" };
    return null;
  }, [studyNotes, last, version]);

  useEffect(() => {
    let cancelled = false;
    if (source) {
      fetchPassage(source.version, { book: source.book, chapter: source.chapter, verse: source.verse, verseEnd: source.endVerse })
        .then(({ verses, label }) => {
          if (cancelled) return;
          setPassage({ ...source, ref: label, text: source.text || verses.map((v) => v.text).join(" ") });
        })
        .catch(() => { /* card falls back below */ });
    } else {
      fetch("/api/bible/daily").then((r) => r.json())
        .then((d: { ref: string; text: string; version: string }) => {
          if (!cancelled) setPassage({ ref: d.ref, text: d.text, version: d.version, book: "", chapter: 0, verse: 0, why: "Today’s verse" });
        })
        .catch(() => { if (!cancelled) setPassage({ ref: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path.", version: "ESV", book: "Psalms", chapter: 119, verse: 105, why: "Today’s verse" }); });
    }
    return () => { cancelled = true; };
  }, [source]);

  // ── Starting entries ──
  const [busy, setBusy] = useState(false);
  async function begin(seed: Parameters<typeof startEntry>[2], focus?: "title" | "body" | "verse") {
    if (!user || busy) return null;
    setBusy(true);
    try { return await startEntry(user.uid, router.push, seed, focus); } finally { setBusy(false); }
  }

  function writeOnPassage() {
    if (!passage) return;
    void begin({
      title: `On ${passage.ref}`,
      content: JSON.stringify({ type: "doc", content: [
        { type: "scriptureBlock", attrs: { reference: passage.ref, version: passage.version }, content: [{ type: "text", text: passage.text }] },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: PROMPTS[prompt] }] },
        { type: "paragraph" },
      ] }),
      scriptures: passage.book ? [{ book: passage.book, chapter: passage.chapter, verse: passage.verse, ...(passage.endVerse ? { endVerse: passage.endVerse } : {}), version: passage.version }] : [],
    });
  }

  const [draft, setDraft] = useState("");
  const [feeling, setFeeling] = useState<string | null>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  function keepWriting() {
    const text = draft.trim();
    void begin({
      ...(feeling ? { feeling } : {}),
      ...(text ? { content: JSON.stringify({ type: "doc", content: text.split(/\n+/).map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] })) }) } : {}),
    }, text ? "body" : "title");
  }

  async function withPhoto(files?: File[]) {
    if (!user) return;
    const picked = files ?? await pickPhotos({ camera: window.matchMedia("(pointer: coarse)").matches });
    const [file] = picked;
    if (!file) return;
    const id = await begin({ ...(feeling ? { feeling } : {}), ...(draft.trim() ? { content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: draft.trim() }] }] }) } : {}) }, "title");
    if (id) attachCover(user.uid, id, file);
  }

  // ── Rail data ──
  const week = useMemo(() => {
    const days: { date: Date; entries: JournalEntry[]; words: number; cover?: string; feeling?: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const list = entries.filter((e) => dayKey(e.createdAt) === dayKey(d));
      days.push({
        date: d, entries: list,
        words: list.reduce((n, e) => n + words(cachedDocText(e.content)), 0),
        cover: list.find((e) => e.cover?.url)?.cover?.url,
        feeling: list.find((e) => e.feeling)?.feeling,
      });
    }
    return days;
  }, [entries, now]);
  const weekWords = week.reduce((n, d) => n + d.words, 0);

  const onThisDay = useMemo(() => {
    const sameDay = entries.filter((e) => e.createdAt.getMonth() === now.getMonth() && e.createdAt.getDate() === now.getDate() && e.createdAt.getFullYear() < now.getFullYear());
    if (sameDay.length) return { label: `${now.getFullYear() - sameDay[0].createdAt.getFullYear()} year${now.getFullYear() - sameDay[0].createdAt.getFullYear() === 1 ? "" : "s"} ago today`, entry: sameDay[0] };
    for (const [days, label] of [[30, "A month ago"], [7, "A week ago"]] as const) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
      const hit = entries.find((e) => dayKey(e.createdAt) === dayKey(d));
      if (hit) return { label, entry: hit };
    }
    return null;
  }, [entries, now]);

  const questions = useMemo(() => {
    const out: { q: string; id: string; date: Date }[] = [];
    const since = +now - 45 * 864e5;
    for (const e of entries) {
      if (+e.createdAt < since) continue;
      const text = cachedDocText(e.content);
      for (const m of text.matchAll(/[^.!?\n]{12,160}\?/g)) {
        const q = m[0].trim();
        if (q.split(/\s+/).length >= 4) { out.push({ q, id: e.id, date: e.createdAt }); break; }
      }
      if (out.length >= 3) break;
    }
    return out;
  }, [entries, now]);

  const praying = useMemo(() => prayers.filter((p) => p.status === "active").slice(0, 3), [prayers]);

  const recent = wroteToday ? today : entries.slice(0, 3);

  // ── Render ──

  const card = "bj-raised rounded-[20px]";
  const eyebrow = "font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em]";

  return (
    <div className="min-h-full">
      <div className="max-w-[1180px] mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-16 grid gap-6 xl:gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Main column ── */}
        <div className="min-w-0 flex flex-col gap-5 bj-stagger">
          {/* Date hero */}
          <header className="flex items-end gap-4 md:gap-5 px-1">
            <span className="font-display leading-[0.8] select-none"
              style={{
                fontSize: "clamp(76px, 11vw, 112px)", fontWeight: 400, letterSpacing: "-0.04em",
                background: "linear-gradient(180deg, color-mix(in oklch, var(--bj-gold), white 30%), var(--bj-gold) 55%, var(--bj-gold-deep))",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                filter: "drop-shadow(0 6px 18px color-mix(in oklch, var(--bj-gold) 30%, transparent))",
              }}>
              {now.getDate()}
            </span>
            <div className="pb-1.5 min-w-0">
              <p className="font-display text-[22px] md:text-[26px] leading-tight" style={{ color: "var(--bj-ink)" }}>
                {now.toLocaleDateString("en-US", { weekday: "long" })}, {now.toLocaleDateString("en-US", { month: "long" })}
              </p>
              <p className="font-sans text-[13px] mt-1" style={{ color: "var(--bj-ink3)" }}>
                {greeting(now.getHours())}{firstName ? `, ${firstName}` : ""}
                {daysWritten > 0 && <> · <span style={{ color: "var(--bj-gold-deep)" }}>day {daysWritten.toLocaleString()} of writing</span></>}
              </p>
            </div>
          </header>

          {/* From your reading */}
          <section className={`${card} relative overflow-hidden p-5 md:p-7`} aria-label="From your reading">
            <div aria-hidden="true" className="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(closest-side, color-mix(in oklch, var(--bj-gold) 22%, transparent), transparent)" }} />
            <div className="relative flex items-center gap-2 mb-4">
              <BookOpen size={13} style={{ color: "var(--bj-gold)" }} />
              <span className={eyebrow} style={{ color: "var(--bj-gold-deep)" }}>From your reading</span>
              {passage && <span className="font-sans text-[11.5px] truncate" style={{ color: "var(--bj-ink4)" }}>· {passage.why}</span>}
            </div>
            {passage ? (
              <>
                <blockquote className="relative font-read text-[18px] md:text-[20px] leading-[1.55]" style={{ color: "var(--bj-ink)" }}>
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>“{passage.text}”</span>
                  <footer className="font-sans text-[12.5px] mt-2.5 not-italic" style={{ color: "var(--bj-ink3)" }}>
                    {passage.ref} <span style={{ color: "var(--bj-ink4)" }}>· {passage.version}</span>
                  </footer>
                </blockquote>
                <div className="relative mt-5 pt-4 flex flex-wrap items-center gap-3" style={{ borderTop: "1px solid var(--bj-line-soft)" }}>
                  <p className="font-display italic text-[16px] md:text-[17px] flex-1 min-w-[200px]" style={{ color: "var(--bj-ink2)" }}>
                    {PROMPTS[prompt]}
                  </p>
                  <button type="button" onClick={() => setPrompt((p) => (p + 1) % PROMPTS.length)} title="Another question"
                    aria-label="Another question" className="bj-btn-icon w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
                    <RefreshCw size={14} />
                  </button>
                  <button type="button" onClick={writeOnPassage} disabled={busy}
                    className="bj-gold flex items-center gap-2 h-10 px-4 rounded-xl font-sans text-[13.5px] font-semibold">
                    <Feather size={15} /> Write on this
                  </button>
                </div>
              </>
            ) : (
              <div className="h-[132px] rounded-xl animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
            )}
          </section>

          {/* Quick start */}
          <section className="bj-paper rounded-[20px] p-4 md:p-5" aria-label="Start writing"
            onDragOver={(e) => { if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault(); }}
            onDrop={(e) => { const f = imageFiles(e.dataTransfer.files); if (f.length) { e.preventDefault(); void withPhoto(f); } }}>
            <textarea ref={draftRef} value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); keepWriting(); } }}
              onPaste={(e) => { const f = imageFiles(e.clipboardData.files); if (f.length) { e.preventDefault(); void withPhoto(f); } }}
              placeholder={wroteToday ? "Something else on your heart?" : "What’s on your heart today?"}
              aria-label="Start writing"
              className="w-full bg-transparent outline-none resize-none font-write text-[18px] md:text-[19.5px] leading-[1.5] px-1"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)", minHeight: 64 }} />
            <div className="bj-rail flex items-center gap-1 overflow-x-auto -mx-1 px-1 pr-8 py-1 mt-1" role="radiogroup" aria-label="How I feel">
              {FEELINGS.map((f) => {
                const on = feeling === f.label;
                return (
                  <button key={f.label} type="button" role="radio" aria-checked={on} onClick={() => setFeeling(on ? null : f.label)}
                    data-active={on || undefined} title={f.label}
                    className="bj-chip shrink-0 flex items-center gap-1.5 h-8 px-2.5 rounded-full font-sans text-[12px] whitespace-nowrap"
                    style={{
                      color: on ? "var(--bj-ink)" : "var(--bj-ink3)",
                      background: on ? `color-mix(in oklch, ${FEELING_COLORS[f.label]} 22%, transparent)` : undefined,
                      border: `1px solid ${on ? FEELING_COLORS[f.label] : "transparent"}`,
                    }}>
                    <span aria-hidden="true">{f.emoji}</span>{f.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--bj-line-soft)" }}>
              <button type="button" onClick={() => void withPhoto()} className="bj-chip flex items-center gap-1.5 h-9 px-3 rounded-xl font-sans text-[12.5px] font-medium"
                style={{ color: "var(--bj-ink2)" }} title="Take or add a photo of how you feel — or paste one">
                <Camera size={15} style={{ color: "var(--bj-gold)" }} /> Photo
              </button>
              <button type="button" onClick={() => void begin(feeling ? { feeling } : undefined, "verse")}
                className="bj-chip flex items-center gap-1.5 h-9 px-3 rounded-xl font-sans text-[12.5px] font-medium"
                style={{ color: "var(--bj-ink2)" }}>
                <BookOpen size={15} style={{ color: "var(--bj-gold)" }} /> Verse
              </button>
              <div className="flex-1" />
              <button type="button" onClick={keepWriting} disabled={busy}
                className="bj-raised bj-lift flex items-center gap-2 h-9 px-4 rounded-xl font-sans text-[13px] font-semibold whitespace-nowrap"
                style={{ color: "var(--bj-ink)" }}>
                {draft.trim() ? "Keep writing" : "Blank page"}
                <kbd className="bj-kbd hidden md:inline-flex">{typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl"}↵</kbd>
              </button>
            </div>
          </section>

          {/* Earlier today / recent */}
          {recent.length > 0 && (
            <section aria-label={wroteToday ? "Earlier today" : "Recent pages"}>
              <div className="flex items-baseline gap-2 px-1 mb-2.5">
                <h2 className={eyebrow} style={{ color: "var(--bj-ink4)" }}>{wroteToday ? "Earlier today" : "Recent pages"}</h2>
                <Link href="/journal" className="ml-auto font-sans text-[12px] flex items-center gap-1 hover:underline" style={{ color: "var(--bj-ink3)" }}>
                  All entries <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 bj-stagger">
                {recent.slice(0, 4).map((e) => <EntryCard key={e.id} entry={e} showTime={wroteToday} />)}
              </div>
            </section>
          )}
          {!loading && entries.length === 0 && (
            <p className="font-display italic text-center text-[18px] py-6" style={{ color: "var(--bj-ink4)" }}>Your first page is waiting.</p>
          )}
        </div>

        {/* ── Rail ── */}
        <aside className="flex flex-col gap-4 min-w-0 xl:sticky xl:top-6 xl:self-start bj-stagger" aria-label="Your week">
          <section className="bj-glass rounded-[20px] p-4">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className={eyebrow} style={{ color: "var(--bj-ink4)" }}>This week</h2>
              <span className="font-sans text-[11.5px]" style={{ color: "var(--bj-ink3)", fontVariantNumeric: "tabular-nums" }}>{plural(weekWords, "word")}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((d) => {
                const isToday = dayKey(d.date) === dayKey(now);
                const fc = feelingColor(d.feeling);
                const first = d.entries[0];
                const tile = (
                  <>
                    <span className="bj-well relative block w-full aspect-square rounded-[10px] overflow-hidden"
                      style={isToday ? { boxShadow: "0 0 0 1.5px var(--bj-gold)" } : undefined}>
                      {d.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.cover} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                      ) : d.entries.length > 0 && (
                        <span className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bj-glow" style={{ background: fc ?? "var(--bj-gold)" }} />
                      )}
                    </span>
                    <span className="block text-center font-sans text-[10px] mt-1" style={{ color: isToday ? "var(--bj-gold-deep)" : "var(--bj-ink4)", fontWeight: isToday ? 600 : 400 }}>
                      {d.date.toLocaleDateString("en-US", { weekday: "narrow" })}
                    </span>
                  </>
                );
                const title = `${d.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}: ${d.entries.length ? plural(d.words, "word") : "no entry"}`;
                return first ? (
                  <Link key={dayKey(d.date)} href={`/journal?entry=${first.id}`} title={title} className="block min-w-0">{tile}</Link>
                ) : (
                  <div key={dayKey(d.date)} title={title} className="min-w-0">{tile}</div>
                );
              })}
            </div>
          </section>

          {onThisDay && (
            <section className="bj-glass rounded-[20px] p-4">
              <h2 className={`${eyebrow} mb-2.5`} style={{ color: "var(--bj-ink4)" }}>{onThisDay.label}</h2>
              <Link href={`/journal?entry=${onThisDay.entry.id}`} className="flex gap-3 group">
                {onThisDay.entry.cover?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={onThisDay.entry.cover.url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                )}
                <span className="min-w-0">
                  <span className="block font-display text-[16px] leading-snug group-hover:underline" style={{ color: "var(--bj-ink)" }}>
                    {onThisDay.entry.title || "Untitled"}
                  </span>
                  <span className="block font-sans text-[12px] mt-1 leading-relaxed" style={{ color: "var(--bj-ink3)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {cachedDocText(onThisDay.entry.content).slice(0, 220)}
                  </span>
                </span>
              </Link>
            </section>
          )}

          {questions.length > 0 && (
            <section className="bj-glass rounded-[20px] p-4">
              <h2 className={`${eyebrow} mb-2.5 flex items-center gap-1.5`} style={{ color: "var(--bj-ink4)" }}>
                <Sparkles size={11} /> Still asking
              </h2>
              <ul className="flex flex-col gap-2.5">
                {questions.map((q) => (
                  <li key={q.id + q.q}>
                    <Link href={`/journal?entry=${q.id}`} className="block font-display italic text-[15px] leading-snug hover:underline" style={{ color: "var(--bj-ink2)", overflowWrap: "anywhere" }}>
                      {q.q}
                    </Link>
                    <span className="font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}>{q.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="bj-glass rounded-[20px] p-4">
            <div className="flex items-baseline justify-between mb-2.5">
              <h2 className={`${eyebrow} flex items-center gap-1.5`} style={{ color: "var(--bj-ink4)" }}>
                <HeartHandshake size={11} /> Praying for
              </h2>
              <Link href="/prayer" className="font-sans text-[11.5px] hover:underline" style={{ color: "var(--bj-ink3)" }}>Prayer list</Link>
            </div>
            {praying.length ? (
              <ul className="flex flex-col gap-1.5">
                {praying.map((p) => (
                  <li key={p.id} className="flex items-start gap-2 font-sans text-[13px] leading-snug" style={{ color: "var(--bj-ink2)" }}>
                    <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--bj-gold)" }} />
                    <span className="min-w-0" style={{ overflowWrap: "anywhere" }}>{p.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sans text-[12.5px]" style={{ color: "var(--bj-ink4)" }}>Nothing on your list yet.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function EntryCard({ entry, showTime }: { entry: JournalEntry; showTime: boolean }) {
  const text = cachedDocText(entry.content);
  const f = feelingByLabel(entry.feeling);
  const fc = feelingColor(entry.feeling);
  return (
    <Link href={`/journal?entry=${entry.id}`} className="bj-raised bj-lift relative rounded-[18px] overflow-hidden flex min-h-[112px]">
      {fc && <span aria-hidden="true" className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: fc }} />}
      <span className="flex-1 min-w-0 p-4">
        <span className="flex items-center gap-1.5 font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}>
          {showTime ? timeOf(entry.createdAt) : entry.createdAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          {f && <><span>·</span><span style={{ color: fc ?? undefined }}>{f.emoji} {f.label}</span></>}
        </span>
        <span className="block font-display text-[17px] leading-snug mt-1 truncate" style={{ color: "var(--bj-ink)" }}>{entry.title || "Untitled"}</span>
        {text && (
          <span className="block font-sans text-[12.5px] mt-1 leading-relaxed" style={{ color: "var(--bj-ink3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {text.slice(0, 200)}
          </span>
        )}
      </span>
      {entry.cover?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.cover.url} alt="" loading="lazy" className="w-[96px] object-cover shrink-0" style={{ background: entry.cover.tint ?? "var(--bj-bg-soft)" }} />
      )}
    </Link>
  );
}
