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
import type { JournalEntry } from "@/types";

type RawEntry = Omit<JournalEntry, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const col = (uid: string) => collection(db, "users", uid, "entries");

export function subscribeToEntries(
  uid: string,
  cb: (entries: JournalEntry[]) => void
): () => void {
  const q = query(col(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const raw = d.data() as RawEntry;
        return {
          ...raw,
          id: d.id,
          createdAt: raw.createdAt?.toDate() ?? new Date(),
          updatedAt: raw.updatedAt?.toDate() ?? new Date(),
        };
      })
    );
  });
}

export async function createEntry(uid: string): Promise<string> {
  const ref = await addDoc(col(uid), {
    userId: uid,
    title: "",
    content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
    tags: [],
    folderId: null,
    isPinned: false,
    isFavorite: false,
    scriptures: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEntry(
  uid: string,
  entryId: string,
  patch: Partial<Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "entries", entryId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEntry(uid: string, entryId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "entries", entryId));
}
