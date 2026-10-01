// Every sub-page of the site: 30 sub-services, 14 locations plus the
// locations index, 4 case studies and the two standalone pages. Content is parsed
// from the staging export, so the copy and URLs stay exactly as the client has them.
import {
  page, reviewAvatar, btn, icon, photo, stockPhoto, casePhoto, breadcrumbs, serviceRow, textLink, credBadges, WP_EXPORT,
  SITE, SERVICES, INDUSTRIES, LOCATIONS, CASE_STUDIES, PARTNERS, PHOTOS, TESTIMONIALS, CREDENTIALS, STOCK, SECTOR_PHOTO,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { renderBlocks, pageHero, heroProof } from "../blocks.mjs";

const stagingPath = (href) => `/${href.replace(/\.html$/, "/")}`;
const model = (href) => {
  const source = pageByPath(stagingPath(href));
  return source ? { ...parsePage(source.html), source } : null;
};
const first = (s, fallback) => (s && s.length > 40 ? s : fallback);

/* ---------- Standard trailing sections ---------- */
// "Why WhizzIT": the two credentials as large badges, the partner logos below.
const credentialStrip = () => `
<section class="section section--tight cred-why" aria-labelledby="cred-why-title">
  <div class="container">
    <div class="cred-why__head">
      <p class="eyebrow">Why WhizzIT</p>
      <h2 class="grad-head" id="cred-why-title">Credentials you can check</h2>
    </div>
    ${credBadges({ partners: true })}
  </div>
</section>`;

const reviewStrip = (review) => `
<section class="section section--tight" aria-label="Customer review">
  <div class="container">
    <figure class="quote-feature">
      <span class="quote-feature__mark" aria-hidden="true">${icon("quote")}</span>
      <blockquote><p>“${review.quote}”</p></blockquote>
      <figcaption>
        ${reviewAvatar(review, { badge: true })}
        <span><strong>${review.name}</strong>${review.role}</span>
        <a href="${SITE.google.reviewsUrl}" rel="noopener">See all ${SITE.google.count} reviews${icon("arrow")}</a>
      </figcaption>
    </figure>
  </div>
</section>`;

const relatedStrip = (title, items) => `
<section class="section section--mist" aria-labelledby="related-title">
  <div class="container">
    <div class="bar-head">
      <div><h2 class="grad-head" id="related-title">${title}</h2></div>
      ${btn("All IT services", "it-services.html", { variant: "secondary", arrow: false, track: "related-all-services" })}
    </div>
    <div class="related-grid">${items.map((s) => serviceRow(s)).join("")}</div>
  </div>
</section>`;

/* ==========================================================================
   1. SUB-SERVICE PAGES (30)
   ========================================================================== */
SERVICES.forEach((parent) => {
  parent.children.forEach((child) => {
    const m = model(child.href);
    if (!m) return;

    const crumbs = [
      { title: "Home", href: "index.html" },
      { title: "IT Services", href: "it-services.html" },
      { title: parent.title, href: parent.href },
      { title: child.title },
    ];

    const siblings = parent.children.filter((c) => c.href !== child.href).slice(0, 4)
      .map((c) => ({ title: c.title, href: c.href, icon: parent.icon, tone: parent.tone, short: `Part of ${parent.title.toLowerCase()}.` }));

    const main = `
${pageHero({
      eyebrow: parent.title,
      title: m.title,
      lead: m.lead,
      crumbs: breadcrumbs(crumbs),
      cls: `hero--tone-${parent.tone}`,
      aside: heroProof([
        { icon: "clock", value: "9 min", label: "Average first response" },
        { icon: "star", value: SITE.google.rating, label: `${SITE.google.count} Google reviews` },
        { icon: "shield", value: "Cyber Essentials", label: "Certified provider" },
      ]),
    })}
${renderBlocks(m.blocks, { key: child.href.replace(/[^a-z]+/g, "-") })}
${credentialStrip()}
${relatedStrip(`More ${parent.title}`, siblings)}
`;

    page({
      footerCta: {
        title: `Talk to us about ${m.title}`,
        text: `Tell us what you need and we'll tell you what we'd do. ${SITE.responseLine}, and no obligation.`,
        track: `subservice-${child.href}`,
      },
      file: child.href,
      title: `${m.title} | ${parent.title}`,
      description: first(m.lead, `${m.title} from WhizzIT, part of our ${parent.title.toLowerCase()} service for UK businesses.`),
      bodyClass: `page--service page--sky tone-${parent.tone}`,
      crumbs,
      main,
      schema: [{
        "@context": "https://schema.org",
        "@type": "Service",
        name: m.title,
        serviceType: parent.title,
        description: m.lead,
        provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
        areaServed: "GB",
      }],
    });
  });
});

/* Industry pages (8) are built by sectors.mjs, with their own design. */

/* ==========================================================================
   3. LOCATION PAGES (14) (the index is locations.mjs)
   ========================================================================== */
LOCATIONS.forEach((loc, i) => {
  // London is built by london.mjs with its own layout.
  if (loc.title === "London") return;
  const m = model(loc.href);
  if (!m) return;

  const crumbs = [
    { title: "Home", href: "index.html" },
    { title: "Locations", href: "locations.html" },
    { title: `IT support in ${loc.title}` },
  ];
  const nearby = LOCATIONS.filter((l) => l.href !== loc.href).slice(i < 6 ? 0 : 0, 6);

  const main = `
${pageHero({
    eyebrow: `IT support in ${loc.title}`,
    title: m.title,
    lead: m.lead,
    crumbs: breadcrumbs(crumbs),
    cls: "hero--location",
    feature: stockPhoto(loc.title === "London" ? STOCK.london : STOCK.office, { ratio: "16-9", sizes: "(min-width: 1280px) 1240px, 100vw", loading: "eager" }),
    aside: `${heroProof([
        { icon: "clock", value: "9 min", label: "Average first response" },
        { icon: "mapPin", value: loc.title, label: "Remote first, on-site when needed" },
      ])}`,
  })}
${renderBlocks(m.blocks, { key: `loc-${i}` })}

<section class="section section--mist" aria-labelledby="loc-services-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Services in ${loc.title}</p>
        <h2 class="grad-head" id="loc-services-title">The full WhizzIT service, wherever you are</h2>
      </div>
      ${btn("All IT services", "it-services.html", { variant: "secondary", arrow: false, track: `loc-${loc.title}-services` })}
    </div>
    <div class="related-grid">${SERVICES.map((s) => serviceRow(s)).join("")}</div>
  </div>
</section>

<section class="section" aria-labelledby="offices-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Our offices</p>
      <h2 class="grad-head" id="offices-title">Two bases, UK-wide coverage</h2>
    </div>
    <div class="office-grid">
      ${SITE.offices.map((o) => `
      <article class="office-card">
        <span class="office-card__icon">${icon("mapPin")}</span>
        <h3>${o.name}</h3>
        <p class="office-card__label">${o.label}</p>
        <p>${o.address}</p>
        <a class="text-link" href="${o.maps}" rel="noopener"><span>Get directions</span>${icon("arrow")}</a>
      </article>`).join("")}
    </div>
    <ul class="area-chips" role="list">
      ${nearby.map((l) => `<li><a href="@/${l.href}">${icon("mapPin")}${l.title}</a></li>`).join("")}
      <li><a href="@/locations.html">All locations${icon("arrow")}</a></li>
    </ul>
  </div>
</section>

${reviewStrip(TESTIMONIALS[(i + 2) % TESTIMONIALS.length])}
`;

  page({
    footerCta: {
      title: `Need IT support in ${loc.title}?`,
      text: `Call us and you'll speak to an engineer, not a queue. ${SITE.responseLine}.`,
      track: `loc-${loc.title}-cta`,
    },
    file: loc.href,
    title: m.title,
    description: first(m.lead, `Managed IT support in ${loc.title} from WhizzIT. Remote-first support, on-site when it needs hands, rated ${SITE.google.rating} on Google.`),
    bodyClass: "page--location page--sky",
    crumbs,
    main,
  });
});

// The locations index is built by locations.mjs, with its own design.

/* ==========================================================================
   4. CASE STUDIES (4)
   ========================================================================== */
CASE_STUDIES.forEach((study, i) => {
  const href = `our-customers/${study.slug}.html`;
  const m = model(href);
  if (!m) return;

  const crumbs = [
    { title: "Home", href: "index.html" },
    { title: "Our Customers", href: "our-customers.html" },
    { title: study.title },
  ];

  const main = `
${pageHero({
    eyebrow: `Case study · ${study.sector}`,
    title: m.title,
    lead: m.lead,
    crumbs: breadcrumbs(crumbs),
    cls: "hero--case",
    feature: casePhoto(study, { ratio: "16-9", sizes: "(min-width: 1280px) 1240px, 100vw", loading: "eager" }),
  })}

<section class="section section--tight" aria-label="Customer summary">
  <div class="container">
    <dl class="case-facts">
      <div><dt>Client</dt><dd>${study.title}</dd></div>
      <div><dt>Sector</dt><dd>${study.sector}</dd></div>
      <div><dt>Services</dt><dd>Managed IT support</dd></div>
      <div><dt>Coverage</dt><dd>Remote first, on-site when needed</dd></div>
    </dl>
  </div>
</section>

${renderBlocks(m.blocks, { key: study.slug })}
${reviewStrip(TESTIMONIALS.find((t) => t.client === study.slug) || TESTIMONIALS[i % TESTIMONIALS.length])}

<section class="section" aria-labelledby="more-stories-title">
  <div class="container">
    <div class="bar-head">
      <div><h2 class="grad-head" id="more-stories-title">More customer stories</h2></div>
      ${btn("All customers", "our-customers.html", { variant: "secondary", arrow: false, track: "case-all-customers" })}
    </div>
    <div class="project-grid">
      ${CASE_STUDIES.filter((c) => c.slug !== study.slug).map((c) => `
      <article class="project-card">
        <span class="tag">${c.sector}</span>
        <h3 class="project-card__title"><a class="card-link" href="@/our-customers/${c.slug}.html">${c.title}</a></h3>
        <p>${c.excerpt}</p>
        <span class="read-more" aria-hidden="true">Read the story ${icon("arrow")}</span>
      </article>`).join("")}
    </div>
  </div>
</section>

`;

  page({
    footerCta: { title: "Want results like these?", text: "Book a no-obligation conversation about your systems, your team and what to fix first.", track: `case-${study.slug}-final` },
    file: href,
    title: m.title,
    description: first(m.lead, study.excerpt),
    bodyClass: "page--case page--sky",
    crumbs,
    main,
  });
});

/* ==========================================================================
   5. STANDALONE PAGES
   ========================================================================== */
{
  // Cloud services in London: a service + location hybrid that exists on staging.
  const m = model("cloud-services-london.html");
  if (m) {
    const crumbs = [{ title: "Home", href: "index.html" }, { title: "Managed Cloud Services", href: "managed-cloud-services.html" }, { title: "Cloud Services London" }];
    const main = `
${pageHero({
      eyebrow: "Cloud services · London",
      title: m.title,
      lead: m.lead,
      crumbs: breadcrumbs(crumbs),
      aside: heroProof([
        { icon: "cloud", value: "Microsoft 365", label: "Cloud Solution Provider" },
        { icon: "clock", value: "9 min", label: "Average first response" },
        { icon: "mapPin", value: "London", label: "On site when it needs hands" },
      ]),
    })}
${renderBlocks(m.blocks, { key: "cloud-london" })}
${credentialStrip()}
${relatedStrip("Managed cloud services", SERVICES[1].children.slice(0, 4).map((c) => ({ title: c.title, href: c.href, icon: "cloud", tone: "cloud", short: "Part of managed cloud services." })))}
`;
    page({
      footerCta: { title: "Moving to the cloud in London?", text: "We'll plan the move, run the migration and support it afterwards.", track: "cloud-london-cta" },
      file: "cloud-services-london.html",
      title: m.title,
      description: first(m.lead, "Managed cloud services for London businesses: Microsoft 365, Azure, migration, backup and day-to-day management."),
      bodyClass: "page--service page--sky tone-cloud",
      crumbs,
      main,
    });
  }
}

{
  // Thank-you page used by the London campaign forms.
  const crumbs = [{ title: "Home", href: "index.html" }, { title: "Thank you" }];
  const main = `
<section class="hero hero--sky hero--thanks" aria-labelledby="thanks-title">
  <div class="container container--copy thanks">
    <span class="thanks__icon">${icon("checkCircle")}</span>
    <h1 class="hero-sky__title" id="thanks-title">Thank you — your request is with the team</h1>
    <p class="hero-sky__lead">We respond the same working day. If it is urgent, call us and you will speak to an engineer rather than a queue.</p>
    <div class="btn-group">
      ${btn(`Call ${SITE.phone}`, SITE.phoneHref, { iconName: "phone", arrow: false, track: "thanks-phone" })}
      ${btn("Back to the homepage", "index.html", { variant: "secondary", arrow: false, track: "thanks-home" })}
    </div>
    <div class="thanks__links">
      ${textLink("Read customer stories", "our-customers.html")}
      ${textLink("Browse the blog", "blog.html")}
      ${textLink("See all IT services", "it-services.html")}
    </div>
  </div>
</section>
${credentialStrip()}
`;
  page({
    file: "thank-you-london.html",
    title: "Thank you",
    description: "Thanks for contacting WhizzIT. We respond the same working day.",
    bodyClass: "page--thanks page--sky",
    crumbs,
    main,
  });
}
