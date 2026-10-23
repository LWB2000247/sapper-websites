/* Phones (<=600px): fixed white bottom strip on the normal document
   scroller. Hidden while the hero or its button is on screen, and hidden
   again over Pricing, the form, and the footer.
   Wider screens keep the fixed pill. */
(function () {
  "use strict";
  var pill = document.querySelector(".float-cta");
  if (!pill || typeof IntersectionObserver !== "function") return;
  var bar = pill.closest(".float-bar") || pill;

  var phoneQuery = window.matchMedia("(max-width: 600px)");
  var wideQuery = window.matchMedia("(max-width: 45rem)");

  var phoneReasons = Object.create(null);
  var phoneCount = 0;
  var wideReasons = Object.create(null);
  var wideCount = 0;

  function bump(store, key, on) {
    var countKey = store === phoneReasons ? "phone" : "wide";
    var had = !!store[key];
    var delta = 0;
    if (on && !had) {
      store[key] = true;
      delta = 1;
    } else if (!on && had) {
      delete store[key];
      delta = -1;
    }
    if (!delta) return;
    if (countKey === "phone") phoneCount += delta;
    else wideCount += delta;
    apply();
  }

  function apply() {
    if (phoneQuery.matches) {
      var hide = phoneCount > 0;
      bar.classList.toggle("hide", hide);
      pill.classList.toggle("hide", hide);
    } else {
      bar.classList.remove("hide");
      pill.classList.toggle("hide", wideCount > 0);
    }
  }

  /* ----- phone bar ----- */
  var phoneSections = ["pricing"].map(function (id) {
    return document.querySelector('[aria-labelledby="' + id + '"]');
  });
  phoneSections.push(document.getElementById("contact"));
  phoneSections.push(document.querySelector(".site-footer"));
  phoneSections = phoneSections.filter(Boolean);

  function near(el, extra) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    return rect.bottom > 0 && rect.top < vh + extra;
  }

  phoneSections.forEach(function (el) {
    var key = el.id || el.getAttribute("aria-labelledby") || "footer";
    bump(phoneReasons, "section:" + key, near(el, 72));
  });

  var phoneObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      var key = el.id || el.getAttribute("aria-labelledby") || "footer";
      bump(phoneReasons, "section:" + key, entry.isIntersecting);
    });
  }, { root: null, threshold: 0, rootMargin: "0px 0px 72px 0px" });
  phoneSections.forEach(function (el) { phoneObserver.observe(el); });

  var priceCta = document.querySelector(".price-card .btn");
  if (priceCta) {
    var priceObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bump(phoneReasons, "cta:pricing", entry.isIntersecting);
      });
    }, { root: null, threshold: 0, rootMargin: "0px 0px 72px 0px" });
    priceObserver.observe(priceCta);
    bump(phoneReasons, "cta:pricing", near(priceCta, 72));
  }

  var hero = document.querySelector(".hero");
  var heroCta = document.querySelector(".hero-cta");

  function heroBlocksBar() {
    if (!phoneQuery.matches) {
      bump(phoneReasons, "hero", false);
      return;
    }
    var vh = window.innerHeight || 0;
    var heroInView = false;
    var ctaStillHere = false;
    if (hero) {
      var hr = hero.getBoundingClientRect();
      heroInView = hr.bottom > 1 && hr.top < vh - 1;
    }
    if (heroCta) ctaStillHere = heroCta.getBoundingClientRect().bottom > 1;
    bump(phoneReasons, "hero", heroInView || ctaStillHere);
  }

  /* ----- fixed pill, 601px to 45rem ----- */
  var wideSections = ["work", "pricing", "group", "strengths", "steps"].map(function (id) {
    return document.querySelector('[aria-labelledby="' + id + '"]');
  });
  wideSections.push(document.getElementById("contact"));
  wideSections.push(document.querySelector(".site-footer"));
  wideSections = wideSections.filter(Boolean);

  wideSections.forEach(function (el) {
    var key = el.id || el.getAttribute("aria-labelledby") || "footer";
    bump(wideReasons, "section:" + key, near(el, 96));
  });

  var wideObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      var key = el.id || el.getAttribute("aria-labelledby") || "footer";
      bump(wideReasons, "section:" + key, entry.isIntersecting);
    });
  }, { root: null, threshold: 0, rootMargin: "0px 0px 96px 0px" });
  wideSections.forEach(function (el) { wideObserver.observe(el); });

  var wideCtas = [];
  if (heroCta) wideCtas.push(heroCta);
  if (priceCta) wideCtas.push(priceCta);

  function ctaMargin() {
    var band = 96;
    var cut = Math.max(0, (window.innerHeight || 0) - band);
    return "-" + cut + "px 0px 0px 0px";
  }

  var ctaObserver = null;
  function watchCtas() {
    if (ctaObserver) ctaObserver.disconnect();
    ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bump(wideReasons, "cta:" + (entry.target.classList.contains("hero-cta") ? "hero" : "pricing"), entry.isIntersecting);
      });
    }, { root: null, threshold: 0, rootMargin: ctaMargin() });
    wideCtas.forEach(function (el) { ctaObserver.observe(el); });
  }

  wideCtas.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    var inBand = rect.bottom > vh - 96 && rect.top < vh && rect.bottom > 0;
    bump(wideReasons, "cta:" + (el.classList.contains("hero-cta") ? "hero" : "pricing"), inBand);
  });
  if (wideCtas.length) watchCtas();

  var layout = { HTML: 1, BODY: 1, MAIN: 1, SECTION: 1, HEADER: 1, FOOTER: 1 };
  function isLayout(el) {
    if (!el || el === pill) return true;
    if (layout[el.tagName]) return true;
    if (!el.classList) return false;
    return el.classList.contains("container") || el.classList.contains("hero-grid") || el.classList.contains("hero-visual") || el.classList.contains("hero-copy") || el.classList.contains("example") || el.classList.contains("browser") || el.classList.contains("sample") || el.classList.contains("band") || el.classList.contains("home-copy") || el.classList.contains("contact-grid") || el.classList.contains("num-list") || el.classList.contains("work-list") || el.classList.contains("group-grid");
  }

  function heroOutOfView() {
    if (!wideQuery.matches || phoneQuery.matches || !hero) {
      bump(wideReasons, "outside-hero", false);
      return;
    }
    var rect = hero.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    bump(wideReasons, "outside-hero", !(rect.bottom > 0 && rect.top < vh));
  }

  function contentUnderPill() {
    if (!wideQuery.matches || phoneQuery.matches) {
      bump(wideReasons, "content", false);
      return;
    }
    var style = window.getComputedStyle(pill);
    if (style.display === "none" || style.visibility === "hidden") {
      bump(wideReasons, "content", false);
      return;
    }
    var rect = pill.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      bump(wideReasons, "content", false);
      return;
    }
    var prevVis = pill.style.visibility;
    var prevPe = pill.style.pointerEvents;
    pill.style.visibility = "hidden";
    pill.style.pointerEvents = "none";
    var blocked = false;
    var x, y, el, node;
    for (x = rect.left + 8; x <= rect.right - 8 && !blocked; x += 18) {
      for (y = rect.top + 6; y <= rect.bottom - 6 && !blocked; y += 12) {
        el = document.elementFromPoint(x, y);
        node = el;
        while (node && node !== document.body) {
          if (pill.contains(node)) break;
          if (!isLayout(node)) {
            var tag = node.tagName;
            var text = (node.innerText || node.getAttribute("alt") || "").trim();
            if (tag === "IMG" || tag === "A" || tag === "BUTTON" || tag === "LABEL" || tag === "LI" || tag === "H1" || tag === "H2" || tag === "H3" || tag === "P" || text) {
              blocked = true;
              break;
            }
          }
          node = node.parentElement;
        }
      }
    }
    pill.style.visibility = prevVis;
    pill.style.pointerEvents = prevPe;
    bump(wideReasons, "content", blocked);
  }

  var ticking = false;
  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      heroBlocksBar();
      heroOutOfView();
      contentUnderPill();
    });
  }

  heroBlocksBar();
  heroOutOfView();
  contentUnderPill();
  apply();

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", function () {
    watchCtas();
    schedule();
    apply();
  });
  if (phoneQuery.addEventListener) phoneQuery.addEventListener("change", function () { schedule(); apply(); });
  if (wideQuery.addEventListener) wideQuery.addEventListener("change", function () { schedule(); apply(); });
})();
