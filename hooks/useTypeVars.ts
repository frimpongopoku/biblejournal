"use client";

import { useEffect } from "react";
import { useFontStore } from "@/store/font.store";
import { useWritingStore } from "@/store/writing.store";
import { face, faceStack, UI_FACES, WRITE_FACES, READ_FACES } from "@/lib/typeface";

/**
 * The three faces chosen in Settings, as app-wide CSS variables, so anything
 * that uses .font-sans / .font-write / .font-read (verse cards, scripture
 * blocks, windows) follows the choice — not just the Bible reader.
 */
export function useTypeVars() {
  const ui = useFontStore((s) => s.ui);
  const write = useWritingStore((s) => s.font);
  const read = useWritingStore((s) => s.readFont);
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--bj-ui", faceStack(face(UI_FACES, ui), "system-ui, sans-serif"));
    r.setProperty("--bj-write", faceStack(face(WRITE_FACES, write)));
    r.setProperty("--bj-read", faceStack(face(READ_FACES, read)));
  }, [ui, write, read]);
}
