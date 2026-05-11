"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, CheckCircle2, Clock } from "lucide-react";
import { FontSizePopover } from "@/components/shared/FontSizePopover";
import { usePrayers } from "@/hooks/usePrayers";
import { createPrayer } from "@/services/prayer.service";
import { useAuthStore } from "@/store/auth.store";
import type { FontPairId } from "@/lib/fonts";
import type { Prayer } from "@/types";

const PRAYER_FONT_KEY = "bj-prayer-font";
const PRAYER_SIZE_KEY = "bj-prayer-size";

function getPrayerFont(): FontPairId {
  if (typeof window === "undefined") return "classic";
  return (localStorage.getItem(PRAYER_FONT_KEY) as FontPairId) ?? "classic";
}
function getPrayerSize(): number {
  if (typeof window === "undefined") return 16;
  return Number(localStorage.getItem(PRAYER_SIZE_KEY)) || 16;
}

function formatDate(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysSince(date: Date): number {
  return Math.max(1, Math.floor((Date.now() - date.getTime()) / 86400000));
}

const TABS = ["All", "Praying", "Answered"];

function PrayerCard({ prayer, onClick }: { prayer: Prayer; onClick: () => void }) {
  const isAnswered = prayer.status === "answered";
  const streak = isAnswered ? null : daysSince(prayer.createdAt);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bj-list-row rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--bj-bg-panel)",
        border: `1px solid ${isAnswered ? "color-mix(in oklch, var(--bj-sage) 30%, transparent)" : "var(--bj-line-soft)"}`,
        boxShadow: "0 1px 4px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
        transition: "box-shadow 0.15s ease",
      }}
    >
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: isAnswered ? "var(--bj-sage-tint)" : "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
            }}
          >
            {isAnswered
              ? <CheckCircle2 size={16} style={{ color: "var(--bj-sage)" }} />
              : <Flame size={16} style={{ color: "var(--bj-ember)" }} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-medium mb-0.5 leading-snug" style={{ color: "var(--bj-ink)" }}>
              {prayer.title || <span style={{ color: "var(--bj-ink4)", fontStyle: "italic" }}>Untitled prayer</span>}
            </p>
            <div className="flex items-center gap-1.5">
              {isAnswered ? (
                <span className="font-sans text-xs" style={{ color: "var(--bj-sage)" }}>
                  Answered · {formatDate(prayer.answeredAt ?? prayer.updatedAt)}
                </span>
              ) : (
                <>
                  <Clock size={10} style={{ color: "var(--bj-ink4)" }} />
                  <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                    Since {formatDate(prayer.createdAt)}
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
      </div>
    </motion.div>
  );
}

export default function PrayerPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { prayers, loading } = usePrayers();

  const [tab, setTab] = useState("All");
  const [creating, setCreating] = useState(false);
  const [prayerFontId, setPrayerFontId] = useState<FontPairId>(getPrayerFont);
  const [prayerFontSize, setPrayerFontSize] = useState<number>(getPrayerSize);

  function handleFontChange(id: FontPairId) { setPrayerFontId(id); localStorage.setItem(PRAYER_FONT_KEY, id); }
  function handleSizeChange(s: number) { setPrayerFontSize(s); localStorage.setItem(PRAYER_SIZE_KEY, String(s)); }

  const active = prayers.filter((p) => p.status === "active");
  const answered = prayers.filter((p) => p.status === "answered");
  const filtered =
    tab === "All" ? prayers.filter((p) => p.status !== "archived")
    : tab === "Praying" ? active
    : answered;

  async function handleNew() {
    if (!user || creating) return;
    setCreating(true);
    const id = await createPrayer(user.uid, "", "");
    router.push(`/prayer/${id}`);
  }

  return (
    <div className="min-h-full w-full px-4 md:px-14 py-8 md:py-10" style={{ background: "var(--bj-bg)" }}>
      <div className="max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display" style={{ fontSize: "clamp(1.6rem, 5vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400 }}>
              Prayer Journal
            </h1>
            <p className="font-sans text-sm mt-1" style={{ color: "var(--bj-ink3)" }}>
              {active.length} active &middot; {answered.length} answered
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <FontSizePopover fontId={prayerFontId} fontSize={prayerFontSize} onFont={handleFontChange} onSize={handleSizeChange} />
            <button
              onClick={handleNew}
              disabled={creating}
              className="bj-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
              style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{creating ? "Opening…" : "New Prayer"}</span>
              <span className="sm:hidden">{creating ? "…" : "New"}</span>
            </button>
          </div>
        </motion.div>

        <div className="flex gap-1 mb-7 p-1 rounded-xl w-full sm:w-fit" style={{ background: "var(--bj-bg-soft)" }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="bj-chip font-sans text-sm px-4 py-2 rounded-lg min-h-[38px] flex-1 sm:flex-none"
              style={{
                background: tab === t ? "var(--bj-bg-panel)" : "transparent",
                color: tab === t ? "var(--bj-ink)" : "var(--bj-ink3)",
                fontWeight: tab === t ? 500 : 400,
                boxShadow: tab === t ? "0 1px 4px color-mix(in oklch, var(--bj-ink) 8%, transparent)" : "none",
              }}
            >{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>Loading…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 gap-4"
                >
                  <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                    {prayers.length === 0 ? "No prayers yet" : tab === "Praying" ? "Nothing active" : "No answered prayers yet"}
                  </p>
                  {prayers.length === 0 && (
                    <button onClick={handleNew} disabled={creating}
                      className="bj-btn-primary font-sans text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60"
                      style={{ background: "var(--bj-gold)", color: "white" }}
                    >
                      <Plus size={13} /> Add your first prayer
                    </button>
                  )}
                </motion.div>
              ) : (
                filtered.map((p) => (
                  <PrayerCard key={p.id} prayer={p} onClick={() => router.push(`/prayer/${p.id}`)} />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
