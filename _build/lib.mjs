// Shared layout + component helpers. Pages call these to produce static HTML.
// Internal links are written as "@/path.html" and resolved per page depth.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { icon, logo, logoMark } from "./icons.mjs";
import { SITE, SERVICES, SPECIALIST, INDUSTRIES, LOCATIONS, NAV, PHOTOS, CREDENTIALS, PARTNERS, CASE_PHOTO, STATS, statValue, G_RATING, G_COUNT } from "./site.mjs";

export { icon, logo, logoMark, SITE, SERVICES, SPECIALIST, INDUSTRIES, LOCATIONS };
export { CLIENTS, PARTNERS, TESTIMONIALS, CASE_STUDIES, STATS, statValue, PHOTOS, BLOG, BLOG_LISTING, LISTING_CATEGORIES, TEAM, CREDENTIALS, STOCK, SECTOR_PHOTO, SECTOR_NOTE, CATEGORY_PHOTO, CASE_PHOTO, LOCATION_PLACES, AREA_PHOTO, SVC_PHOTO, G_RATING, G_COUNT } from "./site.mjs";

const OUT = join(import.meta.dirname, "..");
// Official WhizzIT artwork pulled from staging: dark wordmark on light surfaces,
// white wordmark on the dark footer.
const brandLogo = (variant = "dark") =>
  variant === "light"
    ? `<img src="@/assets/images/brand/whizzit-logo.svg" alt="WhizzIT" width="150" height="36" decoding="async">`
    // Both wordmarks ship; CSS shows the one the active theme needs, so the logo
    // never sits dark-on-dark when the theme is switched.
    : `<span class="brand__logo">
      <img class="brand__logo--light" src="@/assets/images/brand/whizzit-logo-black.svg" alt="WhizzIT" width="150" height="36" decoding="async">
      <img class="brand__logo--dark" src="@/assets/images/brand/whizzit-logo.svg" alt="" aria-hidden="true" width="150" height="36" decoding="async">
    </span>`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Remote-support and booking links: set in WordPress (Settings → WhizzIT), so the
// export leaves a placeholder the theme fills in.
const LINK = process.env.WHIZZIT_EXPORT === "wp" ? { remote: "#remote-support", booking: "#booking" } : { remote: SITE.remoteSupport, booking: "contact.html" };
const at = (href) => (/^(https?:|mailto:|tel:|#)/.test(href) ? href : `@/${href}`);
export const ph = (text) => `<span class="ph">[${text}]</span>`;
export const phTag = (text = "Placeholder") => `<span class="placeholder-tag">${text}</span>`;
export const service = (key) => SERVICES.find((s) => s.key === key);

/* ---------- Clean URL mapping (for canonicals and schema) ---------- */
export function cleanUrl(file) {
  const path = file.replace(/index\.html$/, "").replace(/\.html$/, "/");
  return `${SITE.url}/${path}`;
}

/* ---------- Primitives ---------- */
export function btn(label, href, { variant = "primary", size = "", track = "", arrow = true, iconName = "", cls = "" } = {}) {
  const classes = ["btn", `btn--${variant}`, size && `btn--${size}`, cls].filter(Boolean).join(" ");
  const lead = iconName ? icon(iconName) : "";
  const trail = arrow ? icon("arrow", "btn__arrow") : "";
  const t = track ? ` data-track="${track}"` : "";
  return `<a class="${classes}" href="${at(href)}"${t}>${lead}<span>${label}</span>${trail}</a>`;
}

// Form field: visible label, the hooks app.js validates against (form[data-validate])
// and an error slot. Shared by the contact form and the callback form.
export const field = ({ id, label, type = "text", autocomplete = "", required = true, name = id, hint = "", msg = "", attrs = "", dataName = "", placeholder = "" }) => `
  <div class="field">
    <label class="field__label" for="${id}"${dataName ? ` data-name="${dataName}"` : ""}>${label}${required ? "" : ' <span class="field__optional">(optional)</span>'}</label>
    ${hint ? `<p class="field__hint" id="${id}-hint">${hint}</p>` : ""}
    <input class="field__input" id="${id}" name="${name}" type="${type}"${autocomplete ? ` autocomplete="${autocomplete}"` : ""}${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}${required ? " required" : ""}${msg ? ` data-msg-required="${msg}"` : ""} aria-describedby="${hint ? `${id}-hint ` : ""}${id}-error"${attrs}>
    <p class="field__error" id="${id}-error"></p>
  </div>`;

// Live forms (the WordPress export) post to SITE.formAction, the handler in
// whizzit-core (inc/forms.php): FormData, reCAPTCHA v2 revealed on the first
// press of submit, JSON reply. The static preview keeps data-demo, which shows the success state
// without sending anything.
export const formMode = () => (WP_EXPORT ? "" : " data-demo");

export const captchaRow = (theme = "dark") => (WP_EXPORT
  ? `<div class="captcha-row"><div class="g-recaptcha" data-sitekey="${SITE.recaptchaSiteKey}" data-theme="${theme}"></div><p class="field__error">Please complete the reCAPTCHA to continue.</p></div>
    <p class="form-error" role="alert" hidden>Sorry, something went wrong. Please call ${SITE.phone} or email ${SITE.email}.</p>`
  : "");

// "Request a callback": the form WhizzIT's live site carries at the top of every
// page, with the same fields, copy and endpoint contract (POST SITE.formAction,
// form_name=callback, the botcheck honeypot).
// `phone` adds a required phone field (the home page asks for one).
// `id` prefixes the field ids, for a page that carries two callback forms.
export function callbackForm({ track = "callback", phone = false, captchaTheme = "dark", id = "cb" } = {}) {
  const box = id === "cb" ? "callback" : `${id}-callback`;
  return `
<div class="callback${phone ? " callback--phone" : ""}">
  <form class="callback__form" action="${SITE.formAction}" method="post" data-validate${formMode()} data-success="${box}-success" aria-labelledby="${box}-title">
    <input type="hidden" name="form_name" value="callback">
    <input class="visually-hidden" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="callback__head"><strong id="${box}-title">Request a callback</strong><span>We respond the same working day.</span></p>
    <div class="callback__row">
      ${field({ id: `${id}-name`, name: "name", label: "Name", autocomplete: "name", placeholder: "Jane Smith" })}
      ${field({ id: `${id}-email`, name: "email", label: "Email", type: "email", autocomplete: "email", placeholder: "jane@company.co.uk" })}
      ${phone ? field({ id: `${id}-phone`, name: "phone", label: "Phone", type: "tel", autocomplete: "tel", placeholder: "07700 900123", msg: "Enter your phone number", attrs: ' pattern="[0-9 +\\(\\)\\-]{7,20}"' }) : ""}
      <div class="field callback__message">
        <label class="field__label" for="${id}-message">How can we help? <span class="field__optional">(optional)</span></label>
        <textarea class="field__input" id="${id}-message" name="message" rows="1" placeholder="A quick note about your IT…" aria-describedby="${id}-message-error"></textarea>
        <p class="field__error" id="${id}-message-error"></p>
      </div>
      <button class="btn btn--primary callback__submit" type="submit" data-track="${track}-submit"><span>Request a callback</span></button>
    </div>
    ${captchaRow(captchaTheme)}
  </form>
  <div class="callback__success" id="${box}-success" tabindex="-1" hidden>
    ${icon("checkCircle")}
    <p><strong>Got it, thank you.</strong> Your callback request is with the team. We’ll respond the same working day. Need it sorted sooner? <a href="${SITE.phoneHref}" data-track="${track}-success-phone">Call ${SITE.phone}</a></p>
  </div>
</div>`;
}

/* ---------- The proof strip ----------
   The home page's four figures (STATS): satisfaction, experience, response time
   and the Google rating, which links to the Google Business Profile. The same
   strip is used wherever the site shows proof figures. `compact` is the
   slimmer version that sits across the foot of a page hero; it keeps the
   home page's light card even inside a dark hero. */
const STAT_LOOK = [["handHeart", "cyber"], ["award", "support"], ["clock", "cloud"], ["star", "projects"]];

export function statStrip({ compact = false, track = "strip" } = {}) {
  const item = (s, i) => `
      <div class="stat-strip__item${s.href ? " stat-strip__item--link" : ""} tone-${STAT_LOOK[i][1]}">
        <dt><span class="stat-strip__icon">${icon(STAT_LOOK[i][0])}</span><span>${s.label}</span></dt>
        <dd class="stat-strip__value">${statValue(s)}</dd>
        ${s.href ? `<dd class="stat-strip__more"><a class="card-link" href="${s.href}" target="_blank" rel="noopener" data-track="${track}-google">${s.note}${icon("arrow")}</a></dd>` : ""}
      </div>`;
  return `<dl class="stat-strip${compact ? " stat-strip--compact" : ""}">${STATS.map(item).join("")}
    </dl>`;
}

// The enquiry box staging carries in the middle of four articles: a phone line,
// a Google review and a short message form that posts as form_name=inline, as
// staging's does. Articles hold it as [whizzit_enquiry …] (see content.mjs);
// whizzit-core renders this same markup from data/enquiry.html.
export function enquiryBox({ eyebrow = "", title = "", text = "", quote = "", by = "", role = "" }, id = "eq") {
  return `<aside class="cta-mid enquiry" aria-labelledby="${id}-title">
  <div class="enquiry__intro">
    <p class="eyebrow">${eyebrow}</p>
    <p class="cta-mid__title" id="${id}-title">${title}</p>
    <p>${text}</p>
    <div class="cta-mid__btns"><a class="btn btn--ghost" href="${SITE.phoneHref}" data-track="article-enquiry-phone">${icon("phone")}<span>${SITE.phone}</span></a></div>
    <figure class="enquiry__proof">
      <p class="enquiry__stars" role="img" aria-label="Rated 5 out of 5">★★★★★</p>
      <blockquote><p>${quote}</p></blockquote>
      <figcaption><strong>${by}</strong>, ${role} · <a href="${SITE.google.reviewsUrl}" target="_blank" rel="noopener">see all ${G_COUNT} reviews</a></figcaption>
    </figure>
  </div>
  <div class="enquiry__form">
    <form action="${SITE.formAction}" method="post" data-validate${formMode()} data-success="${id}-success" aria-labelledby="${id}-form-title">
      <input type="hidden" name="form_name" value="inline">
      <input class="visually-hidden" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="enquiry__head"><strong id="${id}-form-title">Send us a message</strong><span>We respond the same working day.</span></p>
      ${field({ id: `${id}-name`, name: "name", label: "Name", autocomplete: "name", placeholder: "Jane Smith", msg: "Please enter your name." })}
      ${field({ id: `${id}-email`, name: "email", label: "Work email", type: "email", autocomplete: "email", placeholder: "jane@company.co.uk", msg: "Please enter a valid email." })}
      <div class="field">
        <label class="field__label" for="${id}-message">How can we help?</label>
        <textarea class="field__input" id="${id}-message" name="message" rows="3" placeholder="A few details about your IT needs…" required data-msg-required="Please let us know how we can help." aria-describedby="${id}-message-error"></textarea>
        <p class="field__error" id="${id}-message-error"></p>
      </div>
      ${captchaRow("light")}
      <button class="btn btn--primary btn--block" type="submit" data-track="article-enquiry-submit"><span>Send message</span></button>
    </form>
    <div class="callback__success" id="${id}-success" tabindex="-1" hidden>
      ${icon("checkCircle")}
      <p><strong>Got it, thank you.</strong> Your message is with the team. We’ll respond the same working day. Need it sorted sooner? <a href="${SITE.phoneHref}" data-track="article-enquiry-success-phone">Call ${SITE.phone}</a></p>
    </div>
  </div>
</aside>`;
}

// Draws each [whizzit_enquiry …] in an article body (the static build; WordPress
// runs the shortcode itself).
export const renderEnquiries = (html) => {
  let n = 0;
  return html.replace(/\[whizzit_enquiry ([^\]]*)\]/g, (_, atts) => enquiryBox(Object.fromEntries([...atts.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]])), `eq${n++}`));
};

// The line under a hero's callback form: the phone for anyone who would rather
// talk, then proof, which links to the Google reviews.
// `google: false` when the hero carries the proof cluster, which links there.
export const heroNote = (tail = "UK-wide coverage", track = "hero", { google = true } = {}) =>
  `<p class="hero-sky__note">${icon("phone")}<span>Prefer to talk? <a href="${SITE.phoneHref}" data-track="${track}-phone">Call ${SITE.phone}</a>${google ? ` · <a href="${SITE.google.reviewsUrl}" target="_blank" rel="noopener" data-track="${track}-google">Rated ${G_RATING} on Google</a>` : ""} · ${tail}</span></p>`;

export function textLink(label, href, track = "") {
  const t = track ? ` data-track="${track}"` : "";
  return `<a class="text-link" href="${at(href)}"${t}><span>${label}</span>${icon("arrow")}</a>`;
}

export const eyebrow = (text) => `<p class="eyebrow">${text}</p>`;

export function sectionHead({ eyebrow: eb, title, lead, align = "", id = "", level = 2 }) {
  const cls = ["section-head", align && `section-head--${align}`].filter(Boolean).join(" ");
  const idAttr = id ? ` id="${id}"` : "";
  const heading = `<h${level}${idAttr}>${title}</h${level}>`;
  if (align === "split") {
    return `<div class="${cls}"><div>${eb ? eyebrow(eb) : ""}${heading}</div>${lead ? `<p class="lead">${lead}</p>` : ""}</div>`;
  }
  return `<div class="${cls}">${eb ? eyebrow(eb) : ""}${heading}${lead ? `<p class="lead">${lead}</p>` : ""}</div>`;
}

export const checkList = (items, cls = "") =>
  `<ul class="check-list ${cls}" role="list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

// Responsive photo from /assets/images/photos (AVIF + WebP at 480/768/1024/1280).
export function photo(p, { cls = "", sizes = "(min-width: 1024px) 50vw, 100vw", loading = "lazy", ratio = "4-3" } = {}) {
  const set = (ext) => p.widths.map((w) => `@/assets/images/photos/${p.name}-${w}.${ext} ${w}w`).join(", ");
  const largest = p.widths[p.widths.length - 1];
  return `<figure class="media ratio-${ratio} ${cls}">
    <picture>
      <source type="image/avif" srcset="${set("avif")}" sizes="${sizes}">
      <source type="image/webp" srcset="${set("webp")}" sizes="${sizes}">
      <img src="@/assets/images/photos/${p.name}-${largest}.webp" alt="${esc(p.alt)}" width="${largest}" height="${Math.round(largest * 0.5625)}" loading="${loading}" decoding="async">
    </picture>
  </figure>`;
}

// An office on its own Google map (Contact, Locations). Google's keyless embed
// pins the address (q) and centres the view on ll, so moving ll north drops the
// pin within the frame (5.13e-5 degrees of latitude per pixel at z=15, measured
// from the embed itself). The frame is 130px taller than the band that shows,
// because the crop hides Google's place card, so the pin drops 65px to reach the
// band's middle, and 15px more so the marker's head, not its tip, sits there.
// The map is scenery: the address is in the card, "Get directions" opens Google
// Maps, and the frame takes no focus or pointer so it never traps a scroll.
const LAT_PER_PX = 5.13e-5;
const PIN_DROP_PX = 80;
const mapSrc = (o) => {
  const [lat, lng] = o.coords;
  const ll = `${(lat + PIN_DROP_PX * LAT_PER_PX).toFixed(6)},${lng}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(o.address).replace(/%20/g, "+")}&amp;ll=${ll}&amp;z=15&amp;output=embed`;
};

export function officeMapCard(o, { level = 3 } = {}) {
  return `
      <article class="office-card office-card--lg office-card--map">
        <div class="office-card__map" aria-hidden="true"><iframe src="${mapSrc(o)}" title="Map of the ${o.name} office" loading="lazy" referrerpolicy="no-referrer-when-downgrade" tabindex="-1"></iframe></div>
        <div class="office-card__body">
          <span class="office-card__icon">${icon("mapPin")}</span>
          <h${level}>${o.name}</h${level}>
          <p class="office-card__label">${o.label}</p>
          <p>${o.address}</p>
          <div class="btn-group mt-5">
            <a class="btn btn--secondary btn--sm" href="${o.maps}" rel="noopener">${icon("mapPin")}<span>Get directions</span></a>
            <a class="btn btn--ghost btn--sm" href="${SITE.phoneHref}">${icon("phone")}<span>${SITE.phone}</span></a>
          </div>
        </div>
      </article>`;
}

// A case study's own photograph (CASE_PHOTO in site.mjs).
export const casePhoto = (c, options) => photo(PHOTOS[CASE_PHOTO[c.slug]] || PHOTOS.team, options);

// The case-study card, as the home page shows it: the study's photograph, its
// sector, title and excerpt. Used wherever the stories are listed as cards.
export function caseTile(c, { level = 3 } = {}) {
  return `
  <article class="case-tile">
    ${casePhoto(c, { cls: "case-tile__art", ratio: "4-5", sizes: "(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw" })}
    <div class="case-tile__body">
      <span class="case-tile__tag">${c.sector}</span>
      <h${level} class="case-tile__title"><a class="card-link" href="@/our-customers/${c.slug}.html">${c.title}</a></h${level}>
      <p>${c.excerpt}</p>
      <span class="case-tile__more" aria-hidden="true">Read the story ${icon("arrow")}</span>
    </div>
  </article>`;
}

// Stock photography helper: 3:2 WebP at four widths.
export function stockPhoto(item, { cls = "", sizes = "(min-width: 1024px) 50vw, 100vw", loading = "lazy", ratio = "3-2", alt = null } = {}) {
  const set = [480, 768, 1024, 1280].map((w) => `@/assets/images/photos/stock-${item.slug}-${w}.webp ${w}w`).join(", ");
  return `<figure class="media ratio-${ratio} ${cls}">
    <img src="@/assets/images/photos/stock-${item.slug}-1024.webp" srcset="${set}" sizes="${sizes}" alt="${esc(alt ?? item.alt)}" width="1024" height="683" loading="${loading}" decoding="async">
  </figure>`;
}

export function media(label, { ratio = "4-3", cls = "", iconName = "image" } = {}) {
  return `<figure class="media media--placeholder ratio-${ratio} ${cls}"><figcaption class="media__note">${icon(iconName)}<span>${label}</span><span class="placeholder-tag">Client to supply</span></figcaption></figure>`;
}

export function breadcrumbs(items) {
  const lis = items
    .map((item, i) =>
      i === items.length - 1
        ? `<li><span aria-current="page">${item.title}</span></li>`
        : `<li><a href="${at(item.href)}">${item.title}</a></li>`
    )
    .join("");
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${lis}</ol></nav>`;
}

/* ---------- Decorative art for service cards ---------- */
const cardArtPaths = {
  support: `<circle cx="60" cy="56" r="6" fill="currentColor"/><path d="M60 56h60l20-24h70M120 56l20 24h90" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="4 5"/><circle cx="210" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="230" cy="80" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="250" y="20" width="70" height="24" rx="6" fill="currentColor" opacity=".12"/><rect x="250" y="68" width="54" height="24" rx="6" fill="currentColor" opacity=".12"/>`,
  cloud: `<path d="M90 76h110a22 22 0 0 0 0-44 34 34 0 0 0-64-6 26 26 0 0 0-46 22 14 14 0 0 0 0 28Z" fill="currentColor" opacity=".12"/><path d="M90 76h110a22 22 0 0 0 0-44 34 34 0 0 0-64-6 26 26 0 0 0-46 22 14 14 0 0 0 0 28Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M145 76v26M110 76v26M180 76v26" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="110" cy="104" r="3.5" fill="currentColor"/><circle cx="145" cy="104" r="3.5" fill="currentColor"/><circle cx="180" cy="104" r="3.5" fill="currentColor"/>`,
  cyber: `<g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="160" cy="56" r="18"/><circle cx="160" cy="56" r="34" opacity=".55"/><circle cx="160" cy="56" r="50" opacity=".3"/><circle cx="160" cy="56" r="66" opacity=".15"/></g><path d="M160 44l10 4v7c0 7-10 11-10 11s-10-4-10-11v-7Z" fill="currentColor"/>`,
  network: `<g stroke="currentColor" stroke-width="1.5" fill="none"><path d="M70 40 130 70 200 30 260 66"/><path d="M130 70 160 100M200 30 230 96" stroke-dasharray="3 4"/></g><g fill="currentColor"><circle cx="70" cy="40" r="5"/><circle cx="130" cy="70" r="7"/><circle cx="200" cy="30" r="5"/><circle cx="260" cy="66" r="7"/><circle cx="160" cy="100" r="4" opacity=".5"/><circle cx="230" cy="96" r="4" opacity=".5"/></g>`,
  projects: `<g fill="currentColor"><rect x="60" y="24" width="90" height="12" rx="4" opacity=".9"/><rect x="110" y="46" width="110" height="12" rx="4" opacity=".6"/><rect x="170" y="68" width="80" height="12" rx="4" opacity=".35"/><rect x="220" y="90" width="60" height="12" rx="4" opacity=".2"/></g><path d="M150 30v22M220 52v22M250 74v22" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3"/>`,
};

export const cardArt = (tone) =>
  `<div class="service-card__art" aria-hidden="true"><svg viewBox="0 0 340 112" preserveAspectRatio="xMidYMid slice">${cardArtPaths[tone] || cardArtPaths.support}</svg></div>`;

/* ---------- Cards ---------- */
export function serviceCard(s, { feature = false, art = true, headingLevel = 3 } = {}) {
  const cls = `service-card tone-${s.tone}${feature ? " service-card--feature" : ""}`;
  return `<article class="${cls}">
    ${art ? cardArt(s.tone) : `<span class="icon-tile tone-${s.tone}">${icon(s.icon)}</span>`}
    <h${headingLevel} class="service-card__title"><a class="card-link" href="${at(s.href)}">${s.title}</a></h${headingLevel}>
    <p class="service-card__desc">${s.desc}</p>
    <ul class="service-card__list" role="list">${s.tags.map((t) => `<li class="tag">${t}</li>`).join("")}</ul>
    <div class="service-card__foot"><span class="text-link" aria-hidden="true"><span>Explore ${s.title.toLowerCase().replace("it ", "IT ")}</span>${icon("arrow")}</span></div>
  </article>`;
}

export function serviceRow(s, { desc = s.short } = {}) {
  return `<div class="service-row"><span class="icon-tile icon-tile--sm tone-${s.tone || "support"}">${icon(s.icon)}</span><div><a class="card-link service-row__title" href="${at(s.href)}">${s.title}</a><span class="service-row__desc">${desc}</span></div>${icon("arrow")}</div>`;
}

export function industryCard(i, { headingLevel = 3, anchor = false } = {}) {
  return `<article class="industry-card"${anchor ? ` id="sector-${i.key}"` : ""}><span class="icon-tile">${icon(i.icon)}</span><h${headingLevel} class="industry-card__title"><a class="card-link" href="${at(i.href)}">${i.title}</a></h${headingLevel}><p>${i.desc}</p></article>`;
}

const initials = (name) => name.replace(/[\[\]]/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function stars(label = "Rating to be supplied") {
  return `<span class="stars" role="img" aria-label="${label}">${icon("star").repeat(5)}</span>`;
}

// Reviewer avatar: the reviewer's own photo when one is on file
// (assets/images/customers/), their initials otherwise. The hue is derived from
// the name so each reviewer keeps a stable, distinguishable colour, the way
// Google's own review avatars do. `badge` adds the Google glyph that marks the
// review as verified rather than collected by us.
export function reviewAvatar(person, { cls = "", badge = false } = {}) {
  const classes = ["avatar", cls].filter(Boolean).join(" ");
  const glyph = badge ? `<span class="avatar__source" aria-hidden="true">${icon("google")}</span>` : "";
  if (person.avatar) {
    return `<span class="${classes}"><img class="avatar__photo" src="@/assets/images/customers/${person.avatar}" alt="" width="96" height="96" loading="lazy" decoding="async">${glyph}</span>`;
  }
  // Kept inside the palette's cool band (cyan → signal blue → violet) so the wall
  // of avatars stays on-brand instead of turning into a colour wheel.
  const hue = 186 + ([...person.name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % 76);
  return `<span class="${classes} avatar--initials" style="--avatar-hue:${hue}"><span aria-hidden="true">${initials(person.name)}</span>${glyph}</span>`;
}

// All testimonials are placeholders until the client supplies approved quotes.
export function testimonial({ quote, name = "Client name", role = "Role, Company", context = "" }) {
  return `<figure class="testimonial">
    <div class="testimonial__head">${stars()}${phTag("Placeholder testimonial")}</div>
    <blockquote><p>${quote}</p></blockquote>
    <figcaption class="person"><span class="avatar" aria-hidden="true">${initials(name)}</span><span><span class="person__name">[${name}]</span><span class="person__role">[${role}]${context ? ` · ${context}` : ""}</span></span></figcaption>
  </figure>`;
}

export function logoWall(count = 6, { label = "Client logo", cls = "" } = {}) {
  const tiles = Array.from({ length: count }, (_, i) => `<li class="logo-tile"><span class="logo-tile__mark">${label} ${i + 1}</span></li>`).join("");
  return `<ul class="logo-wall ${cls}" role="list" aria-label="${label}s (to be supplied)">${tiles}</ul>`;
}

export function certBadges(items) {
  return `<ul class="badge-row" role="list">${items
    .map((c) => `<li class="cert-badge"><span class="cert-badge__seal">${icon(c.icon || "award")}</span><span><strong>${c.title}</strong><span>${c.note || "Client to confirm"}</span></span></li>`)
    .join("")}</ul>`;
}

// Stats: supply { value, count } only when verified. Otherwise a marked placeholder renders.
export function stats(items, { cls = "" } = {}) {
  return `<dl class="stats ${cls}">${items
    .map((s) => {
      const value = s.count != null
        ? `<span data-count="${s.count}" data-suffix="${s.suffix || ""}" data-prefix="${s.prefix || ""}">${s.prefix || ""}${s.count}${s.suffix || ""}</span>`
        : `<span class="is-placeholder">${s.placeholder || "00"}</span>`;
      return `<div class="stat"><dt class="stat__label">${s.label}${s.count == null ? ` ${phTag("Client to supply")}` : ""}</dt><dd class="stat__value${s.count == null ? " is-placeholder" : ""}">${value}</dd></div>`;
    })
    .join("")}</dl>`;
}

export function steps(items, { variant = "", level = 3 } = {}) {
  const cls = ["steps", variant && `steps--${variant}`].filter(Boolean).join(" ");
  return `<ol class="${cls}" role="list">${items
    .map((s) => `<li class="step"><h${level}>${s.title}</h${level}><p>${s.text}</p></li>`)
    .join("")}</ol>`;
}

export function features(items, { cls = "", level = 3, tone = "" } = {}) {
  return `<div class="feature-grid ${cls}">${items
    .map((f) => `<div class="feature"><span class="icon-tile ${f.tone ? `tone-${f.tone}` : tone}">${icon(f.icon)}</span><h${level} class="feature__title">${f.title}</h${level}><p>${f.text}</p></div>`)
    .join("")}</div>`;
}

export function faq(items, { title = "Questions we hear often", lead = "", id = "faq" } = {}) {
  return `<section class="section" aria-labelledby="${id}-title" id="${id}">
    <div class="container faq">
      <div class="faq__intro">
        <h2 id="${id}-title">${title}</h2>
        ${lead ? `<p class="lead mt-5">${lead}</p>` : ""}
        <div class="mt-6">${textLink("Ask us something else", "contact.html", `${id}-contact`)}</div>
      </div>
      <div class="faq__list">
        ${items.map((q) => `<details class="faq-item"><summary>${q.q}</summary><div class="faq-item__body"><p>${q.a}</p></div></details>`).join("")}
      </div>
    </div>
  </section>`;
}

// Closing call to action, at the top of every page's footer (page({ footerCta })).
// Two boxes side by side rather than one long band: the ask on a dark panel
// warmed by the brand orange, and beside it the phone line with the engineer who
// answers it, so the photo says what it is there for.
function ctaCard({ title, text, cta = "Book a consultation", href = "contact.html", track = "cta-band", level = 2 }) {
  return `<div class="cta-box">
        <div class="cta-box__ask">
          <h${level}>${title}</h${level}>
          <p>${text}</p>
          <div class="cta-box__actions">
            ${btn(cta, href, { variant: "light", size: "lg", track })}
          </div>
        </div>
        <div class="cta-box__call">
          ${photo(PHOTOS.headset, { cls: "cta-box__photo", ratio: "4-3", sizes: "(min-width: 1024px) 460px, 100vw" })}
          <div class="cta-box__line">
            <p class="cta-box__label">Prefer to talk?</p>
            <a class="cta-box__phone" href="${SITE.phoneHref}" data-track="${track}-phone">${icon("phone")}<span>${SITE.phone}</span></a>
            <p class="cta-box__note">We answer the phone, no call queues.</p>
          </div>
        </div>
      </div>`;
}

// The two credentials as large badges: each logo on its own plate at a size that
// can actually be read, with the line that says what it proves. `partners` adds
// the vendor partner logos underneath as a row of tiles.
/** The line under the credential badges on the old site. */
export const CRED_NOTE = `Cyber Essentials is a UK government scheme run by the <a href="https://www.ncsc.gov.uk/cyberessentials/overview" target="_blank" rel="noopener">National Cyber Security Centre</a>, delivered by <a href="https://iasme.co.uk/cyber-essentials/" target="_blank" rel="noopener">IASME</a>. You can verify what the certification covers at source.`;

/** A partner logo; a link to the vendor's site where the old site had one. */
export const partnerLogo = (p, extra = "") => {
  const img = `<img src="@/assets/images/partners/${p.file}" alt="${p.title}"${extra} decoding="async">`;
  return p.href ? `<a href="${p.href}" target="_blank" rel="noopener" aria-label="${p.title} (opens in a new tab)">${img}</a>` : img;
};

export function credBadges({ partners = false, level = 3, note = false } = {}) {
  const rest = PARTNERS.filter((p) => !CREDENTIALS.some((c) => c.file === p.file));
  return `<ul class="cred-badges" role="list">
      ${CREDENTIALS.map((c) => `
      <li class="cred-badge">
        <span class="cred-badge__plate"><img src="@/assets/images/partners/${c.file}" alt="${c.title}" width="280" height="110" loading="lazy" decoding="async"></span>
        <span class="cred-badge__body">
          <h${level} class="cred-badge__title">${c.title}</h${level}>
          <span>${c.text}</span>
          <a class="text-link" href="${at(c.cta.href)}"><span>${c.cta.label}</span>${icon("arrow")}</a>
        </span>
      </li>`).join("")}
    </ul>${partners ? `
    <ul class="partner-row partner-row--badges" role="list">
      ${rest.map((p) => `<li>${partnerLogo(p, ' loading="lazy"')}</li>`).join("")}
    </ul>` : ""}${note ? `
    <p class="cred-note">${CRED_NOTE}</p>` : ""}`;
}

export function blogCard(p, { featured = false, level = 3 } = {}) {
  const date = new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const art = `<div class="blog-card__art tone-${p.tone}" aria-hidden="true">${blogArt(p.icon)}</div>`;
  const body = `<div class="stack">
      <div class="meta-row"><span class="tag tag--blue">${p.categoryLabel}</span><time datetime="${p.date}">${date}</time><span>${p.read} min read</span></div>
      <h${level} class="blog-card__title"><a class="card-link" href="@/blog/${p.slug}.html">${p.title}</a></h${level}>
      <p>${p.excerpt}</p>
      ${featured ? `<p><span class="text-link" aria-hidden="true"><span>Read the article</span>${icon("arrow")}</span></p>` : ""}
    </div>`;
  return `<article class="blog-card${featured ? " blog-card--featured" : ""}" data-category="${p.category}">${art}${body}</article>`;
}

// A post card's cover: the category icon on its tint. Staging's blog cards carry
// no photographs, so ours do not either.
export const postCover = (p, cls = "") => `<div class="blog-card__art post-cover tone-${p.tone}${cls ? " " + cls : ""}" aria-hidden="true">${blogArt(p.icon)}</div>`;

export function blogArt(name) {
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor" stroke-width="1" opacity=".35"><circle cx="160" cy="100" r="40"/><circle cx="160" cy="100" r="70"/><circle cx="160" cy="100" r="100"/></g><path d="M0 150 C80 150 100 100 160 100 S260 40 320 40" stroke="currentColor" stroke-width="1.2" fill="none" stroke-dasharray="4 5" opacity=".6"/><rect x="132" y="72" width="56" height="56" rx="16" fill="#fff"/>${icon(name).replace("<svg", '<svg x="146" y="86" width="28" height="28"')}</svg>`;
}

export function reviewSummary() {
  return `<div class="review-summary">
    <span class="review-summary__source">${icon("google")} Google reviews</span>
    <div class="cluster"><span class="review-summary__score">${G_RATING}</span>${stars(SITE.google.label)}</div>
    <p class="small muted"><a href="${SITE.google.reviewsUrl}" rel="noopener">Read the reviews on Google</a></p>
    <p class="small muted">Ready to connect to a live Google Reviews feed.</p>
  </div>`;
}

export function routeSplit({ level = 3 } = {}) {
  return `<div class="route-split">
    <article class="route-card route-card--existing">
      <span class="icon-tile icon-tile--dark">${icon("remote")}</span>
      <h${level}>Already a WhizzIT customer?</h${level}>
      <p>Raise a ticket, call the helpdesk or start a remote session so an engineer can see what you see.</p>
      ${btn("Get remote support", SITE.remoteSupport, { variant: "light", track: "route-remote-support" })}
    </article>
    <article class="route-card">
      <span class="icon-tile">${icon("message")}</span>
      <h${level}>Looking for a new IT partner?</h${level}>
      <p>Tell us about your business and we'll arrange a no-obligation conversation with a senior consultant.</p>
      ${btn("Book a consultation", "contact.html", { track: "route-book-consultation" })}
    </article>
  </div>`;
}

export function spotlight({ title, customer = "Customer name", sector = "Sector", problem, solution, result, reverse = false, level = 3 }) {
  return `<article class="spotlight${reverse ? " spotlight--reverse" : ""}">
    ${media(`Customer photography: ${customer}`, { cls: "spotlight__media", ratio: "4-3", iconName: "building" })}
    <div class="spotlight__body">
      <div class="cluster"><span class="tag">[${sector}]</span>${phTag("Placeholder case study")}</div>
      <h${level} class="h3">${title}</h${level}>
      <dl class="spotlight__facts">
        <div><dt>Challenge</dt><dd>${problem}</dd></div>
        <div><dt>What we did</dt><dd>${solution}</dd></div>
        <div><dt>Outcome</dt><dd>${result}</dd></div>
      </dl>
      <blockquote class="quote"><p class="small">“[Short approved quote from ${customer}.]”</p></blockquote>
      <div>${textLink("Read the full story", "our-customers.html#stories")}</div>
    </div>
  </article>`;
}

export function relatedServices(keys, { title = "Related services", lead = "", extra = [] } = {}) {
  const items = keys.map(service).concat(extra);
  return `<section class="section section--mist" aria-labelledby="related-title">
    <div class="container">
      ${sectionHead({ title: `<span id="related-title">${title}</span>`, lead, align: "split" })}
      <div class="related-grid">${items.map((s) => serviceRow(s)).join("")}</div>
    </div>
  </section>`;
}

export const trustItems = () =>
  `<span class="hero__trust-item">${icon("checkCircle")} UK-based engineers ${phTag("Confirm")}</span><span class="hero__trust-item">${icon("checkCircle")} Proactive monitoring</span><span class="hero__trust-item">${icon("checkCircle")} No-obligation consultation</span>`;


/* ---------- Header ---------- */
// A match entry ending in "/" or "-" covers every page that starts with it (a
// folder, or a family such as "managed-it-services-for-"); anything else is one
// page. Only the item's own list counts, never the links inside its menu, so a
// "Book a consultation" button in a dropdown never marks that dropdown current.
const isPrefix = (m) => m.endsWith("/") || m.endsWith("-");

function isCurrent(item, file) {
  return item.match.some((m) => (isPrefix(m) ? file.startsWith(m) : file === m));
}

// WordPress: the header is one generated part for every page, so each item
// carries its match list as URL paths and wp/wp.js marks the current one in the
// browser. "*" marks a prefix.
const navMatch = (item) => {
  if (!WP_EXPORT) return "";
  const paths = item.match.map((m) => (m === "index.html" ? "/" : m.endsWith(".html") ? `/${m.replace(/\.html$/, "/")}` : `/${m}*`));
  return ` data-nav-match="${paths.join(" ")}"${item.bodyClass ? ` data-nav-body="${item.bodyClass.join(" ")}"` : ""}`;
};

const cur = (href, file) => (href === file ? ' aria-current="page"' : "");

function megaServices(file) {
  const core = SERVICES.map(
    (s) => `<li><a class="mega-link" href="${at(s.href)}"${cur(s.href, file)}><span class="icon-tile icon-tile--sm tone-${s.tone}">${icon(s.icon)}</span><span><span class="mega-link__title">${s.title}</span><span class="mega-link__desc">${s.short}</span></span></a></li>`
  ).join("");
  const spec = SPECIALIST.map(
    (s) => `<li><a class="mega-link mega-link--plain" href="${at(s.href)}"${cur(s.href, file)}>${icon(s.icon)}<span>${s.title}</span></a></li>`
  ).join("");
  return `<div class="container mega__inner mega__inner--services">
    <div><p class="mega__heading">Core services</p><ul class="mega-links mega-links--two">${core}<li><a class="mega-link" href="@/it-services.html"${cur("it-services.html", file)}><span class="icon-tile icon-tile--sm icon-tile--neutral">${icon("layers")}</span><span><span class="mega-link__title">All IT services</span><span class="mega-link__desc">Find the right service for your business.</span></span></a></li></ul></div>
    <div><p class="mega__heading">Specialist services</p><ul class="mega-links">${spec}</ul></div>
    ${megaFeature({ title: "Not sure where to start?", text: "Tell us what's slowing your team down. We'll recommend the right mix of services, not the biggest package.", cta: "Book a consultation", href: "contact.html" }, "mega-services")}
  </div>`;
}

function megaIndustries(file) {
  const list = WP_EXPORT ? "{{SECTORS_MEGA}}" : INDUSTRIES.map(
    (i) => `<li><a class="mega-link mega-link--plain" href="${at(i.href)}"${cur(i.href, file)}>${icon(i.icon)}<span>${i.title}</span></a></li>`
  ).join("");
  return `<div class="container mega__inner mega__inner--industries">
    <div><p class="mega__heading">Sectors we support</p><ul class="mega-links mega-links--two">${list}</ul></div>
    <div><p class="mega__heading">Explore</p><ul class="mega-links">
      <li><a class="mega-link" href="@/industries.html"${cur("industries.html", file)}><span class="icon-tile icon-tile--sm icon-tile--neutral">${icon("layers")}</span><span><span class="mega-link__title">All industries</span><span class="mega-link__desc">How we adapt IT to the way your sector works.</span></span></a></li>
      <li><a class="mega-link" href="@/locations/it-support-london.html"${cur("locations/it-support-london.html", file)}><span class="icon-tile icon-tile--sm icon-tile--neutral">${icon("mapPin")}</span><span><span class="mega-link__title">IT support in London</span><span class="mega-link__desc">Local engineers for London businesses.</span></span></a></li>
    </ul></div>
    ${megaFeature({ title: "Compliance on your mind?", text: "We help regulated teams turn security requirements into clear, evidenced controls.", cta: "Explore cyber security", href: "cyber-security.html" }, "mega-industries")}
  </div>`;
}

function megaCompact(item, file) {
  const groups = item.groups
    .map(
      (g) => `<div><p class="mega__heading">${g.title}</p><ul class="mega-links">${g.links
        .map((l) => `<li><a class="mega-link mega-link--plain" href="${at(l.href)}"${cur(l.href, file)}>${icon(l.icon)}<span>${l.title}</span></a></li>`)
        .join("")}</ul></div>`
    )
    .join("");
  return `<div class="container mega__inner mega__inner--compact">${groups}${megaFeature(item.feature, `mega-${item.id}`)}</div>`;
}

function megaFeature(f, track) {
  return `<aside class="mega-feature"><p class="mega-feature__title">${f.title}</p><p>${f.text}</p>${btn(f.cta, f.href, { variant: "light", size: "sm", track: `${track}-feature` })}</aside>`;
}

function header(file) {
  // Every nav entry links to its overview page. Entries with a mega menu add a
  // chevron button beside the label: hover opens the panel for mouse users, the
  // chevron opens it for touch and keyboard. The old utility strip above the bar
  // is gone: its links live in the mega panels, and its phone number is now the
  // header's second action.
  const items = NAV.map((item) => {
    if (item.type === "link") {
      return `<li class="primary-nav__item${isCurrent(item, file) ? " is-current" : ""}"${navMatch(item)}>
      <a class="primary-nav__link" href="${at(item.href)}"${cur(item.href, file)}>${item.label}</a>
    </li>`;
    }
    const panel = item.type === "services" ? megaServices(file) : item.type === "industries" ? megaIndustries(file) : megaCompact(item, file);
    return `<li class="primary-nav__item primary-nav__item--mega${isCurrent(item, file) ? " is-current" : ""}"${navMatch(item)}>
      <a class="primary-nav__trigger" href="${at(item.href)}"${cur(item.href, file)} data-mega-link>${item.label}</a><button class="primary-nav__caret" type="button" aria-expanded="false" aria-controls="mega-${item.id}" aria-label="${item.label} menu" data-mega-trigger>${icon("chevronDown")}</button>
      <div class="mega" id="mega-${item.id}">${panel}</div>
    </li>`;
  }).join("");

  return `<a class="skip-link" href="#main">Skip to content</a>
<span class="header-sentinel" data-header-sentinel></span>
<header class="site-header" data-header>
  <div class="header-top">
    <div class="container container--wide header-top__inner">
      <span class="header-top__note">${icon("checkCircle")}${SITE.responseLine}</span>
      <div class="header-top__contact">
        <a href="${SITE.phoneHref}" data-track="header-top-phone">${icon("phone")}${SITE.phone}</a>
        <a href="mailto:${SITE.email}" data-track="header-top-email">${icon("mail")}${SITE.email}</a>
        <a href="${at(LINK.remote)}" data-track="header-top-remote">${icon("remote")}Remote support</a>
      </div>
    </div>
  </div>
  <div class="container container--wide site-header__inner">
    <a class="brand" href="@/index.html" aria-label="WhizzIT home">${brandLogo("dark")}</a>
    <nav class="primary-nav" aria-label="Main">
      <ul class="primary-nav__list">${items}</ul>
    </nav>
    <div class="site-header__actions">
      ${btn("Book a consultation", LINK.booking, { variant: "navy", size: "sm", arrow: false, track: "header-book-consultation", cls: "site-header__cta" })}
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menu" data-menu-toggle>${icon("menu")}<span>Menu</span></button>
      <a class="menu-fallback" href="#footer-nav">Menu</a>
    </div>
  </div>
</header>`;
}

function mobileNav(file) {
  const groupsFor = (item) => {
    if (item.type === "services")
      return [
        { title: "Core services", links: [{ title: "All IT services", href: "it-services.html" }, ...SERVICES] },
        { title: "Specialist services", links: SPECIALIST },
      ];
    if (item.type === "industries")
      return [{ title: "Sectors", links: [{ title: "All industries", href: "industries.html" }, ...(WP_EXPORT ? [{ title: "{{SECTORS_MOBILE}}", href: "#sectors-mobile" }] : INDUSTRIES)] }];
    return item.groups;
  };

  const list = NAV.map((item) => {
    if (item.type === "link") {
      return `<li><a class="mobile-nav__direct" href="${at(item.href)}"${cur(item.href, file)}>${item.label}</a></li>`;
    }
    const groups = groupsFor(item)
      .map((g) => `<p class="mobile-nav__group-title">${g.title}</p><ul>${g.links.map((l) => `<li><a href="${at(l.href)}"${cur(l.href, file)}>${l.title}</a></li>`).join("")}</ul>`)
      .join("");
    const open = isCurrent(item, file);
    return `<li class="mobile-nav__item"${navMatch(item)}>
      <button class="mobile-nav__toggle" type="button" aria-expanded="${open}" aria-controls="mnav-${item.id}" data-accordion-trigger>${item.label}${icon("chevronDown")}</button>
      <div class="mobile-nav__sub" id="mnav-${item.id}"${open ? "" : " hidden"}>${groups}</div>
    </li>`;
  }).join("");

  return `<div class="mobile-nav" id="mobile-nav" aria-hidden="true">
  <div class="mobile-nav__backdrop" data-menu-close></div>
  <div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Site menu">
    <div class="mobile-nav__head">
      <a class="brand" href="@/index.html" aria-label="WhizzIT home">${brandLogo("dark")}</a>
      <div class="mobile-nav__head-actions">
        <button class="mobile-nav__close" type="button" data-menu-close aria-label="Close menu">${icon("close")}</button>
      </div>
    </div>
    <div class="mobile-nav__body">
      <a class="mobile-nav__support" href="${SITE.phoneHref}" data-track="mobile-phone-support">${icon("phone")}<span><strong>Need help now?</strong>Call ${SITE.phone} — we answer the phone</span></a>
      <ul class="mobile-nav__list">${list}</ul>
    </div>
    <div class="mobile-nav__foot">
      ${btn("Book a consultation", LINK.booking, { track: "mobile-book-consultation" })}
      <a class="btn btn--secondary" href="${SITE.phoneHref}" data-track="mobile-phone">${icon("phone")}<span>Call ${SITE.phone}</span></a>
    </div>
  </div>
</div>`;
}

/* ---------- Footer ---------- */
function footer(cta) {
  const col = (title, links) =>
    `<div class="footer-col"><h2>${title}</h2><ul>${links.map((l) => `<li><a href="${at(l.href)}">${l.title}</a></li>`).join("")}</ul></div>`;

  const ctaBlock = cta
    ? `<div class="site-footer__cta">${ctaCard({ title: cta.title, text: cta.text, cta: cta.cta, href: cta.href, track: cta.track || "footer-cta" })}</div>`
    : "";
  const quick = [
    { title: "Home", href: "index.html" },
    { title: "About", href: "about.html" },
    { title: "Services", href: "it-services.html" },
    { title: "Customers", href: "our-customers.html" },
    { title: "Blog", href: "blog.html" },
    { title: "Contact", href: "contact.html" },
  ];

  return `<footer class="site-footer" id="footer-nav">
  <div class="container">
    ${ctaBlock}
    <div class="site-footer__bar">
      <a class="brand" href="@/index.html" aria-label="WhizzIT home">${brandLogo("light")}</a>
      <ul class="footer-pills" role="list">${quick.map((l) => `<li><a href="${at(l.href)}">${l.title}</a></li>`).join("")}</ul>
      <ul class="social-links" role="list">
        <li><a href="${SITE.social.linkedin}" rel="noopener" aria-label="WhizzIT on LinkedIn">${icon("linkedin")}</a></li>
        <li><a href="${SITE.google.reviewsUrl}" rel="noopener" aria-label="WhizzIT reviews on Google">${icon("google")}</a></li>
      </ul>
    </div>
    <div class="site-footer__top">
      <div class="site-footer__brand">
        <p>Managed IT, cloud and cyber security for UK businesses that want technology to be the thing they don't have to worry about.</p>
        <ul class="site-footer__contact" role="list">
          <li><a href="${SITE.phoneHref}" data-track="footer-phone">${icon("phone")}${SITE.phone}</a></li>
          <li><a href="mailto:${SITE.email}" data-track="footer-email">${icon("mail")}${SITE.email}</a></li>
          ${SITE.offices.map((o) => `<li><span>${icon("mapPin")}${o.address}</span></li>`).join("")}
        </ul>
      </div>
      <nav class="site-footer__nav" aria-label="Footer">
        ${col("IT services", [{ title: "All IT services", href: "it-services.html" }, ...SERVICES])}
        ${col("Industries", [{ title: "All industries", href: "industries.html" }, ...(WP_EXPORT ? [{ title: "{{SECTORS_FOOTER}}", href: "#sectors-footer" }] : INDUSTRIES.slice(0, 6))])}
        ${col("Company", [
          { title: "About WhizzIT", href: "about.html" },
          { title: "Our customers", href: "our-customers.html" },
          { title: "Locations", href: "locations.html" },
          { title: "Contact", href: "contact.html" },
        ])}
        ${col("Areas we cover", LOCATIONS.slice(0, 7))}
      </nav>
    </div>
    <div class="site-footer__bottom">
      <p>© 2026 ${SITE.company}. All rights reserved.</p>
      <ul class="legal-links" role="list">
        <li><a href="@/privacy-policy.html">Privacy policy</a></li>
        <li><a href="@/cookie-policy.html">Cookie policy</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

/* ---------- WordPress export ----------
   With WHIZZIT_EXPORT=wp, page() records each page instead of writing HTML, and
   links are rewritten for WordPress: "@/about.html" becomes "/about/" (root-
   relative, so it works on the dev, staging and live domains alike) and
   "@/assets/…" becomes "{{ASSETS}}/…", which the child theme swaps for its own
   assets URL. _build/wp-export.mjs writes the records out. */
export const WP_EXPORT = process.env.WHIZZIT_EXPORT === "wp";
export const wpRecords = { pages: [], chrome: null };

export function wpUrls(html) {
  const out = html
    .replace(/@\/index\.html/g, "/")
    .replace(/@\/([^"'\s<>]*?)\.html/g, "/$1/")
    .replace(/@\/assets\//g, "{{ASSETS}}/");
  if (out.includes("@/")) throw new Error(`Unresolved @/ link: ${out.slice(out.indexOf("@/") - 60, out.indexOf("@/") + 60)}`);
  return out;
}

const wpPath = (file) => (file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}/`);

/* ---------- Page shell ---------- */
export function page({ file, title, description, bodyClass, crumbs = null, main, schema = [], ogType = "website", footerCta = null }) {
  if (WP_EXPORT) {
    // The chrome is the same on every page (the current menu item is marked in
    // the browser), so it is captured once; the footer CTA varies per page.
    // The closing CTA card is exported as its own part and placed at
    // {{FOOTER_CTA}} with each page's own copy.
    wpRecords.chrome ??= {
      header: wpUrls(header("")),
      mobileNav: wpUrls(mobileNav("")),
      footer: wpUrls(footer(null)).replace('<div class="container">', '<div class="container">{{FOOTER_CTA}}'),
      footerCta: wpUrls(`<div class="site-footer__cta">${ctaCard({ title: "{{TITLE}}", text: "{{TEXT}}", cta: "{{LABEL}}", href: "contact.html", track: "{{TRACK}}" })}</div>`),
      // Used by the blog post template.
      callback: wpUrls(callbackForm({ track: "{{TRACK}}", captchaTheme: "{{CAPTCHA_THEME}}" })),
    };
    wpRecords.pages.push({
      path: wpPath(file),
      file,
      title,
      description,
      bodyClass: `page ${bodyClass}`,
      footerCta,
      main: wpUrls(main),
    });
    return file;
  }
  const depth = file.split("/").length - 1;
  const r = "../".repeat(depth);
  const canonical = cleanUrl(file);
  const fullTitle = file === "index.html" ? title : `${title} | WhizzIT`;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "WhizzIT",
      url: SITE.url,
      logo: `${SITE.url}/assets/images/brand/whizzit-logo.svg`,
    },
  ];
  if (crumbs) {
    ld.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, item: c.href ? cleanUrl(c.href) : canonical })),
    });
  }
  ld.push(...schema);

  let html = `<!doctype html>
<html lang="en-GB" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#ffffff">

  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="WhizzIT">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE.url}/assets/images/brand/og-default.png">
  <meta property="og:locale" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(fullTitle)}">
  <meta name="twitter:description" content="${esc(description)}">

  <link rel="icon" href="@/assets/images/brand/favicon.ico" sizes="any">
  <link rel="icon" href="@/assets/images/brand/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="@/assets/images/brand/icon-48.png" type="image/png" sizes="48x48">
  <link rel="apple-touch-icon" href="@/assets/images/brand/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@500;600;700&amp;family=Urbanist:wght@400;500;600;700;800&amp;display=swap">
  <link rel="stylesheet" href="@/assets/css/styles.css">
  <script src="@/assets/js/app.js" defer></script>
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n  ")}
</head>
<body class="page ${bodyClass}">
${header(file)}
<main id="main" tabindex="-1">
${main}
</main>
${footer(footerCta)}
${mobileNav(file)}
</body>
</html>
`;

  // "@/path" in markup and "@/path 480w" inside srcset both resolve here.
  html = html.replaceAll("@/", r);
  if (html.includes("@/")) throw new Error(`Unresolved @/ link in ${file}`);
  const target = join(OUT, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  return file;
}
