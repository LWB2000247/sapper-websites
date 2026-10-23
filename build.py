#!/usr/bin/env python3
"""Render the static site from site.config.json (the single place to change brand name,
domain, footer/DBA text, contact details, form_email, and clarity_id). Usage: python3 build.py
Writes index.html, thanks.html, terms.html, privacy.html, sitemap.xml, robots.txt
(and CNAME if write_cname is true).
thanks.html, terms.html and privacy.html are noindex and are not added to the sitemap."""
import json, pathlib, re, urllib.parse, html
root = pathlib.Path(__file__).parent
cfg = json.loads((root / "site.config.json").read_text())
vals = {k: html.escape(str(v), quote=True) for k, v in cfg.items()}
vals["brand_name_url"] = urllib.parse.quote(cfg["brand_name"])
# The slogan is three short beats. The last one is the accent line in the hero.
beats = [part.strip() + "." for part in str(cfg.get("slogan", "")).split(".") if part.strip()]
while len(beats) < 3:
    beats.append("")
for i, beat in enumerate(beats[:3], start=1):
    vals["slogan_line_%d" % i] = html.escape(beat, quote=True)
def render(t):
    # {{#key}}...{{/key}} is omitted when that config value is empty.
    def keep(m):
        if str(cfg.get(m.group(1), "")).strip():
            return m.group(2)
        return ""
    t = re.sub(r"\{\{#(\w+)\}\}(.*?)\{\{/\1\}\}", keep, t, flags=re.S)
    for k, v in vals.items():
        t = t.replace("{{%s}}" % k, v)
    assert "{{" not in t, "unresolved placeholder"
    return t
(root / "index.html").write_text(render((root / "src/index.template.html").read_text()))
(root / "thanks.html").write_text(render((root / "src/thanks.template.html").read_text()))
soon_src = (root / "src/coming-soon.template.html").read_text()
# The Clarity paragraph is only on the privacy page. Terms stays the placeholder.
(root / "terms.html").write_text(render(soon_src))
cfg["privacy_note"] = "1"
(root / "privacy.html").write_text(render(soon_src))
del cfg["privacy_note"]
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
