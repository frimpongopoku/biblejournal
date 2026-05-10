"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Globe, Lock, Link2, Check, Plus, X, Pencil, Trash2,
} from "lucide-react";
import { fontPairs, type FontPairId } from "@/lib/fonts";
import { FontSizePopover } from "@/components/shared/FontSizePopover";
import { useProclamationFolders } from "@/hooks/useProclamationFolders";
import { useProclamationEntries } from "@/hooks/useProclamationEntries";
import {
  createProclamationEntry, updateProclamationEntry,
  deleteProclamationEntry, toggleFolderPublic,
  updateProclamationFolder, deleteProclamationFolder,
} from "@/services/proclamation.service";
import { useAuthStore } from "@/store/auth.store";
import { NewFolderSheet } from "@/components/proclamations/NewFolderSheet";
import type { ProclamationEntry } from "@/types";

// ── Proclamation font + size ──────────────────────────────

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

// ── Auto-growing textarea ─────────────────────────────────

interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  minHeight?: number;
}

function AutoTextarea({ value, minHeight = 80, style, ...props }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(minHeight, el.scrollHeight) + "px";
  }, [value, minHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      style={{ resize: "none", overflow: "hidden", minHeight, ...style }}
      {...props}
    />
  );
}

// ── Inline new-entry card ─────────────────────────────────

interface NewCardProps {
  onSave: (title: string, body: string) => Promise<void>;
  onCancel: () => void;
  fontId: FontPairId;
  fontSize: number;
}

function NewEntryCard({ onSave, onCancel, fontId, fontSize }: NewCardProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const activePair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

  useEffect(() => { titleRef.current?.focus(); }, []);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(title.trim(), body.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="rounded-2xl overflow-hidden mb-5"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-gold-soft)",
        boxShadow: "0 0 0 3px color-mix(in oklch, var(--bj-gold) 10%, transparent), 0 4px 24px color-mix(in oklch, var(--bj-ink) 6%, transparent)",
      }}
    >
      <div className="px-5 md:px-7 pt-6 pb-5">

        {/* Title row */}
        <div className="flex items-start gap-3 md:gap-4 mb-5">
          {/* Gold accent bar — full height */}
          <div
            className="shrink-0 rounded-full mt-1"
            style={{ width: 3, background: "var(--bj-gold)", alignSelf: "stretch", minHeight: 28 }}
          />

          <div className="flex-1 min-w-0">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
              placeholder="Declare it — 'I am healed by His stripes'"
              className="w-full bg-transparent outline-none font-sans font-bold leading-snug"
              style={{
                fontSize: "clamp(1.05rem, 3.5vw, 1.25rem)",
                color: "var(--bj-ink)",
                caretColor: "var(--bj-gold)",
              }}
            />
          </div>

          <button
            onClick={onCancel}
            className="bj-btn-icon w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ color: "var(--bj-ink4)" }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="pl-4 md:pl-5">
          <AutoTextarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
            placeholder="Write your reflection, a scripture, a deeper context… (optional)"
            minHeight={100}
            className="w-full bg-transparent outline-none leading-relaxed"
            style={{
              fontFamily: `var(${activePair.displayVar})`,
              fontStyle: fontId === "dyslexic" ? "normal" : "italic",
              fontSize,
              fontWeight: 400,
              lineHeight: 1.95,
              color: "var(--bj-ink2)",
              caretColor: "var(--bj-gold)",
              letterSpacing: "0.01em",
            }}
          />
        </div>

        {/* Actions */}
        <div
          className="flex gap-2.5 mt-5 pt-4 border-t"
          style={{ borderColor: "var(--bj-line-soft)" }}
        >
          <button
            onClick={onCancel}
            className="bj-btn-ghost font-sans text-sm px-4 py-2.5 rounded-xl"
            style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="bj-btn-primary font-sans text-sm px-5 py-2.5 rounded-xl flex-1 disabled:opacity-50"
            style={{ background: "var(--bj-gold)", color: "white" }}
          >
            {saving ? "Saving…" : "Add declaration"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Entry card ────────────────────────────────────────────

interface EntryCardProps {
  entry: ProclamationEntry;
  index: number;
  onUpdate: (title: string, body: string) => Promise<void>;
  onDelete: () => Promise<void>;
  fontId: FontPairId;
  fontSize: number;
}

function EntryCard({ entry, index, onUpdate, onDelete, fontId, fontSize }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  const activePair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditTitle(entry.title);
    setEditBody(entry.body);
    setEditing(true);
    setExpanded(true);
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    setSaving(true);
    await onUpdate(editTitle.trim(), editBody.trim());
    setEditing(false);
    setSaving(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bj-list-row rounded-2xl overflow-hidden"
      style={{
        background: "var(--bj-bg-panel)",
        border: `1px solid ${expanded ? "var(--bj-line)" : "var(--bj-line-soft)"}`,
        boxShadow: expanded
          ? "0 4px 24px color-mix(in oklch, var(--bj-ink) 7%, transparent)"
          : "0 1px 3px color-mix(in oklch, var(--bj-ink) 3%, transparent)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onClick={() => !editing && setExpanded((p) => !p)}
    >
      <div className="px-5 md:px-6 py-4 md:py-5">

        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Number badge */}
          <span
            className="font-sans font-bold shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
            style={{
              background: expanded ? "var(--bj-gold)" : "var(--bj-gold-tint)",
              color: expanded ? "white" : "var(--bj-gold-deep)",
              fontSize: 10,
              transition: "background 0.2s ease, color 0.2s ease",
            }}
          >
            {index + 1}
          </span>

          {/* Title */}
          {editing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent outline-none font-sans font-bold leading-snug"
              style={{
                fontSize: "clamp(1rem, 3vw, 1.15rem)",
                color: "var(--bj-ink)",
                caretColor: "var(--bj-gold)",
              }}
              autoFocus
            />
          ) : (
            <p
              className="font-sans font-semibold flex-1 leading-snug"
              style={{
                fontSize: "clamp(1rem, 3vw, 1.15rem)",
                color: "var(--bj-ink)",
              }}
            >
              {entry.title}
            </p>
          )}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="mt-4 pt-4 ml-9 border-t"
                style={{ borderColor: "var(--bj-line-soft)" }}
              >
                {editing ? (
                  <>
                    <AutoTextarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Reflection, scripture, context…"
                      minHeight={80}
                      className="w-full bg-transparent outline-none leading-relaxed"
                      style={{
                        fontFamily: `var(${activePair.displayVar})`,
                        fontStyle: fontId === "dyslexic" ? "normal" : "italic",
                        fontSize,
                        fontWeight: 400,
                        lineHeight: 1.95,
                        color: "var(--bj-ink2)",
                        caretColor: "var(--bj-gold)",
                        letterSpacing: "0.01em",
                      }}
                    />
                  </>
                ) : (
                  <>
                    {entry.body && (
                      <p
                        className="leading-relaxed mb-4"
                        style={{
                          fontFamily: `var(${activePair.displayVar})`,
                          fontStyle: fontId === "dyslexic" ? "normal" : "italic",
                          fontSize,
                          fontWeight: 400,
                          lineHeight: 1.95,
                          color: "var(--bj-ink2)",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {entry.body}
                      </p>
                    )}
                  </>
                )}

                {/* Actions */}
                <div
                  className="flex gap-2 mt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="bj-btn-ghost font-sans text-xs px-3 py-2.5 rounded-xl min-h-[38px]"
                        style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={saving || !editTitle.trim()}
                        className="bj-btn-primary font-sans text-xs px-4 py-2.5 rounded-xl flex-1 disabled:opacity-50 min-h-[38px]"
                        style={{ background: "var(--bj-gold)", color: "white" }}
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={startEdit}
                        className="bj-chip font-sans text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 min-h-[38px]"
                        style={{ color: "var(--bj-ink3)", border: "1px solid var(--bj-line-soft)" }}
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={async (e) => { e.stopPropagation(); await onDelete(); }}
                        className="bj-chip font-sans text-xs px-3 py-2.5 rounded-xl flex items-center gap-1.5 min-h-[38px]"
                        style={{
                          color: "var(--bj-ember)",
                          border: "1px solid color-mix(in oklch, var(--bj-ember) 25%, transparent)",
                          background: "color-mix(in oklch, var(--bj-ember) 8%, transparent)",
                        }}
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function FolderDetailPage() {
  const params = useParams();
  const folderId = params.folderId as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { folders } = useProclamationFolders();
  const { entries, loading } = useProclamationEntries(folderId);
  const folder = folders.find((f) => f.id === folderId);

  const [newCard, setNewCard] = useState(false);
  const [editSheet, setEditSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [procFontId, setProcFontId] = useState<FontPairId>(getProcFont);
  const [procFontSize, setProcFontSize] = useState<number>(getProcSize);

  function handleProcFont(id: FontPairId) {
    setProcFontId(id);
    localStorage.setItem(PROC_FONT_KEY, id);
  }
  function handleProcSize(s: number) {
    setProcFontSize(s);
    localStorage.setItem(PROC_SIZE_KEY, String(s));
  }

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

  async function handleNewEntry(title: string, body: string) {
    if (!user) return;
    await createProclamationEntry(user.uid, folderId, title, body);
    setNewCard(false);
  }

  async function handleUpdateEntry(entryId: string, title: string, body: string) {
    if (!user) return;
    await updateProclamationEntry(user.uid, folderId, entryId, { title, body });
  }

  async function handleDeleteEntry(entryId: string) {
    if (!user) return;
    await deleteProclamationEntry(user.uid, folderId, entryId);
  }

  if (!folder && !loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
          Folder not found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-full" style={{ background: "var(--bj-bg)" }}>

        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 border-b px-4 md:px-8"
          style={{
            background: "color-mix(in oklch, var(--bj-bg-panel) 92%, transparent)",
            backdropFilter: "blur(12px)",
            borderColor: "var(--bj-line-soft)",
          }}
        >
          <div
            className="flex items-center gap-3 py-3"
            style={{ maxWidth: 720, margin: "0 auto" }}
          >
            <button
              onClick={() => router.push("/proclamations")}
              className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: "var(--bj-ink3)" }}
            >
              <ArrowLeft size={16} />
            </button>

            <button
              onClick={() => setEditSheet(true)}
              className="bj-btn-ghost flex-1 text-left px-2 py-1 rounded-xl min-w-0"
            >
              <p
                className="font-display font-medium truncate"
                style={{ fontSize: "clamp(1rem, 4vw, 1.2rem)", color: "var(--bj-ink)", lineHeight: 1.2 }}
              >
                {folder?.name ?? "…"}
              </p>
              {folder?.description && (
                <p className="font-sans text-xs truncate mt-0.5" style={{ color: "var(--bj-ink4)" }}>
                  {folder.description}
                </p>
              )}
            </button>

            <button
              onClick={handleTogglePublic}
              disabled={toggling}
              title={folder?.isPublic ? "Make private" : "Make public"}
              className="bj-btn-icon w-8 h-8 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-50"
              style={{ color: folder?.isPublic ? "var(--bj-sage)" : "var(--bj-ink4)" }}
            >
              {folder?.isPublic ? <Globe size={15} /> : <Lock size={15} />}
            </button>

            <FontSizePopover
              fontId={procFontId} fontSize={procFontSize}
              onFont={handleProcFont} onSize={handleProcSize}
            />

            <button
              onClick={handleDeleteFolder}
              className="bj-btn-action w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              data-danger
              style={{ color: "var(--bj-ink4)" }}
              title="Delete folder"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div
          className="px-4 md:px-8 pt-6 pb-24"
          style={{ maxWidth: 720, margin: "0 auto" }}
        >
          {/* Share banner */}
          <AnimatePresence>
            {folder?.isPublic && folder.shareToken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-6"
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "color-mix(in oklch, var(--bj-sage) 10%, var(--bj-bg))",
                    border: "1px solid color-mix(in oklch, var(--bj-sage) 28%, transparent)",
                  }}
                >
                  <Globe size={13} style={{ color: "var(--bj-sage)", flexShrink: 0 }} />
                  <p className="font-sans text-xs flex-1 truncate" style={{ color: "var(--bj-ink2)" }}>
                    {shareUrl}
                  </p>
                  <button
                    onClick={handleCopyLink}
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

          {/* New entry */}
          <AnimatePresence mode="popLayout">
            {newCard ? (
              <NewEntryCard
                key="new"
                onSave={handleNewEntry}
                onCancel={() => setNewCard(false)}
                fontId={procFontId}
                fontSize={procFontSize}
              />
            ) : (
              <motion.button
                key="btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setNewCard(true)}
                className="bj-btn-ghost w-full flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 text-left"
                style={{ border: "1.5px dashed var(--bj-line)", color: "var(--bj-ink4)" }}
              >
                <Plus size={16} />
                <span className="font-sans text-sm">Add a declaration…</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Entry list */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl animate-pulse"
                  style={{ background: "var(--bj-bg-soft)" }}
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="font-display italic text-xl" style={{ color: "var(--bj-ink4)", fontWeight: 300 }}>
                No declarations yet
              </p>
              <p className="font-sans text-sm text-center" style={{ color: "var(--bj-ink4)", maxWidth: 260 }}>
                Tap the button above to write your first proclamation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {entries.map((entry, i) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onUpdate={(t, b) => handleUpdateEntry(entry.id, t, b)}
                    onDelete={() => handleDeleteEntry(entry.id)}
                    fontId={procFontId}
                    fontSize={procFontSize}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <NewFolderSheet
        open={editSheet}
        folder={folder}
        onClose={() => setEditSheet(false)}
        onSave={handleEditFolder}
      />
    </>
  );
}
