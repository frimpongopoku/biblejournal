"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Maximize, RotateCcw } from "lucide-react";
import { loadYouTubeApi, clock, YT_PLAYING, YT_ENDED, type YTPlayer } from "@/lib/youtube-player";
import { youTubeThumbnail } from "@/lib/youtube-parser";

export interface PlayerApi {
  time(): number;
  duration(): number;
  playing(): boolean;
  seek(t: number, play?: boolean): void;
  toggle(): void;
}

export interface Marker { id: string; t: number; kind: "note" | "takeaway" | "question"; label: string }

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75];

/**
 * The sermon video with our own controls, so notes can live on the timeline:
 * every note is a tick on the scrubber, and clicking one jumps there.
 */
export function SermonPlayer({
  videoId, start = 0, markers, apiRef, onTick, onPlayingChange, className,
}: {
  videoId: string;
  start?: number;
  markers: Marker[];
  apiRef: React.RefObject<PlayerApi | null>;
  /** Called about once a second while playing, and on seek. */
  onTick?: (t: number, duration: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(start);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const [idle, setIdle] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const tickRef = useRef(onTick);
  const playRef = useRef(onPlayingChange);
  useEffect(() => { tickRef.current = onTick; playRef.current = onPlayingChange; });

  // Create the player once per video.
  useEffect(() => {
    let cancelled = false;
    const el = document.createElement("div");
    host.current?.appendChild(el);
    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      player.current = new YT.Player(el, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, disablekb: 1, start: Math.floor(start) },
        events: {
          onReady: (e) => {
            if (cancelled) return;
            setReady(true);
            setDur(e.target.getDuration() || 0);
          },
          onStateChange: (e) => {
            const p = e.data === YT_PLAYING;
            setPlaying(p);
            playRef.current?.(p);
            const d = e.target.getDuration() || 0;
            if (d) setDur(d);
            if (e.data === YT_ENDED) tickRef.current?.(d, d);
          },
        },
      });
    }).catch(() => setFailed(true));
    const fail = setTimeout(() => { if (!player.current) setFailed(true); }, 12000);
    return () => {
      cancelled = true;
      clearTimeout(fail);
      try { player.current?.destroy(); } catch { /* already gone */ }
      player.current = null;
      el.remove();
      setReady(false);
    };
    // `start` is only read when the player is created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Clock: a light poll while playing.
  useEffect(() => {
    if (!playing) return;
    let last = -1;
    const id = setInterval(() => {
      const p = player.current;
      if (!p) return;
      const now = p.getCurrentTime();
      setT(now);
      if (Math.floor(now) !== last) { last = Math.floor(now); tickRef.current?.(now, p.getDuration() || 0); }
    }, 250);
    return () => clearInterval(id);
  }, [playing]);

  // Controls fade while playing and the pointer rests.
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wake = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2600);
  }, []);
  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current); }, []);

  const seek = useCallback((to: number, play?: boolean) => {
    const p = player.current;
    if (!p) return;
    const d = p.getDuration() || dur;
    const clamped = Math.max(0, d ? Math.min(to, d - 0.5) : to);
    p.seekTo(clamped, true);
    setT(clamped);
    tickRef.current?.(clamped, d);
    if (play) p.playVideo();
  }, [dur]);

  const toggle = useCallback(() => {
    const p = player.current;
    if (!p) return;
    if (p.getPlayerState() === YT_PLAYING) p.pauseVideo(); else p.playVideo();
  }, []);

  useEffect(() => {
    apiRef.current = {
      time: () => player.current?.getCurrentTime() ?? t,
      duration: () => player.current?.getDuration() ?? dur,
      playing: () => player.current?.getPlayerState() === YT_PLAYING,
      seek,
      toggle,
    };
  }, [apiRef, seek, toggle, t, dur]);

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    player.current?.setPlaybackRate(next);
    setRate(next);
  }

  function fullscreen() {
    const el = frame.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }

  // Scrubbing
  const bar = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fracAt = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };
  function onBarDown(e: React.PointerEvent) {
    if (!dur) return;
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const f = fracAt(e.clientX);
    setT(f * dur);
    seek(f * dur);
  }
  function onBarMove(e: React.PointerEvent) {
    if (!dur) return;
    const f = fracAt(e.clientX);
    setHoverX(f);
    if (dragging.current) { setT(f * dur); seek(f * dur); }
  }
  function onBarUp() { dragging.current = false; }

  const frac = dur ? Math.min(1, t / dur) : 0;
  const showControls = !playing || !idle || hoverX !== null;

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden bg-black ${className ?? ""}`}
      style={{ aspectRatio: "16 / 9", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1), 0 24px 60px -18px rgba(0,0,0,.75)" }}
      onPointerMove={wake}
      onPointerLeave={() => setIdle(true)}
    >
      {/* Poster while the player loads */}
      {!ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={youTubeThumbnail(videoId).replace("mqdefault", "hqdefault")} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div ref={host} className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full" />

      {/* Click anywhere on the picture to play / pause */}
      {ready && <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={toggle} className="absolute inset-0 w-full h-full cursor-default" style={{ background: "transparent" }} />}

      {/* Big play when paused at the start */}
      {ready && !playing && t < 1 && (
        <button type="button" onClick={toggle} aria-label="Play"
          className="sermon-bigplay absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(16,16,20,.88)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1px rgba(255,255,255,.12), 0 12px 30px -8px rgba(0,0,0,.7)" }}>
          <Play size={26} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
        </button>
      )}

      {failed && !ready && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center" style={{ background: "rgba(0,0,0,.55)" }}>
          <p className="font-sans text-[13px]" style={{ color: "#fff" }}>The video couldn’t load. Check your connection, or open it on YouTube.</p>
        </div>
      )}

      {/* Control bar */}
      <div
        className="absolute left-3 right-3 bottom-3 rounded-[14px] px-3 py-2 flex items-center gap-3 sermon-controls"
        data-hidden={!showControls || undefined}
        style={{
          background: "linear-gradient(180deg, rgba(30,32,38,.62), rgba(18,19,24,.7))",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          backdropFilter: "blur(18px) saturate(160%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), 0 10px 30px -10px rgba(0,0,0,.7)",
          border: "1px solid rgba(255,255,255,.1)",
        }}
      >
        <button type="button" onClick={toggle} disabled={!ready} aria-label={playing ? "Pause" : "Play"}
          className="sermon-ctl w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
          {playing ? <Pause size={16} fill="#fff" color="#fff" /> : <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />}
        </button>
        <button type="button" onClick={() => seek(t - 10)} disabled={!ready} aria-label="Back 10 seconds" title="Back 10s"
          className="sermon-ctl w-8 h-8 rounded-lg hidden sm:flex items-center justify-center shrink-0">
          <RotateCcw size={14} color="#fff" />
        </button>
        <span className="font-sans text-[12px] font-semibold tabular-nums shrink-0" style={{ color: "#fff" }}>{clock(t)}</span>

        <div
          ref={bar}
          className="relative flex-1 h-6 flex items-center cursor-pointer touch-none"
          onPointerDown={onBarDown} onPointerMove={onBarMove} onPointerUp={onBarUp}
          onPointerLeave={() => { setHoverX(null); }}
          role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(t)}
          tabIndex={-1}
        >
          <div className="relative w-full h-[5px] rounded-full" style={{ background: "rgba(255,255,255,.2)" }}>
            <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${frac * 100}%`, background: "color-mix(in oklch, var(--bj-gold), white 25%)" }} />
            <div className="absolute top-1/2 w-3 h-3 rounded-full -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${frac * 100}%`, background: "#fff", boxShadow: "0 0 0 3px color-mix(in oklch, var(--bj-gold) 45%, transparent)" }} />
          </div>
          {dur > 0 && markers.map((m) => (
            <button
              key={m.id} type="button" title={`${clock(m.t)} · ${m.label}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); seek(m.t, true); }}
              className="sermon-mark absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[9px] h-[17px] flex items-center justify-center"
              style={{ left: `${Math.min(100, (m.t / dur) * 100)}%` }}
            >
              <i className="block w-[3px] h-[13px] rounded-full"
                style={{ background: m.kind === "takeaway" ? "color-mix(in oklch, var(--bj-gold), white 30%)" : m.kind === "question" ? "#9CC0EE" : "#fff", boxShadow: "0 0 6px rgba(255,255,255,.7)" }} />
            </button>
          ))}
          {hoverX !== null && dur > 0 && (
            <span className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded-md font-sans text-[11px] font-semibold tabular-nums pointer-events-none"
              style={{ left: `${hoverX * 100}%`, background: "rgba(0,0,0,.75)", color: "#fff" }}>{clock(hoverX * dur)}</span>
          )}
        </div>

        <span className="font-sans text-[12px] tabular-nums shrink-0 hidden sm:inline" style={{ color: "rgba(255,255,255,.7)" }}>{clock(dur)}</span>
        <button type="button" onClick={cycleRate} disabled={!ready} title="Playback speed"
          className="sermon-ctl font-sans text-[11px] font-semibold px-2 h-7 rounded-lg shrink-0 tabular-nums" style={{ color: "#fff", background: "rgba(255,255,255,.12)" }}>
          {rate}×
        </button>
        <button type="button" onClick={fullscreen} aria-label="Full screen" title="Full screen"
          className="sermon-ctl w-8 h-8 rounded-lg hidden sm:flex items-center justify-center shrink-0">
          <Maximize size={14} color="#fff" />
        </button>
      </div>
    </div>
  );
}
