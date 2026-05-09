export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bj-bg)", color: "var(--bj-ink)" }}>
      {children}
    </div>
  );
}
