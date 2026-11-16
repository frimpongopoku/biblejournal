"use client";

const AVATAR_COLORS = ["#D9AE62", "#A897D6", "#78A0D6", "#8DB59A", "#E0A07A", "#C98BA8"];
export function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
export function initial(name: string) {
  const seg = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? [...new Intl.Segmenter().segment(name.replace(/^(pastor|ps\.?|rev\.?|dr\.?|bishop|apostle|prophet)\s+/i, "").trim())][0]?.segment
    : name.trim()[0];
  return (seg ?? "").toUpperCase() || "·";
}
export function Avatar({ name, size = 22 }: { name: string; size?: number }) {
  if (!name.trim()) return null;
  return (
    <span className="rounded-full inline-flex items-center justify-center font-sans font-semibold shrink-0"
      style={{ width: size, height: size, background: avatarColor(name), color: "#1a140a", fontSize: Math.round(size * 0.44) }}>
      {initial(name)}
    </span>
  );
}

