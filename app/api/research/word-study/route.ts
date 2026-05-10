import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a biblical scholar specialising in original languages. Respond with only valid JSON — no markdown fences — with these keys:
- "word": the word as given
- "original": {language: "Hebrew"|"Greek"|"Aramaic", term: string, transliteration: string, strongsNumber: string}
- "definition": 1–2 sentence definition
- "usageCount": approximate occurrences in the Bible (number)
- "nuances": array of 2–3 short strings describing shades of meaning
- "keyOccurrences": array of 3 {ref: string, note: string} — notable uses
- "insight": 1 sentence devotional insight`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { word, book, chapter, verse } = await req.json();
  if (!word?.trim()) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  const contextNote = book && chapter
    ? ` as used in ${book} ${chapter}${verse ? `:${verse}` : ""}`
    : "";

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 650,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ] as Parameters<typeof client.messages.create>[0]["system"],
      messages: [{ role: "user", content: `Word study: "${word}"${contextNote}` }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
