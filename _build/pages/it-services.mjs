// IT Services hub. Signature: "everything under one roof". The hero ends in a
// slim index of the five services (number, icon, name, one line, how many
// specialist services); choosing one opens it in the explorer below, a vertical
// tab list beside one panel that carries that service's own photograph. The
// proof sits in one bento.
import {
  page, statValue, reviewAvatar, stars, btn, icon, photo, stockPhoto, breadcrumbs, callbackForm, heroNote, credBadges,
  SITE, SERVICES, STATS, PARTNERS, CREDENTIALS, TESTIMONIALS, PHOTOS, STOCK, G_COUNT, statStrip,
} from "../lib.mjs";
import { parseSections } from "../section-parse.mjs";
import { R } from "../sections.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";

const m = parsePage(pageByPath("/it-services/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "IT Services" }];

// Staging labels each pillar "01, IT Support" and so on — match on the title.
const pillarCopy = (service) => {
  const block = m.blocks.find((b) => b.eyebrow.toLowerCase().includes(service.title.toLowerCase()));
  if (!block) return { title: service.title, html: `<p>${service.desc}</p>`, list: [] };
  // The staging block repeats its own heading and link list inside the prose,
  // so keep the first couple of genuine sentences only.
  const paragraphs = [...block.html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((x) => x[1].trim())
    .filter((x) => x.length > 60 && !x.includes(block.title));
  return { title: block.title, html: paragraphs.slice(0, 2).map((x) => `<p>${x}</p>`).join("") || `<p>${service.desc}</p>`, list: block.list };
};

// Each service's photograph shows that service being done; it sits in its own panel.
const tilePhoto = {
  support: (o) => photo(PHOTOS.headset, o),
  cloud: (o) => stockPhoto(STOCK.cloudRacks, o),
  cyber: (o) => stockPhoto(STOCK.cyber, o),
  network: (o) => photo(PHOTOS.network, o),
  projects: (o) => stockPhoto(STOCK.meeting, o),
};

const num = (i) => String(i + 1).padStart(2, "0");

// The index: each row opens its service in the explorer (app.js
// initServiceIndex); without JS the link goes to the service's own page.
const index = SERVICES.map((s, i) => `
      <li>
        <a class="svc-index__row" href="@/${s.href}" data-svc-open="${s.key}" style="--i:${i}">
          <span class="svc-index__num">${num(i)}</span>
          <span class="svc-index__icon" aria-hidden="true">${icon(s.icon)}</span>
          <span class="svc-index__name">${s.title}</span>
          <span class="svc-index__short">${s.short}</span>
          <span class="svc-index__count">${s.children.length} specialist services</span>
          <span class="svc-index__go" aria-hidden="true">${icon("arrow")}</span>
        </a>
      </li>`).join("");

const tabs = SERVICES.map((s, i) => `
          <button class="explorer__tab" type="button" role="tab" id="tab-${s.key}" aria-controls="${s.key}" aria-selected="${i === 0}">
            <span class="explorer__num">${num(i)}</span>
            <span class="explorer__icon" aria-hidden="true">${icon(s.icon)}</span>
            <span class="explorer__label"><strong>${s.title}</strong><span>${s.short}</span></span>
          </button>`).join("");

const panels = SERVICES.map((s, i) => {
  const copy = pillarCopy(s);
  return `
        <div class="explorer__panel" role="tabpanel" id="${s.key}" aria-labelledby="tab-${s.key}" tabindex="0">
          <div class="explorer__copy">
            <p class="explorer__kicker">${num(i)} · ${s.title}</p>
            <h3 class="grad-head">${copy.title}</h3>
            <div class="block-prose">${copy.html}</div>
            ${copy.list.length ? `<ul class="tick-list tick-list--compact" role="list">${copy.list.slice(0, 5).map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
            <div class="btn-group mt-6">${btn(`Explore ${s.title}`, s.href, { track: `services-${s.key}` })}</div>
          </div>
          <div class="explorer__subs">
            ${tilePhoto[s.key]({ cls: "explorer__photo", ratio: "16-9", sizes: "(min-width: 1280px) 400px, (min-width: 1024px) 50vw, 100vw" })}
            <p class="explorer__subs-label">${s.children.length} specialist services</p>
            <ul role="list">
              ${s.children.map((c, n) => `<li style="--n:${n}"><a href="@/${c.href}"><span>${c.title}</span>${icon("arrow")}</a></li>`).join("")}
            </ul>
          </div>
        </div>`;
}).join("");

const quote = TESTIMONIALS[0];
// Staging's own reviews, related guides, partners and closing copy.
const P = parseSections(pageByPath("/it-services/").html).sections;
const stagingReviews = P.find((x) => x.kind === "content" && x.quotes.length >= 2);
const stagingPosts = P.find((x) => x.kind === "posts");
const stagingPartners = P.find((x) => x.kind === "partners");
const stagingBand = P.find((x) => x.kind === "ctaBand");
const stagingCreds = P.find((x) => x.kind === "credentials");
const signOff = P.find((x) => x.kind === "note" && /written and maintained/i.test(x.text));
const ctx = { slug: "it-services", tone: "support", n: 0 };

const main = `
<section class="hero hero--sky svc-hero" aria-labelledby="page-hero-title">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <div class="svc-hero__grid">
      <div class="svc-hero__copy">
        <p class="eyebrow">IT services</p>
        <h1 class="hero-sky__title svc-hero__title" id="page-hero-title">${m.title}</h1>
        <p class="hero-sky__lead">${m.leadHtml || m.lead}</p>
        ${heroNote("UK-wide coverage", "services-hero")}
      </div>
      <div class="svc-hero__form">${callbackForm({ track: "services-hero" })}</div>
    </div>
    <nav class="svc-index" aria-label="Our five core services">
      <p class="svc-index__label">Five core services</p>
      <ol class="svc-index__list" role="list">${index}
      </ol>
    </nav>
  </div>
</section>

<section class="section svc-explore" id="explore" aria-labelledby="explore-title">
  <div class="container">
    <div class="svc-explore__head">
      <p class="eyebrow">Our services</p>
      <h2 class="grad-head" id="explore-title">Five core services, one accountable team</h2>
      <p>Pick a service to see how it works, what it includes and the specialist services inside it.</p>
    </div>
    <div class="explorer" data-tabs>
      <div class="explorer__rail">
        <div class="explorer__list" role="tablist" aria-orientation="vertical" aria-label="IT services">${tabs}
          <span class="explorer__indicator" aria-hidden="true"></span>
        </div>
      </div>
      <div class="explorer__stage">${panels}
      </div>
    </div>
  </div>
</section>

<section class="section section--mist svc-proof" aria-labelledby="services-proof-title">
  <div class="container">
    <div class="svc-proof__head">
      <p class="eyebrow">Why work with us</p>
      <h2 class="grad-head" id="services-proof-title">Proof, not promises</h2>
    </div>
    ${statStrip({ track: "services-proof" })}
    <p class="svc-proof__note">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
    <div class="svc-proof__foot">
      <div class="svc-proof__marks">
        <p class="svc-proof__label">Certified and partnered</p>
        <ul class="svc-proof__creds" role="list">
          ${CREDENTIALS.map((c) => `<li><a href="@/${c.cta.href}"><img src="@/assets/images/partners/${c.file}" alt="${c.title}" width="280" height="110" loading="lazy" decoding="async"><span>${c.cta.label}${icon("arrow")}</span></a></li>`).join("")}
        </ul>
        ${stagingCreds?.note ? `<p class="cred-note">${stagingCreds.note}</p>` : ""}
        <ul class="svc-proof__partners" role="list">
          ${PARTNERS.filter((p) => !CREDENTIALS.some((c) => c.file === p.file)).map((p) => `<li><img src="@/assets/images/partners/${p.file}" alt="${p.title}" loading="lazy" decoding="async"></li>`).join("")}
        </ul>
      </div>
    </div>
  </div>
</section>

${stagingReviews ? R.reviews(stagingReviews, "services-reviews-title", ctx) : ""}
${stagingPosts ? R.posts(stagingPosts, "services-guides-title", ctx) : ""}
${stagingPartners ? R.partners(stagingPartners, "services-partners-title", ctx) : ""}
${signOff ? `<div class="container"><p class="sv-family__note">${signOff.text}</p></div>` : ""}
`;

page({
  footerCta: {
    title: stagingBand?.title || "Not sure which service you need?",
    text: stagingBand?.text || "Tell us what is slowing your team down. We will recommend the right mix, not the biggest package.",
    track: "services-final-cta",
  },
  file: "it-services.html",
  title: "IT Support, Cloud & Cyber Security Services",
  description: "Explore WhizzIT's managed IT services: IT support, managed cloud, cyber security, network management and IT project management for UK businesses.",
  bodyClass: "page--services page--sky",
  crumbs,
  main,
});
