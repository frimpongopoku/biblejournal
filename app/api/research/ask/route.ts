import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getChapter } from "@/lib/bible-parser";
import { vectorSearch, isIndexReady } from "@/lib/bible-search";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a faithful biblical scholar. Answer questions about Scripture concisely and pastorally, citing verses inline like (John 3:16). Respond with only valid JSON — no markdown fences — with these keys:
- "answer": 2–3 paragraph answer with inline verse citations
- "keyVerses": array of 2–3 {ref: string, text: string} — the most relevant verses
- "furtherReading": array of 2–3 book+chapter strings like "Romans 8"`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { question, version = "ESV" } = await req.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const ver = String(version).toUpperCase();

  // Semantic search on ESV index, then re-fetch passages in the preferred version
  const hits = await vectorSearch(question, 6);
  const context = hits.length > 0
    ? hits.map((h) => {
        // Re-fetch in the preferred version using the chunk's location metadata
        const chVerses = getChapter(ver, h.book, h.chapter);
        const slice = chVerses
          ?.filter((v) => v.n >= h.startVerse && v.n <= h.endVerse)
          .map((v) => `[${v.n}] ${v.text}`)
          .join(" ") ?? h.text; // fallback to ESV index text
        return `[${h.ref}] "${slice}"`;
      }).join("\n")
    : "(No index available — answer from general biblical knowledge.)";

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 750,
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      ] as Parameters<typeof client.messages.create>[0]["system"],
      messages: [{
        role: "user",
        content: `Question: ${question}\n\nRelevant passages (${ver}):\n${context}`,
      }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
    const parsed = JSON.parse(raw);
    return NextResponse.json({ ...parsed, semanticSearch: isIndexReady(), version: ver });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
