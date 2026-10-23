# Sapper Websites

Static one-page site for **Sapper Websites**, a DBA of Sapper Advanced Technologies LLC. Plain HTML and CSS, no framework, no backend, hosted free on GitHub Pages. The visual style (colors, Archivo/Inter type, buttons, header, footer) follows sapperadvanced.com.

Live (GitHub Pages): https://lwb2000247.github.io/sapper-websites/
Future domain: https://sapperwebsites.com

## Change brand, domain, footer text, contact details in one place

Edit `site.config.json`, then run:

    python3 build.py

This regenerates `index.html`, `thanks.html`, `terms.html`, `privacy.html`, `sitemap.xml` and `robots.txt` (canonical, Open Graph and sitemap URLs use `domain`). The request form is delivered to `form_email`. The homepage headline is `slogan`. The public pages do not show `phone_display`. Commit and push. No dependencies beyond Python 3.

## Hosting notes

- All asset links are relative, so the site works at `https://lwb2000247.github.io/sapper-websites/` and at the custom domain.
- `"write_cname": true` in `site.config.json`. `python3 build.py` writes `CNAME` as `sapperwebsites.com` and does not delete it.
- To use the custom domain, point DNS at GitHub Pages (A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, or a CNAME for `www` to `lwb2000247.github.io`) and set the custom domain in repo Settings > Pages.

## Website request form

The contact section (`#contact`, form at `#start`) is a short quote form: name, email, optional phone, business name, what is needed, an optional current site or domain, and one required Terms and Privacy checkbox. It posts to [FormSubmit](https://formsubmit.co) at `https://formsubmit.co/<form_email>`. To switch the inbox, change `form_email` in `site.config.json` and run `python3 build.py`.

The form does not ask for card or payment details, and it does not list prices. `reply_time` in `site.config.json` is empty by default. Leave it empty and the thank-you page does not mention a reply time. Set it (for example to `one business day`) to add the sentence “We reply within one business day.”

The agreement sentence is in `src/index.template.html`, with `consent_label`, `terms_label`, `terms_url`, `privacy_label` and `privacy_url` in `site.config.json`. The links are `terms.html` and `privacy.html` (relative, so they work on GitHub Pages and on the custom domain). The final legal texts live in `src/legal/*.html` (terms, privacy, legal notice) and are rendered unchanged into `terms.html`, `privacy.html` and `legal-notice.html` by `build.py`. These three pages are indexable, have a canonical URL, and are listed in the sitemap. `thanks.html` stays `noindex`.

`thanks.html` is where people land after a successful send. It is marked `noindex`, says we email to confirm the contract and then send the payment link, and is not in the sitemap.

FormSubmit emails `form_email` an activation link the first time the form is used. Submissions are not delivered until that link is opened, so the owner needs to send one test from the live page and confirm that email.
