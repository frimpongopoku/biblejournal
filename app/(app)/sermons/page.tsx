"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Plus, Mic, Play, Search, X, LayoutGrid, List } from "lucide-react";
import { useSermons } from "@/hooks/useSermons";
import { createSermon } from "@/services/sermon.service";
import { useAuthStore } from "@/store/auth.store";
import { youTubeThumbnail } from "@/lib/youtube-parser";
import type { Sermon } from "@/types";

function formatDate(s: string) {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function matches(sermon: Sermon, q: string) {
  const lower = q.toLowerCase();
  return (
    sermon.title.toLowerCase().includes(lower) ||
    sermon.speaker.toLowerCase().includes(lower) ||
    sermon.church.toLowerCase().includes(lower)
  );
}

// ── Grid card ─────────────────────────────────────────────

function GridCard({ sermon, onClick, index }: { sermon: Sermon; onClick: () => void; index: number }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.22 }}
      onClick={onClick}
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
          <img src={youTubeThumbnail(sermon.videoId)} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "color-mix(in oklch, #000 32%, transparent)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "color-mix(in oklch, #fff 88%, transparent)" }}>
              <Play size={14} style={{ color: "#000", marginLeft: 2 }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center" style={{ aspectRatio: "16/9", background: "var(--bj-bg-soft)" }}>
          <Mic size={22} style={{ color: "var(--bj-ink4)" }} />
        </div>
      )}

      {/* Info */}
      <div className="px-4 py-3">
        <p className="font-sans font-semibold text-sm leading-snug mb-1 truncate" style={{ color: "var(--bj-ink)" }}>
          {sermon.title || <span style={{ color: "var(--bj-ink4)" }}>Untitled sermon</span>}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {sermon.speaker && <span className="font-sans text-xs truncate" style={{ color: "var(--bj-ink3)" }}>{sermon.speaker}</span>}
          {sermon.speaker && sermon.sermonDate && <span style={{ color: "var(--bj-ink4)", fontSize: 10 }}>·</span>}
          {sermon.sermonDate && <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{formatDate(sermon.sermonDate)}</span>}
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
  );
}

// ── List row ──────────────────────────────────────────────

function ListRow({ sermon, onClick, index }: { sermon: Sermon; onClick: () => void; index: number }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      onClick={onClick}
      className="bj-list-row flex items-center gap-4 px-4 py-3 border-b cursor-pointer"
      style={{ borderColor: "var(--bj-line-soft)", minHeight: 68 }}
    >
      {/* Thumbnail — compact */}
      <div
        className="shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ width: 80, height: 46, background: "var(--bj-bg-soft)", flexShrink: 0 }}
      >
        {sermon.videoId ? (
          <img src={youTubeThumbnail(sermon.videoId)} alt="" className="w-full h-full object-cover" />
        ) : (
          <Mic size={16} style={{ color: "var(--bj-ink4)" }} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-sm leading-snug truncate mb-0.5" style={{ color: "var(--bj-ink)" }}>
          {sermon.title || <span style={{ color: "var(--bj-ink4)" }}>Untitled sermon</span>}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {sermon.speaker && <span className="font-sans text-xs" style={{ color: "var(--bj-ink3)" }}>{sermon.speaker}</span>}
          {sermon.speaker && (sermon.sermonDate || sermon.church) && <span style={{ color: "var(--bj-ink4)", fontSize: 10 }}>·</span>}
          {sermon.church && <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{sermon.church}</span>}
          {sermon.church && sermon.sermonDate && <span style={{ color: "var(--bj-ink4)", fontSize: 10 }}>·</span>}
          {sermon.sermonDate && <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{formatDate(sermon.sermonDate)}</span>}
        </div>
      </div>

      {/* Refs badge */}
      {sermon.references.length > 0 && (
        <span
          className="font-sans text-[10px] px-2 py-0.5 rounded-full shrink-0"
          style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
        >
          {sermon.references.length} ref{sermon.references.length !== 1 ? "s" : ""}
        </span>
      )}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function SermonsPage() {
  const user = useAuthStore((s) => s.user);
  const { sermons, loading } = useSermons();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem("bj-sermon-view");
    if (saved === "list" || saved === "grid") setView(saved);
  }, []);

  function handleViewChange(v: "grid" | "list") {
    setView(v);
    localStorage.setItem("bj-sermon-view", v);
  }

  const filtered = search.trim()
    ? sermons.filter((s) => matches(s, search.trim()))
    : sermons;

  async function handleNew() {
    if (!user || creating) return;
    setCreating(true);
    const id = await createSermon(user.uid);
    router.push(`/sermons/${id}`);
  }

  return (
    <div className="min-h-full px-5 md:px-12 py-8 md:py-10" style={{ background: "var(--bj-bg)", maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display" style={{ fontSize: "clamp(1.7rem, 5vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400 }}>
            Sermons
          </h1>
          <p className="font-sans text-sm mt-1" style={{ color: "var(--bj-ink3)" }}>
            {sermons.length > 0
              ? `${sermons.length} sermon${sermons.length !== 1 ? "s" : ""}${search ? ` · ${filtered.length} match${filtered.length !== 1 ? "es" : ""}` : ""}`
              : "Follow sermons. Take notes."}
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

      {/* Search + view toggle toolbar */}
      {!loading && sermons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex items-center gap-3 mb-6"
        >
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl"
            style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
          >
            <Search size={13} style={{ color: "var(--bj-ink4)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, speaker, or church…"
              className="flex-1 bg-transparent outline-none font-sans text-sm"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center"
                style={{ color: "var(--bj-ink4)" }}
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div
            className="flex gap-1 p-1 rounded-xl shrink-0"
            style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
          >
            <button
              onClick={() => handleViewChange("grid")}
              className="bj-chip w-8 h-8 rounded-lg flex items-center justify-center"
              data-active={view === "grid" || undefined}
              style={{
                background: view === "grid" ? "var(--bj-gold)" : "transparent",
                color: view === "grid" ? "white" : "var(--bj-ink4)",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className="bj-chip w-8 h-8 rounded-lg flex items-center justify-center"
              data-active={view === "list" || undefined}
              style={{
                background: view === "list" ? "var(--bj-gold)" : "transparent",
                color: view === "list" ? "white" : "var(--bj-ink4)",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
          ))}
        </div>
      )}

      {/* Empty state — no sermons at all */}
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

      {/* No search results */}
      {!loading && sermons.length > 0 && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="font-display italic text-lg" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
            No sermons match "{search}"
          </p>
          <button
            onClick={() => setSearch("")}
            className="bj-chip font-sans text-sm px-4 py-2 rounded-xl"
            style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
          >
            Clear search
          </button>
        </motion.div>
      )}

      {/* Grid view */}
      {!loading && filtered.length > 0 && view === "grid" && (
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((sermon, i) => (
                <GridCard
                  key={sermon.id}
                  sermon={sermon}
                  index={i}
                  onClick={() => router.push(`/sermons/${sermon.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}

      {/* List view */}
      {!loading && filtered.length > 0 && view === "list" && (
        <LayoutGroup>
          <motion.div
            layout
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((sermon, i) => (
                <ListRow
                  key={sermon.id}
                  sermon={sermon}
                  index={i}
                  onClick={() => router.push(`/sermons/${sermon.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}
    </div>
  );
}
