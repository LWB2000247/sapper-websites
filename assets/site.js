/* Header menu, scroll state, and the mobile "Get my website" pill.
   With JavaScript off, the links stay in the page and wrap under the logo. */
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

  var header = document.querySelector(".site-header");
  var pill = document.querySelector(".float-cta");

  function onScroll() {
    var vh = window.innerHeight || 1;
    if (header && !header.classList.contains("solid-lock")) {
      header.classList.toggle("solid", window.scrollY > vh * 0.6);
    }
    if (!pill) return;
    var hide = false;
    var heroCta = document.querySelector(".hero-cta");
    var contact = document.getElementById("contact");
    if (heroCta) {
      var h = heroCta.getBoundingClientRect();
      if (h.bottom > 0 && h.top < vh) hide = true;
    }
    if (contact) {
      var c = contact.getBoundingClientRect();
      if (c.top < vh * 0.75 && c.bottom > vh * 0.35) hide = true;
    }
    pill.classList.toggle("hide", hide);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
