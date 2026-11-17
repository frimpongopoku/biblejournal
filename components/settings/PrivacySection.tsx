"use client";

import { useState } from "react";
import { ShieldCheck, Copy, Download, Check, Loader2, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useVault, createVault, makeRecoveryCode, lockVault, setRemember, rewrapVault } from "@/lib/vault";
import { sealExisting, type ConvertProgress } from "@/services/vault.service";
import { Row, Group, Switch, Seg } from "./SettingsSections";
import { useLocks, lockNow, changeLockCode, setAwayMinutes } from "@/lib/locks";

const FIELD = "bj-well w-full h-11 px-3.5 rounded-[12px] outline-none font-sans text-[14px]";
const BTN = "bj-raised bj-lift h-8 px-3 rounded-[10px] inline-flex items-center gap-1.5 font-sans text-[12.5px] font-medium shrink-0";
const GOLD = "bj-gold h-9 px-4 rounded-[11px] inline-flex items-center justify-center gap-1.5 font-sans text-[13px] font-semibold disabled:opacity-50";

export function Privacy() {
  const status = useVault((s) => s.status);
  const [setup, setSetup] = useState(false);
  if (setup || status === "off") return setup ? <Setup onDone={() => setSetup(false)} /> : <Off onStart={() => setSetup(true)} />;
  if (status === "unknown") return <p className="py-6 font-sans text-[13px]" style={{ color: "var(--bj-ink4)" }}>Checking…</p>;
  return <On />;
}

function Off({ onStart }: { onStart: () => void }) {
  return (
    <>
      <Group label="Encryption">
        <Row title="End-to-end encryption" hint="Your journal and prayers get sealed on this device before they’re saved. Anyone who gets into the database — us included — sees scrambled text.">
          <button type="button" onClick={onStart} className={GOLD}><ShieldCheck size={14} /> Turn on…</button>
        </Row>
      </Group>
      <Locks />
      <Locks />
      <Readable />
    </>
  );
}

function Locks() {
  const has = useLocks((s) => !!s.doc);
  const open = useLocks((s) => !!s.key);
  const away = useLocks((s) => s.awayMinutes);
  const [form, setForm] = useState(false);
  const [f, setF] = useState({ old: "", a: "", b: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function change(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (f.a.length < 4) return setMsg({ ok: false, text: "Use at least 4 characters." });
    if (f.a !== f.b) return setMsg({ ok: false, text: "The new ones don’t match." });
    setBusy(true);
    const ok = await changeLockCode(f.old, f.a);
    setBusy(false);
    if (!ok) return setMsg({ ok: false, text: "That isn’t your current lock code." });
    setF({ old: "", a: "", b: "" }); setForm(false); setMsg({ ok: true, text: "Lock code changed." });
  }
  return (
    <Group label="Locked pages and folders">
      <Row title="Lock code" hint={has ? (open ? "Entered — locked pages are open right now" : "Locked pages are shut") : "Set the first time you lock a page (⌘L) or a folder"}>
        {has && open
          ? <button type="button" onClick={lockNow} className={BTN} style={{ color: "var(--bj-ink2)" }}><Lock size={13} /> Lock now</button>
          : <span className="font-sans text-[12.5px]" style={{ color: "var(--bj-ink4)" }}>{has ? "Shut" : "Not set"}</span>}
      </Row>
      <Row title="Lock again after" hint="When you’ve been away from BibJournal this long">
        <Seg label="Lock again after" value={away} onChange={setAwayMinutes} items={[{ id: 1, label: "1 min" }, { id: 5, label: "5 min" }, { id: 15, label: "15 min" }, { id: 60, label: "1 hour" }]} />
      </Row>
      {has && (
        <Row title="Change lock code" hint="If you forget it, locked writing can’t be opened — by anyone">
          <button type="button" onClick={() => { setForm((x) => !x); setMsg(null); }} className={BTN} style={{ color: "var(--bj-ink2)" }}>Change</button>
        </Row>
      )}
      {form && (
        <form onSubmit={change} className="py-4 flex flex-col gap-2.5 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
          <input type="password" autoFocus value={f.old} onChange={(e) => setF({ ...f, old: e.target.value })} placeholder="Current lock code" aria-label="Current lock code" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
          <input type="password" value={f.a} onChange={(e) => setF({ ...f, a: e.target.value })} placeholder="New lock code" aria-label="New lock code" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
          <input type="password" value={f.b} onChange={(e) => setF({ ...f, b: e.target.value })} placeholder="New lock code, once more" aria-label="Confirm new lock code" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
          <div className="flex justify-end"><button type="submit" disabled={busy || !f.old} className={GOLD}>{busy && <Loader2 size={14} className="animate-spin" />}Change lock code</button></div>
        </form>
      )}
      {msg && <p role="status" className="pb-3.5 font-sans text-[12.5px]" style={{ color: msg.ok ? "var(--bj-sage)" : "var(--bj-ember)" }}>{msg.text}</p>}
    </Group>
  );
}

function Readable() {
  return (
    <Group label="What stays readable">
      <Row title="Dates, folders, photos and flags" hint="So the app can sort, sync and count. Never what you wrote. Photos are next on the list." ><span /></Row>
      <Row title="AI features" hint="Ask, the Companion and Research send the text they need for that one request, then forget it."><span /></Row>
      <Row title="Shared proclamations" hint="Links you share stay readable, so the people you send them to can open them."><span /></Row>
    </Group>
  );
}

function Step({ n, title, sub, state }: { n: number; title: string; sub: string; state: "done" | "now" | "later" }) {
  return (
    <div className="flex gap-3 items-start" style={{ opacity: state === "later" ? 0.5 : 1 }}>
      <span className={`w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center font-sans text-[12px] font-semibold ${state === "done" ? "bj-gold" : "bj-raised"}`}
        style={{ color: state === "done" ? undefined : "var(--bj-gold)" }}>
        {state === "done" ? <Check size={13} strokeWidth={2.6} /> : n}
      </span>
      <div className="min-w-0">
        <p className="font-sans text-[14px] font-medium mt-[3px]" style={{ color: "var(--bj-ink)" }}>{title}</p>
        <p className="font-sans text-[12px] leading-snug" style={{ color: "var(--bj-ink4)" }}>{sub}</p>
      </div>
    </div>
  );
}

function Setup({ onDone }: { onDone: () => void }) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pass, setPass] = useState({ a: "", b: "" });
  const [code] = useState(makeRecoveryCode);
  const [saved, setSaved] = useState(false);
  const [keep, setKeep] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ConvertProgress | null>(null);
  const [copied, setCopied] = useState(false);

  function next1(e: React.FormEvent) {
    e.preventDefault();
    if (pass.a.length < 10) return setError("Use at least 10 characters — a short sentence works well.");
    if (pass.a !== pass.b) return setError("Those two don’t match.");
    setError(null); setStep(2);
  }
  async function finish() {
    if (!uid || busy) return;
    setBusy(true); setError(null);
    try {
      await createVault(uid, pass.a, code, keep);
      setStep(3);
      await sealExisting(uid, setProgress);
      setStep(4);
    } catch (e) {
      setError(`Something went wrong: ${(e as Error).message}. Your writing is safe — try again from Privacy.`);
    } finally { setBusy(false); }
  }
  function download() {
    const blob = new Blob([`BibJournal recovery code\n\n${code}\n\nKeep this somewhere safe. With your passphrase forgotten, this is the only way back into your journal.\n`], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "bibjournal-recovery-code.txt" });
    document.body.appendChild(a); a.click(); a.remove();
  }

  const st = (n: number) => (step > n ? "done" : step === n ? "now" : "later") as "done" | "now" | "later";
  return (
    <div className="flex flex-col md:flex-row gap-8 pt-4">
      <div className="md:w-[220px] shrink-0 flex flex-col gap-4">
        <Step n={1} title="Choose a passphrase" sub="Opens your journal on a new device" state={st(1)} />
        <Step n={2} title="Save your recovery code" sub="The only way back if you forget it" state={st(2)} />
        <Step n={3} title="Encrypt what’s already here" sub="Journal and prayers — usually under a minute" state={step === 4 ? "done" : st(3)} />
      </div>
      <div className="flex-1 min-w-0">
        {step === 1 && (
          <form onSubmit={next1} className="flex flex-col gap-2.5">
            <p className="font-display text-[24px] leading-tight mb-1" style={{ color: "var(--bj-ink)" }}>Choose a passphrase</p>
            <p className="font-sans text-[13px] leading-relaxed mb-2" style={{ color: "var(--bj-ink3)" }}>A few words you’ll remember, at least 10 characters. You’ll type it when you sign in on a new device. We never see it, and we can’t reset it.</p>
            <input type="password" autoFocus autoComplete="new-password" value={pass.a} onChange={(e) => setPass({ ...pass, a: e.target.value })} placeholder="Passphrase" aria-label="Passphrase" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
            <input type="password" autoComplete="new-password" value={pass.b} onChange={(e) => setPass({ ...pass, b: e.target.value })} placeholder="Once more" aria-label="Confirm passphrase" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
            {error && <p role="alert" className="font-sans text-[12.5px]" style={{ color: "var(--bj-ember)" }}>{error}</p>}
            <div className="flex justify-between items-center mt-3">
              <button type="button" onClick={onDone} className="font-sans text-[12.5px] hover:underline" style={{ color: "var(--bj-ink4)" }}>Not now</button>
              <button type="submit" className={GOLD}>Continue</button>
            </div>
          </form>
        )}
        {step === 2 && (
          <div>
            <p className="font-display text-[24px] leading-tight mb-1" style={{ color: "var(--bj-ink)" }}>Your recovery code</p>
            <p className="font-sans text-[13px] leading-relaxed mb-4" style={{ color: "var(--bj-ink3)" }}>
              Write it down or save the file somewhere safe. If you forget your passphrase, this is the only way back in. Without either, nobody can read your journal — not even you.
            </p>
            <div className="bj-well rounded-[16px] p-4 grid grid-cols-4 gap-x-3 gap-y-2 font-mono text-[15px] tracking-wider" style={{ color: "var(--bj-ink)" }} aria-label="Recovery code">
              {code.split("-").map((g, i) => <span key={i}>{g}</span>)}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" className={BTN} style={{ color: "var(--bj-ink2)" }}
                onClick={() => { void navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }); }}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
              </button>
              <button type="button" className={BTN} style={{ color: "var(--bj-ink2)" }} onClick={download}><Download size={13} /> Download as a file</button>
            </div>
            <label className="flex items-center gap-2.5 mt-5 font-sans text-[13px] cursor-pointer select-none" style={{ color: "var(--bj-ink2)" }}>
              <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="w-4 h-4" style={{ accentColor: "var(--bj-gold)" }} />
              I’ve saved my recovery code somewhere safe
            </label>
            <label className="flex items-center gap-2.5 mt-2 font-sans text-[13px] cursor-pointer select-none" style={{ color: "var(--bj-ink3)" }}>
              <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="w-4 h-4" style={{ accentColor: "var(--bj-gold)" }} />
              Keep it unlocked on this device
            </label>
            {error && <p role="alert" className="mt-3 font-sans text-[12.5px]" style={{ color: "var(--bj-ember)" }}>{error}</p>}
            <div className="flex justify-between items-center mt-5">
              <button type="button" onClick={() => setStep(1)} className="font-sans text-[12.5px] hover:underline" style={{ color: "var(--bj-ink4)" }}>Back</button>
              <button type="button" disabled={!saved || busy} onClick={finish} className={GOLD}>
                {busy && <Loader2 size={14} className="animate-spin" />} Turn on encryption
              </button>
            </div>
          </div>
        )}
        {step >= 3 && (
          <div>
            <p className="font-display text-[24px] leading-tight mb-2" style={{ color: "var(--bj-ink)" }}>{step === 3 ? "Encrypting what’s here…" : "Your journal is sealed"}</p>
            <p className="font-sans text-[13px] leading-relaxed" style={{ color: "var(--bj-ink3)" }}>
              {step === 3
                ? progress ? `${progress.done.toLocaleString()} of ${progress.total.toLocaleString()} pages and prayers` : "Gathering your pages…"
                : `Everything in your journal and prayer list is encrypted${progress?.total ? ` — ${progress.total.toLocaleString()} converted` : ""}. What you write from now on is sealed before it leaves this device.`}
            </p>
            <div className="bj-well h-2 rounded-full mt-4 overflow-hidden">
              <div className="h-full rounded-full" style={{ background: "var(--bj-gold)", width: `${step === 4 ? 100 : progress?.total ? (progress.done / progress.total) * 100 : 6}%`, transition: "width 0.3s var(--ease-out)" }} />
            </div>
            {step === 4 && <div className="flex justify-end mt-6"><button type="button" onClick={onDone} className={GOLD}>Done</button></div>}
          </div>
        )}
      </div>
    </div>
  );
}

function On() {
  const uid = useAuthStore((s) => s.user?.uid);
  const remembered = useVault((s) => s.remembered);
  const [form, setForm] = useState<null | "pass" | "code">(null);
  const [f, setF] = useState({ old: "", a: "", b: "" });
  const [newCode, setNewCode] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [sealing, setSealing] = useState<string | null>(null);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMsg(null);
    if (form === "pass") {
      if (f.a.length < 10) return setMsg({ ok: false, text: "Use at least 10 characters." });
      if (f.a !== f.b) return setMsg({ ok: false, text: "The new ones don’t match." });
    }
    setBusy(true);
    const code = form === "code" ? makeRecoveryCode() : undefined;
    const ok = await rewrapVault(f.old, "pass", form === "pass" ? { passphrase: f.a } : { recoveryCode: code });
    setBusy(false);
    if (!ok) return setMsg({ ok: false, text: "That isn’t your current passphrase." });
    setF({ old: "", a: "", b: "" });
    if (code) { setNewCode(code); setMsg({ ok: true, text: "New code made. The old one no longer works." }); }
    else { setForm(null); setMsg({ ok: true, text: "Passphrase changed." }); }
  }

  async function recheck() {
    if (!uid) return;
    setSealing("Checking…");
    const p = await sealExisting(uid, (x) => setSealing(x.total ? `Sealing ${x.done} of ${x.total}…` : "Checking…"));
    setSealing(p.total ? `Sealed ${p.total} more.` : "Everything’s already sealed.");
  }

  return (
    <>
      <Group label="Encryption">
        <Row title="End-to-end encryption" hint="On. Journal entries and prayers are sealed on this device before they’re saved.">
          <span className="h-[26px] px-2.5 rounded-full inline-flex items-center gap-1.5 font-sans text-[11.5px] font-semibold"
            style={{ color: "var(--bj-sage)", background: "color-mix(in oklch, var(--bj-sage) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--bj-sage) 30%, transparent)" }}>
            <ShieldCheck size={12} /> Protected
          </span>
        </Row>
        <Row title="Keep unlocked on this device" hint={remembered ? "You won’t be asked for the passphrase here" : "You’ll be asked each time you open BibJournal"}>
          <Switch label="Keep unlocked on this device" on={remembered} onChange={(v) => void setRemember(v)} />
        </Row>
        <Row title="Lock now" hint="Forget the key on this device until you enter your passphrase again">
          <button type="button" onClick={() => void lockVault()} className={BTN} style={{ color: "var(--bj-ink2)" }}><Lock size={13} /> Lock</button>
        </Row>
        <Row title="Check older writing" hint={sealing ?? "Seal anything still unencrypted — say, written on a device that was offline"}>
          <button type="button" onClick={recheck} className={BTN} style={{ color: "var(--bj-ink2)" }}>Check</button>
        </Row>
      </Group>

      <Group label="Passphrase and recovery">
        <Row title="Change passphrase" hint="Your writing isn’t re-encrypted — only the key’s lock changes">
          <button type="button" onClick={() => { setForm(form === "pass" ? null : "pass"); setMsg(null); setNewCode(null); }} className={BTN} style={{ color: "var(--bj-ink2)" }}>Change</button>
        </Row>
        <Row title="New recovery code" hint="If you think yours has been seen. The old one stops working.">
          <button type="button" onClick={() => { setForm(form === "code" ? null : "code"); setMsg(null); setNewCode(null); }} className={BTN} style={{ color: "var(--bj-ink2)" }}>Make a new one</button>
        </Row>
        {form && (
          <form onSubmit={change} className="py-4 flex flex-col gap-2.5 border-t" style={{ borderColor: "var(--bj-line-soft)" }}>
            {newCode ? (
              <>
                <div className="bj-well rounded-[14px] p-3.5 grid grid-cols-4 gap-x-3 gap-y-1.5 font-mono text-[14px] tracking-wider" style={{ color: "var(--bj-ink)" }}>
                  {newCode.split("-").map((g, i) => <span key={i}>{g}</span>)}
                </div>
                <div className="flex gap-2">
                  <button type="button" className={BTN} style={{ color: "var(--bj-ink2)" }} onClick={() => void navigator.clipboard.writeText(newCode)}><Copy size={13} /> Copy</button>
                  <button type="button" className={BTN} style={{ color: "var(--bj-ink2)" }} onClick={() => { setForm(null); setNewCode(null); }}>I’ve saved it</button>
                </div>
              </>
            ) : (
              <>
                <input type="password" autoFocus autoComplete="current-password" value={f.old} onChange={(e) => setF({ ...f, old: e.target.value })} placeholder="Current passphrase" aria-label="Current passphrase" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
                {form === "pass" && <>
                  <input type="password" autoComplete="new-password" value={f.a} onChange={(e) => setF({ ...f, a: e.target.value })} placeholder="New passphrase" aria-label="New passphrase" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
                  <input type="password" autoComplete="new-password" value={f.b} onChange={(e) => setF({ ...f, b: e.target.value })} placeholder="New passphrase, once more" aria-label="Confirm new passphrase" className={FIELD} style={{ color: "var(--bj-ink)" }} data-no-key-sounds />
                </>}
                <div className="flex justify-end"><button type="submit" disabled={busy || !f.old} className={GOLD}>{busy && <Loader2 size={14} className="animate-spin" />}{form === "pass" ? "Change passphrase" : "Make new code"}</button></div>
              </>
            )}
          </form>
        )}
        {msg && <p role="status" className="pb-3.5 font-sans text-[12.5px]" style={{ color: msg.ok ? "var(--bj-sage)" : "var(--bj-ember)" }}>{msg.text}</p>}
      </Group>
      <Readable />
    </>
  );
}
