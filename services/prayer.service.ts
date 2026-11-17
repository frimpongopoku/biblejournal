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
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { openFields, openField, sealFields, inOrder } from "@/lib/vault";
import type { Prayer, PrayerLogEntry } from "@/types";

type RawPrayer = Omit<Prayer, "id" | "createdAt" | "updatedAt" | "answeredAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  answeredAt: Timestamp | null;
};

const col = (uid: string) => collection(db, "users", uid, "prayers");
const ref = (uid: string, id: string) => doc(db, "users", uid, "prayers", id);

/** Encrypted when the vault is on. Each log line's text is sealed too (its time stays readable). */
export const SEALED_PRAYER = ["title", "body", "for", "testimony", "scriptures"] as const;

const openLog = (log: PrayerLogEntry[] | undefined) =>
  Promise.all((log ?? []).map(async (e) => ({ at: e.at, text: (await openField(e.text)) ?? "" })));
const sealLog = async (log: PrayerLogEntry[]) =>
  Promise.all(log.map(async (e) => ({ at: e.at, text: (await sealFields({ text: e.text }, ["text"])).text })));

export async function openPrayer(id: string, raw: RawPrayer): Promise<Prayer> {
  const o = await openFields(raw as unknown as Record<string, unknown>, SEALED_PRAYER) as unknown as RawPrayer;
  return {
    ...o,
    id,
    title: o.title ?? "",
    body: o.body ?? "",
    scriptures: Array.isArray(o.scriptures) ? o.scriptures : [],
    log: await openLog(o.log),
    createdAt: o.createdAt?.toDate() ?? new Date(),
    updatedAt: o.updatedAt?.toDate() ?? new Date(),
    answeredAt: o.answeredAt?.toDate() ?? null,
  };
}

export function subscribeToPrayers(
  uid: string,
  cb: (prayers: Prayer[]) => void
): () => void {
  const q = query(col(uid), orderBy("createdAt", "desc"));
  let seq = 0;
  return onSnapshot(q, (snap) => {
    const mine = ++seq;
    void Promise.all(snap.docs.map((d) => openPrayer(d.id, d.data() as RawPrayer)))
      .then((prayers) => { if (mine === seq) cb(prayers); });
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
  const r = doc(col(uid));
  void inOrder(r.path, async () => setDoc(r, await sealFields({
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
  }, SEALED_PRAYER))).catch((e) => console.error("createPrayer", e));
  return r.id;
}

export async function updatePrayer(
  uid: string,
  id: string,
  patch: Partial<Omit<Prayer, "id" | "userId" | "createdAt">>
): Promise<void> {
  const r = ref(uid, id);
  await inOrder(r.path, async () => {
    const { log, ...rest } = patch;
    await updateDoc(r, {
      ...(await sealFields(rest as Record<string, unknown>, SEALED_PRAYER)),
      ...(log ? { log: await sealLog(log) } : {}),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function markAnswered(
  uid: string,
  id: string,
  testimony: string
): Promise<void> {
  const r = ref(uid, id);
  await inOrder(r.path, async () => updateDoc(r, {
    status: "answered",
    ...(await sealFields({ testimony: testimony.trim() || null }, ["testimony"])),
    answeredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

export async function deletePrayer(uid: string, id: string): Promise<void> {
  const r = ref(uid, id);
  await inOrder(r.path, () => deleteDoc(r));
}

/** Record that you prayed it now, with what you said (may be empty). */
export async function logPrayer(uid: string, id: string, text: string): Promise<PrayerLogEntry> {
  const entry: PrayerLogEntry = { at: Date.now(), text: text.trim() };
  const r = ref(uid, id);
  await inOrder(r.path, async () => updateDoc(r, { log: arrayUnion((await sealLog([entry]))[0]), updatedAt: serverTimestamp() }));
  return entry;
}

export async function removePrayerLog(uid: string, id: string, entry: PrayerLogEntry): Promise<void> {
  // Sealed lines can't be matched by value (each seal is unique), so drop it by its time.
  const r = ref(uid, id);
  await inOrder(r.path, async () => {
    const snap = await getDoc(r);
    const log = ((snap.data()?.log ?? []) as PrayerLogEntry[]).filter((e) => e.at !== entry.at);
    await updateDoc(r, { log, updatedAt: serverTimestamp() });
  });
}

export async function reopenPrayer(uid: string, id: string): Promise<void> {
  const r = ref(uid, id);
  await inOrder(r.path, () => updateDoc(r, { status: "active", answeredAt: null, updatedAt: serverTimestamp() }));
}
