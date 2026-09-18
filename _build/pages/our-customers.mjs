// Our Customers. Signature: the Google rating headline over a masonry review wall,
// with the four case studies below it.
import {
  page, statValue, reviewAvatar, stars, btn, icon, photo, breadcrumbs, ctaBand,
  SITE, CLIENTS, CASE_STUDIES, TESTIMONIALS, PHOTOS, STATS,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";

const m = parsePage(pageByPath("/our-customers/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "Our Customers" }];

const main = `
${/* Signature layout for this page: the rating is stated once, centred and full
     width, and the proof sits directly underneath as an offset wall of real
     reviews rather than in a boxed card beside the heading. That is what makes
     this page read differently from /about/, which leads with a photograph. */""}
<section class="hero hero--sky hero--wall" aria-labelledby="page-hero-title" id="reviews">
  <div class="container hero-wall__head">
    ${breadcrumbs(crumbs)}
    <p class="eyebrow">Our customers</p>
    <h1 class="hero-sky__title" id="page-hero-title">${m.title}</h1>
    <p class="hero-sky__lead">${m.lead}</p>

    <div class="rating-bar">
      <span class="rating-bar__score">${SITE.google.rating}</span>
      <span class="rating-bar__detail">
        ${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}
        <span>Rated excellent across ${SITE.google.count} Google reviews</span>
      </span>
      <a class="rating-bar__link" href="${SITE.google.reviewsUrl}" rel="noopener" data-track="customers-google">${icon("google")}<span>Read them on Google</span>${icon("arrow")}</a>
    </div>

    <div class="btn-group">
      ${btn("Book a consultation", "contact.html", { arrow: false, track: "customers-cta" })}
      ${btn("See the success stories", "#stories", { variant: "secondary", arrow: false, track: "customers-stories" })}
    </div>
  </div>

  <div class="container">
    <div class="review-wall review-wall--offset">
      ${/* Tagged by hand: the auto-tagger in app.js skips heroes, and most of this
           wall sits well below the fold. */""}
      ${TESTIMONIALS.map((t, i) => `
      <figure class="review-card" data-reveal style="--reveal-i:${Math.min(i % 3, 2)}">
        ${stars(`Rated ${SITE.google.rating} out of 5`)}
        <blockquote><p>“${t.quote}”</p></blockquote>
        <figcaption>${reviewAvatar(t, { badge: true })}<span><strong>${t.name}</strong>${t.role}</span></figcaption>
      </figure>`).join("")}
    </div>
    <p class="small muted mt-6">All ${SITE.google.count} reviews are published on our Google Business profile, names and all.</p>
  </div>
</section>

<section class="section section--tight" aria-label="Clients">
  <div class="container">
    <div class="client-band client-band--slim">
      <p class="client-band__label">The businesses we look after</p>
      <ul class="logo-row logo-row--wide" role="list">
        ${CLIENTS.map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="${c.title}" decoding="async"></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="section section--mist" id="stories" aria-labelledby="stories-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Success stories</p>
      <h2 class="grad-head" id="stories-title">How we help, in their words</h2>
      <p>Real clients, real results. Dig into the detail of how WhizzIT supports businesses like yours.</p>
    </div>
    <div class="story-list">
      ${CASE_STUDIES.map((c, i) => `
      <article class="story-row${i % 2 ? " story-row--flip" : ""}">
        ${photo([PHOTOS.van, PHOTOS.serviceDesk, PHOTOS.network, PHOTOS.team][i % 4], { cls: "story-row__photo", ratio: "3-2", sizes: "(min-width: 1024px) 45vw, 100vw" })}
        <div class="story-row__body">
          <span class="tag">${c.sector}</span>
          <h3 class="grad-head"><a class="card-link" href="@/our-customers/${c.slug}.html">${c.title}</a></h3>
          <p>${c.excerpt}</p>
          <span class="read-more" aria-hidden="true">Read the story ${icon("arrow")}</span>
        </div>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="section stat-band" aria-labelledby="customers-stats-title">
  <div class="container">
    <div class="stat-band__head">
      <p class="eyebrow">By the numbers</p>
      <h2 class="grad-head grad-head--dark" id="customers-stats-title">Why they stay</h2>
    </div>
    <dl class="stat-band__grid">
      ${STATS.map((s) => `<div><dd>${statValue(s)}</dd><dt>${s.label}</dt><p>${s.note}</p></div>`).join("")}
    </dl>
  </div>
</section>

${ctaBand({
  title: "Want to be the next story?",
  text: `Book a no-obligation conversation about your systems and what to fix first. ${SITE.responseLine}.`,
  track: "customers-final-cta",
})}
`;

page({
  file: "our-customers.html",
  title: "Client Reviews & Success Stories",
  description: `WhizzIT is rated ${SITE.google.rating} on Google across ${SITE.google.count} reviews. Read client reviews and case studies from hotels, clinics, construction and professional services.`,
  bodyClass: "page--customers page--sky",
  crumbs,
  main,
});
