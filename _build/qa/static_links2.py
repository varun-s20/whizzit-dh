"""Beyond "does the page exist": jump links land on a real id (same page and other
pages), tel/mailto values, external link list, links without text or label,
target=_blank without rel=noopener, and links to files that do not exist."""
import re, pathlib, collections, posixpath, sys
from urllib.parse import urlparse, unquote, parse_qs

root = pathlib.Path(r"C:/Users/varun/OneDrive/Desktop/s20/digital-heroes/whizzit")
pages = {}
for p in root.rglob("*.html"):
    rel = p.relative_to(root).as_posix()
    if rel.startswith(("wordpress/", "_source/", "node_modules/", "_build/")): continue
    s = p.read_text(encoding="utf-8")
    if "Moved</title>" in s[:400]: continue
    pages[rel] = s
ids = {rel: set(re.findall(r'\bid="([^"]+)"', s)) | set(re.findall(r'\bname="([^"]+)"', s)) for rel, s in pages.items()}

problems = collections.defaultdict(list)
tel, mail, ext = collections.Counter(), collections.Counter(), collections.defaultdict(set)
for rel, s in pages.items():
    body = re.sub(r"<(script|style|template)[\s\S]*?</\1>", "", s)
    for m in re.finditer(r"<a\b([^>]*)>([\s\S]*?)</a>", body):
        attrs, inner = m.group(1), m.group(2)
        h = re.search(r'\bhref="([^"]*)"', attrs)
        if not h:
            if re.search(r"\bclass=\"(btn|text-link)", attrs): problems["no-href"].append(rel)
            continue
        href = h.group(1).replace("&amp;", "&")
        label = re.sub(r"<[^>]+>|\s+", " ", inner).strip()
        if not label and not re.search(r'aria-label="[^"]+"', attrs) and not re.search(r'<img[^>]+alt="[^"]+"', inner):
            problems["no-accessible-name"].append(f"{rel} -> {href}")
        if 'target="_blank"' in attrs and "noopener" not in attrs:
            problems["blank-without-noopener"].append(f"{rel} -> {href}")
        if href.startswith("tel:"): tel[href] += 1; continue
        if href.startswith("mailto:"): mail[href] += 1; continue
        if href.startswith(("javascript:", "sms:")): continue
        if re.match(r"^(https?:)?//", href):
            ext[href.split("#")[0]].add(rel); continue
        if href.startswith("#"):
            if len(href) > 1 and href[1:] not in ids[rel] and not re.search(r"data-(menu|mega|svc-open|lib|tabs)|role=\"tab\"|aria-controls", attrs):
                problems["jump-target-missing"].append(f"{rel} {href}")
            continue
        u = urlparse(href)
        path = unquote(u.path)
        t = posixpath.normpath(posixpath.join(posixpath.dirname(rel), path)) if path else rel
        if path.endswith("/") and not t.endswith(".html"): t = posixpath.join(t, "index.html")
        if t not in pages and not (root / t).exists():
            problems["target-missing"].append(f"{rel} -> {href}")
        elif u.fragment and t in ids and u.fragment not in ids[t]:
            problems["fragment-missing-on-other-page"].append(f"{rel} -> {href}")
        if u.query and "category=" in u.query and t == "blog.html":
            pass

print("pages:", len(pages))
for k in ("target-missing", "jump-target-missing", "fragment-missing-on-other-page", "no-href", "no-accessible-name", "blank-without-noopener"):
    v = problems.get(k, [])
    print(f"{k}: {len(v)}")
    for x in sorted(set(v))[:8]: print("    ", x)
print("tel values:", dict(tel))
print("mailto values:", dict(mail))
print("external URLs:", len(ext))
pathlib.Path(sys.argv[1]).write_text("\n".join(sorted(ext)), encoding="utf-8")
