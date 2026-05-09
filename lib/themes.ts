export type ThemeId = "warm" | "slate" | "forest" | "plum" | "midnight";

export interface Theme {
  id: ThemeId;
  label: string;
  isDark: boolean;
  vars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    id: "warm",
    label: "Warm",
    isDark: false,
    vars: {
      "--bj-bg": "oklch(98% 0.012 80)",
      "--bj-bg-soft": "oklch(96% 0.016 78)",
      "--bj-bg-panel": "oklch(99% 0.008 75)",
      "--bj-ink": "oklch(22% 0.02 60)",
      "--bj-ink2": "oklch(38% 0.018 62)",
      "--bj-ink3": "oklch(55% 0.014 65)",
      "--bj-ink4": "oklch(72% 0.01 68)",
      "--bj-line": "oklch(88% 0.018 75)",
      "--bj-line-soft": "oklch(93% 0.012 78)",
      "--bj-gold": "oklch(72% 0.12 75)",
      "--bj-gold-deep": "oklch(60% 0.14 72)",
      "--bj-gold-soft": "oklch(84% 0.08 78)",
      "--bj-gold-tint": "oklch(96% 0.03 80)",
      "--bj-sage": "oklch(62% 0.08 150)",
      "--bj-sage-tint": "oklch(94% 0.025 148)",
      "--bj-ember": "oklch(65% 0.14 45)",
    },
  },
  {
    id: "slate",
    label: "Slate",
    isDark: false,
    vars: {
      "--bj-bg": "oklch(97% 0.006 230)",
      "--bj-bg-soft": "oklch(94% 0.008 228)",
      "--bj-bg-panel": "oklch(99% 0.004 225)",
      "--bj-ink": "oklch(20% 0.02 240)",
      "--bj-ink2": "oklch(36% 0.018 238)",
      "--bj-ink3": "oklch(52% 0.014 235)",
      "--bj-ink4": "oklch(68% 0.01 232)",
      "--bj-line": "oklch(86% 0.012 230)",
      "--bj-line-soft": "oklch(92% 0.008 228)",
      "--bj-gold": "oklch(66% 0.1 195)",
      "--bj-gold-deep": "oklch(54% 0.12 192)",
      "--bj-gold-soft": "oklch(80% 0.07 198)",
      "--bj-gold-tint": "oklch(95% 0.025 200)",
      "--bj-sage": "oklch(60% 0.09 188)",
      "--bj-sage-tint": "oklch(93% 0.022 190)",
      "--bj-ember": "oklch(62% 0.1 215)",
    },
  },
  {
    id: "forest",
    label: "Forest",
    isDark: false,
    vars: {
      "--bj-bg": "oklch(97% 0.01 100)",
      "--bj-bg-soft": "oklch(94% 0.014 98)",
      "--bj-bg-panel": "oklch(99% 0.006 102)",
      "--bj-ink": "oklch(20% 0.025 140)",
      "--bj-ink2": "oklch(35% 0.022 138)",
      "--bj-ink3": "oklch(52% 0.018 135)",
      "--bj-ink4": "oklch(68% 0.012 130)",
      "--bj-line": "oklch(86% 0.016 110)",
      "--bj-line-soft": "oklch(92% 0.01 108)",
      "--bj-gold": "oklch(55% 0.12 148)",
      "--bj-gold-deep": "oklch(44% 0.14 145)",
      "--bj-gold-soft": "oklch(72% 0.08 150)",
      "--bj-gold-tint": "oklch(93% 0.03 152)",
      "--bj-sage": "oklch(58% 0.1 148)",
      "--bj-sage-tint": "oklch(92% 0.028 150)",
      "--bj-ember": "oklch(60% 0.1 95)",
    },
  },
  {
    id: "plum",
    label: "Plum",
    isDark: false,
    vars: {
      "--bj-bg": "oklch(98% 0.008 340)",
      "--bj-bg-soft": "oklch(95% 0.012 338)",
      "--bj-bg-panel": "oklch(99.5% 0.005 342)",
      "--bj-ink": "oklch(22% 0.025 300)",
      "--bj-ink2": "oklch(38% 0.022 305)",
      "--bj-ink3": "oklch(54% 0.018 310)",
      "--bj-ink4": "oklch(70% 0.012 315)",
      "--bj-line": "oklch(88% 0.016 330)",
      "--bj-line-soft": "oklch(93% 0.01 335)",
      "--bj-gold": "oklch(58% 0.14 320)",
      "--bj-gold-deep": "oklch(46% 0.16 315)",
      "--bj-gold-soft": "oklch(74% 0.09 325)",
      "--bj-gold-tint": "oklch(95% 0.03 335)",
      "--bj-sage": "oklch(62% 0.1 0)",
      "--bj-sage-tint": "oklch(94% 0.028 355)",
      "--bj-ember": "oklch(64% 0.14 340)",
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    isDark: true,
    vars: {
      "--bj-bg": "oklch(16% 0.02 255)",
      "--bj-bg-soft": "oklch(20% 0.022 258)",
      "--bj-bg-panel": "oklch(13% 0.018 252)",
      "--bj-ink": "oklch(95% 0.008 75)",
      "--bj-ink2": "oklch(80% 0.01 78)",
      "--bj-ink3": "oklch(62% 0.012 72)",
      "--bj-ink4": "oklch(46% 0.01 70)",
      "--bj-line": "oklch(28% 0.02 255)",
      "--bj-line-soft": "oklch(24% 0.016 252)",
      "--bj-gold": "oklch(78% 0.14 75)",
      "--bj-gold-deep": "oklch(68% 0.16 72)",
      "--bj-gold-soft": "oklch(60% 0.1 78)",
      "--bj-gold-tint": "oklch(26% 0.04 80)",
      "--bj-sage": "oklch(65% 0.1 152)",
      "--bj-sage-tint": "oklch(24% 0.03 150)",
      "--bj-ember": "oklch(72% 0.16 45)",
    },
  },
];

export const defaultTheme = themes[0];

export function applyTheme(themeId: ThemeId) {
  const theme = themes.find((t) => t.id === themeId) ?? defaultTheme;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.setAttribute("data-theme", themeId);
  root.setAttribute("data-dark", String(theme.isDark));
}
