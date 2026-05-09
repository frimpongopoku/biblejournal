"use client";

import { useEffect, useRef, useState } from "react";
import { Search, BookOpen, Hash, ChevronRight } from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";
import { PROTESTANT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";

// ── Suggestion types ──────────────────────────────────────

type BookSug    = { type: "book";    book: string; label: string };
type ChapterSug = { type: "chapter"; book: string; chapter: number; label: string };
type VerseSug   = { type: "verse";   book: string; chapter: number; verse: number; label: string };
type Suggestion = BookSug | ChapterSug | VerseSug;

function matchBooks(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const numMatch = q.match(/^(\d)\s*(.*)$/);
  let results: string[];
  if (numMatch) {
    const num = numMatch[1];
    const rest = numMatch[2].trim();
    results = PROTESTANT_BOOKS.filter((b) => {
      const bl = b.toLowerCase();
      return bl.startsWith(`${num} `) && (!rest || bl.slice(2).startsWith(rest));
    });
  } else {
    results = PROTESTANT_BOOKS.filter((b) => b.toLowerCase().startsWith(q));
  }
  return results.slice(0, 6);
}

function getSuggestions(input: string): Suggestion[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Verse mode — has colon
  if (trimmed.includes(":")) {
    const parsed = parseRef(trimmed);
    if (parsed?.verse !== undefined) {
      return [{
        type: "verse",
        book: parsed.book, chapter: parsed.chapter, verse: parsed.verse,
        label: `${parsed.book} ${parsed.chapter}:${parsed.verse}`,
      }];
    }
    // Has colon but verse not typed yet — hint only
    return [];
  }

  // Full book + chapter parsed
  const parsed = parseRef(trimmed);
  if (parsed) {
    const totalCh = CHAPTER_COUNTS[parsed.book] ?? 1;
    const ch = Math.min(parsed.chapter, totalCh);
    return [ch - 1, ch, ch + 1]
      .filter((c) => c >= 1 && c <= totalCh)
      .map((c) => ({ type: "chapter" as const, book: parsed.book, chapter: c, label: `${parsed.book} ${c}` }));
  }

  // Trailing space — book fully typed, suggest first 8 chapters
  if (input.endsWith(" ")) {
    const book = PROTESTANT_BOOKS.find((b) => b.toLowerCase() === trimmed.toLowerCase());
    if (book) {
      const total = CHAPTER_COUNTS[book] ?? 1;
      return Array.from({ length: Math.min(total, 8) }, (_, i) => ({
        type: "chapter" as const, book, chapter: i + 1, label: `${book} ${i + 1}`,
      }));
    }
  }

  // Partial book name
  return matchBooks(trimmed).map((b) => ({ type: "book" as const, book: b, label: b }));
}

// ── Component ─────────────────────────────────────────────

interface Props {
  onNavigate: (book: string, chapter: number, verse?: number) => void;
}

export function QuickRefInput({ onNavigate }: Props) {
  const [value, setValue]       = useState("");
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState(0);
  const [shake, setShake]       = useState(false);
  const [focused, setFocused]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const suggestions = getSuggestions(value);

  // Sync open state when suggestions change
  useEffect(() => {
    setSelected(0);
    setOpen(suggestions.length > 0 && value.trim().length > 0);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  }

  function commit(sug: Suggestion) {
    if (sug.type === "book") {
      // Fill input with "BookName " and keep focus — user types chapter next
      setValue(sug.book + " ");
      inputRef.current?.focus();
      return;
    }
    setValue("");
    setOpen(false);
    inputRef.current?.blur();
    if (sug.type === "chapter") onNavigate(sug.book, sug.chapter);
    else onNavigate(sug.book, sug.chapter, sug.verse);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setValue(""); setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(suggestions[selected]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (open && suggestions.length > 0) { commit(suggestions[selected]); return; }
    const parsed = parseRef(value);
    if (!parsed) { triggerShake(); return; }
    setValue(""); setOpen(false);
    onNavigate(parsed.book, parsed.chapter, parsed.verse);
  }

  const borderColor = shake ? "var(--bj-ember)" : focused ? "var(--bj-gold)" : "var(--bj-line-soft)";

  return (
    <div ref={wrapRef} className="hidden sm:block relative shrink-0">
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
          style={{
            background: "var(--bj-bg-soft)",
            border: `1px solid ${borderColor}`,
            boxShadow: focused ? `0 0 0 2px color-mix(in oklch, var(--bj-gold) 16%, transparent)` : "none",
            animation: shake ? "bj-shake 0.4s ease" : "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            width: 152,
          }}
        >
          <Search size={11} style={{ color: "var(--bj-ink4)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 160); }}
            placeholder="Go to verse…"
            className="bg-transparent outline-none font-sans text-xs w-full"
            style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </form>

      {/* Predictions dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute left-0 rounded-xl overflow-hidden"
          style={{
            top: "calc(100% + 6px)",
            background: "var(--bj-bg-panel)",
            border: "1px solid var(--bj-line)",
            boxShadow: "0 8px 28px color-mix(in oklch, var(--bj-ink) 16%, transparent)",
            minWidth: 200,
            zIndex: 9999,
          }}
        >
          {suggestions.map((sug, i) => {
            const isSelected = i === selected;
            return (
              <button
                key={sug.label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); commit(sug); }}
                onMouseEnter={() => setSelected(i)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left"
                style={{
                  background: isSelected ? "var(--bj-gold-tint)" : "transparent",
                  transition: "background 0.08s ease",
                }}
              >
                {/* Icon */}
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: isSelected ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                  }}
                >
                  {sug.type === "book"    && <BookOpen size={10} style={{ color: isSelected ? "white" : "var(--bj-ink3)" }} />}
                  {sug.type === "chapter" && <span style={{ fontSize: 9, fontWeight: 600, color: isSelected ? "white" : "var(--bj-ink3)" }}>{sug.chapter}</span>}
                  {sug.type === "verse"   && <Hash size={10} style={{ color: isSelected ? "white" : "var(--bj-ink3)" }} />}
                </span>

                {/* Label */}
                <span
                  className="font-sans text-sm flex-1"
                  style={{
                    color: isSelected ? "var(--bj-gold-deep)" : "var(--bj-ink)",
                    fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  {sug.label}
                </span>

                {/* Type hint */}
                <span className="font-sans text-[10px] shrink-0" style={{ color: "var(--bj-ink4)" }}>
                  {sug.type === "book" ? `${CHAPTER_COUNTS[sug.book]} ch` : ""}
                  {sug.type === "chapter" ? "↵" : ""}
                  {sug.type === "verse" ? "↵" : ""}
                </span>
              </button>
            );
          })}

          {/* Hint footer */}
          <div
            className="px-3 py-2 border-t"
            style={{ borderColor: "var(--bj-line-soft)" }}
          >
            <p className="font-sans text-[10px]" style={{ color: "var(--bj-ink4)" }}>
              Try <span style={{ color: "var(--bj-ink3)" }}>John 3:16</span> · <span style={{ color: "var(--bj-ink3)" }}>Ps 23</span> · <span style={{ color: "var(--bj-ink3)" }}>1 Cor 13</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
