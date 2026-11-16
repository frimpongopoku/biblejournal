"use client";

import type { Editor } from "@tiptap/core";
import { fetchPassage, type PassageRef } from "@/lib/bible-client";

/** The editor the writer was last typing in — target for ⌘K "quote into entry". */
let active: Editor | null = null;
export function setActiveEditor(editor: Editor | null) { active = editor; }
export function clearActiveEditor(editor: Editor) { if (active === editor) active = null; }
export function getActiveEditor(): Editor | null {
  return active && !active.isDestroyed ? active : null;
}

/**
 * Insert a passage as a scripture block directly after the top-level block
 * at `at` (default: the caret). The caret stays where it was, so a writer who
 * quotes mid-sentence keeps writing the sentence.
 */
export async function quotePassage(
  editor: Editor,
  ref: PassageRef,
  version: string,
  at?: number,
): Promise<boolean> {
  const { verses, label } = await fetchPassage(version, ref);
  if (!verses.length || editor.isDestroyed) return false;
  const text = verses.map((v) => v.text).join(" ");
  const { state } = editor;
  const pos = Math.min(at ?? state.selection.head, state.doc.content.size);
  const $pos = state.doc.resolve(pos);
  const block = $pos.depth >= 1 ? $pos.node(1) : null;
  const scripture = { type: "scriptureBlock", attrs: { reference: label, version }, content: [{ type: "text", text }] };

  // Quoting from an empty line (slash command): the verse takes that line and
  // the caret drops into a fresh paragraph beneath it, ready to reflect.
  if (at === undefined && block && block.type.name === "paragraph" && block.content.size === 0) {
    const from = $pos.before(1);
    editor
      .chain()
      .insertContentAt({ from, to: $pos.after(1) }, [scripture, { type: "paragraph" }])
      .focus()
      .run();
    return true;
  }

  const insertAt = $pos.depth >= 1 ? $pos.after(1) : state.doc.content.size;
  editor
    .chain()
    .insertContentAt(insertAt, scripture, { updateSelection: false })
    .run();
  return true;
}
