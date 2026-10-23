/* Form checks. Progressive: if this file does not run, the form still posts to FormSubmit.
   For every text field, in order:
   1. Trim, then enforce a maximum length.
   2. Reject markup and script-like text: angle brackets, javascript: and data: URLs,
      onerror= / onload= style handlers, template markers, null bytes, and control characters.
   3. Email must match a simple strict pattern. Phone may use only digits, spaces, and + - ( ).
      A site must be a hostname or an http(s) URL and must not contain spaces.
   4. "What you need" may contain at most two URLs.
   5. The Terms and Privacy checkbox is required.
   6. Spam traps: the honeypot must stay empty, and a send in the first 3 seconds is refused.
   The messages below are plain language. They do not name the rule that failed.
*/
(function (root) {
  "use strict";
  var LIMITS = { name: 80, email: 120, phone: 30, business: 120, need: 1500, site: 200 };
  var WAIT_MS = 3000;
  var PLAIN = "Please rephrase this so it is plain text.";
  var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  var PHONE_RE = /^[0-9+() -]+$/;
  var HOST_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  var URL_RE = /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s]*)?$/i;

  function hasControl(value, allowBreaks) {
    for (var i = 0; i < value.length; i++) {
      var c = value.charCodeAt(i);
      if (c === 0 || c === 127 || c < 32) {
        if (allowBreaks && (c === 9 || c === 10 || c === 13)) continue;
        return true;
      }
    }
    return false;
  }

  function looksUnsafe(value, allowBreaks) {
    if (/[<>]/.test(value)) return true;
    if (/javascript\s*:/i.test(value)) return true;
    if (/data\s*:/i.test(value)) return true;
    if (/on[a-z]+\s*=/i.test(value)) return true;
    if (/<\s*script/i.test(value)) return true;
    if (value.indexOf("{{") !== -1 || value.indexOf("${") !== -1) return true;
    if (hasControl(value, allowBreaks)) return true;
    return false;
  }

  function countUrls(value) {
    var found = value.match(/https?:\/\/\S+|www\.\S+/gi);
    return found ? found.length : 0;
  }

  function trim(value) {
    return String(value == null ? "" : value).trim();
  }

  function validate(input, opts) {
    var errors = {};
    var name = trim(input.name);
    var email = trim(input.email);
    var phone = trim(input.phone);
    var business = trim(input.business);
    var need = trim(input.need);
    var site = trim(input.site);
    var honey = trim(input.honey);
    var elapsed = opts && typeof opts.elapsedMs === "number" ? opts.elapsedMs : 0;

    function checkText(key, value, limit, allowBreaks) {
      if (value.length > limit) {
        errors[key] = "Please shorten this answer.";
        return;
      }
      if (value && looksUnsafe(value, allowBreaks)) errors[key] = PLAIN;
    }

    if (!name) errors.name = "Please enter your name.";
    else checkText("name", name, LIMITS.name, false);

    if (!email) errors.email = "Please enter your email address.";
    else if (!errors.email) {
      checkText("email", email, LIMITS.email, false);
      if (!errors.email && (email.indexOf("..") !== -1 || !EMAIL_RE.test(email))) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (phone) {
      checkText("phone", phone, LIMITS.phone, false);
      if (!errors.phone && (!PHONE_RE.test(phone) || !/\d/.test(phone))) {
        errors.phone = "Please enter a phone number using digits, spaces, and + - ( ).";
      }
    }

    if (!business) errors.business = "Please enter the business name.";
    else checkText("business", business, LIMITS.business, false);

    if (!need) errors.need = "Please say what you need.";
    else {
      checkText("need", need, LIMITS.need, true);
      if (!errors.need && countUrls(need) > 2) {
        errors.need = "Please include no more than two links in this answer.";
      }
    }

    if (site) {
      checkText("site", site, LIMITS.site, false);
      if (!errors.site && (/\s/.test(site) || !(HOST_RE.test(site) || URL_RE.test(site)))) {
        errors.site = "Please enter a domain or a web address, with no spaces.";
      }
    }

    if (!input.consent) errors.consent = "Please agree to the Terms of Service and Privacy Policy.";

    if (honey || elapsed < WAIT_MS) {
      errors.form = "Please check the form and try again in a moment.";
    }

    return { ok: Object.keys(errors).length === 0, errors: errors, values: {
      name: name, email: email, phone: phone, business: business, need: need, site: site
    } };
  }

  root.formGuard = { validate: validate, LIMITS: LIMITS, WAIT_MS: WAIT_MS };
})(typeof globalThis !== "undefined" ? globalThis : this);
