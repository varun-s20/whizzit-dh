# WhizzIT website — static design build

A complete static rebuild of whizzit.co.uk in the approved design direction. Plain HTML5, CSS3 and vanilla
JavaScript: no frameworks, no runtime dependencies. It is the design preview that the WordPress build will be
based on, so the URL structure matches the current site exactly.

- **One stylesheet:** `assets/css/styles.css`
- **One script:** `assets/js/app.js`
- **One HTML file per page** — 100 pages, generated from `_build/`

```bash
node _build/build.mjs     # Node 20+; no npm install needed
```

---

## Where the content came from

Every word, logo, photo, review, phone number and URL on this site was taken from
**https://staging.whizzit.co.uk** (pulled 18 September 2026) and is stored in `/_source`:

| File | What it holds |
|---|---|
| `_source/wp-pages.json` | All 73 WordPress pages, full markup |
| `_source/wp-posts.json` | All 27 blog posts, full markup |
| `_source/content/*.md` | A readable dump of each of the 102 crawled URLs |
| `_source/urls.txt` | The sitemap crawl |
| `_source/GAPS.md` | Gap analysis: what the client still has to supply |

Nothing on the site is invented copy. The few unverified items are marked in amber
(`[like this]`) so they are easy to find before launch.

---

## Page inventory (100 pages)

| Group | Count | Built by |
|---|---|---|
| Home, About, IT Services, Industries, Our Customers, Blog, Contact | 7 | one module each in `_build/pages/` |
| Service overviews: IT Support, Managed Cloud, Cyber Security, Network Management, IT Project Management | 5 | one module each — each with its own layout |
| IT Support London | 1 | `pages/london.mjs` |
| Sub-services (3 + 7 + 10 + 5 + 5) | 30 | `pages/subpages.mjs` |
| Industry pages | 8 | `pages/subpages.mjs` |
| Location pages + locations index | 14 | `pages/subpages.mjs` |
| Case studies | 4 | `pages/subpages.mjs` |
| Blog articles | 27 | `pages/articles.mjs` |
| Cloud Services London, Thank you, Privacy, Cookies | 4 | `pages/subpages.mjs`, `pages/templates.mjs` |

The 13 core pages each have a distinct layout, as agreed. Sub-pages share a template per family
(sub-service, industry, location, case study) built from the same component set.

---

## How the generator works

```text
_build/
├── build.mjs        Runs every module in pages/
├── site.mjs         All site data: contact details, services, sectors, locations,
│                    clients, partners, reviews, team, stats, credentials
├── content.mjs      Reads the WordPress export; parses the 27 blog posts; rewrites
│                    staging URLs to local ones
├── parse.mjs        Turns a staging page's markup into a block model
│                    (hero, prose, checklists, cards, tabs, FAQs)
├── blocks.mjs       Renders that block model with the new components, plus the
│                    shared page furniture (hero, sub-service grid, reviews, pricing)
├── lib.mjs          Layout shell: header, mega menu, drawer, footer, buttons, cards
├── icons.mjs        Single icon family + the WhizzIT logo
├── visuals.mjs      Decorative SVGs
└── pages/*.mjs      One module per page or page family
```

Internal links are written as `@/path.html` and resolved per page depth at build time. The build throws if a
link cannot be resolved, and `_source/GAPS.md` records the link audit (currently 12,446 internal links, 0 broken).

### Adding or changing content

- **Contact details, services, sectors, locations, reviews, team:** edit `_build/site.mjs`.
- **A new sub-service page:** add it to the parent's `children` in `site.mjs`. If a matching staging page
  exists in `_source/wp-pages.json`, the content is picked up automatically.
- **A new blog post:** add it to `_source/wp-posts.json` in the same shape; the index, filters and article
  page are generated from it.
- **A new core page:** copy the closest module in `_build/pages/` and compose from `blocks.mjs`.

---

## Design system

- **Fonts:** Urbanist (headings and body), Figtree (buttons, navigation, small UI labels), loaded from Google Fonts.
- **Colour:** `--color-primary` #1F6BFF (actions) · `--color-navy` #0A2F7A (secondary actions, tabs, ticks) ·
  `--color-night` #0A0B0D (footer) · sky gradient heroes · near-white surfaces.
- **Headings** use a dark-to-slate gradient (`.grad-head`) at weight 500.
- **Buttons** are pills; cards use 14–28px radii and cool low-opacity shadows.
- **Header** is two rows. The utility strip (desktop only, ≥1100px, collapses on
  scroll) carries the response line, phone and email. The bar below it holds the
  logo, five mega triggers plus a direct Contact link, then the theme switch and
  the booking CTA. The phone number lives in the strip only, not in both.
  The page links the strip used to hold (Home, About, Our Customers,
  Blog, Locations, Contact) are all reachable from the bar itself. The current
  section is marked by a short rule under the trigger, not a filled pill.
- **Heading widths.** A heading gets the width it needs; its body gets the width it
  can be read at. Capping a whole head block at one narrow measure breaks the
  heading onto a second line while the rest of the row sits empty, so the caps live
  on the paragraph (`68ch`) and the heading runs wide with `text-wrap: balance`.
  This applies to `.center-head`, a `.block-head` that spans its container,
  `.bar-head` and the article hero. A `.block-head` inside one column of a split
  layout keeps its 34ch measure, because the column is already narrow.
  `narrow.mjs`-style check: no heading on any of the 100 pages now wraps inside a
  box narrower than 80% of its parent.
- **Heading/body alignment.** A centred head always sits over centred body copy and
  a left head over left body copy — never one of each. Statement and card blocks in
  `blocks.mjs` both pass `center: true`, and a single-paragraph `.prose-cols` drops
  out of two columns so it cannot strand itself in the left column.
- **Reviewer avatars** (`reviewAvatar()` in `lib.mjs`) use the reviewer's photo when
  one is on file, initials otherwise. Initial colours are derived from the name and
  held inside the palette's cool band, so each reviewer keeps a stable colour
  without the wall turning into a colour wheel. A Google glyph marks the review as
  verified rather than collected by us.

### Dark theme

`styles.css` ends with one `:root[data-theme="dark"]` block. There is no second
copy and no `prefers-color-scheme` duplicate: an inline script in `<head>`
(`lib.mjs`) resolves the theme before first paint from the stored choice, falling
back to the OS setting, so there is no flash. `app.js` wires the switch in the
header and the drawer, persists the choice to `localStorage`, and keeps following
the OS until the visitor picks a side. Without JavaScript the site renders light.

Three tokens exist only because a name cannot mean two things at once:

| Token | Why |
|---|---|
| `--color-always-white` | `--color-white` is the *raised card surface* and goes dark in the dark theme. Text sitting on a coloured or dark fill must not follow it — that is how footer headings and button labels went dark-on-dark. |
| `--color-navy-fill` | `--color-navy` is a *text* colour and lightens in dark. The five places that use navy as a solid fill behind white text need it to stay dark. |
| `--color-primary-ink` | Brand blue `#1f6bff` is only 4.29:1 on white. Fills keep the brand colour; small text uses `#1560eb`. |

Vendor and accreditation logos are dark artwork on transparent backgrounds, so in
dark mode they sit on a light plate rather than disappearing.

Anything that varies with the theme is a token rather than a
`[data-theme="dark"] .thing` override, so components follow the palette on their
own: `--photo-filter`, `--logo-plate`, `--tile-gloss`, `--tile-ring`,
`--color-primary-fill`, `--icon-tile-neutral`, `--num-stroke`, `--quote-mark`,
`--bar-track`, `--svc-icon-bg`. Prefer that pattern for anything new.

### Responsive

Mobile-first, verified at 320 / 360 / 390 / 430 / 540 / 768 / 1024 / 1280 / 1440 /
1920. Across all 100 pages there is no horizontal page overflow and no element
breaking out of the viewport at any of those widths, in either theme.

Three fixes worth knowing about, because each was a class of bug rather than a
one-off:

- `.primary-nav + .site-header__actions { margin-left: 0 }` was unscoped, and the
  nav is `display:none` below 1100px — so the rule still matched and the menu
  button floated mid-bar on every phone and tablet. It now lives inside the
  desktop breakpoint.
- At 320px the full header (150px wordmark, theme switch, labelled Menu button)
  was wider than the viewport and pushed every page 21px sideways. The compact
  header — 26px wordmark, icon-only menu button — is the base; the roomier one
  returns at 400px.
- Tables in article prose are wrapped in `.table-scroll` by `content.mjs`. The
  wrapper needs `min-width: 0` on itself *and* on its grid ancestors: a grid item
  defaults to `min-width: auto`, so `overflow-x: auto` never fires and the table
  drags the page sideways instead.

### Per-page signatures

The pages deliberately do not share a rhythm:

| Page | Signature |
|---|---|
| Home | Live monitoring stage in the hero; industries as photo-led cards |
| About | Photo stack hero; values run down a ruled spine with oversized numerals, not a card grid |
| Our Customers | Centred rating statement over a true masonry wall of every review; no boxed aside |
| Industries | Sector directory with per-sector risk notes |

Three of the thirteen core pages now carry a distinct structural signature. The
remaining service and location pages still share the two-column `pageHero` and are
the next candidates.
- **Client logos** are white artwork, so they always sit on the dark `.client-band`.
- `styles.css` is ordered: tokens → reset → base → a11y → layout → header → buttons → components → cards →
  forms → sections → page modifiers → footer → animation → responsive → reduced motion → home → about →
  inner pages → service pages → the remaining core pages.

**Open decision:** the palette follows the approved reference direction (blue), while the WhizzIT logo is
orange/charcoal. Confirm whether orange becomes a secondary accent — it is a token change in one place.

---

## JavaScript

`app.js` swaps `no-js` for `js`, then runs each initialiser on `DOMContentLoaded`; each returns early when its
component is absent. Everything renders without JavaScript.

| Initialiser | Behaviour |
|---|---|
| `initHeader` | Scrolled header state via an IntersectionObserver sentinel |
| `initMegaMenu` | Click/keyboard mega menu, hover intent for mouse users, Escape closes |
| `initMobileNavigation` | Drawer with focus trap, `inert` background, accordion groups |
| `initTabs` | WAI-ARIA tabs (About, service pages) |
| `initFilters` | Blog topic filters with `?category=` deep links |
| `initRails`, `initQuotes` | Review rails and the homepage testimonial slider |
| `initCounters` | Stat bands count up once in view. `STATS` carries `count`/`suffix`; the final value is already in the markup |
| `initRevealAnimations` | Scroll reveal. Tags targets itself so no template repeats the attribute |
| `initForms` | Accessible validation, error summary, success state |

### Scroll reveal

`markRevealTargets()` walks every `section.section` / `section.block` and tags its
container's children with `data-reveal`. Where a child is a grid of cards
(`REVEAL_GROUPS`) the cards are tagged individually, so a row cascades instead of
arriving as one slab. Heroes and long-form prose (`.prose`, `.container--copy`,
`.article-body`) are skipped — above-the-fold content should not wait on a scroll,
and revealing a privacy policy a paragraph at a time makes it harder to read.

Motion is opacity + `translateY(14px)` only, 520ms on `--ease-out`, with a 55ms
stagger that stops compounding after five steps. Each element reveals once and is
then unobserved. Under `prefers-reduced-motion`, and with JavaScript off,
everything is simply visible.

**Forms are in demo mode** (`data-demo`). Point them at the WhizzIT endpoint and add the reCAPTCHA keys
before launch.

---

## Images

`assets/images/` holds the real assets pulled from staging:

- `brand/` — `whizzit-logo.svg` (white, for dark surfaces), `whizzit-logo-black.svg` (light surfaces), favicons
- `partners/` — 7 vendor and accreditation logos
- `clients/` — 10 client logos (white artwork; keep them on dark)
- `photos/` — 6 photographs, each as AVIF + WebP at 480/768/1024/1280

Use the `photo()` helper in `lib.mjs` for responsive `<picture>` markup. More photography is needed so that
pages stop reusing the same six images — see `_source/GAPS.md`.

---

## Accessibility

Skip link, landmarks, one `<h1>` per page, visible focus styles, keyboard-operable menus, tabs and
accordions, labelled fields with `aria-describedby` errors, decorative SVGs hidden from screen readers,
`prefers-reduced-motion` support and 44px touch targets. Checked at 390px and 1440px: no horizontal scroll and
no console errors on any page.

---

## SEO

Every page has a unique title, meta description, canonical URL, Open Graph/Twitter tags and JSON-LD
(Organization everywhere; BreadcrumbList, Service and Article where relevant). **URLs match staging exactly.**
FAQPage and LocalBusiness schema are not included yet — they need the client's opening hours and confirmed
answers.

Canonicals use clean routes (`/it-support/`) on `SITE.url`; files use `.html` locally. For production, enable
pretty URLs on the host or fold the output into `index.html` files per folder.

---

## Before launch

See `_source/GAPS.md` for the full list. The blocking items are: brand-colour decision, form endpoint and
reCAPTCHA keys, booking and remote-support URLs, live Google reviews widget, video testimonials, more
photography, and the company registration details for the footer and legal pages.
