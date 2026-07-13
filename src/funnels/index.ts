import { defineFunnel } from "@hogsend/engine";
import { Events } from "../journeys/constants/index.js";

/**
 * Forgeline's revenue pipeline as an event-native deal funnel (0.44). Contacts
 * advance between stages on the product's OWN events — no CRM required. The
 * `"won"` milestone on `subscribed` mints `deal.sold` (valued from the deal),
 * the signal the revenue rollups + the multi-model attribution ledger credit;
 * `repo.dormant` closes an open deal to `lost`. One deployment can run many
 * funnels — a deal belongs to exactly one.
 */
export const forgelinePipeline = defineFunnel({
  id: "forgeline-pipeline",
  name: "Forgeline pipeline",
  stages: [
    { id: "workspace_created", on: Events.WORKSPACE_CREATED },
    { id: "repo_connected", on: Events.REPO_CONNECTED },
    { id: "activated", on: Events.BUILD_PASSED },
    { id: "subscribed", milestone: "won", on: Events.SUBSCRIPTION_STARTED },
  ],
  lostOn: Events.REPO_DORMANT,
});

export const funnels = [forgelinePipeline];
