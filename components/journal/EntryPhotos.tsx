"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImageUp, Smile, X, ChevronLeft, ChevronRight, Download, Trash2, RotateCcw } from "lucide-react";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase";
import { useUploads, useCamera, getPhotos, attachPhotos, retryUpload, discardUpload, uploadErrorText, type Upload } from "@/lib/photos";
import { removeEntryPhoto, updateEntry } from "@/services/journal.service";
import { useMounted } from "@/hooks/useMounted";
import type { EntryPhoto, JournalEntry } from "@/types";

/* ──────────────────────────────────────────────────────────────
   Photos on an entry: kept small in the top line, peeked on hover,
   seen full size in the viewer. The cover ("how I felt") is one of
   them and only tints the page.
   ────────────────────────────────────────────────────────────── */

export interface PhotoItem {
  key: string;
  src: string;
  tint?: string;
  photo?: EntryPhoto;
  upload?: Upload;
  isCover: boolean;
}

/** Saved photos (old entries: just the cover), then the ones still uploading. */
export function useEntryPhotos(entry: Pick<JournalEntry, "id" | "cover" | "photos"> | null | undefined): PhotoItem[] {
  const pendingIds = useUploads((s) => (entry ? s.pending[entry.id] : undefined));
  const uploads = useUploads((s) => s.uploads);
  return useMemo(() => {
    if (!entry) return [];
    const saved = [...(entry.photos ?? [])];
    if (entry.cover && !saved.some((p) => p.url === entry.cover!.url)) saved.unshift(entry.cover);
    const items: PhotoItem[] = saved.map((p) => ({ key: p.path || p.url, src: p.url, tint: p.tint, photo: p, isCover: p.url === entry.cover?.url }));
    for (const id of pendingIds ?? []) {
      const u = uploads[id];
      if (u) items.push({ key: id, src: u.localUrl, upload: u, isCover: false });
    }
    return items;
  }, [entry, pendingIds, uploads]);
}

/** The cover image for the page's colour wash: saved, or the first one on its way. */
export function useCoverSrc(entry: Pick<JournalEntry, "id" | "cover" | "photos"> | null | undefined) {
  const items = useEntryPhotos(entry);
  const first = items.find((i) => i.isCover) ?? items.find((i) => i.upload?.asCover);
  return { src: first?.src ?? null };
}

export const usePhotoViewer = create<{ open: boolean; index: number; show: (i: number) => void; close: () => void }>((set) => ({
  open: false,
  index: 0,
  show: (index) => set({ open: true, index }),
  close: () => set({ open: false }),
}));

/** Toolbar Photo / ⌘⇧P: take or pick photos for this page's photo set (never into the writing). */
export function addEntryPhotos(uid: string, entry: JournalEntry) {
  return addPhotos(uid, entry, !!entry.cover);
}

async function addPhotos(uid: string, entry: JournalEntry, hasCover: boolean) {
  const files = await getPhotos({ multiple: true });
  if (files.length) attachPhotos(uid, entry.id, files, !hasCover);
}

function Thumb({ item, size, radius = 7, style }: { item: PhotoItem; size: number | string; radius?: number; style?: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.src} alt="" draggable={false} className="block object-cover shrink-0"
      style={{ width: size, height: size, borderRadius: radius, background: item.tint ?? "var(--bj-bg-soft)", ...style }} />
  );
}

function statusLine(items: PhotoItem[]): string | null {
  const up = items.filter((i) => i.upload?.status === "uploading").length;
  const failed = items.filter((i) => i.upload?.status === "error");
  if (failed.length) return uploadErrorText(failed[0].upload?.error);
  if (up) return `Saving ${items.length - up + 1} of ${items.length}…`;
  return null;
}

/* ── The small stack in the entry's top line ───────────────── */

/** The small "Photo" chip in the entry's top line — only while the page has none.
 *  Once it has photos they sit as a stack at the top-right (PhotoPile). */
export function PhotoStack({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const items = useEntryPhotos(entry);
  if (items.length) return null;
  return (
    <button type="button" onClick={() => void addPhotos(uid, entry, false)}
      className="bj-chip flex items-center gap-1.5 h-6 px-2.5 rounded-full font-sans text-[11.5px]"
      style={{ color: "var(--bj-ink3)", border: "1px dashed var(--bj-line)" }}
      title="Take a selfie or add photos (⌘⇧P)">
      <Camera size={12} /> Photo
    </button>
  );
}

/* ── The side panel's Photos section ───────────────────────── */

export function PhotosPanel({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const items = useEntryPhotos(entry);
  const show = usePhotoViewer((s) => s.show);
  const hasCover = items.some((i) => i.isCover);
  const status = statusLine(items);
  return (
    <section>
      <div className="flex items-center mb-2.5">
        <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] flex-1" style={{ color: "var(--bj-ink4)" }}>
          Photos{items.length ? ` · ${items.length}` : ""}
        </p>
        {items.length > 0 && <button type="button" onClick={() => show(0)} className="font-sans text-[11.5px] font-medium hover:underline" style={{ color: "var(--bj-ink3)" }}>See all</button>}
      </div>
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {items.slice(0, 6).map((it, i) => (
            <button key={it.key} type="button" onClick={() => show(i)} className="relative block aspect-square rounded-[10px] overflow-hidden bj-lift"
              aria-label={it.isCover ? "How I felt — open" : "Open photo"} style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)" }}>
              <Thumb item={it} size="100%" radius={10} style={{ filter: it.upload ? "saturate(.7) brightness(.75)" : undefined }} />
              {it.isCover && <span className="absolute left-1 top-1 w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,.5)" }}><Smile size={11} style={{ color: "var(--bj-gold)" }} /></span>}
              {it.upload?.status === "uploading" && <Ring progress={it.upload.progress} />}
              {it.upload?.status === "error" && <span className="absolute inset-0 flex items-center justify-center font-sans text-[10px] font-semibold" style={{ color: "#fff", background: "color-mix(in oklch, var(--bj-ember) 45%, transparent)" }}>Not saved</span>}
            </button>
          ))}
        </div>
      )}
      {status && <p className="font-sans text-[11.5px] mb-2" style={{ color: items.some((i) => i.upload?.status === "error") ? "var(--bj-ember)" : "var(--bj-ink4)" }}>{status}{items.some((i) => i.upload?.status === "uploading") ? " keep writing" : ""}</p>}
      <div className="flex gap-1.5">
        <button type="button" onClick={() => void addPhotos(uid, entry, hasCover)} className="bj-raised bj-lift h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12px] font-medium" style={{ color: "var(--bj-ink2)" }}>
          <Camera size={13} /> Take or add
        </button>
      </div>
    </section>
  );
}

function Ring({ progress }: { progress: number }) {
  const C = 2 * Math.PI * 14;
  return (
    <svg aria-hidden width="24" height="24" viewBox="0 0 36 36" className="absolute right-1.5 bottom-1.5">
      <circle cx="18" cy="18" r="14" fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.2)" strokeWidth="3" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bj-gold)" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - Math.max(0.06, progress))} transform="rotate(-90 18 18)"
        style={{ transition: "stroke-dashoffset 0.3s ease" }} />
    </svg>
  );
}

/* ── The full-size viewer ───────────────────────────────────── */

export function PhotoViewer({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const open = usePhotoViewer((s) => s.open);
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(<AnimatePresence>{open && <Viewer key="viewer" entry={entry} uid={uid} />}</AnimatePresence>, document.body);
}

function Viewer({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const items = useEntryPhotos(entry);
  const rawIndex = usePhotoViewer((s) => s.index);
  const show = usePhotoViewer((s) => s.show);
  const close = usePhotoViewer((s) => s.close);
  const index = Math.min(rawIndex, Math.max(0, items.length - 1));
  const item = items[index];
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  // Nothing left to show (the last one was removed): close.
  useEffect(() => { if (!items.length) close(); }, [items.length, close]);

  const go = (d: number) => { if (items.length > 1) { setZoom(null); setConfirm(null); show((index + d + items.length) % items.length); } };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useCamera.getState().open) return;
      if (e.key === "Escape") { e.preventDefault(); if (zoom) setZoom(null); else close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function remove(it: PhotoItem) {
    if (!it.photo) return;
    if (confirm !== it.key) { setConfirm(it.key); return; }
    setConfirm(null);
    const rest = items.filter((x) => x.photo && x.key !== it.key);
    await removeEntryPhoto(uid, entry.id, it.photo, it.isCover ? rest[0]?.photo ?? null : undefined);
    if (it.photo.path) void deleteObject(ref(getStorage(app), it.photo.path)).catch(() => {});
  }

  if (!item) return null;
  const date = entry.createdAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="fixed inset-0 z-[96] flex flex-col" role="dialog" aria-modal="true" aria-label="Photos">
      <motion.div className="absolute inset-0" onClick={close}
        style={{ background: "color-mix(in oklch, #05070b 88%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />

      <motion.div className="relative flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.2 }}>
        <div className="h-16 shrink-0 flex items-center gap-2.5 px-4 sm:px-6">
          <span className="bj-glass h-[30px] px-3 rounded-full flex items-center gap-1.5 font-sans text-[12px] shrink-0" style={{ color: "var(--bj-ink3)", fontVariantNumeric: "tabular-nums" }}>
            <b style={{ color: "var(--bj-ink)" }}>{index + 1}</b> of {items.length}
          </span>
          <span className="font-display text-[19px] truncate hidden sm:inline" style={{ color: "#EEEAE4" }}>{entry.title || "Untitled"}</span>
          <span className="font-sans text-[12px] shrink-0 hidden sm:inline" style={{ color: "rgba(238,234,228,.5)" }}>· {date}</span>
          <span className="ml-auto flex items-center gap-1.5">
            {item.photo && !item.isCover && (
              <button type="button" onClick={() => void updateEntry(uid, entry.id, { cover: item.photo })}
                className="bj-raised bj-lift h-[34px] px-3 rounded-[11px] flex items-center gap-1.5 font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink2)" }}>
                <Smile size={14} style={{ color: "var(--bj-gold)" }} /><span className="hidden md:inline">Make it how I felt</span>
              </button>
            )}
            {item.isCover && (
              <span className="h-[34px] px-3 rounded-[11px] hidden md:flex items-center gap-1.5 font-sans text-[12.5px]" style={{ color: "var(--bj-gold)" }}>
                <Smile size={14} /> How I felt
              </span>
            )}
            {item.photo && (
              <a href={item.photo.url} target="_blank" rel="noreferrer" download aria-label="Download"
                className="bj-raised bj-lift h-[34px] px-3 rounded-[11px] flex items-center gap-1.5 font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink2)" }}>
                <Download size={14} /><span className="hidden md:inline">Download</span>
              </a>
            )}
            {item.photo && (
              <button type="button" onClick={() => void remove(item)} onBlur={() => setConfirm(null)}
                className="bj-raised bj-lift h-[34px] px-3 rounded-[11px] flex items-center gap-1.5 font-sans text-[12.5px] font-medium whitespace-nowrap"
                style={{ color: "var(--bj-ember)" }}>
                <Trash2 size={14} /><span className={confirm === item.key ? "" : "hidden md:inline"}>{confirm === item.key ? "Remove it?" : "Remove"}</span>
              </button>
            )}
            <button type="button" onClick={close} aria-label="Close" className="bj-raised bj-lift w-[34px] h-[34px] rounded-[11px] flex items-center justify-center" style={{ color: "var(--bj-ink2)" }}>
              <X size={15} />
            </button>
          </span>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center gap-4 sm:gap-7 px-2 sm:px-6">
          {items.length > 1 && (
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="bj-glass bj-lift hidden sm:flex w-11 h-11 rounded-full items-center justify-center shrink-0" style={{ color: "var(--bj-ink2)" }}>
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="relative h-full flex-1 min-w-0 flex items-center justify-center overflow-hidden rounded-[18px]">
            <motion.div key={item.key} className="relative max-w-full max-h-full flex"
              drag={zoom ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5} dragMomentum={false}
              onDragEnd={(_, i) => { if (i.offset.x < -70 || i.velocity.x < -400) go(1); else if (i.offset.x > 70 || i.velocity.x > 400) go(-1); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.isCover ? "How I felt" : "Photo"} draggable={false}
                onClick={(e) => {
                  if (zoom) { setZoom(null); return; }
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onMouseMove={(e) => {
                  if (!zoom) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                className="block object-contain select-none"
                style={{
                  maxWidth: "100%", maxHeight: "calc(100dvh - 64px - 112px)", borderRadius: 14,
                  background: item.tint ?? "transparent",
                  boxShadow: "0 50px 100px -30px rgba(0,0,0,.9), inset 0 0 0 1px rgba(255,255,255,.08)",
                  cursor: zoom ? "zoom-out" : "zoom-in",
                  transform: zoom ? "scale(2.2)" : "scale(1)",
                  transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%",
                  transition: "transform 0.24s cubic-bezier(0.23, 1, 0.32, 1)",
                }} />
              {item.upload?.status === "uploading" && (
                <span className="bj-glass absolute left-3 bottom-3 h-7 px-3 rounded-full flex items-center font-sans text-[11.5px] font-medium" style={{ color: "#fff" }}>
                  Saving… {Math.round(item.upload.progress * 100)}%
                </span>
              )}
              {item.upload?.status === "error" && (
                <span className="bj-glass absolute left-3 bottom-3 rounded-2xl p-2 pl-3 flex items-center gap-2 font-sans text-[12px]" style={{ color: "#fff" }}>
                  {uploadErrorText(item.upload.error)}
                  <button type="button" onClick={() => retryUpload(uid, entry.id, item.key)} className="h-7 px-2.5 rounded-lg flex items-center gap-1 font-medium" style={{ background: "rgba(255,255,255,.14)" }}><RotateCcw size={12} />Try again</button>
                  <button type="button" onClick={() => discardUpload(entry.id, item.key)} className="h-7 px-2.5 rounded-lg font-medium" style={{ background: "rgba(255,255,255,.08)" }}>Discard</button>
                </span>
              )}
            </motion.div>
          </div>
          {items.length > 1 && (
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="bj-glass bj-lift hidden sm:flex w-11 h-11 rounded-full items-center justify-center shrink-0" style={{ color: "var(--bj-ink2)" }}>
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        <div className="h-28 shrink-0 flex items-center justify-center gap-4 px-4">
          <div className="bj-glass flex gap-2 p-2 rounded-2xl max-w-full overflow-x-auto">
            {items.map((it, i) => (
              <button key={it.key} type="button" onClick={() => { setZoom(null); show(i); }} aria-label={`Photo ${i + 1}`} aria-current={i === index ? "true" : undefined}
                className="shrink-0 rounded-[9px] overflow-hidden" style={{ boxShadow: i === index ? "0 0 0 2px #0b0d11, 0 0 0 4px var(--bj-gold)" : undefined, opacity: i === index ? 1 : 0.55, transition: "opacity .15s ease" }}>
                <Thumb item={it} size={64} radius={9} style={{ height: 48 }} />
              </button>
            ))}
            <button type="button" onClick={() => void addPhotos(uid, entry, items.some((i) => i.isCover))} aria-label="Add photos"
              className="shrink-0 w-16 h-12 rounded-[9px] flex items-center justify-center bj-btn-icon" style={{ color: "var(--bj-ink4)", border: "1px dashed var(--bj-line)" }}>
              <ImageUp size={15} />
            </button>
          </div>
          <span className="hidden lg:flex items-center gap-1.5 font-sans text-[11.5px] whitespace-nowrap" style={{ color: "rgba(238,234,228,.45)" }}>
            <kbd className="bj-kbd">←</kbd><kbd className="bj-kbd">→</kbd> move · <kbd className="bj-kbd">esc</kbd> close · click to zoom
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* ── The stack at the top-right of the page, and its gallery ── */

export const usePhotoGallery = create<{ open: boolean; set: (open: boolean) => void }>((set) => ({
  open: false,
  set: (open) => set({ open }),
}));

/** Front of the stack: anything still on its way, then how-I-felt, then newest first. */
function pileOrder(items: PhotoItem[]) {
  const up = items.filter((i) => i.upload).reverse();
  const saved = items.filter((i) => !i.upload);
  return [...up, ...saved.filter((i) => i.isCover), ...saved.filter((i) => !i.isCover).reverse()];
}

const SPRING = { type: "spring" as const, duration: 0.38, bounce: 0.12 };
const PILE = [
  { rest: { rotate: 0, x: 0, y: 0 }, fan: { rotate: -3, x: 0, y: -3 } },
  { rest: { rotate: -7, x: -9, y: 5 }, fan: { rotate: -12, x: -26, y: 3 } },
  { rest: { rotate: 6, x: 10, y: 4 }, fan: { rotate: 11, x: 26, y: 5 } },
];

export function PhotoPile({ entry }: { entry: JournalEntry }) {
  const items = useEntryPhotos(entry);
  const open = usePhotoGallery((s) => s.open);
  const setOpen = usePhotoGallery((s) => s.set);
  if (!items.length) return null;
  const pile = pileOrder(items).slice(0, 3);
  const uploading = items.find((i) => i.upload?.status === "uploading");
  const failed = items.some((i) => i.upload?.status === "error");
  const n = items.length;
  return (
    <motion.button type="button" onClick={() => setOpen(true)} initial="rest" animate="rest" whileHover="fan" whileTap={{ scale: 0.97 }}
      aria-label={`${n} photo${n === 1 ? "" : "s"} — open`} title="See your photos"
      className="relative block w-[76px] h-[76px] md:w-[104px] md:h-[104px] shrink-0 outline-none focus-visible:ring-2 rounded-[12px]"
      style={{ ["--tw-ring-color" as string]: "var(--bj-gold)" }}>
      {!open && pile.map((it, i) => (
        <motion.span key={it.key} layoutId={`bj-ph-${it.key}`} variants={n > 1 ? PILE[i] : undefined} transition={SPRING}
          className="absolute inset-0 rounded-[12px] overflow-hidden"
          style={{ zIndex: 3 - i, background: it.tint ?? "var(--bj-bg-soft)", boxShadow: "0 0 0 1px rgba(255,255,255,.14), 0 2px 4px rgba(0,0,0,.3), 0 14px 30px -10px rgba(0,0,0,.7)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.src} alt="" draggable={false} className="w-full h-full object-cover" style={{ opacity: it.upload?.status === "uploading" ? 0.7 : 1 }} />
        </motion.span>
      ))}
      {!open && uploading && <span className="absolute inset-0 z-10 pointer-events-none"><Ring progress={uploading.upload!.progress} /></span>}
      {!open && (n > 1 || failed) && (
        <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 z-10 h-6 px-2 rounded-full flex items-center gap-1 font-sans text-[11.5px] font-semibold whitespace-nowrap"
          style={{ background: "linear-gradient(180deg, var(--m-raised-top), var(--m-raised-bot))", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12), 0 6px 14px -6px rgba(0,0,0,.8)", color: failed ? "var(--bj-ember)" : "var(--bj-ink)", fontVariantNumeric: "tabular-nums" }}>
          <Camera size={11} style={{ color: failed ? "var(--bj-ember)" : "var(--bj-gold)" }} />{failed ? "Not saved" : n}
        </span>
      )}
    </motion.button>
  );
}

export function PhotoGallery({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const open = usePhotoGallery((s) => s.open);
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(<AnimatePresence>{open && <Gallery key="gallery" entry={entry} uid={uid} />}</AnimatePresence>, document.body);
}

function Gallery({ entry, uid }: { entry: JournalEntry; uid: string }) {
  const items = useEntryPhotos(entry);
  const close = usePhotoGallery((s) => s.set);
  const show = usePhotoViewer((s) => s.show);
  const inPile = new Set(pileOrder(items).slice(0, 3).map((i) => i.key));
  const hasCover = items.some((i) => i.isCover);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || usePhotoViewer.getState().open || useCamera.getState().open) return;
      e.preventDefault(); close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // The last photo was removed in the viewer: nothing left to show.
  useEffect(() => { if (!items.length) close(false); }, [items.length, close]);

  const date = entry.createdAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="fixed inset-0 z-[95] flex flex-col" role="dialog" aria-modal="true" aria-label="Photos on this page">
      <motion.div className="absolute inset-0" onClick={() => close(false)}
        style={{ background: "color-mix(in oklch, #05070b 84%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }} transition={{ duration: 0.22 }} />
      <motion.div className="relative h-16 sm:h-[76px] shrink-0 flex items-center gap-3 px-4 sm:px-9"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.2, delay: 0.06 }}>
        <span className="font-display text-[20px] sm:text-[24px] truncate" style={{ color: "#EEEAE4" }}>{entry.title || "Untitled"}</span>
        <span className="font-sans text-[12.5px] shrink-0 hidden sm:inline" style={{ color: "rgba(238,234,228,.5)", fontVariantNumeric: "tabular-nums" }}>
          {date} · {items.length} photo{items.length === 1 ? "" : "s"}
        </span>
        <span className="ml-auto flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => void addPhotos(uid, entry, hasCover)}
            className="bj-raised bj-lift h-9 px-3.5 rounded-xl flex items-center gap-2 font-sans text-[13px] font-medium" style={{ color: "var(--bj-ink2)" }}>
            <Camera size={14} style={{ color: "var(--bj-gold)" }} /> Take or add
          </button>
          <button type="button" onClick={() => close(false)} aria-label="Close"
            className="bj-raised bj-lift w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: "var(--bj-ink2)" }}>
            <X size={15} />
          </button>
        </span>
      </motion.div>
      <div className="relative flex-1 min-h-0 overflow-y-auto px-4 sm:px-9 pb-10" onClick={(e) => { if (e.target === e.currentTarget) close(false); }}>
        <div className="bj-gallery mx-auto max-w-[1240px] min-h-full content-center" onClick={(e) => { if (e.target === e.currentTarget) close(false); }}>
          {items.map((it, i) => {
            const ratio = it.photo?.w && it.photo?.h ? it.photo.w / it.photo.h : 4 / 3;
            const shared = inPile.has(it.key);
            return (
              <motion.button key={it.key} type="button" layoutId={shared ? `bj-ph-${it.key}` : undefined}
                onClick={() => show(i)} aria-label={it.isCover ? "How I felt — open" : `Photo ${i + 1} — open`}
                initial={shared ? { rotate: 0 } : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={shared ? undefined : { opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                transition={shared ? SPRING : { duration: 0.22, ease: [0.23, 1, 0.32, 1], delay: 0.04 + Math.min(i, 10) * 0.02 }}
                className="bj-gallery-tile relative overflow-hidden rounded-2xl"
                style={{ ["--r" as string]: ratio, background: it.tint ?? "var(--bj-bg-soft)", boxShadow: "0 0 0 1px rgba(255,255,255,.12), 0 20px 40px -18px rgba(0,0,0,.9)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt="" draggable={false} className="w-full h-full object-cover" style={{ opacity: it.upload?.status === "uploading" ? 0.7 : 1 }} />
                {it.isCover && (
                  <span className="absolute left-2.5 bottom-2.5 h-6 px-2.5 rounded-full flex items-center gap-1.5 font-sans text-[11px] font-medium"
                    style={{ color: "#fff", background: "rgba(0,0,0,.5)" }}>
                    <Smile size={12} style={{ color: "var(--bj-gold)" }} /> How I felt
                  </span>
                )}
                {it.upload?.status === "uploading" && <Ring progress={it.upload.progress} />}
                {it.upload?.status === "error" && <span className="absolute inset-0 flex items-center justify-center font-sans text-[12px] font-semibold" style={{ color: "#fff", background: "color-mix(in oklch, var(--bj-ember) 45%, transparent)" }}>Not saved</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
