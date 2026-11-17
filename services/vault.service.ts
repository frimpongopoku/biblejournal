import { collection, getDocs, writeBatch, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isSealed, sealFields } from "@/lib/vault";
import { SEALED_ENTRY } from "@/services/journal.service";
import { SEALED_PRAYER } from "@/services/prayer.service";
import type { PrayerLogEntry } from "@/types";

/** What's sealed so far: counts for the setup screen. */
export interface ConvertProgress { done: number; total: number }

function needs(data: DocumentData, fields: readonly string[]) {
  return fields.some((f) => data[f] !== undefined && data[f] !== null && !isSealed(data[f]))
    || (Array.isArray(data.log) && (data.log as PrayerLogEntry[]).some((e) => e.text && !isSealed(e.text)));
}

/**
 * Encrypt everything already written in the journal and prayer list. Safe to run again:
 * sealed fields are skipped. Leaves `updatedAt` alone so nothing jumps to the top.
 */
export async function sealExisting(uid: string, onProgress?: (p: ConvertProgress) => void): Promise<ConvertProgress> {
  const sets = [
    { name: "entries", fields: SEALED_ENTRY },
    { name: "prayers", fields: SEALED_PRAYER },
  ] as const;
  const todo: { ref: import("firebase/firestore").DocumentReference; data: DocumentData; fields: readonly string[] }[] = [];
  for (const s of sets) {
    const snap = await getDocs(collection(db, "users", uid, s.name));
    for (const d of snap.docs) if (needs(d.data(), s.fields)) todo.push({ ref: d.ref, data: d.data(), fields: s.fields });
  }
  const p = { done: 0, total: todo.length };
  onProgress?.(p);
  for (let i = 0; i < todo.length; i += 200) {
    const batch = writeBatch(db);
    for (const t of todo.slice(i, i + 200)) {
      const pick: Record<string, unknown> = {};
      for (const f of t.fields) if (t.data[f] !== undefined) pick[f] = t.data[f];
      const sealed = await sealFields(pick, t.fields);
      const patch: Record<string, unknown> = { ...sealed };
      if (Array.isArray(t.data.log)) {
        patch.log = await Promise.all((t.data.log as PrayerLogEntry[]).map(async (e) => ({ at: e.at, text: (await sealFields({ text: e.text ?? "" }, ["text"])).text })));
      }
      batch.update(t.ref, patch);
    }
    await batch.commit();
    p.done = Math.min(todo.length, i + 200);
    onProgress?.({ ...p });
  }
  return p;
}
