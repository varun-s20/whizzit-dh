// Sub-service pages (30). Built the way the five service pages are: the dark
// hero with the callback form and the proof strip, then the page's own story
// told with photographs and a component for each kind of content, so no copy
// sits in a plain run of text boxes.
//   overview   the opening copy beside the page's own photograph, then
//              "what's included" as a run of ticks
//   tabs       copy beside a tab panel        steps    a numbered path
//   compare    before / after, side by side   case     a dark case-study band
//   trust      the figures as chips beside a large review
//   cards      numbered points on hairlines (no boxes)
//   table      a comparison, the last column (WhizzIT's way) highlighted
//   story      prose beside a second photograph, alternating sides
//   then the credentials, the FAQ, related reading, partners and the other
//   services in the family.
// Every word comes from the page's staging export (section-parse.mjs); the
// closing call to action carries the page's own copy into the footer card.
import { page, btn, icon, breadcrumbs, statStrip, SITE, SERVICES } from "../lib.mjs";
import { R, kindOf, slugOf } from "../sections.mjs";
import { pageByPath, plainText } from "../content.mjs";
import { parseSections } from "../section-parse.mjs";
import { pageHero } from "../blocks.mjs";

SERVICES.forEach((parent) => {
  parent.children.forEach((child) => {
    const source = pageByPath(`/${child.href.replace(/\.html$/, "/")}`);
    if (!source) return;
    const { hero, sections } = parseSections(source.html);
    const slug = slugOf(child.href);
    const ctx = { slug, tone: parent.tone, parent, child, n: 0, storyCount: 0 };

    const crumbs = [
      { title: "Home", href: "index.html" },
      { title: "IT Services", href: "it-services.html" },
      { title: parent.title, href: parent.href },
      { title: child.title },
    ];

    let contentIndex = 0;
    const body = sections.map((s) => {
      ctx.n += 1;
      const id = `${slug}-s${ctx.n}`;
      if (s.kind === "content") {
        if (!s.flow.length && !s.lists.length && !s.cards.length && !s.tabs.length && !s.steps.length && !s.quotes.length && !s.stats.length && !s.tables.length) return "";
        return R[kindOf(s, contentIndex++)](s, id, ctx);
      }
      if (s.kind === "ctaBand" || s.kind === "note") return "";
      return R[s.kind] ? R[s.kind](s, id, ctx) : "";
    }).join("\n");

    const band = sections.find((s) => s.kind === "ctaBand");
    const note = sections.find((s) => s.kind === "note" && /written and maintained/i.test(s.text));
    const faq = sections.find((s) => s.kind === "faq");
    const siblings = parent.children.filter((c) => c.href !== child.href);

    const main = `
${pageHero({
      eyebrow: parent.title,
      title: hero.title || child.title,
      lead: hero.lead,
      crumbs: breadcrumbs(crumbs),
      cls: `hero--tone-${parent.tone} sv-hero`,
      aside: statStrip({ compact: true, track: `${slug}-hero` }),
    })}
${body}

<nav class="section section--mist sv-family" aria-labelledby="${slug}-family-title">
  <div class="container">
    <div class="sv-family__head">
      <div>
        <p class="eyebrow">${parent.title}</p>
        <h2 class="grad-head" id="${slug}-family-title">More ${parent.title.replace(/ services$/i, "")} services</h2>
      </div>
      ${btn(`All ${parent.title}`, parent.href, { variant: "secondary", arrow: false, track: `${slug}-family-all` })}
    </div>
    <ul class="sv-family__list tone-${parent.tone}" role="list">
      ${siblings.map((c) => `<li><a href="@/${c.href}"><span class="sv-family__icon" aria-hidden="true">${icon(parent.icon)}</span><span>${c.title}</span>${icon("arrow")}</a></li>`).join("")}
    </ul>
    ${note ? `<p class="sv-family__note">${note.text}</p>` : ""}
  </div>
</nav>
`;

    const schema = [{
      "@context": "https://schema.org",
      "@type": "Service",
      name: hero.title || child.title,
      serviceType: parent.title,
      description: hero.lead,
      provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
      areaServed: "GB",
    }];
    if (faq?.items?.length) {
      schema.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plainText(f.a) } })),
      });
    }

    page({
      footerCta: {
        title: band?.title || `Talk to us about ${child.title}`,
        text: band?.text || `Tell us what you need and we'll tell you what we'd do. ${SITE.responseLine}, and no obligation.`,
        track: `subservice-${slug}`,
      },
      file: child.href,
      title: `${hero.title || child.title} | ${parent.title}`,
      description: hero.lead && hero.lead.length > 40 ? hero.lead : `${child.title} from WhizzIT, part of our ${parent.title.toLowerCase()} service for UK businesses.`,
      bodyClass: `page--service page--subservice page--sky tone-${parent.tone}`,
      crumbs,
      main,
      schema,
    });
  });
});
