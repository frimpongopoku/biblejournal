"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pin, Star, Search, Plus, Tag, ChevronRight } from "lucide-react";
import { entries, tags } from "@/lib/mock-data";

const FILTERS = ["All", "Pinned", "Reflections", "Sermons", "Bible Study"];

export default function JournalPage() {
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState(entries[0]);

  const filtered = active === "All" ? entries
    : active === "Pinned" ? entries.filter((e) => e.pinned)
    : entries.filter((e) => e.folder.toLowerCase().includes(active.toLowerCase()));

  return (
    <div className="flex h-full" style={{ background: "var(--bj-bg)" }}>

      {/* ── Entry List (300px) ──────────────────────────── */}
      <div
        className="w-[300px] shrink-0 flex flex-col border-r h-full overflow-hidden"
        style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>Journal</h2>
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--bj-gold)", boxShadow: "0 2px 8px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
            >
              <Plus size={14} color="white" />
            </button>
          </div>
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
          >
            <Search size={12} style={{ color: "var(--bj-ink4)" }} />
            <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>Search entries…</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-5 py-3 overflow-x-auto border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="shrink-0 font-sans text-[11px] px-3 py-1 rounded-full transition-all duration-150"
              style={{
                background: active === f ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                color: active === f ? "white" : "var(--bj-ink3)",
                border: active === f ? "none" : "1px solid var(--bj-line-soft)",
                fontWeight: active === f ? 500 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((entry) => {
            const isSelected = selected.id === entry.id;
            return (
              <div
                key={entry.id}
                onClick={() => setSelected(entry)}
                className="px-5 py-4 cursor-pointer transition-colors duration-150 border-b"
                style={{
                  borderColor: "var(--bj-line-soft)",
                  background: isSelected ? "var(--bj-gold-tint)" : "transparent",
                  borderLeft: isSelected ? "2px solid var(--bj-gold)" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--bj-bg-soft)"; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div className="flex items-start gap-2 mb-1.5">
                  {entry.pinned && <Pin size={11} className="mt-0.5 shrink-0" style={{ color: "var(--bj-gold)" }} />}
                  <p className="font-sans text-sm font-medium leading-snug" style={{ color: "var(--bj-ink)" }}>{entry.title}</p>
                </div>
                <p className="font-sans text-xs mb-2" style={{ color: "var(--bj-ink3)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {entry.excerpt}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.tags.map((t) => (
                    <span key={t} className="font-sans px-1.5 py-0.5 rounded-md" style={{ fontSize: 10, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}>
                      #{t}
                    </span>
                  ))}
                  <span className="font-sans ml-auto" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>{entry.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Entry Viewer / Editor ───────────────────────── */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden"
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-1.5 px-8 border-b shrink-0"
          style={{ height: 44, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
        >
          {["B", "I", "U", "—"].map((t) => (
            <button
              key={t}
              className="w-7 h-7 rounded flex items-center justify-center font-sans text-xs transition-colors duration-150"
              style={{ color: "var(--bj-ink3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {t}
            </button>
          ))}
          <div className="h-4 w-px mx-1" style={{ background: "var(--bj-line)" }} />
          {["/", "#", "@"].map((t) => (
            <button
              key={t}
              className="px-2 h-7 rounded flex items-center justify-center font-sans text-xs transition-colors duration-150"
              style={{ color: "var(--bj-ink3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {t === "/" ? "Slash" : t === "#" ? "Tag" : "Link"}
            </button>
          ))}
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 font-sans text-xs px-3 py-1 rounded-lg" style={{ color: "var(--bj-ink4)" }}>
            <Star size={12} />
          </button>
          <button className="flex items-center gap-1.5 font-sans text-xs px-3 py-1 rounded-lg" style={{ color: "var(--bj-ink4)" }}>
            <Tag size={12} />
          </button>
        </div>

        {/* Entry content */}
        <div className="flex-1 overflow-y-auto px-8 md:px-16 py-10">
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Meta */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="font-sans px-2 py-0.5 rounded-full text-xs"
                style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
              >
                {selected.folder}
              </span>
              <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{selected.date}</span>
              {selected.pinned && <Pin size={11} style={{ color: "var(--bj-gold)" }} />}
            </div>

            {/* Title */}
            <h1
              className="font-display mb-8 leading-tight"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "var(--bj-ink)", fontWeight: 400, letterSpacing: "-0.01em" }}
            >
              {selected.title}
            </h1>

            {/* Body */}
            {selected.body.length > 0 ? (
              <div className="flex flex-col gap-5">
                {selected.body.map((block, i) => {
                  if (block.type === "p") return (
                    <p key={i} className="font-sans text-base leading-relaxed" style={{ color: "var(--bj-ink2)", lineHeight: 1.8 }}>
                      {block.text}
                    </p>
                  );
                  if (block.type === "verse") return (
                    <div
                      key={i}
                      className="px-5 py-4 rounded-xl my-2"
                      style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}
                    >
                      <p className="font-sans text-[11px] mb-2" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {(block as { type: string; ref?: string; text: string }).ref}
                      </p>
                      <p className="font-display italic text-lg" style={{ color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1.45 }}>
                        &ldquo;{block.text}&rdquo;
                      </p>
                    </div>
                  );
                  if (block.type === "callout") return (
                    <div
                      key={i}
                      className="px-5 py-4 rounded-xl border-l-2"
                      style={{ background: "var(--bj-bg-soft)", borderColor: "var(--bj-gold)", borderLeftWidth: 2 }}
                    >
                      <p className="font-display italic text-lg" style={{ color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.45 }}>
                        {block.text}
                      </p>
                    </div>
                  );
                  return null;
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                  Begin writing…
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
