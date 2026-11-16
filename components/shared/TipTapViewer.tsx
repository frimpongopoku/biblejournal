"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import { ScriptureBlock } from "@/extensions/ScriptureBlock";
import { CalloutBlock } from "@/extensions/CalloutBlock";
import { useWritingStore, writingFontStyle, WIDTHS } from "@/store/writing.store";

/** Parse any body string into a TipTap-compatible content value */
export function parseBodyContent(body: string): object | string | undefined {
  if (!body) return undefined;
  try {
    return JSON.parse(body); // TipTap JSON
  } catch {
    return body; // HTML or plain text — TipTap ingests both as a string
  }
}

/** Render saved TipTap JSON (or plain text) read-only, in the writer's typography. */
export function TipTapViewer({
  content,
}: {
  content: string;
  /** Kept for older call sites; typography comes from Writing settings. */
  fontKey?: string;
}) {
  const font = useWritingStore((s) => s.font);
  const size = useWritingStore((s) => s.size);
  const width = useWritingStore((s) => s.width);
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit, ScriptureBlock, CalloutBlock],
    content: parseBodyContent(content),
    editorProps: {
      attributes: {
        class: "bj-editor"
      },
    },
  });

  // Content can change underneath (e.g. after an edit is saved).
  useEffect(() => {
    if (!editor) return;
    const next = parseBodyContent(content);
    queueMicrotask(() => {
      if (editor.isDestroyed || next === undefined) return;
      if (JSON.stringify(next) !== JSON.stringify(editor.getJSON())) {
        editor.commands.setContent(next as Parameters<typeof editor.commands.setContent>[0], { emitUpdate: false });
      }
    });
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="px-5 md:px-12 lg:px-16 py-10 md:py-12">
      <div style={{ maxWidth: WIDTHS[width], margin: "0 auto", ...writingFontStyle(font, size) }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
