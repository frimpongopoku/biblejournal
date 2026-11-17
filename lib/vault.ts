"use client";

import { create } from "zustand";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ──────────────────────────────────────────────────────────────
   The vault: end-to-end encryption for what you write.

   • A random 256-bit content key (AES-GCM) encrypts each private field.
   • Your passphrase (PBKDF2-SHA256) wraps that key; so does a recovery
     code. Only the wrapped copies are stored, at users/{uid}/vault/key.
   • This device can keep the unwrapped key in IndexedDB as a
     non-extractable CryptoKey, so you don't type the passphrase daily.
   • Fields are sealed one by one ("bj1:" text, "bj1j:" JSON), so small
     autosave patches stay small, and old plaintext still reads until the
     one-time conversion has run.
   Nothing here ever leaves the browser unencrypted except through the
   AI features you invoke, which send the text they need for that request.
   ────────────────────────────────────────────────────────────── */

const TXT = "bj1:";
const JSN = "bj1j:";
const PASS_ITERS = 600_000;
const CODE_ITERS = 210_000;
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 32 symbols, no 0/O/1/I

export interface VaultDoc {
  v: 1;
  pass: { salt: string; iters: number; wrapped: string };
  code: { salt: string; iters: number; wrapped: string };
  /** A sealed known string, to tell a wrong passphrase from damaged data. */
  check: string;
}

export type VaultStatus = "unknown" | "off" | "locked" | "open";

export class VaultLockedError extends Error {
  constructor() { super("Your journal is locked on this device"); }
}

// ── bytes ───────────────────────────────────────────────────
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (u: Uint8Array) => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const rand = (n: number) => crypto.getRandomValues(new Uint8Array(n));

async function kekFrom(secret: string, salt: Uint8Array, iters: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", enc.encode(secret.normalize("NFKC")), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: iters }, base, { name: "AES-GCM", length: 256 }, false, ["wrapKey", "unwrapKey"]);
}
async function wrap(dek: CryptoKey, kek: CryptoKey): Promise<string> {
  const iv = rand(12);
  const ct = new Uint8Array(await crypto.subtle.wrapKey("raw", dek, kek, { name: "AES-GCM", iv }));
  const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
  return b64(out);
}
async function unwrap(wrapped: string, kek: CryptoKey, extractable = false): Promise<CryptoKey> {
  const u = unb64(wrapped);
  return crypto.subtle.unwrapKey("raw", u.subarray(12), kek, { name: "AES-GCM", iv: u.subarray(0, 12) }, { name: "AES-GCM", length: 256 }, extractable, ["encrypt", "decrypt"]);
}
async function encryptWith(key: CryptoKey, plain: string): Promise<string> {
  const iv = rand(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain)));
  const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
  return b64(out);
}
async function decryptWith(key: CryptoKey, sealed: string): Promise<string> {
  const u = unb64(sealed);
  return dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: u.subarray(0, 12) }, key, u.subarray(12)));
}

/** A recovery code: 8 groups of 4 (160 bits). */
export function makeRecoveryCode(): string {
  const r = rand(32);
  const chars = Array.from(r, (b) => ALPHABET[b & 31]).join("");
  return chars.match(/.{4}/g)!.join("-");
}
const normCode = (s: string) => s.toUpperCase().replace(/[^0-9A-Z]/g, "");

// ── this device's copy of the key ───────────────────────────
const IDB = "bibjournal-vault";
function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return new Promise((resolve) => {
    try {
      const open = indexedDB.open(IDB, 1);
      open.onupgradeneeded = () => open.result.createObjectStore("keys");
      open.onerror = () => resolve(undefined);
      open.onsuccess = () => {
        const tx = open.result.transaction("keys", mode);
        const req = run(tx.objectStore("keys"));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
        tx.oncomplete = () => open.result.close();
      };
    } catch { resolve(undefined); }
  });
}
const rememberKey = (uid: string, key: CryptoKey) => idb("readwrite", (s) => s.put(key, uid));
const recallKey = (uid: string) => idb<CryptoKey>("readonly", (s) => s.get(uid));
const forgetKey = (uid: string) => idb("readwrite", (s) => s.delete(uid));

// ── state ───────────────────────────────────────────────────
interface VaultState {
  uid: string | null;
  status: VaultStatus;
  doc: VaultDoc | null;
  key: CryptoKey | null;
  remembered: boolean;
}
export const useVault = create<VaultState>(() => ({ uid: null, status: "unknown", doc: null, key: null, remembered: false }));

let unsub: (() => void) | null = null;

// Once this device has seen the vault, an offline start with nothing cached must not fall back to "off"
// (that would write plaintext).
const FLAG = (uid: string) => `bj-vault-on:${uid}`;
const flagged = (uid: string) => { try { return localStorage.getItem(FLAG(uid)) === "1"; } catch { return false; } };
const flag = (uid: string, on: boolean) => { try { if (on) localStorage.setItem(FLAG(uid), "1"); else localStorage.removeItem(FLAG(uid)); } catch {} };
const waiters = new Set<() => void>();
function wake() { for (const w of [...waiters]) w(); }
useVault.subscribe(wake);

/** Follow the signed-in user's vault. Called once from the app shell. */
export function watchVault(uid: string | null) {
  if (useVault.getState().uid === uid && (unsub || !uid)) return;
  unsub?.(); unsub = null;
  useVault.setState({ uid, status: uid ? "unknown" : "off", doc: null, key: null, remembered: false });
  if (!uid) return;
  unsub = onSnapshot(doc(db, "users", uid, "vault", "key"), async (snap) => {
    if (useVault.getState().uid !== uid) return;
    if (!snap.exists()) {
      if (snap.metadata.fromCache && flagged(uid)) { useVault.setState({ status: "locked" }); return; }
      if (!snap.metadata.fromCache) flag(uid, false);
      useVault.setState({ status: "off", doc: null, key: null });
      return;
    }
    const vdoc = snap.data() as VaultDoc;
    flag(uid, true);
    const have = useVault.getState().key;
    if (have) { useVault.setState({ doc: vdoc, status: "open" }); return; }
    const saved = await recallKey(uid);
    if (useVault.getState().uid !== uid) return;
    if (saved && (await keyFits(saved, vdoc))) useVault.setState({ doc: vdoc, key: saved, status: "open", remembered: true });
    else useVault.setState({ doc: vdoc, status: "locked" });
  }, () => {
    // Can't read the vault doc (offline on first load): treat as off only if nothing is sealed — the
    // field reader still waits for a key when it meets sealed text.
    if (useVault.getState().status === "unknown") useVault.setState({ status: flagged(uid) ? "locked" : "off" });
  });
}

async function keyFits(key: CryptoKey, vdoc: VaultDoc) {
  try { return (await decryptWith(key, vdoc.check)) === "bibjournal"; } catch { return false; }
}

/** Resolves once we know whether the vault is on (and, if sealing, once it's open). */
function until(ok: () => boolean): Promise<void> {
  if (ok()) return Promise.resolve();
  return new Promise((resolve) => {
    const w = () => { if (ok()) { waiters.delete(w); resolve(); } };
    waiters.add(w);
  });
}
const known = () => useVault.getState().status !== "unknown";
const openNow = () => !!useVault.getState().key;

// ── sealing fields ──────────────────────────────────────────
export const isSealed = (v: unknown): v is string => typeof v === "string" && (v.startsWith(TXT) || v.startsWith(JSN));

const cache = new Map<string, unknown>();
function remember(k: string, v: unknown) {
  if (cache.size > 6000) cache.delete(cache.keys().next().value as string);
  cache.set(k, v);
}

/** Read one field: sealed → plain (waits for the key if the journal is locked); plain passes through. */
export async function openField<T = unknown>(v: T): Promise<T> {
  if (!isSealed(v)) return v;
  if (cache.has(v)) return cache.get(v) as T;
  await until(openNow);
  const key = useVault.getState().key!;
  const json = v.startsWith(JSN);
  const body = v.slice(json ? JSN.length : TXT.length);
  try {
    const plain = await decryptWith(key, body);
    const out = json ? JSON.parse(plain) : plain;
    remember(v, out);
    return out as T;
  } catch {
    return (json ? null : "⚠︎ Couldn’t unlock this text") as T;
  }
}

async function sealValue(v: unknown): Promise<unknown> {
  if (v === undefined || v === null || isSealed(v)) return v;
  const key = useVault.getState().key;
  if (!key) throw new VaultLockedError();
  const json = typeof v !== "string";
  const plain = json ? JSON.stringify(v) : (v as string);
  const out = (json ? JSN : TXT) + (await encryptWith(key, plain));
  remember(out, v);
  return out;
}

/** Open the named fields of a document. */
export async function openFields<T extends Record<string, unknown>>(row: T, fields: readonly string[]): Promise<T> {
  const out: Record<string, unknown> = { ...row };
  await Promise.all(fields.map(async (f) => { if (f in out) out[f] = await openField(out[f]); }));
  return out as T;
}

/** Seal the named fields of a write when the vault is on. Waits until we know. */
export async function sealFields<T extends Record<string, unknown>>(row: T, fields: readonly string[]): Promise<T> {
  await until(known);
  const s = useVault.getState().status;
  if (s === "off") return row;
  if (s === "locked") throw new VaultLockedError();
  const out: Record<string, unknown> = { ...row };
  await Promise.all(fields.map(async (f) => { if (f in out) out[f] = await sealValue(out[f]); }));
  return out as T;
}

/** Is the vault on? (waits until known) */
export async function vaultOn(): Promise<boolean> {
  await until(known);
  return useVault.getState().status !== "off";
}

/** Run writes to one document in the order they were made, even though sealing is async. */
const lanes = new Map<string, Promise<unknown>>();
export function inOrder<T>(path: string, run: () => Promise<T>): Promise<T> {
  const prev = lanes.get(path) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(run);
  lanes.set(path, next);
  void next.finally(() => { if (lanes.get(path) === next) lanes.delete(path); }).catch(() => {});
  return next;
}

// ── turning it on, unlocking, changing ──────────────────────

/** Set up the vault. Returns once the key is stored; the caller then converts existing writing. */
export async function createVault(uid: string, passphrase: string, recoveryCode: string, keepHere: boolean): Promise<void> {
  const dek = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const ps = rand(16), cs = rand(16);
  const [wp, wc] = await Promise.all([
    kekFrom(passphrase, ps, PASS_ITERS).then((k) => wrap(dek, k)),
    kekFrom(normCode(recoveryCode), cs, CODE_ITERS).then((k) => wrap(dek, k)),
  ]);
  // Use a non-extractable copy from here on.
  const raw = await crypto.subtle.exportKey("raw", dek);
  const key = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  const vdoc: VaultDoc = {
    v: 1,
    pass: { salt: b64(ps), iters: PASS_ITERS, wrapped: wp },
    code: { salt: b64(cs), iters: CODE_ITERS, wrapped: wc },
    check: await encryptWith(key, "bibjournal"),
  };
  await setDoc(doc(db, "users", uid, "vault", "key"), { ...vdoc, createdAt: serverTimestamp() });
  flag(uid, true);
  if (keepHere) await rememberKey(uid, key);
  useVault.setState({ doc: vdoc, key, status: "open", remembered: keepHere });
}

/** Unlock with the passphrase or the recovery code. Returns false when it's wrong. */
export async function unlockVault(secret: string, how: "pass" | "code", keepHere: boolean): Promise<boolean> {
  const { uid, doc: vdoc } = useVault.getState();
  if (!uid || !vdoc) return false;
  const w = vdoc[how];
  try {
    const kek = await kekFrom(how === "code" ? normCode(secret) : secret, unb64(w.salt), w.iters);
    const key = await unwrap(w.wrapped, kek);
    if (!(await keyFits(key, vdoc))) return false;
    if (keepHere) await rememberKey(uid, key); else await forgetKey(uid);
    useVault.setState({ key, status: "open", remembered: keepHere });
    return true;
  } catch { return false; }
}

/** Is this the passphrase / recovery code? Changes nothing. */
export async function checkSecret(secret: string, how: "pass" | "code"): Promise<boolean> {
  const vdoc = useVault.getState().doc;
  if (!vdoc) return false;
  const w = vdoc[how];
  try {
    const key = await unwrap(w.wrapped, await kekFrom(how === "code" ? normCode(secret) : secret, unb64(w.salt), w.iters));
    return keyFits(key, vdoc);
  } catch { return false; }
}

/** Forget the key on this device; the journal asks again. */
export async function lockVault(): Promise<void> {
  const { uid } = useVault.getState();
  if (uid) await forgetKey(uid);
  cache.clear();
  useVault.setState({ key: null, status: useVault.getState().doc ? "locked" : "off", remembered: false });
}

export async function setRemember(keep: boolean): Promise<void> {
  const { uid, key } = useVault.getState();
  if (!uid || !key) return;
  if (keep) await rememberKey(uid, key); else await forgetKey(uid);
  useVault.setState({ remembered: keep });
}

/**
 * Re-wrap the content key. `proof` is the current passphrase or the recovery code; pass a new
 * passphrase and/or a new recovery code. Your writing is never re-encrypted — only the key's wrapping.
 */
export async function rewrapVault(proof: string, proofHow: "pass" | "code", next: { passphrase?: string; recoveryCode?: string }): Promise<boolean> {
  const { uid, doc: vdoc } = useVault.getState();
  if (!uid || !vdoc) return false;
  let dek: CryptoKey;
  try {
    const w = vdoc[proofHow];
    dek = await unwrap(w.wrapped, await kekFrom(proofHow === "code" ? normCode(proof) : proof, unb64(w.salt), w.iters), true);
    if (!(await keyFits(dek, vdoc))) return false;
  } catch { return false; }
  const out: VaultDoc = { ...vdoc };
  if (next.passphrase) { const s = rand(16); out.pass = { salt: b64(s), iters: PASS_ITERS, wrapped: await wrap(dek, await kekFrom(next.passphrase, s, PASS_ITERS)) }; }
  if (next.recoveryCode) { const s = rand(16); out.code = { salt: b64(s), iters: CODE_ITERS, wrapped: await wrap(dek, await kekFrom(normCode(next.recoveryCode), s, CODE_ITERS)) }; }
  await setDoc(doc(db, "users", uid, "vault", "key"), { ...out, createdAt: serverTimestamp() });
  useVault.setState({ doc: out });
  return true;
}

/** Sign-out: don't leave the key behind on this device. */
export async function forgetVaultHere(uid: string) {
  await forgetKey(uid);
  cache.clear();
}

// DEV ONLY: lets the e2e harness show the lock screen and check this browser can keep a key.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as Record<string, unknown>).__bjVault = {
    useVault,
    async idbSelfTest() {
      const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
      await rememberKey("__selftest", key);
      const back = await recallKey("__selftest");
      await forgetKey("__selftest");
      if (!back) return "not stored";
      const sealed = await encryptWith(key, "hello");
      return (await decryptWith(back, sealed)) === "hello" && !back.extractable ? "ok" : "mismatch";
    },
  };
}

/** Shared primitives for the lock code (lib/locks.ts). */
export const cryptoParts = { kekFrom, wrap, unwrap, encryptWith, decryptWith, rand, b64, unb64 };
