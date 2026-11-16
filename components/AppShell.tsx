"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Moon, Sun, LogOut, Flame, Palette, X, Keyboard,
  ChevronLeft, ChevronRight, ChevronDown, BookOpen, PenLine, Wrench, Settings,
} from "lucide-react";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { usePrefsStore, useSettingsUi } from "@/store/prefs.store";
import { useKeySounds } from "@/hooks/useWritingSurface";
import { ShortcutsPanel } from "@/components/ShortcutsPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { BibleFloatTriggers, FloatingBible, FloatingAsk } from "@/components/shared/FloatingWindows";
import pkg from "@/version.json";
import { useThemeStore } from "@/store/theme.store";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/services/auth.service";
import { useStreakStore } from "@/store/streak.store";
import { useReadingStore, chaptersReadIn } from "@/store/reading.store";
import { CHAPTER_COUNTS } from "@/lib/bible-books";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { useWritingStore } from "@/store/writing.store";
import { startEntry } from "@/lib/startEntry";
import { lastInputWasKeyboard } from "@/lib/inputMode";
import { NAV_GROUPS, NAV_ITEMS, MOBILE_TABS, isActive, keySequence, type NavItem } from "@/lib/nav";
import type { ThemeId } from "@/lib/themes";
import { TypePicker } from "@/components/TypePicker";

const THEME_COLORS: Record<ThemeId, string> = {
  warm: "#C9A96E",
  slate: "#6E9EB0",
  forest: "#6E9E8A",
  plum: "#B07BAC",
  midnight: "#4A5080",
  dusk: "#5B6E9E",
};


const THEME_OPTIONS: { id: ThemeId; label: string }[] = [
  { id: "warm", label: "Warm" },
  { id: "slate", label: "Slate" },
  { id: "forest", label: "Forest" },
  { id: "plum", label: "Plum" },
  { id: "dusk", label: "Dusk" },
  { id: "midnight", label: "Midnight" },
];

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v === null ? fallback : v === "true"; } catch { return fallback; }
}
function writeBool(key: string, v: boolean) {
  try { localStorage.setItem(key, String(v)); } catch { /* private mode */ }
}

function isEditable(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
}

function Logo({ size = 24 }: { size?: number }) {
  return (
    <div className="bj-gold rounded-lg flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
        <path d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z" fill="white" fillOpacity="0.5" />
      </svg>
    </div>
  );
}

function Avatar({ size, photo, initial }: { size: number; photo?: string | null; initial: string }) {
  const [failed, setFailed] = useState(false);
  return photo && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="rounded-full shrink-0 object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-full shrink-0 flex items-center justify-center font-medium"
      style={{ width: size, height: size, fontSize: size * 0.42, background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}>
      {initial}
    </div>
  );
}

/** The raised pill under the current page — it slides to the next one (instantly after a key press). */
function ActivePill({ id, className }: { id: string; className: string }) {
  return (
    <motion.span layoutId={id} aria-hidden="true" className={`bj-raised absolute inset-0 ${className}`}
      transition={lastInputWasKeyboard() ? { duration: 0 } : { type: "spring", duration: 0.38, bounce: 0.14 }} />
  );
}

function NavLink({ item, active, compact, pill }: { item: NavItem; active: boolean; compact: boolean; pill: string }) {
  const Icon = item.icon;
  if (compact) {
    return (
      <Link href={item.href} title={item.label} aria-label={item.label} aria-current={active ? "page" : undefined}
        className="bj-nav-item relative flex items-center justify-center w-10 h-10 rounded-xl mb-0.5 mx-auto"
        data-active={active || undefined}
        style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)" }}>
        {active && <ActivePill id={pill} className="rounded-xl" />}
        <Icon size={16} className="relative shrink-0" />
      </Link>
    );
  }
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} data-active={active || undefined}
      className="bj-nav-item group relative flex items-center gap-2.5 px-3 h-8 rounded-lg mb-px font-sans"
      style={{ color: active ? "var(--bj-ink)" : "var(--bj-ink2)", fontWeight: active ? 500 : 400, border: "1px solid transparent" }}>
      {active && <ActivePill id={pill} className="rounded-lg" />}
      <Icon size={14} className="relative shrink-0" style={{ color: active ? "var(--bj-gold)" : "var(--bj-ink4)" }} />
      <span className="relative text-[13px] flex-1 truncate">{item.label}</span>
    </Link>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}

export function AppShell({ children, rightRail }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { themeId, setTheme } = useThemeStore();
  const { user } = useAuth();
  const { streak, weekDots } = useStreakStore();
  const lastRead = useReadingStore((s) => s.last);
  const readMap = useReadingStore((s) => s.read);
  const bookTotal = lastRead ? CHAPTER_COUNTS[lastRead.book] ?? 1 : 1;
  const bookDone = lastRead ? chaptersReadIn(readMap, lastRead.book) : 0;
  const zen = useWritingStore((s) => s.zen);

  const bibleOpen = useFloatWindowsStore((s) => s.bibleOpen);
  const askOpen = useFloatWindowsStore((s) => s.askOpen);
  const toggleBible = useFloatWindowsStore((s) => s.toggleBible);
  const toggleAsk = useFloatWindowsStore((s) => s.toggleAsk);
  const closeBible = useFloatWindowsStore((s) => s.closeBible);
  const closeAsk = useFloatWindowsStore((s) => s.closeAsk);

  const [showProfile, setShowProfile] = useState<"sidebar" | "topbar" | null>(null);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const isCompact = usePrefsStore((s) => s.compactSidebar);
  const setPrefs = usePrefsStore((s) => s.set);
  const showSettings = useSettingsUi((s) => s.show);
  // Phones get the Settings page; anything wider gets the ⌘, window.
  const openSettings = useCallback((section?: string) => {
    if (window.matchMedia("(min-width: 768px)").matches) showSettings(section);
    else router.push("/settings");
  }, [showSettings, router]);
  const openSettingsRef = useRef(openSettings);
  useEffect(() => { openSettingsRef.current = openSettings; }, [openSettings]);
  // Keyboard sounds anywhere you type (the listener is shared and ref-counted).
  useKeySounds();
  const [toolsOpen, setToolsOpen] = useState(() => readBool("bj-sidebar-tools", false));
  const [gPending, setGPending] = useState(false);
  const [mac, setMac] = useState(true);
  const appearanceRef = useRef<HTMLDivElement>(null);
  const appearancePopRef = useRef<HTMLDivElement>(null);
  // The appearance popover portals to <body> (the glass sidebar would clip it).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const profileRef = useRef<HTMLDivElement>(null);
  const topProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMac(isMac()); }, []);
  useEffect(() => { setShowDrawer(false); setShowProfile(null); }, [pathname]);

  function toggleCompact() { setPrefs({ compactSidebar: !isCompact }); }
  function toggleTools() { setToolsOpen((o) => { writeBool("bj-sidebar-tools", !o); return !o; }); }
  const write = useCallback(() => { if (user) void startEntry(user.uid, router.push); }, [user, router]);
  const writeRef = useRef(write);
  useEffect(() => { writeRef.current = write; }, [write]);

  const isDark = themeId === "midnight" || themeId === "dusk";
  const toggleTheme = () => { setPrefs({ mode: "manual" }); setTheme(isDark ? "warm" : "dusk"); };

  // ── Global keyboard ──
  // ⌘K palette · ⌘/ shortcuts · ⌘⌥B Bible · ⌘⇧A Ask — all work inside editors.
  // Navigation is "G then letter" outside text fields, so no browser
  // shortcut (⌘L, ⌘D, ⌘S, ⌘P, ⌘W, ⌘T…) is ever taken away.
  useEffect(() => {
    let gTimer: ReturnType<typeof setTimeout> | undefined;
    let g = false;
    let lastKeyAt = 0; // a "g" typed mid-word (focus lost while writing) must not navigate
    const setG = (v: boolean) => {
      g = v; setGPending(v); clearTimeout(gTimer);
      // Cleared a tick later so the second key's other listeners still see it pending.
      keySequence.gPendingUntil = v ? performance.now() + 1200 : performance.now() + 50;
      if (v) gTimer = setTimeout(() => setG(false), 1200);
    };

    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && !e.altKey && e.code === "KeyK") { e.preventDefault(); setShowPalette((o) => !o); return; }
      if (mod && e.code === "Slash") { e.preventDefault(); setShowShortcuts((o) => !o); return; }
      if (mod && !e.shiftKey && !e.altKey && e.code === "Comma") { e.preventDefault(); const ui = useSettingsUi.getState(); if (ui.open) ui.close(); else openSettingsRef.current(); return; }
      if (mod && e.altKey && e.code === "KeyB") { e.preventDefault(); toggleBible(); return; }
      if (mod && e.shiftKey && e.code === "KeyA") { e.preventDefault(); toggleAsk(); return; }
      // The journal handles its own ⌘⇧N (it keeps the list in place).
      if (mod && e.shiftKey && e.code === "KeyN" && !window.location.pathname.startsWith("/journal")) { e.preventDefault(); writeRef.current(); return; }
      if (mod || e.altKey || isEditable(e.target) || e.defaultPrevented) { if (g) setG(false); return; }

      const key = e.key.toLowerCase();
      if (g) {
        setG(false);
        const dest = NAV_ITEMS.find((n) => n.g === key);
        if (dest) { e.preventDefault(); router.push(dest.href); }
        return;
      }
      const now = performance.now();
      const typing = now - lastKeyAt < 500;
      if (e.key.length === 1) lastKeyAt = now;
      if (key === "g" && !e.shiftKey && !typing) { setG(true); return; }
      if (e.key === "?") { e.preventDefault(); setShowShortcuts(true); }
    }
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); clearTimeout(gTimer); };
  }, [router, toggleBible, toggleAsk]);
  // Popovers close on outside click / Esc.
  useEffect(() => {
    if (!showAppearance && !showProfile) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (showAppearance && appearanceRef.current && !appearanceRef.current.contains(t) && !appearancePopRef.current?.contains(t)) setShowAppearance(false);
      if (showProfile) {
        const ref = showProfile === "sidebar" ? profileRef : topProfileRef;
        if (ref.current && !ref.current.contains(t)) setShowProfile(null);
      }
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") { setShowAppearance(false); setShowProfile(null); } }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [showAppearance, showProfile]);

  const current = NAV_ITEMS.find((n) => isActive(pathname, n.href));
  const initial = (Array.from((user?.displayName || user?.email || "U").trim())[0] ?? "U").toUpperCase();
  const modKey = mac ? "⌘" : "Ctrl ";

  const profileMenu = (where: "sidebar" | "topbar") => (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: where === "sidebar" ? 4 : -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
      className={`absolute rounded-xl overflow-hidden border w-60 ${where === "sidebar" ? "bottom-full mb-1.5 left-0" : "top-full mt-2 right-0"}`}
      style={{
        transformOrigin: where === "sidebar" ? "bottom left" : "top right",
        background: "var(--m-pop-bg)", backdropFilter: "blur(24px) saturate(170%)", WebkitBackdropFilter: "blur(24px) saturate(170%)", borderColor: "var(--m-edge)", boxShadow: "var(--bj-shadow-lg)", zIndex: 100,
      }}
    >
      <div className="px-4 py-3.5 border-b flex items-center gap-3" style={{ borderColor: "var(--bj-line-soft)" }}>
        <Avatar size={36} photo={user?.photoURL} initial={initial} />
        <div className="min-w-0">
          <p className="font-sans text-sm font-medium truncate" style={{ color: "var(--bj-ink)" }}>{user?.displayName ?? "Account"}</p>
          <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink4)" }}>{user?.email ?? "—"}</p>
        </div>
      </div>
      <button type="button" onClick={() => { setShowProfile(null); openSettings(); }}
        className="bj-btn-ghost flex items-center gap-2 w-full px-4 h-10 font-sans text-[13px]" style={{ color: "var(--bj-ink2)" }}>
        <Settings size={13} /> <span className="flex-1 text-left">Settings</span>
        <kbd className="bj-kbd">{modKey},</kbd>
      </button>
      <button type="button" onClick={() => { setShowProfile(null); setShowShortcuts(true); }}
        className="bj-btn-ghost flex items-center gap-2 w-full px-4 h-10 font-sans text-[13px]" style={{ color: "var(--bj-ink2)" }}>
        <Keyboard size={13} /> <span className="flex-1 text-left">Keyboard shortcuts</span>
        <kbd className="bj-kbd">{modKey}/</kbd>
      </button>
      <button type="button" onClick={() => signOutUser()}
        className="bj-btn-ghost flex items-center gap-2 w-full px-4 h-10 font-sans text-[13px] border-t"
        style={{ color: "var(--bj-ember)", borderColor: "var(--bj-line-soft)" }}>
        <LogOut size={13} /> Sign out
      </button>
      <p className="px-4 py-2 font-sans text-[10.5px] border-t" style={{ color: "var(--bj-ink4)", borderColor: "var(--bj-line-soft)" }}>
        v{pkg.version} · <span className="italic">{pkg.codename}</span>
      </p>
    </motion.div>
  );

  const navGroups = (compact: boolean, pill = "nav-pill") => NAV_GROUPS.map((group) => {
    const folded = !!group.fold && !toolsOpen && !compact;
    const shown = folded
      ? group.items.filter((i, idx) => idx < group.fold! || isActive(pathname, i.href))
      : group.items;
    const hidden = group.items.length - shown.length;
    return (
      <div key={group.id} className={group.id === "main" ? "" : "mt-4"}>
        {group.label && (compact ? (
          <div className="my-2 mx-auto w-6 h-px" style={{ background: "var(--bj-line-soft)" }} />
        ) : (
          <p className="px-3 h-6 mb-0.5 flex items-center font-sans text-[10.5px] font-semibold uppercase" style={{ color: "var(--bj-ink4)", letterSpacing: "0.07em" }}>
            {group.label}
          </p>
        ))}
        {(compact && group.fold ? group.items.slice(0, group.fold) : shown).map((item) => (
          <div key={item.href}>
            <NavLink item={item} active={isActive(pathname, item.href)} compact={compact} pill={pill} />
            {item.href === "/bible" && !compact && continueRow}
          </div>
        ))}
        {!compact && group.fold && (hidden > 0 || toolsOpen) && (
          <button type="button" onClick={toggleTools} aria-expanded={toolsOpen}
            className="bj-btn-ghost w-full flex items-center gap-2.5 px-3 h-7 rounded-lg font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }}>
            <ChevronDown size={13} style={{ transform: toolsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s var(--ease-out)" }} />
            {toolsOpen ? "Show less" : `${hidden} more`}
          </button>
        )}
      </div>
    );
  });

  const continueRow = lastRead && !pathname.startsWith("/bible") ? (
    <Link href={`/bible?book=${encodeURIComponent(lastRead.book)}&chapter=${lastRead.chapter}`}
      className="bj-raised bj-lift mx-1 mt-1 mb-1 px-3 py-2.5 rounded-xl block"
      title={`Continue reading ${lastRead.book} ${lastRead.chapter}`}>
      <span className="flex items-center gap-2.5">
        <BookOpen size={13} style={{ color: "var(--bj-gold)", flexShrink: 0 }} />
        <span className="font-sans text-[12px] truncate min-w-0" style={{ color: "var(--bj-ink3)" }}>
          Continue · <b className="font-medium" style={{ color: "var(--bj-ink)" }}>{lastRead.book} {lastRead.chapter}</b>
        </span>
      </span>
      <span className="bj-well block h-[4px] rounded-full mt-2 overflow-hidden" style={{ border: 0 }}
        aria-label={`${bookDone} of ${bookTotal} chapters of ${lastRead.book} read`}>
        <span className="bj-glow block h-full rounded-full" style={{ width: `${Math.max(4, Math.round((bookDone / bookTotal) * 100))}%`, background: "linear-gradient(90deg, var(--bj-gold), color-mix(in oklch, var(--bj-gold), white 25%))" }} />
      </span>
    </Link>
  ) : null;

  const streakRow = (
    <div className="bj-raised mx-2 mb-2 px-3 py-2.5 rounded-xl flex items-center gap-2.5"
      title={streak > 0 ? `${streak}-day streak` : "Write today to start a streak"}>
      <Flame size={13} style={{ color: streak > 0 ? "var(--bj-gold)" : "var(--bj-ink4)", flexShrink: 0 }} />
      <span className="font-sans text-[12px] font-medium" style={{ color: streak > 0 ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}>
        {streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "No streak"}
      </span>
      <div className="flex gap-1 ml-auto" aria-hidden="true">
        {weekDots.map((dot, i) => (
          <div key={i} title={dot.label} className={`w-2 h-2 rounded-full ${dot.on ? "bj-glow" : ""}`}
            style={{ background: dot.on ? "var(--bj-gold)" : "var(--bj-line)" }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bj-ambient flex h-screen">

      {/* ── Desktop sidebar ─────────────────────────── */}
      {!zen && (
        <aside
          aria-label="Main navigation"
          className="bj-glass hidden md:flex flex-col shrink-0 h-full"
          style={{ width: isCompact ? 64 : 232, borderWidth: "0 1px 0 0", borderRadius: 0, boxShadow: "none" }}
        >
          {/* Brand */}
          {isCompact ? (
            <div className="flex flex-col items-center gap-1.5 pt-4 pb-2">
              <Logo size={32} />
              <button type="button" onClick={toggleCompact} title="Expand sidebar" aria-label="Expand sidebar"
                className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                <ChevronRight size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 pt-4 pb-3">
              <Logo />
              <span className="font-display text-[15px] font-medium flex-1" style={{ color: "var(--bj-ink)", letterSpacing: "0.02em" }}>BibJournal</span>
              <button type="button" onClick={toggleCompact} title="Collapse sidebar" aria-label="Collapse sidebar"
                className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                <ChevronLeft size={13} />
              </button>
            </div>
          )}

          {/* Write */}
          {isCompact ? (
            <button type="button" onClick={write} title={`Write (${modKey}⇧N)`} aria-label="Write"
              className="bj-gold w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <PenLine size={16} strokeWidth={2.2} />
            </button>
          ) : (
            <button type="button" onClick={write}
              className="bj-gold mx-3 mb-2 flex items-center gap-2 px-3 h-10 rounded-xl font-sans text-[13.5px] font-semibold">
              <PenLine size={15} strokeWidth={2.2} />
              <span className="flex-1 text-left">Write</span>
              <span className="text-[10.5px] font-medium opacity-60">{modKey}⇧N</span>
            </button>
          )}

          {/* Search */}
          {isCompact ? (
            <button type="button" onClick={() => setShowPalette(true)} title={`Search (${modKey}K)`} aria-label="Search"
              className="bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ color: "var(--bj-ink3)" }}>
              <Search size={15} />
            </button>
          ) : (
            <button type="button" onClick={() => setShowPalette(true)}
              className="bj-well mx-3 mb-3 flex items-center gap-2 px-3 h-8 rounded-lg font-sans text-[13px]"
              style={{ color: "var(--bj-ink4)" }}>
              <Search size={13} />
              <span className="flex-1 text-left">Search</span>
              <kbd className="bj-kbd">{modKey}K</kbd>
            </button>
          )}

          <nav className={`${isCompact ? "px-1" : "px-2"} flex-1 min-h-0 overflow-y-auto pb-3`}>
            {navGroups(isCompact)}
          </nav>

          {!isCompact && streakRow}

          {/* Bottom */}
          <div className={`relative border-t ${isCompact ? "px-1 py-2 flex flex-col items-center gap-0.5" : "px-2 py-2 flex items-center gap-1"}`} style={{ borderColor: "var(--bj-line-soft)" }}>
            <div className={`relative ${isCompact ? "" : "flex-1 min-w-0"}`} ref={profileRef}>
              <button type="button" onClick={() => setShowProfile(showProfile === "sidebar" ? null : "sidebar")}
                aria-expanded={showProfile === "sidebar"} aria-label="Account"
                className={isCompact ? "bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center" : "bj-btn-ghost flex items-center gap-2.5 w-full px-2 h-9 rounded-lg"}>
                <Avatar size={22} photo={user?.photoURL} initial={initial} />
                {!isCompact && (
                  <span className="font-sans text-[13px] flex-1 text-left truncate" style={{ color: "var(--bj-ink2)" }}>
                    {user?.displayName ?? user?.email ?? "Account"}
                  </span>
                )}
              </button>
              <AnimatePresence>{showProfile === "sidebar" && profileMenu("sidebar")}</AnimatePresence>
            </div>

            {/* Appearance */}
            {/* Expanded: the popover anchors to the whole footer so it never runs off-screen. */}
            <div className={isCompact ? "relative" : ""} ref={appearanceRef}>
              <button type="button" onClick={() => setShowAppearance((o) => !o)} title="Appearance" aria-label="Appearance" aria-expanded={showAppearance}
                className={`bj-btn-icon ${isCompact ? "w-10 h-10 rounded-xl" : "w-8 h-8 rounded-lg"} flex items-center justify-center`}
                style={{ color: showAppearance ? "var(--bj-gold-deep)" : "var(--bj-ink3)", background: showAppearance ? "var(--bj-gold-tint)" : "transparent" }}>
                <Palette size={15} />
              </button>
              {mounted && createPortal(
                <AnimatePresence>
                {showAppearance && (
                  <motion.div
                    ref={appearancePopRef}
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="fixed rounded-xl border overflow-y-auto"
                    style={{
                      // Fixed, so the sidebar never clips it.
                      left: isCompact ? 76 : 12, bottom: 64, width: 330, maxWidth: "calc(100vw - 24px)", maxHeight: "min(80vh, 680px)",
                      transformOrigin: "bottom left",
                      background: "var(--m-pop-bg)", backdropFilter: "blur(24px) saturate(170%)", WebkitBackdropFilter: "blur(24px) saturate(170%)", borderColor: "var(--m-edge)", boxShadow: "var(--bj-shadow-lg)", zIndex: 100,
                    }}
                  >
                    <div className="px-3 pt-3 pb-2.5 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                      <p className="font-sans text-[11px] font-medium mb-2" style={{ color: "var(--bj-ink4)" }}>Theme</p>
                      <div className="grid grid-cols-6 gap-1">
                        {THEME_OPTIONS.map((t) => (
                          <button key={t.id} type="button" onClick={() => setTheme(t.id)} title={t.label} aria-label={`${t.label} theme`} aria-pressed={themeId === t.id}
                            className="bj-swatch flex flex-col items-center gap-1">
                            <div className="w-6 h-6 rounded-lg" style={{
                              background: THEME_COLORS[t.id],
                              boxShadow: themeId === t.id ? `0 0 0 2px var(--bj-bg-panel), 0 0 0 3.5px ${THEME_COLORS[t.id]}` : "none",
                            }} />
                            <span className="font-sans" style={{ fontSize: 9.5, color: themeId === t.id ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="font-sans text-[11px] font-medium mb-2" style={{ color: "var(--bj-ink4)" }}>Type</p>
                      <TypePicker />
                    </div>
                    <button type="button" onClick={() => { setShowAppearance(false); openSettings("appearance"); }}
                      className="bj-btn-ghost w-full flex items-center gap-2 px-3 h-10 border-t font-sans text-[12.5px]" style={{ color: "var(--bj-ink3)", borderColor: "var(--bj-line-soft)" }}>
                      <Settings size={13} /> <span className="flex-1 text-left">All settings</span><kbd className="bj-kbd">{modKey},</kbd>
                    </button>
                  </motion.div>
                )}
                </AnimatePresence>,
                document.body,
              )}
            </div>

            <button type="button" onClick={toggleTheme} title={isDark ? "Light theme" : "Dark theme"} aria-label={isDark ? "Light theme" : "Dark theme"}
              className={`bj-btn-icon ${isCompact ? "w-10 h-10 rounded-xl" : "w-8 h-8 rounded-lg"} flex items-center justify-center`} style={{ color: "var(--bj-ink3)" }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </aside>
      )}

      {/* ── Main ───────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {!zen && (
          <header className="hidden md:flex items-center gap-2 pl-6 pr-4 border-b shrink-0"
            style={{ height: 44, borderColor: "var(--bj-line-soft)" }}>
            <span className="font-sans text-[13px] font-medium truncate" style={{ color: "var(--bj-ink2)" }}>{current?.label ?? ""}</span>
            {gPending && (
              <span className="font-sans text-[11.5px] ml-2" style={{ color: "var(--bj-ink4)" }}>
                <kbd className="bj-kbd">G</kbd> then {NAV_ITEMS.filter((n) => n.g).slice(0, 6).map((n) => `${n.g!.toUpperCase()} ${n.label}`).join(" · ")}…
              </span>
            )}
            <div className="flex-1" />
            <button type="button" onClick={() => setShowPalette(true)}
              className="bj-btn-ghost flex items-center gap-2 h-7 pl-2.5 pr-1.5 rounded-lg font-sans text-[12px]"
              style={{ color: "var(--bj-ink4)", border: "1px solid var(--bj-line-soft)" }}>
              <Search size={12} /> Search entries, verses… <kbd className="bj-kbd ml-2">{modKey}K</kbd>
            </button>
            <div className="w-px h-4 mx-1" style={{ background: "var(--bj-line-soft)" }} />
            <BibleFloatTriggers bibleOpen={bibleOpen} askOpen={askOpen} onToggleBible={toggleBible} onToggleAsk={toggleAsk} />
            <div className="relative ml-1" ref={topProfileRef}>
              <button type="button" onClick={() => setShowProfile(showProfile === "topbar" ? null : "topbar")}
                aria-label="Account" aria-expanded={showProfile === "topbar"}
                className="bj-btn-icon w-8 h-8 rounded-full flex items-center justify-center">
                <Avatar size={24} photo={user?.photoURL} initial={initial} />
              </button>
              <AnimatePresence>{showProfile === "topbar" && profileMenu("topbar")}</AnimatePresence>
            </div>
          </header>
        )}

        <div className="flex flex-1 min-h-0">
          <main className="flex-1 overflow-y-auto">
            <div className={`${zen ? "" : "pb-24 md:pb-0"} h-full`}>{children}</div>
          </main>
          {rightRail && !zen && (
            <aside className="hidden xl:flex flex-col w-[300px] shrink-0 h-full border-l overflow-y-auto"
              style={{ background: "var(--bj-bg-panel)", borderColor: "var(--bj-line-soft)" }}>
              {rightRail}
            </aside>
          )}
        </div>
      </div>

      {/* ── Mobile Bible/Ask quick access (the journal has its own toolbar) ── */}
      {!zen && !pathname.startsWith("/journal") && (
        <div className="md:hidden fixed z-40 flex items-center gap-0.5 p-1 rounded-full"
          style={{
            right: 12, bottom: "calc(5.4rem + env(safe-area-inset-bottom))",
            background: "var(--bj-bg-panel)", border: "1px solid var(--bj-line)", boxShadow: "var(--bj-shadow-md)",
          }}>
          <BibleFloatTriggers bibleOpen={bibleOpen} askOpen={askOpen} onToggleBible={toggleBible} onToggleAsk={toggleAsk} />
        </div>
      )}

      {/* ── Mobile tab bar ── */}
      {!zen && (
        <nav aria-label="Main" className="bj-glass md:hidden fixed z-50 flex items-center rounded-[22px] px-1.5"
          style={{ left: 10, right: 10, bottom: "calc(8px + env(safe-area-inset-bottom))", height: 62 }}>
          {[...MOBILE_TABS.slice(0, 2), null, ...MOBILE_TABS.slice(2)].map((item) => {
            if (!item) return (
              <div key="write" className="flex-1 flex justify-center">
                <button type="button" onClick={write} aria-label="Write"
                  className="bj-gold w-[54px] h-[54px] rounded-[18px] flex items-center justify-center" style={{ marginTop: -22 }}>
                  <PenLine size={22} strokeWidth={2.2} />
                </button>
              </div>
            );
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className="bj-btn-icon relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-[52px] rounded-xl"
                style={{ color: active ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
                {active && (
                  <motion.span layoutId="tab-dot" aria-hidden="true" className="bj-glow absolute top-1 w-5 h-[3px] rounded-full"
                    style={{ background: "var(--bj-gold)" }} transition={{ type: "spring", duration: 0.35, bounce: 0.2 }} />
                )}
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="font-sans text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={() => setShowDrawer(true)} aria-label="Tools and more"
            className="bj-btn-icon flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-[52px] rounded-xl"
            style={{ color: MOBILE_TABS.some((t) => isActive(pathname, t.href)) ? "var(--bj-ink4)" : "var(--bj-gold-deep)" }}>
            <Wrench size={20} />
            <span className="font-sans text-[10px] font-medium">More</span>
          </button>
        </nav>
      )}

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div key="drawer-bd" className="fixed inset-0 md:hidden" style={{ background: "var(--m-scrim)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 55 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              onClick={() => setShowDrawer(false)} />
            <motion.div key="drawer" role="dialog" aria-label="Menu"
              className="fixed top-0 left-0 bottom-0 md:hidden flex flex-col w-[280px] max-w-[85vw]"
              style={{
                zIndex: 60, background: "var(--m-pop-bg)", backdropFilter: "blur(24px) saturate(170%)", WebkitBackdropFilter: "blur(24px) saturate(170%)", borderRight: "1px solid var(--bj-line-soft)",
                boxShadow: "var(--bj-shadow-lg)", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)",
              }}
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.3 }}>
              <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
                <Logo />
                <span className="font-display text-[15px] font-medium flex-1" style={{ color: "var(--bj-ink)" }}>BibJournal</span>
                <button type="button" onClick={() => setShowDrawer(false)} aria-label="Close menu"
                  className="bj-btn-icon w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                  <X size={16} />
                </button>
              </div>
              <button type="button" onClick={() => { setShowDrawer(false); setShowPalette(true); }}
                className="bj-btn-ghost mx-3 mb-2 flex items-center gap-2 px-3 h-10 rounded-xl font-sans text-[14px]"
                style={{ color: "var(--bj-ink4)", background: "var(--bj-bg-soft)", border: "1px solid var(--bj-line-soft)" }}>
                <Search size={14} /> Search
              </button>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <nav className="px-2 pb-3">{navGroups(false, "drawer-pill")}</nav>
                {continueRow}
                {streakRow}
              </div>
              <div className="px-2 py-2 border-t shrink-0 flex items-center gap-1" style={{ borderColor: "var(--bj-line-soft)" }}>
                <div className="flex items-center gap-2.5 flex-1 min-w-0 px-2">
                  <Avatar size={26} photo={user?.photoURL} initial={initial} />
                  <span className="font-sans text-[13px] truncate" style={{ color: "var(--bj-ink2)" }}>{user?.displayName ?? user?.email ?? "Account"}</span>
                </div>
                <button type="button" onClick={toggleTheme} aria-label={isDark ? "Light theme" : "Dark theme"}
                  className="bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button type="button" onClick={() => { setShowDrawer(false); router.push("/settings"); }} aria-label="Settings"
                  className="bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
                  <Settings size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShortcutsPanel open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <SettingsModal />
      <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} onShortcuts={() => setShowShortcuts(true)} />

      <AnimatePresence>
        {bibleOpen && <FloatingBible key="float-bible" onClose={closeBible} />}
        {askOpen && <FloatingAsk key="float-ask" onClose={closeAsk} />}
      </AnimatePresence>
    </div>
  );
}
