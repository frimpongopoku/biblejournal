"use client";

/**
 * Mechanical keyboard sounds for the writing surfaces.
 *
 * Real switch recordings (kbsim, MIT — public/sounds/switches/LICENSE-kbsim.md),
 * ported from Stella/Pongo Teaches Typing. Each switch has a press sound per
 * keyboard row plus Space / Enter / Backspace, and matching release sounds:
 * press plays on keydown, release on keyup, like a real board.
 *
 * Browsers only allow audio after a gesture, so the AudioContext is created
 * on the first pointer/key event. Banks are fetched lazily, only once sound
 * is switched on, so people who never enable it never download a byte.
 */

export const SWITCHES = {
  "mx-brown": { name: "Cherry MX Brown", feel: "Tactile · the classic", dir: "mxbrown", special: true },
  "holy-panda": { name: "Holy Panda", feel: "Tactile · deep thock", dir: "holypanda", special: true },
  cream: { name: "NovelKeys Cream", feel: "Linear · creamy, marbly", dir: "cream", special: true },
  topre: { name: "Topre", feel: "Soft, rounded thock", dir: "topre", special: true },
  alpaca: { name: "Alpaca", feel: "Linear · smooth and muted", dir: "alpaca", special: true },
  "black-ink": { name: "Gateron Black Ink", feel: "Linear · deep", dir: "blackink", special: true },
  "mx-black": { name: "Cherry MX Black", feel: "Linear · heavy", dir: "mxblack", special: true },
  turquoise: { name: "Turquoise Tealios", feel: "Linear · light and poppy", dir: "turquoise", special: true },
  "red-ink": { name: "Gateron Red Ink", feel: "Linear · bright", dir: "redink", special: true },
  "mx-blue": { name: "Cherry MX Blue", feel: "Clicky · loud and crisp", dir: "mxblue", special: false },
  "box-navy": { name: "Kailh Box Navy", feel: "Clicky · thick and loud", dir: "boxnavy", special: true },
  "buckling-spring": { name: "Buckling Spring", feel: "Clicky · vintage IBM Model M", dir: "buckling", special: true },
  "blue-alps": { name: "Blue Alps", feel: "Clicky · vintage, sharp", dir: "bluealps", special: true },
} as const;

export type SwitchId = keyof typeof SWITCHES;
export const DEFAULT_SWITCH: SwitchId = "mx-brown";

type Slot = "R0" | "R1" | "R2" | "R3" | "R4" | "SPACE" | "ENTER" | "BACKSPACE";
interface Bank {
  press: Partial<Record<Slot, AudioBuffer>>;
  release: Partial<Record<Slot | "GENERIC", AudioBuffer>>;
}

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let unlocked = false;
let enabled = false;
let volume = 0.7;
let current: SwitchId = DEFAULT_SWITCH;
let loaded: Bank | null = null;
const banks = new Map<SwitchId, Promise<Bank | null>>();

function build(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor({ latencyHint: "interactive" });
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.15;
  out = ctx.createGain();
  out.gain.value = volume * 1.3;
  out.connect(comp).connect(ctx.destination);
  return ctx;
}

function unlock() {
  const c = build();
  if (!c) return;
  if (c.state === "suspended" && !document.hidden) void c.resume();
  if (!unlocked) {
    unlocked = true;
    if (enabled) activate(current);
  }
}

if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "keydown", "touchstart"] as const) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  }
  if (navigator.userActivation?.hasBeenActive) queueMicrotask(unlock);
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else if (unlocked) void ctx.resume();
  });
}

async function fetchBuffer(c: AudioContext, url: string): Promise<AudioBuffer | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return await c.decodeAudioData(await res.arrayBuffer());
  } catch {
    return undefined;
  }
}

function load(id: SwitchId): Promise<Bank | null> {
  const cached = banks.get(id);
  if (cached) return cached;
  const p = (async () => {
    const c = unlocked ? build() : null;
    if (!c) return null;
    const { dir, special } = SWITCHES[id];
    const url = (kind: string, file: string) => `/sounds/switches/${dir}/${kind}/${file}.mp3`;
    const pressSlots: Slot[] = ["R0", "R1", "R2", "R3", "R4", ...(special ? (["SPACE", "ENTER", "BACKSPACE"] as Slot[]) : [])];
    const releaseSlots = special ? (["GENERIC", "SPACE", "ENTER", "BACKSPACE"] as const) : (["GENERIC"] as const);
    const press = Object.fromEntries(
      await Promise.all(pressSlots.map(async (s) => [s, await fetchBuffer(c, url("press", s.startsWith("R") ? `GENERIC_${s}` : s))] as const)),
    );
    const release = Object.fromEntries(
      await Promise.all(releaseSlots.map(async (s) => [s, await fetchBuffer(c, url("release", s))] as const)),
    );
    return { press, release } as Bank;
  })();
  banks.set(id, p);
  void p.then((b) => { if (!b) banks.delete(id); });
  return p;
}

function activate(id: SwitchId) {
  current = id;
  void load(id).then((b) => { if (current === id) loaded = b; });
}

export function configureKeySounds(opts: { enabled: boolean; switchId?: string; volume?: number }) {
  enabled = opts.enabled;
  if (opts.volume !== undefined) {
    volume = opts.volume;
    if (out) out.gain.value = volume * 1.3;
  }
  const next = opts.switchId && opts.switchId in SWITCHES ? (opts.switchId as SwitchId) : DEFAULT_SWITCH;
  if (next !== current || !loaded) {
    current = next;
    loaded = null;
    if (enabled && unlocked) activate(next);
  }
}

function slotFor(code: string): Slot {
  if (code === "Space") return "SPACE";
  if (code === "Enter" || code === "NumpadEnter") return "ENTER";
  if (code === "Backspace" || code === "Delete") return "BACKSPACE";
  if (/^(Digit\d|Backquote|Minus|Equal)$/.test(code)) return "R0";
  if (/^(Key[QWERTYUIOP]|BracketLeft|BracketRight|Backslash|Tab)$/.test(code)) return "R1";
  if (/^(Key[ASDFGHJKL]|Semicolon|Quote|CapsLock)$/.test(code)) return "R2";
  if (/^(Key[ZXCVBNM]|Comma|Period|Slash|IntlBackslash|Shift(Left|Right))$/.test(code)) return "R3";
  return "R4";
}

function play(buffer: AudioBuffer | undefined, gain: number) {
  if (!ctx || !out || !buffer) return;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  // Tiny pitch and level variation so repeated keys don't sound copy-pasted.
  src.playbackRate.value = 0.96 + Math.random() * 0.08;
  const amp = ctx.createGain();
  amp.gain.value = gain * (0.85 + Math.random() * 0.15);
  src.connect(amp).connect(out);
  src.start();
}

function pressCode(code: string) {
  if (!loaded) return;
  play(loaded.press[slotFor(code)] ?? loaded.press.R2, 0.9);
}

function releaseCode(code: string) {
  if (!loaded) return;
  const slot = slotFor(code);
  const r = loaded.release;
  play((slot === "SPACE" || slot === "ENTER" || slot === "BACKSPACE" ? r[slot] : undefined) ?? r.GENERIC, 0.55);
}

// Keys that make a sound: anything that types, plus the editing keys.
// Pure modifiers and navigation stay silent (a writer arrowing around
// shouldn't sound like they're hammering the board).
const SILENT = /^(Meta|Control|Alt|Shift|Arrow|Escape|F\d|Home|End|Page|Caps|Fn|OS|Context)/;

interface KeyLike { code: string; key?: string; repeat?: boolean; metaKey?: boolean; ctrlKey?: boolean; isComposing?: boolean }

/** Call from keydown. Ignores auto-repeat, shortcuts and IME composition. */
export function keySoundDown(e: KeyLike) {
  if (!enabled || e.repeat || e.metaKey || e.ctrlKey || e.isComposing) return;
  if (SILENT.test(e.code) || SILENT.test(e.key ?? "")) return;
  pressCode(e.code);
}

export function keySoundUp(e: KeyLike) {
  if (!enabled || e.metaKey || e.ctrlKey) return;
  if (SILENT.test(e.code) || SILENT.test(e.key ?? "")) return;
  releaseCode(e.code);
}

/** Play a short phrase so someone choosing a switch can hear it. */
export function previewSwitch(id: SwitchId) {
  unlock();
  current = id;
  void load(id).then((bank) => {
    if (!bank) return;
    loaded = bank;
    ["KeyF", "KeyJ", "KeyD", "KeyK", "Space"].forEach((code, i) => {
      setTimeout(() => pressCode(code), i * 120);
      setTimeout(() => releaseCode(code), i * 120 + 65);
    });
  });
}
