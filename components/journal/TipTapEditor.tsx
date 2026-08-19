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
  fontKey?: string;
  autoFocus?: boolean;
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
      className="bj-btn-icon w-7 h-7 rounded flex items-center justify-center shrink-0"
      style={{
        background: active ? "var(--bj-gold-tint)" : "transparent",
        color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
      }}
    >
      {children}
    </button>
  );
}

// ── Font + size picker ────────────────────────────────────

const SIZES = [
  { label: "S",  value: 14 },
  { label: "M",  value: 17 },
  { label: "L",  value: 20 },
  { label: "XL", value: 24 },
];

function FontPickerBtn({ fontKey }: { fontKey?: string }) {
  const fKey  = `bj-font-editor-${fontKey ?? "default"}`;
  const szKey = `bj-font-size-editor-${fontKey ?? "default"}`;

  const [fontId, setFontId] = useState<FontPairId>(() =>
    typeof window !== "undefined" ? ((localStorage.getItem(fKey) as FontPairId) ?? "classic") : "classic"
  );
  const [fontSize, setFontSize] = useState<number>(() =>
    typeof window !== "undefined" ? (Number(localStorage.getItem(szKey)) || 17) : 17
  );
  const [open, setOpen] = useState(false);
  const [hovFont, setHovFont] = useState<FontPairId | null>(null);
  const [hovSize, setHovSize] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activePair = fontPairs.find((f) => f.id === fontId) ?? fontPairs[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function applyToDOM(pair: typeof fontPairs[0], size: number) {
    const editors = document.querySelectorAll<HTMLElement>(`.bj-editor-${fontKey ?? "default"}`);
    editors.forEach((el) => {
      el.style.fontFamily = `var(${pair.displayVar})`;
      el.style.fontSize = `${size}px`;
    });
  }

  function chooseFont(id: FontPairId) {
    setFontId(id);
    localStorage.setItem(fKey, id);
    const pair = fontPairs.find((f) => f.id === id) ?? fontPairs[0];
    applyToDOM(pair, fontSize);
  }

  function chooseSize(size: number) {
    setFontSize(size);
    localStorage.setItem(szKey, String(size));
    applyToDOM(activePair, size);
  }

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        title="Font & size"
        className="bj-btn-icon h-7 px-2 rounded flex items-center gap-1 justify-center shrink-0"
        style={{
          fontFamily: `var(${activePair.displayVar})`,
          background: open ? "var(--bj-gold-tint)" : "transparent",
          color: open ? "var(--bj-gold-deep)" : "var(--bj-ink3)",
          fontSize: 13, fontStyle: "italic", fontWeight: 600,
        }}
      >
        Aa
        <span className="font-sans not-italic text-[9px]" style={{ fontFamily: "var(--bj-ui)", color: "var(--bj-ink4)", fontStyle: "normal" }}>
          {SIZES.find((s) => s.value === fontSize)?.label ?? "M"}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 rounded-xl overflow-hidden z-50"
          style={{
            top: "calc(100% + 6px)",
            background: "var(--bj-bg-panel)",
            border: "1px solid var(--bj-line)",
            boxShadow: "0 8px 28px color-mix(in oklch, var(--bj-ink) 14%, transparent)",
            minWidth: 192,
          }}
        >
          {/* Font section */}
          <p className="px-3 pt-2.5 pb-1 font-sans text-[9px] uppercase tracking-widest font-semibold" style={{ color: "var(--bj-ink4)" }}>
            Font
          </p>
          {fontPairs.map((pair) => {
            const active = fontId === pair.id;
            const isHov = hovFont === pair.id && !active;
            return (
              <button key={pair.id}
                onMouseDown={(e) => { e.preventDefault(); chooseFont(pair.id); }}
                onMouseEnter={() => setHovFont(pair.id)} onMouseLeave={() => setHovFont(null)}
                className="flex items-center gap-3 w-full px-3 py-1.5"
                style={{ background: active ? "var(--bj-gold-tint)" : isHov ? "var(--bj-bg-soft)" : "transparent", transition: "background 0.1s ease" }}
              >
                <span style={{ fontFamily: `var(${pair.displayVar})`, fontSize: 17, fontStyle: "italic", color: active ? "var(--bj-gold-deep)" : "var(--bj-ink2)", lineHeight: 1, width: 26, textAlign: "center" }}>
                  Aa
                </span>
                <span className="font-sans text-xs flex-1" style={{ color: active ? "var(--bj-gold-deep)" : "var(--bj-ink)", fontWeight: active ? 500 : 400 }}>
                  {pair.label}
                </span>
                {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--bj-gold)" }} />}
              </button>
            );
          })}

          {/* Size section */}
          <div className="px-3 pt-3 pb-2.5 border-t mt-1" style={{ borderColor: "var(--bj-line-soft)" }}>
            <p className="font-sans text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--bj-ink4)" }}>
              Size
            </p>
            <div className="flex gap-1.5">
              {SIZES.map((s) => {
                const active = fontSize === s.value;
                const isHov = hovSize === s.value && !active;
                return (
                  <button key={s.value}
                    onMouseDown={(e) => { e.preventDefault(); chooseSize(s.value); }}
                    onMouseEnter={() => setHovSize(s.value)} onMouseLeave={() => setHovSize(null)}
                    className="flex-1 py-1.5 rounded-lg font-sans text-xs font-medium"
                    style={{
                      background: active ? "var(--bj-gold)" : isHov ? "var(--bj-bg-soft)" : "var(--bj-bg-soft)",
                      color: active ? "white" : isHov ? "var(--bj-ink)" : "var(--bj-ink3)",
                      border: `1px solid ${active ? "transparent" : "var(--bj-line-soft)"}`,
                      transform: isHov ? "translateY(-1px)" : "none",
                      transition: "all 0.12s ease",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Parse body content that may be TipTap JSON, HTML, or plain text */
function parseContent(raw: string): object | string | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw); // TipTap JSON doc
  } catch {
    // HTML or plain text — TipTap can ingest both as a string
    return raw;
  }
}

export function TipTapEditor({ entryId, content, onChange, fontKey, autoFocus }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Begin writing… (type / for commands)" }),
      ScriptureBlock,
      CalloutBlock,
      SlashCommands,
    ],
    content: parseContent(content),
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: `bj-editor bj-editor-${fontKey ?? "default"} outline-none`,
      },
    },
  });

  // Apply persisted font + size to the editor DOM on mount
  useEffect(() => {
    if (!editor) return;
    const savedId   = (localStorage.getItem(`bj-font-editor-${fontKey ?? "default"}`) as FontPairId) ?? "classic";
    const savedSize = Number(localStorage.getItem(`bj-font-size-editor-${fontKey ?? "default"}`)) || 17;
    const pair = fontPairs.find((f) => f.id === savedId) ?? fontPairs[0];
    const dom = editor.view.dom as HTMLElement;
    dom.style.fontFamily = `var(${pair.displayVar})`;
    dom.style.fontSize   = `${savedSize}px`;
  }, [editor, fontKey]);

  // Focus editor content on mount when autoFocus is set
  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus("end");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Sync content when switching entries (entryId change)
  useEffect(() => {
    if (!editor) return;
    const incoming = parseContent(content) ?? { type: "doc", content: [{ type: "paragraph" }] };
    const current = editor.getJSON();
    if (JSON.stringify(incoming) !== JSON.stringify(current)) {
      editor.commands.setContent(incoming as Parameters<typeof editor.commands.setContent>[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  if (!editor) return null;

  const divider = (
    <div className="h-4 w-px mx-1 shrink-0" style={{ background: "var(--bj-line)" }} />
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-8 border-b shrink-0 overflow-x-auto"
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
