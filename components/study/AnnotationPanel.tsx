"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, Trash2, Plus, Highlighter, PenLine,
  CircleHelp, CheckCircle2, Circle, CornerDownRight,
} from "lucide-react";
import { NoteComposer } from "@/components/study/NoteComposer";
import {
  createStudyNote, updateStudyNote, deleteStudyNote, toggleQuestionResolved, answerQuestion,
} from "@/services/studyNotes.service";
import { STUDY_COLORS, studyColorHex } from "@/lib/study-colors";
import { previewText } from "@/lib/tiptap-preview";
import type { StudyNote, StudyNoteKind } from "@/types";

interface Props {
  uid: string;
  book: string;
  chapter: number;
  version: string;
  selectedVerse: number | null;
  verseText?: string;
  notes: StudyNote[]; // all annotations for this chapter
  onSelectVerse: (n: number | null) => void;
  onClose: () => void;
}

type ComposerField = "content" | "answer";
type ComposerState =
  | { mode: "new"; kind: "note" | "question" }
  | { mode: "edit"; id: string; field: ComposerField };

export function AnnotationPanel({
  uid, book, chapter, version, selectedVerse, verseText, notes, onSelectVerse, onClose,
}: Props) {
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const [draft, setDraft] = useState("");

  const verseNotes = notes
    .filter((n) => n.scripture.verse === selectedVerse)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const highlight = verseNotes.find((n) => n.kind === "highlight");
  const items = verseNotes.filter((n) => n.kind !== "highlight");

  function openNewComposer(kind: "note" | "question") {
    setComposer({ mode: "new", kind });
    setDraft("");
  }
  function openEditComposer(note: StudyNote, field: ComposerField = "content") {
    setComposer({ mode: "edit", id: note.id, field });
    setDraft((field === "answer" ? note.answer : note.content) ?? "");
  }
  function closeComposer() {
    setComposer(null);
    setDraft("");
  }

  async function saveComposer() {
    if (!composer || selectedVerse === null) return;
    if (composer.mode === "new") {
      await createStudyNote(uid, {
        scripture: { book, chapter, verse: selectedVerse, version },
        kind: composer.kind as StudyNoteKind,
        content: draft,
      });
    } else if (composer.field === "answer") {
      await answerQuestion(uid, composer.id, draft);
    } else {
      await updateStudyNote(uid, composer.id, { content: draft });
    }
    closeComposer();
  }

  async function pickColor(colorId: string) {
    if (selectedVerse === null) return;
    if (highlight && highlight.color === colorId) {
      await deleteStudyNote(uid, highlight.id);
    } else if (highlight) {
      await updateStudyNote(uid, highlight.id, { color: colorId });
    } else {
      await createStudyNote(uid, {
        scripture: { book, chapter, verse: selectedVerse, version },
        kind: "highlight",
        color: colorId,
      });
    }
  }

  const KIND_ICON: Record<StudyNoteKind, React.ElementType> = {
    note: PenLine, question: CircleHelp, highlight: Highlighter,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)" }}>
        {selectedVerse !== null && (
          <button onClick={() => { onSelectVerse(null); closeComposer(); }} className="bj-btn-icon w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ color: "var(--bj-ink3)" }}>
            <ChevronLeft size={14} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
            {book} {chapter}
          </p>
          <p className="font-display text-sm truncate" style={{ color: "var(--bj-ink)" }}>
            {selectedVerse !== null ? `Verse ${selectedVerse}` : "Chapter notes"}
          </p>
        </div>
        <button onClick={onClose} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ color: "var(--bj-ink4)" }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {selectedVerse === null ? (
          // ── Whole-chapter list ─────────────────────────
          <div className="flex flex-col gap-2">
            {notes.length === 0 && (
              <p className="font-sans text-xs py-8 text-center" style={{ color: "var(--bj-ink4)" }}>
                Tap a verse to add a highlight, note, or question.
              </p>
            )}
            {[...new Set(notes.map((n) => n.scripture.verse))]
              .sort((a, b) => a - b)
              .map((v) => {
                const vNotes = notes.filter((n) => n.scripture.verse === v);
                return (
                  <button
                    key={v}
                    onClick={() => onSelectVerse(v)}
                    className="bj-list-row flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left"
                    style={{ border: "1px solid var(--bj-line-soft)" }}
                  >
                    <span className="font-sans text-xs font-semibold w-6 text-right shrink-0" style={{ color: "var(--bj-ink4)" }}>{v}</span>
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {vNotes.map((n) => {
                        const Icon = KIND_ICON[n.kind];
                        return (
                          <span key={n.id} className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: n.kind === "highlight" ? studyColorHex(n.color) : "var(--bj-bg-soft)",
                              color: n.kind === "highlight" ? "white" : n.kind === "question" && n.resolved === false ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                            }}>
                            <Icon size={10} />
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
          </div>
        ) : (
          // ── Single-verse focus ─────────────────────────
          <div className="flex flex-col gap-4">
            {verseText && (
              <p className="font-sans text-[13px] italic leading-relaxed" style={{ color: "var(--bj-ink3)" }}>
                “{verseText}”
              </p>
            )}

            {/* Highlight swatches */}
            <div>
              <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>Highlight</p>
              <div className="flex gap-2">
                {STUDY_COLORS.map((c) => {
                  const active = highlight?.color === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => pickColor(c.id)}
                      title={c.label}
                      className="bj-swatch w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: c.hex,
                        boxShadow: active ? `0 0 0 2px var(--bj-bg-panel), 0 0 0 3.5px ${c.hex}` : "none",
                        transform: active ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {active && <Circle size={9} color="white" fill="white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Existing notes/questions */}
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const Icon = KIND_ICON[item.kind];
                const isEditingContent = composer?.mode === "edit" && composer.id === item.id && composer.field === "content";
                const isEditingAnswer = composer?.mode === "edit" && composer.id === item.id && composer.field === "answer";
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="rounded-xl overflow-hidden"
                    style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
                  >
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Icon size={12} style={{ color: item.kind === "question" ? (item.resolved ? "var(--bj-ink4)" : "var(--bj-gold-deep)") : "var(--bj-gold)", flexShrink: 0 }} />
                      <p className="font-sans text-[11px] font-medium flex-1" style={{ color: "var(--bj-ink4)" }}>
                        {item.kind === "question" ? (item.resolved ? "Resolved question" : "Open question") : "Note"}
                      </p>
                      {item.kind === "question" && (
                        <button
                          onClick={() => toggleQuestionResolved(uid, item.id, !item.resolved)}
                          className="bj-btn-icon w-5 h-5 flex items-center justify-center rounded shrink-0"
                          title={item.resolved ? "Mark unresolved" : "Mark resolved"}
                          style={{ color: item.resolved ? "var(--bj-gold)" : "var(--bj-ink4)" }}
                        >
                          <CheckCircle2 size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteStudyNote(uid, item.id)}
                        className="bj-btn-action w-5 h-5 flex items-center justify-center rounded shrink-0"
                        data-danger
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="px-3 pb-3">
                      {isEditingContent ? (
                        <div className="flex flex-col gap-2">
                          <NoteComposer content={draft} onChange={setDraft} autoFocus />
                          <div className="flex gap-2 justify-end">
                            <button onClick={closeComposer} className="bj-btn-ghost font-sans text-xs px-2.5 py-1 rounded-lg" style={{ color: "var(--bj-ink4)" }}>Cancel</button>
                            <button onClick={saveComposer} className="bj-btn-primary font-sans text-xs px-3 py-1 rounded-lg" style={{ background: "var(--bj-gold)", color: "white" }}>Save</button>
                          </div>
                        </div>
                      ) : (
                        <p
                          onClick={() => openEditComposer(item, "content")}
                          className="bj-list-row font-sans text-[12px] leading-relaxed cursor-text rounded-lg p-1.5 -m-1.5"
                          style={{ color: "var(--bj-ink2)", borderTop: "1px solid var(--bj-line-soft)", paddingTop: 8, marginTop: 2 }}
                        >
                          {previewText(item.content) || <span style={{ color: "var(--bj-ink4)", fontStyle: "italic" }}>Tap to write…</span>}
                        </p>
                      )}

                      {item.kind === "question" && (
                        <div className="mt-2 pl-3 flex flex-col gap-1.5" style={{ borderLeft: "2px solid var(--bj-line-soft)" }}>
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight size={10} style={{ color: "var(--bj-ink4)" }} />
                            <p className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>Answer</p>
                          </div>
                          {isEditingAnswer ? (
                            <div className="flex flex-col gap-2">
                              <NoteComposer content={draft} onChange={setDraft} placeholder="Write the answer…" autoFocus />
                              <div className="flex gap-2 justify-end">
                                <button onClick={closeComposer} className="bj-btn-ghost font-sans text-xs px-2.5 py-1 rounded-lg" style={{ color: "var(--bj-ink4)" }}>Cancel</button>
                                <button onClick={saveComposer} className="bj-btn-primary font-sans text-xs px-3 py-1 rounded-lg" style={{ background: "var(--bj-gold)", color: "white" }}>Save</button>
                              </div>
                            </div>
                          ) : item.answer ? (
                            <p
                              onClick={() => openEditComposer(item, "answer")}
                              className="bj-list-row font-sans text-[12px] leading-relaxed cursor-text rounded-lg p-1.5 -m-1.5"
                              style={{ color: "var(--bj-ink2)" }}
                            >
                              {previewText(item.answer)}
                            </p>
                          ) : (
                            <button
                              onClick={() => openEditComposer(item, "answer")}
                              className="bj-chip self-start flex items-center gap-1.5 font-sans text-xs px-2.5 py-1.5 rounded-lg"
                              style={{ color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)", background: "var(--bj-gold-tint)" }}
                            >
                              <Plus size={11} /> Add answer
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* New note / question composer */}
            {composer?.mode === "new" ? (
              <div className="flex flex-col gap-2">
                <NoteComposer
                  content={draft}
                  onChange={setDraft}
                  placeholder={composer.kind === "question" ? "What are you wondering about this verse?" : "Write your note…"}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={closeComposer} className="bj-btn-ghost font-sans text-xs px-2.5 py-1 rounded-lg" style={{ color: "var(--bj-ink4)" }}>Cancel</button>
                  <button onClick={saveComposer} className="bj-btn-primary font-sans text-xs px-3 py-1 rounded-lg" style={{ background: "var(--bj-gold)", color: "white" }}>Save</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => openNewComposer("note")}
                  className="bj-chip flex-1 flex items-center justify-center gap-1.5 font-sans text-xs px-3 py-2 rounded-xl"
                  style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <Plus size={12} /> Note
                </button>
                <button
                  onClick={() => openNewComposer("question")}
                  className="bj-chip flex-1 flex items-center justify-center gap-1.5 font-sans text-xs px-3 py-2 rounded-xl"
                  style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <Plus size={12} /> Question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
