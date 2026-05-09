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
} from "lucide-react";

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
    label: "Scripture Verse",
    description: "Highlighted Bible verse block",
    icon: <BookOpen size={14} />,
    keywords: ["bible", "verse", "scripture", "quote", "reference"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("scriptureBlock").run(),
  },
  {
    label: "Callout",
    description: "Accented insight or reflection",
    icon: <MessageSquareQuote size={14} />,
    keywords: ["callout", "quote", "insight", "highlight", "reflection"],
    action: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("calloutBlock").run(),
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
    <div
      className="slash-menu"
      style={{
        background: "var(--bj-bg-panel)",
        border: "1px solid var(--bj-line)",
        borderRadius: 12,
        boxShadow: "0 8px 32px color-mix(in oklch, var(--bj-ink) 16%, transparent)",
        overflow: "hidden",
        minWidth: 240,
        maxHeight: 320,
        overflowY: "auto",
      }}
    >
      <p
        className="px-3 pt-2.5 pb-1 font-sans uppercase"
        style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--bj-ink4)" }}
      >
        Blocks
      </p>
      {items.map((item, i) => (
        <button
          key={item.label}
          onMouseDown={(e) => {
            e.preventDefault();
            select(item);
          }}
          className="flex items-center gap-3 w-full px-3 py-2 text-left"
          style={{
            background: selected === i ? "var(--bj-gold-tint)" : "transparent",
            color: selected === i ? "var(--bj-gold-deep)" : "var(--bj-ink2)",
            transition: "background 0.1s ease",
          }}
          onMouseEnter={() => setSelected(i)}
        >
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: selected === i ? "var(--bj-gold)" : "var(--bj-bg-soft)",
              color: selected === i ? "white" : "var(--bj-ink3)",
              transition: "background 0.1s ease, color 0.1s ease",
            }}
          >
            {item.icon}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-sans text-sm font-medium leading-none mb-0.5">
              {item.label}
            </span>
            <span className="block font-sans" style={{ fontSize: 11, color: selected === i ? "var(--bj-gold-deep)" : "var(--bj-ink4)" }}>
              {item.description}
            </span>
          </span>
          {i < 2 && (
            <span
              className="font-sans shrink-0"
              style={{ fontSize: 9, color: "var(--bj-ink4)", opacity: 0.6 }}
            >
              {i === 0 ? "⌘⇧P" : i === 1 ? "⌘⇧H" : ""}
            </span>
          )}
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
      wrapper.style.left = `${Math.min(rect.left, window.innerWidth - 260)}px`;
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
