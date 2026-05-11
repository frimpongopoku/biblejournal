"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Pencil, Trash2, Flame, Clock } from "lucide-react";
import { fontPairs, type FontPairId } from "@/lib/fonts";
import type { Prayer } from "@/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

function formatDate(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function BodyDisplay({
  body, fontFamily, fontStyle, fontSize, color,
}: {
  body: string; fontFamily: string; fontStyle: string; fontSize: number; color: string;
}) {
  if (!body) return null;
  const isHtml = body.trimStart().startsWith("<");
  const sharedStyle: React.CSSProperties = {
    fontFamily, fontStyle, fontSize, color, lineHeight: 1.95, letterSpacing: "0.01em",
  };
  if (isHtml) {
    return (
      <div
        className="bj-simple-editor"
        dangerouslySetInnerHTML={{ __html: body }}
        style={sharedStyle}
      />
    );
  }
  return <p style={{ whiteSpace: "pre-wrap", ...sharedStyle }}>{body}</p>;
}

interface Props {
  prayer: Prayer | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAnswered: () => void;
  fontId: FontPairId;
  fontSize: number;
}

export function PrayerFullModal({
  prayer, open, onClose, onEdit, onDelete, onMarkAnswered, fontId, fontSize,
}: Props) {
  const pair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];
  const fontFamily = `var(${pair.displayVar})`;
  const fontStyle = fontId === "dyslexic" ? "normal" : "italic";
  const isAnswered = prayer?.status === "answered";

  const accentColor = isAnswered ? "var(--bj-sage)" : "var(--bj-ember)";
  const borderColor = isAnswered
    ? "color-mix(in oklch, var(--bj-sage) 30%, transparent)"
    : "var(--bj-line)";
  const borderSoft = isAnswered
    ? "color-mix(in oklch, var(--bj-sage) 18%, transparent)"
    : "var(--bj-line-soft)";

  return (
    <AnimatePresence>
      {open && prayer && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          {/* Sheet: bottom on mobile, centered on desktop */}
          <motion.div
            key="modal"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ ease: EASE_OUT, duration: 0.32 }}
            className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="w-full flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
              style={{
                maxWidth: 720,
                height: "92dvh",
                maxHeight: "92dvh",
                background: "var(--bj-bg-panel)",
                border: `1px solid ${borderColor}`,
                boxShadow: "0 -8px 60px color-mix(in oklch, var(--bj-ink) 18%, transparent), 0 32px 80px color-mix(in oklch, var(--bj-ink) 24%, transparent)",
                pointerEvents: "auto",
              }}
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-0 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
              </div>

              {/* Header */}
              <div
                className="flex items-start gap-4 px-6 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b shrink-0"
                style={{ borderColor: borderSoft }}
              >
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: isAnswered
                      ? "var(--bj-sage-tint)"
                      : "color-mix(in oklch, var(--bj-ember) 12%, var(--bj-bg))",
                  }}
                >
                  {isAnswered
                    ? <CheckCircle2 size={20} style={{ color: accentColor }} />
                    : <Flame size={20} style={{ color: accentColor }} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-sans font-semibold leading-snug mb-1.5"
                    style={{ fontSize: "clamp(1.1rem, 3vw, 1.35rem)", color: "var(--bj-ink)" }}
                  >
                    {prayer.title}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {isAnswered ? (
                      <span className="font-sans text-xs font-medium" style={{ color: accentColor }}>
                        Answered · {formatDate(prayer.answeredAt ?? prayer.updatedAt)}
                      </span>
                    ) : (
                      <>
                        <Clock size={11} style={{ color: "var(--bj-ink4)" }} />
                        <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                          Since {formatDate(prayer.createdAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="bj-btn-icon w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ color: "var(--bj-ink4)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
                {prayer.body ? (
                  <BodyDisplay
                    body={prayer.body}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fontSize={Math.max(fontSize, 16)}
                    color="var(--bj-ink2)"
                  />
                ) : (
                  <p className="font-sans text-sm italic" style={{ color: "var(--bj-ink4)" }}>
                    No prayer text recorded.
                  </p>
                )}

                {/* Testimony */}
                {isAnswered && prayer.testimony && (
                  <div
                    className="mt-6 px-5 py-4 rounded-2xl"
                    style={{
                      background: "var(--bj-sage-tint)",
                      border: "1px solid color-mix(in oklch, var(--bj-sage) 25%, transparent)",
                    }}
                  >
                    <p
                      className="font-sans text-[10px] uppercase tracking-widest mb-2 font-semibold"
                      style={{ color: "var(--bj-sage)" }}
                    >
                      Testimony
                    </p>
                    <BodyDisplay
                      body={prayer.testimony}
                      fontFamily={fontFamily}
                      fontStyle={fontStyle}
                      fontSize={Math.max(fontSize - 1, 14)}
                      color="var(--bj-ink2)"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex flex-wrap items-center gap-2 px-6 sm:px-8 py-4 sm:py-5 border-t shrink-0"
                style={{
                  borderColor: borderSoft,
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                {!isAnswered && (
                  <button
                    onClick={() => { onClose(); onMarkAnswered(); }}
                    className="bj-chip font-sans text-sm px-5 py-3 rounded-xl flex items-center gap-2 min-h-[44px]"
                    style={{
                      background: "var(--bj-gold-tint)",
                      color: "var(--bj-gold-deep)",
                      border: "1px solid var(--bj-gold-soft)",
                    }}
                  >
                    <CheckCircle2 size={14} /> Mark answered
                  </button>
                )}
                <button
                  onClick={() => { onClose(); onEdit(); }}
                  className="bj-chip font-sans text-sm px-5 py-3 rounded-xl flex items-center gap-2 min-h-[44px]"
                  style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => { onClose(); onDelete(); }}
                  className="bj-chip font-sans text-sm px-5 py-3 rounded-xl flex items-center gap-2 min-h-[44px]"
                  style={{
                    color: "var(--bj-ember)",
                    border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                    background: "color-mix(in oklch, var(--bj-ember) 8%, transparent)",
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
