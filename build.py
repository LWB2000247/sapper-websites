#!/usr/bin/env python3
"""Render the static site from site.config.json (the single place to change brand name,
domain, footer/DBA text, contact details, form_email, and clarity_id). Usage: python3 build.py
Writes index.html, thanks.html, terms.html, privacy.html, legal-notice.html, sitemap.xml, robots.txt
(and CNAME if write_cname is true).
terms.html, privacy.html and legal-notice.html are rendered from src/legal/*.html (final texts from the Lawyer,
inserted unchanged) and are indexable and in the sitemap. thanks.html is noindex and not in the sitemap."""
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
legal_src = (root / "src/legal.template.html").read_text()
legal_pages = [
    ("terms.html", "Terms of Service", "The terms for using the Sapper Websites site and requesting a website from us."),
    ("privacy.html", "Privacy Policy", "How Sapper Websites collects, uses and shares personal information."),
    ("legal-notice.html", "Legal Notice", "Who operates Sapper Websites, and how to contact us."),
]
for fname, title, desc in legal_pages:
    body = (root / "src/legal" / fname).read_text().strip()
    page = render(legal_src.replace("{{legal_body}}", "@@LEGAL_BODY@@")
                  .replace("{{legal_title}}", html.escape(title, quote=True))
                  .replace("{{legal_description}}", html.escape(desc, quote=True))
                  .replace("{{legal_file}}", fname))
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
