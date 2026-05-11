"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

/** Convert plain text to basic HTML paragraphs for TipTap */
export function plainTextToHtml(text: string): string {
  if (!text) return "<p></p>";
  if (text.trimStart().startsWith("<")) return text;
  return (
    text
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("") || "<p></p>"
  );
}

interface Props {
  initialValue: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function SimpleRichEditor({
  initialValue,
  onChange,
  placeholder = "Write here…",
  className,
  style,
  onClick,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: plainTextToHtml(initialValue),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  return (
    <EditorContent
      editor={editor}
      className={`bj-simple-editor ${className ?? ""}`}
      style={style}
      onClick={onClick}
    />
  );
}
