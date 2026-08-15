"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpenCheck } from "lucide-react";
import { COMMENTARY_SOURCES } from "@/lib/commentary-sources";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommentaryAboutModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cab-bd"
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            key="cab-panel"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <motion.div
              className="w-full rounded-2xl overflow-hidden"
              style={{
                maxWidth: 560,
                background: "var(--bj-bg-panel)",
                border: "1px solid var(--bj-line)",
                boxShadow: "0 24px 64px color-mix(in oklch, var(--bj-ink) 24%, transparent)",
                pointerEvents: "auto",
              }}
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.22 }}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <BookOpenCheck size={15} style={{ color: "var(--bj-gold)" }} />
                <div className="flex-1">
                  <h2 className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                    Who wrote these?
                  </h2>
                  <p className="font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}>
                    Every commentary here is public domain — no AI-generated text.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
                {COMMENTARY_SOURCES.map((s) => (
                  <div key={s.id}>
                    <p className="font-display text-base" style={{ color: "var(--bj-ink)" }}>
                      {s.author} <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>· {s.years}</span>
                    </p>
                    <p className="font-sans text-[13px] leading-relaxed mt-1.5" style={{ color: "var(--bj-ink2)" }}>
                      {s.bio}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
