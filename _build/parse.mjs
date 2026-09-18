// Turns a staging page's markup into a structured model the new templates render.
// The old theme uses a consistent set of blocks (page-hero, feature-split, tabs,
// disclose, cardgrid, section-head), so each one maps cleanly onto our components.
import { rewriteLinks, sanitizeBody, dropElement } from "./content.mjs";

const decode = (s) =>
  String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');

export const text = (html = "") => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// Keeps inline prose markup (p, ul, ol, strong, em, a) and drops theme classes,
// SVG decoration and animation hooks.
export function clean(html = "") {
  return sanitizeBody(rewriteLinks(
    decode(html)
      .replace(/<svg[\s\S]*?<\/svg>/g, "")
      .replace(/<(script|style|canvas|form|button|input|textarea|label)[\s\S]*?<\/\1>/g, "")
      .replace(/\sclass="[^"]*"/g, "")
      .replace(/\sdata-[\w-]+(="[^"]*")?/g, "")
      .replace(/\sstyle="[^"]*"/g, "")
      .replace(/<div>|<\/div>|<span>|<\/span>/g, "")
      .replace(/\s+/g, " ")
  )).trim();
}

const all = (re, s) => [...s.matchAll(re)];
const one = (re, s, group = 1) => s.match(re)?.[group] ?? "";

/* ---------- Hero ---------- */
function parseHero(html) {
  const hero = one(/<section class="page-hero"[\s\S]*?<div class="hero-split">([\s\S]*?)<div class="reveal-x/, html) ||
    one(/<section class="page-hero"([\s\S]*?)<\/section>/, html);
  const title = text(one(/<h1[^>]*>([\s\S]*?)<\/h1>/, hero));
  const leadParas = paragraphs(hero).map((m) => text(m[1])).filter(Boolean);
  return {
    eyebrow: text(one(/<span class="eyebrow[^"]*"[^>]*>([\s\S]*?)<\/span>/, hero)),
    title,
    lead: leadParas[0] || "",
    extra: leadParas.slice(1),
  };
}

// `<p[^>]*>` also matches `<path …>` inside an SVG, which drags SVG innards and
// whole card grids into the prose. The lookahead keeps it to real paragraphs.
const PARA = /<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/g;
const paragraphs = (chunk) => all(PARA, chunk);

/* ---------- Block parsers ---------- */
const checklist = (chunk) =>
  all(/<li[^>]*>([\s\S]*?)<\/li>/g, one(/<ul class="checklist"[^>]*>([\s\S]*?)<\/ul>/, chunk)).map((m) => text(m[1])).filter(Boolean);

// The heading that sits directly above the checklist, e.g. "What's included" or
// "Without a plan" — used as the card title instead of a hard-coded label.
const checklistTitle = (chunk) => {
  const before = chunk.split(/<ul class="checklist"/)[0];
  const heads = [...before.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)];
  return heads.length ? text(heads[heads.length - 1][1]) : "";
};

const cards = (chunk) =>
  all(/<article[^>]*class="card[^"]*"[^>]*>([\s\S]*?)<\/article>/g, chunk)
    .map((m) => {
      const title = text(one(/<h3[^>]*>([\s\S]*?)<\/h3>/, m[1]));
      let body = text(one(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/, m[1]));
      if (title && body.startsWith(title)) body = body.slice(title.length).trim();
      return { title, text: body };
    })
    .filter((c) => c.title);

const faqItems = (chunk) =>
  chunk
    .split('class="disclose__item"')
    .slice(1)
    .map((part) => ({
      q: text(one(/<span>([\s\S]*?)<\/span>\s*<\/span>/, part) || one(/<span class="disclose__label">([\s\S]*?)<\/span>/, part)),
      a: clean(one(/<div class="disclose__a-inner">([\s\S]*?)<\/div>\s*<\/div>/, part)),
    }))
    .filter((f) => f.q && f.a);

const tabs = (chunk) => {
  const labels = all(/<button[^>]*class="tabs__tab[^"]*"[^>]*>([\s\S]*?)<\/button>/g, chunk).map((m) => text(m[1]));
  const panels = all(/<div class="tabs__panel[^"]*"[^>]*>([\s\S]*?)<\/div>/g, chunk).map((m) => clean(m[1]));
  return labels.map((label, i) => ({ label, html: panels[i] || "" })).filter((t) => t.label && t.html);
};

// Prose inside a feature-split column. Cards, tabs, accordions, checklists and
// quotes are rendered by their own components, so they are removed here first —
// otherwise their copy appears twice, once as prose and once in the component.
function prosePart(chunk) {
  let body = one(/<div class="reveal-x">([\s\S]*?)(?:<a class="textlink|<a class="card|<a href="[^"]*" class="card|<div class="card|<div class="cardgrid|<div class="tabs|<ul class="checklist|$)/, chunk) || chunk;
  body = dropElement(body, "article", 'class="card');
  body = dropElement(body, "div", 'class="cardgrid');
  body = dropElement(body, "div", 'class="tabs');
  body = dropElement(body, "div", 'class="disclose');
  body = dropElement(body, "ul", 'class="checklist');
  body = dropElement(body, "blockquote");
  body = dropElement(body, "figure");

  // Keep paragraphs and lists in document order so list items stay in their list.
  const parts = [...body.matchAll(/<(p|ul|ol)(?=[\s>])[\s\S]*?<\/\1>/g)].map((m) => clean(m[0])).filter(Boolean);

  return {
    eyebrow: text(one(/<span class="eyebrow[^"]*"[^>]*>([\s\S]*?)<\/span>/, body)),
    title: text(one(/<h2[^>]*>([\s\S]*?)<\/h2>/, body)),
    html: parts.join(""),
  };
}

/* ---------- Page model ---------- */
export function parsePage(html) {
  const body = html.replace(/<!--[\s\S]*?-->/g, "");
  const hero = parseHero(body);
  const blocks = [];

  // Sections are split on the opening tag, so nested markup inside one section
  // stays with it instead of ending the match early.
  const parts = body.split(/<section/).slice(1);
  for (const part of parts) {
    const attrs = one(/^([^>]*)>/, part);
    const chunk = part.replace(/^[^>]*>/, "").split("</section>")[0];
    if (/page-hero/.test(attrs) || chunk.includes("trustbar__inner")) continue;

    if (/Request a callback|Send us a message/.test(chunk) && !/<h2/.test(chunk)) continue;
    const faq = faqItems(chunk);
    const grid = cards(chunk);
    const list = checklist(chunk);
    const tabSet = tabs(chunk);
    const head = prosePart(chunk);
    const centreTitle = text(one(/<div class="section-head center">[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/, chunk));
    const centreLead = text(one(/<div class="section-head center">[\s\S]*?<h2[^>]*>[\s\S]*?<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/, chunk));
    const splitTitle = text(one(/<div class="split-head">[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/, chunk));
    const splitAside = text(one(/<div class="split-head__aside[^"]*"[^>]*>([\s\S]*?)<\/div>/, chunk));

    const title = head.title || centreTitle || splitTitle;
    const hasBody = head.html || list.length || grid.length || tabSet.length || faq.length;
    if (!title || !hasBody) continue;

    blocks.push({
      listTitle: checklistTitle(chunk),
      eyebrow: head.eyebrow,
      title,
      lead: centreLead || splitAside || "",
      html: head.html,
      list,
      cards: grid,
      tabs: tabSet,
      faq,
    });
  }

  return { ...hero, blocks };
}

// Case studies and location pages carry a stats strip: "9 min", "100%" and so on.
export function parseStats(html) {
  return all(/<div class="stat[^"]*">([\s\S]*?)<\/div>/g, html)
    .map((m) => ({ value: text(one(/<strong[^>]*>([\s\S]*?)<\/strong>/, m[1])), label: text(one(/<span[^>]*>([\s\S]*?)<\/span>/, m[1])) }))
    .filter((s) => s.value && s.label);
}
