"use client";

import { useAutosave } from "@/hooks/useAutosave";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, BookOpen, Link2, PenLine, X, Star, ArrowUpRight } from "lucide-react";
import { useSermonDetail } from "@/hooks/useSermons";
import {
  updateSermon, deleteSermon, setSermonMoments, saveSermonPosition,
  addSermonRef, updateSermonRef, removeSermonRef,
} from "@/services/sermon.service";
import { useAuthStore } from "@/store/auth.store";
import { useBibleStore } from "@/store/bible.store";
import { useVideoStore } from "@/store/video.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { TipTapEditor } from "@/components/journal/TipTapEditor";
import { VerseRefPanel } from "@/components/sermons/VerseRefPanel";
import { BibleFloatTriggers } from "@/components/shared/FloatingWindows";
import { SermonPlayer, type PlayerApi, type Marker } from "@/components/sermons/SermonPlayer";
import { MomentItem, Composer, TakeawayRow, refLabel } from "@/components/sermons/SermonNotes";
import { Avatar } from "@/components/sermons/Avatar";
import { extractYouTubeId } from "@/lib/youtube-parser";
import { findProseRefs, parseRef } from "@/lib/bible-ref-parser";
import { fetchPassage } from "@/lib/bible-client";
import { clock } from "@/lib/youtube-player";
import { startEntry } from "@/lib/startEntry";
import { lastInputWasKeyboard } from "@/lib/inputMode";
import { gSequencePending } from "@/lib/nav";
import type { SermonMoment, SermonMomentKind, SermonRef } from "@/types";

type Tab = "notes" | "takeaways" | "verses" | "page";

const uid = () => Math.random().toString(36).slice(2, 10);
const hasText = (json?: string) => !!json && /"text"\s*:\s*"[^"]*\S/.test(json);

export default function SermonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const version = useBibleStore((s) => s.version);
  const { sermon, loading } = useSermonDetail(id);
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const bibleOpen = useFloatWindowsStore((s) => s.bibleOpen);
  const askOpen = useFloatWindowsStore((s) => s.askOpen);
  const toggleBible = useFloatWindowsStore((s) => s.toggleBible);
  const toggleAsk = useFloatWindowsStore((s) => s.toggleAsk);

  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [church, setChurch] = useState("");
  const [sermonDate, setSermonDate] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [moments, setMoments] = useState<SermonMoment[]>([]);
  const [tab, setTab] = useState<Tab>("notes");
  const [start, setStart] = useState(0);
  const [now, setNow] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const initialised = useRef(false);

  const apiRef = useRef<PlayerApi | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const listEnd = useRef<HTMLDivElement>(null);

  // Load once from Firestore; after that, local state is the truth.
  useEffect(() => {
    if (!sermon || initialised.current) return;
    initialised.current = true;
    setTitle(sermon.title);
    setSpeaker(sermon.speaker);
    setChurch(sermon.church);
    setVideoUrl(sermon.videoUrl);
    setSermonDate(sermon.sermonDate);
    setVideoId(sermon.videoId);
    const ms = sermon.moments ?? [];
    setMoments(ms);
    if (!ms.length && hasText(sermon.content)) setTab("page");
    const pos = sermon.position ?? 0;
    const near = sermon.duration && pos > sermon.duration - 15;
    setStart(near ? 0 : pos);
    setNow(near ? 0 : pos);
  }, [sermon]);

  // A new sermon opens straight away; its title and speaker arrive from YouTube a moment later.
  const filled = useRef(false);
  const needsInfo = !!sermon && !!sermon.videoId && !sermon.title.trim() && !sermon.speaker.trim();
  const infoUrl = sermon?.videoUrl ?? "";
  useEffect(() => {
    if (!needsInfo || filled.current || !user) return;
    filled.current = true;
    const uid = user.uid;
    fetch(`/api/youtube/info?url=${encodeURIComponent(infoUrl)}`)
      .then((r) => r.json() as Promise<{ title?: string; author?: string }>)
      .then((info) => {
        const patch: { title?: string; speaker?: string } = {};
        if (info.title) { setTitle((t) => t || info.title!); patch.title = info.title; }
        if (info.author) { setSpeaker((t) => t || info.author!); patch.speaker = info.author; }
        if (Object.keys(patch).length) void updateSermon(uid, id, patch);
      })
      .catch(() => { /* stays as typed */ });
  }, [needsInfo, infoUrl, user, id]);

  // One player at a time: if this video is in the floating player, take it back.
  const clearVideo = useVideoStore((s) => s.clearVideo);
  const floatingId = useVideoStore((s) => s.videoId);
  useEffect(() => {
    if (videoId && floatingId === videoId) clearVideo();
  }, [videoId, floatingId, clearVideo]);

  // ── Saving ──
  const autosave = useAutosave<Record<string, unknown>>((sid, patch) =>
    user ? updateSermon(user.uid, sid, patch) : Promise.resolve(),
  );
  const scheduleSave = useCallback((patch: object) => {
    if (user) autosave.schedule(id, patch as Record<string, unknown>);
  }, [user, id, autosave.schedule]); // eslint-disable-line react-hooks/exhaustive-deps

  const writeMoments = useCallback((next: SermonMoment[]) => {
    setMoments(next);
    if (user) void setSermonMoments(user.uid, id, next);
  }, [user, id]);

  // Remember where playback is, quietly.
  const playing = useRef(false);
  const timeRef = useRef(0);
  const durRef = useRef(0);
  const lastSaved = useRef(0);
  const savePosition = useCallback(() => {
    if (!user || !durRef.current) return;
    lastSaved.current = timeRef.current;
    void saveSermonPosition(user.uid, id, timeRef.current, durRef.current);
  }, [user, id]);

  const onTick = useCallback((t: number, d: number) => {
    timeRef.current = t;
    if (d) durRef.current = d;
    setNow(t);
    if (Math.abs(t - lastSaved.current) >= 15) savePosition();
  }, [savePosition]);

  const onPlayingChange = useCallback((p: boolean) => {
    playing.current = p;
    if (!p) savePosition();
  }, [savePosition]);

  // A sermon left completely blank is removed on the way out.
  const blank = useRef(true);
  useEffect(() => {
    blank.current = !title.trim() && !speaker.trim() && !church.trim() && !videoId && moments.length === 0
      && !hasText(sermon?.content) && !(sermon?.references.length);
  }, [title, speaker, church, videoId, moments, sermon]);
  useEffect(() => () => {
    if (blank.current && initialised.current && user) void deleteSermon(user.uid, id);
  }, [user, id]);

  // Leaving while it plays: keep the sermon going in the floating player.
  const setFloating = useVideoStore((s) => s.setVideo);
  const handoff = useRef({ videoId, title });
  useEffect(() => { handoff.current = { videoId, title }; }, [videoId, title]);
  useEffect(() => () => {
    savePosition();
    if (playing.current && handoff.current.videoId) {
      setFloating(handoff.current.videoId, id, handoff.current.title, timeRef.current);
    }
  }, [id, savePosition, setFloating]);

  // ── Fields ──
  function field<K extends "title" | "speaker" | "church" | "sermonDate">(k: K, v: string) {
    ({ title: setTitle, speaker: setSpeaker, church: setChurch, sermonDate: setSermonDate })[k](v);
    scheduleSave({ [k]: v });
  }

  async function attachVideo(raw: string) {
    const vid = extractYouTubeId(raw);
    if (!vid) return false;
    setVideoUrl(raw);
    setVideoId(vid);
    setStart(0);
    setNow(0);
    const patch: Record<string, unknown> = { videoUrl: raw, videoId: vid };
    try {
      const info = await fetch(`/api/youtube/info?url=${encodeURIComponent(raw)}`).then((r) => r.json()) as { title?: string; author?: string };
      if (!title.trim() && info.title) { setTitle(info.title); patch.title = info.title; }
      if (!speaker.trim() && info.author) { setSpeaker(info.author); patch.speaker = info.author; }
    } catch { /* title stays as typed */ }
    if (user) void updateSermon(user.uid, id, patch);
    return true;
  }

  function removeVideo() {
    setVideoUrl("");
    setVideoId("");
    if (user) void updateSermon(user.uid, id, { videoUrl: "", videoId: "", position: 0 });
  }

  // ── Moments ──
  const hasVideo = !!videoId;

  async function catchVerse(m: SermonMoment) {
    if (!m.ref || m.ref.text || !m.ref.verse) return;
    try {
      const { verses } = await fetchPassage(version, { book: m.ref.book, chapter: m.ref.chapter, verse: m.ref.verse, verseEnd: m.ref.endVerse });
      const text = verses.map((v) => v.text).join(" ").trim();
      if (!text) return;
      setMoments((cur) => {
        const next = cur.map((x) => x.id === m.id ? { ...x, ref: { ...x.ref!, text } } : x);
        if (user) void setSermonMoments(user.uid, id, next);
        return next;
      });
    } catch { /* the reference still shows */ }
  }

  function addMoment(text: string, kind: SermonMomentKind, t: number | null) {
    const found = findProseRefs(text)[0];
    const m: SermonMoment = {
      id: uid(), t: t == null ? null : Math.floor(t), text, kind, at: new Date().toISOString(),
      ...(found ? { ref: { book: found.ref.book, chapter: found.ref.chapter, verse: found.ref.verse, ...(found.ref.verseEnd ? { endVerse: found.ref.verseEnd } : {}) } } : {}),
    };
    writeMoments([...moments, m].sort(byTime));
    if (tab !== "notes" && tab !== "takeaways") setTab("notes");
    void catchVerse(m);
    requestAnimationFrame(() => listEnd.current?.scrollIntoView({ block: "nearest", behavior: lastInputWasKeyboard() ? "auto" : "smooth" }));
  }

  async function addVerse(raw: string, t: number | null) {
    const r = parseRef(raw);
    if (!r) return false;
    const m: SermonMoment = {
      id: uid(), t: t == null ? null : Math.floor(t), text: "", kind: "note", at: new Date().toISOString(),
      ref: { book: r.book, chapter: r.chapter, ...(r.verse ? { verse: r.verse } : {}), ...(r.verseEnd ? { endVerse: r.verseEnd } : {}) },
    };
    writeMoments([...moments, m].sort(byTime));
    void catchVerse(m);
    return true;
  }

  function patchMoment(mid: string, patch: Partial<SermonMoment>) {
    writeMoments(moments.map((m) => m.id === mid ? { ...m, ...patch } : m));
  }
  function removeMoment(mid: string) {
    writeMoments(moments.filter((m) => m.id !== mid));
  }

  const seek = (t: number | null) => { if (t != null) apiRef.current?.seek(t, true); };

  // The note you're "in" while the video plays.
  const currentId = useMemo(() => {
    if (!hasVideo) return null;
    let cur: string | null = null;
    for (const m of moments) if (m.t != null && m.t <= now + 0.5) cur = m.id;
    return cur;
  }, [moments, now, hasVideo]);

  // The verse being preached right now (or the last one caught).
  const verseInPlay = useMemo(() => {
    const withRef = moments.filter((m) => m.ref);
    if (!withRef.length) return null;
    if (!hasVideo) return withRef[withRef.length - 1];
    const before = withRef.filter((m) => m.t != null && m.t <= now + 0.5);
    return before[before.length - 1] ?? null;
  }, [moments, now, hasVideo]);

  const markers: Marker[] = useMemo(() => moments.filter((m) => m.t != null).map((m) => ({
    id: m.id, t: m.t!, kind: m.kind, label: m.text || (m.ref ? refLabel(m.ref) : ""),
  })), [moments]);

  const takeaways = moments.filter((m) => m.kind === "takeaway");
  const verses = moments.filter((m) => m.ref);
  const passages = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; book: string; chapter: number; verse?: number }[] = [];
    for (const m of moments) if (m.ref) {
      const label = refLabel(m.ref);
      if (!seen.has(label)) { seen.add(label); out.push({ label, ...m.ref }); }
    }
    for (const r of sermon?.references ?? []) {
      const label = `${r.book} ${r.chapter}${r.verse ? `:${r.verse}` : ""}`;
      if (!seen.has(label)) { seen.add(label); out.push({ label, book: r.book, chapter: r.chapter, verse: r.verse }); }
    }
    return out.slice(0, 3);
  }, [moments, sermon?.references]);

  // Keys: ⌘. plays/pauses from anywhere; "n" jumps to the note box.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable=true]");
      if ((e.metaKey || e.ctrlKey) && e.key === ".") { e.preventDefault(); apiRef.current?.toggle(); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (gSequencePending() || e.defaultPrevented) return;
      if (e.key === "n") { e.preventDefault(); setTab("notes"); requestAnimationFrame(() => composerRef.current?.focus()); }
      if (e.key === "k") { if (hasVideo) { e.preventDefault(); apiRef.current?.toggle(); } }
      if (e.key === "j") apiRef.current?.seek((apiRef.current?.time() ?? 0) - 10);
      if (e.key === "l") apiRef.current?.seek((apiRef.current?.time() ?? 0) + 10);
    }
    // Capture, so "?" here wins over the global shortcuts sheet.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [hasVideo]);

  async function reflect() {
    if (!user) return;
    const lines = (takeaways.length ? takeaways : moments.filter((m) => m.text).slice(-3)).map((m) => m.text);
    const content = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "italic" }], text: `From “${title || "a sermon"}”${speaker ? ` — ${speaker}` : ""}` }] },
        ...(lines.length ? [{ type: "bulletList", content: lines.map((l) => ({ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: l }] }] })) }] : []),
        { type: "paragraph" },
      ],
    };
    const scriptures = verses.filter((m) => m.ref?.verse).slice(0, 4).map((m) => ({
      book: m.ref!.book, chapter: m.ref!.chapter, verse: m.ref!.verse!, ...(m.ref!.endVerse ? { endVerse: m.ref!.endVerse } : {}), version, ...(m.ref!.text ? { text: m.ref!.text } : {}),
    }));
    if (apiRef.current?.playing()) apiRef.current.toggle();
    await startEntry(user.uid, router.push, { title: `On ${title ? `“${title}”` : "this sermon"}`, content: JSON.stringify(content), scriptures }, "body");
  }

  async function handleDelete() {
    if (!user) return;
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    playing.current = false;
    await deleteSermon(user.uid, id);
    router.push("/sermons");
  }

  async function handleAddRef(ref: SermonRef) { if (user && sermon) await addSermonRef(user.uid, id, sermon.references, ref); }
  async function handleUpdateRef(refId: string, note: string) { if (user && sermon) await updateSermonRef(user.uid, id, sermon.references, refId, note); }
  async function handleRemoveRef(refId: string) { if (user && sermon) await removeSermonRef(user.uid, id, sermon.references, refId); }

  if (!loading && !sermon) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)" }}>This sermon isn’t here any more.</p>
        <button type="button" onClick={() => router.push("/sermons")} className="bj-raised bj-lift font-sans text-[13px] px-4 py-2 rounded-xl" style={{ color: "var(--bj-ink2)" }}>Back to Sermons</button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; n?: number }[] = [
    { id: "notes", label: "Notes", n: moments.length },
    { id: "takeaways", label: "Takeaways", n: takeaways.length },
    { id: "verses", label: "Verses", n: verses.length + (sermon?.references.length ?? 0) },
    { id: "page", label: "Page" },
  ];

  return (
    <div className="bj-ambient min-h-full md:h-full md:flex md:gap-3.5 md:p-3.5">
      {/* ── Left: watch ── */}
      <section className="md:flex-[1.25] min-w-0 md:overflow-y-auto flex flex-col gap-3 md:pr-0.5">
        <div className="hidden md:flex items-center gap-1 px-1">
          <button type="button" onClick={() => router.push("/sermons")} className="bj-btn-icon h-8 pl-1.5 pr-2.5 rounded-lg flex items-center gap-1.5 font-sans text-[13px]" style={{ color: "var(--bj-ink3)" }}>
            <ArrowLeft size={15} /> Sermons
          </button>
          <div className="ml-auto flex items-center gap-1">
            <BibleFloatTriggers bibleOpen={bibleOpen} askOpen={askOpen} onToggleBible={toggleBible} onToggleAsk={toggleAsk} />
            <button type="button" onClick={handleDelete} className="bj-btn-action h-8 px-2 rounded-lg flex items-center gap-1.5 font-sans text-[12px]" data-danger
              style={{ color: confirmDelete ? "#E08A7A" : "var(--bj-ink4)" }} title="Delete sermon">
              <Trash2 size={14} />{confirmDelete && "Delete?"}
            </button>
          </div>
        </div>

        {/* Player — sticks to the top on a phone so notes scroll beneath it */}
        <div className="sticky top-0 z-10 md:static">
          {loading ? (
            <div className="aspect-video md:rounded-[20px] animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
          ) : hasVideo ? (
            <SermonPlayer key={videoId} videoId={videoId} start={start} markers={markers} apiRef={apiRef}
              onTick={onTick} onPlayingChange={onPlayingChange} className="md:rounded-[20px]" />
          ) : (
            <div className="m-3 md:m-0 rounded-[20px] bj-well p-6 md:p-10 flex flex-col items-center text-center gap-4" style={{ minHeight: 220 }}>
              <span className="w-12 h-12 rounded-2xl bj-raised flex items-center justify-center"><Link2 size={20} style={{ color: "var(--bj-gold)" }} /></span>
              <div>
                <p className="font-display text-[22px]" style={{ color: "var(--bj-ink)" }}>Watching online?</p>
                <p className="font-sans text-[13px] mt-1 max-w-[340px]" style={{ color: "var(--bj-ink3)" }}>Paste the YouTube link and every note gets stamped with the moment it was said. In church? Just write. Notes get the time of day.</p>
              </div>
              <form className="w-full max-w-[440px] flex items-center gap-2 h-11 pl-3.5 pr-1.5 rounded-[14px] bj-raised"
                onSubmit={async (e) => { e.preventDefault(); if (await attachVideo(linkDraft)) setLinkDraft(""); }}>
                <input value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)} placeholder="youtube.com/watch?v=…" aria-label="YouTube link"
                  className="flex-1 min-w-0 bg-transparent outline-none font-sans text-[13.5px]" style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)" }} />
                <button type="submit" disabled={!extractYouTubeId(linkDraft)} className="bj-gold h-8 px-3 rounded-[10px] font-sans text-[12.5px] font-semibold disabled:opacity-40">Add</button>
              </form>
            </div>
          )}
        </div>

        {/* Title + who */}
        <div className="px-4 md:px-1.5 pt-1">
          <div className="flex items-start gap-2">
            <button type="button" onClick={() => router.push("/sermons")} aria-label="Back to Sermons" className="md:hidden bj-btn-icon w-8 h-8 -ml-1.5 mt-0.5 rounded-lg flex items-center justify-center shrink-0" style={{ color: "var(--bj-ink3)" }}>
              <ArrowLeft size={16} />
            </button>
            <textarea value={title} onChange={(e) => field("title", e.target.value.replace(/\n/g, " "))} rows={Math.max(1, Math.ceil(title.length / 38))} placeholder="Sermon title"
              aria-label="Sermon title"
              className="font-display flex-1 min-w-0 bg-transparent outline-none resize-none overflow-hidden text-[26px] md:text-[31px] leading-[1.12]"
              style={{ color: "var(--bj-ink)", caretColor: "var(--bj-gold)", }} />
          </div>
          <div className="flex items-center gap-x-2 gap-y-1.5 flex-wrap mt-2 font-sans text-[13px]" style={{ color: "var(--bj-ink3)" }}>
            <Avatar name={speaker} />
            <input value={speaker} onChange={(e) => field("speaker", e.target.value)} placeholder="Speaker" aria-label="Speaker" size={Math.max(7, speaker.length + 1)}
              className="bg-transparent outline-none min-w-[60px] max-w-[220px]" style={{ color: "var(--bj-ink2)", caretColor: "var(--bj-gold)", }} />
            <span style={{ color: "var(--bj-ink4)" }}>·</span>
            <input value={church} onChange={(e) => field("church", e.target.value)} placeholder="Church" aria-label="Church" size={Math.max(6, church.length + 1)}
              className="bg-transparent outline-none min-w-[50px] max-w-[220px]" style={{ caretColor: "var(--bj-gold)", }} />
            <span style={{ color: "var(--bj-ink4)" }}>·</span>
            <input type="date" value={sermonDate} onChange={(e) => field("sermonDate", e.target.value)} aria-label="Date"
              className="bg-transparent outline-none" style={{ color: "var(--bj-ink3)", colorScheme: "dark light" }} />
            {hasVideo && (
              <button type="button" onClick={removeVideo} title={videoUrl} className="bj-btn-icon h-6 px-1.5 rounded-md flex items-center gap-1 text-[11.5px]" style={{ color: "var(--bj-ink4)" }}>
                <X size={11} /> Video
              </button>
            )}
            {passages.length > 0 && (
              <span className="flex gap-1.5 md:ml-auto flex-wrap">
                {passages.map((p) => (
                  <button key={p.label} type="button" onClick={() => openBibleAt({ book: p.book, chapter: p.chapter, verse: p.verse })}
                    className="bj-raised bj-lift h-7 px-2.5 rounded-full flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "var(--bj-ink2)" }}>
                    <BookOpen size={11} style={{ color: "var(--bj-gold)" }} />{p.label}
                  </button>
                ))}
              </span>
            )}
          </div>
        </div>

        {/* The verse in play */}
        {verseInPlay?.ref && (
          <motion.button
            key={verseInPlay.id}
            type="button"
            onClick={() => openBibleAt({ book: verseInPlay.ref!.book, chapter: verseInPlay.ref!.chapter, verse: verseInPlay.ref!.verse })}
            initial={lastInputWasKeyboard() ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="hidden md:flex bj-raised bj-lift mx-1.5 rounded-2xl px-4 py-3.5 gap-3.5 items-start text-left"
          >
            <span className="w-8 h-8 rounded-[10px] bj-well flex items-center justify-center shrink-0"><BookOpen size={15} style={{ color: "var(--bj-gold)" }} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: "var(--bj-gold)" }}>
                {verseInPlay.t != null ? `Mentioned at ${clock(verseInPlay.t)} · ` : ""}{refLabel(verseInPlay.ref)}
              </span>
              <span className="block font-read italic text-[18px] leading-[1.45]" style={{ color: "var(--bj-ink)" }}>
                {verseInPlay.ref.text ? `“${verseInPlay.ref.text}”` : "Open in the Bible"}
              </span>
            </span>
            <ArrowUpRight size={15} className="shrink-0 mt-1" style={{ color: "var(--bj-ink4)" }} />
          </motion.button>
        )}
      </section>

      {/* ── Right: the notes sheet ── */}
      <section className="md:flex-1 min-w-0 md:rounded-[22px] flex flex-col md:overflow-hidden mt-3 md:mt-0 bj-sheet">
        <div className="flex items-center gap-2 px-3 md:px-4 pt-3 pb-3 border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
          <div className="flex-1 flex items-center gap-0.5 p-0.5 rounded-[12px] bj-well relative">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} data-active={tab === t.id || undefined}
                className="relative flex-1 h-8 rounded-[10px] font-sans text-[12.5px] font-medium flex items-center justify-center gap-1.5"
                style={{ color: tab === t.id ? "var(--bj-ink)" : "var(--bj-ink4)" }}>
                {tab === t.id && (
                  <motion.span layoutId="sermon-tab" className="absolute inset-0 rounded-[10px] bj-raised"
                    transition={lastInputWasKeyboard() ? { duration: 0 } : { type: "spring", duration: 0.36, bounce: 0.12 }} />
                )}
                <span className="relative">{t.label}</span>
                {!!t.n && <span className="relative tabular-nums text-[11px]" style={{ color: "var(--bj-ink4)" }}>{t.n}</span>}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => void reflect()} title="Write about this sermon in your journal"
            className="bj-raised bj-lift h-9 px-3 rounded-[11px] hidden sm:flex items-center gap-1.5 font-sans text-[12.5px] font-medium shrink-0" style={{ color: "var(--bj-ink2)" }}>
            <PenLine size={13} style={{ color: "var(--bj-gold)" }} /> Reflect
          </button>
        </div>

        {tab === "page" ? (
          <div className="flex-1 min-h-[60vh] md:min-h-0 overflow-hidden">
            {sermon && (
              <TipTapEditor entryId={id} content={sermon.content} onChange={(json) => scheduleSave({ content: json })}
                placeholder="Write freely. Headings, lists, verses, all of it." compact />
            )}
          </div>
        ) : tab === "verses" ? (
          <div className="flex-1 min-h-0 flex flex-col md:overflow-hidden">
            {verses.length > 0 && (
              <div className="px-4 md:px-5 pt-4 pb-3 flex flex-col gap-2 md:max-h-[45%] md:overflow-y-auto border-b" style={{ borderColor: "var(--bj-line-soft)" }}>
                <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--bj-ink4)" }}>Caught while listening</p>
                {verses.map((m) => (
                  <button key={m.id} type="button" onClick={() => openBibleAt({ book: m.ref!.book, chapter: m.ref!.chapter, verse: m.ref!.verse })}
                    className="bj-raised bj-lift rounded-xl px-3 py-2.5 text-left flex gap-3 items-start">
                    {m.t != null && <span className="font-sans text-[11px] font-semibold tabular-nums mt-0.5" style={{ color: "var(--bj-gold)" }}>{clock(m.t)}</span>}
                    <span className="min-w-0">
                      <span className="block font-sans text-[13px] font-medium" style={{ color: "var(--bj-ink)" }}>{refLabel(m.ref!)}</span>
                      {m.ref!.text && <span className="block font-read italic text-[15px] leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--bj-ink3)" }}>{m.ref!.text}</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 min-h-[50vh] md:min-h-0 overflow-hidden">
              <VerseRefPanel refs={sermon?.references ?? []} onAdd={handleAddRef} onUpdateNote={handleUpdateRef} onRemove={handleRemoveRef} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 md:overflow-y-auto px-4 md:px-6 pt-5 pb-4">
              {tab === "notes" ? (
                moments.length ? (
                  <div className="flex flex-col gap-4">
                    {moments.map((m) => (
                      <MomentItem key={m.id} m={m} current={m.id === currentId}
                        onSeek={() => seek(m.t)} onChange={(p) => patchMoment(m.id, p)} onRemove={() => removeMoment(m.id)}
                        onOpenRef={() => m.ref && openBibleAt({ book: m.ref.book, chapter: m.ref.chapter, verse: m.ref.verse })} />
                    ))}
                    <div ref={listEnd} />
                  </div>
                ) : (
                  <EmptyNotes hasVideo={hasVideo} legacy={hasText(sermon?.content)} onPage={() => setTab("page")} />
                )
              ) : takeaways.length ? (
                <div className="flex flex-col gap-2">
                  <p className="font-sans text-[12.5px] mb-1" style={{ color: "var(--bj-ink3)" }}>Things to live this week. They stay on your Sermons page until you tick them off.</p>
                  {takeaways.map((m) => (
                    <TakeawayRow key={m.id} m={m} onToggle={() => patchMoment(m.id, { done: !m.done })} onSeek={hasVideo ? () => seek(m.t) : undefined} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 py-12">
                  <Star size={20} style={{ color: "var(--bj-gold)" }} />
                  <p className="font-display text-[20px]" style={{ color: "var(--bj-ink)" }}>What will you do with this?</p>
                  <p className="font-sans text-[13px] max-w-[300px]" style={{ color: "var(--bj-ink3)" }}>Write a note as a <b style={{ color: "var(--bj-gold)", fontWeight: 600 }}>Takeaway</b>, or star any note. You can tick them off as you live them.</p>
                </div>
              )}
            </div>
            <div className="sermon-dock px-3 md:px-3.5 pb-3 md:pb-3.5 pt-1">
              <Composer now={now} hasVideo={hasVideo} onSave={addMoment} onVerse={addVerse} inputRef={composerRef} />
              {hasVideo && (
                <p className="hidden md:flex font-sans text-[11px] mt-2 px-1 gap-3" style={{ color: "var(--bj-ink4)" }}>
                  <span><Kbd>N</Kbd> write</span><span><Kbd>K</Kbd> play / pause</span><span><Kbd>J</Kbd><Kbd>L</Kbd> ±10s</span><span><Kbd>⌘.</Kbd> play while typing</span>
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function byTime(a: SermonMoment, b: SermonMoment) {
  if (a.t != null && b.t != null) return a.t - b.t || a.at.localeCompare(b.at);
  return a.at.localeCompare(b.at);
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="font-sans text-[10px] px-1 py-px rounded mr-0.5 bj-well" style={{ color: "var(--bj-ink3)" }}>{children}</kbd>;
}

function EmptyNotes({ hasVideo, legacy, onPage }: { hasVideo: boolean; legacy: boolean; onPage: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10">
      <p className="font-display text-[21px]" style={{ color: "var(--bj-ink)" }}>{hasVideo ? "Press play, then write." : "Write as you listen."}</p>
      <p className="font-sans text-[13px] max-w-[320px]" style={{ color: "var(--bj-ink3)" }}>
        {hasVideo
          ? "Each note is stamped with the moment in the sermon, and shows up as a mark on the video. Type a reference like John 15:5 and the verse is caught for you."
          : "Short notes, one thought each. Type a reference like John 15:5 and the verse is caught for you."}
      </p>
      {legacy && (
        <button type="button" onClick={onPage} className="bj-raised bj-lift mt-2 h-8 px-3 rounded-[10px] font-sans text-[12.5px]" style={{ color: "var(--bj-ink2)" }}>
          Your earlier notes are on the Page tab
        </button>
      )}
    </div>
  );
}
