// Industry pages (8). Their own design, shared with no other page: a "sector
// cover" hero (the sector's photograph bleeding off the right edge, its line icon
// drawn huge behind the title), then a briefing: numbered sections down the main
// column with their labels in the margin, and a sticky side column carrying an
// "on this page" index and the callback box. The six "what you get" points are a
// ledger whose ticks draw in; the three sector considerations are a timeline
// whose line fills as it is read. Previous / next industry close the page.
//
// Phones get their own arrangement rather than a squeezed one: photo first with
// the content rising over it as a sheet, the callback box at the end, and a
// bottom action bar (app.js initSectorDock) once the hero has scrolled away.
//
// Every word comes from the sector's staging page (_source/wp-pages.json) or
// from copy the site already uses elsewhere (the sector notes on /industries/,
// the review and credential components). Section labels are the staging page's
// own eyebrows; nothing here is written for these pages.
import {
  page, btn, icon, stockPhoto, casePhoto, breadcrumbs, callbackForm, credBadges, reviewAvatar, stars, heroNote,
  SITE, SERVICES, INDUSTRIES, CASE_STUDIES, TESTIMONIALS, STOCK, SECTOR_PHOTO, SECTOR_NOTE,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";

const pad = (n) => String(n).padStart(2, "0");
const paragraphs = (html = "") => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((x) => x[1].trim()).filter(Boolean);
const sectorPhoto = (s, o) => stockPhoto(STOCK[SECTOR_PHOTO[s.key]] || STOCK.meeting, o);

// Case studies are filed by sector name; three sectors have one.
const STUDY_SECTOR = { Healthcare: "healthcare", Construction: "construction", Education: "education" };

// The check mark the ledger draws, as one path so its stroke can be animated.
const tick = `<svg class="sx-ledger__tick" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7"/></svg>`;

INDUSTRIES.forEach((sector, i) => {
  const source = pageByPath(`/${sector.href.replace(/\.html$/, "/")}`);
  if (!source) return;
  const m = parsePage(source.html);

  const built = m.blocks.find((b) => b.list && b.list.length) || { eyebrow: "", title: "", html: "", list: [], listTitle: "" };
  const brief = m.blocks.find((b) => b.faq && b.faq.length);
  const builtText = paragraphs(built.html);
  // "What we do / Everything IT, under one roof" and "Certified & accredited".
  const whatWeDo = m.blocks.find((b) => /under one roof/i.test(b.title)) || { eyebrow: "What we do", title: "Everything IT, under one roof", lead: "" };
  const certified = m.blocks.find((b) => /credentials you can check/i.test(b.title)) || { eyebrow: "Certified & accredited", title: "Credentials you can check" };
  const briefLead = brief ? brief.lead || paragraphs(brief.html)[0] || "" : "";

  const review = TESTIMONIALS.find((t) => (t.sectors || []).includes(sector.key)) || TESTIMONIALS[0];
  const study = CASE_STUDIES.find((c) => STUDY_SECTOR[c.sector] === sector.key);
  const prev = INDUSTRIES[(i + INDUSTRIES.length - 1) % INDUSTRIES.length];
  const next = INDUSTRIES[(i + 1) % INDUSTRIES.length];

  const crumbs = [
    { title: "Home", href: "index.html" },
    { title: "Industries", href: "industries.html" },
    { title: sector.title },
  ];

  // The briefing's sections, in order: the side index is built from this list.
  const sections = [
    { id: "overview", label: built.eyebrow || sector.title },
    { id: "included", label: built.listTitle || "What you get with WhizzIT" },
    brief && { id: "specifics", label: brief.eyebrow || brief.title },
    { id: "proof", label: "Customer stories" },
    { id: "coverage", label: whatWeDo.eyebrow || "What we do" },
    { id: "credentials", label: certified.eyebrow || "Certified & accredited" },
  ].filter(Boolean);
  const num = (id) => pad(sections.findIndex((s) => s.id === id) + 1);
  const label = (id) => `<p class="sx-sec__label"><span>${num(id)}</span>${sections.find((s) => s.id === id).label}</p>`;

  const main = `
<section class="sx-hero" aria-labelledby="page-hero-title">
  <div class="sx-hero__media">
    ${sectorPhoto(sector, { cls: "sx-hero__photo", ratio: "4-5", sizes: "(min-width: 1024px) 46vw, 100vw", loading: "eager" })}
    <p class="sx-hero__tag">
      <span class="sx-hero__tag-icon" aria-hidden="true">${icon("alert")}</span>
      <span><strong>${sector.title}</strong>${SECTOR_NOTE[sector.key] || sector.desc}</span>
    </p>
  </div>
  <div class="sx-hero__sheet">
    <span class="sx-hero__mark" aria-hidden="true">${icon(sector.icon)}</span>
    <div class="sx-hero__inner">
      ${breadcrumbs(crumbs)}
      <p class="sx-hero__kicker"><span>Industry ${pad(i + 1)} / ${pad(INDUSTRIES.length)}</span><span>${sector.title}</span></p>
      <h1 class="sx-hero__title" id="page-hero-title">${m.title}</h1>
      <p class="sx-hero__lead">${m.lead}</p>
      <div class="sx-hero__actions">
        ${btn("Request a callback", "#talk", { size: "lg", track: `sector-${sector.key}-hero-callback` })}
      </div>
      ${heroNote("UK-wide coverage", `sector-${sector.key}-hero`)}
    </div>
  </div>
</section>

<div class="container sx-body">
  <div class="sx-main">

    <section class="sx-sec" id="overview" aria-labelledby="overview-title" data-on-view>
      ${label("overview")}
      <div class="sx-sec__body">
        <h2 class="sx-sec__title" id="overview-title">${built.title}</h2>
        ${builtText.map((t, n) => `<p class="${n === 0 ? "sx-lede" : "sx-text"}">${t}</p>`).join("")}
      </div>
    </section>

    <section class="sx-sec" id="included" aria-labelledby="included-title" data-on-view>
      ${label("included")}
      <div class="sx-sec__body">
        <h2 class="sx-sec__title" id="included-title">${built.listTitle || "What you get with WhizzIT"}</h2>
        <ol class="sx-ledger" role="list">
          ${built.list.map((item, n) => `
          <li style="--n:${n}">
            <span class="sx-ledger__n">${pad(n + 1)}</span>
            ${tick}
            <span class="sx-ledger__text">${item}</span>
          </li>`).join("")}
        </ol>
      </div>
    </section>

    ${brief ? `
    <section class="sx-sec" id="specifics" aria-labelledby="specifics-title" data-on-view>
      ${label("specifics")}
      <div class="sx-sec__body">
        <h2 class="sx-sec__title" id="specifics-title">${brief.title}</h2>
        ${briefLead ? `<p class="sx-brief__lead">${briefLead}</p>` : ""}
        <ol class="sx-points" role="list">
          ${brief.faq.map((f, n) => `
          <li class="sx-point">
            <span class="sx-point__n" aria-hidden="true">${pad(n + 1)}</span>
            <h3 class="sx-point__title">${f.q}</h3>
            <div class="sx-point__text">${f.a}</div>
          </li>`).join("")}
        </ol>
      </div>
    </section>` : ""}

    <section class="sx-sec" id="proof" aria-labelledby="proof-title" data-on-view>
      ${label("proof")}
      <div class="sx-sec__body">
        <h2 class="sx-sec__title" id="proof-title">What our clients say</h2>
        ${study ? `
        <article class="sx-case">
          ${casePhoto(study, { cls: "sx-case__photo", ratio: "4-3", sizes: "(min-width: 1024px) 300px, 100vw" })}
          <div class="sx-case__body">
            <span class="sx-case__tag">Case study · ${study.sector}</span>
            <h3 class="sx-case__title"><a class="card-link" href="@/our-customers/${study.slug}.html">${study.title}</a></h3>
            <p>${study.excerpt}</p>
            <span class="sx-case__more" aria-hidden="true">Read the story ${icon("arrow")}</span>
          </div>
        </article>` : ""}
        <figure class="sx-quote">
          <span class="sx-quote__mark" aria-hidden="true">${icon("quote")}</span>
          <blockquote><p>${review.quote}</p></blockquote>
          <figcaption>
            ${reviewAvatar(review, { badge: true })}
            <span><strong>${review.name}</strong>${review.role}</span>
            <span class="sx-quote__stars">${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}</span>
          </figcaption>
          <a class="sx-quote__more" href="${SITE.google.reviewsUrl}" rel="noopener">See all ${SITE.google.count} reviews${icon("arrow")}</a>
        </figure>
      </div>
    </section>

    <section class="sx-sec" id="coverage" aria-labelledby="coverage-title" data-on-view>
      ${label("coverage")}
      <div class="sx-sec__body">
        <h2 class="sx-sec__title" id="coverage-title">${whatWeDo.title}</h2>
        ${whatWeDo.lead ? `<p class="sx-text sx-text--lead">${whatWeDo.lead}</p>` : ""}
        <ul class="sx-cover" role="list">
          ${SERVICES.map((s) => `
          <li>
            <a href="@/${s.href}" data-track="sector-${sector.key}-${s.key}">
              <span class="sx-cover__icon" aria-hidden="true">${icon(s.icon)}</span>
              <strong>${s.title}</strong>
              <span class="sx-cover__text">${s.short}</span>
              <span class="sx-cover__go" aria-hidden="true">${icon("arrow")}</span>
            </a>
          </li>`).join("")}
        </ul>
        <p class="sx-cover__all">${btn("All IT services", "it-services.html", { variant: "secondary", arrow: false, track: `sector-${sector.key}-services` })}</p>
      </div>
    </section>

    <section class="sx-sec" id="credentials" aria-labelledby="credentials-title" data-on-view>
      ${label("credentials")}
      <div class="sx-sec__body">
        <h2 class="sx-sec__title" id="credentials-title">${certified.title}</h2>
        ${credBadges({ partners: true })}
      </div>
    </section>
  </div>

  ${/* Desktop: sticks beside the briefing. Phones and tablets: it follows the
       briefing as the closing "talk to us" box, which the action bar links to. */""}
  <aside class="sx-aside" id="talk" aria-label="Talk to us">
    <nav class="sx-toc" aria-label="On this page" data-sx-toc>
      <p class="sx-toc__title">On this page</p>
      <ol role="list">
        ${sections.map((s) => `<li><a href="#${s.id}"><span>${num(s.id)}</span>${s.label}</a></li>`).join("")}
      </ol>
    </nav>
    <div class="sx-talk">
      ${callbackForm({ track: `sector-${sector.key}-talk`, captchaTheme: "light" })}
      <a class="sx-talk__call" href="${SITE.phoneHref}" data-track="sector-${sector.key}-talk-phone">${icon("phone")}<span>Prefer to talk? <strong>${SITE.phone}</strong></span></a>
    </div>
  </aside>
</div>

<nav class="sx-pager" aria-labelledby="other-sectors-title">
  <div class="container">
    <h2 class="sx-pager__title" id="other-sectors-title">Other industries we support</h2>
    <div class="sx-pager__grid">
      ${[["prev", prev, "Previous industry"], ["next", next, "Next industry"]].map(([dir, s, text]) => `
      <a class="sx-pager__link sx-pager__link--${dir}" href="@/${s.href}" data-track="sector-${sector.key}-${dir}">
        ${sectorPhoto(s, { cls: "sx-pager__photo", ratio: "16-9", sizes: "(min-width: 768px) 50vw, 100vw" })}
        <span class="sx-pager__text">
          <span class="sx-pager__dir">${dir === "prev" ? icon("arrowLeft") : ""}${text}${dir === "next" ? icon("arrow") : ""}</span>
          <strong>${s.title}</strong>
          <span class="sx-pager__desc">${s.desc}</span>
        </span>
      </a>`).join("")}
    </div>
    <p class="sx-pager__all"><a href="@/industries.html">All industries</a></p>
  </div>
</nav>

<div class="sx-dock" data-sx-dock aria-hidden="true">
  <a class="btn btn--primary sx-dock__main" href="#talk" tabindex="-1"><span>Request a callback</span></a>
  <a class="sx-dock__call" href="${SITE.phoneHref}" tabindex="-1" aria-label="Call ${SITE.phone}">${icon("phone")}</a>
</div>
`;

  page({
    footerCta: {
      title: `IT that fits how ${sector.title} works`,
      text: "Book a no-obligation conversation and we'll tell you what we would change first.",
      track: `sector-${sector.key}-cta`,
    },
    file: sector.href,
    title: m.title,
    description: m.lead && m.lead.length > 40 ? m.lead : sector.desc,
    bodyClass: `page--industry page--sector page--light-hero sector--${sector.key}`,
    crumbs,
    main,
  });
});
