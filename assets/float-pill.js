/* Hides the mobile "Get my website" pill outside the hero and early sections.
   External file: the page script-src allows 'self' and not a new inline script. */
(function () {
  "use strict";
  var pill = document.querySelector(".float-cta");
  if (!pill || typeof IntersectionObserver !== "function") return;

  var reasons = Object.create(null);
  var count = 0;

  function setReason(key, on) {
    var had = !!reasons[key];
    if (on && !had) {
      reasons[key] = true;
      count += 1;
    } else if (!on && had) {
      delete reasons[key];
      count -= 1;
    }
    pill.classList.toggle("hide", count > 0);
  }

  var sections = ["work", "pricing", "group", "strengths", "steps"].map(function (id) {
    return document.querySelector('[aria-labelledby="' + id + '"]');
  });
  sections.push(document.getElementById("contact"));
  sections.push(document.querySelector(".site-footer"));
  sections = sections.filter(Boolean);

  function near(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    return rect.bottom > 0 && rect.top < vh + 96;
  }

  sections.forEach(function (el) {
    var key = el.id || el.getAttribute("aria-labelledby") || "footer";
    setReason("section:" + key, near(el));
  });

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      var key = el.id || el.getAttribute("aria-labelledby") || "footer";
      setReason("section:" + key, entry.isIntersecting);
    });
  }, { root: null, threshold: 0, rootMargin: "0px 0px 96px 0px" });
  sections.forEach(function (el) { sectionObserver.observe(el); });

  var ctas = [];
  var heroCta = document.querySelector(".hero-cta");
  var priceCta = document.querySelector(".price-card .btn");
  if (heroCta) ctas.push(heroCta);
  if (priceCta) ctas.push(priceCta);

  var ctaObserver = null;

  function ctaMargin() {
    var band = 96;
    var cut = Math.max(0, (window.innerHeight || 0) - band);
    return "-" + cut + "px 0px 0px 0px";
  }

  function watchCtas() {
    if (ctaObserver) ctaObserver.disconnect();
    ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        setReason("cta:" + (entry.target.classList.contains("hero-cta") ? "hero" : "pricing"), entry.isIntersecting);
      });
    }, { root: null, threshold: 0, rootMargin: ctaMargin() });
    ctas.forEach(function (el) { ctaObserver.observe(el); });
  }

  ctas.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    var inBand = rect.bottom > vh - 96 && rect.top < vh && rect.bottom > 0;
    setReason("cta:" + (el.classList.contains("hero-cta") ? "hero" : "pricing"), inBand);
  });

  if (ctas.length) {
    watchCtas();
    window.addEventListener("resize", watchCtas);
  }
})();
