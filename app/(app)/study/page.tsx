"use client";

import { Suspense, useState } from "react";
import { BookOpen, NotebookText } from "lucide-react";
import { useBibleChapter } from "@/hooks/useBibleChapter";
import { useStudyNotes } from "@/hooks/useStudyNotes";
import { useAuthStore } from "@/store/auth.store";
import { StudyReader } from "@/components/study/StudyReader";
import { StudyNotebook } from "@/components/study/StudyNotebook";
import type { ScriptureRef } from "@/types";

type Tab = "read" | "notebook";

function StudySpace() {
  const user = useAuthStore((s) => s.user);
  const chapterState = useBibleChapter();
  const { studyNotes } = useStudyNotes();
  const [tab, setTab] = useState<Tab>("read");

  function jumpTo(scripture: ScriptureRef) {
    chapterState.navigate({ book: scripture.book, chapter: scripture.chapter }, scripture.verse);
    setTab("read");
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bj-bg)" }}>
      <div
        className="flex items-center gap-1.5 px-3 md:px-5 py-2 border-b shrink-0"
        style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
      >
        <button
          onClick={() => setTab("read")}
          className="bj-chip flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-xl"
          style={{
            background: tab === "read" ? "var(--bj-gold)" : "var(--bj-bg-soft)",
            color: tab === "read" ? "white" : "var(--bj-ink3)",
            fontWeight: tab === "read" ? 500 : 400,
          }}
        >
          <BookOpen size={12} /> Read
        </button>
        <button
          onClick={() => setTab("notebook")}
          className="bj-chip flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-xl"
          style={{
            background: tab === "notebook" ? "var(--bj-gold)" : "var(--bj-bg-soft)",
            color: tab === "notebook" ? "white" : "var(--bj-ink3)",
            fontWeight: tab === "notebook" ? 500 : 400,
          }}
        >
          <NotebookText size={12} /> Notebook
          {studyNotes.length > 0 && (
            <span className="font-sans text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: tab === "notebook" ? "rgba(255,255,255,0.25)" : "var(--bj-line)", color: tab === "notebook" ? "white" : "var(--bj-ink4)" }}>
              {studyNotes.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {tab === "read" ? (
          <StudyReader uid={user.uid} chapterState={chapterState} studyNotes={studyNotes} />
        ) : (
          <StudyNotebook studyNotes={studyNotes} onJump={jumpTo} />
        )}
      </div>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={null}>
      <StudySpace />
    </Suspense>
  );
}
