import { NextResponse } from "next/server";
import { extractYouTubeId } from "@/lib/youtube-parser";

/** Title and channel for a YouTube link, via YouTube's public oEmbed endpoint. */
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url") ?? "";
  const id = extractYouTubeId(url);
  if (!id) return NextResponse.json({ error: "Not a YouTube link" }, { status: 400 });
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return NextResponse.json({ id, title: "", author: "" });
    const data = (await res.json()) as { title?: string; author_name?: string };
    return NextResponse.json({ id, title: data.title ?? "", author: data.author_name ?? "" });
  } catch {
    return NextResponse.json({ id, title: "", author: "" });
  }
}
