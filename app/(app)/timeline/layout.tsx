"use client";

import { AnimatePresence } from "framer-motion";
import { NotebookPen } from "lucide-react";
import { FloatingNotepad } from "@/components/timeline/FloatingNotepad";
import { useNotepadStore } from "@/store/notepad.store";

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  const open = useNotepadStore((s) => s.open);
  const toggle = useNotepadStore((s) => s.toggle);
  const close = useNotepadStore((s) => s.close);

  return (
    <>
      {children}

      {/* Always-available notepad trigger — jot a note anywhere in the timeline space */}
      <button
        onClick={toggle}
        title={open ? "Close notepad" : "Open notepad"}
        className="bj-btn-primary fixed z-40 flex items-center justify-center rounded-full left-4 md:left-auto md:right-6 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 w-12 h-12"
        style={{
          background: open ? "var(--bj-ink)" : "var(--bj-gold)",
          color: "white",
          boxShadow: "0 6px 20px color-mix(in oklch, var(--bj-ink) 24%, transparent)",
        }}
      >
        <NotebookPen size={18} />
      </button>

      <AnimatePresence>{open && <FloatingNotepad onClose={close} />}</AnimatePresence>
    </>
  );
}
