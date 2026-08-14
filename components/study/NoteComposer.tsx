"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List } from "lucide-react";

interface Props {
  content: string;
  onChange: (json: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function parseContent(raw: string): object | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function ToolbarButton({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="bj-btn-icon w-6 h-6 rounded flex items-center justify-center"
      style={{
        background: active ? "var(--bj-gold-tint)" : "transparent",
        color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
      }}
    >
      {children}
    </button>
  );
}

/** Compact TipTap instance for the Study annotation panel — StarterKit + Placeholder
 *  only, no scripture/callout/slash-command extensions, tight panel-width padding. */
export function NoteComposer({ content, onChange, placeholder, autoFocus }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Write…" }),
    ],
    content: parseContent(content),
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: { class: "bj-study-composer outline-none" },
    },
  });

  if (!editor) return null;

  if (autoFocus) {
    // Focus once the editor mounts
    requestAnimationFrame(() => editor.commands.focus("end"));
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--bj-line-soft)" }}>
      <div className="flex items-center gap-0.5 px-2 py-1 border-b" style={{ borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-soft)" }}>
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold size={11} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic size={11} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List size={11} />
        </ToolbarButton>
      </div>
      <div className="px-3 py-2.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
