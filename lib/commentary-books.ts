import { PROTESTANT_BOOKS } from "@/lib/bible-books";

// Free Use Bible API (bible.helloao.org) book ids, in the same canonical
// 66-book order as PROTESTANT_BOOKS — index-aligned, verified against
// /api/c/{commentary}/books.json.
const COMMENTARY_BOOK_IDS = [
  "GEN", "EXO", "LEV", "NUM", "DEU",
  "JOS", "JDG", "RUT", "1SA", "2SA",
  "1KI", "2KI", "1CH", "2CH",
  "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
  "ECC", "SNG", "ISA", "JER",
  "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
  "OBA", "JON", "MIC", "NAM", "HAB", "ZEP",
  "HAG", "ZEC", "MAL",
  "MAT", "MRK", "LUK", "JHN", "ACT",
  "ROM", "1CO", "2CO", "GAL", "EPH",
  "PHP", "COL", "1TH", "2TH",
  "1TI", "2TI", "TIT", "PHM", "HEB",
  "JAS", "1PE", "2PE", "1JN", "2JN",
  "3JN", "JUD", "REV",
] as const;

const BOOK_TO_ID: Record<string, string> = Object.fromEntries(
  PROTESTANT_BOOKS.map((name, i) => [name, COMMENTARY_BOOK_IDS[i]])
);

export function bookToCommentaryId(book: string): string | null {
  return BOOK_TO_ID[book] ?? null;
}
