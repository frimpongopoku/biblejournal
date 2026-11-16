"use client";

import { useEffect } from "react";
import type { Editor } from "@tiptap/core";
import { useWritingStore } from "@/store/writing.store";
import { usePrefsStore } from "@/store/prefs.store";
import { configureKeySounds, keySoundDown, keySoundUp } from "@/lib/typing/keySounds";

// ── Keyboard sounds ─────────────────────────────────────────
// One document listener for the whole app (however many editors are
// mounted). It clicks inside a [data-writing-surface], and — unless that's
// switched off in Settings — in any other place you type text.

let soundUsers = 0;
let unsubscribeStore: (() => void) | null = null;

const TEXT_INPUT = /^(text|search|email|url|tel|number|)$/;
function inSurface(t: EventTarget | null) {
  if (!(t instanceof Element)) return false;
  if (t.closest("[data-writing-surface]")) return true;
  if (t.closest("[data-no-key-sounds]") || !usePrefsStore.getState().soundsEverywhere) return false;
  if (t instanceof HTMLTextAreaElement) return !t.readOnly;
  if (t instanceof HTMLInputElement) return TEXT_INPUT.test(t.type) && !t.readOnly;
  return t instanceof HTMLElement && t.isContentEditable;
}
function onDown(e: KeyboardEvent) { if (inSurface(e.target)) keySoundDown(e); }
function onUp(e: KeyboardEvent) { if (inSurface(e.target)) keySoundUp(e); }

export function useKeySounds() {
  useEffect(() => {
    if (soundUsers++ === 0) {
      const apply = () => {
        const s = useWritingStore.getState();
        configureKeySounds({ enabled: s.keySounds, switchId: s.switchId, volume: s.volume });
      };
      apply();
      unsubscribeStore = useWritingStore.subscribe(apply);
      document.addEventListener("keydown", onDown, true);
      document.addEventListener("keyup", onUp, true);
    }
    return () => {
      if (--soundUsers === 0) {
        unsubscribeStore?.();
        document.removeEventListener("keydown", onDown, true);
        document.removeEventListener("keyup", onUp, true);
      }
    };
  }, []);
}

// ── Smooth caret + typewriter scrolling ─────────────────────

/**
 * Drives an absolutely-positioned caret element inside `surface` (the
 * relatively-positioned box around the editor). Writes transform directly —
 * no React re-render per keystroke. Also keeps the caret line at a steady
 * height in `scroller` when typewriter mode is on.
 */
export function useCaretAndTypewriter(
  editor: Editor | null,
  surfaceRef: React.RefObject<HTMLElement | null>,
  caretRef: React.RefObject<HTMLElement | null>,
  scrollerRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const surface = surfaceRef.current;
    const caret = caretRef.current;
    if (!editor || !surface || !caret) return;
    const view = editor.view;
    let raf = 0;
    let movingTimer: ReturnType<typeof setTimeout> | undefined;
    let last = { x: -1, y: -1 };
    let pointerDriven = false;
    let typedSinceScroll = false;

    const place = () => {
      raf = 0;
      if (editor.isDestroyed) return;
      const { smoothCaret, typewriter } = useWritingStore.getState();
      surface.classList.toggle("bj-smooth", smoothCaret);
      const sel = editor.state.selection;
      const showCaret = smoothCaret && view.hasFocus() && sel.empty && !view.composing;

      let coords: { left: number; top: number; bottom: number } | null = null;
      if (showCaret || typewriter) {
        try { coords = view.coordsAtPos(sel.head); } catch { coords = null; }
      }

      if (!showCaret || !coords) {
        caret.hidden = true;
        last = { x: -1, y: -1 };
      } else {
        const r = surface.getBoundingClientRect();
        const h = Math.max(12, coords.bottom - coords.top);
        const x = coords.left - r.left - 1;
        const y = coords.top - r.top;
        // Glide along a line; jump (no transition) on big moves like clicks
        // far away or page-long arrow presses, which would otherwise streak.
        const jump = caret.hidden || last.x < 0 || Math.abs(y - last.y) > h * 2.5;
        caret.toggleAttribute("data-jump", jump);
        caret.hidden = false;
        caret.style.height = `${h}px`;
        caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        caret.setAttribute("data-moving", "");
        clearTimeout(movingTimer);
        movingTimer = setTimeout(() => caret.removeAttribute("data-moving"), 550);
        last = { x, y };
      }

      const scroller = scrollerRef.current;
      if (typewriter && coords && scroller && !pointerDriven && typedSinceScroll && view.hasFocus()) {
        typedSinceScroll = false;
        const sr = scroller.getBoundingClientRect();
        const target = sr.top + sr.height * 0.42;
        const delta = coords.top - target;
        if (Math.abs(delta) > 3) scroller.scrollBy({ top: delta, behavior: "smooth" });
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(place); };

    const onTransaction = ({ transaction }: { transaction: { docChanged: boolean; selectionSet: boolean } }) => {
      if (transaction.docChanged || transaction.selectionSet) typedSinceScroll = !pointerDriven;
      schedule();
    };
    const onPointer = () => { pointerDriven = true; };
    const onKey = () => { pointerDriven = false; };
    const onCompStart = () => { surface.classList.add("bj-composing"); schedule(); };
    const onCompEnd = () => { surface.classList.remove("bj-composing"); schedule(); };

    editor.on("transaction", onTransaction);
    editor.on("focus", schedule);
    editor.on("blur", schedule);
    view.dom.addEventListener("mousedown", onPointer);
    view.dom.addEventListener("keydown", onKey);
    view.dom.addEventListener("compositionstart", onCompStart);
    view.dom.addEventListener("compositionend", onCompEnd);
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(surface);
    void document.fonts?.ready.then(schedule);
    const unsub = useWritingStore.subscribe(schedule);
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(movingTimer);
      editor.off("transaction", onTransaction);
      editor.off("focus", schedule);
      editor.off("blur", schedule);
      view.dom.removeEventListener("mousedown", onPointer);
      view.dom.removeEventListener("keydown", onKey);
      view.dom.removeEventListener("compositionstart", onCompStart);
      view.dom.removeEventListener("compositionend", onCompEnd);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      unsub();
    };
  }, [editor, surfaceRef, caretRef, scrollerRef]);
}
