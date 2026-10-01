// Our Customers. Signature: a proof wall. The Google rating is stated once, big,
// beside the callback box; the reviews fall underneath as an offset wall; the
// clients are a wall of boxed logos; and the four success stories are the same
// cards as on the home page (lib.mjs caseTile), each with its own photograph.
import {
  page, reviewAvatar, stars, icon, breadcrumbs, callbackForm, heroNote, caseTile,
  SITE, CLIENTS, CASE_STUDIES, TESTIMONIALS,
} from "../lib.mjs";
import { pageByPath } from "../content.mjs";
import { parsePage } from "../parse.mjs";

const m = parsePage(pageByPath("/our-customers/").html);
const crumbs = [{ title: "Home", href: "index.html" }, { title: "Our Customers" }];

const main = `
<section class="hero hero--sky proof-hero" aria-labelledby="page-hero-title" id="reviews">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <div class="proof-hero__grid">
      <div class="proof-hero__copy">
        <p class="eyebrow">Our customers</p>
        <h1 class="hero-sky__title proof-hero__title" id="page-hero-title">${m.title}</h1>
        <p class="hero-sky__lead">${m.lead}</p>
        <div class="proof-score">
          <span class="proof-score__num">${SITE.google.rating}</span>
          <span class="proof-score__detail">
            ${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}
            <span>Rated excellent across ${SITE.google.count} Google reviews</span>
            <a href="${SITE.google.reviewsUrl}" rel="noopener" data-track="customers-google">${icon("google")}<span>Read them on Google</span>${icon("arrow")}</a>
          </span>
        </div>
      </div>
      <div class="proof-hero__form">
        ${callbackForm({ track: "customers-hero" })}
        ${heroNote("UK-wide coverage", "customers-hero")}
      </div>
    </div>

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

<section class="section section--ink client-band-dark" aria-labelledby="clients-title">
  <div class="container">
    <div class="client-wall__head">
      <p class="eyebrow">Clients</p>
      <h2 class="grad-head" id="clients-title">The businesses we look after</h2>
    </div>
    <ul class="client-wall" role="list">
      ${CLIENTS.map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="${c.title}" loading="lazy" decoding="async"></li>`).join("")}
    </ul>
  </div>
</section>

<section class="section section--mist" id="stories" aria-labelledby="stories-title">
  <div class="container">
    <div class="client-wall__head">
      <p class="eyebrow">Success stories</p>
      <h2 class="grad-head" id="stories-title">How we help, in their words</h2>
      <p>Real clients, real results. Dig into the detail of how WhizzIT supports businesses like yours.</p>
    </div>
    <div class="case-grid">${CASE_STUDIES.map((c) => caseTile(c)).join("")}</div>
  </div>
</section>
`;

page({
  footerCta: {
    title: "Want to be the next story?",
    text: `Book a no-obligation conversation about your systems and what to fix first. ${SITE.responseLine}.`,
    track: "customers-final-cta",
  },
  file: "our-customers.html",
  title: "Client Reviews & Success Stories",
  description: `WhizzIT is rated ${SITE.google.rating} on Google across ${SITE.google.count} reviews. Read client reviews and case studies from hotels, clinics, construction and professional services.`,
  bodyClass: "page--customers page--sky",
  crumbs,
  main,
});
