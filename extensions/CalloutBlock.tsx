import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    calloutBlock: {
      setCalloutBlock: () => ReturnType;
    };
  }
}

function CalloutBlockView() {
  return (
    <NodeViewWrapper
      as="div"
      className="px-5 py-4 rounded-xl border-l-2 my-2"
      style={{
        background: "var(--bj-bg-soft)",
        borderColor: "var(--bj-gold)",
        borderLeftWidth: 2,
      }}
      data-type="callout-block"
    >
      <NodeViewContent
        className="font-display italic text-lg"
        style={{ color: "var(--bj-ink)", fontWeight: 400, lineHeight: 1.45 }}
      />
    </NodeViewWrapper>
  );
}

export const CalloutBlock = Node.create({
  name: "calloutBlock",
  group: "block",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "div[data-type='callout-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "callout-block" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutBlockView);
  },

  addCommands() {
    return {
      setCalloutBlock:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-c": () => this.editor.commands.setCalloutBlock(),
    };
  },
});
