"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Entry {
  id: string;
  title: string;
  body: string;
}

type TipTapNode = { type?: string; text?: string; content?: TipTapNode[] };

function tipTapToHtml(node: TipTapNode): string {
  if (node.type === "text") return node.text ?? "";
  const inner = (node.content ?? []).map(tipTapToHtml).join("");
  switch (node.type) {
    case "doc": return inner;
    case "paragraph": return inner ? `<p>${inner}</p>` : "<p></p>";
    case "heading": return `<p><strong>${inner}</strong></p>`;
    case "bulletList": return `<ul>${inner}</ul>`;
    case "orderedList": return `<ol>${inner}</ol>`;
    case "listItem": return `<li>${inner}</li>`;
    case "blockquote": return `<blockquote>${inner}</blockquote>`;
    case "hardBreak": return "<br>";
    default: return inner;
  }
}

function bodyToHtml(body: string): string {
  if (!body) return "";
  // TipTap JSON
  try {
    return tipTapToHtml(JSON.parse(body));
  } catch {}
  // HTML
  if (body.trimStart().startsWith("<")) return body;
  // Plain text
  return body.split("\n").map((l) => l ? `<p>${l}</p>` : "<p></p>").join("");
}

function renderBody(body: string) {
  const html = bodyToHtml(body);
  if (!html) return null;
  return (
    <div
      className="bj-simple-editor"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ fontSize: 15, color: "var(--bj-ink3)", lineHeight: 1.8 }}
    />
  );
}

export function EntriesClient({ entries }: { entries: Entry[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry, i) => {
        const isOpen = expanded === entry.id;
        return (
          <div
            key={entry.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--bj-bg-panel, #fff)",
              border: `1px solid ${isOpen ? "var(--bj-line, #e5e5e5)" : "var(--bj-line-soft, #f0f0f0)"}`,
              boxShadow: isOpen
                ? "0 4px 20px color-mix(in oklch, var(--bj-ink, #000) 6%, transparent)"
                : "0 1px 4px color-mix(in oklch, var(--bj-ink, #000) 3%, transparent)",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : entry.id)}
              className="w-full flex items-start gap-4 px-5 py-4 text-left"
              style={{ background: "transparent" }}
            >
              <span
                className="font-sans font-bold shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
                style={{
                  background: isOpen ? "var(--bj-gold, #c9a84c)" : "var(--bj-gold-tint, #fdf6e3)",
                  color: isOpen ? "white" : "var(--bj-gold-deep, #8a6a00)",
                  fontSize: 10,
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                {i + 1}
              </span>

              <p
                className="font-sans font-semibold flex-1 leading-snug text-left"
                style={{ fontSize: 16, color: "var(--bj-ink, #111)" }}
              >
                {entry.title}
              </p>

              {entry.body && (
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 mt-0.5"
                  style={{ color: "var(--bj-ink4, #aaa)" }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && entry.body && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 sm:px-5 pb-5 pt-1 sm:ml-10"
                    style={{ borderTop: "1px solid var(--bj-line-soft, #f0f0f0)" }}
                  >
                    <div className="pt-3">
                      {renderBody(entry.body)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
