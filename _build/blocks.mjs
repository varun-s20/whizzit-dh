// Renders the parsed staging blocks with the new design system. Each block kind
// gets its own component. Blocks with a card, tabs or accordion stack: heading and
// prose across the row, the component below (see .block-split:has in styles.css).
import { icon, btn, reviewAvatar, stockPhoto, SITE, STOCK } from "./lib.mjs";

// Blocks we render ourselves from site data rather than from page content.
const SKIP = /^(Credentials you can check|Brands we partner with|Frequently asked questions|The businesses we look after|Proof, not promises)$/i;

// The staging markup often repeats the lead as the block's first paragraph, so
// only print it here when the body does not already open with it.
const leadIsRepeated = (b) => Boolean(b.lead) && b.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().startsWith(b.lead.slice(0, 40));

const head = (b, { center = false, id = "" } = {}) => `
  <div class="${center ? "center-head" : "block-head"}">
    ${b.eyebrow ? `<p class="eyebrow">${b.eyebrow}</p>` : ""}
    <h2 class="grad-head"${id ? ` id="${id}"` : ""}>${b.title}</h2>
    ${b.lead && !leadIsRepeated(b) ? `<p>${b.lead}</p>` : ""}
  </div>`;

const checkCard = (items, title = "What's included") => `
  <aside class="check-card">
    <h3>${title}</h3>
    <ul role="list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>
  </aside>`;

// Before/after pairs ("Without a plan" / "With WhizzIT") sit side by side so they
// read as a comparison; a single list is one card.
const checkCards = (b) => b.lists.length > 1
  ? `<div class="check-grid">${b.lists.map((l) => checkCard(l.items, l.title || "What's included")).join("")}</div>`
  : checkCard(b.list, b.listTitle || "What's included");

function proseBlock(b, id) {
  if (!b.list.length) {
    // Centred head: the prose below it is centred too, so a left-aligned heading
    // sat out of line with its own body and left the right half of the row empty.
    return `
  <section class="section block block--statement" aria-labelledby="${id}">
    <div class="container statement-wide">
      ${head(b, { center: true, id })}
      ${b.html ? `<div class="prose-cols">${b.html}</div>` : ""}
    </div>
  </section>`;
  }
  // When the checklist card already carries this title, do not print it twice.
  const repeated = b.listTitle && b.listTitle.trim().toLowerCase() === b.title.trim().toLowerCase();
  return `
  <section class="section block" aria-labelledby="${id}">
    <div class="container block-split">
      <div>
        ${repeated ? `<p class="eyebrow">${b.eyebrow || "What we cover"}</p><h2 class="grad-head" id="${id}">${b.title}</h2>` : head(b, { id })}
        ${b.html ? `<div class="block-prose">${b.html}</div>` : ""}
      </div>
      ${checkCards(b)}
    </div>
  </section>`;
}

function cardsBlock(b, id) {
  // Head centred to match the prose and the grid beneath it: a left-aligned head
  // over centred prose reads as two unrelated columns.
  return `
  <section class="section block" aria-labelledby="${id}">
    <div class="container">
      ${head(b, { center: true, id })}
      ${b.html ? `<div class="block-prose block-prose--wide">${b.html}</div>` : ""}
      <div class="detail-grid detail-grid--${Math.min(b.cards.length, 3)}">
        ${b.cards.map((c, n) => `
        <article class="detail-card">
          <span class="detail-card__num">${String(n + 1).padStart(2, "0")}</span>
          <h3>${c.title}</h3>
          <p>${c.text}</p>
        </article>`).join("")}
      </div>
    </div>
  </section>`;
}

function tabsBlock(b, id, key) {
  return `
  <section class="section block" aria-labelledby="${id}">
    <div class="container block-split">
      <div>
        ${head(b, { id })}
        ${b.html ? `<div class="block-prose">${b.html}</div>` : ""}
        ${b.list.length ? checkCards(b) : ""}
      </div>
      <div class="tabs tabs--panel" data-tabs>
        <div class="tabs__list pill-tabs" role="tablist" aria-label="${b.title}">
          ${b.tabs.map((t, n) => `<button class="tabs__tab" type="button" role="tab" id="tab-${key}-${n}" aria-controls="panel-${key}-${n}" aria-selected="${n === 0}">${t.label}</button>`).join("")}
        </div>
        ${b.tabs.map((t, n) => `<div class="tabs__panel" role="tabpanel" id="panel-${key}-${n}" aria-labelledby="tab-${key}-${n}" tabindex="0">${t.html}</div>`).join("")}
      </div>
    </div>
  </section>`;
}

const isFaq = (b) => /faq|frequently asked|questions/i.test(b.title);

// Accordion content that is not a FAQ: same disclosure list, no FAQ furniture.
function discloseBlock(b, id) {
  return `
  <section class="section block" aria-labelledby="${id}">
    <div class="container block-split">
      <div>
        ${head(b, { id })}
        ${b.html ? `<div class="block-prose">${b.html}</div>` : ""}
      </div>
      <div class="faq-panel">
        ${b.faq.map((f) => `<details class="faq-item"><summary>${f.q}</summary><div class="faq-item__body">${f.a}</div></details>`).join("")}
      </div>
    </div>
  </section>`;
}

function faqBlock(b, id, { first = true } = {}) {
  return `
  <section class="section block block--faq"${first ? ' id="faq"' : ""} aria-labelledby="${id}">
    <div class="container faq-split">
      <div>
        ${head(b, { id })}
        <p class="faq-split__help">Not covered here? Ask us directly — ${SITE.responseLine.toLowerCase()}.</p>
        <div class="btn-group mt-5">
          ${btn("Ask us a question", "contact.html", { variant: "secondary", arrow: false, track: "faq-contact" })}
        </div>
      </div>
      <div class="faq-panel">
        ${b.faq.map((f) => `<details class="faq-item"><summary>${f.q}</summary><div class="faq-item__body">${f.a}</div></details>`).join("")}
      </div>
    </div>
  </section>`;
}

export function renderBlocks(blocks, { key = "b" } = {}) {
  let n = 0;
  let faqSeen = false;
  return blocks
    .filter((b) => !SKIP.test(b.title.trim()) || b.faq.length)
    .map((b) => {
      const id = `${key}-block-${n}`;
      let out;
      if (b.faq.length && isFaq(b)) {
        out = faqBlock(b, id, { first: !faqSeen });
        faqSeen = true;
      } else out = b.faq.length
        ? discloseBlock(b, id)
        : b.tabs.length
          ? tabsBlock(b, id, `${key}-${n}`)
          : b.cards.length
            ? cardsBlock(b, id)
            : proseBlock(b, id);
      n += 1;
      return out;
    })
    .join("\n");
}

/* ---------- Shared page furniture ---------- */
// The wide photo that sits across the hero's foot. Pages pass their own
// (industry, location, case study); service pages get their service's photo.
const TONE_PHOTO = { support: "supportDesk", cloud: "cloudRacks", cyber: "cyber", network: "serverRoom", projects: "meeting" };
export const heroFeature = (item) => stockPhoto(item, { ratio: "16-9", sizes: "(min-width: 1280px) 1240px, 100vw", loading: "eager" });

export function pageHero({ eyebrow, title, lead, crumbs = "", actions = "", aside = "", cls = "", feature, note = "" }) {
  const tone = (cls.match(/hero--tone-(w+)/) || [])[1];
  const fig = feature === false ? "" : feature || heroFeature(STOCK[TONE_PHOTO[tone]] || STOCK.office);
  // One column, top to bottom: the headline gets the full row instead of sharing
  // it with a side panel, and whatever used to sit beside it runs full width below.
  return `
<section class="hero hero--sky hero--page hero-stack${fig ? " has-feature" : ""} ${cls}" aria-labelledby="page-hero-title">
  <div class="container">
    ${crumbs}
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
    <h1 class="hero-sky__title hero-stack__title" id="page-hero-title">${title}</h1>
    ${lead ? `<p class="hero-sky__lead">${lead}</p>` : ""}
    <div class="btn-group">
      ${actions || `${btn("Book a consultation", "contact.html", { arrow: false, track: "page-hero-cta" })}${btn(`Call ${SITE.phone}`, SITE.phoneHref, { variant: "secondary", iconName: "phone", arrow: false, track: "page-hero-phone" })}`}
    </div>
    <p class="hero-sky__note">${icon("checkCircle")}${note || `${SITE.responseLine} · ${SITE.google.label} · UK-wide coverage`}</p>
    ${aside ? `<div class="hero-stack__aside">${aside}</div>` : ""}
  </div>
</section>${fig ? `
<div class="hero-feature"><div class="container">${fig}</div></div>` : ""}`;
}

// Proof figures as one raised faceplate, like a rack unit: a status light per
// figure that switches on in turn when the page loads.
export const heroProof = (items) => `
<ul class="faceplate" role="list">
  ${items.map((i, n) => `<li class="faceplate__unit" style="--i:${n}"><span class="faceplate__led" aria-hidden="true"></span><span class="faceplate__icon">${icon(i.icon)}</span><strong>${i.value}</strong><span>${i.label}</span></li>`).join("")}
</ul>`;

/* ---------- Bands shared by the service overview pages ---------- */
export function subServiceGrid(service, { title = `Specialist ${service.title.toLowerCase()} services`, lead = "" } = {}) {
  return `
<section class="section section--mist" aria-labelledby="sub-services-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Explore</p>
        <h2 class="grad-head" id="sub-services-title">${title}</h2>
        ${lead ? `<p>${lead}</p>` : ""}
      </div>
      ${btn("Talk to an engineer", "contact.html", { variant: "secondary", arrow: false, track: `${service.key}-sub-cta` })}
    </div>
    <ul class="sub-grid" role="list">
      ${service.children.map((c, i) => `
      <li>
        <a href="@/${c.href}">
          <span class="sub-grid__num">${String(i + 1).padStart(2, "0")}</span>
          <span class="sub-grid__icon">${icon(service.icon)}</span>
          <strong>${c.title}</strong>
          ${icon("arrow")}
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>`;
}

export function reviewsBand(quotes, { title = "What our clients say", eyebrow = "Customer stories" } = {}) {
  return `
<section class="section" aria-labelledby="service-reviews-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">${eyebrow}</p>
      <h2 class="grad-head" id="service-reviews-title">${title}</h2>
      <p>Rated ${SITE.google.rating} on Google across ${SITE.google.count} reviews.</p>
    </div>
    <div class="review-grid">
      ${quotes.map((t) => `
      <figure class="review-card">
        <span class="review-card__stars" aria-hidden="true">${icon("star").repeat(5)}</span>
        <blockquote><p>“${t.quote}”</p></blockquote>
        <figcaption>${reviewAvatar(t, { badge: true })}<span><strong>${t.name}</strong>${t.role}</span></figcaption>
      </figure>`).join("")}
    </div>
  </div>
</section>`;
}

export function pricingPanel({ track = "pricing" } = {}) {
  return `
<section class="section section--tight" aria-labelledby="pricing-panel-title">
  <div class="container">
    <div class="pricing-panel">
      <div>
        <p class="eyebrow">Pricing</p>
        <h2 class="grad-head" id="pricing-panel-title">Pricing built around your business</h2>
        <p>No rigid packages and no surprises. We shape your plan and price around your team, systems and goals, then give you a clear, no-obligation quote.</p>
      </div>
      <div class="btn-group">
        ${btn("Get a tailored quote", "contact.html", { arrow: false, track: `${track}-quote` })}
        ${btn(`Call ${SITE.phone}`, SITE.phoneHref, { variant: "secondary", iconName: "phone", arrow: false, track: `${track}-phone` })}
      </div>
    </div>
  </div>
</section>`;
}
