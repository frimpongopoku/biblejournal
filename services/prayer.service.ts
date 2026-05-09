import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Prayer } from "@/types";

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

export async function createPrayer(
  uid: string,
  title: string,
  body: string
): Promise<string> {
  const ref = await addDoc(col(uid), {
    userId: uid,
    title,
    body,
    status: "active",
    scriptures: [],
    testimony: null,
    answeredAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
