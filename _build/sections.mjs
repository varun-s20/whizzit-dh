// The section renderers shared by the sub-service pages, the five service
// pages and the industry pages: each draws one kind of staging content
// (section-parse.mjs) with its exact copy. See pages/sub-services.mjs for the
// list of kinds.
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  btn, icon, photo, stockPhoto, credBadges, reviewAvatar, stars,
  SITE, PHOTOS, STOCK, PARTNERS, CREDENTIALS, CLIENTS, TESTIMONIALS, BLOG_LISTING, CATEGORY_PHOTO, SVC_PHOTO,
} from "./lib.mjs";

export const pad = (n) => String(n).padStart(2, "0");
export const slugOf = (href) => href.split("/").pop().replace(/\.html$/, "");
const PHOTO_DIR = join(import.meta.dirname, "..", "assets", "images", "photos");

// Second photographs for each family, used beside prose sections.
export const POOL = {
  support: [PHOTOS.headset, PHOTOS.serviceDesk, PHOTOS.office, PHOTOS.team],
  cloud: [STOCK.cloudRacks, PHOTOS.serviceDesk, STOCK.serverRoom, PHOTOS.office],
  cyber: [STOCK.cyber, PHOTOS.serviceDesk, STOCK.engineer, PHOTOS.headset],
  network: [PHOTOS.network, STOCK.serverRoom, STOCK.engineer, PHOTOS.van],
  projects: [PHOTOS.team, STOCK.meeting, PHOTOS.office, STOCK.team],
};
// Covers for related articles after the first (which uses its category's photo).
const READING_PHOTOS = [STOCK.office, STOCK.meeting, STOCK.supportDesk, STOCK.engineer, STOCK.serverRoom];
export const anyPhoto = (p, o) => (p.widths ? photo(p, o) : stockPhoto(p, o));

// The page's own photograph (SVC_PHOTO, assets/images/photos/svc-<slug>-<w>.webp).
function ownPhoto(slug, tone, o) {
  const meta = SVC_PHOTO[slug];
  if (!meta || !existsSync(join(PHOTO_DIR, `svc-${slug}-1024.webp`))) return anyPhoto(POOL[tone][0], o);
  const set = [640, 1024, 1600].map((w) => `@/assets/images/photos/svc-${slug}-${w}.webp ${w}w`).join(", ");
  return `<figure class="media ratio-${o.ratio || "4-5"} ${o.cls || ""}">
    <img src="@/assets/images/photos/svc-${slug}-1024.webp" srcset="${set}" sizes="${o.sizes || "(min-width: 1024px) 45vw, 100vw"}" alt="${meta.alt}" width="1024" height="683" loading="${o.loading || "lazy"}" decoding="async">
  </figure>`;
}

const head = (s, id, { center = false } = {}) => `
    <div class="sv-head${center ? " sv-head--center" : ""}">
      ${s.eyebrow ? `<p class="eyebrow">${s.eyebrow}</p>` : ""}
      ${s.title ? `<h2 class="grad-head" id="${id}">${s.title}</h2>` : ""}
      ${s.lead ? `<p class="sv-head__lead">${s.lead}</p>` : ""}
    </div>`;
const flow = (s) => s.flow.join("");
const links = (s) => s.links.map((l) => `<a class="text-link" href="${l.href}"><span>${l.label}</span>${icon("arrow")}</a>`).join("");
const ticks = (items) => `<ul class="sv-ticks" role="list">${items.map((i) => `<li>${icon("check")}<span>${i}</span></li>`).join("")}</ul>`;
const notes = (s) => s.notes.map((n) => `<p class="sv-note">${n}</p>`).join("");

/* ---------- Section renderers ---------- */
/* ---------- The case study ----------
   An open story, two columns at most and no box: the title (and facts or a
   photograph) on the left, held in place; the chapters down the right on a
   vertical line, each with its label; the results last, as a list of large
   figures. Used by the sub-service pages and the customer case studies. */
export function caseLayout({ id, eyebrow = "", title = "", chapters = [], stats = [], photo = "", facts = [] }) {
  return `
<section class="section cs" aria-labelledby="${id}">
  <div class="container cs__grid">
    <div class="cs__aside">
      ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
      <h2 class="cs__title" id="${id}">${title}</h2>
      ${facts.length ? `<dl class="cs__facts">${facts.map((f) => `<div><dt>${f.label}</dt><dd>${f.value}</dd></div>`).join("")}</dl>` : ""}
      ${photo}
    </div>
    <div class="cs__main">
      <ol class="cs__chapters" role="list">
        ${chapters.map((c, i) => `
        <li class="cs__chapter">
          <span class="cs__n" aria-hidden="true">${pad(i + 1)}</span>
          ${c.label ? `<p class="cs__label">${c.label}</p>` : ""}
          ${c.title ? `<h3 class="cs__chapter-title">${c.title}</h3>` : ""}
          <div class="cs__text">${c.html}</div>
        </li>`).join("")}
      </ol>
      ${stats.length ? `
      <dl class="cs__results">
        ${stats.map((st) => `<div><dd>${st.value}</dd><dt>${st.label}</dt></div>`).join("")}
      </dl>` : ""}
    </div>
  </div>
</section>`;
}

export const R = {
  overview(s, id, ctx) {
    const list = s.lists[0];
    return `
<section class="section sv-overview" aria-labelledby="${id}">
  <div class="container sv-overview__grid">
    <div class="sv-overview__copy">
      ${head(s, id)}
      <div class="sv-prose sv-prose--lede">${flow(s)}</div>
      ${notes(s)}
      ${s.links.length ? `<p class="sv-links">${links(s)}</p>` : ""}
    </div>
    <div class="sv-overview__media">
      ${ownPhoto(ctx.slug, ctx.tone, { cls: "sv-overview__photo", ratio: "4-5", loading: "eager" })}
      <p class="sv-overview__tag"><span class="sv-overview__tag-icon" aria-hidden="true">${icon(ctx.parent.icon)}</span><span>${ctx.parent.title}<strong>${ctx.child.title}</strong></span></p>
    </div>
  </div>
  ${list ? `
  <div class="container">
    <div class="sv-included">
      <p class="sv-included__label">${list.label || "What’s included"}</p>
      ${ticks(list.items)}
    </div>
  </div>` : ""}
</section>`;
  },

  tabs(s, id, ctx) {
    const key = `${ctx.slug}-${ctx.n}`;
    return `
<section class="section sv-tabs" aria-labelledby="${id}">
  <div class="container sv-split">
    <div>
      ${head(s, id)}
      <div class="sv-prose">${flow(s)}</div>
      ${s.lists.map((l) => `<div class="sv-list">${l.label ? `<p class="sv-list__label">${l.label}</p>` : ""}${ticks(l.items)}</div>`).join("")}
      ${s.links.length ? `<p class="sv-links">${links(s)}</p>` : ""}
    </div>
    <div class="sv-tabpanel" data-tabs>
      <div class="sv-tabpanel__list pill-tabs" role="tablist" aria-label="${s.title}">
        ${s.tabs.map((t, i) => `<button class="tabs__tab" type="button" role="tab" id="tab-${key}-${i}" aria-controls="panel-${key}-${i}" aria-selected="${i === 0}">${t.label}</button>`).join("")}
      </div>
      ${s.tabs.map((t, i) => `<div class="tabs__panel sv-tabpanel__panel" role="tabpanel" id="panel-${key}-${i}" aria-labelledby="tab-${key}-${i}" tabindex="0"${i ? " hidden" : ""}><p class="sv-tabpanel__n">${pad(i + 1)} / ${pad(s.tabs.length)}</p>${t.html}</div>`).join("")}
    </div>
  </div>
</section>`;
  },

  steps(s, id) {
    return `
<section class="section sv-steps" aria-labelledby="${id}">
  <div class="container sv-split sv-split--steps">
    <div class="sv-steps__aside">
      ${head(s, id)}
      <div class="sv-prose">${flow(s)}</div>
      ${s.lists.map((l) => `<div class="sv-list">${l.label ? `<p class="sv-list__label">${l.label}</p>` : ""}${ticks(l.items)}</div>`).join("")}
      ${s.links.length ? `<p class="sv-links">${links(s)}</p>` : ""}
    </div>
    <ol class="sv-path" role="list">
      ${s.steps.map((st, i) => `
      <li class="sv-path__step">
        <span class="sv-path__n" aria-hidden="true">${st.no || pad(i + 1)}</span>
        <h3>${st.q}</h3>
        <div class="sv-path__a">${st.a}</div>
      </li>`).join("")}
    </ol>
  </div>
</section>`;
  },

  compare(s, id) {
    const [a, b] = s.lists;
    return `
<section class="section sv-compare" aria-labelledby="${id}">
  <div class="container">
    ${head(s, id, { center: true })}
    ${s.flow.length ? `<div class="sv-prose sv-prose--center">${flow(s)}</div>` : ""}
    <div class="sv-compare__grid">
      <div class="sv-compare__col sv-compare__col--before">
        <p class="sv-compare__label">${a.label}</p>
        <ul role="list">${a.items.map((i) => `<li>${icon("close")}<span>${i}</span></li>`).join("")}</ul>
      </div>
      <span class="sv-compare__arrow" aria-hidden="true">${icon("arrow")}</span>
      <div class="sv-compare__col sv-compare__col--after">
        <p class="sv-compare__label">${b.label}</p>
        <ul role="list">${b.items.map((i) => `<li>${icon("check")}<span>${i}</span></li>`).join("")}</ul>
      </div>
    </div>
  </div>
</section>`;
  },

  caseStudy(s, id, ctx) {
    // "The problem: …", "Our action: …", "The result: …" become chapters.
    const chapters = s.flow.map((p) => {
      const m = p.match(/^<p><strong>([^<]+?):?<\/strong>:?\s*([\s\S]*)<\/p>$/);
      return m ? { label: m[1].replace(/:$/, ""), html: `<p>${m[2].replace(/^[:\s]+/, "").replace(/^./, (c) => c.toUpperCase())}</p>` } : { label: "", html: p };
    });
    return caseLayout({
      id,
      eyebrow: s.eyebrow,
      title: s.title,
      chapters,
      stats: s.stats,
      photo: anyPhoto(POOL[ctx.tone][2], { cls: "cs__photo", ratio: "16-10", sizes: "(min-width: 1024px) 40vw, 100vw" }),
    });
  },

  trust(s, id) {
    const q = s.quotes[0];
    const person = TESTIMONIALS.find((t) => t.name === q.by) || { name: q.by, role: q.role };
    return `
<section class="section section--mist sv-trust" aria-labelledby="${id}">
  <div class="container sv-split">
    <div>
      ${head(s, id)}
      <div class="sv-prose">${flow(s)}</div>
      ${s.pills.length ? `<ul class="sv-chips" role="list">${s.pills.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
      ${s.lists.map((l) => `<div class="sv-list">${l.label ? `<p class="sv-list__label">${l.label}</p>` : ""}${ticks(l.items)}</div>`).join("")}
    </div>
    <figure class="sv-quote">
      <span class="sv-quote__mark" aria-hidden="true">${icon("quote")}</span>
      ${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}
      <blockquote><p>${q.text}</p></blockquote>
      <figcaption>${reviewAvatar(person, { badge: true })}<span><strong>${q.by}</strong>${q.role || person.role || ""}</span></figcaption>
    </figure>
  </div>
</section>`;
  },

  cards(s, id) {
    const n = s.cards.length;
    return `
<section class="section sv-points" aria-labelledby="${id}">
  <div class="container">
    <div class="sv-points__head">
      ${head(s, id)}
      ${s.flow.length ? `<div class="sv-prose">${flow(s)}</div>` : ""}
    </div>
    <ol class="sv-points__list sv-points__list--${n >= 6 || n === 3 ? 3 : n === 4 ? 2 : Math.min(n, 3)}" role="list">
      ${s.cards.map((c, i) => `
      <li>
        <span class="sv-points__n" aria-hidden="true">${c.num || pad(i + 1)}</span>
        <h3>${c.title}</h3>
        ${c.html}
        ${c.link ? `<a class="text-link" href="${c.link.href}"><span>${c.link.label}</span>${icon("arrow")}</a>` : ""}
      </li>`).join("")}
    </ol>
    ${s.lists.map((l) => `<div class="sv-included sv-included--after">${l.label ? `<p class="sv-included__label">${l.label}</p>` : ""}${ticks(l.items)}</div>`).join("")}
    ${s.links.length ? `<p class="sv-links">${links(s)}</p>` : ""}
  </div>
</section>`;
  },

  story(s, id, ctx) {
    const side = ctx.storyCount++ % 2 ? " sv-story--flip" : "";
    return `
<section class="section sv-story${side}" aria-labelledby="${id}">
  <div class="container sv-story__grid">
    <div class="sv-story__media">${anyPhoto(POOL[ctx.tone][1 + (ctx.storyCount % 3)], { cls: "sv-story__photo", ratio: "4-3", sizes: "(min-width: 1024px) 42vw, 100vw" })}</div>
    <div class="sv-story__copy">
      ${head(s, id)}
      <div class="sv-prose">${flow(s)}</div>
      ${s.lists.map((l) => `<div class="sv-list">${l.label ? `<p class="sv-list__label">${l.label}</p>` : ""}${ticks(l.items)}</div>`).join("")}
      ${notes(s)}
      ${s.links.length ? `<p class="sv-links">${links(s)}</p>` : ""}
    </div>
  </div>
</section>`;
  },

  ctaMid(s, id, ctx) {
    return `
<section class="section section--tight sv-cta" aria-labelledby="${id}">
  <div class="container">
    <div class="sv-cta__box">
      <div class="sv-cta__copy">
        ${s.eyebrow ? `<p class="sv-cta__eyebrow">${s.eyebrow}</p>` : ""}
        <h2 class="sv-cta__title" id="${id}">${s.title}</h2>
        ${s.text ? `<p>${s.text}</p>` : ""}
        ${s.quote?.text ? `<figure class="sv-cta__quote"><span class="sv-cta__stars" aria-hidden="true">★★★★★</span><blockquote><p>${s.quote.text}</p></blockquote><figcaption>${s.quote.by}${s.quote.role ? `, ${s.quote.role}` : ""}</figcaption></figure>` : ""}
      </div>
      <div class="sv-cta__act">
        ${btn("Request a callback", "#page-hero-title", { track: `${ctx.slug}-mid-callback` })}
        <a class="sv-cta__call" href="${SITE.phoneHref}" data-track="${ctx.slug}-mid-phone">${icon("phone")}<span>${SITE.phone}</span></a>
      </div>
    </div>
  </div>
</section>`;
  },

  table(s, id) {
    return `
<section class="section sv-table" aria-labelledby="${id}">
  <div class="container">
    ${head(s, id, { center: true })}
    ${s.flow.length ? `<div class="sv-prose sv-prose--center">${flow(s)}</div>` : ""}
    ${s.tables.map((t) => `
    <div class="sv-table__wrap">
      <table class="sv-table__table">
        ${t.caption ? `<caption class="visually-hidden">${t.caption}</caption>` : ""}
        ${t.head.length ? `<thead><tr>${t.head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>` : ""}
        <tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td data-label="${t.head[i] || ""}">${c}</td>` : `<th scope="row">${c}</th>`)).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`).join("")}
  </div>
</section>`;
  },

  credentials(s, id) {
    return `
<section class="section section--tight cred-why sv-creds" aria-labelledby="${id}">
  <div class="container">
    <div class="cred-why__head">
      <p class="eyebrow">${s.eyebrow || "Certified & accredited"}</p>
      <h2 class="grad-head" id="${id}">${s.title || "Credentials you can check"}</h2>
    </div>
    ${credBadges()}
    ${s.note ? `<p class="cred-note">${s.note}</p>` : ""}
  </div>
</section>`;
  },

  // The specialist services inside a family, with the staging descriptions.
  explore(s, id, ctx) {
    return `
<section class="section section--mist sv-explore" aria-labelledby="${id}">
  <div class="container sv-explore__grid">
    <div class="sv-explore__head">
      ${head(s, id)}
      ${s.flow.length ? `<div class="sv-prose">${flow(s)}</div>` : ""}
      ${btn("Talk to an engineer", "contact.html", { variant: "secondary", arrow: false, track: `${ctx.slug}-explore-talk` })}
    </div>
    <ul class="sv-explore__list tone-${ctx.tone}" role="list">
      ${s.cards.map((c, i) => `
      <li>
        <a class="sv-explore__row" href="${c.link?.href || "#"}">
          <span class="sv-explore__n" aria-hidden="true">${pad(i + 1)}</span>
          <span class="sv-explore__name">${c.title}</span>
          <span class="sv-explore__text">${c.html.replace(/<\/?p>/g, " ").trim()}</span>
          <span class="sv-explore__go" aria-hidden="true">${icon("arrow")}</span>
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>`;
  },

  // The staging page's own reviews, with its note.
  reviews(s, id) {
    return `
<section class="section sv-reviews" aria-labelledby="${id}">
  <div class="container">
    ${head(s, id, { center: true })}
    <div class="sv-reviews__list">
      ${s.quotes.map((q) => {
        const person = TESTIMONIALS.find((t) => t.name === q.by) || { name: q.by, role: q.role };
        return `
      <figure class="sv-reviews__item">
        ${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}
        <blockquote><p>${q.text}</p></blockquote>
        <figcaption>${reviewAvatar(person, { badge: true })}<span><strong>${q.by}</strong>${q.role || person.role || ""}</span></figcaption>
      </figure>`;
      }).join("")}
    </div>
    <p class="sv-reviews__note">${s.notes[0] || "Every review here is verified on our Google profile."} <a href="${SITE.google.reviewsUrl}" rel="noopener">Read them on Google${icon("arrow")}</a></p>
  </div>
</section>`;
  },

  // Pricing as an open band: the staging copy, then the two ways to a number.
  pricing(s, id, ctx) {
    return `
<section class="section section--tight sv-pricing" aria-labelledby="${id}">
  <div class="container sv-pricing__grid">
    <div>
      ${head(s, id)}
      <div class="sv-prose">${flow(s)}</div>
    </div>
    <div class="sv-pricing__act">
      ${btn("Get a tailored quote", "contact.html", { arrow: false, track: `${ctx.slug}-pricing-quote` })}
      <a class="sv-pricing__call" href="${SITE.phoneHref}" data-track="${ctx.slug}-pricing-phone">${icon("phone")}<span>Call ${SITE.phone}</span></a>
    </div>
  </div>
</section>`;
  },

  // "The businesses we look after": the client logos on a loop (app.js initMarquee).
  clients(s, id) {
    return `
<section class="section section--tight sv-clients" aria-labelledby="${id}">
  <div class="container">
    <p class="sv-clients__label" id="${id}">${s.title || "The businesses we look after"}</p>
    <div class="marquee" data-marquee>
      <div class="marquee__viewport">
        <ul class="marquee__track" role="list" aria-labelledby="${id}">
          ${CLIENTS.map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="${c.title}" decoding="async"></li>`).join("")}
        </ul>
        <ul class="marquee__track" role="list" aria-hidden="true">
          ${CLIENTS.map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="" decoding="async"></li>`).join("")}
        </ul>
      </div>
    </div>
  </div>
</section>`;
  },

  faq(s, id) {
    return `
<section class="section sv-faq" id="faq" aria-labelledby="${id}">
  <div class="container sv-faq__grid">
    <div class="sv-faq__head">
      <p class="eyebrow">${s.eyebrow || "Good to know"}</p>
      <h2 class="grad-head" id="${id}">${s.title}</h2>
      <p>Not covered here? Ask us directly — ${SITE.responseLine.toLowerCase()}.</p>
      <a class="sv-faq__call" href="${SITE.phoneHref}">${icon("phone")}<span>${SITE.phone}</span></a>
    </div>
    <div class="sv-faq__list">
      ${s.items.map((f) => `
      <details class="sv-faq__item">
        <summary><span>${f.q}</span><span class="sv-faq__icon" aria-hidden="true"></span></summary>
        <div class="sv-faq__a">${f.a}</div>
      </details>`).join("")}
    </div>
  </div>
</section>`;
  },

  posts(s, id) {
    const posts = s.posts.map((p) => ({ ...p, card: BLOG_LISTING.find((b) => `@/${b.href}` === p.href) })).filter((p) => p.card);
    if (!posts.length) return "";
    return `
<section class="section sv-reading" aria-labelledby="${id}">
  <div class="container">
    ${head(s, id)}
    <ul class="sv-reading__list" role="list">
      ${posts.map((p, i) => `
      <li>
        <a href="${p.href}">
          ${stockPhoto(i === 0 ? STOCK[CATEGORY_PHOTO[p.card.category]] || STOCK.office : READING_PHOTOS[(i + p.title.length) % READING_PHOTOS.length], { cls: "sv-reading__photo", ratio: "16-9", sizes: "(min-width: 1024px) 30vw, 100vw", alt: "" })}
          <span class="sv-reading__cat">${p.cat || p.card.categoryLabel}</span>
          <strong>${p.title}</strong>
          <span class="sv-reading__more">Read article${icon("arrow")}</span>
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>`;
  },

  partners(s, id) {
    return `
<section class="section section--tight sv-partners" aria-labelledby="${id}">
  <div class="container sv-partners__grid">
    <div>
      <p class="eyebrow">${s.eyebrow || "Technology partners"}</p>
      <h2 class="sv-partners__title" id="${id}">${s.title}</h2>
      ${s.lead ? `<p>${s.lead}</p>` : ""}
    </div>
    <ul class="sv-partners__logos" role="list">
      ${PARTNERS.filter((p) => !CREDENTIALS.some((c) => c.file === p.file)).map((p) => `<li><img src="@/assets/images/partners/${p.file}" alt="${p.title}" loading="lazy" decoding="async"></li>`).join("")}
    </ul>
  </div>
</section>`;
  },
};

// Which renderer a content section gets, by what it holds.
export function kindOf(s, i) {
  if (i === 0 && s.lists.length <= 1 && !s.tabs.length && !s.steps.length && !s.cards.length) return "overview";
  if (s.tables.length) return "table";
  if (s.tabs.length) return "tabs";
  if (s.stats.length) return "caseStudy";
  if (s.quotes.length) return "trust";
  if (s.steps.length) return "steps";
  if (s.lists.length === 2 && !s.cards.length) return "compare";
  if (s.cards.length) return "cards";
  return "story";
}

/* ---------- Service pages: everything below the hand-built top ----------
   The five service pages lay out their first sections by hand; from there
   the staging page is drawn section by section with its exact copy, in its
   own order. `skip` lists the titles the page has already drawn. */
export function hubTail(parsed, ctx, { skip = [], stats = false, cardsOf = [] } = {}) {
  const skipped = skip.filter(Boolean).map((t) => t.toLowerCase());
  ctx.n = ctx.n || 0;
  ctx.storyCount = ctx.storyCount || 0;
  return parsed.sections.map((s) => {
    ctx.n += 1;
    const id = `${ctx.slug}-t${ctx.n}`;
    if (s.title && skipped.includes(s.title.toLowerCase())) {
      return cardsOf.map((t) => t.toLowerCase()).includes(s.title.toLowerCase()) && s.cards.length ? R.cards({ ...s, eyebrow: "", title: "", lead: "", flow: [], lists: [], links: [] }, id, ctx) : "";
    }
    if (s.kind === "note") return /written and maintained/i.test(s.text) ? `<div class="container"><p class="sv-family__note">${s.text}</p></div>` : "";
    if (s.kind === "ctaBand") return "";
    if (s.kind !== "content") return R[s.kind] ? R[s.kind](s, id, ctx) : "";
    if (/businesses we look after/i.test(s.title)) return R.clients(s, id, ctx);
    if (s.stats.length && !s.flow.length) return stats ? R.caseStudy(s, id, ctx) : "";
    if (s.quotes.length >= 2) return R.reviews(s, id, ctx);
    if (/^pricing/i.test(s.title) || /^pricing$/i.test(s.eyebrow)) return R.pricing(s, id, ctx);
    if (/^explore$/i.test(s.eyebrow) || (s.cards.length && s.cards.every((c) => c.link))) return R.explore(s, id, ctx);
    if (!s.flow.length && !s.lists.length && !s.cards.length && !s.tabs.length && !s.steps.length && !s.quotes.length && !s.stats.length && !s.tables.length) return "";
    return R[kindOf(s, 1)](s, id, ctx);
  }).join("\n");
}
