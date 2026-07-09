import type { RoutesFn } from "@hogsend/engine";

/**
 * /cookies — the same cookieless posture as the rest of *.hogsend.com, stated
 * plainly (the course site's model: no banner because there is nothing to
 * consent to; this page IS the disclosure). Everything the demo stores in a
 * browser is listed here — if that changes, this page changes.
 */

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 2L15 14H1z" fill="#f64838"/></svg>`,
  );

const SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "No cookie banner, because there's nothing to consent to",
    paragraphs: [
      "This site sets no analytics cookies and no third-party trackers, so EU law doesn't require a banner and we don't show one. Everything below is the complete list of what your browser stores.",
    ],
  },
  {
    heading: "If you enter the demo",
    paragraphs: [
      "Entering the demo signs you into the shared Studio account and sets its session cookie (hogsend.session_token) for this site only. It's strictly necessary — it's how the Studio knows the browser is signed in — and it expires on its own.",
    ],
  },
  {
    heading: "If you sign in with your hogsend.com account",
    paragraphs: [
      "Signing in sets a session cookie (better-auth.session_token, 30 days) plus a short-lived cache of it, shared across *.hogsend.com — one login works on hogsend.com, the course, and here. These are strictly necessary and exempt from consent. Signing out removes them.",
    ],
  },
  {
    heading: "The notification bell",
    paragraphs: [
      "The bell in the nav shows updates for signed-in visitors. Its identity comes from your sign-in session — it keeps no id of its own in your browser, and for anonymous visitors it holds a throwaway in-memory id that vanishes when the tab closes.",
    ],
  },
  {
    heading: "The rest",
    paragraphs: [
      'The full privacy policy is at <a href="https://hogsend.com/privacy">hogsend.com/privacy</a>.',
      "This page is dated 9 July 2026. If what we store changes, this page changes.",
    ],
  },
];

const sectionHtml = SECTIONS.map(
  (s) =>
    `<section><h2>${s.heading}</h2>${s.paragraphs
      .map((p) => `<p>${p}</p>`)
      .join("")}</section>`,
).join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cookies — Forgeline, a Hogsend demo</title>
<meta name="description" content="What this site stores in your browser: a session cookie when you sign in, and nothing else. No analytics cookies, no banner." />
<link rel="icon" href="${FAVICON}" />
<link rel="preconnect" href="https://rsms.me/" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
<style>
  :root {
    --ink: #050101; --accent: #f64838;
    --rule: rgba(246,72,56,0.2);
    --t70: rgba(255,255,255,0.7); --t55: rgba(255,255,255,0.55); --t40: rgba(255,255,255,0.4);
    --sans: "Inter", ui-sans-serif, system-ui, sans-serif;
    --display: "InterDisplay", "Inter", ui-sans-serif, system-ui, sans-serif;
    --mono: ui-monospace, "SFMono-Regular", monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--ink); color: #fff; font-family: var(--sans);
    font-size: 15px; line-height: 1.6; letter-spacing: -0.02em;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 640px; margin: 0 auto; padding: 48px 24px 96px; }
  .brand { display: flex; align-items: baseline; gap: 10px; text-decoration: none; color: inherit; }
  .brand b { font-size: 15px; font-weight: 600; }
  .brand span { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--t40); }
  h1 { margin: 56px 0 0; font-family: var(--display); font-weight: 400; font-size: clamp(36px, 6vw, 52px); line-height: 1.05; letter-spacing: -0.02em; }
  .sub { margin: 16px 0 0; font-size: 16px; color: var(--t70); }
  section { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--rule); }
  h2 { margin: 0; font-weight: 500; font-size: 19px; line-height: 1.25; letter-spacing: -0.02em; }
  p { margin: 12px 0 0; color: var(--t70); }
  a { color: #fff; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: rgba(255,255,255,0.3); }
  a:hover { text-decoration-color: #fff; }
  code { font-family: var(--mono); font-size: 0.9em; color: rgba(255,255,255,0.75); letter-spacing: 0; }
</style>
</head>
<body>
  <div class="wrap">
    <a class="brand" href="/">
      <svg width="12" height="11" viewBox="0 0 9 8" aria-hidden="true"><path d="M4.5 0L9 8H0z" fill="#f64838"/></svg>
      <b>Forgeline</b>
      <span>a Hogsend demo</span>
    </a>
    <h1>What this site stores</h1>
    <p class="sub">Short, because the answer is: a session cookie when you sign in, and nothing else.</p>
    ${sectionHtml}
  </div>
</body>
</html>`;

export const cookiesRoute: RoutesFn = (app) => {
  app.get("/cookies", (c) => c.html(html));
};
