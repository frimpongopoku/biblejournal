"use client";

import { motion } from "framer-motion";
import { History, Info } from "lucide-react";
import { TimelineTrail } from "@/components/timeline/TimelineTrail";
import { TIMELINE_ERAS, TIMELINE_INTRO, getTotalEventCount } from "@/lib/data/timeline";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function TimelinePage() {
  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-6 md:pt-10 pb-24" style={{ maxWidth: 860 }}>

        {/* ── Header ───────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}
          >
            <History size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
              The Trail
            </h1>
            <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
              {TIMELINE_ERAS.length} eras · {getTotalEventCount()} events · Creation to the early church
            </p>
          </div>
        </motion.div>

        {/* ── Intro / sourcing promise ─────────────────── */}
        <motion.div
          variants={fadeUp} custom={1} initial="hidden" animate="show"
          className="flex items-start gap-3 rounded-2xl p-4 md:p-5 mb-10"
          style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
        >
          <Info size={15} className="shrink-0 mt-0.5" style={{ color: "var(--bj-ink4)" }} />
          <p className="font-sans text-[13px]" style={{ color: "var(--bj-ink2)", lineHeight: 1.75 }}>
            {TIMELINE_INTRO}
          </p>
        </motion.div>

        {/* ── The trail ────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show">
          <TimelineTrail />
        </motion.div>
      </div>
    </div>
  );
}
