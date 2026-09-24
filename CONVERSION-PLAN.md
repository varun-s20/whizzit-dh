# Conversion plan — WhizzIT: static design build → WordPress

Status: revised 24 Sep 2026. The route is decided (**Elementor Pro**, with All-in-One WP Migration
for the moves). Nothing is built yet. Before the build starts, the blocking questions at the end
need answers, and the backup set in "Step 1" needs to exist.

## What we are doing, in one paragraph

The WordPress install at `staging.whizzit.co.uk` already holds every page and post, at the right
URL, in the right parent/child structure. We take a full backup, copy the site onto a **dev site on our own
Hostinger account**, and replace two things there: the **theme** (so every page renders our design) and the **content
of each page** (rebuilt as Elementor pages made from our own widgets, so the client edits fields,
not HTML). Pages keep their WordPress ID, slug and parent, so every URL stays exactly as it is. The
finished site goes back onto staging in one All-in-One WP Migration import. At launch the same
file goes onto `whizzit.co.uk`, replacing today's static site. Each move has a tested way back.

## What is there today (checked 23–24 Sep 2026)

| | Finding | Consequence |
|---|---|---|
| Live site | `https://whizzit.co.uk/` is a **static site** on Hostinger's CDN (not WordPress). `www` redirects to the bare domain. | Launch replaces static files with WordPress. Rollback restores the static files. |
| Live URLs | 97 URLs in the live sitemap. **All 97 exist on staging and in our build.** Staging adds privacy, cookies and thank-you, plus WordPress's own author and category archives. | No URL changes and no redirect map, apart from one WordPress archive (see SEO). |
| Staging | WordPress on Hostinger. 73 pages (hierarchical) and 27 posts at `/blog/<slug>/`, all posts in "Uncategorized". No custom post types. | Keep the permalink structure and the page tree. |
| Staging theme | `whizzit-theme`, a thin custom classic theme. Its CSS is at `/css/styles.css`, its images at `/images/` and its form endpoint at `/api/submit.php`, all **in the web root, outside WordPress**. | **All-in-One WP Migration does not back those folders up**; it only takes the database and `wp-content`. They need a separate backup (Step 1). |
| Plugins on staging | Hostinger's own set (onboarding, Reach, Tools, Amplitude) and LiteSpeed Cache. Elementor and All-in-One WP Migration are **not installed yet**. | Both get installed as part of the build. The licences are already held. |
| Licences held | **Elementor Pro**, **All-in-One WP Migration with the Unlimited Extension**. | Theme Builder, Pro Forms and full-site moves of any size are available. No ACF needed. |
| Media Library | Empty. Every image is a file in `/images/`. | Images get imported into the Media Library as part of the build. |
| Our build | 100 pages generated from `_build/` (Node): one stylesheet, one script, a component library in `lib.mjs` and `blocks.mjs`, and a structured model of every page's content (`parse.mjs`). | Each component becomes an Elementor widget. The content import is an export of that model. |

## Route: Elementor Pro, with our own widgets

| Layer | What it is | Holds |
|---|---|---|
| **Hello Elementor** | Parent theme (free, minimal) | Nothing of ours; never edited |
| **`whizzit-child`** | Child theme | Enqueues `styles.css` and `app.js` after Elementor's CSS (with `filemtime()` cache-busting), self-hosted fonts, and the neutraliser layer that stops Hello or Elementor defaults repainting the design |
| **`whizzit-core`** | Our plugin | The **WhizzIT widgets**, post types, site settings and the import command. It lives in a plugin so it survives a theme change |
| **Elementor Pro Theme Builder** | Site-wide templates | Header, footer, single blog post, blog archives, 404 |
| **Elementor pages** | One per page, 73 in total | Each page is a stack of WhizzIT widgets, filled with that page's content |

**Why our own widgets, not the HTML-paste method:** pasting each page into an HTML widget would mean
editing 100 pages of raw HTML ("frozen content"). Instead, each component in `lib.mjs` and
`blocks.mjs` becomes a widget in a "WhizzIT" panel:
- **Section widgets:** page hero, prose, checklist card, before/after pair, numbered cards, tabs,
  accordion, FAQ, faceplate stats, sub-service grid, reviews band, pricing panel and CTA band.
- **Page-signature widgets:** the home service stage, the About relief stage, keys and mission,
  the customer review wall, the industries directory and others.

Each widget has Elementor controls (text, image, repeaters) and renders **the same markup as the
static build**, so `styles.css` and `app.js` carry over unchanged. The client drags, reorders and
edits in Elementor's normal editor.

**Elementor setup (to stop defaults repainting the design):**
- **Hello and Elementor defaults:**
  - Site Settings → Layout: Default Colors off, Default Fonts off.
  - Hello's Theme Style off.
  - Settings → Advanced: Google Fonts disabled (we self-host).
  - Page title hidden on every page, so there is one `<h1>`.
- **Header container:** no Sticky or Motion Effects (they break our own sticky header).
- **Scoped reset:** a neutraliser in `styles.css`, scoped to our containers and placed before the
  component rules, so no `!important` is needed.

## Environment

| Item | Known | Needed |
|---|---|---|
| Host | Hostinger (staging and live) | — |
| Access | — | wp-admin administrator on staging (to install plugins and export); File Manager for the web-root backup |
| Plugin files | Licences held | Elementor Pro and All-in-One WP Migration Unlimited Extension `.zip` files, and the Elementor Pro licence key |
| Build copy | — | **A new WordPress site on our own Hostinger account** (a subdomain), seeded from the staging `.wpress`. It gives a real server to test mail and caching on, and a URL for client review. Search engines are discouraged on it. `wp-env` (Docker) remains a fallback |
| SSH on Hostinger | Not needed | The content import runs from a wp-admin screen (**Tools → WhizzIT import**) as well as WP-CLI |
| Elementor Pro licence | Held | Check how many sites it covers. If it covers one, disconnect it on the dev site before connecting it on the client's |

## Pages → templates

All 100 rows (WordPress ID, URL, title, template) are in `wordpress/page-map.csv`. "Template" here
means which widget stack the importer builds; in WordPress every page uses "Elementor Full Width".

| Family | Count | Example URL | Built from |
|---|---:|---|---|
| Home | 1 | `/` | Home hero + form, proof strip, service stage, … |
| Core pages | 9 | `/about/` | Each page's own signature widgets |
| Service overview | 5 | `/it-support/` | Page hero, faceplate, sections, sub-service grid |
| Sub-service | 30 | `/it-support/managed-it-support-services/` | Page hero, faceplate, section widgets from the page's content |
| Sector | 8 | `/managed-it-services-for-legal-firms/` | Page hero, sections |
| Location | 13 | `/locations/it-support-leeds/` | Page hero, sections, nearby locations |
| Case study | 4 | `/our-customers/ixia-clinical/` | Page hero, stats, sections |
| Legal / thank-you | 3 | `/privacy-policy/` | Text Editor widget (plain prose) |
| Blog post | 27 | `/blog/managed-it-services-2026/` | Theme Builder single-post template + the post's own content |

## Editable content (proposal: client to confirm)

| What | How | Fields | Where it appears | Volume |
|---|---|---|---|---|
| Blog posts | Native posts, **6 new categories** (Managed IT, IT Support, Cloud, Cyber Security, IT Strategy, Careers) | Title, body, excerpt, category, featured image, author | `/blog/`, articles, related posts, home insights | 27 and growing |
| Page copy | Elementor, WhizzIT widgets | Every heading, paragraph, list item, image and figure on the page | Every page | 73 pages |
| Case studies | **Stay as child pages** of Our Customers | Sector, client logo, stats, quote (widget controls) | `/our-customers/` (filterable), home, service pages | 4 |
| Sectors | **Stay as pages** | Photo, risk note, short description | `/industries/`, mega menu, home | 8 |
| Locations | Stay as pages | Area name, photo | `/locations/`, footer | 13 |
| Testimonials | Custom post type, no public URL | Quote, name, role, company, rating, photo | Review walls and sliders, About | 11 |
| Team | Custom post type, no public URL | Name, role, bio, photo, LinkedIn | About | 3 |
| Client, partner and credential logos | Custom post type, no public URL | Logo, name, link, type | Home, About, service pages | 19 (10 client, 7 partner, 2 credential) |
| Site settings | One options screen | Phone, email, offices, response line, Google rating/count/URL, the four headline stats | Header, footer, heroes, stat bands | 1 |
| Menus | Appearance → Menus; the header widget renders our mega-menu markup from it | Label, link, icon, group | Header, footer | 2 menus |
| Forms | Elementor Pro Forms (below) | Fields, recipients, success message | Every hero, Contact | 2 forms (+ home variant) |

**Stays fixed (not editable, by design):** the visual design itself: layout inside each widget,
animations, decorative SVGs.

**Two contract items conflict with "keep every URL", and URLs win:**
1. **Sectors as a custom post type.** The sector pages live at root-level URLs
   (`/managed-it-services-for-legal-firms/`), which a post type cannot produce cleanly. They stay
   pages, which gives the same editing experience in Elementor.
2. **Case studies as a post type with an archive.** The same reasoning applies: they stay child
   pages of `/our-customers/`, and that page lists and filters them.

## Content import (runs on the dev site)

1. **Export:** a new `_build/export-wp.mjs` writes one record per page and post, keyed by WordPress
   ID. Each record holds the page's widget stack with every widget's settings, the SEO title and
   description, and image references. It uses the same models the static build renders from, so
   the copy is exactly what the client approved in the preview.
2. **Import:** `wp whizzit import` (WP-CLI, in `whizzit-core`) writes each page's Elementor data
   (`_elementor_data`, edit mode, "Elementor Full Width", hidden title), SEO meta and featured
   image, **by ID**. It never changes slug, parent or ID. Posts get their clean article body, an
   excerpt, a category and a featured image.
3. **Then:** regenerate Elementor's CSS (`wp elementor flush-css`), open a sample of each family in
   the Elementor editor to confirm it loads and saves, and diff the rendered HTML against the
   static build.
4. **Media:** `wp media import` for the six WhizzIT photos, the stock photos (licences in
   `assets/images/stock/CREDITS.md`), and the logos, with alt text from `site.mjs`.
5. **Old content** stays in each page's revision history, so it remains retrievable.

## Plugins and themes

| Item | Why | Status |
|---|---|---|
| Elementor + **Elementor Pro** | Editor, Theme Builder, Forms, form submissions | Licence held; install |
| Hello Elementor | Minimal parent theme | Install |
| `whizzit-child` (ours) | Design assets, fonts, neutraliser | To build |
| `whizzit-core` (ours) | Widgets, post types, settings, importer | To build |
| Rank Math (free) | Titles, descriptions, sitemap, schema, **redirect manager** | Install |
| WP Mail SMTP or FluentSMTP | Form mail that actually arrives | Install |
| **All-in-One WP Migration + Unlimited** | Backups, and the dev ↔ staging ↔ live moves | Licence held; install |
| LiteSpeed Cache | Existing; keep. Exclude `app.js` and Elementor's JS from combine/defer, and test logged-out | Configure |
| Hostinger plugins | Existing; leave as they are | — |
| `whizzit-theme` (old) | Stays installed but inactive until two weeks after launch, so a revert has it | — |

## Forms

| Form | Where | Fields | Recipients |
|---|---|---|---|
| Request a callback | 96 pages (the home version adds a required phone number) | name, email, phone (home), message | ? (question 1) |
| Contact | `/contact/` | name, company, email, phone, message | ? |

**Recommended: Elementor Pro Forms.** Each form is built once as a saved template and dropped into
every hero, so there is one place to change it. What this gives the client:
- They change recipients and the success message themselves.
- Every submission is stored under **Elementor → Submissions**, so nothing is lost if an email is.
- reCAPTCHA and a honeypot field are built in.
- The success message matches staging's.
- The forms are styled in `styles.css` to match the design, so they look the same as the preview.

**The trade-off:** Elementor writes its own form markup, so we restyle that markup instead of
reusing ours, and Elementor's own validation replaces ours.

**Alternative:** a WhizzIT form widget with our exact markup and validation, plus a small handler
that stores enquiries in wp-admin. That gives pixel-for-pixel parity, but recipients are set in
our settings screen rather than Elementor's.

**Both routes need:** an SMTP plugin with a real sender at `@whizzit.co.uk`, SPF, DKIM and DMARC
passing on a real send, and the reCAPTCHA key listing `whizzit.co.uk`.

## SEO

- **Permalinks:** keep `/blog/%postname%/` and the page hierarchy.
- **Titles and descriptions:** imported from our build into Rank Math.
- **Schema:** the Organization and BreadcrumbList data comes from Rank Math only; the child theme
  emits no duplicate.
- **Redirects:**
  - `/blog/category/uncategorized/` → `/blog/`. It empties once posts move to real categories.
  - The six new category archives, under `/blog/category/…`, are new URLs rather than changed ones.
  - Nothing else needs a redirect, because every live URL is unchanged.
- **Indexing:** `thank-you-london` is noindex. Staging keeps "Discourage search engines" on; it is
  turned off only on the live domain.

## The workflow, step by step

### Step 1 — Backups (the revert point), before anything is touched

1. **All-in-One WP Migration export of staging:** install the plugin and the Unlimited Extension,
   export to a file, then **download the `.wpress` file and keep it off the server** (OneDrive or
   Drive).
2. **Web-root folders outside WordPress:** zip `/css`, `/images`, `/js` (if present) and `/api` in
   Hostinger's File Manager and download the zip. The current theme depends on them, and the
   `.wpress` file does not contain them.
3. **Hostinger's own full backup** (hPanel → Backups) as a second, independent copy.
4. Write down the plugin list and versions.
5. The first import into the dev site (Step 2) **is the restore test**: if staging comes back up
   on the dev site and looks right, the backup is proven.

**Content freeze:** from the Step 1 export until cut-over, nobody edits staging. An import replaces
the whole site, so edits made in between would be lost.

### Step 2 — Dev site on our Hostinger account

1. Create a WordPress site on a subdomain of our account, with PHP 8.1 or later and "Discourage
   search engines" on.
2. Install All-in-One WP Migration and Unlimited, then import the staging `.wpress`. The dev site
   is now an exact copy of staging, with the same IDs, URLs and users.
3. Unzip the web-root folder backup into the dev site's `public_html`, so the old design renders.
   This proves the backup set restores.
4. Add our own admin user, then install Elementor, Elementor Pro and Hello Elementor.

### Step 3 — Build (in this repo, installed on the dev site)

1. Child theme, plugin and widgets.
2. Theme Builder: header, footer, single post, archives and 404.
3. The two forms, Rank Math, SMTP settings (tested for real on staging) and media.
4. Run the content import.

### Step 4 — Verify (dev site)

- All **102 staging URLs** return 200 with the new design (list in `_source/urls.txt`; the live 97
  are a subset).
- Static checks: no duplicate IDs, one `<h1>` per page, every image has alt text, no links pointing
  to the dev or staging domain.
- Rendered HTML diffed against the static build for a sample of each family.
- Every widget opens, edits and saves in Elementor.
- A logged-out browser pass on phone and desktop.

### Step 5 — Onto staging

1. Take a fresh export of staging.
2. Export the dev site and import that `.wpress` into staging. The plugin rewrites the dev URLs to
   the staging URLs itself.
3. Then:
   - Log in with the dev site's admin accounts; the import brings its users. These are staging's
     own users plus ours, so remove ours after handover.
   - Settings → Permalinks → Save, twice.
   - Elementor → Tools → Regenerate CSS & Data.
   - Reconnect the Elementor Pro licence.
   - Purge LiteSpeed.
4. Re-verify the URL list and send a real test of each form.
5. Client review can happen on the dev site before this step, or on staging after it.
   Corrections made on the dev site move up the same way; once staging is live-ready and unfrozen,
   they are edited there directly.

**Revert:** import the Step 1 `.wpress`. The web-root folders are never deleted during the build,
so the old theme finds its CSS and images again. If anything is missing, restore the zip.

### Step 6 — Launch on `whizzit.co.uk`

1. Freeze edits.
2. **Zip the static site's whole `public_html` and download it.** This is the rollback.
3. Empty `public_html`, then install WordPress on `whizzit.co.uk` and add All-in-One WP Migration
   and Unlimited. A static `index.html` left behind would be served instead of WordPress, so it has
   to go.
4. Export staging and import that `.wpress` onto `whizzit.co.uk`. The URLs are rewritten
   automatically.
5. Then:
   - SSL on the bare domain, with `www` redirecting to it.
   - Save permalinks twice, regenerate Elementor's CSS, reconnect the Elementor Pro licence.
   - Purge LiteSpeed and any CDN.
6. Turn search-engine visibility on, submit the Rank Math sitemap in Search Console, re-run the
   97-URL check on the live domain, and test both forms.
7. **Rollback:** clear `public_html` and unzip the static site back into it. Keep that zip, and the
   inactive old theme, for at least two weeks.

## Assumptions (made without the client; each is one edit to change)

- Staging's page tree and slugs are the approved URL structure. Checked: they match the live
  sitemap exactly.
- Rank Math over Yoast, because its free tier includes the redirect manager.
- Fonts are self-hosted.
- One owner edits after handoff, and is not technical.
- English only, target WCAG 2.1 AA, no e-commerce.

## Open questions

**Blocking:**
1. **Forms:**
   - Elementor Pro Forms (recommended) or our own form widget?
   - Which email addresses get enquiries?
   - Which mail provider is used (Microsoft 365, Google)?
   - Who controls DNS, for SPF, DKIM and DMARC?
2. **Access and files:**
   - wp-admin administrator on staging.
   - The dev site URL (and a login for it, if it is password-protected), so we can run checks against it.
   - Who runs the Step 1 backups: you, or us with access?
3. **Editable content:** confirm the table above, including keeping sectors and case studies as
   pages to protect their URLs.
4. **Launch:**
   - Does WordPress replace the static site on `whizzit.co.uk`, on the same Hostinger account?
   - What is the target date?
   - Who signs off?

**Non-blocking (defaults above apply unless told otherwise):**
- Search Console and Analytics access
- Cookie consent tool
- Post-launch maintenance or a clean handoff
- Whether the remaining `_source/GAPS.md` items (Google reviews widget, video testimonials, remote
  support link, booking URL) are in this phase
