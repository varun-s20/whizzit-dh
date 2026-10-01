// Home page. Every fact, quote, logo and photo comes from staging.whizzit.co.uk
// (see /_source); the layout is the bold redesign — photo-led hero, a proof strip
// that overlaps it, an ink services band, and photo tiles for stories and sectors.
import {
  page, statValue, btn, textLink, icon, photo, stockPhoto, postCover, stars, reviewAvatar, callbackForm, heroNote, caseTile,
  WP_EXPORT, SITE, SERVICES, INDUSTRIES, CLIENTS, PARTNERS, TESTIMONIALS, CASE_STUDIES, STATS, PHOTOS, BLOG_LISTING, STOCK, SECTOR_PHOTO,
} from "../lib.mjs";

/* ---------- About tabs (from /about/) ---------- */
const about = [
  { key: "mission", label: "Our mission", text: "Our mission is to deliver reliable, top tier IT services while making sure every client feels genuinely valued and properly supported. We believe that optimising the design of your systems, coupled with proactive support, is the key to unlocking your full business potential." },
  { key: "approach", label: "Our approach", text: "Every client gets the same dedication and care, whatever the size of their business. We take the time to understand your goals, tailor our services to match, and build trusted partnerships that help your business grow with confidence." },
  { key: "story", label: "Our story", text: "We saw a gap in the affordable IT support market for a business that genuinely puts clients first. WhizzIT combines best in class technical expertise with the accountability and responsiveness of a senior team that stays close to every account." },
];

/* ---------- Services ----------
   A ruled list on the right, and on the left a sticky stage that follows the
   reader down it: the service being read takes the stage in its own colour, and
   the rail fills with the scroll (initServiceStage in app.js). The stage repeats
   what the list says, so it is hidden from assistive tech. */
const serviceItems = [
  ...SERVICES,
  { icon: "message", tone: "support", title: "Something else?", href: "contact.html", desc: "Not sure what you need? Tell us what you’re wrestling with and we’ll point you in the right direction." },
];
const pad = (n) => String(n).padStart(2, "0");

const serviceRows = serviceItems.map((s) => `
  <li class="svc-row tone-${s.tone}">
    <span class="svc-row__icon">${icon(s.icon)}</span>
    <div class="svc-row__body">
      <h3 class="svc-row__title"><a class="card-link" href="@/${s.href}">${s.title}</a>${icon("arrow")}</h3>
      <p>${s.desc}</p>
    </div>
  </li>`).join("");

const serviceStage = `
  <div class="svc-stage" aria-hidden="true">
    ${serviceItems.map((s, i) => `
    <div class="svc-stage__slide tone-${s.tone}${i === 0 ? " is-active" : ""}">
      <span class="svc-stage__glow"></span>
      <span class="svc-stage__num">${pad(i + 1)}</span>
      <span class="svc-stage__icon">${icon(s.icon)}</span>
      <span class="svc-stage__title">${s.title}</span>
    </div>`).join("")}
    <div class="svc-stage__foot">
      <span class="svc-stage__count"><span class="svc-stage__now">01</span> / ${pad(serviceItems.length)}</span>
      <span class="svc-stage__rail"><span class="svc-stage__fill"></span></span>
    </div>
  </div>`;

/* ---------- Proof strip: an icon and a tone per figure, in STATS order ---------- */
const STAT_LOOK = [["handHeart", "cyber"], ["award", "support"], ["clock", "cloud"], ["star", "projects"]];

// A figure with an href (the Google rating) links out: its note becomes the link
// text, and the link stretches over the whole tile.
const statItem = (s, i) => `
      <div class="stat-strip__item${s.href ? " stat-strip__item--link" : ""} tone-${STAT_LOOK[i][1]}">
        <dt><span class="stat-strip__icon">${icon(STAT_LOOK[i][0])}</span>${s.label}</dt>
        <dd class="stat-strip__value">${statValue(s)}</dd>
        ${s.href ? `<dd class="stat-strip__more"><a class="card-link" href="${s.href}" target="_blank" rel="noopener" data-track="home-strip-google">${s.note}${icon("arrow")}</a></dd>` : ""}
      </div>`;

/* ---------- About photos ----------
   WhizzIT's own photography as an auto-sliding carousel. The track is a
   scroll-snap row, so it swipes natively on touch. Slim bars at the foot fill
   over each slide's time and jump to a photo; two small arrows step through
   (initCarousels in app.js). */
const ABOUT_PHOTOS = [PHOTOS.team, PHOTOS.serviceDesk, PHOTOS.office, PHOTOS.van];
const aboutCarousel = `
      <div class="photo-carousel home-about__media" data-carousel role="region" aria-roledescription="carousel" aria-label="Inside WhizzIT">
        <div class="photo-carousel__track" id="about-photos" data-carousel-track>
          ${ABOUT_PHOTOS.map((p, i) => `<div class="photo-carousel__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${ABOUT_PHOTOS.length}">${photo(p, { ratio: "4-3", sizes: "(min-width: 1024px) 45vw, 100vw", loading: i ? "lazy" : "eager" })}</div>`).join("")}
        </div>
        <div class="photo-carousel__controls">
          <div class="photo-carousel__dots">
            ${ABOUT_PHOTOS.map((p, i) => `<button class="photo-carousel__dot" type="button" aria-controls="about-photos" aria-label="Show photo ${i + 1}"${i ? "" : ' aria-current="true"'} data-carousel-dot></button>`).join("")}
          </div>
          <div class="photo-carousel__arrows">
            <button class="photo-carousel__nav" type="button" aria-controls="about-photos" aria-label="Previous photo" data-carousel-prev>${icon("arrowLeft")}</button>
            <button class="photo-carousel__nav" type="button" aria-controls="about-photos" aria-label="Next photo" data-carousel-next>${icon("arrow")}</button>
          </div>
        </div>
      </div>`;

/* ---------- Case studies ---------- */
const cases = CASE_STUDIES.map((c) => caseTile(c)).join("");

const START = 2;

/* ---------- FAQs (from the home page on staging) ---------- */
const faqs = [
  { q: "What is a managed IT services provider (MSP)?", a: "An MSP is an outsourced IT partner that proactively monitors, manages and secures your business technology. That covers IT support, cloud services, cyber security and disaster recovery, without the need for a full in-house IT team." },
  { q: "Why use an MSP instead of an in-house IT team?", a: "For a similar budget to a single hire, an MSP gives you a whole team with a broad skill set, proactive monitoring and expert cyber security, all for a fixed monthly cost that scales with your business." },
  { q: "What types of businesses benefit from managed IT?", a: "Any business that relies on technology. We support professional services, hospitality, healthcare, construction and more, keeping systems secure, compliant and productive." },
  { q: "How much does managed IT support cost?", a: "Pricing depends on the size of your business and the level of support you need. We offer flexible support plans with transparent, predictable monthly fees." },
];

/* ---------- Insights ---------- */
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
// The latest four articles, as staging's blog cards describe them.
const latest = BLOG_LISTING.filter((c) => c.slug).slice(0, 4);
const insight = (p, variant) => `
  <article class="insight insight--${variant}">
    ${postCover(p, "insight__art")}
    <div class="insight__body">
      <p class="insight__date">${icon("calendar")}<time datetime="${p.date}">${fmt(p.date)}</time><span class="tag tag--blue">${p.categoryLabel}</span></p>
      <h3 class="insight__title"><a class="card-link" href="@/${p.href}">${p.title}</a></h3>
      <p>${p.excerpt}</p>
    </div>
  </article>`;

const main = `
<section class="hero hero--sky hero-home" aria-labelledby="hero-title">
  ${photo(PHOTOS.van, { cls: "hero-home__bg", ratio: "16-9", sizes: "100vw", loading: "eager" })}
  <div class="container hero-home__inner">
    <div class="hero-home__copy">
      <p class="eyebrow reveal-up" style="--delay:0ms">Managed IT services provider</p>
      <h1 class="hero-sky__title hero-home__title reveal-up" style="--delay:60ms" id="hero-title">Managed IT <span>that keeps your business moving.</span></h1>
      <div class="reveal-up" style="--delay:120ms">${heroNote("UK-wide coverage", "home-hero")}</div>
    </div>
    ${/* The callback form sits beside the headline on wide screens, as on the
         live site, on frosted glass so the van still reads through it. */""}
    <div class="hero-home__form reveal-up" style="--delay:180ms">${callbackForm({ track: "home-hero", phone: true })}</div>
    <div class="hero-home__clients">
      <p class="hero-home__clients-label" id="clients-label">Trusted by the businesses we look after</p>
      ${/* Every client logo on an endless loop. The list is written twice and each
           copy slides its own width, so the join never shows; the second copy is
           hidden from assistive tech. Hover pauses it, and under reduced
           motion it is a still row that scrolls sideways. */""}
      <div class="marquee" data-marquee>
        <div class="marquee__viewport">
          <ul class="marquee__track" role="list" aria-labelledby="clients-label">
            ${CLIENTS.map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="${c.title}" decoding="async"></li>`).join("")}
          </ul>
          <ul class="marquee__track" role="list" aria-hidden="true">
            ${CLIENTS.map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="" decoding="async"></li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="home-strip">
  <div class="container">
    <dl class="stat-strip">
      ${STATS.map(statItem).join("")}
    </dl>
    <p class="home-strip__source">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
    <p class="home-strip__lead">WhizzIT delivers expert managed IT services and reliable IT support to businesses across the UK. Proactive maintenance, responsive support and no tech jargon. Simple, secure and stress free.</p>
  </div>
</div>

<section class="section home-about" aria-labelledby="about-title">
  <div class="container">
    <div class="center-head">
      <h2 class="grad-head" id="about-title">A partner, not just a provider</h2>
      <p>WhizzIT is a managed IT services provider supporting businesses across the UK. Our focus is simple: reliable, high quality IT and exceptional customer service.</p>
    </div>
    <div class="home-about__grid">
      ${aboutCarousel}
      <div class="home-about__body">
        <div class="tabs" data-tabs>
          <div class="tabs__list pill-tabs" role="tablist" aria-label="About WhizzIT">
            ${about.map((t, i) => `<button class="tabs__tab" type="button" role="tab" id="tab-${t.key}" aria-controls="panel-${t.key}" aria-selected="${i === 0}">${t.label}</button>`).join("")}
          </div>
          ${about.map((t) => `<div class="tabs__panel" role="tabpanel" id="panel-${t.key}" aria-labelledby="tab-${t.key}" tabindex="0"><p>${t.text}</p>${textLink("More about us", "about.html", "home-about-more")}</div>`).join("")}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--ink home-services" data-service-stage aria-labelledby="services-title">
  <div class="container home-services__grid">
    <div class="home-services__aside">
      ${serviceStage}
      ${textLink("View all services", "it-services.html", "home-all-services")}
    </div>
    <div class="home-services__body">
      <h2 class="grad-head" id="services-title">Everything IT, under one roof</h2>
      <p class="lead">From day to day support to cloud, cyber security and full project delivery, WhizzIT looks after the lot. Five core services, one accountable team.</p>
      <ul class="svc-list" role="list">${serviceRows}</ul>
    </div>
  </div>
</section>

<section class="section home-results" id="stories" aria-labelledby="results-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <h2 class="grad-head" id="results-title">Real clients, real results</h2>
        <p>From hotels and construction firms to clinics and consultancies, businesses of every shape rely on WhizzIT to keep their technology running.</p>
      </div>
      ${textLink("Read the success stories", "our-customers.html#stories", "home-all-stories")}
    </div>
    <div class="case-grid">${cases}</div>
  </div>
</section>

<section class="section home-quotes" id="reviews" aria-labelledby="quotes-title">
  <div class="container">
    <div class="center-head">
      <h2 class="grad-head" id="quotes-title">Don’t just take our word for it</h2>
      <p>Rated ${SITE.google.rating} on Google. Every review below is verified on our <a href="${SITE.google.reviewsUrl}" rel="noopener">Google Business profile</a>.</p>
    </div>
    <div class="quote-slider" data-quotes>
      ${/* Dots, not a row of eleven initial-circles. With no reviewer photos on file
           those circles were eleven coloured blobs saying nothing; the reviewer's
           avatar now sits beside their name inside the quote, where it has a name
           to belong to. */""}
      <div class="quote-slider__stage">
        <button class="quote-slider__nav quote-slider__nav--prev" type="button" data-quote-prev aria-label="Previous review">${icon("arrowLeft")}</button>
        ${TESTIMONIALS.map((q, i) => `
        <figure class="quote-slider__item" role="tabpanel" id="quote-${i}"${i === START ? "" : " data-hidden"}>
          ${stars(`Rated ${SITE.google.rating} out of 5`)}
          <blockquote><p>“${q.quote}”</p></blockquote>
          <figcaption>
            ${reviewAvatar(q, { cls: "avatar--lg", badge: true })}
            <span class="quote-slider__who"><strong>${q.name}</strong><span>${q.role}</span></span>
          </figcaption>
        </figure>`).join("")}
        <button class="quote-slider__nav quote-slider__nav--next" type="button" data-quote-next aria-label="Next review">${icon("arrow")}</button>
      </div>
      <div class="quote-slider__dots" role="tablist" aria-label="Choose a review">
        ${TESTIMONIALS.map((q, i) => `<button class="quote-slider__dot" type="button" role="tab" aria-selected="${i === START}" aria-controls="quote-${i}" aria-label="Review from ${q.name}"></button>`).join("")}
      </div>
    </div>
  </div>
</section>

<section class="section home-sectors" aria-labelledby="sectors-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <h2 class="grad-head" id="sectors-title">Industries we work with</h2>
        <p>Specialist IT support shaped around the way your industry works: its systems, its compliance demands and its pace.</p>
      </div>
      ${btn("View all industries", "industries.html", { variant: "secondary", arrow: false, track: "home-industries" })}
    </div>
    <ul class="sector-cards" role="list">
      ${WP_EXPORT ? '[whizzit_sectors view="cards"]' : INDUSTRIES.map((s) => `
      <li class="sector-card">
        <a href="@/${s.href}">
          ${stockPhoto(STOCK[SECTOR_PHOTO[s.key]], { cls: "sector-card__art", ratio: "3-2", sizes: "(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw", alt: "" })}
          <span class="sector-card__body">
            <span class="sector-card__icon">${icon(s.icon)}</span>
            <strong>${s.title}</strong>
            <span class="sector-card__desc">${s.desc}</span>
            <span class="sector-card__go" aria-hidden="true">${icon("arrow")}</span>
          </span>
        </a>
      </li>`).join("")}
    </ul>
  </div>
</section>

<section class="section home-pricing" aria-labelledby="pricing-title">
  <div class="container">
    <div class="pricing">
      <div class="plan-detail plan-detail--single">
        <h2 class="grad-head" id="pricing-title">Pricing built around your business</h2>
        <p>No rigid packages and no surprises. We shape your support plan and price around your team, systems and goals, then give you a clear, no-obligation quote. Most businesses are surprised how affordable proactive, fully managed IT really is.</p>
        <div class="btn-group mt-6">
          ${btn("Get a tailored quote", "contact.html", { arrow: false, track: "home-pricing-quote" })}
          ${btn(`Call ${SITE.phone}`, SITE.phoneHref, { variant: "secondary", iconName: "phone", arrow: false, track: "home-pricing-phone" })}
        </div>
      </div>
      <div class="faq-panel">
        <h3 class="h4">Frequently asked questions</h3>
        ${faqs.map((f) => `<details class="faq-item"><summary>${f.q}</summary><div class="faq-item__body"><p>${f.a}</p></div></details>`).join("")}
      </div>
    </div>
  </div>
</section>

<section class="section section--tight home-partners" aria-labelledby="partners-title">
  <div class="container">
    <div class="center-head">
      <h2 class="grad-head" id="partners-title">Brands we partner with</h2>
      <p>We hold partner status with the vendors behind the tools we deploy, so your licensing, support and escalation come direct from the source rather than through a reseller chain.</p>
    </div>
    <ul class="partner-row" role="list">
      ${PARTNERS.map((p) => `<li><img src="@/assets/images/partners/${p.file}" alt="${p.title}" decoding="async"></li>`).join("")}
    </ul>
  </div>
</section>

<section class="section home-insights" aria-labelledby="insights-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <h2 class="grad-head" id="insights-title">Insights &amp; innovations</h2>
        <p>Practical advice from the WhizzIT team, from cyber security and cloud strategy to getting more from the technology you already pay for.</p>
      </div>
      ${textLink("View all articles", "blog.html", "home-blog")}
    </div>
    <div class="insight-grid">
      ${WP_EXPORT ? "[whizzit_insights]" : [insight(latest[0], "tall"), insight(latest[1], "card"), insight(latest[2], "card"), insight(latest[3], "wide")].join("")}
    </div>
  </div>
</section>
`;

page({
  file: "index.html",
  title: "WhizzIT | Managed IT Services & IT Support",
  description: "WhizzIT delivers managed IT services, IT support, cloud and cyber security for businesses across the UK. Rated 5.0 on Google. Same working day response.",
  bodyClass: "page--home page--sky",
  footerCta: {
    title: "Ready to take IT off your plate?",
    text: "Book a free consultation and see what five-star, jargon-free IT support feels like.",
    cta: "Book a consultation",
  },
  main,
});
