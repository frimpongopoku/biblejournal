export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string; // TipTap JSON string
  tags: string[];
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  feeling?: string;
  scriptures: ScriptureRef[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string | null;
}

export interface ScriptureRef {
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
  version: string;
  text?: string;
}

export interface Prayer {
  id: string;
  userId: string;
  title: string;
  body: string;
  status: "active" | "answered" | "archived";
  scriptures: ScriptureRef[];
  testimony: string | null;
  answeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  userId: string;
  scripture: ScriptureRef;
  note: string | null;
  color: string;
  createdAt: Date;
}

export type BibleVersion = "KJV" | "NIV" | "ESV" | "NKJV" | "NLT";

export interface ProclamationFolder {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  shareToken: string | null;
  entryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SermonRef {
  id: string;
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
  text: string;
  note: string;
  version: string;
  addedAt: string; // ISO date string
}

export interface Sermon {
  id: string;
  userId: string;
  title: string;
  speaker: string;
  church: string;
  videoUrl: string;
  videoId: string;
  content: string; // TipTap JSON
  references: SermonRef[];
  sermonDate: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

export interface ProclamationEntry {
  id: string;
  userId: string;
  folderId: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Learning Portfolio ────────────────────────────────────

export type TopicStatus = "active" | "paused" | "completed";
export type InsightSourceType = "book" | "sermon" | "bible" | "course" | "conversation" | "reflection";
export type BookStatus = "want-to-read" | "reading" | "finished";

export interface LearningTopic {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  status: TopicStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Insight {
  id: string;
  userId: string;
  topicId: string;
  body: string;
  sourceType: InsightSourceType;
  sourceRef: string | null;
  scriptures: ScriptureRef[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningBook {
  id: string;
  userId: string;
  topicIds: string[];
  title: string;
  author: string;
  color: string;
  status: BookStatus;
  rating: number | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
