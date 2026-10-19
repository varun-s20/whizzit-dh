"""Responsive QA: every page at several widths.
Checks: page scrolls sideways; an element sticks out of the viewport (outside
intended horizontal scrollers); text clipped inside its own box (headings,
buttons, links, labels); images visibly squashed (no object-fit)."""
import pathlib, json, sys
from playwright.sync_api import sync_playwright
root = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit")
widths = [int(w) for w in (sys.argv[1] if len(sys.argv) > 1 else "360,768,1024,1280,1920,2560").split(",")]
pages = [p for p in root.glob("**/*.html") if not any(x in p.parts for x in ("wordpress", "_source", "_build", "ref", "node_modules")) and "Moved</title>" not in p.read_text(encoding="utf-8")[:400]]
CHECK = r"""() => {
  const W = document.documentElement.clientWidth;
  const out = { overflow: document.documentElement.scrollWidth > W + 1, stick: [], clip: [], squash: [] };
  const scrollers = (el) => { for (let p = el; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p); if ((s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflowX === 'hidden' || s.overflowX === 'clip') && p.scrollWidth > p.clientWidth + 1) return true; if (p.matches('.marquee, .marquee__viewport')) return true; } return false; };
  const name = (el) => (el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName.toLowerCase());
  document.querySelectorAll('main *, header *, footer *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || s.position === 'fixed') return;
    if ((r.right > W + 2 || r.left < -2) && !scrollers(el) && !el.closest('[aria-hidden="true"], .sx-dock, .mobile-nav, .mega, [hidden]')) out.stick.push(name(el));
    if (/^(H1|H2|H3|H4|A|BUTTON|LABEL|STRONG|SPAN|DT|DD|P)$/.test(el.tagName) && el.children.length === 0 && el.textContent.trim()) {
      if ((s.overflow === 'hidden' || s.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 2 && s.textOverflow !== 'ellipsis' && !s.webkitLineClamp) out.clip.push(name(el) + ':' + el.textContent.trim().slice(0, 24));
    }
    if (el.tagName === 'IMG' && el.naturalWidth && s.objectFit !== 'cover' && s.objectFit !== 'contain') {
      const a = el.naturalWidth / el.naturalHeight, b = r.width / r.height;
      if (Math.abs(a - b) / a > 0.08) out.squash.push(name(el) + ':' + (el.getAttribute('src') || '').split('/').pop());
    }
  });
  for (const k of ['stick', 'clip', 'squash']) out[k] = [...new Set(out[k])].slice(0, 6);
  return out;
}"""
results = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=r"C:/Program Files/Google/Chrome/Application/chrome.exe")
    for w in widths:
        ctx = b.new_context(viewport={"width": w, "height": 1000 if w >= 1024 else 900}, is_mobile=w < 768, has_touch=w < 1024)
        ctx.route("http*://**/*", lambda r: r.abort())
        for f in pages:
            pg = ctx.new_page()
            pg.goto(f.as_uri()); pg.wait_for_timeout(350)
            r = pg.evaluate(CHECK)
            if r["overflow"] or r["stick"] or r["clip"] or r["squash"]:
                results.setdefault(str(f.relative_to(root)).replace("\\", "/"), {})[w] = r
            pg.close()
        ctx.close()
        print(w, "done")
    b.close()
out = pathlib.Path(__file__).parent / "qa_resp.json"
out.write_text(json.dumps(results, indent=1))
print(len(results), "pages with findings")
agg = {}
for page, by in results.items():
    for w, r in by.items():
        for k in ("stick", "clip", "squash"):
            for item in r[k]:
                agg.setdefault((k, item), set()).add(f"{page}@{w}")
        if r["overflow"]:
            agg.setdefault(("overflow", ""), set()).add(f"{page}@{w}")
for (k, item), where in sorted(agg.items(), key=lambda x: -len(x[1])):
    print(f"{k:8} {item[:40]:40} {len(where):3}  e.g. {sorted(where)[:3]}")
