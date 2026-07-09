import { defineConfig } from "tsup";

/**
 * The BROWSER bundle for the landing page's notification-bell island —
 * separate from the main tsup config, which builds the Node API/worker. One
 * self-contained IIFE (React + @hogsend/react inlined, styles injected into a
 * <style> tag at runtime) served at /assets/demo-bell.js by
 * src/routes/assets.ts. `pnpm build` runs both configs.
 */
export default defineConfig({
  entry: { "demo-bell": "src/island/bell.tsx" },
  format: ["iife"],
  platform: "browser",
  target: "es2022",
  outDir: "dist/island",
  clean: true,
  minify: true,
  sourcemap: false,
  injectStyle: true,
  noExternal: [/.*/],
  define: { "process.env.NODE_ENV": '"production"' },
});
