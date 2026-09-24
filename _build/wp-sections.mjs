// Turns an exported page body into Elementor widgets for WordPress.
//
// Structured blocks (marked <!--wz:{…}--> by blocks.mjs) become WhizzIT widgets
// with real fields. Every other top-level element becomes a "section" widget:
// its markup is kept as a template, and each piece of visible text, each link
// and each image in it becomes an editable field ({{s:n}}, {{u:n}}, {{i:n}}).
// Sections with the same markup share one widget type; each page keeps its own
// text in the widget's settings.
import { createHash } from "node:crypto";

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
// Text inside these is never a field: graphics, form furniture, scripts.
const RAW = new Set(["svg", "script", "style", "textarea", "option", "select", "form"]);

const TOKEN = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+/g;

function tokenize(html) {
  return (html.match(TOKEN) || []).map((raw) => {
    if (raw.startsWith("<!--")) return { t: "comment", raw };
    if (raw.startsWith("<")) {
      const close = raw.startsWith("</");
      const name = raw.match(/^<\/?([a-zA-Z][\w-]*)/)[1].toLowerCase();
      const self = !close && (VOID.has(name) || /\/>$/.test(raw));
      const cls = (raw.match(/\sclass="([^"]*)"/) || [])[1] || "";
      return { t: "tag", raw, name, close, self, cls };
    }
    return { t: "text", raw };
  });
}

const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Splits a page body into structured blocks and top-level elements. */
export function splitTop(html) {
  const chunks = [];
  const tokens = tokenize(html);
  let depth = 0;
  let buf = [];
  let marker = null;
  for (const tok of tokens) {
    if (tok.t === "comment" && tok.raw.startsWith("<!--wz:") && depth === 0) {
      marker = JSON.parse(tok.raw.slice(7, -3));
      continue;
    }
    if (tok.t === "comment" && tok.raw === "<!--/wz-->" && marker) {
      chunks.push({ kind: "struct", ...marker });
      marker = null;
      buf = [];
      continue;
    }
    if (marker) continue; // the block's own markup: the widget redraws it
    if (tok.t === "text" && depth === 0 && !tok.raw.trim()) continue;
    if (tok.t === "comment" && depth === 0) continue;
    buf.push(tok.raw);
    if (tok.t === "tag" && !tok.self) depth += tok.close ? -1 : 1;
    if (depth === 0 && buf.length) {
      chunks.push({ kind: "html", html: buf.join("") });
      buf = [];
    }
  }
  if (buf.join("").trim()) chunks.push({ kind: "html", html: buf.join("") });
  return chunks;
}

/* ---------- Field labels ---------- */
const LABELS = [
  [(e) => e.name === "h1", "Main heading"],
  [(e) => /^h[2-6]$/.test(e.name), "Heading"],
  [(e) => /\beyebrow\b/.test(e.cls), "Label above heading"],
  [(e) => e.name === "summary", "Question"],
  [(e) => e.name === "button" || /\bbtn\b/.test(e.cls), "Button"],
  [(e) => e.name === "blockquote", "Quote"],
  [(e) => e.name === "figcaption", "Caption"],
  [(e) => e.name === "dt", "Figure label"],
  [(e) => e.name === "dd", "Figure"],
  [(e) => e.name === "time", "Date"],
  [(e) => e.name === "li", "List item"],
  [(e) => e.name === "a", "Link text"],
  [(e) => e.name === "strong" || e.name === "b", "Bold text"],
  [(e) => e.name === "p", "Paragraph"],
];

// Context wins over the element: a list item in the breadcrumbs is a breadcrumb.
const CONTEXT = [
  [(e) => /\bbreadcrumbs\b/.test(e.cls), () => "Breadcrumb"],
  [(e) => /\bfaceplate__unit\b|\bstat-(?:strip|band)__/.test(e.cls), (stack) => (stack.at(-1).name === "strong" || stack.at(-1).name === "dd" ? "Stat figure" : "Stat label")],
  [(e) => /\bcheck-card\b|\bcheck-list\b|\btick-list\b/.test(e.cls), (stack) => (stack.some((x) => x.name === "li") ? "Checklist item" : null)],
  [(e) => /\bcallback__success\b|\bform-success\b/.test(e.cls), () => "Form success message"],
];

function labelFor(stack) {
  for (const [test, name] of CONTEXT) {
    if (stack.some(test)) {
      const label = name(stack);
      if (label) return label;
    }
  }
  for (let i = stack.length - 1; i >= 0; i--) {
    for (const [test, label] of LABELS) if (test(stack[i])) return label;
  }
  return "Text";
}

const humanize = (s) => s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/^./, (c) => c.toUpperCase());

/** A readable widget name from the section's own classes. */
function titleFor(firstTag) {
  const generic = new Set(["section", "block", "container", "hero", "hero--sky", "section--tight", "section--mist", "has-feature"]);
  const cls = firstTag.cls.split(/\s+/).filter((c) => c && !generic.has(c) && !/^tone-|^hero--tone|^mt-|^ratio-/.test(c));
  if (/\bhero\b/.test(firstTag.cls)) return "Hero" + (cls.length ? ` (${humanize(cls[0].replace(/^hero-?-?/, ""))})` : "");
  return cls.length ? humanize(cls[0].replace(/__.*$/, "")) : humanize(firstTag.name);
}

/**
 * The section as a template plus its fields. Values are what this page says;
 * the template id depends only on the markup, so identical sections share it.
 */
export function slotify(html) {
  const tokens = tokenize(html);
  const out = [];
  const slots = [];
  const counts = {};
  const stack = [];
  let rawDepth = 0;
  let firstTag = null;
  const openLinks = [];

  const add = (type, label, value) => {
    const k = `${type}${slots.length}`;
    counts[label] = (counts[label] || 0) + 1;
    slots.push({ k, type, label: `${label} ${counts[label]}`, value });
    return k;
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.t === "tag") {
      if (!firstTag && !tok.close) firstTag = tok;

      // A <picture> (or a bare <img>) is one image field.
      if (!rawDepth && !tok.close && (tok.name === "picture" || (tok.name === "img" && stack.at(-1)?.name !== "picture"))) {
        let end = i;
        if (tok.name === "picture") while (end < tokens.length && !(tokens[end].t === "tag" && tokens[end].close && tokens[end].name === "picture")) end++;
        const markup = tokens.slice(i, end + 1).map((t) => t.raw).join("");
        const src = (markup.match(/<img[^>]*\ssrc="([^"]*)"/) || [])[1] || "";
        const k = add("i", "Image", { html: markup, src });
        out.push(`{{${k}}}`);
        i = end;
        continue;
      }

      if (tok.close) {
        if (RAW.has(tok.name) && rawDepth) rawDepth--;
        if (tok.name === "a") openLinks.pop();
        // Pop back to the matching element (tolerates stray markup).
        const at = stack.map((e) => e.name).lastIndexOf(tok.name);
        if (at >= 0) stack.length = at;
        out.push(tok.raw);
        continue;
      }

      let raw = tok.raw;
      if (!rawDepth && tok.name === "a") {
        const href = (raw.match(/\shref="([^"]*)"/) || [])[1];
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          const k = add("u", "Link", decode(href));
          raw = raw.replace(/\shref="[^"]*"/, ` href="{{${k}}}"`);
          openLinks.push(slots.at(-1));
        } else openLinks.push(null);
      }
      if (RAW.has(tok.name) && !tok.self) rawDepth++;
      if (!tok.self) stack.push({ name: tok.name, cls: tok.cls });
      out.push(raw);
      continue;
    }

    if (tok.t === "text" && !rawDepth && tok.raw.trim() && !tok.raw.includes("[whizzit_")) {
      const lead = tok.raw.match(/^\s*/)[0];
      const trail = tok.raw.match(/\s*$/)[0];
      const text = decode(tok.raw.trim());
      const k = add("s", labelFor(stack), text);
      // Name the link field after the words it carries.
      const link = openLinks.at(-1);
      if (link && /^Link \d+$/.test(link.label)) link.label = `Link: ${text.slice(0, 40)}`;
      out.push(`${lead}{{${k}}}${trail}`);
      continue;
    }
    out.push(tok.raw);
  }

  const template = out.join("");
  const id = createHash("sha1").update(template).digest("hex").slice(0, 10);
  // Generic names read badly in Elementor's navigator; use the first heading.
  let title = titleFor(firstTag || { name: "div", cls: "" });
  const heading = slots.find((x) => x.type === "s" && /heading/i.test(x.label));
  if (/^(Section|Div)$/.test(title) && heading) title = heading.value.length > 48 ? heading.value.slice(0, 45) + "…" : heading.value;
  return { id, title, template, slots };
}
