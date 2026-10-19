// Small allow-list HTML sanitizer for admin-written rich text (browser only).
const TAGS = new Set([
  "P", "BR", "B", "STRONG", "I", "EM", "U", "S", "H2", "H3", "UL", "OL", "LI",
  "A", "IMG", "DIV", "SPAN", "FONT", "BLOCKQUOTE", "HR",
]);

function clean(node: Node, out: Node, doc: Document) {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out.appendChild(doc.createTextNode(child.textContent ?? ""));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    const tag = el.tagName;
    if (!TAGS.has(tag)) {
      if (tag !== "SCRIPT" && tag !== "STYLE") clean(el, out, doc);
      return;
    }
    const copy = doc.createElement(tag.toLowerCase());
    if (tag === "A") {
      const href = el.getAttribute("href") ?? "";
      if (/^(https?:|mailto:)/i.test(href)) {
        copy.setAttribute("href", href);
        copy.setAttribute("target", "_blank");
        copy.setAttribute("rel", "noopener noreferrer");
      }
    } else if (tag === "IMG") {
      const src = el.getAttribute("src") ?? "";
      if (!/^https:/i.test(src)) return;
      copy.setAttribute("src", src);
      copy.setAttribute("alt", el.getAttribute("alt") ?? "");
    } else if (tag === "FONT") {
      const size = el.getAttribute("size");
      if (size && /^[1-7]$/.test(size)) copy.setAttribute("size", size);
    }
    const align = el.style?.textAlign;
    if (align && /^(left|center|right|justify)$/.test(align)) copy.style.textAlign = align;
    clean(el, copy, doc);
    out.appendChild(copy);
  });
}

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const container = doc.createElement("div");
  clean(doc.body, container, doc);
  return container.innerHTML;
}
