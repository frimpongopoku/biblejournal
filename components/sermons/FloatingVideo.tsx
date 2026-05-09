"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Maximize2, X, Play } from "lucide-react";
import { youTubeEmbedUrl, youTubeThumbnail } from "@/lib/youtube-parser";

interface Props {
  videoId: string;
  title: string;
  onClose: () => void;
}

// ── Desktop floating player ───────────────────────────────
export function FloatingVideo({ videoId, title, onClose }: Props) {
  const [minimized, setMinimized] = useState(false);
  const [large, setLarge] = useState(false);

  const w = large ? 440 : 300;
  const h = Math.round(w * 9 / 16);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="fixed z-50 rounded-2xl overflow-hidden select-none"
      style={{
        bottom: 28, right: 28,
        width: w,
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line)",
        boxShadow: "0 16px 48px color-mix(in oklch, var(--bj-ink) 22%, transparent)",
      }}
    >
      {/* Drag handle / title bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{ background: "var(--bj-bg-soft)", borderBottom: "1px solid var(--bj-line-soft)" }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: "var(--bj-gold)" }} />
        <p className="font-sans text-xs flex-1 truncate" style={{ color: "var(--bj-ink3)" }}>
          {title || "Sermon video"}
        </p>
        <button
          onClick={() => setLarge((l) => !l)}
          className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}
          title={large ? "Shrink" : "Enlarge"}
        >
          {large ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
        </button>
        <button
          onClick={() => setMinimized((m) => !m)}
          className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}
          title={minimized ? "Show" : "Minimise"}
        >
          <span style={{ fontSize: 12, lineHeight: 1 }}>—</span>
        </button>
        <button
          onClick={onClose}
          className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}
          title="Close"
        >
          <X size={10} />
        </button>
      </div>

      {/* Video */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: h }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <iframe
              src={youTubeEmbedUrl(videoId)}
              width={w}
              height={h}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: "block", border: "none" }}
              title="Sermon video"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Mobile inline collapsible player ─────────────────────
export function InlineVideo({ videoId, title }: { videoId: string; title: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: "var(--bj-bg-panel)", borderBottom: "1px solid var(--bj-line-soft)" }}>
      {/* Collapsed bar */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-3 w-full px-4 py-3"
      >
        {/* Thumbnail */}
        <div
          className="w-12 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: "var(--bj-bg-soft)" }}
        >
          {videoId ? (
            <img
              src={youTubeThumbnail(videoId)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Play size={14} style={{ color: "var(--bj-ink4)" }} />
          )}
        </div>
        <p className="font-sans text-sm flex-1 text-left truncate" style={{ color: "var(--bj-ink2)" }}>
          {title || "Sermon video"}
        </p>
        <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded embed */}
      <AnimatePresence>
        {expanded && videoId && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "56vw" }} exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden", maxHeight: 260 }}
          >
            <iframe
              src={youTubeEmbedUrl(videoId)}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: "block", border: "none" }}
              title="Sermon video"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
