// Industry pages (8), at /industries/<slug>/. Their own design, shared with no
// other page and built without boxes: content sits on the page, divided by
// hairlines, photographs and type.
//   hero        dark, the sector's photograph on the right running off the
//               edge, the callback form over its foot, the proof strip below
//   switcher    the eight sectors as one row of links, this one marked
//   intro       a large statement beside "what you get", a numbered list
//   issues      a dark band: the sector's particular demands in columns, each
//               under a large outlined numeral, then the related-sector note
//   proof       the sector's client story and review over its photograph
//   services    "Everything IT, under one roof": icons in the service tones
//   ask         the mid-page prompt as one line of large type and two actions
//   then the credentials, the FAQ, partners, and the other sectors as a strip
//   of photographs.
// Every word comes from the sector's staging page (section-parse.mjs) or copy
// the site already uses (the sector notes on /industries/).
import {
  page, btn, icon, stockPhoto, casePhoto, breadcrumbs, callbackForm, reviewAvatar, stars, statStrip,
  SITE, SERVICES, INDUSTRIES, CASE_STUDIES, TESTIMONIALS, STOCK, SECTOR_PHOTO, SECTOR_NOTE,
} from "../lib.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { WP_EXPORT } from "../lib.mjs";
import { pageByPath, plainText } from "../content.mjs";
import { parseSections } from "../section-parse.mjs";
import { R, kindOf } from "../sections.mjs";

const pad = (n) => String(n).padStart(2, "0");
const sectorPhoto = (s, o) => stockPhoto(STOCK[SECTOR_PHOTO[s.key]] || STOCK.meeting, o);
const stagingPath = (href) => `/${href.replace(/^industries\//, "").replace(/\.html$/, "/")}`;

// Case studies are filed by sector name; three sectors have one.
const STUDY_SECTOR = { Healthcare: "healthcare", Construction: "construction", Education: "education" };
// "Everything IT, under one roof" cards are the five services, by title.
const serviceFor = (title) => SERVICES.find((s) => s.title.toLowerCase() === title.toLowerCase());

INDUSTRIES.forEach((sector, i) => {
  const source = pageByPath(stagingPath(sector.href));
  if (!source) return;
  const { hero, sections } = parseSections(source.html);
  const key = sector.key;
  const t = (n) => `sector-${key}-${n}`;
  const ctx = { slug: `sector-${key}`, tone: "support", n: 0, storyCount: 0 };

  const used = new Set();
  const take = (pred) => {
    const s = sections.find((x, n) => !used.has(n) && pred(x));
    if (s) used.add(sections.indexOf(s));
    return s;
  };
  const intro = take((s) => s.kind === "content" && s.lists.length && s.flow.length);
  const issues = take((s) => s.kind === "content" && s.steps.length);
  const services = take((s) => s.kind === "content" && /under one roof/i.test(s.title) && s.cards.length);
  const quote = take((s) => s.kind === "content" && s.quotes.length && !s.title);
  const story = take((s) => s.kind === "content" && /client story/i.test(s.eyebrow));
  const ask = take((s) => s.kind === "ctaMid");
  const credentials = take((s) => s.kind === "credentials");
  const faq = take((s) => s.kind === "faq");
  const partners = take((s) => s.kind === "partners");
  const band = take((s) => s.kind === "ctaBand");
  const notes = sections.filter((s, n) => !used.has(n) && s.kind === "note");
  notes.forEach((s) => used.add(sections.indexOf(s)));
  const relatedNote = notes.find((s) => !/written and maintained/i.test(s.text));
  const signOff = notes.find((s) => /written and maintained/i.test(s.text));
  // Anything this layout has no place for is still drawn, never dropped.
  const extra = sections.filter((s, n) => !used.has(n) && s.kind === "content");

  const study = CASE_STUDIES.find((c) => STUDY_SECTOR[c.sector] === key);
  const storyLink = story?.cards[0]?.html.match(/href="([^"]+)"[^>]*>([^<]+)</);
  const review = quote?.quotes[0];
  const reviewer = review && (TESTIMONIALS.find((x) => x.name === review.by) || { name: review.by, role: review.role });
  const others = INDUSTRIES.filter((s) => s.key !== key);

  const crumbs = [
    { title: "Home", href: "index.html" },
    { title: "Industries", href: "industries.html" },
    { title: sector.title },
  ];

  // The related-sector note links the sectors it names.
  const linkSectors = (text) => INDUSTRIES.reduce((out, s) => out.replace(new RegExp(`\\b(${s.title.replace(/s$/, "")}s?)\\b`, "i"), (m) => `<a href="@/${s.href}">${m}</a>`), text);

  const main = `
<section class="hero hero--sky ix-hero" aria-labelledby="page-hero-title">
  <div class="ix-hero__media">
    ${sectorPhoto(sector, { cls: "ix-hero__photo", ratio: "4-5", sizes: "(min-width: 1024px) 48vw, 100vw", loading: "eager" })}
  </div>
  <div class="container ix-hero__inner">
    ${breadcrumbs(crumbs)}
    <div class="ix-hero__grid">
      <div class="ix-hero__copy">
        <p class="ix-hero__kicker"><span class="ix-hero__icon" aria-hidden="true">${icon(sector.icon)}</span><span>${hero.eyebrow || sector.title}</span><span class="ix-hero__count">${pad(i + 1)} / ${pad(INDUSTRIES.length)}</span></p>
        <h1 class="ix-hero__title" id="page-hero-title">${hero.title}</h1>
        <p class="ix-hero__lead">${hero.lead}</p>
        <p class="ix-hero__note">${SECTOR_NOTE[key] || sector.desc}</p>
        <a class="ix-hero__call" href="${SITE.phoneHref}" data-track="${t("hero-phone")}">${icon("phone")}<span>Prefer to talk? <strong>${SITE.phone}</strong></span></a>
      </div>
      <div class="ix-hero__form">${callbackForm({ track: t("hero"), id: "hcb" })}</div>
    </div>
    <div class="ix-hero__foot">${statStrip({ compact: true, track: t("hero-strip") })}</div>
  </div>
</section>

<nav class="ix-switch" aria-label="Industries we support">
  <div class="container">
    <ul class="ix-switch__list" role="list">
      ${INDUSTRIES.map((s) => `<li><a href="@/${s.href}"${s.key === key ? ' aria-current="page"' : ""}>${icon(s.icon)}<span>${s.title}</span></a></li>`).join("")}
    </ul>
  </div>
</nav>

${intro ? `
<section class="section ix-intro" aria-labelledby="${key}-intro-title">
  <div class="container ix-intro__grid">
    <div class="ix-intro__copy">
      <p class="eyebrow">${intro.eyebrow}</p>
      <h2 class="ix-intro__title" id="${key}-intro-title">${intro.title}</h2>
      <div class="ix-intro__text">${intro.flow.join("")}</div>
    </div>
    <div class="ix-gets">
      <p class="ix-gets__label">${intro.lists[0].label || "What you get with WhizzIT"}</p>
      <ol class="ix-gets__list" role="list">
        ${intro.lists[0].items.map((item, n) => `<li><span class="ix-gets__n" aria-hidden="true">${pad(n + 1)}</span><span>${item}</span></li>`).join("")}
      </ol>
    </div>
  </div>
</section>` : ""}

${issues ? `
<section class="section ix-issues" aria-labelledby="${key}-issues-title">
  <div class="container">
    <div class="ix-issues__head">
      <p class="ix-issues__eyebrow">${issues.eyebrow}</p>
      <h2 class="ix-issues__title" id="${key}-issues-title">${issues.title}</h2>
      ${issues.lead ? `<p class="ix-issues__lead">${issues.lead}</p>` : ""}
    </div>
    <ol class="ix-issues__list ix-issues__list--${issues.steps.length}" role="list">
      ${issues.steps.map((st, n) => `
      <li>
        <span class="ix-issues__n" aria-hidden="true">${st.no || pad(n + 1)}</span>
        <h3>${st.q}</h3>
        <div class="ix-issues__a">${st.a}</div>
      </li>`).join("")}
    </ol>
    ${relatedNote ? `<p class="ix-issues__note">${icon("route")}<span>${linkSectors(relatedNote.text)}</span></p>` : ""}
  </div>
</section>` : ""}

${review || story ? `
<section class="ix-proof" aria-label="${sector.title} client story">
  <div class="ix-proof__media">
    ${study ? casePhoto(study, { cls: "ix-proof__photo", ratio: "16-9", sizes: "100vw" }) : sectorPhoto(sector, { cls: "ix-proof__photo", ratio: "16-9", sizes: "100vw" })}
  </div>
  <div class="container ix-proof__inner">
    ${review ? `
    <figure class="ix-proof__quote">
      ${stars(`Rated ${SITE.google.rating} out of 5 on Google`)}
      <blockquote><p>${review.text.replace(/^[“"]|[”"]$/g, "")}</p></blockquote>
      <figcaption>${reviewAvatar(reviewer, { badge: true })}<span><strong>${review.by}</strong>${review.role || reviewer.role || ""}</span></figcaption>
    </figure>` : ""}
    ${story ? `
    <div class="ix-proof__story">
      <p class="ix-proof__eyebrow">${story.eyebrow}</p>
      <p class="ix-proof__title">${story.cards[0].title}</p>
      ${(story.cards[0].html.match(/<p>[\s\S]*?<\/p>/) || [""])[0]}
      ${storyLink ? `<a class="ix-proof__link" href="${storyLink[1]}">${storyLink[2].trim()}${icon("arrow")}</a>` : ""}
    </div>` : ""}
  </div>
</section>` : ""}

${services ? `
<section class="section ix-services" aria-labelledby="${key}-services-title">
  <div class="container">
    <div class="ix-services__head">
      <div>
        <p class="eyebrow">${services.eyebrow}</p>
        <h2 class="grad-head" id="${key}-services-title">${services.title}</h2>
      </div>
      ${services.lead ? `<p>${services.lead}</p>` : ""}
    </div>
    <ul class="ix-services__list" role="list">
      ${services.cards.map((c) => {
        const svc = serviceFor(c.title);
        const inner = `<span class="ix-services__icon" aria-hidden="true">${icon(svc?.icon || "sparkle")}</span><strong>${c.title}</strong><span class="ix-services__text">${c.html.replace(/<\/?p>/g, " ").trim()}</span>`;
        return `<li class="tone-${svc?.tone || "support"}">${svc ? `<a href="@/${svc.href}" data-track="${t(svc.key)}">${inner}<span class="ix-services__go" aria-hidden="true">${icon("arrow")}</span></a>` : `<div>${inner}</div>`}</li>`;
      }).join("")}
    </ul>
  </div>
</section>` : ""}

${extra.map((s) => R[kindOf(s, 1)](s, `${key}-extra-${sections.indexOf(s)}`, ctx)).join("\n")}

${ask ? `
<section class="section ix-ask" aria-labelledby="${key}-ask-title">
  <div class="container ix-ask__inner">
    <p class="ix-ask__eyebrow">${ask.eyebrow}</p>
    <h2 class="ix-ask__title" id="${key}-ask-title">${ask.title}</h2>
    ${ask.text ? `<p class="ix-ask__text">${ask.text}</p>` : ""}
    <div class="ix-ask__act">
      ${btn("Request a callback", "#page-hero-title", { size: "lg", track: t("ask-callback") })}
      <a class="ix-ask__call" href="${SITE.phoneHref}" data-track="${t("ask-phone")}">${icon("phone")}<span>${SITE.phone}</span></a>
    </div>
    ${ask.quote?.text ? `<p class="ix-ask__quote">“${ask.quote.text.replace(/^[“"]|[”"]$/g, "")}” <span>${ask.quote.by}${ask.quote.role ? `, ${ask.quote.role}` : ""}</span></p>` : ""}
  </div>
</section>` : ""}

${credentials ? R.credentials(credentials, `${key}-cred-title`, ctx) : ""}
${faq ? R.faq(faq, `${key}-faq-title`, ctx) : ""}
${partners ? R.partners(partners, `${key}-partners-title`, ctx) : ""}

<nav class="section ix-more" aria-labelledby="${key}-more-title">
  <div class="container">
    <div class="ix-more__head">
      <h2 class="grad-head" id="${key}-more-title">Other industries we support</h2>
      ${btn("All industries", "industries.html", { variant: "secondary", arrow: false, track: t("all") })}
    </div>
  </div>
  <ul class="ix-more__strip" role="list">
    ${others.map((s) => `
    <li>
      <a href="@/${s.href}" data-track="${t(`more-${s.key}`)}">
        ${sectorPhoto(s, { cls: "ix-more__photo", ratio: "4-5", sizes: "(min-width: 1024px) 22vw, 70vw" })}
        <span class="ix-more__name">${icon(s.icon)}<strong>${s.title}</strong></span>
      </a>
    </li>`).join("")}
  </ul>
  ${signOff ? `<div class="container"><p class="ix-more__note">${signOff.text}</p></div>` : ""}
</nav>

<div class="sx-dock" data-sx-dock aria-hidden="true">
  <a class="btn btn--primary sx-dock__main" href="#page-hero-title" tabindex="-1" data-track="${t("dock-callback")}"><span>Request a callback</span></a>
  <a class="sx-dock__call" href="${SITE.phoneHref}" tabindex="-1" aria-label="Call ${SITE.phone}" data-track="${t("dock-phone")}">${icon("phone")}</a>
</div>
`;

  const schema = [];
  if (faq?.items?.length) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plainText(f.a) } })),
    });
  }

  page({
    footerCta: {
      title: band?.title || `IT that fits how ${sector.title} works`,
      text: band?.text || "Book a no-obligation conversation and we'll tell you what we would change first.",
      track: t("cta"),
    },
    file: sector.href,
    title: hero.title,
    description: hero.lead && hero.lead.length > 40 ? hero.lead : sector.desc,
    bodyClass: `page--industry page--sector page--sky sector--${key}`,
    crumbs,
    main,
    schema,
  });
});

// The static preview: the old root-level industry URLs point at their new home
// (WordPress answers them with a permanent redirect, inc/sectors.php).
if (!WP_EXPORT) {
  const ROOT = join(import.meta.dirname, "..", "..");
  INDUSTRIES.forEach((s) => {
    const old = s.href.replace(/^industries\//, "");
    writeFileSync(join(ROOT, old), `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}/${s.href.replace(/\.html$/, "/")}"><meta http-equiv="refresh" content="0; url=industries/${old}"></head><body><p>This page has moved to <a href="industries/${old}">industries/${old}</a>.</p></body></html>
`);
  });
}
