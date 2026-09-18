// Template families for the wider ~100-page site.
// Copy an entry below (or call the function with new data) to add a page.
import {
  page, btn, icon, sectionHead, features, steps, faq, ctaBand, testimonial, relatedServices, checkList, spotlight,
  serviceRow, breadcrumbs, stats, certBadges, cleanUrl, service, ph, SITE,
} from "../lib.mjs";
import { pageByPath, prose, lastUpdated } from "../content.mjs";

/* ==========================================================================
   SERVICE DETAIL TEMPLATE
   ========================================================================== */
export function serviceDetail(d) {
  const crumbs = [
    { title: "Home", href: "index.html" },
    { title: "IT Services", href: "it-services.html" },
    ...(d.parent ? [{ title: service(d.parent).title, href: service(d.parent).href }] : []),
    { title: d.title },
  ];
  const tone = d.parent ? service(d.parent).tone : "support";

  const main = `
<section class="hero hero--service" aria-labelledby="svc-title">
  <div class="container hero__grid">
    <div>
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">${d.eyebrow}</p>
      <h1 class="hero__title" id="svc-title">${d.headline}</h1>
      <p class="lead hero__lead">${d.lead}</p>
      <div class="btn-group hero__actions">${btn(d.cta || "Book a consultation", "contact.html", { size: "lg", track: `${d.slug}-hero-cta` })}</div>
    </div>
    <aside class="service-summary" aria-labelledby="summary-title">
      <span class="icon-tile icon-tile--lg tone-${tone}">${icon(d.icon)}</span>
      <h2 class="mt-5" id="summary-title">At a glance</h2>
      ${checkList(d.summary)}
    </aside>
  </div>
</section>

<section class="section" aria-labelledby="need-title">
  <div class="container split split--top">
    <div>
      <p class="eyebrow">The problem</p>
      <h2 id="need-title">${d.problem.title}</h2>
    </div>
    <div class="stack--lg"><p class="lead">${d.problem.text}</p></div>
  </div>
</section>

<section class="section section--mist" aria-labelledby="solution-title">
  <div class="container">
    ${sectionHead({ eyebrow: "Our solution", title: `<span id="solution-title">${d.solution.title}</span>`, lead: d.solution.text, align: "split" })}
    ${features(d.capabilities.map((c) => ({ ...c, tone })))}
  </div>
</section>

<section class="section" aria-labelledby="benefits-title">
  <div class="container split">
    <div>
      <h2 id="benefits-title">What it means for your business</h2>
    </div>
    ${checkList(d.benefits, "check-list--two")}
  </div>
</section>

<section class="section section--dark" aria-labelledby="process-title">
  <div class="container">
    ${sectionHead({ eyebrow: "How it works", title: `<span id="process-title">${d.processTitle}</span>`, align: "split" })}
    ${steps(d.process)}
  </div>
</section>

<section class="section" aria-labelledby="proof-title">
  <div class="container split">
    <div>
      <h2 id="proof-title">Trusted by businesses like yours</h2>
      <div class="mt-6">${certBadges([{ title: "[Relevant accreditation]", icon: "award" }, { title: "[Technology partner]", icon: "shield" }])}</div>
    </div>
    ${testimonial({ quote: d.quote })}
  </div>
</section>

${relatedServices(d.related, { title: "Related services" })}
${faq(d.faq)}
${ctaBand({ title: d.ctaTitle, text: d.ctaText, cta: d.cta || "Book a consultation", track: `${d.slug}-final-cta` })}
`;

  page({
    file: `services/${d.slug}.html`,
    title: d.title,
    description: d.description,
    bodyClass: `page--service page--${d.slug}`,
    crumbs,
    main,
    schema: [{ "@context": "https://schema.org", "@type": "Service", name: d.title, provider: { "@type": "Organization", name: "WhizzIT" }, areaServed: "GB", url: cleanUrl(`services/${d.slug}.html`) }],
  });
}


/* ==========================================================================
   INDUSTRY TEMPLATE
   ========================================================================== */
export function industryPage(d) {
  const crumbs = [{ title: "Home", href: "index.html" }, { title: "Industries", href: "industries.html" }, { title: d.title }];

  const main = `
<section class="hero hero--industry" aria-labelledby="ind-title">
  <div class="container hero__grid">
    <div>
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">${d.eyebrow}</p>
      <h1 class="hero__title" id="ind-title">${d.headline}</h1>
      <p class="lead hero__lead">${d.lead}</p>
      <div class="btn-group hero__actions">${btn("Talk to a sector specialist", "contact.html", { size: "lg", track: `industry-${d.slug}-hero-cta` })}</div>
    </div>
    <div class="industry-hero-card">
      <span class="icon-tile icon-tile--lg">${icon(d.icon)}</span>
      <p class="industry-hero-card__title">Built around ${d.title.toLowerCase()} firms</p>
      ${checkList(d.promises)}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="challenges-title">
  <div class="container">
    ${sectionHead({ title: `<span id="challenges-title">The IT challenges ${d.title.toLowerCase()} teams tell us about.</span>`, align: "split", lead: d.challengesLead })}
    ${features(d.challenges)}
  </div>
</section>

<section class="section section--mist" aria-labelledby="solutions-title">
  <div class="container split split--top">
    <div class="faq__intro">
      <p class="eyebrow">How WhizzIT helps</p>
      <h2 id="solutions-title">${d.solutionsTitle}</h2>
    </div>
    <div class="stack">${d.services.map((s) => serviceRow(service(s.key), { desc: s.text })).join("")}</div>
  </div>
</section>

<section class="section section--dark" aria-labelledby="compliance-title">
  <div class="container split">
    <div>
      <p class="eyebrow">Security and compliance</p>
      <h2 id="compliance-title">${d.complianceTitle}</h2>
      <p class="lead mt-5">${d.complianceText}</p>
    </div>
    ${checkList(d.compliance)}
  </div>
</section>

<section class="section" aria-labelledby="ind-stats-title">
  <div class="container">
    ${sectionHead({ title: `<span id="ind-stats-title">${d.title} customers at a glance</span>`, align: "split", lead: "Verified sector figures will be added here." })}
    ${stats([{ label: `${d.title} firms supported` }, { label: "Users supported in the sector" }, { label: "Average customer tenure" }, { label: "Satisfaction score" }])}
  </div>
</section>

<section class="section section--flush-top" aria-labelledby="case-title">
  <div class="container">
    ${sectionHead({ eyebrow: "Case study", title: `<span id="case-title">${d.caseTitle}</span>` })}
    ${spotlight(d.caseStudy)}
  </div>
</section>

${faq(d.faq)}
${ctaBand({ title: d.ctaTitle, text: d.ctaText, track: `industry-${d.slug}-final-cta` })}
`;

  page({
    file: `industries/${d.slug}.html`,
    title: d.metaTitle,
    description: d.description,
    bodyClass: `page--industry page--industry-${d.slug}`,
    crumbs,
    main,
  });
}


/* ==========================================================================
   GENERIC INFORMATIONAL TEMPLATE (legal / corporate pages)
   ========================================================================== */
export function infoPage({ file, title, description, intro, updated = "", body = "" }) {
  const crumbs = [{ title: "Home", href: "index.html" }, { title }];
  const main = `
<section class="hero hero--simple" aria-labelledby="info-title">
  <div class="container container--copy">
    ${breadcrumbs(crumbs)}
    <h1 id="info-title" class="h2">${title}</h1>
    <p class="lead mt-5">${intro}</p>
    <p class="small muted mt-5">Last updated: ${updated || ph("date")}</p>
  </div>
</section>
<section class="section">
  <div class="container container--copy prose">
    ${body || `<p>${ph(`Client to supply approved ${title.toLowerCase()} wording`)}</p>`}
    ${/contact/i.test(body) ? "" : `<h2>Contact</h2><p>Questions about this ${title.toLowerCase()} can be sent to <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`}
  </div>
</section>`;
  page({ file, title, description, bodyClass: "page--info", crumbs, main });
}

// Legal pages: wording comes straight from staging so nothing is invented.
[
  { slug: "privacy-policy", title: "Privacy Policy", description: "How WhizzIT collects, uses and protects personal information.", intro: "How we collect, use and protect personal information when you use this website or our services." },
  { slug: "cookie-policy", title: "Cookie Policy", description: "Information about the cookies used on the WhizzIT website.", intro: "Which cookies this website uses, why, and how you can control them." },
].forEach((doc) => {
  const source = pageByPath(`/${doc.slug}/`);
  infoPage({
    file: `${doc.slug}.html`,
    title: doc.title,
    description: doc.description,
    intro: doc.intro,
    updated: source ? lastUpdated(source.html) : "",
    // The staging copy carries an internal note to the client; it is not page copy.
    body: source ? prose(source.html).replace(/<p>[^<]*provided as a starting template[\s\S]*?<\/p>/gi, "") : "",
  });
});
