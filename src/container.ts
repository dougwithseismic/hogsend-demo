import { createHogsendClient, type HogsendClient } from "@hogsend/engine";
import { discordActions } from "@hogsend/plugin-discord";
import { telegramActions } from "@hogsend/plugin-telegram";
import { buckets } from "./buckets/index.js";
import { conversions } from "./conversions/index.js";
import { destinations } from "./destinations/index.js";
import { templates } from "./emails/index.js";
import { flags } from "./flags/index.js";
import { funnels } from "./funnels/index.js";
import { Events, Templates } from "./journeys/constants/index.js";
import { journeys } from "./journeys/index.js";
import { lists } from "./lists/index.js";

/**
 * The Forgeline DI client, shared by the API entry point (`src/index.ts`) and
 * the worker (`src/worker.ts`). Factored out here so BOTH processes register the
 * same content — journeys, buckets, lists, templates, and the multi-channel
 * connector ACTIONS.
 *
 * Multi-channel: journeys fan out across email (`sendEmail`), the in-app bell
 * (`sendFeedItem`), and Discord/Telegram (`sendConnectorAction`). The outbound
 * connector actions (`discordActions` = sendChannelMessage/dmMember/grantRole/…;
 * `telegramActions` = sendMessage/dm) are registered via `connectorActions` so
 * `sendConnectorAction({ connectorId, action, args })` can dispatch to them.
 *
 * SAFETY: the demo ships with NO bot tokens / guild / channel / chat ids in env.
 * Every Discord/Telegram action SOFT-FAILS on an empty/unresolved id, so even if
 * a live journey fires, nothing actually leaves — the seeded `connector_deliveries`
 * rows supply the delivered history. Only the first-party bell is safe to run
 * live. We register the outbound ACTIONS only (not the inbound gateway/webhook
 * connectors) — the demo has no inbound Discord/Telegram traffic.
 */
export function createClient(): HogsendClient {
  return createHogsendClient({
    journeys,
    buckets,
    lists,
    destinations,
    funnels,
    conversions,
    flags,
    email: { templates },
    // Resolve `Templates.X`/`Events.X` in journey source to real values for the
    // Studio journey graph — exact email previews + stable, join-safe node ids
    // (0.46.0 fix for wait/digest nodes silently showing zero metrics).
    journeyConstants: { templates: Templates, events: Events },
    connectorActions: [...discordActions, ...telegramActions],
  });
}
