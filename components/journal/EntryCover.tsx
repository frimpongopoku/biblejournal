"use client";

import { useState } from "react";
import { Smile, ImagePlus } from "lucide-react";

/** Soft, blurred wash of the cover behind the top of the page. */
export function CoverWash({ src, tint }: { src: string | null; tint?: string | null }) {
  if (!src && !tint) return null;
  return (
    <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden"
      style={{ height: 420, WebkitMaskImage: "linear-gradient(#000 25%, transparent)", maskImage: "linear-gradient(#000 25%, transparent)" }}>
      <div className="absolute" style={{
        inset: -60, opacity: 0.38, filter: "blur(60px) saturate(130%)",
        background: src ? `center / cover no-repeat url("${src}")` : tint ?? undefined,
      }} />
    </div>
  );
}

/** Two drop targets while a photo is dragged over the page. */
export function PhotoDropOverlay({ onCover, onPage, onLeave }: {
  onCover: (files: File[]) => void;
  onPage: (files: File[]) => void;
  onLeave: () => void;
}) {
  const [over, setOver] = useState<"cover" | "page" | null>(null);
  const files = (e: React.DragEvent) => Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
  const zone = (id: "cover" | "page", title: string, sub: string, Icon: typeof Smile, gold: boolean) => (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setOver(id); }}
      onDragLeave={() => setOver((o) => (o === id ? null : o))}
      onDrop={(e) => { e.preventDefault(); const f = files(e); onLeave(); if (f.length) (id === "cover" ? onCover : onPage)(f); }}
      className="bj-glass flex-1 rounded-[20px] flex flex-col items-center justify-center gap-2.5 text-center px-6"
      style={{
        border: `1.5px dashed ${gold ? "color-mix(in oklch, var(--bj-gold) 70%, transparent)" : "var(--bj-line)"}`,
        background: over === id ? "color-mix(in oklch, var(--bj-gold) 16%, transparent)" : undefined,
        transform: over === id ? "scale(1.015)" : "none", transition: "transform 0.15s var(--ease-out), background-color 0.15s ease",
      }}>
      <Icon size={28} strokeWidth={1.6} style={{ color: gold ? "var(--bj-gold)" : "var(--bj-ink2)" }} />
      <p className="font-display text-[22px]" style={{ color: "var(--bj-ink)" }}>{title}</p>
      <p className="font-sans text-[12.5px]" style={{ color: "var(--bj-ink3)" }}>{sub}</p>
    </div>
  );
  return (
    <div className="absolute inset-0 z-30 flex gap-3.5 p-6 md:p-10"
      style={{ background: "color-mix(in oklch, var(--bj-bg) 45%, transparent)" }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onLeave(); }}
      onDrop={(e) => { e.preventDefault(); onLeave(); }}>
      {zone("cover", "How I felt", "Shows next to this page in your list", Smile, true)}
      {zone("page", "Add to this page’s photos", "Kept small beside your writing", ImagePlus, false)}
    </div>
  );
}
