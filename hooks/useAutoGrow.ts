import { useEffect } from "react";

/**
 * Grows a textarea to fit its text. Re-measures when its width changes and
 * once web fonts finish loading — measuring only on change missed both and
 * left long titles clipped to one line.
 */
export function useAutoGrow(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; };
    fit();
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => { if (el.clientWidth !== width) { width = el.clientWidth; fit(); } });
    ro.observe(el);
    let alive = true;
    void document.fonts?.ready.then(() => { if (alive) fit(); });
    return () => { alive = false; ro.disconnect(); };
  }, [ref, value]);
}
