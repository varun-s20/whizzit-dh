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

/**
 * Plain text of a fragment. Inline tags close up without a space, so
 * "<a>London</a>, and" reads "London, and"; block tags become a space.
 */
export const plainText = (s = "") =>
  String(s).replace(/<\/?(a|abbr|b|code|em|i|mark|small|span|strong|sub|sup|u)\b[^>]*>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const strip = (s) => decode(plainText(s)).trim();
const first = (re, s, fallback = "") => (s.match(re)?.[1] ?? fallback);

// Staging links become local page links: "/cyber-security/email-security-services/" → "@/cyber-security/email-security-services.html"
// A few staging links point at paths that live elsewhere in the static build.
const ALIASES = {
  "it-support-london": "locations/it-support-london",
  // The industry pages moved under /industries/.
  "managed-it-services-for-business-services-organisations": "industries/managed-it-services-for-business-services-organisations",
  "it-support-construction": "industries/it-support-construction",
  "it-support-healthcare": "industries/it-support-healthcare",
  "managed-it-services-for-financial-services-business": "industries/managed-it-services-for-financial-services-business",
  "managed-it-services-for-legal-firms": "industries/managed-it-services-for-legal-firms",
  "managed-it-services-for-education-organisations": "industries/managed-it-services-for-education-organisations",
  "managed-it-services-for-manufacturing-businesses": "industries/managed-it-services-for-manufacturing-businesses",
  "managed-it-services-for-insurance-services-businesses": "industries/managed-it-services-for-insurance-services-businesses",

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
export function dropElement(html, tag, marker, replace = () => "") {
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
    const swap = replace(out.slice(match.index, end));
    out = out.slice(0, match.index) + swap + out.slice(end);
    open.lastIndex = match.index + swap.length;
  }
  return out;
}

// Staging's mid-article enquiry box ("Straight answers / Prefer to talk it
// through?", a review and a message form) becomes [whizzit_enquiry], so the
// article text stays editable; enquiryBox() in lib.mjs (and the shortcode in
// whizzit-core) draws it in the new design with a live form.
function enquiryShortcode(el) {
  const text = (re) => strip((el.match(re) || [])[1] || "").replace(/"/g, "”").replace(/[[\]]/g, "");
  const atts = {
    eyebrow: text(/<span class="eyebrow"[^>]*>([\s\S]*?)<\/span>/),
    // The heading is an <h2> in most posts and a div.h-display-2 in one.
    title: text(/<(?:h2|div class="h-display-2")[^>]*>([\s\S]*?)<\/(?:h2|div)>/),
    text: text(/<\/(?:h2|div)>\s*<p[^>]*>([\s\S]*?)<\/p>/),
    quote: text(/<blockquote[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/blockquote>/),
    by: text(/<cite><b>([\s\S]*?)<\/b>/),
    role: text(/<cite><b>[\s\S]*?<\/b>,\s*([^<·]*?)\s*·/),
  };
  return `[whizzit_enquiry ${Object.entries(atts).map(([k, v]) => `${k}="${v}"`).join(" ")}]`;
}

export function sanitizeBody(html) {
  let out = html;
  out = dropElement(out, "div", "cta-mid--form", enquiryShortcode);
  out = dropElement(out, "form");
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
    // The whole staging page: the author box, FAQ and closing call to action
    // after the body are read from it (pages/articles.mjs).
    html: raw,
  };
}

// The blog listing exactly as staging's /blog/ page shows it (its theme hard-codes
// the cards): card titles and excerpts differ from the articles', there are four
// listing categories, and one card points at a page rather than a post. Captured
// in _source/staging-blog-cards.json. Articles keep their own title and chip.
const LISTING_CAT = {
  "managed-it": CATEGORY["Managed IT"],
  cyber: CATEGORY["Cyber Security"],
  cloud: CATEGORY.Cloud,
  networks: { ...CATEGORY.Network, label: "Networks" },
};
const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const cardDate = (d) => {
  const [day, mon, year] = d.split(" ");
  return `${year}-${String(SHORT_MONTHS.indexOf(mon) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
};
export const BLOG_LISTING = read("staging-blog-cards.json").map((c) => {
  const cat = LISTING_CAT[c.cat];
  const slug = (c.href.match(/^\/blog\/([^/]+)\/$/) || [])[1] || null;
  return {
    slug,
    href: slug ? `blog/${slug}.html` : c.href.replace(/^\/(.+)\/$/, "$1.html"),
    title: c.title,
    excerpt: c.excerpt,
    date: cardDate(c.date),
    category: cat.key,
    categoryLabel: cat.label,
    tone: cat.tone,
    icon: cat.icon,
  };
});
// In staging's filter order.
export const LISTING_CATEGORIES = Object.values(LISTING_CAT).map(({ key, label, tone, icon }) => ({ key, label, tone, icon }));

const RELATED = read("staging-related.json");
const order = new Map(BLOG_LISTING.filter((c) => c.slug).map((c, i) => [c.slug, i]));
export const POSTS = read("wp-posts.json")
  .map(parsePost)
  .filter((p) => p.body)
  // Staging's own "Related articles" picks (_source/staging-related.json).
  .map((p) => ({ ...p, card: BLOG_LISTING.find((c) => c.slug === p.slug), related: RELATED[p.slug] || null }))
  // Staging's order; any post it does not list goes first, newest first.
  .sort((a, b) => (order.get(a.slug) ?? -1) - (order.get(b.slug) ?? -1) || b.date.localeCompare(a.date));

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
