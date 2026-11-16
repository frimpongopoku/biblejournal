import { NextResponse } from "next/server";
import { getAvailableVersions, searchVerses } from "@/lib/bible-parser";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 80);
  const requested = (url.searchParams.get("version") ?? "KJV").toUpperCase();
  const version = getAvailableVersions().some((v) => v.id === requested) ? requested : "KJV";
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") ?? "8", 10) || 8));
  try {
    const results = searchVerses(version, q, limit);
    return NextResponse.json({ version, results }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch {
    return NextResponse.json({ version, results: [] }, { status: 500 });
  }
}
