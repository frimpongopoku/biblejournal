"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Check, HandHeart, UserRound, X } from "lucide-react";
import { usePrayers } from "@/hooks/usePrayers";
import { createPrayer, logPrayer, reopenPrayer, updatePrayer } from "@/services/prayer.service";
import { useAuthStore } from "@/store/auth.store";
import { usePrefsStore } from "@/store/prefs.store";
import { useBibleStore } from "@/store/bible.store";
import { useWritingStore, writingFontStyle } from "@/store/writing.store";
import { parseRef } from "@/lib/bible-ref-parser";
import { fetchPassage } from "@/lib/bible-client";
import { useAutoGrow } from "@/hooks/useAutoGrow";
import { cycleLabel, num, perDayFor, dayNumber, docToText, textToDoc, lastWords, plural, prayedToday, shortDate, todaysPrayers, waitedDays } from "@/lib/prayer";
import { PersonDot, VerseCard, forLabel, STAND_ON } from "@/components/prayer/parts";
import { PrayNow } from "@/components/prayer/PrayNow";
import { DataToggle } from "@/components/dev/DataToggle";
import type { Prayer, ScriptureRef } from "@/types";

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];
type Sort = "person" | "newest" | "longest";

function Tag({ children, color = "var(--bj-gold)" }: { children: React.ReactNode; color?: string }) {
  return <span className="font-sans text-[10.5px] font-semibold uppercase shrink-0" style={{ color, letterSpacing: "0.08em" }}>{children}</span>;
}

// ── Add a prayer without leaving the page ──────────────────

function Composer({ people, onAdded }: { people: string[]; onAdded: (id: string, title: string) => void }) {
  const user = useAuthStore((s) => s.user);
  const version = useBibleStore((s) => s.version);
  const font = useWritingStore((s) => s.font);
  const [text, setText] = useState("");
  const [who, setWho] = useState("");
  const [verse, setVerse] = useState("");
  const [open, setOpen] = useState<"who" | "verse" | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const parsed = verse.trim() ? parseRef(verse) : null;

  useAutoGrow(areaRef, text);

  function add() {
    const t = text.trim();
    if (!user || !t) return;
    const [title, ...rest] = t.split("\n");
    const body = rest.join("\n").trim();
    const id = createPrayer(user.uid, title.trim(), body ? textToDoc(body) : "", { for: who });
    if (parsed?.verse) {
      const ref: ScriptureRef = { book: parsed.book, chapter: parsed.chapter, verse: parsed.verse, ...(parsed.verseEnd ? { endVerse: parsed.verseEnd } : {}), version };
      void fetchPassage(version, parsed)
        .then(({ verses }) => updatePrayer(user.uid, id, { scriptures: [{ ...ref, text: verses.map((v) => v.text).join(" ") }] }))
        .catch(() => updatePrayer(user.uid, id, { scriptures: [ref] }));
    }
    onAdded(id, title.trim());
    setText(""); setVerse(""); setWho(""); setOpen(null);
    areaRef.current?.focus();
  }

  return (
    <div className="bj-well rounded-[18px] px-4 pt-3.5 pb-3 flex flex-col gap-2.5">
      <textarea data-writing-surface ref={areaRef} value={text} onChange={(e) => setText(e.target.value)} rows={1}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); add(); } }}
        placeholder="What do you want to bring to God?" aria-label="New prayer"
        className="w-full bg-transparent outline-none resize-none overflow-hidden"
        style={{ ...writingFontStyle(font, 19), lineHeight: 1.45, color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
      <div className="flex items-center gap-2 flex-wrap">
        {open === "who" ? (
          <span className="bj-glass h-7 pl-2.5 pr-1 rounded-full flex items-center gap-1.5">
            <UserRound size={12} style={{ color: "var(--bj-ink4)" }} />
            <input autoFocus value={who} onChange={(e) => setWho(e.target.value)} list="prayer-people" placeholder="Who is it for?" aria-label="Who it’s for"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setOpen(null); areaRef.current?.focus(); } if (e.key === "Escape") setOpen(null); }}
              className="bg-transparent outline-none font-sans text-[12px] w-[130px]" style={{ color: "var(--bj-ink)" }} />
            <datalist id="prayer-people">{people.map((p) => <option key={p} value={p} />)}</datalist>
            <button type="button" aria-label="Done" onClick={() => setOpen(null)} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}><Check size={11} /></button>
          </span>
        ) : (
          <button type="button" onClick={() => setOpen("who")} className="bj-glass h-7 px-2.5 rounded-full flex items-center gap-1.5 font-sans text-[12px] font-medium max-w-[200px]"
            style={{ color: who ? "var(--bj-ink)" : "var(--bj-ink3)" }}>
            {who ? <PersonDot name={who} size={16} /> : <UserRound size={12} />}<span className="truncate">{who ? `For ${who}` : "For…"}</span>
            {who && <X size={11} aria-label="Clear" onClick={(e) => { e.stopPropagation(); setWho(""); }} />}
          </button>
        )}
        {open === "verse" ? (
          <span className="bj-glass h-7 pl-2.5 pr-1 rounded-full flex items-center gap-1.5">
            <BookOpen size={12} style={{ color: "var(--bj-ink4)" }} />
            <input autoFocus value={verse} onChange={(e) => setVerse(e.target.value)} placeholder="Isaiah 41:10" aria-label="Verse to stand on"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setOpen(null); areaRef.current?.focus(); } if (e.key === "Escape") setOpen(null); }}
              className="bg-transparent outline-none font-sans text-[12px] w-[110px]" style={{ color: "var(--bj-ink)" }} />
            <button type="button" aria-label="Done" onClick={() => setOpen(null)} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}><Check size={11} /></button>
          </span>
        ) : (
          <button type="button" onClick={() => setOpen("verse")} className="bj-glass h-7 px-2.5 rounded-full flex items-center gap-1.5 font-sans text-[12px] font-medium"
            style={{ color: parsed?.verse ? "var(--bj-gold)" : "var(--bj-ink3)" }}>
            <BookOpen size={12} />{parsed?.verse ? `${parsed.book} ${parsed.chapter}:${parsed.verse}` : verse.trim() ? "Not a verse" : "Stand on a verse"}
          </button>
        )}
        <span className="ml-auto hidden sm:flex items-center gap-1.5 font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>
          <kbd className="bj-kbd">↵</kbd> add · <kbd className="bj-kbd">⇧↵</kbd> details
        </span>
        <button type="button" onClick={add} disabled={!text.trim()} className="sm:hidden ml-auto bj-gold h-8 px-3.5 rounded-[10px] font-sans text-[12.5px] font-semibold disabled:opacity-50">Add</button>
      </div>
    </div>
  );
}
// ── Rows ───────────────────────────────────────────────────

function TodayRow({ p, onOpen, onPray }: { p: Prayer; onOpen: () => void; onPray: () => void }) {
  const font = useWritingStore((s) => s.font);
  const done = prayedToday(p);
  const said = lastWords(p) || docToText(p.body);
  return (
    <motion.div layout="position" transition={{ duration: 0.25, ease: EASE }}
      className="bj-raised rounded-2xl flex gap-3.5 items-start px-4 py-3.5" style={{ opacity: done ? 0.62 : 1, transition: "opacity 0.25s ease" }}>
      <button type="button" onClick={onOpen} className="flex gap-3.5 items-start flex-1 min-w-0 text-left" data-row>
        <PersonDot name={p.for} size={30} />
        <span className="flex-1 min-w-0">
          <span className="block font-sans text-[10.5px] font-semibold uppercase mb-1 truncate" style={{ color: "var(--bj-ink4)", letterSpacing: "0.06em" }}>{forLabel(p.for)} · day {num(dayNumber(p))}</span>
          <span className="block font-display mb-1" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.2, color: "var(--bj-ink)", overflowWrap: "anywhere" }}>{p.title || "Untitled prayer"}</span>
          {said && <span className="bj-preview line-clamp-2" style={{ ...writingFontStyle(font, 15), lineHeight: 1.45, color: "var(--bj-ink3)" }}>{said}</span>}
        </span>
      </button>
      {done ? (
        <span className="h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12px] font-semibold shrink-0"
          style={{ background: "color-mix(in oklch, var(--bj-sage) 14%, transparent)", color: "var(--bj-sage)", border: "1px solid color-mix(in oklch, var(--bj-sage) 28%, transparent)" }}>
          <Check size={13} strokeWidth={2.4} /> <span className="max-[400px]:hidden">Prayed</span>
        </span>
      ) : (
        <button type="button" onClick={onPray} className="bj-raised bj-lift h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12px] font-semibold shrink-0" style={{ color: "var(--bj-ink2)" }}>
          <HandHeart size={13} style={{ color: "var(--bj-gold)" }} /> <span className="max-[400px]:hidden">Pray</span>
        </button>
      )}
    </motion.div>
  );
}

function SmallRow({ p, onOpen }: { p: Prayer; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} data-row
      className="bj-menu-item flex items-center gap-2.5 px-3 py-2.5 rounded-[13px] text-left min-w-0"
      style={{ background: "color-mix(in oklch, var(--bj-ink) 2.5%, transparent)", border: "1px solid color-mix(in oklch, var(--bj-ink) 5%, transparent)" }}>
      <PersonDot name={p.for} size={22} />
      <span className="flex-1 min-w-0 font-sans text-[14px] font-medium truncate" style={{ color: "var(--bj-ink2)" }}>
        {p.for?.trim() && <span style={{ color: "var(--bj-ink4)", fontWeight: 400 }}>{p.for.trim()} — </span>}{p.title || "Untitled prayer"}
      </span>
      <span className="font-sans text-[11px] shrink-0" style={{ color: "var(--bj-ink4)", fontVariantNumeric: "tabular-nums" }}>Day {num(dayNumber(p))}</span>
    </button>
  );
}

function AnsweredCard({ p, big }: { p: Prayer; big?: boolean }) {
  const font = useWritingStore((s) => s.font);
  const testimony = docToText(p.testimony);
  return (
    <div className="rounded-[14px] px-3.5 py-3" style={{ background: "color-mix(in oklch, var(--bj-sage) 9%, transparent)", border: "1px solid color-mix(in oklch, var(--bj-sage) 20%, transparent)" }}>
      <p className="font-sans text-[10.5px] font-semibold uppercase mb-1" style={{ color: "var(--bj-sage)", letterSpacing: "0.06em" }}>
        Answered {p.answeredAt ? shortDate(p.answeredAt) : ""} · after {plural(waitedDays(p), "day")}
      </p>
      <p className={big ? "" : "line-clamp-3"} style={{ ...writingFontStyle(font, 15.5), lineHeight: 1.4, color: "var(--bj-ink2)" }}>{testimony || p.title}</p>
    </div>
  );
}

// ── The answered wall ──────────────────────────────────────

function Wall({ answered, onBack, onOpen }: { answered: Prayer[]; onBack: () => void; onOpen: (id: string) => void }) {
  const user = useAuthStore((s) => s.user);
  const font = useWritingStore((s) => s.font);
  return (
    <motion.div key="wall" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }}>
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 h-8 font-sans text-[13px] mb-3" style={{ color: "var(--bj-ink3)" }}><ArrowLeft size={14} /> Prayer</button>
      <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 40px)", fontWeight: 500, lineHeight: 1, color: "var(--bj-ink)" }}>Answered</h1>
      <p className="font-sans text-[13px] mt-1.5 mb-7" style={{ color: "var(--bj-ink3)" }}>{plural(answered.length, "prayer")} God answered. What you asked, and what he did.</p>
      {answered.length === 0 ? (
        <p className="font-display italic text-xl py-16 text-center" style={{ color: "var(--bj-ink4)" }}>Nothing here yet. It will come.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {answered.map((p) => (
            <article key={p.id} className="bj-raised rounded-[20px] p-4 flex flex-col gap-3">
              <button type="button" onClick={() => onOpen(p.id)} className="text-left">
                <p className="font-sans text-[10.5px] font-semibold uppercase mb-1" style={{ color: "var(--bj-ink4)", letterSpacing: "0.06em" }}>
                  {forLabel(p.for)} · you asked {shortDate(p.createdAt, true)}
                </p>
                <p className="font-display" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.2, color: "var(--bj-ink)" }}>{p.title || "Untitled prayer"}</p>
                {docToText(p.body) && <p className="line-clamp-2 mt-1" style={{ ...writingFontStyle(font, 15), lineHeight: 1.45, color: "var(--bj-ink3)" }}>{docToText(p.body)}</p>}
              </button>
              <AnsweredCard p={p} big />
              <button type="button" onClick={() => user && reopenPrayer(user.uid, p.id)} className="self-start font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>Still praying — move it back</button>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function PrayerPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { prayers, loading } = usePrayers();
  const perDay = usePrefsStore((s) => s.prayersPerDay);
  const [sort, setSort] = useState<Sort>("person");
  const [praying, setPraying] = useState<Prayer[] | null>(null);
  const [wall, setWall] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "answered");
  const [added, setAdded] = useState<{ id: string; title: string } | null>(null);

  function showWall(v: boolean) {
    setWall(v);
    window.history.replaceState(null, "", v ? "/prayer?view=answered" : "/prayer");
    window.scrollTo({ top: 0 });
  }
  useEffect(() => { if (!added) return; const t = setTimeout(() => setAdded(null), 5000); return () => clearTimeout(t); }, [added]);

  const active = useMemo(() => prayers.filter((p) => p.status === "active"), [prayers]);
  const answered = useMemo(() => prayers.filter((p) => p.status === "answered")
    .sort((a, b) => (b.answeredAt?.getTime() ?? 0) - (a.answeredAt?.getTime() ?? 0)), [prayers]);
  const today = useMemo(() => todaysPrayers(active, perDay), [active, perDay]);
  const todayIds = new Set(today.map((p) => p.id));
  const rest = useMemo(() => {
    const r = active.filter((p) => !todayIds.has(p.id));
    if (sort === "newest") return r.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (sort === "longest") return r.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return r.sort((a, b) => (a.for?.trim() || "￿").localeCompare(b.for?.trim() || "￿") || a.title.localeCompare(b.title));
  }, [active, today, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const people = useMemo(() => [...new Set(prayers.map((p) => p.for?.trim()).filter((x): x is string => !!x))].sort(), [prayers]);
  const year = new Date().getFullYear();
  const answeredThisYear = answered.filter((p) => p.answeredAt?.getFullYear() === year);
  const longest = answered.reduce((m, p) => Math.max(m, waitedDays(p)), 0);
  const left = today.filter((p) => !prayedToday(p));
  const standOn = today.flatMap((p) => p.scriptures ?? []).find((s) => s.text) ?? STAND_ON;

  function pray(p: Prayer) { if (user) void logPrayer(user.uid, p.id, ""); }
  function startPraying() { setPraying(left.length ? left : today); }

  return (
    <div className="min-h-full w-full px-4 md:px-9 pt-6 md:pt-8 pb-28">
      <div className="max-w-[1120px] mx-auto">
        <AnimatePresence mode="wait" initial={false}>
          {wall ? (
            <Wall answered={answered} onBack={() => showWall(false)} onOpen={(id) => router.push(`/prayer/${id}`)} />
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className="flex flex-col lg:flex-row gap-7">
              <section className="flex-1 min-w-0 flex flex-col gap-3.5">
                <div className="flex items-end gap-3.5 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 40px)", fontWeight: 500, lineHeight: 1, color: "var(--bj-ink)" }}>Prayer</h1>
                    <p className="font-sans text-[13px] mt-1.5" style={{ color: "var(--bj-ink3)" }}>
                      {loading ? " " : `${num(active.length)} you’re carrying · ${num(answeredThisYear.length)} answered this year`}
                    </p>
                  </div>
                  {today.length > 0 && (
                    <button type="button" onClick={startPraying} className="bj-gold h-[38px] px-4 rounded-xl flex items-center gap-2 font-sans text-[13px] font-semibold shrink-0">
                      <HandHeart size={15} /> Pray now
                      <span className="hidden sm:inline" style={{ opacity: 0.6, fontWeight: 500 }}>· {left.length ? `${num(left.length)} left` : "again"}</span>
                    </button>
                  )}
                </div>

                <Composer people={people} onAdded={(id, title) => setAdded({ id, title })} />
                <AnimatePresence>
                  {added && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                      className="font-sans text-[12.5px] px-1 -mt-1" style={{ color: "var(--bj-ink3)" }} role="status">
                      <Check size={12} className="inline -mt-0.5 mr-1" style={{ color: "var(--bj-sage)" }} />
                      Added “{added.title.length > 48 ? added.title.slice(0, 48) + "…" : added.title}”.{" "}
                      {added.id && <button type="button" onClick={() => router.push(`/prayer/${added.id}`)} className="underline underline-offset-2" style={{ color: "var(--bj-ink2)" }}>Open it</button>}
                    </motion.p>
                  )}
                </AnimatePresence>

                {loading ? (
                  <div className="flex flex-col gap-3 mt-4">{[0, 1, 2].map((k) => <div key={k} className="h-[92px] rounded-2xl animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />)}</div>
                ) : active.length === 0 ? (
                  <div className="py-14 text-center">
                    <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)" }}>{prayers.length ? "Nothing you’re carrying right now." : "Nothing here yet."}</p>
                    <p className="font-sans text-[13px] mt-2" style={{ color: "var(--bj-ink4)" }}>Type above and press Enter. It stays here; no new page.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                      <Tag>{today.length === 4 ? "Today’s four" : "Today"}</Tag>
                      <span className="font-sans text-[12px] flex-1 min-w-0 truncate" style={{ color: "var(--bj-ink4)" }}>{cycleLabel(active.length, perDayFor(active.length, perDay))}</span>
                      {today.length > 7 ? (
                        <span className="font-sans text-[12px] font-medium shrink-0" style={{ color: "var(--bj-ink3)", fontVariantNumeric: "tabular-nums" }}>{today.length - left.length} of {today.length}</span>
                      ) : (
                        <span className="flex gap-1 shrink-0" aria-label={`${today.length - left.length} of ${today.length} prayed`}>
                          {today.map((p) => <i key={p.id} className="block w-[18px] h-[6px] rounded-full" style={{ background: prayedToday(p) ? "var(--bj-gold)" : "color-mix(in oklch, var(--bj-ink) 10%, transparent)", transition: "background-color 0.3s ease" }} />)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {today.map((p) => <TodayRow key={p.id} p={p} onOpen={() => router.push(`/prayer/${p.id}`)} onPray={() => pray(p)} />)}
                    </div>

                    {rest.length > 0 && (
                      <>
                        <div className="flex items-center gap-2.5 mt-5 flex-wrap">
                          <Tag color="var(--bj-ink4)">Everything else</Tag>
                          <div className="ml-auto bj-well inline-flex p-0.5 rounded-[10px] gap-0.5" role="radiogroup" aria-label="Sort">
                            {([["person", "By person"], ["newest", "Newest"], ["longest", "Longest"]] as const).map(([id, l]) => (
                              <button key={id} type="button" role="radio" aria-checked={sort === id} onClick={() => setSort(id)}
                                className={`h-[26px] px-2.5 rounded-[8px] font-sans text-[12px] ${sort === id ? "bj-raised" : ""}`}
                                style={{ color: sort === id ? "var(--bj-ink)" : "var(--bj-ink3)", border: sort === id ? undefined : "1px solid transparent" }}>{l}</button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {rest.map((p) => <SmallRow key={p.id} p={p} onOpen={() => router.push(`/prayer/${p.id}`)} />)}
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>

              <aside className="lg:w-[340px] shrink-0 flex flex-col gap-3.5 lg:pt-[74px]">
                <div className="bj-glass rounded-[20px] p-[18px]">
                  <Tag color="var(--bj-sage)">Answered</Tag>
                  <p className="font-display mt-2.5" style={{ fontSize: 46, fontWeight: 500, lineHeight: 1, color: "var(--bj-ink)", fontVariantNumeric: "lining-nums tabular-nums" }}>
                    {num(answeredThisYear.length)}<span className="font-display" style={{ fontSize: 20, color: "var(--bj-ink3)" }}> this year</span>
                  </p>
                  <p className="font-sans text-[12px] mt-1 mb-4" style={{ color: "var(--bj-ink4)" }}>
                    {answered.length ? `Longest you waited: ${plural(longest, "day")}` : "When God answers, write it down here."}
                  </p>
                  <div className="flex flex-col gap-2">{answered.slice(0, 2).map((p) => <AnsweredCard key={p.id} p={p} />)}</div>
                  {answered.length > 0 && (
                    <button type="button" onClick={() => showWall(true)} className="mt-3 font-sans text-[12px] font-medium" style={{ color: "var(--bj-ink3)" }}>See the whole wall →</button>
                  )}
                </div>
                <div>
                  <p className="font-sans text-[10.5px] font-semibold uppercase mb-2 px-0.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>To stand on</p>
                  <VerseCard r={standOn} size={19} />
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {praying && <PrayNow key="pray" queue={praying} onClose={() => setPraying(null)} />}
      </AnimatePresence>
    <DataToggle />
    </div>
  );
}
