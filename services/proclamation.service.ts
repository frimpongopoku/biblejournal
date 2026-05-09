import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
  Timestamp, increment, setDoc, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ProclamationFolder, ProclamationEntry } from "@/types";

type RawFolder = Omit<ProclamationFolder, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp; updatedAt: Timestamp;
};
type RawEntry = Omit<ProclamationEntry, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp; updatedAt: Timestamp;
};

const foldersCol = (uid: string) =>
  collection(db, "users", uid, "proclamationFolders");

const entriesCol = (uid: string, folderId: string) =>
  collection(db, "users", uid, "proclamationFolders", folderId, "entries");

// ── Folders ───────────────────────────────────────────────

export function subscribeToProclamationFolders(
  uid: string,
  cb: (folders: ProclamationFolder[]) => void
): () => void {
  const q = query(foldersCol(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const raw = d.data() as RawFolder;
      return {
        ...raw,
        id: d.id,
        createdAt: raw.createdAt?.toDate() ?? new Date(),
        updatedAt: raw.updatedAt?.toDate() ?? new Date(),
      };
    }));
  });
}

export async function createProclamationFolder(
  uid: string, name: string, description: string
): Promise<string> {
  const ref = await addDoc(foldersCol(uid), {
    userId: uid, name,
    description: description.trim() || null,
    isPublic: false, shareToken: null, entryCount: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProclamationFolder(
  uid: string, folderId: string,
  patch: Partial<Pick<ProclamationFolder, "name" | "description">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "proclamationFolders", folderId), {
    ...patch, updatedAt: serverTimestamp(),
  });
}

export async function toggleFolderPublic(
  uid: string,
  folderId: string,
  makePublic: boolean,
  existingToken: string | null
): Promise<string | null> {
  if (makePublic) {
    const token = existingToken ?? crypto.randomUUID();
    await setDoc(doc(db, "shareLookup", token), { uid, folderId });
    await updateDoc(doc(db, "users", uid, "proclamationFolders", folderId), {
      isPublic: true, shareToken: token, updatedAt: serverTimestamp(),
    });
    return token;
  } else {
    await updateDoc(doc(db, "users", uid, "proclamationFolders", folderId), {
      isPublic: false, updatedAt: serverTimestamp(),
    });
    return existingToken;
  }
}

export async function deleteProclamationFolder(
  uid: string, folderId: string
): Promise<void> {
  const snap = await getDocs(entriesCol(uid, folderId));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, "users", uid, "proclamationFolders", folderId));
}

// ── Entries ───────────────────────────────────────────────

export function subscribeToProclamationEntries(
  uid: string, folderId: string,
  cb: (entries: ProclamationEntry[]) => void
): () => void {
  const q = query(entriesCol(uid, folderId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => {
      const raw = d.data() as RawEntry;
      return {
        ...raw,
        id: d.id,
        createdAt: raw.createdAt?.toDate() ?? new Date(),
        updatedAt: raw.updatedAt?.toDate() ?? new Date(),
      };
    }));
  });
}

export async function createProclamationEntry(
  uid: string, folderId: string, title: string, body: string
): Promise<string> {
  const ref = await addDoc(entriesCol(uid, folderId), {
    userId: uid, folderId, title, body: body.trim(),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", uid, "proclamationFolders", folderId), {
    entryCount: increment(1), updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProclamationEntry(
  uid: string, folderId: string, entryId: string,
  patch: Partial<Pick<ProclamationEntry, "title" | "body">>
): Promise<void> {
  await updateDoc(
    doc(db, "users", uid, "proclamationFolders", folderId, "entries", entryId),
    { ...patch, updatedAt: serverTimestamp() }
  );
}

export async function deleteProclamationEntry(
  uid: string, folderId: string, entryId: string
): Promise<void> {
  await deleteDoc(
    doc(db, "users", uid, "proclamationFolders", folderId, "entries", entryId)
  );
  await updateDoc(doc(db, "users", uid, "proclamationFolders", folderId), {
    entryCount: increment(-1), updatedAt: serverTimestamp(),
  });
}
