"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { create } from "zustand";
import { Folder, FolderOpen, Lock, LockOpen, Plus, MoreHorizontal, ChevronDown, Loader2, Library } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";
import { useLocks, createLockCode, unlockWith } from "@/lib/locks";
import { useFolders, createFolder, renameFolder, setFolderLockedFlag, removeFolder, type JournalFolder } from "@/services/folder.service";
import { moveEntry, resealFolder } from "@/services/journal.service";
import type { JournalEntry } from "@/types";

/* ──────────────────────────────────────────────────────────────
   Folders and locks for the journal: the folder switcher at the top
   of the list, the folder chip on a page, the lock-code window, and
   the panel a locked page shows until its code is entered.
   ────────────────────────────────────────────────────────────── */

const LABEL = "font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em]";
const FIELD = "bj-well w-full h-11 px-3.5 rounded-[12px] outline-none font-sans text-[14px]";

// ── The lock-code window (choose one the first time, enter it after) ──

interface PromptState { open: boolean; resolve: ((ok: boolean) => void) | null; reason: string }
const usePrompt = create<PromptState>(() => ({ open: false, resolve: null, reason: "" }));

/** Make sure the lock key is available, asking for (or setting up) the lock code. */
export function ensureLockKey(reason = "Enter your lock code"): Promise<boolean> {
  if (useLocks.getState().key) return Promise.resolve(true);
  return new Promise((resolve) => usePrompt.setState({ open: true, resolve, reason }));
}

export function LockCodeWindow() {
  const open = usePrompt((s) => s.open);
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(<AnimatePresence>{open && <LockCodeCard key="lc" />}</AnimatePresence>, document.body);
}

function LockCodeCard() {
  const reason = usePrompt((s) => s.reason);
  const hasCode = useLocks((s) => !!s.doc);
  const known = useLocks((s) => s.known);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, [hasCode]);

  const finish = (ok: boolean) => { const r = usePrompt.getState().resolve; usePrompt.setState({ open: false, resolve: null }); r?.(ok); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(false); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !known) return;
    setError(null);
    if (!hasCode) {
      if (a.length < 4) return setError("Use at least 4 characters.");
      if (a !== b) return setError("Those two don’t match.");
      setBusy(true);
      try { await createLockCode(a); finish(true); } catch (err) { setError((err as Error).message); setBusy(false); }
      return;
    }
    setBusy(true);
    const ok = await unlockWith(a);
    setBusy(false);
    if (ok) finish(true); else { setError("That’s not your lock code."); setA(""); }
  }

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bj-scrim" onClick={() => finish(false)}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }} />
      <motion.form onSubmit={submit} role="dialog" aria-modal="true" aria-label={hasCode ? "Enter your lock code" : "Choose a lock code"}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="bj-window relative w-full max-w-[400px] rounded-[24px] px-7 pt-7 pb-6 flex flex-col items-center text-center">
        <span className="bj-glass w-14 h-14 rounded-[18px] flex items-center justify-center mb-4"><Lock size={22} style={{ color: "var(--bj-gold)" }} /></span>
        <h2 className="font-display" style={{ fontSize: 26, lineHeight: 1.1, color: "var(--bj-ink)", fontWeight: 500 }}>{hasCode ? reason : "Choose a lock code"}</h2>
        <p className="mt-2 mb-5 font-sans text-[13px] leading-relaxed" style={{ color: "var(--bj-ink3)" }}>
          {hasCode
            ? "Locked pages and folders open together, and lock again when you’ve been away a while."
            : "One code for every page and folder you lock. Titles and dates stay visible; the writing is sealed. If you forget this code, locked writing can’t be opened — by anyone."}
        </p>
        <input ref={ref} type="password" autoComplete={hasCode ? "current-password" : "new-password"} value={a} onChange={(e) => setA(e.target.value)}
          placeholder={hasCode ? "Lock code" : "New lock code"} aria-label={hasCode ? "Lock code" : "New lock code"} className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
        {!hasCode && (
          <input type="password" autoComplete="new-password" value={b} onChange={(e) => setB(e.target.value)} placeholder="Once more" aria-label="Confirm lock code"
            className={`${FIELD} mt-2.5`} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
        )}
        {error && <p role="alert" className="w-full text-left mt-2 font-sans text-[12.5px]" style={{ color: "var(--bj-ember)" }}>{error}</p>}
        <div className="w-full flex gap-2 mt-5">
          <button type="button" onClick={() => finish(false)} className="bj-raised bj-lift flex-1 h-11 rounded-[12px] font-sans text-[13.5px] font-medium" style={{ color: "var(--bj-ink2)" }}>Cancel</button>
          <button type="submit" disabled={busy || !known} className="bj-gold flex-1 h-11 rounded-[12px] flex items-center justify-center gap-2 font-sans text-[13.5px] font-semibold disabled:opacity-60">
            {busy && <Loader2 size={14} className="animate-spin" />}{hasCode ? "Unlock" : "Set lock code"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

// ── A locked page, shut ──

export function LockedPanel({ entry }: { entry: JournalEntry }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, [entry.id]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || busy) return;
    setBusy(true); setError(false);
    const ok = await unlockWith(code);
    setBusy(false);
    if (!ok) { setError(true); setCode(""); }
  }
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[640px] mx-auto px-6 md:px-10 pt-10 pb-16">
        <p className="font-sans text-[12.5px] font-medium mb-3" style={{ color: "var(--bj-ink3)" }}>
          {entry.createdAt.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} · {entry.createdAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </p>
        <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: "var(--bj-ink)", lineHeight: 1.12 }}>{entry.title || "Untitled"}</h1>
        <form onSubmit={submit} className="bj-raised rounded-[20px] mt-8 p-6 flex flex-col items-center text-center">
          <span className="bj-glass w-12 h-12 rounded-[16px] flex items-center justify-center mb-3"><Lock size={20} style={{ color: "var(--bj-gold)" }} /></span>
          <p className="font-display text-[22px]" style={{ color: "var(--bj-ink)" }}>This page is locked</p>
          <p className="font-sans text-[13px] mt-1 mb-4" style={{ color: "var(--bj-ink4)" }}>Enter your lock code to read and write here.</p>
          <div className="w-full max-w-[320px] flex gap-2">
            <input ref={ref} type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Lock code" aria-label="Lock code" autoComplete="current-password"
              className={`${FIELD} flex-1`} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
            <button type="submit" disabled={busy || !code} className="bj-gold h-11 px-4 rounded-[12px] flex items-center gap-1.5 font-sans text-[13px] font-semibold disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <LockOpen size={14} />} Open
            </button>
          </div>
          {error && <p role="alert" className="mt-2 font-sans text-[12.5px]" style={{ color: "var(--bj-ember)" }}>That’s not your lock code.</p>}
        </form>
      </div>
    </div>
  );
}

// ── Little menu ──

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
    document.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key, true);
    return () => { document.removeEventListener("pointerdown", down); window.removeEventListener("keydown", key, true); };
  }, [open, close]);
  return ref;
}

function Item({ icon, label, onClick, danger, hint }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; hint?: string }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className="bj-menu-item w-full flex items-center gap-2.5 h-9 px-2.5 rounded-[9px] font-sans text-[13px] text-left"
      style={{ color: danger ? "var(--bj-ember)" : "var(--bj-ink2)" }}>
      <span className="shrink-0 flex" style={{ color: danger ? "var(--bj-ember)" : "var(--bj-ink4)" }}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {hint && <span className="font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}>{hint}</span>}
    </button>
  );
}

const pop = { initial: { opacity: 0, scale: 0.97, y: -4 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.98, transition: { duration: 0.1 } }, transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] as const } };

// ── The switcher at the top of the list ──

export function FolderSwitcher({ uid, current, onPick, entries }: {
  uid: string; current: string | null; onPick: (id: string | null) => void; entries: JournalEntry[];
}) {
  const folders = useFolders((s) => s.folders);
  const unlocked = useLocks((s) => !!s.key);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const close = () => { setOpen(false); setAdding(false); setMenu(null); setRenaming(null); };
  const ref = useOutside(open, close);
  const count = (id: string | null) => entries.filter((e) => (id ? e.folderId === id : true)).length;
  const cur = folders.find((f) => f.id === current);
  const plain = folders.filter((f) => !f.locked), locked = folders.filter((f) => f.locked);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = createFolder(uid, name);
    setName(""); setAdding(false); onPick(id); setOpen(false);
  }

  async function toggleLock(f: JournalFolder) {
    setMenu(null); setError(null);
    if (!(await ensureLockKey(f.locked ? "Enter your lock code to remove the lock" : "Enter your lock code"))) return;
    try {
      await setFolderLockedFlag(uid, f.id, !f.locked);
      await resealFolder(uid, f.id, entries, !f.locked);
    } catch (err) { setError((err as Error).message); }
  }

  async function drop(f: JournalFolder) {
    setMenu(null); setError(null);
    const inside = entries.filter((e) => e.folderId === f.id);
    if (!window.confirm(`Delete “${f.name}”? Its ${inside.length} page${inside.length === 1 ? "" : "s"} stay in your journal, outside any folder.`)) return;
    if (f.locked && inside.length && !(await ensureLockKey("Enter your lock code to delete this folder"))) return;
    try {
      // Pages leave a locked folder unlocked (unless they're locked on their own).
      await setFolderLockedFlag(uid, f.id, false);
      await Promise.all(inside.map((e) => moveEntry(uid, e, null)));
      await removeFolder(uid, f.id);
      if (current === f.id) onPick(null);
    } catch (err) { setError((err as Error).message); }
  }

  const row = (f: JournalFolder | null) => {
    const id = f?.id ?? null;
    const on = current === id;
    if (f && renaming === f.id) {
      return (
        <form key={id} onSubmit={(e) => { e.preventDefault(); void renameFolder(uid, f.id, name); setRenaming(null); setName(""); }} className="px-1 py-0.5">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setRenaming(null)} aria-label="Folder name"
            className="bj-well w-full h-9 px-2.5 rounded-[9px] outline-none font-sans text-[13px]" style={{ color: "var(--bj-ink)" }} />
        </form>
      );
    }
    return (
      <div key={id ?? "all"} className="group relative">
        <button type="button" onClick={() => { onPick(id); close(); }} data-active={on ? "" : undefined}
          className={`bj-nav-item w-full flex items-center gap-2.5 h-9 pl-2.5 pr-9 rounded-[10px] font-sans text-[13px] text-left ${on ? "bj-raised" : ""}`}
          style={{ color: on ? "var(--bj-ink)" : "var(--bj-ink2)", fontWeight: on ? 500 : 400, border: on ? undefined : "1px solid transparent" }}>
          <span className="shrink-0 flex" style={{ color: f?.locked || on ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
            {!f ? <Library size={14} /> : f.locked ? (unlocked ? <LockOpen size={14} /> : <Lock size={14} />) : on ? <FolderOpen size={14} /> : <Folder size={14} />}
          </span>
          <span className="flex-1 truncate">{f ? f.name : "All pages"}</span>
          <span className="font-sans text-[11px] shrink-0 group-hover:opacity-0" style={{ color: "var(--bj-ink4)", fontVariantNumeric: "tabular-nums" }}>{count(id)}</span>
        </button>
        {f && (
          <button type="button" onClick={() => setMenu(menu === f.id ? null : f.id)} aria-label={`${f.name} options`} aria-haspopup="menu" aria-expanded={menu === f.id}
            className="bj-btn-icon absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
            style={{ color: "var(--bj-ink3)" }}>
            <MoreHorizontal size={14} />
          </button>
        )}
        <AnimatePresence>
          {f && menu === f.id && (
            <motion.div role="menu" {...pop} style={{ transformOrigin: "top right" }} className="bj-menu absolute right-0 top-[calc(100%+4px)] z-20 w-[210px] p-1 rounded-[13px]">
              <Item icon={<Folder size={14} />} label="Rename" onClick={() => { setMenu(null); setName(f.name); setRenaming(f.id); }} />
              <Item icon={f.locked ? <LockOpen size={14} /> : <Lock size={14} />} label={f.locked ? "Remove the lock" : "Lock this folder"} onClick={() => void toggleLock(f)} />
              <Item icon={<MoreHorizontal size={14} />} label="Delete folder" danger onClick={() => void drop(f)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => (open ? close() : setOpen(true))} aria-expanded={open} aria-haspopup="true"
        className="bj-raised bj-lift w-full h-9 px-3 rounded-xl flex items-center gap-2 font-sans text-[13px] text-left" style={{ color: "var(--bj-ink2)" }}>
        <span className="shrink-0 flex" style={{ color: cur?.locked ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
          {!cur ? <Library size={14} /> : cur.locked ? (unlocked ? <LockOpen size={14} /> : <Lock size={14} />) : <FolderOpen size={14} />}
        </span>
        <span className="flex-1 truncate font-medium" style={{ color: "var(--bj-ink)" }}>{cur?.name ?? "All pages"}</span>
        <span className="font-sans text-[11px]" style={{ color: "var(--bj-ink4)" }}>{count(current)}</span>
        <ChevronDown size={14} style={{ color: "var(--bj-ink4)", transform: open ? "rotate(180deg)" : undefined, transition: "transform .16s var(--ease-out)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...pop} style={{ transformOrigin: "top center" }} className="bj-menu absolute left-0 right-0 top-[calc(100%+6px)] z-30 p-1.5 rounded-[14px] flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto">
            {row(null)}
            {plain.map(row)}
            {locked.length > 0 && <p className={`${LABEL} px-2.5 pt-2.5 pb-1`} style={{ color: "var(--bj-ink4)" }}>Locked</p>}
            {locked.map(row)}
            {adding ? (
              <form onSubmit={add} className="px-1 pt-1">
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" aria-label="New folder name"
                  onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setAdding(false); } }}
                  className="bj-well w-full h-9 px-2.5 rounded-[9px] outline-none font-sans text-[13px]" style={{ color: "var(--bj-ink)" }} />
              </form>
            ) : (
              <button type="button" onClick={() => { setName(""); setAdding(true); }} className="tv-dashed mt-1 h-9 rounded-[10px] flex items-center justify-center gap-1.5 font-sans text-[12.5px]" style={{ color: "var(--bj-ink4)" }}>
                <Plus size={13} /> New folder
              </button>
            )}
            {error && <p role="alert" className="px-2 py-1 font-sans text-[12px]" style={{ color: "var(--bj-ember)" }}>{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── The folder chip on a page ──

export function FolderChip({ uid, entry }: { uid: string; entry: JournalEntry }) {
  const folders = useFolders((s) => s.folders);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const close = () => { setOpen(false); setAdding(false); };
  const ref = useOutside(open, close);
  const cur = folders.find((f) => f.id === entry.folderId);

  async function moveTo(id: string | null) {
    close(); setError(null);
    if (id === (entry.folderId ?? null)) return;
    const needs = folders.find((f) => f.id === id)?.locked || cur?.locked;
    if (needs && !(await ensureLockKey())) return;
    try { await moveEntry(uid, entry, id); } catch (err) { setError((err as Error).message); }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} title="Move to folder"
        className="bj-chip h-7 pl-2 pr-2.5 rounded-full inline-flex items-center gap-1.5 font-sans text-[12px]"
        style={{ color: cur ? "var(--bj-ink2)" : "var(--bj-ink4)", border: cur ? "1px solid var(--bj-line)" : "1px dashed var(--bj-line)" }}>
        {cur?.locked ? <Lock size={12} style={{ color: "var(--bj-gold)" }} /> : <Folder size={12} />}
        {cur?.name ?? "Folder"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" {...pop} style={{ transformOrigin: "top left" }} className="bj-menu absolute left-0 top-[calc(100%+6px)] z-30 w-[230px] p-1 rounded-[13px]">
            <Item icon={<Library size={14} />} label="No folder" hint={!entry.folderId ? "✓" : undefined} onClick={() => void moveTo(null)} />
            {folders.map((f) => (
              <Item key={f.id} icon={f.locked ? <Lock size={14} /> : <Folder size={14} />} label={f.name} hint={f.id === entry.folderId ? "✓" : undefined} onClick={() => void moveTo(f.id)} />
            ))}
            {adding ? (
              <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; const id = createFolder(uid, name); setName(""); void moveTo(id); }} className="p-1">
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" aria-label="New folder name"
                  className="bj-well w-full h-9 px-2.5 rounded-[9px] outline-none font-sans text-[13px]" style={{ color: "var(--bj-ink)" }} />
              </form>
            ) : (
              <Item icon={<Plus size={14} />} label="New folder…" onClick={() => setAdding(true)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p role="alert" className="absolute left-0 top-[calc(100%+4px)] whitespace-nowrap font-sans text-[11.5px]" style={{ color: "var(--bj-ember)" }}>{error}</p>}
    </div>
  );
}

