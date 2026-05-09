// Shared icon set + design tokens. Stroke-based, lucide-ish, hand-tuned.
// Loaded as a Babel script; exposes window.BJ.Icon and window.BJ.tokens.

window.BJ = window.BJ || {};

// Palette presets. Each shares the same shape so any can be dropped in.
window.BJ.palettes = {
  // Original — warm cream + gold (mercy-at-sunrise)
  warm: {
    bg: 'oklch(0.985 0.008 75)',
    bgSoft: 'oklch(0.972 0.01 75)',
    bgPanel: 'oklch(1 0 0)',
    bgInk: 'oklch(0.965 0.012 75)',
    ink: 'oklch(0.22 0.02 50)',
    ink2: 'oklch(0.42 0.018 55)',
    ink3: 'oklch(0.58 0.014 60)',
    ink4: 'oklch(0.72 0.012 65)',
    line: 'oklch(0.92 0.012 75)',
    lineSoft: 'oklch(0.95 0.01 75)',
    gold: 'oklch(0.72 0.12 70)',
    goldDeep: 'oklch(0.55 0.12 65)',
    goldSoft: 'oklch(0.94 0.05 80)',
    goldTint: 'oklch(0.97 0.025 80)',
    sage: 'oklch(0.62 0.06 145)',
    sageTint: 'oklch(0.95 0.02 140)',
    ember: 'oklch(0.62 0.13 35)',
  },
  // Cool — slate paper + sage. Cathedral-stone feel.
  slate: {
    bg: 'oklch(0.975 0.006 240)',
    bgSoft: 'oklch(0.96 0.008 240)',
    bgPanel: 'oklch(1 0 0)',
    bgInk: 'oklch(0.955 0.01 240)',
    ink: 'oklch(0.2 0.02 250)',
    ink2: 'oklch(0.42 0.02 245)',
    ink3: 'oklch(0.58 0.018 245)',
    ink4: 'oklch(0.72 0.014 240)',
    line: 'oklch(0.91 0.012 240)',
    lineSoft: 'oklch(0.95 0.008 240)',
    gold: 'oklch(0.55 0.1 200)',
    goldDeep: 'oklch(0.42 0.1 215)',
    goldSoft: 'oklch(0.9 0.04 220)',
    goldTint: 'oklch(0.96 0.02 220)',
    sage: 'oklch(0.55 0.08 165)',
    sageTint: 'oklch(0.95 0.025 160)',
    ember: 'oklch(0.55 0.13 35)',
  },
  // Forest — deep green + cream. Monastery garden.
  forest: {
    bg: 'oklch(0.98 0.012 130)',
    bgSoft: 'oklch(0.965 0.014 130)',
    bgPanel: 'oklch(1 0 0)',
    bgInk: 'oklch(0.955 0.016 130)',
    ink: 'oklch(0.22 0.025 150)',
    ink2: 'oklch(0.42 0.02 150)',
    ink3: 'oklch(0.58 0.018 145)',
    ink4: 'oklch(0.72 0.014 140)',
    line: 'oklch(0.91 0.014 135)',
    lineSoft: 'oklch(0.95 0.012 135)',
    gold: 'oklch(0.55 0.12 155)',
    goldDeep: 'oklch(0.42 0.1 160)',
    goldSoft: 'oklch(0.9 0.05 155)',
    goldTint: 'oklch(0.96 0.025 150)',
    sage: 'oklch(0.55 0.13 70)',
    sageTint: 'oklch(0.95 0.04 75)',
    ember: 'oklch(0.6 0.15 50)',
  },
  // Plum — dusty rose + plum + ivory. Devotional.
  plum: {
    bg: 'oklch(0.98 0.01 20)',
    bgSoft: 'oklch(0.965 0.014 15)',
    bgPanel: 'oklch(1 0 0)',
    bgInk: 'oklch(0.955 0.018 15)',
    ink: 'oklch(0.22 0.04 340)',
    ink2: 'oklch(0.42 0.035 340)',
    ink3: 'oklch(0.58 0.025 345)',
    ink4: 'oklch(0.72 0.02 350)',
    line: 'oklch(0.91 0.018 15)',
    lineSoft: 'oklch(0.95 0.014 15)',
    gold: 'oklch(0.62 0.14 0)',
    goldDeep: 'oklch(0.45 0.13 350)',
    goldSoft: 'oklch(0.92 0.05 10)',
    goldTint: 'oklch(0.96 0.025 5)',
    sage: 'oklch(0.55 0.1 175)',
    sageTint: 'oklch(0.95 0.03 175)',
    ember: 'oklch(0.55 0.16 25)',
  },
  // Midnight — dark navy + ember. Late-evening study.
  midnight: {
    bg: 'oklch(0.18 0.018 250)',
    bgSoft: 'oklch(0.21 0.02 250)',
    bgPanel: 'oklch(0.235 0.022 250)',
    bgInk: 'oklch(0.26 0.024 250)',
    ink: 'oklch(0.95 0.014 80)',
    ink2: 'oklch(0.78 0.014 75)',
    ink3: 'oklch(0.62 0.014 70)',
    ink4: 'oklch(0.5 0.012 65)',
    line: 'oklch(0.32 0.022 250)',
    lineSoft: 'oklch(0.28 0.02 250)',
    gold: 'oklch(0.78 0.13 75)',
    goldDeep: 'oklch(0.86 0.12 80)',
    goldSoft: 'oklch(0.32 0.07 70)',
    goldTint: 'oklch(0.27 0.045 70)',
    sage: 'oklch(0.7 0.1 145)',
    sageTint: 'oklch(0.3 0.04 145)',
    ember: 'oklch(0.72 0.15 35)',
  },
};

// Font pair presets. Reads as `[ui, display]`.
window.BJ.fontSets = {
  classic:    { ui: '"Inter", -apple-system, system-ui, sans-serif',
                display: '"Cormorant Garamond", Georgia, serif' },
  dyslexic:   { ui: '"OpenDyslexic", "Inter", sans-serif',
                display: '"OpenDyslexic", "Cormorant Garamond", serif' },
  serif:      { ui: '"Lora", Georgia, serif',
                display: '"Playfair Display", "Cormorant Garamond", serif' },
  modern:     { ui: '"Sora", "Inter", sans-serif',
                display: '"Fraunces", "Cormorant Garamond", serif' },
  humanist:   { ui: '"Inter", sans-serif',
                display: '"EB Garamond", "Cormorant Garamond", serif' },
};

// Backwards compat — original code referenced window.BJ.tokens
window.BJ.tokens = window.BJ.palettes.warm;

const Icon = ({ name, size = 18, stroke = 1.6, style }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style,
  };
  const paths = {
    home: <><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /></>,
    pen: <><path d="M5 19l1-4 11-11 3 3-11 11-4 1z" /><path d="M14 6l3 3" /></>,
    book: <><path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" /><path d="M5 17a3 3 0 0 1 3-3h9" /></>,
    flame: <><path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4-1 3 2 3 2 0 0-2 0-3 0-4z" /></>,
    spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5L8 16M16 8l2.5-2.5" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" /></>,
    graph: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="17" cy="17" r="2" /><circle cx="7" cy="17" r="2" /><circle cx="12" cy="12" r="2.2" /><path d="M8 6.5 10.2 11M16 7.5 13.5 11M15.5 16 13 13M8 16l3-3" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevR: <><path d="m9 5 7 7-7 7" /></>,
    chevD: <><path d="m5 9 7 7 7-7" /></>,
    pin: <><path d="M14 4l6 6-3 1-1 5-5-5-5 1 1-5L4 5" /><path d="m11 13-5 5" /></>,
    star: <><path d="M12 4l2.5 5 5.5.8-4 3.9 1 5.5L12 16.5 7 19.2l1-5.5-4-3.9 5.5-.8z" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></>,
    tag: <><path d="M4 12V4h8l8 8-8 8z" /><circle cx="8" cy="8" r="1.4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l1.7-1.3-1.5-2.6-2 .7a7 7 0 0 0-2-1.2l-.3-2.1h-3l-.3 2.1a7 7 0 0 0-2 1.2l-2-.7-1.5 2.6L7.7 11A7 7 0 0 0 7.6 12a7 7 0 0 0 .1 1.2l-1.7 1.3 1.5 2.6 2-.7a7 7 0 0 0 2 1.2l.3 2.1h3l.3-2.1a7 7 0 0 0 2-1.2l2 .7 1.5-2.6-1.7-1.3a7 7 0 0 0 .1-1.2z" /></>,
    moon: <><path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
    quote: <><path d="M7 7h4v4H7c0 3 2 4 4 4M14 7h4v4h-4c0 3 2 4 4 4" /></>,
    panel: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M14 5v14" /></>,
    panelL: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 5v14" /></>,
    more: <><circle cx="6" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="18" cy="12" r="1.3" /></>,
    check: <><path d="m5 12 4 4 10-10" /></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    headphones: <><path d="M3 14v3a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2zM21 14v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2zM3 14a9 9 0 0 1 18 0" /></>,
    sparkles: <><path d="M5 12l1.5-1.5L8 12l-1.5 1.5zM12 4l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM18 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></>,
    bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 7" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7L12.5 17" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.5" /></>,
    type: <><path d="M5 6h14M12 6v13M9 19h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg {...common}>{paths[name] || paths.home}</svg>;
};

window.BJ.Icon = Icon;
