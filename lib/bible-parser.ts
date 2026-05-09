import { readFileSync } from "fs";
import { join } from "path";
import { XMLParser } from "fast-xml-parser";
import { PROTESTANT_BOOKS, OSIS_ID_TO_NAME } from "./bible-books";

export interface BibleVerse {
  n: number;
  text: string;
}

// version → book → chapter → verses
type BibleCache = Map<string, Map<string, Map<number, BibleVerse[]>>>;
const cache: BibleCache = new Map();

const AVAILABLE: Record<string, string> = {
  AMP: "Amplified Bible",
  ASV: "American Standard Version",
  ESV: "English Standard Version",
  KJV: "King James Version",
  MSG: "The Message",
  NIV: "New International Version",
  NKJV: "New King James Version",
  NLT: "New Living Translation",
};

export function getAvailableVersions() {
  return Object.entries(AVAILABLE).map(([id, name]) => ({ id, name }));
}

function xmlPath(version: string) {
  return join(process.cwd(), "bibles", `${version}.xml`);
}

function makeParser(options: object = {}) {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    isArray: (tagName: string) => {
      return ["b", "c", "v", "book", "chapter", "verse", "BIBLEBOOK", "CHAPTER", "VERS", "div"].includes(tagName);
    },
    ...options,
  });
}

function ensureArray<T>(v: T | T[]): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function cleanText(t: unknown): string {
  if (typeof t === "string") return t.trim();
  if (typeof t === "number") return String(t);
  return "";
}

// ── Format A: <bible><b n="Book"><c n="1"><v n="1">text</v> ──────────────
function parseFormatA(xml: string): Map<string, Map<number, BibleVerse[]>> {
  const parser = makeParser();
  const root = parser.parse(xml);
  const books: Map<string, Map<number, BibleVerse[]>> = new Map();

  for (const b of ensureArray(root?.bible?.b)) {
    const bookName = cleanText(b["@_n"]);
    if (!bookName) continue;
    const chapters: Map<number, BibleVerse[]> = new Map();

    for (const c of ensureArray(b.c)) {
      const chNum = parseInt(c["@_n"], 10);
      const verses: BibleVerse[] = [];
      for (const v of ensureArray(c.v)) {
        const n = parseInt(v["@_n"], 10);
        const text = cleanText(v["#text"]);
        if (!isNaN(n) && text) verses.push({ n, text });
      }
      if (verses.length) chapters.set(chNum, verses);
    }
    if (chapters.size) books.set(bookName, chapters);
  }
  return books;
}

// ── Format B: <testament><book number="N"><chapter number="N"><verse number="N"> ─
function parseFormatB(xml: string): Map<string, Map<number, BibleVerse[]>> {
  const parser = makeParser();
  const root = parser.parse(xml);
  const books: Map<string, Map<number, BibleVerse[]>> = new Map();

  const testaments = ensureArray(root?.bible?.testament);
  for (const testament of testaments) {
    for (const book of ensureArray(testament.book)) {
      const bookNum = parseInt(book["@_number"], 10);
      const bookName = book["@_name"] ?? PROTESTANT_BOOKS[bookNum - 1];
      if (!bookName) continue;
      const chapters: Map<number, BibleVerse[]> = new Map();

      for (const ch of ensureArray(book.chapter)) {
        const chNum = parseInt(ch["@_number"], 10);
        const verses: BibleVerse[] = [];
        for (const v of ensureArray(ch.verse)) {
          const n = parseInt(v["@_number"], 10);
          const text = cleanText(v["#text"]);
          if (!isNaN(n) && text) verses.push({ n, text });
        }
        if (verses.length) chapters.set(chNum, verses);
      }
      if (chapters.size) books.set(bookName, chapters);
    }
  }
  return books;
}

// ── Format C: <XMLBIBLE><BIBLEBOOK bname="Genesis"><CHAPTER cnumber="1"><VERS vnumber="1"> ─
function parseFormatC(xml: string): Map<string, Map<number, BibleVerse[]>> {
  const parser = makeParser();
  const root = parser.parse(xml);
  const books: Map<string, Map<number, BibleVerse[]>> = new Map();

  for (const bb of ensureArray(root?.XMLBIBLE?.BIBLEBOOK)) {
    const bookName = cleanText(bb["@_bname"]);
    if (!bookName) continue;
    const chapters: Map<number, BibleVerse[]> = new Map();

    for (const ch of ensureArray(bb.CHAPTER)) {
      const chNum = parseInt(ch["@_cnumber"], 10);
      const verses: BibleVerse[] = [];
      for (const v of ensureArray(ch.VERS)) {
        const n = parseInt(v["@_vnumber"], 10);
        const text = cleanText(v["#text"]);
        if (!isNaN(n) && text) verses.push({ n, text });
      }
      if (verses.length) chapters.set(chNum, verses);
    }
    if (chapters.size) books.set(bookName, chapters);
  }
  return books;
}

// ── Format D: OSIS <osis><osisText><div type='book' osisID='Gen'><chapter osisID='Gen.1'><verse ...> ─
function parseFormatD(xml: string): Map<string, Map<number, BibleVerse[]>> {
  // Strip namespace to keep parsing simple
  const stripped = xml.replace(/\sxmlns[^"]*"[^"]*"/g, "").replace(/\sxsi:[^=]+="[^"]*"/g, "");
  const parser = makeParser();
  const root = parser.parse(stripped);
  const books: Map<string, Map<number, BibleVerse[]>> = new Map();

  const osisText = root?.osis?.osisText;
  if (!osisText) return books;

  for (const div of ensureArray(osisText.div)) {
    if (div["@_type"] !== "book") continue;
    const osisId = (div["@_osisID"] ?? "").split(".")[0];
    const bookName = OSIS_ID_TO_NAME[osisId];
    if (!bookName) continue;
    const chapters: Map<number, BibleVerse[]> = new Map();

    for (const ch of ensureArray(div.chapter)) {
      const chRef = ch["@_osisID"] ?? ""; // e.g. "Gen.1"
      const chNum = parseInt(chRef.split(".")[1] ?? "0", 10);
      const verses: BibleVerse[] = [];
      for (const v of ensureArray(ch.verse)) {
        const ref = v["@_osisID"] ?? ""; // e.g. "Gen.1.1"
        const n = parseInt(ref.split(".")[2] ?? "0", 10);
        const text = cleanText(v["#text"]);
        if (!isNaN(n) && n > 0 && text) verses.push({ n, text });
      }
      if (verses.length) chapters.set(chNum, verses);
    }
    if (chapters.size) books.set(bookName, chapters);
  }
  return books;
}

function detectFormat(xml: string): "A" | "B" | "C" | "D" {
  if (xml.includes("<osis") || xml.includes("<OSIS")) return "D";
  if (xml.includes("<XMLBIBLE") || xml.includes("<BIBLEBOOK")) return "C";
  if (xml.includes("<testament") || xml.includes("<book number")) return "B";
  return "A";
}

function loadBible(version: string): Map<string, Map<number, BibleVerse[]>> {
  const xml = readFileSync(xmlPath(version), "utf-8");
  const fmt = detectFormat(xml);
  if (fmt === "A") return parseFormatA(xml);
  if (fmt === "B") return parseFormatB(xml);
  if (fmt === "C") return parseFormatC(xml);
  return parseFormatD(xml);
}

function getBible(version: string): Map<string, Map<number, BibleVerse[]>> {
  if (!cache.has(version)) {
    cache.set(version, loadBible(version));
  }
  return cache.get(version)!;
}

export function getBooks(version: string): string[] {
  const bible = getBible(version);
  // Return in canonical order
  return PROTESTANT_BOOKS.filter((b) => bible.has(b));
}

export function getChapter(
  version: string,
  book: string,
  chapter: number
): BibleVerse[] | null {
  const bible = getBible(version);
  return bible.get(book)?.get(chapter) ?? null;
}

export function getChapterCount(version: string, book: string): number {
  const bible = getBible(version);
  return bible.get(book)?.size ?? 0;
}
