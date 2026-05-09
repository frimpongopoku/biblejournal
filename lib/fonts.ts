export type FontPairId = "classic" | "dyslexic" | "serif" | "modern" | "humanist";

export interface FontPair {
  id: FontPairId;
  label: string;
  uiFamily: string;   // human-readable name
  displayFamily: string;
  uiVar: string;      // CSS variable name holding the font stack
  displayVar: string;
  preview: string;    // short sample shown in picker
}

export const fontPairs: FontPair[] = [
  {
    id: "classic",
    label: "Classic",
    uiFamily: "Inter",
    displayFamily: "Cormorant Garamond",
    uiVar: "--font-inter",
    displayVar: "--font-cormorant",
    preview: "Aa",
  },
  {
    id: "dyslexic",
    label: "Dyslexic",
    uiFamily: "OpenDyslexic",
    displayFamily: "OpenDyslexic",
    uiVar: "--font-opendyslexic",
    displayVar: "--font-opendyslexic",
    preview: "Aa",
  },
  {
    id: "serif",
    label: "Serif",
    uiFamily: "Lora",
    displayFamily: "Playfair Display",
    uiVar: "--font-lora",
    displayVar: "--font-playfair",
    preview: "Aa",
  },
  {
    id: "modern",
    label: "Modern",
    uiFamily: "Sora",
    displayFamily: "Fraunces",
    uiVar: "--font-sora",
    displayVar: "--font-fraunces",
    preview: "Aa",
  },
  {
    id: "humanist",
    label: "Humanist",
    uiFamily: "Inter",
    displayFamily: "EB Garamond",
    uiVar: "--font-inter",
    displayVar: "--font-eb-garamond",
    preview: "Aa",
  },
];

export const defaultFontPair = fontPairs[0];

export function applyFontPair(id: FontPairId) {
  const pair = fontPairs.find((f) => f.id === id) ?? defaultFontPair;
  const root = document.documentElement;
  root.style.setProperty("--bj-ui", `var(${pair.uiVar})`);
  root.style.setProperty("--bj-display", `var(${pair.displayVar})`);
  root.setAttribute("data-font", id);
}
