import { createWorker } from "@hogsend/engine";
import { buckets } from "./buckets/index.js";
import { createClient } from "./container.js";
import { journeys } from "./journeys/index.js";
import { extraWorkflows } from "./workflows/index.js";

async function main() {
  // Shared DI client (see src/container.ts) — the worker RUNS the journeys, so
  // it needs the same connector actions registered as the API for
  // `sendConnectorAction` to dispatch (Discord/Telegram outbound).
  const client = createClient();
  const worker = createWorker({
    container: client,
    journeys,
    buckets,
    // Your custom Hatchet tasks (see src/workflows/index.ts). The engine's
    // built-in workflows are registered automatically — list only your own.
    extraWorkflows,
  });

  async function shutdown(signal: string) {
    client.logger.info(`${signal} received, shutting down worker`);
    await worker.stop();
    client.logger.info("Worker stopped");
    process.exit(0);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  await worker.start();
}

main().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
