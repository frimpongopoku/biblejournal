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

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN: [number, number, number, number] = [0.36, 0, 0.66, 0];

export function PrayerDialog({ open, prayer, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(prayer?.title ?? "");
      setBody(prayer?.body ?? "");
      setSaving(false);
      setTimeout(() => titleRef.current?.focus(), 60);
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
          {/* Backdrop — no blur, just dim */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: "color-mix(in oklch, var(--bj-ink) 50%, transparent)" }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ ease: EASE_OUT, duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full"
              style={{ maxWidth: 640 }}
            >
              <div
                className="rounded-t-2xl overflow-hidden"
                style={{
                  background: "var(--bj-bg-panel)",
                  borderTop: "1px solid var(--bj-line)",
                  borderLeft: "1px solid var(--bj-line)",
                  borderRight: "1px solid var(--bj-line)",
                  boxShadow: "0 -8px 40px color-mix(in oklch, var(--bj-ink) 18%, transparent)",
                }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-8 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
                </div>

                {/* Header */}
                <div
                  className="flex items-center justify-between px-6 py-3 border-b"
                  style={{ borderColor: "var(--bj-line-soft)" }}
                >
                  <h2
                    className="font-display"
                    style={{ fontSize: "1.15rem", color: "var(--bj-ink)", fontWeight: 400 }}
                  >
                    Edit Prayer
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Fields */}
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
                      className="w-full font-sans text-sm px-4 py-3 rounded-xl outline-none"
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
                      rows={4}
                      className="w-full font-display italic text-base px-4 py-3 rounded-xl outline-none resize-none leading-relaxed"
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
                  className="flex items-center gap-3 px-6 py-4 border-t"
                  style={{
                    borderColor: "var(--bj-line-soft)",
                    paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                  }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="bj-btn-ghost flex-1 font-sans text-sm py-3 rounded-xl"
                    style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !title.trim()}
                    className="bj-btn-primary flex-1 font-sans text-sm py-3 rounded-xl disabled:opacity-50"
                    style={{ background: "var(--bj-gold)", color: "white" }}
                  >
                    {saving ? "Saving…" : "Save changes"}
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
