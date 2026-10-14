// Locations index. Signature: the coverage map. A dark hero carries a map of the
// UK (uk-map.mjs, Natural Earth outline) with the two offices as beacons and
// every area pinned where it really is; on load, a route draws out from the
// nearer office to each area and its pin settles in. Beside it, the list of
// areas: pointing at or focusing an area lights its pin and route, and the other
// way round (app.js initCoverageMap). Below: how the coverage works, the two
// offices on their Google maps (as on Contact), and the credentials.
// Every word is staging's /locations/ page or copy the site already uses.
import { page, icon, breadcrumbs, credBadges, officeMapCard, SITE, LOCATIONS, LOCATION_PLACES } from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { UK_VIEW, UK_PATH, project } from "../uk-map.mjs";

const m = parsePage(pageByPath("/locations/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "Locations" }];
const block = (pattern) => m.blocks.find((b) => pattern.test(b.title)) || { eyebrow: "", title: "", lead: "", html: "", list: [] };
const areasBlock = block(/wherever you are/i);
const coverBlock = block(/remote-first/i);
const certBlock = block(/credentials/i);
const paragraphs = (html = "") => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((x) => x[1].trim());

const PLACE = LOCATION_PLACES;

const slug = (t) => t.toLowerCase().replace(/[^a-z]+/g, "-");
const offices = SITE.offices.map((o) => ({ ...o, xy: project(...o.coords) }));
const areas = LOCATIONS.map((l) => {
  const p = PLACE[l.title];
  const xy = project(...p.at);
  // Routes run from whichever office is nearer.
  const from = offices.reduce((best, o) => (Math.hypot(o.xy[0] - xy[0], o.xy[1] - xy[1]) < Math.hypot(best.xy[0] - xy[0], best.xy[1] - xy[1]) ? o : best));
  return { ...l, ...p, xy, from, key: slug(l.title) };
});

// A gentle arc from the office to the area.
const route = (a, b) => {
  const [x1, y1] = a, [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(60, len * 0.22);
  const cx = (x1 + x2) / 2 - (dy / len) * bend, cy = (y1 + y2) / 2 + (dx / len) * bend;
  return `M${x1},${y1} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2},${y2}`;
};

// px per km on this map: 1° of latitude is about 111 km.
const KM = (project(50, 0)[1] - project(51, 0)[1]) / 111;
const london = offices[0].xy;

let order = 0;
const map = (id) => `
  <svg class="cov-map__svg" viewBox="0 0 ${UK_VIEW.width} ${UK_VIEW.height}" role="img" aria-labelledby="${id}-title">
    <title id="${id}-title">Map of the UK showing WhizzIT's offices in London and Stevenage and the areas they cover</title>
    <defs>
      <pattern id="${id}-dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.85"></circle></pattern>
    </defs>
    <g class="cov-map__land">
      <path class="cov-map__fill" d="${UK_PATH}"></path>
      <path class="cov-map__dots" d="${UK_PATH}" fill="url(#${id}-dots)"></path>
      <path class="cov-map__coast" d="${UK_PATH}"></path>
    </g>
    <g class="cov-map__rings" aria-hidden="true">
      ${[100, 200, 300].map((km, i) => `<circle cx="${london[0]}" cy="${london[1]}" r="${(km * KM).toFixed(1)}" style="--i:${i}"></circle>`).join("")}
    </g>
    <g class="cov-map__routes" aria-hidden="true">
      ${areas.filter((a) => a.office === undefined).map((a, i) => `<path class="cov-route" data-loc="${a.key}" d="${route(a.from.xy, a.xy)}" pathLength="1" style="--i:${i}"></path>`).join("")}
    </g>
    <g class="cov-map__pins" aria-hidden="true">
      ${areas.filter((a) => a.office === undefined).map((a) => {
        const i = order++;
        const left = a.xy[0] > UK_VIEW.width * 0.62;
        return `
      <g class="cov-pin${a.region ? " cov-pin--region" : ""}" data-loc="${a.key}" transform="translate(${a.xy[0]} ${a.xy[1]})" style="--i:${i}">
        ${a.region ? `<circle class="cov-pin__halo" r="${(a.title === "Wales" ? 46 : 22)}"></circle>` : ""}
        <circle class="cov-pin__ring" r="9"></circle>
        <circle class="cov-pin__dot" r="4.2"></circle>
        <text class="cov-pin__label" x="${left ? -12 : 12}" y="4" text-anchor="${left ? "end" : "start"}">${a.title}</text>
      </g>`;
      }).join("")}
      ${offices.map((o) => {
        const key = slug(o.name);
        return `
      <g class="cov-pin cov-pin--office" data-loc="${key}" transform="translate(${o.xy[0]} ${o.xy[1]})">
        <circle class="cov-pin__pulse" r="10"></circle>
        <circle class="cov-pin__ring" r="11"></circle>
        <circle class="cov-pin__dot" r="6"></circle>
        <text class="cov-pin__label" x="${key === "london" ? 14 : -14}" y="${key === "london" ? 14 : -8}" text-anchor="${key === "london" ? "start" : "end"}">${o.name}</text>
      </g>`;
      }).join("")}
    </g>
  </svg>`;

const coverIcons = ["headset", "mapPin", "shield", "layers"];

const main = `
<section class="hero hero--sky cov-hero" aria-labelledby="page-hero-title">
  <div class="container cov-hero__grid">
    <div class="cov-hero__copy">
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">Locations</p>
      <h1 class="hero-sky__title cov-hero__title" id="page-hero-title">${m.title}</h1>
      <p class="hero-sky__lead">${m.lead}</p>
      <dl class="cov-facts">
        <div><dt>Areas covered</dt><dd>${LOCATIONS.length}</dd></div>
        <div><dt>Offices: London &amp; Stevenage</dt><dd>2</dd></div>
        <div><dt>Average first response</dt><dd>9 min</dd></div>
      </dl>

      <nav class="cov-list" aria-labelledby="areas-title" data-cov-list>
        <p class="cov-list__eyebrow">${areasBlock.eyebrow || "Areas we cover"}</p>
        <h2 class="cov-list__title" id="areas-title">${areasBlock.title || "Local IT support, wherever you are"}</h2>
        <ul role="list">
          ${areas.map((a) => `
          <li><a href="@/${a.href}" data-loc="${a.key}">
            <span class="cov-list__dot${a.office !== undefined ? " cov-list__dot--office" : ""}" aria-hidden="true"></span>
            <span class="cov-list__name">${a.title}</span>
            ${a.office !== undefined ? `<span class="cov-list__tag">${a.office === 0 ? SITE.offices[0].label : "Office"}</span>` : ""}
            ${icon("arrow")}
          </a></li>`).join("")}
        </ul>
      </nav>
    </div>

    <figure class="cov-map" data-cov-map>
      ${map("cov")}
      <figcaption class="cov-map__caption">
        <span class="cov-map__key"><i class="cov-key cov-key--office" aria-hidden="true"></i>Our offices</span>
        <span class="cov-map__key"><i class="cov-key cov-key--area" aria-hidden="true"></i>Areas we cover</span>
        ${areasBlock.lead ? `<span class="cov-map__note">${areasBlock.lead}</span>` : ""}
      </figcaption>
    </figure>
  </div>
</section>

<section class="section cov-model" aria-labelledby="model-title">
  <div class="container">
    <div class="cov-model__head">
      <div>
        <p class="eyebrow">${coverBlock.eyebrow || "How we cover the UK"}</p>
        <h2 class="grad-head" id="model-title">${coverBlock.title || "Remote-first, onsite when it counts"}</h2>
      </div>
      ${paragraphs(coverBlock.html).map((t) => `<p class="cov-model__text">${t}</p>`).join("")}
    </div>
    <ol class="cov-steps" role="list">
      ${(coverBlock.list || []).map((item, i) => `
      <li class="cov-step" style="--i:${i}">
        <span class="cov-step__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="cov-step__icon" aria-hidden="true">${icon(coverIcons[i] || "checkCircle")}</span>
        <p>${item}</p>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section section--mist" aria-labelledby="offices-title">
  <div class="container">
    <div class="cov-model__head cov-model__head--center">
      <div>
        <p class="eyebrow">Our offices</p>
        <h2 class="grad-head" id="offices-title">Two bases, UK-wide coverage</h2>
      </div>
    </div>
    <div class="office-grid">${SITE.offices.map((o) => officeMapCard(o)).join("")}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="locations-cred-title">
  <div class="container">
    <div class="cred-why__head">
      <p class="eyebrow">${certBlock.eyebrow || "Certified & accredited"}</p>
      <h2 class="grad-head" id="locations-cred-title">${certBlock.title || "Credentials you can check"}</h2>
    </div>
    ${credBadges({ partners: true })}
  </div>
</section>
`;

page({
  footerCta: { title: "Looking for IT support near you?", text: "Tell us where you are and what you need. We'll tell you honestly whether we're the right fit.", track: "locations-cta" },
  file: "locations.html",
  title: "IT Support Locations Across the UK",
  description: "WhizzIT provides managed IT support across London, Hertfordshire and the rest of the UK, with offices in London and Stevenage.",
  bodyClass: "page--locations page--sky",
  crumbs,
  main,
});
