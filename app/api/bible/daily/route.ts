import { NextResponse } from "next/server";
import { getChapter } from "@/lib/bible-parser";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";

// Deterministic LCG — same seed always produces the same sequence
function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export async function GET() {
  // Seed = year * 1000 + day-of-year → unique per calendar day, same for everyone
  const seed = new Date().getFullYear() * 1000 + dayOfYear();
  const rng = seededRng(seed);

  // Pick book, chapter, verse deterministically
  const book = PROTESTANT_BOOKS[Math.floor(rng() * PROTESTANT_BOOKS.length)];
  const totalChapters = CHAPTER_COUNTS[book] ?? 1;
  const chapter = Math.floor(rng() * totalChapters) + 1;

  const verses = getChapter("ESV", book, chapter);
  if (!verses || verses.length === 0) {
    // Fallback — shouldn't happen but be safe
    return NextResponse.json(
      { ref: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.", version: "ESV" },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  }

  const verse = verses[Math.floor(rng() * verses.length)];

  return NextResponse.json(
    {
      ref: `${book} ${chapter}:${verse.n}`,
      text: verse.text,
      version: "ESV",
      book,
      chapter,
      verseNum: verse.n,
    },
    {
      headers: {
        // Cache for the rest of the day — same seed = same result anyway
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    }
  );
}
