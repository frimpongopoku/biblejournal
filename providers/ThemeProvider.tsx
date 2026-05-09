"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme.store";
import { applyTheme } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore((s) => s.themeId);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  return <>{children}</>;
}
