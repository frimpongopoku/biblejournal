"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import type { Prayer } from "@/types";

interface Props {
  open: boolean;
  prayer: Prayer | null;
  onClose: () => void;
  onConfirm: (testimony: string) => Promise<void>;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN: [number, number, number, number] = [0.36, 0, 0.66, 0];

export function TestimonyDialog({ open, prayer, onClose, onConfirm }: Props) {
  const [testimony, setTestimony] = useState("");
  const [saving, setSaving] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTestimony("");
      setSaving(false);
      setTimeout(() => areaRef.current?.focus(), 60);
    }
  }, [open]);

  async function handleConfirm() {
    setSaving(true);
    await onConfirm(testimony);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && prayer && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ ease: EASE_OUT, duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          >
            <div className="w-full" style={{ maxWidth: 560 }}>
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
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--bj-sage-tint)" }}
                    >
                      <CheckCircle2 size={14} style={{ color: "var(--bj-sage)" }} />
                    </div>
                    <h2
                      className="font-display"
                      style={{ fontSize: "1.1rem", color: "var(--bj-ink)", fontWeight: 400 }}
                    >
                      Mark as Answered
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div
                    className="px-4 py-3 rounded-xl"
                    style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
                  >
                    <p className="font-sans text-xs mb-0.5" style={{ color: "var(--bj-ink4)" }}>Prayer</p>
                    <p className="font-sans text-sm font-medium" style={{ color: "var(--bj-ink)" }}>
                      {prayer.title}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-sans text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--bj-ink4)" }}
                    >
                      How did God answer?{" "}
                      <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: 0 }}>
                        (optional)
                      </span>
                    </label>
                    <textarea
                      ref={areaRef}
                      value={testimony}
                      onChange={(e) => setTestimony(e.target.value)}
                      placeholder="Write your testimony…"
                      rows={4}
                      className="w-full font-display italic text-base px-4 py-3 rounded-xl outline-none resize-none leading-relaxed"
                      style={{
                        background: "var(--bj-bg-soft)",
                        border: "1px solid var(--bj-line-soft)",
                        color: "var(--bj-ink2)",
                        fontWeight: 300,
                        transition: "border-color 0.15s ease",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bj-sage)")}
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
                    onClick={handleConfirm}
                    disabled={saving}
                    className="bj-btn-primary flex-1 font-sans text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "var(--bj-sage)", color: "white" }}
                  >
                    <CheckCircle2 size={14} />
                    {saving ? "Saving…" : "Mark Answered"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
