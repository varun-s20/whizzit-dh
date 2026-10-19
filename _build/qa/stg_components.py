"""Every interactive component, driven the same way on the static build and on
staging; the state after each action is compared side by side.
usage: python stg_components.py <outdir>"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright

BASE = "https://staging.whizzit.co.uk"
root = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit")
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)

# State of a component: aria/open/hidden flags, is-* classes, transforms and scroll.
SNAP = r"""(sel) => {
  const roots = [...document.querySelectorAll(sel)].slice(0, 3);
  if (!roots.length) return 'MISSING ' + sel;
  return roots.map(r => [r, ...r.querySelectorAll('*')].map((e, i) => {
    const s = [];
    for (const a of ['aria-expanded', 'aria-selected', 'aria-current', 'aria-hidden', 'hidden', 'open', 'data-state', 'data-active']) if (e.hasAttribute(a) && !(a === 'aria-hidden' && e.tagName === 'svg')) s.push(a.replace('aria-', '') + '=' + (e.getAttribute(a) || 'y'));
    const cls = (typeof e.className === 'string' ? e.className : '').split(/\s+/).filter(c => /^(is-|active|open|current|stuck|revealed|in-view)/.test(c));
    if (cls.length) s.push(cls.join('.'));
    if (e.scrollLeft > 4) s.push('scrollL>0');
    const t = e.style && e.style.transform; if (t && t !== 'none' && t !== 'translate3d(0px, 0px, 0px)' && t !== 'translateX(0px)') s.push('moved');
    return s.length ? (e.tagName.toLowerCase() + ':' + s.join(',')) : '';
  }).filter(Boolean).join(' ')).join(' || ').slice(0, 900);
}"""

VISIBLE = r"""(sel) => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.opacity !== '0'; }).length"""

# (static file, [(label, action, selector, arg, snapshot root)])
PLAN = {
    1440: [
        ("index.html", [
            ("header sticks", "scroll", None, 900, "[data-header]"),
            ("mega: IT Services", "hover", "[data-mega-trigger] >> nth=0", None, ".site-header"),
            ("mega: Industries", "hover", "[data-mega-trigger] >> nth=1", None, ".site-header"),
            ("mega links visible", "count", ".mega a", None, None),
            ("tabs: 2nd tab", "click", "[data-tabs] [role=tab] >> nth=1", None, "[data-tabs]"),
            ("quotes: next", "click", "[data-quote-next]", None, "[data-quotes]"),
            ("faq: open first", "click", "main details summary >> nth=0", None, "main details"),
            ("service stage scroll", "scrollto", "[data-service-stage]", 600, "[data-service-stage]"),
            ("counters final", "text", "[data-count]", None, None),
        ]),
        ("it-services.html", [
            ("explorer: 3rd tab", "click", "[data-tabs] [role=tab] >> nth=2", None, "[data-tabs]"),
            ("svc open", "click", "[data-svc-open] >> nth=0", None, "main"),
        ]),
        ("cyber-security/email-security-services.html", [
            ("tabs: 2nd tab", "click", "[data-tabs] [role=tab] >> nth=1", None, "[data-tabs]"),
            ("faq: open first", "click", "main details summary >> nth=0", None, "main details"),
        ]),
        ("industries.html", [
            ("sector preview hover", "hover", "[data-sector-preview] a >> nth=3", None, "[data-sector-preview]"),
            ("rail next", "click", "[data-rail-next]", None, "main"),
            ("hscroll band", "scrollto", "[data-hscroll]", 1400, "[data-hscroll]"),
        ]),
        ("industries/it-support-construction.html", [
            ("sector dock", "scroll", None, 2600, "[data-sx-dock]"),
        ]),
        ("locations/it-support-birmingham.html", [
            ("more areas", "click", "[data-lx-more] >> nth=0", None, "main"),
            ("on-view", "scrollto", "[data-on-view]", 0, "[data-on-view]"),
        ]),
        ("locations.html", [
            ("map hover", "hover", "a[data-loc] >> nth=2", None, "main"),
        ]),
        ("about.html", [
            ("film window", "scrollto", "[data-film-window]", 300, "[data-film-window]"),
        ]),
        ("blog.html", [
            ("search 'cloud'", "type", "[data-lib-search]", "cloud", None),
            ("cards shown", "count", "[data-lib-grid] > *", None, None),
            ("clear search", "type", "[data-lib-search]", "", None),
            ("cards shown", "count", "[data-lib-grid] > *", None, None),
            ("topic filter", "click", "[data-lib-topics] button >> nth=1", None, "[data-library]"),
            ("cards shown", "count", "[data-lib-grid] > *", None, None),
        ]),
        ("contact.html", [
            ("form: empty submit", "submit", "form[data-validate] >> nth=0", None, "form[data-validate]"),
            ("captcha widget", "count", ".g-recaptcha iframe", None, None),
        ]),
        ("it-support.html", [
            ("hero form: empty submit", "submit", "form[data-validate] >> nth=0", None, "form[data-validate]"),
            ("google link", "attr", ".stat-strip--compact a[href*=google]", "href", None),
            ("faq: open first", "click", "main details summary >> nth=0", None, "main details"),
        ]),
        ("our-customers/ixia-clinical.html", [
            ("hero form fits", "fits", ".callback", None, None),
        ]),
    ],
    390: [
        ("index.html", [
            ("menu open", "click", "[data-menu-toggle]", None, ".mobile-nav"),
            ("menu links visible", "count", ".mobile-nav a", None, None),
            ("menu group open", "click", ".mobile-nav [aria-expanded] >> nth=0", None, ".mobile-nav"),
            ("menu close", "click", "[data-menu-close]", None, ".mobile-nav"),
        ]),
        ("industries.html", [
            ("phone chips", "scrollto", "[data-sector-preview]", 400, "[data-sector-preview]"),
        ]),
        ("locations/it-support-london.html", [
            ("hero form: empty submit", "submit", "form[data-validate] >> nth=0", None, "form[data-validate]"),
        ]),
    ],
}

def through_check(pg):
    for _ in range(12):
        t = pg.evaluate("document.body ? document.body.innerText.slice(0,300) : ''") or ""
        if "Checking your browser" not in t:
            return
        pg.wait_for_timeout(2500)

def run(pg, steps):
    res = []
    for label, act, sel, arg, snap in steps:
        try:
            if act == "scroll":
                pg.evaluate(f"window.scrollTo(0, {arg})"); pg.wait_for_timeout(700)
            elif act == "scrollto":
                pg.locator(sel).first.scroll_into_view_if_needed(); pg.evaluate(f"window.scrollBy(0, {arg})"); pg.wait_for_timeout(900)
            elif act == "hover":
                pg.locator(sel).first.scroll_into_view_if_needed(); pg.locator(sel).first.hover(); pg.wait_for_timeout(600)
            elif act == "click":
                pg.locator(sel).first.scroll_into_view_if_needed(); pg.locator(sel).first.click(timeout=5000); pg.wait_for_timeout(600)
            elif act == "type":
                pg.locator(sel).first.fill(arg); pg.wait_for_timeout(700)
            elif act == "submit":
                f = pg.locator(sel).first; f.scroll_into_view_if_needed(); pg.wait_for_timeout(2500)
                f.locator("button[type=submit], [type=submit]").first.click(timeout=5000); pg.wait_for_timeout(900)
                # Twice: the first press can reveal the check before complaining.
                f.locator("button[type=submit], [type=submit]").first.click(timeout=5000); pg.wait_for_timeout(900)
                errs = pg.evaluate("(s) => { const f = document.querySelector(s.replace(' >> nth=0','')); return { invalid: f.querySelectorAll('[aria-invalid=true], :invalid').length, summary: !!(f.querySelector('[data-error-summary]') && !f.querySelector('[data-error-summary]').hidden && f.querySelector('[data-error-summary]').innerText.trim()), action: f.getAttribute('action') }; }", sel)
                res.append((label, json.dumps(errs))); continue
            if act == "count":
                res.append((label, str(pg.evaluate(VISIBLE, sel)))); continue
            if act == "text":
                res.append((label, " ".join(pg.evaluate("(s) => [...document.querySelectorAll(s)].map(e => e.textContent.trim()).slice(0,6)", sel)))); continue
            if act == "attr":
                res.append((label, pg.locator(sel).first.get_attribute(arg) or "MISSING")); continue
            if act == "fits":
                res.append((label, str(pg.evaluate("(s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }", sel)))); continue
            res.append((label, pg.evaluate(SNAP, snap)))
        except Exception as e:
            res.append((label, "ERROR " + str(e).split("\n")[0][:140]))
    return res

paths = {p["file"]: p["path"] for p in json.loads((root / "wordpress/whizzit-core/data/pages.json").read_text(encoding="utf-8"))["pages"]}
report = []
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=r"C:/Program Files/Google/Chrome/Application/chrome.exe")
    for w, plan in PLAN.items():
        for side in ("local", "stg"):
            ctx = b.new_context(viewport={"width": w, "height": 900 if w > 500 else 844}, is_mobile=w < 768, has_touch=w < 768)
            # Never send an enquiry: block the form endpoints.
            ctx.route("**/wp-json/whizzit/**", lambda r: r.abort())
            ctx.route("**/api/submit*", lambda r: r.abort())
            for f, steps in plan:
                pg = ctx.new_page()
                errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)[:140]))
                if side == "local":
                    pg.goto((root / f).as_uri()); pg.wait_for_timeout(1200)
                else:
                    pg.goto(BASE + paths[f], wait_until="domcontentloaded", timeout=90000); through_check(pg)
                    pg.wait_for_selector("main", timeout=60000); pg.wait_for_timeout(2000)
                for label, val in run(pg, steps):
                    report.append({"w": w, "page": f, "side": side, "label": label, "val": val})
                if errs:
                    report.append({"w": w, "page": f, "side": side, "label": "JS errors", "val": " | ".join(errs[:3])})
                pg.close()
            ctx.close()
    b.close()

(out / "components.json").write_text(json.dumps(report, indent=1), encoding="utf-8")
seen = {}
for r in report:
    seen.setdefault((r["w"], r["page"], r["label"]), {})[r["side"]] = r["val"]
for (w, page, label), v in seen.items():
    same = v.get("local") == v.get("stg")
    print(("SAME " if same else "DIFF ") + f"{w} {page} | {label}")
    if not same:
        print("   local:", (v.get("local") or "")[:400])
        print("   stg:  ", (v.get("stg") or "")[:400])
