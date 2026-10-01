// IT Services hub. Signature: "everything under one roof". The five services open
// as a photo mosaic straight out of the hero, each tile with the photograph of
// that service being done; below it one explorer panel (a vertical tab list)
// replaces the five long alternating rows, and the proof sits in one bento.
import {
  page, statValue, reviewAvatar, stars, btn, icon, photo, stockPhoto, breadcrumbs, callbackForm, heroNote, credBadges,
  SITE, SERVICES, STATS, PARTNERS, CREDENTIALS, TESTIMONIALS, PHOTOS, STOCK,
} from "../lib.mjs";
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

// Each service's tile shows that service being done, not a general office shot.
const tilePhoto = {
  support: (o) => photo(PHOTOS.headset, o),
  cloud: (o) => stockPhoto(STOCK.cloudRacks, o),
  cyber: (o) => stockPhoto(STOCK.cyber, o),
  network: (o) => photo(PHOTOS.network, o),
  projects: (o) => stockPhoto(STOCK.meeting, o),
};

const num = (i) => String(i + 1).padStart(2, "0");

const tiles = SERVICES.map((s, i) => `
    <article class="svc-tile${i === 0 ? " svc-tile--lead" : ""}" style="--i:${i}">
      ${tilePhoto[s.key]({ cls: "svc-tile__photo", ratio: i === 0 ? "4-3" : "3-2", sizes: i === 0 ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 310px, (min-width: 640px) 50vw, 100vw", loading: "eager" })}
      <span class="svc-tile__num" aria-hidden="true">${num(i)}</span>
      <div class="svc-tile__body">
        <span class="svc-tile__icon" aria-hidden="true">${icon(s.icon)}</span>
        <h2 class="svc-tile__title"><a class="card-link" href="@/${s.href}">${s.title}</a></h2>
        <p>${s.short}</p>
        <span class="svc-tile__meta" aria-hidden="true">${s.children.length} specialist services ${icon("arrow")}</span>
      </div>
    </article>`).join("");

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
            <p class="explorer__subs-label">${s.children.length} specialist services</p>
            <ul role="list">
              ${s.children.map((c, n) => `<li style="--n:${n}"><a href="@/${c.href}"><span>${c.title}</span>${icon("arrow")}</a></li>`).join("")}
            </ul>
          </div>
        </div>`;
}).join("");

const quote = TESTIMONIALS[0];

const main = `
<section class="hero hero--sky svc-hero" aria-labelledby="page-hero-title">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <div class="svc-hero__grid">
      <div class="svc-hero__copy">
        <p class="eyebrow">IT services</p>
        <h1 class="hero-sky__title svc-hero__title" id="page-hero-title">${m.title}</h1>
        <p class="hero-sky__lead">${m.lead}</p>
        ${heroNote("UK-wide coverage", "services-hero")}
      </div>
      <div class="svc-hero__form">${callbackForm({ track: "services-hero" })}</div>
    </div>
  </div>
</section>

${/* The five services as a mosaic lifted out of the hero: IT Support leads at
     double size, the other four around it. Each tile is one link. */""}
<section class="svc-mosaic" aria-label="Our five core services" data-no-reveal>
  <div class="container">
    <div class="svc-mosaic__grid">${tiles}
    </div>
  </div>
</section>

<section class="section svc-explore" aria-labelledby="explore-title">
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
        <aside class="explorer__else">
          <span class="explorer__else-icon" aria-hidden="true">${icon("message")}</span>
          <h3>Something else?</h3>
          <p>Not sure what you need? Tell us what you're wrestling with and we'll point you in the right direction, even if the answer turns out not to be us.</p>
          ${btn("Get in touch", "contact.html", { variant: "secondary", arrow: false, track: "services-something-else" })}
        </aside>
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
    <div class="proof-bento">
      <div class="proof-bento__creds">${credBadges()}</div>
      <dl class="proof-bento__stats">
        ${STATS.map((s) => `
        <div class="proof-stat">
          <dd>${statValue(s)}</dd>
          <dt>${s.label}</dt>
        </div>`).join("")}
      </dl>
      <figure class="proof-bento__quote">
        ${stars(`Rated ${SITE.google.rating} out of 5`)}
        <blockquote><p>“${quote.quote}”</p></blockquote>
        <figcaption>${reviewAvatar(quote, { badge: true })}<span><strong>${quote.name}</strong>${quote.role}</span></figcaption>
        <a class="text-link" href="${SITE.google.reviewsUrl}" rel="noopener"><span>All ${SITE.google.count} Google reviews</span>${icon("arrow")}</a>
      </figure>
      <div class="proof-bento__partners">
        <p class="proof-bento__label">The partners behind the work</p>
        <ul class="partner-row partner-row--badges" role="list">
          ${PARTNERS.filter((p) => !CREDENTIALS.some((c) => c.file === p.file)).map((p) => `<li><img src="@/assets/images/partners/${p.file}" alt="${p.title}" loading="lazy" decoding="async"></li>`).join("")}
        </ul>
      </div>
    </div>
    <p class="svc-proof__note">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
  </div>
</section>
`;

page({
  footerCta: {
    title: "Not sure which service you need?",
    text: "Tell us what is slowing your team down. We will recommend the right mix, not the biggest package.",
    track: "services-final-cta",
  },
  file: "it-services.html",
  title: "IT Support, Cloud & Cyber Security Services",
  description: "Explore WhizzIT's managed IT services: IT support, managed cloud, cyber security, network management and IT project management for UK businesses.",
  bodyClass: "page--services page--sky",
  crumbs,
  main,
});
