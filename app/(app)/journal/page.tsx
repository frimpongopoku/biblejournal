"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Star, Search, Plus, Trash2, ChevronLeft, List, X, PanelLeftClose, PanelLeftOpen, Table2, Smile } from "lucide-react";
import { FloatingBible, FloatingAsk, JournalFloatTriggers } from "@/components/journal/FloatingWindows";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { createEntry, updateEntry, deleteEntry } from "@/services/journal.service";
import { useAuthStore } from "@/store/auth.store";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import type { JournalEntry } from "@/types";

const FILTERS = ["All", "Pinned", "Favorites"];

function formatDate(d: Date): string {
  const now = new Date();
  const diff = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractExcerpt(content: string, maxLen = 110): string {
  try {
    const doc = JSON.parse(content);
    const parts: string[] = [];
    const walk = (node: { text?: string; content?: typeof node[] }) => {
      if (node.text) parts.push(node.text);
      if (node.content) node.content.forEach(walk);
    };
    walk(doc);
    const full = parts.join(" ").trim();
    return full.length > maxLen ? full.slice(0, maxLen) + "…" : full;
  } catch {
    return "";
  }
}

// ── Tag editor ────────────────────────────────────────────

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      commit(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 cursor-text" onClick={() => inputRef.current?.focus()}
      style={{ maxWidth: 680 }}>
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full font-sans"
          style={{ fontSize: 12, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
          #{tag}
          <button
            onMouseDown={(e) => { e.preventDefault(); onChange(tags.filter((t) => t !== tag)); }}
            className="flex items-center justify-center rounded-full ml-0.5"
            style={{ color: "var(--bj-gold-deep)", opacity: 0.6, lineHeight: 1 }}
          >
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) commit(input); }}
        placeholder={tags.length === 0 ? "Add tags…" : "+tag"}
        className="bg-transparent outline-none font-sans text-xs"
        style={{
          color: "var(--bj-ink4)",
          caretColor: "var(--bj-gold)",
          width: input ? `${Math.max(48, input.length * 8)}px` : tags.length === 0 ? "72px" : "42px",
          minWidth: 32,
          transition: "width 0.1s ease",
        }}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────

function DeleteConfirmModal({ entry, onConfirm, onCancel }: {
  entry: JournalEntry;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onConfirm();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onConfirm, onCancel]);

  return (
    <>
      <motion.div key="del-bd" className="fixed inset-0 z-50"
        style={{ background: "color-mix(in oklch, var(--bj-ink) 40%, transparent)", backdropFilter: "blur(3px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onCancel} />

      <motion.div key="del-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
        <motion.div
          className="w-full rounded-2xl overflow-hidden"
          style={{
            maxWidth: 380, pointerEvents: "auto",
            background: "var(--bj-bg-panel)",
            border: "1px solid var(--bj-line)",
            boxShadow: "0 24px 60px color-mix(in oklch, var(--bj-ink) 22%, transparent)",
          }}
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.2 }}
        >
          <div className="px-6 pt-6 pb-5">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "color-mix(in oklch, var(--bj-ember) 12%, transparent)" }}>
              <Trash2 size={18} style={{ color: "var(--bj-ember)" }} />
            </div>

            <h2 className="font-display text-xl mb-1" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
              Delete this entry?
            </h2>
            <p className="font-sans text-sm mb-1" style={{ color: "var(--bj-ink2)", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 500 }}>{entry.title || "Untitled"}</span>
            </p>
            <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", lineHeight: 1.6 }}>
              This can&apos;t be undone. All writing, tags, and feelings for this entry will be permanently deleted.
            </p>
          </div>

          <div className="flex gap-2 px-6 pb-6">
            <button onClick={onCancel}
              className="bj-btn-ghost flex-1 font-sans text-sm py-2.5 rounded-xl"
              style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}>
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 font-sans text-sm py-2.5 rounded-xl font-medium transition-all duration-150"
              style={{ background: "var(--bj-ember)", color: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}>
              Delete forever
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ── Feeling data ──────────────────────────────────────────

const FEELINGS = [
  { emoji: "😊", label: "Grateful" },
  { emoji: "🙏", label: "Prayerful" },
  { emoji: "✨", label: "Inspired" },
  { emoji: "😌", label: "Peaceful" },
  { emoji: "🔥", label: "Excited" },
  { emoji: "🤔", label: "Reflective" },
  { emoji: "😔", label: "Heavy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "💪", label: "Determined" },
];

function feelingByLabel(label?: string) {
  return FEELINGS.find((f) => f.label === label);
}

// ── Feeling picker modal ──────────────────────────────────

function FeelingPicker({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const preset = feelingByLabel(value);
  const isCustom = value && !preset;

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Focus custom input when user starts typing in the modal
  function saveCustom() {
    const trimmed = custom.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setCustom("");
    setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title={value ? `Feeling: ${value}` : "How are you feeling?"}
        className="bj-btn-action flex items-center gap-1.5 px-2 py-1 rounded-lg"
        style={{
          background: value ? "var(--bj-gold-tint)" : "transparent",
          color: value ? "var(--bj-gold-deep)" : "var(--bj-ink4)",
          border: `1px solid ${value ? "var(--bj-gold-soft)" : "transparent"}`,
          fontSize: 13, transition: "all 0.12s ease",
        }}
      >
        {preset ? <span>{preset.emoji}</span> : isCustom ? <span>✍️</span> : <Smile size={13} />}
        {value && <span className="font-sans text-xs hidden sm:inline">{preset?.label ?? value}</span>}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="fp-bd" className="fixed inset-0 z-50"
              style={{ background: "color-mix(in oklch, var(--bj-ink) 35%, transparent)", backdropFilter: "blur(2px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)} />

            <motion.div key="fp-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: "none" }}>
              <motion.div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  maxWidth: 420, pointerEvents: "auto",
                  background: "var(--bj-bg-panel)",
                  border: "1px solid var(--bj-line)",
                  boxShadow: "0 24px 60px color-mix(in oklch, var(--bj-ink) 22%, transparent)",
                }}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.22 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                  <h2 className="font-display text-lg" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                    How are you feeling?
                  </h2>
                  <button onClick={() => setOpen(false)} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                    <X size={14} />
                  </button>
                </div>

                {/* Preset grid */}
                <div className="grid grid-cols-2 gap-1.5 p-4">
                  {FEELINGS.map((f) => {
                    const isActive = value === f.label;
                    return (
                      <button key={f.label}
                        onClick={() => { onChange(isActive ? undefined : f.label); setOpen(false); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-100"
                        style={{
                          background: isActive ? "var(--bj-gold-tint)" : "var(--bj-bg-soft)",
                          border: `1px solid ${isActive ? "var(--bj-gold-soft)" : "transparent"}`,
                          transform: "none",
                        }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bj-line-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bj-bg-soft)"; e.currentTarget.style.transform = "none"; } }}
                      >
                        <span style={{ fontSize: 20, lineHeight: 1 }}>{f.emoji}</span>
                        <span className="font-sans text-sm" style={{ color: isActive ? "var(--bj-gold-deep)" : "var(--bj-ink2)", fontWeight: isActive ? 500 : 400 }}>
                          {f.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
                  <p className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-2 mt-3" style={{ color: "var(--bj-ink4)" }}>
                    Or describe it yourself
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveCustom(); }}
                      placeholder="Overwhelmed, grateful beyond words…"
                      className="flex-1 bg-transparent outline-none font-sans text-sm px-3 py-2 rounded-xl"
                      style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)", color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }}
                    />
                    <button onClick={saveCustom} disabled={!custom.trim()}
                      className="font-sans text-sm px-3 py-2 rounded-xl disabled:opacity-40 transition-all"
                      style={{ background: "var(--bj-gold)", color: "white" }}>
                      Set
                    </button>
                  </div>
                </div>

                {/* Clear */}
                {value && (
                  <button onClick={() => { onChange(undefined); setOpen(false); }}
                    className="w-full font-sans text-xs py-3 border-t"
                    style={{ color: "var(--bj-ink4)", borderColor: "var(--bj-line-soft)" }}>
                    Clear feeling
                  </button>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Table view ────────────────────────────────────────────

function TableView({ entries, onSelect }: { entries: JournalEntry[]; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>No entries match</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-soft)" }}>
            {["Title", "Feeling", "Date", "Tags"].map((h) => (
              <th key={h} className="text-left font-sans text-[10px] uppercase tracking-widest font-semibold px-4 py-2.5"
                style={{ color: "var(--bj-ink4)", whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const feeling = feelingByLabel(entry.feeling);
            const isHov = hovered === entry.id;
            return (
              <tr
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                onMouseEnter={() => setHovered(entry.id)}
                onMouseLeave={() => setHovered(null)}
                className="border-b cursor-pointer"
                style={{
                  borderColor: "var(--bj-line-soft)",
                  background: isHov ? "var(--bj-bg-soft)" : "transparent",
                  transition: "background 0.1s ease",
                }}
              >
                {/* Title */}
                <td className="px-4 py-3" style={{ maxWidth: 360 }}>
                  <div className="flex items-center gap-2">
                    {entry.isPinned && <Pin size={10} style={{ color: "var(--bj-gold)", flexShrink: 0 }} />}
                    <span className="font-sans text-sm font-medium truncate" style={{ color: "var(--bj-ink)" }}>
                      {entry.title || <span style={{ color: "var(--bj-ink4)", fontWeight: 400 }}>Untitled</span>}
                    </span>
                  </div>
                  <p className="font-sans text-xs mt-0.5 truncate" style={{ color: "var(--bj-ink4)", maxWidth: 320 }}>
                    {extractExcerpt(entry.content, 60)}
                  </p>
                </td>

                {/* Feeling */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {feeling ? (
                    <span className="flex items-center gap-1.5">
                      <span style={{ fontSize: 14 }}>{feeling.emoji}</span>
                      <span className="font-sans text-xs" style={{ color: "var(--bj-ink3)" }}>{feeling.label}</span>
                    </span>
                  ) : (
                    <span style={{ color: "var(--bj-line)" }}>—</span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>{formatDate(entry.updatedAt)}</span>
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {entry.tags.slice(0, 3).map((t) => (
                      <span key={t} className="font-sans px-1.5 py-0.5 rounded-md"
                        style={{ fontSize: 10, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}>
                        #{t}
                      </span>
                    ))}
                    {entry.tags.length > 3 && (
                      <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>+{entry.tags.length - 3}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function JournalPage() {
  const user = useAuthStore((s) => s.user);
  const { entries, loading } = useJournalEntries();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showEntrySheet, setShowEntrySheet] = useState(false);
  const [bibleOpen, setBibleOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [listCompact, setListCompact] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("bj-journal-compact") === "true"
  );
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);

  function toggleListCompact() {
    const next = !listCompact;
    setListCompact(next);
    localStorage.setItem("bj-journal-compact", String(next));
  }

  // Journal-specific keyboard shortcuts (work even inside the editor)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      // ⌘⌥B — Bible panel (changed from ⌘⇧B which conflicted with browser bookmark bar)
      // Use e.code (physical key) — e.key is unreliable with Option/Alt modifiers
      // e.g. on macOS, ⌥B produces "∫" not "b"
      if (e.altKey && e.code === "KeyB") { e.preventDefault(); setBibleOpen((o) => !o); return; }
      if (!e.shiftKey) return;
      if (e.code === "KeyN") { e.preventDefault(); handleNew(); }
      if (e.code === "KeyA") { e.preventDefault(); setAskOpen((o) => !o); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoSelected = useRef(false);

  const selected = entries.find((e) => e.id === selectedId) ?? null;

  // Auto-select first entry on initial load only — never re-fires when user
  // manually clears the selection (back button), because hasAutoSelected guards it.
  useEffect(() => {
    if (!loading && entries.length > 0 && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      setSelectedId(entries[0].id);
    }
  }, [loading, entries]);

  // Sync local title when selection changes
  useEffect(() => {
    if (selected) setLocalTitle(selected.title);
  }, [selected?.id]);

  const filtered = entries.filter((e) => {
    if (activeFilter === "Pinned" && !e.isPinned) return false;
    if (activeFilter === "Favorites" && !e.isFavorite) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        extractExcerpt(e.content).toLowerCase().includes(q) ||
        (e.feeling ?? "").toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const scheduleSave = useCallback(
    (patch: Partial<Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">>) => {
      if (!user || !selectedId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateEntry(user.uid, selectedId, patch);
      }, 1500);
    },
    [user, selectedId]
  );

  const handleTitleChange = (v: string) => {
    setLocalTitle(v);
    scheduleSave({ title: v });
  };

  const handleContentChange = (json: string) => {
    scheduleSave({ content: json });
  };

  const handleNew = async () => {
    if (!user || creating) return;
    setCreating(true);
    const id = await createEntry(user.uid);
    setSelectedId(id);
    setLocalTitle("");
    setCreating(false);
  };

  function entryHasContent(entry: JournalEntry): boolean {
    if (entry.title.trim()) return true;
    try {
      const doc = JSON.parse(entry.content);
      const parts: string[] = [];
      const walk = (node: { text?: string; content?: typeof node[] }) => {
        if (node.text) parts.push(node.text);
        if (node.content) node.content.forEach(walk);
      };
      walk(doc);
      return parts.join("").trim().length > 0;
    } catch { return false; }
  }

  function handleDeleteClick() {
    if (!selected) return;
    if (entryHasContent(selected)) {
      setDeleteTarget(selected); // show confirmation
    } else {
      confirmDelete(); // empty entry — delete immediately
    }
  }

  const confirmDelete = async () => {
    if (!user || !selectedId) return;
    setDeleteTarget(null);
    await deleteEntry(user.uid, selectedId);
    setSelectedId(entries.find((e) => e.id !== selectedId)?.id ?? null);
  };

  const handleTogglePin = () => {
    if (!user || !selected) return;
    updateEntry(user.uid, selected.id, { isPinned: !selected.isPinned });
  };

  const handleToggleFavorite = () => {
    if (!user || !selected) return;
    updateEntry(user.uid, selected.id, { isFavorite: !selected.isFavorite });
  };

  const handleFeelingChange = (feeling: string | undefined) => {
    if (!user || !selected) return;
    updateEntry(user.uid, selected.id, { feeling });
  };

  const handleTagsChange = (tags: string[]) => {
    if (!user || !selected) return;
    updateEntry(user.uid, selected.id, { tags });
  };

  return (
    <>
    <div className="flex h-full" style={{ background: "var(--bj-bg)" }}>

      {/* ── Entry List ───────────────────────────────────── */}
      {/* Mobile: full-screen list when no entry selected; hidden when editor open */}
      {/* Desktop: always visible 300px sidebar */}
      <div
        className={`${viewMode === "table" ? "hidden" : selectedId ? "hidden md:flex" : "flex"} w-full ${listCompact ? "md:w-[220px]" : "md:w-[300px]"} flex-col border-r h-full overflow-hidden shrink-0`}
        style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)", transition: "width 0.2s ease" }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>Journal</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewMode((v) => v === "table" ? "list" : "table")}
                title={viewMode === "table" ? "List view" : "Table view"}
                className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ color: viewMode === "table" ? "var(--bj-gold-deep)" : "var(--bj-ink4)", background: viewMode === "table" ? "var(--bj-gold-tint)" : "transparent" }}>
                {viewMode === "table" ? <List size={13} /> : <Table2 size={13} />}
              </button>
              <button onClick={toggleListCompact} title={listCompact ? "Expand list" : "Compact list"}
                className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                {listCompact ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
              </button>
              <button onClick={handleNew} disabled={creating}
                className="bj-btn-primary w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50"
                style={{ background: "var(--bj-gold)", boxShadow: "0 2px 8px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}>
                <Plus size={14} color="white" />
              </button>
            </div>
          </div>
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}
          >
            <Search size={12} style={{ color: "var(--bj-ink4)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries…"
              className="bg-transparent outline-none font-sans text-xs w-full"
              style={{ color: "var(--bj-ink)" }}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-5 py-3 overflow-x-auto border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              data-active={activeFilter === f || undefined}
              className="bj-chip shrink-0 font-sans text-[11px] px-3 py-1 rounded-full"
              style={{
                background: activeFilter === f ? "var(--bj-gold)" : "var(--bj-bg-soft)",
                color: activeFilter === f ? "white" : "var(--bj-ink3)",
                border: activeFilter === f ? "none" : "1px solid var(--bj-line-soft)",
                fontWeight: activeFilter === f ? 500 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="font-display italic text-base" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                {entries.length === 0 ? "No entries yet" : "No matches"}
              </p>
              {entries.length === 0 && (
                <button
                  onClick={handleNew}
                  className="font-sans text-xs px-3 py-1.5 rounded-lg mt-1"
                  style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}
                >
                  Create first entry
                </button>
              )}
            </div>
          ) : (
            filtered.map((entry) => {
              const isSelected = selectedId === entry.id;
              const excerpt = extractExcerpt(entry.content);
              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  data-active={isSelected || undefined}
                  className="bj-list-row w-full px-5 py-4 border-b"
                  style={{
                    borderColor: "var(--bj-line-soft)",
                    background: isSelected ? "var(--bj-gold-tint)" : "transparent",
                    borderLeft: isSelected ? "2px solid var(--bj-gold)" : "2px solid transparent",
                  }}
                >
                  {listCompact ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      {entry.isPinned && <Pin size={9} className="shrink-0" style={{ color: "var(--bj-gold)" }} />}
                      <p className="font-sans text-xs font-medium truncate flex-1" style={{ color: "var(--bj-ink)" }}>
                        {entry.title || <span style={{ color: "var(--bj-ink4)" }}>Untitled</span>}
                      </p>
                      {entry.feeling && <span style={{ fontSize: 11 }} title={entry.feeling}>{feelingByLabel(entry.feeling)?.emoji}</span>}
                      <span className="font-sans shrink-0" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>
                        {formatDate(entry.updatedAt)}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 mb-1.5">
                        {entry.isPinned && <Pin size={11} className="mt-0.5 shrink-0" style={{ color: "var(--bj-gold)" }} />}
                        <p className="font-sans text-sm font-medium leading-snug flex-1" style={{ color: "var(--bj-ink)" }}>
                          {entry.title || <span style={{ color: "var(--bj-ink4)" }}>Untitled</span>}
                        </p>
                        {entry.feeling && <span style={{ fontSize: 13 }} title={entry.feeling}>{feelingByLabel(entry.feeling)?.emoji}</span>}
                      </div>
                      {excerpt && (
                        <p className="font-sans text-xs mb-2"
                          style={{ color: "var(--bj-ink3)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {entry.tags.map((t) => (
                          <span key={t} className="font-sans px-1.5 py-0.5 rounded-md"
                            style={{ fontSize: 10, background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)" }}>
                            #{t}
                          </span>
                        ))}
                        <span className="font-sans ml-auto" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>
                          {formatDate(entry.updatedAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Table view (full-width, replaces editor) ────── */}
      {viewMode === "table" && (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" style={{ background: "var(--bj-bg)" }}>
          <div className="px-6 pt-5 pb-3 border-b shrink-0" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>
                All Entries <span className="font-sans text-sm ml-2" style={{ color: "var(--bj-ink4)", fontStyle: "normal" }}>({filtered.length})</span>
              </h2>
              <button onClick={() => setViewMode("list")} className="flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}>
                <List size={12} /> List view
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl max-w-md" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
              <Search size={12} style={{ color: "var(--bj-ink4)" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, feeling, tag…"
                className="bg-transparent outline-none font-sans text-xs flex-1" style={{ color: "var(--bj-ink)" }} />
              {search && <button onClick={() => setSearch("")} className="bj-btn-icon" style={{ color: "var(--bj-ink4)" }}><X size={10} /></button>}
            </div>
          </div>
          <TableView entries={filtered} onSelect={(id) => { setSelectedId(id); setViewMode("list"); }} />
        </div>
      )}

      {/* ── Entry Editor ────────────────────────────────── */}
      {/* Mobile: full-screen when entry selected; hidden otherwise */}
      <div className={`${viewMode === "table" ? "hidden" : selectedId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 h-full overflow-hidden`}>
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* ── Mobile nav bar (back + entries toggle) ── */}
              <div
                className="md:hidden flex items-center gap-1 px-3 border-b shrink-0"
                style={{ height: 48, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
              >
                <button
                  onClick={() => setSelectedId(null)}
                  className="bj-btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{ color: "var(--bj-ink2)", minHeight: 44 }}
                >
                  <ChevronLeft size={16} />
                  <span className="font-sans text-sm">Entries</span>
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setShowEntrySheet(true)}
                  className="bj-btn-icon w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ color: "var(--bj-ink3)" }}
                  title="Browse entries"
                >
                  <List size={17} />
                </button>
              </div>

              {/* Meta bar + title */}
              <div
                className="px-5 md:px-16 pt-5 md:pt-8 pb-4 border-b shrink-0"
                style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
              >
                {/* Top row: meta + actions */}
                <div className="flex items-center gap-2 mb-4" style={{ maxWidth: 680 }}>
                  <span
                    className="font-sans text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
                  >
                    {formatDate(selected.updatedAt)}
                  </span>
                  <FeelingPicker value={selected.feeling} onChange={handleFeelingChange} />
                  <div className="flex-1" />
                  {/* Pin */}
                  <button
                    onClick={handleTogglePin}
                    className="bj-btn-action w-7 h-7 rounded flex items-center justify-center"
                    style={{ color: selected.isPinned ? "var(--bj-gold)" : "var(--bj-ink4)" }}
                    title="Pin entry"
                  >
                    <Pin size={13} />
                  </button>
                  {/* Favorite */}
                  <button
                    onClick={handleToggleFavorite}
                    className="bj-btn-action w-7 h-7 rounded flex items-center justify-center"
                    style={{ color: selected.isFavorite ? "var(--bj-gold)" : "var(--bj-ink4)" }}
                    title="Favorite"
                  >
                    <Star size={13} fill={selected.isFavorite ? "var(--bj-gold)" : "none"} />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={handleDeleteClick}
                    className="bj-btn-action w-7 h-7 rounded flex items-center justify-center"
                    data-danger
                    style={{ color: "var(--bj-ink4)" }}
                    title="Delete entry"
                  >
                    <Trash2 size={13} />
                  </button>
                  {/* Floating window triggers */}
                  <JournalFloatTriggers
                    bibleOpen={bibleOpen} askOpen={askOpen}
                    onToggleBible={() => setBibleOpen((o) => !o)}
                    onToggleAsk={() => setAskOpen((o) => !o)}
                  />
                </div>

                {/* Editable title */}
                <input
                  value={localTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Untitled"
                  className="font-display bg-transparent outline-none w-full"
                  style={{
                    fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
                    color: "var(--bj-ink)",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                    maxWidth: 680,
                  }}
                />

                {/* Tags */}
                <div className="mt-2.5">
                  <TagEditor tags={selected.tags} onChange={handleTagsChange} />
                </div>
              </div>

              {/* TipTap editor */}
              <div className="flex-1 overflow-hidden">
                <TipTapEditor
                  entryId={selected.id}
                  content={selected.content}
                  onChange={handleContentChange}
                  fontKey="journal"
                />
              </div>
            </motion.div>
          ) : !loading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <p className="font-display italic text-2xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                Select an entry or create a new one
              </p>
              <button
                onClick={handleNew}
                className="font-sans text-sm px-4 py-2 rounded-xl flex items-center gap-2"
                style={{ background: "var(--bj-gold)", color: "white" }}
              >
                <Plus size={14} /> New entry
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>

    {/* ── Mobile entry list bottom sheet ──────────── */}
    <AnimatePresence>
      {showEntrySheet && (
        <>
          <motion.div
            key="es-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "color-mix(in oklch, var(--bj-ink) 30%, transparent)", cursor: "pointer" }}
            onClick={() => setShowEntrySheet(false)}
            onTouchEnd={(e) => { e.preventDefault(); setShowEntrySheet(false); }}
          />
          <motion.div
            key="es-sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col"
            style={{
              height: "72vh",
              boxShadow: "0 -8px 40px color-mix(in oklch, var(--bj-ink) 16%, transparent)",
            }}
          >
            {/* Rounded header cap — overflow-hidden only here (doesn't scroll) */}
            <div
              className="rounded-t-2xl shrink-0"
              style={{
                background: "var(--bj-bg-panel)",
                borderTop: "1px solid var(--bj-line)",
              }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-8 h-1 rounded-full" style={{ background: "var(--bj-line)" }} />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <h3 className="font-display text-base" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                  All Entries <span className="font-sans text-xs ml-1" style={{ color: "var(--bj-ink4)", fontFamily: "inherit", fontStyle: "normal" }}>({entries.length})</span>
                </h3>
                <button onClick={() => setShowEntrySheet(false)} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Scroll area — direct child of fixed container, NO overflow:hidden ancestor */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                background: "var(--bj-bg-panel)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              {entries.map((entry) => {
                const isSelected = entry.id === selectedId;
                const excerpt = extractExcerpt(entry.content);
                return (
                  <div
                    key={entry.id}
                    onClick={() => { setSelectedId(entry.id); setShowEntrySheet(false); }}
                    className="bj-list-row w-full px-5 py-4 border-b"
                    style={{
                      borderColor: "var(--bj-line-soft)",
                      background: isSelected ? "var(--bj-gold-tint)" : "transparent",
                      borderLeft: isSelected ? "2px solid var(--bj-gold)" : "2px solid transparent",
                    }}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {entry.isPinned && <Pin size={10} className="mt-0.5 shrink-0" style={{ color: "var(--bj-gold)" }} />}
                      <p className="font-sans text-sm font-medium leading-snug truncate" style={{ color: "var(--bj-ink)" }}>
                        {entry.title || <span style={{ color: "var(--bj-ink4)" }}>Untitled</span>}
                      </p>
                    </div>
                    {excerpt && (
                      <p className="font-sans text-xs mb-1.5" style={{ color: "var(--bj-ink3)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {excerpt}
                      </p>
                    )}
                    <span className="font-sans" style={{ fontSize: 10, color: "var(--bj-ink4)" }}>
                      {formatDate(entry.updatedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* ── Floating windows ─────────────────────────── */}
    <AnimatePresence>
      {bibleOpen && <FloatingBible onClose={() => setBibleOpen(false)} />}

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            entry={deleteTarget}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
    <AnimatePresence>
      {askOpen && <FloatingAsk onClose={() => setAskOpen(false)} />}
    </AnimatePresence>
    </>
  );
}
