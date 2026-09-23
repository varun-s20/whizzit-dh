// IT Support London — the flagship location page. Signature: the coverage panel
// (head office, travel time, areas served) runs across the hero's foot, and the page closes
// with the London-specific service list.
import {
  page, reviewAvatar, btn, icon, photo, stockPhoto, breadcrumbs, ctaBand, serviceRow,
  SITE, SERVICES, LOCATIONS, TESTIMONIALS, PHOTOS, CREDENTIALS, STOCK,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { renderBlocks, pageHero } from "../blocks.mjs";

const m = parsePage(pageByPath("/locations/it-support-london/").html);
const crumbs = [
  { title: "Home", href: "index.html" },
  { title: "Locations", href: "locations.html" },
  { title: "IT support in London" },
];

const skip = /credentials you can check|brands we partner with|the businesses we look after|proof, not promises|our range of london it services/i;
const blocks = m.blocks.filter((b) => !skip.test(b.title));
const london = SITE.offices[0];

// Areas the London team covers day to day, taken from the staging page copy.
const areas = ["City of London", "Shoreditch", "Islington", "Camden", "Westminster", "Canary Wharf", "Southwark", "Hammersmith", "Croydon", "Greater London"];

const main = `
${pageHero({
  eyebrow: `${icon("mapPin")}IT support in London`,
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  cls: "hero--london",
  note: "On site when it needs hands",
  feature: stockPhoto(STOCK.london, { ratio: "16-9", sizes: "(min-width: 1280px) 1240px, 100vw", loading: "eager" }),
  aside: `
    <aside class="coverage-card" aria-label="London coverage">
      <div>
        <p class="coverage-card__label">${icon("building")}Head office</p>
        <p class="coverage-card__address">${london.address}</p>
        <a class="text-link" href="${london.maps}" rel="noopener"><span>Get directions</span>${icon("arrow")}</a>
      </div>
      <div class="coverage-card__stats">
        <div><strong>9 min</strong><span>Average first response</span></div>
        <div><strong>6 hours</strong><span>Average resolution</span></div>
      </div>
      <div>
        <p class="coverage-card__areas-label">Areas we cover</p>
        <ul class="coverage-card__areas" role="list">
          ${areas.map((a) => `<li>${a}</li>`).join("")}
        </ul>
      </div>
    </aside>`,
})}

${renderBlocks(blocks, { key: "london" })}

<section class="section section--mist" aria-labelledby="london-services-title">
  <div class="container block-split">
    <div>
      <p class="eyebrow">London services</p>
      <h2 class="grad-head" id="london-services-title">The full WhizzIT service, on your doorstep</h2>
      <p class="block-prose">Every service we run is available to London businesses, delivered remotely first and on site from the City Road office when a job needs hands on hardware.</p>
      ${photo(PHOTOS.van, { cls: "block-photo mt-6", ratio: "3-2", sizes: "(min-width: 1024px) 45vw, 100vw" })}
    </div>
    <div class="related-grid">${SERVICES.map((s) => serviceRow(s)).join("")}</div>
  </div>
</section>

<section class="section" aria-labelledby="london-cred-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Certified &amp; accredited</p>
        <h2 class="grad-head" id="london-cred-title">Credentials London clients ask about</h2>
      </div>
      ${btn("Read customer stories", "our-customers.html#stories", { variant: "secondary", arrow: false, track: "london-stories" })}
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
  </div>
</section>

<section class="section section--tight" aria-labelledby="london-quote-title">
  <div class="container">
    <h2 class="visually-hidden" id="london-quote-title">What London clients say</h2>
    <figure class="quote-feature">
      <span class="quote-feature__mark" aria-hidden="true">${icon("quote")}</span>
      <blockquote><p>“${TESTIMONIALS[0].quote}”</p></blockquote>
      <figcaption>
        ${reviewAvatar(TESTIMONIALS[0], { badge: true })}
        <span><strong>${TESTIMONIALS[0].name}</strong>${TESTIMONIALS[0].role}</span>
        <a href="${SITE.google.reviewsUrl}" rel="noopener">See all ${SITE.google.count} reviews${icon("arrow")}</a>
      </figcaption>
    </figure>
  </div>
</section>

<section class="section section--tight" aria-labelledby="london-nearby-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Nearby</p>
        <h2 class="grad-head" id="london-nearby-title">Other areas we cover</h2>
      </div>
      ${btn("All locations", "locations.html", { variant: "secondary", arrow: false, track: "london-all-locations" })}
    </div>
    <ul class="area-chips" role="list">
      ${LOCATIONS.filter((l) => l.title !== "London").slice(0, 9).map((l) => `<li><a href="@/${l.href}">${icon("mapPin")}${l.title}</a></li>`).join("")}
    </ul>
  </div>
</section>

${ctaBand({
  title: "Need IT support in London?",
  text: `Call and you will speak to an engineer, not a queue. ${SITE.responseLine}, on site when it needs hands.`,
  track: "london-final-cta",
})}
`;

page({
  file: "locations/it-support-london.html",
  title: "Expert IT Support London | 5-Star Rated",
  description: `Managed IT support in London from WhizzIT. Head office on City Road, ${SITE.responseLine.toLowerCase()}, rated ${SITE.google.rating} on Google.`,
  bodyClass: "page--location page--london page--sky",
  crumbs,
  main,
  schema: [{
    "@context": "https://schema.org",
    "@type": "Service",
    name: "IT Support in London",
    description: m.lead,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: { "@type": "City", name: "London" },
  }],
});
