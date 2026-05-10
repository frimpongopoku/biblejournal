"use client";

import { useEffect, useRef, useState } from "react";
import { fontPairs, type FontPairId } from "@/lib/fonts";

const SIZES = [
  { label: "S", value: 14 },
  { label: "M", value: 17 },
  { label: "L", value: 20 },
  { label: "XL", value: 24 },
];

interface Props {
  fontId: FontPairId;
  fontSize: number;
  onFont: (id: FontPairId) => void;
  onSize: (s: number) => void;
}

export function FontSizePopover({ fontId, fontSize, onFont, onSize }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activePair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Font & size"
        className="bj-btn-icon h-8 px-2.5 rounded-lg flex items-center"
        style={{
          fontFamily: `var(${activePair.displayVar})`,
          fontSize: 14,
          fontStyle: fontId === "dyslexic" ? "normal" : "italic",
          background: open ? "var(--bj-gold-tint)" : "transparent",
          color: open ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
          border: `1px solid ${open ? "var(--bj-gold-soft)" : "transparent"}`,
        }}
      >
        Aa
      </button>

      {open && (
        <div
          className="absolute right-0 rounded-xl overflow-hidden z-50"
          style={{
            top: "calc(100% + 4px)",
            background: "var(--bj-bg-panel)",
            border: "1px solid var(--bj-line)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
            minWidth: 168,
          }}
        >
          <p className="px-3 pt-2.5 pb-1 font-sans text-[9px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
            Font
          </p>
          {fontPairs.map((pair) => {
            const active = fontId === pair.id;
            return (
              <button
                key={pair.id}
                onClick={() => onFont(pair.id)}
                className="flex items-center gap-2.5 w-full px-3 py-1.5"
                style={{ background: active ? "var(--bj-gold-tint)" : "transparent", transition: "background 0.1s ease" }}
              >
                <span style={{
                  fontFamily: `var(${pair.displayVar})`,
                  fontSize: 16,
                  fontStyle: pair.id === "dyslexic" ? "normal" : "italic",
                  color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
                  lineHeight: 1, width: 24, textAlign: "center", display: "block",
                }}>
                  Aa
                </span>
                <span className="font-sans text-xs flex-1 text-left" style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink)", fontWeight: active ? 500 : 400 }}>
                  {pair.label}
                </span>
                {active && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--bj-gold)" }} />}
              </button>
            );
          })}

          <div className="px-3 py-2.5 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
            <p className="font-sans text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>
              Size
            </p>
            <div className="flex gap-1">
              {SIZES.map((s) => {
                const active = fontSize === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => onSize(s.value)}
                    className="flex-1 py-1 rounded-lg font-sans text-xs font-medium"
                    style={{
                      background: active ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                      color: active ? "white" : "var(--bj-ink3)",
                      border: `1px solid ${active ? "transparent" : "var(--bj-line-soft)"}`,
                      transition: "all 0.12s ease",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
