import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PMNode } from "@tiptap/pm/model";
import { findProseRefs, type ParsedRef } from "@/lib/bible-ref-parser";

/**
 * CurrentBlock — marks the top-level block holding the caret with
 * `.bj-current-block`. Focus mode dims everything else via CSS, so the
 * plugin itself costs one decoration per selection change.
 */
export const CurrentBlock = Extension.create({
  name: "currentBlock",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("currentBlock"),
        props: {
          decorations(state) {
            const { $head } = state.selection;
            if ($head.depth < 1) return null;
            const start = $head.before(1);
            const node = state.doc.nodeAt(start);
            if (!node) return null;
            return DecorationSet.create(state.doc, [
              Decoration.node(start, start + node.nodeSize, { class: "bj-current-block" }),
            ]);
          },
        },
      }),
    ];
  },
});

// ── Scripture references in prose ───────────────────────────

export interface ScriptureRefsOptions {
  /** Called when the writer presses Tab right after a reference. */
  onQuote: ((ref: ParsedRef, label: string) => void) | null;
}

const refsKey = new PluginKey<DecorationSet>("scriptureRefs");

function buildRefDecorations(doc: PMNode): DecorationSet {
  const decos: Decoration[] = [];
  doc.descendants((node, pos, parent) => {
    if (!node.isTextblock) return true;
    if (parent?.type.name === "scriptureBlock" || node.type.name === "scriptureBlock" || node.type.name === "codeBlock") return false;
    // Leaf inlines (hard breaks) become one placeholder char, so string
    // offsets map 1:1 onto document positions inside the block.
    const text = node.textBetween(0, node.content.size, undefined, "\ufffc");
    if (text.length < 5 || !/\d:\d/.test(text)) return false;
    for (const r of findProseRefs(text)) {
      decos.push(
        Decoration.inline(pos + 1 + r.from, pos + 1 + r.to, {
          class: "bj-ref",
          "data-book": r.ref.book,
          "data-chapter": String(r.ref.chapter),
          "data-verse": String(r.ref.verse ?? ""),
          "data-verse-end": String(r.ref.verseEnd ?? ""),
          "data-label": r.label,
        }),
      );
    }
    return false;
  });
  return DecorationSet.create(doc, decos);
}

/** The reference ending exactly at the caret, if any. */
function refBeforeCaret(state: import("@tiptap/pm/state").EditorState) {
  const { selection } = state;
  if (!selection.empty) return null;
  const $pos = selection.$head;
  if (!$pos.parent.isTextblock || $pos.parent.type.name === "scriptureBlock") return null;
  const before = $pos.parent.textBetween(0, $pos.parentOffset, undefined, "\ufffc");
  const tail = before.slice(-48);
  const hits = findProseRefs(tail);
  const last = hits[hits.length - 1];
  if (!last || last.to !== tail.length) return null;
  return last;
}

export const ScriptureRefs = Extension.create<ScriptureRefsOptions>({
  name: "scriptureRefs",
  addOptions() {
    return { onQuote: null };
  },
  addProseMirrorPlugins() {
    const options = this.options;
    return [
      new Plugin<DecorationSet>({
        key: refsKey,
        state: {
          init: (_, state) => buildRefDecorations(state.doc),
          apply: (tr, old) => (tr.docChanged ? buildRefDecorations(tr.doc) : old),
        },
        props: {
          decorations(state) {
            const base = refsKey.getState(state);
            const hit = options.onQuote ? refBeforeCaret(state) : null;
            if (!hit || !base) return base;
            const hint = document.createElement("span");
            hint.className = "bj-ref-hint";
            hint.setAttribute("contenteditable", "false");
            hint.innerHTML = '<kbd>Tab</kbd> quote';
            return base.add(state.doc, [
              Decoration.widget(state.selection.head, hint, { side: 1, ignoreSelection: true, key: `hint-${hit.label}` }),
            ]);
          },
          handleKeyDown(view, event) {
            if (event.key !== "Tab" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return false;
            const hit = options.onQuote ? refBeforeCaret(view.state) : null;
            if (!hit) return false;
            event.preventDefault();
            options.onQuote!(hit.ref, hit.label);
            return true;
          },
        },
      }),
    ];
  },
});
