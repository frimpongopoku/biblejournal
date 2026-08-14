"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, NotebookPen, BookOpen, HeartHandshake,
  Megaphone, Mic, Compass, Network, Search, Plus, Bell, Moon, Sun,
  Settings, LogOut, Flame, Palette, Menu, X, Keyboard,
  ChevronLeft, ChevronRight, GraduationCap, Scroll, BookOpenCheck, Coins, Zap, Handshake, Wheat,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ShortcutsPanel } from "@/components/ShortcutsPanel";
import { BibleFloatTriggers, FloatingBible, FloatingAsk } from "@/components/shared/FloatingWindows";
import pkg from "@/version.json";
import { useThemeStore } from "@/store/theme.store";
import { useFontStore } from "@/store/font.store";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/services/auth.service";
import { useStreakStore } from "@/store/streak.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import type { ThemeId } from "@/lib/themes";
import { fontPairs } from "@/lib/fonts";
import type { FontPairId } from "@/lib/fonts";

const menuItems = [
  { href: "/dashboard",      label: "Today",           icon: LayoutDashboard },
  { href: "/journal",        label: "Journal",          icon: NotebookPen },
  { href: "/bible",          label: "Bible",            icon: BookOpen },
  { href: "/prayer",         label: "Prayer",           icon: HeartHandshake },
  { href: "/sermons",        label: "Sermons",          icon: Mic },
  { href: "/proclamations",  label: "Proclamations",    icon: Megaphone },
  { href: "/learn",          label: "Learning",         icon: GraduationCap },
  { href: "/research",       label: "Research",         icon: Compass },
];

const spaceItems = [
  { href: "/promises",       label: "Promises",         icon: Scroll },
  { href: "/principles",     label: "Principles",       icon: BookOpenCheck },
  { href: "/wealth",         label: "Wealth",           icon: Coins },
  { href: "/authority",      label: "Authority",        icon: Zap },
  { href: "/intercession",   label: "Intercession",     icon: Handshake },
  { href: "/parables",       label: "Parables",         icon: Wheat },
];

const navItems = [...menuItems, ...spaceItems];

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const THEME_COLORS: Record<ThemeId, string> = {
  warm: "#C9A96E",
  slate: "#6E9EB0",
  forest: "#6E9E8A",
  plum: "#B07BAC",
  midnight: "#4A5080",
  dusk: "#5B6E9E",
};

const FONT_FAMILY: Record<string, string> = {
  classic: "var(--font-cormorant, Georgia, serif)",
  dyslexic: "OpenDyslexic, sans-serif",
  serif: "var(--font-playfair, Georgia, serif)",
  modern: "var(--font-fraunces, Georgia, serif)",
  humanist: "var(--font-eb-garamond, Georgia, serif)",
};

interface AppShellProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}

export function AppShell({ children, rightRail }: AppShellProps) {
  const pathname = usePathname();
  const { themeId, setTheme } = useThemeStore();
  const { fontPairId, setFontPair } = useFontStore();
  const { user } = useAuth();

  const { streak, weekDots } = useStreakStore();

  const bibleOpen = useFloatWindowsStore((s) => s.bibleOpen);
  const askOpen = useFloatWindowsStore((s) => s.askOpen);
  const toggleBible = useFloatWindowsStore((s) => s.toggleBible);
  const toggleAsk = useFloatWindowsStore((s) => s.toggleAsk);
  const closeBible = useFloatWindowsStore((s) => s.closeBible);
  const closeAsk = useFloatWindowsStore((s) => s.closeAsk);

  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("bj-sidebar-compact") === "true"
  );

  function toggleCompact() {
    const next = !isCompact;
    setIsCompact(next);
    localStorage.setItem("bj-sidebar-compact", String(next));
  }
  const appearanceRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on navigation
  useEffect(() => { setShowDrawer(false); }, [pathname]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Use e.code (physical key position) — reliable across all keyboard layouts
      // e.key changes with modifiers/locale; e.code always reflects the physical key

      // ⌘/ → shortcuts panel (always, even in editors)
      if (e.code === "Slash") { e.preventDefault(); setShowShortcuts((o) => !o); return; }

      // ⌘⌥B → floating Bible, ⌘⇧A → floating Ask (always, even in editors —
      // this is how you look up a reference without losing your place)
      if (e.altKey && e.code === "KeyB") { e.preventDefault(); toggleBible(); return; }
      if (e.shiftKey && e.code === "KeyA") { e.preventDefault(); toggleAsk(); return; }

      // Don't fire nav shortcuts when typing in an input / editor
      const target = e.target as HTMLElement;
      const inEditable = target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (inEditable) return;

      const NAV: Record<string, string> = {
        KeyJ: "/journal",
        KeyK: "/prayer",
        KeyP: "/proclamations",
        KeyB: "/bible",
        KeyD: "/dashboard",
        KeyS: "/sermons",
        KeyL: "/learn",
        KeyE: "/research",
        KeyO: "/promises",
        KeyT: "/principles",
        KeyW: "/wealth",
        KeyA: "/authority",
        KeyI: "/intercession",
        KeyR: "/parables",
      };
      const dest = NAV[e.code];
      if (dest) { e.preventDefault(); router.push(dest); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, toggleBible, toggleAsk]);

  const isDark = themeId === "midnight" || themeId === "dusk";

  function toggleTheme() {
    // Toggle uses Dusk (not Midnight) as the dark default — easier on the eyes
    setTheme(isDark ? "warm" : "dusk");
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (appearanceRef.current && !appearanceRef.current.contains(e.target as Node)) {
        setShowAppearance(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const themeOptions: { id: ThemeId; label: string }[] = [
    { id: "warm", label: "Warm" },
    { id: "slate", label: "Slate" },
    { id: "forest", label: "Forest" },
    { id: "plum", label: "Plum" },
    { id: "dusk", label: "Dusk" },
    { id: "midnight", label: "Midnight" },
  ];

  return (
    <div className="flex h-screen" style={{ background: "var(--bj-bg)" }}>

      {/* ── Desktop Left Sidebar ─────────────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0 h-full border-r"
        style={{
          width: isCompact ? 64 : 240,
          background: "var(--bj-bg-panel)",
          borderColor: "var(--bj-line-soft)",
          transition: "width 0.2s ease",
          overflowX: "visible",
          overflowY: "auto",
        }}
      >
        {/* Brand row */}
        {isCompact ? (
          <div className="flex flex-col items-center gap-1.5 pt-4 pb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--bj-gold)", boxShadow: "0 2px 8px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
                <path d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z" fill="white" fillOpacity="0.5" />
              </svg>
            </div>
            <button onClick={toggleCompact} title="Expand sidebar" className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
              <ChevronRight size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 pt-4 pb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bj-gold)", boxShadow: "0 2px 8px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
                <path d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z" fill="white" fillOpacity="0.5" />
              </svg>
            </div>
            <span className="font-display text-sm font-medium flex-1" style={{ color: "var(--bj-ink)", letterSpacing: "0.03em" }}>BibJournal</span>
            <button onClick={toggleCompact} title="Collapse sidebar" className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
              <ChevronLeft size={13} />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className={`${isCompact ? "px-1" : "px-2"} pb-2 border-b`} style={{ borderColor: "var(--bj-line-soft)" }}>
          {!isCompact && (
            <p className="px-3 mb-1.5 mt-1 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--bj-ink4)" }}>Menu</p>
          )}
          {menuItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return isCompact ? (
              <Link key={href} href={href} title={label}
                className="bj-nav-item relative flex items-center justify-center w-10 h-10 rounded-xl mb-0.5 mx-auto"
                style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)", background: active ? "var(--bj-gold-tint)" : "transparent" }}>
                {active && <motion.div layoutId="sidebar-indicator" className="absolute inset-0 rounded-xl" style={{ background: "var(--bj-gold-tint)" }} transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <Icon size={16} className="relative z-10 shrink-0" />
              </Link>
            ) : (
              <Link key={href} href={href} data-active={active || undefined}
                className="bj-nav-item relative flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm font-sans"
                style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)", background: active ? "var(--bj-gold-tint)" : "transparent", fontWeight: active ? 500 : 400 }}>
                {active && <motion.div layoutId="sidebar-indicator" className="absolute inset-0 rounded-xl" style={{ background: "var(--bj-gold-tint)" }} transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <Icon size={14} className="relative z-10 shrink-0" />
                <span className="relative z-10 text-[13px]">{label}</span>
              </Link>
            );
          })}

          {isCompact ? (
            <div className="my-2 mx-auto w-6 h-px" style={{ background: "var(--bj-line-soft)" }} />
          ) : (
            <p className="px-3 mb-1.5 mt-3 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--bj-ink4)" }}>Study Spaces</p>
          )}
          {spaceItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return isCompact ? (
              <Link key={href} href={href} title={label}
                className="bj-nav-item relative flex items-center justify-center w-10 h-10 rounded-xl mb-0.5 mx-auto"
                style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)", background: active ? "var(--bj-gold-tint)" : "transparent" }}>
                {active && <motion.div layoutId="sidebar-indicator" className="absolute inset-0 rounded-xl" style={{ background: "var(--bj-gold-tint)" }} transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <Icon size={16} className="relative z-10 shrink-0" />
              </Link>
            ) : (
              <Link key={href} href={href} data-active={active || undefined}
                className="bj-nav-item relative flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm font-sans"
                style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)", background: active ? "var(--bj-gold-tint)" : "transparent", fontWeight: active ? 500 : 400 }}>
                {active && <motion.div layoutId="sidebar-indicator" className="absolute inset-0 rounded-xl" style={{ background: "var(--bj-gold-tint)" }} transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                <Icon size={14} className="relative z-10 shrink-0" />
                <span className="relative z-10 text-[13px]">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Shortcuts (hidden in compact) */}
        {!isCompact && (
          <div className="px-2 py-3 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--bj-line-soft)" }}>
            <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--bj-ink4)" }}>Shortcuts</p>
            {[
              { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard",     desc: "Today's overview" },
              { href: "/bible",         icon: BookOpen,        label: "Bible",         desc: "Read & highlight" },
              { href: "/prayer",        icon: HeartHandshake,  label: "Prayer",        desc: "Your prayer journal" },
              { href: "/proclamations", icon: Megaphone,       label: "Proclamations", desc: "Declare what God says" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="bj-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5" style={{ color: "var(--bj-ink2)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bj-bg-soft)" }}>
                  <Icon size={13} style={{ color: "var(--bj-ink3)" }} />
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-[13px] font-medium leading-none mb-0.5" style={{ color: "var(--bj-ink)" }}>{label}</p>
                  <p className="font-sans text-[11px] leading-none" style={{ color: "var(--bj-ink4)" }}>{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        {isCompact && <div className="flex-1" />}

        {/* Streak */}
        {isCompact ? (
          <div className="flex flex-col items-center py-2.5 border-b gap-1" style={{ borderColor: "var(--bj-line-soft)" }}>
            <Flame size={12} style={{ color: "var(--bj-gold)" }} />
            <span className="font-sans text-[10px] font-semibold" style={{ color: "var(--bj-gold-deep)" }}>{streak > 0 ? `${streak}d` : "—"}</span>
          </div>
        ) : (
          <div className="px-4 py-2.5 border-b flex items-center gap-2.5" style={{ borderColor: "var(--bj-line-soft)" }}>
            <Flame size={12} style={{ color: "var(--bj-gold)", flexShrink: 0 }} />
            <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>{streak > 0 ? `${streak}d` : "—"}</span>
            <div className="flex gap-1 ml-auto">
              {weekDots.map((dot, i) => (
                <div key={i} title={dot.label} className="w-3.5 h-3.5 rounded"
                  style={{ background: dot.on ? "var(--bj-gold)" : "var(--bj-gold-soft)", boxShadow: dot.on ? "0 1px 4px color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "none" }} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className={`${isCompact ? "px-1 py-2 flex flex-col items-center gap-0.5" : "px-2 py-2"}`}>

          {/* Appearance popover — compact: icon only */}
          <div className="relative" ref={appearanceRef}>
            {isCompact ? (
              <button onClick={() => setShowAppearance(!showAppearance)} title="Appearance"
                className="bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ color: showAppearance ? "var(--bj-gold-deep)" : "var(--bj-ink3)", background: showAppearance ? "var(--bj-gold-tint)" : "transparent" }}>
                <Palette size={15} />
              </button>
            ) : (
              <button onClick={() => setShowAppearance(!showAppearance)}
                className="bj-btn-ghost flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px]"
                style={{ color: showAppearance ? "var(--bj-gold-deep)" : "var(--bj-ink3)", background: showAppearance ? "var(--bj-gold-tint)" : "transparent" }}>
                <Palette size={13} />
                <span className="flex-1 text-left">Appearance</span>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: THEME_COLORS[themeId] }} />
                  <span style={{ fontSize: 10, color: "var(--bj-ink4)", fontFamily: FONT_FAMILY[fontPairId], fontStyle: "italic" }}>Aa</span>
                </div>
              </button>
            )}

            <AnimatePresence>
              {showAppearance && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className={`absolute bottom-full mb-1.5 rounded-xl border overflow-hidden ${isCompact ? "left-0 w-56" : "left-0 right-0"}`}
                  style={{
                    background: "var(--bj-bg-panel)",
                    borderColor: "var(--bj-line)",
                    boxShadow: "0 8px 32px color-mix(in oklch, var(--bj-ink) 14%, transparent)",
                    zIndex: 100,
                  }}
                >
                  <div className="px-3 pt-3 pb-2 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                    <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--bj-ink4)" }}>Theme</p>
                    <div className="flex gap-1.5">
                      {themeOptions.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          title={t.label}
                          className="bj-swatch flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-6 h-6 rounded-lg"
                            style={{
                              background: THEME_COLORS[t.id],
                              boxShadow: themeId === t.id
                                ? `0 0 0 2px var(--bj-bg-panel), 0 0 0 3.5px ${THEME_COLORS[t.id]}`
                                : "none",
                              transform: themeId === t.id ? "scale(1.1)" : "scale(1)",
                              transition: "transform 0.15s ease, box-shadow 0.15s ease",
                            }}
                          />
                          <span style={{ fontSize: 9, color: themeId === t.id ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-3 py-2">
                    <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--bj-ink4)" }}>Font</p>
                    <div className="grid grid-cols-2 gap-1">
                      {fontPairs.map((pair) => {
                        const active = fontPairId === pair.id;
                        return (
                          <button
                            key={pair.id}
                            onClick={() => setFontPair(pair.id as FontPairId)}
                            className="bj-chip flex items-center gap-2 px-2 py-1.5 rounded-lg text-left"
                            data-active={active || undefined}
                            style={{
                              background: active ? "var(--bj-gold-tint)" : "transparent",
                              border: active ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: FONT_FAMILY[pair.id],
                                fontSize: 14,
                                fontStyle: "italic",
                                color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
                                lineHeight: 1,
                                flexShrink: 0,
                              }}
                            >
                              Aa
                            </span>
                            <span style={{ fontSize: 11, color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)" }}>
                              {pair.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark / light toggle */}
          {isCompact ? (
            <button onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"}
              className="bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          ) : (
            <button onClick={toggleTheme} className="bj-btn-ghost flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px]" style={{ color: "var(--bj-ink3)" }}>
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </button>
          )}

          {/* Keyboard shortcuts */}
          {isCompact ? (
            <button onClick={() => setShowShortcuts(true)} title="Shortcuts (⌘/)"
              className="bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
              <Keyboard size={15} />
            </button>
          ) : (
            <button onClick={() => setShowShortcuts(true)} className="bj-btn-ghost flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px]" style={{ color: "var(--bj-ink3)" }}>
              <Keyboard size={13} />
              <span className="flex-1 text-left">Shortcuts</span>
              <span className="font-sans text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink4)", border: "1px solid var(--bj-line-soft)" }}>⌘/</span>
            </button>
          )}

          {/* Profile */}
          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)}
              className={isCompact ? "bj-btn-icon w-10 h-10 rounded-xl flex items-center justify-center" : "bj-btn-ghost flex items-center gap-2.5 w-full px-3 py-2 rounded-xl"}
              title={isCompact ? (user?.displayName ?? "Account") : undefined}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full shrink-0 object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-medium" style={{ fontSize: 10, background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}>
                  {user?.displayName?.[0] ?? "U"}
                </div>
              )}
              {!isCompact && <>
                <span className="text-[13px] flex-1 text-left truncate" style={{ color: "var(--bj-ink2)" }}>
                  {user?.displayName ?? user?.email ?? "Account"}
                </span>
                <Settings size={11} style={{ color: "var(--bj-ink4)" }} />
              </>}
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className={`absolute bottom-full mb-1.5 rounded-xl overflow-hidden border ${isCompact ? "left-0 w-56" : "left-0 right-0"}`}
                  style={{ background: "var(--bj-bg-panel)", borderColor: "var(--bj-line)", boxShadow: "0 8px 24px color-mix(in oklch, var(--bj-ink) 12%, transparent)", zIndex: 100 }}
                >
                  {/* Account info */}
                  <div className="px-4 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                    <div className="flex items-center gap-3">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-semibold text-sm"
                          style={{ background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}>
                          {user?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-medium truncate" style={{ color: "var(--bj-ink)" }}>
                          {user?.displayName ?? "Account"}
                        </p>
                        <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink4)" }}>
                          {user?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Sign out */}
                  <button
                    onClick={() => signOutUser()}
                    className="bj-btn-ghost flex items-center gap-2 w-full px-4 py-3 text-xs"
                    style={{ color: "var(--bj-ember)" }}
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Version badge — desktop sidebar */}
        {isCompact ? (
          <div className="px-1 py-2 flex justify-center">
            <span className="font-sans text-[9px] font-semibold tracking-widest uppercase"
              style={{ color: "var(--bj-ink4)" }} title={`v${pkg.version} · ${pkg.codename}`}>
              v{pkg.version.split(".")[0]}
            </span>
          </div>
        ) : (
          <div className="px-4 py-2 flex items-center gap-2">
            <span className="font-sans text-[10px]" style={{ color: "var(--bj-ink4)" }}>v{pkg.version}</span>
            <span style={{ color: "var(--bj-line)" }}>·</span>
            <span className="font-sans text-[10px] italic" style={{ color: "var(--bj-ink4)" }}>{pkg.codename}</span>
          </div>
        )}
      </aside>

      {/* ── Main + Right ─────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* TopBar */}
        <header
          className="hidden md:flex items-center gap-3 px-6 border-b shrink-0"
          style={{
            height: 48,
            background: "color-mix(in oklch, var(--bj-bg-panel) 80%, transparent)",
            borderColor: "var(--bj-line-soft)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex-1" />
          <BibleFloatTriggers
            bibleOpen={bibleOpen} askOpen={askOpen}
            onToggleBible={toggleBible} onToggleAsk={toggleAsk}
          />
          <div className="w-px h-4" style={{ background: "var(--bj-line-soft)" }} />
          <button className="bj-btn-icon p-1.5 rounded-lg" style={{ color: "var(--bj-ink4)" }} onClick={toggleTheme}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-6 h-6 rounded-full object-cover cursor-pointer"
              style={{ transition: "transform 0.12s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={() => setShowProfile(!showProfile)}
            />
          ) : (
            <button
              className="bj-btn-icon w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
              style={{ background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.displayName?.[0] ?? "U"}
            </button>
          )}
        </header>

        <div className="flex flex-1 min-h-0">
          <main className="flex-1 overflow-y-auto">
            <div className="pb-20 md:pb-0 h-full">{children}</div>
          </main>

          {rightRail && (
            <aside
              className="hidden xl:flex flex-col w-[300px] shrink-0 h-full border-l overflow-y-auto"
              style={{ background: "var(--bj-bg-panel)", borderColor: "var(--bj-line-soft)" }}
            >
              {rightRail}
            </aside>
          )}
        </div>
      </div>

      {/* ── Mobile Bible/Ask quick access ─────────────── */}
      <div
        className="md:hidden fixed z-40 flex items-center gap-0.5 p-1 rounded-full"
        style={{
          right: 12,
          bottom: "calc(4.75rem + env(safe-area-inset-bottom))",
          background: "var(--bj-bg-panel)",
          border: "1px solid var(--bj-line)",
          boxShadow: "0 6px 20px color-mix(in oklch, var(--bj-ink) 16%, transparent)",
        }}
      >
        <BibleFloatTriggers
          bibleOpen={bibleOpen} askOpen={askOpen}
          onToggleBible={toggleBible} onToggleAsk={toggleAsk}
        />
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t z-50"
        style={{
          background: "color-mix(in oklch, var(--bj-bg-panel) 88%, transparent)",
          borderColor: "var(--bj-line-soft)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingTop: 8,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const shortLabel: Record<string, string> = { Proclamations: "Declare", Sermons: "Sermons" };
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bj-btn-icon flex flex-col items-center gap-1 py-1 flex-1 rounded-xl min-w-0"
              style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}
            >
              <Icon size={19} />
              <span className="text-[9px] font-medium truncate w-full text-center">
                {shortLabel[item.label] ?? item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu button — opens the sidebar drawer */}
        <button
          onClick={() => setShowDrawer(true)}
          className="bj-btn-icon flex flex-col items-center gap-1 py-1 flex-1 rounded-xl min-w-0"
          style={{ color: "var(--bj-ink4)" }}
        >
          <Menu size={19} />
          <span className="text-[9px] font-medium">More</span>
        </button>

      </nav>

      {/* ── Mobile Sidebar Drawer ─────────────────────── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-bd"
              className="fixed inset-0 md:hidden"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 55, cursor: "pointer" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setShowDrawer(false)}
              onTouchEnd={(e) => { e.preventDefault(); setShowDrawer(false); }}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              className="fixed top-0 left-0 bottom-0 md:hidden flex flex-col w-[270px]"
              style={{
                zIndex: 60,
                background: "var(--bj-bg-panel)",
                borderRight: "1px solid var(--bj-line-soft)",
                boxShadow: "4px 0 32px color-mix(in oklch, var(--bj-ink) 14%, transparent)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
              initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.28 }}
            >
              {/* Drawer header */}
              <div className="px-4 pt-4 pb-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bj-gold)", boxShadow: "0 2px 8px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
                    </svg>
                  </div>
                  <span className="font-display text-sm font-medium flex-1" style={{ color: "var(--bj-ink)", letterSpacing: "0.03em" }}>BibJournal</span>
                  <button onClick={() => setShowDrawer(false)} className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--bj-ink4)" }}>
                    <X size={14} />
                  </button>
                </div>
                {/* Account info */}
                <div className="flex items-center gap-3 px-1">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-semibold"
                      style={{ fontSize: 13, background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}>
                      {user?.displayName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-medium truncate" style={{ color: "var(--bj-ink)" }}>
                      {user?.displayName ?? "Account"}
                    </p>
                    <p className="font-sans text-xs truncate" style={{ color: "var(--bj-ink4)" }}>
                      {user?.email ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <nav className="px-2 py-2 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <p className="px-3 mb-1.5 mt-1 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--bj-ink4)" }}>Menu</p>
                {menuItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      data-active={active || undefined}
                      className="bj-nav-item relative flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm font-sans"
                      style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)", background: active ? "var(--bj-gold-tint)" : "transparent", fontWeight: active ? 500 : 400 }}
                    >
                      {active && (
                        <motion.div layoutId="drawer-indicator" className="absolute inset-0 rounded-xl" style={{ background: "var(--bj-gold-tint)" }} transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                      )}
                      <Icon size={14} className="relative z-10 shrink-0" />
                      <span className="relative z-10 text-[13px]">{label}</span>
                    </Link>
                  );
                })}

                <p className="px-3 mb-1.5 mt-3 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--bj-ink4)" }}>Study Spaces</p>
                {spaceItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      data-active={active || undefined}
                      className="bj-nav-item relative flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm font-sans"
                      style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)", background: active ? "var(--bj-gold-tint)" : "transparent", fontWeight: active ? 500 : 400 }}
                    >
                      {active && (
                        <motion.div layoutId="drawer-indicator" className="absolute inset-0 rounded-xl" style={{ background: "var(--bj-gold-tint)" }} transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                      )}
                      <Icon size={14} className="relative z-10 shrink-0" />
                      <span className="relative z-10 text-[13px]">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Shortcuts */}
              <div className="px-2 py-3 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--bj-line-soft)" }}>
                <p className="px-3 mb-2 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--bj-ink4)" }}>Shortcuts</p>
                {[
                  { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard",     desc: "Today's overview" },
                  { href: "/bible",         icon: BookOpen,        label: "Bible",         desc: "Read & highlight" },
                  { href: "/prayer",        icon: HeartHandshake,  label: "Prayer",        desc: "Your prayer journal" },
                  { href: "/proclamations", icon: Megaphone,       label: "Proclamations", desc: "Declare what God says" },
                ].map(({ href, icon: Icon, label, desc }) => (
                  <Link key={href} href={href} className="bj-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5" style={{ color: "var(--bj-ink2)" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bj-bg-soft)" }}>
                      <Icon size={13} style={{ color: "var(--bj-ink3)" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] font-medium leading-none mb-0.5" style={{ color: "var(--bj-ink)" }}>{label}</p>
                      <p className="font-sans text-[11px] leading-none" style={{ color: "var(--bj-ink4)" }}>{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Streak */}
              <div className="px-4 py-2.5 border-b flex items-center gap-2.5" style={{ borderColor: "var(--bj-line-soft)" }}>
                <Flame size={12} style={{ color: "var(--bj-gold)", flexShrink: 0 }} />
                <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>{streak > 0 ? `${streak}d` : "—"}</span>
                <div className="flex gap-1 ml-auto">
                  {weekDots.map((dot, i) => (
                    <div key={i} title={dot.label} className="w-3.5 h-3.5 rounded" style={{ background: dot.on ? "var(--bj-gold)" : "var(--bj-gold-soft)", boxShadow: dot.on ? "0 1px 4px color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "none" }} />
                  ))}
                </div>
              </div>

              {/* Bottom actions */}
              <div className="px-2 py-2">
                <button onClick={toggleTheme} className="bj-btn-ghost flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px]" style={{ color: "var(--bj-ink3)" }}>
                  {isDark ? <Sun size={13} /> : <Moon size={13} />}
                  <span>{isDark ? "Light mode" : "Dark mode"}</span>
                </button>
                <button onClick={() => { setShowDrawer(false); setShowShortcuts(true); }} className="bj-btn-ghost flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px]" style={{ color: "var(--bj-ink3)" }}>
                  <Keyboard size={13} />
                  <span>Shortcuts</span>
                </button>
                <button onClick={() => signOutUser()} className="bj-btn-ghost flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px]" style={{ color: "var(--bj-ember)" }}>
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>

              {/* Version — mobile drawer footer */}
              <div className="px-5 py-3 border-t flex items-center gap-2" style={{ borderColor: "var(--bj-line-soft)" }}>
                <span className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--bj-bg-soft)", color: "var(--bj-ink4)", border: "1px solid var(--bj-line-soft)" }}>
                  v{pkg.version}
                </span>
                <span className="font-sans text-[11px] italic" style={{ color: "var(--bj-ink4)" }}>{pkg.codename}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShortcutsPanel open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Bible + Ask floats — available everywhere, without leaving the current page */}
      <AnimatePresence>
        {bibleOpen && <FloatingBible key="float-bible" onClose={closeBible} />}
        {askOpen && <FloatingAsk key="float-ask" onClose={closeAsk} />}
      </AnimatePresence>
    </div>
  );
}
