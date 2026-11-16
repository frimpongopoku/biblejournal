import { createEntry } from "@/services/journal.service";
import type { JournalEntry } from "@/types";

type Seed = Partial<Pick<JournalEntry, "title" | "content" | "tags" | "scriptures" | "feeling" | "cover">>;
type Push = (href: string) => void;

/**
 * Start a new entry from anywhere and open it. The id is created locally,
 * so the journal opens on it immediately — focus goes to the title, or to
 * the body when the entry already has a title.
 */
export async function startEntry(uid: string, push: Push, seed?: Seed, focus?: "title" | "body" | "verse"): Promise<string> {
  const id = await createEntry(uid, seed);
  push(`/journal?entry=${id}&new=${focus ?? (seed?.title ? "body" : "title")}`);
  return id;
}
