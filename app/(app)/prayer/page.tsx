"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, CheckCircle2, Clock } from "lucide-react";
import { prayers } from "@/lib/mock-data";

const TABS = ["All", "Praying", "Answered"];

export default function PrayerPage() {
  const [tab, setTab] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(prayers[0].id);

  const filtered = tab === "All" ? prayers
    : prayers.filter((p) => p.status === (tab === "Praying" ? "praying" : "answered"));

  return (
    <div className="min-h-full px-6 md:px-14 py-10" style={{ background: "var(--bj-bg)", maxWidth: 800, margin: "0 auto" }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-10"
      >
        <div>
          <h1 className="font-display" style={{ fontSize: "2.2rem", color: "var(--bj-ink)", fontWeight: 400 }}>Prayer Journal</h1>
          <p className="font-sans text-sm mt-1" style={{ color: "var(--bj-ink3)" }}>
            {prayers.filter((p) => p.status === "praying").length} active &middot; {prayers.filter((p) => p.status === "answered").length} answered
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mt-1"
          style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
        >
          <Plus size={14} /> New Prayer
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: "var(--bj-bg-soft)" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="font-sans text-sm px-4 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: tab === t ? "var(--bj-bg-panel)" : "transparent",
              color: tab === t ? "var(--bj-ink)" : "var(--bj-ink3)",
              fontWeight: tab === t ? 500 : 400,
              boxShadow: tab === t ? "0 1px 4px color-mix(in oklch, var(--bj-ink) 8%, transparent)" : "none",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Prayer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => {
            const isExpanded = expanded === p.id;
            const isAnswered = p.status === "answered";

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                onClick={() => setExpanded(isExpanded ? null : p.id)}
                className="cursor-pointer rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: "var(--bj-bg-panel)",
                  border: `1px solid ${isAnswered ? "color-mix(in oklch, var(--bj-sage) 30%, transparent)" : "var(--bj-line-soft)"}`,
                  boxShadow: isExpanded ? "0 4px 24px color-mix(in oklch, var(--bj-ink) 8%, transparent)" : "0 1px 4px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
                }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isAnswered ? "var(--bj-sage-tint)" : "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                      }}
                    >
                      {isAnswered
                        ? <CheckCircle2 size={15} style={{ color: "var(--bj-sage)" }} />
                        : <Flame size={15} style={{ color: "var(--bj-ember)" }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium mb-0.5" style={{ color: "var(--bj-ink)" }}>{p.subject}</p>
                      <div className="flex items-center gap-2">
                        {isAnswered ? (
                          <span className="font-sans text-xs" style={{ color: "var(--bj-sage)" }}>Answered · {p.updated}</span>
                        ) : (
                          <>
                            <Clock size={10} style={{ color: "var(--bj-ink4)" }} />
                            <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                              {p.streak} day{p.streak !== 1 ? "s" : ""} · Updated {p.updated}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {!isAnswered && p.streak > 0 && (
                      <span
                        className="font-sans text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0"
                        style={{
                          background: "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                          color: "var(--bj-ember)",
                          border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                        }}
                      >
                        {p.streak}d
                      </span>
                    )}
                  </div>

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
                            borderColor: isAnswered ? "color-mix(in oklch, var(--bj-sage) 20%, transparent)" : "var(--bj-line-soft)",
                            color: "var(--bj-ink2)",
                            fontWeight: 300,
                          }}
                        >
                          {p.body}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <button
                            className="font-sans text-xs px-3 py-1.5 rounded-lg flex-1"
                            style={{
                              background: isAnswered ? "var(--bj-sage-tint)" : "var(--bj-gold-tint)",
                              color: isAnswered ? "var(--bj-sage)" : "var(--bj-gold-deep)",
                              border: `1px solid ${isAnswered ? "color-mix(in oklch, var(--bj-sage) 25%, transparent)" : "var(--bj-gold-soft)"}`,
                            }}
                          >
                            {isAnswered ? "View testimony" : "Mark answered"}
                          </button>
                          <button
                            className="font-sans text-xs px-3 py-1.5 rounded-lg"
                            style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                          >
                            Edit
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
    </div>
  );
}
