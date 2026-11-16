export interface LayoutVerse { n: number; text: string }

const SENTENCE_END = /[.!?;:]["'”’)\]]*\s*$/;

/**
 * Group verses into reading paragraphs. The source texts carry no paragraph
 * marks, so break after a verse that ends a sentence once a paragraph has a
 * few verses — never mid-sentence. `forceBreakBefore` adds breaks (e.g. where
 * an inline commentary block must sit).
 */
export function toParagraphs<V extends LayoutVerse>(
  verses: V[],
  forceBreakBefore: Set<number> = new Set(),
  min = 4,
  max = 9,
): V[][] {
  const out: V[][] = [];
  let cur: V[] = [];
  for (const v of verses) {
    if (cur.length && forceBreakBefore.has(v.n)) { out.push(cur); cur = []; }
    cur.push(v);
    const ends = SENTENCE_END.test(v.text);
    if ((cur.length >= min && ends) || cur.length >= max) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
}

export function rangeLabel(book: string, chapter: number, from: number, to: number) {
  return `${book} ${chapter}:${from}${to > from ? `–${to}` : ""}`;
}
