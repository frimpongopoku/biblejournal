import { collection, getDocs, writeBatch, Timestamp, type DocumentReference } from "firebase/firestore";
import { deleteUser, reauthenticateWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";

/** Every collection that holds something you wrote. */
const COLLECTIONS = ["entries", "prayers", "sermons", "studyNotes", "learningTopics", "learningBooks", "insights", "proclamationFolders"] as const;

function plain(v: unknown): unknown {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

/** All of your data as one JSON object (dates as ISO strings). */
export async function exportEverything(uid: string): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, "users", uid, name));
    out[name] = await Promise.all(snap.docs.map(async (d) => {
      const row = { id: d.id, ...(plain(d.data()) as object) } as Record<string, unknown>;
      if (name === "proclamationFolders") {
        const entries = await getDocs(collection(db, "users", uid, name, d.id, "entries"));
        row.entries = entries.docs.map((e) => ({ id: e.id, ...(plain(e.data()) as object) }));
      }
      return row;
    }));
  }
  return out;
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function deleteRefs(refs: DocumentReference[]) {
  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => batch.delete(r));
    await batch.commit();
  }
}

/**
 * Deletes everything you wrote, then the account itself. Google asks you to
 * sign in again first if the last sign-in wasn't recent.
 */
export async function deleteAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  // Re-authenticate up front so we never end up with data gone but the account left.
  try {
    await reauthenticateWithPopup(user, googleProvider);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") throw new Error("cancelled");
    throw e;
  }
  const refs: DocumentReference[] = [];
  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, "users", user.uid, name));
    for (const d of snap.docs) {
      if (name === "proclamationFolders") {
        const entries = await getDocs(collection(db, "users", user.uid, name, d.id, "entries"));
        refs.push(...entries.docs.map((e) => e.ref));
      }
      refs.push(d.ref);
    }
  }
  await deleteRefs(refs);
  await deleteUser(user);
}
