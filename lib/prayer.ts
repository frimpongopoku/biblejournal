import type { Prayer, PrayerLogEntry } from "@/types";

const DAY = 86_400_000;

export function startOfDay(t = Date.now()): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const logOf = (p: Prayer): PrayerLogEntry[] => p.log ?? [];

export function lastPrayed(p: Prayer): number {
  const log = logOf(p);
  return log.length ? Math.max(...log.map((e) => e.at)) : 0;
}

export function prayedToday(p: Prayer): boolean {
  return lastPrayed(p) >= startOfDay();
}

/** Whole days since it was first brought, counting the first day as day 1. */
export function dayNumber(p: Prayer, now = Date.now()): number {
  return Math.max(1, Math.floor((startOfDay(now) - startOfDay(p.createdAt.getTime())) / DAY) + 1);
}

/** How many to pray each day so everything comes round about once a week. */
export function perDayFor(activeCount: number, setting: number): number {
  if (setting > 0) return Math.min(setting, activeCount);
  return Math.min(activeCount, Math.max(4, Math.ceil(activeCount / 7)));
}

/**
 * Today's few: what you've already prayed today stays in the list (marked),
 * the rest are the ones you've gone longest without praying.
 */
export function todaysPrayers(active: Prayer[], setting: number): Prayer[] {
  const count = perDayFor(active.length, setting);
  const done = active.filter(prayedToday);
  const waiting = active
    .filter((p) => !prayedToday(p))
    .sort((a, b) => lastPrayed(a) - lastPrayed(b) || a.createdAt.getTime() - b.createdAt.getTime());
  return [...done, ...waiting].slice(0, Math.max(count, done.length));
}

/** One boolean per day, oldest first, ending today. */
export function prayedDays(p: Prayer, days: number): boolean[] {
  const today = startOfDay();
  const set = new Set(logOf(p).map((e) => startOfDay(e.at)));
  return Array.from({ length: days }, (_, i) => set.has(today - (days - 1 - i) * DAY));
}

export function lastWords(p: Prayer): string {
  const log = logOf(p);
  for (let i = log.length - 1; i >= 0; i--) if (log[i].text) return log[i].text;
  return "";
}

export function waitedDays(p: Prayer): number {
  const end = (p.answeredAt ?? p.updatedAt).getTime();
  return Math.max(1, Math.round((end - p.createdAt.getTime()) / DAY));
}

export function shortDate(t: number | Date, withYear = false): string {
  const d = typeof t === "number" ? new Date(t) : t;
  const today = startOfDay();
  const day = startOfDay(d.getTime());
  if (day === today) return "Today";
  if (day === today - DAY) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: withYear ? undefined : "short", day: "numeric", month: "short",
    year: withYear || d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function initialOf(name: string): string {
  const seg = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(name.trim()), (s) => s.segment)
    : Array.from(name.trim());
  return (seg[0] ?? "").toUpperCase();
}

const HUES = ["var(--bj-sage)", "oklch(70% 0.09 240)", "oklch(70% 0.09 295)", "var(--bj-gold)", "oklch(68% 0.1 15)", "oklch(70% 0.09 190)"];
/** A steady colour per person, so Mum is always the same colour. */
export function hueFor(name: string): string {
  let h = 0;
  for (const ch of name.trim().toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HUES[h % HUES.length];
}

// ── Body: stored as TipTap JSON so every other surface keeps working ──

export function docToText(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const doc = JSON.parse(raw);
    const blocks: string[] = [];
    const inline = (n: { type?: string; text?: string; content?: unknown[] }): string =>
      n.type === "text" ? n.text ?? "" : n.type === "hardBreak" ? "\n" : (n.content ?? []).map((c) => inline(c as typeof n)).join("");
    const walk = (n: { type?: string; content?: unknown[] }) => {
      const kids = (n.content ?? []) as { type?: string; content?: unknown[] }[];
      if (kids.some((k) => k.type === "text" || k.type === "hardBreak")) blocks.push(inline(n));
      else kids.forEach(walk);
    };
    walk(doc);
    return blocks.join("\n\n").trim();
  } catch {
    return raw;
  }
}

export function textToDoc(text: string): string {
  const paras = text.split(/\n{2,}/);
  return JSON.stringify({
    type: "doc",
    content: paras.map((p) => {
      const lines = p.split("\n");
      const content = lines.flatMap((l, i) => [...(i ? [{ type: "hardBreak" }] : []), ...(l ? [{ type: "text", text: l }] : [])]);
      return content.length ? { type: "paragraph", content } : { type: "paragraph" };
    }),
  });
}
