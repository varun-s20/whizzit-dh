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

- **Direction:** bold and photo-led, after the client pointed at boldit.co.uk. Same palette as before; what
  changed is weight, contrast and layout.
- **Fonts:** Urbanist 400–800 (headings and body), Figtree 500–700 (buttons, navigation, small UI labels),
  loaded from Google Fonts.
- **Colour:** `--color-primary` #1F6BFF (actions) · `--color-navy` #0A2F7A (secondary actions, tabs, ticks) ·
  `--color-heading` #0A1628 (headings) · `--color-night` #0A0B0D (footer) · near-white surfaces ·
  `--brand-orange` #EC7C20 → `--brand-ember` #CB3829 (the logo's gradient, accent only; see below).
- **Headings** are solid heading-ink at weight 800 with tight tracking. `.grad-head` keeps its name but no
  longer fades; hero titles put their second half in a cyan-to-blue gradient.
- **Light only.** There is no dark mode and no theme switch. A few surfaces are dark by design — every
  `.hero--sky` hero, the header while it floats over one, and any `.section--ink` band — and they get there by
  re-declaring the colour tokens (section 28 of `styles.css`), so components inside them need no overrides.
- **Inner-page heroes** (`pageHero()` in `blocks.mjs`) are one column: breadcrumbs, headline across the full
  row, lead, the callback form, a call line. Whatever used to sit in a side column runs full width beneath as a raised "faceplate":
  proof figures (`heroProof()`, each with a status light that switches on at load), London's coverage panel,
  the IT services index as five tiles, or the blog's featured article. The headline gets one light sweep on
  load. They end in a wide feature photo that overlaps the hero's foot and the section below. Service pages
  get their service's photo; industry, location and case-study pages pass their own; the blog index opts out
  with `feature: false`. Inner-page sections use a tighter rhythm than the homepage (40–64px).
- **Callback form** (`callbackForm()` in `lib.mjs`, section 31 of `styles.css`): the live site's "Request a
  callback" form, on the same 96 pages that carry it there (every page but Contact, Privacy, Cookies and Thank
  you). Same fields, copy and endpoint contract as staging: POST `/api/submit.php`, `form_name=callback`, the
  `botcheck` honeypot. On the home page it sits beside the headline on frosted glass (from 1024px), as on the
  live site; elsewhere it runs under the lead. The home form also asks for a phone number (required;
  `callbackForm({ phone: true })`), which staging's form does not, so the endpoint must accept `phone`. It replaces the hero's button pair; the phone moves to the line beneath it
  (`heroNote()`). It lays itself out by its own width with container queries: one column, two, or one row.
  `data-demo` shows the success state in place until the endpoint and reCAPTCHA are wired (GAPS #6).
- **Relief** (section 30 of `styles.css`) is the shared surface language for the About page and the inner
  heroes: pressed metal lit from the top left, raised things highlighted on their top edge, engraved things
  the reverse. Motion is light and pressure, and every animation is off under reduced motion.
- **Buttons** are squared (`--radius-sm`): blue primary, heading-ink outline secondary. Cards use 14–28px radii.
- **Closing CTA** (`ctaBand()` in `lib.mjs`, also used for the footer CTA) is a split card: photo on one side,
  navy-to-signal gradient on the other.
- **Header** is two rows. The utility strip (desktop only, ≥1100px, collapses on
  scroll) carries the response line, phone and email. The bar below it holds the
  logo, five mega triggers plus a direct Contact link, then
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

### Colour tokens

Three tokens exist only because a name cannot mean two things at once:

| Token | Why |
|---|---|
| `--color-always-white` | `--color-white` is the *raised card surface* and goes dark on the dark surfaces. Text sitting on a coloured or dark fill must not follow it — that is how footer headings and button labels went dark-on-dark. |
| `--color-navy-fill` | `--color-navy` is a *text* colour and lightens on dark surfaces. The five places that use navy as a solid fill behind white text need it to stay dark. |
| `--color-primary-ink` | Brand blue `#1f6bff` is only 4.29:1 on white. Fills keep the brand colour; small text uses `#1560eb`. |

Anything that has to differ on a dark surface is a token rather than an override, so
components follow the palette on their own: `--photo-filter`, `--logo-plate`,
`--tile-gloss`, `--tile-ring`, `--color-primary-fill`, `--icon-tile-neutral`,
`--num-stroke`, `--quote-mark`, `--bar-track`, `--svc-icon-bg`. Prefer that pattern
for anything new.

### Responsive

Mobile-first, verified at 320 / 360 / 390 / 430 / 540 / 768 / 1024 / 1280 / 1440 /
1920. Across all 100 pages there is no horizontal page overflow and no element
breaking out of the viewport at any of those widths.

Three fixes worth knowing about, because each was a class of bug rather than a
one-off:

- `.primary-nav + .site-header__actions { margin-left: 0 }` was unscoped, and the
  nav is `display:none` below 1100px — so the rule still matched and the menu
  button floated mid-bar on every phone and tablet. It now lives inside the
  desktop breakpoint.
- At 320px the full header (150px wordmark, labelled Menu button)
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
| Home | Photo hero (headline and actions only) with a proof strip overlapping its foot and the intro paragraph set large beneath it; services as a ruled list on an ink band beside a sticky, scroll-driven stage; case studies as photo tiles. About, reviews slider, industry cards, pricing/FAQ and partners keep their original layouts |
| About | Centred hero: a two-line headline that comes into focus, its promise ("that puts clients first.") on a raised metal nameplate that a band of light crosses once. Beneath it, three of WhizzIT's own photos dealt out as raised plates with a 5.0 rating medallion (tilt with the pointer). Values are four keycaps in a recessed tray, typed in turn when they scroll into view (`data-on-view` in `app.js`). The mission is one centred steel card: a slim 4:1 team photo in a recessed window, a quote medallion on its edge, then the statement in solid engraved type, with no fade or light sweep over it. Only the photo drifts as the card scrolls |
| Our Customers | Centred rating statement over a true masonry wall of every review; no boxed aside |
| Industries | Sector directory with per-sector risk notes |

Three of the thirteen core pages carry a distinct structural signature. The service,
location and other inner pages share the one-column `pageHero`. Contact keeps its
form beside the copy, because the form is the page's job.
- **Client logos** are white artwork, so they always sit on a dark surface: the homepage hero, or `.client-band`
  elsewhere.
- `styles.css` is ordered: tokens → reset → base → a11y → layout → header → buttons → components → cards →
  forms → sections → page modifiers → footer → animation → responsive → reduced motion → home → about →
  inner pages → service pages → the remaining core pages → relief (About, stacked heroes).

**Brand orange (decided 23 Sep 2026):** the client asked for their orange, kept subtle. It is the logo's own
gradient, exactly: `--brand-orange` #EC7C20 into `--brand-ember` #CB3829 (`--brand-flame`). It appears as an
accent only, in the role of a brand mark: the mark before every eyebrow, the current-page rule in the nav, the
About nameplate, the lit edge of the callback form and of each "By the numbers" figure, the phone icon in the
hero call line, quote marks, card numbers (in ember, which passes AA on white), a faint glow in the corner of
every dark hero, and the footer's top rule. Actions stay blue, and orange never carries body text on white
(#EC7C20 is 2.9:1).

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
| `initRails`, `initQuotes` | Review rails, and the homepage testimonial slider |
| `initCounters` | Stat bands count up once in view. `STATS` carries `count`/`suffix`; the final value is already in the markup |
| `initRevealAnimations` | Scroll reveal. Tags targets itself so no template repeats the attribute |
| `initServiceStage` | Homepage services, desktop only: the row crossing mid-viewport becomes active and takes the sticky stage in its service tone; `--svc-progress` drives the rail and the parallax drift. Listens to scroll only while the band is on screen |
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
