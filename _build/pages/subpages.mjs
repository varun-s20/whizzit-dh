// The case studies (4) and the two standalone pages. Content is parsed from
// the staging export, so the copy and URLs stay exactly as the client has them.
import {
  page, reviewAvatar, btn, icon, photo, stockPhoto, casePhoto, breadcrumbs, serviceRow, textLink, credBadges, statStrip, WP_EXPORT,
  SITE, SERVICES, INDUSTRIES, LOCATIONS, CASE_STUDIES, PARTNERS, PHOTOS, TESTIMONIALS, CREDENTIALS, STOCK, SECTOR_PHOTO, G_RATING, G_COUNT,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";
import { pageHero } from "../blocks.mjs";
import { parseSections } from "../section-parse.mjs";
import { R, caseLayout, kindOf } from "../sections.mjs";

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
        <a href="${SITE.google.reviewsUrl}" rel="noopener">See all ${G_COUNT} reviews${icon("arrow")}</a>
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

/* Sub-service pages (30) are built by sub-services.mjs, with their own design. */

/* Industry pages (8) are built by sectors.mjs, with their own design. */

/* Location pages (14) are built by location-pages.mjs, with their own design;
   the locations index is locations.mjs. */

/* ==========================================================================
   4. CASE STUDIES (4)
   ========================================================================== */
CASE_STUDIES.forEach((study, i) => {
  const href = `our-customers/${study.slug}.html`;
  const m = model(href);
  const source = pageByPath(stagingPath(href));
  if (!m || !source) return;
  const P = parseSections(source.html).sections;
  const take = (pred) => P.find((x) => x.kind === "content" && pred(x));
  const figures = take((x) => x.stats.length && !x.flow.length && !x.cards.length);
  const story = take((x) => /case study/i.test(x.eyebrow) && x.cards.length);
  const used = take((x) => /services used/i.test(x.eyebrow) && x.cards.length);
  const praise = take((x) => x.quotes.length && !x.cards.length);
  const ask = P.find((x) => x.kind === "ctaMid");
  const partners = P.find((x) => x.kind === "partners");
  const band = P.find((x) => x.kind === "ctaBand");
  const signOff = P.find((x) => x.kind === "note" && /written and maintained/i.test(x.text));
  const review = TESTIMONIALS.find((t) => t.client === study.slug) || TESTIMONIALS[i % TESTIMONIALS.length];
  const ctx = { slug: study.slug, tone: "support", n: 0 };

  const crumbs = [
    { title: "Home", href: "index.html" },
    { title: "Our Customers", href: "our-customers.html" },
    { title: study.title },
  ];

  const facts = [
    { label: "Client", value: study.title },
    { label: "Sector", value: study.sector },
    ...(used ? [{ label: "Services", value: used.cards.map((c) => c.title).join(", ") }] : []),
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

${story ? caseLayout({
    id: `${study.slug}-story`,
    eyebrow: story.eyebrow,
    title: story.title,
    facts,
    chapters: story.cards.map((c) => ({ label: c.num, title: c.title, html: c.html })),
    stats: figures ? figures.stats : [],
  }) : ""}

${ask ? R.ctaMid(ask, `${study.slug}-ask`, ctx) : ""}

${praise ? `
<section class="section cs-quote" aria-label="Customer review">
  <div class="container">
    <figure class="cs-quote__fig">
      <span class="cs-quote__mark" aria-hidden="true">${icon("quote")}</span>
      <blockquote><p>${praise.quotes[0].text.replace(/^[“"]|[”"]$/g, "")}</p></blockquote>
      <figcaption>
        ${reviewAvatar(review, { badge: true })}
        <span><strong>${praise.quotes[0].by}</strong>${praise.quotes[0].role}</span>
        <a href="${SITE.google.reviewsUrl}" rel="noopener">See all ${G_COUNT} reviews${icon("arrow")}</a>
      </figcaption>
    </figure>
  </div>
</section>` : ""}

${used ? `
<section class="section cs-used" aria-labelledby="${study.slug}-used-title">
  <div class="container cs-used__grid">
    <div>
      <p class="eyebrow">${used.eyebrow}</p>
      <h2 class="grad-head" id="${study.slug}-used-title">${used.title}</h2>
    </div>
    <ul class="cs-used__list" role="list">
      ${used.cards.map((c) => `<li><strong>${c.title}</strong><span>${c.html.replace(/<\/?p>/g, " ").trim()}</span></li>`).join("")}
    </ul>
  </div>
</section>` : ""}

<section class="section cs-more" aria-labelledby="more-stories-title">
  <div class="container">
    <div class="bar-head">
      <div><h2 class="grad-head" id="more-stories-title">More customer stories</h2></div>
      ${btn("All customers", "our-customers.html", { variant: "secondary", arrow: false, track: "case-all-customers" })}
    </div>
    <ul class="cs-more__list" role="list">
      ${CASE_STUDIES.filter((c) => c.slug !== study.slug).map((c) => `
      <li>
        <a href="@/our-customers/${c.slug}.html">
          <span class="cs-more__sector">${c.sector}</span>
          <strong>${c.title}</strong>
          <span class="cs-more__text">${c.excerpt}</span>
          <span class="cs-more__go" aria-hidden="true">${icon("arrow")}</span>
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>
${partners ? R.partners(partners, `${study.slug}-partners`, ctx) : ""}
${signOff ? `<div class="container"><p class="sv-family__note">${signOff.text}</p></div>` : ""}
`;

  page({
    footerCta: { title: band?.title || "Want results like these?", text: band?.text || "Book a no-obligation conversation about your systems, your team and what to fix first.", track: `case-${study.slug}-final` },
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
    // Drawn section by section from the staging page, with the sub-service
    // renderers (sections.mjs), so WordPress draws it exactly the same way.
    const P = parseSections(pageByPath(stagingPath("cloud-services-london.html")).html).sections;
    const ctx = { slug: "cloud-services-london", tone: SERVICES[1].tone, parent: SERVICES[1], child: { title: "Cloud Services London" }, n: 0, storyCount: 0 };
    const band = P.find((x) => x.kind === "ctaBand");
    const signOff = P.find((x) => x.kind === "note" && /written and maintained/i.test(x.text));
    const empty = (x) => !x.flow.length && !x.lists.length && !x.cards.length && !x.tabs.length && !x.steps.length && !x.quotes.length && !x.stats.length && !x.tables.length;
    let ci = 0;
    const cloudBody = P.map((x) => {
      ctx.n += 1;
      const id = `cloud-london-s${ctx.n}`;
      if (x.kind === "content") return empty(x) ? "" : R[kindOf(x, ci++)](x, id, ctx);
      if (x.kind === "note") return x === signOff ? "" : `<div class="container"><p class="sv-note sv-note--block">${x.html.replace(/^<p>|<\/p>$/g, "")}</p></div>`;
      if (x.kind === "ctaBand") return "";
      return R[x.kind] ? R[x.kind](x, id, ctx) : "";
    }).join("\n");
    const main = `
${pageHero({
      eyebrow: "Cloud services · London",
      title: m.title,
      lead: m.lead,
      crumbs: breadcrumbs(crumbs),
      aside: statStrip({ compact: true, track: "cloud-london-hero" }),
    })}
${cloudBody}

<nav class="section section--mist sv-family" aria-labelledby="cloud-london-family-title">
  <div class="container">
    <div class="sv-family__head">
      <div>
        <p class="eyebrow">${SERVICES[1].title}</p>
        <h2 class="grad-head" id="cloud-london-family-title">More ${SERVICES[1].title.replace(/ services$/i, "")} services</h2>
      </div>
      ${btn(`All ${SERVICES[1].title}`, SERVICES[1].href, { variant: "secondary", arrow: false, track: "cloud-london-family-all" })}
    </div>
    <ul class="sv-family__list tone-${SERVICES[1].tone}" role="list">
      ${SERVICES[1].children.map((c) => `<li><a href="@/${c.href}"><span class="sv-family__icon" aria-hidden="true">${icon(SERVICES[1].icon)}</span><span>${c.title}</span>${icon("arrow")}</a></li>`).join("")}
    </ul>
    ${signOff ? `<p class="sv-family__note">${signOff.text}</p>` : ""}
  </div>
</nav>
`;
    page({
      footerCta: { title: band?.title || "Moving to the cloud in London?", text: band?.text || "We'll plan the move, run the migration and support it afterwards.", track: "cloud-london-cta" },
      file: "cloud-services-london.html",
      title: m.title,
      description: first(m.lead, "Managed cloud services for London businesses: Microsoft 365, Azure, migration, backup and day-to-day management."),
      bodyClass: "page--service page--subservice page--sky tone-cloud",
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
