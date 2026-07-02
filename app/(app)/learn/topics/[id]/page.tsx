"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Lightbulb, BookOpen, Plus, Pencil,
  Trash2, Library,
} from "lucide-react";
import { useLearningTopics } from "@/hooks/useLearningTopics";
import { useInsights } from "@/hooks/useInsights";
import { useLearningBooks } from "@/hooks/useLearningBooks";
import { deleteInsight, deleteTopic, deleteBook } from "@/services/learning.service";
import { useAuthStore } from "@/store/auth.store";
import { InsightDrawer } from "@/components/learn/InsightDrawer";
import { TopicFormDialog } from "@/components/learn/TopicFormDialog";
import { BookFormDialog } from "@/components/learn/BookFormDialog";
import type { Insight, LearningBook, InsightSourceType } from "@/types";

// ── Animations ────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  }),
};

// ── Source type config ────────────────────────────────────

const SOURCE_LABELS: Record<InsightSourceType, string> = {
  book: "Book", sermon: "Sermon", bible: "Bible",
  course: "Course", conversation: "Convo", reflection: "Reflection",
};

const ALL_SOURCES: InsightSourceType[] = ["book", "sermon", "bible", "course", "conversation", "reflection"];

// ── Insight card ──────────────────────────────────────────

function InsightCard({
  insight, topicColor, onDelete,
}: {
  insight: Insight;
  topicColor: string;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="flex gap-3 px-5 py-4 group"
      style={{ borderBottom: "1px solid var(--bj-line-soft)" }}
    >
      <div className="w-1 rounded-full shrink-0 mt-0.5" style={{ background: topicColor, minHeight: 40 }} />
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm leading-relaxed mb-2" style={{ color: "var(--bj-ink2)", lineHeight: 1.7 }}>
          {insight.body}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-sans text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink4)", border: "1px solid var(--bj-line-soft)" }}
          >
            {SOURCE_LABELS[insight.sourceType]}
          </span>
          {insight.sourceRef && (
            <span className="font-sans text-[10px]" style={{ color: "var(--bj-ink4)" }}>
              {insight.sourceRef}
            </span>
          )}
          <span className="font-sans text-[10px] ml-auto" style={{ color: "var(--bj-ink4)" }}>
            {insight.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
      {/* Delete */}
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-start pt-0.5">
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={onDelete}
              className="font-sans text-[10px] px-2 py-1 rounded-lg"
              style={{ background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))", color: "var(--bj-ember)" }}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="font-sans text-[10px] px-2 py-1 rounded-lg"
              style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink4)" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="bj-btn-icon w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ color: "var(--bj-ink4)" }}
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Book spine ────────────────────────────────────────────

function BookSpine({ book, onEdit }: { book: LearningBook; onEdit: () => void }) {
  return (
    <button
      onClick={onEdit}
      className="bj-list-row shrink-0 rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{
        width: 44,
        height: 148,
        background: book.color,
        boxShadow: "2px 2px 8px color-mix(in oklch, var(--bj-ink) 18%, transparent)",
      }}
      title={`${book.title} — ${book.author}`}
    >
      <p
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          fontSize: 10,
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          color: "rgba(255,255,255,0.92)",
          padding: "6px 0",
          lineHeight: 1.2,
          maxHeight: "90%",
          overflow: "hidden",
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      >
        {book.title}
      </p>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function TopicPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const { topics, loading: tLoading } = useLearningTopics();
  const { insights, loading: iLoading } = useInsights(id);
  const { books, loading: bLoading } = useLearningBooks();

  const [insightDrawerOpen, setInsightDrawerOpen] = useState(false);
  const [topicEditOpen, setTopicEditOpen] = useState(false);
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<LearningBook | null>(null);
  const [sourceFilter, setSourceFilter] = useState<InsightSourceType | "all">("all");
  const [confirmDeleteTopic, setConfirmDeleteTopic] = useState(false);

  const topic = topics.find((t) => t.id === id) ?? null;
  const topicBooks = books.filter((b) => b.topicIds.includes(id));
  const filteredInsights = sourceFilter === "all"
    ? insights
    : insights.filter((i) => i.sourceType === sourceFilter);

  const usedSources = Array.from(new Set(insights.map((i) => i.sourceType))) as InsightSourceType[];

  async function handleDeleteInsight(insightId: string) {
    if (!user) return;
    await deleteInsight(user.uid, insightId);
  }

  async function handleDeleteTopic() {
    if (!user || !topic) return;
    await deleteTopic(user.uid, topic.id);
    window.location.href = "/learn";
  }

  function handleEditBook(book: LearningBook) {
    setEditingBook(book);
    setBookFormOpen(true);
  }

  async function handleDeleteBook(bookId: string) {
    if (!user) return;
    await deleteBook(user.uid, bookId);
  }

  if (tLoading) {
    return (
      <div className="min-h-full px-5 md:px-12 pt-10" style={{ background: "var(--bj-bg)" }}>
        <div className="flex flex-col gap-4 max-w-[720px] mx-auto">
          {[60, 120, 200].map((h, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ height: h, background: "var(--bj-bg-soft)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 px-6" style={{ background: "var(--bj-bg)" }}>
        <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)" }}>Topic not found.</p>
        <Link href="/learn" className="font-sans text-sm" style={{ color: "var(--bj-gold-deep)" }}>
          ← Back to portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-8 md:pt-12 pb-24" style={{ maxWidth: 720 }}>

        {/* ── Back link ─────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-6">
          <Link
            href="/learn"
            className="bj-btn-ghost inline-flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-lg"
            style={{ color: "var(--bj-ink4)", border: "1px solid var(--bj-line-soft)" }}
          >
            <ArrowLeft size={11} />
            Portfolio
          </Link>
        </motion.div>

        {/* ── Topic header ──────────────────────────────── */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="mb-8">
          <div className="flex items-start gap-3 justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-4 h-4 rounded-full mt-1.5 shrink-0" style={{ background: topic.color }} />
              <div className="min-w-0">
                <h1
                  className="font-display leading-tight mb-1"
                  style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400 }}
                >
                  {topic.name}
                </h1>
                {topic.description && (
                  <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", lineHeight: 1.6, maxWidth: 480 }}>
                    {topic.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <button
                onClick={() => setTopicEditOpen(true)}
                className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink4)" }}
              >
                <Pencil size={12} />
              </button>
              {confirmDeleteTopic ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDeleteTopic}
                    className="font-sans text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))", color: "var(--bj-ember)" }}
                  >
                    Delete topic
                  </button>
                  <button
                    onClick={() => setConfirmDeleteTopic(false)}
                    className="font-sans text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink4)" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteTopic(true)}
                  className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink4)" }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
              <Lightbulb size={12} />
              {insights.length} {insights.length === 1 ? "insight" : "insights"}
            </div>
            <div className="flex items-center gap-1.5 font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
              <BookOpen size={12} />
              {topicBooks.length} {topicBooks.length === 1 ? "book" : "books"}
            </div>
            <div className="ml-auto">
              <span
                className="font-sans text-[10px] px-2.5 py-1 rounded-full capitalize"
                style={{
                  background: topic.status === "active" ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                  color: topic.status === "active" ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
                  border: topic.status === "active" ? "1px solid var(--bj-gold-soft)" : "1px solid var(--bj-line-soft)",
                }}
              >
                {topic.status}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Insights ──────────────────────────────────── */}
        <motion.section variants={fadeUp} custom={2} initial="hidden" animate="show" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
              Insights
            </h2>
            <button
              onClick={() => setInsightDrawerOpen(true)}
              className="bj-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-xs font-medium"
              style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 1px 8px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
            >
              <Plus size={11} /> Add insight
            </button>
          </div>

          {/* Source filter pills */}
          {usedSources.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setSourceFilter("all")}
                className="px-3 py-1 rounded-lg font-sans text-xs"
                style={{
                  background: sourceFilter === "all" ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                  border: sourceFilter === "all" ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                  color: sourceFilter === "all" ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                  transition: "all 0.14s ease",
                }}
              >
                All
              </button>
              {usedSources.map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceFilter(s)}
                  className="px-3 py-1 rounded-lg font-sans text-xs"
                  style={{
                    background: sourceFilter === s ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                    border: sourceFilter === s ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                    color: sourceFilter === s ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                    transition: "all 0.14s ease",
                  }}
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
          )}

          {iLoading ? (
            <div className="rounded-2xl animate-pulse" style={{ height: 160, background: "var(--bj-bg-soft)" }} />
          ) : filteredInsights.length === 0 ? (
            <div
              className="rounded-2xl px-5 py-10 flex flex-col items-center gap-3 text-center"
              style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--bj-bg-soft)" }}
              >
                <Lightbulb size={15} style={{ color: "var(--bj-ink4)" }} />
              </div>
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)" }}>
                {sourceFilter !== "all" ? "No insights with this source." : "No insights yet."}
              </p>
              {sourceFilter === "all" && (
                <button
                  onClick={() => setInsightDrawerOpen(true)}
                  className="font-sans text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                >
                  Capture first insight
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}>
              {filteredInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  topicColor={topic.color}
                  onDelete={() => handleDeleteInsight(insight.id)}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Books ─────────────────────────────────────── */}
        <motion.section variants={fadeUp} custom={3} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
              Books
            </h2>
            <button
              onClick={() => { setEditingBook(null); setBookFormOpen(true); }}
              className="bj-chip font-sans text-xs flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ color: "var(--bj-gold-deep)" }}
            >
              <Plus size={10} /> Add book
            </button>
          </div>

          {bLoading ? (
            <div className="rounded-2xl animate-pulse" style={{ height: 100, background: "var(--bj-bg-soft)" }} />
          ) : topicBooks.length === 0 ? (
            <div
              className="rounded-2xl px-5 py-10 flex flex-col items-center gap-3 text-center"
              style={{ background: "var(--bj-bg-panel)", border: "1.5px dashed var(--bj-line)" }}
            >
              <Library size={16} style={{ color: "var(--bj-ink4)" }} />
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)" }}>
                No books linked to this topic yet.
              </p>
              <button
                onClick={() => { setEditingBook(null); setBookFormOpen(true); }}
                className="font-sans text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
              >
                Add a book
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-5 overflow-x-auto" style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}>
              <div className="flex gap-3 items-end" style={{ minWidth: "max-content" }}>
                {topicBooks.map((book) => (
                  <div key={book.id} className="flex flex-col gap-1.5 items-center">
                    <BookSpine book={book} onEdit={() => handleEditBook(book)} />
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="bj-btn-icon w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100"
                      style={{ color: "var(--bj-ink4)" }}
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => { setEditingBook(null); setBookFormOpen(true); }}
                  className="bj-btn-ghost rounded-lg flex items-center justify-center shrink-0"
                  style={{ width: 44, height: 148, border: "1.5px dashed var(--bj-line)", color: "var(--bj-ink4)" }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="mt-3 rounded" style={{ height: 4, background: "var(--bj-line-soft)", marginLeft: -4, marginRight: -4 }} />
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Drawers & dialogs ────────────────────────────── */}
      <InsightDrawer
        open={insightDrawerOpen}
        onClose={() => setInsightDrawerOpen(false)}
        topics={topics}
        defaultTopicId={id}
      />
      <TopicFormDialog
        open={topicEditOpen}
        onClose={() => setTopicEditOpen(false)}
        editing={topic}
      />
      <BookFormDialog
        open={bookFormOpen}
        onClose={() => { setBookFormOpen(false); setEditingBook(null); }}
        topics={topics}
        editing={editingBook}
        defaultTopicId={id}
      />
    </div>
  );
}
