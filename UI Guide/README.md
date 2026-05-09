# Lampstand — Bible Journal & Study (Hi‑fi prototype)

A peaceful, intelligent space to read scripture, write reflections, track prayers, and connect ideas. This package is a self‑contained HTML prototype with a desktop (1440×900) and mobile (430×912) experience laid out side‑by‑side on a design canvas.

Open **`Bible Journal.html`** in any modern browser. No build step.

---

## What's inside

```
Bible Journal.html        ← entry point. Opens the design canvas with all artboards.
README.md                 ← this file.

design-canvas.jsx         ← Pan/zoom canvas component (DCSection, DCArtboard).
ios-frame.jsx             ← iOS device bezel + status bar (430×912).
tweaks-panel.jsx          ← Floating Tweaks panel with palette + font controls.

app/
  data.js                 ← All app content: verses, entries, prayers, navigation,
                            cross‑refs, AI insights. EDIT HERE to change copy.
  icons.jsx               ← Icon set + design tokens.
                            ▶︎ window.BJ.palettes  (5 themes)
                            ▶︎ window.BJ.fontSets  (5 font pairings)
  desktop-shell.jsx       ← Desktop chrome: top bar, left sidebar, right rail.
  desktop-dashboard.jsx   ← "Today" home dashboard.
  desktop-views.jsx       ← Journal / Bible / Prayer / Research / Graph views.
  mobile-app.jsx          ← Mobile shell + every mobile screen.
```

All scripts load via plain `<script>` tags from the entry HTML — no bundler required. JSX files use Babel Standalone in‑browser.

---

## Themes

Five palettes are wired up; switch live via the Tweaks panel (toolbar) or programmatically via the `palette` prop on `<DesktopApp />` / `<MobileApp />`.

| id          | Mood                          | Surface | Accent          |
|-------------|-------------------------------|---------|-----------------|
| `warm`      | Mercy at sunrise (default)    | Cream   | Soft gold       |
| `slate`     | Cathedral stone               | Slate   | Cool teal       |
| `forest`    | Monastery garden              | Linen   | Deep green      |
| `plum`      | Devotional / dusk             | Ivory   | Plum & rose     |
| `midnight`  | Late‑evening study (dark)     | Navy    | Ember gold      |

Every palette exports the same shape (`bg`, `bgSoft`, `bgPanel`, `bgInk`, `ink`, `ink2`, `ink3`, `ink4`, `line`, `lineSoft`, `gold`, `goldDeep`, `goldSoft`, `goldTint`, `sage`, `sageTint`, `ember`) so any palette can be dropped in without touching components. See `app/icons.jsx` to add or edit.

Built‑in dark mode: the moon/sun button in the desktop top bar toggles between `warm` and `midnight`.

---

## Font pairings

Five pairings, each with a UI font and a display/scripture font. Picked at runtime via CSS variables `--bj-ui` and `--bj-display`.

| id          | UI                | Display / scripture       |
|-------------|-------------------|---------------------------|
| `classic`   | Inter             | Cormorant Garamond        |
| `dyslexic`  | OpenDyslexic      | OpenDyslexic              |
| `serif`     | Lora              | Playfair Display          |
| `modern`    | Sora              | Fraunces                  |
| `humanist`  | Inter             | EB Garamond               |

OpenDyslexic ships via `https://fonts.cdnfonts.com/css/opendyslexic`; the rest via Google Fonts. See `app/icons.jsx` → `window.BJ.fontSets` to add more.

---

## Tweaks panel (live customization)

The floating Tweaks panel is registered with the host preview's edit‑mode protocol. State persists to disk in this block (top of `Bible Journal.html`):

```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "warm",
  "fontPair": "classic"
}/*EDITMODE-END*/;
```

If you're consuming this prototype outside the host (just opening the file), the panel still works — it just won't write changes back to the file.

---

## Screens included

**Desktop (1440 × 900)** — Today dashboard · Journal editor · Bible reader · Prayer journal · Research canvas · Knowledge graph

**Mobile (430 × 912)** — Today · Bible reader · Journal entry · Prayer journal · Slash composer modal

All reachable from the design canvas; each artboard can be opened fullscreen.

---

## For AI / code builders picking this up

1. **Copy is in `app/data.js`** — start there to retheme content.
2. **Tokens are in `app/icons.jsx`** under `window.BJ.palettes` — add a new palette by copying any existing object and tweaking the OKLCH values; the rest of the app picks it up automatically.
3. **Components consume tokens through a `C` prop** — never hard‑code colors. If you add a new screen, accept `C` and use `C.bg`, `C.ink`, etc.
4. **Fonts go through `--bj-ui` / `--bj-display` CSS vars** — set on `:root` by `applyFontVars()` in the entry HTML.
5. **No router, no state library, no build step.** React 18 UMD + Babel Standalone in‑browser. Keep it simple to fork.

Public‑domain scripture (KJV/WEB style). Original journal/prayer copy.
