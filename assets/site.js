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
})();
