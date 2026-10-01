// Resources (blog index). Signature: a searchable library.
// - Hero: the site's dark sky with the headline, a numbered "start here" reading
//   path, and the library's own article titles drifting behind in outline type
//   (built in the browser from the cards, so new posts appear there too).
// - Library: a toolbar that rises out of the hero and sticks below the header
//   (instant search with highlighted matches and a "/" shortcut, topic chips with
//   live counts under one highlight that glides between them, a Newest / Quick
//   reads sort, a live results line), above every article as an index card. The
//   latest article leads at double size until the list is filtered.
// - Everything interactive is app.js initLibrary(); without JS the page is the
//   full list. In WordPress the lists are whizzit-core shortcodes that print this
//   same card markup, so a newly published post appears here on its own.
// Every word is the site's existing copy (staging's blog page, the post cards).
import { page, icon, postCover, breadcrumbs, callbackForm, heroNote, WP_EXPORT, SITE, BLOG, BLOG_LISTING, LISTING_CATEGORIES } from "../lib.mjs";

const crumbs = [{ title: "Home", href: "index.html" }, { title: "Blog" }];
const readTime = (c) => BLOG.find((p) => p.slug === c.slug)?.read;
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const categories = [{ key: "all", label: "All" }, ...LISTING_CATEGORIES];

// In the WordPress export the lists are shortcodes (whizzit-core renders them
// with this same markup), so a newly published post appears everywhere.
const wp = (shortcode, html) => (WP_EXPORT ? `[${shortcode}]` : html);

const card = (c) => `
  <article class="post-card" data-category="${c.category}">
    ${postCover(c, "post-card__art")}
    <div class="post-card__body">
      <p class="post-card__meta">
        <span class="tag tag--blue">${c.categoryLabel}</span>
        <time datetime="${c.date}">${fmt(c.date)}</time>
        ${readTime(c) ? `<span>${readTime(c)} min read</span>` : ""}
      </p>
      <h3 class="post-card__title"><a class="card-link" href="@/${c.href}">${c.title}</a></h3>
      <p>${c.excerpt}</p>
    </div>
  </article>`;

const guides = BLOG_LISTING.filter((c) => c.slug && ["security", "cloud", "managed-it"].includes(c.category)).slice(0, 6);

const main = `
<section class="hero hero--sky lib-hero" aria-labelledby="page-hero-title">
  <div class="lib-hero__titles" aria-hidden="true" data-lib-titles></div>
  <div class="container lib-hero__grid">
    <div class="lib-hero__copy">
      ${breadcrumbs(crumbs)}
      <p class="eyebrow">Insights</p>
      <h1 class="hero-sky__title lib-hero__title" id="page-hero-title">IT advice for the people who run the business</h1>
      <p class="hero-sky__lead">Practical, jargon-free guidance from our engineers on IT support, cyber security, cloud and getting more from the technology you already pay for.</p>
      <p class="lib-hero__byline">Written by ${BLOG[0].author} and the WhizzIT engineering team.</p>
    </div>
    <aside class="lib-path" aria-labelledby="path-title">
      <p class="lib-path__kicker">Start here</p>
      <h2 class="lib-path__title" id="path-title">The guides people read first</h2>
      <ol class="topic-links lib-path__list" role="list">
        ${WP_EXPORT ? "[whizzit_blog_topics]" : guides.map((c) => `
        <li>
          <a href="@/${c.href}">
            <span class="topic-links__icon">${icon(c.icon)}</span>
            <span>
              <strong>${c.title}</strong>
              <span>${c.categoryLabel} · ${readTime(c)} min read</span>
            </span>
            ${icon("arrow")}
          </a>
        </li>`).join("")}
      </ol>
    </aside>
  </div>
</section>

<section class="lib" id="library" aria-labelledby="library-title" data-library>
  <div class="container">
    <h2 class="visually-hidden" id="library-title">All articles</h2>
    <div class="lib-bar" data-lib-bar>
      <div class="lib-bar__row">
        <div class="lib-search" data-lib-searchbox>
          <label class="visually-hidden" for="lib-q">Search articles</label>
          <span class="lib-search__icon" aria-hidden="true">${icon("search")}</span>
          <input class="lib-search__input" id="lib-q" type="search" placeholder="Search articles" autocomplete="off" spellcheck="false" enterkeyhint="search" data-lib-search>
          <kbd class="lib-search__key" aria-hidden="true">/</kbd>
          <button class="lib-search__clear" type="button" aria-label="Clear search" data-lib-clear>${icon("close")}</button>
        </div>
        <div class="lib-topics" role="group" aria-label="Filter articles by topic" data-lib-topics>
          ${wp("whizzit_blog_filters", categories.map((c) => `<button class="filter-chip" type="button" data-filter="${c.key}" aria-pressed="${c.key === "all"}">${c.label}</button>`).join(""))}
        </div>
        <div class="lib-sort" role="group" aria-label="Sort articles">
          <button class="lib-sort__btn" type="button" data-sort="new" aria-pressed="true">Newest</button>
          <button class="lib-sort__btn" type="button" data-sort="quick" aria-pressed="false">Quick reads</button>
        </div>
      </div>
      <p class="lib-bar__status" role="status" aria-live="polite" data-lib-status>Showing all ${wp("whizzit_blog_count", BLOG_LISTING.length)} articles</p>
    </div>

    <div class="lib-grid is-default" id="article-grid" data-lib-grid>${wp('whizzit_blog_grid all="1"', BLOG_LISTING.map(card).join(""))}</div>

    <div class="lib-empty" data-lib-empty hidden>
      <span class="lib-empty__icon" aria-hidden="true">${icon("search")}</span>
      <p class="lib-empty__title">No articles match <span data-lib-empty-q></span></p>
      <div class="lib-empty__actions">
        <button class="btn btn--primary" type="button" data-lib-reset><span>Clear search</span></button>
        <a class="btn btn--secondary" href="#ask"><span>Rather ask us directly?</span></a>
      </div>
    </div>
  </div>
</section>

<section class="section lib-ask" id="ask" aria-labelledby="ask-title">
  <div class="container">
    <div class="lib-ask__box section--ink">
      <div class="lib-ask__copy">
        <p class="eyebrow">Insights</p>
        <h2 class="lib-ask__title" id="ask-title">Rather ask us directly?</h2>
        <p>Send the question over and an engineer will answer it. ${SITE.responseLine}, no sales pitch.</p>
        ${heroNote("UK-wide coverage", "blog-ask")}
      </div>
      <div class="lib-ask__form">${callbackForm({ track: "blog-ask" })}</div>
    </div>
  </div>
</section>
`;

page({
  footerCta: {
    title: "Ready to take IT off your plate?",
    text: "Book a free consultation and see what five-star, jargon-free IT support feels like.",
    cta: "Book a consultation",
    track: "blog-final-cta",
  },
  file: "blog.html",
  title: "IT Support & Cyber Security Insights | WhizzIT Blog",
  description: "Practical IT advice from the WhizzIT team: managed IT, cyber security, cloud and networks explained for UK business owners.",
  bodyClass: "page--blog page--sky",
  crumbs,
  main,
});
