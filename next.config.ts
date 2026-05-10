import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── File tracing ────────────────────────────────────────
  // Bible XML files (37 MB) and the search index are read at runtime via
  // readFileSync. Vercel's tracer can't detect dynamic paths, so we tell it
  // to include these files in the relevant API-route bundles explicitly.
  outputFileTracingIncludes: {
    "/api/bible/(.*)":    ["./bibles/**"],
    "/api/research/(.*)": ["./bibles/**", "./data/bible-index.json"],
  },

  // ── External images ─────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },   // Google avatars
      { protocol: "https", hostname: "img.youtube.com" },              // YouTube thumbnails
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
};

export default nextConfig;
