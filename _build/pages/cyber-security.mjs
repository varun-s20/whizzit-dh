// Cyber Security overview. Signature: the layered-defence stack, with the
// Cyber Essentials certification pulled out as its own feature.
import { page, btn, icon, breadcrumbs, service, SITE, TESTIMONIALS, CREDENTIALS, statStrip } from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { parseSections } from "../section-parse.mjs";
import { hubTail } from "../sections.mjs";
import { pageHero } from "../blocks.mjs";

const cyber = service("cyber");
const m = parsePage(pageByPath("/cyber-security/").html);
// Everything below the hand-built sections, with the staging copy (sections.mjs).
const P = parseSections(pageByPath("/cyber-security/").html);
const band = P.sections.find((s) => s.kind === "ctaBand");
const crumbs = [{ title: "Home", href: "index.html" }, { title: "IT Services", href: "it-services.html" }, { title: "Cyber Security" }];

const block = (needle) => m.blocks.find((b) => b.title.toLowerCase().includes(needle)) || { html: "", list: [], cards: [] };
const covers = block("defence in depth");
const included = block("what’s included");
const trust = block("security you can trust");


// The layers WhizzIT protects, each one pointing at the service that covers it.
const layers = [
  { title: "People", icon: "users", text: "Security awareness training and phishing simulation, so the team recognises what gets through.", href: "cyber-security/security-awareness-training-services.html" },
  { title: "Email", icon: "mail", text: "Filtering, impersonation protection and domain authentication across Microsoft 365 and Google Workspace.", href: "cyber-security/email-security-services.html" },
  { title: "Identity", icon: "key", text: "Multi-factor authentication, conditional access and managed passwords for every account.", href: "cyber-security/password-management-services.html" },
  { title: "Devices", icon: "laptop", text: "Managed endpoint protection with alerts investigated by people, not just logged.", href: "cyber-security/managed-detection-response-services.html" },
  { title: "Network", icon: "network", text: "Firewalls, segmentation and secure remote access, monitored around the clock.", href: "cyber-security/network-security-services.html" },
  { title: "Evidence", icon: "fileCheck", text: "Configuration reviews, penetration testing and the reporting that proves controls work.", href: "cyber-security/penetration-testing-services.html" },
];

const main = `
${pageHero({
  eyebrow: "Cyber security",
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  cls: "hero--tone-cyber",
  aside: statStrip({ compact: true, track: "cyber-security-hero" }),
})}

<section class="section defence" aria-labelledby="layers-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">${covers.eyebrow || "What it covers"}</p>
        <h2 class="grad-head" id="layers-title">${covers.title || "Defence in depth for your business"}</h2>
        ${covers.html ? `<div class="block-prose">${covers.html}</div>` : ""}
      </div>
      ${btn("Book a security review", "contact.html", { arrow: false, track: "cyber-review" })}
    </div>
    <ol class="layer-stack" role="list">
      ${layers.map((l, i) => `
      <li class="defence-layer">
        <a href="@/${l.href}">
          <span class="defence-layer__num">${String(i + 1).padStart(2, "0")}</span>
          <span class="defence-layer__icon">${icon(l.icon)}</span>
          <span class="defence-layer__body">
            <strong>${l.title}</strong>
            <span>${l.text}</span>
          </span>
          ${icon("arrow")}
        </a>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section section--mist" aria-labelledby="ce-title">
  <div class="container ce-feature">
    <div class="ce-feature__body">
      <p class="eyebrow">Certified &amp; accredited</p>
      <h2 class="grad-head" id="ce-title">${CREDENTIALS[0].title}</h2>
      <p>${CREDENTIALS[0].text}</p>
      <p class="small muted">Cyber Essentials is a UK government scheme run by the <a href="https://www.ncsc.gov.uk/cyberessentials/overview" rel="noopener">National Cyber Security Centre</a>, delivered by <a href="https://iasme.co.uk/cyber-essentials/" rel="noopener">IASME</a>.</p>
      <div class="btn-group mt-6">
        ${btn("Get Cyber Essentials certified", "cyber-security/cyber-essentials-services.html", { arrow: false, track: "cyber-ce" })}
      </div>
    </div>
    <div class="ce-feature__badge">
      <img src="@/assets/images/partners/cyber-essentials.webp" alt="Cyber Essentials certified" width="180" height="120" decoding="async">
    </div>
  </div>
</section>

<section class="section" id="included" aria-labelledby="cyber-included-title">
  <div class="container block-split">
    <div>
      <p class="eyebrow">${included.eyebrow || "Cyber security"}</p>
      <h2 class="grad-head" id="cyber-included-title">Protection that is configured, monitored and evidenced</h2>
      <div class="block-prose">${included.html || `<p>${cyber.desc}</p>`}</div>
      ${trust.html ? `<div class="block-prose">${trust.html}</div>` : ""}
    </div>
    <aside class="check-card check-card--lg">
      <h3>What's included</h3>
      <ul role="list">${(included.list.length ? included.list : cyber.tags).map((i) => `<li>${i}</li>`).join("")}</ul>
      ${btn("Talk to a security engineer", "contact.html", { cls: "btn--block mt-6", arrow: false, track: "cyber-included-cta" })}
    </aside>
  </div>
</section>

${trust.cards.length ? `
<section class="section section--tight" aria-labelledby="trust-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">${trust.eyebrow || "All-around defence"}</p>
      <h2 class="grad-head" id="trust-title">${trust.title}</h2>
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

${hubTail(P, { slug: "cyber-security", tone: "cyber" }, { skip: [covers.title, included.title, trust.title], cardsOf: [covers.title] })}
`;

page({
  footerCta: {
    title: band?.title || "Not sure where your gaps are?",
    text: band?.text || "Book a security review. We will tell you what to fix first, in plain English, with evidence.",
    track: "cyber-final-cta",
  },
  file: "cyber-security.html",
  title: "Managed Cyber Security Services for Business",
  description: "Managed cyber security from WhizzIT: layered protection across email, identity, devices and networks, with Cyber Essentials certification support.",
  bodyClass: "page--cyber page--sky tone-cyber",
  crumbs,
  main,
  schema: [{
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Managed Cyber Security",
    description: m.lead,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: "GB",
  }],
});
