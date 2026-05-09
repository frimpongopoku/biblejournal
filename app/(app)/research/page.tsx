"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Maximize2, Move } from "lucide-react";

const CARDS = [
  { id: "1", x: 80, y: 60, w: 260, title: "Meno — to abide", type: "note", content: "The Greek word μένω (meno) appears 40× in John's Gospel. It implies settled, unhurried residence — not a brief visit but a permanent dwelling." },
  { id: "2", x: 400, y: 40, w: 220, title: "John 15:4", type: "verse", content: "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me." },
  { id: "3", x: 680, y: 100, w: 240, title: "Isaiah 5:1–7", type: "verse", content: "The vineyard of the Lord — a lament over Israel as God's vine who failed to bear fruit. Jesus reframes the metaphor with himself as the true vine." },
  { id: "4", x: 120, y: 300, w: 280, title: "Sermon outline: Vine & Branches", type: "sermon", content: "I. The invitation to abide\nII. What abiding looks like\nIII. The fruit that follows\nIV. The pruning that precedes" },
  { id: "5", x: 450, y: 280, w: 230, title: "Psalm 80:8–11", type: "verse", content: "You brought a vine out of Egypt; you drove out the nations and planted it. It took deep root and filled the land." },
  { id: "6", x: 730, y: 320, w: 220, title: "Connection: Identity in Christ", type: "note", content: "Ephesians 1 uses 'in Christ' 6×. John 15 frames the same union from the vine's perspective. Both point to the same reality." },
];

const CONNECTIONS = [
  { from: "1", to: "2" },
  { from: "2", to: "3" },
  { from: "2", to: "5" },
  { from: "1", to: "6" },
  { from: "4", to: "2" },
];

const TYPE_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  note: { bg: "var(--bj-bg-panel)", border: "var(--bj-line)", label: "Note" },
  verse: { bg: "var(--bj-gold-tint)", border: "var(--bj-gold-soft)", label: "Scripture" },
  sermon: { bg: "var(--bj-sage-tint)", border: "color-mix(in oklch, var(--bj-sage) 30%, transparent)", label: "Sermon" },
};

function getCenter(card: typeof CARDS[0]) {
  return { x: card.x + card.w / 2, y: card.y + 60 };
}

export default function ResearchPage() {
  const [zoom] = useState(1);

  const cardMap = Object.fromEntries(CARDS.map((c) => [c.id, c]));

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "var(--bj-bg)" }}>

      {/* Toolbar */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-2xl border"
        style={{
          background: "color-mix(in oklch, var(--bj-bg-panel) 90%, transparent)",
          borderColor: "var(--bj-line-soft)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px color-mix(in oklch, var(--bj-ink) 8%, transparent)",
        }}
      >
        <button
          className="flex items-center gap-2 font-sans text-xs px-3 py-1.5 rounded-xl"
          style={{ background: "var(--bj-gold)", color: "white" }}
        >
          <Plus size={12} /> Add card
        </button>
        <div className="h-4 w-px" style={{ background: "var(--bj-line)" }} />
        <button className="p-1.5 rounded-lg" style={{ color: "var(--bj-ink3)" }}>
          <Move size={13} />
        </button>
        <button className="p-1.5 rounded-lg" style={{ color: "var(--bj-ink3)" }}>
          <Maximize2 size={13} />
        </button>
        <div className="h-4 w-px" style={{ background: "var(--bj-line)" }} />
        <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>Vine & Branches study</span>
      </div>

      {/* Canvas */}
      <div
        className="relative w-full h-full overflow-auto"
        style={{ cursor: "grab" }}
      >
        <div
          className="relative"
          style={{ width: 1200, height: 700, transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
            <defs>
              <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="0.8" fill="var(--bj-line)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {CONNECTIONS.map(({ from, to }) => {
              const a = cardMap[from], b = cardMap[to];
              if (!a || !b) return null;
              const ca = getCenter(a), cb = getCenter(b);
              const mx = (ca.x + cb.x) / 2;
              return (
                <path
                  key={`${from}-${to}`}
                  d={`M ${ca.x} ${ca.y} C ${mx} ${ca.y}, ${mx} ${cb.y}, ${cb.x} ${cb.y}`}
                  fill="none"
                  stroke="var(--bj-gold)"
                  strokeWidth="1.2"
                  strokeDasharray="5 4"
                  opacity="0.5"
                />
              );
            })}
          </svg>

          {/* Cards */}
          {CARDS.map((card, i) => {
            const style = TYPE_STYLES[card.type];
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute rounded-xl cursor-pointer overflow-hidden"
                style={{
                  left: card.x,
                  top: card.y,
                  width: card.w,
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  boxShadow: "0 2px 16px color-mix(in oklch, var(--bj-ink) 6%, transparent)",
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 32px color-mix(in oklch, var(--bj-ink) 12%, transparent)" }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: style.border }}>
                  <div className="flex items-center justify-between">
                    <span
                      className="font-sans text-[10px] font-medium"
                      style={{
                        color: card.type === "verse" ? "var(--bj-gold-deep)" : card.type === "sermon" ? "var(--bj-sage)" : "var(--bj-ink4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="font-sans text-sm font-medium mt-0.5" style={{ color: "var(--bj-ink)" }}>{card.title}</p>
                </div>
                <div className="px-4 py-3">
                  <p
                    className={card.type === "verse" ? "font-display italic" : "font-sans"}
                    style={{
                      fontSize: card.type === "verse" ? "0.9rem" : "0.8rem",
                      color: "var(--bj-ink2)",
                      lineHeight: 1.6,
                      fontWeight: card.type === "verse" ? 300 : 400,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {card.type === "verse" ? `"${card.content}"` : card.content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-6 left-6 flex items-center gap-3 px-3 py-2 rounded-xl border"
        style={{
          background: "color-mix(in oklch, var(--bj-bg-panel) 90%, transparent)",
          borderColor: "var(--bj-line-soft)",
          backdropFilter: "blur(8px)",
        }}
      >
        {Object.entries(TYPE_STYLES).map(([type, s]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: s.bg, border: `1px solid ${s.border}` }} />
            <span className="font-sans text-[10px]" style={{ color: "var(--bj-ink3)" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
