"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { createInsight } from "@/services/learning.service";
import { useAuthStore } from "@/store/auth.store";
import type { LearningTopic, InsightSourceType } from "@/types";

// ── Source type config ────────────────────────────────────

const SOURCE_TYPES: { type: InsightSourceType; label: string; placeholder: string }[] = [
  { type: "book",         label: "Book",       placeholder: "e.g. Mere Christianity, Ch. 3" },
  { type: "sermon",       label: "Sermon",     placeholder: "e.g. Speaker name or sermon title" },
  { type: "bible",        label: "Bible",      placeholder: "e.g. Romans 8:1–11" },
  { type: "course",       label: "Course",     placeholder: "e.g. Course name, Lesson 4" },
  { type: "conversation", label: "Convo",      placeholder: "e.g. Conversation with my pastor" },
  { type: "reflection",   label: "Reflection", placeholder: "" },
];

// ── Props ─────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  topics: LearningTopic[];
  defaultTopicId?: string;
}

// ── Component ─────────────────────────────────────────────

export function InsightDrawer({ open, onClose, topics, defaultTopicId }: Props) {
  const user = useAuthStore((s) => s.user);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [body, setBody] = useState("");
  const [topicId, setTopicId] = useState(defaultTopicId ?? topics[0]?.id ?? "");
  const [sourceType, setSourceType] = useState<InsightSourceType>("book");
  const [sourceRef, setSourceRef] = useState("");
  const [saving, setSaving] = useState(false);

  // Keep topicId in sync when default changes (e.g. opened from a topic page)
  useEffect(() => {
    if (defaultTopicId) setTopicId(defaultTopicId);
  }, [defaultTopicId]);

  // Auto-populate topicId when topics first load
  useEffect(() => {
    if (!topicId && topics.length > 0) setTopicId(topics[0].id);
  }, [topics]);

  // Focus & reset on open/close
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 120);
      return () => clearTimeout(t);
    } else {
      setBody("");
      setSourceRef("");
      setSourceType("book");
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleSave() {
    if (!user || !body.trim() || !topicId) return;
    setSaving(true);
    await createInsight(user.uid, {
      topicId,
      body: body.trim(),
      sourceType,
      sourceRef: sourceType !== "reflection" && sourceRef.trim() ? sourceRef.trim() : null,
      scriptures: [],
    });
    setSaving(false);
    onClose();
  }

  const sourceMeta = SOURCE_TYPES.find((s) => s.type === sourceType)!;
  const canSave = !!body.trim() && !!topicId;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="insight-bd"
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.35)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="insight-panel"
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              width: "min(440px, 100vw)",
              background: "var(--bj-bg-panel)",
              borderLeft: "1px solid var(--bj-line-soft)",
              boxShadow: "-8px 0 40px color-mix(in oklch, var(--bj-ink) 12%, transparent)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
              style={{ borderColor: "var(--bj-line-soft)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--bj-gold-tint)" }}
              >
                <Lightbulb size={14} style={{ color: "var(--bj-gold-deep)" }} />
              </div>
              <h2 className="font-display text-base flex-1" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>
                Capture Insight
              </h2>
              <button
                onClick={onClose}
                className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ color: "var(--bj-ink4)" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

              {/* Topic selector */}
              {topics.length > 0 && (
                <div>
                  <label
                    className="block font-sans text-[11px] uppercase tracking-widest mb-2.5"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => {
                      const active = topicId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTopicId(t.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs"
                          style={{
                            background: active
                              ? `color-mix(in oklch, ${t.color} 15%, var(--bj-bg))`
                              : "var(--bj-bg-soft)",
                            border: active ? `1.5px solid ${t.color}` : "1.5px solid transparent",
                            color: active ? t.color : "var(--bj-ink3)",
                            transition: "all 0.14s ease",
                          }}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Insight body */}
              <div>
                <label
                  className="block font-sans text-[11px] uppercase tracking-widest mb-2.5"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  Insight
                </label>
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What clicked? What shifted? Write it while it's fresh."
                  rows={6}
                  className="w-full resize-none rounded-xl px-4 py-3 font-sans text-sm outline-none"
                  style={{
                    background: "var(--bj-bg-soft)",
                    border: "1px solid var(--bj-line-soft)",
                    color: "var(--bj-ink)",
                    lineHeight: 1.7,
                    transition: "border-color 0.14s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold-soft)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                />
              </div>

              {/* Source type */}
              <div>
                <label
                  className="block font-sans text-[11px] uppercase tracking-widest mb-2.5"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  Source
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCE_TYPES.map(({ type, label }) => {
                    const active = sourceType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setSourceType(type)}
                        className="px-3 py-1.5 rounded-lg font-sans text-xs"
                        style={{
                          background: active ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                          border: active ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                          color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                          transition: "all 0.14s ease",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source reference */}
              {sourceType !== "reflection" && (
                <div>
                  <label
                    className="block font-sans text-[11px] uppercase tracking-widest mb-2.5"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    Reference{" "}
                    <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--bj-ink4)" }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={sourceRef}
                    onChange={(e) => setSourceRef(e.target.value)}
                    placeholder={sourceMeta.placeholder}
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
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-4 border-t shrink-0 flex items-center gap-3"
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
                disabled={!canSave || saving}
                className="bj-btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: canSave ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                  color: canSave ? "white" : "var(--bj-ink4)",
                  boxShadow: canSave ? "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {saving ? "Saving…" : "Save insight"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
