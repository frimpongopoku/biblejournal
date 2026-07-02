"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap, Plus, Lightbulb, BookOpen, ArrowRight,
  Sparkles, Library, Layers,
} from "lucide-react";
import { useLearningTopics } from "@/hooks/useLearningTopics";
import { useInsights } from "@/hooks/useInsights";
import { useLearningBooks } from "@/hooks/useLearningBooks";
import { InsightDrawer } from "@/components/learn/InsightDrawer";
import { TopicFormDialog } from "@/components/learn/TopicFormDialog";
import { BookFormDialog } from "@/components/learn/BookFormDialog";
import type { LearningTopic, Insight, LearningBook } from "@/types";

// ── Animations ────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  }),
};

// ── Source type label ─────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  book: "Book", sermon: "Sermon", bible: "Bible",
  course: "Course", conversation: "Convo", reflection: "Reflection",
};

// ── Status badge ──────────────────────────────────────────

function StatusBadge({ status }: { status: LearningTopic["status"] }) {
  const cfg = {
    active:    { label: "Active",    bg: "var(--bj-gold-tint)",   color: "var(--bj-gold-deep)", border: "var(--bj-gold-soft)" },
    paused:    { label: "Paused",    bg: "var(--bj-bg-soft)",     color: "var(--bj-ink4)",      border: "var(--bj-line-soft)" },
    completed: { label: "Completed", bg: "color-mix(in oklch, var(--bj-sage) 12%, var(--bj-bg))", color: "var(--bj-sage)", border: "color-mix(in oklch, var(--bj-sage) 30%, transparent)" },
  }[status];
  return (
    <span
      className="font-sans text-[10px] px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

// ── Topic card ────────────────────────────────────────────

function TopicCard({ topic, insightCount, bookCount }: { topic: LearningTopic; insightCount: number; bookCount: number }) {
  return (
    <Link
      href={`/learn/topics/${topic.id}`}
      className="bj-list-row flex flex-col gap-4 p-5 rounded-2xl h-full group"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line-soft)",
        boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-ink) 3%, transparent)",
      }}
    >
      {/* Color stripe + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: topic.color }} />
          <div
            className="h-1 rounded-full flex-1"
            style={{ width: 32, background: `color-mix(in oklch, ${topic.color} 35%, var(--bj-bg-soft))` }}
          />
        </div>
        <StatusBadge status={topic.status} />
      </div>

      {/* Name & description */}
      <div className="flex-1">
        <h3
          className="font-display mb-1.5"
          style={{ fontSize: "1.05rem", color: "var(--bj-ink)", fontWeight: 500, lineHeight: 1.25 }}
        >
          {topic.name}
        </h3>
        {topic.description && (
          <p
            className="font-sans text-xs leading-relaxed"
            style={{
              color: "var(--bj-ink4)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {topic.description}
          </p>
        )}
      </div>

      {/* Stats + arrow */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
          <Lightbulb size={11} />
          <span>{insightCount} {insightCount === 1 ? "insight" : "insights"}</span>
        </div>
        {bookCount > 0 && (
          <>
            <span style={{ color: "var(--bj-line)" }}>·</span>
            <div className="flex items-center gap-1 font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
              <BookOpen size={11} />
              <span>{bookCount} {bookCount === 1 ? "book" : "books"}</span>
            </div>
          </>
        )}
        <ArrowRight
          size={12}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: topic.color }}
        />
      </div>
    </Link>
  );
}

// ── Insight feed row ──────────────────────────────────────

function InsightRow({ insight, topicColor, topicName }: { insight: Insight; topicColor: string; topicName: string }) {
  return (
    <div
      className="flex gap-3 px-5 py-4"
      style={{ borderBottom: "1px solid var(--bj-line-soft)" }}
    >
      <div className="w-1 rounded-full shrink-0 mt-0.5" style={{ background: topicColor, minHeight: 36 }} />
      <div className="flex-1 min-w-0">
        <p
          className="font-sans text-sm leading-relaxed mb-2"
          style={{
            color: "var(--bj-ink2)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {insight.body}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-sans text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: "var(--bj-bg-soft)",
              color: "var(--bj-ink4)",
              border: "1px solid var(--bj-line-soft)",
            }}
          >
            {SOURCE_LABELS[insight.sourceType] ?? insight.sourceType}
          </span>
          {insight.sourceRef && (
            <span className="font-sans text-[10px]" style={{ color: "var(--bj-ink4)" }}>
              {insight.sourceRef}
            </span>
          )}
          <span className="ml-auto font-sans text-[10px]" style={{ color: "var(--bj-ink4)" }}>
            {insight.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Book spine ────────────────────────────────────────────

function BookSpine({ book }: { book: LearningBook }) {
  return (
    <div
      className="shrink-0 rounded-lg flex items-center justify-center relative overflow-hidden"
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
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────

function EmptyPortfolio({ onNewTopic }: { onNewTopic: () => void }) {
  return (
    <motion.div
      variants={fadeUp} custom={1} initial="hidden" animate="show"
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}
      >
        <GraduationCap size={24} style={{ color: "var(--bj-gold-deep)" }} />
      </div>
      <h2 className="font-display mb-2" style={{ fontSize: "1.4rem", color: "var(--bj-ink)", fontWeight: 400 }}>
        Your learning portfolio is empty
      </h2>
      <p className="font-sans text-sm mb-7 max-w-xs" style={{ color: "var(--bj-ink4)", lineHeight: 1.65 }}>
        Create a topic to start collecting what God is teaching you — books, insights, revelations, all in one place.
      </p>
      <button
        onClick={onNewTopic}
        className="bj-btn-primary flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
        style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 14px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}
      >
        <Plus size={14} />
        Create your first topic
      </button>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function LearnPage() {
  const { topics, loading: tLoading } = useLearningTopics();
  const { insights, loading: iLoading } = useInsights();
  const { books, loading: bLoading } = useLearningBooks();

  const [insightDrawerOpen, setInsightDrawerOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  const loading = tLoading || iLoading || bLoading;
  const isEmpty = !loading && topics.length === 0;

  const activeTopics = topics.filter((t) => t.status === "active");
  const otherTopics  = topics.filter((t) => t.status !== "active");
  const recentInsights = insights.slice(0, 10);
  const currentBooks   = books.filter((b) => b.status === "reading");
  const finishedBooks  = books.filter((b) => b.status === "finished");
  const shelfBooks     = [...currentBooks, ...finishedBooks];

  function insightCountForTopic(topicId: string) {
    return insights.filter((i) => i.topicId === topicId).length;
  }
  function bookCountForTopic(topicId: string) {
    return books.filter((b) => b.topicIds.includes(topicId)).length;
  }

  return (
    <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>
      <div className="mx-auto px-5 md:px-12 pt-8 md:pt-12 pb-24" style={{ maxWidth: 960 }}>

        {/* ── Header ───────────────────────────────────── */}
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show"
          className="flex items-start justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={16} style={{ color: "var(--bj-gold)" }} />
              <p className="font-sans text-xs" style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Learning Portfolio
              </p>
            </div>
            <h1 className="font-display leading-none" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "var(--bj-ink)", fontWeight: 400, letterSpacing: "-0.01em" }}>
              What you&apos;re learning.
            </h1>
          </div>
          <div className="flex items-center gap-2 pt-1 shrink-0">
            <button
              onClick={() => setInsightDrawerOpen(true)}
              disabled={topics.length === 0}
              className="bj-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: topics.length > 0 ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                color: topics.length > 0 ? "white" : "var(--bj-ink4)",
                boxShadow: topics.length > 0 ? "0 2px 14px color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "none",
              }}
            >
              <Lightbulb size={14} />
              <span className="hidden sm:inline">Add insight</span>
            </button>
            <button
              onClick={() => setTopicDialogOpen(true)}
              className="bj-btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink2)" }}
            >
              <Layers size={14} />
              <span className="hidden sm:inline">New topic</span>
            </button>
          </div>
        </motion.div>

        {/* ── Loading ───────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[180, 120, 160].map((h, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: h, background: "var(--bj-bg-soft)" }} />
            ))}
          </div>
        )}

        {/* ── Empty ─────────────────────────────────────── */}
        {isEmpty && <EmptyPortfolio onNewTopic={() => setTopicDialogOpen(true)} />}

        {/* ── Content ───────────────────────────────────── */}
        {!loading && !isEmpty && (
          <div className="flex flex-col gap-8">

            {/* Active topics */}
            {activeTopics.length > 0 && (
              <motion.section variants={fadeUp} custom={1} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                    Currently studying
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {activeTopics.map((t) => (
                    <TopicCard
                      key={t.id}
                      topic={t}
                      insightCount={insightCountForTopic(t.id)}
                      bookCount={bookCountForTopic(t.id)}
                    />
                  ))}
                  {/* New topic ghost card */}
                  <button
                    onClick={() => setTopicDialogOpen(true)}
                    className="bj-list-row flex flex-col items-center justify-center gap-2 p-5 rounded-2xl min-h-[140px]"
                    style={{
                      border: "1.5px dashed var(--bj-line)",
                      background: "transparent",
                      color: "var(--bj-ink4)",
                    }}
                  >
                    <Plus size={16} style={{ color: "var(--bj-ink4)" }} />
                    <span className="font-sans text-xs">New topic</span>
                  </button>
                </div>
              </motion.section>
            )}

            {/* Other topics (paused / completed) */}
            {otherTopics.length > 0 && (
              <motion.section variants={fadeUp} custom={2} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                    Other topics
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {otherTopics.map((t) => (
                    <TopicCard
                      key={t.id}
                      topic={t}
                      insightCount={insightCountForTopic(t.id)}
                      bookCount={bookCountForTopic(t.id)}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Recent insights feed */}
            {recentInsights.length > 0 && (
              <motion.section variants={fadeUp} custom={3} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                    Recent insights
                  </h2>
                  <button
                    onClick={() => setInsightDrawerOpen(true)}
                    className="bj-chip font-sans text-xs flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ color: "var(--bj-gold-deep)" }}
                  >
                    <Plus size={10} /> Capture one
                  </button>
                </div>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
                >
                  {recentInsights.map((insight) => {
                    const topic = topics.find((t) => t.id === insight.topicId);
                    return (
                      <InsightRow
                        key={insight.id}
                        insight={insight}
                        topicColor={topic?.color ?? "var(--bj-gold)"}
                        topicName={topic?.name ?? ""}
                      />
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* Bookshelf */}
            {shelfBooks.length > 0 && (
              <motion.section variants={fadeUp} custom={4} initial="hidden" animate="show">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
                    Bookshelf
                  </h2>
                  <button
                    onClick={() => setBookDialogOpen(true)}
                    className="bj-chip font-sans text-xs flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ color: "var(--bj-gold-deep)" }}
                  >
                    <Plus size={10} /> Add book
                  </button>
                </div>
                <div
                  className="rounded-2xl p-5 overflow-x-auto"
                  style={{ background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <div className="flex gap-3 items-end" style={{ minWidth: "max-content" }}>
                    {/* Shelf surface */}
                    {shelfBooks.map((book) => (
                      <BookSpine key={book.id} book={book} />
                    ))}
                    {/* Add book ghost spine */}
                    <button
                      onClick={() => setBookDialogOpen(true)}
                      className="bj-btn-ghost rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        width: 44,
                        height: 148,
                        border: "1.5px dashed var(--bj-line)",
                        color: "var(--bj-ink4)",
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {/* Shelf ledge */}
                  <div
                    className="mt-3 rounded"
                    style={{ height: 4, background: "var(--bj-line-soft)", marginLeft: -4, marginRight: -4 }}
                  />
                </div>
              </motion.section>
            )}

            {/* No insights yet — prompt */}
            {recentInsights.length === 0 && topics.length > 0 && (
              <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show">
                <div
                  className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4"
                  style={{ background: "var(--bj-bg-panel)", border: "1.5px dashed var(--bj-line)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[11px] mb-1 uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>
                      Capture your first insight
                    </p>
                    <p className="font-display italic" style={{ fontSize: "1.05rem", color: "var(--bj-ink3)", fontWeight: 300 }}>
                      What has God been showing you lately?
                    </p>
                  </div>
                  <button
                    onClick={() => setInsightDrawerOpen(true)}
                    className="bj-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shrink-0"
                    style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
                  >
                    <Sparkles size={14} /> Write insight
                  </button>
                </div>
              </motion.div>
            )}

            {/* No books — prompt */}
            {shelfBooks.length === 0 && topics.length > 0 && (
              <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show">
                <div
                  className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4"
                  style={{ background: "var(--bj-bg-panel)", border: "1.5px dashed var(--bj-line)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[11px] mb-1 uppercase tracking-widest" style={{ color: "var(--bj-ink4)" }}>
                      Your bookshelf
                    </p>
                    <p className="font-display italic" style={{ fontSize: "1.05rem", color: "var(--bj-ink3)", fontWeight: 300 }}>
                      Track the books shaping your faith.
                    </p>
                  </div>
                  <button
                    onClick={() => setBookDialogOpen(true)}
                    className="bj-btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shrink-0"
                    style={{ border: "1px solid var(--bj-line)", color: "var(--bj-ink2)" }}
                  >
                    <Library size={14} /> Add a book
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── Drawers & dialogs ────────────────────────────── */}
      <InsightDrawer
        open={insightDrawerOpen}
        onClose={() => setInsightDrawerOpen(false)}
        topics={topics}
      />
      <TopicFormDialog
        open={topicDialogOpen}
        onClose={() => setTopicDialogOpen(false)}
      />
      <BookFormDialog
        open={bookDialogOpen}
        onClose={() => setBookDialogOpen(false)}
        topics={topics}
      />
    </div>
  );
}
