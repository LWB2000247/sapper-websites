(function () {
  var root = document.querySelector("[data-work-carousel]");
  if (!root) return;
  var track = root.querySelector(".work-carousel-track");
  var slides = track ? Array.prototype.slice.call(track.querySelectorAll(".work-slide")) : [];
  var prev = root.querySelector(".work-carousel-prev");
  var next = root.querySelector(".work-carousel-next");
  var dots = Array.prototype.slice.call(root.querySelectorAll(".work-dot"));
  if (!track || !slides.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var timer = 0;
  var paused = { hover: false, focus: false, touch: false, hidden: document.hidden };

  function motion() {
    return reduce.matches ? "auto" : "smooth";
  }

  function maxLeft() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function index() {
    var best = 0;
    var bestDist = Infinity;
    var left = track.scrollLeft;
    for (var i = 0; i < slides.length; i++) {
      var dist = Math.abs(slides[i].offsetLeft - left);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  function go(i) {
    var count = slides.length;
    var max = maxLeft();
    if (i >= count) {
      track.scrollTo({ left: 0, behavior: motion() });
      return;
    }
    var n = ((i % count) + count) % count;
    var dest = Math.min(slides[n].offsetLeft, max);
    var distance = Math.abs(dest - track.scrollLeft);
    var behavior = distance > slides[0].getBoundingClientRect().width * 1.4 ? "auto" : motion();
    track.scrollTo({ left: dest, behavior: behavior });
  }

  function updateDots() {
    var current = index();
    for (var i = 0; i < dots.length; i++) {
      if (i === current) dots[i].setAttribute("aria-current", "true");
      else dots[i].removeAttribute("aria-current");
    }
  }

  function playing() {
    return !reduce.matches && !paused.hover && !paused.focus && !paused.touch && !paused.hidden;
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = 0;
  }

  function start() {
    stop();
    if (!playing()) return;
    timer = window.setInterval(function () {
      if (!playing()) return;
      var max = maxLeft();
      if (max < 2) return;
      if (track.scrollLeft >= max - 2) go(slides.length);
      else go(index() + 1);
    }, 4000);
  }

  if (prev) prev.addEventListener("click", function () { go(index() - 1); start(); });
  if (next) next.addEventListener("click", function () {
    if (track.scrollLeft >= maxLeft() - 2) go(slides.length);
    else go(index() + 1);
    start();
  });
  dots.forEach(function (dot, n) {
    dot.addEventListener("click", function () { go(n); start(); });
  });

  root.addEventListener("mouseenter", function () { paused.hover = true; stop(); });
  root.addEventListener("mouseleave", function () { paused.hover = false; start(); });
  root.addEventListener("focusin", function () { paused.focus = true; stop(); });
  root.addEventListener("focusout", function (event) {
    if (!root.contains(event.relatedTarget)) {
      paused.focus = false;
      start();
    }
  });
  root.addEventListener("pointerdown", function () { paused.touch = true; stop(); });
  root.addEventListener("pointerup", function () { paused.touch = false; start(); });
  root.addEventListener("pointercancel", function () { paused.touch = false; start(); });
  document.addEventListener("visibilitychange", function () {
    paused.hidden = document.hidden;
    if (document.hidden) stop();
    else start();
  });
  track.addEventListener("scroll", function () { updateDots(); }, { passive: true });
  track.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index() + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index() - 1);
    }
  });
  if (reduce.addEventListener) reduce.addEventListener("change", start);
  else if (reduce.addListener) reduce.addListener(start);

  updateDots();
  start();
})();
