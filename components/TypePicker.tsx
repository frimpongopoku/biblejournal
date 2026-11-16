"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useFontStore } from "@/store/font.store";
import { useWritingStore } from "@/store/writing.store";
import { UI_FACES, WRITE_FACES, READ_FACES, faceStack, type Face } from "@/lib/typeface";
import { lastInputWasKeyboard } from "@/lib/inputMode";

export type TypeRole = "ui" | "write" | "read";

const SAMPLE: Record<TypeRole, string> = {
  ui: "Today · 3 entries · Psalm 46",
  write: "Lord, I don’t know how this ends, but",
  read: "Be still, and know that I am God.",
};

function Rows<Id extends string>({ list, value, onPick, role }: { list: Face<Id>[]; value: string; onPick: (id: Id) => void; role: TypeRole }) {
  return (
    <div className="flex flex-col gap-0.5" role="radiogroup">
      {list.map((f) => {
        const on = f.id === value;
        return (
          <button key={f.id} type="button" role="radio" aria-checked={on} onClick={() => onPick(f.id)}
            data-active={on || undefined}
            className={`type-row w-full text-left rounded-[12px] px-3 py-2.5 flex items-start gap-3 ${on ? "bj-raised" : ""}`}>
            <span className="min-w-0 flex-1">
              <span className="block truncate" style={{
                fontFamily: faceStack(f, role === "ui" ? "system-ui, sans-serif" : "Georgia, serif"),
                fontSize: role === "ui" ? 14.5 : Math.round(19 * f.scale),
                fontStyle: role === "read" && f.italic ? "italic" : "normal",
                color: on ? "var(--bj-ink)" : "var(--bj-ink2)", lineHeight: 1.3,
              }}>{SAMPLE[role]}</span>
              <span className="flex items-baseline gap-1.5 mt-1 font-sans text-[11.5px] min-w-0">
                <span className="font-medium shrink-0" style={{ color: on ? "var(--bj-gold)" : "var(--bj-ink3)" }}>{f.label}</span>
                <span className="truncate" style={{ color: "var(--bj-ink4)" }}>{f.note}</span>
              </span>
            </span>
            {on && <Check size={14} className="shrink-0 mt-1" style={{ color: "var(--bj-gold)" }} />}
          </button>
        );
      })}
    </div>
  );
}

/** One role's faces (and size, for writing and reading). */
export function FaceList({ role, size = true }: { role: TypeRole; size?: boolean }) {
  const ui = useFontStore((s) => s.ui);
  const setUi = useFontStore((s) => s.setUi);
  const w = useWritingStore();

  return (
    <div className="flex flex-col gap-3">
      {role === "ui" && <Rows list={UI_FACES} value={ui} onPick={setUi} role="ui" />}
      {role === "write" && <Rows list={WRITE_FACES} value={w.font} onPick={(font) => w.set({ font })} role="write" />}
      {role === "read" && <Rows list={READ_FACES} value={w.readFont} onPick={(readFont) => w.set({ readFont })} role="read" />}
      {size && role !== "ui" && (
        <div className="flex items-center gap-2.5 px-1">
          <span className="font-sans text-[11px] w-7" style={{ color: "var(--bj-ink4)" }}>Size</span>
          <span className="font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}>A</span>
          <input type="range" min={15} max={28} step={1}
            value={role === "write" ? w.size : w.readSize}
            onChange={(e) => w.set(role === "write" ? { size: Number(e.target.value) } : { readSize: Number(e.target.value) })}
            aria-label={role === "write" ? "Writing size" : "Reading size"} className="flex-1" style={{ accentColor: "var(--bj-gold)" }} />
          <span className="font-sans text-[15px]" style={{ color: "var(--bj-ink4)" }}>A</span>
        </div>
      )}
    </div>
  );
}

const TABS: { id: TypeRole; label: string }[] = [
  { id: "ui", label: "Interface" },
  { id: "write", label: "Writing" },
  { id: "read", label: "Reading" },
];

/** All three roles behind tabs. */
export function TypePicker({ initial = "ui" }: { initial?: TypeRole }) {
  const [role, setRole] = useState<TypeRole>(initial);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-0.5 p-0.5 rounded-[11px] bj-well">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setRole(t.id)} data-active={role === t.id || undefined}
            className="relative flex-1 h-7 rounded-[9px] font-sans text-[12px] font-medium"
            style={{ color: role === t.id ? "var(--bj-ink)" : "var(--bj-ink4)" }}>
            {role === t.id && (
              <motion.span layoutId="type-tab" className="absolute inset-0 rounded-[9px] bj-raised"
                transition={lastInputWasKeyboard() ? { duration: 0 } : { type: "spring", duration: 0.34, bounce: 0.12 }} />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
      <p className="font-sans text-[11.5px] px-1" style={{ color: "var(--bj-ink4)" }}>
        {role === "ui" ? "Menus, buttons and lists." : role === "write" ? "The words you type: journal, notes, sermons." : "Scripture, in the Bible and wherever verses are quoted."}
      </p>
      <FaceList role={role} />
    </div>
  );
}
