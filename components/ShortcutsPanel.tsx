"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

// ── Types ──────────────────────────────────────────────────

interface Shortcut {
  keys: string[];
  desc: string;
}
interface Group {
  title: string;
  shortcuts: Shortcut[];
}

// ── Data ───────────────────────────────────────────────────

const GROUPS: Group[] = [
  {
    title: "Navigate",
    shortcuts: [
      { keys: ["⌘", "J"], desc: "Journal" },
      { keys: ["⌘", "K"], desc: "Prayer" },
      { keys: ["⌘", "P"], desc: "Proclamations" },
      { keys: ["⌘", "B"], desc: "Bible" },
      { keys: ["⌘", "D"], desc: "Dashboard" },
      { keys: ["⌘", "S"], desc: "Sermons" },
      { keys: ["⌘", "E"], desc: "Research" },
      { keys: ["⌘", "/"], desc: "Show shortcuts" },
    ],
  },
  {
    title: "Journal",
    shortcuts: [
      { keys: ["⌘", "⇧", "N"], desc: "New entry" },
      { keys: ["⌘", "⌥", "B"], desc: "Toggle Bible panel" },
      { keys: ["⌘", "⇧", "A"], desc: "Toggle Ask panel" },
    ],
  },
  {
    title: "Editor",
    shortcuts: [
      { keys: ["⌘", "B"], desc: "Bold" },
      { keys: ["⌘", "I"], desc: "Italic" },
      { keys: ["⌘", "U"], desc: "Underline" },
      { keys: ["⌘", "⇧", "H"], desc: "Heading 1" },
      { keys: ["/"], desc: "Slash commands" },
    ],
  },
  {
    title: "Bible reader",
    shortcuts: [
      { keys: ["←"], desc: "Previous chapter" },
      { keys: ["→"], desc: "Next chapter" },
    ],
  },
];

// ── Key badge ──────────────────────────────────────────────

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center font-sans rounded-md px-1.5 min-w-[22px] h-[22px]"
      style={{
        fontSize: 11,
        fontFamily: "var(--bj-ui)",
        background: "var(--bj-bg-soft)",
        color: "var(--bj-ink2)",
        border: "1px solid var(--bj-line)",
        boxShadow: "0 1px 0 var(--bj-line)",
        fontWeight: 500,
        lineHeight: 1,
      }}
    >
      {children}
    </kbd>
  );
}

// ── Panel ──────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsPanel({ open, onClose }: Props) {
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
          {/* Backdrop */}
          <motion.div
            key="sc-bd"
            className="fixed inset-0 z-50"
            style={{ background: "color-mix(in oklch, var(--bj-ink) 40%, transparent)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="sc-panel"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <motion.div
              className="w-full rounded-2xl overflow-hidden"
              style={{
                maxWidth: 580,
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
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <Keyboard size={15} style={{ color: "var(--bj-gold)" }} />
                <h2 className="font-display text-lg flex-1" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={onClose}
                  className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Shortcut groups — 2-column grid */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-h-[70vh] overflow-y-auto">
                {GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-3"
                      style={{ color: "var(--bj-ink4)" }}>
                      {group.title}
                    </p>
                    <div className="flex flex-col gap-2">
                      {group.shortcuts.map((s) => (
                        <div key={s.desc} className="flex items-center justify-between gap-4">
                          <span className="font-sans text-sm" style={{ color: "var(--bj-ink2)" }}>{s.desc}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {s.keys.map((k, i) => <Key key={i}>{k}</Key>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--bj-line-soft)" }}>
                <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                  ⌘ on Mac · Ctrl on Windows/Linux
                </p>
                <div className="flex items-center gap-1">
                  <Key>⌘</Key><Key>/</Key>
                  <span className="font-sans text-xs ml-1" style={{ color: "var(--bj-ink4)" }}>to toggle</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
