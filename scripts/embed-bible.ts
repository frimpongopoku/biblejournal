/**
 * One-time ingestion script: chunks ESV into 5-verse passages, embeds with
 * Voyage AI, and writes data/bible-index.json + data/bible-embeddings.bin.
 *
 * Run: npx tsx scripts/embed-bible.ts
 * Needs: VOYAGEAI_API_KEY in env (or prefix: VOYAGEAI_API_KEY=sk-... npx tsx ...)
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { XMLParser } from "fast-xml-parser";

const VOYAGE_MODEL = "voyage-3-lite";   // 512 dims — ~20 MB for ~10k chunks
const CHUNK_SIZE   = 5;                 // verses per chunk
const CHUNK_STEP   = 3;                 // step between chunk starts (2-verse overlap)
const BATCH_SIZE   = 30;               // inputs per request (keeps tokens under 10K TPM free limit)
const RETRY_DELAY  = 22_000;           // ms to wait on 429 before retry (free tier: 3 RPM)

interface BibleVerse { n: number; text: string }
interface ChunkMeta {
  ref: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  text: string;
}

// ── Parse ESV (Format A) ──────────────────────────────────

function parseESV(): Map<string, Map<number, BibleVerse[]>> {
  const xml = readFileSync(join(process.cwd(), "bibles", "ESV.xml"), "latin1");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    isArray: (tag: string) => ["b", "c", "v"].includes(tag),
  });
  const root = parser.parse(xml);
  const books: Map<string, Map<number, BibleVerse[]>> = new Map();

  for (const b of (root?.bible?.b ?? [])) {
    const bookName = String(b["@_n"] ?? "").trim();
    if (!bookName) continue;
    const chapters: Map<number, BibleVerse[]> = new Map();

    for (const c of (b.c ?? [])) {
      const chNum = parseInt(c["@_n"], 10);
      const verses: BibleVerse[] = [];
      for (const v of (c.v ?? [])) {
        const n = parseInt(v["@_n"], 10);
        const text = typeof v["#text"] === "string" ? v["#text"].trim()
          : typeof v["#text"] === "number" ? String(v["#text"]) : "";
        if (!isNaN(n) && text) verses.push({ n, text });
      }
      if (verses.length) chapters.set(chNum, verses);
    }
    if (chapters.size) books.set(bookName, chapters);
  }
  return books;
}

// ── Build chunks ──────────────────────────────────────────

function buildChunks(bible: Map<string, Map<number, BibleVerse[]>>): ChunkMeta[] {
  const chunks: ChunkMeta[] = [];

  for (const [book, chapters] of bible) {
    for (const [chNum, verses] of chapters) {
      for (let i = 0; i < verses.length; i += CHUNK_STEP) {
        const slice = verses.slice(i, i + CHUNK_SIZE);
        if (slice.length === 0) break;
        const start = slice[0].n;
        const end = slice[slice.length - 1].n;
        const ref = end > start ? `${book} ${chNum}:${start}–${end}` : `${book} ${chNum}:${start}`;
        const text = slice.map((v) => `[${v.n}] ${v.text}`).join(" ");
        chunks.push({ ref, book, chapter: chNum, startVerse: start, endVerse: end, text });
      }
    }
  }
  return chunks;
}

// ── Voyage AI embedding ───────────────────────────────────

async function embedBatch(texts: string[], apiKey: string, attempt = 0): Promise<number[][]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: texts, model: VOYAGE_MODEL, input_type: "document" }),
  });

  if (res.status === 429) {
    if (attempt >= 8) throw new Error("Voyage API rate limit exceeded after 8 retries. Add a payment method at dashboard.voyageai.com to unlock standard rate limits.");
    const wait = RETRY_DELAY * (attempt + 1);
    process.stdout.write(`\r  Rate limited — waiting ${(wait / 1000).toFixed(0)}s… (attempt ${attempt + 1})   `);
    await new Promise((r) => setTimeout(r, wait));
    return embedBatch(texts, apiKey, attempt + 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage API error ${res.status}: ${err}`);
  }
  const data = await res.json() as { data: { embedding: number[] }[] };
  return data.data.map((d) => d.embedding);
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.VOYAGEAI_API_KEY;
  if (!apiKey) {
    console.error("Missing VOYAGEAI_API_KEY env variable.");
    process.exit(1);
  }

  const outIndex = join(process.cwd(), "data", "bible-index.json");
  const outEmb   = join(process.cwd(), "data", "bible-embeddings.bin");

  if (existsSync(outIndex) && existsSync(outEmb)) {
    console.log("Embeddings already exist at data/. Delete them to re-run.");
    process.exit(0);
  }

  console.log("Parsing ESV…");
  const bible = parseESV();

  console.log("Building chunks…");
  const chunks = buildChunks(bible);
  console.log(`  ${chunks.length} chunks created.`);

  const texts = chunks.map((c) => c.text);
  const allVecs: number[][] = [];
  const totalBatches = Math.ceil(texts.length / BATCH_SIZE);
  const progressPath = join(process.cwd(), "data", "embed-progress.json");

  // Resume from checkpoint if interrupted
  let startBatch = 0;
  if (existsSync(progressPath)) {
    const progress = JSON.parse(readFileSync(progressPath, "utf-8"));
    allVecs.push(...progress.vecs);
    startBatch = progress.batch;
    console.log(`Resuming from batch ${startBatch}/${totalBatches}…`);
  }

  console.log(`Embedding ${chunks.length} chunks in ${totalBatches} batches via Voyage AI…`);
  if (startBatch === 0) console.log("  Tip: add a payment method at dashboard.voyageai.com to unlock faster rate limits (free tokens still apply).");

  for (let b = startBatch; b < totalBatches; b++) {
    const batch = texts.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const vecs = await embedBatch(batch, apiKey);
    allVecs.push(...vecs);

    // Save checkpoint every 10 batches
    if ((b + 1) % 10 === 0) {
      writeFileSync(progressPath, JSON.stringify({ batch: b + 1, vecs: allVecs }));
    }

    const pct = (((b + 1) / totalBatches) * 100).toFixed(1);
    process.stdout.write(`\r  Batch ${b + 1}/${totalBatches} (${pct}%)   `);
  }
  console.log("\nEmbedding complete.");

  const dims = allVecs[0].length;
  console.log(`  Dimensions: ${dims}`);

  // Write index JSON
  writeFileSync(outIndex, JSON.stringify(chunks), "utf-8");
  console.log(`Wrote ${outIndex}`);

  // Write embeddings as raw Float32LE binary
  const buf = Buffer.allocUnsafe(allVecs.length * dims * 4);
  let offset = 0;
  for (const vec of allVecs) {
    for (const v of vec) {
      buf.writeFloatLE(v, offset);
      offset += 4;
    }
  }
  writeFileSync(outEmb, buf);
  console.log(`Wrote ${outEmb}  (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);

  // Clean up checkpoint
  if (existsSync(progressPath)) unlinkSync(progressPath);
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
