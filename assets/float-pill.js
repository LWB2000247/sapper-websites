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

  var phoneQuery = window.matchMedia("(max-width: 45rem)");
  var hero = document.querySelector(".hero");
  var layout = {
    HTML: 1, BODY: 1, MAIN: 1, SECTION: 1, HEADER: 1, FOOTER: 1
  };

  function isLayout(el) {
    if (!el || el === pill) return true;
    if (layout[el.tagName]) return true;
    if (!el.classList) return false;
    return el.classList.contains("container") || el.classList.contains("hero-grid") || el.classList.contains("hero-visual") || el.classList.contains("hero-copy") || el.classList.contains("example") || el.classList.contains("browser") || el.classList.contains("sample") || el.classList.contains("band") || el.classList.contains("home-copy") || el.classList.contains("contact-grid") || el.classList.contains("num-list") || el.classList.contains("work-list") || el.classList.contains("group-grid");
  }

  function heroOutOfView() {
    if (!phoneQuery.matches || !hero) {
      setReason("outside-hero", false);
      return;
    }
    var rect = hero.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    var inView = rect.bottom > 0 && rect.top < vh;
    setReason("outside-hero", !inView);
  }

  function contentUnderPill() {
    if (!phoneQuery.matches) {
      setReason("content", false);
      return;
    }
    var style = window.getComputedStyle(pill);
    if (style.display === "none") {
      setReason("content", false);
      return;
    }
    var rect = pill.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      setReason("content", false);
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
    setReason("content", blocked);
  }

  var pillTick = false;
  function schedulePill() {
    if (pillTick) return;
    pillTick = true;
    window.requestAnimationFrame(function () {
      pillTick = false;
      heroOutOfView();
      contentUnderPill();
    });
  }

  heroOutOfView();
  contentUnderPill();
  window.addEventListener("scroll", schedulePill, { passive: true });
  window.addEventListener("resize", schedulePill);
  if (phoneQuery.addEventListener) phoneQuery.addEventListener("change", schedulePill);
})();
