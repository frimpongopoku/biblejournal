"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Highlighter, BookMarked, Link2, SlidersHorizontal } from "lucide-react";
import { bibleChapter, crossRefs, aiInsights } from "@/lib/mock-data";

const VERSIONS = ["ESV", "KJV", "NIV", "NKJV", "NLT"];

export default function BiblePage() {
  const [version, setVersion] = useState("ESV");
  const [highlighted, setHighlighted] = useState<number[]>([4, 5]);

  function toggleHighlight(n: number) {
    setHighlighted((prev) => prev.includes(n) ? prev.filter((v) => v !== n) : [...prev, n]);
  }

  return (
    <div className="flex h-full" style={{ background: "var(--bj-bg)" }}>

      {/* ── Main reading column ─────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Chapter nav bar */}
        <div
          className="flex items-center gap-3 px-6 md:px-10 border-b shrink-0"
          style={{ height: 52, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
        >
          <button className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            <button className="font-display text-base font-medium transition-colors duration-150" style={{ color: "var(--bj-ink)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-gold-deep)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink)"}>
              {bibleChapter.book}
            </button>
            <span style={{ color: "var(--bj-ink4)" }}>·</span>
            <span className="font-display text-base" style={{ color: "var(--bj-ink2)" }}>Chapter {bibleChapter.chapter}</span>
          </div>

          <button className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <ChevronRight size={16} />
          </button>

          <div className="flex-1" />

          {/* Version picker */}
          <div className="flex gap-1">
            {VERSIONS.map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className="font-sans text-[11px] px-2.5 py-1 rounded-lg transition-all duration-150"
                style={{
                  background: version === v ? "var(--bj-gold)" : "transparent",
                  color: version === v ? "white" : "var(--bj-ink4)",
                  fontWeight: version === v ? 500 : 400,
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="h-4 w-px" style={{ background: "var(--bj-line-soft)" }} />

          <button className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <SlidersHorizontal size={15} />
          </button>
        </div>

        {/* Verses */}
        <div className="flex-1 overflow-y-auto px-6 md:px-16 lg:px-24 py-10">
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            {/* Chapter heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <p className="font-sans text-[11px] mb-2" style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {bibleChapter.version} · {bibleChapter.book} {bibleChapter.chapter}
              </p>
              <h1 className="font-display" style={{ fontSize: "2.4rem", color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1 }}>
                Chapter {bibleChapter.chapter}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--bj-gold)" }} />
                <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
              </div>
            </motion.div>

            {/* Verse list */}
            <div className="flex flex-col gap-1">
              {bibleChapter.verses.map((v, i) => {
                const isHighlighted = highlighted.includes(v.n);
                return (
                  <motion.div
                    key={v.n}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    onClick={() => toggleHighlight(v.n)}
                    className="group relative flex gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: isHighlighted ? "var(--bj-gold-tint)" : "transparent",
                      border: isHighlighted ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isHighlighted) (e.currentTarget as HTMLDivElement).style.background = "var(--bj-bg-soft)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isHighlighted) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <sup
                      className="font-sans text-xs shrink-0 pt-1 w-5 text-right"
                      style={{ color: isHighlighted ? "var(--bj-gold-deep)" : "var(--bj-ink4)", fontWeight: 500 }}
                    >
                      {v.n}
                    </sup>
                    <p
                      className="font-display text-lg leading-relaxed flex-1"
                      style={{
                        color: isHighlighted ? "var(--bj-ink)" : "var(--bj-ink2)",
                        fontWeight: 300,
                        lineHeight: 1.7,
                      }}
                    >
                      {v.text}
                    </p>
                    {/* Hover actions */}
                    <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                      <button className="w-6 h-6 rounded flex items-center justify-center" style={{ color: "var(--bj-gold)" }}>
                        <Highlighter size={11} />
                      </button>
                      <button className="w-6 h-6 rounded flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                        <BookMarked size={11} />
                      </button>
                      <button className="w-6 h-6 rounded flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                        <Link2 size={11} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Chapter nav */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
              <button className="flex items-center gap-2 font-sans text-sm px-4 py-2 rounded-xl transition-colors duration-150"
                style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}>
                <ChevronLeft size={14} /> John 14
              </button>
              <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>John · Chapter 15</span>
              <button className="flex items-center gap-2 font-sans text-sm px-4 py-2 rounded-xl transition-colors duration-150"
                style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}>
                John 16 <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Rail: Cross-refs + AI ─────────────────── */}
      <div
        className="hidden xl:flex flex-col w-[300px] shrink-0 border-l overflow-y-auto"
        style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
      >
        {/* Cross references */}
        <div className="p-5 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <p className="font-sans text-[11px] mb-4" style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cross References</p>
          <div className="flex flex-col gap-3">
            {crossRefs.map((r) => (
              <div key={r.ref} className="group cursor-pointer">
                <p className="font-display text-sm font-medium mb-0.5" style={{ color: "var(--bj-gold-deep)" }}>{r.ref}</p>
                <p className="font-sans text-xs" style={{ color: "var(--bj-ink3)", lineHeight: 1.5 }}>{r.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="p-5">
          <p className="font-sans text-[11px] mb-4" style={{ color: "var(--bj-ink4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>AI Insights</p>
          <div className="flex flex-col gap-4">
            {aiInsights.map((ins) => (
              <div
                key={ins.title}
                className="p-3.5 rounded-xl"
                style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}
              >
                <p className="font-sans text-xs font-medium mb-1.5" style={{ color: "var(--bj-gold-deep)" }}>{ins.title}</p>
                <p className="font-sans text-xs" style={{ color: "var(--bj-ink2)", lineHeight: 1.6 }}>{ins.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
