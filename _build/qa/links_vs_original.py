"""Every link on every old staging page (pages and posts) against the same page
in our build. Normalised to site paths, so "../contact.html" and "/contact/" match.
Reports: links the old page had that ours lost, and old links that point nowhere."""
import json, re, posixpath, pathlib, collections
from urllib.parse import urlparse, unquote

ROOT = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit")
SRC = ROOT / "_source"
HOST = re.compile(r"^https?://(?:staging\.)?whizzit\.co\.uk", re.I)

def deep(o):
    """Staging records store content as {'rendered': ...} (or its string form)."""
    if isinstance(o, dict): return o.get("rendered", "")
    return str(o or "")

# Aliases the build applies when it renames a staging page.
SECTORS = {"it-support-construction", "it-support-healthcare", "managed-it-services-for-business-services-organisations",
           "managed-it-services-for-education-organisations", "managed-it-services-for-financial-services-business",
           "managed-it-services-for-insurance-services-businesses", "managed-it-services-for-legal-firms",
           "managed-it-services-for-manufacturing-businesses"}

def norm_site(path):
    path = unquote(path)
    path = re.sub(r"\.html$", "", path)
    path = re.sub(r"/index$", "/", path)
    if path == "index": path = "/"
    if not path.startswith("/"): path = "/" + path
    if not path.endswith("/"): path += "/"
    seg = path.strip("/")
    if seg in SECTORS: path = f"/industries/{seg}/"
    if seg == "it-support-london": path = "/locations/it-support-london/"
    return path

def resolve(href, page_url):
    """-> (kind, target) with kind in internal|external|mail|tel|anchor|other"""
    href = href.strip().replace("&amp;", "&")
    if not href: return ("empty", "")
    if href.startswith("tel:"):
        d = re.sub(r"\D", "", href[4:]); d = "0" + d[2:] if d.startswith("44") else d
        return ("tel", d)
    if href.startswith(("mailto:", "sms:")): return (href.split(":")[0], href.split(":", 1)[1].lower())
    if href.startswith("javascript:"): return ("js", href)
    if href.startswith("#"): return ("anchor", href) if len(href) > 1 else ("dead", "#")
    if HOST.match(href): href = HOST.sub("", href) or "/"
    if re.match(r"^[a-z][a-z0-9+.-]*:", href, re.I) or href.startswith("//"):
        # The same place written two ways: the Google reviews listing, and the office directions.
        if "cid=17055157413191665489" in href: return ("external", "GOOGLE-REVIEWS")
        d = re.search(r"destination=([^&]+)", href)
        if d and "google.com/maps/dir" in href: return ("external", "DIRECTIONS-" + ("STEVENAGE" if "Stevenage" in d.group(1) else "LONDON"))
        return ("external", href.split("#")[0].rstrip("/"))
    u = urlparse(href)
    path = u.path
    if not path.startswith("/"): path = posixpath.normpath(posixpath.join(posixpath.dirname(page_url), path))
    return ("internal", norm_site(path) + (("#" + u.fragment) if u.fragment else ""))

def links_of(html, page_url):
    out = []
    for m in re.finditer(r"<a\b([^>]*)>", html):
        a = m.group(1)
        h = re.search(r'\bhref="([^"]*)"', a)
        if h: out.append(resolve(h.group(1), page_url))
    return out

pages = {}
for rec in json.load(open(SRC / "wp-pages.json", encoding="utf-8")):
    link = deep(rec.get("link")) if isinstance(rec.get("link"), dict) else rec["link"]
    path = norm_site(urlparse(link).path)
    pages[path] = deep(rec["content"]) if isinstance(rec["content"], dict) else rec["content"]
posts = json.load(open(SRC / "wp-posts.json", encoding="utf-8"))
for rec in posts:
    link = rec["link"]
    pages[norm_site(urlparse(link).path)] = deep(rec["content"]) if isinstance(rec["content"], dict) else rec["content"]

# Our side: every built page, keyed by its site path.
ours = {}
for p in ROOT.rglob("*.html"):
    rel = p.relative_to(ROOT).as_posix()
    if rel.startswith(("wordpress/", "_source/", "node_modules/", "_build/")): continue
    s = p.read_text(encoding="utf-8")
    if "Moved</title>" in s[:400]: continue
    ours[norm_site(rel)] = (rel, s)

existing = set(ours)
missing_pages, lost, dead_orig = [], collections.defaultdict(list), collections.defaultdict(list)
for path, html in sorted(pages.items()):
    # Some old content carried no <main>; the "content" is the page body itself.
    if path not in ours:
        missing_pages.append(path); continue
    rel, ourhtml = ours[path]
    page_url = "/" + rel
    orig = set(l for l in links_of(html, path) if l[0] in ("internal", "external", "mailto", "tel", "dead", "empty"))
    ours_l = set(l for l in links_of(ourhtml, page_url) if l[0] in ("internal", "external", "mailto", "tel", "dead", "empty"))
    for l in orig:
        if l[0] == "internal":
            target = l[1].split("#")[0]
            if target not in existing and target not in ("/", ) and not re.search(r"\.(jpg|png|webp|svg|pdf)/?$", target):
                dead_orig[path].append(l[1])
        if l not in ours_l:
            lost[path].append(l)

GROUPED = collections.defaultdict(list)
for _p, _ls in lost.items():
    for _k, _t in _ls: GROUPED[(_k, _t)].append(_p)
print(f"old staging pages/posts: {len(pages)};  with no built page: {missing_pages or 'none'}")
print(f"pages where the old page had a link ours does not: {len(lost)}")
for path, ls in sorted(lost.items()):
    print(" ", path)
    for kind, t in ls[:8]: print("      ", kind, t)
print(f"\nold links to pages that do not exist in our site: {sum(len(v) for v in dead_orig.values())}")
for path, ls in sorted(dead_orig.items()): print(" ", path, sorted(set(ls))[:6])

print(f"\n== lost links grouped by target ({len(GROUPED)} distinct)")
for (k, t), ps in sorted(GROUPED.items(), key=lambda x: -len(x[1])):
    print(f"{len(ps):3}  {k:8} {t[:100]}  e.g. {ps[0]}" + (f" (+{len(ps)-1})" if len(ps) > 1 else ""))
