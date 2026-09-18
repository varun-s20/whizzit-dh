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
<section class="hero hero--sky hero--about" aria-labelledby="about-hero-title">
  <div class="container hero-sky__grid">
    <div class="hero-sky__copy">
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">About WhizzIT</p>
      <h1 class="hero-sky__title" id="about-hero-title">An independent IT partner<br><span>that puts clients first.</span></h1>
      <p class="hero-sky__lead">We saw a gap in the affordable IT support market for a business that genuinely puts clients first. WhizzIT combines best in class technical expertise with the accountability and responsiveness of a senior team that stays close to every account.</p>
      <div class="btn-group">
        ${btn("Book a consultation", "contact.html", { arrow: false, track: "about-hero-consultation" })}
        ${btn(`Call ${SITE.phone}`, SITE.phoneHref, { variant: "secondary", iconName: "phone", arrow: false, track: "about-hero-phone" })}
      </div>
    </div>
    <div class="hero-sky__visual">
      <div class="photo-stack">
        ${photo(PHOTOS.office, { cls: "photo-stack__main", ratio: "4-3", sizes: "(min-width: 1024px) 48vw, 100vw", loading: "eager" })}
        <div class="photo-stack__chip photo-stack__chip--top">
          <span class="photo-stack__score">${SITE.google.rating}</span>
          <span class="photo-stack__rating">
            ${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}
            <span>${SITE.google.count} Google reviews</span>
          </span>
        </div>
        <div class="photo-stack__chip photo-stack__chip--bottom">
          <img src="@/assets/images/partners/cyber-essentials.png" alt="Cyber Essentials certified" width="44" height="44" loading="lazy" decoding="async">
          <span><strong>Cyber Essentials</strong>certified, and we certify clients too</span>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section about-values" aria-labelledby="values-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">What we stand for</p>
        <h2 class="grad-head" id="values-title">Four things we refuse to compromise on</h2>
      </div>
      <p class="bar-head__aside">Every client gets the same dedication and care, whatever the size of their business.</p>
    </div>
    ${/* This page's signature: the four values run down one ruled spine with
         oversized numerals, instead of the four-up card grid every other page
         uses. Same content, a rhythm that belongs only to /about/. */""}
    <ol class="value-spine" role="list">
      ${values.map((v, i) => `
      <li class="value-step">
        <span class="value-step__num" aria-hidden="true">0${i + 1}</span>
        <span class="value-step__icon">${icon(v.icon)}</span>
        <div class="value-step__body">
          <h3>${v.title}</h3>
          <p>${v.text}</p>
        </div>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section about-mission" aria-labelledby="mission-title">
  <div class="container split-feature">
    <div class="split-feature__media">
      ${photo(PHOTOS.team, { ratio: "4-5", sizes: "(min-width: 1024px) 45vw, 100vw" })}
      <div class="split-feature__badge">${icon("checkCircle")}<span><strong>${SITE.responseLine}</strong>UK-wide coverage</span></div>
    </div>
    <div class="split-feature__body">
      <p class="eyebrow">Our mission</p>
      <h2 class="grad-head" id="mission-title">IT support built on long-term partnerships</h2>
      <p class="lead">Our mission is to deliver reliable, top tier IT services while making sure every client feels genuinely valued and properly supported.</p>
      <p>We believe that optimising the design of your systems, coupled with proactive support, is the key to unlocking your full business potential. We take the time to understand your goals, tailor our services to match, and build trusted partnerships that help your business grow with confidence.</p>
      <div class="btn-group mt-6">
        ${btn("Start a conversation", "contact.html", { arrow: false, track: "about-mission-cta" })}
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
