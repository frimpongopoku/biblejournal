"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, BookOpen, MessageSquare, NotebookPen, HeartHandshake, Mic, Plus, Moon, Sun,
  Maximize2, Keyboard, Search, Quote, Hash,
} from "lucide-react";
import { Settings } from "lucide-react";
import { useSettingsUi } from "@/store/prefs.store";
import { NAV_ITEMS } from "@/lib/nav";
import { parseRef, type ParsedRef } from "@/lib/bible-ref-parser";
import { useJournalStore } from "@/store/journal.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { useThemeStore } from "@/store/theme.store";
import { useBibleStore } from "@/store/bible.store";
import { useWritingStore } from "@/store/writing.store";
import { useAuthStore } from "@/store/auth.store";
import { usePrayers } from "@/hooks/usePrayers";
import { useSermons } from "@/hooks/useSermons";
import { createEntry } from "@/services/journal.service";
import { getActiveEditor, quotePassage } from "@/lib/editor/quote";
import { cachedDocText } from "@/components/journal/JournalParts";

interface Item {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  /** Text matched against the query. */
  haystack: string;
  run: (opts: { alt: boolean }) => void;
  /** ⌘↵ alternative, shown in the footer when present. */
  altLabel?: string;
}

interface VerseHit { book: string; chapter: number; verse: number; text: string }

/** Every query word must appear; earlier matches rank higher. */
function score(hay: string, words: string[]): number {
  if (!words.length) return 1;
  let s = 0;
  for (const w of words) {
    const i = hay.indexOf(w);
    if (i < 0) return 0;
    s += i === 0 ? 3 : hay[i - 1] === " " ? 2 : 1;
  }
  return s;
}

function refLabel(r: ParsedRef) {
  return `${r.book} ${r.chapter}${r.verse ? `:${r.verse}${r.verseEnd ? `–${r.verseEnd}` : ""}` : ""}`;
}

/**
 * ⌘K — jump anywhere, run anything, find any entry or verse.
 * No open/close animation: it's opened by keyboard many times a day.
 */
export function CommandPalette({ open, onClose, onShortcuts }: { open: boolean; onClose: () => void; onShortcuts: () => void }) {
  if (!open) return null;
  return <Palette onClose={onClose} onShortcuts={onShortcuts} />;
}

function Palette({ onClose, onShortcuts }: { onClose: () => void; onShortcuts: () => void }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const entries = useJournalStore((s) => s.entries);
  const { prayers } = usePrayers();
  const { sermons } = useSermons();
  const { openBibleAt, openAsk, toggleBible } = useFloatWindowsStore();
  const { themeId, setTheme } = useThemeStore();
  const version = useBibleStore((s) => s.version);
  const writing = useWritingStore();

  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [verses, setVerses] = useState<VerseHit[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  // The editor that had focus when ⌘K opened — the target for "quote into entry".
  const [editorAtOpen] = useState(() => getActiveEditor());

  const raw = query.trim();
  const mode = raw.startsWith(">") ? "commands" : raw.startsWith("#") ? "tags" : "all";
  const q = (mode === "all" ? raw : raw.slice(1)).trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  const ref = mode === "all" && raw ? parseRef(raw) : null;

  // Keyword verse search (debounced, only for plain queries that aren't a reference).
  useEffect(() => {
    if (mode !== "all" || ref || q.length < 3) { setVerses([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/bible/search?q=${encodeURIComponent(q)}&version=${version}&limit=6`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d: { results: VerseHit[] }) => setVerses(d.results ?? []))
        .catch(() => {});
    }, 140);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, mode, ref?.book, ref?.chapter, version]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = onClose;
  const go = (href: string) => { close(); router.push(href); };

  const items = useMemo(() => {
    const out: Item[] = [];
    const editor = editorAtOpen;
    const isDark = themeId === "midnight" || themeId === "dusk";

    // Scripture reference typed directly.
    if (ref) {
      out.push({
        id: "ref", group: "Scripture", label: refLabel(ref), hint: version,
        icon: <BookOpen size={15} />, haystack: "",
        altLabel: editor ? "Quote into entry" : undefined,
        run: ({ alt }) => {
          close();
          if (alt && editor) void quotePassage(editor, ref, version);
          else openBibleAt({ book: ref.book, chapter: ref.chapter, verse: ref.verse });
        },
      });
    }

    const commands: Item[] = [
      {
        id: "new-entry", group: "Actions", label: "New journal entry", hint: "⌘⇧N", icon: <Plus size={15} />,
        haystack: "new journal entry write create",
        run: () => {
          close();
          if (!user) return;
          void createEntry(user.uid).then((id) => router.push(`/journal?entry=${id}`));
        },
      },
      ...(raw && mode === "all" ? [{
        id: "ask", group: "Actions", label: `Ask: “${raw}”`, hint: "AI", icon: <MessageSquare size={15} />,
        haystack: q, run: () => { close(); openAsk(raw); },
      }] : [{
        id: "ask-open", group: "Actions", label: "Ask a question about Scripture", hint: "⌘⇧A", icon: <MessageSquare size={15} />,
        haystack: "ask question ai research", run: () => { close(); openAsk(); },
      }]),
      { id: "bible", group: "Actions", label: "Open floating Bible", hint: "⌘⌥B", icon: <BookOpen size={15} />, haystack: "floating bible open read", run: () => { close(); toggleBible(); } },
      { id: "theme", group: "Actions", label: isDark ? "Switch to light theme" : "Switch to dark theme", icon: isDark ? <Sun size={15} /> : <Moon size={15} />, haystack: "theme dark light mode appearance", run: () => { close(); setTheme(isDark ? "warm" : "dusk"); } },
      { id: "zen", group: "Actions", label: "Zen writing mode", hint: "⌘.", icon: <Maximize2 size={15} />, haystack: "zen focus distraction free mode", run: () => { close(); writing.set({ zen: true }); router.push("/journal"); } },
      { id: "settings", group: "Actions", label: "Settings", icon: <Settings size={15} />, hint: "⌘,", haystack: "settings preferences options appearance theme font export account", run: () => { close(); if (window.matchMedia("(min-width: 768px)").matches) useSettingsUi.getState().show(); else router.push("/settings"); } },
      { id: "sounds", group: "Actions", label: writing.keySounds ? "Turn off keyboard sounds" : "Turn on keyboard sounds", icon: <Keyboard size={15} />, haystack: "keyboard sounds typing click switch mechanical", run: () => { close(); writing.toggle("keySounds"); } },
      { id: "typewriter", group: "Actions", label: writing.typewriter ? "Turn off typewriter scrolling" : "Turn on typewriter scrolling", icon: <Keyboard size={15} />, haystack: "typewriter scrolling center", run: () => { close(); writing.toggle("typewriter"); } },
      { id: "shortcuts", group: "Actions", label: "Keyboard shortcuts", hint: "⌘/", icon: <Keyboard size={15} />, haystack: "keyboard shortcuts help keys", run: () => { close(); onShortcuts(); } },
    ];

    const pages: Item[] = NAV_ITEMS.map((n) => {
      const Icon = n.icon;
      return {
        id: `nav-${n.href}`, group: "Go to", label: n.label, hint: n.g ? `G ${n.g.toUpperCase()}` : undefined,
        icon: <Icon size={15} />, haystack: `${n.label} ${n.keywords ?? ""}`.toLowerCase(), run: () => go(n.href),
      };
    });

    if (mode === "tags") {
      const tags = new Map<string, number>();
      for (const e of entries) for (const t of e.tags) tags.set(t, (tags.get(t) ?? 0) + 1);
      for (const [t, n] of [...tags].sort((a, b) => b[1] - a[1])) {
        if (q && !t.toLowerCase().includes(q)) continue;
        out.push({ id: `tag-${t}`, group: "Tags", label: `#${t}`, hint: `${n} ${n === 1 ? "entry" : "entries"}`, icon: <Hash size={15} />, haystack: t, run: () => go(`/journal?tag=${encodeURIComponent(t)}`) });
        const tagged = entries.filter((e) => e.tags.includes(t)).slice(0, q ? 6 : 2);
        for (const e of tagged) out.push({ id: `tag-${t}-${e.id}`, group: "Tags", label: `   ${e.title || "Untitled"}`, icon: <NotebookPen size={15} />, haystack: "", run: () => go(`/journal?entry=${e.id}`) });
        if (out.length > 40) break;
      }
      return out;
    }

    const rank = (list: Item[], max: number) =>
      list.map((i) => ({ i, s: score(i.haystack, words) })).filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s).slice(0, max).map((x) => x.i);

    if (mode === "commands") return [...rank(commands, 20), ...rank(pages, 20)];

    if (!words.length) {
      // Empty: recent writing first, then actions, then pages.
      out.push(...entries.slice(0, 4).map((e) => ({
        id: `e-${e.id}`, group: "Recent", label: e.title || "Untitled",
        hint: e.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        icon: <NotebookPen size={15} />, haystack: "", run: () => go(`/journal?entry=${e.id}`),
      })));
      out.push(...commands.slice(0, 5), ...pages);
      return out;
    }

    out.push(...rank(pages, 4));
    const journalHits = entries
      .map((e) => {
        const title = (e.title || "").toLowerCase();
        const s = score(`${title} ${e.tags.join(" ").toLowerCase()} ${(e.feeling ?? "").toLowerCase()}`, words) * 2
          || (words.every((w) => cachedDocText(e.content).toLowerCase().includes(w)) ? 1 : 0);
        return { e, s };
      })
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 6)
      .map(({ e }) => ({
        id: `e-${e.id}`, group: "Journal", label: e.title || "Untitled",
        hint: e.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        icon: <NotebookPen size={15} />, haystack: "", run: () => go(`/journal?entry=${e.id}`),
      }));
    out.push(...journalHits);
    out.push(...rank(prayers.map((p) => ({
      id: `p-${p.id}`, group: "Prayers", label: p.title || "Untitled prayer", hint: p.status === "answered" ? "Answered" : undefined,
      icon: <HeartHandshake size={15} />, haystack: `${p.title} ${p.body}`.toLowerCase(), run: () => go(`/prayer/${p.id}`),
    })), 4));
    out.push(...rank(sermons.map((s) => ({
      id: `s-${s.id}`, group: "Sermons", label: s.title || "Untitled sermon", hint: s.speaker || undefined,
      icon: <Mic size={15} />, haystack: `${s.title} ${s.speaker} ${s.church}`.toLowerCase(), run: () => go(`/sermons/${s.id}`),
    })), 4));
    out.push(...verses.map((v) => {
      const r: ParsedRef = { book: v.book, chapter: v.chapter, verse: v.verse };
      return {
        id: `v-${v.book}-${v.chapter}-${v.verse}`, group: "Verses", label: `${v.book} ${v.chapter}:${v.verse}`,
        hint: v.text.length > 70 ? v.text.slice(0, 70) + "…" : v.text,
        icon: <Quote size={15} />, haystack: "",
        altLabel: editor ? "Quote into entry" : undefined,
        run: ({ alt }: { alt: boolean }) => {
          close();
          if (alt && editor) void quotePassage(editor, r, version);
          else openBibleAt({ book: v.book, chapter: v.chapter, verse: v.verse });
        },
      };
    }));
    out.push(...rank(commands, 4));
    return out;
  }, [ref, raw, q, mode, entries, prayers, sermons, verses, themeId, version, writing.keySounds, writing.typewriter, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setIndex(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const current = items[index];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) { e.preventDefault(); setIndex((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); current?.run({ alt: e.metaKey || e.ctrlKey }); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
  }

  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[90] flex justify-center px-3" style={{ paddingTop: "min(14vh, 120px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--m-scrim)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
      <div role="dialog" aria-label="Command palette" aria-modal="true"
        className="relative w-full flex flex-col rounded-2xl overflow-hidden self-start"
        style={{ maxWidth: 620, maxHeight: "min(70vh, 560px)", background: "var(--m-pop-bg)", backdropFilter: "blur(24px) saturate(170%)", WebkitBackdropFilter: "blur(24px) saturate(170%)", border: "1px solid var(--m-edge)", boxShadow: "var(--bj-shadow-lg)" }}>
        <div className="flex items-center gap-3 px-4 shrink-0" style={{ height: 54, borderBottom: "1px solid var(--bj-line-soft)" }}>
          <Search size={16} style={{ color: "var(--bj-ink4)" }} aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search entries, verses, pages — or type John 3:16"
            aria-label="Search or run a command"
            aria-activedescendant={current ? `cp-${current.id}` : undefined}
            role="combobox" aria-expanded="true" aria-controls="cp-list"
            className="flex-1 bg-transparent outline-none font-sans text-base sm:text-[15px] min-w-0"
            style={{ color: "var(--bj-ink)" }}
          />
          <kbd className="bj-kbd">esc</kbd>
        </div>

        <div ref={listRef} id="cp-list" role="listbox" className="flex-1 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <p className="font-sans text-[13px] px-3 py-8 text-center" style={{ color: "var(--bj-ink4)" }}>
              Nothing found. Press <kbd className="bj-kbd">↵</kbd> on “Ask” to search with AI.
            </p>
          ) : items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            const sel = i === index;
            return (
              <div key={it.id}>
                {header && <p className="font-sans text-[11px] font-medium px-3 pt-2.5 pb-1" style={{ color: "var(--bj-ink4)" }}>{header}</p>}
                <div
                  id={`cp-${it.id}`}
                  role="option"
                  aria-selected={sel}
                  data-index={i}
                  onMouseMove={() => { if (index !== i) setIndex(i); }}
                  onClick={(e) => it.run({ alt: e.metaKey || e.ctrlKey })}
                  data-active={sel || undefined}
                  className="bj-menu-item flex items-center gap-3 px-3 h-10 rounded-[10px] cursor-pointer"
                >
                  <span className="shrink-0" style={{ color: sel ? "var(--bj-gold)" : "var(--bj-ink4)" }}>{it.icon}</span>
                  <span className="font-sans text-[13.5px] truncate whitespace-pre" style={{ color: sel ? "var(--bj-ink)" : "var(--bj-ink2)" }}>{it.label}</span>
                  {it.hint && <span className="ml-auto pl-3 font-sans text-[12px] truncate shrink min-w-0 max-w-[55%] text-right" style={{ color: "var(--bj-ink4)" }}>{it.hint}</span>}
                  {sel && !it.hint && <ArrowRight size={13} className="ml-auto shrink-0" style={{ color: "var(--bj-ink4)" }} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 shrink-0 font-sans text-[11.5px]" style={{ height: 36, borderTop: "1px solid var(--bj-line-soft)", color: "var(--bj-ink4)" }}>
          <span><kbd className="bj-kbd">↵</kbd> open</span>
          {current?.altLabel && <span><kbd className="bj-kbd">⌘↵</kbd> {current.altLabel.toLowerCase()}</span>}
          <span className="ml-auto"><kbd className="bj-kbd">&gt;</kbd> commands</span>
          <span><kbd className="bj-kbd">#</kbd> tags</span>
        </div>
      </div>
    </div>
  );
}
