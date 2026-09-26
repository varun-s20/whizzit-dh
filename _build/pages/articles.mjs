// Blog article template. Content comes from the WordPress export (_source/wp-posts.json),
// parsed in content.mjs — titles, dates, authors and prose are the client's own.
import { page, icon, blogCard, blogArt, breadcrumbs, serviceRow, service, btn, callbackForm, renderEnquiries, SITE, cleanUrl } from "../lib.mjs";
import { BLOG } from "../site.mjs";

// Which core service each article category points readers towards.
const SERVICE_FOR = {
  support: "support",
  "managed-it": "support",
  security: "cyber",
  cloud: "cloud",
  network: "network",
  strategy: "projects",
  careers: "support",
};

const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// Covers and related cards follow the blog listing's category (as staging's
// related cards do); the article's own chip keeps its own label.
const listed = (p) => (p.card ? { ...p, category: p.card.category, categoryLabel: p.card.categoryLabel, tone: p.card.tone, icon: p.card.icon } : p);

BLOG.forEach((post, index) => {
  const file = `blog/${post.slug}.html`;
  const crumbs = [{ title: "Home", href: "index.html" }, { title: "Blog", href: "blog.html" }, { title: post.title }];
  const prev = BLOG[index + 1];
  const next = BLOG[index - 1];
  // Staging's own picks; a post it never had falls back to the same category.
  const related = post.related
    ? post.related.map((slug) => BLOG.find((p) => p.slug === slug)).filter(Boolean)
    : BLOG.filter((p) => p.slug !== post.slug).sort((a, b) => (b.category === post.category) - (a.category === post.category)).slice(0, 3);
  // A couple of posts are filed under a category that does not match their subject.
  const SLUG_SERVICE = { "how-to-choose-managed-network-services-provider": "network" };
  const svc = service(SLUG_SERVICE[post.slug] || SERVICE_FOR[post.category] || "support");

  const main = `
<article>
  <header class="hero hero--article">
    <div class="container">
      ${breadcrumbs(crumbs)}
      <div class="meta-row"><a class="tag tag--blue" href="@/blog.html?category=${post.card?.category || post.category}">${post.categoryLabel}</a><time datetime="${post.date}">${fmt(post.date)}</time><span>${post.read} min read</span></div>
      <h1 class="hero__title mt-5">${post.title}</h1>
      <p class="lead hero__lead">${post.excerpt}</p>
      <div class="person mt-6"><span class="avatar" aria-hidden="true">${post.author.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "WZ"}</span><span><span class="person__name">${post.author}</span><span class="person__role">WhizzIT</span></span></div>
      ${callbackForm({ track: `article-${post.slug}`, captchaTheme: "light" })}
      <div class="blog-card__art article-cover tone-${listed(post).tone}" aria-hidden="true">${blogArt(listed(post).icon)}</div>
    </div>
  </header>

  <div class="container article-layout">
    <div class="prose">
      ${renderEnquiries(post.body)}
      <h2 id="help">How WhizzIT can help</h2>
      <p>If you'd like a second opinion on any of this, our team is happy to talk it through. See our <a href="@/${svc.href}">${svc.title.toLowerCase().replace("it ", "IT ")}</a> service or <a href="@/contact.html">get in touch</a>.</p>

      <nav class="article-nav" aria-label="More articles">
        ${prev ? `<a href="@/blog/${prev.slug}.html" rel="prev"><span>Previous article</span>${prev.title}</a>` : "<span></span>"}
        ${next ? `<a href="@/blog/${next.slug}.html" rel="next"><span>Next article</span>${next.title}</a>` : ""}
      </nav>
    </div>

    <aside class="article-aside" aria-label="Article tools">
      <nav class="toc" aria-labelledby="toc-title">
        <h2 id="toc-title">In this article</h2>
        <ol>${post.sections.map((s) => `<li><a href="#${s.id}">${s.title.replace(/^\d+[.)]\s*/, "")}</a></li>`).join("")}<li><a href="#help">How WhizzIT can help</a></li></ol>
      </nav>
      <div class="card card--surface stack">
        <p class="h5"><strong>Related service</strong></p>
        ${serviceRow(svc)}
        ${btn("Book a consultation", "contact.html", { size: "sm", track: `article-${post.slug}-aside-cta` })}
      </div>
    </aside>
  </div>
</article>

<section class="section" aria-labelledby="related-articles-title">
  <div class="container">
    <h2 id="related-articles-title" class="h3">Related articles</h2>
    <div class="blog-grid mt-7">${related.map((p) => blogCard(listed(p))).join("")}</div>
  </div>
</section>

`;

  page({
    footerCta: {
      title: "Want help putting this into practice?",
      text: "Our engineers can review your setup and tell you what to prioritise.",
      cta: "Talk to an IT expert",
      track: `article-${post.slug}-final-cta`,
    },
    file,
    title: post.title,
    description: post.excerpt,
    bodyClass: "page--article",
    crumbs,
    ogType: "article",
    main,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        mainEntityOfPage: cleanUrl(file),
        author: { "@type": "Person", name: post.author },
        publisher: { "@type": "Organization", name: "WhizzIT", url: SITE.url },
      },
    ],
  });
});
