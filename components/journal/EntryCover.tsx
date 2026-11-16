"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RefreshCw, Smile, ImagePlus } from "lucide-react";
import { useUploads, attachCover, pickPhotos } from "@/lib/photos";
import { updateEntry } from "@/services/journal.service";
import type { JournalEntry } from "@/types";

/** The cover image for an entry: saved URL, or the local preview while it uploads. */
export function useCoverSrc(entry: Pick<JournalEntry, "id" | "cover"> | null | undefined) {
  const pending = useUploads((s) => (entry ? s.uploads[s.covers[entry.id] ?? ""] : undefined));
  if (!entry) return { src: null as string | null, pending };
  return { src: pending?.localUrl ?? entry.cover?.url ?? null, pending };
}

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

export function EntryCover({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const { src, pending } = useCoverSrc(entry);
  const [hover, setHover] = useState(false);
  if (!src) return null;

  async function replace() {
    const [file] = await pickPhotos();
    if (file) attachCover(uid, entry.id, file);
  }

  return (
    <div className="relative inline-block mb-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="How I felt" className="block object-cover rounded-2xl"
        style={{
          width: "min(220px, 62vw)", aspectRatio: "7 / 5", transform: "rotate(-1.5deg)", animation: "bj-pop 0.42s cubic-bezier(0.34, 1.4, 0.64, 1) both",
          background: entry.cover?.tint ?? "var(--bj-bg-soft)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18), 0 18px 40px -12px var(--m-shade)",
        }} />
      <span className="bj-glass absolute left-2.5 -bottom-3 flex items-center gap-1.5 h-6 px-2.5 rounded-full font-sans text-[11px] font-medium"
        style={{ color: "var(--bj-ink)" }}>
        <Smile size={12} style={{ color: "var(--bj-gold)" }} />
        {pending?.status === "uploading" ? `Saving… ${Math.round(pending.progress * 100)}%` : pending?.status === "error" ? "Couldn’t upload" : "How I felt"}
      </span>
      <AnimatePresence>
        {hover && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
            className="absolute top-2 right-2 flex gap-1">
            <button type="button" onClick={replace} aria-label="Replace photo" title="Replace"
              className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)" }}>
              <RefreshCw size={12} />
            </button>
            <button type="button" onClick={() => void updateEntry(uid, entry.id, { cover: null })} aria-label="Remove photo" title="Remove"
              className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)" }}>
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Small chip in the entry's meta row: add a cover photo. */
export function AddCoverChip({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const { src } = useCoverSrc(entry);
  if (src) return null;
  return (
    <button type="button"
      onClick={async () => { const [f] = await pickPhotos({ camera: window.matchMedia("(pointer: coarse)").matches }); if (f) attachCover(uid, entry.id, f); }}
      className="bj-chip flex items-center gap-1.5 h-6 px-2.5 rounded-full font-sans text-[11.5px]"
      style={{ color: "var(--bj-ink3)", border: "1px dashed var(--bj-line)" }}
      title="Add a photo of how you feel (⌘⇧P adds one to the page)">
      <Camera size={12} /> Photo
    </button>
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
      {zone("cover", "Set as how I felt", "Becomes the cover — the page takes its colours", Smile, true)}
      {zone("page", "Add to the page", "Lands where your cursor is", ImagePlus, false)}
    </div>
  );
}
