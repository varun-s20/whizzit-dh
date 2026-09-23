// Blog index. Signature: one large featured article, topic filters and a
// three-column card grid over all 27 published articles.
import { page, btn, icon, stockPhoto, breadcrumbs, ctaBand, SITE, BLOG, STOCK, CATEGORY_PHOTO } from "../lib.mjs";
import { BLOG_CATEGORIES } from "../site.mjs";
import { pageHero } from "../blocks.mjs";

const crumbs = [{ title: "Home", href: "index.html" }, { title: "Blog" }];
const [featured, ...rest] = BLOG;
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const used = new Set(BLOG.map((p) => p.category));
const categories = BLOG_CATEGORIES.filter((c) => c.key === "all" || used.has(c.key));

const card = (p) => `
  <article class="post-card" data-category="${p.category}">
    ${stockPhoto(STOCK[CATEGORY_PHOTO[p.category]] || STOCK.team, { cls: "post-card__art", ratio: "3-2", sizes: "(min-width: 1024px) 30vw, 100vw", alt: "" })}
    <div class="post-card__body">
      <p class="post-card__meta">
        <span class="tag tag--blue">${p.categoryLabel}</span>
        <time datetime="${p.date}">${fmt(p.date)}</time>
        <span>${p.read} min read</span>
      </p>
      <h3 class="post-card__title"><a class="card-link" href="@/blog/${p.slug}.html">${p.title}</a></h3>
      <p>${p.excerpt}</p>
    </div>
  </article>`;

const main = `
${pageHero({
  feature: false,
  eyebrow: "Insights",
  title: "IT advice for the people who run the business",
  lead: "Practical, jargon-free guidance from our engineers on IT support, cyber security, cloud and getting more from the technology you already pay for.",
  crumbs: breadcrumbs(crumbs),
  aside: `
    <article class="featured-post">
      <p class="featured-post__label">${icon("sparkle")}Latest article</p>
      <p class="post-card__meta"><span class="tag tag--blue">${featured.categoryLabel}</span><time datetime="${featured.date}">${fmt(featured.date)}</time><span>${featured.read} min read</span></p>
      <h2 class="featured-post__title"><a class="card-link" href="@/blog/${featured.slug}.html">${featured.title}</a></h2>
      <p>${featured.excerpt}</p>
      <span class="read-more" aria-hidden="true">Read the article ${icon("arrow")}</span>
    </article>`,
})}

<section class="section" aria-labelledby="articles-title">
  <div class="container">
    <div class="bar-head">
      <div>
        <p class="eyebrow">${BLOG.length} articles</p>
        <h2 class="grad-head" id="articles-title">Browse by topic</h2>
      </div>
      <p class="bar-head__aside">Written by ${BLOG[0].author} and the WhizzIT engineering team.</p>
    </div>

    <div class="filter-bar" role="group" aria-label="Filter articles by topic" data-filter-group data-filter-target="#article-grid .post-card" data-filter-status="#filter-status">
      ${categories.map((c) => `<button class="filter-chip" type="button" data-filter="${c.key}" aria-pressed="${c.key === "all"}">${c.label}</button>`).join("")}
    </div>

    <div class="post-grid" id="article-grid">${rest.map(card).join("")}</div>
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
      ${BLOG.filter((p) => ["security", "cloud", "support", "managed-it"].includes(p.category)).slice(0, 6).map((p) => `
      <li>
        <a href="@/blog/${p.slug}.html">
          <span class="topic-links__icon">${icon(p.icon)}</span>
          <span>
            <strong>${p.title}</strong>
            <span>${p.categoryLabel} · ${p.read} min read</span>
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
