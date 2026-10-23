/* Fades home sections in as they enter the viewport.
   With JavaScript off, or with prefers-reduced-motion, nothing is hidden. */
(function () {
  "use strict";
  if (!window.IntersectionObserver) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var nodes = document.querySelectorAll("body.home main section:not(.hero)");
  if (!nodes.length) return;
  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      watcher.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  nodes.forEach(function (el) { watcher.observe(el); });
})();
