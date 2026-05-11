"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, Flame, Pencil, Check, Trash2 } from "lucide-react";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import { TipTapViewer } from "@/components/shared/TipTapViewer";
import { TestimonyDialog } from "@/components/prayer/TestimonyDialog";
import { usePrayers } from "@/hooks/usePrayers";
import { updatePrayer, markAnswered, deletePrayer } from "@/services/prayer.service";
import { useAuthStore } from "@/store/auth.store";

function formatDate(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function PrayerWritingPage() {
  const params = useParams();
  const prayerId = params.id as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { prayers, loading } = usePrayers();
  const prayer = prayers.find((p) => p.id === prayerId) ?? null;
  const isAnswered = prayer?.status === "answered";

  const [localTitle, setLocalTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [testimonyOpen, setTestimonyOpen] = useState(false);
  const hasInit = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prayer && !hasInit.current) {
      hasInit.current = true;
      setLocalTitle(prayer.title);
      // Auto-enter edit mode for new prayers with no title
      if (!prayer.title.trim() && !isAnswered) setEditing(true);
    }
  }, [prayer, isAnswered]);

  const scheduleSave = useCallback(
    (patch: { title?: string; body?: string }) => {
      if (!user) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus("saving");
      saveTimer.current = setTimeout(async () => {
        await updatePrayer(user.uid, prayerId, patch);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 1200);
    },
    [user, prayerId]
  );

  function handleTitleChange(v: string) { setLocalTitle(v); scheduleSave({ title: v }); }
  function handleBodyChange(json: string) { scheduleSave({ body: json }); }

  async function handleDelete() {
    if (!user) return;
    await deletePrayer(user.uid, prayerId);
    router.push("/prayer");
  }

  async function handleMarkAnswered(testimony: string) {
    if (!user) return;
    await markAnswered(user.uid, prayerId, testimony);
  }

  const accentColor = isAnswered ? "var(--bj-sage)" : "var(--bj-ember)";

  if (!loading && !prayer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>Prayer not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full" style={{ background: "var(--bj-bg)" }}>

        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 md:px-6 border-b shrink-0"
          style={{
            height: 52,
            background: "color-mix(in oklch, var(--bj-bg-panel) 96%, transparent)",
            backdropFilter: "blur(12px)",
            borderColor: "var(--bj-line-soft)",
          }}
        >
          <button
            onClick={() => router.push("/prayer")}
            className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0"
            style={{ color: "var(--bj-ink3)" }}
          >
            <ArrowLeft size={15} />
            <span className="font-sans text-sm hidden sm:inline">Prayer Journal</span>
          </button>

          <div className="flex-1 min-w-0 text-center">
            <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)" }}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : ""}
            </p>
          </div>

          {/* Mark answered — only for active prayers in view mode */}
          {!isAnswered && prayer && !editing && (
            <button
              onClick={() => setTestimonyOpen(true)}
              className="bj-chip font-sans text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
              style={{
                background: "var(--bj-sage-tint)",
                color: "var(--bj-sage)",
                border: "1px solid color-mix(in oklch, var(--bj-sage) 30%, transparent)",
                minHeight: 34,
              }}
            >
              <CheckCircle2 size={12} />
              <span className="hidden sm:inline">Mark answered</span>
            </button>
          )}

          {/* Edit / Done toggle — only for active prayers */}
          {!isAnswered && prayer && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="bj-chip font-sans text-sm px-4 py-2 rounded-xl flex items-center gap-2 shrink-0"
              style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
            >
              <Pencil size={13} /> Edit
            </button>
          )}

          {!isAnswered && prayer && editing && (
            <button
              onClick={() => setEditing(false)}
              className="bj-chip font-sans text-sm px-4 py-2 rounded-xl flex items-center gap-2 shrink-0"
              style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
            >
              <Check size={13} /> Done
            </button>
          )}

          <button
            onClick={handleDelete}
            className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            data-danger style={{ color: "var(--bj-ink4)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Title + meta */}
        {loading || !prayer ? (
          <div className="px-5 md:px-16 pt-8 animate-pulse shrink-0" style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
            <div className="h-9 rounded-xl w-1/2 mb-3" style={{ background: "var(--bj-bg-soft)" }} />
            <div className="h-4 rounded-xl w-1/4" style={{ background: "var(--bj-bg-soft)" }} />
          </div>
        ) : (
          <div
            className="px-5 md:px-16 pt-7 md:pt-9 pb-5 border-b shrink-0"
            style={{
              maxWidth: 760, margin: "0 auto", width: "100%",
              borderColor: isAnswered ? "color-mix(in oklch, var(--bj-sage) 20%, transparent)" : "var(--bj-line-soft)",
              background: "var(--bj-bg-panel)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: isAnswered ? "var(--bj-sage-tint)" : "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                }}
              >
                {isAnswered
                  ? <CheckCircle2 size={20} style={{ color: accentColor }} />
                  : <Flame size={20} style={{ color: accentColor }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                {editing && !isAnswered ? (
                  <input
                    value={localTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="What are you praying about?"
                    className="w-full bg-transparent outline-none font-sans font-bold"
                    style={{
                      fontSize: "clamp(1.3rem, 4vw, 1.9rem)",
                      color: "var(--bj-ink)",
                      caretColor: "var(--bj-gold)",
                      lineHeight: 1.2,
                    }}
                  />
                ) : (
                  <p
                    className="font-sans font-bold leading-snug"
                    style={{
                      fontSize: "clamp(1.3rem, 4vw, 1.9rem)",
                      color: localTitle ? "var(--bj-ink)" : "var(--bj-ink4)",
                      fontStyle: localTitle ? "normal" : "italic",
                    }}
                  >
                    {localTitle || "Untitled prayer"}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2">
                  {isAnswered ? (
                    <span className="font-sans text-sm font-medium" style={{ color: accentColor }}>
                      Answered · {formatDate(prayer.answeredAt ?? prayer.updatedAt)}
                    </span>
                  ) : (
                    <>
                      <Clock size={12} style={{ color: "var(--bj-ink4)" }} />
                      <span className="font-sans text-sm" style={{ color: "var(--bj-ink4)" }}>
                        Since {formatDate(prayer.createdAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        {prayer && (
          <AnimatePresence mode="wait">
            {isAnswered ? (
              /* Answered — always read-only */
              <motion.div key="answered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto">
                <TipTapViewer content={prayer.body} fontKey="prayer" />
                {prayer.testimony && (
                  <div
                    className="mx-5 md:mx-16 mb-16 px-6 py-5 rounded-2xl"
                    style={{
                      background: "var(--bj-sage-tint)",
                      border: "1px solid color-mix(in oklch, var(--bj-sage) 25%, transparent)",
                    }}
                  >
                    <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-sage)" }}>
                      Testimony
                    </p>
                    <TipTapViewer content={prayer.testimony} fontKey="prayer" />
                  </div>
                )}
              </motion.div>
            ) : editing ? (
              /* Edit mode */
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 overflow-hidden">
                <TipTapEditor
                  key={prayer.id}
                  entryId={prayer.id}
                  content={prayer.body}
                  onChange={handleBodyChange}
                  fontKey="prayer"
                  autoFocus
                />
              </motion.div>
            ) : (
              /* View mode */
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 overflow-y-auto" onDoubleClick={() => setEditing(true)}>
                {prayer.body ? (
                  <TipTapViewer content={prayer.body} fontKey="prayer" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                    <p className="font-display italic text-lg" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                      Nothing written yet
                    </p>
                    <button
                      onClick={() => setEditing(true)}
                      className="font-sans text-sm px-4 py-2 rounded-xl flex items-center gap-2"
                      style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                    >
                      <Pencil size={13} /> Start writing
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <TestimonyDialog
        open={testimonyOpen}
        prayer={prayer}
        onClose={() => setTestimonyOpen(false)}
        onConfirm={handleMarkAnswered}
      />
    </>
  );
}
