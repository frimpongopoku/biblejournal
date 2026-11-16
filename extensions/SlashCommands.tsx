"use client";

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import type { Editor, Range } from "@tiptap/core";
import {
  Pilcrow,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  BookOpen,
  MessageSquareQuote,
  Quote,
  Minus,
  BookMarked,
  ImagePlus,
} from "lucide-react";
import { pickPhotos } from "@/lib/photos";

// ── Command definitions ───────────────────────────────────

interface SlashItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  action: (editor: Editor, range: Range) => void;
}

const COMMANDS: SlashItem[] = [
  {
    label: "Photo",
    description: "Take or add a photo",
    icon: <ImagePlus size={14} />,
    keywords: ["photo", "image", "picture", "camera", "img"],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      void pickPhotos({ multiple: true }).then((files) => { if (files.length) editor.commands.insertPhotos(files); });
    },
  },
  {
    label: "Paragraph",
    description: "Plain body text",
    icon: <Pilcrow size={14} />,
    keywords: ["p", "text", "paragraph", "body"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("paragraph").run(),
  },
  {
    label: "Heading 1",
    description: "Large section title",
    icon: <Heading1 size={14} />,
    keywords: ["h1", "heading", "title", "large"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    label: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 size={14} />,
    keywords: ["h2", "heading", "subtitle"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    label: "Bullet List",
    description: "Unordered list",
    icon: <List size={14} />,
    keywords: ["ul", "bullet", "list", "unordered"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    label: "Numbered List",
    description: "Ordered list",
    icon: <ListOrdered size={14} />,
    keywords: ["ol", "numbered", "ordered", "list"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    label: "Quote a verse",
    description: "Look up a reference and quote it",
    icon: <BookMarked size={14} />,
    keywords: ["verse", "bible", "scripture", "quote", "reference", "passage", "v"],
    action: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      editor.view.dom.dispatchEvent(new CustomEvent("bj:verse-picker", { bubbles: true }));
    },
  },
  {
    label: "Scripture block",
    description: "Empty block for a verse you'll type",
    icon: <BookOpen size={14} />,
    keywords: ["bible", "verse", "scripture", "block"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("scriptureBlock").run(),
  },
  {
    label: "Callout",
    description: "Accented insight or reflection",
    icon: <MessageSquareQuote size={14} />,
    keywords: ["callout", "insight", "highlight", "reflection", "revelation"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("calloutBlock").run(),
  },
  {
    label: "Quote",
    description: "Someone else's words",
    icon: <Quote size={14} />,
    keywords: ["quote", "blockquote", "citation"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    label: "Divider",
    description: "A quiet break between thoughts",
    icon: <Minus size={14} />,
    keywords: ["divider", "hr", "line", "break", "separator"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

// ── Menu component ────────────────────────────────────────

interface MenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

interface MenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const SlashMenu = forwardRef<MenuRef, MenuProps>(function SlashMenu(
  { items, command },
  ref
) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);
  useEffect(() => {
    document.querySelector(`[data-slash-index="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const select = useCallback(
    (item: SlashItem) => command(item),
    [command]
  );

  useImperativeHandle(ref, () => ({
    onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowUp") {
        setSelected((s) => (s - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((s) => (s + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        if (items[selected]) select(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) return null;

  return (
    <div className="slash-menu bj-pop rounded-[14px] p-1 overflow-y-auto" style={{ width: 264, maxHeight: 320 }}>
      <p className="px-2.5 pt-1.5 pb-1 font-sans text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--bj-ink4)" }}>
        Insert
      </p>
      {items.map((item, i) => (
        <button
          key={item.label}
          type="button"
          data-slash-index={i}
          data-active={selected === i || undefined}
          onMouseDown={(e) => { e.preventDefault(); select(item); }}
          onMouseMove={() => { if (selected !== i) setSelected(i); }}
          className="bj-menu-item flex items-center gap-2.5 w-full h-11 px-2 rounded-[10px] text-left"
        >
          <span className="w-7 h-7 rounded-[8px] bj-well flex items-center justify-center shrink-0"
            style={{ color: selected === i ? "var(--bj-gold)" : "var(--bj-ink3)" }}>
            {item.icon}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-sans text-[13px] font-medium leading-tight truncate" style={{ color: "var(--bj-ink)" }}>{item.label}</span>
            <span className="block font-sans text-[11.5px] leading-tight truncate mt-0.5" style={{ color: "var(--bj-ink4)" }}>{item.description}</span>
          </span>
          {selected === i && <span className="bj-kbd shrink-0">↵</span>}
        </button>
      ))}
    </div>
  );
});

// ── Suggestion renderer ───────────────────────────────────

function makeRenderer(): SuggestionOptions["render"] {
  return () => {
    let renderer: ReactRenderer<MenuRef, MenuProps>;
    let wrapper: HTMLDivElement;

    function position(clientRect: (() => DOMRect | null) | null | undefined) {
      if (!clientRect || !wrapper) return;
      const rect = clientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuH = 320;
      if (spaceBelow >= menuH + 12) {
        wrapper.style.top = `${rect.bottom + 6 + window.scrollY}px`;
      } else {
        wrapper.style.top = `${rect.top - menuH - 6 + window.scrollY}px`;
      }
      wrapper.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 272))}px`;
    }

    return {
      onStart(props) {
        wrapper = document.createElement("div");
        wrapper.style.cssText =
          "position:absolute;z-index:9999;";
        document.body.appendChild(wrapper);

        renderer = new ReactRenderer(SlashMenu, {
          props: {
            items: props.items as SlashItem[],
            command: (item: SlashItem) => props.command({ item }),
          },
          editor: props.editor,
        });
        wrapper.appendChild(renderer.element);
        position(props.clientRect);
      },

      onUpdate(props) {
        renderer.updateProps({
          items: props.items as SlashItem[],
          command: (item: SlashItem) => props.command({ item }),
        });
        position(props.clientRect);
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          wrapper?.remove();
          renderer?.destroy();
          return true;
        }
        return renderer?.ref?.onKeyDown(props.event) ?? false;
      },

      onExit() {
        wrapper?.remove();
        renderer?.destroy();
      },
    };
  };
}

// ── Extension ─────────────────────────────────────────────

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase().trim();
          if (!q) return COMMANDS;
          return COMMANDS.filter(
            (c) =>
              c.label.toLowerCase().includes(q) ||
              c.keywords.some((k) => k.includes(q))
          );
        },
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: { item: SlashItem };
        }) => {
          props.item.action(editor, range);
          editor.commands.focus();
        },
        render: makeRenderer(),
      }),
    ];
  },
});
