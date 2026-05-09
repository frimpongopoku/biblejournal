"use client";

import { useEffect } from "react";
import { useFontStore } from "@/store/font.store";
import { applyFontPair } from "@/lib/fonts";

export function FontProvider({ children }: { children: React.ReactNode }) {
  const fontPairId = useFontStore((s) => s.fontPairId);

  useEffect(() => {
    applyFontPair(fontPairId);
  }, [fontPairId]);

  return <>{children}</>;
}
