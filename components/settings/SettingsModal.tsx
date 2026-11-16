"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Type, PenLine, BookOpen, Volume2, HandHeart, Keyboard, UserRound, Search, X } from "lucide-react";
import { useSettingsUi } from "@/store/prefs.store";
import { useMounted } from "@/hooks/useMounted";
import { SECTIONS, SectionBody, type SectionId } from "./SettingsSections";

export const SECTION_ICONS: Record<SectionId, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  appearance: Palette, type: Type, writing: PenLine, reading: BookOpen, sounds: Volume2, prayer: HandHeart, shortcuts: Keyboard, account: UserRound,
};

/** Words people search for, so "dark" finds Appearance and "click" finds Sounds. */
const KEYWORDS: Record<SectionId, string> = {
  appearance: "theme dark light mode night system colour color glass blur motion animation sidebar compact midnight warm slate forest plum dusk",
  type: "font typeface interface ui size dyslexic",
  writing: "font size width goal words focus typewriter caret cursor editor journal",
  reading: "bible translation version esv kjv niv font size commentary henry gill",
  sounds: "keyboard sound click typing switch volume mechanical audio",
  prayer: "prayer today rotation day week",
  shortcuts: "keys keyboard shortcuts hotkeys",
  account: "export backup download privacy hide previews delete sign out logout account data",
};

export function SettingsModal() {
  const open = useSettingsUi((s) => s.open);
  const section = useSettingsUi((s) => s.section) as SectionId;
  const show = useSettingsUi((s) => s.show);
  const close = useSettingsUi((s) => s.close);
  const [q, setQ] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [section]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SECTIONS;
    return SECTIONS.filter((x) => x.label.toLowerCase().includes(s) || KEYWORDS[x.id].includes(s));
  }, [q]);

  if (!mounted) return null;
  const label = SECTIONS.find((s) => s.id === section)?.label ?? "Settings";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div className="absolute inset-0 bj-scrim" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
          <motion.div role="dialog" aria-modal="true" aria-label="Settings"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="bj-window relative flex overflow-hidden w-full"
            style={{ maxWidth: 960, height: "min(680px, calc(100dvh - 32px))", borderRadius: 24 }}>

            <nav aria-label="Settings sections" className="bj-glass w-[220px] shrink-0 hidden sm:flex flex-col gap-0.5 p-3"
              style={{ borderWidth: "0 1px 0 0", borderRadius: 0, boxShadow: "none" }}>
              <label className="bj-well flex items-center gap-2 h-[34px] px-2.5 rounded-[10px] mb-3">
                <Search size={13} style={{ color: "var(--bj-ink4)" }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a setting" aria-label="Find a setting" data-no-key-sounds
                  onKeyDown={(e) => { if (e.key === "Enter" && shown[0]) show(shown[0].id); }}
                  className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[13px]" style={{ color: "var(--bj-ink)" }} />
              </label>
              {shown.map((s) => {
                const Icon = SECTION_ICONS[s.id];
                const on = s.id === section;
                return (
                  <button key={s.id} type="button" onClick={() => show(s.id)} aria-current={on ? "page" : undefined}
                    className={`flex items-center gap-2.5 h-[34px] px-2.5 rounded-[10px] font-sans text-[13px] text-left ${on ? "bj-raised" : "bj-menu-item"}`}
                    style={{ color: on ? "var(--bj-ink)" : "var(--bj-ink3)", fontWeight: on ? 500 : 400, border: on ? undefined : "1px solid transparent" }}>
                    <Icon size={14} style={{ color: on ? "var(--bj-gold)" : "currentColor" }} />
                    {s.label}
                  </button>
                );
              })}
              {shown.length === 0 && <p className="px-2.5 py-2 font-sans text-[12.5px]" style={{ color: "var(--bj-ink4)" }}>Nothing matches “{q}”.</p>}
              <p className="mt-auto px-2 font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}><kbd className="bj-kbd">⌘,</kbd> opens this anywhere</p>
            </nav>

            <div className="flex-1 min-w-0 flex flex-col">
              <div className="h-[58px] shrink-0 flex items-center gap-3 pl-6 sm:pl-8 pr-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <h2 className="font-display flex-1 truncate" style={{ fontSize: 24, color: "var(--bj-ink)", fontWeight: 500 }}>{label}</h2>
                <span className="hidden md:inline font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>Changes save as you go</span>
                <button type="button" onClick={close} aria-label="Close settings" className="bj-btn-icon w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
                  <X size={15} />
                </button>
              </div>
              <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 pt-3 pb-8">
                <SectionBody id={section} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
