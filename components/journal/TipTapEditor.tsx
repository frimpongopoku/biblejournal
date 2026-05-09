"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { ScriptureBlock } from "@/extensions/ScriptureBlock";
import { CalloutBlock } from "@/extensions/CalloutBlock";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  BookOpen,
  MessageSquareQuote,
} from "lucide-react";

interface Props {
  entryId: string;
  content: string;
  onChange: (json: string) => void;
}

interface ToolbarButtonProps {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ active, onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      data-active={active || undefined}
      className="bj-btn-icon w-7 h-7 rounded flex items-center justify-center"
      style={{
        background: active ? "var(--bj-gold-tint)" : "transparent",
        color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
      }}
    >
      {children}
    </button>
  );
}

export function TipTapEditor({ entryId, content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Begin writing…" }),
      ScriptureBlock,
      CalloutBlock,
    ],
    content: content ? JSON.parse(content) : undefined,
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: "bj-editor outline-none",
      },
    },
  });

  // Sync content when switching entries (entryId change)
  useEffect(() => {
    if (!editor) return;
    const incoming = content ? JSON.parse(content) : { type: "doc", content: [{ type: "paragraph" }] };
    const current = editor.getJSON();
    if (JSON.stringify(incoming) !== JSON.stringify(current)) {
      editor.commands.setContent(incoming);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  if (!editor) return null;

  const divider = (
    <div className="h-4 w-px mx-1" style={{ background: "var(--bj-line)" }} />
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-8 border-b shrink-0"
        style={{ height: 44, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
      >
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (⌘B)"
        >
          <Bold size={13} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (⌘I)"
        >
          <Italic size={13} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline?.().run()}
          title="Underline (⌘U)"
        >
          <Underline size={13} />
        </ToolbarButton>
        {divider}
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>
        {divider}
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List size={13} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered size={13} />
        </ToolbarButton>
        {divider}
        <ToolbarButton
          active={editor.isActive("scriptureBlock")}
          onClick={() => editor.chain().focus().setScriptureBlock().run()}
          title="Scripture verse (⌘⇧S)"
        >
          <BookOpen size={13} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("calloutBlock")}
          onClick={() => editor.chain().focus().setCalloutBlock().run()}
          title="Callout (⌘⇧C)"
        >
          <MessageSquareQuote size={13} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto px-8 md:px-16 py-8">
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
