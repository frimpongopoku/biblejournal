import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { vectorSearch, isIndexReady } from "@/lib/bible-search";

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { question } = await req.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // Semantic vector search — falls back to empty if index not built yet
  const results = await vectorSearch(question, 8);
  const passageBlock = results.length > 0
    ? results.map((p) => `[${p.ref}] "${p.text}"`).join("\n")
    : "No indexed passages available. Answer from general biblical knowledge.";

  const indexNote = isIndexReady()
    ? ""
    : "\n\n(Vector index not built yet — run `npx tsx scripts/embed-bible.ts` to enable semantic search.)";

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "You are a biblical scholar. Answer questions about the Bible faithfully, citing scripture. Be concise and pastoral.",
    messages: [
      {
        role: "user",
        content: `Question: ${question}

Semantically relevant passages:
${passageBlock}

Respond as JSON with keys:
- "answer": 2–4 paragraph answer, citing specific verses inline like (John 3:16)
- "keyVerses": array of { ref: string, text: string } — 2–4 most relevant verses
- "furtherReading": array of book+chapter strings for deeper study (e.g. "Romans 8")
- "indexReady": ${isIndexReady()}

Respond with only valid JSON, no markdown fences.`,
      },
    ],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json({ ...parsed, _note: indexNote.trim() || undefined });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
  }
}
