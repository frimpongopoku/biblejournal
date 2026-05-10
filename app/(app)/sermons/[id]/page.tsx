"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Tv2, BookOpen, X, Trash2, Calendar } from "lucide-react";
import { useSermonDetail } from "@/hooks/useSermons";
import {
  updateSermon, deleteSermon,
  addSermonRef, updateSermonRef, removeSermonRef,
} from "@/services/sermon.service";
import { useAuthStore } from "@/store/auth.store";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import { FloatingVideo, InlineVideo } from "@/components/sermons/FloatingVideo";
import { VerseRefPanel } from "@/components/sermons/VerseRefPanel";
import { FloatingBible, FloatingAsk, JournalFloatTriggers } from "@/components/journal/FloatingWindows";
import { extractYouTubeId } from "@/lib/youtube-parser";
import type { SermonRef } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SermonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { sermon, loading } = useSermonDetail(id);

  // Local editable fields
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [church, setChurch] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sermonDate, setSermonDate] = useState("");
  const [videoId, setVideoId] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [showPanel, setShowPanel] = useState(false); // mobile ref sheet
  const [showDesktopPanel, setShowDesktopPanel] = useState(true);
  const [bibleOpen, setBibleOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialised = useRef(false);

  // Sync from Firestore (only on first load)
  useEffect(() => {
    if (!sermon || initialised.current) return;
    initialised.current = true;
    setTitle(sermon.title);
    setSpeaker(sermon.speaker);
    setChurch(sermon.church);
    setVideoUrl(sermon.videoUrl);
    setSermonDate(sermon.sermonDate);
    setVideoId(sermon.videoId);
    if (sermon.videoId) setShowVideo(true);
  }, [sermon]);

  const scheduleSave = useCallback((patch: object) => {
    if (!user) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => updateSermon(user.uid, id, patch), 1200);
  }, [user, id]);

  function handleTitleChange(v: string) {
    setTitle(v);
    scheduleSave({ title: v });
  }
  function handleSpeakerChange(v: string) {
    setSpeaker(v);
    scheduleSave({ speaker: v });
  }
  function handleChurchChange(v: string) {
    setChurch(v);
    scheduleSave({ church: v });
  }
  function handleDateChange(v: string) {
    setSermonDate(v);
    scheduleSave({ sermonDate: v });
  }
  function handleVideoUrlChange(v: string) {
    setVideoUrl(v);
    const vid = extractYouTubeId(v);
    setVideoId(vid ?? "");
    if (vid) setShowVideo(true);
    scheduleSave({ videoUrl: v, videoId: vid ?? "" });
  }
  function handleContentChange(json: string) {
    scheduleSave({ content: json });
  }

  async function handleDelete() {
    if (!user) return;
    await deleteSermon(user.uid, id);
    router.push("/sermons");
  }

  async function handleAddRef(ref: SermonRef) {
    if (!user || !sermon) return;
    await addSermonRef(user.uid, id, sermon.references, ref);
  }
  async function handleUpdateRef(refId: string, note: string) {
    if (!user || !sermon) return;
    await updateSermonRef(user.uid, id, sermon.references, refId, note);
  }
  async function handleRemoveRef(refId: string) {
    if (!user || !sermon) return;
    await removeSermonRef(user.uid, id, sermon.references, refId);
  }

  if (!loading && !sermon) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
          Sermon not found.
        </p>
      </div>
    );
  }

  const refs = sermon?.references ?? [];

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bj-bg)" }}>

      {/* ── Sticky header ─────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 border-b shrink-0"
        style={{
          background: "color-mix(in oklch, var(--bj-bg-panel) 94%, transparent)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--bj-line-soft)",
        }}
      >
        <div className="px-4 md:px-6 py-3 flex flex-col gap-2">
          {/* Top row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/sermons")}
              className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ArrowLeft size={16} />
            </button>

            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Sermon title…"
              className="flex-1 bg-transparent outline-none font-display font-medium min-w-0"
              style={{
                fontSize: "clamp(1rem, 4vw, 1.25rem)",
                color: "var(--bj-ink)",
                caretColor: "var(--bj-gold)",
                lineHeight: 1.2,
              }}
            />

            {/* Desktop: toggle ref panel */}
            <button
              onClick={() => setShowDesktopPanel((p) => !p)}
              title="Verse references"
              className="bj-btn-icon hidden md:flex w-8 h-8 rounded-lg items-center justify-center shrink-0"
              style={{ color: showDesktopPanel ? "var(--bj-gold)" : "var(--bj-ink4)" }}
            >
              <BookOpen size={15} />
            </button>

            {/* Video toggle */}
            <button
              onClick={() => videoId ? setShowVideo((v) => !v) : setEditingUrl(true)}
              title={videoId ? "Toggle video" : "Add video link"}
              className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: videoId && showVideo ? "var(--bj-gold)" : "var(--bj-ink4)" }}
            >
              <Tv2 size={15} />
            </button>

            {/* Floating window triggers */}
            <JournalFloatTriggers
              bibleOpen={bibleOpen} askOpen={askOpen}
              onToggleBible={() => setBibleOpen((o) => !o)}
              onToggleAsk={() => setAskOpen((o) => !o)}
            />

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              data-danger
              style={{ color: "var(--bj-ink4)" }}
              title="Delete sermon"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Meta row — speaker, church, date */}
          <div className="flex items-center gap-2 flex-wrap pl-10">
            <input
              value={speaker}
              onChange={(e) => handleSpeakerChange(e.target.value)}
              placeholder="Speaker"
              className="bg-transparent outline-none font-sans text-xs"
              style={{ color: "var(--bj-ink3)", caretColor: "var(--bj-gold)", minWidth: 80, width: `${Math.max(80, speaker.length * 7.5 + 16)}px` }}
            />
            <span style={{ color: "var(--bj-line)", fontSize: 14 }}>·</span>
            <input
              value={church}
              onChange={(e) => handleChurchChange(e.target.value)}
              placeholder="Church"
              className="bg-transparent outline-none font-sans text-xs"
              style={{ color: "var(--bj-ink3)", caretColor: "var(--bj-gold)", minWidth: 60, width: `${Math.max(60, church.length * 7.5 + 16)}px` }}
            />
            <span style={{ color: "var(--bj-line)", fontSize: 14 }}>·</span>
            <div className="flex items-center gap-1">
              <Calendar size={10} style={{ color: "var(--bj-ink4)" }} />
              <input
                type="date"
                value={sermonDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent outline-none font-sans text-xs"
                style={{ color: "var(--bj-ink4)", caretColor: "var(--bj-gold)" }}
              />
            </div>
          </div>

          {/* Video URL input — appears when editingUrl */}
          <AnimatePresence>
            {(editingUrl || (!videoId && videoUrl)) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                className="overflow-hidden pl-10"
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <Tv2 size={11} style={{ color: "var(--bj-ink4)", flexShrink: 0 }} />
                  <input
                    value={videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="Paste YouTube link…"
                    className="flex-1 bg-transparent outline-none font-sans text-xs"
                    style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                    autoFocus
                    onBlur={() => setEditingUrl(false)}
                  />
                  {videoUrl && (
                    <button onClick={() => { handleVideoUrlChange(""); setEditingUrl(false); }} className="bj-btn-icon w-4 h-4 flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                      <X size={9} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Main editor area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Mobile inline video */}
          {videoId && (
            <div className="md:hidden shrink-0">
              <InlineVideo videoId={videoId} title={title} />
            </div>
          )}

          {/* TipTap editor */}
          {loading ? (
            <div className="flex-1 px-6 py-8 flex flex-col gap-4">
              {[80, 60, 90, 50, 70].map((w, i) => (
                <div key={i} className="h-5 rounded-lg animate-pulse" style={{ background: "var(--bj-bg-soft)", width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <TipTapEditor
                entryId={id}
                content={sermon?.content ?? JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] })}
                onChange={handleContentChange}
                fontKey="sermon"
              />
            </div>
          )}
        </div>

        {/* Desktop right rail — verse references */}
        <AnimatePresence>
          {showDesktopPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ ease: EASE_OUT, duration: 0.25 }}
              className="hidden md:flex flex-col shrink-0 border-l overflow-hidden"
              style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
            >
              <VerseRefPanel
                refs={refs}
                onAdd={handleAddRef}
                onUpdateNote={handleUpdateRef}
                onRemove={handleRemoveRef}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile FAB — verse references */}
      <button
        onClick={() => setShowPanel(true)}
        className="bj-btn-primary md:hidden fixed bottom-24 right-5 z-30 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: "var(--bj-gold)",
          boxShadow: "0 4px 16px color-mix(in oklch, var(--bj-gold) 45%, transparent)",
        }}
        title="Verse references"
      >
        <BookOpen size={18} color="white" />
        {refs.length > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold"
            style={{ background: "var(--bj-ink)", color: "var(--bj-bg-panel)", fontSize: 9 }}
          >
            {refs.length}
          </span>
        )}
      </button>

      {/* Mobile verse ref bottom sheet */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "color-mix(in oklch, var(--bj-ink) 14%, transparent)", cursor: "pointer" }}
              onClick={() => setShowPanel(false)}
              onTouchEnd={(e) => { e.preventDefault(); setShowPanel(false); }}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ ease: EASE_OUT, duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl overflow-hidden"
              style={{
                background: "var(--bj-bg-panel)",
                borderTop: "1px solid var(--bj-line)",
                boxShadow: "0 -8px 40px color-mix(in oklch, var(--bj-ink) 16%, transparent)",
                height: "72vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-8 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
              </div>
              <div className="flex-1 overflow-hidden">
                <VerseRefPanel
                  refs={refs}
                  onAdd={handleAddRef}
                  onUpdateNote={handleUpdateRef}
                  onRemove={handleRemoveRef}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bible + Ask */}
      {bibleOpen && <FloatingBible onClose={() => setBibleOpen(false)} />}
      {askOpen && <FloatingAsk onClose={() => setAskOpen(false)} />}

      {/* Desktop floating video */}
      <AnimatePresence>
        {videoId && showVideo && (
          <div className="hidden md:block">
            <FloatingVideo
              videoId={videoId}
              title={title}
              onClose={() => setShowVideo(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
