"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Flame, CheckCircle2, Clock, Pencil, Trash2, X,
} from "lucide-react";
import { fontPairs, type FontPairId } from "@/lib/fonts";
import { FontSizePopover } from "@/components/shared/FontSizePopover";
import { usePrayers } from "@/hooks/usePrayers";

const PRAYER_FONT_KEY = "bj-prayer-font";
const PRAYER_SIZE_KEY = "bj-prayer-size";
const PRAYER_SIZES = [
  { label: "S", value: 14 },
  { label: "M", value: 16 },
  { label: "L", value: 19 },
  { label: "XL", value: 23 },
];

function getPrayerFont(): FontPairId {
  if (typeof window === "undefined") return "classic";
  return (localStorage.getItem(PRAYER_FONT_KEY) as FontPairId) ?? "classic";
}
function getPrayerSize(): number {
  if (typeof window === "undefined") return 16;
  return Number(localStorage.getItem(PRAYER_SIZE_KEY)) || 16;
}

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

// ── Inline new-prayer card ──────────────────────────────────────────────────

interface NewCardProps {
  onSave: (title: string, body: string) => Promise<void>;
  onCancel: () => void;
  fontId: FontPairId;
  fontSize: number;
}

function NewPrayerCard({ onSave, onCancel, fontId, fontSize }: NewCardProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const pair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim(), body.trim());
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden col-span-full md:col-span-1"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-gold-soft)",
        boxShadow: "0 0 0 3px color-mix(in oklch, var(--bj-gold) 12%, transparent), 0 4px 24px color-mix(in oklch, var(--bj-ink) 8%, transparent)",
      }}
    >
      <div className="px-5 py-4">
        {/* Icon + title input */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))" }}
          >
            <Flame size={15} style={{ color: "var(--bj-ember)" }} />
          </div>
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKey}
            placeholder="What are you praying about?"
            className="flex-1 bg-transparent outline-none font-sans text-sm font-medium min-w-0"
            style={{ color: "var(--bj-ink)" }}
          />
          <button
            onClick={onCancel}
            className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ color: "var(--bj-ink4)" }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Body textarea */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Write your prayer…"
          rows={3}
          className="w-full bg-transparent outline-none resize-none leading-relaxed ml-11"
          style={{
            fontFamily: `var(${pair.displayVar})`,
            fontStyle: fontId === "dyslexic" ? "normal" : "italic",
            fontSize,
            color: "var(--bj-ink2)",
            fontWeight: 400,
            width: "calc(100% - 2.75rem)",
          }}
        />

        {/* Actions */}
        <div
          className="flex gap-2 mt-3 pt-3 border-t"
          style={{ borderColor: "var(--bj-line-soft)" }}
        >
          <button
            onClick={onCancel}
            className="bj-btn-ghost font-sans text-sm px-4 py-2.5 rounded-xl"
            style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="bj-btn-primary font-sans text-sm px-5 py-2.5 rounded-xl disabled:opacity-50 flex-1"
            style={{ background: "var(--bj-gold)", color: "white" }}
          >
            {saving ? "Saving…" : "Add Prayer"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PrayerPage() {
  const user = useAuthStore((s) => s.user);
  const { prayers, loading } = usePrayers();

  const [tab, setTab] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newCard, setNewCard] = useState(false);

  const [prayerFontId, setPrayerFontId] = useState<FontPairId>(getPrayerFont);
  const [prayerFontSize, setPrayerFontSize] = useState<number>(getPrayerSize);

  function handleFontChange(id: FontPairId) {
    setPrayerFontId(id);
    localStorage.setItem(PRAYER_FONT_KEY, id);
  }
  function handleSizeChange(s: number) {
    setPrayerFontSize(s);
    localStorage.setItem(PRAYER_SIZE_KEY, String(s));
  }

  const prayerPair = fontPairs.find((f) => f.id === prayerFontId) ?? fontPairs[0];

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Prayer | null>(null);

  const [testimonyOpen, setTestimonyOpen] = useState(false);
  const [testimonyTarget, setTestimonyTarget] = useState<Prayer | null>(null);

  const active = prayers.filter((p) => p.status === "active");
  const answered = prayers.filter((p) => p.status === "answered");

  const filtered =
    tab === "All"
      ? prayers.filter((p) => p.status !== "archived")
      : tab === "Praying"
      ? active
      : answered;

  async function handleCreatePrayer(title: string, body: string) {
    if (!user) return;
    const id = await createPrayer(user.uid, title, body);
    setNewCard(false);
    setExpanded(id);
  }

  function openEdit(p: Prayer, e: React.MouseEvent) {
    e.stopPropagation();
    setEditTarget(p);
    setEditDialogOpen(true);
  }

  async function handleSaveEdit(title: string, body: string) {
    if (!user || !editTarget) return;
    await updatePrayer(user.uid, editTarget.id, { title, body });
  }

  function openTestimony(p: Prayer, e: React.MouseEvent) {
    e.stopPropagation();
    setTestimonyTarget(p);
    setTestimonyOpen(true);
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
        className="min-h-full w-full px-4 md:px-14 py-8 md:py-10"
        style={{ background: "var(--bj-bg)" }}
      >
        <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <h1
              className="font-display"
              style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400 }}
            >
              Prayer Journal
            </h1>
            <p className="font-sans text-sm mt-1" style={{ color: "var(--bj-ink3)" }}>
              {active.length} active &middot; {answered.length} answered
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <FontSizePopover
              fontId={prayerFontId} fontSize={prayerFontSize}
              onFont={handleFontChange} onSize={handleSizeChange}
            />
            <button
              onClick={() => { setNewCard(true); setTab("All"); }}
              className="bj-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: "var(--bj-gold)",
                color: "white",
                boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)",
              }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Prayer</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-7 p-1 rounded-xl w-full sm:w-fit"
          style={{ background: "var(--bj-bg-soft)" }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-active={tab === t || undefined}
              className="bj-chip font-sans text-sm px-4 py-2 rounded-lg min-h-[38px] flex-1 sm:flex-none"
              style={{
                background: tab === t ? "var(--bj-bg-panel)" : "transparent",
                color: tab === t ? "var(--bj-ink)" : "var(--bj-ink3)",
                fontWeight: tab === t ? 500 : 400,
                boxShadow: tab === t
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout" initial={false}>

              {/* Inline new-prayer card */}
              {newCard && (
                <NewPrayerCard
                  key="new-card"
                  onSave={handleCreatePrayer}
                  onCancel={() => setNewCard(false)}
                  fontId={prayerFontId}
                  fontSize={prayerFontSize}
                />
              )}

              {filtered.length === 0 && !newCard ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 gap-4"
                >
                  <p
                    className="font-display italic text-xl"
                    style={{ color: "var(--bj-ink4)", fontWeight: 300 }}
                  >
                    {prayers.length === 0
                      ? "No prayers yet"
                      : tab === "Praying"
                      ? "Nothing active"
                      : "No answered prayers yet"}
                  </p>
                  {prayers.length === 0 && (
                    <button
                      onClick={() => setNewCard(true)}
                      className="bj-btn-primary font-sans text-sm px-4 py-2.5 rounded-xl flex items-center gap-2"
                      style={{ background: "var(--bj-gold)", color: "white" }}
                    >
                      <Plus size={13} /> Add your first prayer
                    </button>
                  )}
                </motion.div>
              ) : (
                filtered.map((p, i) => {
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
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      onClick={() => setExpanded(isExpanded ? null : p.id)}
                      className="bj-list-row rounded-2xl overflow-hidden"
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
                        {/* Card header */}
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              background: isAnswered
                                ? "var(--bj-sage-tint)"
                                : "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                            }}
                          >
                            {isAnswered
                              ? <CheckCircle2 size={16} style={{ color: "var(--bj-sage)" }} />
                              : <Flame size={16} style={{ color: "var(--bj-ember)" }} />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="font-sans text-sm font-medium mb-0.5 leading-snug"
                              style={{ color: "var(--bj-ink)" }}
                            >
                              {p.title}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {isAnswered ? (
                                <span className="font-sans text-xs" style={{ color: "var(--bj-sage)" }}>
                                  Answered · {formatDate(p.answeredAt ?? p.updatedAt)}
                                </span>
                              ) : (
                                <>
                                  <Clock size={10} style={{ color: "var(--bj-ink4)" }} />
                                  <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                                    Since {formatDate(p.createdAt)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {!isAnswered && streak !== null && (
                            <span
                              className="font-sans text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
                              style={{
                                background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                                color: "var(--bj-ember)",
                                border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                              }}
                            >
                              {streak}d
                            </span>
                          )}
                        </div>

                        {/* Expanded body */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <p
                                className="leading-relaxed mt-4 pt-4 border-t"
                                style={{
                                  borderColor: isAnswered
                                    ? "color-mix(in oklch, var(--bj-sage) 20%, transparent)"
                                    : "var(--bj-line-soft)",
                                  fontFamily: `var(${prayerPair.displayVar})`,
                                  fontStyle: prayerFontId === "dyslexic" ? "normal" : "italic",
                                  fontSize: prayerFontSize,
                                  color: "var(--bj-ink2)",
                                  fontWeight: 400,
                                }}
                              >
                                {p.body}
                              </p>

                              {/* Testimony block */}
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
                                    className="leading-relaxed"
                                    style={{
                                      fontFamily: `var(${prayerPair.displayVar})`,
                                      fontStyle: prayerFontId === "dyslexic" ? "normal" : "italic",
                                      fontSize: Math.max(prayerFontSize - 2, 13),
                                      color: "var(--bj-ink2)",
                                      fontWeight: 400,
                                    }}
                                  >
                                    {p.testimony}
                                  </p>
                                </div>
                              )}

                              {/* Actions row — all on mobile, no hover needed */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {!isAnswered && (
                                  <button
                                    onClick={(e) => openTestimony(p, e)}
                                    className="bj-chip font-sans text-xs px-3 py-2.5 rounded-xl flex-1 flex items-center justify-center gap-1.5 min-h-[40px]"
                                    style={{
                                      background: "var(--bj-gold-tint)",
                                      color: "var(--bj-gold-deep)",
                                      border: "1px solid var(--bj-gold-soft)",
                                    }}
                                  >
                                    <CheckCircle2 size={12} /> Mark answered
                                  </button>
                                )}
                                <button
                                  onClick={(e) => openEdit(p, e)}
                                  className="bj-chip font-sans text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 min-h-[40px]"
                                  style={{
                                    color: "var(--bj-ink3)",
                                    border: "1px solid var(--bj-line-soft)",
                                  }}
                                >
                                  <Pencil size={12} /> Edit
                                </button>
                                <button
                                  onClick={(e) => handleDelete(p, e)}
                                  className="bj-chip font-sans text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 min-h-[40px]"
                                  style={{
                                    color: "var(--bj-ember)",
                                    border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                                    background: "color-mix(in oklch, var(--bj-ember) 8%, transparent)",
                                  }}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}
        </div>{/* end max-w-3xl */}
      </div>

      {/* Edit dialog (bottom sheet) */}
      <PrayerDialog
        open={editDialogOpen}
        prayer={editTarget}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Testimony bottom sheet */}
      <TestimonyDialog
        open={testimonyOpen}
        prayer={testimonyTarget}
        onClose={() => setTestimonyOpen(false)}
        onConfirm={handleMarkAnswered}
      />
    </>
  );
}
