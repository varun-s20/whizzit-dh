// About page. Content is WhizzIT's own, taken from /about/ on staging (see _source/content/about.md).
import {
  page, statValue, reviewAvatar, stars, btn, icon, photo, breadcrumbs,
  SITE, STATS, TEAM, CREDENTIALS, PARTNERS, PHOTOS, TESTIMONIALS,
} from "../lib.mjs";

const values = [
  { title: "Service", icon: "headset", text: "Exceptional customer service is at the heart of everything we do. Five star support combining technical excellence with a personal touch." },
  { title: "Reliability", icon: "activity", text: "Speed and reliability are our priorities. Fast response times backed by clear SLA agreements, so issues are resolved quickly and efficiently." },
  { title: "Expertise", icon: "award", text: "Our team of highly skilled professionals brings in depth technical knowledge to every task, delivering the best solutions for your business." },
  { title: "Affordability", icon: "target", text: "Cost effective IT solutions without compromising on quality. Tailored support that maximises value and minimises costs for your business." },
];

const crumbs = [{ title: "Home", href: "index.html" }, { title: "About" }];

const review = TESTIMONIALS[0];

const main = `
<section class="hero hero--sky about-hero" aria-labelledby="about-hero-title">
  <div class="container about-hero__inner">
    ${breadcrumbs(crumbs)}
    <p class="eyebrow">About WhizzIT</p>
    ${/* Two lines. The promise sits on a raised metal nameplate that a band of
         light crosses once the headline has settled. */""}
    <h1 class="about-hero__title" id="about-hero-title">
      <span class="about-hero__line">An independent IT partner</span>
      <span class="about-hero__line"><span class="about-hero__plate">that puts clients first.</span></span>
    </h1>
    <p class="about-hero__lead">We saw a gap in the affordable IT support market for a business that genuinely puts clients first. WhizzIT combines best in class technical expertise with the accountability and responsiveness of a senior team that stays close to every account.</p>
    <div class="btn-group">
      ${btn("Book a consultation", "contact.html", { arrow: false, track: "about-hero-consultation" })}
      ${btn(`Call ${SITE.phone}`, SITE.phoneHref, { variant: "secondary", iconName: "phone", arrow: false, track: "about-hero-phone" })}
    </div>
  </div>
</section>

${/* Three of WhizzIT's own photos, set as raised plates that fan out from one
     stack on load and tilt with the pointer. Starts inside the dark hero and
     finishes on the page below. */""}
<div class="relief" data-tilt>
  <div class="container">
    <div class="relief__stage">
      <div class="relief__plate relief__plate--left">${photo(PHOTOS.office, { ratio: "4-3", sizes: "(min-width: 1024px) 500px, 56vw", loading: "eager" })}</div>
      <div class="relief__plate relief__plate--right">${photo(PHOTOS.van, { ratio: "4-3", sizes: "(min-width: 1024px) 500px, 56vw", loading: "eager" })}</div>
      <div class="relief__plate relief__plate--centre">${photo(PHOTOS.serviceDesk, { ratio: "4-5", sizes: "(min-width: 1024px) 400px, 44vw", loading: "eager" })}</div>
      <p class="relief__seal relief__seal--rating">
        <strong>${SITE.google.rating}</strong>
        ${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}
        <span>${SITE.google.count} Google reviews</span>
      </p>
      <p class="relief__seal relief__seal--cert">
        <img src="@/assets/images/partners/cyber-essentials.png" alt="" width="44" height="44" decoding="async">
        <span><strong>Cyber Essentials</strong>certified, and we certify clients too</span>
      </p>
    </div>
  </div>
</div>

<section class="section value-keys" aria-labelledby="values-title" data-no-reveal>
  <div class="container">
    <div class="value-keys__head">
      <p class="eyebrow">What we stand for</p>
      <h2 class="grad-head" id="values-title">Four things we refuse to compromise on</h2>
      <p>Every client gets the same dedication and care, whatever the size of their business.</p>
    </div>
    ${/* This page's signature: the four values are keys on a keyboard tray. When
         the tray scrolls into view they are pressed in turn, as if typed, and stay
         backlit. */""}
    <ol class="value-keys__tray" role="list" data-on-view>
      ${values.map((v, i) => `
      <li class="value-key" style="--i:${i}">
        <div class="value-key__cap">
          <span class="value-key__icon">${icon(v.icon)}</span>
          <h3 class="value-key__legend">${v.title}</h3>
        </div>
        <p>${v.text}</p>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section mission" aria-labelledby="mission-title" data-no-reveal>
  <div class="container">
    <div class="mission__head">
      <p class="eyebrow">Our mission</p>
      <h2 class="grad-head" id="mission-title">IT support built on long-term partnerships</h2>
    </div>
    ${/* One raised steel card: a slim photo banner, a quote medallion pressed onto
         its edge, then the mission engraved beneath. */""}
    <div class="mission-plaque">
      <div class="mission-plaque__window">
        ${photo(PHOTOS.team, { ratio: "16-9", sizes: "(min-width: 1100px) 1000px, 92vw" })}
      </div>
      <span class="mission-plaque__seal" aria-hidden="true">${icon("quote")}</span>
      <div class="mission-plaque__content">
        <blockquote class="mission-plaque__text">
          <p>Our mission is to deliver reliable, top tier IT services while making sure every client feels genuinely valued and properly supported.</p>
        </blockquote>
        <p class="mission-plaque__body">We believe that optimising the design of your systems, coupled with proactive support, is the key to unlocking your full business potential. We take the time to understand your goals, tailor our services to match, and build trusted partnerships that help your business grow with confidence.</p>
        <div class="btn-group">
          ${btn("Start a conversation", "contact.html", { arrow: false, track: "about-mission-cta" })}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section stat-band" aria-labelledby="stats-title">
  <div class="container">
    <div class="stat-band__head">
      <p class="eyebrow">By the numbers</p>
      <h2 class="grad-head grad-head--dark" id="stats-title">Proof, not promises</h2>
    </div>
    <dl class="stat-band__grid">
      ${STATS.map((s) => `
      <div>
        <dd>${statValue(s)}</dd>
        <dt>${s.label}</dt>
        <p>${s.note}</p>
      </div>`).join("")}
    </dl>
    <p class="stat-band__note">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
  </div>
</section>

<section class="section about-beyond" aria-labelledby="beyond-title">
  <div class="container">
    <div class="statement">
      <p class="eyebrow">Why choose WhizzIT</p>
      <h2 class="grad-head" id="beyond-title">Support that goes beyond the fix</h2>
      <p>Exceptional IT support goes beyond fixing technical issues. It is about providing outstanding customer service every step of the way, so you always feel supported and valued. We take the time to understand your business needs, offering tailored IT support that keeps your systems running smoothly with minimal disruption. Whether it is troubleshooting, proactive maintenance or strategic IT guidance, you get clear communication and a friendly, professional approach.</p>
    </div>
    <figure class="quote-feature">
      <span class="quote-feature__mark" aria-hidden="true">${icon("quote")}</span>
      <blockquote><p>“${review.quote}”</p></blockquote>
      <figcaption>
        ${reviewAvatar(review, { cls: "avatar--lg", badge: true })}
        <span><strong>${review.name}</strong>${review.role}</span>
        <a href="${SITE.google.reviewsUrl}" rel="noopener">See all ${SITE.google.count} reviews${icon("arrow")}</a>
      </figcaption>
    </figure>
  </div>
</section>

<section class="section about-team" id="team" aria-labelledby="team-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Meet the team</p>
      <h2 class="grad-head" id="team-title">The people behind WhizzIT</h2>
      <p>Senior engineers who stay close to every account, so you speak to someone who already knows your setup.</p>
    </div>
    <div class="people-grid">
      ${TEAM.map((m) => `
      <article class="team-card">
        <span class="team-card__avatar" aria-hidden="true">${m.initials}</span>
        <h3>${m.name}</h3>
        <p class="team-card__role">${m.role}</p>
        <p>${m.bio}</p>
        <a class="team-card__link" href="${m.linkedin}" rel="noopener">${icon("linkedin")}<span>LinkedIn</span></a>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="section about-credentials" aria-labelledby="credentials-title">
  <div class="container">
    <div class="center-head">
      <p class="eyebrow">Certified &amp; accredited</p>
      <h2 class="grad-head" id="credentials-title">Credentials you can check</h2>
    </div>
    <div class="cred-grid">
      ${CREDENTIALS.map((c) => `
      <article class="cred-card">
        <img src="@/assets/images/partners/${c.file}" alt="${c.title}" width="120" height="72" loading="lazy" decoding="async">
        <h3>${c.title}</h3>
        <p>${c.text}</p>
        <a class="text-link" href="@/${c.cta.href}"><span>${c.cta.label}</span>${icon("arrow")}</a>
      </article>`).join("")}
    </div>
    <p class="cred-note">Cyber Essentials is a UK government scheme run by the <a href="https://www.ncsc.gov.uk/cyberessentials/overview" rel="noopener">National Cyber Security Centre</a>, delivered by <a href="https://iasme.co.uk/cyber-essentials/" rel="noopener">IASME</a>. You can verify what the certification covers at source.</p>
    <ul class="partner-row mt-7" role="list">
      ${PARTNERS.map((p) => `<li><img src="@/assets/images/partners/${p.file}" alt="${p.title}" decoding="async"></li>`).join("")}
    </ul>
  </div>
</section>
`;

page({
  file: "about.html",
  title: "About WhizzIT | Independent Managed IT Provider",
  description: "WhizzIT is an independent managed IT provider supporting UK businesses with IT support, cloud and cyber security. Meet the team behind the five-star service.",
  bodyClass: "page--about page--sky",
  crumbs,
  footerCta: {
    title: "Ready to take IT off your plate?",
    text: "Book a free consultation and see what five-star, jargon-free IT support feels like.",
    cta: "Book a consultation",
  },
  main,
});
