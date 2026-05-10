import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { word, book, chapter, verse } = await req.json();
  if (!word?.trim()) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  const contextNote = book && chapter
    ? ` as used in ${book} ${chapter}${verse ? `:${verse}` : ""}`
    : "";

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Provide a biblical word study for the word "${word}"${contextNote}.

Respond as JSON with keys:
- "word": the word as given
- "original": { "language": "Hebrew" | "Greek" | "Aramaic", "term": string, "transliteration": string, "strongsNumber": string }
- "definition": concise definition (1–2 sentences)
- "usageCount": approximate number of times this word/root appears in the Bible
- "nuances": array of 2–4 strings describing shades of meaning or translation nuances
- "keyOccurrences": array of 3–5 { ref: string, note: string } showing notable uses
- "insight": 1–2 sentences of devotional/theological insight

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
