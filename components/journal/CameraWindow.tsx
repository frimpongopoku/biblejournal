"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, ImageUp, SwitchCamera, VideoOff, Timer } from "lucide-react";
import { useCamera, pickPhotos } from "@/lib/photos";
import { useMounted } from "@/hooks/useMounted";

/**
 * The desktop camera: a live, mirrored preview of you and a shutter. Each
 * shot drops into the "Taken" row; take as many as you like, remove any,
 * then add them all. "Choose files" is always one click away, and it's
 * where you land if there's no camera or the browser says no.
 */
export function CameraWindow() {
  const open = useCamera((s) => s.open);
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(<AnimatePresence>{open && <Shell key="cam" />}</AnimatePresence>, document.body);
}

type Phase = "starting" | "live" | "denied" | "none";
interface Shot { id: string; file: File; url: string }

function Shell() {
  const multiple = useCamera((s) => s.multiple);
  const finish = useCamera((s) => s.finish);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotsRef = useRef<Shot[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [shots, setShots] = useState<Shot[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [timer, setTimer] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => { shotsRef.current = shots; }, [shots]);
  // Take focus from whatever opened us, so Space is the shutter straight away.
  useEffect(() => { dialogRef.current?.focus({ preventScroll: true }); }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Start (or switch) the camera.
  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) { queueMicrotask(() => !cancelled && setPhase("none")); return; }
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1600 }, height: { ideal: 1200 } }
        : { facingMode: "user", width: { ideal: 1600 }, height: { ideal: 1200 } },
    }).then(async (stream) => {
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      stop();
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) { v.srcObject = stream; await v.play().catch(() => {}); }
      setPhase("live");
      const all = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      if (!cancelled) setDevices(all.filter((d) => d.kind === "videoinput"));
    }).catch((err: { name?: string }) => {
      if (cancelled) return;
      setPhase(err?.name === "NotAllowedError" || err?.name === "SecurityError" ? "denied" : "none");
    });
    return () => { cancelled = true; };
  }, [deviceId, attempt, stop]);

  // Let go of the camera and the previews when the window closes.
  useEffect(() => () => { stop(); shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url)); }, [stop]);

  const done = useCallback((files: File[]) => { stop(); finish(files); }, [stop, finish]);

  const chooseFile = useCallback(async () => {
    const files = await pickPhotos({ multiple });
    if (files.length) done([...shotsRef.current.map((s) => s.file), ...files]);
  }, [multiple, done]);

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    // Save it the way you saw it — mirrored, like a mirror (and Photo Booth).
    ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    setFlash((n) => n + 1);
    c.toBlob((blob) => {
      if (!blob) return;
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const file = new File([blob], `selfie-${stamp}.jpg`, { type: "image/jpeg" });
      const shot = { id: crypto.randomUUID(), file, url: URL.createObjectURL(blob) };
      setShots((s) => (multiple ? [...s, shot] : [shot]));
    }, "image/jpeg", 0.92);
  }, [multiple]);

  // Countdown, then capture.
  useEffect(() => {
    if (!count) return;
    const t = setTimeout(() => { if (count === 1) capture(); setCount(count - 1); }, 1000);
    return () => clearTimeout(t);
  }, [count, capture]);

  const take = useCallback(() => {
    if (phase !== "live" || count) return;
    if (timer) setCount(3); else capture();
  }, [phase, count, timer, capture]);

  const removeShot = (id: string) => setShots((s) => {
    const gone = s.find((x) => x.id === id);
    if (gone) URL.revokeObjectURL(gone.url);
    return s.filter((x) => x.id !== id);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); if (count) setCount(0); else done([]); return; }
      const onButton = (e.target as HTMLElement)?.closest?.("button");
      if (onButton && dialogRef.current?.contains(onButton) && (e.key === "Enter" || e.key === " ")) return;
      if (e.key === " ") { e.preventDefault(); take(); }
      else if (e.key === "Enter" && shots.length) { e.preventDefault(); done(shots.map((s) => s.file)); }
      else if (e.key === "Backspace" && shots.length) { e.preventDefault(); removeShot(shots[shots.length - 1].id); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shots, take, done, count]);

  const nextCamera = () => {
    if (devices.length < 2) return;
    const current = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
    const i = devices.findIndex((d) => d.deviceId === current);
    setPhase("starting");
    setDeviceId(devices[(i + 1) % devices.length].deviceId);
  };

  const n = shots.length;

  return (
    <div className="fixed inset-0 z-[97] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bj-scrim" onClick={() => done([])}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
      <motion.div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Take photos"
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="bj-window relative w-full overflow-hidden flex flex-col outline-none" style={{ maxWidth: 680, maxHeight: "calc(100dvh - 32px)", borderRadius: 24 }}>

        <div className="h-[54px] shrink-0 flex items-center gap-2.5 pl-5 pr-3">
          <Camera size={15} style={{ color: "var(--bj-gold)" }} />
          <h2 className="font-display flex-1" style={{ fontSize: 21, fontWeight: 500, color: "var(--bj-ink)" }}>How do you look today?</h2>
          <button type="button" onClick={() => done([])} aria-label="Close camera"
            className="bj-btn-icon w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
            <X size={15} />
          </button>
        </div>

        <div className="relative mx-3.5 rounded-[18px] overflow-hidden shrink min-h-0" style={{ aspectRatio: "4 / 3", background: "#0b0b0c", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}>
          <video ref={videoRef} muted playsInline autoPlay aria-label="Camera preview"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)", opacity: phase === "live" ? 1 : 0, transition: "opacity 0.25s ease" }} />
          {phase === "starting" && (
            <p className="absolute inset-0 flex items-center justify-center font-sans text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>
              Waking the camera… your browser may ask first.
            </p>
          )}
          {(phase === "denied" || phase === "none") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <VideoOff size={26} style={{ color: "rgba(255,255,255,.7)" }} />
              <p className="font-display text-[20px]" style={{ color: "#fff" }}>
                {phase === "denied" ? "The camera’s blocked" : "No camera found"}
              </p>
              <p className="font-sans text-[12.5px] max-w-[340px]" style={{ color: "rgba(255,255,255,.65)" }}>
                {phase === "denied"
                  ? "Allow the camera from the icon in your browser’s address bar, then try again. Or choose photos instead."
                  : "Plug one in and try again, or choose photos from your computer."}
              </p>
              <button type="button" onClick={() => { setPhase("starting"); setAttempt((k) => k + 1); }}
                className="h-8 px-3.5 rounded-[10px] font-sans text-[12.5px] font-medium" style={{ color: "#fff", background: "rgba(255,255,255,.14)" }}>
                Try again
              </button>
            </div>
          )}
          {phase === "live" && (
            <>
              <button type="button" onClick={() => setTimer((t) => !t)} aria-pressed={timer}
                className="absolute left-3 bottom-3 h-7 px-2.5 rounded-full flex items-center gap-1.5 font-sans text-[11.5px] font-medium"
                style={{ color: timer ? "#1A140A" : "#fff", background: timer ? "var(--bj-gold)" : "rgba(0,0,0,.45)", backdropFilter: "blur(8px)" }}>
                <Timer size={12} /> 3s timer{timer ? "" : " · off"}
              </button>
              {devices.length > 1 && (
                <button type="button" onClick={nextCamera} aria-label="Switch camera" title="Switch camera"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)" }}>
                  <SwitchCamera size={14} />
                </button>
              )}
            </>
          )}
          <AnimatePresence>
            {count > 0 && (
              <motion.span key={count} aria-live="assertive" className="absolute inset-0 flex items-center justify-center font-display pointer-events-none"
                style={{ fontSize: 120, color: "#fff", textShadow: "0 4px 30px rgba(0,0,0,.5)" }}
                initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
                {count}
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {flash > 0 && (
              <motion.div key={flash} aria-hidden className="absolute inset-0 bg-white pointer-events-none"
                initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} />
            )}
          </AnimatePresence>
        </div>

        {multiple && (
          <div className="flex items-center gap-2 px-[18px] pt-3.5 min-h-[58px] shrink-0 overflow-x-auto">
            <span className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em] mr-1.5 shrink-0" style={{ color: "var(--bj-ink4)" }}>Taken</span>
            <AnimatePresence initial={false}>
              {shots.map((s) => (
                <motion.span key={s.id} layout className="relative shrink-0"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.url} alt="" className="block w-[58px] h-[44px] rounded-[9px] object-cover" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.14), 0 6px 14px -6px rgba(0,0,0,.7)" }} />
                  <button type="button" onClick={() => removeShot(s.id)} aria-label="Remove this shot"
                    className="bj-raised absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
                    <X size={10} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            <span className="w-[58px] h-[44px] rounded-[9px] shrink-0 flex items-center justify-center font-sans text-[11px]" style={{ border: "1px dashed var(--bj-line)", color: "var(--bj-ink4)" }}>
              {n ? "next" : "none yet"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-3.5 shrink-0">
          <button type="button" onClick={() => void chooseFile()}
            className="bj-raised bj-lift h-10 px-3.5 rounded-[12px] flex items-center gap-2 font-sans text-[13px] font-medium whitespace-nowrap"
            style={{ color: "var(--bj-ink2)" }}>
            <ImageUp size={14} /> <span className="max-[480px]:hidden">{multiple ? "Choose files" : "Choose a file"}</span>
          </button>
          <div className="flex-1 flex justify-center">
            <button type="button" onClick={take} disabled={phase !== "live" || count > 0} aria-label="Take photo" title="Take photo (Space)"
              className="cam-shutter w-14 h-14 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ boxShadow: "inset 0 0 0 3px var(--bj-gold)" }}>
              <span className="block w-11 h-11 rounded-full" style={{ background: "var(--bj-gold)" }} />
            </button>
          </div>
          <button type="button" onClick={() => done(shots.map((s) => s.file))} disabled={!n}
            className="bj-gold h-10 px-4 rounded-[12px] flex items-center gap-2 font-sans text-[13px] font-semibold whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none">
            <Check size={15} /> {n > 1 ? `Add ${n} photos` : "Add photo"} <span className="opacity-60 font-medium">↵</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
