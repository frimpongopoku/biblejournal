"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, LogOut, Play, Minus, Plus } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { usePrefsStore } from "@/store/prefs.store";
import { useWritingStore, writingFontStyle, readingFontStyle, type WritingWidth } from "@/store/writing.store";
import { useBibleStore } from "@/store/bible.store";
import { useCommentaryStore } from "@/store/commentary.store";
import { useAuthStore } from "@/store/auth.store";
import { themes, type ThemeId } from "@/lib/themes";
import { WRITE_FACES, READ_FACES } from "@/lib/typeface";
import { COMMENTARY_SOURCES } from "@/lib/commentary-sources";
import { SWITCHES, previewSwitch, type SwitchId } from "@/lib/typing/keySounds";
import { FaceList } from "@/components/TypePicker";
import { SHORTCUT_GROUPS } from "@/components/ShortcutsPanel";
import { signOutUser } from "@/services/auth.service";
import { exportEverything, downloadJson, deleteAccount } from "@/services/account.service";

// ── Primitives ─────────────────────────────────────────────

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="bj-switch">
      <i />
    </button>
  );
}

export function Seg<T extends string | number>({ items, value, onChange, label }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="bj-well inline-flex p-0.5 rounded-[11px] gap-0.5 max-w-full overflow-x-auto">
      {items.map((it) => {
        const on = it.id === value;
        return (
          <button key={String(it.id)} type="button" role="radio" aria-checked={on} onClick={() => onChange(it.id)}
            className={`h-7 px-3 rounded-[9px] font-sans text-[12.5px] whitespace-nowrap ${on ? "bj-raised" : ""}`}
            style={{ color: on ? "var(--bj-ink)" : "var(--bj-ink3)", fontWeight: on ? 500 : 400, border: on ? undefined : "1px solid transparent" }}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function Pick<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[]; label: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} aria-label={label}
      className="bj-raised h-8 pl-3 pr-8 rounded-[10px] font-sans text-[12.5px] font-medium outline-none appearance-none cursor-pointer max-w-[220px]"
      style={{ color: "var(--bj-ink2)", backgroundImage: "none" }}>
      {items.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
    </select>
  );
}

function PickWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center">
      {children}
      <svg className="pointer-events-none absolute right-2.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bj-ink4)" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
    </span>
  );
}

function Slider({ value, min, max, step = 1, onChange, label, show }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label: string; show?: string }) {
  return (
    <span className="flex items-center gap-3 w-[min(250px,100%)]">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label} className="flex-1 min-w-0" style={{ accentColor: "var(--bj-gold)" }} />
      <span className="font-sans text-[12px] font-medium w-9 text-right shrink-0" style={{ color: "var(--bj-ink2)", fontVariantNumeric: "tabular-nums" }}>{show ?? value}</span>
    </span>
  );
}

export function Row({ title, hint, children, stack }: { title: string; hint?: string; children: React.ReactNode; stack?: boolean }) {
  return (
    <div className={`flex ${stack ? "flex-col items-start" : "items-center"} gap-x-4 gap-y-2.5 py-3.5 border-b last:border-b-0`} style={{ borderColor: "var(--bj-line-soft)" }}>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[14px] font-medium" style={{ color: "var(--bj-ink)" }}>{title}</p>
        {hint && <p className="font-sans text-[12.5px] mt-0.5 leading-snug" style={{ color: "var(--bj-ink4)" }}>{hint}</p>}
      </div>
      <div className={stack ? "w-full" : "shrink-0 max-w-[60%] flex justify-end"}>{children}</div>
    </div>
  );
}

export function Group({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-2">
      {label && <p className="font-sans text-[10.5px] font-semibold uppercase mb-1.5 px-0.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>{label}</p>}
      <div className="bj-raised rounded-2xl px-4">{children}</div>
    </section>
  );
}

// ── Sections ───────────────────────────────────────────────

export const SECTIONS = [
  { id: "appearance", label: "Appearance" },
  { id: "type", label: "Type" },
  { id: "writing", label: "Writing" },
  { id: "reading", label: "Reading" },
  { id: "sounds", label: "Sounds" },
  { id: "prayer", label: "Prayer" },
  { id: "shortcuts", label: "Shortcuts" },
  { id: "account", label: "Account & data" },
] as const;
export type SectionId = (typeof SECTIONS)[number]["id"];

/** One line summing up a section, for the phone list. */
export function useSectionSummary(): Record<SectionId, string> {
  const themeId = useThemeStore((s) => s.themeId);
  const mode = usePrefsStore((s) => s.mode);
  const perDay = usePrefsStore((s) => s.prayersPerDay);
  const w = useWritingStore();
  const version = useBibleStore((s) => s.version);
  return {
    appearance: mode === "system" ? "Follow system" : themes.find((t) => t.id === themeId)?.label ?? "",
    type: "3 faces",
    writing: `${WRITE_FACES.find((f) => f.id === w.font)?.label ?? ""} ${w.size}`,
    reading: version,
    sounds: w.keySounds ? SWITCHES[w.switchId]?.name ?? "On" : "Off",
    prayer: perDay ? `${perDay} a day` : "Auto",
    shortcuts: "",
    account: "",
  };
}

function ThemeSwatch({ id, on, onPick }: { id: ThemeId; on: boolean; onPick: () => void }) {
  const t = themes.find((x) => x.id === id)!;
  const v = t.vars;
  return (
    <button type="button" onClick={onPick} aria-pressed={on} aria-label={`${t.label} theme`} className="flex flex-col items-center gap-1.5 group">
      <span className="relative block w-[104px] h-[68px] rounded-[14px] overflow-hidden transition-transform duration-150 group-active:scale-[0.97]"
        style={{ background: v["--bj-bg"], boxShadow: on ? "0 0 0 2px var(--bj-gold), 0 0 0 5px color-mix(in oklch, var(--bj-gold) 22%, transparent)" : "inset 0 0 0 1px color-mix(in oklch, var(--bj-ink) 14%, transparent)" }}>
        <i className="absolute left-2.5 top-2.5 w-6 h-12 rounded-md" style={{ background: v["--bj-bg-soft"] }} />
        <i className="absolute left-11 top-3.5 w-12 h-1.5 rounded" style={{ background: v["--bj-ink"], opacity: 0.55 }} />
        <i className="absolute left-11 top-6.5 w-9 h-1 rounded" style={{ background: v["--bj-ink3"], opacity: 0.5 }} />
        <i className="absolute left-11 bottom-3 w-7 h-3.5 rounded-[5px]" style={{ background: v["--bj-gold"] }} />
      </span>
      <span className="font-sans text-[12px] font-medium" style={{ color: on ? "var(--bj-ink)" : "var(--bj-ink3)" }}>{t.label}</span>
    </button>
  );
}

function Appearance() {
  const { themeId, setTheme } = useThemeStore();
  const p = usePrefsStore();
  const light = themes.filter((t) => !t.isDark);
  const dark = themes.filter((t) => t.isDark);
  function pick(id: ThemeId) {
    setTheme(id);
    // Following the system: picking a theme sets that side of the pair.
    if (p.mode === "system") p.set(themes.find((t) => t.id === id)?.isDark ? { darkTheme: id } : { lightTheme: id });
  }
  return (
    <>
      <p className="font-sans text-[10.5px] font-semibold uppercase mt-2 mb-3 px-0.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>Theme</p>
      <div className="flex flex-wrap gap-3.5">
        {themes.map((t) => <ThemeSwatch key={t.id} id={t.id} on={t.id === themeId} onPick={() => pick(t.id)} />)}
      </div>
      <Group label="Light and dark">
        <Row title="Mode" hint={p.mode === "system" ? "Switches with your device, day and night" : "Stays on the theme you pick"}>
          <Seg label="Mode" value={p.mode} onChange={(mode) => p.set({ mode })} items={[{ id: "manual", label: "Pick one" }, { id: "system", label: "Follow system" }]} />
        </Row>
        {p.mode === "system" && (
          <>
            <Row title="In the day"><Seg label="Light theme" value={p.lightTheme} onChange={(lightTheme) => p.set({ lightTheme })} items={light.map((t) => ({ id: t.id, label: t.label }))} /></Row>
            <Row title="At night"><Seg label="Dark theme" value={p.darkTheme} onChange={(darkTheme) => p.set({ darkTheme })} items={dark.map((t) => ({ id: t.id, label: t.label }))} /></Row>
          </>
        )}
      </Group>
      <Group label="Feel">
        <Row title="Motion" hint="Reduced keeps fades and drops movement">
          <Seg label="Motion" value={p.motion} onChange={(motion) => p.set({ motion })} items={[{ id: "full", label: "Full" }, { id: "reduced", label: "Reduced" }, { id: "system", label: "System" }]} />
        </Row>
        <Row title="Glass" hint="Translucent sidebar, menus and bars. Off is solid and lighter on battery">
          <Switch label="Glass" on={p.glass} onChange={(glass) => p.set({ glass })} />
        </Row>
        <Row title="Compact sidebar" hint="Icons only; hover to see names">
          <Switch label="Compact sidebar" on={p.compactSidebar} onChange={(compactSidebar) => p.set({ compactSidebar })} />
        </Row>
      </Group>
    </>
  );
}

function TypeSection() {
  return (
    <>
      {([["ui", "Interface", "Menus, buttons and lists."], ["write", "Writing", "The words you type: journal, prayers, sermons."], ["read", "Reading", "Scripture, in the Bible and wherever verses are quoted."]] as const).map(([role, label, hint]) => (
        <section key={role} className="mt-6 first:mt-2">
          <p className="font-sans text-[10.5px] font-semibold uppercase px-0.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>{label}</p>
          <p className="font-sans text-[12.5px] mt-0.5 mb-2 px-0.5" style={{ color: "var(--bj-ink4)" }}>{hint}</p>
          <div className="bj-raised rounded-2xl p-1.5"><FaceList role={role} /></div>
        </section>
      ))}
    </>
  );
}

const WIDTHS: { id: WritingWidth; label: string }[] = [{ id: "narrow", label: "Narrow" }, { id: "normal", label: "Normal" }, { id: "wide", label: "Wide" }];

function Writing() {
  const w = useWritingStore();
  return (
    <>
      <div className="bj-well rounded-2xl px-5 py-4 mt-2">
        <p className="font-sans text-[10px] font-semibold uppercase mb-1.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>
          Preview · {WRITE_FACES.find((f) => f.id === w.font)?.label} {w.size} · {w.width} width
        </p>
        <p style={{ ...writingFontStyle(w.font, w.size), lineHeight: 1.6, color: "var(--bj-ink)" }}>
          Woke before the house. The kettle, the window, Psalm 46 open on my knee — <span style={{ color: "var(--bj-ink4)" }}>be still, and know.</span>
        </p>
      </div>
      <Group label="Page">
        <Row title="Font" hint="Interface and Bible faces are under Type">
          <PickWrap><Pick label="Writing font" value={w.font} onChange={(font) => w.set({ font })} items={WRITE_FACES.map((f) => ({ id: f.id, label: f.label }))} /></PickWrap>
        </Row>
        <Row title="Size"><Slider label="Writing size" value={w.size} min={15} max={28} onChange={(size) => w.set({ size })} /></Row>
        <Row title="Line width"><Seg label="Line width" value={w.width} onChange={(width) => w.set({ width })} items={WIDTHS} /></Row>
        <Row title="Daily goal" hint="A quiet ring in the corner; 0 turns it off">
          <span className="bj-well inline-flex items-center rounded-[10px] p-0.5">
            <button type="button" aria-label="Less" onClick={() => w.set({ goal: Math.max(0, w.goal - 50) })} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ color: "var(--bj-ink3)" }}><Minus size={13} /></button>
            <span className="w-[84px] text-center font-sans text-[12.5px] font-medium" style={{ color: "var(--bj-ink)", fontVariantNumeric: "tabular-nums" }}>{w.goal ? `${w.goal.toLocaleString()} words` : "Off"}</span>
            <button type="button" aria-label="More" onClick={() => w.set({ goal: Math.min(5000, w.goal + 50) })} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ color: "var(--bj-ink3)" }}><Plus size={13} /></button>
          </span>
        </Row>
      </Group>
      <Group label="While you write">
        <Row title="Focus paragraph" hint="Dim everything but the paragraph you’re in"><Switch label="Focus paragraph" on={w.focusParagraph} onChange={() => w.toggle("focusParagraph")} /></Row>
        <Row title="Typewriter scrolling" hint="Keep the line you’re on in the middle"><Switch label="Typewriter scrolling" on={w.typewriter} onChange={() => w.toggle("typewriter")} /></Row>
        <Row title="Smooth caret" hint="The cursor glides instead of jumping"><Switch label="Smooth caret" on={w.smoothCaret} onChange={() => w.toggle("smoothCaret")} /></Row>
      </Group>
    </>
  );
}

const VERSIONS = ["ESV", "KJV", "NIV", "NKJV", "NLT", "AMP", "MSG", "ASV"];

function Reading() {
  const w = useWritingStore();
  const { version, setVersion } = useBibleStore();
  const c = useCommentaryStore();
  return (
    <>
      <div className="bj-well rounded-2xl px-5 py-4 mt-2">
        <p className="font-sans text-[10px] font-semibold uppercase mb-1.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>Preview · Psalm 46:10 · {version}</p>
        <p style={{ ...readingFontStyle(w.readFont, w.readSize), lineHeight: 1.55, color: "var(--bj-ink)" }}>
          <sup className="font-sans text-[10px] mr-1" style={{ color: "var(--bj-gold)" }}>10</sup>“Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!”
        </p>
      </div>
      <Group label="Bible">
        <Row title="Translation" hint="Used in the reader, the floating Bible and quoted verses">
          <PickWrap><Pick label="Translation" value={version} onChange={setVersion} items={VERSIONS.map((v) => ({ id: v, label: v }))} /></PickWrap>
        </Row>
        <Row title="Font"><PickWrap><Pick label="Reading font" value={w.readFont} onChange={(readFont) => w.set({ readFont })} items={READ_FACES.map((f) => ({ id: f.id, label: f.label }))} /></PickWrap></Row>
        <Row title="Size"><Slider label="Reading size" value={w.readSize} min={15} max={28} onChange={(readSize) => w.set({ readSize })} /></Row>
      </Group>
      <Group label="Commentary">
        <Row title="Show commentary" hint="Notes beside the text in Study"><Switch label="Show commentary" on={c.enabled} onChange={c.setEnabled} /></Row>
        {c.enabled && (
          <Row title="Commentator" hint={COMMENTARY_SOURCES.find((s) => s.id === c.source)?.description}>
            <PickWrap><Pick label="Commentator" value={c.source} onChange={c.setSource} items={COMMENTARY_SOURCES.map((s) => ({ id: s.id, label: s.label }))} /></PickWrap>
          </Row>
        )}
      </Group>
    </>
  );
}

function Sounds() {
  const w = useWritingStore();
  const p = usePrefsStore();
  return (
    <>
      <Group>
        <Row title="Keyboard sounds" hint="Real mechanical switch recordings, press and release"><Switch label="Keyboard sounds" on={w.keySounds} onChange={() => w.toggle("keySounds")} /></Row>
        {w.keySounds && (
          <>
            <Row title="Everywhere you type" hint="Off keeps them to the journal, prayers and sermon notes"><Switch label="Everywhere you type" on={p.soundsEverywhere} onChange={(soundsEverywhere) => p.set({ soundsEverywhere })} /></Row>
            <Row title="Volume"><Slider label="Volume" value={Math.round(w.volume * 100)} min={10} max={100} step={5} onChange={(v) => w.set({ volume: v / 100 })} show={`${Math.round(w.volume * 100)}%`} /></Row>
          </>
        )}
      </Group>
      {w.keySounds && (
        <>
          <p className="font-sans text-[10.5px] font-semibold uppercase mt-6 mb-1.5 px-0.5" style={{ color: "var(--bj-ink4)", letterSpacing: "0.08em" }}>Switch</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(Object.keys(SWITCHES) as SwitchId[]).map((id) => {
              const on = w.switchId === id;
              return (
                <button key={id} type="button" onClick={() => { w.set({ switchId: id }); previewSwitch(id); }} aria-pressed={on}
                  className={`flex items-center gap-3 text-left rounded-xl px-3 py-2.5 ${on ? "bj-raised" : "bj-menu-item"}`}
                  style={{ border: on ? undefined : "1px solid transparent" }}>
                  <span className="w-7 h-7 rounded-lg bj-well flex items-center justify-center shrink-0" style={{ color: on ? "var(--bj-gold)" : "var(--bj-ink4)" }}>
                    {on ? <Check size={13} /> : <Play size={11} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-sans text-[13.5px] font-medium truncate" style={{ color: on ? "var(--bj-ink)" : "var(--bj-ink2)" }}>{SWITCHES[id].name}</span>
                    <span className="block font-sans text-[11.5px] truncate" style={{ color: "var(--bj-ink4)" }}>{SWITCHES[id].feel}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <textarea placeholder="Try it here…" rows={2}
            className="bj-well w-full mt-4 rounded-2xl px-4 py-3 outline-none resize-none font-write text-[17px]"
            style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
        </>
      )}
    </>
  );
}

function PrayerSection() {
  const p = usePrefsStore();
  return (
    <Group label="Today">
      <Row title="Prayers each day" hint="Auto picks enough that everything you carry comes round about once a week">
        <Seg label="Prayers each day" value={p.prayersPerDay} onChange={(prayersPerDay) => p.set({ prayersPerDay })}
          items={[{ id: 0, label: "Auto" }, { id: 3, label: "3" }, { id: 4, label: "4" }, { id: 5, label: "5" }, { id: 7, label: "7" }]} />
      </Row>
    </Group>
  );
}

function Shortcuts() {
  return (
    <>
      {SHORTCUT_GROUPS.map((g) => (
        <Group key={g.title} label={g.title}>
          {g.shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--bj-line-soft)" }}>
              <span className="flex-1 font-sans text-[13.5px]" style={{ color: "var(--bj-ink2)" }}>{s.desc}</span>
              <span className="flex gap-1">{s.keys.map((k) => <kbd key={k} className="bj-kbd">{k}</kbd>)}</span>
            </div>
          ))}
        </Group>
      ))}
    </>
  );
}

/** Hold for two seconds; letting go early cancels. */
function HoldToDelete({ onConfirm, busy }: { onConfirm: () => void; busy: boolean }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const start = () => { if (busy) return; setHolding(true); timer.current = setTimeout(() => { setHolding(false); onConfirm(); }, 2000); };
  const stop = () => { setHolding(false); clearTimeout(timer.current); };
  return (
    <button type="button" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) start(); }} onKeyUp={stop}
      className="relative overflow-hidden h-8 px-3.5 rounded-[10px] font-sans text-[12.5px] font-medium select-none active:scale-[0.97] transition-transform"
      style={{ border: "1px solid color-mix(in oklch, var(--bj-ember) 45%, transparent)", color: "var(--bj-ember)" }}>
      <span aria-hidden className="absolute inset-0" style={{
        background: "color-mix(in oklch, var(--bj-ember) 22%, transparent)",
        clipPath: holding ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
        transition: holding ? "clip-path 2s linear" : "clip-path 0.2s var(--ease-out)",
      }} />
      <span className="relative">{busy ? "Deleting…" : holding ? "Keep holding…" : "Hold to delete"}</span>
    </button>
  );
}

function Account() {
  const user = useAuthStore((s) => s.user);
  const p = usePrefsStore();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doExport() {
    if (!user || exporting) return;
    setExporting(true); setError(null);
    try {
      const data = await exportEverything(user.uid);
      const n = Object.values(data).reduce((a, r) => a + r.length, 0);
      downloadJson({ exportedAt: new Date().toISOString(), app: "BibJournal", ...data }, `bibjournal-${new Date().toISOString().slice(0, 10)}.json`);
      setExported(`${n.toLocaleString()} items saved`);
    } catch (e) {
      setError(`Export failed: ${(e as Error).message}`);
    } finally {
      setExporting(false);
    }
  }

  async function doDelete() {
    if (!user) return;
    setDeleting(true); setError(null);
    try {
      await deleteAccount();
    } catch (e) {
      const m = (e as Error).message;
      setError(m === "cancelled" ? "Nothing was deleted." : `Couldn’t delete: ${m}`);
      setDeleting(false);
    }
  }

  const initial = (Array.from((user?.displayName || user?.email || "U").trim())[0] ?? "U").toUpperCase();
  return (
    <>
      <div className="flex items-center gap-3.5 py-4 mt-1">
        {user?.photoURL
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover shrink-0" />
          : <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-sans text-lg font-medium" style={{ background: "var(--bj-gold-soft)", color: "var(--bj-gold-deep)" }}>{initial}</span>}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[15px] font-medium truncate" style={{ color: "var(--bj-ink)" }}>{user?.displayName || "Your account"}</p>
          <p className="font-sans text-[12.5px] truncate" style={{ color: "var(--bj-ink4)" }}>{user?.email} · signed in with Google</p>
        </div>
        <button type="button" onClick={() => signOutUser()} className="bj-raised bj-lift h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12.5px] font-medium shrink-0" style={{ color: "var(--bj-ink2)" }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
      <Group label="Your writing is yours">
        <Row title="Export everything" hint={exported ?? "Journal, prayers, sermons, notes and studies, in one JSON file"}>
          <button type="button" onClick={doExport} disabled={exporting} className="bj-gold h-8 px-3.5 rounded-[10px] flex items-center gap-1.5 font-sans text-[12.5px] font-semibold disabled:opacity-60">
            <Download size={13} /> {exporting ? "Gathering…" : "Export"}
          </button>
        </Row>
        <Row title="Where it lives" hint="Saved to your account as you write, and kept on this device for offline use">
          <span className="font-sans text-[12.5px] flex items-center gap-1.5" style={{ color: "var(--bj-sage)" }}><Check size={13} /> Synced</span>
        </Row>
      </Group>
      <Group label="Privacy">
        <Row title="Hide previews" hint="Blur entry text in lists until you hover, for writing in public"><Switch label="Hide previews" on={p.hidePreviews} onChange={(hidePreviews) => p.set({ hidePreviews })} /></Row>
      </Group>
      <Group label="Danger">
        <Row title="Delete my account" hint="Removes everything you’ve written and the account, for good. Google will ask you to confirm it’s you.">
          <HoldToDelete onConfirm={doDelete} busy={deleting} />
        </Row>
      </Group>
      {error && <p role="alert" className="font-sans text-[12.5px] mt-3 px-0.5" style={{ color: "var(--bj-ember)" }}>{error}</p>}
    </>
  );
}

export function SectionBody({ id }: { id: SectionId }) {
  switch (id) {
    case "appearance": return <Appearance />;
    case "type": return <TypeSection />;
    case "writing": return <Writing />;
    case "reading": return <Reading />;
    case "sounds": return <Sounds />;
    case "prayer": return <PrayerSection />;
    case "shortcuts": return <Shortcuts />;
    case "account": return <Account />;
  }
}
