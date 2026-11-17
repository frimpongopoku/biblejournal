"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, List, ListOrdered,
  BookOpen, MessageSquareQuote, Quote, MessageSquare,
} from "lucide-react";
import { ScriptureBlock } from "@/extensions/ScriptureBlock";
import { PhotoBlock } from "@/extensions/PhotoBlock";
import { CalloutBlock } from "@/extensions/CalloutBlock";
import { SlashCommands } from "@/extensions/SlashCommands";
import { CurrentBlock, ScriptureRefs } from "@/extensions/WritingAids";
import { useWritingStore, writingFontStyle, WIDTHS } from "@/store/writing.store";
import { useBibleStore } from "@/store/bible.store";
import { useFloatWindowsStore } from "@/store/floatWindows.store";
import { useKeySounds, useCaretAndTypewriter } from "@/hooks/useWritingSurface";
import { quotePassage, setActiveEditor, clearActiveEditor } from "@/lib/editor/quote";
import type { ParsedRef } from "@/lib/bible-ref-parser";
import { WritingSettingsButton } from "./WritingSettings";
import { WritingStats, VerseHoverCard, VersePicker, type RefHover } from "./EditorExtras";

interface Props {
  entryId: string;
  content: string;
  onChange: (json: string) => void;
  /** Kept for compatibility with older call sites; typography is global now. */
  fontKey?: string;
  autoFocus?: boolean;
  /** Formatting toolbar row above the page (default on). */
  toolbar?: boolean;
  /** Word count / session / speed bar under the page. */
  stats?: boolean;
  /** Rendered inside the scrolling page, above the text (title, meta…). */
  header?: React.ReactNode;
  /** Extra items for the stats bar (e.g. save status). */
  statsExtra?: React.ReactNode;
  /** Quieter chrome for zen mode. */
  zen?: boolean;
  placeholder?: string;
  /** Small surfaces (floating notepad): tighter padding, capped text size. */
  compact?: boolean;
}

const PROMPTS = [
  "What did God show you today?",
  "Begin with what's on your heart…",
  "What verse has been following you around?",
  "Where did you notice grace this week?",
  "What are you carrying that you could lay down?",
  "Write the prayer you haven't said out loud yet…",
  "What would you tell yourself a year from now?",
];

function promptFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return `${PROMPTS[Math.abs(h) % PROMPTS.length]}   ( / for blocks )`;
}

/** Body content may be TipTap JSON, HTML, or plain text. */
function parseContent(raw: string): object | string | undefined {
  if (!raw) return undefined;
  try { return JSON.parse(raw); } catch { return raw; }
}

function Btn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      data-active={active || undefined}
      className="bj-btn-icon w-7 h-7 rounded-md flex items-center justify-center shrink-0"
      style={{ background: active ? "var(--bj-gold-tint)" : "transparent", color: active ? "var(--bj-gold-deep)" : "var(--bj-ink3)" }}
    >
      {children}
    </button>
  );
}

export function TipTapEditor({
  entryId, content, onChange, autoFocus, toolbar = true, stats = false, header, statsExtra, zen = false, placeholder, compact = false,
}: Props) {
  const font = useWritingStore((s) => s.font);
  const size = useWritingStore((s) => s.size);
  const width = useWritingStore((s) => s.width);
  const focusParagraph = useWritingStore((s) => s.focusParagraph);
  const typewriter = useWritingStore((s) => s.typewriter);
  const bibleVersion = useBibleStore((s) => s.version);
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const openAsk = useFloatWindowsStore((s) => s.openAsk);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const promptRef = useRef(placeholder ?? promptFor(entryId));
  const versionRef = useRef(bibleVersion);
  const onQuoteRef = useRef<(ref: ParsedRef) => void>(() => {});

  const [hover, setHover] = useState<RefHover | null>(null);
  const [pickerAt, setPickerAt] = useState<{ left: number; top: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false, autolink: true },
    }),
    Placeholder.configure({ placeholder: ({ node }) => (node.type.name === "photo" ? "Add a caption…" : promptRef.current) }),
    CharacterCount,
    ScriptureBlock,
    PhotoBlock,
    CalloutBlock,
    SlashCommands,
    CurrentBlock,
    ScriptureRefs.configure({ onQuote: (ref) => onQuoteRef.current(ref) }),
  ], []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: parseContent(content),
    onUpdate({ editor }) {
      onChangeRef.current(JSON.stringify(editor.getJSON()));
    },
    onFocus({ editor }) { setActiveEditor(editor); },
    editorProps: {
      attributes: { class: "bj-editor", spellcheck: "true" },
      scrollMargin: { top: 80, bottom: 140, left: 0, right: 0 },
      scrollThreshold: { top: 80, bottom: 140, left: 0, right: 0 },
      // Typewriter mode does its own scrolling; ProseMirror's would fight it.
      handleScrollToSelection: () => useWritingStore.getState().typewriter,
      handleClick: (view, _pos, event) => {
        const el = (event.target as HTMLElement).closest?.(".bj-ref") as HTMLElement | null;
        if (!el || !(event.metaKey || event.ctrlKey)) return false;
        openBibleAt({ book: el.dataset.book!, chapter: Number(el.dataset.chapter), verse: Number(el.dataset.verse) || undefined });
        return true;
      },
    },
  });

  // Only these flags re-render the chrome — not every keystroke.
  const is = useEditorState({
    editor,
    selector: ({ editor: ed }) => ed ? {
      bold: ed.isActive("bold"), italic: ed.isActive("italic"), underline: ed.isActive("underline"),
      strike: ed.isActive("strike"), h1: ed.isActive("heading", { level: 1 }), h2: ed.isActive("heading", { level: 2 }),
      bullet: ed.isActive("bulletList"), ordered: ed.isActive("orderedList"), quote: ed.isActive("blockquote"),
      callout: ed.isActive("calloutBlock"),
    } : null,
  });

  // Latest callbacks for the long-lived editor instance.
  useEffect(() => {
    onChangeRef.current = onChange;
    versionRef.current = bibleVersion;
    // Tab right after a reference → quote it below, caret stays put.
    onQuoteRef.current = (ref) => { if (editor) void quotePassage(editor, ref, versionRef.current); };
  });

  useKeySounds();
  useCaretAndTypewriter(editor, surfaceRef, caretRef, scrollerRef);

  useEffect(() => () => { if (editor) clearActiveEditor(editor); }, [editor]);

  useEffect(() => {
    if (autoFocus && editor) editor.commands.focus("end");
  }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Switching documents: swap content without creating a new editor.
  useEffect(() => {
    if (!editor) return;
    promptRef.current = placeholder ?? promptFor(entryId);
    const incoming = parseContent(content) ?? { type: "doc", content: [{ type: "paragraph" }] };
    // Deferred a microtask: React node views (scripture blocks) render via
    // flushSync, which React forbids during its own commit phase.
    queueMicrotask(() => {
      if (editor.isDestroyed) return;
      if (JSON.stringify(incoming) !== JSON.stringify(editor.getJSON())) {
        editor.commands.setContent(incoming as Parameters<typeof editor.commands.setContent>[0], { emitUpdate: false });
      }
    });
    setHover(null);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [entryId, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verse hover cards + the slash-command verse picker.
  const showHover = useCallback((el: HTMLElement) => {
    if (!editor) return;
    const ref: ParsedRef = {
      book: el.dataset.book!, chapter: Number(el.dataset.chapter),
      verse: Number(el.dataset.verse) || undefined, verseEnd: Number(el.dataset.verseEnd) || undefined,
    };
    let pos = editor.state.selection.head;
    try { pos = editor.view.posAtDOM(el, 0); } catch { /* keep caret */ }
    setHover({ ref, label: el.dataset.label!, rect: el.getBoundingClientRect(), pos });
  }, [editor]);

  const cancelHide = () => clearTimeout(hoverTimer.current);
  const scheduleHide = () => { clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => setHover(null), 220); };

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.(".bj-ref") as HTMLElement | null;
      if (!el) return;
      clearTimeout(hoverTimer.current);
      hoverTimer.current = setTimeout(() => showHover(el), 280);
    };
    const out = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.(".bj-ref")) scheduleHide();
    };
    const picker = () => {
      try {
        const c = editor.view.coordsAtPos(editor.state.selection.head);
        setPickerAt({ left: c.left, top: c.bottom });
      } catch { /* ignore */ }
    };
    const typing = () => setHover(null);
    // Photos go to the page's photo set (beside the writing), not into the text.
    const photos = () => window.dispatchEvent(new CustomEvent("bj:entry-photos"));
    dom.addEventListener("bj:photo-picker", photos);
    dom.addEventListener("mouseover", over);
    dom.addEventListener("mouseout", out);
    dom.addEventListener("bj:verse-picker", picker);
    dom.addEventListener("keydown", typing);
    const scroller = scrollerRef.current;
    scroller?.addEventListener("scroll", typing, { passive: true });
    return () => {
      dom.removeEventListener("bj:photo-picker", photos);
      dom.removeEventListener("mouseover", over);
      dom.removeEventListener("mouseout", out);
      dom.removeEventListener("bj:verse-picker", picker);
      dom.removeEventListener("keydown", typing);
      scroller?.removeEventListener("scroll", typing);
    };
  }, [editor, showHover]);

  if (!editor) return null;

  const divider = <div className="h-4 w-px mx-1 shrink-0" style={{ background: "var(--bj-line)" }} />;
  const maxW = WIDTHS[width];

  return (
    <div className="flex flex-col h-full min-h-0">
      {toolbar && (
        <div
          className={`flex items-center gap-0.5 ${compact ? "px-2" : "px-4 md:px-8"} border-b shrink-0 overflow-x-auto`}
          style={{ height: 44, borderColor: "var(--bj-line-soft)", background: "var(--bj-bg-panel)" }}
        >
          <Btn active={is?.bold} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)"><Bold size={13} /></Btn>
          <Btn active={is?.italic} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)"><Italic size={13} /></Btn>
          <Btn active={is?.underline} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (⌘U)"><Underline size={13} /></Btn>
          {divider}
          <Btn active={is?.h1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1"><Heading1 size={14} /></Btn>
          <Btn active={is?.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={14} /></Btn>
          {divider}
          <Btn active={is?.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List size={13} /></Btn>
          <Btn active={is?.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered size={13} /></Btn>
          {divider}
          <Btn onClick={() => editor.view.dom.dispatchEvent(new CustomEvent("bj:verse-picker"))} title="Quote a verse"><BookOpen size={13} /></Btn>
          <Btn active={is?.callout} onClick={() => editor.chain().focus().setCalloutBlock().run()} title="Callout (⌘⇧C)"><MessageSquareQuote size={13} /></Btn>
          <div className="flex-1" />
          <WritingSettingsButton />
        </div>
      )}

      <div className="relative flex-1 min-h-0 flex flex-col">
      <div ref={scrollerRef} className="flex-1 min-h-0 overflow-y-auto" data-writing-surface>
        <div
          className={compact ? "px-4 pt-4" : "px-5 md:px-12 pt-10 md:pt-14"}
          style={{
            maxWidth: compact ? undefined : maxW + 96, margin: "0 auto",
            paddingBottom: compact ? (typewriter ? "45%" : 48) : typewriter ? "55vh" : "28vh",
          }}
        >
          {header}
          <div
            ref={surfaceRef}
            className={`relative ${focusParagraph ? "bj-dim" : ""}`}
            style={writingFontStyle(font, compact ? Math.min(size, 17) : size)}
          >
            <EditorContent editor={editor} />
            <div ref={caretRef} className="bj-caret" hidden aria-hidden="true" />
          </div>
        </div>
      </div>

      {stats && <WritingStats editor={editor} docKey={entryId} whisper={zen} extra={statsExtra} />}
      </div>

      <BubbleMenu
        editor={editor}
        options={{ placement: "top", offset: 8 }}
        shouldShow={({ editor: ed, state }) => {
          const { empty } = state.selection;
          return !empty && ed.isEditable && !ed.isActive("scriptureBlock") && state.doc.textBetween(state.selection.from, state.selection.to).trim().length > 0;
        }}
      >
        <div className="bj-bubble">
          <button type="button" aria-label="Bold" data-active={is?.bold || undefined} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}><Bold size={13} /></button>
          <button type="button" aria-label="Italic" data-active={is?.italic || undefined} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}><Italic size={13} /></button>
          <button type="button" aria-label="Underline" data-active={is?.underline || undefined} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}><Underline size={13} /></button>
          <button type="button" aria-label="Strikethrough" data-active={is?.strike || undefined} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}><Strikethrough size={13} /></button>
          <span className="sep" />
          <button type="button" aria-label="Heading" data-active={is?.h2 || undefined} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}><Heading2 size={14} /></button>
          <button type="button" aria-label="Quote" data-active={is?.quote || undefined} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}><Quote size={13} /></button>
          <button type="button" aria-label="Callout" data-active={is?.callout || undefined} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setCalloutBlock().run(); }}><MessageSquareQuote size={13} /></button>
          <span className="sep" />
          <button type="button" title="Ask what Scripture says about this"
            onMouseDown={(e) => {
              e.preventDefault();
              const { from, to } = editor.state.selection;
              const text = editor.state.doc.textBetween(from, to, " ").trim().slice(0, 280);
              if (text) openAsk(`What does the Bible say about: "${text}"`);
            }}>
            <MessageSquare size={13} /> Ask
          </button>
        </div>
      </BubbleMenu>

      <VerseHoverCard editor={editor} hover={hover} onEnter={cancelHide} onLeave={scheduleHide} onDone={() => setHover(null)} />
      <VersePicker editor={editor} at={pickerAt} onClose={() => setPickerAt(null)} />
    </div>
  );
}
