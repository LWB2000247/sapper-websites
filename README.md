# Sapper Websites

Static one-page site for **Sapper Websites**, a DBA of Sapper Advanced Technologies LLC. Plain HTML and CSS, no framework, no backend, hosted free on GitHub Pages. The visual style (colors, Archivo/Inter type, buttons, header, footer) follows sapperadvanced.com.

Live (GitHub Pages): https://lwb2000247.github.io/sapper-websites/
Future domain: https://sapperwebsites.com

## Change brand, domain, footer text, contact details in one place

Edit `site.config.json`, then run:

    python3 build.py

This regenerates `index.html`, `thanks.html`, `terms.html`, `privacy.html`, `sitemap.xml` and `robots.txt` (canonical, Open Graph and sitemap URLs use `domain`). The request form is delivered to `form_email`. Commit and push. No dependencies beyond Python 3.

## Hosting notes

- All asset links are relative, so the site works at `https://lwb2000247.github.io/sapper-websites/` and at the custom domain.
- No `CNAME` file is committed. With a `CNAME` set, GitHub redirects the github.io URL to the custom domain, which would show an error until DNS for sapperwebsites.com is live.
- To switch to the custom domain: point DNS at GitHub Pages (A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, or a CNAME for `www` to `lwb2000247.github.io`), set `"write_cname": true` in `site.config.json`, run `python3 build.py`, commit, and set the custom domain in repo Settings > Pages.

## Website request form

The contact section (`#contact`, form at `#start`) is the quote form, in four labelled parts: You, Business, Project, and Send. With JavaScript those parts are steps. Without it, every part is on the page and the form still posts. It posts to [FormSubmit](https://formsubmit.co) at `https://formsubmit.co/<form_email>`. To switch the inbox, change `form_email` in `site.config.json` and run `python3 build.py`.

The form does not ask for card or payment details, and it does not list prices. `reply_time` in `site.config.json` is empty by default. Leave it empty and the thank-you page does not mention a reply time. Set it (for example to `one business day`) to add the sentence “We reply within one business day.”

Required checkboxes for “what you need” and “pages wanted” are pill choices when JavaScript is on. Without JavaScript those same choices are a required multi-select, so a request still cannot be sent with none chosen.

The rights sentence is `rights_label`. The agreement sentence is in `src/index.template.html`, with `consent_label`, `terms_label`, `terms_url`, `privacy_label` and `privacy_url` in `site.config.json`. The links are `terms.html` and `privacy.html` (relative, so they work on GitHub Pages and on the custom domain). Both pages are `noindex`, say only “Coming soon”, and are not in the sitemap.

`thanks.html` is where people land after a successful send. It is marked `noindex`, says we email to confirm the contract and then send the payment link, and is not in the sitemap.

FormSubmit emails `form_email` an activation link the first time the form is used. Submissions are not delivered until that link is opened, so the owner needs to send one test from the live page and confirm that email.
