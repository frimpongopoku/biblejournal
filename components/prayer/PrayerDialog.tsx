"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Prayer } from "@/types";

interface Props {
  open: boolean;
  prayer?: Prayer | null;
  onClose: () => void;
  onSave: (title: string, body: string) => Promise<void>;
}

export function PrayerDialog({ open, prayer, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const isEdit = !!prayer;

  useEffect(() => {
    if (open) {
      setTitle(prayer?.title ?? "");
      setBody(prayer?.body ?? "");
      setSaving(false);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open, prayer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim(), body.trim());
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "color-mix(in oklch, var(--bj-ink) 40%, transparent)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed z-50 left-1/2 top-1/2 w-full"
            style={{
              maxWidth: 480,
              transform: "translate(-50%, -50%)",
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line)",
                boxShadow: "0 24px 64px color-mix(in oklch, var(--bj-ink) 22%, transparent)",
                margin: "0 16px",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: "var(--bj-line-soft)" }}
              >
                <h2
                  className="font-display"
                  style={{ fontSize: "1.2rem", color: "var(--bj-ink)", fontWeight: 400 }}
                >
                  {isEdit ? "Edit Prayer" : "New Prayer"}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-sans text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Subject
                  </label>
                  <input
                    ref={titleRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wisdom for this decision"
                    className="w-full font-sans text-sm px-3 py-2.5 rounded-xl outline-none"
                    style={{
                      background: "var(--bj-bg-soft)",
                      border: "1px solid var(--bj-line-soft)",
                      color: "var(--bj-ink)",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-sans text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Your prayer
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your prayer…"
                    rows={5}
                    className="w-full font-display italic text-base px-3 py-2.5 rounded-xl outline-none resize-none leading-relaxed"
                    style={{
                      background: "var(--bj-bg-soft)",
                      border: "1px solid var(--bj-line-soft)",
                      color: "var(--bj-ink2)",
                      fontWeight: 300,
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end gap-2 px-6 py-4 border-t"
                style={{ borderColor: "var(--bj-line-soft)" }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="bj-btn-ghost font-sans text-sm px-4 py-2 rounded-xl"
                  style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="bj-btn-primary font-sans text-sm px-4 py-2 rounded-xl disabled:opacity-50"
                  style={{ background: "var(--bj-gold)", color: "white" }}
                >
                  {saving ? "Saving…" : isEdit ? "Save changes" : "Add Prayer"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
