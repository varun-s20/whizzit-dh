// IT Project Management overview. Signature: the four-stage delivery method runs
// down the page as a numbered spine.
import { page, statValue, btn, icon, photo, breadcrumbs, service, SITE, TESTIMONIALS, PHOTOS, STATS, credBadges, statStrip } from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { parseSections } from "../section-parse.mjs";
import { hubTail } from "../sections.mjs";
import { pageHero } from "../blocks.mjs";

const projects = service("projects");
const m = parsePage(pageByPath("/it-project-management/").html);
// Everything below the hand-built sections, with the staging copy (sections.mjs).
const P = parseSections(pageByPath("/it-project-management/").html);
const band = P.sections.find((s) => s.kind === "ctaBand");
const crumbs = [{ title: "Home", href: "index.html" }, { title: "IT Services", href: "it-services.html" }, { title: "IT Project Management" }];

const block = (needle) => m.blocks.find((b) => b.title.toLowerCase().includes(needle)) || { html: "", list: [], cards: [], eyebrow: "" };
const covers = block("every stage");
const method = block("delivery method");
const why = block("why work with us");


// Typical projects, drawn from the specialist services under this pillar.
const projectTypes = [
  { title: "Office moves and fit-outs", icon: "building", text: "Connectivity ordered early, cabling surveyed, kit moved over a weekend and working on Monday." },
  { title: "Cloud migrations", icon: "cloud", text: "Mail, files and apps moved in scheduled waves, with rollback plans at every stage." },
  { title: "Hardware refreshes", icon: "laptop", text: "Devices specified, imaged and rolled out without leaving anyone unable to work." },
  { title: "Security and compliance programmes", icon: "shield", text: "Controls introduced in an order that fits the business, with the evidence to show for it." },
];

const main = `
${pageHero({
  eyebrow: "IT project management",
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  cls: "hero--tone-projects",
  aside: statStrip({ compact: true, track: "it-project-management-hero" }),
})}

<section class="section" aria-labelledby="pm-covers-title">
  <div class="container block-split">
    <div>
      <p class="eyebrow">${covers.eyebrow || "What it covers"}</p>
      <h2 class="grad-head" id="pm-covers-title">${covers.title || "Every stage, expertly managed"}</h2>
      ${covers.html ? `<div class="block-prose">${covers.html}</div>` : ""}
      <div class="btn-group mt-6">
        ${btn("Talk about your project", "contact.html", { arrow: false, track: "pm-talk" })}
      </div>
    </div>
    ${photo(PHOTOS.van, { cls: "block-photo", ratio: "4-3", sizes: "(min-width: 1024px) 45vw, 100vw", loading: "eager" })}
  </div>
</section>

<section class="section section--mist" aria-labelledby="method-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">${method.eyebrow || "How we deliver"}</p>
        <h2 class="grad-head" id="method-title">${method.title || "A proven delivery method"}</h2>
        ${method.html ? `<div class="block-prose">${method.html}</div>` : ""}
      </div>
    </div>
    <ol class="spine" role="list">
      ${(method.cards.length ? method.cards : projectTypes).map((c, i) => `
      <li class="spine__step">
        <span class="spine__marker">${String(i + 1).padStart(2, "0")}</span>
        <div class="spine__body">
          <h3>${c.title}</h3>
          <p>${c.text}</p>
        </div>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section" id="project-types" aria-labelledby="types-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Typical projects</p>
      <h2 class="grad-head" id="types-title">The work we are usually called in for</h2>
    </div>
    <div class="detail-grid detail-grid--2">
      ${projectTypes.map((t, i) => `
      <article class="detail-card detail-card--icon">
        <span class="detail-card__icon">${icon(t.icon)}</span>
        <span class="detail-card__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${t.title}</h3>
        <p>${t.text}</p>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="section stat-band" aria-labelledby="pm-stats-title">
  <div class="container">
    <div class="stat-band__head">
      <p class="eyebrow">By the numbers</p>
      <h2 class="grad-head grad-head--dark" id="pm-stats-title">Proof, not promises</h2>
    </div>
    ${statStrip({ track: "pm-proof" })}
    <p class="stat-band__source">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
  </div>
</section>

${hubTail(P, { slug: "it-project-management", tone: "projects" }, { skip: [covers.title, method.title], cardsOf: [covers.title] })}
`;

page({
  footerCta: {
    title: band?.title || "Got a move, migration or upgrade coming?",
    text: band?.text || "Tell us the deadline. We will work backwards from it and tell you what has to happen when.",
    track: "pm-final-cta",
  },
  file: "it-project-management.html",
  title: "IT Project Management Services",
  description: "IT project management from WhizzIT: office moves, migrations, upgrades and IT strategy delivered on time, without disrupting your team.",
  bodyClass: "page--projects page--sky tone-projects",
  crumbs,
  main,
  schema: [{
    "@context": "https://schema.org",
    "@type": "Service",
    name: "IT Project Management",
    description: m.lead,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: "GB",
  }],
});
