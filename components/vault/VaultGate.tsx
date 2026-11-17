"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useMounted } from "@/hooks/useMounted";
import { useVault, watchVault, unlockVault, rewrapVault, checkSecret } from "@/lib/vault";
import { signOutUser } from "@/services/auth.service";
import { watchLocks } from "@/lib/locks";
import { ensureFolders } from "@/services/folder.service";

/**
 * Follows the vault for the signed-in user, and when the journal is sealed and this device
 * doesn't hold the key, asks for the passphrase (or the recovery code) before anything opens.
 */
export function VaultGate() {
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const status = useVault((s) => s.status);
  const mounted = useMounted();
  useEffect(() => { watchVault(uid); watchLocks(uid); ensureFolders(uid); }, [uid]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>{uid && status === "locked" && <Unlock key="vault" />}</AnimatePresence>,
    document.body,
  );
}

const FIELD = "bj-well w-full h-12 px-4 rounded-[14px] outline-none font-sans text-[15px]";

function Unlock() {
  const [how, setHow] = useState<"pass" | "code" | "renew">("pass");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [next, setNext] = useState({ a: "", b: "" });
  const [keep, setKeep] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, [how]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (how === "renew") {
      if (next.a.length < 10) return setError("Use at least 10 characters.");
      if (next.a !== next.b) return setError("Those two don’t match.");
      setBusy(true);
      const ok = await rewrapVault(code, "code", { passphrase: next.a }) && await unlockVault(next.a, "pass", keep);
      setBusy(false);
      if (!ok) setError("Couldn’t save it. Try again.");
      return; // on success the gate closes by itself
    }
    if (!secret.trim()) return;
    setBusy(true);
    // Recovery code: check it, then choose a new passphrase before going in.
    const ok = how === "pass" ? await unlockVault(secret, "pass", keep) : await checkSecret(secret, "code");
    setBusy(false);
    if (!ok) { setError(how === "pass" ? "That’s not it. Check Caps Lock and try again." : "That code doesn’t match."); return; }
    if (how === "code") { setCode(secret); setSecret(""); setHow("renew"); }
  }

  const title = how === "renew" ? "Choose a new passphrase" : "Your journal is locked";
  const blurb = how === "pass"
    ? "Your journal and prayers are encrypted. Enter your passphrase to open them on this device."
    : how === "code"
      ? "Enter the recovery code you saved when you turned encryption on."
      : "The recovery code worked. Pick a new passphrase so you don’t need the code next time.";

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center p-4">
      <motion.div className="absolute inset-0" style={{ background: "var(--bj-bg)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
      <motion.form onSubmit={submit} role="dialog" aria-modal="true" aria-label={title}
        initial={{ opacity: 0, scale: 0.97, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        className="bj-window relative w-full max-w-[420px] rounded-[26px] px-7 sm:px-8 pt-8 pb-6 flex flex-col items-center text-center">
        {how !== "pass" && (
          <button type="button" onClick={() => { setHow("pass"); setError(null); setSecret(""); }} aria-label="Back to passphrase"
            className="bj-btn-icon absolute top-4 left-4 w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ color: "var(--bj-ink3)" }}>
            <ArrowLeft size={15} />
          </button>
        )}
        <span className="bj-glass w-16 h-16 rounded-[20px] flex items-center justify-center mb-5">
          {how === "pass" ? <Lock size={24} style={{ color: "var(--bj-gold)" }} /> : <KeyRound size={24} style={{ color: "var(--bj-gold)" }} />}
        </span>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.1, color: "var(--bj-ink)", fontWeight: 500 }}>{title}</h2>
        <p className="mt-2 mb-6 font-sans text-[13.5px] leading-relaxed" style={{ color: "var(--bj-ink3)" }}>{blurb}</p>

        {how === "renew" ? (
          <div className="w-full flex flex-col gap-2.5">
            <input ref={inputRef} type="password" autoComplete="new-password" value={next.a} onChange={(e) => setNext({ ...next, a: e.target.value })}
              placeholder="New passphrase" aria-label="New passphrase" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
            <input type="password" autoComplete="new-password" value={next.b} onChange={(e) => setNext({ ...next, b: e.target.value })}
              placeholder="Once more" aria-label="Confirm new passphrase" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
          </div>
        ) : (
          <input ref={inputRef} type={how === "pass" ? "password" : "text"} value={secret} onChange={(e) => setSecret(e.target.value)}
            autoComplete={how === "pass" ? "current-password" : "off"} spellCheck={false} autoCapitalize={how === "code" ? "characters" : "off"}
            placeholder={how === "pass" ? "Passphrase" : "XXXX-XXXX-XXXX-XXXX-…"} aria-label={how === "pass" ? "Passphrase" : "Recovery code"}
            className={`${FIELD} ${how === "code" ? "font-mono tracking-wider text-[14px]" : ""}`} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
        )}

        {error && <p role="alert" className="w-full text-left mt-2.5 font-sans text-[12.5px]" style={{ color: "var(--bj-ember)" }}>{error}</p>}

        {how !== "renew" && (
          <label className="w-full flex items-center gap-2.5 mt-3.5 font-sans text-[12.5px] cursor-pointer select-none text-left" style={{ color: "var(--bj-ink3)" }}>
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="w-4 h-4 shrink-0" style={{ accentColor: "var(--bj-gold)" }} />
            Keep it unlocked on this device
          </label>
        )}

        <button type="submit" disabled={busy} className="bj-gold w-full h-12 mt-5 rounded-[14px] flex items-center justify-center gap-2 font-sans text-[14px] font-semibold disabled:opacity-70">
          {busy && <Loader2 size={15} className="animate-spin" />}
          {busy ? "Unlocking…" : how === "renew" ? "Save and open" : "Unlock"}
        </button>

        <div className="w-full flex items-center justify-between mt-5 font-sans text-[12px]" style={{ color: "var(--bj-ink4)" }}>
          {how === "pass"
            ? <button type="button" onClick={() => { setHow("code"); setError(null); setSecret(""); }} className="hover:underline">Forgot it? Use your recovery code</button>
            : <span />}
          <button type="button" onClick={() => signOutUser()} className="hover:underline">Sign out</button>
        </div>
      </motion.form>
    </div>
  );
}
