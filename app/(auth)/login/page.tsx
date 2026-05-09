"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "placeholder";

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    if (!isConfigured) {
      // Demo mode — skip Firebase, go straight in
      router.push("/dashboard");
      return;
    }
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch {
      setError("Could not sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      style={{ background: "var(--bj-bg)" }}
    >
      {/* ── Left: Cinematic Scripture Panel ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col justify-between md:w-1/2 px-10 py-12 md:px-16 md:py-16 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 80%, color-mix(in oklch, var(--bj-gold-soft) 35%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, color-mix(in oklch, var(--bj-gold-tint) 60%, transparent) 0%, transparent 55%),
            var(--bj-bg-soft)
          `,
          minHeight: "38vh",
        }}
      >
        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        {/* Decorative arc */}
        <svg
          className="pointer-events-none absolute -bottom-20 -left-20 opacity-10 md:opacity-15"
          width="480"
          height="480"
          viewBox="0 0 480 480"
          fill="none"
        >
          <circle
            cx="240"
            cy="240"
            r="230"
            stroke="var(--bj-gold)"
            strokeWidth="1.2"
          />
          <circle
            cx="240"
            cy="240"
            r="180"
            stroke="var(--bj-gold)"
            strokeWidth="0.6"
          />
        </svg>
        <svg
          className="pointer-events-none absolute -top-16 -right-16 opacity-10"
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
        >
          <circle
            cx="160"
            cy="160"
            r="150"
            stroke="var(--bj-gold)"
            strokeWidth="0.8"
          />
        </svg>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
          className="relative z-10 flex items-center gap-3"
        >
          {/* Flame / lamp icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--bj-gold)", boxShadow: "0 2px 16px color-mix(in oklch, var(--bj-gold) 40%, transparent)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z"
                fill="white"
                fillOpacity="0.95"
              />
              <path
                d="M12 10c0 0-2 2.5-2 4a2 2 0 004 0c0-1.5-2-4-2-4z"
                fill="white"
                fillOpacity="0.55"
              />
            </svg>
          </div>
          <span
            className="font-display text-xl tracking-wide"
            style={{ color: "var(--bj-ink)", letterSpacing: "0.04em" }}
          >
            BibJournal
          </span>
        </motion.div>

        {/* Scripture Quote */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 py-8 md:py-0 md:my-auto"
        >
          {/* Ornamental rule */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8" style={{ background: "var(--bj-gold)" }} />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--bj-gold)" }}
            />
            <div className="h-px w-8" style={{ background: "var(--bj-gold)" }} />
          </div>

          <blockquote>
            <p
              className="font-display leading-tight"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
                color: "var(--bj-ink)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              "Your word is a lamp to my feet and a light to my path."
            </p>
            <cite
              className="block mt-6 font-sans text-sm not-italic tracking-widest uppercase"
              style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.14em" }}
            >
              Psalm 119 : 105
            </cite>
          </blockquote>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="relative z-10 font-sans text-sm"
          style={{ color: "var(--bj-ink3)", letterSpacing: "0.01em" }}
        >
          Your sacred space for scripture &amp; reflection
        </motion.p>
      </motion.div>

      {/* ── Right: Sign-in Panel ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 items-center justify-center px-8 py-12 md:py-0"
        style={{ background: "var(--bj-bg-panel)" }}
      >
        <div className="w-full max-w-sm">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            <h1
              className="font-display mb-2"
              style={{
                fontSize: "2rem",
                color: "var(--bj-ink)",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              Welcome back
            </h1>
            <p
              className="font-sans text-sm mb-10"
              style={{ color: "var(--bj-ink3)", lineHeight: 1.6 }}
            >
              Sign in to continue your spiritual journey.
            </p>
          </motion.div>

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            className="h-px w-full origin-left mb-10"
            style={{ background: "var(--bj-line-soft)" }}
          />

          {/* Google Sign-in Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3.5 rounded-2xl font-sans text-sm font-medium transition-all duration-200"
              style={{
                padding: "0.875rem 1.5rem",
                background: "var(--bj-bg)",
                color: "var(--bj-ink)",
                border: "1.5px solid var(--bj-line)",
                boxShadow: "0 1px 4px color-mix(in oklch, var(--bj-ink) 6%, transparent)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bj-gold)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 20px color-mix(in oklch, var(--bj-gold) 20%, transparent)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bj-line)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 1px 4px color-mix(in oklch, var(--bj-ink) 6%, transparent)";
              }}
            >
              {loading ? (
                <Spinner />
              ) : (
                <GoogleLogo />
              )}
              <span>
                {loading ? "Signing in…" : "Continue with Google"}
              </span>
            </button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-center font-sans text-xs rounded-xl px-4 py-3"
                style={{
                  color: "var(--bj-ember)",
                  background: "color-mix(in oklch, var(--bj-ember) 10%, var(--bj-bg))",
                  border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Legal note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 text-center font-sans text-xs leading-relaxed"
            style={{ color: "var(--bj-ink4)" }}
          >
            By continuing, you agree to our Terms of Service
            <br />
            and Privacy Policy.
          </motion.p>

          {/* Bottom ornament */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex items-center justify-center gap-2 mt-12"
          >
            <div className="h-px w-6" style={{ background: "var(--bj-line-soft)" }} />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: "var(--bj-gold-soft)" }}
            />
            <div className="h-px w-6" style={{ background: "var(--bj-line-soft)" }} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="9"
        r="7"
        stroke="var(--bj-line)"
        strokeWidth="2"
      />
      <path
        d="M9 2a7 7 0 017 7"
        stroke="var(--bj-gold)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
