"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ProclamationFolder } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  open: boolean;
  folder?: ProclamationFolder | null;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}

export function NewFolderSheet({ open, folder, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = !!folder;

  useEffect(() => {
    if (open) {
      setName(folder?.name ?? "");
      setDescription(folder?.description ?? "");
      setSaving(false);
      setTimeout(() => nameRef.current?.focus(), 60);
    }
  }, [open, folder]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), description.trim());
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.3)", cursor: "pointer" }}
            onClick={onClose}
            onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ ease: EASE_OUT, duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          >
            <form onSubmit={handleSubmit} className="w-full" style={{ maxWidth: 560 }}>
              <div className="rounded-t-2xl overflow-hidden" style={{
                background: "var(--bj-bg-panel)",
                borderTop: "1px solid var(--bj-line)",
                borderLeft: "1px solid var(--bj-line)",
                borderRight: "1px solid var(--bj-line)",
                boxShadow: "0 -8px 40px color-mix(in oklch, var(--bj-ink) 16%, transparent)",
              }}>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-8 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                  <h2 className="font-display" style={{ fontSize: "1.15rem", color: "var(--bj-ink)", fontWeight: 400 }}>
                    {isEdit ? "Edit Folder" : "New Folder"}
                  </h2>
                  <button type="button" onClick={onClose} className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                    <X size={15} />
                  </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs font-medium uppercase tracking-wider" style={{ color: "var(--bj-ink4)" }}>
                      Folder name
                    </label>
                    <input
                      ref={nameRef}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Healing, Identity, Abundance"
                      className="w-full font-sans text-sm px-4 py-3 rounded-xl outline-none"
                      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink)", transition: "border-color 0.15s ease" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs font-medium uppercase tracking-wider" style={{ color: "var(--bj-ink4)" }}>
                      Description <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: 0 }}>(optional · shown publicly)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this folder about?"
                      rows={3}
                      className="w-full font-sans text-sm px-4 py-3 rounded-xl outline-none resize-none leading-relaxed"
                      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink2)", transition: "border-color 0.15s ease" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                    />
                  </div>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--bj-line-soft)", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
                  <button type="button" onClick={onClose} className="bj-btn-ghost flex-1 font-sans text-sm py-3 rounded-xl" style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || !name.trim()} className="bj-btn-primary flex-1 font-sans text-sm py-3 rounded-xl disabled:opacity-50" style={{ background: "var(--bj-gold)", color: "white" }}>
                    {saving ? "Saving…" : isEdit ? "Save changes" : "Create folder"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
