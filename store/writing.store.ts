import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SwitchId } from "@/lib/typing/keySounds";

export type WritingWidth = "narrow" | "normal" | "wide";
export type WritingFont = "classic" | "garamond" | "lora" | "fraunces" | "sans" | "dyslexic";

export const WRITING_FONTS: { id: WritingFont; label: string; cssVar: string; scale: number; italic: boolean }[] = [
  { id: "classic", label: "Classic", cssVar: "--font-cormorant", scale: 1, italic: true },
  { id: "garamond", label: "Garamond", cssVar: "--font-eb-garamond", scale: 0.94, italic: true },
  { id: "lora", label: "Lora", cssVar: "--font-lora", scale: 0.88, italic: true },
  { id: "fraunces", label: "Fraunces", cssVar: "--font-fraunces", scale: 0.88, italic: true },
  { id: "sans", label: "Sans", cssVar: "--font-inter", scale: 0.84, italic: false },
  { id: "dyslexic", label: "Dyslexic", cssVar: "--font-opendyslexic", scale: 0.8, italic: false },
];

export const WIDTHS: Record<WritingWidth, number> = { narrow: 600, normal: 700, wide: 860 };

type Toggleable = "keySounds" | "smoothCaret" | "typewriter" | "focusParagraph" | "zen";

interface WritingPrefs {
  /** Mechanical keyboard sounds while writing. Off until the writer opts in. */
  keySounds: boolean;
  switchId: SwitchId;
  volume: number;
  /** Animated caret that glides between characters. */
  smoothCaret: boolean;
  /** Keep the line being written at a steady height on screen. */
  typewriter: boolean;
  /** Dim every paragraph except the one you're in. */
  focusParagraph: boolean;
  /** Full-screen, chrome-free writing (per session, not persisted). */
  zen: boolean;
  font: WritingFont;
  /** Base size in px for the Classic face; other faces are optically matched. */
  size: number;
  width: WritingWidth;
  /** Words to write this session; 0 = no goal. */
  goal: number;
  set: (patch: Partial<Omit<WritingPrefs, "set" | "toggle">>) => void;
  toggle: (key: Toggleable) => void;
}

export const useWritingStore = create<WritingPrefs>()(
  persist(
    (set) => ({
      keySounds: false,
      switchId: "mx-brown",
      volume: 0.7,
      smoothCaret: true,
      typewriter: false,
      focusParagraph: false,
      zen: false,
      font: "classic",
      size: 20,
      width: "normal",
      goal: 0,
      set: (patch) => set(patch),
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<WritingPrefs>),
    }),
    {
      name: "bj-writing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ zen, set, toggle, ...rest }) => rest,
    },
  ),
);

export function writingFontStyle(font: WritingFont, size: number): React.CSSProperties {
  const f = WRITING_FONTS.find((x) => x.id === font) ?? WRITING_FONTS[0];
  return { fontFamily: `var(${f.cssVar}), Georgia, serif`, fontSize: `${Math.round(size * f.scale * 10) / 10}px` };
}
