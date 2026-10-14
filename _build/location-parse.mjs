// Reads a location page from the staging export into named parts, by what each
// staging section is rather than where it sits: the intro with its remote and
// onsite cards, the local detail, the "why" feature cards, the FAQ and so on.
// The generic parser (parse.mjs) misses the feature cards (their titles are
// not h3s), the stats and the FAQ (faq__item, not disclose__item), which left
// the old location pages with headings over a single line of text.
import { text, clean } from "./parse.mjs";

const all = (re, s) => [...s.matchAll(re)];
const one = (re, s, group = 1) => s.match(re)?.[group] ?? "";

const paras = (chunk) =>
  all(/<p(?=[\s>])([^>]*)>([\s\S]*?)<\/p>/g, chunk)
    .filter((m) => !/class="(?:muted|stat__|mono)/.test(m[1]))
    .map((m) => clean(m[2]))
    .filter((p) => p && text(p).length > 30);

// The lead beside or under a section's heading.
const aside = (chunk) =>
  text(one(/<div class="split-head__aside[^"]*"[^>]*>([\s\S]*?)<\/div>/, chunk)) ||
  text(one(/<div class="section-head[^"]*">[\s\S]*?<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/, chunk));

const cards = (chunk) =>
  all(/<article[^>]*class="card[^"]*"[^>]*>([\s\S]*?)<\/article>/g, chunk)
    .map((m) => ({
      title: text(one(/<(?:h3|div class="h-display-\d")[^>]*>([\s\S]*?)<\/(?:h3|div)>/, m[1])),
      text: text(one(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/, m[1])),
    }))
    .filter((c) => c.title && c.text);

const disclose = (chunk) =>
  chunk.split('class="disclose__item"').slice(1).map((part) => ({
    q: text(one(/<span class="disclose__no">[\s\S]*?<\/span>\s*<span>([\s\S]*?)<\/span>/, part) || one(/<span class="disclose__label">([\s\S]*?)<\/span>/, part)),
    a: clean(one(/<div class="disclose__a-inner">([\s\S]*?)<\/div>\s*<\/div>/, part)),
  })).filter((f) => f.q && f.a);

const faq = (chunk) =>
  chunk.split('class="faq__item"').slice(1).map((part) => {
    const a = clean(one(/<div class="faq__a-inner">([\s\S]*?)<\/div>\s*<\/div>/, part));
    return { q: text(one(/<button class="faq__q"[^>]*>([\s\S]*?)<span class="faq__icon/, part)), a: /^<(p|ul|ol)/.test(a) ? a : `<p>${a}</p>` };
  }).filter((f) => f.q && f.a !== "<p></p>");

// Every checklist in the section: long lists are split into two columns.
const checklist = (chunk) =>
  all(/<ul class="checklist[^>]*>([\s\S]*?)<\/ul>/g, chunk)
    .flatMap((ul) => all(/<li[^>]*>([\s\S]*?)<\/li>/g, ul[1]).map((m) => text(m[1])))
    .filter(Boolean);

const stats = (chunk) =>
  chunk.split(/class="stat(?=[\s"])/).slice(1)
    .map((part) => ({ value: text(one(/<div class="stat__num">([\s\S]*?)<\/div>/, part)).replace(/\s*★/, "★"), label: text(one(/<div class="stat__label">([\s\S]*?)<\/div>/, part)) }))
    .filter((s) => s.value && s.label);

// The prose column of a feature-split, without the cards or photo beside it.
const column = (chunk) => one(/<div class="reveal-x">([\s\S]*?)(?:<div class="(?:grid|stats|steps|card|cta-form)|<figure|<form|<article)/, chunk) || chunk;

const rows = (chunk) =>
  all(/<tr>\s*<th scope="row">([\s\S]*?)<\/th>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g, chunk)
    .map((m) => ({ situation: text(m[1]), what: text(m[2]), when: text(m[3]) }));

export function parseLocation(html) {
  const body = html.replace(/<!--[\s\S]*?-->/g, "");
  const out = { title: "", lead: "" };

  for (const part of body.split(/<section/).slice(1)) {
    const attrs = one(/^([^>]*)>/, part);
    const chunk = part.replace(/^[^>]*>/, "").split("</section>")[0];

    if (/page-hero/.test(attrs)) {
      const hero = one(/<div class="hero-split">([\s\S]*?)<div class="reveal-x/, chunk) || chunk;
      out.title = text(one(/<h1[^>]*>([\s\S]*?)<\/h1>/, hero));
      out.lead = text(one(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/, hero));
      continue;
    }
    const title = text(one(/<h2[^>]*>([\s\S]*?)<\/h2>/, chunk)).replace(/,(?=\S)/g, ", ");
    if (!title) continue;
    const head = { eyebrow: text(one(/<span class="eyebrow[^"]*"[^>]*>([\s\S]*?)<\/span>/, chunk)), title };

    if (/class="accred/.test(chunk)) out.credentials = { ...head, lead: aside(chunk) };
    else if (/partnerwall/.test(chunk)) out.partners = { ...head, lead: paras(chunk)[0] || "" };
    else if (/class="faq"|class="faq /.test(chunk)) out.faq = { ...head, items: faq(chunk) };
    else if (/<table/.test(chunk)) out.commitments = { ...head, lead: aside(chunk), rows: rows(chunk) };
    else if (/class="steps/.test(chunk)) out.switching = { ...head, text: paras(column(chunk)), items: disclose(chunk) };
    else if (/disclose__item/.test(chunk)) out.detail = { ...head, lead: aside(chunk), items: disclose(chunk) };
    else if (/feature__topno/.test(chunk)) out.services = { ...head, lead: aside(chunk) };
    else if (/class="stats/.test(chunk) && !/feature-split/.test(chunk)) out.stats = { ...head, items: stats(chunk) };
    else if (/checklist/.test(chunk) && /What.s included|What&#8217;s included/.test(chunk)) out.included = { ...head, lead: aside(chunk), items: checklist(chunk) };
    else if (/checklist/.test(chunk)) out.expertise = { ...head, text: paras(column(chunk)), items: checklist(chunk) };
    else if (/cardgrid/.test(chunk) && /split-head/.test(chunk)) out.why = { ...head, lead: aside(chunk), cards: cards(chunk) };
    else if (/cardgrid/.test(chunk)) out.modes = { ...head, cards: cards(chunk) };
    else if (/feature-split/.test(chunk) && !out.intro) {
      out.intro = { ...head, text: paras(column(chunk)), cards: cards(chunk) };
      if (/class="stats/.test(chunk)) out.introStats = stats(chunk);
    } else if (/feature-split/.test(chunk)) out.story = { ...head, text: paras(chunk.split(/<form/)[0]) };
    else out.region = { ...head, text: paras(chunk) };
  }
  return out;
}
