# QA scripts (run from the project root, Python + Playwright + Chrome)

- `package_zips.py` — zips wordpress/whizzit-child and whizzit-core into wordpress/dist/ (run after build + wp-export + version bump).
- `links_vs_original.py` — every link on the old staging site (_source/) against our build: lost links, links to pages that no longer exist.
- `static_links2.py <out.txt>` — jump links, tel/mailto, links with no name, external URL list, on every built page.
- `wp_links.py` — every link in the WordPress export (pages, posts, article extras) resolves to a page the import creates.
- `qa_resp.py` — all pages at 360/768/1024/1280/1920/2560: sideways scroll, overflow, clipped text, squashed images.
- `herogap.py <pages>` — hero spacing and whether the hero form is on screen.
- `stg_audit.py <outdir>` / `stg_components.py <outdir>` — the live staging site: every page, and every interactive part against the custom site.
