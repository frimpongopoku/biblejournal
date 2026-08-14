/** Extract a short plain-text preview from a TipTap JSON content string. */
export function previewText(raw: string | null): string {
  if (!raw) return "";
  try {
    const doc = JSON.parse(raw);
    const parts: string[] = [];
    (function walk(node: any) {
      if (!node) return;
      if (node.type === "text" && node.text) parts.push(node.text);
      if (Array.isArray(node.content)) node.content.forEach(walk);
    })(doc);
    return parts.join(" ").trim();
  } catch {
    return raw;
  }
}
