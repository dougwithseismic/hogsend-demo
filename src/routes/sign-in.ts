import type { RoutesFn } from "@hogsend/engine";
import { ssoConfigured } from "../sso/auth.js";

/**
 * /sign-in — the demo site's `*.hogsend.com` SSO page, in the landing's
 * crimzon language. Same passwordless flow as hogsend.com and the course:
 * email → 6-digit code (primary) → signed in; "email me a link instead" as
 * the fallback. A visitor already signed in on a sibling site never lands
 * here (the nav shows them signed in) — but if they do, the page recognises
 * the session and offers to continue. Unmounted when SSO_* is unset.
 *
 * This sign-in is for YOUR hogsend.com account (the cross-site identity the
 * bell + lifecycle events ride on). It is not the Studio's shared demo login,
 * which stays on the landing page.
 */

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 2L15 14H1z" fill="#f64838"/></svg>`,
  );

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sign in — Forgeline, a Hogsend demo</title>
<meta name="robots" content="noindex" />
<link rel="icon" href="${FAVICON}" />
<link rel="preconnect" href="https://rsms.me/" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
<style>
  :root {
    --ink: #050101; --accent: #f64838;
    --hair: rgba(255,255,255,0.1); --rule: rgba(246,72,56,0.2);
    --t75: rgba(255,255,255,0.75); --t55: rgba(255,255,255,0.55); --t40: rgba(255,255,255,0.4);
    --sans: "Inter", ui-sans-serif, system-ui, sans-serif;
    --display: "InterDisplay", "Inter", ui-sans-serif, system-ui, sans-serif;
    --mono: ui-monospace, "SFMono-Regular", monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 24px;
    background: var(--ink); color: #fff; font-family: var(--sans);
    font-size: 15px; line-height: 1.55; letter-spacing: -0.02em;
    -webkit-font-smoothing: antialiased;
  }
  .card { width: 100%; max-width: 400px; }
  .brand { display: flex; align-items: baseline; gap: 10px; text-decoration: none; color: inherit; }
  .brand b { font-size: 15px; font-weight: 600; }
  .brand span { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--t40); }
  h1 { margin: 28px 0 0; font-family: var(--display); font-weight: 400; font-size: 32px; line-height: 1.15; letter-spacing: -0.01em; }
  .sub { margin: 12px 0 0; font-size: 14px; color: var(--t55); }
  form { margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
  label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--t40); }
  input {
    width: 100%; border: 1px solid var(--hair); border-radius: 6px;
    background: rgba(255,255,255,0.04); color: #fff; padding: 12px 14px;
    font-family: var(--sans); font-size: 15px; letter-spacing: -0.02em; outline: none;
  }
  input:focus { border-color: rgba(246,72,56,0.5); }
  input[name="otp"] { font-family: var(--mono); font-size: 22px; letter-spacing: 8px; text-align: center; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 6px; font-weight: 500; letter-spacing: -0.025em; cursor: pointer;
    border: 0; font-size: 15px; padding: 12px 16px; background: #fff; color: #0a0a0a;
    transition: background 0.2s;
  }
  .btn:hover { background: rgba(255,255,255,0.9); }
  .btn[disabled] { opacity: 0.7; cursor: default; }
  .alt { margin-top: 16px; font-size: 13px; color: var(--t40); }
  .alt button, .alt a { background: none; border: 0; padding: 0; cursor: pointer; color: var(--t75); font: inherit; letter-spacing: inherit; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(255,255,255,0.3); }
  .alt button:hover, .alt a:hover { color: #fff; }
  .msg { margin-top: 16px; font-size: 13px; color: var(--t55); min-height: 20px; }
  .msg.err { color: #ff8c76; }
  .hidden { display: none; }
  .rule { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--rule); font-size: 13px; color: var(--t40); }
  .rule a { color: var(--t55); text-decoration: none; }
  .rule a:hover { color: #fff; }
</style>
</head>
<body>
  <div class="card">
    <a class="brand" href="/">
      <svg width="12" height="11" viewBox="0 0 9 8" aria-hidden="true"><path d="M4.5 0L9 8H0z" fill="#f64838"/></svg>
      <b>Forgeline</b>
      <span>a Hogsend demo</span>
    </a>

    <div id="step-signed-in" class="hidden">
      <h1>You're signed in.</h1>
      <p class="sub">This browser carries your hogsend.com sign-in — the demo already knows you.</p>
      <form id="form-continue"><button class="btn" type="submit">Continue →</button></form>
      <p class="alt">Not you? <button type="button" id="do-signout">Sign out</button></p>
    </div>

    <div id="step-email">
      <h1>Sign in.</h1>
      <p class="sub">One account across hogsend.com, the course, and this demo — your notification bell follows you. We'll email you a 6-digit code.</p>
      <form id="form-email">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required placeholder="you@company.com" />
        <button class="btn" type="submit">Email me a code</button>
      </form>
      <p class="alt">Prefer a link? <button type="button" id="do-magic">Email me a sign-in link instead</button></p>
    </div>

    <div id="step-code" class="hidden">
      <h1>Check your inbox.</h1>
      <p class="sub">Enter the 6-digit code we sent to <b id="sent-to"></b>. It expires in 15 minutes.</p>
      <form id="form-code">
        <label for="otp">Code</label>
        <input id="otp" name="otp" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" required placeholder="······" />
        <button class="btn" type="submit">Sign in</button>
      </form>
      <p class="alt"><button type="button" id="do-back">Use a different email</button></p>
    </div>

    <p class="msg" id="msg" role="status"></p>
    <p class="rule">Signing in sets one session cookie, shared across *.hogsend.com. <a href="/cookies">What this site stores</a></p>
  </div>

<script>
  const qs = new URLSearchParams(location.search);
  const rawNext = qs.get("next") || "/";
  // Same-origin paths only — never an absolute URL.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const msg = document.getElementById("msg");
  const show = (id) => {
    for (const s of ["step-signed-in", "step-email", "step-code"]) {
      document.getElementById(s).classList.toggle("hidden", s !== id);
    }
    msg.textContent = ""; msg.classList.remove("err");
  };
  const say = (text, err) => { msg.textContent = text; msg.classList.toggle("err", Boolean(err)); };
  const post = (path, body) => fetch(path, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let email = "";

  fetch("/api/sso/get-session", { credentials: "include" })
    .then((r) => (r.ok ? r.json() : null))
    .then((s) => { if (s && s.user) show("step-signed-in"); })
    .catch(() => {});

  document.getElementById("form-email").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button"); btn.disabled = true;
    email = document.getElementById("email").value.trim();
    say("Sending…");
    const res = await post("/api/sso/email-otp/send-verification-otp", { email, type: "sign-in" }).catch(() => null);
    btn.disabled = false;
    if (res && res.ok) {
      document.getElementById("sent-to").textContent = email;
      show("step-code");
      document.getElementById("otp").focus();
    } else {
      say("Couldn't send the code — try again in a moment.", true);
    }
  });

  document.getElementById("form-code").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button"); btn.disabled = true;
    const otp = document.getElementById("otp").value.trim();
    say("Checking…");
    const res = await post("/api/sso/sign-in/email-otp", { email, otp }).catch(() => null);
    if (res && res.ok) {
      say("Signed in — one moment.");
      location.href = next;
    } else {
      btn.disabled = false;
      say("That code didn't match — check it and try again.", true);
    }
  });

  document.getElementById("do-magic").addEventListener("click", async () => {
    email = document.getElementById("email").value.trim();
    if (!email) { say("Enter your email first.", true); return; }
    say("Sending…");
    const res = await post("/api/sso/sign-in/magic-link", { email, callbackURL: next }).catch(() => null);
    say(res && res.ok ? "Link sent — check your inbox." : "Couldn't send the link — try again in a moment.", !(res && res.ok));
  });

  document.getElementById("do-back").addEventListener("click", () => show("step-email"));

  document.getElementById("form-continue").addEventListener("submit", (e) => {
    e.preventDefault(); location.href = next;
  });

  document.getElementById("do-signout").addEventListener("click", async () => {
    await post("/api/sso/sign-out", {}).catch(() => {});
    show("step-email");
  });
</script>
</body>
</html>`;

export const signInRoute: RoutesFn = (app) => {
  if (!ssoConfigured()) return;
  app.get("/sign-in", (c) => c.html(html));
};
