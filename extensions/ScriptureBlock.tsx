import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { ArrowUpRight } from "lucide-react";
import { parseRef } from "@/lib/bible-ref-parser";
import { useFloatWindowsStore } from "@/store/floatWindows.store";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    scriptureBlock: {
      setScriptureBlock: () => ReturnType;
    };
  }
}

function ScriptureBlockView({ node }: NodeViewProps) {
  const reference = node.attrs.reference as string | null;
  const version = node.attrs.version as string | null;
  const openBibleAt = useFloatWindowsStore((s) => s.openBibleAt);
  const parsed = reference ? parseRef(reference) : null;

  return (
    <NodeViewWrapper as="div" className="bj-scripture" data-type="scripture-block">
      <div className="bj-scripture-head" contentEditable={false}>
        <span>Scripture</span>
        {reference && (
          <>
            <span className="bj-scripture-dot" aria-hidden="true" />
            <button
              type="button"
              className="bj-scripture-ref"
              title="Open in Bible"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => parsed && openBibleAt({ book: parsed.book, chapter: parsed.chapter, verse: parsed.verse })}
            >
              {reference}
              {version && <span className="bj-scripture-ver">{version}</span>}
              <ArrowUpRight size={11} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <NodeViewContent className="bj-scripture-text" />
    </NodeViewWrapper>
  );
}

export const ScriptureBlock = Node.create({
  name: "scriptureBlock",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      reference: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-reference"),
        renderHTML: (attrs) => (attrs.reference ? { "data-reference": attrs.reference } : {}),
      },
      version: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-version"),
        renderHTML: (attrs) => (attrs.version ? { "data-version": attrs.version } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='scripture-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "scripture-block" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ScriptureBlockView);
  },

  addCommands() {
    return {
      setScriptureBlock:
        () =>
        ({ commands, editor }) =>
          editor.isActive(this.name) ? commands.setNode("paragraph") : commands.setNode(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.setScriptureBlock(),
    };
  },
});
