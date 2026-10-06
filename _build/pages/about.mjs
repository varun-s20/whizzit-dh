// About page. A calm page in scenes that play as you scroll.
//  1. Header: dark and understated. The headline with a hand-drawn underline,
//     a quiet trust line, and one photograph presented like a framed print.
//  2. The window: the team photo opens from a rounded window to the full
//     screen as you scroll; the mission rises over it on a dark gradient.
//  3. Three chapters (our story, our approach, why WhizzIT) scroll past a
//     pinned photograph that wipes to a new picture for each chapter.
//  4. The four values as a quiet row of boxes.
//  5. The figures, the team, the review and credentials.
// Scroll scenes are app.js initAboutFilm; without JS, and under reduced
// motion, every scene is simply laid out in order. Every word is WhizzIT's own
// (/about/ on staging, and the home page's "Our approach").
import {
  page, statValue, reviewAvatar, stars, btn, icon, photo, breadcrumbs, heroNote, credBadges,
  SITE, STATS, TEAM, PHOTOS, TESTIMONIALS,
} from "../lib.mjs";

const values = [
  { title: "Service", icon: "headset", text: "Exceptional customer service is at the heart of everything we do. Five star support combining technical excellence with a personal touch." },
  { title: "Reliability", icon: "activity", text: "Speed and reliability are our priorities. Fast response times backed by clear SLA agreements, so issues are resolved quickly and efficiently." },
  { title: "Expertise", icon: "award", text: "Our team of highly skilled professionals brings in depth technical knowledge to every task, delivering the best solutions for your business." },
  { title: "Affordability", icon: "target", text: "Cost effective IT solutions without compromising on quality. Tailored support that maximises value and minimises costs for your business." },
];

const chapters = [
  {
    label: "Our story",
    title: "A partner, not just a provider",
    text: "We saw a gap in the affordable IT support market for a business that genuinely puts clients first. WhizzIT combines best in class technical expertise with the accountability and responsiveness of a senior team that stays close to every account.",
    photo: PHOTOS.office,
    caption: "Engineers at work in the WhizzIT office",
  },
  {
    label: "Our approach",
    title: "IT support built on long-term partnerships",
    text: "Every client gets the same dedication and care, whatever the size of their business. We take the time to understand your goals, tailor our services to match, and build trusted partnerships that help your business grow with confidence.",
    photo: PHOTOS.serviceDesk,
    caption: "A service desk engineer helping a client",
  },
  {
    label: "Why choose WhizzIT",
    title: "Support that goes beyond the fix",
    text: "Exceptional IT support goes beyond fixing technical issues. It is about providing outstanding customer service every step of the way, so you always feel supported and valued. Whether it is troubleshooting, proactive maintenance or strategic IT guidance, you get clear communication and a friendly, professional approach.",
    photo: PHOTOS.van,
    caption: "The WhizzIT van, outside the office",
  },
];

const crumbs = [{ title: "Home", href: "index.html" }, { title: "About" }];
const review = TESTIMONIALS[0];
const pad = (n) => String(n).padStart(2, "0");

const main = `
<section class="hero hero--sky film-title" aria-labelledby="about-hero-title">
  <div class="film-title__glow" aria-hidden="true"></div>
  <div class="container">
    ${breadcrumbs(crumbs)}
    <div class="film-title__grid">
      <div class="film-title__copy">
        <p class="eyebrow">About WhizzIT</p>
        <h1 class="film-title__head" id="about-hero-title">An independent IT partner that puts <span class="film-title__mark">clients first.<svg viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M3 12 C 70 4, 150 3, 297 9" pathLength="1"></path><path d="M40 16 C 110 10, 190 10, 260 14" pathLength="1"></path></svg></span></h1>
        <p class="film-title__lead">WhizzIT is an independent managed IT provider supporting UK businesses with IT support, cloud and cyber security.</p>
        <div class="film-title__actions">
          ${btn("Book a consultation", "contact.html", { track: "about-hero-book" })}
          <a class="film-title__link" href="#team" data-track="about-hero-team">Meet the team${icon("arrow")}</a>
        </div>
        <ul class="film-title__trust" role="list">
          <li><a href="${SITE.google.reviewsUrl}" rel="noopener" data-track="about-hero-google"><strong>${SITE.google.rating}</strong>${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}<span>${SITE.google.count} Google reviews</span></a></li>
          <li>${icon("shield")}<span>Cyber Essentials certified</span></li>
          <li>${icon("cloud")}<span>Microsoft Cloud Solution Provider</span></li>
        </ul>
      </div>
      ${/* One real photograph, with a caption plate. */""}
      <figure class="film-print">
        <div class="film-print__photo">${photo(PHOTOS.headset, { ratio: "4-5", sizes: "(min-width: 1024px) 460px, 90vw", loading: "eager" })}</div>
        <figcaption class="film-print__caption">${icon("headset")}<span>An engineer on the service desk, taking a client's call</span></figcaption>
      </figure>
    </div>
  </div>
</section>

${/* The window: a sticky stage. The photo's frame opens from a rounded window
     to the full screen as the stage scrolls through, then the mission rises over a dark gradient. */""}
<section class="film-window" aria-labelledby="mission-title" data-film-window data-no-reveal>
  <div class="film-window__stage">
    <div class="film-window__frame">
      ${photo(PHOTOS.team, { cls: "film-window__photo", ratio: "16-9", sizes: "100vw" })}
    </div>
    <div class="film-window__copy">
      <p class="eyebrow" id="mission-title">Our mission</p>
      <blockquote class="film-window__quote"><p>Our mission is to deliver reliable, top tier IT services while making sure every client feels genuinely valued and properly supported.</p></blockquote>
    </div>
  </div>
</section>

<section class="film-chapters" aria-label="Our story" data-film-chapters data-no-reveal>
  <div class="container film-chapters__grid">
    <div class="film-chapters__media" aria-hidden="true">
      <div class="film-chapters__frame">
        ${chapters.map((c, i) => `
        <figure class="film-shot${i === 0 ? " is-active" : ""}" data-film-shot>
          ${photo(c.photo, { ratio: "4-5", sizes: "(min-width: 1024px) 520px, 100vw" })}
          <figcaption>${c.caption}</figcaption>
        </figure>`).join("")}
        <span class="film-chapters__count"><span data-film-now>01</span> / ${pad(chapters.length)}</span>
      </div>
    </div>
    <ol class="film-chapters__list" role="list">
      ${chapters.map((c, i) => `
      <li class="film-chapter" data-film-chapter>
        <figure class="film-chapter__photo">${photo(c.photo, { ratio: "4-3", sizes: "100vw" })}<figcaption>${c.caption}</figcaption></figure>
        <p class="film-chapter__label"><span>${pad(i + 1)}</span>${c.label}</p>
        <h2 class="film-chapter__title">${c.title}</h2>
        <p class="film-chapter__text">${c.text}</p>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="film-values" aria-labelledby="values-title">
  <div class="container">
    <div class="film-values__head">
      <p class="eyebrow">What we stand for</p>
      <h2 class="grad-head" id="values-title">Four things we refuse to compromise on</h2>
      <p>Every client gets the same dedication and care, whatever the size of their business.</p>
    </div>
    <ol class="film-values__grid" role="list">
      ${values.map((v, i) => `
      <li class="film-value">
        <span class="film-value__top">
          <span class="film-value__icon" aria-hidden="true">${icon(v.icon)}</span>
          <span class="film-value__num" aria-hidden="true">${pad(i + 1)}</span>
        </span>
        <h3 class="film-value__title">${v.title}</h3>
        <p class="film-value__text">${v.text}</p>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="film-figures" aria-labelledby="stats-title">
  <div class="container">
    <p class="eyebrow">By the numbers</p>
    <h2 class="visually-hidden" id="stats-title">Proof, not promises</h2>
    <dl class="film-figures__grid">
      ${STATS.map((s) => `
      <div class="film-figure">
        <dd>${statValue(s)}</dd>
        <dt>${s.label}</dt>
        <p>${s.note}</p>
      </div>`).join("")}
    </dl>
    <p class="film-figures__note">Figures published by WhizzIT. Response and resolution times measured across every ticket in 2025.</p>
  </div>
</section>

<section class="section film-team" id="team" aria-labelledby="team-title">
  <div class="container">
    <div class="film-team__head">
      <div>
        <p class="eyebrow">Meet the team</p>
        <h2 class="grad-head" id="team-title">The people behind WhizzIT</h2>
      </div>
      <p>Senior engineers who stay close to every account, so you speak to someone who already knows your setup.</p>
    </div>
    <div class="film-team__grid">
      ${TEAM.map((m, i) => `
      <article class="film-person" style="--i:${i}">
        <span class="film-person__mono" aria-hidden="true">${m.initials}</span>
        <h3 class="film-person__name">${m.name}</h3>
        <p class="film-person__role">${m.role}</p>
        <p class="film-person__bio">${m.bio}</p>
        <a class="film-person__link" href="${m.linkedin}" rel="noopener" aria-label="${m.name} on LinkedIn">${icon("linkedin")}<span>LinkedIn</span></a>
      </article>`).join("")}
    </div>
  </div>
</section>

<section class="film-quote" aria-label="Customer review">
  <div class="container">
    <figure class="film-quote__fig">
      ${stars(`Rated ${SITE.google.rating} out of 5`)}
      <blockquote><p>“${review.quote}”</p></blockquote>
      <figcaption>
        ${reviewAvatar(review, { badge: true })}
        <span><strong>${review.name}</strong>${review.role}</span>
        <a href="${SITE.google.reviewsUrl}" rel="noopener">See all ${SITE.google.count} reviews${icon("arrow")}</a>
      </figcaption>
    </figure>
  </div>
</section>

<section class="section" aria-labelledby="credentials-title">
  <div class="container">
    <div class="cred-why__head">
      <p class="eyebrow">Certified &amp; accredited</p>
      <h2 class="grad-head" id="credentials-title">Credentials you can check</h2>
    </div>
    ${credBadges({ partners: true })}
    <p class="cred-note">Cyber Essentials is a UK government scheme run by the <a href="https://www.ncsc.gov.uk/cyberessentials/overview" rel="noopener">National Cyber Security Centre</a>, delivered by <a href="https://iasme.co.uk/cyber-essentials/" rel="noopener">IASME</a>. You can verify what the certification covers at source.</p>
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
