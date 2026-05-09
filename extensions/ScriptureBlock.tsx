import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    scriptureBlock: {
      setScriptureBlock: () => ReturnType;
    };
  }
}

function ScriptureBlockView() {
  return (
    <NodeViewWrapper
      as="div"
      className="px-5 py-4 rounded-xl my-2"
      style={{ background: "var(--bj-gold-tint)", border: "1px solid var(--bj-gold-soft)" }}
      data-type="scripture-block"
    >
      <p
        className="font-sans text-[11px] mb-2 select-none"
        style={{ color: "var(--bj-gold-deep)", letterSpacing: "0.1em", textTransform: "uppercase" }}
        contentEditable={false}
      >
        Scripture
      </p>
      <NodeViewContent
        className="font-display italic text-lg"
        style={{ color: "var(--bj-ink)", fontWeight: 300, lineHeight: 1.45 }}
      />
    </NodeViewWrapper>
  );
}

export const ScriptureBlock = Node.create({
  name: "scriptureBlock",
  group: "block",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "div[data-type='scripture-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "scripture-block" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ScriptureBlockView);
  },

  addCommands() {
    return {
      setScriptureBlock:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.setScriptureBlock(),
    };
  },
});
