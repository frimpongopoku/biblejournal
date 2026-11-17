"use client";

import { create } from "zustand";
import { doc, onSnapshot, setDoc, deleteDoc, getDocs, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cryptoParts as C } from "@/lib/vault";

/* ──────────────────────────────────────────────────────────────
   Locked pages and folders. One lock code for everything you lock
   (like locked notes): it unwraps a separate key that seals the
   *writing* of locked pages ("bjL1:…"). Titles and dates stay visible.
   That key lives in memory only and is dropped after you've been away
   a while, on "Lock now", and when the tab closes. Forgetting the lock
   code means locked writing can't be opened — by anyone.
   ────────────────────────────────────────────────────────────── */

const PREFIX = "bjL1:";
const ITERS = 600_000;

export interface LockDoc { salt: string; iters: number; wrapped: string; check: string }

interface LockState {
  uid: string | null;
  doc: LockDoc | null;
  /** Have we heard from the server about the lock doc yet? */
  known: boolean;
  key: CryptoKey | null;
  /** Bumped whenever the key arrives or leaves, so views re-open locked writing. */
  epoch: number;
  awayMinutes: number;
}

const readAway = () => { try { return Number(localStorage.getItem("bj-lock-away")) || 5; } catch { return 5; } };
export const useLocks = create<LockState>(() => ({ uid: null, doc: null, known: false, key: null, epoch: 0, awayMinutes: 5 }));

export class LockedError extends Error {
  constructor() { super("This page is locked"); }
}

export const isLockSealed = (v: unknown): v is string => typeof v === "string" && v.startsWith(PREFIX);

let unsub: (() => void) | null = null;
export function watchLocks(uid: string | null) {
  if (useLocks.getState().uid === uid && (unsub || !uid)) return;
  unsub?.(); unsub = null;
  useLocks.setState({ uid, doc: null, known: !uid, key: null, epoch: useLocks.getState().epoch + 1, awayMinutes: readAway() });
  if (!uid) return;
  unsub = onSnapshot(doc(db, "users", uid, "vault", "lock"), (snap) => {
    if (useLocks.getState().uid !== uid) return;
    useLocks.setState({ doc: snap.exists() ? (snap.data() as LockDoc) : null, known: true });
  }, () => useLocks.setState({ known: true }));
}

async function keyFits(key: CryptoKey, d: LockDoc) {
  try { return (await C.decryptWith(key, d.check)) === "locked"; } catch { return false; }
}

/** First lock: choose the lock code. */
export async function createLockCode(code: string): Promise<void> {
  const { uid } = useLocks.getState();
  if (!uid) throw new Error("Not signed in");
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const salt = C.rand(16);
  const wrapped = await C.wrap(key, await C.kekFrom(code, salt, ITERS));
  const raw = await crypto.subtle.exportKey("raw", key);
  const live = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  const d: LockDoc = { salt: C.b64(salt), iters: ITERS, wrapped, check: await C.encryptWith(live, "locked") };
  await setDoc(doc(db, "users", uid, "vault", "lock"), { ...d, createdAt: serverTimestamp() });
  useLocks.setState((s) => ({ doc: d, key: live, epoch: s.epoch + 1 }));
}

export async function unlockWith(code: string): Promise<boolean> {
  const d = useLocks.getState().doc;
  if (!d) return false;
  try {
    const key = await C.unwrap(d.wrapped, await C.kekFrom(code, C.unb64(d.salt), d.iters));
    if (!(await keyFits(key, d))) return false;
    useLocks.setState((s) => ({ key, epoch: s.epoch + 1 }));
    return true;
  } catch { return false; }
}

export function lockNow() {
  if (!useLocks.getState().key) return;
  useLocks.setState((s) => ({ key: null, epoch: s.epoch + 1 }));
}

export async function changeLockCode(oldCode: string, next: string): Promise<boolean> {
  const { uid, doc: d } = useLocks.getState();
  if (!uid || !d) return false;
  let key: CryptoKey;
  try {
    key = await C.unwrap(d.wrapped, await C.kekFrom(oldCode, C.unb64(d.salt), d.iters), true);
    if (!(await keyFits(key, d))) return false;
  } catch { return false; }
  const salt = C.rand(16);
  const out: LockDoc = { ...d, salt: C.b64(salt), iters: ITERS, wrapped: await C.wrap(key, await C.kekFrom(next, salt, ITERS)) };
  await setDoc(doc(db, "users", uid, "vault", "lock"), { ...out, createdAt: serverTimestamp() });
  useLocks.setState({ doc: out });
  return true;
}

export function setAwayMinutes(n: number) {
  try { localStorage.setItem("bj-lock-away", String(n)); } catch { /* ignore */ }
  useLocks.setState({ awayMinutes: n });
}

/** Seal writing with the lock key. */
export async function lockSeal(plain: string): Promise<string> {
  const key = useLocks.getState().key;
  if (!key) throw new LockedError();
  return PREFIX + (await C.encryptWith(key, plain));
}

const cache = new Map<string, string>();
/** Open lock-sealed writing; null while locked (or if it can't be opened). */
export async function lockOpen(sealed: string): Promise<string | null> {
  if (cache.has(sealed)) return useLocks.getState().key ? cache.get(sealed)! : null;
  const key = useLocks.getState().key;
  if (!key) return null;
  try {
    const plain = await C.decryptWith(key, sealed.slice(PREFIX.length));
    if (cache.size > 2000) cache.delete(cache.keys().next().value as string);
    cache.set(sealed, plain);
    return plain;
  } catch { return null; }
}

// Lock again after being away (tab hidden) for a while.
if (typeof document !== "undefined") {
  let timer: ReturnType<typeof setTimeout> | null = null;
  document.addEventListener("visibilitychange", () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (document.visibilityState === "hidden" && useLocks.getState().key) {
      timer = setTimeout(() => { lockNow(); cache.clear(); }, useLocks.getState().awayMinutes * 60_000);
    }
  });
  useLocks.subscribe((s, p) => { if (p.key && !s.key) cache.clear(); });
}

// DEV ONLY: lets the e2e harness remove a lock code it set while testing.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as Record<string, unknown>).__bjLocks = {
    useLocks,
    /** The stored (encrypted) writing of the test entry with this title — never decrypted here. */
    async storedContent(title: string) {
      const { uid } = useLocks.getState();
      if (!uid) return null;
      const all = await getDocs(collection(db, "users", uid, "entries"));
      const { openField } = await import("@/lib/vault");
      for (const d of all.docs) if ((await openField(d.data().title)) === title) return String(d.data().content).slice(0, 12);
      return null;
    },
    async resetForTest() {
      const { uid } = useLocks.getState();
      if (!uid) return;
      await deleteDoc(doc(db, "users", uid, "vault", "lock"));
      useLocks.setState((s) => ({ doc: null, key: null, epoch: s.epoch + 1 }));
    },
  };
}
