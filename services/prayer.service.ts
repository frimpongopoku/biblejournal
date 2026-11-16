import {
  setDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Prayer, PrayerLogEntry } from "@/types";

type RawPrayer = Omit<Prayer, "id" | "createdAt" | "updatedAt" | "answeredAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  answeredAt: Timestamp | null;
};

const col = (uid: string) => collection(db, "users", uid, "prayers");

export function subscribeToPrayers(
  uid: string,
  cb: (prayers: Prayer[]) => void
): () => void {
  const q = query(col(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const raw = d.data() as RawPrayer;
        return {
          ...raw,
          id: d.id,
          createdAt: raw.createdAt?.toDate() ?? new Date(),
          updatedAt: raw.updatedAt?.toDate() ?? new Date(),
          answeredAt: raw.answeredAt?.toDate() ?? null,
        };
      })
    );
  });
}

export function createPrayer(
  uid: string,
  title: string,
  body: string,
  extra: { for?: string } = {},
): string {
  // The id is made locally and the write goes out in the background, so the
  // page can open on it at once (Firestore serves the pending write locally).
  const ref = doc(col(uid));
  void setDoc(ref, {
    userId: uid,
    title,
    body,
    for: extra.for?.trim() ?? "",
    log: [],
    status: "active",
    scriptures: [],
    testimony: null,
    answeredAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch((e) => console.error("createPrayer", e));
  return ref.id;
}

export async function updatePrayer(
  uid: string,
  id: string,
  patch: Partial<Omit<Prayer, "id" | "userId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "prayers", id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function markAnswered(
  uid: string,
  id: string,
  testimony: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "prayers", id), {
    status: "answered",
    testimony: testimony.trim() || null,
    answeredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePrayer(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "prayers", id));
}

/** Record that you prayed it now, with what you said (may be empty). */
export async function logPrayer(uid: string, id: string, text: string): Promise<PrayerLogEntry> {
  const entry: PrayerLogEntry = { at: Date.now(), text: text.trim() };
  await updateDoc(doc(db, "users", uid, "prayers", id), { log: arrayUnion(entry), updatedAt: serverTimestamp() });
  return entry;
}

export async function removePrayerLog(uid: string, id: string, entry: PrayerLogEntry): Promise<void> {
  await updateDoc(doc(db, "users", uid, "prayers", id), { log: arrayRemove(entry), updatedAt: serverTimestamp() });
}

export async function reopenPrayer(uid: string, id: string): Promise<void> {
  await updateDoc(doc(db, "users", uid, "prayers", id), { status: "active", answeredAt: null, updatedAt: serverTimestamp() });
}
