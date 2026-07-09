import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { RoutesFn } from "@hogsend/engine";

/**
 * Serves the bell-island browser bundle built by tsup.island.config.ts. The
 * bundle is read once and cached for the process lifetime (it only changes on
 * a rebuild, which is a redeploy). 404s cleanly when the island hasn't been
 * built (e.g. plain `pnpm dev` before a `pnpm build:island`) — the landing's
 * <script> just no-ops and the page is unchanged.
 */

// dist/index.js at runtime, src/routes/assets.ts under tsx — the bundle lives
// at dist/island/ relative to the repo root either way.
const BUNDLE_URL = new URL(
  import.meta.url.includes("/dist/")
    ? "./island/demo-bell.global.js"
    : "../../dist/island/demo-bell.global.js",
  import.meta.url,
);

let cached: string | null | undefined;

export const assetRoutes: RoutesFn = (app) => {
  app.get("/assets/demo-bell.js", async (c) => {
    if (cached === undefined) {
      cached = await readFile(fileURLToPath(BUNDLE_URL), "utf8").catch(
        () => null,
      );
    }
    if (cached === null) return c.notFound();
    return c.body(cached, 200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    });
  });
};
