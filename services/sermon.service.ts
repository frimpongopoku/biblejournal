import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Sermon, SermonRef, SermonMoment } from "@/types";

type RawSermon = Omit<Sermon, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp; updatedAt: Timestamp;
};

const col = (uid: string) => collection(db, "users", uid, "sermons");

function toDate(t: Timestamp | undefined): Date {
  return t?.toDate() ?? new Date();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function subscribeToSermons(
  uid: string,
  cb: (sermons: Sermon[]) => void
): () => void {
  const q = query(col(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const raw = d.data() as RawSermon;
      return { ...raw, id: d.id, createdAt: toDate(raw.createdAt), updatedAt: toDate(raw.updatedAt) };
    }));
  });
}

export function subscribeToSermon(
  uid: string, id: string,
  cb: (sermon: Sermon | null) => void
): () => void {
  return onSnapshot(doc(db, "users", uid, "sermons", id), (snap) => {
    if (!snap.exists()) { cb(null); return; }
    const raw = snap.data() as RawSermon;
    cb({ ...raw, id: snap.id, createdAt: toDate(raw.createdAt), updatedAt: toDate(raw.updatedAt) });
  });
}

export async function createSermon(
  uid: string,
  seed: { title?: string; speaker?: string; videoUrl?: string; videoId?: string } = {},
): Promise<string> {
  const ref = await addDoc(col(uid), {
    userId: uid, title: seed.title ?? "", speaker: seed.speaker ?? "", church: "",
    videoUrl: seed.videoUrl ?? "", videoId: seed.videoId ?? "", moments: [],
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
    references: [], sermonDate: today(),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSermon(
  uid: string, id: string,
  patch: Partial<Omit<Sermon, "id" | "userId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "sermons", id), {
    ...patch, updatedAt: serverTimestamp(),
  });
}

export async function deleteSermon(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "sermons", id));
}

export async function addSermonRef(
  uid: string, id: string,
  current: SermonRef[], ref: SermonRef
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "sermons", id), {
    references: [...current, ref], updatedAt: serverTimestamp(),
  });
}

export async function updateSermonRef(
  uid: string, id: string,
  refs: SermonRef[], refId: string, note: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "sermons", id), {
    references: refs.map((r) => r.id === refId ? { ...r, note } : r),
    updatedAt: serverTimestamp(),
  });
}

export async function removeSermonRef(
  uid: string, id: string,
  refs: SermonRef[], refId: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "sermons", id), {
    references: refs.filter((r) => r.id !== refId),
    updatedAt: serverTimestamp(),
  });
}

export async function setSermonMoments(uid: string, id: string, moments: SermonMoment[]): Promise<void> {
  await updateDoc(doc(db, "users", uid, "sermons", id), { moments, updatedAt: serverTimestamp() });
}

/** Playback position: saved quietly, without bumping updatedAt (so the list order stays put). */
export async function saveSermonPosition(uid: string, id: string, position: number, duration: number): Promise<void> {
  await updateDoc(doc(db, "users", uid, "sermons", id), { position: Math.floor(position), duration: Math.floor(duration) });
}
