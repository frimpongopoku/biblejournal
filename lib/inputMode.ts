/**
 * Was the last thing the person did a key press or a pointer?
 * Motion that follows keyboard actions should be instant.
 */
let last: "pointer" | "keyboard" = "pointer";
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", () => { last = "pointer"; }, { capture: true, passive: true });
  window.addEventListener("keydown", (e) => { if (!e.repeat) last = "keyboard"; }, { capture: true, passive: true });
}
export const lastInputWasKeyboard = () => last === "keyboard";
