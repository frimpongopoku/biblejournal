import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SwitchId } from "@/lib/typing/keySounds";

export type WritingWidth = "narrow" | "normal" | "wide";
import { WRITE_FACES, READ_FACES, face, faceStack, type WriteFont, type ReadFont } from "@/lib/typeface";

export type WritingFont = WriteFont;

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
  /** Base size in px; each face is optically matched to it. */
  size: number;
  /** Scripture has its own face and size. */
  readFont: ReadFont;
  readSize: number;
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
      font: "newsreader",
      size: 20,
      readFont: "garamond",
      readSize: 21,
      width: "normal",
      goal: 0,
      set: (patch) => set(patch),
      toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<WritingPrefs>),
    }),
    {
      name: "bj-writing",
      version: 2,
      // v1 had a single face list shared by writing and the Bible.
      migrate: (old, v) => {
        const o = (old ?? {}) as Record<string, unknown>;
        if (v < 2) {
          const map: Record<string, WriteFont> = { lora: "literata", sans: "source", dyslexic: "dyslexic" };
          o.font = map[o.font as string] ?? "newsreader";
          o.readFont = o.font === "dyslexic" ? "dyslexic" : "garamond";
          o.readSize = Math.max(18, Math.min(26, Number(o.size) || 20) + 1);
        }
        return o as unknown as WritingPrefs;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ zen, set, toggle, ...rest }) => rest,
    },
  ),
);

export function writingFontStyle(font: WritingFont, size: number): React.CSSProperties {
  const f = face(WRITE_FACES, font);
  return { fontFamily: faceStack(f), fontSize: `${Math.round(size * f.scale * 10) / 10}px` };
}

export function readingFontStyle(font: ReadFont, size: number): React.CSSProperties {
  const f = face(READ_FACES, font);
  return { fontFamily: faceStack(f), fontSize: `${Math.round(size * f.scale * 10) / 10}px` };
}
