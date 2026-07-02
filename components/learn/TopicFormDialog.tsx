"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createTopic, updateTopic } from "@/services/learning.service";
import { useAuthStore } from "@/store/auth.store";
import type { LearningTopic, TopicStatus } from "@/types";

// ── Color palette ─────────────────────────────────────────

export const TOPIC_COLORS = [
  "#C9A96E", // warm gold
  "#6E9E8A", // sage
  "#C47458", // ember
  "#6E9EB0", // slate
  "#B07BAC", // plum
  "#7B8AC4", // dusk
  "#C4898A", // dusty rose
  "#7A9E6E", // moss
] as const;

// ── Props ─────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: LearningTopic | null;
}

// ── Component ─────────────────────────────────────────────

export function TopicFormDialog({ open, onClose, editing }: Props) {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(TOPIC_COLORS[0]);
  const [status, setStatus] = useState<TopicStatus>("active");
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description);
      setColor(editing.color);
      setStatus(editing.status);
    } else {
      setName("");
      setDescription("");
      setColor(TOPIC_COLORS[0]);
      setStatus("active");
    }
  }, [editing, open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    if (editing) {
      await updateTopic(user.uid, editing.id, { name: name.trim(), description: description.trim(), color, status });
    } else {
      await createTopic(user.uid, { name: name.trim(), description: description.trim(), color, status });
    }
    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="topic-bd"
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            key="topic-dialog"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <motion.div
              className="w-full rounded-2xl overflow-hidden flex flex-col"
              style={{
                maxWidth: 480,
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line)",
                boxShadow: "0 24px 64px color-mix(in oklch, var(--bj-ink) 22%, transparent)",
                pointerEvents: "auto",
              }}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.22 }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-5 py-4 border-b"
                style={{ borderColor: "var(--bj-line-soft)" }}
              >
                {/* Color preview */}
                <div className="w-5 h-5 rounded-md shrink-0" style={{ background: color }} />
                <h2 className="font-display text-base flex-1" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>
                  {editing ? "Edit topic" : "New learning topic"}
                </h2>
                <button
                  onClick={onClose}
                  className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form */}
              <div className="px-5 py-5 flex flex-col gap-5">
                {/* Name */}
                <div>
                  <label
                    className="block font-sans text-[11px] uppercase tracking-widest mb-2"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Understanding Grace"
                    autoFocus
                    className="w-full rounded-xl px-4 py-2.5 font-sans text-sm outline-none"
                    style={{
                      background: "var(--bj-bg-soft)",
                      border: "1px solid var(--bj-line-soft)",
                      color: "var(--bj-ink)",
                      transition: "border-color 0.14s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold-soft)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="block font-sans text-[11px] uppercase tracking-widest mb-2"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Why are you studying this?{" "}
                    <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's driving this study? What do you want to understand?"
                    rows={2}
                    className="w-full resize-none rounded-xl px-4 py-2.5 font-sans text-sm outline-none"
                    style={{
                      background: "var(--bj-bg-soft)",
                      border: "1px solid var(--bj-line-soft)",
                      color: "var(--bj-ink)",
                      lineHeight: 1.6,
                      transition: "border-color 0.14s ease",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold-soft)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                  />
                </div>

                {/* Color */}
                <div>
                  <label
                    className="block font-sans text-[11px] uppercase tracking-widest mb-2.5"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Color
                  </label>
                  <div className="flex gap-2">
                    {TOPIC_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-lg shrink-0"
                        style={{
                          background: c,
                          boxShadow: color === c
                            ? `0 0 0 2px var(--bj-bg-panel), 0 0 0 3.5px ${c}`
                            : "none",
                          transform: color === c ? "scale(1.15)" : "scale(1)",
                          transition: "transform 0.14s ease, box-shadow 0.14s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label
                    className="block font-sans text-[11px] uppercase tracking-widest mb-2.5"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Status
                  </label>
                  <div className="flex gap-2">
                    {(["active", "paused", "completed"] as TopicStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className="flex-1 py-2 rounded-lg font-sans text-xs capitalize"
                        style={{
                          background: status === s ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                          border: status === s ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                          color: status === s ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                          transition: "all 0.14s ease",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-5 py-4 border-t flex items-center gap-3"
                style={{ borderColor: "var(--bj-line-soft)" }}
              >
                <button
                  onClick={onClose}
                  className="bj-btn-ghost flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink3)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || saving}
                  className="bj-btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: name.trim() ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                    color: name.trim() ? "white" : "var(--bj-ink4)",
                    boxShadow: name.trim() ? "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {saving ? "Saving…" : editing ? "Save changes" : "Create topic"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
