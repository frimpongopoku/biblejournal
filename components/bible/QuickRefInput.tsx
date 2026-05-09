"use client";

import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";

interface Props {
  onNavigate: (book: string, chapter: number, verse?: number) => void;
}

export function QuickRefInput({ onNavigate }: Props) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseRef(value);
    if (!parsed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setValue("");
    inputRef.current?.blur();
    onNavigate(parsed.book, parsed.chapter, parsed.verse);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden sm:flex items-center shrink-0">
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
        style={{
          background: "var(--bj-bg-soft)",
          border: `1px solid ${shake ? "var(--bj-ember)" : focused ? "var(--bj-gold)" : "var(--bj-line-soft)"}`,
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          boxShadow: focused ? "0 0 0 2px color-mix(in oklch, var(--bj-gold) 18%, transparent)" : "none",
          animation: shake ? "bj-shake 0.4s ease" : "none",
          width: 148,
        }}
      >
        <Search size={11} style={{ color: "var(--bj-ink4)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && (setValue(""), inputRef.current?.blur())}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Go to verse…"
          className="bg-transparent outline-none font-sans text-xs w-full"
          style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </form>
  );
}
