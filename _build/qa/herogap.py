"""Hero spacing: words/form bottom -> strip top, strip bottom -> hero bottom, and
the form's top/bottom against the screen, for every hero type."""
import pathlib, sys
from playwright.sync_api import sync_playwright
root = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit")
JS = """() => {
  const h = document.querySelector('main .hero, main > section');
  const strip = h.querySelector('.stat-strip--compact');
  const parts = [...h.querySelectorAll('.hero-split__copy, .hero-split__form, .lx-cover__copy, .lx-cover__form, .ix-hero__copy, .ix-hero__form')];
  const contentBottom = Math.max(...parts.map(p => p.getBoundingClientRect().bottom));
  const hr = h.getBoundingClientRect();
  const form = h.querySelector('.callback'); const fr = form ? form.getBoundingClientRect() : null;
  const credit = h.querySelector('.lx-cover__credit');
  const r = strip ? strip.getBoundingClientRect() : null;
  return { hero: Math.round(hr.height),
    above: r ? Math.round(r.top - contentBottom) : null,
    below: r ? Math.round(hr.bottom - r.bottom) : null,
    formInView: fr ? (fr.top >= 0 && fr.bottom <= innerHeight) : null,
    credit: !!credit };
}"""
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=r"C:/Program Files/Google/Chrome/Application/chrome.exe")
    for w, hgt in ((1920, 1080), (1440, 900), (1366, 768), (1024, 768), (820, 1180), (390, 844)):
        pg = b.new_page(viewport={"width": w, "height": hgt}, is_mobile=w < 768)
        for f in sys.argv[1:]:
            pg.goto((root / f).as_uri()); pg.wait_for_timeout(500)
            r = pg.evaluate(JS)
            print(f"{w}x{hgt}".ljust(10), f.split("/")[-1][:30].ljust(30), f"above {r['above']}  below {r['below']}  hero {r['hero']}  form-in-view {r['formInView']}")
        pg.close()
    b.close()
