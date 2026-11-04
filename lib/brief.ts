/*
  The campaign guidelines as Maya writes them: a little markdown (the product's lib/brief-markdown.ts reads the same
  subset). Headings (## and ###), paragraphs, lists (- or 1.), and inside a line **bold**, *italic* and [links](url).
  Anything else reads as text, so nothing Maya types is ever lost.
*/

export type BriefInline = { kind: "text" | "bold" | "italic"; text: string } | { kind: "link"; text: string; href: string };

export type BriefBlock =
  | { kind: "heading"; level: 2 | 3; spans: BriefInline[] }
  | { kind: "paragraph"; spans: BriefInline[] }
  | { kind: "list"; ordered: boolean; items: BriefInline[][] };

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

export function inline(line: string): BriefInline[] {
  const out: BriefInline[] = [];
  let last = 0;
  for (const m of line.matchAll(INLINE)) {
    if (m.index > last) out.push({ kind: "text", text: line.slice(last, m.index) });
    if (m[1] != null) out.push({ kind: "bold", text: m[1] });
    else if (m[2] != null) out.push({ kind: "italic", text: m[2] });
    else out.push({ kind: "link", text: m[3], href: m[4] });
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push({ kind: "text", text: line.slice(last) });
  return out;
}

export function parseBrief(source: string | null): BriefBlock[] {
  const blocks: BriefBlock[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: BriefInline[][] } | null = null;
  const flush = () => {
    if (para.length) blocks.push({ kind: "paragraph", spans: inline(para.join(" ")) });
    if (list) blocks.push({ kind: "list", ...list });
    para = [];
    list = null;
  };
  for (const raw of (source ?? "").split("\n")) {
    const line = raw.trim();
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    const item = /^(-|\*|\d+\.)\s+(.*)$/.exec(line);
    if (!line) flush();
    else if (heading) {
      flush();
      blocks.push({ kind: "heading", level: heading[1].length === 2 ? 2 : 3, spans: inline(heading[2]) });
    } else if (item) {
      const ordered = /\d/.test(item[1]);
      if (para.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(inline(item[2]));
    } else {
      if (list) flush();
      para.push(line);
    }
  }
  flush();
  return blocks;
}
