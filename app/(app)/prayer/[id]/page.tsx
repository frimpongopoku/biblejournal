"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, HandHeart, MoreHorizontal, Plus, Trash2, Undo2, X } from "lucide-react";
import { useAutosave } from "@/hooks/useAutosave";
import { useAutoGrow } from "@/hooks/useAutoGrow";
import { usePrayers } from "@/hooks/usePrayers";
import { deletePrayer, logPrayer, markAnswered, removePrayerLog, reopenPrayer, updatePrayer } from "@/services/prayer.service";
import { useAuthStore } from "@/store/auth.store";
import { useBibleStore } from "@/store/bible.store";
import { useWritingStore, writingFontStyle } from "@/store/writing.store";
import { parseRef } from "@/lib/bible-ref-parser";
import { fetchPassage } from "@/lib/bible-client";
import { num, dayNumber, docToText, logOf, plural, prayedDays, shortDate, textToDoc } from "@/lib/prayer";
import { DayStrip, PersonDot, VerseCard, forLabel, refLabel } from "@/components/prayer/parts";
import { PrayNow } from "@/components/prayer/PrayNow";
import { AnsweredDialog } from "@/components/prayer/AnsweredDialog";
import { DataToggle } from "@/components/dev/DataToggle";
import type { PrayerLogEntry, ScriptureRef } from "@/types";

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];


const LABEL = "font-sans text-[10.5px] font-semibold uppercase";

export default function PrayerPage() {
  const params = useParams();
  const prayerId = params.id as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const version = useBibleStore((s) => s.version);
  const font = useWritingStore((s) => s.font);
  const { prayers, loading } = usePrayers();
  const prayer = prayers.find((p) => p.id === prayerId) ?? null;
  const isAnswered = prayer?.status === "answered";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [who, setWho] = useState("");
  const [editingWho, setEditingWho] = useState(false);
  const [today, setToday] = useState("");
  const [addingVerse, setAddingVerse] = useState(false);
  const [verseText, setVerseText] = useState("");
  const [menu, setMenu] = useState(false);
  const [showAllLog, setShowAllLog] = useState(false);
  const [praying, setPraying] = useState(false);
  const [answering, setAnswering] = useState(false);
  const initialised = useRef(false);
  // What's there right now, so a prayer left blank can be removed on the way out.
  const titleNow = useRef("");
  const bodyNow = useRef("");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const todayRef = useRef<HTMLTextAreaElement>(null);
  useAutoGrow(titleRef, title);
  useAutoGrow(bodyRef, body);
  useAutoGrow(todayRef, today);

  useEffect(() => {
    if (!prayer || initialised.current) return;
    initialised.current = true;
    const b = docToText(prayer.body);
    setTitle(prayer.title); setBody(b); setWho(prayer.for ?? "");
    titleNow.current = prayer.title; bodyNow.current = b;
    if (!prayer.title.trim()) setTimeout(() => titleRef.current?.focus(), 50);
  }, [prayer]);

  const autosave = useAutosave<{ title?: string; body?: string; for?: string }>((id, patch) =>
    user ? updatePrayer(user.uid, id, patch) : Promise.resolve(),
  );
  const save = useCallback(
    (patch: { title?: string; body?: string; for?: string }) => { if (user) autosave.schedule(prayerId, patch); },
    [user, prayerId, autosave.schedule], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => () => {
    const log = prayers.find((p) => p.id === prayerId)?.log?.length ?? 0;
    if (initialised.current && user && !titleNow.current.trim() && !bodyNow.current.trim() && !log) void deletePrayer(user.uid, prayerId);
  }, [user, prayerId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [menu]);

  function amen() {
    if (!user || !prayer) return;
    void logPrayer(user.uid, prayer.id, today);
    setToday("");
  }

  async function addVerse() {
    const r = parseRef(verseText);
    if (!user || !prayer || !r) return;
    const ref: ScriptureRef = { book: r.book, chapter: r.chapter, verse: r.verse ?? 1, ...(r.verseEnd ? { endVerse: r.verseEnd } : {}), version };
    setVerseText(""); setAddingVerse(false);
    let text: string | undefined;
    try { text = (await fetchPassage(version, { ...r, verse: r.verse ?? 1 })).verses.map((v) => v.text).join(" "); } catch { /* keep the reference */ }
    await updatePrayer(user.uid, prayer.id, { scriptures: [...(prayer.scriptures ?? []), { ...ref, ...(text ? { text } : {}) }] });
  }

  if (!loading && !prayer) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)" }}>This prayer isn’t here any more.</p>
        <button type="button" onClick={() => router.push("/prayer")} className="font-sans text-[13px]" style={{ color: "var(--bj-ink3)" }}>← Back to Prayer</button>
      </div>
    );
  }

  const log = prayer ? [...logOf(prayer)].sort((a, b) => b.at - a.at) : [];
  const others = prayer && prayer.for?.trim()
    ? prayers.filter((p) => p.id !== prayer.id && p.status === "active" && p.for?.trim().toLowerCase() === prayer.for?.trim().toLowerCase())
    : [];
  const saving = autosave.status === "pending" || autosave.status === "saving";

  return (
    <div className="min-h-full w-full px-4 md:px-9 pt-4 md:pt-5">
      <div className="max-w-[1080px] mx-auto">
        {/* Bar */}
        <div className="flex items-center gap-2 h-11 mb-5">
          <button type="button" onClick={() => router.push("/prayer")} className="flex items-center gap-1.5 h-9 pr-2 font-sans text-[13px]" style={{ color: "var(--bj-ink3)" }}>
            <ArrowLeft size={15} /> Prayer
          </button>
          <span className="font-sans text-[11.5px] ml-1" style={{ color: "var(--bj-ink4)" }} aria-live="polite">{saving ? "Saving…" : ""}</span>
          <div className="ml-auto flex items-center gap-2">
            {prayer && !isAnswered && (
              <>
                <button type="button" onClick={() => setPraying(true)} className="bj-raised bj-lift h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink2)" }}>
                  <HandHeart size={13} style={{ color: "var(--bj-gold)" }} /> <span className="hidden sm:inline">Pray now</span>
                </button>
                <button type="button" onClick={() => setAnswering(true)} className="h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12.5px] font-semibold active:scale-[0.97] transition-transform"
                  style={{ background: "color-mix(in oklch, var(--bj-sage) 13%, transparent)", border: "1px solid color-mix(in oklch, var(--bj-sage) 30%, transparent)", color: "var(--bj-sage)" }}>
                  <Check size={13} strokeWidth={2.4} /> God answered
                </button>
              </>
            )}
            {isAnswered && (
              <span className="h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12.5px] font-semibold" style={{ background: "color-mix(in oklch, var(--bj-sage) 13%, transparent)", color: "var(--bj-sage)" }}>
                <Check size={13} strokeWidth={2.4} /> Answered {prayer?.answeredAt ? shortDate(prayer.answeredAt) : ""}
              </span>
            )}
            <div className="relative">
              <button type="button" onClick={() => setMenu((m) => !m)} onPointerDown={(e) => e.stopPropagation()} aria-label="Prayer options" aria-expanded={menu}
                className="bj-btn-icon w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                <MoreHorizontal size={16} />
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div onPointerDown={(e) => e.stopPropagation()} role="menu"
                    initial={{ opacity: 0, scale: 0.97, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.15, ease: EASE }} style={{ transformOrigin: "top right" }}
                    className="bj-pop absolute right-0 top-full mt-1.5 w-52 rounded-[14px] p-1 z-30">
                    {isAnswered && (
                      <button type="button" role="menuitem" onClick={() => { setMenu(false); if (user && prayer) void reopenPrayer(user.uid, prayer.id); }}
                        className="bj-menu-item w-full flex items-center gap-2.5 h-9 px-2.5 rounded-[10px] font-sans text-[13px]" style={{ color: "var(--bj-ink2)" }}>
                        <Undo2 size={14} /> Still praying
                      </button>
                    )}
                    <button type="button" role="menuitem" onClick={async () => { setMenu(false); if (!user) return; initialised.current = false; await deletePrayer(user.uid, prayerId); router.push("/prayer"); }}
                      className="bj-menu-item w-full flex items-center gap-2.5 h-9 px-2.5 rounded-[10px] font-sans text-[13px]" style={{ color: "var(--bj-ember)" }}>
                      <Trash2 size={14} /> Delete prayer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {loading || !prayer ? (
          <div className="max-w-[680px] animate-pulse">
            <div className="h-4 w-1/3 rounded mb-4" style={{ background: "var(--bj-bg-soft)" }} />
            <div className="h-11 w-2/3 rounded-lg mb-5" style={{ background: "var(--bj-bg-soft)" }} />
            <div className="h-20 rounded-lg" style={{ background: "var(--bj-bg-soft)" }} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <section className="flex-1 min-w-0 max-w-[680px]">
              {/* Who it's for */}
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <PersonDot name={who} size={26} />
                {editingWho ? (
                  <input autoFocus value={who} onChange={(e) => { setWho(e.target.value); save({ for: e.target.value.trim() }); }} placeholder="Who is it for?" aria-label="Who it’s for"
                    onBlur={() => setEditingWho(false)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingWho(false); }}
                    className="bj-well h-7 px-2.5 rounded-lg outline-none font-sans text-[13px] w-[180px]" style={{ color: "var(--bj-ink)" }} />
                ) : (
                  <button type="button" onClick={() => setEditingWho(true)} className="font-sans text-[13px] font-medium" style={{ color: "var(--bj-ink2)" }} title="Change who it’s for">
                    {forLabel(who)}
                  </button>
                )}
                <span className="hidden sm:inline font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }} aria-hidden>·</span>
                <span className="basis-full sm:basis-auto font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }}>
                  {[`since ${shortDate(prayer.createdAt, true).replace(/^(Today|Yesterday)$/, (m) => m.toLowerCase())}`, `day ${num(dayNumber(prayer))}`, ...(log.length ? [`prayed ${plural(log.length, "time")}`] : [])].join(" · ")}
                </span>
              </div>

              <textarea data-writing-surface ref={titleRef} value={title} rows={1} readOnly={isAnswered}
                onChange={(e) => { setTitle(e.target.value); titleNow.current = e.target.value; save({ title: e.target.value }); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); bodyRef.current?.focus(); } }}
                placeholder="What are you praying for?" aria-label="Prayer"
                className="w-full bg-transparent outline-none resize-none overflow-hidden font-display block"
                style={{ fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 500, lineHeight: 1.08, color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />

              <textarea data-writing-surface ref={bodyRef} value={body} rows={1} readOnly={isAnswered}
                onChange={(e) => { setBody(e.target.value); bodyNow.current = e.target.value; save({ body: e.target.value.trim() ? textToDoc(e.target.value) : "" }); }}
                placeholder="Say more, if you want…" aria-label="Details"
                className="w-full bg-transparent outline-none resize-none overflow-hidden block mt-3.5"
                style={{ ...writingFontStyle(font, 19), lineHeight: 1.6, color: "var(--bj-ink2)", caretColor: "var(--bj-gold)" }} />

              <div className="flex items-center gap-2.5 mt-4 mb-8 overflow-hidden">
                <DayStrip days={prayedDays(prayer, 42)} size={9} gap={3} />
                <span className="font-sans text-[11.5px] shrink-0" style={{ color: "var(--bj-ink4)" }}>6 weeks</span>
              </div>

              {isAnswered && prayer.testimony && (
                <div className="rounded-2xl px-4 py-3.5 mb-7" style={{ background: "color-mix(in oklch, var(--bj-sage) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--bj-sage) 22%, transparent)" }}>
                  <p className={LABEL + " mb-1.5"} style={{ color: "var(--bj-sage)", letterSpacing: "0.07em" }}>How he answered · {prayer.answeredAt ? shortDate(prayer.answeredAt, true) : ""}</p>
                  <p style={{ ...writingFontStyle(font, 18), lineHeight: 1.55, color: "var(--bj-ink)", whiteSpace: "pre-line" }}>{docToText(prayer.testimony)}</p>
                </div>
              )}

              <p className={LABEL + " mb-3"} style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>Each time you pray</p>
              {log.length === 0 && (
                <p className="font-sans text-[13px] mb-6" style={{ color: "var(--bj-ink4)" }}>Nothing yet. Write below and press Amen; each time goes here with its date.</p>
              )}
              <div>
                <AnimatePresence initial={false}>
                  {(showAllLog ? log : log.slice(0, 30)).map((e, k) => <LogItem key={e.at} e={e} first={k === 0} font={font} onRemove={() => user && removePrayerLog(user.uid, prayer.id, e)} />)}
                </AnimatePresence>
                {!showAllLog && log.length > 30 && (
                  <button type="button" onClick={() => setShowAllLog(true)} className="bj-raised bj-lift ml-7 mb-4 h-8 px-3.5 rounded-[10px] font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink3)" }}>
                    Show {plural(log.length - 30, "earlier time")}
                  </button>
                )}
              </div>

              {!isAnswered && (
                <div className="sticky bottom-[92px] md:bottom-5 z-20 mt-4 mb-6">
                  <div className="bj-raised rounded-[18px] pl-4 pr-2.5 py-2.5 flex items-end gap-2.5" style={{ boxShadow: "var(--bj-shadow-lg)" }}>
                    <span className="h-[22px] px-[7px] mb-[5px] rounded-[7px] font-sans text-[11px] font-semibold flex items-center shrink-0" style={{ background: "color-mix(in oklch, var(--bj-gold) 15%, transparent)", color: "var(--bj-gold)" }}>Today</span>
                    <textarea data-writing-surface ref={todayRef} value={today} onChange={(e) => setToday(e.target.value)} rows={1}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); amen(); } }}
                      placeholder="What are you praying today?" aria-label="What you’re praying today"
                      className="flex-1 min-w-0 bg-transparent outline-none resize-none overflow-hidden py-1 max-h-[40vh]"
                      style={{ ...writingFontStyle(font, 18), lineHeight: 1.45, color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
                    <button type="button" onClick={amen} className="bj-gold h-8 px-3 rounded-[10px] font-sans text-[12px] font-semibold flex items-center gap-1.5 shrink-0">
                      Amen <span className="hidden sm:inline" style={{ opacity: 0.6 }}>⌘↵</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside className="lg:w-[330px] shrink-0 flex flex-col gap-3 pb-28">
              <p className={LABEL} style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>Standing on</p>
              {(prayer.scriptures ?? []).map((r, k) => (
                <VerseCard key={`${refLabel(r)}-${k}`} r={r} onRemove={isAnswered ? undefined : () => user && updatePrayer(user.uid, prayer.id, { scriptures: prayer.scriptures.filter((_, j) => j !== k) })} />
              ))}
              {!isAnswered && (addingVerse ? (
                <div className="bj-well h-[38px] rounded-xl flex items-center gap-2 pl-3 pr-1.5">
                  <input autoFocus value={verseText} onChange={(e) => setVerseText(e.target.value)} placeholder="Isaiah 41:10" aria-label="Verse to stand on"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void addVerse(); } if (e.key === "Escape") setAddingVerse(false); }}
                    className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[13px]" style={{ color: "var(--bj-ink)" }} />
                  <button type="button" onClick={() => void addVerse()} disabled={!parseRef(verseText)} aria-label="Add verse" className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40" style={{ color: "var(--bj-gold)" }}><Check size={14} /></button>
                  <button type="button" onClick={() => setAddingVerse(false)} aria-label="Cancel" className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}><X size={14} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setAddingVerse(true)} className="h-[38px] rounded-xl flex items-center justify-center gap-1.5 font-sans text-[12.5px] font-medium"
                  style={{ border: "1px dashed color-mix(in oklch, var(--bj-ink) 16%, transparent)", color: "var(--bj-ink4)" }}>
                  <Plus size={13} /> Add a verse
                </button>
              ))}
              {others.length > 0 && (
                <>
                  <p className={LABEL + " mt-4"} style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>Also for {prayer.for?.trim()}</p>
                  {others.map((o) => (
                    <button key={o.id} type="button" onClick={() => router.push(`/prayer/${o.id}`)} className="bj-menu-item flex items-center gap-2.5 px-3 py-2.5 rounded-[13px] text-left"
                      style={{ background: "color-mix(in oklch, var(--bj-ink) 2.5%, transparent)", border: "1px solid color-mix(in oklch, var(--bj-ink) 5%, transparent)" }}>
                      <span className="flex-1 min-w-0 truncate font-sans text-[13.5px] font-medium" style={{ color: "var(--bj-ink2)" }}>{o.title || "Untitled prayer"}</span>
                      <span className="font-sans text-[11px] shrink-0" style={{ color: "var(--bj-ink4)" }}>Day {dayNumber(o)}</span>
                    </button>
                  ))}
                </>
              )}
            </aside>
          </div>
        )}
      </div>

      <AnimatePresence>
        {praying && prayer && <PrayNow key="pray" queue={[prayer]} onClose={() => setPraying(false)} />}
      </AnimatePresence>
      <AnsweredDialog open={answering} prayer={prayer} onClose={() => setAnswering(false)}
        onConfirm={async (t) => { if (user) await markAnswered(user.uid, prayerId, t); }} />
    <DataToggle />
    </div>
  );
}

function LogItem({ e, first, font, onRemove }: { e: PrayerLogEntry; first: boolean; font: Parameters<typeof writingFontStyle>[0]; onRemove: () => void }) {
  return (
    <motion.div layout="position" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: EASE }}
      className="group flex gap-4">
      <div className="w-3 flex flex-col items-center pt-[7px] shrink-0" aria-hidden>
        <i className="block w-[9px] h-[9px] rounded-full" style={{
          background: first ? "var(--bj-gold)" : "color-mix(in oklch, var(--bj-ink) 22%, transparent)",
          boxShadow: first ? "0 0 0 4px color-mix(in oklch, var(--bj-gold) 18%, transparent)" : "none",
        }} />
        <i className="block flex-1 w-px mt-1.5" style={{ background: "color-mix(in oklch, var(--bj-ink) 8%, transparent)" }} />
      </div>
      <div className="flex-1 min-w-0 pb-5">
        <p className="flex items-center gap-2 font-sans text-[10.5px] font-semibold uppercase mb-1" style={{ color: first ? "var(--bj-gold)" : "var(--bj-ink4)", letterSpacing: "0.06em" }}>
          {shortDate(e.at)}
          <span className="font-normal normal-case tracking-normal" style={{ color: "var(--bj-ink4)" }}>{new Date(e.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
          <button type="button" onClick={onRemove} aria-label="Remove this entry" className="ml-auto opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded" style={{ color: "var(--bj-ink4)" }}><X size={12} /></button>
        </p>
        {e.text
          ? <p style={{ ...writingFontStyle(font, 18), lineHeight: 1.55, color: first ? "var(--bj-ink)" : "var(--bj-ink2)", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{e.text}</p>
          : <p className="font-display italic" style={{ fontSize: 16, color: "var(--bj-ink4)" }}>Prayed</p>}
      </div>
    </motion.div>
  );
}
