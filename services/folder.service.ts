"use client";

import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { create } from "zustand";
import { db } from "@/lib/firebase";
import { openFields, sealFields, inOrder } from "@/lib/vault";

/** A journal folder. Its name is encrypted when the vault is on; `locked` seals its pages' writing. */
export interface JournalFolder { id: string; name: string; locked: boolean; createdAt: Date }

const col = (uid: string) => collection(db, "users", uid, "folders");

interface FolderState { uid: string | null; folders: JournalFolder[]; loaded: boolean }
export const useFolders = create<FolderState>(() => ({ uid: null, folders: [], loaded: false }));

let unsub: (() => void) | null = null;
export function ensureFolders(uid: string | null) {
  if (useFolders.getState().uid === uid && (unsub || !uid)) return;
  unsub?.(); unsub = null;
  useFolders.setState({ uid, folders: [], loaded: !uid });
  if (!uid) return;
  let seq = 0;
  unsub = onSnapshot(query(col(uid), orderBy("createdAt", "asc")), (snap) => {
    const mine = ++seq;
    void Promise.all(snap.docs.map(async (d) => {
      const raw = d.data({ serverTimestamps: "estimate" }) as { name: string; locked?: boolean; createdAt?: Timestamp };
      const o = await openFields(raw as unknown as Record<string, unknown>, ["name"]) as typeof raw;
      return { id: d.id, name: o.name || "Untitled folder", locked: !!o.locked, createdAt: o.createdAt?.toDate() ?? new Date() };
    })).then((folders) => { if (mine === seq) useFolders.setState({ folders, loaded: true }); });
  });
}

export const folderLocked = (id: string | null | undefined) => !!id && !!useFolders.getState().folders.find((f) => f.id === id)?.locked;

export function createFolder(uid: string, name: string): string {
  const r = doc(col(uid));
  void inOrder(r.path, async () => setDoc(r, { ...(await sealFields({ name: name.trim() || "Untitled folder" }, ["name"])), locked: false, createdAt: serverTimestamp() }))
    .catch((e) => console.error("createFolder", e));
  return r.id;
}

export async function renameFolder(uid: string, id: string, name: string) {
  const r = doc(col(uid), id);
  await inOrder(r.path, async () => updateDoc(r, await sealFields({ name: name.trim() || "Untitled folder" }, ["name"])));
}

/** Only flips the flag; the pages' writing is re-sealed by journal.service.setFolderLock. */
export async function setFolderLockedFlag(uid: string, id: string, locked: boolean) {
  const r = doc(col(uid), id);
  await inOrder(r.path, () => updateDoc(r, { locked }));
}

export async function removeFolder(uid: string, id: string) {
  const r = doc(col(uid), id);
  await inOrder(r.path, () => deleteDoc(r));
}
