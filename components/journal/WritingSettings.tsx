"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Volume2 } from "lucide-react";
import { useWritingStore, WRITING_FONTS, type WritingWidth } from "@/store/writing.store";
import { SWITCHES, previewSwitch, type SwitchId } from "@/lib/typing/keySounds";

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="relative shrink-0 rounded-full"
      style={{
        width: 34, height: 20,
        background: on ? "var(--bj-gold)" : "var(--bj-line)",
        transition: "background-color 0.15s ease",
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          top: 2, left: 2, width: 16, height: 16,
          background: on ? "var(--bj-bg)" : "var(--bj-ink4)",
          transform: on ? "translateX(14px)" : "none",
          transition: "transform 0.18s var(--ease-out), background-color 0.15s ease",
        }}
      />
    </button>
  );
}

function Row({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px]" style={{ color: "var(--bj-ink)" }}>{title}</p>
        <p className="font-sans text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>{hint}</p>
      </div>
      {children}
    </div>
  );
}

const label = "font-sans text-[11px] font-medium mb-2";

export function WritingSettingsButton({ showZen = false }: { showZen?: boolean }) {
  const [open, setOpen] = useState(false);
  const [showAllSwitches, setShowAllSwitches] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const s = useWritingStore();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey, true); };
  }, [open]);

  const switchIds = Object.keys(SWITCHES) as SwitchId[];
  const visibleSwitches = showAllSwitches ? switchIds : [s.switchId, ...switchIds.filter((x) => x !== s.switchId)].slice(0, 4);

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        aria-label="Writing settings"
        aria-expanded={open}
        title="Writing settings"
        className="bj-btn-icon h-8 w-9 rounded-lg flex items-center justify-center"
        style={{
          background: open ? "var(--bj-gold-tint)" : "transparent",
          color: open ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
          fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", fontSize: 17, fontWeight: 500,
        }}
      >
        Aa
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 z-50 rounded-2xl overflow-hidden"
            style={{
              top: "calc(100% + 8px)", width: 360, maxWidth: "calc(100vw - 24px)",
              transformOrigin: "top right",
              background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)",
              boxShadow: "var(--bj-shadow-lg)",
              maxHeight: "min(78vh, 720px)", overflowY: "auto",
            }}
          >
            {/* Typeface, size, width */}
            <div className="p-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
              <p className={label} style={{ color: "var(--bj-ink4)" }}>Typeface</p>
              <div className="grid grid-cols-3 gap-1.5">
                {WRITING_FONTS.map((f) => {
                  const active = s.font === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => s.set({ font: f.id })}
                      className="bj-chip h-14 rounded-xl flex flex-col items-center justify-center gap-0.5"
                      data-active={active || undefined}
                      style={{
                        border: `1px solid ${active ? "var(--bj-gold-soft)" : "var(--bj-line-soft)"}`,
                        background: active ? "var(--bj-gold-tint)" : "transparent",
                        color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
                      }}
                    >
                      <span style={{ fontFamily: `var(${f.cssVar}), serif`, fontStyle: f.italic ? "italic" : "normal", fontSize: 20 * f.scale + 2, lineHeight: 1 }}>Aa</span>
                      <span className="font-sans text-[10px]" style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-4">
                <div className="flex-1 min-w-0">
                  <p className={label} style={{ color: "var(--bj-ink4)" }}>Size</p>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}>A</span>
                    <input
                      type="range" min={15} max={28} step={1} value={s.size}
                      onChange={(e) => s.set({ size: Number(e.target.value) })}
                      aria-label="Text size"
                      className="flex-1"
                      style={{ accentColor: "var(--bj-gold)" }}
                    />
                    <span className="font-sans text-[15px]" style={{ color: "var(--bj-ink4)" }}>A</span>
                  </div>
                </div>
                <div style={{ width: 150 }}>
                  <p className={label} style={{ color: "var(--bj-ink4)" }}>Width</p>
                  <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: "var(--bj-bg-soft)" }}>
                    {(["narrow", "normal", "wide"] as WritingWidth[]).map((w) => (
                      <button
                        key={w} type="button" onClick={() => s.set({ width: w })}
                        className="flex-1 h-6 rounded-md font-sans text-[11px] capitalize"
                        style={{
                          background: s.width === w ? "var(--bj-line)" : "transparent",
                          color: s.width === w ? "var(--bj-ink)" : "var(--bj-ink3)",
                        }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard sounds */}
            <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
              <Row title="Keyboard sounds" hint="Real switch recordings, press and release">
                <Toggle on={s.keySounds} onChange={() => s.toggle("keySounds")} label="Keyboard sounds" />
              </Row>
              {s.keySounds && (
                <>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {visibleSwitches.map((id) => {
                      const sw = SWITCHES[id];
                      const active = s.switchId === id;
                      return (
                        <div key={id} className="flex items-center rounded-lg"
                          style={{ background: active ? "var(--bj-gold-tint)" : "transparent" }}>
                          <button
                            type="button"
                            onClick={() => { s.set({ switchId: id }); previewSwitch(id); }}
                            className="flex-1 min-w-0 flex items-center gap-2 h-9 px-2.5 text-left rounded-lg bj-list-row"
                            data-active={active || undefined}
                          >
                            <span className="font-sans text-[13px] truncate" style={{ color: active ? "var(--bj-ink)" : "var(--bj-ink2)" }}>
                              {sw.name}
                              <span style={{ color: "var(--bj-ink4)", fontSize: 12 }}> · {sw.feel}</span>
                            </span>
                            {active && <Check size={14} className="ml-auto shrink-0" style={{ color: "var(--bj-gold-deep)" }} />}
                          </button>
                          {!active && (
                            <button type="button" aria-label={`Preview ${sw.name}`} title="Preview"
                              onClick={() => previewSwitch(id)}
                              className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center mr-0.5"
                              style={{ color: "var(--bj-ink4)" }}>
                              <Volume2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {!showAllSwitches && (
                      <button type="button" onClick={() => setShowAllSwitches(true)}
                        className="h-8 px-2.5 text-left font-sans text-[12px] rounded-lg bj-btn-ghost"
                        style={{ color: "var(--bj-ink3)" }}>
                        + {switchIds.length - 4} more switches
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 px-2.5">
                    <span className="font-sans text-[12px]" style={{ color: "var(--bj-ink4)", width: 50 }}>Volume</span>
                    <input type="range" min={0.1} max={1} step={0.05} value={s.volume}
                      onChange={(e) => s.set({ volume: Number(e.target.value) })}
                      aria-label="Keyboard sound volume" className="flex-1" style={{ accentColor: "var(--bj-ink3)" }} />
                  </div>
                </>
              )}
            </div>

            {/* Writing aids */}
            <div className="px-4 py-2">
              <Row title="Smooth caret" hint="Glides between letters instead of jumping">
                <Toggle on={s.smoothCaret} onChange={() => s.toggle("smoothCaret")} label="Smooth caret" />
              </Row>
              <Row title="Typewriter scrolling" hint="Your line stays at eye level">
                <Toggle on={s.typewriter} onChange={() => s.toggle("typewriter")} label="Typewriter scrolling" />
              </Row>
              <Row title="Focus paragraph" hint="Dim everything but where you are">
                <Toggle on={s.focusParagraph} onChange={() => s.toggle("focusParagraph")} label="Focus paragraph" />
              </Row>
              <Row title="Session goal" hint="A quiet ring, no streak pressure">
                <select
                  value={s.goal}
                  onChange={(e) => s.set({ goal: Number(e.target.value) })}
                  aria-label="Session goal"
                  className="font-sans text-base md:text-[12px] rounded-lg px-2 h-7 outline-none"
                  style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink2)", border: "1px solid var(--bj-line)" }}
                >
                  <option value={0}>Off</option>
                  <option value={150}>150 words</option>
                  <option value={300}>300 words</option>
                  <option value={500}>500 words</option>
                  <option value={750}>750 words</option>
                  <option value={1000}>1,000 words</option>
                </select>
              </Row>
            </div>
            {showZen && (
              <button type="button"
                onClick={() => { setOpen(false); s.set({ zen: true }); }}
                className="w-full flex items-center gap-2 px-4 h-10 border-t font-sans text-[12px] bj-btn-ghost"
                style={{ borderColor: "var(--bj-line-soft)", color: "var(--bj-ink3)" }}>
                Zen mode
                <span className="ml-auto hidden md:flex gap-1"><kbd className="bj-kbd">⌘</kbd><kbd className="bj-kbd">.</kbd></span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
