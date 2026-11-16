import { Node, mergeAttributes, type Editor } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { useEffect } from "react";
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
  const { src, upload, w, h, tint } = node.attrs as { src: string | null; upload: string | null; w: number; h: number; tint: string | null };
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

  return (
    <NodeViewWrapper as="figure" className="bj-photo" data-type="photo" data-selected={selected || undefined}>
      <div className="bj-photo-frame" contentEditable={false}
        style={{ aspectRatio: w && h ? `${w} / ${h}` : undefined, background: tint ?? "var(--bj-bg-soft)" }}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" draggable={false} loading="lazy" />
        ) : (
          <span className="bj-photo-msg">{lost ? "This photo didn’t finish uploading" : ""}</span>
        )}
        {up?.status === "uploading" && <span className="bj-photo-status"><Ring p={up.progress} /></span>}
        {up?.status === "error" && (
          <span className="bj-photo-status bj-photo-err">
            Couldn’t upload
          </span>
        )}
        <button type="button" className="bj-photo-remove" aria-label="Remove photo" onMouseDown={(e) => e.preventDefault()} onClick={() => deleteNode()}>
          <X size={14} />
        </button>
      </div>
      <NodeViewContent className="bj-photo-caption" />
    </NodeViewWrapper>
  );
}

function insertFiles(editor: Editor, files: File[], pos?: number) {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid || !files.length) return false;
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
