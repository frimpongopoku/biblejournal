"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Folder, Globe, Lock, Megaphone } from "lucide-react";
import { useProclamationFolders } from "@/hooks/useProclamationFolders";
import { createProclamationFolder } from "@/services/proclamation.service";
import { useAuthStore } from "@/store/auth.store";
import { NewFolderSheet } from "@/components/proclamations/NewFolderSheet";

function formatDate(d: Date) {
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProclamationsPage() {
  const user = useAuthStore((s) => s.user);
  const { folders, loading } = useProclamationFolders();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  async function handleCreate(name: string, description: string) {
    if (!user) return;
    const id = await createProclamationFolder(user.uid, name, description);
    router.push(`/proclamations/${id}`);
  }

  return (
    <>
      <div className="min-h-full px-5 md:px-12 py-8 md:py-10" style={{ background: "var(--bj-bg)", maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-display" style={{ fontSize: "clamp(1.7rem, 5vw, 2.2rem)", color: "var(--bj-ink)", fontWeight: 400 }}>
              Proclamations
            </h1>
            <p className="font-sans text-sm mt-1" style={{ color: "var(--bj-ink3)" }}>
              {folders.length > 0
                ? `${folders.length} folder${folders.length !== 1 ? "s" : ""} · ${folders.filter(f => f.isPublic).length} public`
                : "Bold declarations of faith"}
            </p>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            className="bj-btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0"
            style={{ background: "var(--bj-gold)", color: "white", boxShadow: "0 2px 12px color-mix(in oklch, var(--bj-gold) 35%, transparent)" }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Folder</span>
            <span className="sm:hidden">New</span>
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "var(--bj-bg-soft)" }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && folders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}>
              <Megaphone size={28} style={{ color: "var(--bj-gold)" }} />
            </div>
            <div>
              <p className="font-display italic text-xl mb-2" style={{ color: "var(--bj-ink)", fontWeight: 400 }}>
                Declare what God says about you
              </p>
              <p className="font-sans text-sm" style={{ color: "var(--bj-ink4)", maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
                Create folders for your proclamations and share them with others.
              </p>
            </div>
            <button
              onClick={() => setSheetOpen(true)}
              className="bj-btn-primary font-sans text-sm px-5 py-2.5 rounded-xl flex items-center gap-2"
              style={{ background: "var(--bj-gold)", color: "white" }}
            >
              <Plus size={14} /> Create your first folder
            </button>
          </motion.div>
        )}

        {/* Folder grid */}
        {!loading && folders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {folders.map((folder, i) => (
                <motion.div
                  key={folder.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  onClick={() => router.push(`/proclamations/${folder.id}`)}
                  className="bj-list-row rounded-2xl p-5 flex flex-col gap-3 cursor-pointer min-h-[140px]"
                  style={{
                    background: "var(--bj-bg-panel)",
                    border: "1px solid var(--bj-line-soft)",
                    boxShadow: "0 1px 4px color-mix(in oklch, var(--bj-ink) 4%, transparent)",
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--bj-gold-tint)" }}>
                      <Folder size={16} style={{ color: "var(--bj-gold)" }} />
                    </div>
                    <span
                      className="flex items-center gap-1 font-sans text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: folder.isPublic ? "color-mix(in oklch, var(--bj-sage) 14%, transparent)" : "var(--bj-bg-soft)",
                        color: folder.isPublic ? "var(--bj-sage)" : "var(--bj-ink4)",
                        border: `1px solid ${folder.isPublic ? "color-mix(in oklch, var(--bj-sage) 30%, transparent)" : "var(--bj-line-soft)"}`,
                      }}
                    >
                      {folder.isPublic ? <Globe size={9} /> : <Lock size={9} />}
                      {folder.isPublic ? "Public" : "Private"}
                    </span>
                  </div>

                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-base font-semibold mb-1 leading-snug" style={{ color: "var(--bj-ink)" }}>
                      {folder.name}
                    </p>
                    {folder.description && (
                      <p className="font-sans text-xs leading-relaxed" style={{
                        color: "var(--bj-ink3)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {folder.description}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                      {folder.entryCount} {folder.entryCount === 1 ? "declaration" : "declarations"}
                    </span>
                    <span className="font-sans text-xs" style={{ color: "var(--bj-ink4)" }}>
                      {formatDate(folder.updatedAt)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <NewFolderSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleCreate}
      />
    </>
  );
}
