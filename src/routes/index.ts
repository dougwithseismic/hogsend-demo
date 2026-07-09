import type { RoutesFn } from "@hogsend/engine";
import { assetRoutes } from "./assets.js";
import { cookiesRoute } from "./cookies.js";
import { demoLandingRoute } from "./demo-landing.js";
import { hogsendTokenRoutes } from "./hogsend-token.js";
import { signInRoute } from "./sign-in.js";
import { ssoRoutes } from "./sso.js";

/**
 * Custom routers mounted onto the app AFTER the engine's built-in routes, via
 * `createApp(client, { routes })` in `src/index.ts`. Each is a `RoutesFn` —
 * `(app) => { app.post(...); }` — and they run in array order.
 *
 * Ships with one REFERENCE route (`hogsendTokenRoutes`, a userToken mint) that
 * is inert until you wire your own end-user auth into it. Edit freely — this is
 * your content. Add a route, then it's already threaded through this barrel.
 *
 * The dogfood surface (ssoRoutes, signInRoute, the bell island served by
 * assetRoutes) mounts conditionally on its env — see src/routes/sso.ts.
 */
export const routes: RoutesFn[] = [
  demoLandingRoute,
  cookiesRoute,
  ssoRoutes,
  signInRoute,
  assetRoutes,
  hogsendTokenRoutes,
];
