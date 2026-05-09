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
