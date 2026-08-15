import { NextResponse } from "next/server";
import { bookToCommentaryId } from "@/lib/commentary-books";
import { isCommentarySource, commentarySource } from "@/lib/commentary-sources";

// Commentary text is public-domain and static — cache for a year at the CDN.
export const revalidate = 31536000;

interface UpstreamEntry {
  type: string;
  number?: number;
  content?: string[];
}

interface UpstreamChapter {
  commentary: { name: string; licenseUrl?: string };
  chapter: { introduction?: string | null; content: UpstreamEntry[] };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ commentary: string; book: string; chapter: string }> }
) {
  const { commentary, book, chapter } = await params;

  if (!isCommentarySource(commentary)) {
    return NextResponse.json({ error: "Unknown commentary source" }, { status: 400 });
  }

  const bookDecoded = decodeURIComponent(book);
  const bookId = bookToCommentaryId(bookDecoded);
  const chNum = parseInt(chapter, 10);

  if (!bookId || isNaN(chNum) || chNum < 1) {
    return NextResponse.json({ error: "Invalid book or chapter" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://bible.helloao.org/api/c/${commentary}/${bookId}/${chNum}.json`,
      { next: { revalidate: 31536000 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `${commentarySource(commentary)?.label} has no commentary for this chapter.` },
        { status: 404 }
      );
    }

    const data: UpstreamChapter = await res.json();
    const verseEntries = data.chapter.content.filter(
      (e): e is UpstreamEntry & { number: number } => e.type === "verse" && typeof e.number === "number"
    );

    const entries = verseEntries.map((e, i) => ({
      verse: e.number,
      endVerse: i + 1 < verseEntries.length ? verseEntries[i + 1].number - 1 : null,
      text: (e.content ?? []).join("\n\n"),
    }));

    return NextResponse.json({
      commentary,
      commentaryName: data.commentary.name,
      licenseUrl: data.commentary.licenseUrl ?? null,
      book: bookDecoded,
      chapter: chNum,
      introduction: data.chapter.introduction ?? null,
      entries,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load commentary" }, { status: 500 });
  }
}
