"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin, Star, Search, Plus, Trash2, ChevronLeft, List, X, Table2, Check, CalendarDays, Lock, LockOpen, Maximize2, Minimize2, Loader2, CloudOff,
} from "lucide-react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useAutosave, saveStatusLabel, type SaveStatus } from "@/hooks/useAutosave";
import { createEntry, updateEntry, deleteEntry, setEntryLocked, addEntryPhoto } from "@/services/journal.service";
import { FolderSwitcher, FolderChip, LockedPanel, LockCodeWindow, ensureLockKey } from "@/components/journal/Folders";
import { useLocks, lockNow } from "@/lib/locks";
import { folderLocked } from "@/services/folder.service";
import { useAuthStore } from "@/store/auth.store";
import { PhotoDropOverlay } from "@/components/journal/EntryCover";
import { PhotoStack, PhotoViewer, PhotoPile, PhotoGallery, useEntryPhotos, addEntryPhotos } from "@/components/journal/EntryPhotos";
import { attachPhotos } from "@/lib/photos";
import { feelingColor } from "@/lib/feelings";
import { lastInputWasKeyboard } from "@/lib/inputMode";
import { Companion } from "@/components/journal/Companion";
import { useJournalStore } from "@/store/journal.store";
import { useWritingStore } from "@/store/writing.store";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import { WritingSettingsButton } from "@/components/journal/WritingSettings";
import { TagEditor, FeelingPicker, TableView, cachedDocText } from "@/components/journal/JournalParts";
import type { EntryPhoto, JournalEntry } from "@/types";
import { MonthView, YearView, type TimeMode } from "@/components/journal/TimeViews";

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
        background: "var(--m-pop-bg)", backdropFilter: "blur(24px) saturate(170%)", WebkitBackdropFilter: "blur(24px) saturate(170%)", border: "1px solid var(--m-edge)", boxShadow: "var(--bj-shadow-lg)",
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
  const [folder, setFolder] = useState<string | null>(null);
  const lockOpenNow = useLocks((s) => !!s.key);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "table" | "month" | "year">(() => {
    const v = searchParams.get("view");
    return v === "month" || v === "year" ? v : "list";
  });
  const timeView = viewMode === "month" || viewMode === "year";
  const [undo, setUndo] = useState<JournalEntry | null>(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const pendingDelete = useRef<{ entry: JournalEntry; timer: ReturnType<typeof setTimeout> } | null>(null);
  const hasAutoSelected = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const focusTitleFor = useRef<string | null>(null);
  const focusBodyFor = useRef<string | null>(null);
  const openVerseFor = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const autosave = useAutosave<Patch>((id, patch) => (user ? updateEntry(user.uid, id, patch) : Promise.resolve()));

  // A just-created entry is shown at once from a local draft until Firestore reports it.
  const [draft, setDraft] = useState<JournalEntry | null>(null);
  const selected = entries.find((e) => e.id === selectedId) ?? (draft && draft.id === selectedId ? draft : null);
  const hasPhotos = useEntryPhotos(selected).length > 0;
  const [dropping, setDropping] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(() => {
    try { return localStorage.getItem("bj-companion") !== "0"; } catch { return true; }
  });
  useEffect(() => { try { localStorage.setItem("bj-companion", companionOpen ? "1" : "0"); } catch { /* ignore */ } }, [companionOpen]);
  const sheetRef = useRef<HTMLDivElement>(null);
  // Switching pages by pointer: the new page settles in. By keyboard: instant.
  const shownId = useRef<string | null>(null);
  useEffect(() => {
    const id = selected?.id ?? null;
    if (shownId.current && id && id !== shownId.current && !lastInputWasKeyboard()) {
      sheetRef.current?.querySelector("[data-writing-surface]")?.animate(
        [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
        { duration: 280, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
    shownId.current = id;
  }, [selected?.id]);

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
      // A just-started entry (?new=) may not be in the list yet — select it anyway.
      setSelectedId(paramId && (searchParams.get("new") || entries.some((e) => e.id === paramId)) ? paramId : entries[0].id);
    }
  }, [loading, entries, searchParams]);

  // Later ⌘K jumps while already on the journal (?entry= / ?tag=).
  const paramEntry = searchParams.get("entry");
  const paramTag = searchParams.get("tag");
  const paramNew = searchParams.get("new");
  useEffect(() => {
    if (!paramEntry || !paramNew) return;
    if (paramNew === "title") focusTitleFor.current = paramEntry;
    else focusBodyFor.current = paramEntry;
    openVerseFor.current = paramNew === "verse" ? paramEntry : null;
  }, [paramEntry, paramNew]);
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
    if (selected && focusBodyFor.current === selected.id) {
      focusBodyFor.current = null;
      // The editor mounts its content a microtask later.
      setTimeout(() => {
        const pm = document.querySelector("[data-writing-surface] .ProseMirror") as HTMLElement | null;
        if (!pm) return;
        pm.focus();
        const sel = window.getSelection();
        sel?.selectAllChildren(pm);
        sel?.collapseToEnd();
        if (openVerseFor.current === selected.id) {
          openVerseFor.current = null;
          pm.dispatchEvent(new CustomEvent("bj:verse-picker"));
        }
      }, 60);
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leaving the journal always leaves zen.
  useEffect(() => () => setWriting({ zen: false }), [setWriting]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (folder && e.folderId !== folder) return false;
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
  }, [entries, filter, search, derived, folder]);

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

  const handleNew = useCallback(async (forDay?: unknown) => {
    if (!user || creating) return;
    setCreating(true);
    autosave.flush();
    try {
      // From the calendar: an entry that belongs to an earlier day (at noon, so time zones don't shift it).
      const day = forDay instanceof Date && forDay.toDateString() !== new Date().toDateString()
        ? new Date(forDay.getFullYear(), forDay.getMonth(), forDay.getDate(), 12) : undefined;
      // New pages go into the folder you're looking at (a locked one asks for the code first).
      const into = folder && (!folderLocked(folder) || (await ensureLockKey("Enter your lock code to write here"))) ? folder : null;
      const id = await createEntry(user.uid, { ...(day ? { createdAt: day } : {}), folderId: into });
      setViewMode("list");
      const now = day ?? new Date();
      setDraft({
        id, userId: user.uid, title: "", content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
        tags: [], folderId: into, isPinned: false, isFavorite: false, scriptures: [], createdAt: now, updatedAt: now,
      } as JournalEntry);
      setSelectedId(id);
      setLocalTitle("");
      setFilter("All");
      setSearch("");
      focusTitleFor.current = id; // focused once the entry arrives and the title mounts
    } finally {
      setCreating(false);
    }
  }, [user, creating, autosave, folder]);

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

  // ⌘L — lock or unlock this page (asks for the lock code, or to choose one the first time).
  const toggleLockPage = useCallback(async () => {
    if (!user || !selected || selected.shut) return;
    autosave.flush();
    if (!(await ensureLockKey(selected.locked ? "Enter your lock code to remove the lock" : "Enter your lock code"))) return;
    try { await setEntryLocked(user.uid, selected, !selected.locked); } catch (e) { console.error("lock page", e); }
  }, [user, selected, autosave]);

  const lockEverything = useCallback(() => {
    autosave.flush();
    // Let the last save land sealed before the key goes.
    setTimeout(lockNow, 500);
  }, [autosave]);

  // Photos live in the stack at the top-right, never in the writing: the toolbar / ⌘⇧P
  // add to it, and a photo found in the text (older pages) is moved up into it.
  useEffect(() => {
    if (!user || !selected) return;
    const uid = user.uid, entry = selected;
    let hasCover = !!entry.cover || !!entry.photos?.length;
    const add = () => { if (!entry.shut) void addEntryPhotos(uid, entry); };
    const out = (e: Event) => {
      const d = (e as CustomEvent<{ photo: EntryPhoto; handled: boolean }>).detail;
      if (entry.shut) return;
      d.handled = true;
      const already = entry.photos?.some((p) => p.url === d.photo.url) || entry.cover?.url === d.photo.url;
      if (!already) void addEntryPhoto(uid, entry.id, d.photo, !hasCover);
      hasCover = true;
    };
    // Pasted, dropped or /photo pictures: into the photo set, not the writing.
    const files = (e: Event) => {
      const d = (e as CustomEvent<{ files: File[]; handled: boolean }>).detail;
      if (entry.shut || !d.files.length) return;
      d.handled = true;
      attachPhotos(uid, entry.id, d.files, !hasCover);
      hasCover = true;
    };
    window.addEventListener("bj:entry-photos", add);
    window.addEventListener("bj:photo-out", out);
    window.addEventListener("bj:entry-photo-files", files);
    return () => {
      window.removeEventListener("bj:entry-photos", add);
      window.removeEventListener("bj:photo-out", out);
      window.removeEventListener("bj:entry-photo-files", files);
    };
  }, [user, selected]);

  const patchSelected = (patch: Patch) => {
    if (!user || !selected) return;
    void updateEntry(user.uid, selected.id, patch);
  };

  // ── Keyboard ──

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.code === "KeyN") { e.preventDefault(); void handleNew(); return; }
      if (mod && !e.shiftKey && e.code === "KeyJ") { e.preventDefault(); setCompanionOpen((o) => !o); return; }
      if (mod && !e.shiftKey && e.code === "KeyL") { e.preventDefault(); void toggleLockPage(); return; }
      // ⌘⇧P — add photos to this page (kept beside the writing).
      if (mod && e.shiftKey && e.code === "KeyP") { e.preventDefault(); window.dispatchEvent(new CustomEvent("bj:entry-photos")); return; }
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
  }, [handleNew, handleUndo, setWriting, flatOrder, selectedId, select, toggleLockPage]);

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
    const fc = feelingColor(entry.feeling);
    const thumb = entry.cover?.url;
    return (
      <button
        type="button"
        key={entry.id}
        onClick={() => { select(entry.id); setShowSheet(false); }}
        data-active={isSel || undefined}
        aria-current={isSel || undefined}
        className="bj-list-row relative w-full text-left rounded-[14px] p-2.5 mb-1 flex gap-3 items-start"
        style={{ border: "1px solid transparent" }}
      >
        {isSel && (
          <motion.span layoutId={compact ? "entry-pill-sheet" : "entry-pill"} aria-hidden="true" className="bj-raised absolute inset-0 rounded-[14px]"
            transition={lastInputWasKeyboard() ? { duration: 0 } : { type: "spring", duration: 0.36, bounce: 0.12 }} />
        )}
        {!compact && (thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" loading="lazy" className="relative w-[52px] h-[52px] rounded-[10px] object-cover shrink-0"
            style={{ background: entry.cover?.tint ?? "var(--bj-bg-soft)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)" }} />
        ) : (
          <span className="bj-well relative w-[52px] h-[52px] rounded-[10px] shrink-0 flex flex-col items-center justify-center">
            <span className="font-display text-[20px] leading-none" style={{ color: isSel ? "var(--bj-ink)" : "var(--bj-ink2)" }}>{entry.createdAt.getDate()}</span>
            <span className="font-sans text-[9px] font-medium uppercase mt-0.5" style={{ color: "var(--bj-ink4)" }}>
              {entry.createdAt.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
          </span>
        ))}
        <span className="relative flex-1 min-w-0 block pt-0.5">
          <span className="flex items-center gap-1.5 min-w-0">
            {fc && <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: fc, boxShadow: `0 0 6px ${fc}` }} title={entry.feeling} />}
            {entry.isPinned && filter !== "All" && <Pin size={10} className="shrink-0" style={{ color: "var(--bj-gold)" }} />}
            {entry.isFavorite && <Star size={10} className="shrink-0" fill="var(--bj-gold)" style={{ color: "var(--bj-gold)" }} />}
            {entry.lockSealed && (entry.shut
              ? <Lock size={10} className="shrink-0" style={{ color: "var(--bj-gold)" }} aria-label="Locked" />
              : <LockOpen size={10} className="shrink-0" style={{ color: "var(--bj-gold)" }} aria-label="Locked, open now" />)}
            <span className="font-sans text-[13.5px] font-medium truncate flex-1" style={{ color: isSel ? "var(--bj-ink)" : "var(--bj-ink2)" }}>
              {entry.title || <span style={{ color: "var(--bj-ink4)", fontWeight: 400 }}>Untitled</span>}
            </span>
            <span className="shrink-0 font-sans text-[10.5px]" style={{ color: "var(--bj-ink4)", fontVariantNumeric: "tabular-nums" }}>{rowTime(entry.updatedAt)}</span>
          </span>
          {entry.shut ? (
            <span className="flex flex-col gap-1.5 mt-2" aria-label="Locked writing">
              <i className="block h-[7px] w-[88%] rounded" style={{ background: "color-mix(in oklch, var(--bj-ink) 7%, transparent)" }} />
              <i className="block h-[7px] w-[62%] rounded" style={{ background: "color-mix(in oklch, var(--bj-ink) 7%, transparent)" }} />
            </span>
          ) : d?.excerpt ? (
            <span className="bj-preview block font-write text-[14px] mt-1"
              style={{ color: "var(--bj-ink3)", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {d.excerpt}
            </span>
          ) : (
            <span className="block font-display italic text-[14px] mt-1" style={{ color: "var(--bj-ink4)" }}>Nothing yet</span>
          )}
          {entry.tags.length > 0 && (
            <span className="block font-sans text-[11px] mt-1 truncate" style={{ color: "var(--bj-ink4)" }}>{entry.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}</span>
          )}
        </span>
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
      <div className="flex h-full">

        {/* ── Entry list ── */}
        {!zen && (
          <aside
            aria-label="Journal entries"
            className={`${viewMode === "table" || timeView ? "hidden" : selectedId ? "hidden md:flex" : "flex"} w-full md:w-[316px] flex-col h-full overflow-hidden shrink-0`}
          >
            <div className="px-4 pt-5 pb-2 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-[28px]" style={{ color: "var(--bj-ink)", fontWeight: 500 }}>Journal</h1>
                <div className="flex items-center gap-1">
                  {lockOpenNow && (
                    <button type="button" onClick={lockEverything} title="Lock locked pages again" aria-label="Lock now"
                      className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-gold)" }}>
                      <LockOpen size={14} />
                    </button>
                  )}
                  <button type="button" onClick={() => setViewMode("month")} title="Month and year" aria-label="Calendar view"
                    className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                    <CalendarDays size={14} />
                  </button>
                  <button type="button" onClick={() => setViewMode("table")} title="Table view" aria-label="Table view"
                    className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                    <Table2 size={14} />
                  </button>
                  <button type="button" onClick={handleNew} disabled={creating}
                    className="bj-gold h-9 pl-2.5 pr-3.5 rounded-xl flex items-center gap-1.5 font-sans text-[12.5px] font-semibold disabled:opacity-60"
                    title="New entry (⌘⇧N)">
                    <Plus size={14} strokeWidth={2.4} /> New
                  </button>
                </div>
              </div>
              <label className="bj-well flex items-center gap-2 px-3 h-9 rounded-xl">
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
              {user && <FolderSwitcher uid={user.uid} current={folder} onPick={(id) => { setFolder(id); setSearch(""); }} entries={entries} />}
              <div className="bj-well flex gap-0.5 p-[3px] rounded-xl" role="tablist">
                {FILTERS.map((f) => (
                  <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                    className="relative flex-1 h-7 rounded-[9px] font-sans text-[12px]"
                    style={{ color: filter === f ? "var(--bj-ink)" : "var(--bj-ink3)", fontWeight: filter === f ? 500 : 400, transition: "color 0.15s ease" }}>
                    {filter === f && (
                      <motion.span layoutId="journal-filter" aria-hidden="true" className="bj-raised absolute inset-0 rounded-[9px]"
                        transition={lastInputWasKeyboard() ? { duration: 0 } : { type: "spring", duration: 0.32, bounce: 0.12 }} />
                    )}
                    <span className="relative">{f}</span>
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

        {/* ── Month / Year ── */}
        {timeView && !zen && (
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            {viewMode === "month"
              ? <MonthView entries={entries} onOpen={(id) => { select(id); setViewMode("list"); }} onNewFor={(d) => void handleNew(d)} onMode={(m: TimeMode) => setViewMode(m)} />
              : <YearView entries={entries} onOpen={(id) => { select(id); setViewMode("list"); }} onMode={(m: TimeMode) => setViewMode(m)} />}
          </div>
        )}

        {/* ── Writing pane ── */}
        <section
          aria-label="Entry"
          data-writing-surface
          className={`${(viewMode === "table" || timeView) && !zen ? "hidden" : selectedId ? "flex" : "hidden md:flex"} flex-1 min-w-0 h-full overflow-hidden ${zen ? "" : "md:p-3 md:pl-1 gap-3"}`}
        >
          <div ref={sheetRef} className={`relative flex-1 flex flex-col min-w-0 h-full overflow-hidden ${zen ? "" : "bj-sheet"}`}>
          {selected ? (
            <>
              {/* Header */}
              <header
                className="flex items-center gap-1 px-2 md:pl-6 md:pr-3 shrink-0"
                style={{
                  height: 48,
                  position: "relative", zIndex: 2,
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
                {!selected.shut && (
                  <button type="button" onClick={() => void toggleLockPage()}
                    aria-label={selected.locked ? "Unlock this page" : "Lock this page"} aria-pressed={!!selected.locked} title={selected.locked ? "Remove the lock (⌘L)" : "Lock this page (⌘L)"}
                    className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ color: selected.locked ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
                    {selected.locked ? <Lock size={14} /> : <LockOpen size={14} />}
                  </button>
                )}
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

              <div className="relative flex-1 min-h-0"
                onDragEnter={(e) => { if (user && Array.from(e.dataTransfer.types).includes("Files")) setDropping(true); }}>
                {dropping && user && (
                  <PhotoDropOverlay
                    onLeave={() => setDropping(false)}
                    onCover={(files) => attachPhotos(user.uid, selected.id, files, true)}
                    onPage={(files) => attachPhotos(user.uid, selected.id, files, false)}
                  />
                )}
                {selected.shut ? <LockedPanel entry={selected} /> : <TipTapEditor
                  entryId={selected.id}
                  content={selected.content}
                  onChange={(json) => autosave.schedule(selected.id, { content: json })}
                  toolbar={false}
                  stats
                  zen={zen}
                  statsExtra={<span className="md:hidden"><SaveIndicator status={autosave.status} /></span>}
                  header={
                    <div className="relative mb-6">
                      {hasPhotos && <div className="absolute right-0 top-0 z-10"><PhotoPile entry={selected} /></div>}
                      <div className={`flex flex-wrap items-end gap-x-5 gap-y-4 mb-5 ${hasPhotos ? "pr-[100px] md:pr-[136px] min-h-[92px] md:min-h-[120px] items-start" : ""}`}>
                        <div className="min-w-0 pb-1">
                          <p className="font-sans text-[12.5px] font-medium mb-2.5" style={{ color: "var(--bj-ink3)" }}>
                            {selected.createdAt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · {selected.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }}>
                            <FeelingPicker value={selected.feeling} onChange={(feeling) => patchSelected({ feeling: feeling ?? "" })} />
                            {user && <PhotoStack entry={selected} uid={user.uid} />}
                            {user && <FolderChip uid={user.uid} entry={selected} />}
                            <TagEditor tags={selected.tags} onChange={(tags) => patchSelected({ tags })} />
                          </div>
                        </div>
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
                />}
              </div>
            </>
          ) : !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="font-display italic text-2xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                {entries.length ? "Pick an entry, or begin a new page" : "A quiet place to begin"}
              </p>
              <button type="button" onClick={handleNew}
                className="bj-gold font-sans text-sm font-semibold px-4 h-10 rounded-xl flex items-center gap-2">
                <Plus size={14} /> New entry <span className="opacity-60 text-xs">⌘⇧N</span>
              </button>
            </div>
          ) : null}
          </div>
          {selected && companionOpen && !zen && (
            <aside aria-label="Beside this page" className="hidden xl:block w-[300px] shrink-0 h-full">
              <Companion entry={selected} entries={entries} onClose={() => setCompanionOpen(false)} />
            </aside>
          )}
          {selected && user && <PhotoGallery entry={selected} uid={user.uid} />}
          {selected && user && <PhotoViewer entry={selected} uid={user.uid} />}
          <LockCodeWindow />
        </section>
      </div>

      {/* Mobile: entry sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div key="es-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 md:hidden" style={{ background: "var(--m-scrim)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} onClick={() => setShowSheet(false)} />
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
