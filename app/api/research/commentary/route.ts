import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getChapter } from "@/lib/bible-parser";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a concise biblical scholar and pastor. When given a chapter, respond with a JSON object containing exactly these keys:
- "summary": 2 sentence overview
- "themes": array of 3–4 key themes (short strings)
- "context": 2 sentence historical/literary context
- "crossRefs": array of 3 objects {ref: string, note: string} — related passages with a brief note
- "application": 1 sentence practical application
Respond with only valid JSON. No markdown fences.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { book, chapter } = await req.json();
  if (!book || !chapter) {
    return NextResponse.json({ error: "book and chapter are required" }, { status: 400 });
  }

  const verses = getChapter("ESV", book, Number(chapter));
  if (!verses?.length) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const chapterText = verses
    .map((v: { n: number; text: string }) => `[${v.n}] ${v.text}`)
    .join(" ");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ] as Parameters<typeof client.messages.create>[0]["system"],
      messages: [{ role: "user", content: `${book} ${chapter} (ESV):\n${chapterText}` }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
