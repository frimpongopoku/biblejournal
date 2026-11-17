import { Node, mergeAttributes, type Editor } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUploads, startUpload, imageFiles } from "@/lib/photos";
import { useAuthStore } from "@/store/auth.store";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    photoBlock: {
      insertPhotos: (files: File[], pos?: number) => ReturnType;
    };
  }
}

function Ring({ p }: { p: number }) {
  const c = 2 * Math.PI * 13;
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-label={`Uploading ${Math.round(p * 100)}%`} role="img">
      <circle cx="16" cy="16" r="13" fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.2)" strokeWidth="3" />
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--bj-gold)" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0.06, p))} transform="rotate(-90 16 16)"
        style={{ transition: "stroke-dashoffset 0.25s ease" }} />
    </svg>
  );
}

function PhotoView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, path, upload, w, h, tint } = node.attrs as { src: string | null; path: string | null; upload: string | null; w: number; h: number; tint: string | null };
  const up = useUploads((s) => (upload ? s.uploads[upload] : undefined));

  // Upload finished (maybe while this entry was closed) → store the real URL.
  useEffect(() => {
    if (upload && up?.status === "done" && up.result) {
      const r = up.result;
      updateAttributes({ src: r.url, path: r.path, w: r.w, h: r.h, tint: r.tint ?? null, upload: null });
    }
  }, [upload, up?.status, up?.result, updateAttributes]);

  const shown = src ?? up?.localUrl ?? null;
  const lost = !src && upload && !up; // page reloaded mid-upload
  const [open, setOpen] = useState(false);

  // Photos belong in the page's stack, not the writing. Where the page has a stack
  // (the journal), a saved photo found here moves up into it; elsewhere it stays as a thumbnail.
  useEffect(() => {
    if (!src || !path) return;
    const t = setTimeout(() => {
      const detail = { photo: { url: src, path, w: Number(w) || 0, h: Number(h) || 0, ...(tint ? { tint } : {}) }, handled: false };
      window.dispatchEvent(new CustomEvent("bj:photo-out", { detail }));
      if (detail.handled) deleteNode();
    }, 0);
    return () => clearTimeout(t);
  }, [src, path, w, h, tint, deleteNode]);

  return (
    <NodeViewWrapper as="figure" className="bj-photo" data-type="photo" data-selected={selected || undefined}>
      <div className="bj-photo-frame" contentEditable={false}
        role={shown ? "button" : undefined} tabIndex={shown ? 0 : undefined} aria-label={shown ? "Open photo" : undefined}
        onClick={() => { if (shown) setOpen(true); }}
        onKeyDown={(e) => { if (shown && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen(true); } }}
        style={{ aspectRatio: w && h ? `${w} / ${h}` : "4 / 3", background: tint ?? "var(--bj-bg-soft)" }}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" draggable={false} loading="lazy" />
        ) : (
          <span className="bj-photo-msg">{lost ? "Didn’t finish uploading" : ""}</span>
        )}
        {up?.status === "uploading" && <span className="bj-photo-status"><Ring p={up.progress} /></span>}
        {up?.status === "error" && <span className="bj-photo-status bj-photo-err">Couldn’t upload</span>}
        <button type="button" className="bj-photo-remove" aria-label="Remove photo"
          onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); deleteNode(); }}>
          <X size={12} />
        </button>
      </div>
      <NodeViewContent className="bj-photo-caption" />
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && shown && <Lightbox key="lb" src={shown} tint={tint} onClose={() => setOpen(false)} onRemove={() => { setOpen(false); deleteNode(); }} />}
        </AnimatePresence>,
        document.body,
      )}
    </NodeViewWrapper>
  );
}

function Lightbox({ src, tint, onClose, onRemove }: { src: string; tint: string | null; onClose: () => void; onRemove: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  const btn = "bj-raised bj-lift h-[34px] px-3 rounded-[11px] flex items-center gap-1.5 font-sans text-[12.5px] font-medium whitespace-nowrap";
  return (
    <div className="fixed inset-0 z-[96] flex flex-col" role="dialog" aria-modal="true" aria-label="Photo">
      <motion.div className="absolute inset-0" onClick={onClose}
        style={{ background: "color-mix(in oklch, #05070b 88%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
      <motion.div className="relative flex flex-col h-full pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.18 }}>
        <div className="h-16 shrink-0 flex items-center justify-end gap-1.5 px-4 sm:px-6 pointer-events-auto">
          <button type="button" onClick={onRemove} className={btn} style={{ color: "var(--bj-ember)" }}>
            <X size={14} /><span className="hidden sm:inline">Remove</span>
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="bj-raised bj-lift w-[34px] h-[34px] rounded-[11px] flex items-center justify-center" style={{ color: "var(--bj-ink2)" }}>
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center p-4 sm:p-8 pt-0 sm:pt-0">
          <motion.img src={src} alt="" draggable={false} onClick={onClose}
            className="max-w-full max-h-full object-contain rounded-[14px] pointer-events-auto cursor-zoom-out"
            style={{ background: tint ?? undefined, boxShadow: "0 30px 80px -30px rgba(0,0,0,.8)" }}
            initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} />
        </div>
      </motion.div>
    </div>
  );
}

/** New photos go with the page's photo set when the page offers one (the journal);
 *  editors without one (sermons, notepad) keep them in the text as thumbnails. */
function toPhotoSet(files: File[]): boolean {
  const detail = { files, handled: false };
  window.dispatchEvent(new CustomEvent("bj:entry-photo-files", { detail }));
  return detail.handled;
}

function insertFiles(editor: Editor, files: File[], pos?: number) {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid || !files.length) return false;
  if (toPhotoSet(files)) return true;
  const nodes = files.map((f) => ({ type: "photo", attrs: { upload: startUpload(uid, f).id } }));
  const chain = editor.chain().focus();
  if (pos != null) chain.insertContentAt(pos, nodes); else chain.insertContent(nodes);
  return chain.run();
}

export const PhotoBlock = Node.create({
  name: "photo",
  group: "block",
  content: "inline*",
  defining: true,
  draggable: true,

  addAttributes() {
    const attr = (name: string, data: string) => ({
      default: null,
      parseHTML: (el: HTMLElement) => el.getAttribute(data),
      renderHTML: (a: Record<string, unknown>) => (a[name] != null ? { [data]: String(a[name]) } : {}),
    });
    return {
      src: attr("src", "data-src"),
      path: attr("path", "data-path"),
      w: attr("w", "data-w"),
      h: attr("h", "data-h"),
      tint: attr("tint", "data-tint"),
      // Transient: id of an upload still in flight.
      upload: attr("upload", "data-upload"),
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-type='photo']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "photo" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PhotoView);
  },

  addCommands() {
    return {
      insertPhotos: (files, pos) => ({ editor }) => insertFiles(editor, files, pos),
    };
  },

  addKeyboardShortcuts() {
    return {
      // Enter in a caption leaves the photo for a fresh paragraph.
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== "photo") return false;
        return editor.chain().insertContentAt($from.after(), { type: "paragraph" }).focus($from.after() + 1).run();
      },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          // Paste a screenshot or a copied photo — it lands where you are.
          handlePaste: (_view, event) => {
            const files = imageFiles(event.clipboardData?.files);
            if (!files.length) return false;
            event.preventDefault();
            return insertFiles(editor, files);
          },
          handleDrop: (view, event) => {
            const files = imageFiles(event.dataTransfer?.files);
            if (!files.length) return false;
            event.preventDefault();
            const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
            return insertFiles(editor, files, at?.pos);
          },
        },
      }),
    ];
  },
});
