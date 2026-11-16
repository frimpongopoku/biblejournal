"use client";

import { useEffect } from "react";
import { useFontStore } from "@/store/font.store";
import { useWritingStore } from "@/store/writing.store";
import { UI_FACES, WRITE_FACES, READ_FACES, face, faceStack } from "@/lib/typeface";

/** Puts the three chosen faces on :root as --bj-ui, --bj-write and --bj-read. */
export function FontProvider({ children }: { children: React.ReactNode }) {
  const ui = useFontStore((s) => s.ui);
  const write = useWritingStore((s) => s.font);
  const read = useWritingStore((s) => s.readFont);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bj-ui", faceStack(face(UI_FACES, ui), "system-ui, sans-serif"));
    root.style.setProperty("--bj-display", ui === "dyslexic" ? "var(--font-opendyslexic)" : "var(--font-cormorant)");
    root.setAttribute("data-font", ui);
  }, [ui]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bj-write", faceStack(face(WRITE_FACES, write)));
  }, [write]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bj-read", faceStack(face(READ_FACES, read)));
  }, [read]);

  return <>{children}</>;
}
