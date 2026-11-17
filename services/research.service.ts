import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Something kept from Research: a word, an answer, a verse, or your own line. */
export interface ResearchNote {
  id: string;
  /** What you were studying when you kept it — groups the notebook ("John 15", "abide"). */
  topic: string;
  kind: "word" | "answer" | "verse" | "context" | "note";
  title: string;
  body: string;
  ref?: string;
  createdAt: Date;
}

const col = (uid: string) => collection(db, "users", uid, "research");

export function subscribeToResearch(uid: string, cb: (notes: ResearchNote[]) => void): () => void {
  return onSnapshot(query(col(uid), orderBy("createdAt", "desc")), (snap) => {
    cb(snap.docs.map((d) => {
      const raw = d.data({ serverTimestamps: "estimate" }) as Omit<ResearchNote, "id" | "createdAt"> & { createdAt?: Timestamp };
      return { ...raw, id: d.id, createdAt: raw.createdAt?.toDate() ?? new Date() };
    }));
  });
}

/** Keep a note. Written to the local cache at once; syncs in the background. */
export function keepResearch(uid: string, note: Omit<ResearchNote, "id" | "createdAt">): string {
  const ref = doc(col(uid));
  void setDoc(ref, { ...note, ...(note.ref ? {} : { ref: null }), createdAt: serverTimestamp() }).catch((e) => console.error("keep failed", e));
  return ref.id;
}

export function forgetResearch(uid: string, id: string): Promise<void> {
  return deleteDoc(doc(col(uid), id));
}
