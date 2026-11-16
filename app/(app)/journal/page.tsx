"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin, Star, Search, Plus, Trash2, ChevronLeft, List, X, Table2, Check, Maximize2, Minimize2, Loader2, CloudOff,
} from "lucide-react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useAutosave, saveStatusLabel, type SaveStatus } from "@/hooks/useAutosave";
import { createEntry, updateEntry, deleteEntry } from "@/services/journal.service";
import { useAuthStore } from "@/store/auth.store";
import { useJournalStore } from "@/store/journal.store";
import { useWritingStore } from "@/store/writing.store";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import { WritingSettingsButton } from "@/components/journal/WritingSettings";
import { TagEditor, FeelingPicker, TableView, feelingByLabel, cachedDocText, plural } from "@/components/journal/JournalParts";
import type { JournalEntry } from "@/types";

type Patch = Partial<Omit<JournalEntry, "id" | "userId" | "createdAt" | "updatedAt">>;
const FILTERS = ["All", "Pinned", "Starred"] as const;
type Filter = (typeof FILTERS)[number];

// ── Dates ──────────────────────────────────────────────────

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

function groupLabel(d: Date): string {
  const days = Math.round((startOfDay(new Date()).getTime() - startOfDay(d).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 days";
  if (d.getFullYear() === new Date().getFullYear()) return d.toLocaleDateString("en-US", { month: "long" });
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function rowTime(d: Date): string {
  const days = Math.round((startOfDay(new Date()).getTime() - startOfDay(d).getTime()) / 86400000);
  if (days <= 0) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  if (days < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Save status ────────────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const icon =
    status === "saved" ? <Check size={12} style={{ color: "var(--bj-sage)" }} /> :
    status === "offline" ? <CloudOff size={12} /> :
    status === "error" ? <CloudOff size={12} style={{ color: "var(--bj-ember)" }} /> :
    <Loader2 size={12} className="animate-spin" />;
  return (
    <span className="flex items-center gap-1.5 font-sans text-[12px] whitespace-nowrap" style={{ color: "var(--bj-ink4)" }} aria-live="polite">
      {icon}{saveStatusLabel(status)}
    </span>
  );
}

// ── Undo toast ─────────────────────────────────────────────

function UndoToast({ title, onUndo }: { title: string; onUndo: () => void }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="fixed z-[70] left-1/2 flex items-center gap-3 pl-4 pr-1.5 h-11 rounded-xl"
      style={{
        bottom: "calc(5.5rem + env(safe-area-inset-bottom))", translate: "-50% 0",
        background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-lg)",
      }}
    >
      <span className="font-sans text-[13px] max-w-[220px] truncate" style={{ color: "var(--bj-ink2)" }}>
        Deleted “{title || "Untitled"}”
      </span>
      <button type="button" onClick={onUndo}
        className="bj-btn-ghost h-8 px-3 rounded-lg font-sans text-[13px] font-medium"
        style={{ color: "var(--bj-gold-deep)" }}>
        Undo <span className="ml-1 opacity-60 hidden sm:inline">⌘Z</span>
      </button>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function JournalPage() {
  return (
    <Suspense fallback={null}>
      <JournalView />
    </Suspense>
  );
}

interface Derived { text: string; excerpt: string; words: number }

// Plain text / excerpt / word count per entry, recomputed only when its content changes.
const derivedCache = new Map<string, { content: string; d: Derived }>();
function derive(e: JournalEntry): Derived {
  const hit = derivedCache.get(e.id);
  if (hit && hit.content === e.content) return hit.d;
  const text = cachedDocText(e.content);
  const d = { text, excerpt: text.length > 120 ? text.slice(0, 120) + "…" : text, words: text ? text.split(" ").length : 0 };
  derivedCache.set(e.id, { content: e.content, d });
  return d;
}

function JournalView() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const { entries, loading } = useJournalEntries();
  const hide = useJournalStore((s) => s.hide);
  const unhide = useJournalStore((s) => s.unhide);
  const zen = useWritingStore((s) => s.zen);
  const setWriting = useWritingStore((s) => s.set);

  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [undo, setUndo] = useState<JournalEntry | null>(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const pendingDelete = useRef<{ entry: JournalEntry; timer: ReturnType<typeof setTimeout> } | null>(null);
  const hasAutoSelected = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const focusTitleFor = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const autosave = useAutosave<Patch>((id, patch) => (user ? updateEntry(user.uid, id, patch) : Promise.resolve()));

  // A just-created entry is shown at once from a local draft until Firestore reports it.
  const [draft, setDraft] = useState<JournalEntry | null>(null);
  const selected = entries.find((e) => e.id === selectedId) ?? (draft && draft.id === selectedId ? draft : null);

  const derived = useMemo(() => new Map(entries.map((e) => [e.id, derive(e)])), [entries]);

  const select = useCallback((id: string | null) => {
    autosave.flush();
    setSelectedId(id);
  }, [autosave]);

  // Initial selection: ?entry=<id> wins, else the most recent entry.
  useEffect(() => {
    if (!loading && entries.length > 0 && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      const paramId = searchParams.get("entry");
      setSelectedId(paramId && entries.some((e) => e.id === paramId) ? paramId : entries[0].id);
    }
  }, [loading, entries, searchParams]);

  // Later ⌘K jumps while already on the journal (?entry= / ?tag=).
  const paramEntry = searchParams.get("entry");
  const paramTag = searchParams.get("tag");
  useEffect(() => {
    if (paramEntry && hasAutoSelected.current) { autosave.flush(); setSelectedId(paramEntry); setWriting({ zen: false }); }
  }, [paramEntry]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (paramTag) { setSearch(`#${paramTag}`); setFilter("All"); setViewMode("list"); }
  }, [paramTag]);

  useLayoutEffect(() => {
    if (selected) setLocalTitle(selected.title);
    if (selected && focusTitleFor.current === selected.id) {
      focusTitleFor.current = null;
      titleRef.current?.focus();
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leaving the journal always leaves zen.
  useEffect(() => () => setWriting({ zen: false }), [setWriting]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter === "Pinned" && !e.isPinned) return false;
      if (filter === "Starred" && !e.isFavorite) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        (derived.get(e.id)?.text.toLowerCase().includes(q) ?? false) ||
        (e.feeling ?? "").toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q.replace(/^#/, "")))
      );
    });
  }, [entries, filter, search, derived]);

  const groups = useMemo(() => {
    const out: { label: string; items: JournalEntry[] }[] = [];
    const pinned = filter === "All" && !search ? filtered.filter((e) => e.isPinned) : [];
    if (pinned.length) out.push({ label: "Pinned", items: pinned });
    for (const e of filtered) {
      if (pinned.includes(e)) continue;
      const label = groupLabel(e.updatedAt);
      const g = out[out.length - 1];
      if (g && g.label === label) g.items.push(e);
      else out.push({ label, items: [e] });
    }
    return out;
  }, [filtered, filter, search]);

  const flatOrder = useMemo(() => groups.flatMap((g) => g.items.map((e) => e.id)), [groups]);

  // ── Actions ──

  const handleNew = useCallback(async () => {
    if (!user || creating) return;
    setCreating(true);
    autosave.flush();
    try {
      const id = await createEntry(user.uid);
      const now = new Date();
      setDraft({
        id, userId: user.uid, title: "", content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
        tags: [], folderId: null, isPinned: false, isFavorite: false, scriptures: [], createdAt: now, updatedAt: now,
      } as JournalEntry);
      setSelectedId(id);
      setLocalTitle("");
      setFilter("All");
      setSearch("");
      focusTitleFor.current = id; // focused once the entry arrives and the title mounts
    } finally {
      setCreating(false);
    }
  }, [user, creating, autosave]);

  const commitDelete = useCallback(() => {
    const p = pendingDelete.current;
    if (!p || !user) return;
    clearTimeout(p.timer);
    pendingDelete.current = null;
    void deleteEntry(user.uid, p.entry.id).finally(() => unhide(p.entry.id));
  }, [user, unhide]);

  const handleDelete = useCallback(() => {
    if (!selected) return;
    commitDelete(); // only one undo at a time
    autosave.flush(selected.id);
    const idx = flatOrder.indexOf(selected.id);
    const next = flatOrder[idx + 1] ?? flatOrder[idx - 1] ?? null;
    hide(selected.id);
    pendingDelete.current = { entry: selected, timer: setTimeout(() => { commitDelete(); setUndo(null); }, 6000) };
    setUndo(selected);
    setSelectedId(next);
  }, [selected, flatOrder, hide, commitDelete, autosave]);

  const handleUndo = useCallback(() => {
    const p = pendingDelete.current;
    if (!p) return;
    clearTimeout(p.timer);
    pendingDelete.current = null;
    unhide(p.entry.id);
    setUndo(null);
    setSelectedId(p.entry.id);
  }, [unhide]);

  // A pending delete still happens if the page is closed during the undo window.
  useEffect(() => {
    window.addEventListener("pagehide", commitDelete);
    return () => { window.removeEventListener("pagehide", commitDelete); commitDelete(); };
  }, [commitDelete]);

  const patchSelected = (patch: Patch) => {
    if (!user || !selected) return;
    void updateEntry(user.uid, selected.id, patch);
  };

  // ── Keyboard ──

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.code === "KeyN") { e.preventDefault(); void handleNew(); return; }
      if (mod && e.code === "Period") { e.preventDefault(); setWriting({ zen: !useWritingStore.getState().zen }); return; }
      if (e.key === "Escape" && useWritingStore.getState().zen && !document.querySelector('[role="dialog"]')) { setWriting({ zen: false }); return; }
      if (mod && !e.shiftKey && e.code === "KeyZ" && pendingDelete.current) {
        const t = e.target as HTMLElement;
        if (!t.isContentEditable && t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") { e.preventDefault(); handleUndo(); }
        return;
      }
      // ⌥↑ / ⌥↓ — previous / next entry, from anywhere (even mid-sentence).
      if (e.altKey && !mod && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const i = selectedId ? flatOrder.indexOf(selectedId) : -1;
        const next = flatOrder[e.key === "ArrowDown" ? i + 1 : Math.max(0, i - 1)];
        if (next) select(next);
        return;
      }
      if (e.key === "/" && !mod) {
        const t = e.target as HTMLElement;
        if (!t.isContentEditable && t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") { e.preventDefault(); searchRef.current?.focus(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNew, handleUndo, setWriting, flatOrder, selectedId, select]);

  // Zen: chrome fades while typing, returns when the mouse moves.
  useEffect(() => {
    if (!zen) { setChromeVisible(true); return; }
    let t: ReturnType<typeof setTimeout>;
    const show = () => { setChromeVisible(true); clearTimeout(t); t = setTimeout(() => setChromeVisible(false), 1800); };
    const hideNow = (e: KeyboardEvent) => { if (!e.metaKey && !e.ctrlKey) { clearTimeout(t); setChromeVisible(false); } };
    window.addEventListener("mousemove", show);
    window.addEventListener("keydown", hideNow);
    show();
    return () => { clearTimeout(t); window.removeEventListener("mousemove", show); window.removeEventListener("keydown", hideNow); };
  }, [zen]);

  // Auto-grow the title.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [localTitle, selected?.id]);

  // ── Render ──

  const listRow = (entry: JournalEntry, compact = false) => {
    const isSel = entry.id === selectedId;
    const d = derived.get(entry.id);
    const feeling = feelingByLabel(entry.feeling);
    return (
      <button
        type="button"
        key={entry.id}
        onClick={() => { select(entry.id); setShowSheet(false); }}
        data-active={isSel || undefined}
        aria-current={isSel || undefined}
        className="bj-list-row w-full text-left rounded-xl px-3 py-2.5 mb-0.5 block"
        style={{
          background: isSel ? "var(--bj-gold-tint)" : "transparent",
          boxShadow: isSel ? "inset 0 0 0 1px color-mix(in oklch, var(--bj-gold-soft) 60%, transparent)" : "none",
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {entry.isPinned && filter !== "All" && <Pin size={10} className="shrink-0" style={{ color: "var(--bj-gold)" }} />}
          {entry.isFavorite && <Star size={10} className="shrink-0" fill="var(--bj-gold)" style={{ color: "var(--bj-gold)" }} />}
          <span className="font-sans text-[13.5px] font-medium truncate flex-1" style={{ color: isSel ? "var(--bj-ink)" : "var(--bj-ink2)" }}>
            {entry.title || <span style={{ color: "var(--bj-ink4)", fontWeight: 400 }}>Untitled</span>}
          </span>
        </div>
        {!compact && d?.excerpt && (
          <p className="font-sans text-[12px] mt-1"
            style={{ color: "var(--bj-ink4)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {d.excerpt}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 font-sans text-[11px] min-w-0" style={{ color: "var(--bj-ink4)" }}>
          {feeling && <span className="shrink-0">{feeling.label}</span>}
          {feeling && (entry.tags.length > 0 || (d?.words ?? 0) > 0) && <span>·</span>}
          {entry.tags.length > 0
            ? <span className="truncate">{entry.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}</span>
            : (d?.words ?? 0) > 0 && <span>{plural(d!.words, "word")}</span>}
          <span className="ml-auto shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>{rowTime(entry.updatedAt)}</span>
        </div>
      </button>
    );
  };

  const entryList = (
    <div className="flex-1 overflow-y-auto px-2 pb-6">
      {loading ? (
        <div className="flex flex-col gap-2 px-1 pt-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-[68px] rounded-xl animate-pulse" style={{ background: "var(--bj-bg-soft)", opacity: 1 - i * 0.2 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
          <p className="font-display italic text-lg" style={{ color: "var(--bj-ink4)" }}>
            {entries.length === 0 ? "Your first page is waiting" : search ? `Nothing matches “${search}”` : `No ${filter.toLowerCase()} entries`}
          </p>
          {entries.length === 0 && (
            <button type="button" onClick={handleNew}
              className="bj-btn-primary font-sans text-[13px] font-medium px-3.5 h-8 rounded-lg"
              style={{ background: "var(--bj-gold)", color: "var(--bj-bg)" }}>
              Start writing
            </button>
          )}
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.label}>
            <p className="font-sans text-[11px] font-medium px-3 pt-3.5 pb-1.5" style={{ color: "var(--bj-ink4)" }}>{g.label}</p>
            {g.items.map((e) => listRow(e))}
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <div className="flex h-full" style={{ background: "var(--bj-bg)" }}>

        {/* ── Entry list ── */}
        {!zen && (
          <aside
            aria-label="Journal entries"
            className={`${viewMode === "table" ? "hidden" : selectedId ? "hidden md:flex" : "flex"} w-full md:w-[300px] flex-col border-r h-full overflow-hidden shrink-0`}
            style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
          >
            <div className="px-4 pt-5 pb-2 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>Journal</h1>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setViewMode("table")} title="Table view" aria-label="Table view"
                    className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                    <Table2 size={14} />
                  </button>
                  <button type="button" onClick={handleNew} disabled={creating}
                    className="bj-btn-primary h-8 pl-2.5 pr-3 rounded-lg flex items-center gap-1.5 font-sans text-[12px] font-semibold disabled:opacity-60"
                    style={{ background: "var(--bj-gold)", color: "var(--bj-bg)" }}
                    title="New entry (⌘⇧N)">
                    <Plus size={14} strokeWidth={2.4} /> New
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 px-3 h-9 rounded-xl"
                style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
                <Search size={13} style={{ color: "var(--bj-ink4)" }} aria-hidden="true" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); e.currentTarget.blur(); } }}
                  placeholder="Search words, tags, feelings…"
                  aria-label="Search entries"
                  className="bg-transparent outline-none font-sans text-base md:text-[13px] w-full min-w-0"
                  style={{ color: "var(--bj-ink)" }}
                />
                {search ? (
                  <button type="button" onClick={() => setSearch("")} aria-label="Clear search" style={{ color: "var(--bj-ink4)" }}><X size={12} /></button>
                ) : <kbd className="bj-kbd hidden md:inline-flex">/</kbd>}
              </label>
              <div className="flex gap-0.5 p-0.5 rounded-[10px]" role="tablist" style={{ background: "var(--bj-bg-soft)" }}>
                {FILTERS.map((f) => (
                  <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                    className="flex-1 h-7 rounded-lg font-sans text-[12px]"
                    style={{
                      background: filter === f ? "var(--bj-line)" : "transparent",
                      color: filter === f ? "var(--bj-ink)" : "var(--bj-ink3)",
                      fontWeight: filter === f ? 500 : 400,
                      transition: "background-color 0.12s ease, color 0.12s ease",
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {entryList}
          </aside>
        )}

        {/* ── Table view ── */}
        {viewMode === "table" && !zen && (
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b shrink-0 flex items-center gap-3 flex-wrap" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}>
              <h2 className="font-display text-xl" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>
                All entries <span className="font-sans text-sm ml-1" style={{ color: "var(--bj-ink4)" }}>{filtered.length}</span>
              </h2>
              <label className="flex items-center gap-2 px-3 h-8 rounded-xl flex-1 max-w-md" style={{ background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
                <Search size={12} style={{ color: "var(--bj-ink4)" }} aria-hidden="true" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, feeling, tag…" aria-label="Search entries"
                  className="bg-transparent outline-none font-sans text-base md:text-xs flex-1 min-w-0" style={{ color: "var(--bj-ink)" }} />
              </label>
              <button type="button" onClick={() => setViewMode("list")} className="bj-btn-ghost ml-auto flex items-center gap-1.5 font-sans text-xs px-3 h-8 rounded-lg"
                style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}>
                <List size={12} /> Back to writing
              </button>
            </div>
            <TableView entries={filtered} onSelect={(id) => { select(id); setViewMode("list"); }} />
          </div>
        )}

        {/* ── Writing pane ── */}
        <section
          aria-label="Entry"
          data-writing-surface
          className={`${viewMode === "table" && !zen ? "hidden" : selectedId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 h-full overflow-hidden`}
        >
          {selected ? (
            <>
              {/* Header */}
              <header
                className="flex items-center gap-1 px-2 md:pl-6 md:pr-3 shrink-0"
                style={{
                  height: 48,
                  borderBottom: zen ? "1px solid transparent" : "1px solid var(--bj-line-soft)",
                  opacity: zen && !chromeVisible ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                <button type="button" onClick={() => select(null)} aria-label="Back to entries"
                  className="md:hidden bj-btn-ghost flex items-center gap-1 h-10 pl-1.5 pr-2.5 rounded-xl font-sans text-sm" style={{ color: "var(--bj-ink2)" }}>
                  <ChevronLeft size={18} /> Entries
                </button>

                <div className="hidden md:block"><SaveIndicator status={autosave.status} /></div>
                <div className="flex-1" />
                <button type="button" onClick={() => patchSelected({ isPinned: !selected.isPinned })}
                  aria-label={selected.isPinned ? "Unpin" : "Pin"} aria-pressed={selected.isPinned} title={selected.isPinned ? "Unpin" : "Pin"}
                  className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: selected.isPinned ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
                  <Pin size={14} />
                </button>
                <button type="button" onClick={() => patchSelected({ isFavorite: !selected.isFavorite })}
                  aria-label={selected.isFavorite ? "Unstar" : "Star"} aria-pressed={selected.isFavorite} title={selected.isFavorite ? "Unstar" : "Star"}
                  className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: selected.isFavorite ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
                  <Star size={14} fill={selected.isFavorite ? "var(--bj-gold)" : "none"} />
                </button>
                <button type="button" onClick={handleDelete} aria-label="Delete entry" title="Delete entry" data-danger
                  className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                  <Trash2 size={14} />
                </button>
                <button type="button" onClick={() => setShowSheet(true)} aria-label="Browse entries"
                  className="md:hidden bj-btn-icon w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
                  <List size={17} />
                </button>
                <WritingSettingsButton showZen />
                <button type="button" onClick={() => setWriting({ zen: !zen })}
                  aria-label={zen ? "Leave zen mode" : "Zen mode"} title={zen ? "Leave zen (Esc)" : "Zen mode (⌘.)"}
                  className="hidden md:flex bj-btn-icon w-8 h-8 rounded-lg items-center justify-center" style={{ color: zen ? "var(--bj-gold-deep)" : "var(--bj-ink3)" }}>
                  {zen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </header>

              <div className="flex-1 min-h-0">
                <TipTapEditor
                  entryId={selected.id}
                  content={selected.content}
                  onChange={(json) => autosave.schedule(selected.id, { content: json })}
                  toolbar={false}
                  stats
                  zen={zen}
                  statsExtra={<span className="md:hidden"><SaveIndicator status={autosave.status} /></span>}
                  header={
                    <div className="mb-6">
                      <div className="flex items-center gap-2 flex-wrap mb-3 font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }}>
                        <span>{selected.createdAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                        <span aria-hidden="true">·</span>
                        <FeelingPicker value={selected.feeling} onChange={(feeling) => patchSelected({ feeling: feeling ?? "" })} />
                        <TagEditor tags={selected.tags} onChange={(tags) => patchSelected({ tags })} />
                      </div>
                      <textarea
                        ref={titleRef}
                        rows={1}
                        value={localTitle}
                        onChange={(e) => { setLocalTitle(e.target.value.replace(/\n/g, " ")); autosave.schedule(selected.id, { title: e.target.value.replace(/\n/g, " ") }); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || (e.key === "ArrowDown" && e.currentTarget.selectionStart === e.currentTarget.value.length)) {
                            e.preventDefault();
                            (document.querySelector("[data-writing-surface] .ProseMirror") as HTMLElement | null)?.focus();
                          }
                        }}
                        placeholder="Untitled"
                        aria-label="Entry title"
                        className="font-display bg-transparent outline-none w-full resize-none overflow-hidden block"
                        style={{
                          fontSize: "clamp(2rem, 4vw, 2.75rem)", color: "var(--bj-ink)", fontWeight: 400,
                          letterSpacing: "-0.01em", lineHeight: 1.12, caretColor: "var(--bj-gold)",
                        }}
                      />
                    </div>
                  }
                />
              </div>
            </>
          ) : !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="font-display italic text-2xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                {entries.length ? "Pick an entry, or begin a new page" : "A quiet place to begin"}
              </p>
              <button type="button" onClick={handleNew}
                className="bj-btn-primary font-sans text-sm font-medium px-4 h-9 rounded-xl flex items-center gap-2"
                style={{ background: "var(--bj-gold)", color: "var(--bj-bg)" }}>
                <Plus size={14} /> New entry <span className="opacity-60 text-xs">⌘⇧N</span>
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {/* Mobile: entry sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div key="es-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowSheet(false)} />
            <motion.div key="es-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.32 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col rounded-t-2xl overflow-hidden"
              style={{ height: "72dvh", background: "var(--bj-bg-panel)", borderTop: "1px solid var(--bj-line)", paddingBottom: "env(safe-area-inset-bottom)" }}>
              <div className="flex justify-center pt-2.5 pb-1"><div className="w-9 h-1 rounded-full" style={{ background: "var(--bj-line)" }} /></div>
              <div className="flex items-center justify-between px-5 py-2">
                <h2 className="font-display text-lg" style={{ color: "var(--bj-ink)" }}>Entries</h2>
                <button type="button" onClick={() => setShowSheet(false)} aria-label="Close" className="bj-btn-icon w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}><X size={16} /></button>
              </div>
              {entryList}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {undo && <UndoToast key={undo.id} title={undo.title} onUndo={handleUndo} />}
      </AnimatePresence>
    </>
  );
}
