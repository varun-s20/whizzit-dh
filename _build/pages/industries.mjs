// Industries hub. Signature: a sector directory where each card carries its own
// risk line, paired with the sector-specific case studies.
import {
  page, btn, icon, photo, stockPhoto, breadcrumbs, ctaBand, serviceRow,
  SITE, SERVICES, INDUSTRIES, CASE_STUDIES, TESTIMONIALS, PHOTOS, CREDENTIALS, STOCK, SECTOR_PHOTO,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { pageHero, heroProof, reviewsBand } from "../blocks.mjs";

const m = parsePage(pageByPath("/industries/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "Industries" }];

// What each sector tends to come to us for — drawn from the sector pages.
const SECTOR_NOTE = {
  "business-services": "Client confidentiality, billable hours and systems that cannot be down in a working day.",
  construction: "Site connectivity, rugged kit and project data that has to reach the office.",
  healthcare: "Patient data, GDPR obligations and systems clinicians depend on daily.",
  financial: "Regulated data, evidence for audits and resilient access to platforms.",
  legal: "Case files, client obligations and security questionnaires that have to be answered.",
  education: "Safeguarding, classroom technology and budgets that have to stretch.",
  manufacturing: "ERP platforms, connected machinery and multi-site connectivity.",
  insurance: "Policy platforms, claims systems and fast access to customer records.",
};

const main = `
${pageHero({
  eyebrow: "Industries",
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  aside: heroProof([
    { icon: "briefcase", value: `${INDUSTRIES.length} sectors`, label: "With dedicated support pages" },
    { icon: "shield", value: "Cyber Essentials", label: "Certified provider" },
    { icon: "clock", value: "9 min", label: "Average first response" },
  ]),
})}

<section class="section" aria-labelledby="directory-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Industries we support</p>
        <h2 class="grad-head" id="directory-title">Find your industry</h2>
        <p>Every industry uses technology differently. Pick yours to see the risks we plan around and the systems we support.</p>
      </div>
      ${btn("Not listed? Talk to us", "contact.html", { variant: "secondary", arrow: false, track: "industries-contact" })}
    </div>
    <div class="sector-directory">
      ${INDUSTRIES.map((s, i) => `
      <article class="sector-tile sector-tile--photo">
        <a class="card-link" href="@/${s.href}" aria-label="${s.title}"></a>
        ${stockPhoto(STOCK[SECTOR_PHOTO[s.key]], { cls: "sector-tile__photo", ratio: "3-2", sizes: "(min-width: 1024px) 24vw, 100vw" })}
        <span class="sector-tile__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <p class="sector-tile__note">${icon("alert")}${SECTOR_NOTE[s.key] || ""}</p>
        <span class="read-more" aria-hidden="true">See ${s.title.toLowerCase()} IT support ${icon("arrow")}</span>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="section section--mist" aria-labelledby="sector-services-title">
  <div class="container block-split">
    <div>
      <p class="eyebrow">The same team, whatever your sector</p>
      <h2 class="grad-head" id="sector-services-title">Five services, shaped around how you work</h2>
      <p class="block-prose">We do not run a different business for each industry. We run the same five services, then shape the detail — the risks we plan for, the systems we support and the evidence we produce — around the way your sector works.</p>
      <div class="btn-group mt-6">
        ${btn("Explore IT services", "it-services.html", { arrow: false, track: "industries-services" })}
      </div>
    </div>
    <div class="related-grid">${SERVICES.map((s) => serviceRow(s)).join("")}</div>
  </div>
</section>

<section class="section" id="stories" aria-labelledby="sector-stories-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Proof</p>
        <h2 class="grad-head" id="sector-stories-title">Sector stories</h2>
        <p>Four businesses, four sectors, one service desk.</p>
      </div>
      ${btn("All customer stories", "our-customers.html#stories", { variant: "secondary", arrow: false, track: "industries-stories" })}
    </div>
    <div class="project-grid">
      ${CASE_STUDIES.map((c, i) => `
      <article class="project-card">
        ${photo([PHOTOS.van, PHOTOS.serviceDesk, PHOTOS.network, PHOTOS.team][i % 4], { cls: "project-card__art", ratio: "3-2", sizes: "(min-width: 768px) 45vw, 100vw" })}
        <span class="tag">${c.sector}</span>
        <h3 class="project-card__title"><a class="card-link" href="@/our-customers/${c.slug}.html">${c.title}</a></h3>
        <p>${c.excerpt}</p>
        <span class="read-more" aria-hidden="true">Read the story ${icon("arrow")}</span>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="industries-cred-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Certified &amp; accredited</p>
      <h2 class="grad-head" id="industries-cred-title">Credentials your auditors can check</h2>
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

${reviewsBand([TESTIMONIALS[2], TESTIMONIALS[4], TESTIMONIALS[3]], { title: "What businesses like yours say", eyebrow: "Reviews" })}

${ctaBand({
  title: "Looking for IT support that understands your industry?",
  text: `Tell us how your sector works and what it has to prove. ${SITE.responseLine}.`,
  track: "industries-final-cta",
})}
`;

page({
  file: "industries.html",
  title: "Specialist IT Support by Industry & Sector",
  description: "Specialist managed IT support by sector: business services, construction, healthcare, financial services, legal, education, manufacturing and insurance.",
  bodyClass: "page--industries page--sky",
  crumbs,
  main,
});
