export interface StudyColor {
  id: string;
  label: string;
  hex: string;
}

/** Fixed highlight palette — plain hex (not theme vars), checked for legibility
 *  as a left-border marker + swatch across all 6 app themes including dark. */
export const STUDY_COLORS: StudyColor[] = [
  { id: "gold", label: "Gold", hex: "#C9A96E" },
  { id: "sage", label: "Sage", hex: "#7A9B76" },
  { id: "sky", label: "Sky", hex: "#6E9EB0" },
  { id: "rose", label: "Rose", hex: "#C08585" },
  { id: "lavender", label: "Lavender", hex: "#9B8BC4" },
];

export const DEFAULT_STUDY_COLOR = STUDY_COLORS[0].id;

export function studyColorHex(id: string | null | undefined): string {
  return STUDY_COLORS.find((c) => c.id === id)?.hex ?? STUDY_COLORS[0].hex;
}
