import type { RoutesFn } from "@hogsend/engine";

/**
 * Public demo landing page at `/`. Shows the shared demo credentials and a
 * one-click "Enter the demo" button that signs the visitor in (client-side, same
 * origin) and drops them into the Studio — no typing required. The creds are a
 * public shared demo login (nothing here can send real messages), so embedding
 * them in the page is intentional.
 */
const DEMO_EMAIL = "demo@hogsend.com";
const DEMO_PASSWORD = "forgeline-demo-2026";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Forgeline — live Hogsend Studio demo</title>
<meta name="description" content="A live Hogsend Studio running a fictional credit-based dev-tool SaaS. Click around real journeys, emails, buckets, and multi-channel activity." />
<style>
  :root {
    --bg: #0a0a0d; --card: #141419; --line: #24242c;
    --ink: #f4f4f6; --muted: #9a9aa6; --crimzon: #e5484d; --crimzon-2: #ff6b6f;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; background: radial-gradient(1200px 600px at 50% -10%, #1c0d10 0%, var(--bg) 55%);
    color: var(--ink); font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
    display: grid; place-items: center; padding: 32px;
  }
  .wrap { width: 100%; max-width: 560px; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 26px; }
  .dot { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(140deg, var(--crimzon), var(--crimzon-2)); box-shadow: 0 0 24px rgba(229,72,77,.5); }
  .brand b { font-size: 17px; letter-spacing: -.01em; }
  .brand span { color: var(--muted); font-size: 13px; }
  h1 { font-size: 30px; line-height: 1.15; letter-spacing: -.02em; margin: 0 0 12px; }
  h1 em { font-style: normal; color: var(--crimzon-2); }
  p.lead { color: var(--muted); margin: 0 0 26px; font-size: 15.5px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 22px; }
  .creds { display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 4px 0 20px; font-size: 14px; }
  .creds .k { color: var(--muted); }
  .creds .v { font-family: ui-monospace, "SF Mono", Menlo, monospace; color: var(--ink); }
  .btn {
    display: inline-flex; align-items: center; gap: 8px; width: 100%; justify-content: center;
    background: linear-gradient(140deg, var(--crimzon), #c62b30); color: #fff; border: 0; cursor: pointer;
    font-size: 15px; font-weight: 600; padding: 13px 18px; border-radius: 10px; text-decoration: none;
    transition: filter .15s ease, transform .05s ease;
  }
  .btn:hover { filter: brightness(1.08); }
  .btn:active { transform: translateY(1px); }
  .btn[disabled] { opacity: .7; cursor: default; }
  .alt { text-align: center; margin-top: 12px; }
  .alt a { color: var(--muted); font-size: 13px; text-decoration: none; border-bottom: 1px dotted #444; }
  .foot { color: var(--muted); font-size: 12.5px; margin-top: 22px; text-align: center; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 22px; }
  .chip { font-size: 12px; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand"><div class="dot"></div><b>Forgeline</b><span>· live demo on Hogsend</span></div>
    <h1>A lifecycle engine, <em>fully seeded</em>.</h1>
    <p class="lead">Forgeline is a fictional credit-based dev-tool SaaS. This is a real Hogsend Studio wired to its data — thousands of contacts, seven lifecycle journeys, email + in-app + Discord/Telegram activity. Sign in and click around.</p>
    <div class="chips"><span class="chip">3,214 contacts</span><span class="chip">7 journeys</span><span class="chip">46k emails</span><span class="chip">multi-channel</span><span class="chip">NPS +53</span></div>
    <div class="card">
      <div class="creds">
        <div class="k">Email</div><div class="v">${DEMO_EMAIL}</div>
        <div class="k">Password</div><div class="v">${DEMO_PASSWORD}</div>
      </div>
      <button class="btn" id="enter" onclick="enter(this)">Enter the demo →</button>
      <div class="alt"><a href="/studio/">or sign in manually at /studio</a></div>
    </div>
    <div class="foot">Shared read-only-style demo. Nothing here sends real emails or messages.</div>
  </div>
<script>
  async function enter(btn){
    btn.disabled = true; btn.textContent = "Signing in…";
    try {
      await fetch("/api/auth/sign-in/email", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ${JSON.stringify(DEMO_EMAIL)}, password: ${JSON.stringify(DEMO_PASSWORD)} })
      });
    } catch (e) { /* fall through to /studio, which shows the sign-in form */ }
    window.location.href = "/studio/";
  }
</script>
</body>
</html>`;

export const demoLandingRoute: RoutesFn = (app) => {
  app.get("/", (c) => c.html(html));
};
