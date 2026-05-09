import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Proclamations";
  const description = searchParams.get("description") ?? "";
  const count = parseInt(searchParams.get("count") ?? "0", 10);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5F0E8",
          padding: "64px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#C9A96E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 18, color: "#8B7355", fontFamily: "Georgia, serif", letterSpacing: "0.04em" }}>
            BibJournal
          </span>
        </div>

        {/* Center: content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, justifyContent: "center", paddingTop: 32 }}>
          {/* Gold accent line */}
          <div style={{ width: 48, height: 3, background: "#C9A96E", borderRadius: 2 }} />

          {/* Folder name */}
          <div
            style={{
              fontSize: Math.max(40, Math.min(68, 68 - title.length * 0.8)),
              fontWeight: 400,
              color: "#2A2318",
              lineHeight: 1.1,
              fontFamily: "Georgia, serif",
              maxWidth: 900,
            }}
          >
            {title}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: 24,
                color: "#6B5C45",
                lineHeight: 1.5,
                fontFamily: "Arial, sans-serif",
                maxWidth: 820,
                display: "-webkit-box",
                overflow: "hidden",
              }}
            >
              {description.length > 120 ? description.slice(0, 120) + "…" : description}
            </div>
          )}
        </div>

        {/* Bottom: count + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 2, height: 32, background: "#C9A96E", borderRadius: 1 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 16, color: "#8B7355", fontFamily: "Arial, sans-serif" }}>
              {count > 0 ? `${count} declaration${count !== 1 ? "s" : ""}` : "Proclamations"}
            </span>
            <span style={{ fontSize: 14, color: "#B0A090", fontFamily: "Arial, sans-serif" }}>
              Shared on BibJournal
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
