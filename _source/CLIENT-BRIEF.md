# Client brief and agreed scope — WhizzIT

Source: Fiverr conversation with **whizzsolutions** (13–17 Sep 2026) and the order requirements
form. This file is the reference for what was promised. Where the early feature list and the
final custom offer differ, **the custom offer is the contract**.

## The brief (client, 13 Sep)

> **Modern WordPress redesign for Whizzit**
>
> Project goal: Redesign our existing WordPress site to look more modern, brighter, and more
> aligned with our brand and industry.
>
> Scope of work:
> - Review the current staging site and propose an updated sitemap/section layout if needed
> - Create a modern redesign (new colors, typography, spacing, imagery direction) to replace the
>   current dark/basic look
> - Redesign key page templates (e.g., Home, About, Services/Products, Contact, any other existing
>   core pages)
> - Implement the approved design in WordPress on the existing site
> - Ensure the site is responsive and looks great on desktop, tablet, and mobile
> - Basic SEO best practices during rebuild (clean headings, metadata fields, image alt text support)
> - QA pass and bug fixes before handover
> - Handover with guidance so we can update content going forward
>
> Reference site to redesign: https://staging.whizzit.co.uk

## What the client told us

| Date | Client said | What it means for the build |
|---|---|---|
| 13 Sep | "I would like my site to look similar to https://boldit.co.uk/" | Design reference |
| 13 Sep | Staging is `https://staging.whizzit.co.uk/` ("that is our staging") | The WordPress install we work in |
| 13 Sep | 13 core pages (list below): "I would like separate (non boiler plate) designs for those core pages and the sub pages under those can follow the same design" | 13 distinct designs; ~87 sub-pages on shared templates |
| 13 Sep | "there are approx 100 pages on our site" | 73 pages + 27 posts on staging |
| 13 Sep | Approved the feature list ("yes I like this", then "looks great") | See "Early feature list" below |
| 13 Sep | "I am not bothered about the rankings as we have just onboarded an SEO agency to handle this after we have the design where it needs to be" | Basic SEO only; their agency takes over |
| 13 Sep | "but keep the same URLs structure as our existing site" | **Hard requirement: every URL unchanged** |
| 16 Sep | "ours is not a store its a brochure website" | No e-commerce |
| 16 Sep | Asked whether we use AI or build manually. We replied: "We build the website manually in WordPress using Elementor, so everything will remain fully editable from the admin panel" | **Elementor is promised**; client-editable without a developer |
| 16 Sep | Accepted Plan 2 at US$2,400 ("Amazing thank you so much lets proceed") | Custom offer below |
| 16 Sep | Offered to create us a WordPress account | We have **wp-admin access to staging only**, not the Hostinger account |

**Core pages (client's list):** Home, About, IT Services, Industries, Our Customers, Blog, IT
Support, Managed Cloud Services, Cyber Security, Network Management, IT Project Management,
Locations — IT Support London, Contact.

## The contract: custom offer (16 Sep, US$2,400, 27 days delivery)

> A modern, bright redesign of whizzit.co.uk, built manually in WordPress with Elementor and fully
> editable by you.
>
> INCLUDED
> - Audit of the current site, new colour palette and typography, and a documented design system
> - 13 distinct core page designs: Home, About, IT Services, Industries, Our Customers, Blog, IT
>   Support, Managed Cloud Services, Cyber Security, Network Management, IT Project Management,
>   IT Support London, Contact
> - Around 87 sub-pages restyled using templates from the core designs, with existing content kept
> - Multi-level mega menu (3 levels, ~45 links, icons) with a matching mobile menu
> - Sticky header with click-to-call, primary CTA, remote support and booking links
> - Trust components: accreditation badges, Google reviews widget, animated statistics counters
> - Sectors as a custom post type you can add to yourself
> - Existing URL structure kept the same
> - Basic SEO setup: clean headings, metadata fields, image alt text
> - Fully responsive, tested across devices and browsers
> - Built on staging and published only on your approval
> - Handover walkthrough and documentation
> - Unlimited revisions within this scope
> - 2 months of post-launch support
> - First preview link within 7 days

Fiverr order metadata: "Functional website - 1", "Number of pages - 10" (package defaults; the
real scope is the ~100 pages above).

## Early feature list (13 Sep, approved before the offer)

Our message listing features "based on your reference website". The client replied "yes I like
this". **Items not repeated in the custom offer are marked.**

- Multi-level mega menu with icons and up to 3 levels (~45 links)
- Sticky header with click-to-call, primary CTA, remote-support portal and booking page links
- Modern hero with layered SVG glow backgrounds, floating icons and dual CTAs
- Four-card service grid with duotone icons
- Alternating image and text sections
- Live Google reviews widget
- Animated statistics counters
- Accreditation badges and logo walls (vendors, partners, clients)
- Video testimonials with names and job titles (**not in the custom offer**)
- Sectors as custom post types with dedicated sector pages
- Case studies with individual detail pages; the longer proposal message also said "filterable by
  sector or service" and "easy for you to add new entries" (**the offer does not list case studies
  as a post type**)
- Location landing pages for local SEO, with LocalBusiness schema

Our longer proposal message (13 Sep 21:09) also promised: performance work (image compression,
lazy loading, Core Web Vitals, caching); 301 redirects for anything that changes; sitemap and
Search Console verification; design-system documentation; and **3 months** of post-launch support.
The custom offer says **2 months**; the offer governs.

## Order requirements form

| Question | Answer |
|---|---|
| Industry | Information Technology (IT) |
| Part of a bigger project? | Website building |
| Hosting provider? | Yes |
| Existing hosting plan | Hostinger / WordPress |

## Access

- wp-admin account on `staging.whizzit.co.uk`, created by the client for our email address
  (requested 17 Sep).
- No Hostinger (hPanel) access. The live site `whizzit.co.uk` is a separate static site on the
  client's hosting, outside that WordPress install.
