import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getChapter } from "@/lib/bible-parser";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { book, chapter } = await req.json();
  if (!book || !chapter) {
    return NextResponse.json({ error: "book and chapter are required" }, { status: 400 });
  }

  const verses = getChapter("ESV", book, Number(chapter));
  if (!verses || verses.length === 0) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const chapterText = verses
    .map((v: { n: number; text: string }) => `[${v.n}] ${v.text}`)
    .join("\n");

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a biblical scholar and pastor. Provide a concise but insightful commentary on ${book} chapter ${chapter} (ESV). Structure your response as JSON with these keys:
- "summary": 2–3 sentence overview of the chapter
- "themes": array of 3–5 key themes (strings)
- "context": 2–3 sentences of historical/literary context
- "crossRefs": array of 3–5 related passages (e.g. "Romans 8:28") with a brief note for each as { ref: string, note: string }
- "application": 1–2 sentences of practical application

Here is the chapter text:
${chapterText}

Respond with only valid JSON, no markdown fences.`,
      },
    ],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  try {
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
  }
}
