// Location pages (14, London included). Their own design, shared with no other
// page and built so no two sections on a page use the same component:
//   hero      the area's own photograph, full bleed, with the headline and the
//             callback form over it, and the home page's proof strip across its foot
//   intro     the heading beside the opening copy, then remote and onsite as
//             one wide band of two photo panels
//   notes     "<Area> in particular": a dark box, the points as a numbered
//             list that opens each one beside it (a swipe row on phones)
//   place     the regional copy (or the local-expertise list) beside a photo
//             tagged with the area
//   why       the reasons as icon columns on a tint, no boxes
//   plan      what's included as one plan card: navy side, ticks that draw in
//   ladder    London's response commitments; steps: London's switching guide
//   directory the five services as a list of rows
//   faq, credentials, and a closing callback box with the offices and the
//   nearest other areas.
//
// Every word comes from the area's staging page (_source/wp-pages.json, read
// by location-parse.mjs) or from copy the site already uses elsewhere.
import {
  page, btn, icon, photo, breadcrumbs, callbackForm, credBadges, reviewAvatar, stars, statStrip,
  SITE, SERVICES, LOCATIONS, LOCATION_PLACES, AREA_PHOTO, TESTIMONIALS, PHOTOS,
} from "../lib.mjs";
import { pageByPath, plainText } from "../content.mjs";
import { parseLocation } from "../location-parse.mjs";
import { parseSections } from "../section-parse.mjs";
import { R } from "../sections.mjs";

const pad = (n) => String(n).padStart(2, "0");
const slug = (t) => t.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

// The London page keeps its staging title and service schema.
const META = {
  London: { title: "Expert IT Support London | 5-Star Rated", description: `Managed IT support in London from WhizzIT. Head office on City Road, ${SITE.responseLine.toLowerCase()}, rated ${SITE.google.rating} on Google.` },
};

// An icon for each "why" reason, by what it is about.
const WHY_ICONS = [
  [/engineer|travel|based|local/i, "route"],
  [/tailored/i, "target"],
  [/tools/i, "layers"],
  [/proactive/i, "activity"],
  [/downtime/i, "gauge"],
  [/strategy/i, "compass"],
  [/pricing/i, "fileCheck"],
  [/security/i, "shield"],
  [/plain|english/i, "message"],
  [/scal|grow/i, "trending"],
];
const whyIcon = (title, n) => (WHY_ICONS.find(([re]) => re.test(title)) || [null, ["sparkle", "zap", "star", "award"][n % 4]])[1];

// Distance in km between two [lat, lon] points, for "nearest".
const km = ([a, b], [c, d]) => {
  const r = Math.PI / 180;
  const h = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

// The check mark the plan card draws, as one path so its stroke can animate.
const tick = `<svg class="lx-plan__tick" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7"/></svg>`;

/* ---------- The cover photograph ----------
   The area's photo (AREA_PHOTO) as a full-bleed <picture>; Stevenage, where
   our engineers are based, uses our own photo of the van at Caxton Point. */
function cover(loc) {
  const a = AREA_PHOTO[loc.title];
  if (!a) {
    return { media: photo(PHOTOS.van, { cls: "lx-cover__photo", ratio: "16-9", sizes: "100vw", loading: "eager" }) };
  }
  const set = [640, 1024, 1600, 2400].map((w) => `@/assets/images/photos/area-${a.slug}-${w}.webp ${w}w`).join(", ");
  const media = `<figure class="media lx-cover__photo">
      <img src="@/assets/images/photos/area-${a.slug}-1600.webp" srcset="${set}" sizes="100vw" alt="${a.alt}" width="1600" height="1000" loading="eager" fetchpriority="high" decoding="async" style="object-position:${a.pos}">
    </figure>`;
  return { media };
}

LOCATIONS.forEach((loc, i) => {
  const source = pageByPath(`/${loc.href.replace(/\.html$/, "/")}`);
  if (!source) return;
  const m = parseLocation(source.html);
  // The generic reading of the same page, for the pieces the layout above
  // does not carry: the credentials note, partners, the staging service
  // descriptions, the closing call to action and the area notes.
  const P = parseSections(source.html).sections;
  const stagingCreds = P.find((s) => s.kind === "credentials");
  const stagingPartners = P.find((s) => s.kind === "partners");
  const stagingBand = P.find((s) => s.kind === "ctaBand");
  const stagingServices = P.find((s) => s.kind === "content" && /under one roof|range of|managed it services across|suite of/i.test(s.title) && s.cards.length);
  const areaNotes = P.filter((s) => s.kind === "note" && !/written and maintained|★/i.test(s.text));
  const signOff = P.find((s) => s.kind === "note" && /written and maintained/i.test(s.text));
  const key = slug(loc.title);
  const t = (name) => `loc-${key}-${name}`;
  const place = LOCATION_PLACES[loc.title];
  const nearby = LOCATIONS.filter((l) => l.title !== loc.title)
    .sort((a, b) => km(LOCATION_PLACES[a.title].at, place.at) - km(LOCATION_PLACES[b.title].at, place.at))
    .slice(0, 5);
  const review = TESTIMONIALS[(i + 2) % TESTIMONIALS.length];
  const modes = m.intro?.cards?.length ? m.intro.cards : m.modes?.cards || [];
  const placeBlock = m.region || m.expertise;
  const crumbs = [
    { title: "Home", href: "index.html" },
    { title: "Locations", href: "locations.html" },
    { title: `IT support in ${loc.title}` },
  ];

  const art = cover(loc);
  const hero = `
<section class="hero hero--sky lx-cover" aria-labelledby="page-hero-title">
  ${art.media}
  <div class="container lx-cover__inner">
    ${breadcrumbs(crumbs)}
    <div class="lx-cover__grid">
      <div class="lx-cover__copy">
        <p class="lx-cover__place">${icon("mapPin")}<span>IT support in ${loc.title}</span></p>
        <h1 class="lx-cover__title" id="page-hero-title">${m.title}</h1>
        <p class="lx-cover__lead">${m.lead}</p>
        <a class="lx-cover__call" href="${SITE.phoneHref}" data-track="${t("hero-phone")}">${icon("phone")}<span>Prefer to talk? <strong>${SITE.phone}</strong></span></a>
      </div>
      <div class="lx-cover__form">${callbackForm({ track: t("hero"), id: "hcb" })}</div>
    </div>
    <div class="lx-cover__foot">
      ${statStrip({ compact: true, track: t("hero-strip") })}
    </div>
  </div>
</section>`;

  const intro = m.intro ? `
<section class="section lx-intro" aria-labelledby="${key}-intro-title">
  <div class="container">
    <div class="lx-intro__grid">
      <div class="lx-intro__head">
        <p class="eyebrow">${m.intro.eyebrow}</p>
        <h2 class="grad-head" id="${key}-intro-title">${m.intro.title}</h2>
      </div>
      <div class="lx-intro__copy">
        ${m.intro.text.map((p, n) => n === 0
          ? `<p class="lx-intro__lede">${p}</p>`
          : /\b20\d\d\b/.test(p)
            ? `<div class="lx-intro__more" data-lx-more><p class="lx-intro__note" id="${key}-intro-note">${p}</p><button class="lx-intro__toggle" type="button" aria-expanded="false" aria-controls="${key}-intro-note" hidden>Read more</button></div>`
            : `<p class="lx-intro__text">${p}</p>`).join("")}
      </div>
    </div>
    ${modes.length ? `
    ${!m.intro.cards.length && m.modes ? `<p class="lx-ways__title">${m.modes.title}</p>` : ""}
    <div class="lx-ways">
      ${modes.map((c, n) => `
      <article class="lx-way lx-way--${n === 0 ? "remote" : "onsite"}">
        ${photo(n === 0 ? PHOTOS.headset : AREA_PHOTO[loc.title] ? PHOTOS.van : PHOTOS.network, { cls: "lx-way__photo", ratio: "16-9", sizes: "(min-width: 768px) 50vw, 100vw" })}
        <div class="lx-way__body">
          <span class="lx-way__icon" aria-hidden="true">${icon(n === 0 ? "headset" : "route")}</span>
          <h3>${c.title}</h3>
          <p>${c.text}</p>
        </div>
      </article>`).join("")}
    </div>` : ""}
  </div>
</section>` : "";

  const story = m.story ? `
<section class="section lx-letter" aria-labelledby="${key}-story-title">
  <div class="container lx-letter__grid">
    <div class="lx-letter__head">
      <p class="eyebrow">${m.story.eyebrow}</p>
      <h2 class="grad-head" id="${key}-story-title">${m.story.title}</h2>
    </div>
    <div class="lx-letter__body">
      ${m.story.text.map((p) => `<p>${p}</p>`).join("")}
    </div>
  </div>
</section>` : "";

  const notes = m.detail?.items?.length ? `
<section class="section lx-notes-sec" aria-labelledby="${key}-notes-title">
  <div class="container">
    <div class="lx-notes${/before you commit/i.test(m.detail.eyebrow) ? " lx-notes--checklist" : ""}" data-lx-notes>
      <div class="lx-notes__head">
        <p class="lx-notes__eyebrow">${m.detail.eyebrow}</p>
        <h2 class="lx-notes__title" id="${key}-notes-title">${m.detail.title}</h2>
        ${m.detail.lead ? `<p class="lx-notes__lead">${m.detail.lead}</p>` : ""}
      </div>
      <div class="lx-notes__body">
        <div class="lx-notes__list" role="tablist" aria-orientation="vertical" aria-label="${m.detail.title}">
          <span class="lx-notes__indicator" aria-hidden="true"></span>
          ${m.detail.items.map((it, n) => `<button class="lx-notes__tab" type="button" role="tab" id="${key}-note-tab-${n}" aria-controls="${key}-note-${n}" aria-selected="${n === 0}"${n ? ' tabindex="-1"' : ""}><span class="lx-notes__n">${pad(n + 1)}</span><span>${it.q}</span></button>`).join("")}
        </div>
        <div class="lx-notes__panels">
          ${m.detail.items.map((it, n) => `
          <div class="lx-notes__panel${n === 0 ? " is-active" : ""}" role="tabpanel" id="${key}-note-${n}" aria-labelledby="${key}-note-tab-${n}" tabindex="0">
            <p class="lx-notes__count"><span>${pad(n + 1)}</span> / ${pad(m.detail.items.length)}</p>
            <h3>${it.q}</h3>
            ${it.a}
          </div>`).join("")}
        </div>
      </div>
    </div>
  </div>
</section>` : "";

  const placeSec = placeBlock ? `
<section class="section lx-place" aria-labelledby="${key}-place-title">
  <div class="container lx-place__grid">
    <div class="lx-place__media">
      ${photo(m.region ? PHOTOS.office : PHOTOS.team, { cls: "lx-place__photo", ratio: "4-5", sizes: "(min-width: 1024px) 40vw, 100vw" })}
      <p class="lx-place__tag">${icon("mapPin")}<span>${placeBlock.eyebrow}</span></p>
    </div>
    <div class="lx-place__copy">
      <h2 class="grad-head" id="${key}-place-title">${placeBlock.title}</h2>
      ${placeBlock.text.map((p, n) => `<p class="${n === 0 ? "lx-place__lede" : ""}">${p}</p>`).join("")}
      ${placeBlock.items?.length ? `
      <ul class="lx-place__list" role="list">
        ${placeBlock.items.map((item) => `<li>${icon("checkCircle")}<span>${item}</span></li>`).join("")}
      </ul>` : ""}
    </div>
  </div>
</section>` : "";

  const why = m.why?.cards?.length ? `
<section class="section section--mist lx-why" aria-labelledby="${key}-why-title">
  <div class="container">
    <div class="lx-why__head">
      <div>
        <p class="eyebrow">${m.why.eyebrow}</p>
        <h2 class="grad-head" id="${key}-why-title">${m.why.title}</h2>
      </div>
      ${m.why.lead ? `<p class="lx-why__lead">${m.why.lead}</p>` : ""}
    </div>
    <ul class="lx-why__list lx-why__list--${m.why.cards.length % 3 === 0 ? 3 : 4}" role="list">
      ${m.why.cards.map((c, n) => `
      <li>
        <span class="lx-why__icon" aria-hidden="true">${icon(whyIcon(c.title, n))}</span>
        <h3>${c.title}</h3>
        <p>${c.text}</p>
      </li>`).join("")}
    </ul>
  </div>
</section>` : "";

  const plan = m.included?.items?.length ? `
<section class="section lx-plan-sec" aria-labelledby="${key}-plan-title">
  <div class="container">
    <div class="lx-plan" data-on-view>
      <div class="lx-plan__side">
        <p class="lx-plan__eyebrow">${m.included.eyebrow}</p>
        <h2 class="lx-plan__title" id="${key}-plan-title">${m.included.title}</h2>
        ${m.included.lead ? `<p>${m.included.lead}</p>` : ""}
        <a class="lx-plan__link" href="#talk" data-track="${t("plan-talk")}"><span>Talk to our team</span>${icon("arrow")}</a>
      </div>
      <ul class="lx-plan__items" role="list">
        ${m.included.items.map((item, n) => `<li style="--n:${n}">${tick}<span>${item}</span></li>`).join("")}
      </ul>
    </div>
  </div>
</section>` : "";

  const ladder = m.commitments?.rows?.length ? `
<section class="section lx-ladder" aria-labelledby="${key}-ladder-title">
  <div class="container">
    <div class="lx-why__head lx-ladder__head">
      <div>
        <p class="eyebrow">${m.commitments.eyebrow}</p>
        <h2 class="grad-head" id="${key}-ladder-title">${m.commitments.title}</h2>
      </div>
      ${m.commitments.lead ? `<p class="lx-why__lead">${m.commitments.lead}</p>` : ""}
    </div>
    <table class="lx-ladder__table">
      <caption class="visually-hidden">How WhizzIT responds, by situation</caption>
      <thead><tr><th scope="col">Situation</th><th scope="col">What happens</th><th scope="col">Timescale</th></tr></thead>
      <tbody>
        ${m.commitments.rows.map((r, n) => `<tr style="--n:${n}"><th scope="row"><span class="lx-ladder__n">${pad(n + 1)}</span>${r.situation}</th><td>${r.what}</td><td><span class="lx-ladder__when">${icon("clock")}${r.when}</span></td></tr>`).join("")}
      </tbody>
    </table>
  </div>
</section>` : "";

  const steps = m.switching?.items?.length ? `
<section class="section section--mist lx-steps" aria-labelledby="${key}-steps-title">
  <div class="container">
    <div class="lx-steps__head">
      <p class="eyebrow">${m.switching.eyebrow}</p>
      <h2 class="grad-head" id="${key}-steps-title">${m.switching.title}</h2>
      ${m.switching.text.map((p) => `<p>${p}</p>`).join("")}
    </div>
    <ol class="lx-steps__list" role="list">
      ${m.switching.items.map((s, n) => `
      <li>
        <span class="lx-steps__n" aria-hidden="true">${n + 1}</span>
        <h3>${s.q}</h3>
        ${s.a}
      </li>`).join("")}
    </ol>
  </div>
</section>` : "";

  const directory = `
<section class="section lx-dir" aria-labelledby="${key}-dir-title">
  <div class="container lx-dir__grid">
    <div class="lx-dir__head">
      <p class="eyebrow">${m.services?.eyebrow || "What we do"}</p>
      <h2 class="grad-head" id="${key}-dir-title">${m.services?.title || "Everything IT, under one roof"}</h2>
      ${m.services?.lead ? `<p>${m.services.lead}</p>` : ""}
      ${btn("All IT services", "it-services.html", { variant: "secondary", arrow: false, track: t("all-services") })}
    </div>
    <ul class="lx-dir__list" role="list">
      ${(stagingServices ? stagingServices.cards : SERVICES.map((s) => ({ title: s.title, html: s.short }))).map((c) => {
        const s = SERVICES.find((x) => x.title.toLowerCase() === c.title.toLowerCase());
        const href = c.link?.href || (s ? `@/${s.href}` : "@/contact.html");
        return `
      <li>
        <a class="lx-dir__row tone-${s?.tone || "projects"}" href="${href}" data-track="${t(s?.key || "packages")}">
          <span class="lx-dir__icon" aria-hidden="true">${icon(s?.icon || "fileCheck")}</span>
          <span class="lx-dir__name">${c.title}</span>
          <span class="lx-dir__text">${c.html.replace(/<\/?p>/g, " ").trim()}</span>
          <span class="lx-dir__go" aria-hidden="true">${icon("arrow")}</span>
        </a>
      </li>`;
      }).join("")}
    </ul>
  </div>
</section>`;

  const credentials = `
<section class="section section--tight cred-why lx-creds" aria-labelledby="${key}-cred-title">
  <div class="container">
    <div class="cred-why__head">
      <p class="eyebrow">${m.credentials?.eyebrow || "Certified & accredited"}</p>
      <h2 class="grad-head" id="${key}-cred-title">${m.credentials?.title || "Credentials you can check"}</h2>
    </div>
    ${credBadges()}
    ${stagingCreds?.note ? `<p class="cred-note">${stagingCreds.note}</p>` : ""}
  </div>
</section>
${stagingPartners ? R.partners(stagingPartners, `${key}-partners-title`, { slug: key }) : ""}`;

  const faq = m.faq?.items?.length ? `
<section class="section lx-faq" id="faq" aria-labelledby="${key}-faq-title">
  <div class="container lx-faq__grid">
    <div class="lx-faq__head">
      <p class="eyebrow">${m.faq.eyebrow || "Good to know"}</p>
      <h2 class="grad-head" id="${key}-faq-title">${m.faq.title}</h2>
      <p>Not covered here? Ask us directly — ${SITE.responseLine.toLowerCase()}.</p>
      <a class="lx-faq__call" href="${SITE.phoneHref}" data-track="${t("faq-phone")}">${icon("phone")}<span>${SITE.phone}</span></a>
    </div>
    <div class="lx-faq__list">
      ${m.faq.items.map((f) => `
      <details class="lx-faq__item">
        <summary><span>${f.q}</span><span class="lx-faq__icon" aria-hidden="true"></span></summary>
        <div class="lx-faq__a">${f.a}</div>
      </details>`).join("")}
    </div>
  </div>
</section>` : "";

  const talk = `
<section class="section lx-talk" id="talk" aria-labelledby="${key}-talk-title">
  <div class="container">
    <div class="lx-talk__box">
      <div class="lx-talk__intro">
        <h2 class="lx-talk__title" id="${key}-talk-title">${stagingBand?.title || `Need IT support in ${loc.title}?`}</h2>
        <p>${stagingBand?.text || `Call us and you'll speak to an engineer, not a queue. ${SITE.responseLine}.`}</p>
        <a class="lx-talk__phone" href="${SITE.phoneHref}" data-track="${t("talk-phone")}">${icon("phone")}<span>${SITE.phone}</span></a>
      </div>
      <div class="lx-talk__form">
        ${callbackForm({ track: t("talk"), captchaTheme: "light" })}
      </div>
      <figure class="lx-talk__quote">
        <span class="lx-talk__stars">${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}</span>
        <blockquote><p>${review.quote}</p></blockquote>
        <figcaption>
          ${reviewAvatar(review, { badge: true })}
          <span><strong>${review.name}</strong>${review.role}</span>
        </figcaption>
      </figure>
    </div>
    <div class="lx-talk__foot">
      <ul class="lx-talk__offices" role="list">
        ${SITE.offices.map((o) => `
        <li>
          <span class="lx-talk__pin" aria-hidden="true">${icon("mapPin")}</span>
          <span><strong>${o.name}</strong> · ${o.label}<br>${o.address}</span>
          <a href="${o.maps}" rel="noopener">Get directions${icon("arrow")}</a>
        </li>`).join("")}
      </ul>
      <nav class="lx-talk__near" aria-labelledby="${key}-near-title">
        <p class="lx-talk__near-title" id="${key}-near-title">Other areas we cover</p>
        <ul role="list">
          ${nearby.map((l) => `<li><a href="@/${l.href}">${l.title}</a></li>`).join("")}
          <li><a class="lx-talk__all" href="@/locations.html">All locations${icon("arrow")}</a></li>
        </ul>
        ${areaNotes.map((n) => `<p class="lx-talk__area-note">${n.text}</p>`).join("")}
      </nav>
    </div>
    ${signOff ? `<p class="sv-family__note">${signOff.text}</p>` : ""}
  </div>
</section>`;

  // Phones and tablets: the bottom action bar the industry pages use
  // (app.js initSectorPage), shown once the hero has scrolled away.
  const dock = `
<div class="sx-dock" data-sx-dock aria-hidden="true">
  <a class="btn btn--primary sx-dock__main" href="#talk" tabindex="-1" data-track="${t("dock-callback")}"><span>Request a callback</span></a>
  <a class="sx-dock__call" href="${SITE.phoneHref}" tabindex="-1" aria-label="Call ${SITE.phone}" data-track="${t("dock-phone")}">${icon("phone")}</a>
</div>`;

  const main = [hero, intro, story, why, notes, placeSec, plan, ladder, steps, directory, credentials, faq, talk, dock].join("\n");

  const schema = [{
    "@context": "https://schema.org",
    "@type": "Service",
    name: m.title,
    serviceType: "Managed IT support",
    description: m.lead,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: { "@type": place.region ? "AdministrativeArea" : "City", name: loc.title },
  }];
  if (m.faq?.items?.length) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: m.faq.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
      })),
    });
  }

  page({
    file: loc.href,
    title: META[loc.title]?.title || m.title,
    description: META[loc.title]?.description || (m.lead.length > 40 ? m.lead : `Managed IT support in ${loc.title} from WhizzIT. Remote-first support, on-site when it needs hands, rated ${SITE.google.rating} on Google.`),
    bodyClass: `page--location page--place page--sky place--${key}`,
    crumbs,
    main,
    schema,
  });
});
