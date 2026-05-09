"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, NotebookPen, BookOpen, HeartHandshake,
  Compass, Network, Search, Plus, Bell, Moon, Sun,
  ChevronDown, Tag, Folder, Settings, Mic, LogOut,
  Flame, Palette,
} from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { useFontStore } from "@/store/font.store";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/services/auth.service";
import { collections, tags, streak } from "@/lib/mock-data";
import type { ThemeId } from "@/lib/themes";
import { fontPairs } from "@/lib/fonts";
import type { FontPairId } from "@/lib/fonts";

const navItems = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/bible", label: "Bible", icon: BookOpen },
  { href: "/prayer", label: "Prayer", icon: HeartHandshake },
  { href: "/research", label: "Research", icon: Compass },
  { href: "/graph", label: "Graph", icon: Network },
];

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const THEME_COLORS: Record<ThemeId, string> = {
  warm: "#C9A96E",
  slate: "#6E9EB0",
  forest: "#6E9E8A",
  plum: "#B07BAC",
  midnight: "#4A5080",
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

  const [showProfile, setShowProfile] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const appearanceRef = useRef<HTMLDivElement>(null);

  const isDark = themeId === "midnight";

  function toggleTheme() {
    setTheme(isDark ? "warm" : "midnight");
  }

  // Close appearance popover on outside click
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
    { id: "midnight", label: "Midnight" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bj-bg)" }}>

      {/* ── Desktop Left Sidebar ─────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-[240px] shrink-0 h-full border-r"
        style={{ background: "var(--bj-bg-panel)", borderColor: "var(--bj-line-soft)" }}
      >

        {/* Brand + Search row */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--bj-gold)", boxShadow: "0 2px 8px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
              <path d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="font-display text-sm font-medium flex-1" style={{ color: "var(--bj-ink)", letterSpacing: "0.03em" }}>
            BibJournal
          </span>
          {/* Search icon */}
          <button
            title="Search (⌘K)"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150"
            style={{ color: "var(--bj-ink4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <Search size={13} />
          </button>
          {/* New entry */}
          <button
            title="New entry"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150"
            style={{ background: "var(--bj-gold)", boxShadow: "0 1px 6px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
          >
            <Plus size={13} color="white" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 pb-2 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm transition-colors duration-150"
                style={{
                  color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
                  background: active ? "var(--bj-gold-tint)" : "transparent",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "var(--bj-gold-tint)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={14} className="relative z-10 shrink-0" />
                <span className="relative z-10 text-[13px]">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Library: Collections + Tags merged */}
        <div className="px-2 py-2 border-b flex-1 overflow-y-auto" style={{ borderColor: "var(--bj-line-soft)" }}>
          <button
            className="flex items-center gap-1.5 w-full px-3 py-1.5 rounded-lg mb-1"
            onClick={() => setLibraryOpen(!libraryOpen)}
          >
            <Folder size={11} style={{ color: "var(--bj-ink4)" }} />
            <span className="text-[10px] uppercase tracking-widest font-medium flex-1 text-left" style={{ color: "var(--bj-ink4)" }}>Library</span>
            <motion.div animate={{ rotate: libraryOpen ? 0 : -90 }} transition={{ duration: 0.18 }}>
              <ChevronDown size={11} style={{ color: "var(--bj-ink4)" }} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {libraryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {/* Collections */}
                {collections.map((c) => (
                  <button
                    key={c.id}
                    className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-[13px] transition-colors duration-150"
                    style={{ color: "var(--bj-ink2)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color ?? "var(--bj-line)" }} />
                    <span className="flex-1 text-left truncate">{c.label}</span>
                    <span style={{ fontSize: 10, color: "var(--bj-ink4)" }}>{c.count}</span>
                  </button>
                ))}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 px-3 pt-2 pb-1">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      className="px-2 py-0.5 rounded-full transition-colors duration-150"
                      style={{
                        fontSize: 10,
                        background: "var(--bj-gold-tint)",
                        color: "var(--bj-gold-deep)",
                        border: "1px solid var(--bj-gold-soft)",
                      }}
                    >
                      #{t.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Streak — compact single row */}
        <div className="px-4 py-2.5 border-b flex items-center gap-2.5" style={{ borderColor: "var(--bj-line-soft)" }}>
          <Flame size={12} style={{ color: "var(--bj-gold)", flexShrink: 0 }} />
          <span className="font-sans text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>{streak.days}d</span>
          <div className="flex gap-1 ml-auto">
            {streak.weekDots.map((on, i) => (
              <div
                key={i}
                title={WEEK_LABELS[i]}
                className="w-3.5 h-3.5 rounded"
                style={{
                  background: on ? "var(--bj-gold)" : "var(--bj-gold-soft)",
                  boxShadow: on ? "0 1px 4px color-mix(in oklch, var(--bj-gold) 40%, transparent)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-2 py-2">

          {/* Appearance popover */}
          <div className="relative" ref={appearanceRef}>
            <button
              onClick={() => setShowAppearance(!showAppearance)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px] transition-colors duration-150"
              style={{
                color: showAppearance ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
                background: showAppearance ? "var(--bj-gold-tint)" : "transparent",
              }}
              onMouseEnter={(e) => { if (!showAppearance) (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; }}
              onMouseLeave={(e) => { if (!showAppearance) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <Palette size={13} />
              <span className="flex-1 text-left">Appearance</span>
              {/* Active swatch preview */}
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: THEME_COLORS[themeId] }} />
                <span style={{ fontSize: 10, color: "var(--bj-ink4)", fontFamily: FONT_FAMILY[fontPairId], fontStyle: "italic" }}>Aa</span>
              </div>
            </button>

            <AnimatePresence>
              {showAppearance && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute bottom-full left-0 right-0 mb-1.5 rounded-xl border overflow-hidden"
                  style={{
                    background: "var(--bj-bg-panel)",
                    borderColor: "var(--bj-line)",
                    boxShadow: "0 8px 32px color-mix(in oklch, var(--bj-ink) 14%, transparent)",
                  }}
                >
                  {/* Theme palette */}
                  <div className="px-3 pt-3 pb-2 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                    <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--bj-ink4)" }}>Theme</p>
                    <div className="flex gap-1.5">
                      {themeOptions.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          title={t.label}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-6 h-6 rounded-lg transition-all duration-150"
                            style={{
                              background: THEME_COLORS[t.id],
                              boxShadow: themeId === t.id ? `0 0 0 2px var(--bj-bg-panel), 0 0 0 3.5px ${THEME_COLORS[t.id]}` : "none",
                              transform: themeId === t.id ? "scale(1.1)" : "scale(1)",
                            }}
                          />
                          <span style={{ fontSize: 9, color: themeId === t.id ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font pairs */}
                  <div className="px-3 py-2">
                    <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--bj-ink4)" }}>Font</p>
                    <div className="grid grid-cols-2 gap-1">
                      {fontPairs.map((pair) => {
                        const active = fontPairId === pair.id;
                        return (
                          <button
                            key={pair.id}
                            onClick={() => setFontPair(pair.id as FontPairId)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all duration-150"
                            style={{
                              background: active ? "var(--bj-gold-tint)" : "transparent",
                              border: active ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                            }}
                            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; }}
                            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
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
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[13px] transition-colors duration-150"
            style={{ color: "var(--bj-ink3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-colors duration-150"
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full shrink-0 object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-medium" style={{ fontSize: 10, background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}>
                  {user?.displayName?.[0] ?? "U"}
                </div>
              )}
              <span className="text-[13px] flex-1 text-left truncate" style={{ color: "var(--bj-ink2)" }}>
                {user?.displayName ?? user?.email ?? "Account"}
              </span>
              <Settings size={11} style={{ color: "var(--bj-ink4)" }} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute bottom-full left-0 right-0 mb-1.5 rounded-xl overflow-hidden border"
                  style={{ background: "var(--bj-bg-panel)", borderColor: "var(--bj-line)", boxShadow: "0 8px 24px color-mix(in oklch, var(--bj-ink) 12%, transparent)" }}
                >
                  <button
                    onClick={() => signOutUser()}
                    className="flex items-center gap-2 w-full px-4 py-3 text-xs transition-colors duration-150"
                    style={{ color: "var(--bj-ember)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
          <button className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink4)"; }}>
            <Mic size={14} />
          </button>
          <button className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink4)"; }}>
            <Bell size={14} />
          </button>
          <button className="p-1.5 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink4)" }}
            onClick={toggleTheme}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink4)"; }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover cursor-pointer" onClick={() => setShowProfile(!showProfile)} />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium cursor-pointer" style={{ background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }} onClick={() => setShowProfile(!showProfile)}>
              {user?.displayName?.[0] ?? "U"}
            </div>
          )}
        </header>

        <div className="flex flex-1 min-h-0">
          <main className="flex-1 overflow-y-auto">
            <div className="pb-20 md:pb-0">{children}</div>
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
        {[navItems[0], navItems[1], null, navItems[2], navItems[3]].map((item, i) => {
          if (!item) {
            return (
              <button
                key="fab"
                className="relative -top-5 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bj-gold)", boxShadow: "0 4px 20px color-mix(in oklch, var(--bj-gold) 50%, transparent)" }}
              >
                <Plus size={22} color="white" />
              </button>
            );
          }
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors duration-150"
              style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
