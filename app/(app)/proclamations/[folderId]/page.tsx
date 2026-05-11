"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe, Lock, Link2, Check, Plus, Trash2 } from "lucide-react";
import { FontSizePopover } from "@/components/shared/FontSizePopover";
import { useProclamationFolders } from "@/hooks/useProclamationFolders";
import { useProclamationEntries } from "@/hooks/useProclamationEntries";
import {
  createProclamationEntry, toggleFolderPublic,
  updateProclamationFolder, deleteProclamationFolder,
} from "@/services/proclamation.service";
import { useAuthStore } from "@/store/auth.store";
import { NewFolderSheet } from "@/components/proclamations/NewFolderSheet";
import type { FontPairId } from "@/lib/fonts";
import type { ProclamationEntry } from "@/types";

const PROC_FONT_KEY = "bj-font-editor-proclamation";
const PROC_SIZE_KEY = "bj-proc-size";

function getProcFont(): FontPairId {
  if (typeof window === "undefined") return "classic";
  return (localStorage.getItem(PROC_FONT_KEY) as FontPairId) ?? "classic";
}
function getProcSize(): number {
  if (typeof window === "undefined") return 17;
  return Number(localStorage.getItem(PROC_SIZE_KEY)) || 17;
}

function extractBodyPreview(body: string): string {
  if (!body) return "";
  try {
    const doc = JSON.parse(body);
    const parts: string[] = [];
    const walk = (node: { text?: string; content?: typeof node[] }) => {
      if (node.text) parts.push(node.text);
      if (node.content) node.content.forEach(walk);
    };
    walk(doc);
    return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 90);
  } catch {
    return body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90);
  }
}

function EntryCard({ entry, index, onOpen }: {
  entry: ProclamationEntry; index: number; onOpen: () => void;
}) {
  const bodyPreview = extractBodyPreview(entry.body);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onOpen}
      className="bj-list-row rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line-soft)",
        boxShadow: "0 1px 3px color-mix(in oklch, var(--bj-ink) 3%, transparent)",
        transition: "box-shadow 0.15s ease",
      }}
    >
      <div className="px-5 md:px-6 py-4">
        <div className="flex items-start gap-3">
          <span
            className="font-sans font-bold shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: "var(--bj-gold-tint)", color: "var(--bj-gold-deep)", fontSize: 10 }}
          >
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold leading-snug" style={{ fontSize: "clamp(1rem, 3vw, 1.1rem)", color: "var(--bj-ink)" }}>
              {entry.title || <span style={{ color: "var(--bj-ink4)", fontStyle: "italic", fontWeight: 400 }}>Untitled declaration</span>}
            </p>
            {bodyPreview && (
              <p className="font-sans text-sm mt-1 truncate" style={{ color: "var(--bj-ink4)", fontStyle: "italic" }}>
                {bodyPreview}{bodyPreview.length >= 90 ? "…" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FolderDetailPage() {
  const params = useParams();
  const folderId = params.folderId as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { folders } = useProclamationFolders();
  const { entries, loading } = useProclamationEntries(folderId);
  const folder = folders.find((f) => f.id === folderId);

  const [editSheet, setEditSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [creating, setCreating] = useState(false);
  const [procFontId, setProcFontId] = useState<FontPairId>(getProcFont);
  const [procFontSize, setProcFontSize] = useState<number>(getProcSize);

  function handleProcFont(id: FontPairId) { setProcFontId(id); localStorage.setItem(PROC_FONT_KEY, id); }
  function handleProcSize(s: number) { setProcFontSize(s); localStorage.setItem(PROC_SIZE_KEY, String(s)); }

  const shareUrl = folder?.shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${folder.shareToken}`
    : "";

  async function handleTogglePublic() {
    if (!user || !folder || toggling) return;
    setToggling(true);
    await toggleFolderPublic(user.uid, folderId, !folder.isPublic, folder.shareToken);
    setToggling(false);
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleEditFolder(name: string, description: string) {
    if (!user) return;
    await updateProclamationFolder(user.uid, folderId, { name, description: description || null });
  }

  async function handleDeleteFolder() {
    if (!user) return;
    await deleteProclamationFolder(user.uid, folderId);
    router.push("/proclamations");
  }

  async function handleNewEntry() {
    if (!user || creating) return;
    setCreating(true);
    const id = await createProclamationEntry(user.uid, folderId, "", "");
    router.push(`/proclamations/${folderId}/${id}`);
  }

  if (!folder && !loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>Folder not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>

        <div
          className="sticky top-0 z-10 border-b px-4 md:px-8"
          style={{
            background: "color-mix(in oklch, var(--bj-bg-panel) 92%, transparent)",
            backdropFilter: "blur(12px)",
            borderColor: "var(--bj-line-soft)",
          }}
        >
          <div className="flex items-center gap-3 py-3" style={{ maxWidth: 720, margin: "0 auto" }}>
            <button onClick={() => router.push("/proclamations")}
              className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => setEditSheet(true)}
              className="bj-btn-ghost flex-1 text-left px-2 py-1 rounded-xl min-w-0"
            >
              <p className="font-display font-medium truncate"
                style={{ fontSize: "clamp(1rem, 4vw, 1.2rem)", color: "var(--bj-ink)", lineHeight: 1.2 }}>
                {folder?.name ?? "…"}
              </p>
              {folder?.description && (
                <p className="font-sans text-xs truncate mt-0.5" style={{ color: "var(--bj-ink4)" }}>{folder.description}</p>
              )}
            </button>
            <button onClick={handleTogglePublic} disabled={toggling}
              title={folder?.isPublic ? "Make private" : "Make public"}
              className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-50"
              style={{ color: folder?.isPublic ? "var(--bj-sage)" : "var(--bj-ink4)" }}
            >
              {folder?.isPublic ? <Globe size={15} /> : <Lock size={15} />}
            </button>
            <FontSizePopover fontId={procFontId} fontSize={procFontSize} onFont={handleProcFont} onSize={handleProcSize} />
            <button onClick={handleDeleteFolder}
              className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              data-danger style={{ color: "var(--bj-ink4)" }} title="Delete folder"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="px-4 md:px-8 pt-6 pb-24" style={{ maxWidth: 720, margin: "0 auto" }}>

          <AnimatePresence>
            {folder?.isPublic && folder.shareToken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden mb-6"
              >
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "color-mix(in oklch, var(--bj-sage) 10%, var(--bj-bg))",
                    border: "1px solid color-mix(in oklch, var(--bj-sage) 28%, transparent)",
                  }}
                >
                  <Globe size={13} style={{ color: "var(--bj-sage)", flexShrink: 0 }} />
                  <p className="font-sans text-xs flex-1 truncate" style={{ color: "var(--bj-ink2)" }}>{shareUrl}</p>
                  <button onClick={handleCopyLink}
                    className="bj-chip font-sans text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 min-h-[34px]"
                    style={{
                      background: copied ? "var(--bj-sage)" : "var(--bj-bg-soft)",
                      color: copied ? "white" : "var(--bj-ink3)",
                      border: "1px solid var(--bj-line-soft)",
                      transition: "background 0.2s ease, color 0.2s ease",
                    }}
                  >
                    {copied ? <Check size={11} /> : <Link2 size={11} />}
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleNewEntry}
            disabled={creating}
            className="bj-btn-ghost w-full flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 text-left disabled:opacity-60"
            style={{ border: "1.5px dashed var(--bj-line)", color: "var(--bj-ink4)" }}
          >
            <Plus size={16} />
            <span className="font-sans text-sm">{creating ? "Opening…" : "Add a declaration…"}</span>
          </button>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>No declarations yet</p>
              <p className="font-sans text-sm text-center" style={{ color: "var(--bj-ink4)", maxWidth: 260 }}>
                Tap the button above to write your first proclamation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {entries.map((entry, i) => (
                  <EntryCard
                    key={entry.id} entry={entry} index={i}
                    onOpen={() => router.push(`/proclamations/${folderId}/${entry.id}`)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <NewFolderSheet open={editSheet} folder={folder} onClose={() => setEditSheet(false)} onSave={handleEditFolder} />
    </>
  );
}
