// Reads the WordPress export in /_source and turns it into build data.
// The export stores each post as a whole page, so the prose is pulled out of
// its <article> block and the chip row gives category, date, read time, author.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "_source");
const read = (f) => JSON.parse(readFileSync(join(SRC, f), "utf8"));

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&quot;/g, '"');

const strip = (s) => decode(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
const first = (re, s, fallback = "") => (s.match(re)?.[1] ?? fallback);

// Staging links become local page links: "/cyber-security/email-security-services/" → "@/cyber-security/email-security-services.html"
// A few staging links point at paths that live elsewhere in the static build.
const ALIASES = {
  "it-support-london": "locations/it-support-london",
  privacy: "privacy-policy",
  cookies: "cookie-policy",
};

export function rewriteLinks(html) {
  return html
    .replace(/href="https:\/\/(?:staging\.)?whizzit\.co\.uk\//g, 'href="/')
    .replace(/href="\/"/g, 'href="@/index.html"')
    .replace(/href="\/([a-z0-9/-]+?)\/"/g, (_, path) => `href="@/${ALIASES[path] || path}.html"`)
    .replace(/href="\/#/g, 'href="#')
    // The old theme anchored these at its own on-page form.
    .replace(/href="#(enquire|enquiry|contact|book)"/g, 'href="@/contact.html"');
}

const CATEGORY = {
  "IT Support": { key: "support", label: "IT Support", tone: "support", icon: "headset" },
  "Managed IT": { key: "managed-it", label: "Managed IT", tone: "support", icon: "activity" },
  "Cyber Security": { key: "security", label: "Cyber Security", tone: "cyber", icon: "shield" },
  "Cloud": { key: "cloud", label: "Cloud", tone: "cloud", icon: "cloud" },
  "Cloud Services": { key: "cloud", label: "Cloud", tone: "cloud", icon: "cloud" },
  "Networking": { key: "network", label: "Network", tone: "network", icon: "network" },
  "Network": { key: "network", label: "Network", tone: "network", icon: "network" },
  "IT Strategy": { key: "strategy", label: "IT Strategy", tone: "projects", icon: "compass" },
  "Careers": { key: "careers", label: "Careers", tone: "projects", icon: "graduation" },
};
const FALLBACK = { key: "managed-it", label: "Managed IT", tone: "support", icon: "book" };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function isoDate(text) {
  const m = text.match(/^(\d{1,2}) (\w+) (\d{4})$/);
  if (!m) return "";
  const month = String(MONTHS.indexOf(m[2]) + 1).padStart(2, "0");
  return `${m[3]}-${month}-${m[1].padStart(2, "0")}`;
}


// Content is extracted in chunks, so a fragment can start or end mid-element:
// an <a> with no </a> swallows everything after it, and a stray </svg> or </a>
// shows up as junk. Walk the tags and drop what cannot be matched.
const VOID_TAGS = new Set(["br", "hr", "img", "input", "source", "meta", "link"]);
const INLINE_TAGS = new Set(["a", "span", "strong", "em", "b", "i", "small", "svg", "path", "circle", "rect", "g"]);

export function balanceTags(html) {
  const tokens = [...html.matchAll(/<\/?([a-zA-Z][\w-]*)[^>]*>/g)];
  const drop = new Set();
  const stack = [];

  tokens.forEach((token, index) => {
    const tag = token[1].toLowerCase();
    if (VOID_TAGS.has(tag) || token[0].endsWith("/>")) return;
    if (token[0][1] === "/") {
      // Closing tag: match the nearest open of the same name, otherwise drop it.
      const at = [...stack].reverse().find((entry) => entry.tag === tag);
      if (!at) { drop.add(index); return; }
      while (stack.length && stack[stack.length - 1] !== at) stack.pop();
      stack.pop();
    } else {
      stack.push({ tag, index });
    }
  });

  // Anything still open was never closed in this fragment.
  const trailing = [];
  stack.forEach((entry) => {
    if (INLINE_TAGS.has(entry.tag)) drop.add(entry.index);
    else trailing.push(entry.tag);
  });

  if (!drop.size && !trailing.length) return html;

  let out = "";
  let cursor = 0;
  tokens.forEach((token, index) => {
    out += html.slice(cursor, token.index);
    if (!drop.has(index)) out += token[0];
    cursor = token.index + token[0].length;
  });
  out += html.slice(cursor);
  return out + trailing.reverse().map((tag) => `</${tag}>`).join("");
}


// The old theme wrapped whole cards in one <a>. Inside prose that renders as a
// giant underlined block, so unwrap any anchor containing block-level content
// and keep the text.
export function unwrapBlockAnchors(html) {
  let out = html;
  let guard = 0;
  while (guard++ < 50) {
    const open = out.match(/<a\s[^>]*>/i);
    if (!open) break;
    const start = out.indexOf(open[0]);
    const close = out.indexOf("</a>", start);
    if (close === -1) break;
    const inner = out.slice(start + open[0].length, close);
    if (!/<(h[1-6]|p|ul|ol|li|div|table)/i.test(inner)) {
      // Leave ordinary inline links alone; step past this one.
      const rest = unwrapBlockAnchors(out.slice(close + 4));
      return out.slice(0, close + 4) + rest;
    }
    out = out.slice(0, start) + inner + out.slice(close + 4);
  }
  return out;
}

/* ---------- Body sanitiser ----------
   Article bodies come from the old theme, so they arrive carrying its forms,
   reCAPTCHA markup, animation hooks and icon SVGs. Strip all of that, keep the
   prose, the heading ids the contents list points at, and the mid-article CTA. */
const KEEP_CLASS = new Set(["cta-mid", "cta-mid__btns", "btn", "btn--primary", "btn--ghost", "eyebrow"]);

// Removes an element and everything inside it, counting nested tags of the same name.
export function dropElement(html, tag, marker) {
  const open = new RegExp("<" + tag + "\\b[^>]*>", "gi");
  let out = html;
  let match;
  while ((match = open.exec(out))) {
    if (marker && !match[0].includes(marker)) continue;
    let depth = 1;
    const scan = new RegExp("<(/)?" + tag + "\\b[^>]*>", "gi");
    scan.lastIndex = match.index + match[0].length;
    let end = -1;
    let step;
    while ((step = scan.exec(out))) {
      depth += step[1] ? -1 : 1;
      if (depth === 0) { end = scan.lastIndex; break; }
    }
    if (end === -1) break;
    out = out.slice(0, match.index) + out.slice(end);
    open.lastIndex = match.index;
  }
  return out;
}

export function sanitizeBody(html) {
  let out = html;
  out = dropElement(out, "form");
  out = dropElement(out, "div", "cta-mid--form");
  out = dropElement(out, "svg");
  out = dropElement(out, "canvas");
  out = dropElement(out, "script");
  out = dropElement(out, "noscript");
  out = out
    .replace(/<(input|source)[^>]*>/gi, "")
    .replace(/<\/?(button|label)[^>]*>/gi, "")
    .replace(/\sdata-[\w-]+(="[^"]*")?/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sclass="([^"]*)"/gi, (whole, value) => {
      const kept = value.split(/\s+/).filter((c) => KEEP_CLASS.has(c));
      return kept.length ? ` class="${kept.join(" ")}"` : "";
    })
    .replace(/(<p>\s*<\/p>|<div>\s*<\/div>|<span>\s*<\/span>)/gi, "");
  out = unwrapBlockAnchors(balanceTags(out));
  // A table from the WordPress export is as wide as its content, which on a
  // 320px screen dragged the whole article — and the page with it — sideways.
  // Wrapping it lets the table scroll on its own instead.
  out = out.replace(/<table(\s|>)/gi, '<div class="table-scroll" tabindex="0" role="region" aria-label="Table, scroll to see more"><table$1')
           .replace(/<\/table>/gi, "</table></div>");
  // A CTA panel heading is not a section of the article, so it must not compete
  // with the real h2s that the contents list is built from.
  out = out.replace(/(<div class="cta-mid">[\s\S]*?)<h2>([\s\S]*?)<\/h2>/g, '$1<p class="cta-mid__title">$2</p>');
  // Empty wrappers can appear once unmatched tags are gone.
  return out.replace(/<p>\s*<\/p>|<li>\s*<\/li>/gi, "");
}

function parsePost(post) {
  const raw = post.content.rendered;
  const body = first(/<article[^>]*>([\s\S]*?)<\/article>/, raw);
  const chipLabel = first(/<span class="pill"><span class="dot"><\/span>([^<]+)<\/span>/, raw).trim();
  const category = CATEGORY[chipLabel] || FALLBACK;
  const dateText = first(/<span class="pill mono">(\d{1,2} \w+ \d{4})<\/span>/, raw);

  return {
    slug: post.slug,
    title: strip(first(/<h1[^>]*>([\s\S]*?)<\/h1>/, raw, post.title.rendered)),
    excerpt: strip(post.excerpt.rendered),
    author: strip(first(/<a class="pill mono" href="[^"]*">([^<]+)<\/a>/, raw, "Billy Carey")),
    date: isoDate(dateText) || post.date.slice(0, 10),
    dateText,
    read: Number(first(/<span class="pill mono">(\d+) min read<\/span>/, raw, "6")),
    category: category.key,
    categoryLabel: category.label,
    tone: category.tone,
    icon: category.icon,
    // Section headings become the article's on-page contents list.
    sections: [...body.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => ({ id: m[1], title: strip(m[2]) })),
    body: sanitizeBody(rewriteLinks(decode(body))).trim(),
  };
}

export const POSTS = read("wp-posts.json")
  .map(parsePost)
  .filter((p) => p.body)
  .sort((a, b) => b.date.localeCompare(a.date));

// Page content is kept for reference while the remaining templates are rebuilt.
export const WP_PAGES = read("wp-pages.json").map((p) => ({
  id: p.id,
  slug: p.slug,
  path: p.link.replace(/^https:\/\/staging\.whizzit\.co\.uk/, ""),
  title: decode(p.title.rendered),
  html: p.content.rendered,
}));

export const pageByPath = (path) => WP_PAGES.find((p) => p.path === path);

// Pulls the readable body out of a staging page: the <article> block if there is
// one, otherwise the first <div class="prose"> block.
export function prose(html) {
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  const block = article || html.match(/<div class="prose[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
  return block ? sanitizeBody(rewriteLinks(block[1])).trim() : "";
}

// "Last updated: 27 August 2026" style line from a staging page, when present.
export const lastUpdated = (html) => (html.match(/Last updated:\s*([^<]+)/)?.[1] || "").trim();
