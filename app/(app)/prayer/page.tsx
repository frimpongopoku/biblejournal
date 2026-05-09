"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, CheckCircle2, Clock, Pencil, Trash2 } from "lucide-react";
import { usePrayers } from "@/hooks/usePrayers";
import {
  createPrayer,
  updatePrayer,
  markAnswered,
  deletePrayer,
} from "@/services/prayer.service";
import { useAuthStore } from "@/store/auth.store";
import { PrayerDialog } from "@/components/prayer/PrayerDialog";
import { TestimonyDialog } from "@/components/prayer/TestimonyDialog";
import type { Prayer } from "@/types";

const TABS = ["All", "Praying", "Answered"];

function daysSince(date: Date): number {
  return Math.max(1, Math.floor((Date.now() - date.getTime()) / 86400000));
}

function formatDate(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PrayerPage() {
  const user = useAuthStore((s) => s.user);
  const { prayers, loading } = usePrayers();

  const [tab, setTab] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Prayer | null>(null);

  const [testimonyDialogOpen, setTestimonyDialogOpen] = useState(false);
  const [testimonyTarget, setTestimonyTarget] = useState<Prayer | null>(null);

  const active = prayers.filter((p) => p.status === "active");
  const answered = prayers.filter((p) => p.status === "answered");

  const filtered =
    tab === "All"
      ? prayers.filter((p) => p.status !== "archived")
      : tab === "Praying"
      ? active
      : answered;

  function openNew() {
    setEditTarget(null);
    setPrayerDialogOpen(true);
  }

  function openEdit(p: Prayer, e: React.MouseEvent) {
    e.stopPropagation();
    setEditTarget(p);
    setPrayerDialogOpen(true);
  }

  function openTestimony(p: Prayer, e: React.MouseEvent) {
    e.stopPropagation();
    setTestimonyTarget(p);
    setTestimonyDialogOpen(true);
  }

  async function handleSavePrayer(title: string, body: string) {
    if (!user) return;
    if (editTarget) {
      await updatePrayer(user.uid, editTarget.id, { title, body });
    } else {
      const id = await createPrayer(user.uid, title, body);
      setExpanded(id);
    }
  }

  async function handleMarkAnswered(testimony: string) {
    if (!user || !testimonyTarget) return;
    await markAnswered(user.uid, testimonyTarget.id, testimony);
  }

  async function handleDelete(p: Prayer, e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) return;
    if (expanded === p.id) setExpanded(null);
    await deletePrayer(user.uid, p.id);
  }

  return (
    <>
      <div
        className="min-h-full px-6 md:px-14 py-10"
        style={{ background: "var(--bj-bg)", maxWidth: 800, margin: "0 auto" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <h1
              className="font-display"
              style={{ fontSize: "2.2rem", color: "var(--bj-ink)", fontWeight: 400 }}
            >
              Prayer Journal
            </h1>
            <p className="font-sans text-sm mt-1" style={{ color: "var(--bj-ink3)" }}>
              {active.length} active &middot; {answered.length} answered
            </p>
          </div>
          <button
            onClick={openNew}
            className="bj-btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mt-1"
            style={{
              background: "var(--bj-gold)",
              color: "white",
              boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)",
            }}
          >
            <Plus size={14} /> New Prayer
          </button>
        </motion.div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-8 p-1 rounded-xl w-fit"
          style={{ background: "var(--bj-bg-soft)" }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="bj-chip font-sans text-sm px-4 py-1.5 rounded-lg"
              data-active={tab === t || undefined}
              style={{
                background: tab === t ? "var(--bj-bg-panel)" : "transparent",
                color: tab === t ? "var(--bj-ink)" : "var(--bj-ink3)",
                fontWeight: tab === t ? 500 : 400,
                boxShadow:
                  tab === t
                    ? "0 1px 4px color-mix(in oklch, var(--bj-ink) 8%, transparent)"
                    : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
              Loading…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
              {prayers.length === 0
                ? "No prayers yet"
                : tab === "Praying"
                ? "Nothing active"
                : "No answered prayers yet"}
            </p>
            {prayers.length === 0 && (
              <button
                onClick={openNew}
                className="bj-btn-primary font-sans text-sm px-4 py-2 rounded-xl flex items-center gap-2"
                style={{ background: "var(--bj-gold)", color: "white" }}
              >
                <Plus size={13} /> Add your first prayer
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                const isExpanded = expanded === p.id;
                const isAnswered = p.status === "answered";
                const streak = isAnswered ? null : daysSince(p.createdAt);

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    onClick={() => setExpanded(isExpanded ? null : p.id)}
                    className="bj-list-row rounded-2xl overflow-hidden group"
                    style={{
                      background: "var(--bj-bg-panel)",
                      border: `1px solid ${
                        isAnswered
                          ? "color-mix(in oklch, var(--bj-sage) 30%, transparent)"
                          : "var(--bj-line-soft)"
                      }`,
                      boxShadow: isExpanded
                        ? "0 4px 24px color-mix(in oklch, var(--bj-ink) 8%, transparent)"
                        : "0 1px 4px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
                    }}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: isAnswered
                              ? "var(--bj-sage-tint)"
                              : "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                          }}
                        >
                          {isAnswered ? (
                            <CheckCircle2 size={15} style={{ color: "var(--bj-sage)" }} />
                          ) : (
                            <Flame size={15} style={{ color: "var(--bj-ember)" }} />
                          )}
                        </div>

                        {/* Title + meta */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-sans text-sm font-medium mb-0.5"
                            style={{ color: "var(--bj-ink)" }}
                          >
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2">
                            {isAnswered ? (
                              <span className="font-sans text-xs" style={{ color: "var(--bj-sage)" }}>
                                Answered · {formatDate(p.answeredAt ?? p.updatedAt)}
                              </span>
                            ) : (
                              <>
                                <Clock size={10} style={{ color: "var(--bj-ink4)" }} />
                                <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                                  Praying since {formatDate(p.createdAt)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Streak badge + card actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isAnswered && streak !== null && (
                            <span
                              className="font-sans text-[11px] px-2.5 py-1 rounded-full font-medium"
                              style={{
                                background:
                                  "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                                color: "var(--bj-ember)",
                                border:
                                  "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                              }}
                            >
                              {streak}d
                            </span>
                          )}

                          {/* Delete — visible on card hover */}
                          <button
                            onClick={(e) => handleDelete(p, e)}
                            className="bj-btn-action w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
                            data-danger
                            style={{
                              color: "var(--bj-ink4)",
                              transition: "opacity 0.15s ease, transform 0.1s ease, background 0.12s ease, color 0.12s ease",
                            }}
                            title="Delete prayer"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p
                              className="font-display italic text-base leading-relaxed mt-4 pt-4 border-t"
                              style={{
                                borderColor: isAnswered
                                  ? "color-mix(in oklch, var(--bj-sage) 20%, transparent)"
                                  : "var(--bj-line-soft)",
                                color: "var(--bj-ink2)",
                                fontWeight: 300,
                              }}
                            >
                              {p.body}
                            </p>

                            {/* Testimony */}
                            {isAnswered && p.testimony && (
                              <div
                                className="mt-3 px-4 py-3 rounded-xl"
                                style={{
                                  background: "var(--bj-sage-tint)",
                                  border: "1px solid color-mix(in oklch, var(--bj-sage) 25%, transparent)",
                                }}
                              >
                                <p
                                  className="font-sans text-[10px] uppercase tracking-widest mb-1"
                                  style={{ color: "var(--bj-sage)" }}
                                >
                                  Testimony
                                </p>
                                <p
                                  className="font-display italic text-sm leading-relaxed"
                                  style={{ color: "var(--bj-ink2)", fontWeight: 300 }}
                                >
                                  {p.testimony}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                              {!isAnswered && (
                                <button
                                  onClick={(e) => openTestimony(p, e)}
                                  className="bj-chip font-sans text-xs px-3 py-1.5 rounded-lg flex-1 flex items-center justify-center gap-1.5"
                                  style={{
                                    background: "var(--bj-gold-tint)",
                                    color: "var(--bj-gold-deep)",
                                    border: "1px solid var(--bj-gold-soft)",
                                  }}
                                >
                                  <CheckCircle2 size={11} /> Mark answered
                                </button>
                              )}
                              <button
                                onClick={(e) => openEdit(p, e)}
                                className="bj-chip font-sans text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                                style={{
                                  color: "var(--bj-ink3)",
                                  border: "1px solid var(--bj-line-soft)",
                                }}
                              >
                                <Pencil size={11} /> Edit
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <PrayerDialog
        open={prayerDialogOpen}
        prayer={editTarget}
        onClose={() => setPrayerDialogOpen(false)}
        onSave={handleSavePrayer}
      />
      <TestimonyDialog
        open={testimonyDialogOpen}
        prayer={testimonyTarget}
        onClose={() => setTestimonyDialogOpen(false)}
        onConfirm={handleMarkAnswered}
      />
    </>
  );
}
