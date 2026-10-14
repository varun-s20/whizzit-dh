// A small HTML tree for reading the staging export: enough to walk sections in
// document order and pull out headings, paragraphs, lists, cards and so on
// without the losses of matching them one regex at a time. Not a browser
// parser: it trusts the export to be well formed (it is), closes void
// elements, and auto-closes an open <p> or <li> where HTML would.

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TOKEN = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+/g;

const attrsOf = (raw) => {
  const out = {};
  for (const m of raw.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    if (m.index === 0) continue; // the tag name
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
};

export function parseHtml(html) {
  const root = { tag: "#root", attrs: {}, children: [], parent: null };
  let cur = root;
  for (const raw of String(html).match(TOKEN) || []) {
    if (raw.startsWith("<!--")) continue;
    if (raw.startsWith("</")) {
      const name = raw.slice(2).match(/^[a-zA-Z][\w-]*/)[0].toLowerCase();
      let n = cur;
      while (n && n.tag !== name) n = n.parent;
      if (n) cur = n.parent || root;
      continue;
    }
    if (raw.startsWith("<")) {
      const name = raw.match(/^<([a-zA-Z][\w-]*)/)[1].toLowerCase();
      // A new block closes an open paragraph; a new item closes the open item.
      if (cur.tag === "p" && /^(p|div|ul|ol|section|article|figure|h[1-6]|table|form|blockquote)$/.test(name)) cur = cur.parent;
      if (name === "li" && cur.tag === "li") cur = cur.parent;
      const node = { tag: name, attrs: attrsOf(raw.slice(0, -1)), children: [], parent: cur };
      node.cls = (node.attrs.class || "").split(/\s+/).filter(Boolean);
      cur.children.push(node);
      if (!VOID.has(name) && !/\/>$/.test(raw)) cur = node;
      continue;
    }
    cur.children.push({ tag: "#text", text: raw, parent: cur });
  }
  return root;
}

export const has = (n, c) => Boolean(n && n.cls && n.cls.includes(c));
export const isEl = (n) => Boolean(n && n.tag && n.tag !== "#text");

/** Every element under n (depth first, document order) matching pred. */
export function findAll(n, pred, out = []) {
  for (const c of n.children || []) {
    if (!isEl(c)) continue;
    if (pred(c)) out.push(c);
    findAll(c, pred, out);
  }
  return out;
}
export const find = (n, pred) => findAll(n, pred)[0] || null;
export const byClass = (c) => (n) => has(n, c);
export const byTag = (t) => (n) => n.tag === t;

/** Is n inside an element matching pred (stopping at `stop`)? */
export function within(n, pred, stop = null) {
  for (let p = n.parent; p && p !== stop; p = p.parent) if (isEl(p) && pred(p)) return p;
  return null;
}

const decode = (s) =>
  String(s)
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ").replace(/&rsquo;/g, "’").replace(/&lsquo;/g, "‘").replace(/&rdquo;/g, "”").replace(/&ldquo;/g, "“")
    .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—").replace(/&hellip;/g, "…").replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** Plain text of n, whitespace collapsed. SVG and form controls are skipped. */
const raw = (n) => {
  if (n.tag === "#text") return decode(n.text);
  if (/^(svg|script|style|select|textarea)$/.test(n.tag)) return "";
  if (n.tag === "br") return " ";
  return (n.children || []).map(raw).join("");
};
export const text = (n) => (n ? raw(n).replace(/\s+/g, " ").trim() : "");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const INLINE = new Set(["a", "strong", "b", "em", "i", "br", "code", "small"]);

/**
 * Inner markup of n reduced to prose: p, ul/ol/li and inline a/strong/em kept
 * (without classes or styles), everything else unwrapped, SVG dropped. Links
 * keep their href so the caller can rewrite them.
 */
export function prose(n) {
  const out = [];
  const walk = (c) => {
    if (c.tag === "#text") return out.push(esc(decode(c.text)));
    if (/^(svg|script|style|form|button|input|textarea|select|label|picture|img|figure)$/.test(c.tag)) return;
    const keep = INLINE.has(c.tag) || /^(p|ul|ol|li)$/.test(c.tag);
    if (keep) {
      const tag = c.tag === "b" ? "strong" : c.tag === "i" ? "em" : c.tag;
      if (tag === "br") return out.push("<br>");
      const href = tag === "a" && c.attrs.href ? ` href="${c.attrs.href}"${/^https?:/.test(c.attrs.href) ? ' rel="noopener"' : ""}` : "";
      out.push(`<${tag}${href}>`);
      (c.children || []).forEach(walk);
      out.push(`</${tag}>`);
      return;
    }
    (c.children || []).forEach(walk);
  };
  (n.children || []).forEach(walk);
  return out.join("").replace(/\s+/g, " ").replace(/<p>\s*<\/p>/g, "").trim();
}
