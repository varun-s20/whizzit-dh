// Managed Cloud Services overview. Signature: platform cards across the top and a
// four-step migration journey down the middle.
import { page, btn, icon, photo, breadcrumbs, service, SITE, TESTIMONIALS, PHOTOS, PARTNERS } from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { pageHero, heroProof, renderBlocks, subServiceGrid, reviewsBand, pricingPanel } from "../blocks.mjs";

const cloud = service("cloud");
const m = parsePage(pageByPath("/managed-cloud-services/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "IT Services", href: "it-services.html" }, { title: "Managed Cloud Services" }];

const block = (needle) => m.blocks.find((b) => b.title.toLowerCase().includes(needle)) || { html: "", list: [], cards: [] };
const covers = block("nothing missed");
const included = block("what’s included");
const why = block("why work with us");

const handled = [covers.title, included.title, why.title];
const rest = m.blocks.filter((b) => !handled.includes(b.title) && !/pricing built|related guides|our cloud services|what our cloud clients say/i.test(b.title));

// Platforms WhizzIT manages, named across the staging copy.
const platforms = [
  { title: "Microsoft 365", icon: "mail", text: "Licensing, identity, Exchange, SharePoint and Teams, managed and backed up as one estate." },
  { title: "Microsoft Azure", icon: "server", text: "Hosted servers, virtual desktops and infrastructure, sized and monitored so you only pay for what you use." },
  { title: "Google Workspace", icon: "globe", text: "Gmail, Drive and shared files managed day to day, with independent backup you can restore from." },
];

// Migration journey, as described in the cloud migration service copy.
const journey = [
  { title: "Plan", text: "We audit what you have, agree what moves, what gets retired and what the new setup should look like." },
  { title: "Prepare", text: "Licences, identity and security baselines are set up first, so nothing lands in an unprotected tenancy." },
  { title: "Migrate", text: "Mail, files and apps move in scheduled waves around your working week, with a rollback plan at every stage." },
  { title: "Support", text: "The same service desk that ran the migration supports it afterwards, so nothing gets handed to a stranger." },
];

const main = `
${pageHero({
  eyebrow: "Managed cloud services",
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  cls: "hero--tone-cloud",
  aside: heroProof([
    { icon: "cloud", value: "Microsoft CSP", label: "Direct Microsoft partnership" },
    { icon: "refresh", value: "Backed up", label: "Microsoft 365 and Google Workspace" },
    { icon: "clock", value: "9 min", label: "Average first response" },
  ]),
})}

<section class="section platforms" aria-labelledby="platforms-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Platforms we manage</p>
      <h2 class="grad-head" id="platforms-title">Your cloud, whichever one you run</h2>
      <p>One team for Microsoft and Google alike, so licensing, security and day-to-day support sit in one place.</p>
    </div>
    <div class="platform-grid">
      ${platforms.map((p) => `
      <article class="platform-card">
        <span class="platform-card__icon">${icon(p.icon)}</span>
        <h3>${p.title}</h3>
        <p>${p.text}</p>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="cloud-covers-title">
  <div class="container block-split">
    <div>
      <p class="eyebrow">${covers.eyebrow || "What it covers"}</p>
      <h2 class="grad-head" id="cloud-covers-title">${covers.title || "Everything handled, nothing missed"}</h2>
      ${covers.html ? `<div class="block-prose">${covers.html}</div>` : ""}
    </div>
    ${photo(PHOTOS.office, { cls: "block-photo", ratio: "4-3", sizes: "(min-width: 1024px) 45vw, 100vw" })}
  </div>
</section>

<section class="section section--mist journey-band" aria-labelledby="journey-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Migration</p>
        <h2 class="grad-head" id="journey-title">How a move to the cloud actually runs</h2>
        <p>Migrations are quiet when the decisions are made early. This is the sequence we follow on every move.</p>
      </div>
      ${btn("Plan a migration", "managed-cloud-services/cloud-migration-services.html", { variant: "secondary", arrow: false, track: "cloud-migration" })}
    </div>
    <ol class="journey-steps" role="list">
      ${journey.map((s, i) => `
      <li>
        <span class="journey-steps__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section" id="included" aria-labelledby="cloud-included-title">
  <div class="container block-split block-split--flip">
    <aside class="check-card check-card--lg">
      <h3>What's included</h3>
      <ul role="list">${(included.list.length ? included.list : cloud.tags).map((i) => `<li>${i}</li>`).join("")}</ul>
      ${btn("Get a tailored quote", "contact.html", { cls: "btn--block mt-6", arrow: false, track: "cloud-included-cta" })}
    </aside>
    <div>
      <p class="eyebrow">${included.eyebrow || "Managed cloud services"}</p>
      <h2 class="grad-head" id="cloud-included-title">Managed end to end, not just switched on</h2>
      <div class="block-prose">${included.html || `<p>${cloud.desc}</p>`}</div>
      <ul class="partner-row partner-row--inline mt-6" role="list">
        ${PARTNERS.slice(0, 4).map((p) => `<li><img src="@/assets/images/partners/${p.file}" alt="${p.title}" decoding="async"></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

${renderBlocks(rest, { key: "cloud" })}

<section class="section section--tight" aria-labelledby="cloud-why-title">
  <div class="container statement-wide">
    <div class="center-head">
      <p class="eyebrow">${why.eyebrow || "Why WhizzIT"}</p>
      <h2 class="grad-head" id="cloud-why-title">${why.title || "Why work with us?"}</h2>
    </div>
    ${why.html ? `<div class="prose-cols">${why.html}</div>` : ""}
  </div>
</section>

${subServiceGrid(cloud, { title: "Our cloud services" })}
${reviewsBand([TESTIMONIALS[3], TESTIMONIALS[1], TESTIMONIALS[2]], { title: "What our cloud clients say" })}
${pricingPanel({ track: "cloud-pricing" })}
`;

page({
  footerCta: {
    title: "Thinking about a move to the cloud?",
    text: "We will tell you what to move, what to leave and what it will cost before anything changes.",
    track: "cloud-final-cta",
  },
  file: "managed-cloud-services.html",
  title: "Managed Cloud Services | Microsoft 365 & Azure",
  description: "Managed cloud services from WhizzIT: Microsoft 365, Azure and Google Workspace managed end to end, with migration, backup and continuity built in.",
  bodyClass: "page--cloud page--sky tone-cloud",
  crumbs,
  main,
  schema: [{
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Managed Cloud Services",
    description: m.lead,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: "GB",
  }],
});
