/**
 * Type in three jobs. The interface face is for reading the app itself,
 * the writing face is for the words you type, and the reading face is for
 * scripture. Each set is short on purpose: every face here earns its place.
 */

export type UiFont = "inter" | "geist" | "jakarta" | "atkinson" | "dyslexic";
export type WriteFont = "newsreader" | "literata" | "source" | "plexmono" | "dyslexic";
export type ReadFont = "garamond" | "spectral" | "caslon" | "literata" | "dyslexic";

export interface Face<Id extends string> {
  id: Id;
  label: string;
  cssVar: string;
  /** Optical size match: multiplies the chosen size so faces feel equally large. */
  scale: number;
  note: string;
  italic?: boolean;
}

export const UI_FACES: Face<UiFont>[] = [
  { id: "inter", label: "Inter", cssVar: "--font-inter", scale: 1, note: "Neutral and calm. The default." },
  { id: "geist", label: "Geist", cssVar: "--font-geist", scale: 1, note: "Crisper, a little more technical." },
  { id: "jakarta", label: "Plus Jakarta Sans", cssVar: "--font-jakarta", scale: 1, note: "Warmer, rounder, friendlier." },
  { id: "atkinson", label: "Atkinson Hyperlegible", cssVar: "--font-atkinson", scale: 1, note: "Made for low vision. Every letter distinct." },
  { id: "dyslexic", label: "OpenDyslexic", cssVar: "--font-opendyslexic", scale: 0.92, note: "Weighted letters that don’t flip." },
];

export const WRITE_FACES: Face<WriteFont>[] = [
  { id: "newsreader", label: "Newsreader", cssVar: "--font-newsreader", scale: 0.95, italic: true, note: "Made for long reading and writing on screens. The default." },
  { id: "literata", label: "Literata", cssVar: "--font-literata", scale: 0.88, italic: true, note: "Sturdy book face. Comfortable for hours." },
  { id: "source", label: "Source Serif", cssVar: "--font-source-serif", scale: 0.9, italic: true, note: "Clean and even. Notes and plans." },
  { id: "plexmono", label: "IBM Plex Mono", cssVar: "--font-plex-mono", scale: 0.8, note: "A typewriter. Slows you down, in a good way." },
  { id: "dyslexic", label: "OpenDyslexic", cssVar: "--font-opendyslexic", scale: 0.8, note: "Weighted letters that don’t flip." },
];

export const READ_FACES: Face<ReadFont>[] = [
  { id: "garamond", label: "EB Garamond", cssVar: "--font-eb-garamond", scale: 1, italic: true, note: "The classic Bible page. The default." },
  { id: "spectral", label: "Spectral", cssVar: "--font-spectral", scale: 0.9, italic: true, note: "Elegant and light, made for screens." },
  { id: "caslon", label: "Libre Caslon", cssVar: "--font-caslon", scale: 0.86, italic: true, note: "Old print, generous and warm." },
  { id: "literata", label: "Literata", cssVar: "--font-literata", scale: 0.88, italic: true, note: "Sturdy and clear at small sizes." },
  { id: "dyslexic", label: "OpenDyslexic", cssVar: "--font-opendyslexic", scale: 0.8, note: "Weighted letters that don’t flip." },
];

export function face<Id extends string>(list: Face<Id>[], id: Id | string): Face<Id> {
  return list.find((f) => f.id === id) ?? list[0];
}

export function faceStack<Id extends string>(f: Face<Id>, fallback = "Georgia, serif") {
  return `var(${f.cssVar}), ${fallback}`;
}
