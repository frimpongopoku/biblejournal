"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, BookOpen } from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";
import type { SermonRef } from "@/types";

interface PreviewVerse {
  ref: string;
  text: string;
  book: string;
  chapter: number;
  verse?: number;
}

interface Props {
  refs: SermonRef[];
  onAdd: (ref: SermonRef) => Promise<void>;
  onUpdateNote: (id: string, note: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function VerseRefPanel({ refs, onAdd, onUpdateNote, onRemove }: Props) {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<PreviewVerse | null>(null);
  const [fetching, setFetching] = useState(false);
  const [adding, setAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const parsed = parseRef(query);
    if (!parsed) { setPreview(null); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `/api/bible/ESV/${encodeURIComponent(parsed.book)}/${parsed.chapter}`
        );
        if (!res.ok) { setPreview(null); return; }
        const data = await res.json();
        const verse = parsed.verse
          ? data.verses?.find((v: { n: number }) => v.n === parsed.verse)
          : data.verses?.[0];
        if (!verse) { setPreview(null); return; }
        const refLabel = parsed.verse
          ? `${parsed.book} ${parsed.chapter}:${parsed.verse}`
          : `${parsed.book} ${parsed.chapter}`;
        setPreview({
          ref: refLabel, text: verse.text,
          book: parsed.book, chapter: parsed.chapter, verse: parsed.verse,
        });
      } finally {
        setFetching(false);
      }
    }, 500);
  }, [query]);

  async function handleAdd() {
    if (!preview) return;
    setAdding(true);
    const newRef: SermonRef = {
      id: crypto.randomUUID(),
      book: preview.book, chapter: preview.chapter, verse: preview.verse,
      text: preview.text, note: "", version: "ESV",
      addedAt: new Date().toISOString(),
    };
    await onAdd(newRef);
    setQuery(""); setPreview(null);
    setAdding(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={13} style={{ color: "var(--bj-gold)" }} />
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--bj-ink4)" }}>
            Verse References
          </h3>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
        >
          <Search size={11} style={{ color: "var(--bj-ink4)", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="John 3:16, Ps 23…"
            className="flex-1 bg-transparent outline-none font-sans text-xs"
            style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button onClick={() => { setQuery(""); setPreview(null); }} className="bj-btn-icon w-4 h-4 rounded flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
              <X size={9} />
            </button>
          )}
        </div>

        {/* Preview */}
        <AnimatePresence>
          {(fetching || preview) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 px-3 py-2.5 rounded-xl"
                style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}
              >
                {fetching ? (
                  <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>Looking up…</p>
                ) : preview ? (
                  <>
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--bj-gold-deep)" }}>
                      {preview.ref} · ESV
                    </p>
                    <p className="font-display italic text-sm leading-snug mb-2" style={{ color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.55 }}>
                      "{preview.text.length > 120 ? preview.text.slice(0, 120) + "…" : preview.text}"
                    </p>
                    <button
                      onClick={handleAdd}
                      disabled={adding}
                      className="bj-btn-primary font-sans text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                      style={{ background: "var(--bj-gold)", color: "white" }}
                    >
                      <Plus size={10} /> {adding ? "Adding…" : "Add reference"}
                    </button>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reference list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {refs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)", lineHeight: 1.6 }}>
              Search a verse above to add it to your sermon notes
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {refs.map((ref, i) => (
              <RefCard
                key={ref.id}
                ref_={ref}
                index={i}
                onUpdateNote={onUpdateNote}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Individual ref card ───────────────────────────────────

interface RefCardProps {
  ref_: SermonRef;
  index: number;
  onUpdateNote: (id: string, note: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

function RefCard({ ref_, index, onUpdateNote, onRemove }: RefCardProps) {
  const [note, setNote] = useState(ref_.note);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refLabel = ref_.verse
    ? `${ref_.book} ${ref_.chapter}:${ref_.verse}`
    : `${ref_.book} ${ref_.chapter}`;

  function handleNoteChange(val: string) {
    setNote(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdateNote(ref_.id, val), 1000);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.03, duration: 0.2 }}
      className="rounded-xl p-3"
      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
        >
          {refLabel}
        </span>
        <button
          onClick={() => onRemove(ref_.id)}
          className="bj-btn-action w-5 h-5 rounded flex items-center justify-center shrink-0"
          data-danger
          style={{ color: "var(--bj-ink4)" }}
          title="Remove"
        >
          <X size={9} />
        </button>
      </div>

      <p className="font-display italic text-xs leading-relaxed mb-2" style={{ color: "var(--bj-ink2)", fontWeight: 400, lineHeight: 1.6, fontSize: 12 }}>
        "{ref_.text.length > 100 ? ref_.text.slice(0, 100) + "…" : ref_.text}"
      </p>

      <input
        value={note}
        onChange={(e) => handleNoteChange(e.target.value)}
        placeholder="Add a note…"
        className="w-full bg-transparent outline-none font-sans text-xs"
        style={{
          color: "var(--bj-ink2)", caretColor: "var(--bj-gold)",
          borderTop: "1px solid var(--bj-line-soft)", paddingTop: 6,
        }}
      />
    </motion.div>
  );
}
