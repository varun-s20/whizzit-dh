// Industries hub. Signature: the sector wall. The hero is the site's dark sky,
// with every sector's photograph drifting past in three tilted columns beside
// the headline (each one a link to that sector). Below, the sectors run as an
// index whose rows wipe their photo into a frame (app.js initSectorPreview,
// built from the rows so the WordPress shortcode's markup works unchanged),
// and the sector stories glide sideways as the page scrolls (initHScroll).
import {
  page, btn, icon, stockPhoto, casePhoto, breadcrumbs, serviceRow, callbackForm, credBadges, reviewAvatar, stars, WP_EXPORT,
  SITE, SERVICES, INDUSTRIES, CASE_STUDIES, TESTIMONIALS, STOCK, SECTOR_PHOTO, SECTOR_NOTE,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";

const m = parsePage(pageByPath("/industries/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "Industries" }];

// Sector notes live in site.mjs (the sector pages use them too); re-exported
// here because wp-export.mjs reads them from this module.
export { SECTOR_NOTE };


const review = TESTIMONIALS[2];

// The second half of the headline takes the sky heroes' gradient, as on the
// home page ("Managed IT <span>that keeps your business moving.</span>").
const heroTitle = m.title.replace(/ (for .+)$/i, " <span>$1</span>");

// The sector wall: three columns, each drawn twice so it can loop without a
// seam (the copy is hidden from assistive tech and out of the tab order).
const WALL = [[0, 3, 6, 1], [2, 5, 7, 4], [6, 1, 4, 2]];
const wallCard = (s, hidden) => `
          <li class="wall-card"${hidden ? ' aria-hidden="true"' : ""}>
            <a href="@/${s.href}"${hidden ? ' tabindex="-1"' : ""}>
              ${stockPhoto(STOCK[SECTOR_PHOTO[s.key]], { cls: "wall-card__photo", ratio: "4-5", sizes: "(min-width: 1024px) 240px, 200px", alt: "", loading: "eager" })}
              <span class="wall-card__label"><span>${String(INDUSTRIES.indexOf(s) + 1).padStart(2, "0")}</span>${s.title}</span>
            </a>
          </li>`;
const wallColumn = (keys, i) => {
  const cards = keys.map((k) => INDUSTRIES[k]).filter(Boolean);
  return `
        <ul class="sector-wall__col" role="list" style="--col:${i}">${cards.map((c) => wallCard(c, i > 0)).join("")}${cards.map((c) => wallCard(c, true)).join("")}
        </ul>`;
};

const main = `
<section class="hero hero--sky ind-stage" aria-labelledby="page-hero-title">
  <div class="container ind-stage__inner">
    <div class="ind-stage__copy">
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">Industries</p>
      <h1 class="hero-sky__title ind-stage__title" id="page-hero-title">${heroTitle}</h1>
      <p class="hero-sky__lead">${m.lead}</p>
      <div class="ind-stage__actions">
        ${btn("Find your industry", "#directory", { size: "lg", track: "industries-hero-find" })}
        ${btn(`Call ${SITE.phone}`, SITE.phoneHref, { variant: "outline-light", size: "lg", iconName: "phone", arrow: false, track: "industries-hero-phone" })}
      </div>
      <ul class="ind-stage__proof" role="list">
        <li><span class="ind-stage__led" aria-hidden="true"></span><strong>${WP_EXPORT ? "[whizzit_sectors_count]" : INDUSTRIES.length} sectors</strong><span>with dedicated support pages</span></li>
        <li><span class="ind-stage__led" aria-hidden="true"></span><strong>9 min</strong><span>average first response</span></li>
        <li><span class="ind-stage__led" aria-hidden="true"></span><strong>Cyber Essentials</strong><span>certified provider</span></li>
      </ul>
    </div>
  </div>
  ${/* Only the first column is read out; the other two repeat the same eight
       sectors in a different order, so they are decoration to a screen reader. */""}
  <div class="ind-stage__wall">
    <nav class="sector-wall" aria-label="Sectors we support">${WALL.map(wallColumn).join("")}
    </nav>
  </div>
</section>

${/* On phones this section pins below the header and the sector cards glide
     sideways as the page scrolls (app.js initHScroll); wider screens keep the
     index and photo frame. */""}
<section class="section ind-index" id="directory" aria-labelledby="directory-title" data-hscroll data-hscroll-media="(max-width: 767.98px)" data-hscroll-runway="1.1">
  <div class="ind-index__pin" data-hscroll-pin>
  <div class="container">
    <div class="ind-index__head">
      <div>
        <p class="eyebrow">Industries we support</p>
        <h2 class="grad-head" id="directory-title">Find your industry</h2>
      </div>
      <p class="ind-index__lead">Pick yours to see the risks we plan around and the systems we support.</p>
    </div>
    <div class="sector-directory" data-sector-preview data-hscroll-track>
      ${WP_EXPORT ? '[whizzit_sectors view="directory"]' : INDUSTRIES.map((s, i) => `
      <article class="sector-tile sector-tile--photo">
        <a class="card-link" href="@/${s.href}" aria-label="${s.title}"></a>
        ${stockPhoto(STOCK[SECTOR_PHOTO[s.key]], { cls: "sector-tile__photo", ratio: "3-2", sizes: "(min-width: 1024px) 40vw, 100vw" })}
        <span class="sector-tile__num">${String(i + 1).padStart(2, "0")}</span>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <p class="sector-tile__note">${icon("alert")}${SECTOR_NOTE[s.key] || ""}</p>
        <span class="read-more" aria-hidden="true">See ${s.title.toLowerCase()} IT support ${icon("arrow")}</span>
      </article>`).join("")}
    </div>
  </div>
  </div>
</section>

<section class="section section--ink ind-services-band" aria-labelledby="sector-services-title">
  <div class="container">
    <div class="ind-services">
      <div class="ind-services__copy">
        <p class="eyebrow">The same team, whatever your sector</p>
        <h2 id="sector-services-title">Five services, shaped around how you work</h2>
        <p>We do not run a different business for each industry. We run the same five services, then shape the detail — the risks we plan for, the systems we support and the evidence we produce — around the way your sector works.</p>
        ${btn("Explore IT services", "it-services.html", { variant: "light", arrow: false, track: "industries-services" })}
      </div>
      <div class="ind-services__list">${SERVICES.map((s) => serviceRow(s)).join("")}</div>
    </div>
  </div>
</section>

${/* This band pins while the page scrolls and the stories glide sideways
     (app.js initHScroll). Under reduced motion it is an ordinary swipe rail. */""}
<section class="ind-hscroll section--ink" id="stories" aria-labelledby="sector-stories-title" data-hscroll data-hscroll-runway="1.35" data-hscroll-parallax=".hs-card__photo img">
  <div class="ind-hscroll__pin" data-hscroll-pin>
    <div class="container ind-hscroll__head">
      <div>
        <p class="eyebrow">Proof</p>
        <h2 class="grad-head grad-head--dark" id="sector-stories-title">Sector stories</h2>
        <p>Four businesses, four sectors, one service desk.</p>
      </div>
      <div class="ind-hscroll__meter" aria-hidden="true">
        <span class="ind-hscroll__count"><span data-hscroll-now>01</span> / ${String(CASE_STUDIES.length).padStart(2, "0")}</span>
        <span class="ind-hscroll__bar"><span data-hscroll-bar></span></span>
      </div>
      <div class="rail-controls" data-rail-controls="story-rail">
        <button class="rail-btn" type="button" data-rail-prev aria-label="Previous story">${icon("arrowLeft")}</button>
        <button class="rail-btn" type="button" data-rail-next aria-label="Next story">${icon("arrow")}</button>
      </div>
    </div>
    <div class="ind-hscroll__viewport" data-hscroll-viewport>
      <ul class="story-rail" id="story-rail" role="list" data-hscroll-track>
        ${CASE_STUDIES.map((c, i) => `
        <li class="hs-card">
          ${casePhoto(c, { cls: "hs-card__photo", ratio: "4-3", sizes: "(min-width: 1024px) 520px, 82vw" })}
          <span class="hs-card__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
          <div class="hs-card__body">
            <span class="tag">${c.sector}</span>
            <h3 class="hs-card__title"><a class="card-link" href="@/our-customers/${c.slug}.html">${c.title}</a></h3>
            <p>${c.excerpt}</p>
            <span class="read-more" aria-hidden="true">Read the story ${icon("arrow")}</span>
          </div>
        </li>`).join("")}
        <li class="hs-card hs-card--more" data-hscroll-uncounted>
          <a href="@/our-customers.html#stories" data-track="industries-stories">
            <span class="hs-card__more-label">More proof</span>
            <strong>All customer stories</strong>
            <span class="hs-card__more-arrow" aria-hidden="true">${icon("arrow")}</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</section>

<section class="section section--mist" aria-labelledby="not-listed-title">
  <div class="container">
    <div class="ind-ask">
      <div class="ind-ask__copy">
        <p class="eyebrow">Not listed?</p>
        <h2 class="grad-head" id="not-listed-title">Tell us how your sector works</h2>
        <p>Every industry uses technology differently. Tell us how your sector works and what it has to prove, and we'll point you in the right direction. ${SITE.responseLine}.</p>
        <figure class="ind-ask__quote">
          ${stars(`Rated ${SITE.google.rating} out of 5`)}
          <blockquote><p>“${review.quote}”</p></blockquote>
          <figcaption>${reviewAvatar(review, { badge: true })}<span><strong>${review.name}</strong>${review.role}</span></figcaption>
        </figure>
      </div>
      <div class="ind-ask__form">${callbackForm({ track: "industries-ask", captchaTheme: "light" })}</div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="industries-cred-title">
  <div class="container">
    <div class="cred-why__head">
      <p class="eyebrow">Certified &amp; accredited</p>
      <h2 class="grad-head" id="industries-cred-title">Credentials your auditors can check</h2>
    </div>
    ${credBadges({ partners: true })}
  </div>
</section>
`;

page({
  footerCta: {
    title: "Looking for IT support that understands your industry?",
    text: `Tell us how your sector works and what it has to prove. ${SITE.responseLine}.`,
    track: "industries-final-cta",
  },
  file: "industries.html",
  title: "Specialist IT Support by Industry & Sector",
  description: "Specialist managed IT support by sector: business services, construction, healthcare, financial services, legal, education, manufacturing and insurance.",
  bodyClass: "page--industries page--sky",
  crumbs,
  main,
});
