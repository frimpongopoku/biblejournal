"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { useThemeStore } from "@/store/theme.store";
import { usePrefsStore } from "@/store/prefs.store";
import { applyTheme } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const mode = usePrefsStore((s) => s.mode);
  const lightTheme = usePrefsStore((s) => s.lightTheme);
  const darkTheme = usePrefsStore((s) => s.darkTheme);
  const motion = usePrefsStore((s) => s.motion);
  const glass = usePrefsStore((s) => s.glass);
  const hidePreviews = usePrefsStore((s) => s.hidePreviews);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  // Follow the system: pick the light or dark theme of the pair, and keep
  // following as the system flips (sunset, Control Centre).
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setTheme(mq.matches ? darkTheme : lightTheme);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [mode, lightTheme, darkTheme, setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-solid", !glass);
    root.toggleAttribute("data-hide-previews", hidePreviews);
    root.setAttribute("data-motion", motion);
  }, [glass, hidePreviews, motion]);

  return (
    <MotionConfig reducedMotion={motion === "reduced" ? "always" : motion === "full" ? "never" : "user"}>
      {children}
    </MotionConfig>
  );
}
