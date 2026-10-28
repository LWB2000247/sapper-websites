/* Scroll-linked motion for the home page.
   No JavaScript, no IntersectionObserver, or reduced motion: nothing is hidden.
   The hero headline and the mock frame are never given an entrance fade. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !window.IntersectionObserver || !window.requestAnimationFrame) return;
  if (!document.body || !document.body.classList.contains("home")) return;

  var root = document.documentElement;
  var hasView = false;
  try {
    hasView = !!(window.CSS && CSS.supports("animation-timeline: view()"));
  } catch (err) {
    hasView = false;
  }

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var wideSticky = window.matchMedia("(min-width: 64rem)");
  var phone = window.matchMedia("(max-width: 600px)");
  var alive = true;

  var heads = document.querySelectorAll("main section:not(.hero) h2");
  function wrap(h2) {
    if (h2.querySelector(".w")) return;
    var raw = h2.textContent.replace(/\s+/g, " ").trim();
    var words = raw.split(" ");
    h2.textContent = "";
    var i;
    for (i = 0; i < words.length; i++) {
      if (!words[i]) continue;
      var w = document.createElement("span");
      w.className = "w";
      var wi = document.createElement("span");
      wi.className = "wi";
      wi.textContent = words[i];
      w.appendChild(wi);
      h2.appendChild(w);
      if (i < words.length - 1) h2.appendChild(document.createTextNode(" "));
    }
  }
  function lines(h2) {
    var ws = h2.querySelectorAll(".w");
    var line = 0;
    var last = null;
    var i;
    for (i = 0; i < ws.length; i++) {
      var top = ws[i].offsetTop;
      if (last !== null && top - last > 4) line += 1;
      last = top;
      var wi = ws[i].querySelector(".wi");
      if (!wi) continue;
      var value = String(line > 7 ? 7 : line);
      if (wi.getAttribute("data-line") !== value) wi.setAttribute("data-line", value);
    }
  }
  var h;
  for (h = 0; h < heads.length; h++) wrap(heads[h]);

  if (hasView) root.classList.add("view-on");
  root.classList.add("js-motion");

  var selector = [
    "main section:not(.hero) .kicker",
    "main .section-intro",
    "main .num-list:not(.steps) > li",
    "main .work-list > li",
    "main .work-notes > li",
    "main .price-lines > li",
    "main .group-card",
    "main .price-note",
    "main .group-source",
    "main .faq-list > details",
    "main .contact-form",
    "footer.site-footer .container > p"
  ].join(",");
  var nodes = document.querySelectorAll(selector);
  var fold = window.innerHeight || 0;
  var below = [];
  var i;
  for (i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    if (el.closest(".hero, header, form, .consent")) continue;
    if (el.getBoundingClientRect().top >= fold - 1) below.push(el);
  }
  for (i = 0; i < below.length; i++) below[i].classList.add("rise");

  function show(el) { el.classList.add("is-in"); }
  function showAll() {
    for (i = 0; i < below.length; i++) show(below[i]);
    for (h = 0; h < heads.length; h++) heads[h].classList.add("is-in");
  }

  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
      watcher.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
  for (i = 0; i < below.length; i++) watcher.observe(below[i]);

  function revealHeadings(vh) {
    if (hasView) return;
    for (h = 0; h < heads.length; h++) {
      var heading = heads[h];
      var rect = heading.getBoundingClientRect();
      var start = vh * 0.96;
      var end = vh * 0.42;
      var reveal = (start - rect.top) / (start - end);
      if (reveal < 0) reveal = 0;
      if (reveal > 1) reveal = 1;
      heading.style.setProperty("--reveal", reveal.toFixed(4));
    }
  }

  var hero = document.querySelector(".hero");
  var scene = document.querySelector(".steps-scene");
  var steps = scene ? scene.querySelector(".steps") : null;
  var parallax = document.querySelectorAll(".work-marquee, .price-card, .group-grid");
  var lastScroll = window.scrollY || root.scrollTop || 0;
  var scrollSpeed = 0;
  var marqueeRate = 1;
  var marqueeTarget = 1;
  var marqueeHover = false;
  var rateLoop = false;
  var track = document.querySelector(".work-track");
  function setRate(value) {
    if (!track || !track.getAnimations) return;
    var anims = track.getAnimations();
    var n;
    for (n = 0; n < anims.length; n++) anims[n].playbackRate = value;
  }
  function easeRate() {
    if (!alive) { rateLoop = false; return; }
    scrollSpeed *= 0.9;
    if (!marqueeHover) {
      var extra = scrollSpeed / 36;
      if (extra > 0.6) extra = 0.6;
      marqueeTarget = 1 + extra;
    }
    marqueeRate += (marqueeTarget - marqueeRate) * 0.12;
    if (marqueeRate < 0.35) marqueeRate = 0.35;
    if (marqueeRate > 1.6) marqueeRate = 1.6;
    setRate(marqueeRate);
    if (scrollSpeed > 0.35 || Math.abs(marqueeRate - marqueeTarget) > 0.02 || marqueeHover) {
      window.requestAnimationFrame(easeRate);
    } else {
      rateLoop = false;
      marqueeRate = 1;
      setRate(1);
    }
  }
  function kickRate() {
    if (rateLoop) return;
    rateLoop = true;
    window.requestAnimationFrame(easeRate);
  }
  function revealReached(vh) {
    var n;
    for (n = 0; n < below.length; n++) {
      var item = below[n];
      if (item.classList.contains("is-in")) continue;
      if (item.getBoundingClientRect().top < vh) show(item);
    }
  }
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var ticking = false;
  function update() {
    ticking = false;
    if (!alive) return;
    var vh = window.innerHeight || 1;
    var max = root.scrollHeight - vh;
    var y = window.scrollY || root.scrollTop || 0;
    var progress = max > 0 ? y / max : 0;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    root.style.setProperty("--scroll", String(progress));

    if (hero) {
      var hr = hero.getBoundingClientRect();
      var hp = hr.height > 0 ? -hr.top / hr.height : 0;
      if (hp < 0) hp = 0;
      if (hp > 1) hp = 1;
      hero.style.setProperty("--hero-p", String(hp));
    }

    var p;
    for (p = 0; p < parallax.length; p++) {
      var box = parallax[p].getBoundingClientRect();
      var t = 1 - box.top / vh;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      parallax[p].style.setProperty("--p", String(t));
    }

    if (steps && wideSticky.matches) {
      var sr = scene.getBoundingClientRect();
      var travel = sr.height - vh;
      var sp = travel > 0 ? -sr.top / travel : 0;
      if (sp < 0) sp = 0;
      if (sp > 1) sp = 1;
      steps.style.setProperty("--step", String(sp));
      var count = steps.children.length || 1;
      var idx = Math.floor(sp * count);
      if (idx > count - 1) idx = count - 1;
      if (sp > 0.97) idx = count - 1;
      if (steps.getAttribute("data-step") !== String(idx)) steps.setAttribute("data-step", String(idx));
      var active = steps.children[idx];
      var seen = false;
      if (active) {
        var ar = active.getBoundingClientRect();
        seen = ar.top < vh * 0.92 && ar.bottom > 0;
      }
      var c;
      for (c = 0; c < steps.children.length; c++) {
        var step = steps.children[c];
        if (step === active && seen) {
          if (!step.classList.contains("is-live")) step.classList.add("is-live");
        } else if (step.classList.contains("is-live")) {
          step.classList.remove("is-live");
        }
      }
    }

    var dy = Math.abs(y - lastScroll);
    lastScroll = y;
    if (dy > 0.5) {
      scrollSpeed = scrollSpeed * 0.65 + dy * 0.35;
      if (!marqueeHover) {
        var extraNow = scrollSpeed / 36;
        if (extraNow > 0.6) extraNow = 0.6;
        marqueeTarget = 1 + extraNow;
      }
      kickRate();
    }

    revealHeadings(vh);
    revealReached(vh);
  }
  function onScroll() {
    if (!alive || ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  function regroup() {
    if (!alive) return;
    for (h = 0; h < heads.length; h++) lines(heads[h]);
  }
  window.requestAnimationFrame(function () {
    regroup();
    update();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(regroup);
  }
  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(regroup, 120);
  }, { passive: true });

  if (fine.matches) {
    root.classList.add("js-glide");
    root.classList.add("js-magnet");
    var magnets = document.querySelectorAll(".btn, .nav-cta, .float-cta");
    function place(btn, event) {
      if (!alive || !fine.matches) return;
      if (event.pointerType && event.pointerType !== "mouse") return;
      if (btn.classList.contains("float-cta") && (phone.matches || btn.classList.contains("hide"))) return;
      var rect = btn.getBoundingClientRect();
      var dx = event.clientX - (rect.left + rect.width / 2);
      var dy = event.clientY - (rect.top + rect.height / 2);
      var mx = dx * 0.22;
      var my = dy * 0.22;
      if (mx > 8) mx = 8;
      if (mx < -8) mx = -8;
      if (my > 6) my = 6;
      if (my < -6) my = -6;
      if (btn.classList.contains("float-cta")) {
        btn.style.transform = "translateX(calc(-50% + " + mx.toFixed(2) + "px)) translateY(" + my.toFixed(2) + "px) scale(1.02)";
      } else {
        btn.style.transform = "translate(" + mx.toFixed(2) + "px," + my.toFixed(2) + "px) scale(1.02)";
      }
    }
    var m;
    for (m = 0; m < magnets.length; m++) {
      (function (btn) {
        btn.addEventListener("pointermove", function (event) { place(btn, event); });
        btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
        btn.addEventListener("pointercancel", function () { btn.style.transform = ""; });
      })(magnets[m]);
    }
    var pill = document.querySelector(".float-cta");
    if (pill) {
      window.addEventListener("scroll", function () {
        if (pill.classList.contains("hide") && pill.style.transform) pill.style.transform = "";
      }, { passive: true });
    }

    var marquee = document.querySelector(".work-marquee");
    if (marquee && track && track.getAnimations) {
      marquee.addEventListener("pointerenter", function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;
        marqueeHover = true;
        marqueeTarget = 0.35;
        kickRate();
      });
      marquee.addEventListener("pointerleave", function () {
        marqueeHover = false;
        marqueeTarget = 1;
        kickRate();
      });
    }
  }

  var pointerFine = window.matchMedia("(pointer: fine)");
  var mock = hero ? hero.querySelector(".example") : null;
  function clearTilt() {
    if (!mock) return;
    mock.style.removeProperty("--tilt-x");
    mock.style.removeProperty("--tilt-y");
    mock.style.removeProperty("--tilt-rx");
    mock.style.removeProperty("--tilt-ry");
  }
  if (pointerFine.matches && hero && mock) {
    hero.addEventListener("pointermove", function (event) {
      if (!alive) return;
      if (event.pointerType && event.pointerType !== "mouse") return;
      var rect = mock.getBoundingClientRect();
      var nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
      var ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
      if (nx > 1) nx = 1;
      if (nx < -1) nx = -1;
      if (ny > 1) ny = 1;
      if (ny < -1) ny = -1;
      mock.style.setProperty("--tilt-x", (nx * 5).toFixed(2) + "px");
      mock.style.setProperty("--tilt-y", (ny * 4).toFixed(2) + "px");
      mock.style.setProperty("--tilt-ry", (nx * -3.5).toFixed(2) + "deg");
      mock.style.setProperty("--tilt-rx", (ny * 2.5).toFixed(2) + "deg");
    });
    hero.addEventListener("pointerleave", clearTilt);
    hero.addEventListener("pointercancel", clearTilt);
  }

  if (reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (!reduce.matches) return;
      alive = false;
      clearTilt();
      root.classList.remove("js-motion");
      root.classList.remove("view-on");
      root.classList.remove("js-glide");
      root.classList.remove("js-magnet");
      root.classList.add("motion-settled");
      showAll();
    });
  }
})();
