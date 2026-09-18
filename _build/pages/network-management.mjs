// Network Management overview. Signature: a monitoring panel showing what we watch,
// paired with the site-by-site coverage list.
import { page, btn, icon, photo, breadcrumbs, ctaBand, service, SITE, TESTIMONIALS, PHOTOS, LOCATIONS } from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { pageHero, heroProof, renderBlocks, subServiceGrid, reviewsBand, pricingPanel } from "../blocks.mjs";

const network = service("network");
const m = parsePage(pageByPath("/network-management/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "IT Services", href: "it-services.html" }, { title: "Network Management" }];

const block = (needle) => m.blocks.find((b) => b.title.toLowerCase().includes(needle)) || { html: "", list: [], cards: [] };
const covers = block("expert hands");
const included = block("what’s included");
const trust = block("support you can trust");

const handled = [covers.title, included.title, trust.title];
const rest = m.blocks.filter((b) => !handled.includes(b.title) && !/pricing built|related guides|network management services|what our clients say/i.test(b.title));

// What continuous monitoring actually watches, in the order an engineer checks it.
const monitored = [
  { title: "Connectivity", icon: "globe", note: "Lines, failover and latency at every site" },
  { title: "Firewalls", icon: "lock", note: "Rules, firmware and blocked traffic" },
  { title: "Wi-Fi", icon: "wifi", note: "Coverage, channels and access-point health" },
  { title: "Switching", icon: "network", note: "Port errors, capacity and VLAN changes" },
  { title: "Backups", icon: "refresh", note: "Config backups so a failed device is a swap, not a rebuild" },
  { title: "Alerts", icon: "alert", note: "Investigated by an engineer before you notice" },
];

const main = `
${pageHero({
  eyebrow: "Network management",
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  cls: "hero--tone-network",
  aside: heroProof([
    { icon: "activity", value: "24/7", label: "Monitoring and alerting" },
    { icon: "wifi", value: "Multi-site", label: "Offices, sites and remote teams" },
    { icon: "clock", value: "9 min", label: "Average first response" },
  ]),
})}

<section class="section" aria-labelledby="network-covers-title">
  <div class="container block-split">
    <div>
      <p class="eyebrow">${covers.eyebrow || "What it covers"}</p>
      <h2 class="grad-head" id="network-covers-title">${covers.title || "Your infrastructure, in expert hands"}</h2>
      ${covers.html ? `<div class="block-prose">${covers.html}</div>` : ""}
      <div class="btn-group mt-6">
        ${btn("Book a network review", "contact.html", { arrow: false, track: "network-review" })}
      </div>
    </div>
    ${photo(PHOTOS.network, { cls: "block-photo", ratio: "4-3", sizes: "(min-width: 1024px) 45vw, 100vw", loading: "eager" })}
  </div>
</section>

<section class="section section--mist" aria-labelledby="monitor-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Always watching</p>
      <h2 class="grad-head" id="monitor-title">What we monitor, around the clock</h2>
      <p>Most network problems announce themselves before anyone raises a ticket. These are the things we watch so they do not reach your team.</p>
    </div>
    <div class="monitor-panel">
      <div class="monitor-panel__head">
        <span class="status-dot status-dot--live" aria-hidden="true"></span>
        <strong>Network health</strong>
        <span>Illustrative view of a monitored estate</span>
      </div>
      <ul class="monitor-grid" role="list">
        ${monitored.map((x) => `
        <li>
          <span class="monitor-grid__icon">${icon(x.icon)}</span>
          <strong>${x.title}</strong>
          <span>${x.note}</span>
          <span class="monitor-grid__state">${icon("checkCircle")}Healthy</span>
        </li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="section" id="included" aria-labelledby="network-included-title">
  <div class="container block-split block-split--flip">
    <aside class="check-card check-card--lg">
      <h3>What's included</h3>
      <ul role="list">${(included.list.length ? included.list : network.tags).map((i) => `<li>${i}</li>`).join("")}</ul>
      ${btn("Get a tailored quote", "contact.html", { cls: "btn--block mt-6", arrow: false, track: "network-included-cta" })}
    </aside>
    <div>
      <p class="eyebrow">${included.eyebrow || "Network management"}</p>
      <h2 class="grad-head" id="network-included-title">Designed, built and kept running</h2>
      <div class="block-prose">${included.html || `<p>${network.desc}</p>`}</div>
      ${trust.html ? `<div class="block-prose">${trust.html}</div>` : ""}
    </div>
  </div>
</section>

${trust.cards.length ? `
<section class="section section--tight" aria-labelledby="network-trust-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">${trust.eyebrow || "Why WhizzIT"}</p>
      <h2 class="grad-head" id="network-trust-title">${trust.title}</h2>
    </div>
    <div class="detail-grid detail-grid--3">
      ${trust.cards.map((c, n) => `
      <article class="detail-card">
        <span class="detail-card__num">${String(n + 1).padStart(2, "0")}</span>
        <h3>${c.title}</h3>
        <p>${c.text}</p>
      </article>`).join("")}
    </div>
  </div>
</section>` : ""}

${renderBlocks(rest, { key: "network" })}
${subServiceGrid(network, { title: "Network management services" })}

<section class="section section--tight" aria-labelledby="network-areas-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Coverage</p>
        <h2 class="grad-head" id="network-areas-title">Every site, wherever it is</h2>
        <p>Cabling, Wi-Fi and firewalls installed and supported across the areas we cover, with remote monitoring everywhere in between.</p>
      </div>
      ${btn("All locations", "locations.html", { variant: "secondary", arrow: false, track: "network-locations" })}
    </div>
    <ul class="area-chips" role="list">
      ${LOCATIONS.slice(0, 10).map((l) => `<li><a href="@/${l.href}">${icon("mapPin")}${l.title}</a></li>`).join("")}
    </ul>
  </div>
</section>

${reviewsBand([TESTIMONIALS[4], TESTIMONIALS[2], TESTIMONIALS[0]], { title: "What our clients say" })}
${pricingPanel({ track: "network-pricing" })}
${ctaBand({
  title: "Tired of blaming the Wi-Fi?",
  text: "We will survey what you have, tell you what is actually wrong and fix it properly.",
  track: "network-final-cta",
})}
`;

page({
  file: "network-management.html",
  title: "Managed Network Services & 24/7 Monitoring",
  description: "Managed network services from WhizzIT: firewalls, business Wi-Fi, structured cabling, SD-WAN and 24/7 network monitoring for UK businesses.",
  bodyClass: "page--network page--sky tone-network",
  crumbs,
  main,
  schema: [{
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Network Management",
    description: m.lead,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: "GB",
  }],
});
