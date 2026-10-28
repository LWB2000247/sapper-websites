/* Loads Microsoft Clarity and Google Analytics only after a stored Accept choice. No inline script. */
(function () {
  "use strict";
  var KEY = "sapper_consent";
  var GA_ID = "G-4MWTYSKJFT";
  var root = document.documentElement;
  var projectId = root.getAttribute("data-clarity-id");
  if (!projectId) return;

  var loaded = false;
  var gaLoaded = false;
  var dialog = null;
  var returnFocus = false;

  function read() {
    try {
      return localStorage.getItem(KEY);
    } catch (err) {
      return null;
    }
  }

  function write(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (err) {}
  }

  function expireCookie(name) {
    var host = location.hostname;
    var labels = host.split(".");
    var domains = ["", host];
    if (labels.length > 1) domains.push("." + labels.slice(-2).join("."));
    var j;
    for (j = 0; j < domains.length; j++) {
      var domain = domains[j] ? "; domain=" + domains[j] : "";
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + domain;
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure" + domain;
    }
  }

  function loadClarity() {
    if (loaded || window.clarity) return;
    loaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", projectId);
  }

  function clearClarityCookies() {
    var names = ["_clck", "_clsk"];
    var i;
    for (i = 0; i < names.length; i++) expireCookie(names[i]);
  }

  function loadGtag() {
    if (gaLoaded) return;
    gaLoaded = true;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    var first = document.getElementsByTagName("script")[0];
    if (first && first.parentNode) first.parentNode.insertBefore(script, first);
    else document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }

  function clearGaCookies() {
    var names = ["_ga", "_ga_" + GA_ID.slice(2)];
    var parts = document.cookie ? document.cookie.split(";") : [];
    var i;
    for (i = 0; i < parts.length; i++) {
      var name = parts[i].split("=")[0].replace(/^\s+/, "");
      if (name.indexOf("_ga_") === 0 && names.indexOf(name) === -1) names.push(name);
    }
    for (i = 0; i < names.length; i++) expireCookie(names[i]);
  }

  function closeDialog() {
    var shouldReturn = returnFocus;
    returnFocus = false;
    if (dialog && dialog.parentNode) dialog.parentNode.removeChild(dialog);
    dialog = null;
    root.classList.remove("consent-open");
    if (shouldReturn) {
      var settings = document.querySelector(".cookie-settings");
      if (settings) settings.focus();
    }
  }

  function openDialog(fromControl) {
    if (dialog) return;
    returnFocus = !!fromControl;
    root.classList.add("consent-open");
    dialog = document.createElement("div");
    dialog.className = "consent-banner";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Cookie consent");
    dialog.setAttribute("aria-describedby", "consent-banner-text");
    dialog.tabIndex = -1;

    var text = document.createElement("p");
    text.id = "consent-banner-text";
    text.textContent = "We use Microsoft Clarity to see how visitors use this site. It sets cookies and records anonymised sessions, with form fields masked. You can accept or decline.";

    var actions = document.createElement("div");
    actions.className = "consent-actions";

    var accept = document.createElement("button");
    accept.type = "button";
    accept.className = "consent-choice";
    accept.textContent = "Accept";

    var decline = document.createElement("button");
    decline.type = "button";
    decline.className = "consent-choice";
    decline.textContent = "Decline";

    var privacy = document.createElement("a");
    privacy.href = "/privacy.html";
    privacy.textContent = "Privacy Policy";

    actions.appendChild(accept);
    actions.appendChild(decline);
    dialog.appendChild(text);
    dialog.appendChild(actions);
    dialog.appendChild(privacy);
    document.body.appendChild(dialog);

    var focusables = [accept, decline, privacy];

    dialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      var active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    accept.addEventListener("click", function () {
      write("granted");
      loadClarity();
      loadGtag();
      closeDialog();
    });

    decline.addEventListener("click", function () {
      var previous = read();
      write("denied");
      clearClarityCookies();
      clearGaCookies();
      if (previous === "granted" || loaded || gaLoaded) {
        location.reload();
        return;
      }
      closeDialog();
    });

    dialog.focus();
  }

  var choice = read();
  if (choice === "granted") {
    loadClarity();
    loadGtag();
  } else if (choice !== "denied") openDialog(false);

  var settings = document.querySelector(".cookie-settings");
  if (settings) settings.addEventListener("click", function () { openDialog(true); });
})();
