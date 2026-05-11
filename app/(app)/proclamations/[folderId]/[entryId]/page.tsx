"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, Check } from "lucide-react";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import { TipTapViewer } from "@/components/shared/TipTapViewer";
import { useProclamationEntries } from "@/hooks/useProclamationEntries";
import { useProclamationFolders } from "@/hooks/useProclamationFolders";
import {
  updateProclamationEntry,
  deleteProclamationEntry,
} from "@/services/proclamation.service";
import { useAuthStore } from "@/store/auth.store";

export default function EntryWritingPage() {
  const params = useParams();
  const folderId = params.folderId as string;
  const entryId = params.entryId as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { entries, loading } = useProclamationEntries(folderId);
  const { folders } = useProclamationFolders();
  const entry = entries.find((e) => e.id === entryId) ?? null;
  const folder = folders.find((f) => f.id === folderId);
  const entryIndex = entries.findIndex((e) => e.id === entryId);

  const [localTitle, setLocalTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const hasInit = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (entry && !hasInit.current) {
      hasInit.current = true;
      setLocalTitle(entry.title);
      // Auto-enter edit mode for brand-new (no title) entries
      if (!entry.title.trim()) setEditing(true);
    }
  }, [entry]);

  const scheduleSave = useCallback(
    (patch: { title?: string; body?: string }) => {
      if (!user) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus("saving");
      saveTimer.current = setTimeout(async () => {
        await updateProclamationEntry(user.uid, folderId, entryId, patch);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 1200);
    },
    [user, folderId, entryId]
  );

  function handleTitleChange(v: string) {
    setLocalTitle(v);
    scheduleSave({ title: v });
  }

  function handleBodyChange(json: string) {
    scheduleSave({ body: json });
  }

  async function handleDelete() {
    if (!user) return;
    await deleteProclamationEntry(user.uid, folderId, entryId);
    router.push(`/proclamations/${folderId}`);
  }

  if (!loading && !entry) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>Entry not found.</p>
      </div>
    );
  }

  return (
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
          onClick={() => router.push(`/proclamations/${folderId}`)}
          className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0"
          style={{ color: "var(--bj-ink3)" }}
        >
          <ArrowLeft size={15} />
          <span className="font-sans text-sm hidden sm:inline truncate max-w-[160px]">
            {folder?.name ?? "Back"}
          </span>
        </button>

        <div className="flex-1 min-w-0 text-center">
          {entry && (
            <p className="font-sans text-sm truncate" style={{ color: "var(--bj-ink4)" }}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : ""}
            </p>
          )}
        </div>

        {entry && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="bj-chip font-sans text-sm px-4 py-2 rounded-xl flex items-center gap-2 shrink-0"
            style={{
              background: "var(--bj-gold-tint)",
              color: "var(--bj-gold-deep)",
              border: "1px solid var(--bj-gold-soft)",
            }}
          >
            <Pencil size={13} /> Edit
          </button>
        )}

        {entry && editing && (
          <button
            onClick={() => setEditing(false)}
            className="bj-chip font-sans text-sm px-4 py-2 rounded-xl flex items-center gap-2 shrink-0"
            style={{
              background: "var(--bj-bg-soft)",
              color: "var(--bj-ink3)",
              border: "1px solid var(--bj-line-soft)",
            }}
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

      {/* Title */}
      {loading || !entry ? (
        <div className="px-5 md:px-16 pt-8 animate-pulse shrink-0" style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
          <div className="h-10 rounded-xl w-2/3" style={{ background: "var(--bj-bg-soft)" }} />
        </div>
      ) : (
        <div
          className="px-5 md:px-16 pt-7 md:pt-9 pb-5 border-b shrink-0"
          style={{
            maxWidth: 760, margin: "0 auto", width: "100%",
            borderColor: "var(--bj-line-soft)",
            background: "var(--bj-bg-panel)",
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="font-sans font-bold shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--bj-gold)", color: "white", fontSize: 12 }}
            >
              {entryIndex >= 0 ? entryIndex + 1 : "·"}
            </span>

            {editing ? (
              <input
                value={localTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Declare it…"
                className="flex-1 bg-transparent outline-none font-sans font-bold"
                style={{
                  fontSize: "clamp(1.4rem, 4vw, 2rem)",
                  color: "var(--bj-ink)",
                  caretColor: "var(--bj-gold)",
                  lineHeight: 1.2,
                }}
              />
            ) : (
              <p
                className="flex-1 font-sans font-bold leading-snug"
                style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", color: localTitle ? "var(--bj-ink)" : "var(--bj-ink4)", fontStyle: localTitle ? "normal" : "italic" }}
              >
                {localTitle || "Untitled declaration"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      {entry && (
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 overflow-hidden">
              <TipTapEditor
                key={entry.id}
                entryId={entry.id}
                content={entry.body}
                onChange={handleBodyChange}
                fontKey="proclamation"
                autoFocus
              />
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 overflow-y-auto" onDoubleClick={() => setEditing(true)}>
              {entry.body ? (
                <TipTapViewer content={entry.body} fontKey="proclamation" />
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
  );
}
