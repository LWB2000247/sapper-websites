/* Below-the-fold fade and rise. Classes are added here only.
   No JavaScript, no IntersectionObserver, or reduced motion: nothing is hidden.
   The hero headline and the first image are never targeted. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !window.IntersectionObserver) return;
  if (!document.body || !document.body.classList.contains("home")) return;

  var selector = [
    "main section:not(.hero) .kicker",
    "main section:not(.hero) h2",
    "main .section-intro",
    "main .num-list > li",
    "main .work-list > li",
    "main .work-notes > li",
    "main .price-lines > li",
    "main .group-card",
    "main .price-note",
    "main .group-source"
  ].join(",");
  var nodes = document.querySelectorAll(selector);
  var fold = window.innerHeight || 0;
  var below = [];
  var i;
  for (i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    if (el.closest(".hero, header, form, .consent")) continue;
    var top = el.getBoundingClientRect().top;
    if (top >= fold - 1) below.push(el);
  }
  if (!below.length) return;

  document.documentElement.classList.add("js-motion");
  for (i = 0; i < below.length; i++) below[i].classList.add("rise");

  function show(el) {
    el.classList.add("is-in");
  }
  function showAll() {
    for (i = 0; i < below.length; i++) show(below[i]);
  }
  function rescue() {
    var height = window.innerHeight || 0;
    for (i = 0; i < below.length; i++) {
      var item = below[i];
      if (item.classList.contains("is-in")) continue;
      var rect = item.getBoundingClientRect();
      if (rect.top < height && rect.bottom > 0) show(item);
    }
  }

  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
      watcher.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
  for (i = 0; i < below.length; i++) watcher.observe(below[i]);

  window.addEventListener("scroll", rescue, { passive: true });
  window.setTimeout(rescue, 1000);
  window.setTimeout(showAll, 8000);
  if (reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (!reduce.matches) return;
      document.documentElement.classList.remove("js-motion");
      showAll();
    });
  }
})();
