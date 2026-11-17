"use client";

// DEV ONLY — the break-ui switch. Renders nothing outside development.
import { devDataMode, type DevData } from "@/lib/dev/prayerFixtures";

const MODES: { id: DevData; label: string }[] = [
  { id: "demo", label: "Demo data" }, { id: "worst", label: "Worst case" }, { id: "empty", label: "Empty" }, { id: "one", label: "One" }, { id: "huge", label: "1,000 rows" },
];

export function DataToggle() {
  if (process.env.NODE_ENV !== "development") return null;
  const mode = devDataMode();
  const go = (m: DevData) => {
    const u = new URL(window.location.href);
    if (m === "demo") u.searchParams.delete("data"); else u.searchParams.set("data", m);
    window.location.assign(u.toString());
  };
  return (
    <div style={{ position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", zIndex: 2147483000, display: "flex", gap: 2, padding: 3, borderRadius: 10, background: "#e5e5e5", font: "12px system-ui, sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,.25)" }}>
      {MODES.map((m) => (
        <button key={m.id} type="button" onClick={() => go(m.id)} data-no-key-sounds
          style={{ padding: "5px 10px", borderRadius: 7, border: 0, cursor: "pointer", background: mode === m.id ? "#fff" : "transparent", color: "#111", fontWeight: mode === m.id ? 600 : 400, whiteSpace: "nowrap" }}>
          {m.label}
        </button>
      ))}
    </div>
  );
}
