import { readFileSync, existsSync } from "fs";
import { join } from "path";

const VOYAGE_MODEL = "voyage-3-lite";

interface ChunkMeta {
  ref: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  text: string;
}

export interface SearchResult {
  ref: string;
  text: string;
  score: number;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
}

// Module-level cache — loaded once per server process
let index: ChunkMeta[] | null = null;
let embeddings: Float32Array | null = null;
let dims = 512;
let loaded = false;

function load(): boolean {
  if (loaded) return index !== null;

  const indexPath = join(process.cwd(), "data", "bible-index.json");
  const embPath   = join(process.cwd(), "data", "bible-embeddings.bin");

  if (!existsSync(indexPath) || !existsSync(embPath)) {
    loaded = true;
    return false;
  }

  index = JSON.parse(readFileSync(indexPath, "utf-8")) as ChunkMeta[];

  // readFileSync returns a Buffer backed by a shared pool — copy to own ArrayBuffer
  const buf = readFileSync(embPath);
  const ab  = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  embeddings = new Float32Array(ab);

  dims = index.length > 0 ? embeddings.length / index.length : 512;
  loaded = true;
  return true;
}

function cosine(a: Float32Array, aStart: number, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < dims; i++) {
    const ai = a[aStart + i];
    const bi = b[i];
    dot += ai * bi;
    na  += ai * ai;
    nb  += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function embedQuery(text: string): Promise<Float32Array | null> {
  const apiKey = process.env.VOYAGEAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: [text], model: VOYAGE_MODEL, input_type: "query" }),
  });

  if (!res.ok) return null;
  const data = await res.json() as { data: { embedding: number[] }[] };
  return new Float32Array(data.data[0].embedding);
}

export async function vectorSearch(query: string, topK = 8): Promise<SearchResult[]> {
  if (!load() || !index || !embeddings) return [];

  const queryVec = await embedQuery(query);
  if (!queryVec) return [];

  // Score every chunk
  const scores: { i: number; score: number }[] = new Array(index.length);
  for (let i = 0; i < index.length; i++) {
    scores[i] = { i, score: cosine(embeddings, i * dims, queryVec) };
  }

  scores.sort((a, b) => b.score - a.score);

  return scores.slice(0, topK).map(({ i, score }) => ({
    ref:        index![i].ref,
    text:       index![i].text,
    score,
    book:       index![i].book,
    chapter:    index![i].chapter,
    startVerse: index![i].startVerse,
    endVerse:   index![i].endVerse,
  }));
}

export function isIndexReady(): boolean {
  return load() && index !== null && index.length > 0;
}
