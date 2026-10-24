/* Header menu. With JavaScript off, the links stay in the page and wrap under the logo. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var btn = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var mq = window.matchMedia("(max-width: 45rem)");

  function closeMenu() {
    if (!btn || !nav) return;
    btn.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    if (mq.matches) nav.setAttribute("hidden", "");
    else nav.removeAttribute("hidden");
  }

  if (btn && nav) {
    closeMenu();
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
        return;
      }
      btn.setAttribute("aria-expanded", "true");
      nav.classList.add("is-open");
      nav.removeAttribute("hidden");
    });
    var onChange = function () { closeMenu(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) links[i].addEventListener("click", closeMenu);
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var scrolled = false;
  function markScroll() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    var next = !reduceMotion.matches && y > 0;
    if (next === scrolled) return;
    scrolled = next;
    document.documentElement.classList.toggle("is-scrolled", next);
  }
  markScroll();
  window.addEventListener("scroll", markScroll, { passive: true });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", markScroll);
})();
