// Reads a staging page into its sections, keeping every piece of copy, in
// order, with what kind of thing it is: paragraphs, checklists, cards, tabs,
// step lists, FAQs, quotes, figures, related articles, links. The page
// templates (sub-services, industries) decide how each kind is drawn; nothing
// here is dropped for want of a component, which is how copy went missing from
// the earlier templates (parse.mjs only knew the commoner blocks).
import { parseHtml, findAll, find, has, isEl, within, text, prose, byClass, byTag } from "./dom.mjs";
import { rewriteLinks } from "./content.mjs";

const link = (href = "") => rewriteLinks(`href="${href}"`).slice(6, -1);
const html = (n) => rewriteLinks(prose(n));

const STRUCT = ["table-wrap", "card", "feature", "checklist", "tabs", "disclose", "faq", "post", "quote", "stat", "stats", "pill", "cta-form", "split-head__aside", "section-head", "wz-cardmedia", "grid", "accred", "partnerwall"];
const inStruct = (n, stop) => within(n, (p) => p.tag === "blockquote" || p.tag === "form" || p.tag === "figure" || STRUCT.some((c) => has(p, c)), stop);

// A card holding the section's own h2 is just a frame round the section, not an item.
const isWrapper = (n) => (has(n, "card") || has(n, "feature")) && Boolean(find(n, byTag("h2")));
const transparent = (n, stop) => {
  for (let p = n.parent; p && p !== stop; p = p.parent) {
    if (!isEl(p)) continue;
    if (isWrapper(p)) continue;
    if (p.tag === "blockquote" || p.tag === "form" || p.tag === "figure" || STRUCT.some((c) => has(p, c))) return false;
  }
  return true;
};

const titleOf = (n) => text(find(n, (c) => /^h[2-4]$/.test(c.tag) || has(c, "h-display-2") || has(c, "h-display-3")));

function checklistItems(ul) {
  return findAll(ul, byTag("li")).map((li) => text(find(li, byClass("t")) || li)).filter(Boolean);
}

function parseCard(card) {
  const title = text(find(card, (c) => c.tag === "h3" || has(c, "h-display-3")));
  const num = text(find(card, (c) => has(c, "feature__topno") || has(c, "feature__no")));
  const a = find(card, (c) => c.tag === "a" && (has(c, "feature__link") || has(c, "textlink")) && !within(c, byTag("p"), card));
  const body = { ...card, children: card.children.filter((c) => !(isEl(c) && (c.tag === "h3" || has(c, "h-display-3") || has(c, "feature__topno") || has(c, "feature__no") || has(c, "feature__icon") || has(c, "feature__link")))) };
  const textHtml = html(body);
  // A card is often the link itself (<a class="card feature" href="…">), with
  // "Learn more" as a plain span inside it.
  const whole = card.tag === "a" && card.attrs?.href && !/^(#|)$/.test(card.attrs.href) ? card : null;
  const target = a || whole;
  return { num, title, html: textHtml, link: target ? { label: text(a || find(card, (c) => has(c, "feature__link")) || card), href: link(target.attrs.href) } : null };
}

/** The generic content of one section, in document order. */
function parseContent(sec) {
  const out = { eyebrow: "", title: "", lead: "", flow: [], lists: [], cards: [], tabs: [], steps: [], quotes: [], stats: [], tables: [], links: [], pills: [], image: null, notes: [] };
  out.eyebrow = text(find(sec, byClass("eyebrow")));
  out.title = text(find(sec, byTag("h2")));
  const head = find(sec, (n) => has(n, "split-head__aside") || (has(n, "section-head") && find(n, byTag("p"))));
  if (head) out.lead = text(has(head, "split-head__aside") ? head : find(head, byTag("p")));

  // Paragraphs and plain lists that read as prose.
  for (const n of findAll(sec, (c) => c.tag === "p" || c.tag === "ul" || c.tag === "ol")) {
    if (!transparent(n, sec)) continue;
    if (within(n, (p) => p.tag === "p" || p.tag === "ul" || p.tag === "ol", sec)) continue;
    if (has(n, "checklist") || has(n, "mono")) continue;
    if (has(n, "muted")) { const t = text(n); if (t) out.notes.push(t); continue; }
    const h = n.tag === "p" ? `<p>${html(n)}</p>` : `<${n.tag}>${html(n)}</${n.tag}>`;
    if (text(n)) out.flow.push(h);
  }

  // Checklists, labelled by the mono line or heading in their card.
  for (const ul of findAll(sec, byClass("checklist"))) {
    const box = within(ul, (p) => has(p, "card"), sec) || ul.parent;
    const labelNode = find(box, (c) => (has(c, "mono") && c.tag === "p") || c.tag === "h3");
    out.lists.push({ label: text(labelNode), items: checklistItems(ul) });
  }

  // Cards (items, not frames): a heading and some words.
  for (const c of findAll(sec, (n) => (has(n, "card") || has(n, "feature")) && !isWrapper(n))) {
    if (within(c, (p) => (has(p, "card") || has(p, "feature")) && !isWrapper(p), sec)) continue;
    if (find(c, byClass("checklist")) || has(c, "cta-form")) continue;
    const card = parseCard(c);
    if (card.title) out.cards.push(card);
  }

  // Tabs.
  for (const t of findAll(sec, byClass("tabs"))) {
    const labels = findAll(t, byClass("tabs__tab")).map(text);
    const panels = findAll(t, byClass("tabs__panel")).map(html);
    labels.forEach((label, i) => panels[i] && out.tabs.push({ label, html: panels[i] }));
  }

  // Step and accordion lists.
  for (const item of findAll(sec, byClass("disclose__item"))) {
    const no = text(find(item, byClass("disclose__no")));
    const label = find(item, byClass("disclose__label"));
    const q = text({ ...label, children: (label?.children || []).filter((c) => !has(c, "disclose__no")) });
    const a = html(find(item, byClass("disclose__a-inner")) || { children: [] });
    if (q) out.steps.push({ no, q, a: /^<(p|ul|ol)/.test(a) ? a : `<p>${a}</p>` });
  }

  // Quotes.
  for (const bq of findAll(sec, byTag("blockquote"))) {
    const fig = bq.parent;
    const cite = find(fig, (c) => c.tag === "cite" || c.tag === "figcaption");
    const by = text(find(cite || fig, (c) => c.tag === "b" || c.tag === "strong"));
    const role = text(find(cite || fig, byTag("small"))) || text(cite).replace(by, "").replace(/^[,\s]+|·.*$/g, "").trim();
    out.quotes.push({ text: text(bq), by, role });
  }

  // Figures.
  for (const num of findAll(sec, (c) => has(c, "stat__num"))) {
    const box = num.parent;
    const label = text(find(box, (c) => has(c, "stat__label") || (c.tag === "p" && has(c, "mono"))));
    const note = text(find(box, byClass("stat__note")));
    out.stats.push({ value: text(num).replace(/\s*★/, "★"), label, note });
  }

  // Comparison tables: caption, column heads, and rows (first cell is the row head).
  for (const t of findAll(sec, byTag("table"))) {
    out.tables.push({
      caption: text(find(t, byTag("caption"))),
      head: findAll(find(t, byTag("thead")) || { children: [] }, byTag("th")).map(text),
      rows: findAll(find(t, byTag("tbody")) || t, byTag("tr")).map((tr) => tr.children.filter((c) => isEl(c) && (c.tag === "th" || c.tag === "td")).map((c) => text(c))).filter((r) => r.length),
    });
  }

  for (const a of findAll(sec, (c) => c.tag === "a" && has(c, "textlink"))) {
    if (!transparent(a, sec) || within(a, (p) => p.tag === "p", sec)) continue;
    out.links.push({ label: text(a), href: link(a.attrs.href) });
  }
  out.pills = findAll(sec, byClass("pill")).filter((p) => !within(p, byClass("post__cover"), sec)).map(text).filter(Boolean);
  const img = find(sec, (c) => c.tag === "img" && within(c, byClass("wz-cardmedia"), sec));
  if (img) out.image = { src: img.attrs.src || "", alt: img.attrs.alt || "" };
  return out;
}

export function parseSections(pageHtml) {
  const root = parseHtml(pageHtml.replace(/<!--[\s\S]*?-->/g, ""));
  const hero = { eyebrow: "", title: "", lead: "", pills: [] };
  const sections = [];
  for (const sec of findAll(root, byTag("section"))) {
    if (within(sec, byTag("section"))) continue;
    if (has(sec, "page-hero")) {
      const split = find(sec, byClass("hero-split")) || sec;
      const copy = split.children.find((c) => isEl(c) && find(c, byTag("h1"))) || split;
      hero.eyebrow = text(find(copy, byClass("eyebrow")));
      hero.title = text(find(copy, byTag("h1")));
      hero.lead = text(find(copy, (c) => c.tag === "p" && !within(c, (p) => p.tag === "form" || has(p, "card"), copy)));
      hero.pills = findAll(copy, byClass("pill")).map(text);
      continue;
    }
    if (has(sec, "trustbar") || find(sec, byClass("trustbar"))) continue;
    const base = { eyebrow: text(find(sec, byClass("eyebrow"))), title: text(find(sec, byTag("h2"))) || titleOf(sec) };
    if (find(sec, byClass("accred"))) {
      const note = find(sec, (c) => c.tag === "p" && has(c, "muted"));
      sections.push({ kind: "credentials", ...base, note: note ? html(note) : "" });
      continue;
    }
    if (find(sec, byClass("partnerwall"))) { sections.push({ kind: "partners", ...base, lead: text(find(sec, (c) => c.tag === "p" && !has(c, "mono"))) }); continue; }
    if (find(sec, byClass("cta-band")) || find(sec, byClass("cta-mid"))) {
      const box = find(sec, (c) => has(c, "cta-band") || has(c, "cta-mid"));
      const copy = find(box, (c) => has(c, "cta-band__text")) || find(box, (c) => isEl(c) && find(c, byClass("eyebrow"))) || box;
      const quote = find(box, byTag("blockquote"));
      const cite = quote && find(quote.parent, (c) => c.tag === "cite" || c.tag === "figcaption");
      sections.push({
        kind: has(box, "cta-band") ? "ctaBand" : "ctaMid",
        eyebrow: text(find(copy, byClass("eyebrow"))),
        title: text(find(copy, (c) => c.tag === "h2" || has(c, "h-display-2"))),
        text: text(find(copy, (c) => c.tag === "p" && !within(c, (p) => p.tag === "form" || p.tag === "blockquote", copy) && !has(c, "mono"))),
        quote: quote ? (() => {
          const by = text(find(cite, (c) => c.tag === "b" || c.tag === "strong"));
          const role = text(cite).replace(by, "").replace(/·.*$/, "").replace(/^[,\s]+|[,\s]+$/g, "");
          return { text: text(quote), by, role };
        })() : null,
      });
      continue;
    }
    if (find(sec, byClass("faq__item"))) {
      const items = findAll(sec, byClass("faq__item")).map((it) => {
        const q = text({ ...find(it, byClass("faq__q")), children: (find(it, byClass("faq__q"))?.children || []).filter((c) => !has(c, "faq__icon")) });
        const a = html(find(it, byClass("faq__a-inner")) || { children: [] });
        return { q, a: /^<(p|ul|ol)/.test(a) ? a : `<p>${a}</p>` };
      }).filter((f) => f.q);
      sections.push({ kind: "faq", ...base, items });
      continue;
    }
    if (find(sec, byClass("post"))) {
      const posts = findAll(sec, (c) => c.tag === "a" && has(c, "post")).map((a) => ({ href: link(a.attrs.href), title: text(find(a, byTag("h3"))), cat: text(find(a, byClass("post__cat"))) }));
      sections.push({ kind: "posts", ...base, posts });
      continue;
    }
    const content = parseContent(sec);
    const hasBody = content.flow.length || content.lists.length || content.cards.length || content.tabs.length || content.steps.length || content.quotes.length || content.stats.length || content.tables.length;
    if (!content.title && !hasBody) {
      const note = text(sec);
      if (note) sections.push({ kind: "note", text: note, html: html(sec) });
      continue;
    }
    sections.push({ kind: "content", ...content });
  }
  return { hero, sections };
}
