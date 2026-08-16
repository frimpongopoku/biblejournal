import { Library } from "lucide-react";
import type { TimelineSource } from "@/lib/data/timeline";

export function EraSourcesBlock({ sources, dateCaveat }: { sources: TimelineSource[]; dateCaveat?: string }) {
  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Library size={13} style={{ color: "var(--bj-ink4)" }} />
        <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>
          Where this chronology comes from
        </p>
      </div>
      <ul className="space-y-1.5 mb-4">
        {sources.map((s, i) => (
          <li key={i} className="font-sans text-[13px]" style={{ color: "var(--bj-ink2)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--bj-ink)" }}>{s.title}</span>
            {s.note ? <span style={{ color: "var(--bj-ink4)" }}> — {s.note}</span> : null}
          </li>
        ))}
      </ul>
      {dateCaveat && (
        <p
          className="font-sans text-xs pt-4"
          style={{ color: "var(--bj-ink3)", lineHeight: 1.7, borderTop: "1px solid var(--bj-line-soft)" }}
        >
          <span style={{ color: "var(--bj-ink4)", fontWeight: 500 }}>On the dates: </span>
          {dateCaveat}
        </p>
      )}
    </div>
  );
}
