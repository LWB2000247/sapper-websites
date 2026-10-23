#!/usr/bin/env python3
"""Render the static site from site.config.json (the single place to change brand name,
domain, footer/DBA text, contact details, and form_email). Usage: python3 build.py
Writes index.html, thanks.html, terms.html, privacy.html, sitemap.xml, robots.txt
(and CNAME if write_cname is true).
thanks.html, terms.html and privacy.html are noindex and are not added to the sitemap."""
import json, pathlib, urllib.parse, html
root = pathlib.Path(__file__).parent
cfg = json.loads((root / "site.config.json").read_text())
vals = {k: html.escape(str(v), quote=True) for k, v in cfg.items()}
vals["brand_name_url"] = urllib.parse.quote(cfg["brand_name"])
def render(t):
    for k, v in vals.items():
        t = t.replace("{{%s}}" % k, v)
    assert "{{" not in t, "unresolved placeholder"
    return t
(root / "index.html").write_text(render((root / "src/index.template.html").read_text()))
(root / "thanks.html").write_text(render((root / "src/thanks.template.html").read_text()))
soon = render((root / "src/coming-soon.template.html").read_text())
(root / "terms.html").write_text(soon)
(root / "privacy.html").write_text(soon)
d = cfg["domain"]
# Homepage only. thanks.html, terms.html and privacy.html are noindex.
(root / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://{d}/</loc></url>\n</urlset>\n')
(root / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: https://{d}/sitemap.xml\n")
cname = root / "CNAME"
if cfg.get("write_cname"):
    cname.write_text(d + "\n")
elif cname.exists():
    cname.unlink()
print("built for", d)
