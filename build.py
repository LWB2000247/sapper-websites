#!/usr/bin/env python3
"""Render the static site from site.config.json (the single place to change brand name,
domain, footer/DBA text, contact details, form_email, clarity_id, and nav_links).
Usage: python3 build.py
Writes index.html, thanks.html, terms.html, privacy.html, legal-notice.html, sitemap.xml, robots.txt
(and CNAME if write_cname is true).
terms.html, privacy.html and legal-notice.html keep the Lawyer's sentences. build.py only adds
heading ids, a contents line on Terms and Privacy, and the Legal Notice date if it is missing.
Those three pages are indexable and in the sitemap. thanks.html is noindex and not in the sitemap."""
import json, pathlib, re, urllib.parse, html
root = pathlib.Path(__file__).parent
cfg = json.loads((root / "site.config.json").read_text())
vals = {}
for k, v in cfg.items():
    if isinstance(v, (dict, list)):
        continue
    vals[k] = html.escape(str(v), quote=True)
vals["brand_name_url"] = urllib.parse.quote(cfg["brand_name"])
# The slogan is three short beats. The last one is the accent line in the hero.
beats = [part.strip() + "." for part in str(cfg.get("slogan", "")).split(".") if part.strip()]
while len(beats) < 3:
    beats.append("")
for i, beat in enumerate(beats[:3], start=1):
    vals["slogan_line_%d" % i] = html.escape(beat, quote=True)

def nav_html(prefix):
    parts = []
    for item in cfg.get("nav_links", []):
        href = str(item["href"])
        if prefix and href.startswith("#"):
            href = prefix + href
        parts.append('<a href="%s">%s</a>' % (html.escape(href, quote=True), html.escape(str(item["label"]))))
    return "".join(parts)

def page_nav(home):
    cta = str(cfg.get("nav_cta_href", "#start"))
    if not home and cta.startswith("#"):
        cta = "/" + cta
    return {"nav_html": nav_html("" if home else "/"), "nav_cta_href": html.escape(cta, quote=True)}

def render(t, extra=None):
    # {{#key}}...{{/key}} is omitted when that config value is empty.
    def keep(m):
        if str(cfg.get(m.group(1), "")).strip():
            return m.group(2)
        return ""
    t = re.sub(r"\{\{#(\w+)\}\}(.*?)\{\{/\1\}\}", keep, t, flags=re.S)
    data = dict(vals)
    if extra:
        data.update(extra)
    for k, v in data.items():
        t = t.replace("{{%s}}" % k, v)
    assert "{{" not in t, "unresolved placeholder"
    return t

def slugify(inner):
    text = html.unescape(re.sub(r"<[^>]+>", "", inner)).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "section"

def prepare_legal(body, fname):
    if fname == "legal-notice.html" and "Last updated:" not in body:
        body = body.replace("</h1>", "</h1>\n<p>Last updated: October 23, 2026</p>", 1)
    seen = {}
    heads = []
    def repl(m):
        attrs, inner = m.group(1), m.group(2)
        sid = slugify(inner)
        n = seen.get(sid, 0) + 1
        seen[sid] = n
        if n > 1:
            sid = "%s-%d" % (sid, n)
        if "id=" not in attrs:
            attrs = attrs + ' id="%s"' % sid
        else:
            found = re.search(r'id="([^"]+)"', attrs)
            if found:
                sid = found.group(1)
        label = html.unescape(re.sub(r"<[^>]+>", "", inner))
        heads.append((sid, label))
        return "<h2%s>%s</h2>" % (attrs, inner)
    body = re.sub(r"<h2([^>]*)>(.*?)</h2>", repl, body, flags=re.S)
    if fname in ("terms.html", "privacy.html") and heads:
        items = "\n".join(
            '  <li><a href="#%s">%s</a></li>' % (html.escape(sid, quote=True), html.escape(label))
            for sid, label in heads)
        toc = '<nav class="legal-contents" aria-label="Contents">\n<p>Contents</p>\n<ul>\n%s\n</ul>\n</nav>' % items
        if "</h1>" in body:
            body = body.replace("</h1>", "</h1>\n" + toc, 1)
        else:
            body = toc + "\n" + body
    return body

(root / "index.html").write_text(render((root / "src/index.template.html").read_text(), page_nav(True)))
(root / "thanks.html").write_text(render((root / "src/thanks.template.html").read_text(), page_nav(False)))
legal_src = (root / "src/legal.template.html").read_text()
legal_pages = [
    ("terms.html", "Terms of Service", "The terms for using the Sapper Websites site and requesting a website from us."),
    ("privacy.html", "Privacy Policy", "How Sapper Websites collects, uses and shares personal information."),
    ("legal-notice.html", "Legal Notice", "Who operates Sapper Websites, and how to contact us."),
]
for fname, title, desc in legal_pages:
    body = prepare_legal((root / "src/legal" / fname).read_text().strip(), fname)
    page = render(legal_src.replace("{{legal_body}}", "@@LEGAL_BODY@@")
                  .replace("{{legal_title}}", html.escape(title, quote=True))
                  .replace("{{legal_description}}", html.escape(desc, quote=True))
                  .replace("{{legal_file}}", fname), page_nav(False))
    (root / fname).write_text(page.replace("@@LEGAL_BODY@@", body))
d = cfg["domain"]
# Indexable pages: home plus the three legal pages. thanks.html is noindex and not listed.
urls = [f"https://{d}/"] + [f"https://{d}/{f}" for f, _, _ in legal_pages]
entries = "\n".join(f"  <url><loc>{u}</loc></url>" for u in urls)
(root / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{entries}\n</urlset>\n')
(root / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: https://{d}/sitemap.xml\n")
cname = root / "CNAME"
if cfg.get("write_cname"):
    cname.write_text(d + "\n")
elif cname.exists():
    cname.unlink()
print("built for", d)
