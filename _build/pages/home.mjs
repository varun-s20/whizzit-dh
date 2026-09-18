// Home page. Layout follows the approved /ref design; every fact, quote, logo and
// photo comes from staging.whizzit.co.uk (see /_source).
import {
  page, statValue, btn, icon, photo, stockPhoto, stars, reviewAvatar,
  SITE, SERVICES, INDUSTRIES, CLIENTS, PARTNERS, TESTIMONIALS, CASE_STUDIES, STATS, PHOTOS, BLOG, STOCK, CATEGORY_PHOTO, SECTOR_PHOTO,
} from "../lib.mjs";

/* ---------- Hero stage ----------
   A looping, explanatory animation: alerts arrive, get picked up and resolve.
   CSS keyframes only, so it runs off the main thread, and it settles on the
   resolved state when the visitor prefers reduced motion. */
const tickets = [
  { icon: "mail", title: "Phishing email quarantined", meta: "Microsoft 365 · finance team" },
  { icon: "laptop", title: "Failed disk spotted early", meta: "Laptop · replaced next day" },
  { icon: "wifi", title: "Site connection failed over", meta: "Stevenage office · no downtime" },
];

const heroStage = `
<div class="stage" aria-hidden="true">
  <div class="stage__bar">
    <span class="stage__live"><span class="stage__dot"></span>Monitoring</span>
    <span class="stage__count">1,240 devices</span>
  </div>

  <svg class="stage__pulse" viewBox="0 0 320 48" fill="none" preserveAspectRatio="none">
    <path class="stage__pulse-line" d="M0 32 H70 l10-16 10 26 8-14 10 6 H180 l10-10 8 14 10-18 8 12 H320" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <ul class="stage__feed" role="list">
    ${tickets.map((t, i) => `
    <li class="stage__ticket stage__ticket--${i + 1}">
      <span class="stage__icon">${icon(t.icon)}</span>
      <span class="stage__text"><strong>${t.title}</strong><span>${t.meta}</span></span>
      <span class="stage__status"><span class="stage__status-open">Open</span><span class="stage__status-done">${icon("check")}Resolved</span></span>
    </li>`).join("")}
  </ul>

  <div class="stage__foot">
    <div>
      <strong>9 min</strong>
      <span>Average first response</span>
    </div>
    <div>
      <strong>${icon("star")}${SITE.google.rating}</strong>
      <span>${SITE.google.count} Google reviews</span>
    </div>
    <div class="stage__badges">
      <img src="@/assets/images/partners/cyber-essentials.png" alt="" width="60" height="44" decoding="async">
      <img src="@/assets/images/partners/microsoft-csp.png" alt="" width="60" height="44" decoding="async">
    </div>
  </div>
</div>`;

/* ---------- About tabs (from /about/) ---------- */
const about = [
  { key: "mission", label: "Our mission", text: "Our mission is to deliver reliable, top tier IT services while making sure every client feels genuinely valued and properly supported. We believe that optimising the design of your systems, coupled with proactive support, is the key to unlocking your full business potential." },
  { key: "approach", label: "Our approach", text: "Every client gets the same dedication and care, whatever the size of their business. We take the time to understand your goals, tailor our services to match, and build trusted partnerships that help your business grow with confidence." },
  { key: "story", label: "Our story", text: "We saw a gap in the affordable IT support market for a business that genuinely puts clients first. WhizzIT combines best in class technical expertise with the accountability and responsiveness of a senior team that stays close to every account." },
];

/* ---------- Services (five pillars, plus the “something else” route) ---------- */
const serviceCards = SERVICES.map((s, i) => `
  <article class="svc-card${i === 0 ? " is-featured" : ""}">
    <span class="svc-card__icon">${icon(s.icon)}</span>
    <h3 class="svc-card__title"><a class="card-link" href="@/${s.href}">${s.title}</a></h3>
    <p>${s.desc}</p>
  </article>`).join("") + `
  <article class="svc-card svc-card--route">
    <span class="svc-card__icon">${icon("message")}</span>
    <h3 class="svc-card__title"><a class="card-link" href="@/contact.html">Something else?</a></h3>
    <p>Not sure what you need? Tell us what you’re wrestling with and we’ll point you in the right direction.</p>
  </article>`;

/* ---------- Case studies ---------- */
const CASE_PHOTO = {
  "the-portland-hotel-group": PHOTOS.van,
  "ixia-clinical": PHOTOS.serviceDesk,
  "gh-building-and-landscaping": PHOTOS.network,
  "mbkb-group": PHOTOS.team,
};

const projects = CASE_STUDIES.map((c) => `
  <article class="project-card">
    ${photo(CASE_PHOTO[c.slug], { cls: "project-card__art", ratio: "3-2", sizes: "(min-width: 768px) 45vw, 100vw" })}
    <span class="tag">${c.sector}</span>
    <h3 class="project-card__title"><a class="card-link" href="@/our-customers/${c.slug}.html">${c.title}</a></h3>
    <p>${c.excerpt}</p>
    <span class="read-more" aria-hidden="true">Read the story ${icon("arrow")}</span>
  </article>`).join("");

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
const insight = (p, variant) => `
  <article class="insight insight--${variant}">
    ${stockPhoto(STOCK[CATEGORY_PHOTO[p.category]] || STOCK.team, { cls: "insight__art", ratio: variant === "tall" ? "4-5" : "3-2", sizes: "(min-width: 1024px) 32vw, 100vw", alt: "" })}
    <div class="insight__body">
      <p class="insight__date">${icon("calendar")}<time datetime="${p.date}">${fmt(p.date)}</time><span class="tag tag--blue">${p.categoryLabel}</span></p>
      <h3 class="insight__title"><a class="card-link" href="@/blog/${p.slug}.html">${p.title}</a></h3>
      <p>${p.excerpt}</p>
    </div>
  </article>`;

const main = `
<section class="hero hero--sky" aria-labelledby="hero-title">
  <div class="container hero-sky__grid">
    <div class="hero-sky__copy">
      <p class="eyebrow reveal-up" style="--delay:0ms">Managed IT services provider</p>
      <h1 class="hero-sky__title reveal-up" style="--delay:60ms" id="hero-title">Managed IT<br><span>that keeps your business moving.</span></h1>
      <p class="hero-sky__lead reveal-up" style="--delay:120ms">WhizzIT delivers expert managed IT services and reliable IT support to businesses across the UK. Proactive maintenance, responsive support and no tech jargon. Simple, secure and stress free.</p>
      <div class="btn-group reveal-up" style="--delay:180ms">
        ${btn("Book a consultation", "contact.html", { arrow: false, track: "home-hero-book-consultation" })}
        ${btn("Explore services", "it-services.html", { variant: "secondary", arrow: false, track: "home-hero-services" })}
      </div>
      <p class="hero-sky__note reveal-up" style="--delay:240ms">${icon("phone")}<a href="${SITE.phoneHref}" data-track="home-hero-phone">${SITE.phone}</a> · ${SITE.responseLine}</p>
    </div>
    <div class="hero-sky__visual">${heroStage}</div>
  </div>
  <div class="container">
    <div class="client-band">
      <p class="client-band__label">Trusted by the businesses we look after</p>
      <ul class="logo-row" role="list">
        ${CLIENTS.slice(0, 6).map((c) => `<li><img src="@/assets/images/clients/${c.file}" alt="${c.title}" decoding="async"></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="section home-about" aria-labelledby="about-title">
  <div class="container">
    <div class="center-head">
      <h2 class="grad-head" id="about-title">A partner, not just a provider</h2>
      <p>WhizzIT is a managed IT services provider supporting businesses across the UK. Our focus is simple: reliable, high quality IT and exceptional customer service.</p>
    </div>
    <div class="home-about__grid">
      ${photo(PHOTOS.team, { cls: "home-about__media", ratio: "4-3", sizes: "(min-width: 1024px) 45vw, 100vw", loading: "eager" })}
      <div class="home-about__body">
        <div class="tabs" data-tabs>
          <div class="tabs__list pill-tabs" role="tablist" aria-label="About WhizzIT">
            ${about.map((t, i) => `<button class="tabs__tab" type="button" role="tab" id="tab-${t.key}" aria-controls="panel-${t.key}" aria-selected="${i === 0}">${t.label}</button>`).join("")}
          </div>
          ${about.map((t) => `<div class="tabs__panel" role="tabpanel" id="panel-${t.key}" aria-labelledby="tab-${t.key}" tabindex="0"><p>${t.text} <a class="more-link" href="@/about.html">More about us</a></p></div>`).join("")}
        </div>
        <dl class="mini-stats">
          ${STATS.map((s) => `<div><dt>${s.label}</dt><dd>${statValue(s)}</dd></div>`).join("")}
        </dl>
        <p class="small muted">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
      </div>
    </div>
  </div>
</section>

<section class="section home-services" aria-labelledby="services-title">
  <div class="container">
    <div class="center-head">
      <h2 class="grad-head" id="services-title">Everything IT, under one roof</h2>
      <p>From day to day support to cloud, cyber security and full project delivery, WhizzIT looks after the lot. Five core services, one accountable team.</p>
    </div>
    <div class="svc-grid">${serviceCards}</div>
    <div class="center-cta">${btn("View all services", "it-services.html", { variant: "secondary", arrow: false, track: "home-all-services" })}</div>
  </div>
</section>

<section class="section home-results" id="stories" aria-labelledby="results-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <h2 class="grad-head" id="results-title">Real clients, real results</h2>
        <p>From hotels and construction firms to clinics and consultancies, businesses of every shape rely on WhizzIT to keep their technology running.</p>
      </div>
      ${btn("Read the success stories", "our-customers.html#stories", { variant: "secondary", arrow: false, track: "home-all-stories" })}
    </div>
    <div class="project-grid">${projects}</div>
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
      ${INDUSTRIES.map((s) => `
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
      ${btn("View all articles", "blog.html", { variant: "secondary", arrow: false, track: "home-blog" })}
    </div>
    <div class="insight-grid">
      ${insight(BLOG[0], "tall")}
      ${insight(BLOG[1], "card")}
      ${insight(BLOG[2], "card")}
      ${insight(BLOG[3], "wide")}
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
