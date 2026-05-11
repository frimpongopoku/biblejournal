"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame } from "lucide-react";
import { fontPairs, type FontPairId } from "@/lib/fonts";
import { SimpleRichEditor } from "@/components/shared/SimpleRichEditor";
import type { Prayer } from "@/types";

const PRAYER_FONT_KEY = "bj-prayer-font";
const PRAYER_SIZE_KEY = "bj-prayer-size";

interface Props {
  open: boolean;
  prayer?: Prayer | null;
  onClose: () => void;
  onSave: (title: string, body: string) => Promise<void>;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function PrayerDialog({ open, prayer, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [fontId] = useState<FontPairId>(() =>
    typeof window !== "undefined" ? (localStorage.getItem(PRAYER_FONT_KEY) as FontPairId) ?? "classic" : "classic"
  );
  const [fontSize] = useState<number>(() =>
    typeof window !== "undefined" ? Number(localStorage.getItem(PRAYER_SIZE_KEY)) || 16 : 16
  );
  const titleRef = useRef<HTMLInputElement>(null);
  const pair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

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
    await onSave(title.trim(), body);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
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
            onClick={onClose}
          />

          {/* Sheet: bottom on mobile, centered on desktop */}
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ ease: EASE_OUT, duration: 0.32 }}
            className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
            style={{ pointerEvents: "none" }}
          >
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
              style={{
                maxWidth: 680,
                height: "92dvh",
                maxHeight: "92dvh",
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line)",
                boxShadow: "0 -8px 60px color-mix(in oklch, var(--bj-ink) 18%, transparent), 0 32px 80px color-mix(in oklch, var(--bj-ink) 24%, transparent)",
                pointerEvents: "auto",
              }}
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-0 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
              </div>

              {/* Header: icon + title input */}
              <div
                className="flex items-center gap-4 px-6 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b shrink-0"
                style={{ borderColor: "var(--bj-line-soft)" }}
              >
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))" }}
                >
                  <Flame size={20} style={{ color: "var(--bj-ember)" }} />
                </div>

                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you praying about?"
                  className="flex-1 bg-transparent outline-none font-sans font-semibold leading-snug min-w-0"
                  style={{
                    fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                    color: "var(--bj-ink)",
                    caretColor: "var(--bj-gold)",
                  }}
                />

                <button
                  type="button"
                  onClick={onClose}
                  className="bj-btn-icon w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body — TipTap, flex-1 so it fills remaining height */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
                <SimpleRichEditor
                  key={prayer?.id ?? "new-prayer"}
                  initialValue={body}
                  onChange={setBody}
                  placeholder="Write your prayer… let it flow freely."
                  style={{
                    fontFamily: `var(${pair.displayVar})`,
                    fontStyle: fontId === "dyslexic" ? "normal" : "italic",
                    fontSize: Math.max(fontSize, 16),
                    color: "var(--bj-ink2)",
                    minHeight: 200,
                  }}
                />
              </div>

              {/* Footer */}
              <div
                className="flex items-center gap-3 px-6 sm:px-8 py-4 sm:py-5 border-t shrink-0"
                style={{
                  borderColor: "var(--bj-line-soft)",
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="bj-btn-ghost font-sans text-sm px-5 py-3 rounded-xl"
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
                  {saving ? "Saving…" : "Save prayer"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
