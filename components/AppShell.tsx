"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, NotebookPen, BookOpen, HeartHandshake,
  Compass, Network, Search, Plus, Bell, Moon, Sun,
  ChevronDown, Pin, Star, Tag, Folder, Settings,
  Sparkles, Mic, LogOut,
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
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const isDark = themeId === "midnight";

  function toggleTheme() {
    setTheme(isDark ? "warm" : "midnight");
  }

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
        className="hidden md:flex flex-col w-[264px] shrink-0 h-full border-r overflow-y-auto"
        style={{ background: "var(--bj-bg-panel)", borderColor: "var(--bj-line-soft)" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--bj-gold)", boxShadow: "0 2px 10px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
              <path d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="font-display text-base font-medium" style={{ color: "var(--bj-ink)", letterSpacing: "0.03em" }}>
            BibJournal
          </span>
        </div>

        {/* Search */}
        <div className="px-3 pt-4 pb-2">
          <button
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs transition-all duration-150"
            style={{
              background: "var(--bj-bg-soft)",
              color: "var(--bj-ink3)",
              border: "1px solid var(--bj-line-soft)",
            }}
          >
            <Search size={13} />
            <span className="flex-1 text-left">Search everything…</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bj-line-soft)", color: "var(--bj-ink4)", fontFamily: "inherit" }}>⌘K</kbd>
          </button>
        </div>

        {/* New entry */}
        <div className="px-3 pb-3">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
            style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
          >
            <Plus size={13} />
            New Entry
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 pb-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <p className="px-2 mb-2 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--bj-ink4)" }}>Workspace</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5 text-sm transition-colors duration-150"
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
                <Icon size={15} className="relative z-10 shrink-0" />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Collections */}
        <div className="px-3 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <button
            className="flex items-center gap-1.5 w-full px-2 mb-2"
            onClick={() => setCollectionsOpen(!collectionsOpen)}
          >
            <Folder size={11} style={{ color: "var(--bj-ink4)" }} />
            <span className="text-[10px] uppercase tracking-widest font-medium flex-1 text-left" style={{ color: "var(--bj-ink4)" }}>Collections</span>
            <motion.div animate={{ rotate: collectionsOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={11} style={{ color: "var(--bj-ink4)" }} />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {collectionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                {collections.map((c) => (
                  <button
                    key={c.id}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 group"
                    style={{ color: "var(--bj-ink2)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {c.color ? (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    ) : (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--bj-line)" }} />
                    )}
                    <span className="flex-1 text-left truncate">{c.label}</span>
                    <span className="text-[10px]" style={{ color: "var(--bj-ink4)" }}>{c.count}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags */}
        <div className="px-3 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <button
            className="flex items-center gap-1.5 w-full px-2 mb-2"
            onClick={() => setTagsOpen(!tagsOpen)}
          >
            <Tag size={11} style={{ color: "var(--bj-ink4)" }} />
            <span className="text-[10px] uppercase tracking-widest font-medium flex-1 text-left" style={{ color: "var(--bj-ink4)" }}>Tags</span>
            <motion.div animate={{ rotate: tagsOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={11} style={{ color: "var(--bj-ink4)" }} />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {tagsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 px-2">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      className="px-2 py-0.5 rounded-full text-[11px] transition-colors duration-150"
                      style={{
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

        {/* Reading streak */}
        <div className="px-3 py-4 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <div
            className="px-3 py-3 rounded-xl"
            style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--bj-gold-deep)" }}>Reading streak</span>
              <span className="font-display text-base font-semibold" style={{ color: "var(--bj-gold)" }}>{streak.days} days</span>
            </div>
            <div className="flex gap-1">
              {streak.weekDots.map((active, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: active ? "var(--bj-gold)" : "var(--bj-gold-soft)",
                      boxShadow: active ? "0 1px 6px color-mix(in oklch, var(--bj-gold) 35%, transparent)" : "none",
                    }}
                  >
                    {active && <svg width="8" height="8" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" fill="white" /></svg>}
                  </div>
                  <span className="text-[9px]" style={{ color: "var(--bj-gold-deep)" }}>{WEEK_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: theme + profile */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
          {/* Theme switcher */}
          <div className="flex gap-1 mb-3 px-1">
            {themeOptions.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className="flex-1 h-1.5 rounded-full transition-all duration-200"
                style={{
                  background: t.id === "warm" ? "#C9A96E" : t.id === "slate" ? "#6E9EB0" : t.id === "forest" ? "#6E9E8A" : t.id === "plum" ? "#B07BAC" : "#2A2F4E",
                  opacity: themeId === t.id ? 1 : 0.35,
                  transform: themeId === t.id ? "scaleY(2)" : "scaleY(1)",
                }}
              />
            ))}
          </div>

          {/* Font pair picker */}
          <div className="mb-3">
            <p className="px-1 mb-1.5 text-[9px] uppercase tracking-widest" style={{ color: "var(--bj-ink4)", letterSpacing: "0.14em" }}>Font</p>
            <div className="flex flex-col gap-0.5">
              {fontPairs.map((pair) => {
                const active = fontPairId === pair.id;
                return (
                  <button
                    key={pair.id}
                    onClick={() => setFontPair(pair.id as FontPairId)}
                    className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg transition-all duration-150 text-left"
                    style={{
                      background: active ? "var(--bj-gold-tint)" : "transparent",
                      border: active ? "1px solid var(--bj-gold-soft)" : "1px solid transparent",
                    }}
                  >
                    {/* Preview swatch — rendered in that font */}
                    <span
                      className="text-sm shrink-0 w-6 text-center leading-none"
                      style={{
                        fontFamily: pair.id === "classic" ? "var(--font-cormorant, Georgia, serif)"
                          : pair.id === "dyslexic" ? "OpenDyslexic, sans-serif"
                          : pair.id === "serif" ? "var(--font-playfair, Georgia, serif)"
                          : pair.id === "modern" ? "var(--font-fraunces, Georgia, serif)"
                          : "var(--font-eb-garamond, Georgia, serif)",
                        color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
                        fontStyle: "italic",
                      }}
                    >
                      Aa
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium leading-none mb-0.5" style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)" }}>
                        {pair.label}
                      </p>
                      <p className="text-[9px] truncate" style={{ color: "var(--bj-ink4)" }}>
                        {pair.uiFamily} · {pair.displayFamily}
                      </p>
                    </div>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--bj-gold)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-3" style={{ background: "var(--bj-line-soft)" }} />

          {/* Dark/light toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl text-xs mb-2 transition-colors duration-150"
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
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl transition-colors duration-150"
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full shrink-0 object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-medium" style={{ background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}>
                  {user?.displayName?.[0] ?? "U"}
                </div>
              )}
              <span className="text-xs flex-1 text-left truncate" style={{ color: "var(--bj-ink2)" }}>
                {user?.displayName ?? user?.email ?? "Account"}
              </span>
              <Settings size={12} style={{ color: "var(--bj-ink4)" }} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden border"
                  style={{ background: "var(--bj-bg-panel)", borderColor: "var(--bj-line)", boxShadow: "0 8px 32px color-mix(in oklch, var(--bj-ink) 12%, transparent)" }}
                >
                  <button
                    onClick={() => signOutUser()}
                    className="flex items-center gap-2 w-full px-4 py-3 text-xs transition-colors duration-150"
                    style={{ color: "var(--bj-ember)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bj-bg-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut size={13} />
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
            height: 52,
            background: "color-mix(in oklch, var(--bj-bg-panel) 80%, transparent)",
            borderColor: "var(--bj-line-soft)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex-1" />
          <button className="p-2 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink4)"; }}>
            <Mic size={15} />
          </button>
          <button className="p-2 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink4)"; }}>
            <Bell size={15} />
          </button>
          <button className="p-2 rounded-lg transition-colors duration-150" style={{ color: "var(--bj-ink4)" }}
            onClick={toggleTheme}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bj-bg-soft)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--bj-ink4)"; }}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover cursor-pointer" onClick={() => setShowProfile(!showProfile)} />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer" style={{ background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }} onClick={() => setShowProfile(!showProfile)}>
              {user?.displayName?.[0] ?? "U"}
            </div>
          )}
        </header>

        <div className="flex flex-1 min-h-0">
          {/* Main workspace */}
          <main className="flex-1 overflow-y-auto">
            <div className="pb-20 md:pb-0">{children}</div>
          </main>

          {/* Right Rail */}
          {rightRail && (
            <aside
              className="hidden xl:flex flex-col w-[320px] shrink-0 h-full border-l overflow-y-auto"
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
                className="relative -top-5 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
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
