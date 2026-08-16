"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NotebookPen, Plus, ChevronDown, ArrowUpRight } from "lucide-react";
import { FloatShell } from "@/components/shared/FloatingWindows";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import { useAuthStore } from "@/store/auth.store";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { createEntry, updateEntry } from "@/services/journal.service";
import { useNotepadStore } from "@/store/notepad.store";

function formatDate(d: Date): string {
  const now = new Date();
  const diff = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FloatingNotepad({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { entries, loading } = useJournalEntries();
  const activeEntryId = useNotepadStore((s) => s.activeEntryId);
  const setActiveEntry = useNotepadStore((s) => s.setActiveEntry);
  const appendVersion = useNotepadStore((s) => s.appendVersion);

  const [localTitle, setLocalTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDefaulted = useRef(false);

  const active = activeEntryId ? entries.find((e) => e.id === activeEntryId) ?? null : null;
  const timelineNotes = entries.filter((e) => e.tags.includes("Timeline"));

  // On first load, if nothing is active yet, default to the most recently
  // touched Timeline note (entries already come sorted by updatedAt desc) —
  // "always there, pick up where you left off" without forcing an empty pane.
  useEffect(() => {
    if (!loading && !hasDefaulted.current) {
      hasDefaulted.current = true;
      if (!activeEntryId && timelineNotes.length > 0) {
        setActiveEntry(timelineNotes[0].id);
      }
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (active) setLocalTitle(active.title);
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function scheduleSave(patch: { title?: string; content?: string }) {
    if (!user || !activeEntryId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateEntry(user.uid, activeEntryId, patch);
    }, 1200);
  }

  async function handleNew() {
    if (!user || creating) return;
    setCreating(true);
    const id = await createEntry(user.uid, { tags: ["Timeline"] });
    setActiveEntry(id);
    setLocalTitle("");
    setShowSwitcher(false);
    setCreating(false);
  }

  return (
    <FloatShell
      title="Notepad"
      icon={<NotebookPen size={13} />}
      onClose={onClose}
      width={400}
      defaultPos={{ x: typeof window !== "undefined" ? Math.max(16, window.innerWidth - 430) : 16, y: 88 }}
    >
      <div className="flex flex-col h-full" style={{ minHeight: 420 }}>
        {/* Header: switcher + new + open in journal */}
        <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setShowSwitcher((o) => !o)}
              className="bj-btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg w-full text-left min-w-0"
            >
              <span className="font-sans text-xs font-medium truncate flex-1" style={{ color: active ? "var(--bj-ink2)" : "var(--bj-ink4)" }}>
                {active ? active.title || "Untitled note" : "Select a note"}
              </span>
              <ChevronDown size={12} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
            </button>

            {showSwitcher && (
              <div
                className="absolute left-0 right-0 rounded-xl overflow-hidden z-10 max-h-64 overflow-y-auto"
                style={{ top: "calc(100% + 4px)", background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "0 8px 24px color-mix(in oklch, var(--bj-ink) 14%, transparent)" }}
              >
                {timelineNotes.length === 0 ? (
                  <p className="font-sans text-xs px-3 py-3" style={{ color: "var(--bj-ink4)" }}>No notes yet</p>
                ) : (
                  timelineNotes.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => { setActiveEntry(e.id); setShowSwitcher(false); }}
                      className="bj-list-row flex items-center justify-between gap-2 w-full px-3 py-2 text-left"
                      style={{ background: e.id === activeEntryId ? "var(--bj-gold-tint)" : "transparent" }}
                    >
                      <span className="font-sans text-xs truncate" style={{ color: e.id === activeEntryId ? "var(--bj-gold-deep)" : "var(--bj-ink2)" }}>
                        {e.title || "Untitled note"}
                      </span>
                      <span className="font-sans text-[10px] shrink-0" style={{ color: "var(--bj-ink4)" }}>{formatDate(e.updatedAt)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleNew}
            disabled={creating}
            title="Start a new note"
            className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ color: "var(--bj-ink3)" }}
          >
            <Plus size={14} />
          </button>

          {active && (
            <Link
              href={`/journal?entry=${active.id}`}
              title="Open in Journal"
              className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {active ? (
          <>
            <div className="px-3 pt-3 shrink-0">
              <input
                value={localTitle}
                onChange={(e) => { setLocalTitle(e.target.value); scheduleSave({ title: e.target.value }); }}
                placeholder="Untitled"
                className="font-display bg-transparent outline-none w-full text-lg"
                style={{ color: "var(--bj-ink)", fontWeight: 400 }}
              />
            </div>
            <div className="flex-1 overflow-hidden px-1">
              <TipTapEditor
                key={`${active.id}-${appendVersion}`}
                entryId={active.id}
                content={active.content}
                onChange={(json) => scheduleSave({ content: json })}
                fontKey="journal"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <NotebookPen size={22} style={{ color: "var(--bj-ink4)" }} />
            <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)", lineHeight: 1.6 }}>
              Start a fresh note, or add one from any event on the trail.
            </p>
            <button
              onClick={handleNew}
              disabled={creating}
              className="bj-btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs"
              style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink2)" }}
            >
              <Plus size={12} /> {creating ? "Creating…" : "New note"}
            </button>
          </div>
        )}
      </div>
    </FloatShell>
  );
}
