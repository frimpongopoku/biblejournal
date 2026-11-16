"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Plus, Search, X, Mic, PenLine, NotebookPen, Check, TvMinimalPlay } from "lucide-react";
import { useSermons } from "@/hooks/useSermons";
import { createSermon, setSermonMoments } from "@/services/sermon.service";
import { useAuthStore } from "@/store/auth.store";
import { extractYouTubeId, youTubeThumbnail } from "@/lib/youtube-parser";
import { clock } from "@/lib/youtube-player";
import { startEntry } from "@/lib/startEntry";
import { Avatar, avatarColor } from "@/components/sermons/Avatar";
import type { Sermon, SermonMoment } from "@/types";

const LABEL = "font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-2.5";

function shortDate(s: string) {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`;
}

function noteCount(s: Sermon) {
  return (s.moments ?? []).filter((m) => m.text).length;
}

function matches(s: Sermon, q: string) {
  const l = q.toLowerCase();
  return [s.title, s.speaker, s.church].some((x) => x.toLowerCase().includes(l))
    || (s.moments ?? []).some((m) => m.text.toLowerCase().includes(l));
}

/** In progress = started, not finished. */
function inProgress(s: Sermon) {
  return !!s.videoId && !!s.duration && (s.position ?? 0) > 30 && (s.position ?? 0) < s.duration - 60;
}

function Thumb({ s, big, className = "" }: { s: Sermon; big?: boolean; className?: string }) {
  const prog = s.duration ? Math.min(100, ((s.position ?? 0) / s.duration) * 100) : 0;
  return (
    <div className={`relative overflow-hidden shrink-0 ${className}`}
      style={{ aspectRatio: "16 / 9", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1), 0 14px 30px -14px rgba(0,0,0,.7)", background: s.speaker ? `linear-gradient(135deg, ${avatarColor(s.speaker)}44, var(--bj-bg-soft))` : "var(--bj-bg-soft)" }}>
      {s.videoId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={big ? youTubeThumbnail(s.videoId).replace("mqdefault", "hqdefault") : youTubeThumbnail(s.videoId)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover sermon-thumb-img" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center"><Mic size={big ? 30 : 22} style={{ color: "var(--bj-ink4)" }} /></span>
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,.55))" }} />
      {s.videoId && (
        <span className={`sermon-play absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center bj-glass ${big ? "w-14 h-14" : "w-10 h-10"}`}
          style={{ background: "rgba(20,20,24,.35)", borderColor: "rgba(255,255,255,.2)" }}>
          <Play size={big ? 20 : 14} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
        </span>
      )}
      {!!s.duration && (
        <span className="absolute right-2.5 bottom-2.5 font-sans text-[11px] font-semibold tabular-nums px-1.5 py-px rounded-md" style={{ background: "rgba(0,0,0,.6)", color: "#fff" }}>{clock(s.duration)}</span>
      )}
      {prog > 2 && (
        <div className="absolute left-0 right-0 bottom-0 h-1" style={{ background: "rgba(255,255,255,.18)" }}>
          <div className="h-full" style={{ width: `${prog}%`, background: "color-mix(in oklch, var(--bj-gold), white 25%)", boxShadow: "0 0 8px color-mix(in oklch, var(--bj-gold) 80%, transparent)" }} />
        </div>
      )}
    </div>
  );
}

function Card({ s }: { s: Sermon }) {
  const n = noteCount(s);
  const refs = [...new Set([...(s.moments ?? []).filter((m) => m.ref).map((m) => `${m.ref!.book} ${m.ref!.chapter}`), ...s.references.map((r) => `${r.book} ${r.chapter}`)])];
  return (
    <Link href={`/sermons/${s.id}`} className="bj-raised bj-lift rounded-[18px] p-2.5 flex flex-col gap-2.5 min-w-0">
      <Thumb s={s} className="rounded-[12px]" />
      <div className="px-1 pb-1 min-w-0">
        <p className="font-display text-[19px] leading-[1.2] line-clamp-2" style={{ color: s.title ? "var(--bj-ink)" : "var(--bj-ink4)" }}>{s.title || "Untitled sermon"}</p>
        <div className="flex items-center gap-1.5 mt-1.5 font-sans text-[12px] min-w-0" style={{ color: "var(--bj-ink3)" }}>
          <Avatar name={s.speaker} size={18} />
          {s.speaker && <span className="truncate">{s.speaker}</span>}
          {s.sermonDate && <span className="shrink-0" style={{ color: "var(--bj-ink4)" }}>{s.speaker ? "· " : ""}{shortDate(s.sermonDate)}</span>}
        </div>
        {(n > 0 || refs.length > 0) && (
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {n > 0 && <Chip><NotebookPen size={11} /> {plural(n, "note")}</Chip>}
            {refs.slice(0, 2).map((r) => <Chip key={r}>{r}</Chip>)}
            {refs.length > 2 && <Chip>+{refs.length - 2}</Chip>}
          </div>
        )}
      </div>
    </Link>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="h-6 px-2 rounded-full bj-well inline-flex items-center gap-1 font-sans text-[11px] whitespace-nowrap" style={{ color: "var(--bj-ink3)" }}>{children}</span>;
}

export default function SermonsPage() {
  const user = useAuthStore((s) => s.user);
  const { sermons, loading } = useSermons();
  const router = useRouter();
  const [link, setLink] = useState("");
  const [search, setSearch] = useState("");
  const [speaker, setSpeaker] = useState<string | null>(null);

  /** Opens the new sermon at once; its title and speaker fill in on the page. */
  async function start(raw?: string) {
    if (!user) return;
    const vid = raw ? extractYouTubeId(raw) : null;
    const id = await createSermon(user.uid, vid && raw ? { videoUrl: raw, videoId: vid } : {});
    router.push(`/sermons/${id}`);
  }

  const continueOne = useMemo(() => sermons.find(inProgress) ?? null, [sermons]);

  const speakers = useMemo(() => {
    const count = new Map<string, number>();
    for (const s of sermons) if (s.speaker.trim()) count.set(s.speaker.trim(), (count.get(s.speaker.trim()) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
  }, [sermons]);

  const list = useMemo(() => sermons
    .filter((s) => s.id !== continueOne?.id || search || speaker)
    .filter((s) => !speaker || s.speaker.trim() === speaker)
    .filter((s) => !search.trim() || matches(s, search.trim())), [sermons, continueOne, search, speaker]);

  const takeaways = useMemo(() => {
    const out: { m: SermonMoment; s: Sermon }[] = [];
    for (const s of sermons) for (const m of s.moments ?? []) if (m.kind === "takeaway") out.push({ m, s });
    const open = out.filter((x) => !x.m.done);
    const done = out.filter((x) => x.m.done).slice(0, 2);
    return [...open.slice(0, 5), ...done];
  }, [sermons]);

  const books = useMemo(() => {
    const count = new Map<string, number>();
    for (const s of sermons) {
      const seen = new Set<string>();
      for (const m of s.moments ?? []) if (m.ref) seen.add(m.ref.book);
      for (const r of s.references) seen.add(r.book);
      for (const b of seen) count.set(b, (count.get(b) ?? 0) + 1);
    }
    const top = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = top[0]?.[1] ?? 1;
    return top.map(([book, n]) => ({ book, n, w: (n / max) * 100 }));
  }, [sermons]);

  function toggleTakeaway(s: Sermon, mid: string) {
    if (!user) return;
    void setSermonMoments(user.uid, s.id, (s.moments ?? []).map((m) => m.id === mid ? { ...m, done: !m.done } : m));
  }

  const totalNotes = sermons.reduce((n, s) => n + noteCount(s), 0);
  const last = sermons.map((s) => s.sermonDate).filter(Boolean).sort().at(-1);
  const linkOk = !!extractYouTubeId(link);

  const pasteBox = (
    <form onSubmit={(e) => { e.preventDefault(); void start(linkOk ? link : undefined); }}
      className="flex items-center gap-2 h-11 pl-3.5 pr-1.5 rounded-[14px] bj-well w-full md:w-[420px]">
      <TvMinimalPlay size={16} style={{ color: linkOk ? "#E2665A" : "var(--bj-ink4)" }} className="shrink-0" />
      <input value={link} onChange={(e) => setLink(e.target.value)} onPaste={(e) => {
        const v = e.clipboardData.getData("text");
        if (extractYouTubeId(v)) { e.preventDefault(); setLink(v); void start(v); }
      }}
        placeholder="Paste a YouTube link to start notes…" aria-label="YouTube link"
        className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[13.5px]" style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
      <button type="submit" className="bj-gold h-8 px-3 rounded-[10px] flex items-center gap-1.5 font-sans text-[12.5px] font-semibold shrink-0 disabled:opacity-60">
        <Plus size={13} strokeWidth={2.4} />{linkOk ? "Start" : "New"}
      </button>
    </form>
  );

  return (
    <div className="bj-ambient min-h-full xl:h-full flex">
      <div className="flex-1 min-w-0 xl:overflow-y-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6 bj-stagger">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-[34px] md:text-[40px] leading-none" style={{ color: "var(--bj-ink)" }}>Sermons</h1>
            <p className="font-sans text-[13px] mt-2" style={{ color: "var(--bj-ink3)" }}>
              {sermons.length
                ? [plural(sermons.length, "message"), totalNotes ? plural(totalNotes, "note") : null, last ? `last one ${shortDate(last)}` : null].filter(Boolean).join(" · ")
                : "Watch, listen, and keep what was said."}
            </p>
          </div>
          <div className="md:ml-auto">{pasteBox}</div>
        </div>

        {loading && (
          <div className="flex flex-col gap-4">
            <div className="h-[220px] rounded-[22px] animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[0, 1, 2].map((i) => <div key={i} className="h-[240px] rounded-[18px] animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />)}
            </div>
          </div>
        )}

        {/* Continue */}
        {!loading && continueOne && !search && !speaker && (
          <div className="relative overflow-hidden rounded-[22px] p-3 md:p-3.5 flex flex-col md:flex-row gap-4 md:gap-5" style={{ background: "linear-gradient(180deg, var(--m-paper-top), var(--m-paper-bot))", border: "1px solid var(--m-edge)", boxShadow: "inset 0 1px 0 var(--m-hi), 0 24px 60px -16px var(--m-shade)" }}>
            {continueOne.videoId && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={youTubeThumbnail(continueOne.videoId)} alt="" aria-hidden className="absolute inset-[-60px] w-[calc(100%+120px)] h-[calc(100%+120px)] object-cover pointer-events-none" style={{ filter: "blur(60px)", opacity: 0.26 }} />
            )}
            <Link href={`/sermons/${continueOne.id}`} className="relative md:w-[46%] shrink-0 block sermon-hero-thumb">
              <Thumb s={continueOne} big className="rounded-[14px]" />
            </Link>
            <div className="relative flex-1 min-w-0 flex flex-col md:py-1.5 md:pr-2">
              <span className="self-start h-6 px-2.5 rounded-full flex items-center font-sans text-[11px] font-semibold"
                style={{ background: "color-mix(in oklch, var(--bj-gold) 16%, transparent)", color: "var(--bj-gold)" }}>
                Continue · {Math.max(1, Math.round(((continueOne.duration ?? 0) - (continueOne.position ?? 0)) / 60))} min left
              </span>
              <Link href={`/sermons/${continueOne.id}`} className="font-display text-[26px] md:text-[32px] leading-[1.1] mt-2.5 line-clamp-2" style={{ color: "var(--bj-ink)" }}>{continueOne.title || "Untitled sermon"}</Link>
              <div className="flex items-center gap-2 mt-2 font-sans text-[13px] min-w-0" style={{ color: "var(--bj-ink3)" }}>
                <Avatar name={continueOne.speaker} />
                <span className="truncate">{[continueOne.speaker, continueOne.church, shortDate(continueOne.sermonDate)].filter(Boolean).join(" · ")}</span>
              </div>
              {(continueOne.moments ?? []).some((m) => m.text) && (
                <div className="mt-4 flex flex-col gap-1.5">
                  {(continueOne.moments ?? []).filter((m) => m.text).slice(-3).map((m) => (
                    <div key={m.id} className="flex gap-2.5 items-baseline min-w-0">
                      <span className="font-sans text-[11px] font-semibold tabular-nums w-10 shrink-0" style={{ color: "var(--bj-gold)" }}>{m.t != null ? clock(m.t) : "·"}</span>
                      <p className="font-write text-[16px] leading-snug truncate" style={{ color: "var(--bj-ink2)" }}>{m.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-auto pt-4 flex gap-2 flex-wrap">
                <Link href={`/sermons/${continueOne.id}`} className="bj-gold h-[38px] px-4 rounded-xl flex items-center gap-2 font-sans text-[13px] font-semibold">
                  <Play size={13} fill="currentColor" /> Resume at {clock(continueOne.position)}
                </Link>
                <button type="button" onClick={() => user && void startEntry(user.uid, router.push, { title: `On “${continueOne.title || "this sermon"}”` }, "body")}
                  className="bj-glass bj-lift h-[38px] px-3.5 rounded-xl flex items-center gap-2 font-sans text-[13px] font-medium" style={{ color: "var(--bj-ink2)" }}>
                  <PenLine size={13} style={{ color: "var(--bj-gold)" }} /> Reflect in journal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {!loading && sermons.length > 0 && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="bj-rail flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1">
              <FilterChip on={!speaker} onClick={() => setSpeaker(null)}>All</FilterChip>
              {speakers.slice(0, 8).map((sp) => (
                <FilterChip key={sp.name} on={speaker === sp.name} onClick={() => setSpeaker(speaker === sp.name ? null : sp.name)}>
                  <Avatar name={sp.name} size={16} /> <span className="max-w-[160px] truncate">{sp.name}</span>
                </FilterChip>
              ))}
            </div>
            <label className="flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] bj-well shrink-0 w-[150px] md:w-[220px]">
              <Search size={13} style={{ color: "var(--bj-ink4)" }} className="shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes" aria-label="Search sermons and notes"
                className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[12.5px]" style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear" className="shrink-0" style={{ color: "var(--bj-ink4)" }}><X size={12} /></button>}
            </label>
          </div>
        )}

        {/* Grid */}
        {!loading && list.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bj-stagger">
            {list.map((s) => <Card key={s.id} s={s} />)}
          </div>
        )}

        {!loading && sermons.length > 0 && list.length === 0 && (search || speaker) && (
          <div className="py-16 flex flex-col items-center gap-3">
            <p className="font-display italic text-[19px]" style={{ color: "var(--bj-ink4)" }}>Nothing matches{search ? ` “${search}”` : ""}.</p>
            <button type="button" onClick={() => { setSearch(""); setSpeaker(null); }} className="bj-raised bj-lift h-8 px-3.5 rounded-[10px] font-sans text-[12.5px]" style={{ color: "var(--bj-ink2)" }}>Clear filters</button>
          </div>
        )}

        {!loading && sermons.length === 0 && (
          <div className="py-14 md:py-20 flex flex-col items-center text-center gap-5">
            <span className="w-16 h-16 rounded-[20px] bj-raised flex items-center justify-center"><Mic size={26} style={{ color: "var(--bj-gold)" }} /></span>
            <div>
              <p className="font-display text-[26px]" style={{ color: "var(--bj-ink)" }}>Keep what was preached to you.</p>
              <p className="font-sans text-[13.5px] mt-2 max-w-[380px] mx-auto" style={{ color: "var(--bj-ink3)" }}>
                Paste a YouTube link above. Your notes get stamped with the moment they were said, verses are caught as you type them, and takeaways stay with you through the week.
              </p>
            </div>
            <button type="button" onClick={() => void start()} className="bj-raised bj-lift h-10 px-4 rounded-xl font-sans text-[13px]" style={{ color: "var(--bj-ink2)" }}>
              No link? Start notes for a live service
            </button>
          </div>
        )}
      </div>

      {/* Rail */}
      {!loading && sermons.length > 0 && (takeaways.length > 0 || books.length > 0) && (
        <aside className="hidden xl:block w-[300px] shrink-0 p-3.5 pl-0">
          <div className="bj-glass bj-enter h-full rounded-[20px] px-4 py-5 flex flex-col gap-6 overflow-y-auto">
            <section>
              <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>Living it this week</p>
              {takeaways.length ? (
                <div className="flex flex-col gap-1.5">
                  {takeaways.map(({ m, s }) => (
                    <div key={s.id + m.id} className="bj-raised rounded-[12px] px-3 py-2.5 flex gap-2.5 items-start">
                      <button type="button" onClick={() => toggleTakeaway(s, m.id)} aria-label={m.done ? "Mark as not lived yet" : "Mark as lived"}
                        className={`sermon-check mt-0.5 w-[18px] h-[18px] rounded-[6px] shrink-0 flex items-center justify-center ${m.done ? "" : "bj-well"}`}
                        data-done={m.done || undefined} style={m.done ? { background: "#8DB59A" } : undefined}>
                        {m.done && <Check size={12} strokeWidth={3} color="#10251a" />}
                      </button>
                      <Link href={`/sermons/${s.id}`} className="min-w-0">
                        <p className="font-write text-[15px] leading-snug line-clamp-3" style={{ color: m.done ? "var(--bj-ink4)" : "var(--bj-ink2)", textDecoration: m.done ? "line-through" : undefined }}>{m.text}</p>
                        <p className="font-sans text-[11px] mt-1 truncate" style={{ color: "var(--bj-ink4)" }}>{s.title || "Untitled sermon"}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-[12.5px] leading-relaxed" style={{ color: "var(--bj-ink4)" }}>Star a note while you listen and it lands here, so it doesn’t end when the sermon does.</p>
              )}
            </section>
            {books.length > 0 && (
              <section>
                <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>Most preached to you</p>
                <div className="flex flex-col gap-2">
                  {books.map((b) => (
                    <div key={b.book} className="flex items-center gap-2.5 font-sans text-[12.5px]" style={{ color: "var(--bj-ink2)" }}>
                      <span className="w-[84px] truncate">{b.book}</span>
                      <span className="flex-1 h-1.5 rounded-full bj-well overflow-hidden" style={{ border: 0 }}>
                        <i className="block h-full rounded-full" style={{ width: `${b.w}%`, background: "linear-gradient(90deg, var(--bj-gold), color-mix(in oklch, var(--bj-gold), white 25%))" }} />
                      </span>
                      <span className="w-5 text-right tabular-nums" style={{ color: "var(--bj-ink4)" }}>{b.n}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {speakers.length > 1 && (
              <section>
                <p className={LABEL} style={{ color: "var(--bj-ink4)" }}>Speakers</p>
                <div className="flex flex-wrap gap-1.5">
                  {speakers.slice(0, 10).map((sp) => (
                    <button key={sp.name} type="button" onClick={() => setSpeaker(speaker === sp.name ? null : sp.name)} title={`${sp.name} · ${plural(sp.n, "sermon")}`}
                      className="sermon-avatar rounded-full" data-active={speaker === sp.name || undefined}>
                      <Avatar name={sp.name} size={30} />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} data-active={on || undefined}
      className={`h-8 px-3 rounded-full flex items-center gap-1.5 font-sans text-[12.5px] whitespace-nowrap shrink-0 ${on ? "bj-raised" : "bj-chip"}`}
      style={{ color: on ? "var(--bj-ink)" : "var(--bj-ink3)", fontWeight: on ? 500 : 400 }}>
      {children}
    </button>
  );
}
