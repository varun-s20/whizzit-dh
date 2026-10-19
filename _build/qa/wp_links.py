"""Every link the WordPress export will print, resolved to a WordPress path and
checked against the pages, posts and sectors the import creates."""
import json, re, pathlib, collections
from urllib.parse import urlparse, unquote
R = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit/wordpress/whizzit-core/data")
pages = json.loads((R / "pages.json").read_text(encoding="utf-8"))["pages"]
posts = json.loads((R / "posts.json").read_text(encoding="utf-8"))["posts"]
exist = {p["path"] for p in pages} | {f"/blog/{p['slug']}/" for p in posts} | {"/"}
bad = collections.defaultdict(set); total = 0; dead = 0; tokens = collections.Counter()

def norm(href):
    h = href.strip().replace("&amp;", "&")
    if re.match(r"^(https?:)?//", h) and "whizzit.co.uk" not in h: return None
    if h.startswith(("mailto:", "tel:", "javascript:", "#", "sms:")): return None
    h = re.sub(r"^https?://(staging\.)?whizzit\.co\.uk", "", h)
    u = urlparse(h); p = unquote(u.path) or "/"
    if p.startswith("/wp-content") or p.startswith("/wp-json") or "{{ASSETS}}" in h: return None
    return p if p.endswith("/") or "." in p.rsplit("/", 1)[-1] else p + "/"

def scan(where, html, fields=None):
    global total, dead
    for m in re.finditer(r'<a\b[^>]*?\bhref="([^"]*)"', html):
        total += 1; href = m.group(1)
        t = re.fullmatch(r"\{\{(\w+)\}\}", href)
        if t:
            href = (fields or {}).get(t.group(1), "")
            if href == "" : dead += 1; bad[where].add("EMPTY link field " + t.group(1)); continue
        elif "{{" in href: tokens[href[:40]] += 1
        if href in ("#", ""): dead += 1; bad[where].add("DEAD #"); continue
        p = norm(href)
        if p and p not in exist and not re.search(r"\.(webp|png|jpe?g|svg|pdf|css|js)$", p):
            bad[where].add(href)

for pg in pages:
    for w in pg["widgets"]:
        if w["widget"] != "section": continue
        tpl = json.loads((R / "sections" / f"{w['tpl']}.json").read_text(encoding="utf-8"))
        html = tpl.get("html") or tpl.get("template") or json.dumps(tpl)
        html = html.replace("\\\"", '"') if "\\\"" in html else html
        scan(pg["path"], html, w["settings"])
        for k, v in w["settings"].items():            # html-valued fields (u#/i#_html, etc.)
            if isinstance(v, str) and "<a" in v: scan(pg["path"], v)
for p in posts:
    for key in ("body", "lead", "authorHtml", "faqHtml", "partnersHtml"):
        scan(f"/blog/{p['slug']}/ [{key}]", p.get(key) or "")
print(f"links checked: {total}; dead/empty: {dead}; pages+posts with a broken target: {len(bad)}")
for k, v in sorted(bad.items())[:15]: print(" ", k, sorted(v)[:5])
if tokens: print("unresolved tokens in hrefs:", dict(tokens))
