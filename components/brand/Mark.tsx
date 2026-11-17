/** The BibJournal mark: a bookmark with a flame cut into it. Drawn on a 64-unit grid. */
export function Mark({ size = 24, tone = "gold", className = "" }: { size?: number; tone?: "gold" | "night"; className?: string }) {
  const small = size < 22;
  const bg = tone === "gold"
    ? "linear-gradient(180deg,#E9C783,#C9A25E 60%,#B48A47)"
    : "linear-gradient(180deg,#1E242E,#12161D)";
  const ink = tone === "gold" ? "#1A140A" : "#DDB46E";
  const flame = tone === "gold" ? (small ? "#E2BC77" : "#D9B26C") : "#171C24";
  return (
    <span aria-hidden="true" className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: size, height: size, borderRadius: size * 0.24, background: bg,
        boxShadow: size >= 28 ? "inset 0 1px 0 rgba(255,240,210,.5), 0 1px 2px rgba(0,0,0,.35), 0 8px 20px -10px rgba(0,0,0,.6)" : "inset 0 1px 0 rgba(255,240,210,.45)",
      }}>
      <svg width={size * (small ? 0.84 : 0.7)} height={size * (small ? 0.84 : 0.7)} viewBox="0 0 64 64">
        {small ? (
          <>
            <path d="M15 6h34a3 3 0 013 3v50l-20-12-20 12V9a3 3 0 013-3z" fill={ink} />
            <path d="M32 13c0 0-11.5 11.5-11.5 20a11.5 11.5 0 0023 0C43.5 24.5 32 13 32 13z" fill={flame} />
          </>
        ) : (
          <>
            <path d="M17 7h30a3 3 0 013 3v47l-18-11-18 11V10a3 3 0 013-3z" fill={ink} />
            <path d="M32 12c0 0-11 11-11 19.5a11 11 0 0022 0C43 23 32 12 32 12z" fill={flame} />
            <path d="M32 27c0 0-4.2 4.6-4.2 7.6a4.2 4.2 0 008.4 0c0-3-4.2-7.6-4.2-7.6z" fill={ink} opacity=".5" />
          </>
        )}
      </svg>
    </span>
  );
}
