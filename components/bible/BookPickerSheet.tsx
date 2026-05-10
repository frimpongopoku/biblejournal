"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { PROTESTANT_BOOKS, OT_BOOKS, CHAPTER_COUNTS } from "@/lib/bible-books";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  open: boolean;
  currentBook: string;
  currentChapter: number;
  onSelect: (book: string, chapter: number) => void;
  onClose: () => void;
}

export function BookPickerSheet({ open, currentBook, currentChapter, onSelect, onClose }: Props) {
  const [tab, setTab] = useState<"OT" | "NT">(OT_BOOKS.has(currentBook as never) ? "OT" : "NT");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const books = PROTESTANT_BOOKS.filter((b) =>
    tab === "OT" ? OT_BOOKS.has(b as never) : !OT_BOOKS.has(b as never)
  );

  function handleBookClick(book: string) {
    setSelectedBook(book);
  }

  function handleChapterClick(ch: number) {
    if (!selectedBook) return;
    onSelect(selectedBook, ch);
    setSelectedBook(null);
    onClose();
  }

  function handleClose() {
    setSelectedBook(null);
    onClose();
  }

  const totalChapters = selectedBook ? (CHAPTER_COUNTS[selectedBook] ?? 1) : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
            onClick={handleClose}
            onTouchEnd={(e) => { e.preventDefault(); handleClose(); }}
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ ease: EASE_OUT, duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          >
            <div className="w-full" style={{ maxWidth: 640 }}>
              <div
                className="rounded-t-2xl overflow-hidden flex flex-col"
                style={{
                  background: "var(--bj-bg-panel)",
                  borderTop: "1px solid var(--bj-line)",
                  borderLeft: "1px solid var(--bj-line)",
                  borderRight: "1px solid var(--bj-line)",
                  boxShadow: "0 -8px 40px color-mix(in oklch, var(--bj-ink) 18%, transparent)",
                  maxHeight: "72vh",
                }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-8 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
                </div>

                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-3 border-b shrink-0"
                  style={{ borderColor: "var(--bj-line-soft)" }}
                >
                  <div className="flex items-center gap-2">
                    {selectedBook && (
                      <button
                        onClick={() => setSelectedBook(null)}
                        className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ color: "var(--bj-ink4)" }}
                      >
                        <ChevronLeft size={15} />
                      </button>
                    )}
                    <h2
                      className="font-display"
                      style={{ fontSize: "1.1rem", color: "var(--bj-ink)", fontWeight: 400 }}
                    >
                      {selectedBook ? selectedBook : "Choose a book"}
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ color: "var(--bj-ink4)" }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* OT / NT tabs — only shown in book list view */}
                {!selectedBook && (
                  <div
                    className="flex gap-1 px-5 py-3 border-b shrink-0"
                    style={{ borderColor: "var(--bj-line-soft)" }}
                  >
                    {(["OT", "NT"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        data-active={tab === t || undefined}
                        className="bj-chip font-sans text-sm px-5 py-1.5 rounded-lg"
                        style={{
                          background: tab === t ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                          color: tab === t ? "white" : "var(--bj-ink3)",
                          fontWeight: tab === t ? 500 : 400,
                        }}
                      >
                        {t === "OT" ? "Old Testament" : "New Testament"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto flex-1" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
                  <AnimatePresence mode="wait">
                    {!selectedBook ? (
                      <motion.div
                        key="books"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-2 gap-1 p-3"
                      >
                        {books.map((book) => {
                          const isCurrent = book === currentBook;
                          return (
                            <button
                              key={book}
                              onClick={() => handleBookClick(book)}
                              data-active={isCurrent || undefined}
                              className="bj-list-row text-left px-4 py-3 rounded-xl"
                              style={{
                                background: isCurrent ? "var(--bj-gold-tint)" : "transparent",
                                border: isCurrent ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                              }}
                            >
                              <p
                                className="font-sans text-sm font-medium"
                                style={{ color: isCurrent ? "var(--bj-gold-deep)" : "var(--bj-ink)" }}
                              >
                                {book}
                              </p>
                              <p className="font-sans text-xs mt-0.5" style={{ color: "var(--bj-ink4)" }}>
                                {CHAPTER_COUNTS[book]} ch
                              </p>
                            </button>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chapters"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-5 gap-2 p-4"
                      >
                        {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => {
                          const isCurrent = selectedBook === currentBook && ch === currentChapter;
                          return (
                            <button
                              key={ch}
                              onClick={() => handleChapterClick(ch)}
                              className="bj-chip aspect-square rounded-xl flex items-center justify-center font-sans text-sm font-medium"
                              style={{
                                background: isCurrent ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                                color: isCurrent ? "white" : "var(--bj-ink2)",
                                minHeight: 44,
                              }}
                            >
                              {ch}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
