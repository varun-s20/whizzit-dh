// Blog index: one large featured article, topic filters and a three-column card
// grid. The cards are staging's own (BLOG_LISTING): its titles, excerpts, dates,
// categories and order, including the one card that links to a page.
import { page, btn, icon, postCover, breadcrumbs, ctaBand, WP_EXPORT, SITE, BLOG, BLOG_LISTING, LISTING_CATEGORIES } from "../lib.mjs";
import { pageHero } from "../blocks.mjs";

const crumbs = [{ title: "Home", href: "index.html" }, { title: "Blog" }];
const [featured, ...rest] = BLOG_LISTING;
const readTime = (c) => BLOG.find((p) => p.slug === c.slug)?.read;
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const categories = [{ key: "all", label: "All" }, ...LISTING_CATEGORIES];

// In the WordPress export the post lists are shortcodes (whizzit-core renders
// them with this same markup), so a newly published post appears everywhere.
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

const main = `
${pageHero({
  feature: false,
  eyebrow: "Insights",
  title: "IT advice for the people who run the business",
  lead: "Practical, jargon-free guidance from our engineers on IT support, cyber security, cloud and getting more from the technology you already pay for.",
  crumbs: breadcrumbs(crumbs),
  aside: wp("whizzit_blog_featured", `
    <article class="featured-post">
      <p class="featured-post__label">${icon("sparkle")}Latest article</p>
      <p class="post-card__meta"><span class="tag tag--blue">${featured.categoryLabel}</span><time datetime="${featured.date}">${fmt(featured.date)}</time><span>${readTime(featured)} min read</span></p>
      <h2 class="featured-post__title"><a class="card-link" href="@/${featured.href}">${featured.title}</a></h2>
      <p>${featured.excerpt}</p>
      <span class="read-more" aria-hidden="true">Read the article ${icon("arrow")}</span>
    </article>`),
})}

<section class="section" aria-labelledby="articles-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">${wp("whizzit_blog_count", BLOG.length)} articles</p>
        <h2 class="grad-head" id="articles-title">Browse by topic</h2>
      </div>
      <p class="bar-head__aside">Written by ${BLOG[0].author} and the WhizzIT engineering team.</p>
    </div>

    <div class="filter-bar" role="group" aria-label="Filter articles by topic" data-filter-group data-filter-target="#article-grid .post-card" data-filter-status="#filter-status">
      ${wp("whizzit_blog_filters", categories.map((c) => `<button class="filter-chip" type="button" data-filter="${c.key}" aria-pressed="${c.key === "all"}">${c.label}</button>`).join(""))}
    </div>

    <div class="post-grid" id="article-grid">${wp("whizzit_blog_grid", rest.map(card).join(""))}</div>
    <p class="filter-status" id="filter-status" role="status" aria-live="polite"></p>
  </div>
</section>

<section class="section section--mist" aria-labelledby="topics-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">Start here</p>
        <h2 class="grad-head" id="topics-title">The guides people read first</h2>
      </div>
      ${btn("All IT services", "it-services.html", { variant: "secondary", arrow: false, track: "blog-services" })}
    </div>
    <ul class="topic-links" role="list">
      ${WP_EXPORT ? "[whizzit_blog_topics]" : BLOG_LISTING.filter((c) => c.slug && ["security", "cloud", "managed-it"].includes(c.category)).slice(0, 6).map((c) => `
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
    </ul>
  </div>
</section>

${ctaBand({
  title: "Rather ask us directly?",
  text: `Send the question over and an engineer will answer it. ${SITE.responseLine}, no sales pitch.`,
  track: "blog-final-cta",
})}
`;

page({
  file: "blog.html",
  title: "IT Support & Cyber Security Insights | WhizzIT Blog",
  description: "Practical IT advice from the WhizzIT team: managed IT, cyber security, cloud and networks explained for UK business owners.",
  bodyClass: "page--blog page--sky",
  crumbs,
  main,
});
