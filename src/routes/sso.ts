import type { RoutesFn } from "@hogsend/engine";
import {
  feedTokenConfigured,
  foldContactIdentity,
  forwardToIngest,
  mintFeedToken,
  resolveContactKey,
} from "../lib/dogfood.js";
import { getSsoAuth, ssoConfigured } from "../sso/auth.js";

/**
 * Mounts the `*.hogsend.com` SSO surface (src/sso/auth.ts) plus the two
 * routes the bell island calls. Everything here no-ops when SSO_* is unset —
 * the demo deploys and runs exactly as before until the env arrives.
 *
 *  - /api/sso/*                Better Auth handler (OTP send/verify, magic
 *                              link, get-session, sign-out). Distinct from the
 *                              engine's Studio auth at /api/auth/*.
 *  - POST /api/demo/hogsend-token  Feed userToken mint for the signed-in
 *                              visitor — the docs' /api/hogsend-token pattern:
 *                              fold { email, userId } onto the dogfood
 *                              contact, resolve the CANONICAL feed key, mint
 *                              for THAT key. Also emits `demosite.signed_in`
 *                              (once per session) so the dogfood knows a
 *                              known person is on the demo.
 *  - POST /api/demo/entered    `demosite.entered` — the "clicked into the
 *                              demo" lifecycle event. Identified visitors
 *                              only (email is the identity arm); anonymous
 *                              clicks are deliberately NOT ingested — the
 *                              site is cookieless, so an anon event would
 *                              mint a throwaway dogfood contact per visit.
 */
export const ssoRoutes: RoutesFn = (app) => {
  if (!ssoConfigured()) return;

  app.on(["GET", "POST"], "/api/sso/*", (c) => getSsoAuth().handler(c.req.raw));

  app.post("/api/demo/hogsend-token", async (c) => {
    const session = await getSsoAuth().api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) return c.json({ error: "unauthorized" }, 401);
    if (!feedTokenConfigured()) {
      return c.json({ error: "not_configured" }, 503);
    }

    const { id: userId, email, name } = session.user;
    const firstName = (name ?? "").trim().split(/\s+/)[0] || undefined;

    // Fold first (links the auth id ↔ email onto the contact), THEN resolve
    // the canonical feed key — minting for the raw auth id would poll a key
    // journeys never write to (an empty bell).
    const folded = await foldContactIdentity({ email, userId, firstName });
    if (!folded) return c.json({ error: "fold_failed" }, 502);
    const feedUserId = (await resolveContactKey({ email })) ?? userId;
    const minted = await mintFeedToken(feedUserId);
    if (!minted) return c.json({ error: "mint_failed" }, 502);

    // A known person is on the demo site — surface it as lifecycle, once per
    // auth session (the mint re-runs on every page load).
    void forwardToIngest(
      {
        name: "demosite.signed_in",
        email,
        eventProperties: { source: "demo.hogsend.com" },
      },
      `demosite.signed_in:${session.session.id}`,
    );

    return c.json({ ...minted, userId: feedUserId });
  });

  app.post("/api/demo/entered", async (c) => {
    const session = await getSsoAuth().api.getSession({
      headers: c.req.raw.headers,
    });
    if (session) {
      // One entered-event per session per day: real re-entries register,
      // button mashing doesn't.
      const day = new Date().toISOString().slice(0, 10);
      await forwardToIngest(
        {
          name: "demosite.entered",
          email: session.user.email,
          eventProperties: { source: "demo.hogsend.com" },
        },
        `demosite.entered:${session.session.id}:${day}`,
      );
    }
    return c.body(null, 204);
  });
};
