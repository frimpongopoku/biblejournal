"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import { ScriptureBlock } from "@/extensions/ScriptureBlock";
import { CalloutBlock } from "@/extensions/CalloutBlock";
import { fontPairs, type FontPairId } from "@/lib/fonts";

/** Parse any body string into a TipTap-compatible content value */
export function parseBodyContent(body: string): object | string | undefined {
  if (!body) return undefined;
  try {
    return JSON.parse(body); // TipTap JSON
  } catch {
    return body; // HTML or plain text — TipTap ingests both as a string
  }
}

/** Render saved TipTap JSON (or plain text) read-only, with correct fonts */
export function TipTapViewer({
  content,
  fontKey,
}: {
  content: string;
  fontKey?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit, ScriptureBlock, CalloutBlock],
    content: parseBodyContent(content),
    editorProps: {
      attributes: {
        class: `bj-editor bj-editor-${fontKey ?? "default"} outline-none`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const fKey = `bj-font-editor-${fontKey ?? "default"}`;
    const szKey = `bj-font-size-editor-${fontKey ?? "default"}`;
    const savedId = (localStorage.getItem(fKey) as FontPairId) ?? "classic";
    const savedSize = Number(localStorage.getItem(szKey)) || 17;
    const pair = fontPairs.find((f) => f.id === savedId) ?? fontPairs[0];
    const dom = editor.view.dom as HTMLElement;
    dom.style.fontFamily = `var(${pair.displayVar})`;
    dom.style.fontSize = `${savedSize}px`;
  }, [editor, fontKey]);

  if (!editor) return null;

  return (
    <div className="px-5 md:px-12 lg:px-16 py-10 md:py-12">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
