"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createBook, updateBook } from "@/services/learning.service";
import { useAuthStore } from "@/store/auth.store";
import type { LearningBook, LearningTopic, BookStatus } from "@/types";
import { TOPIC_COLORS } from "./TopicFormDialog";

const BOOK_COLORS = TOPIC_COLORS;

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "want-to-read", label: "Want to read" },
  { value: "reading",      label: "Reading" },
  { value: "finished",     label: "Finished" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  topics: LearningTopic[];
  editing?: LearningBook | null;
  defaultTopicId?: string;
}

export function BookFormDialog({ open, onClose, topics, editing, defaultTopicId }: Props) {
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [color, setColor] = useState(BOOK_COLORS[0]);
  const [status, setStatus] = useState<BookStatus>("want-to-read");
  const [rating, setRating] = useState<number | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setAuthor(editing.author);
      setColor(editing.color);
      setStatus(editing.status);
      setRating(editing.rating);
      setSelectedTopicIds(editing.topicIds);
    } else {
      setTitle("");
      setAuthor("");
      setColor(BOOK_COLORS[0]);
      setStatus("want-to-read");
      setRating(null);
      setSelectedTopicIds(defaultTopicId ? [defaultTopicId] : []);
    }
  }, [editing, open, defaultTopicId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function toggleTopic(id: string) {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (!user || !title.trim()) return;
    setSaving(true);
    const data = { title: title.trim(), author: author.trim(), color, status, topicIds: selectedTopicIds, rating, notes: editing?.notes ?? "" };
    if (editing) {
      await updateBook(user.uid, editing.id, data);
    } else {
      await createBook(user.uid, data);
    }
    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="book-bd"
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.45)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          <motion.div
            key="book-dialog"
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
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <div className="w-4 h-5 rounded-sm shrink-0" style={{ background: color }} />
                <h2 className="font-display text-base flex-1" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>
                  {editing ? "Edit book" : "Add a book"}
                </h2>
                <button onClick={onClose} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                  <X size={14} />
                </button>
              </div>

              {/* Form */}
              <div className="px-5 py-5 flex flex-col gap-5 max-h-[65vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--bj-ink4)" }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mere Christianity"
                    autoFocus
                    className="w-full rounded-xl px-4 py-2.5 font-sans text-sm outline-none"
                    style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink)", transition: "border-color 0.14s ease" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold-soft)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-widest mb-2" style={{ color: "var(--bj-ink4)" }}>
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. C.S. Lewis"
                    className="w-full rounded-xl px-4 py-2.5 font-sans text-sm outline-none"
                    style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink)", transition: "border-color 0.14s ease" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-gold-soft)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--bj-line-soft)")}
                  />
                </div>

                {/* Spine color */}
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "var(--bj-ink4)" }}>
                    Spine color
                  </label>
                  <div className="flex gap-2">
                    {BOOK_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-lg shrink-0"
                        style={{
                          background: c,
                          boxShadow: color === c ? `0 0 0 2px var(--bj-bg-panel), 0 0 0 3.5px ${c}` : "none",
                          transform: color === c ? "scale(1.15)" : "scale(1)",
                          transition: "transform 0.14s ease, box-shadow 0.14s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "var(--bj-ink4)" }}>
                    Status
                  </label>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setStatus(value)}
                        className="flex-1 py-2 rounded-lg font-sans text-xs"
                        style={{
                          background: status === value ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                          border: status === value ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                          color: status === value ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                          transition: "all 0.14s ease",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "var(--bj-ink4)" }}>
                    Rating <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(rating === n ? null : n)}
                        className="w-8 h-8 rounded-lg font-sans text-xs font-medium"
                        style={{
                          background: rating !== null && n <= rating ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                          border: rating !== null && n <= rating ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                          color: rating !== null && n <= rating ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
                          transition: "all 0.14s ease",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                {topics.length > 0 && (
                  <div>
                    <label className="block font-sans text-[11px] uppercase tracking-widest mb-2.5" style={{ color: "var(--bj-ink4)" }}>
                      Topics <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {topics.map((t) => {
                        const selected = selectedTopicIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleTopic(t.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs"
                            style={{
                              background: selected ? `color-mix(in oklch, ${t.color} 15%, var(--bj-bg))` : "var(--bj-bg-soft)",
                              border: selected ? `1.5px solid ${t.color}` : "1.5px solid transparent",
                              color: selected ? t.color : "var(--bj-ink3)",
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
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t flex items-center gap-3" style={{ borderColor: "var(--bj-line-soft)" }}>
                <button
                  onClick={onClose}
                  className="bj-btn-ghost flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink3)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || saving}
                  className="bj-btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: title.trim() ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                    color: title.trim() ? "white" : "var(--bj-ink4)",
                    boxShadow: title.trim() ? "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {saving ? "Saving…" : editing ? "Save changes" : "Add book"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
