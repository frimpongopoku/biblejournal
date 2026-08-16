"use client";

import { useState } from "react";
import { NotebookPen, Check } from "lucide-react";
import { createEntry, updateEntry } from "@/services/journal.service";
import { useAuthStore } from "@/store/auth.store";
import { useNotepadStore } from "@/store/notepad.store";
import type { JournalEntry } from "@/types";

function quoteNodes(text: string, label: string) {
  return [
    { type: "calloutBlock", content: [{ type: "text", text }] },
    { type: "paragraph", content: [{ type: "text", text: `— ${label}` }] },
  ];
}

/**
 * A small icon action that copies a piece of timeline text into whatever note
 * is currently active in the floating notepad — appending, not replacing, so
 * a note can be built up from several passages while reading. If no note is
 * active yet, this starts one. Deliberately doesn't force the notepad open on
 * every click (that would steal focus mid-read); the checkmark is the only
 * feedback, and the notepad shows the result whenever it's next opened.
 */
export function AddToNoteButton({
  label,
  text,
  entries,
}: {
  label: string;
  text: string;
  entries: JournalEntry[];
}) {
  const user = useAuthStore((s) => s.user);
  const activeEntryId = useNotepadStore((s) => s.activeEntryId);
  const setActiveEntry = useNotepadStore((s) => s.setActiveEntry);
  const bumpAppendVersion = useNotepadStore((s) => s.bumpAppendVersion);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const active = activeEntryId ? entries.find((e) => e.id === activeEntryId) ?? null : null;

  async function handleClick() {
    if (!user || busy) return;
    setBusy(true);
    const nodes = quoteNodes(text, label);

    if (active) {
      let doc: { type: string; content?: unknown[] };
      try {
        doc = JSON.parse(active.content);
      } catch {
        doc = { type: "doc", content: [] };
      }
      doc.content = [...(doc.content ?? []), ...nodes];
      await updateEntry(user.uid, active.id, { content: JSON.stringify(doc) });
      bumpAppendVersion();
    } else {
      const id = await createEntry(user.uid, {
        tags: ["Timeline"],
        content: JSON.stringify({ type: "doc", content: nodes }),
      });
      setActiveEntry(id);
    }

    setBusy(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy || !user}
      title={active ? "Add to your note" : "Start a note with this"}
      className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ color: added ? "var(--bj-sage)" : "var(--bj-ink4)" }}
    >
      {added ? <Check size={13} /> : <NotebookPen size={13} />}
    </button>
  );
}
