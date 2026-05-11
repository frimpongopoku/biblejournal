"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Pencil, Trash2, Check } from "lucide-react";
import { fontPairs, type FontPairId } from "@/lib/fonts";
import { SimpleRichEditor } from "@/components/shared/SimpleRichEditor";
import type { ProclamationEntry } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

function BodyDisplay({
  body,
  fontFamily,
  fontStyle,
  fontSize,
  color,
}: {
  body: string;
  fontFamily: string;
  fontStyle: string;
  fontSize: number;
  color: string;
}) {
  if (!body) return null;
  const isHtml = body.trimStart().startsWith("<");
  const sharedStyle: React.CSSProperties = {
    fontFamily, fontStyle, fontSize, color,
    lineHeight: 1.95, letterSpacing: "0.01em",
  };
  if (isHtml) {
    return (
      <div
        className="bj-simple-editor"
        dangerouslySetInnerHTML={{ __html: body }}
        style={sharedStyle}
      />
    );
  }
  return <p style={{ whiteSpace: "pre-wrap", ...sharedStyle }}>{body}</p>;
}

interface Props {
  entry: ProclamationEntry | null;
  index: number;
  open: boolean;
  onClose: () => void;
  onUpdate: (title: string, body: string) => Promise<void>;
  onDelete: () => Promise<void>;
  fontId: FontPairId;
  fontSize: number;
}

export function ProclamationEntryModal({
  entry, index, open, onClose, onUpdate, onDelete, fontId, fontSize,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];
  const fontFamily = `var(${pair.displayVar})`;
  const fontStyle = fontId === "dyslexic" ? "normal" : "italic";

  function resetState() {
    setEditing(false);
    setConfirmDelete(false);
  }

  function startEdit() {
    if (!entry) return;
    setEditTitle(entry.title);
    setEditBody(entry.body);
    setEditing(true);
    setConfirmDelete(false);
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    setSaving(true);
    await onUpdate(editTitle.trim(), editBody);
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    setSaving(true);
    await onDelete();
    setSaving(false);
    onClose();
  }

  function handleClose() {
    resetState();
    onClose();
  }

  return (
    <AnimatePresence onExitComplete={resetState}>
      {open && entry && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={handleClose}
          />

          {/* Sheet: bottom on mobile, centered on desktop */}
          <motion.div
            key="modal"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ ease: EASE_OUT, duration: 0.32 }}
            className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
              style={{
                maxWidth: 760,
                height: "92dvh",
                maxHeight: "92dvh",
                /* on sm+: let CSS clamp the height */
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line)",
                boxShadow: "0 -8px 60px color-mix(in oklch, var(--bj-ink) 18%, transparent), 0 32px 80px color-mix(in oklch, var(--bj-ink) 24%, transparent)",
                pointerEvents: "auto",
              }}
            >
              {/* Drag handle (mobile only) */}
              <div className="flex justify-center pt-3 pb-0 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
              </div>

              {/* Header */}
              <div
                className="flex items-start gap-4 px-6 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b shrink-0"
                style={{ borderColor: "var(--bj-line-soft)" }}
              >
                <span
                  className="font-sans font-bold shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mt-0.5"
                  style={{ background: "var(--bj-gold)", color: "white", fontSize: 12 }}
                >
                  {index + 1}
                </span>

                {editing ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent outline-none font-sans font-bold leading-snug"
                    style={{
                      fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
                      color: "var(--bj-ink)",
                      caretColor: "var(--bj-gold)",
                    }}
                  />
                ) : (
                  <p
                    className="font-sans font-semibold flex-1 leading-snug"
                    style={{ fontSize: "clamp(1.1rem, 3vw, 1.35rem)", color: "var(--bj-ink)" }}
                  >
                    {entry.title}
                  </p>
                )}

                <button
                  onClick={handleClose}
                  className="bj-btn-icon w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-7">
                {editing ? (
                  <SimpleRichEditor
                    key={entry.id + "-edit"}
                    initialValue={editBody}
                    onChange={setEditBody}
                    placeholder="Reflection, scripture, context…"
                    style={{
                      fontFamily,
                      fontStyle,
                      fontSize: Math.max(fontSize, 16),
                      color: "var(--bj-ink2)",
                      minHeight: 200,
                    }}
                  />
                ) : entry.body ? (
                  <BodyDisplay
                    body={entry.body}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fontSize={Math.max(fontSize, 16)}
                    color="var(--bj-ink2)"
                  />
                ) : (
                  <p className="font-sans text-sm italic" style={{ color: "var(--bj-ink4)" }}>
                    No body text — tap Edit to add one.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center gap-2 px-6 sm:px-8 py-4 sm:py-5 border-t shrink-0"
                style={{
                  borderColor: "var(--bj-line-soft)",
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="bj-btn-ghost font-sans text-sm px-5 py-3 rounded-xl"
                      style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving || !editTitle.trim()}
                      className="bj-btn-primary font-sans text-sm px-6 py-3 rounded-xl flex-1 disabled:opacity-50"
                      style={{ background: "var(--bj-gold)", color: "white" }}
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </>
                ) : confirmDelete ? (
                  <>
                    <p className="font-sans text-sm flex-1" style={{ color: "var(--bj-ink3)" }}>
                      Delete this declaration?
                    </p>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="bj-btn-ghost font-sans text-sm px-4 py-3 rounded-xl"
                      style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={saving}
                      className="bj-btn-primary font-sans text-sm px-5 py-3 rounded-xl disabled:opacity-50"
                      style={{ background: "var(--bj-ember)", color: "white" }}
                    >
                      {saving ? "Deleting…" : "Delete"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={startEdit}
                      className="bj-chip font-sans text-sm px-5 py-3 rounded-xl flex items-center gap-2 min-h-[44px]"
                      style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="bj-chip font-sans text-sm px-5 py-3 rounded-xl flex items-center gap-2 min-h-[44px]"
                      style={{
                        color: "var(--bj-ember)",
                        border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                        background: "color-mix(in oklch, var(--bj-ember) 8%, transparent)",
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={handleClose}
                      className="bj-chip font-sans text-sm px-5 py-3 rounded-xl flex items-center gap-2 min-h-[44px]"
                      style={{
                        background: "var(--bj-gold)",
                        color: "white",
                      }}
                    >
                      <Check size={14} /> Done
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
