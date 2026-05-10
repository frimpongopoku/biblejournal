"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { ScriptureBlock } from "@/extensions/ScriptureBlock";
import { CalloutBlock } from "@/extensions/CalloutBlock";
import { SlashCommands } from "@/extensions/SlashCommands";
import {
  Bold, Italic, Underline, Heading1, Heading2,
  List, ListOrdered, BookOpen, MessageSquareQuote, Type,
} from "lucide-react";
import { fontPairs, type FontPairId } from "@/lib/fonts";

interface Props {
  entryId: string;
  content: string;
  onChange: (json: string) => void;
  /** localStorage key for persisting this editor's font choice independently */
  fontKey?: string;
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

// ── Font picker ───────────────────────────────────────────

function FontPickerBtn({ fontKey }: { fontKey?: string }) {
  const storageKey = `bj-font-editor-${fontKey ?? "default"}`;
  const [fontId, setFontId] = useState<FontPairId>(() => {
    if (typeof window === "undefined") return "classic";
    return (localStorage.getItem(storageKey) as FontPairId) ?? "classic";
  });
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState<FontPairId | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activePair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function choose(id: FontPairId) {
    setFontId(id);
    localStorage.setItem(storageKey, id);
    // Push to editor DOM directly — works even across re-renders
    const editors = document.querySelectorAll<HTMLElement>(`.bj-editor-${fontKey ?? "default"}`);
    const pair = fontPairs.find((f) => f.id === id) ?? fontPairs[0];
    editors.forEach((el) => { el.style.fontFamily = `var(${pair.displayVar})`; });
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        title="Writing font"
        className="bj-btn-icon w-7 h-7 rounded flex items-center justify-center"
        style={{
          fontFamily: `var(${activePair.displayVar})`,
          background: open ? "var(--bj-gold-tint)" : "transparent",
          color: open ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
          fontSize: 13, fontStyle: "italic", fontWeight: 600,
        }}
      >
        Aa
      </button>

      {open && (
        <div
          className="absolute right-0 rounded-xl overflow-hidden z-50"
          style={{
            top: "calc(100% + 6px)",
            background: "var(--bj-bg-panel)",
            border: "1px solid var(--bj-line)",
            boxShadow: "0 8px 28px color-mix(in oklch, var(--bj-ink) 14%, transparent)",
            minWidth: 180,
          }}
        >
          <p className="px-3 pt-2.5 pb-1 font-sans text-[9px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
            Writing font
          </p>
          {fontPairs.map((pair) => {
            const active = fontId === pair.id;
            const isHov = hov === pair.id && !active;
            return (
              <button
                key={pair.id}
                onMouseDown={(e) => { e.preventDefault(); choose(pair.id); }}
                onMouseEnter={() => setHov(pair.id)}
                onMouseLeave={() => setHov(null)}
                className="flex items-center gap-3 w-full px-3 py-2"
                style={{
                  background: active ? "var(--bj-gold-tint)" : isHov ? "var(--bj-bg-soft)" : "transparent",
                  transition: "background 0.1s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: `var(${pair.displayVar})`,
                    fontSize: 18, fontStyle: "italic",
                    color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
                    lineHeight: 1, width: 28, textAlign: "center",
                    transition: "color 0.1s ease",
                  }}
                >
                  Aa
                </span>
                <span className="font-sans text-xs" style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink)", fontWeight: active ? 500 : 400 }}>
                  {pair.label}
                </span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--bj-gold)" }} />}
              </button>
            );
          })}
          <div className="h-2" />
        </div>
      )}
    </div>
  );
}

export function TipTapEditor({ entryId, content, onChange, fontKey }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Begin writing… (type / for commands)" }),
      ScriptureBlock,
      CalloutBlock,
      SlashCommands,
    ],
    content: content ? JSON.parse(content) : undefined,
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: `bj-editor bj-editor-${fontKey ?? "default"} outline-none`,
      },
    },
  });

  // Apply the persisted font to the editor DOM element
  useEffect(() => {
    if (!editor) return;
    const storageKey = `bj-font-editor-${fontKey ?? "default"}`;
    const savedId = (localStorage.getItem(storageKey) as FontPairId) ?? "classic";
    const pair = fontPairs.find((f) => f.id === savedId) ?? fontPairs[0];
    (editor.view.dom as HTMLElement).style.fontFamily = `var(${pair.displayVar})`;
  }, [editor, fontKey]);

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

        <div className="flex-1" />
        {divider}
        <FontPickerBtn fontKey={fontKey} />
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto px-5 md:px-12 lg:px-16 py-10 md:py-12">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
