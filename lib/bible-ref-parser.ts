import { PROTESTANT_BOOKS } from "./bible-books";

const ABBREVS: Record<string, string> = {
  // Pentateuch
  gen:"Genesis", exod:"Exodus", ex:"Exodus", lev:"Leviticus",
  num:"Numbers", deut:"Deuteronomy", dt:"Deuteronomy",
  // History
  josh:"Joshua", jsh:"Joshua", judg:"Judges", jdg:"Judges",
  ruth:"Ruth",
  "1sam":"1 Samuel","1 sam":"1 Samuel",
  "2sam":"2 Samuel","2 sam":"2 Samuel",
  "1kgs":"1 Kings","1 kgs":"1 Kings","1ki":"1 Kings",
  "2kgs":"2 Kings","2 kgs":"2 Kings","2ki":"2 Kings",
  "1chr":"1 Chronicles","1 chr":"1 Chronicles",
  "2chr":"2 Chronicles","2 chr":"2 Chronicles",
  ezra:"Ezra", neh:"Nehemiah", esth:"Esther", est:"Esther",
  // Poetry
  job:"Job",
  ps:"Psalms", psa:"Psalms", psalm:"Psalms", psalms:"Psalms",
  prov:"Proverbs", pro:"Proverbs",
  eccl:"Ecclesiastes", ecc:"Ecclesiastes", qoh:"Ecclesiastes",
  song:"Song of Solomon", sos:"Song of Solomon", ss:"Song of Solomon",
  // Major Prophets
  isa:"Isaiah", jer:"Jeremiah", lam:"Lamentations",
  ezek:"Ezekiel", eze:"Ezekiel", dan:"Daniel",
  // Minor Prophets
  hos:"Hosea", joel:"Joel", amos:"Amos", obad:"Obadiah",
  jonah:"Jonah", jon:"Jonah", mic:"Micah", nah:"Nahum",
  hab:"Habakkuk", zeph:"Zephaniah", hag:"Haggai",
  zech:"Zechariah", mal:"Malachi",
  // Gospels & Acts
  matt:"Matthew", mat:"Matthew",
  mark:"Mark", mk:"Mark",
  luke:"Luke", lk:"Luke",
  john:"John", jn:"John",
  acts:"Acts",
  // Pauline
  rom:"Romans",
  "1cor":"1 Corinthians","1 cor":"1 Corinthians",
  "2cor":"2 Corinthians","2 cor":"2 Corinthians",
  gal:"Galatians", eph:"Ephesians",
  phil:"Philippians", php:"Philippians",
  col:"Colossians",
  "1thess":"1 Thessalonians","1 thess":"1 Thessalonians",
  "2thess":"2 Thessalonians","2 thess":"2 Thessalonians",
  "1tim":"1 Timothy","1 tim":"1 Timothy",
  "2tim":"2 Timothy","2 tim":"2 Timothy",
  titus:"Titus", tit:"Titus",
  phlm:"Philemon", phm:"Philemon",
  heb:"Hebrews",
  // General
  jas:"James", jem:"James",
  "1pet":"1 Peter","1 pet":"1 Peter",
  "2pet":"2 Peter","2 pet":"2 Peter",
  "1john":"1 John","1 john":"1 John","1jn":"1 John",
  "2john":"2 John","2 john":"2 John","2jn":"2 John",
  "3john":"3 John","3 john":"3 John","3jn":"3 John",
  jude:"Jude", rev:"Revelation",
};

export interface ParsedRef {
  book: string;
  chapter: number;
  verse?: number;
  verseEnd?: number;
}

export function parseRef(raw: string): ParsedRef | null {
  const s = raw.trim();
  if (!s) return null;

  // Regex: optional leading digit (for "1 John", "2 Cor" etc),
  // book name, then chapter, then optional :verse or :verse-verseEnd
  const m = s.match(/^(\d\s*)?([a-z\s.]+?)\s+(\d+)(?::(\d+)(?:[-–](\d+))?)?$/i);
  if (!m) return null;

  const prefix = (m[1] ?? "").replace(/\s/, "");
  const rawBook = (prefix ? `${prefix} ` : "") + m[2].trim();
  const chapter = parseInt(m[3], 10);
  const verse = m[4] ? parseInt(m[4], 10) : undefined;
  const verseEnd = m[5] ? parseInt(m[5], 10) : undefined;

  if (isNaN(chapter) || chapter < 1) return null;

  const book = resolveBook(rawBook);
  if (!book) return null;

  return { book, chapter, verse, ...(verseEnd !== undefined && { verseEnd }) };
}

function resolveBook(raw: string): string | null {
  const lower = raw.toLowerCase().trim();

  // 1. Exact abbreviation match
  if (ABBREVS[lower]) return ABBREVS[lower];

  // 2. Prefix match on full canonical names (case-insensitive)
  const byPrefix = PROTESTANT_BOOKS.find((b) =>
    b.toLowerCase().startsWith(lower)
  );
  if (byPrefix) return byPrefix;

  // 3. Input is a prefix of an abbreviation key → resolve
  const abbrevKey = Object.keys(ABBREVS).find((k) => k.startsWith(lower) && lower.length >= 2);
  if (abbrevKey) return ABBREVS[abbrevKey];

  return null;
}


/**
 * Strict book resolution for references found in free prose: only an exact
 * book name or a known abbreviation counts (so "Is 3:4" or "Act 2:1" in a
 * sentence doesn't light up by prefix accident).
 */
export function resolveBookStrict(raw: string): string | null {
  const lower = raw.toLowerCase().replace(/\.$/, "").replace(/\s+/g, " ").trim();
  if (ABBREVS[lower]) return ABBREVS[lower];
  const nospace = lower.replace(/^(\d) /, "$1");
  if (ABBREVS[nospace]) return ABBREVS[nospace];
  return PROTESTANT_BOOKS.find((b) => b.toLowerCase() === lower) ?? null;
}

/** Matches "John 3:16", "1 Cor 13:4-7", "Ps. 23:1", "Song of Solomon 2:4". */
export const PROSE_REF_RE =
  /\b((?:[1-3]\s?)?[A-Z][a-z]+\.?(?:\s(?:of\s)?[A-Z][a-z]+)?)\s(\d{1,3}):(\d{1,3})(?:\s?[-–]\s?(\d{1,3}))?\b/g;

export function findProseRefs(text: string): { from: number; to: number; ref: ParsedRef; label: string }[] {
  const out: { from: number; to: number; ref: ParsedRef; label: string }[] = [];
  PROSE_REF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PROSE_REF_RE.exec(text))) {
    let bookRaw = m[1];
    let start = m.index;
    let book = resolveBookStrict(bookRaw);
    // "Read Song of Solomon 2:4" — the regex may swallow a leading word; retry without it.
    if (!book && bookRaw.includes(" ")) {
      const tail = bookRaw.slice(bookRaw.indexOf(" ") + 1);
      book = resolveBookStrict(tail);
      if (book) { start += bookRaw.length - tail.length; bookRaw = tail; }
    }
    if (!book) continue;
    const chapter = parseInt(m[2], 10);
    const verse = parseInt(m[3], 10);
    const verseEnd = m[4] ? parseInt(m[4], 10) : undefined;
    if (!chapter || !verse) continue;
    out.push({
      from: start,
      to: m.index + m[0].length,
      ref: { book, chapter, verse, ...(verseEnd && verseEnd > verse ? { verseEnd } : {}) },
      label: `${book} ${chapter}:${verse}${verseEnd && verseEnd > verse ? `–${verseEnd}` : ""}`,
    });
  }
  return out;
}
