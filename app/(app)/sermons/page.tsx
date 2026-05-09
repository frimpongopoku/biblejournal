"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mic, Play } from "lucide-react";
import { useSermons } from "@/hooks/useSermons";
import { createSermon, deleteSermon } from "@/services/sermon.service";
import { useAuthStore } from "@/store/auth.store";
import { youTubeThumbnail } from "@/lib/youtube-parser";

function formatDate(s: string) {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function SermonsPage() {
  const user = useAuthStore((s) => s.user);
  const { sermons, loading } = useSermons();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleNew() {
    if (!user || creating) return;
    setCreating(true);
    const id = await createSermon(user.uid);
    router.push(`/sermons/${id}`);
  }

  return (
    <div className="min-h-full px-5 md:px-12 py-8 md:py-10" style={{ background: "var(--bj-bg)", maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display" style={{ fontSize: "clamp(1.7rem, 5vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400 }}>
            Sermons
          </h1>
          <p className="font-sans text-sm mt-1" style={{ color: "var(--bj-ink3)" }}>
            {sermons.length > 0 ? `${sermons.length} sermon${sermons.length !== 1 ? "s" : ""} noted` : "Follow sermons. Take notes."}
          </p>
        </div>
        <button
          onClick={handleNew}
          disabled={creating}
          className="bj-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0 disabled:opacity-50"
          style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Sermon</span>
          <span className="sm:hidden">New</span>
        </button>
      </motion.div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && sermons.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
            <Mic size={28} style={{ color: "var(--bj-gold)" }} />
          </div>
          <div>
            <p className="font-display italic text-xl mb-2" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
              Follow the sermon. Capture the moment.
            </p>
            <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
              Paste a YouTube link, take rich notes, and reference scripture as you listen.
            </p>
          </div>
          <button
            onClick={handleNew}
            disabled={creating}
            className="bj-btn-primary font-sans text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50"
            style={{ background: "var(--bj-gold)", color: "white" }}
          >
            <Plus size={14} /> Start your first sermon notes
          </button>
        </motion.div>
      )}

      {/* Sermon grid */}
      {!loading && sermons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {sermons.map((sermon, i) => (
              <motion.div
                key={sermon.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() => router.push(`/sermons/${sermon.id}`)}
                className="bj-list-row rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: "var(--bj-bg-panel)",
                  border: "1px solid var(--bj-line-soft)",
                  boxShadow: "0 1px 4px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
                }}
              >
                {/* Thumbnail */}
                {sermon.videoId ? (
                  <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                    <img
                      src={youTubeThumbnail(sermon.videoId)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "color-mix(in oklch, #000 35%, transparent)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "color-mix(in oklch, #fff 85%, transparent)" }}>
                        <Play size={16} style={{ color: "#000", marginLeft: 2 }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center" style={{ aspectRatio: "16/9", background: "var(--bj-bg-soft)" }}>
                    <Mic size={24} style={{ color: "var(--bj-ink4)" }} />
                  </div>
                )}

                {/* Info */}
                <div className="px-4 py-3">
                  <p className="font-sans font-semibold text-sm leading-snug mb-1" style={{ color: "var(--bj-ink)" }}>
                    {sermon.title || <span style={{ color: "var(--bj-ink4)" }}>Untitled sermon</span>}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {sermon.speaker && (
                      <span className="font-sans text-xs" style={{ color: "var(--bj-ink3)" }}>{sermon.speaker}</span>
                    )}
                    {sermon.speaker && sermon.sermonDate && (
                      <span style={{ color: "var(--bj-ink4)", fontSize: 10 }}>·</span>
                    )}
                    {sermon.sermonDate && (
                      <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{formatDate(sermon.sermonDate)}</span>
                    )}
                    {sermon.references.length > 0 && (
                      <>
                        <span style={{ color: "var(--bj-ink4)", fontSize: 10 }}>·</span>
                        <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                          {sermon.references.length} ref{sermon.references.length !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
