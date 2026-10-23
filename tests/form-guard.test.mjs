import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("../assets/form-guard.js", import.meta.url), "utf8");
const sandbox = { globalThis: {} };
sandbox.globalThis = sandbox;
vm.runInNewContext(code, sandbox);
const { validate } = sandbox.formGuard;

function fields(over) {
  return Object.assign({
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+1 740 259 5954",
    business: "Example Bakery",
    need: "A small site with a menu and a contact form.",
    site: "example.com",
    consent: true,
    honey: ""
  }, over);
}

let failed = 0;
function check(name, cond, detail) {
  if (cond) {
    console.log("PASS", name);
    return;
  }
  failed += 1;
  console.error("FAIL", name, detail || "");
}

const good = validate(fields(), { elapsedMs: 4000 });
check("normal request passes", good.ok === true, JSON.stringify(good.errors));

const script = validate(fields({ need: "Hello <script>alert(1)</script>" }), { elapsedMs: 4000 });
check("script tag blocked", script.ok === false && script.errors.need, JSON.stringify(script.errors));

const jsUrl = validate(fields({ site: "javascript:alert(1)" }), { elapsedMs: 4000 });
check("javascript URL blocked", jsUrl.ok === false && jsUrl.errors.site, JSON.stringify(jsUrl.errors));

const email = validate(fields({ email: "not-an-email" }), { elapsedMs: 4000 });
check("invalid email blocked", email.ok === false && email.errors.email, JSON.stringify(email.errors));

const long = validate(fields({ name: "A".repeat(81) }), { elapsedMs: 4000 });
check("over-long name blocked", long.ok === false && long.errors.name, JSON.stringify(long.errors));

const dataUrl = validate(fields({ need: "See data:text/html,hi" }), { elapsedMs: 4000 });
check("data URL blocked", dataUrl.ok === false && dataUrl.errors.need, JSON.stringify(dataUrl.errors));

const handler = validate(fields({ business: "Shop onerror=alert(1)" }), { elapsedMs: 4000 });
check("onerror handler blocked", handler.ok === false && handler.errors.business, JSON.stringify(handler.errors));

const braces = validate(fields({ name: "Hi {{7*7}}" }), { elapsedMs: 4000 });
check("template marker blocked", braces.ok === false && braces.errors.name, JSON.stringify(braces.errors));

const dollar = validate(fields({ name: "Hi ${7}" }), { elapsedMs: 4000 });
check("dollar marker blocked", dollar.ok === false && dollar.errors.name, JSON.stringify(dollar.errors));

const nul = validate(fields({ name: "Ada\u0000Lovelace" }), { elapsedMs: 4000 });
check("null byte blocked", nul.ok === false && nul.errors.name, JSON.stringify(nul.errors));

const urls = validate(fields({
  need: "Look at https://a.example/one and https://b.example/two and www.c.example/three please."
}), { elapsedMs: 4000 });
check("three links blocked", urls.ok === false && /two links/.test(urls.errors.need || ""), JSON.stringify(urls.errors));

const two = validate(fields({
  need: "Look at https://a.example and https://b.example only."
}), { elapsedMs: 4000 });
check("two links allowed", two.ok === true, JSON.stringify(two.errors));

const phone = validate(fields({ phone: "call me" }), { elapsedMs: 4000 });
check("phone letters blocked", phone.ok === false && phone.errors.phone, JSON.stringify(phone.errors));

const fast = validate(fields(), { elapsedMs: 500 });
check("fast submit blocked", fast.ok === false && fast.errors.form, JSON.stringify(fast.errors));

const honey = validate(fields({ honey: "bot" }), { elapsedMs: 4000 });
check("honeypot blocked", honey.ok === false && honey.errors.form, JSON.stringify(honey.errors));

const bare = validate(fields({ consent: false, phone: "", site: "" }), { elapsedMs: 4000 });
check("missing consent blocked", bare.ok === false && bare.errors.consent, JSON.stringify(bare.errors));

const optional = validate(fields({ phone: "", site: "" }), { elapsedMs: 4000 });
check("empty optional fields pass", optional.ok === true, JSON.stringify(optional.errors));

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("all form checks passed");
