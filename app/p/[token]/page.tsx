import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EntriesClient } from "./EntriesClient";

// ── Firestore REST helpers (no auth — public documents) ───

const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

async function fsGet(path: string): Promise<Record<string, unknown> | null> {
  if (!PROJECT || PROJECT === "placeholder") return null;
  try {
    const res = await fetch(`${BASE}/${path}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fsList(path: string): Promise<Record<string, unknown>[]> {
  if (!PROJECT || PROJECT === "placeholder") return [];
  try {
    const res = await fetch(`${BASE}/${path}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.documents ?? []) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function str(doc: Record<string, unknown>, key: string): string {
  const fields = doc.fields as Record<string, Record<string, unknown>> | undefined;
  return (fields?.[key]?.stringValue as string) ?? "";
}
function bool(doc: Record<string, unknown>, key: string): boolean {
  const fields = doc.fields as Record<string, Record<string, unknown>> | undefined;
  return (fields?.[key]?.booleanValue as boolean) ?? false;
}
function ts(doc: Record<string, unknown>, key: string): string {
  const fields = doc.fields as Record<string, Record<string, unknown>> | undefined;
  return (fields?.[key]?.timestampValue as string) ?? "";
}

// ── Data fetching ─────────────────────────────────────────

async function getPageData(token: string) {
  const lookup = await fsGet(`shareLookup/${token}`);
  if (!lookup) return null;

  const uid = str(lookup, "uid");
  const folderId = str(lookup, "folderId");
  if (!uid || !folderId) return null;

  const folder = await fsGet(`users/${uid}/proclamationFolders/${folderId}`);
  if (!folder || !bool(folder, "isPublic")) return null;

  const entryDocs = await fsList(`users/${uid}/proclamationFolders/${folderId}/entries`);
  const entries = entryDocs
    .map((d) => ({
      id: (d.name as string).split("/").pop() ?? "",
      title: str(d, "title"),
      body: str(d, "body"),
      createdAt: ts(d, "createdAt"),
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    folderName: str(folder, "name"),
    description: str(folder, "description") || null,
    entries,
    uid,
  };
}

// ── OG metadata ───────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ token: string }> }
): Promise<Metadata> {
  const { token } = await params;
  const data = await getPageData(token);

  const title = data ? `${data.folderName} · Proclamations` : "Proclamations · BibJournal";
  const description = data?.description
    ?? (data?.entries[0]?.title ? `"${data.entries[0].title}"` : "Shared proclamations on BibJournal");

  const ogUrl = new URL(
    `/api/og/proclamation?title=${encodeURIComponent(data?.folderName ?? "Proclamations")}&description=${encodeURIComponent(description)}&count=${data?.entries.length ?? 0}`,
    process.env.NEXT_PUBLIC_APP_URL ?? "https://bibjournal.app"
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogUrl.toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
}

// ── Public page ───────────────────────────────────────────

export default async function PublicProclamationPage(
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const data = await getPageData(token);

  if (!data) notFound();

  const { folderName, description, entries } = data;

  return (
    <div className="min-h-screen px-2 sm:px-5 md:px-10 py-8 md:py-16" style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Brand mark */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--bj-gold)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 6 8.5 6 13a6 6 0 0012 0C18 8.5 12 2 12 2z" fill="white" />
          </svg>
        </div>
        <span className="font-display text-sm" style={{ color: "var(--bj-ink3)", letterSpacing: "0.04em" }}>BibJournal</span>
      </div>

      {/* Folder header */}
      <div className="mb-10">
        <h1
          className="font-display mb-3 leading-tight"
          style={{ fontSize: "clamp(2rem, 6vw, 3rem)", color: "var(--bj-ink)", fontWeight: 400 }}
        >
          {folderName}
        </h1>
        {description && (
          <p className="font-sans text-base leading-relaxed mb-4" style={{ color: "var(--bj-ink3)", lineHeight: 1.7 }}>
            {description}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}>
            {entries.length} {entries.length === 1 ? "declaration" : "declarations"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--bj-gold)" }} />
        <div className="h-px flex-1" style={{ background: "var(--bj-line-soft)" }} />
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <p className="font-display italic text-lg text-center" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
          No declarations yet.
        </p>
      ) : (
        <EntriesClient entries={entries} />
      )}

      {/* Footer */}
      <div className="mt-16 pt-8 border-t flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: "var(--bj-line-soft)" }}>
        <p className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
          Shared via BibJournal
        </p>
        <a
          href="/"
          className="font-sans text-xs px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", border: "1px solid var(--bj-gold-soft)" }}
        >
          Create your own →
        </a>
      </div>
    </div>
  );
}
