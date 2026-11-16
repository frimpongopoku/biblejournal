/** One colour per feeling — fixed hexes, legible on every theme (like the highlight palette). */
export const FEELING_COLORS: Record<string, string> = {
  Grateful: "#D9AE62",
  Prayerful: "#A897D6",
  Inspired: "#C58FD8",
  Peaceful: "#8DB59A",
  Excited: "#E0905C",
  Reflective: "#78A0D6",
  Heavy: "#D6808C",
  Sad: "#8E9BB5",
  Frustrated: "#D47466",
  Determined: "#D9A04A",
};

export function feelingColor(label?: string | null): string | null {
  if (!label) return null;
  return FEELING_COLORS[label] ?? "#A8A39B";
}
