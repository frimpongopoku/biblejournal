"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { TIMELINE_ERAS } from "@/lib/data/timeline";
import { EraIconGlyph } from "./EraIconGlyph";
import { useTimelineStore } from "@/store/timeline.store";

const ROW_HEIGHT = 172;
const GUTTER_WIDTH = 64;
const MARKER_SIZE = 26;
const LEFT_X = 22;
const RIGHT_X = 42;

function stationX(i: number) {
  return i % 2 === 0 ? LEFT_X : RIGHT_X;
}

function buildPath(n: number) {
  const points = Array.from({ length: n }, (_, i) => ({
    x: stationX(i),
    y: i * ROW_HEIGHT + ROW_HEIGHT / 2,
  }));
  let d = `M ${points[0].x} 0 L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${n * ROW_HEIGHT}`;
  return d;
}

export function TimelineTrail() {
  const visitedEras = useTimelineStore((s) => s.visitedEras);
  const n = TIMELINE_ERAS.length;
  const totalHeight = n * ROW_HEIGHT;
  const pathD = buildPath(n);

  return (
    <div className="relative flex" style={{ minHeight: totalHeight }}>
      {/* ── Gutter: winding path + markers ─────────────────── */}
      <div className="relative shrink-0" style={{ width: GUTTER_WIDTH, height: totalHeight }}>
        <svg
          className="absolute inset-0"
          width={GUTTER_WIDTH}
          height={totalHeight}
          viewBox={`0 0 ${GUTTER_WIDTH} ${totalHeight}`}
        >
          <path d={pathD} fill="none" stroke="var(--bj-line)" strokeWidth="2" strokeOpacity="0.5" />
          <motion.path
            d={pathD}
            fill="none"
            stroke="var(--bj-gold)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1] }}
          />
        </svg>

        {TIMELINE_ERAS.map((era, i) => {
          const x = stationX(i);
          const y = i * ROW_HEIGHT + ROW_HEIGHT / 2;
          const visited = visitedEras.includes(era.id);
          return (
            <motion.div
              key={era.id}
              className="absolute rounded-full flex items-center justify-center"
              style={{
                left: x - MARKER_SIZE / 2,
                top: y - MARKER_SIZE / 2,
                width: MARKER_SIZE,
                height: MARKER_SIZE,
                background: visited
                  ? `color-mix(in oklch, ${era.color} 22%, var(--bj-bg-panel))`
                  : "var(--bj-bg-panel)",
                border: `1.5px solid ${visited ? era.color : "var(--bj-line)"}`,
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.15 + i * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <EraIconGlyph name={era.icon} size={12} style={{ color: visited ? era.color : "var(--bj-ink4)" }} />
            </motion.div>
          );
        })}
      </div>

      {/* ── Stations ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {TIMELINE_ERAS.map((era, i) => {
          const visited = visitedEras.includes(era.id);
          return (
            <div key={era.id} className="flex items-center pl-4 md:pl-6" style={{ height: ROW_HEIGHT }}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: 0.2 + i * 0.03, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <Link
                  href={`/timeline/${era.id}`}
                  className="bj-list-row group flex items-center gap-4 rounded-2xl p-4 md:p-5 w-full"
                  style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="font-sans text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `color-mix(in oklch, ${era.color} 16%, var(--bj-bg))`, color: era.color }}
                      >
                        {String(era.order).padStart(2, "0")}
                      </span>
                      {visited && (
                        <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>
                          Explored
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg md:text-xl mb-1" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                      {era.name}
                    </h3>
                    <p
                      className="font-sans text-[13px]"
                      style={{
                        color: "var(--bj-ink3)",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {era.summary}
                    </p>
                    <p className="font-sans text-[11px] mt-2" style={{ color: "var(--bj-ink4)" }}>
                      {era.events.length} event{era.events.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--bj-ink4)" }}
                  />
                </Link>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
