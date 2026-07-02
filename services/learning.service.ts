import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LearningTopic, Insight, LearningBook, TopicStatus, InsightSourceType, BookStatus, ScriptureRef } from "@/types";

// ── Firestore helpers ─────────────────────────────────────

type RawTopic = Omit<LearningTopic, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type RawInsight = Omit<Insight, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type RawBook = Omit<LearningBook, "id" | "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const topicsCol = (uid: string) => collection(db, "users", uid, "learningTopics");
const insightsCol = (uid: string) => collection(db, "users", uid, "insights");
const booksCol = (uid: string) => collection(db, "users", uid, "learningBooks");

// ── Topics ────────────────────────────────────────────────

export function subscribeToTopics(
  uid: string,
  cb: (topics: LearningTopic[]) => void
): () => void {
  const q = query(topicsCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const raw = d.data() as RawTopic;
        return { ...raw, id: d.id, createdAt: raw.createdAt?.toDate() ?? new Date(), updatedAt: raw.updatedAt?.toDate() ?? new Date() };
      })
    );
  });
}

export async function createTopic(
  uid: string,
  data: { name: string; description: string; color: string; status: TopicStatus }
): Promise<string> {
  const ref = await addDoc(topicsCol(uid), {
    userId: uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTopic(
  uid: string,
  id: string,
  patch: Partial<Pick<LearningTopic, "name" | "description" | "color" | "status">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "learningTopics", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteTopic(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "learningTopics", id));
}

// ── Insights ──────────────────────────────────────────────

export function subscribeToInsights(
  uid: string,
  cb: (insights: Insight[]) => void
): () => void {
  const q = query(insightsCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const raw = d.data() as RawInsight;
        return { ...raw, id: d.id, createdAt: raw.createdAt?.toDate() ?? new Date(), updatedAt: raw.updatedAt?.toDate() ?? new Date() };
      })
    );
  });
}

export function subscribeToTopicInsights(
  uid: string,
  topicId: string,
  cb: (insights: Insight[]) => void
): () => void {
  const q = query(insightsCol(uid), where("topicId", "==", topicId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const raw = d.data() as RawInsight;
        return { ...raw, id: d.id, createdAt: raw.createdAt?.toDate() ?? new Date(), updatedAt: raw.updatedAt?.toDate() ?? new Date() };
      })
    );
  });
}

export async function createInsight(
  uid: string,
  data: { topicId: string; body: string; sourceType: InsightSourceType; sourceRef: string | null; scriptures: ScriptureRef[] }
): Promise<string> {
  const ref = await addDoc(insightsCol(uid), {
    userId: uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteInsight(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "insights", id));
}

// ── Books ─────────────────────────────────────────────────

export function subscribeToBooks(
  uid: string,
  cb: (books: LearningBook[]) => void
): () => void {
  const q = query(booksCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const raw = d.data() as RawBook;
        return { ...raw, id: d.id, createdAt: raw.createdAt?.toDate() ?? new Date(), updatedAt: raw.updatedAt?.toDate() ?? new Date() };
      })
    );
  });
}

export async function createBook(
  uid: string,
  data: { title: string; author: string; color: string; status: BookStatus; topicIds: string[]; rating: number | null; notes: string }
): Promise<string> {
  const ref = await addDoc(booksCol(uid), {
    userId: uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBook(
  uid: string,
  id: string,
  patch: Partial<Omit<LearningBook, "id" | "userId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "learningBooks", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteBook(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "learningBooks", id));
}
