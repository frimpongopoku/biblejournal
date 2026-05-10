import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getChapter } from "@/lib/bible-parser";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";

// Simple keyword search across all ESV verses — returns top matching verses
function keywordSearch(query: string, limit = 12): { ref: string; text: string }[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  if (terms.length === 0) return [];

  const results: { ref: string; text: string; score: number }[] = [];

  for (const book of PROTESTANT_BOOKS) {
    const total = CHAPTER_COUNTS[book] ?? 1;
    for (let ch = 1; ch <= total; ch++) {
      const verses = getChapter("ESV", book, ch);
      if (!verses) continue;
      for (const v of verses) {
        const lower = v.text.toLowerCase();
        const score = terms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);
        if (score > 0) {
          results.push({ ref: `${book} ${ch}:${v.n}`, text: v.text, score });
        }
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ ref, text }) => ({ ref, text }));
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { question } = await req.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const passages = keywordSearch(question);
  const passageBlock = passages.length > 0
    ? passages.map((p) => `[${p.ref}] "${p.text}"`).join("\n")
    : "No direct keyword matches found. Answer from general biblical knowledge.";

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "You are a biblical scholar. Answer questions about the Bible faithfully, citing scripture. Be concise and pastoral.",
    messages: [
      {
        role: "user",
        content: `Question: ${question}

Relevant passages found:
${passageBlock}

Respond as JSON with keys:
- "answer": 2–4 paragraph answer, citing specific verses inline like (John 3:16)
- "keyVerses": array of { ref: string, text: string } — 2–4 most relevant verses
- "furtherReading": array of book chapter strings for deeper study (e.g. "Romans 8")

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
