# Sapper Websites

Static one-page site for **Sapper Websites**, a DBA of Sapper Advanced Technologies LLC. Plain HTML and CSS, no framework, no backend, hosted free on GitHub Pages. The visual style (colors, Archivo/Inter type, buttons, header, footer) follows sapperadvanced.com.

Live (GitHub Pages): https://lwb2000247.github.io/sapper-websites/
Future domain: https://sapperwebsites.com

## Change brand, domain, footer text, contact details in one place

Edit `site.config.json`, then run:

    python3 build.py

This regenerates `index.html`, `sitemap.xml` and `robots.txt` (canonical, Open Graph and sitemap URLs use `domain`). Commit and push. No dependencies beyond Python 3.

## Hosting notes

- All asset links are relative, so the site works at `https://lwb2000247.github.io/sapper-websites/` and at the custom domain.
- No `CNAME` file is committed. With a `CNAME` set, GitHub redirects the github.io URL to the custom domain, which would show an error until DNS for sapperwebsites.com is live.
- To switch to the custom domain: point DNS at GitHub Pages (A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, or a CNAME for `www` to `lwb2000247.github.io`), set `"write_cname": true` in `site.config.json`, run `python3 build.py`, commit, and set the custom domain in repo Settings > Pages.

## Contact CTA

The "Email Us" buttons are `mailto:` links to the address in `site.config.json`.
