import { NextResponse } from "next/server";
import { getChapter, getChapterCount } from "@/lib/bible-parser";
import { CHAPTER_COUNTS } from "@/lib/bible-books";

// Bible text never changes — cache responses for 1 year at the CDN
export const revalidate = 31536000;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ version: string; book: string; chapter: string }> }
) {
  const { version, book, chapter } = await params;
  const bookDecoded = decodeURIComponent(book);
  const chNum = parseInt(chapter, 10);
  const ver = version.toUpperCase();

  if (isNaN(chNum) || chNum < 1) {
    return NextResponse.json({ error: "Invalid chapter" }, { status: 400 });
  }

  try {
    const verses = getChapter(ver, bookDecoded, chNum);
    if (!verses) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const totalChapters = CHAPTER_COUNTS[bookDecoded] ?? getChapterCount(ver, bookDecoded);

    return NextResponse.json({
      version: ver,
      book: bookDecoded,
      chapter: chNum,
      totalChapters,
      verses,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load chapter" }, { status: 500 });
  }
}
