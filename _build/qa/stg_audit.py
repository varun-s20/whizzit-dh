"""Full staging audit: every page and post, at 1440 and 390.
Per page: HTTP status, JS errors, failed requests, sideways scroll, broken
images, leftover {{tokens}}, stray spaces, main text and section heights vs the
static build. Then every internal link is requested once (404s, redirects).
usage: python stg_audit.py <outdir>"""
import json, pathlib, re, sys, difflib
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

BASE = "https://staging.whizzit.co.uk"
root = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit")
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
(out / "shots").mkdir(exist_ok=True)
pages = [(p["path"], p["file"]) for p in json.loads((root / "wordpress/whizzit-core/data/pages.json").read_text(encoding="utf-8"))["pages"]]

def through_check(pg):
    for _ in range(12):
        t = pg.evaluate("document.body ? document.body.innerText.slice(0,300) : ''") or ""
        if "Checking your browser" not in t:
            return
        pg.wait_for_timeout(2500)

SCROLL = """async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 300)); }"""
PROBE = r"""() => {
  const W = document.documentElement.clientWidth;
  const main = document.querySelector('main');
  const imgs = [...document.querySelectorAll('main img, header img, footer img')].filter(i => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src)).map(i => (i.currentSrc || i.src).split('/').slice(-2).join('/'));
  const txt = main ? main.innerText : '';
  const stray = [...txt.matchAll(/.{0,30}[A-Za-z0-9)] [,.;:!?](?=\s|$).{0,10}/g)].map(m => m[0]).slice(0, 4);
  const tokens = [...document.documentElement.outerHTML.matchAll(/\{\{[A-Za-z0-9:_ -]{1,30}\}\}/g)].map(m => m[0]).slice(0, 6);
  const secs = main ? [...main.querySelectorAll('section, nav.section, .sx-dock, nav.ix-switch, nav.ix-more, nav.sv-family')].filter(e => !e.parentElement.closest('section')).map(e => [(e.className.split(' ')[0] || e.tagName), Math.round(e.getBoundingClientRect().height)]) : [];
  const links = [...document.querySelectorAll('a[href]')].map(a => a.href);
  const deadLinks = [...document.querySelectorAll('main a')].filter(a => ['#', ''].includes(a.getAttribute('href') || '') && !a.matches('[data-menu-toggle],[data-svc-open],[role=tab],[aria-controls],[data-lib-reset],[data-lib-clear]')).map(a => (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 40));
  return { overflow: document.documentElement.scrollWidth > W + 1, imgs, stray, tokens, secs, links, deadLinks,
           text: txt.replace(/\s+\n/g, '\n').trim(), hasHeader: !!document.querySelector('.site-header'), hasFooter: !!document.querySelector('.site-footer'),
           title: document.title };
}"""

def norm_lines(t):
    return [re.sub(r"\s+", " ", l).strip() for l in t.split("\n") if l.strip()]

report = {"pages": {}, "links": {}}
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=r"C:/Program Files/Google/Chrome/Application/chrome.exe")
    # Local static reference at 1440.
    lctx = b.new_context(viewport={"width": 1440, "height": 900})
    local = {}
    for path, f in pages:
        pg = lctx.new_page(); pg.goto((root / f).as_uri()); pg.wait_for_timeout(400)
        local[path] = pg.evaluate(PROBE); pg.close()
    for w in (1440, 390):
        ctx = b.new_context(viewport={"width": w, "height": 900 if w > 500 else 844}, is_mobile=w < 768, has_touch=w < 768)
        queue = list(pages)
        seen = set(p for p, _ in queue)
        i = 0
        while i < len(queue):
            path, f = queue[i]; i += 1
            pg = ctx.new_page()
            errs, cons, bad = [], [], []
            pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
            pg.on("console", lambda m: cons.append(m.text[:160]) if m.type == "error" else None)
            pg.on("response", lambda r: bad.append(f"{r.status} {r.url[:140]}") if r.status >= 400 else None)
            pg.on("requestfailed", lambda r: bad.append(f"FAILED {r.url[:140]} {r.failure}") if "google" not in r.url and "gstatic" not in r.url else None)
            try:
                resp = pg.goto(BASE + path, wait_until="domcontentloaded", timeout=90000)
                through_check(pg)
                pg.wait_for_selector("main", timeout=60000)
                pg.wait_for_timeout(1200)
                pg.evaluate(SCROLL)
                d = pg.evaluate(PROBE)
                status = resp.status if resp else None
            except Exception as e:
                report["pages"].setdefault(path, {})[w] = {"error": str(e)[:200]}
                pg.close(); continue
            pg.screenshot(path=str(out / "shots" / f"{w}{path.strip('/').replace('/', '_') or 'home'}.png"))
            rec = {"status": status, "final": pg.url, "errs": errs[:4], "console": cons[:4], "bad": sorted(set(bad))[:8],
                   "overflow": d["overflow"], "dead": d["deadLinks"], "imgs": d["imgs"][:6], "stray": d["stray"], "tokens": d["tokens"],
                   "header": d["hasHeader"], "footer": d["hasFooter"], "title": d["title"]}
            if w == 1440:
                for href in d["links"]:
                    u = urlparse(href)
                    if u.netloc == "staging.whizzit.co.uk":
                        report["links"].setdefault(u.path or "/", set()).add(path)
                    # Blog posts are found from the links (whatever their permalink).
                    slug = (u.path or "/").strip("/").split("/")[-1]
                    if u.netloc == "staging.whizzit.co.uk" and slug and u.path not in seen and (root / "blog" / f"{slug}.html").exists():
                        seen.add(u.path); queue.append((u.path, f"blog/{slug}.html"))
                        lp = lctx.new_page(); lp.goto((root / "blog" / f"{slug}.html").as_uri()); lp.wait_for_timeout(300)
                        local[u.path] = lp.evaluate(PROBE); lp.close()
                if path in local:
                    a, c = norm_lines(local[path]["text"]), norm_lines(d["text"])
                    rec["textRatio"] = round(difflib.SequenceMatcher(None, a, c).ratio(), 3)
                    rec["textDiff"] = [l for l in difflib.unified_diff(a, c, lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---")][:12]
                    ls, ss = local[path]["secs"], d["secs"]
                    rec["secDiff"] = [f"{x[0]}: local {x[1]} / stg {y[1]}" for x, y in zip(ls, ss) if abs(x[1] - y[1]) > 4][:6]
                    if len(ls) != len(ss):
                        rec["secDiff"].append(f"section count local {len(ls)} / stg {len(ss)}")
            report["pages"].setdefault(path, {})[w] = rec
            pg.close()
            print(w, path, "ok", flush=True)
        if w == 1440:
            pages = list(queue)  # the phone pass covers the posts too
        ctx.close()
    # Internal links: one request each, no redirect following, so redirects show.
    ctx = b.new_context()
    pg = ctx.new_page(); pg.goto(BASE + "/", wait_until="domcontentloaded", timeout=90000); through_check(pg); pg.close()
    for p in sorted(report["links"]):
        if re.search(r"\.(jpg|jpeg|png|webp|svg|pdf|ico)$", p, re.I) or p.startswith("/wp-admin"):
            continue
        try:
            r = ctx.request.get(BASE + p, max_redirects=0, timeout=60000)
            st, loc = r.status, r.headers.get("location", "")
        except Exception as e:
            st, loc = "ERR", str(e)[:80]
        if st != 200:
            report["links"][p] = {"status": st, "to": loc, "from": sorted(report["links"][p])[:4]}
        else:
            report["links"][p] = 200
    b.close()

report["links"] = {k: v for k, v in report["links"].items() if v != 200}
(out / "report.json").write_text(json.dumps(report, indent=1, default=list), encoding="utf-8")
print("pages audited:", len(report["pages"]), " non-200 internal links:", len(report["links"]))
