import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { openFields, sealFields, inOrder } from "@/lib/vault";
import { isLockSealed, lockOpen, lockSeal, useLocks, LockedError } from "@/lib/locks";
import { folderLocked, useFolders } from "@/services/folder.service";
import type { EntryPhoto, JournalEntry } from "@/types";

type RawEntry = Omit<JournalEntry, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const col = (uid: string) => collection(db, "users", uid, "entries");

/** What's encrypted when the vault is on. Dates, folder, photos and flags stay readable. */
export const SEALED_ENTRY = ["title", "content", "tags", "scriptures", "feeling"] as const;

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

/** What we last saw stored for each entry — so a save never writes a locked page's writing in the open. */
const stored = new Map<string, { locked: boolean; folderId: string | null; lockSealed: boolean }>();
const mustLock = (id: string) => {
  const s = stored.get(id);
  return !!s && (s.locked || s.lockSealed || folderLocked(s.folderId));
};

export async function openEntry(id: string, raw: RawEntry): Promise<JournalEntry> {
  const o = await openFields(raw as unknown as Record<string, unknown>, SEALED_ENTRY) as unknown as RawEntry;
  let content = o.content;
  let shut = false;
  const lockSealed = isLockSealed(content);
  if (lockSealed) {
    const plain = await lockOpen(content);
    shut = plain === null;
    content = plain ?? EMPTY_DOC;
  }
  stored.set(id, { locked: !!o.locked, folderId: o.folderId ?? null, lockSealed });
  return {
    ...o,
    id,
    content,
    shut,
    lockSealed,
    locked: !!o.locked,
    title: o.title ?? "",
    tags: Array.isArray(o.tags) ? o.tags : [],
    scriptures: Array.isArray(o.scriptures) ? o.scriptures : [],
    feeling: o.feeling ?? undefined,
    createdAt: o.createdAt?.toDate() ?? new Date(),
    updatedAt: o.updatedAt?.toDate() ?? new Date(),
  };
}

export function subscribeToEntries(
  uid: string,
  cb: (entries: JournalEntry[]) => void
): () => void {
  const q = query(col(uid), orderBy("updatedAt", "desc"));
  let seq = 0;
  let last: import("firebase/firestore").QuerySnapshot | null = null;
  const run = () => {
    if (!last) return;
    // Opening is async (and waits while the journal is locked); only the newest pass lands.
    const mine = ++seq;
    void Promise.all(last.docs.map((d) => openEntry(d.id, d.data({ serverTimestamps: "estimate" }) as RawEntry)))
      .then((entries) => { if (mine === seq) cb(entries); });
  };
  const off = onSnapshot(q, (snap) => { last = snap; run(); });
  // Entering or dropping the lock code re-opens (or shuts) locked writing.
  const offLocks = useLocks.subscribe((s, p) => { if (s.epoch !== p.epoch) run(); });
  return () => { off(); offLocks(); };
}

/** Id for an entry before it exists — lets a photo upload start first. */
export function newEntryId(uid: string): string {
  return doc(col(uid)).id;
}

export async function createEntry(
  uid: string,
  seed?: Partial<Pick<JournalEntry, "title" | "content" | "tags" | "scriptures" | "feeling" | "cover" | "createdAt" | "folderId">>
): Promise<string> {
  // Id is generated locally and the write lands in the offline cache at once,
  // so the new entry appears (and can be typed into) without a server round trip.
  const ref = doc(col(uid));
  const folderId = seed?.folderId ?? null;
  // A new page in a locked folder is locked from its first word (needs the lock code entered).
  const sealIt = folderLocked(folderId);
  if (sealIt && !useLocks.getState().key) throw new LockedError();
  stored.set(ref.id, { locked: false, folderId, lockSealed: sealIt });
  void inOrder(ref.path, async () => setDoc(ref, await sealFields({
    userId: uid,
    title: seed?.title ?? "",
    content: sealIt ? await lockSeal(seed?.content ?? EMPTY_DOC) : seed?.content ?? EMPTY_DOC,
    tags: seed?.tags ?? [],
    folderId,
    locked: false,
    isPinned: false,
    isFavorite: false,
    scriptures: seed?.scriptures ?? [],
    ...(seed?.feeling ? { feeling: seed.feeling } : {}),
    ...(seed?.cover ? { cover: seed.cover } : {}),
    // Written for an earlier day (from the calendar): it belongs on that day.
    createdAt: seed?.createdAt ? Timestamp.fromDate(seed.createdAt) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, SEALED_ENTRY))).catch((err) => console.error("createEntry failed", err));
  return ref.id;
}

export async function updateEntry(
  uid: string,
  entryId: string,
  patch: Partial<Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<void> {
  const ref = doc(db, "users", uid, "entries", entryId);
  // Lock state and folder only change through setEntryLocked / moveEntry / setFolderLock.
  const { locked: _l, folderId: _f, shut: _s, lockSealed: _ls, ...rest } = patch;
  void _l; void _f; void _s; void _ls;
  await inOrder(ref.path, async () => {
    const out: Record<string, unknown> = { ...rest };
    if (typeof out.content === "string" && mustLock(entryId)) out.content = await lockSeal(out.content as string);
    await updateDoc(ref, { ...(await sealFields(out, SEALED_ENTRY)), updatedAt: serverTimestamp() });
  });
}

/** Re-store an entry's writing for a new lock state, without moving it in the list. */
async function rewrite(uid: string, given: JournalEntry, next: { locked: boolean; folderId: string | null }) {
  const ref = doc(db, "users", uid, "entries", given.id);
  // Behind any save still on its way, read the latest stored writing (the list may not have
  // re-opened it yet after the code was entered), then store it for the new lock state.
  await inOrder(ref.path, async () => {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const e = await openEntry(snap.id, snap.data() as RawEntry);
    if (e.shut) throw new LockedError();
    const sealIt = next.locked || folderLocked(next.folderId);
    stored.set(e.id, { ...next, lockSealed: sealIt });
    await updateDoc(ref, {
      ...(await sealFields({ content: sealIt ? await lockSeal(e.content) : e.content }, SEALED_ENTRY)),
      locked: next.locked,
      folderId: next.folderId,
    });
  });
}

/** Lock or unlock one page. Needs the lock code entered. */
export async function setEntryLocked(uid: string, e: JournalEntry, locked: boolean) {
  await rewrite(uid, e, { locked, folderId: e.folderId ?? null });
}

/** Move a page to a folder (null = no folder). Locked writing follows the folder's lock. */
export async function moveEntry(uid: string, e: JournalEntry, folderId: string | null) {
  await rewrite(uid, e, { locked: !!e.locked, folderId });
}

/** After a folder's lock flag changes: re-seal (or open) every page in it. */
export async function resealFolder(uid: string, folderId: string, entries: JournalEntry[], locked: boolean) {
  const mine = entries.filter((e) => e.folderId === folderId);
  const prev = useFolders.getState().folders;
  // Treat the folder as already in its new state while re-sealing.
  useFolders.setState({ folders: prev.map((f) => (f.id === folderId ? { ...f, locked } : f)) });
  await Promise.all(mine.map((e) => rewrite(uid, e, { locked: !!e.locked, folderId })));
}

export async function deleteEntry(uid: string, entryId: string): Promise<void> {
  const ref = doc(db, "users", uid, "entries", entryId);
  await inOrder(ref.path, () => deleteDoc(ref));
}

// ── Photos ──────────────────────────────────────────────────

/** Add a saved photo to an entry; `asCover` also makes it "how I felt". */
export async function addEntryPhoto(uid: string, entryId: string, photo: EntryPhoto, asCover: boolean): Promise<void> {
  const ref = doc(db, "users", uid, "entries", entryId);
  await inOrder(ref.path, () => updateDoc(ref, {
    photos: arrayUnion(photo),
    ...(asCover ? { cover: photo } : {}),
    updatedAt: serverTimestamp(),
  }));
}

/** Take a photo off an entry. `nextCover` replaces the cover when it was this one. */
export async function removeEntryPhoto(uid: string, entryId: string, photo: EntryPhoto, nextCover?: EntryPhoto | null): Promise<void> {
  const ref = doc(db, "users", uid, "entries", entryId);
  await inOrder(ref.path, () => updateDoc(ref, {
    photos: arrayRemove(photo),
    ...(nextCover !== undefined ? { cover: nextCover } : {}),
    updatedAt: serverTimestamp(),
  }));
}
