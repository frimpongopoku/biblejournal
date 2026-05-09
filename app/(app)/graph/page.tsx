"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const NODES = [
  { id: "n1", x: 380, y: 200, r: 36, label: "What it means to abide", type: "note" },
  { id: "n2", x: 220, y: 110, r: 28, label: "John 15", type: "verse" },
  { id: "n3", x: 540, y: 110, r: 24, label: "Sermon: Vine & Branches", type: "sermon" },
  { id: "n4", x: 160, y: 290, r: 22, label: "Psalm 80", type: "verse" },
  { id: "n5", x: 300, y: 360, r: 26, label: "Identity in Christ", type: "note" },
  { id: "n6", x: 520, y: 340, r: 20, label: "Isaiah 5", type: "verse" },
  { id: "n7", x: 640, y: 240, r: 18, label: "#grace", type: "tag" },
  { id: "n8", x: 660, y: 380, r: 18, label: "#covenant", type: "tag" },
  { id: "n9", x: 100, y: 190, r: 20, label: "Romans 11", type: "verse" },
  { id: "n10", x: 440, y: 410, r: 16, label: "#identity", type: "tag" },
];

const EDGES = [
  { from: "n1", to: "n2" }, { from: "n1", to: "n3" }, { from: "n1", to: "n5" },
  { from: "n2", to: "n4" }, { from: "n2", to: "n6" }, { from: "n3", to: "n7" },
  { from: "n5", to: "n10" }, { from: "n6", to: "n8" }, { from: "n4", to: "n9" },
  { from: "n1", to: "n7" }, { from: "n5", to: "n1" },
];

const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  note: { fill: "var(--bj-bg-panel)", stroke: "var(--bj-line)", text: "var(--bj-ink)" },
  verse: { fill: "var(--bj-gold-tint)", stroke: "var(--bj-gold-soft)", text: "var(--bj-gold-deep)" },
  sermon: { fill: "var(--bj-sage-tint)", stroke: "color-mix(in oklch, var(--bj-sage) 35%, transparent)", text: "var(--bj-sage)" },
  tag: { fill: "var(--bj-bg-soft)", stroke: "var(--bj-line-soft)", text: "var(--bj-ink3)" },
};

const LEGEND = [
  { type: "note", label: "Note" },
  { type: "verse", label: "Scripture" },
  { type: "sermon", label: "Sermon" },
  { type: "tag", label: "Tag" },
];

export default function GraphPage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  const connectedTo = hovered
    ? new Set(EDGES.filter((e) => e.from === hovered || e.to === hovered).flatMap((e) => [e.from, e.to]))
    : null;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "var(--bj-bg)" }}>

      {/* Header */}
      <div className="absolute top-4 left-6 z-10">
        <h2 className="font-display text-xl" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>Knowledge Graph</h2>
        <p className="font-sans text-xs mt-0.5" style={{ color: "var(--bj-ink4)" }}>
          {NODES.length} nodes · {EDGES.length} connections
        </p>
      </div>

      {/* SVG canvas */}
      <svg
        className="w-full h-full"
        viewBox="0 0 800 520"
        style={{ background: "transparent" }}
      >
        <defs>
          {/* Radial glow for hovered node */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Soft grid */}
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.7" fill="var(--bj-line)" opacity="0.5" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="800" height="520" fill="url(#dot-grid)" />

        {/* Edges */}
        {EDGES.map(({ from, to }) => {
          const a = nodeMap[from], b = nodeMap[to];
          if (!a || !b) return null;
          const isHighlighted = hovered && (connectedTo?.has(from) && connectedTo?.has(to));
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isHighlighted ? "var(--bj-gold)" : "var(--bj-line)"}
              strokeWidth={isHighlighted ? 1.5 : 0.8}
              strokeOpacity={hovered ? (isHighlighted ? 0.8 : 0.15) : 0.45}
              strokeDasharray={isHighlighted ? "none" : "4 4"}
              animate={{ strokeOpacity: hovered ? (isHighlighted ? 0.8 : 0.15) : 0.45 }}
              transition={{ duration: 0.2 }}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const colors = NODE_COLORS[node.type];
          const isHovered = hovered === node.id;
          const isDimmed = hovered && !connectedTo?.has(node.id);
          const maxLabelWidth = node.r * 2.8;

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isDimmed ? 0.2 : 1,
                scale: 1,
              }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Glow ring on hover */}
              {isHovered && (
                <circle
                  cx={node.x} cy={node.y} r={node.r + 8}
                  fill="none"
                  stroke="var(--bj-gold)"
                  strokeWidth="1.5"
                  opacity="0.4"
                  filter="url(#glow)"
                />
              )}

              {/* Node circle */}
              <motion.circle
                cx={node.x} cy={node.y} r={node.r}
                fill={colors.fill}
                stroke={isHovered ? "var(--bj-gold)" : colors.stroke}
                strokeWidth={isHovered ? 2 : 1}
                animate={{ r: isHovered ? node.r + 3 : node.r }}
                transition={{ duration: 0.2 }}
              />

              {/* Label */}
              <foreignObject
                x={node.x - maxLabelWidth / 2}
                y={node.y + node.r + 6}
                width={maxLabelWidth}
                height={40}
              >
                <div
                  style={{
                    fontFamily: "var(--font-inter, sans-serif)",
                    fontSize: node.type === "tag" ? 10 : 11,
                    color: isHovered ? "var(--bj-gold-deep)" : colors.text,
                    textAlign: "center",
                    lineHeight: 1.3,
                    transition: "color 0.2s",
                    wordBreak: "break-word",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {node.type === "tag" ? node.label : node.label}
                </div>
              </foreignObject>

              {/* Type dot */}
              <circle
                cx={node.x + node.r * 0.65}
                cy={node.y - node.r * 0.65}
                r={4}
                fill={
                  node.type === "verse" ? "var(--bj-gold)"
                    : node.type === "sermon" ? "var(--bj-sage)"
                    : node.type === "tag" ? "var(--bj-ink4)"
                    : "var(--bj-ink3)"
                }
                opacity={isHovered ? 1 : 0.6}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div
        className="absolute bottom-6 left-6 flex items-center gap-4 px-4 py-2.5 rounded-xl border"
        style={{
          background: "color-mix(in oklch, var(--bj-bg-panel) 90%, transparent)",
          borderColor: "var(--bj-line-soft)",
          backdropFilter: "blur(10px)",
        }}
      >
        {LEGEND.map(({ type, label }) => {
          const c = NODE_COLORS[type];
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: c.fill, border: `1.5px solid ${c.stroke}` }} />
              <span className="font-sans text-[10px]" style={{ color: "var(--bj-ink3)" }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Hover tooltip */}
      {hovered && (() => {
        const node = nodeMap[hovered];
        const connections = EDGES.filter((e) => e.from === hovered || e.to === hovered).length;
        return (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-6 px-4 py-3 rounded-xl border"
            style={{
              background: "var(--bj-bg-panel)",
              borderColor: "var(--bj-gold-soft)",
              boxShadow: "0 4px 20px color-mix(in oklch, var(--bj-ink) 10%, transparent)",
              minWidth: 180,
            }}
          >
            <p className="font-sans text-[10px] mb-1" style={{ color: "var(--bj-gold-deep)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {NODE_COLORS[node.type] && node.type}
            </p>
            <p className="font-sans text-sm font-medium" style={{ color: "var(--bj-ink)" }}>{node.label}</p>
            <p className="font-sans text-xs mt-1" style={{ color: "var(--bj-ink4)" }}>{connections} connection{connections !== 1 ? "s" : ""}</p>
          </motion.div>
        );
      })()}
    </div>
  );
}
