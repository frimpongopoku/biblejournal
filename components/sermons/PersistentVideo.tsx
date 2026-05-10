"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minimize2, Maximize2, X, EyeOff } from "lucide-react";
import { useVideoStore } from "@/store/video.store";
import { youTubeEmbedUrl } from "@/lib/youtube-parser";

export function PersistentVideo() {
  const { videoId, title, isVisible, setVisible, clearVideo } = useVideoStore();
  const [large, setLarge] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Always in the DOM when videoId is set — never conditionally rendered —
  // so the iframe stays mounted and playback continues across page navigation.
  // We animate it off-screen instead of unmounting when hidden.
  if (!videoId) return null;

  const w = large ? 440 : 300;
  const h = Math.round((w * 9) / 16);

  return (
    <motion.div
      drag
      dragMomentum={false}
      // Slide off-screen below-right when hidden; keep iframe in DOM.
      animate={{
        y: isVisible ? 0 : 340,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="fixed z-[200] rounded-2xl overflow-hidden select-none"
      style={{
        bottom: 28,
        right: 28,
        width: w,
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
      }}
    >
      {/* Title bar / drag handle */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{
          background: "var(--bj-bg-soft)",
          borderBottom: "1px solid var(--bj-line-soft)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: "var(--bj-gold)" }}
        />
        <p
          className="font-sans text-xs flex-1 truncate"
          style={{ color: "var(--bj-ink3)" }}
        >
          {title || "Sermon video"}
        </p>

        {/* Enlarge / shrink */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setLarge((l) => !l)}
          className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}
          title={large ? "Shrink" : "Enlarge"}
        >
          {large ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
        </button>

        {/* Collapse video (keeps playing) */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setMinimized((m) => !m)}
          className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}
          title={minimized ? "Show video" : "Minimise"}
        >
          <span style={{ fontSize: 12, lineHeight: 1, fontWeight: 600 }}>—</span>
        </button>

        {/* Hide player (keeps playing, Tv2 can show it again) */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setVisible(false)}
          className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}
          title="Hide player (keeps playing)"
        >
          <EyeOff size={10} />
        </button>

        {/* Close — stops video */}
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={clearVideo}
          className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
          style={{ color: "var(--bj-ink4)" }}
          title="Close (stops video)"
        >
          <X size={10} />
        </button>
      </div>

      {/* Iframe — always in DOM, height-0 when minimised so audio continues */}
      <div
        style={{
          height: minimized ? 0 : h,
          overflow: "hidden",
          transition: "height 0.2s ease",
        }}
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
      </div>
    </motion.div>
  );
}
