// IT Services hub. Signature layout: five alternating pillar rows, each one
// opening out into its sub-services, so the page doubles as the site's index.
import {
  page, statValue, reviewAvatar, btn, icon, photo, breadcrumbs, ctaBand,
  SITE, SERVICES, STATS, PARTNERS, CREDENTIALS, TESTIMONIALS, PHOTOS, CLIENTS,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { pageHero } from "../blocks.mjs";

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

const pillarPhoto = [PHOTOS.headset, PHOTOS.serviceDesk, PHOTOS.office, PHOTOS.network, PHOTOS.van];

const pillars = SERVICES.map((s, i) => {
  const copy = pillarCopy(s);
  return `
  <article class="pillar${i % 2 ? " pillar--flip" : ""}" id="${s.key}">
    <div class="pillar__body">
      <p class="pillar__index">${String(i + 1).padStart(2, "0")} · ${s.title}</p>
      <h3 class="grad-head">${copy.title}</h3>
      <div class="block-prose">${copy.html || `<p>${s.desc}</p>`}</div>
      ${copy.list.length ? `<ul class="tick-list tick-list--compact" role="list">${copy.list.slice(0, 5).map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
      <div class="btn-group mt-6">
        ${btn(`Explore ${s.title}`, s.href, { arrow: false, track: `services-${s.key}` })}
      </div>
    </div>
    <div class="pillar__aside">
      ${photo(pillarPhoto[i], { cls: "pillar__photo", ratio: "3-2", sizes: "(min-width: 1024px) 40vw, 100vw" })}
      <div class="pillar__links">
        <p>${s.children.length} specialist services</p>
        <ul role="list">
          ${s.children.map((c) => `<li><a href="@/${c.href}">${icon(s.icon)}<span>${c.title}</span>${icon("arrow")}</a></li>`).join("")}
        </ul>
      </div>
    </div>
  </article>`;
}).join("");

const main = `
${pageHero({
  eyebrow: "IT services",
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  aside: `
    <nav class="service-index" aria-label="Jump to a service">
      <p class="service-index__label">Five core services</p>
      <ul role="list">
        ${SERVICES.map((s, i) => `<li><a href="#${s.key}"><span class="service-index__num">${String(i + 1).padStart(2, "0")}</span><span class="service-index__icon">${icon(s.icon)}</span><span><strong>${s.title}</strong>${s.short}</span>${icon("arrow")}</a></li>`).join("")}
      </ul>
    </nav>`,
})}

<section class="section section--tight" aria-label="Clients">
  <div class="container">
    <div class="client-band client-band--slim">
      <p class="client-band__label">Trusted by the businesses we look after</p>
      <ul class="logo-row" role="list">
        ${CLIENTS.slice(0, 6).map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="${c.title}" decoding="async"></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="section pillars" aria-labelledby="pillars-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Our services</p>
      <h2 class="grad-head" id="pillars-title">Five core services, one accountable team</h2>
      <p>Pick a service to see how it works, what it includes and the results our clients see.</p>
    </div>
    ${pillars}
    <article class="route-wide">
      <span class="route-wide__icon">${icon("message")}</span>
      <div>
        <h3>Something else?</h3>
        <p>Not sure what you need? Tell us what you're wrestling with and we'll point you in the right direction, even if the answer turns out not to be us.</p>
      </div>
      ${btn("Get in touch", "contact.html", { arrow: false, track: "services-something-else" })}
    </article>
  </div>
</section>

<section class="section stat-band" aria-labelledby="services-stats-title">
  <div class="container">
    <div class="stat-band__head">
      <p class="eyebrow">By the numbers</p>
      <h2 class="grad-head grad-head--dark" id="services-stats-title">Proof, not promises</h2>
    </div>
    <dl class="stat-band__grid">
      ${STATS.map((s) => `<div><dd>${statValue(s)}</dd><dt>${s.label}</dt><p>${s.note}</p></div>`).join("")}
    </dl>
    <p class="stat-band__note">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
  </div>
</section>

<section class="section" aria-labelledby="services-cred-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Certified &amp; accredited</p>
        <h2 class="grad-head" id="services-cred-title">Credentials you can check</h2>
      </div>
      <p class="bar-head__aside">Verified rather than claimed, so you can check both before you commit.</p>
    </div>
    <div class="cred-grid">
      ${CREDENTIALS.map((c) => `
      <article class="cred-card">
        <img src="@/assets/images/partners/${c.file}" alt="${c.title}" width="120" height="72" decoding="async">
        <h3>${c.title}</h3>
        <p>${c.text}</p>
        <a class="text-link" href="@/${c.cta.href}"><span>${c.cta.label}</span>${icon("arrow")}</a>
      </article>`).join("")}
    </div>
    <ul class="partner-row mt-7" role="list">
      ${PARTNERS.map((p) => `<li><img src="@/assets/images/partners/${p.file}" alt="${p.title}" decoding="async"></li>`).join("")}
    </ul>
  </div>
</section>

<section class="section section--mist" aria-labelledby="services-reviews-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Customer stories</p>
      <h2 class="grad-head" id="services-reviews-title">What our clients say</h2>
      <p>Rated ${SITE.google.rating} on Google across ${SITE.google.count} reviews.</p>
    </div>
    <div class="review-grid">
      ${TESTIMONIALS.slice(0, 3).map((t) => `
      <figure class="review-card">
        <span class="review-card__stars" aria-hidden="true">${icon("star").repeat(5)}</span>
        <blockquote><p>“${t.quote}”</p></blockquote>
        <figcaption>${reviewAvatar(t, { badge: true })}<span><strong>${t.name}</strong>${t.role}</span></figcaption>
      </figure>`).join("")}
    </div>
  </div>
</section>

${ctaBand({
  title: "Not sure which service you need?",
  text: "Tell us what is slowing your team down. We will recommend the right mix, not the biggest package.",
  track: "services-final-cta",
})}
`;

page({
  file: "it-services.html",
  title: "IT Support, Cloud & Cyber Security Services",
  description: "Explore WhizzIT's managed IT services: IT support, managed cloud, cyber security, network management and IT project management for UK businesses.",
  bodyClass: "page--services page--sky",
  crumbs,
  main,
});
