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
import type { ScriptureRef, StudyNote, StudyNoteKind } from "@/types";

type RawStudyNote = Omit<StudyNote, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const col = (uid: string) => collection(db, "users", uid, "studyNotes");

export function subscribeToStudyNotes(
  uid: string,
  cb: (notes: StudyNote[]) => void
): () => void {
  const q = query(col(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const raw = d.data() as RawStudyNote;
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

export async function createStudyNote(
  uid: string,
  data: {
    scripture: ScriptureRef;
    kind: StudyNoteKind;
    color?: string | null;
    content?: string | null;
    resolved?: boolean | null;
  }
): Promise<string> {
  const ref = await addDoc(col(uid), {
    userId: uid,
    scripture: data.scripture,
    kind: data.kind,
    color: data.color ?? null,
    content: data.content ?? null,
    answer: null,
    resolved: data.kind === "question" ? data.resolved ?? false : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateStudyNote(
  uid: string,
  id: string,
  patch: Partial<Omit<StudyNote, "id" | "userId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "studyNotes", id), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleQuestionResolved(
  uid: string,
  id: string,
  resolved: boolean
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "studyNotes", id), {
    resolved,
    updatedAt: serverTimestamp(),
  });
}

/** Save a question's answer — writing an answer also marks it resolved. */
export async function answerQuestion(
  uid: string,
  id: string,
  answer: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "studyNotes", id), {
    answer,
    resolved: true,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStudyNote(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "studyNotes", id));
}
