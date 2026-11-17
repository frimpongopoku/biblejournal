"use client";

import { create } from "zustand";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { addEntryPhoto } from "@/services/journal.service";
import type { EntryPhoto } from "@/types";

/**
 * Photos: shrunk on the device (long edge 1600px, WebP/JPEG), shown at once
 * from a local preview, uploaded in the background with retries — and if
 * you're offline it waits for the connection instead of failing.
 */

const MAX_EDGE = 1600;

export interface Upload {
  id: string;
  localUrl: string;
  progress: number; // 0..1
  status: "uploading" | "done" | "error";
  result?: EntryPhoto;
  error?: string;
  /** Kept in memory so a failed upload can be tried again. */
  file?: File;
  asCover?: boolean;
}

interface UploadState {
  uploads: Record<string, Upload>;
  /** entryId → upload ids still on their way to that entry, in order. */
  pending: Record<string, string[]>;
  set: (u: Upload) => void;
  patch: (id: string, p: Partial<Upload>) => void;
  addPending: (entryId: string, uploadId: string) => void;
  dropPending: (entryId: string, uploadId: string) => void;
}

export const useUploads = create<UploadState>((set) => ({
  uploads: {},
  pending: {},
  set: (u) => set((s) => ({ uploads: { ...s.uploads, [u.id]: u } })),
  patch: (id, p) => set((s) => (s.uploads[id] ? { uploads: { ...s.uploads, [id]: { ...s.uploads[id], ...p } } } : s)),
  addPending: (entryId, uploadId) => set((s) => ({ pending: { ...s.pending, [entryId]: [...(s.pending[entryId] ?? []), uploadId] } })),
  dropPending: (entryId, uploadId) => set((s) => {
    const left = (s.pending[entryId] ?? []).filter((x) => x !== uploadId);
    const pending = { ...s.pending };
    if (left.length) pending[entryId] = left; else delete pending[entryId];
    return { pending };
  }),
}));

/** Plain words for an upload that failed. */
export function uploadErrorText(code?: string): string {
  if (!code) return "Couldn’t save";
  if (code.includes("unauthorized") || code.includes("unauthenticated")) return "Storage said no — check the Storage rules";
  if (code.includes("bucket-not-found") || code.includes("project-not-found") || code.includes("unknown")) return "Photo storage isn’t set up yet";
  if (code.includes("quota")) return "Storage is full";
  if (code.includes("retry-limit") || code.includes("canceled")) return "Couldn’t reach storage — try again";
  return "Couldn’t save";
}

export const isImageFile = (f: File) => f.type.startsWith("image/");

export function imageFiles(list: FileList | File[] | null | undefined): File[] {
  return Array.from(list ?? []).filter(isImageFile);
}

async function shrink(file: File): Promise<{ blob: Blob; w: number; h: number; tint: string }> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bmp) return { blob: file, w: 0, h: 0, tint: "" };
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  // Average colour from a tiny copy — tints the page while the image loads.
  const t = document.createElement("canvas");
  t.width = t.height = 1;
  const tc = t.getContext("2d")!;
  tc.drawImage(bmp, 0, 0, 1, 1);
  const [r, g, b] = tc.getImageData(0, 0, 1, 1).data;
  bmp.close();
  const toBlob = (type: string, q: number) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));
  // Safari can't encode WebP and silently returns PNG — fall back to JPEG.
  let blob = await toBlob("image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.84);
  return { blob: blob ?? file, w, h, tint: `rgb(${r}, ${g}, ${b})` };
}

function online(): Promise<void> {
  if (typeof navigator === "undefined" || navigator.onLine) return Promise.resolve();
  return new Promise((res) => window.addEventListener("online", () => res(), { once: true }));
}

async function send(uid: string, id: string, blob: Blob): Promise<{ url: string; path: string }> {
  const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
  const path = `users/${uid}/photos/${id}.${ext}`;
  const storage = getStorage(app);
  // Give up in seconds, not the SDK's default ten minutes — and say why.
  storage.maxUploadRetryTime = 20_000;
  storage.maxOperationRetryTime = 20_000;
  for (let attempt = 0; ; attempt++) {
    await online();
    try {
      const task = uploadBytesResumable(ref(storage, path), blob, { contentType: blob.type, cacheControl: "public, max-age=31536000, immutable" });
      task.on("state_changed", (s) => useUploads.getState().patch(id, { progress: s.totalBytes ? s.bytesTransferred / s.totalBytes : 0 }));
      await task;
      return { url: await getDownloadURL(ref(storage, path)), path };
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      // Permission problems won't fix themselves; network ones usually do.
      if (code.includes("unauthorized") || code.includes("unauthenticated") || code.includes("not-found") || code.includes("retry-limit") || code.includes("quota") || attempt >= 2) throw err;
      await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
    }
  }
}

/** Start uploading one photo. Returns at once with an id and a local preview. */
export function startUpload(uid: string, file: File): { id: string; localUrl: string; done: Promise<EntryPhoto> } {
  const id = crypto.randomUUID();
  const localUrl = URL.createObjectURL(file);
  const store = useUploads.getState();
  store.set({ id, localUrl, progress: 0, status: "uploading", file });
  const done = (async () => {
    try {
      const { blob, w, h, tint } = await shrink(file);
      const { url, path } = await send(uid, id, blob);
      const result: EntryPhoto = { url, path, w, h, ...(tint ? { tint } : {}) };
      useUploads.getState().patch(id, { status: "done", progress: 1, result });
      return result;
    } catch (err) {
      const msg = (err as { code?: string }).code ?? String(err);
      console.error("photo upload failed", err);
      useUploads.getState().patch(id, { status: "error", error: msg });
      throw err;
    }
  })();
  return { id, localUrl, done };
}

/**
 * Add photos to an entry. Each shows at once from a local preview and is
 * saved to the entry when its upload lands. The first one becomes the
 * cover ("how I felt") when `firstIsCover`.
 */
export function attachPhotos(uid: string, entryId: string, files: File[], firstIsCover: boolean) {
  const store = useUploads.getState();
  files.forEach((file, i) => {
    const up = startUpload(uid, file);
    store.patch(up.id, { asCover: firstIsCover && i === 0 });
    store.addPending(entryId, up.id);
    up.done
      .then((photo) => addEntryPhoto(uid, entryId, photo, firstIsCover && i === 0))
      .then(() => useUploads.getState().dropPending(entryId, up.id))
      .catch(() => { /* the failure shows on the photo, with a way to dismiss it */ });
  });
}

/** Forget a failed upload. */
export function discardUpload(entryId: string, uploadId: string) {
  const u = useUploads.getState().uploads[uploadId];
  if (u) URL.revokeObjectURL(u.localUrl);
  useUploads.getState().dropPending(entryId, uploadId);
}

/** Try a failed upload again. */
export function retryUpload(uid: string, entryId: string, uploadId: string) {
  const u = useUploads.getState().uploads[uploadId];
  if (!u?.file) return;
  useUploads.getState().dropPending(entryId, uploadId);
  attachPhotos(uid, entryId, [u.file], !!u.asCover);
}

/** One photo as the entry's cover (dashboard, drop-on-cover). */
export function attachCover(uid: string, entryId: string, file: File) {
  attachPhotos(uid, entryId, [file], true);
}

/** Open the system picker (camera on phones when `camera`). */
export function pickPhotos(opts: { multiple?: boolean; camera?: boolean } = {}): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (opts.multiple) input.multiple = true;
    if (opts.camera) input.setAttribute("capture", "environment");
    input.style.display = "none";
    input.onchange = () => { resolve(imageFiles(input.files)); input.remove(); };
    input.addEventListener("cancel", () => { resolve([]); input.remove(); });
    document.body.appendChild(input);
    input.click();
  });
}

// ── Camera window (desktop): take a selfie, or choose a file from there ──

interface CameraState {
  open: boolean;
  multiple: boolean;
  resolve: ((files: File[]) => void) | null;
  finish: (files: File[]) => void;
}

export const useCamera = create<CameraState>((set, get) => ({
  open: false,
  multiple: false,
  resolve: null,
  finish: (files) => { get().resolve?.(files); set({ open: false, resolve: null }); },
}));

/**
 * Get a photo the right way for this device: phones get the system sheet
 * (camera or library); computers get the camera window, with "Choose a file"
 * inside it. Resolves with [] if you close it.
 */
export function getPhotos(opts: { multiple?: boolean } = {}): Promise<File[]> {
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const hasCamera = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  if (coarse || !hasCamera) return pickPhotos({ multiple: opts.multiple, camera: coarse && !opts.multiple });
  return new Promise((resolve) => {
    useCamera.getState().resolve?.([]);
    useCamera.setState({ open: true, multiple: !!opts.multiple, resolve });
  });
}
