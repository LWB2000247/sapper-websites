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

  var pill = document.querySelector(".float-cta");
  if (!pill) return;
  var ticking = false;
  function pillClearsContent() {
    if (getComputedStyle(pill).display === "none") {
      pill.classList.remove("blocked");
      return;
    }
    var pr = pill.getBoundingClientRect();
    var blocked = false;
    var nodes = document.querySelectorAll("h1,h2,h3,p,a,button,label");
    var i, el, r, s;
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      if (pill.contains(el)) continue;
      s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") continue;
      r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.bottom > pr.top + 2 && r.top < pr.bottom - 2 && r.right > pr.left + 2 && r.left < pr.right - 2) {
        blocked = true;
        break;
      }
    }
    pill.classList.toggle("blocked", blocked);
  }
  function schedule() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      pillClearsContent();
    });
  }
  pillClearsContent();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
})();
