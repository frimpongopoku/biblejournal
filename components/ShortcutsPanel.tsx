"use client";

import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";

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

export const SHORTCUT_GROUPS: Group[] = [
  {
    title: "Anywhere",
    shortcuts: [
      { keys: ["⌘", "K"], desc: "Search & commands" },
      { keys: ["⌘", "⌥", "B"], desc: "Floating Bible" },
      { keys: ["⌘", "⇧", "A"], desc: "Ask about Scripture" },
      { keys: ["⌘", "/"], desc: "This panel" },
      { keys: ["⌘", ","], desc: "Settings" },
    ],
  },
  {
    title: "Go to",
    shortcuts: NAV_ITEMS.filter((n) => n.g).map((n) => ({ keys: ["G", n.g!.toUpperCase()], desc: n.label })),
  },
  {
    title: "Journal",
    shortcuts: [
      { keys: ["⌘", "⇧", "N"], desc: "New entry" },
      { keys: ["⌘", "."], desc: "Zen mode" },
      { keys: ["⌥", "↑ ↓"], desc: "Previous / next entry" },
      { keys: ["/"], desc: "Search entries" },
      { keys: ["⌘", "Z"], desc: "Undo delete" },
    ],
  },
  {
    title: "Writing",
    shortcuts: [
      { keys: ["/"], desc: "Insert block (verse, callout…)" },
      { keys: ["Tab"], desc: "Quote the reference you just typed" },
      { keys: ["⌘", "click"], desc: "Open a reference in the Bible" },
      { keys: ["⌘", "B"], desc: "Bold" },
      { keys: ["⌘", "I"], desc: "Italic" },
      { keys: ["⌘", "⇧", "S"], desc: "Scripture block" },
    ],
  },
  {
    title: "In ⌘K",
    shortcuts: [
      { keys: ["⌘", "↵"], desc: "Quote verse into entry" },
      { keys: [">"], desc: "Commands only" },
      { keys: ["#"], desc: "Browse tags" },
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="absolute inset-0" style={{ background: "var(--m-scrim)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} onClick={onClose} />
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          maxWidth: 640,
          background: "linear-gradient(180deg, var(--m-paper-top), var(--m-paper-bot))",
          border: "1px solid var(--m-edge)",
          boxShadow: "var(--bj-shadow-lg)",
        }}
      >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <Keyboard size={15} style={{ color: "var(--bj-gold)" }} />
                <h2 className="font-display text-lg flex-1" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                  Keyboard Shortcuts
                </h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Shortcut groups — 2-column grid */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 max-h-[70vh] overflow-y-auto">
                {SHORTCUT_GROUPS.map((group) => (
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

              <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--bj-line-soft)" }}>
                <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>⌘ on Mac · Ctrl on Windows/Linux · G-shortcuts work outside text fields</p>
                <div className="flex items-center gap-1"><Key>esc</Key></div>
              </div>
      </div>
    </div>
  );
}
