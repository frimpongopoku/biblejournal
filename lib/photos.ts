"use client";

import { create } from "zustand";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { updateEntry } from "@/services/journal.service";
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
}

interface UploadState {
  uploads: Record<string, Upload>;
  /** entryId → upload id of a cover still uploading. */
  covers: Record<string, string>;
  set: (u: Upload) => void;
  patch: (id: string, p: Partial<Upload>) => void;
  setCover: (entryId: string, uploadId: string | null) => void;
}

export const useUploads = create<UploadState>((set) => ({
  uploads: {},
  covers: {},
  set: (u) => set((s) => ({ uploads: { ...s.uploads, [u.id]: u } })),
  patch: (id, p) => set((s) => (s.uploads[id] ? { uploads: { ...s.uploads, [id]: { ...s.uploads[id], ...p } } } : s)),
  setCover: (entryId, uploadId) =>
    set((s) => {
      const covers = { ...s.covers };
      if (uploadId) covers[entryId] = uploadId; else delete covers[entryId];
      return { covers };
    }),
}));

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
      if (code.includes("unauthorized") || code.includes("unauthenticated") || attempt >= 4) throw err;
      await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
    }
  }
}

/** Start uploading one photo. Returns at once with an id and a local preview. */
export function startUpload(uid: string, file: File): { id: string; localUrl: string; done: Promise<EntryPhoto> } {
  const id = crypto.randomUUID();
  const localUrl = URL.createObjectURL(file);
  const store = useUploads.getState();
  store.set({ id, localUrl, progress: 0, status: "uploading" });
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

/** Make a photo the entry's cover ("how I felt"). Saved to the entry when the upload lands. */
export function attachCover(uid: string, entryId: string, file: File) {
  const up = startUpload(uid, file);
  useUploads.getState().setCover(entryId, up.id);
  up.done
    .then((cover) => updateEntry(uid, entryId, { cover }))
    .then(() => useUploads.getState().setCover(entryId, null))
    .catch(() => { /* status shows on the cover */ });
  return up;
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
