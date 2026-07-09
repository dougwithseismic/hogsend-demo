import type { RoutesFn } from "@hogsend/engine";

/**
 * Public demo landing page at `/` — a one-pager in the hogsend.com crimzon
 * visual language (#050101 ink, #F64838 accent, Montserrat display, ▲ mono
 * eyebrows, red-tint page frame). Presents Forgeline (the fictional brand the
 * seed data tells) and drops the visitor into the Studio with one click.
 *
 * The creds are a public shared demo login (no email provider is configured,
 * so nothing here can send real mail) — embedding them is intentional.
 */
const DEMO_EMAIL = "demo@hogsend.com";
const DEMO_PASSWORD = "forgeline-demo-2026";
const REPO_URL = "https://github.com/dougwithseismic/hogsend-demo";
const INSTALL_COMMAND = "pnpm dlx create-hogsend@latest my-app";

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 2L15 14H1z" fill="#f64838"/></svg>`,
  );

/** ▲ mono eyebrow — the crimzon section label. */
const eyebrow = (text: string) =>
  `<span class="eyebrow"><svg width="9" height="8" viewBox="0 0 9 8" aria-hidden="true"><path d="M4.5 0L9 8H0z" fill="#f64838"/></svg>${text}</span>`;

/** Dash-drifting contour lines (the hero-canvas "ad-lib" layer). */
const waveLines = (() => {
  const paths = Array.from({ length: 8 }, (_, i) => {
    const y = 16 + i * 26;
    const lift = 24 + ((i * 13) % 26);
    const d = `M-20 ${y} C 180 ${y - lift}, 380 ${y + lift}, 620 ${y - lift / 2} S 980 ${y + lift}, 1240 ${y - lift}`;
    const opacity = (0.3 + (i % 4) * 0.16).toFixed(2);
    return `<path d="${d}" stroke="rgba(255,140,118,0.5)" stroke-width="1" stroke-opacity="${opacity}" class="dash" style="animation-delay:${i * -3.5}s"/>`;
  }).join("");
  return `<svg viewBox="0 0 1200 200" fill="none" preserveAspectRatio="none" aria-hidden="true" class="waves">${paths}</svg>`;
})();

const JOURNEYS: { name: string; id: string }[] = [
  { name: "Activation — Connect a repo", id: "activation-connect-repo" },
  { name: "Activation — First review", id: "activation-first-review" },
  { name: "Credits — Top-up nudge", id: "credits-topup-nudge" },
  { name: "Credits — Zero-balance dunning", id: "credits-dunning" },
  { name: "Expansion — Add seats", id: "expansion-seats" },
  { name: "Win-back — Repo gone quiet", id: "winback-repo-quiet" },
  { name: "Feedback — NPS with reminder", id: "feedback-nps" },
];

const journeyRows = JOURNEYS.map(
  (j) =>
    `<div class="jrow"><div><p class="jname">${j.name}</p><p class="jid">${j.id}</p></div><span class="jstate">Enabled</span></div>`,
).join("");

const STATS: { label: string; value: string }[] = [
  { label: "Contacts", value: "3,214" },
  { label: "Email sends", value: "46,000" },
  { label: "Events", value: "34,000" },
  { label: "Campaigns", value: "13" },
  { label: "NPS", value: "+53" },
];

const statItems = STATS.map(
  (s) => `<span class="stat">${s.label}<b>${s.value}</b></span>`,
).join("");

const BEATS = [
  "sign up",
  "connect repo",
  "first review",
  "credits low",
  "top up",
  "go quiet",
  "win-back",
];
const beatChips = BEATS.map((b) => `<span class="chip">${b}</span>`).join(
  `<span class="beat-arrow" aria-hidden="true">→</span>`,
);

const CARDS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Seven lifecycle journeys",
    body: "Activation, top-up nudges, zero-balance dunning, seat expansion, NPS with a reminder branch, win-back — each a <code>defineJourney()</code> TypeScript file in <code>src/journeys/</code>.",
  },
  {
    n: "02",
    title: "Fifteen React Email templates",
    body: "Welcome, receipts, digests, win-back offers in <code>src/emails/</code> — rendered by the engine, with opens and clicks tracked first-party.",
  },
  {
    n: "03",
    title: "Thirteen campaigns",
    body: "Broadcast history plus three scheduled sends, run through <code>defineCampaign()</code> — the Studio view shows status, audience, and per-send funnels.",
  },
  {
    n: "04",
    title: "Four live buckets",
    body: "<code>power-teams</code>, <code>low-credits</code>, <code>trial-ending</code>, <code>dormant-repos</code> — real-time audience membership computed from events.",
  },
  {
    n: "05",
    title: "Four channels",
    body: "The same journeys fan out to email, the in-app feed, Discord, and Telegram — one identity per contact across all of them.",
  },
  {
    n: "06",
    title: "Fifteen managed links",
    body: "Short links with ~4,500 tracked clicks in the Links view — every click is a first-party event a journey can react to.",
  },
];

const cardItems = CARDS.map(
  (c) =>
    `<div class="card"><span class="cnum">${c.n}</span><h3>${c.title}</h3><p>${c.body}</p></div>`,
).join("");

const ROUTE_STOPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Journeys",
    body: "Enrollment, completion, and per-journey funnels for all seven journeys.",
  },
  {
    n: "02",
    title: "Sends",
    body: "46,000 emails with delivered / opened / clicked / bounced state on each one.",
  },
  {
    n: "03",
    title: "Contacts",
    body: "3,214 people, each with a cross-channel timeline — events, sends, bucket transitions.",
  },
  {
    n: "04",
    title: "Campaigns & Links",
    body: "Broadcast history, three scheduled sends, and the managed short links with click stats.",
  },
];

const routeItems = ROUTE_STOPS.map(
  (s) =>
    `<div class="stop"><span class="cnum">${s.n}</span><div><h3>${s.title}</h3><p>${s.body}</p></div></div>`,
).join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Forgeline — live Hogsend Studio demo</title>
<meta name="description" content="A live Hogsend Studio running Forgeline, a fictional credit-based dev-tool SaaS. 3,214 contacts, seven lifecycle journeys, 46,000 tracked emails, campaigns, and multi-channel activity — sign in and click around." />
<meta property="og:title" content="Forgeline — live Hogsend Studio demo" />
<meta property="og:description" content="A real Hogsend Studio, fully seeded. Shared login on the page — sign in and click around." />
<meta property="og:url" content="https://demo.hogsend.com" />
<link rel="icon" href="${FAVICON}" />
<link rel="preconnect" href="https://rsms.me/" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root {
    --ink: #050101;
    --panel: #070303;
    --accent: #f64838;
    --accent-soft: rgba(246, 72, 56, 0.08);
    --rail: rgba(246, 72, 56, 0.15);
    --rule: rgba(246, 72, 56, 0.2);
    --hair: rgba(255, 255, 255, 0.1);
    --hair-faint: rgba(255, 255, 255, 0.08);
    --t75: rgba(255, 255, 255, 0.75);
    --t55: rgba(255, 255, 255, 0.55);
    --t40: rgba(255, 255, 255, 0.4);
    --sans: "Inter", ui-sans-serif, system-ui, sans-serif;
    --display: "InterDisplay", "Inter", ui-sans-serif, system-ui, sans-serif;
    --mono: "Geist Mono", ui-monospace, "SFMono-Regular", monospace;
  }
  * { box-sizing: border-box; }
  html { background: var(--ink); scrollbar-gutter: stable; }
  body {
    margin: 0; color: #fff; background: var(--ink);
    font-family: var(--sans); font-size: 15px; line-height: 1.55;
    letter-spacing: -0.02em; -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; }
  code { font-family: var(--mono); font-size: 0.9em; color: var(--t75); letter-spacing: 0; }
  .container { margin-inline: auto; width: 100%; max-width: 1256px; padding-inline: 24px; }
  @media (min-width: 768px) { .container { padding-inline: 40px; } }

  /* Page frame — full-height rails on the content-column edges. */
  .frame {
    pointer-events: none; position: fixed; inset-block: 0; left: 50%;
    transform: translateX(-50%); width: 100%; max-width: 1256px;
    border-inline: 1px solid var(--rail); z-index: 40; display: none;
  }
  @media (min-width: 1024px) { .frame { display: block; } }

  /* Nav */
  .nav {
    position: sticky; top: 0; z-index: 50;
    background: rgba(5, 1, 1, 0.75); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--hair-faint);
  }
  .nav .container { display: flex; align-items: center; gap: 16px; height: 60px; }
  .brand { display: flex; align-items: baseline; gap: 10px; text-decoration: none; }
  .brand b { font-size: 15px; font-weight: 600; letter-spacing: -0.02em; }
  .brand span { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--t40); }
  .nav-links { margin-left: auto; display: flex; align-items: center; gap: 20px; }
  .nav-links a { font-size: 14px; color: var(--t75); text-decoration: none; letter-spacing: -0.02em; }
  .nav-links a:hover { color: #fff; }
  .nav-links .ext { display: none; }
  @media (min-width: 640px) { .nav-links .ext { display: inline; } }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border-radius: 6px; font-family: var(--sans); font-weight: 500; letter-spacing: -0.025em;
    text-decoration: none; cursor: pointer; transition: background 0.2s, color 0.2s;
    border: 0; font-size: 14px; padding: 8px 16px;
  }
  .btn-solid { background: #fff; color: #0a0a0a; }
  .btn-solid:hover { background: rgba(255, 255, 255, 0.9); }
  .btn-outline { background: transparent; border: 1px solid rgba(255, 255, 255, 0.25); color: #fff; }
  .btn-outline:hover { background: rgba(255, 255, 255, 0.06); }
  .btn-lg { font-size: 16px; padding: 14px 20px; }
  .btn[disabled] { opacity: 0.7; cursor: default; }

  /* Eyebrow */
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em;
    text-transform: uppercase; color: #fff;
  }

  /* Hero */
  .hero { position: relative; overflow: hidden; }
  .hero-inner { display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 72px; }
  h1 {
    margin: 24px 0 0; max-width: 840px; font-family: var(--display); font-weight: 400;
    font-size: clamp(40px, 6vw, 64px); line-height: 1.08; letter-spacing: -0.02em;
  }
  .dim { color: var(--t40); }
  .lead { margin: 24px 0 0; max-width: 660px; font-size: 18px; line-height: 27px; letter-spacing: -0.025em; color: var(--t75); }
  .cta-row { margin-top: 36px; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
  .creds {
    margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
    gap: 8px 24px; border: 1px solid var(--hair); background: rgba(255, 255, 255, 0.04);
    border-radius: 6px; padding: 10px 18px; font-family: var(--mono); font-size: 13px; letter-spacing: 0;
  }
  .creds .k { color: var(--t40); margin-right: 8px; }
  .creds .v { color: var(--t75); user-select: all; }
  .hero-note { margin-top: 16px; font-size: 13px; letter-spacing: -0.02em; color: var(--t40); }

  /* Hero canvas — ink panel, contour lines, planet-horizon glow. */
  .canvas-wrap { position: relative; margin-top: 56px; }
  .canvas { position: relative; height: 300px; overflow: hidden; border-radius: 16px; background: var(--panel); }
  @media (min-width: 768px) { .canvas { height: 340px; } }
  .waves { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.8; }
  .dash { stroke-dasharray: 4 8; animation: dash-drift 26s linear infinite; }
  @keyframes dash-drift { to { stroke-dashoffset: -240; } }
  .glow, .horizon { position: absolute; inset: 0; pointer-events: none; }
  .glow { background: radial-gradient(80% 70% at 50% 118%, rgba(246,72,56,0.85) 0%, rgba(246,72,56,0.3) 40%, rgba(246,72,56,0.07) 65%, transparent 82%); }
  .horizon { background: radial-gradient(58% 46% at 50% 116%, transparent 59%, rgba(255,150,128,0.9) 61.5%, rgba(255,150,128,0.12) 66%, transparent 71%); }

  /* Studio window mock floating over the canvas. */
  .window {
    position: relative; z-index: 10; margin: -240px auto 0; max-width: 720px;
    border: 1px solid var(--hair); border-radius: 12px;
    background: rgba(10, 6, 6, 0.92); backdrop-filter: blur(14px);
    text-align: left; overflow: hidden;
  }
  .win-bar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--hair-faint); }
  .win-dots { display: flex; gap: 5px; }
  .win-dots i { width: 8px; height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.15); }
  .win-title { font-family: var(--mono); font-size: 11px; letter-spacing: 0; color: var(--t40); }
  .win-live { margin-left: auto; display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11px; color: #23c489; }
  .win-live i { width: 6px; height: 6px; border-radius: 999px; background: #23c489; animation: pulse 2.4s ease-in-out infinite; }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(35, 196, 137, 0.35); }
    50% { box-shadow: 0 0 0 6px rgba(35, 196, 137, 0); }
  }
  .jrow { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 11px 16px; border-bottom: 1px solid var(--hair-faint); }
  .jrow:last-child { border-bottom: 0; }
  .jname { margin: 0; font-size: 13px; font-weight: 500; letter-spacing: -0.01em; }
  .jid { margin: 2px 0 0; font-family: var(--mono); font-size: 11px; letter-spacing: 0; color: var(--t40); }
  .jstate { flex-shrink: 0; border: 1px solid rgba(35, 196, 137, 0.25); background: rgba(35, 196, 137, 0.1); color: #23c489; border-radius: 4px; padding: 2px 8px; font-family: var(--mono); font-size: 11px; }
  .win-caption { padding: 12px 16px; border-top: 1px solid var(--hair-faint); font-size: 12.5px; color: var(--t40); }
  .hero-tail { position: relative; z-index: 10; padding-bottom: 56px; }

  /* Proof strip */
  .strip { border-block: 1px solid var(--rule); }
  .strip .container { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px; padding-block: 16px; }
  .strip-label { font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--t40); }
  .stat { display: inline-flex; align-items: center; gap: 10px; font-size: 13px; letter-spacing: -0.02em; color: var(--t55); }
  .stat b { font-weight: 400; font-family: var(--mono); font-size: 12px; letter-spacing: 0; color: var(--accent); background: var(--accent-soft); border-radius: 4px; padding: 2px 6px; }
  .strip-link { margin-left: auto; font-size: 13px; font-weight: 500; letter-spacing: -0.02em; color: #fff; text-decoration: none; }
  .strip-link:hover { opacity: 0.7; }

  /* Sections */
  section.block { border-top: 1px solid var(--hair-faint); }
  section.block .container { padding-block: 80px; }
  @media (min-width: 768px) { section.block .container { padding-block: 110px; } }
  h2 {
    margin: 28px 0 0; max-width: 820px; font-family: var(--display); font-weight: 400;
    font-size: clamp(32px, 4.5vw, 48px); line-height: 1.15; letter-spacing: -0.01em;
  }
  .block-sub { margin: 20px 0 0; max-width: 620px; font-size: 16px; line-height: 24px; color: var(--t55); }

  .beats { margin-top: 40px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
  .chip { border: 1px solid var(--hair); background: rgba(255, 255, 255, 0.04); border-radius: 999px; padding: 5px 14px; font-family: var(--mono); font-size: 12px; letter-spacing: 0; color: var(--t75); white-space: nowrap; }
  .beat-arrow { color: rgba(255, 255, 255, 0.3); font-size: 12px; }

  .grid { margin-top: 56px; display: grid; gap: 16px; grid-template-columns: 1fr; }
  @media (min-width: 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 980px) { .grid { grid-template-columns: repeat(3, 1fr); } }
  .card { border: 1px solid var(--hair-faint); background: rgba(255, 255, 255, 0.02); border-radius: 8px; padding: 22px; }
  .cnum { font-family: var(--mono); font-size: 12px; letter-spacing: 0; color: var(--accent); }
  .card h3 { margin: 36px 0 0; font-size: 15px; font-weight: 500; letter-spacing: -0.01em; }
  .card p { margin: 8px 0 0; font-size: 13.5px; line-height: 1.6; color: var(--t55); }
  .card code { font-size: 12px; }

  .stops { margin-top: 48px; border-top: 1px solid var(--hair-faint); }
  .stop { display: flex; gap: 24px; padding: 22px 0; border-bottom: 1px solid var(--hair-faint); }
  .stop h3 { margin: 0; font-size: 16px; font-weight: 500; letter-spacing: -0.01em; }
  .stop p { margin: 6px 0 0; max-width: 560px; font-size: 14px; line-height: 1.6; color: var(--t55); }
  .stop .cnum { padding-top: 2px; }

  .cmd {
    margin-top: 36px; display: inline-flex; align-items: center; gap: 16px;
    border: 1px solid var(--hair); background: rgba(255, 255, 255, 0.04);
    border-radius: 6px; padding: 10px 12px 10px 16px;
  }
  .cmd code { font-size: 13px; }
  .cmd .p { color: var(--accent); }
  .copy { background: none; border: 0; cursor: pointer; padding: 4px; color: var(--t40); font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
  .copy:hover { color: #fff; }
  .run-links { margin-top: 28px; display: flex; flex-wrap: wrap; gap: 24px; font-size: 14px; }
  .run-links a { color: var(--t75); text-decoration: none; font-weight: 500; letter-spacing: -0.02em; }
  .run-links a:hover { color: #fff; }

  /* Footer */
  footer { border-top: 1px solid var(--hair-faint); }
  footer .container { display: flex; flex-wrap: wrap; gap: 12px 32px; align-items: center; padding-block: 28px 44px; font-size: 13px; letter-spacing: -0.02em; color: var(--t40); }
  footer .flinks { margin-left: auto; display: flex; gap: 20px; }
  footer a { color: var(--t55); text-decoration: none; }
  footer a:hover { color: #fff; }

  @media (prefers-reduced-motion: reduce) {
    .dash, .win-live i { animation: none; }
    .dash { stroke-dasharray: none; }
  }
</style>
</head>
<body>
  <div class="frame" aria-hidden="true"></div>

  <header class="nav">
    <div class="container">
      <a class="brand" href="/">
        <svg width="12" height="11" viewBox="0 0 9 8" aria-hidden="true"><path d="M4.5 0L9 8H0z" fill="#f64838"/></svg>
        <b>Forgeline</b>
        <span>a Hogsend demo</span>
      </a>
      <nav class="nav-links">
        <a class="ext" href="https://hogsend.com">hogsend.com</a>
        <a class="ext" href="${REPO_URL}">Source</a>
        <button class="btn btn-solid" data-enter>Enter the demo</button>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container hero-inner">
        ${eyebrow("Live demo — a real Hogsend Studio")}
        <h1>A lifecycle engine, fully&nbsp;seeded. <span class="dim">Sign in and click around.</span></h1>
        <p class="lead">Forgeline is a fictional credit-based AI code-review product. This is a live Hogsend Studio wired to its data — 3,214 contacts, seven lifecycle journeys, 46,000 tracked emails, campaign history, and activity across email, in-app, Discord, and Telegram.</p>
        <div class="cta-row">
          <button class="btn btn-solid btn-lg" data-enter>Enter the demo →</button>
          <a class="btn btn-outline btn-lg" href="/studio/">Sign in at /studio</a>
        </div>
        <div class="creds">
          <span><span class="k">email</span><span class="v">${DEMO_EMAIL}</span></span>
          <span><span class="k">password</span><span class="v">${DEMO_PASSWORD}</span></span>
        </div>
        <p class="hero-note">Shared demo login. No email provider is configured — nothing here can send real mail.</p>
      </div>
      <div class="container canvas-wrap">
        <div class="canvas">
          ${waveLines}
          <div class="glow" aria-hidden="true"></div>
          <div class="horizon" aria-hidden="true"></div>
        </div>
      </div>
      <div class="container hero-tail">
        <div class="window">
          <div class="win-bar">
            <span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="win-title">demo.hogsend.com/studio — journeys</span>
            <span class="win-live"><i></i>live</span>
          </div>
          ${journeyRows}
          <p class="win-caption">The seven journeys running in this instance — every one fans out to email, the in-app feed, Discord, and Telegram.</p>
        </div>
      </div>
    </section>

    <div class="strip">
      <div class="container">
        <span class="strip-label">Seeded, not mocked</span>
        ${statItems}
        <a class="strip-link" href="${REPO_URL}/blob/main/scripts/demo-seed.ts">the seed is deterministic →</a>
      </div>
    </div>

    <section class="block">
      <div class="container">
        ${eyebrow("The fiction")}
        <h2>Forgeline sells AI code review by the credit. <span class="dim">The product is made up — the data isn&rsquo;t mocked.</span></h2>
        <p class="block-sub">Teams sign up, connect repos, run reviews, and buy credits when they run out. Every contact, send, click, and Discord ping in the Studio follows that story — generated by a deterministic seed with relative timestamps, so it always reads as the last six months.</p>
        <div class="beats">${beatChips}</div>
      </div>
    </section>

    <section class="block">
      <div class="container">
        ${eyebrow("What's inside")}
        <h2>Everything the engine does, <span class="dim">populated.</span></h2>
        <div class="grid">${cardItems}</div>
      </div>
    </section>

    <section class="block">
      <div class="container">
        ${eyebrow("A route through the Studio")}
        <h2>Where to click first.</h2>
        <div class="stops">${routeItems}</div>
        <div class="cta-row" style="justify-content: flex-start;">
          <button class="btn btn-solid btn-lg" data-enter>Enter the demo →</button>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="container">
        ${eyebrow("Run it yourself")}
        <h2>The same scaffold, <span class="dim">minus the fiction.</span></h2>
        <p class="block-sub">This demo is a stock <code>create-hogsend</code> app running the published engine — the repo is public. Scaffold your own and the same Studio comes up empty, ready for your events.</p>
        <div class="cmd">
          <code><span class="p">$</span> ${INSTALL_COMMAND}</code>
          <button class="copy" data-copy="${INSTALL_COMMAND}">Copy</button>
        </div>
        <div class="run-links">
          <a href="${REPO_URL}">Source on GitHub →</a>
          <a href="https://hogsend.com">hogsend.com →</a>
          <a href="https://docs.hogsend.com">Docs →</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <span>Forgeline is fictional — the people, repos, and clicks are generated. The engine is real.</span>
      <span class="flinks">
        <a href="https://hogsend.com">Hogsend</a>
        <a href="https://course.hogsend.com">Course</a>
        <a href="${REPO_URL}">GitHub</a>
      </span>
    </div>
  </footer>

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
  for (const btn of document.querySelectorAll("[data-enter]")) {
    btn.addEventListener("click", () => enter(btn));
  }
  for (const btn of document.querySelectorAll("[data-copy]")) {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = "Copy"; }, 1500);
      } catch (e) { /* clipboard unavailable — leave the command selectable */ }
    });
  }
</script>
</body>
</html>`;

export const demoLandingRoute: RoutesFn = (app) => {
  app.get("/", (c) => c.html(html));
};
