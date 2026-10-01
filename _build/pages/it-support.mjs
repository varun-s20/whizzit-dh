// IT Support overview. Signature: the remote/on-site split as a head-to-head
// comparison, with the service-desk numbers running underneath it.
import { page, btn, icon, photo, breadcrumbs, service, SITE, TESTIMONIALS, PHOTOS, CREDENTIALS, credBadges } from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { pageHero, heroProof, renderBlocks, subServiceGrid, reviewsBand, pricingPanel } from "../blocks.mjs";

const support = service("support");
const m = parsePage(pageByPath("/it-support/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "IT Services", href: "it-services.html" }, { title: "IT Support" }];

const block = (needle) => m.blocks.find((b) => b.title.toLowerCase().includes(needle)) || { html: "", list: [], cards: [] };
const howItWorks = block("remote first");
const covers = block("whole environment");
const included = block("what’s included");
const why = block("why work with us");

// Content blocks left for the generic renderer (the rest are laid out by hand).
const handled = [howItWorks.title, covers.title, included.title, why.title];
const rest = m.blocks.filter((b) => !handled.includes(b.title) && !/pricing built|related guides|what our support clients say/i.test(b.title));

const main = `
${pageHero({
  eyebrow: "Managed IT support",
  title: m.title,
  lead: m.lead,
  crumbs: breadcrumbs(crumbs),
  cls: "hero--tone-support",
  aside: heroProof([
    { icon: "clock", value: "9 min", label: "Average first response in 2025" },
    { icon: "refresh", value: "6 hours", label: "Average resolution time" },
    { icon: "headset", value: "Unlimited", label: "Remote service desk" },
  ]),
})}

<section class="section" aria-labelledby="covers-title">
  <div class="container block-split">
    <div>
      <p class="eyebrow">${covers.eyebrow || "What it covers"}</p>
      <h2 class="grad-head" id="covers-title">${covers.title || "Support for your whole environment"}</h2>
      ${covers.html ? `<div class="block-prose">${covers.html}</div>` : ""}
      <div class="btn-group mt-6">${btn("See what's included", "#included", { variant: "secondary", arrow: false, track: "support-included" })}</div>
    </div>
    ${photo(PHOTOS.headset, { cls: "block-photo", ratio: "4-3", sizes: "(min-width: 1024px) 45vw, 100vw", loading: "eager" })}
  </div>
</section>

<section class="section versus" aria-labelledby="versus-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">${howItWorks.eyebrow || "How it works"}</p>
      <h2 class="grad-head" id="versus-title">${howItWorks.title || "Remote first, onsite when it needs hands"}</h2>
    </div>
    <div class="versus__grid">
      ${howItWorks.cards.map((c, i) => `
      <article class="versus__card${i === 0 ? " versus__card--primary" : ""}">
        <span class="versus__icon">${icon(i === 0 ? "remote" : "building")}</span>
        <h3>${c.title}</h3>
        <p>${c.text}</p>
      </article>`).join("")}
      <div class="versus__divider" aria-hidden="true"><span>then</span></div>
    </div>
  </div>
</section>

<section class="section section--mist" id="included" aria-labelledby="included-title">
  <div class="container block-split block-split--flip">
    <aside class="check-card check-card--lg">
      <h3>What's included</h3>
      <ul role="list">${(included.list.length ? included.list : support.tags).map((i) => `<li>${i}</li>`).join("")}</ul>
      ${btn("Get a tailored quote", "contact.html", { cls: "btn--block mt-6", arrow: false, track: "support-included-cta" })}
    </aside>
    <div>
      <p class="eyebrow">${included.eyebrow || "Managed IT support"}</p>
      <h2 class="grad-head" id="included-title">Everything your team needs, in one plan</h2>
      <div class="block-prose">${included.html || `<p>${support.desc}</p>`}</div>
      <ul class="mini-facts" role="list">
        <li>${icon("checkCircle")}ITIL-aligned processes</li>
        <li>${icon("checkCircle")}UK-based service desk</li>
        <li>${icon("checkCircle")}Proactive monitoring and patching</li>
        <li>${icon("checkCircle")}${SITE.responseLine}</li>
      </ul>
    </div>
  </div>
</section>

${renderBlocks(rest, { key: "support" })}

<section class="section" aria-labelledby="why-title">
  <div class="container statement-wide">
    <div class="center-head">
      <p class="eyebrow">${why.eyebrow || "Why WhizzIT"}</p>
      <h2 class="grad-head" id="why-title">${why.title || "Why work with us?"}</h2>
    </div>
    ${why.html ? `<div class="prose-cols">${why.html}</div>` : ""}
    ${credBadges()}
  </div>
</section>

${subServiceGrid(support, { title: "Specialist support services" })}
${reviewsBand([TESTIMONIALS[0], TESTIMONIALS[4], TESTIMONIALS[5]], { title: "What our support clients say" })}
${pricingPanel({ track: "support-pricing" })}
`;

page({
  footerCta: {
    title: "Want support that answers the phone?",
    text: `Book a no-obligation conversation. ${SITE.responseLine}, UK-wide coverage.`,
    track: "support-final-cta",
  },
  file: "it-support.html",
  title: "Managed IT Support Services",
  description: "Managed IT support from WhizzIT: unlimited remote service desk, on-site engineers and ITIL-aligned processes. 9 minute average first response.",
  bodyClass: "page--support page--sky tone-support",
  crumbs,
  main,
  schema: [{
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Managed IT Support",
    description: m.lead,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: "GB",
  }],
});
