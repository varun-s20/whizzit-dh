# WhizzIT redesign — content capture + gap analysis

Source: https://staging.whizzit.co.uk — pulled 18 September 2026 (WordPress REST API + HTML crawl).
Everything captured lives in `/_source` (content dumps, WP JSON) and `/assets/images` (logos, partner marks, photography).

---

## 1. What we captured

| Item | Count | Where it landed |
|---|---|---|
| URLs in the sitemap | 102 | `_source/urls.txt` |
| Pages (WordPress `page`) | 73 | `_source/wp-pages.json` |
| Blog posts, with full bodies | 27 | `_source/wp-posts.json` → parsed by `_build/content.mjs` |
| Readable content dumps (one per URL) | 102 | `_source/content/*.md` |
| Brand logo files | 2 (+4 favicons) | `assets/images/brand/` |
| Partner / accreditation logos | 7 | `assets/images/partners/` |
| Client logos | 10 | `assets/images/clients/` |
| Photography (AVIF + WebP, 4 widths) | 6 images / 44 files | `assets/images/photos/` |

**Business facts now wired into the build** (`_build/site.mjs`): phone 020 4634 2518, info@whizzit.co.uk,
London + Stevenage offices, LinkedIn, Google rating 5.0 across 15 reviews, the four headline stats,
11 verified reviews with names and roles, the three-person team with bios, 5 services + 30 sub-services,
8 sectors, 14 locations, 4 case studies.

---

## 2. Build status — complete

**All 100 pages now build** (`node _build/build.mjs`). Link audit: 12,446 internal links, **0 broken**.
Checked at 1440px and 390px: no horizontal scroll, no console errors.

| Page | Staging URL | Status |
|---|---|---|
| Home | `/` | Redesigned, real content |
| About | `/about/` | Redesigned — team bios, values, stats band |
| IT Services | `/it-services/` | Redesigned — five pillar rows indexing all 30 sub-services |
| Industries | `/industries/` | Redesigned — sector directory with per-sector risk notes |
| Our Customers | `/our-customers/` | Redesigned — 11 real reviews, 4 case studies |
| Blog | `/blog/` | Redesigned — featured post, topic filters, 27 real articles |
| IT Support | `/it-support/` | Redesigned — remote vs on-site comparison |
| Managed Cloud Services | `/managed-cloud-services/` | Redesigned — platform cards + migration journey |
| Cyber Security | `/cyber-security/` | Redesigned — layered-defence stack + Cyber Essentials feature |
| Network Management | `/network-management/` | Redesigned — monitoring panel |
| IT Project Management | `/it-project-management/` | Redesigned — four-stage delivery spine |
| IT Support London | `/locations/it-support-london/` | Redesigned — coverage card, areas served |
| Contact | `/contact/` | Redesigned — form beside the two offices |

**Sub-pages, all generated from the real staging content:** 30 sub-services · 8 industries · 13 further
locations + the locations index · 4 case studies · 27 blog articles · Cloud Services London · Thank you ·
Privacy · Cookies.

---

## 3. Gaps the client has to fill (nothing on staging to work from)

| # | Gap | Why it matters | Blocking |
|---|---|---|---|
| 1 | **Brand colours.** The real logo is orange/charcoal; the approved `/ref` direction is blue | Every page inherits this. Orange accent + blue, or blue only? | Yes — affects all 13 designs |
| 2 | **Video testimonials** (in scope) | None exist on staging. Needs filming or dropping from scope | Yes |
| 3 | **Live Google reviews widget** (in scope) | Needs Place ID + API key, or a paid widget (Elfsight/Trustindex) | Yes |
| 4 | **Remote support portal URL** (sticky header in scope) | No such link exists on staging | Yes |
| 5 | **Booking page / scheduler URL** (sticky header in scope) | Staging CTAs all point at `/contact/` | Yes |
| 6 | **Form endpoint + reCAPTCHA keys** | Staging posts to `/api/submit.php`; our build is demo-only | Yes, before launch |
| 7 | **Company number, registered address, VAT** | Footer, legal pages, LocalBusiness schema | Before launch |
| 8 | **Opening hours + SLA wording** | Location pages, schema, support pages | Before launch |
| 9 | **More photography** | Only 6 photos exist for 13 distinct page designs | Yes — designs will repeat otherwise |
| 10 | **Case-study depth** | 4 studies, no measurable outcomes; scope says filterable case studies with detail pages | Yes |
| 11 | **Team headshots** | Names, roles and bios are live on the About page; photos are still initials | Nice to have |
| 12 | **Author photo and bio for Billy Carey** | His name now appears on all 27 articles; no photo or author page yet | Nice to have |
| 13 | **Accreditation evidence** | Cyber Essentials certificate number/expiry; partner-logo usage permission | Before launch |
| 14 | **Pricing position** | Staging says "no rigid packages", so the `/ref` pricing table has no source data. Home now shows the real "pricing built around your business" block + FAQs | Confirm |
| 15 | **Reviewer photographs** | Review cards now render a reviewer photo when one is on file and fall back to initials otherwise. Drop files into `assets/images/customers/` and add `avatar: "file.webp"` to the matching entry in `TESTIMONIALS` (`_build/site.mjs`). No photos are on file today, so every review shows initials | Nice to have |

---

## 4. Scope items in the contract with no equivalent on staging

- Sectors as a **custom post type** — content exists for 8 sectors, but they are plain pages today.
- Case studies as a **filterable archive** — 4 static pages today.
- **Three-level mega menu, ~45 links** — staging has 2 levels (~45 links). Third level needs defining.
- **Animated statistics counters** — the 4 stats exist; animation is new.
- **Accreditation badges / logo walls** — assets captured, now on the homepage.

---

## 5. Technical notes for the WordPress conversion

- The WP **media library is empty** — every image is a theme file under `/images/`. They must be imported to the media library (or shipped in the child theme) so the client can swap them.
- Staging `robots.txt` **blocks all crawling** — replace at launch.
- No `/terms/` page exists (we removed the one we had invented).
- Post content in WordPress holds **whole-page markup**, not just article bodies. Rebuilding as Elementor templates means the prose has to be separated from the hero/forms — already done in `_build/content.mjs`.
- WordPress core sitemap (`wp-sitemap.xml`) is in use; no SEO plugin detected. Yoast/RankMath is part of our scope.
- URL structure is preserved exactly, as agreed with the client.

---

## 6. Recommended next steps

1. Get the brand-colour decision (gap 1) — it is a token change, but every page inherits it.
2. Send the client gaps 1–6 and 9–13 as a single content request.
3. Client review of the static preview, then revisions.
4. Convert to WordPress (Elementor templates + child theme), importing the images into the media library.
