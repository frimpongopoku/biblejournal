"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Star, Download, BookOpenText, List as ListIcon } from "lucide-react";
import { feelingColor } from "@/lib/feelings";
import { usePrayers } from "@/hooks/usePrayers";
import { cachedDocText } from "@/components/journal/JournalParts";
import type { JournalEntry, Prayer } from "@/types";

/* ──────────────────────────────────────────────────────────────
   The journal through time. Month: every day with how it felt, what
   you wrote, a photo, and prayers answered that day. Year: a square per
   day; drag across any stretch (or pick one) and read it back in order.
   ────────────────────────────────────────────────────────────── */

export type TimeMode = "list" | "month" | "year";
const LABEL = "font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em]";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) => key(a) === key(b);
const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase();
const excerpt = (e: JournalEntry, n = 220) => { const t = cachedDocText(e.content); return t.length > n ? `${t.slice(0, n)}…` : t; };
const titleOf = (e: JournalEntry) => e.title.trim() || excerpt(e, 40) || "Untitled";

/** Entries and answered prayers, by day. */
function useByDay(entries: JournalEntry[]) {
  const { prayers } = usePrayers();
  return useMemo(() => {
    const days = new Map<string, JournalEntry[]>();
    for (const e of [...entries].sort((a, b) => +a.createdAt - +b.createdAt)) {
      const k = key(e.createdAt);
      days.set(k, [...(days.get(k) ?? []), e]);
    }
    const answered = new Map<string, Prayer[]>();
    for (const p of prayers) if (p.answeredAt) { const k = key(p.answeredAt); answered.set(k, [...(answered.get(k) ?? []), p]); }
    return { days, answered };
  }, [entries, prayers]);
}

/** The colour of a day: its last entry with a feeling. */
function dayColor(list?: JournalEntry[]) {
  if (!list?.length) return null;
  for (let i = list.length - 1; i >= 0; i--) { const c = feelingColor(list[i].feeling); if (c) return c; }
  return "color-mix(in oklch, var(--bj-gold) 45%, var(--bj-bg-soft))";
}

function ModeSwitch({ mode, onMode }: { mode: TimeMode; onMode: (m: TimeMode) => void }) {
  return (
    <div role="tablist" aria-label="View" className="bj-well inline-flex gap-0.5 p-0.5 rounded-[11px] shrink-0">
      {(["list", "month", "year"] as const).map((m) => (
        <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => onMode(m)} data-active={mode === m ? "" : undefined}
          className={`bj-nav-item h-8 px-3 rounded-[9px] font-sans text-[12.5px] capitalize ${mode === m ? "bj-raised" : ""}`}
          style={{ color: mode === m ? "var(--bj-ink)" : "var(--bj-ink3)", fontWeight: mode === m ? 500 : 400, border: mode === m ? undefined : "1px solid transparent" }}>
          {m}
        </button>
      ))}
    </div>
  );
}

function Arrows({ onPrev, onNext, label }: { onPrev: () => void; onNext: () => void; label: string }) {
  return (
    <span className="flex gap-1 shrink-0">
      <button type="button" onClick={onPrev} aria-label={`Previous ${label}`} className="bj-raised bj-lift w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}><ChevronLeft size={15} /></button>
      <button type="button" onClick={onNext} aria-label={`Next ${label}`} className="bj-raised bj-lift w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}><ChevronRight size={15} /></button>
    </span>
  );
}

const typing = (t: EventTarget | null) => { const el = t as HTMLElement | null; return !!el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT"); };

// ── Month ─────────────────────────────────────────────────────

export function MonthView({ entries, onOpen, onNewFor, onMode }: {
  entries: JournalEntry[]; onOpen: (id: string) => void; onNewFor: (day: Date) => void; onMode: (m: TimeMode) => void;
}) {
  const today = startOfDay(new Date());
  const [day, setDay] = useState(today);
  const month = new Date(day.getFullYear(), day.getMonth(), 1);
  const mt = month.getTime();
  const { days, answered } = useByDay(entries);

  const grid = (() => {
    const month = new Date(mt);
    const start = mondayOf(month);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const end = addDays(mondayOf(last), 6);
    const out: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
    return out;
  })();

  const stats = (() => {
    const month = new Date(mt);
    let written = 0, pages = 0, prayers = 0;
    const feel = new Map<string, number>();
    for (let d = new Date(month); d.getMonth() === month.getMonth(); d = addDays(d, 1)) {
      const list = days.get(key(d));
      if (list) { written++; pages += list.length; for (const e of list) if (e.feeling) feel.set(e.feeling, (feel.get(e.feeling) ?? 0) + 1); }
      prayers += answered.get(key(d))?.length ?? 0;
    }
    const top = [...feel.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return { written, pages, prayers, top };
  })();

  // Keys: ←/→ a day, ↑/↓ a week, T today, ↵ open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('[role="dialog"]')) return;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (step) { e.preventDefault(); setDay((d) => addDays(d, step)); return; }
      if (e.key === "t" || e.key === "T") { setDay(startOfDay(new Date())); return; }
      if (e.key === "Enter") { const first = days.get(key(day))?.[0]; if (first) { e.preventDefault(); onOpen(first.id); } }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [day, days, onOpen]);

  const list = days.get(key(day)) ?? [];
  const wins = answered.get(key(day)) ?? [];
  const future = day > today;
  const monthName = month.toLocaleDateString(undefined, { month: "long" });

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
      <section className="flex-1 min-w-0 px-4 md:px-6 pt-5 pb-4 flex flex-col lg:overflow-y-auto">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1.5">
          <h1 className="font-display mr-1" style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.25rem)", color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1 }}>
            {monthName} <span style={{ color: "var(--bj-ink4)" }}>{month.getFullYear()}</span>
          </h1>
          <Arrows label="month" onPrev={() => setDay(new Date(month.getFullYear(), month.getMonth() - 1, 1))} onNext={() => setDay(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
          {!sameDay(day, today) && (
            <button type="button" onClick={() => setDay(today)} className="bj-raised bj-lift h-8 px-3 rounded-[10px] font-sans text-[12px] font-medium" style={{ color: "var(--bj-ink2)" }}>Today</button>
          )}
          <span className="flex-1" />
          <ModeSwitch mode="month" onMode={onMode} />
        </div>
        <p className="font-sans text-[12.5px] mb-4 flex flex-wrap items-center gap-x-1.5" style={{ color: "var(--bj-ink4)" }}>
          {stats.written === 0 ? "Nothing written this month yet" : <>
            {plural(stats.written, "day")} written · {plural(stats.pages, "page")}
            {stats.top && <> · mostly <i className="inline-block w-[7px] h-[7px] rounded-full not-italic" style={{ background: feelingColor(stats.top) ?? undefined }} /> {stats.top}</>}
          </>}
          {stats.prayers > 0 && <> · {plural(stats.prayers, "prayer")} answered</>}
        </p>

        <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1.5">
          {WEEKDAYS.map((w) => <span key={w} className={`${LABEL} text-center md:text-left md:pl-2.5`} style={{ color: "var(--bj-ink4)" }}><span className="md:hidden">{w[0]}</span><span className="hidden md:inline">{w}</span></span>)}
        </div>
        <div role="grid" aria-label={`${monthName} ${month.getFullYear()}`} className="grid grid-cols-7 gap-1 md:gap-1.5">
          {grid.map((d) => {
            const inMonth = d.getMonth() === month.getMonth();
            const items = inMonth ? days.get(key(d)) ?? [] : [];
            const isToday = sameDay(d, today);
            const sel = sameDay(d, day);
            const won = inMonth && (answered.get(key(d))?.length ?? 0) > 0;
            const cover = items.find((e) => e.cover?.url)?.cover;
            const fut = d > today;
            return (
              <button key={key(d)} type="button" role="gridcell" aria-selected={sel} onClick={() => setDay(d)} onDoubleClick={() => items[0] && onOpen(items[0].id)}
                aria-label={`${d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}${items.length ? `, ${plural(items.length, "entry", "entries")}` : ""}${won ? ", a prayer answered" : ""}`}
                className={`tv-cell relative h-[50px] md:h-[104px] rounded-[12px] md:rounded-[14px] p-1.5 md:p-2.5 flex flex-col items-center md:items-stretch text-left overflow-hidden ${sel ? "bj-raised" : ""}`}
                data-sel={sel ? "" : undefined} data-has={items.length ? "" : undefined}
                style={{ opacity: inMonth ? 1 : 0.35 }}>
                {cover && (
                  <span aria-hidden className="absolute inset-0 hidden md:block" style={{ background: cover.tint ?? undefined }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover.url} alt="" className="w-full h-full object-cover opacity-55" loading="lazy" />
                    <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,12,16,.1), rgba(10,12,16,.78))" }} />
                  </span>
                )}
                <span className="relative flex items-center justify-between w-full">
                  <span className={`font-sans text-[13px] font-medium ${isToday ? "w-6 h-6 rounded-full flex items-center justify-center mx-auto md:mx-0" : "mx-auto md:mx-0"}`}
                    style={isToday ? { background: "var(--bj-gold)", color: "#1A140A", fontWeight: 600 } : { color: fut || !inMonth ? "var(--bj-ink4)" : items.length ? "var(--bj-ink)" : "var(--bj-ink3)" }}>
                    {d.getDate()}
                  </span>
                  {won && <Star size={12} className="hidden md:block" style={{ color: "var(--bj-gold)" }} fill="currentColor" />}
                </span>
                {/* phone: dots */}
                <span className="relative md:hidden flex gap-[3px] mt-1 h-[5px]">
                  {items.slice(0, 3).map((e) => <i key={e.id} className="w-[5px] h-[5px] rounded-full" style={{ background: feelingColor(e.feeling) ?? "var(--bj-ink4)" }} />)}
                </span>
                {/* wider: titles */}
                <span className="relative hidden md:flex mt-auto flex-col gap-[3px] min-w-0">
                  {items.slice(0, 2).map((e) => (
                    <span key={e.id} className="flex items-center gap-1.5 min-w-0 font-sans text-[11.5px] font-medium" style={{ color: cover ? "var(--bj-ink)" : "var(--bj-ink2)" }}>
                      <i className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: feelingColor(e.feeling) ?? "var(--bj-ink4)" }} />
                      <span className="truncate">{titleOf(e)}</span>
                    </span>
                  ))}
                  {items.length > 2 && <span className="font-sans text-[10.5px] font-medium" style={{ color: "var(--bj-ink4)" }}>+{items.length - 2} more</span>}
                </span>
              </button>
            );
          })}
        </div>
        <p className="hidden lg:flex gap-3 mt-4 font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>
          <span><kbd className="bj-kbd">←</kbd> <kbd className="bj-kbd">→</kbd> days</span><span><kbd className="bj-kbd">T</kbd> today</span><span><kbd className="bj-kbd">↵</kbd> open</span>
        </p>
      </section>

      <aside aria-label="This day" className="w-full lg:w-[360px] shrink-0 p-4 lg:pl-0 lg:h-full">
        <div className="bj-glass rounded-[22px] lg:h-full p-4 md:p-5 flex flex-col gap-3 lg:overflow-y-auto">
          <div>
            <p className={LABEL} style={{ color: "var(--bj-gold)" }}>{day.toLocaleDateString(undefined, { weekday: "long" })}</p>
            <p className="font-display mt-1" style={{ fontSize: 28, lineHeight: 1.1, color: "var(--bj-ink)", fontWeight: 500 }}>
              {day.toLocaleDateString(undefined, { day: "numeric", month: "long", ...(day.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}) })}
            </p>
          </div>
          {list.map((e) => (
            <button key={e.id} type="button" onClick={() => onOpen(e.id)} className="bj-raised bj-lift rounded-[16px] p-3.5 flex flex-col gap-2 text-left">
              {e.cover?.url && (
                <span className="block h-[110px] rounded-[12px] overflow-hidden" style={{ background: e.cover.tint ?? "var(--bj-bg-soft)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.cover.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </span>
              )}
              <span className="flex items-center gap-2 min-w-0">
                <i className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: feelingColor(e.feeling) ?? "var(--bj-ink4)" }} />
                <span className="font-sans text-[14.5px] font-medium flex-1 min-w-0 truncate" style={{ color: "var(--bj-ink)" }}>{titleOf(e)}</span>
                <span className="font-sans text-[11.5px] shrink-0" style={{ color: "var(--bj-ink4)" }}>{time(e.createdAt)}</span>
              </span>
              {excerpt(e) && <span className="font-display line-clamp-4 text-[16px] leading-[1.5]" style={{ color: "var(--bj-ink3)" }}>{excerpt(e)}</span>}
            </button>
          ))}
          {wins.map((p) => (
            <p key={p.id} className="flex items-center gap-2 font-sans text-[12px] font-medium px-1" style={{ color: "var(--bj-gold)" }}>
              <Star size={12} fill="currentColor" className="shrink-0" /> <span className="truncate">Prayer answered · “{p.title || "Untitled"}”</span>
            </p>
          ))}
          {!list.length && !wins.length && (
            <p className="font-display italic text-[16px]" style={{ color: "var(--bj-ink4)" }}>{future ? "Not written yet." : "Nothing written this day."}</p>
          )}
          {!future && (
            <button type="button" onClick={() => onNewFor(day)} className="tv-dashed h-10 rounded-[12px] flex items-center justify-center gap-1.5 font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink3)" }}>
              <Plus size={13} /> {sameDay(day, today) ? "Write today" : "Write for this day"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Year / any stretch ───────────────────────────────────────

type Range = { from: Date; to: Date };
const norm = (a: Date, b: Date): Range => (a <= b ? { from: startOfDay(a), to: startOfDay(b) } : { from: startOfDay(b), to: startOfDay(a) });

/** Easter Sunday (Gregorian, anonymous algorithm). */
function easter(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

function presets(today: Date): { id: string; label: string; range: Range }[] {
  const y = today.getFullYear();
  const lentYear = today < addDays(easter(y), -46) ? y - 1 : y;
  const ago = new Date(y - 1, today.getMonth(), today.getDate());
  return [
    { id: "week", label: "This week", range: { from: mondayOf(today), to: today } },
    { id: "month", label: "This month", range: { from: new Date(y, today.getMonth(), 1), to: today } },
    { id: "3m", label: "Last 3 months", range: { from: addDays(today, -91), to: today } },
    { id: "lent", label: lentYear === y ? "Lent" : `Lent ${lentYear}`, range: { from: addDays(easter(lentYear), -46), to: addDays(easter(lentYear), -1) } },
    { id: "year", label: "This year", range: { from: new Date(y, 0, 1), to: today } },
    { id: "ago", label: "A year ago", range: { from: addDays(ago, -3), to: addDays(ago, 3) } },
  ];
}

function fmtRange(r: Range, now: Date) {
  const yr = (d: Date) => (d.getFullYear() !== now.getFullYear() || r.from.getFullYear() !== r.to.getFullYear() ? { year: "numeric" as const } : {});
  const f = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "long", ...yr(d) });
  return sameDay(r.from, r.to) ? f(r.from) : `${f(r.from)} – ${f(r.to)}`;
}

export function YearView({ entries, onOpen, onMode }: { entries: JournalEntry[]; onOpen: (id: string) => void; onMode: (m: TimeMode) => void }) {
  const today = startOfDay(new Date());
  const [year, setYear] = useState(today.getFullYear());
  const ps = presets(today);
  const [range, setRange] = useState<Range>(ps[1].range);
  const [preset, setPreset] = useState<string | null>("month");
  const [reading, setReading] = useState(false);
  const { days, answered } = useByDay(entries);
  const drag = useRef<Date | null>(null);
  const moved = useRef(false);

  const inRange = (d: Date) => d >= range.from && d <= range.to;

  const picked = useMemo(() => {
    const out = entries.filter((e) => { const d = startOfDay(e.createdAt); return d >= range.from && d <= range.to; })
      .sort((a, b) => +a.createdAt - +b.createdAt);
    let prayers = 0;
    for (let d = new Date(range.from); d <= range.to; d = addDays(d, 1)) prayers += answered.get(key(d))?.length ?? 0;
    const feel = new Map<string, number>();
    for (const e of out) if (e.feeling) feel.set(e.feeling, (feel.get(e.feeling) ?? 0) + 1);
    const mood = [...feel.entries()].sort((a, b) => b[1] - a[1]);
    // When do you write?
    let habit = "";
    if (out.length >= 4) {
      const wd = new Array(7).fill(0), part = { mornings: 0, afternoons: 0, evenings: 0 };
      for (const e of out) {
        wd[e.createdAt.getDay()]++;
        const h = e.createdAt.getHours();
        part[h < 12 ? "mornings" : h < 17 ? "afternoons" : "evenings"]++;
      }
      const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][wd.indexOf(Math.max(...wd))];
      const when = (Object.entries(part) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0];
      habit = `You wrote most on ${day} ${when}.`;
    }
    const weeks = new Map<string, { start: Date; items: JournalEntry[] }>();
    for (const e of out) { const m = mondayOf(e.createdAt); const k = key(m); weeks.set(k, { start: m, items: [...(weeks.get(k)?.items ?? []), e] }); }
    return { entries: out, prayers, mood, habit, weeks: [...weeks.values()] };
  }, [entries, answered, range]);

  const span = Math.round((+range.to - +range.from) / 864e5) + 1;
  const spanText = span >= 14 ? plural(Math.round(span / 7), "week") : plural(span, "day");

  function dayAt(e: React.PointerEvent) {
    const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-day]");
    return el ? new Date(Number(el.dataset.day)) : null;
  }
  function onDown(e: React.PointerEvent) {
    const d = dayAt(e);
    if (!d) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = d; moved.current = false;
    setRange(norm(d, d)); setPreset(null); setReading(false);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const d = dayAt(e);
    if (d) { moved.current = true; setRange(norm(drag.current, d)); }
  }
  function onUp() { drag.current = null; }

  function exportStretch() {
    const lines = [`# ${fmtRange(range, today)}`, ""];
    for (const e of picked.entries) {
      lines.push(`## ${e.title.trim() || "Untitled"}`, `*${e.createdAt.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}${e.feeling ? ` · ${e.feeling}` : ""}*`, "", cachedDocText(e.content), "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `journal-${range.from.toISOString().slice(0, 10)}-to-${range.to.toISOString().slice(0, 10)}.md` });
    document.body.appendChild(a); a.click(); a.remove();
  }

  const months = Array.from({ length: 12 }, (_, m) => m);
  const total = picked.mood.reduce((a, [, n]) => a + n, 0);

  return (
    <div className="h-full overflow-y-auto px-4 md:px-6 pt-5 pb-10">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
        <h1 className="font-display mr-1" style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.25rem)", color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1 }}>{year}</h1>
        <Arrows label="year" onPrev={() => setYear((y) => y - 1)} onNext={() => setYear((y) => y + 1)} />
        <span className="flex-1" />
        <ModeSwitch mode="year" onMode={onMode} />
      </div>

      <div className="flex flex-col xl:flex-row gap-5 xl:gap-7">
        <div className="bj-raised rounded-[20px] p-3 md:p-4 xl:w-[640px] shrink-0 select-none">
          <div role="grid" aria-label={`${year}, a square per day`} className="tv-heat flex flex-col gap-[3px] touch-none"
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {months.map((m) => {
              const n = new Date(year, m + 1, 0).getDate();
              return (
                <div key={m} role="row" className="grid items-center gap-[3px]" style={{ gridTemplateColumns: "16px repeat(31, minmax(0, 1fr))" }}>
                  <span className="font-sans text-[10.5px] font-medium" style={{ color: "var(--bj-ink4)" }}>{new Date(year, m, 1).toLocaleDateString(undefined, { month: "narrow" })}</span>
                  {Array.from({ length: 31 }, (_, i) => {
                    if (i >= n) return <span key={i} />;
                    const d = new Date(year, m, i + 1);
                    const list = days.get(key(d));
                    const c = dayColor(list);
                    const fut = d > today;
                    const on = inRange(d);
                    return (
                      <span key={i} role="gridcell" data-day={+d} aria-selected={on}
                        title={`${d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}${list ? ` · ${plural(list.length, "entry", "entries")}` : ""}`}
                        className="tv-sq aspect-square rounded-[3px] cursor-pointer" data-on={on ? "" : undefined}
                        style={{ background: c ?? (fut ? "transparent" : "color-mix(in oklch, var(--bj-ink) 5%, transparent)"), opacity: on ? 1 : c ? 0.42 : 1, boxShadow: fut && !c ? "inset 0 0 0 1px color-mix(in oklch, var(--bj-ink) 5%, transparent)" : undefined }} />
                    );
                  })}
                </div>
              );
            })}
          </div>
          <p className="mt-3 font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>Each square is a day, coloured by how it felt · drag across days to choose a stretch</p>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`${LABEL} mb-2.5`} style={{ color: "var(--bj-ink4)" }}>Show me</p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {ps.map((p) => (
              <button key={p.id} type="button" aria-pressed={preset === p.id}
                onClick={() => { setPreset(p.id); setRange(p.range); setReading(false); if (p.range.to.getFullYear() !== year) setYear(p.range.to.getFullYear()); }}
                className={`bj-chip h-8 px-3 rounded-full font-sans text-[12.5px] font-medium ${preset === p.id ? "bj-raised" : ""}`} data-active={preset === p.id ? "" : undefined}
                style={{ color: preset === p.id ? "var(--bj-ink)" : "var(--bj-ink3)", border: preset === p.id ? undefined : "1px solid var(--bj-line)" }}>
                {p.label}
              </button>
            ))}
            {preset === null && <span className="bj-raised h-8 px-3 rounded-full inline-flex items-center font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink)" }}>Custom</span>}
          </div>

          <div className="bj-raised rounded-[18px] px-4 md:px-5 py-4">
            <p className={LABEL} style={{ color: "var(--bj-gold)" }}>Your stretch</p>
            <p className="font-display mt-1.5" style={{ fontSize: "clamp(1.5rem, 2.6vw, 1.9rem)", lineHeight: 1.1, color: "var(--bj-ink)", fontWeight: 500 }}>{fmtRange(range, today)}</p>
            <p className="mt-1 font-sans text-[13px]" style={{ color: "var(--bj-ink4)" }}>
              {spanText} · {plural(picked.entries.length, "page")}{picked.prayers > 0 && ` · ${plural(picked.prayers, "prayer")} answered`}
            </p>
            {total > 0 && (
              <>
                <div className="flex h-2.5 rounded-full overflow-hidden gap-[2px] mt-3.5" role="img"
                  aria-label={picked.mood.map(([f, n]) => `${f} ${n}`).join(", ")}>
                  {picked.mood.map(([f, n]) => <i key={f} title={`${f} · ${n}`} style={{ flex: n, background: feelingColor(f) ?? undefined }} />)}
                </div>
                <p className="mt-2 font-sans text-[12.5px]" style={{ color: "var(--bj-ink3)" }}>
                  Mostly {picked.mood[0][0].toLowerCase()}{picked.mood[1] ? `, then ${picked.mood[1][0].toLowerCase()}` : ""}. {picked.habit}
                </p>
              </>
            )}
            {total === 0 && picked.habit && <p className="mt-2 font-sans text-[12.5px]" style={{ color: "var(--bj-ink3)" }}>{picked.habit}</p>}
            {picked.entries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" onClick={() => setReading((r) => !r)} className="bj-gold h-9 px-3.5 rounded-[11px] inline-flex items-center gap-1.5 font-sans text-[12.5px] font-semibold">
                  {reading ? <ListIcon size={14} /> : <BookOpenText size={14} />} {reading ? "Back to the list" : "Read them in order"}
                </button>
                <button type="button" onClick={exportStretch} className="bj-raised bj-lift h-9 px-3.5 rounded-[11px] inline-flex items-center gap-1.5 font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink2)" }}>
                  <Download size={14} /> Export this stretch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-[900px]">
        {picked.entries.length === 0 && <p className="font-display italic text-[17px] py-4" style={{ color: "var(--bj-ink4)" }}>Nothing written in this stretch.</p>}
        {reading
          ? picked.entries.map((e) => (
              <article key={e.id} className="py-6 border-b last:border-b-0" style={{ borderColor: "var(--bj-line-soft)" }}>
                <p className="font-sans text-[12px] flex items-center gap-2" style={{ color: "var(--bj-ink4)" }}>
                  <i className="w-[7px] h-[7px] rounded-full" style={{ background: feelingColor(e.feeling) ?? "var(--bj-ink4)" }} />
                  {e.createdAt.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · {time(e.createdAt)}{e.feeling ? ` · ${e.feeling}` : ""}
                </p>
                <button type="button" onClick={() => onOpen(e.id)} className="font-display mt-1.5 text-left hover:underline" style={{ fontSize: 28, lineHeight: 1.15, color: "var(--bj-ink)", fontWeight: 500 }}>{e.title.trim() || "Untitled"}</button>
                <p className="mt-2.5 font-display text-[18px] leading-[1.7] whitespace-pre-line" style={{ color: "var(--bj-ink2)" }}>{cachedDocText(e.content)}</p>
              </article>
            ))
          : picked.weeks.map((w) => (
              <section key={key(w.start)} className="mb-4">
                <p className={`${LABEL} mb-2`} style={{ color: "var(--bj-ink4)" }}>Week of {w.start.toLocaleDateString(undefined, { day: "numeric", month: "long" })}</p>
                <div className="flex flex-col gap-1.5">
                  {w.items.map((e) => (
                    <button key={e.id} type="button" onClick={() => onOpen(e.id)} className="bj-raised bj-lift rounded-[14px] px-3.5 py-3 flex items-start gap-3 text-left">
                      <span className="w-12 shrink-0 font-sans text-[12px] pt-0.5" style={{ color: "var(--bj-ink4)" }}>{e.createdAt.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <i className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: feelingColor(e.feeling) ?? "var(--bj-ink4)" }} />
                          <span className="font-sans text-[14px] font-medium truncate" style={{ color: "var(--bj-ink)" }}>{titleOf(e)}</span>
                        </span>
                        {excerpt(e) && <span className="block mt-0.5 font-display text-[15.5px] leading-[1.45] truncate" style={{ color: "var(--bj-ink3)" }}>{excerpt(e, 160)}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
      </div>
    </div>
  );
}
