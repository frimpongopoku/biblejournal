/**
 * Turns a commentary entry (a wall of 19th-century prose) into something
 * you can scan: one key thought, a few numbered points, the original-
 * language word it turns on, and the cross-references it cites.
 *
 * Each source writes differently, so this reads their habits:
 *  - Matthew Henry: an opening line, then "I.", "II." heads with "1." and "(1.)" inside.
 *  - JFB: "phrase from the verse--explanation" glosses, one per paragraph.
 *  - Gill: "phrase from the verse,.... explanation" then more paragraphs.
 * Nothing is rewritten: every word shown is the commentator's own.
 */

import { resolveBookStrict } from "@/lib/bible-ref-parser";

export interface ShapedPoint { lead: string; body: string; phrase?: string }
export interface ShapedRef { label: string; book: string; chapter: number; verse: number; endVerse?: number }
export interface ShapedWord { word: string; context: string }
export interface Shaped {
  key: string;
  points: ShapedPoint[];
  word: ShapedWord | null;
  refs: ShapedRef[];
  /** A single line for scanning the chapter. */
  lede: string;
}

// The abbreviations the public-domain commentaries use ("Joh 15:6", "1Co 13:4").
const SWORD: Record<string, string> = {
  gen: "Genesis", exo: "Exodus", lev: "Leviticus", num: "Numbers", deu: "Deuteronomy", jos: "Joshua", jdg: "Judges", rut: "Ruth",
  "1sa": "1 Samuel", "2sa": "2 Samuel", "1ki": "1 Kings", "2ki": "2 Kings", "1ch": "1 Chronicles", "2ch": "2 Chronicles",
  ezr: "Ezra", neh: "Nehemiah", est: "Esther", job: "Job", psa: "Psalms", pro: "Proverbs", ecc: "Ecclesiastes", son: "Song of Solomon",
  isa: "Isaiah", jer: "Jeremiah", lam: "Lamentations", eze: "Ezekiel", dan: "Daniel", hos: "Hosea", joe: "Joel", amo: "Amos",
  oba: "Obadiah", jon: "Jonah", mic: "Micah", nah: "Nahum", hab: "Habakkuk", zep: "Zephaniah", hag: "Haggai", zec: "Zechariah", mal: "Malachi",
  mat: "Matthew", mar: "Mark", luk: "Luke", joh: "John", act: "Acts", rom: "Romans", "1co": "1 Corinthians", "2co": "2 Corinthians",
  gal: "Galatians", eph: "Ephesians", phi: "Philippians", col: "Colossians", "1th": "1 Thessalonians", "2th": "2 Thessalonians",
  "1ti": "1 Timothy", "2ti": "2 Timothy", tit: "Titus", phm: "Philemon", heb: "Hebrews", jam: "James", "1pe": "1 Peter", "2pe": "2 Peter",
  "1jo": "1 John", "2jo": "2 John", "3jo": "3 John", jud: "Jude", rev: "Revelation",
};

const REF_RE = /\b((?:[1-3]\s?)?[A-Z][a-z]{1,}\.?(?:\s(?:of\s)?[A-Z][a-z]+)?)\s(\d{1,3}):(\d{1,3})(?:\s?[-–]\s?(\d{1,3}))?/g;

function resolveBook(raw: string): string | null {
  const k = raw.toLowerCase().replace(/\.$/, "").replace(/\s+/g, "");
  return SWORD[k] ?? resolveBookStrict(raw);
}

export function commentaryRefs(text: string, skip?: { book: string; chapter: number }): ShapedRef[] {
  const out: ShapedRef[] = [];
  const seen = new Set<string>();
  REF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = REF_RE.exec(text))) {
    const book = resolveBook(m[1]);
    if (!book) continue;
    const chapter = +m[2], verse = +m[3], end = m[4] ? +m[4] : undefined;
    if (skip && book === skip.book && chapter === skip.chapter) continue;
    const label = `${book} ${chapter}:${verse}${end && end > verse ? `–${end}` : ""}`;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, book, chapter, verse, ...(end && end > verse ? { endVerse: end } : {}) });
  }
  return out;
}

const clean = (s: string) => s.replace(/\s+/g, " ").replace(/\s([,.;:])/g, "$1").trim();

/** Sentences, without splitting on "v. 4", "ch. 3", "Dr. Lightfoot", "&c." */
export function sentences(text: string): string[] {
  const guarded = clean(text)
    .replace(/\b(v|vv|ch|Dr|Mr|St|viz|i\.e|e\.g|cf|ver|comp)\./gi, "$1․")
    .replace(/&c\./g, "&c․")
    .replace(/(\d)\.(\d)/g, "$1․$2");
  const parts = guarded.match(/[^.!?]+(?:[.!?]+["”’)]*|$)/g) ?? [guarded];
  return parts.map((p) => p.replace(/․/g, ".").trim()).filter(Boolean);
}

function firstSentence(text: string, max = 200) {
  const s = sentences(text)[0] ?? clean(text);
  if (s.length <= max) return s;
  // Long periodic sentences usually turn on a semicolon: keep the first clause.
  const semi = s.slice(40, max).search(/[;:]/);
  if (semi >= 0) return `${s.slice(0, 40 + semi).trim()}.`;
  return `${s.slice(0, max).replace(/\s\S*$/, "")}…`;
}

function split(text: string, lead = 1): ShapedPoint {
  const ss = sentences(text);
  return { lead: ss.slice(0, lead).join(" "), body: ss.slice(lead).join(" ") };
}

const GREEK_HEBREW = /[Ͱ-Ͽἀ-῿֐-׿][Ͱ-Ͽἀ-῿֐-׿̀-ͯ\s'’]*[Ͱ-Ͽἀ-῿֐-׿]|[Ͱ-Ͽἀ-῿֐-׿]/;

function findWord(text: string): ShapedWord | null {
  const m = text.match(GREEK_HEBREW);
  if (m && m.index != null) {
    const word = m[0].trim();
    const sent = sentences(text).find((s) => s.includes(word)) ?? "";
    return { word, context: clean(sent.replace(word, "…")).slice(0, 180) };
  }
  // "the word "Orla"" / "the Greek word ... signifies"
  const q = text.match(/\b(?:Greek|Hebrew)\s+word,?\s+["“]([^"”]{2,30})["”]/i) ?? text.match(/\bthe word\s+["“]([^"”]{2,24})["”]\s+(?:signifies|means|denotes|properly)/i);
  if (q && q.index != null) {
    const sent = sentences(text).find((s) => s.includes(q[1])) ?? "";
    return { word: q[1], context: clean(sent).slice(0, 180) };
  }
  return null;
}

function shapeHenry(text: string): { key: string; points: ShapedPoint[] } | null {
  // Main heads: "I." "II." at line starts (or after the intro sentence).
  const heads = text.split(/\n\s*(?=(?:[IVX]{1,4})\.\s)/);
  if (heads.length < 2) {
    const nums = text.split(/\s(?=\d{1,2}\.\s[A-Z])/);
    if (nums.length < 3) return null;
    return { key: firstSentence(nums[0]), points: nums.slice(1, 5).map((p) => split(p.replace(/^\d{1,2}\.\s/, ""))) };
  }
  const intro = clean(heads[0]).replace(/\s*(Observe|Note|Here observe)[^.]*,\s*$/i, "").replace(/[,:;]\s*$/, ".");
  const points = heads.slice(1, 6).map((h) => {
    const body = h.replace(/^[IVX]{1,4}\.\s*/, "");
    // The head itself often ends at the first "1." sub-point.
    const [head, ...rest] = body.split(/\s(?=1\.\s)/);
    const ss = sentences(head);
    return { lead: ss[0] ?? clean(head), body: [...ss.slice(1), rest.join(" ")].join(" ").trim() };
  });
  return { key: firstSentence(intro), points };
}

function shapeJfb(text: string): { key: string; points: ShapedPoint[] } | null {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const glosses = paras.map((p) => {
    const i = p.indexOf("--");
    if (i < 0 || i > 160) return null;
    return { phrase: clean(p.slice(0, i)), rest: clean(p.slice(i + 2)) };
  });
  if (!glosses.some(Boolean)) return null;
  const pts: ShapedPoint[] = glosses.map((g, i) => g
    ? { phrase: g.phrase, ...split(g.rest) }
    : split(paras[i]));
  const lead = pts.find((p) => p.lead.length > 30) ?? pts[0];
  return { key: firstSentence(`${lead.lead} ${lead.body}`), points: pts.length > 1 ? pts : [] };
}

function shapeGill(text: string): { key: string; points: ShapedPoint[] } | null {
  // Drop Gill's footnotes: "(g) Vid. ...", "(p) Misn. ..."
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^\([a-z]\d?\)\s/.test(p));
  const first = paras[0] ?? "";
  const i = first.indexOf(",....");
  if (i < 0) return null;
  const pts: ShapedPoint[] = [{ phrase: clean(first.slice(0, i)), ...split(first.slice(i + 5)) }];
  for (const p of paras.slice(1)) {
    const semi = p.search(/[;:]/);
    if (semi > 0 && semi < 120 && p[0] === p[0].toLowerCase()) pts.push({ phrase: clean(p.slice(0, semi)), ...split(p.slice(semi + 1)) });
    else pts.push(split(p));
  }
  return { key: firstSentence(`${pts[0].lead}`), points: pts };
}

const cache = new Map<string, Shaped>();

export function shapeCommentary(text: string, source: string, here?: { book: string; chapter: number }): Shaped {
  const k = `${source}\u0000${text.length}\u0000${text.slice(0, 80)}`;
  const hit = cache.get(k);
  if (hit) return hit;

  const shaped: { key: string; points: ShapedPoint[] } =
    (source === "matthew-henry" ? shapeHenry(text) : source === "jamieson-fausset-brown" ? shapeJfb(text) : source === "john-gill" ? shapeGill(text) : null)
    ?? shapeHenry(text) ?? shapeJfb(text) ?? shapeGill(text)
    ?? (() => {
      const paras = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter((p) => p.length > 20);
      const ss = sentences(text);
      return {
        key: ss[0] ?? clean(text),
        points: paras.length > 1 ? paras.slice(0, 4).map((p) => split(p)) : chunk(ss.slice(1), 2).slice(0, 4).map((c) => ({ lead: c[0], body: c.slice(1).join(" ") })),
      };
    })();

  // Don't repeat the key thought as a point; drop scraps.
  const keyStem = shaped.key.replace(/[….]+$/, "").slice(0, 60);
  const points = shaped.points
    .map((p) => {
      if (!p.lead.startsWith(keyStem)) return p;
      const rest = sentences(p.body);
      return { ...p, lead: rest[0] ?? "", body: rest.slice(1).join(" ") };
    })
    .filter((p) => (p.phrase && p.lead) || p.lead.length >= 28)
    .slice(0, 6);

  const out: Shaped = {
    key: shaped.key.charAt(0).toUpperCase() + shaped.key.slice(1),
    points,
    word: findWord(text),
    refs: commentaryRefs(text, here).slice(0, 8),
    lede: firstSentence(shaped.key, 120),
  };
  cache.set(k, out);
  return out;
}

function chunk<T>(a: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
  return out;
}
