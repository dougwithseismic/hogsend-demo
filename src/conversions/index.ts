import { defineConversion } from "@hogsend/engine";
import { Events } from "../journeys/constants/index.js";

/**
 * Forgeline's valued conversion points (0.44). Each reads the event's
 * first-class `value`/`currency` (the revenue spine), so a fired conversion
 * carries real money into the attribution ledger — every model computed once
 * at fire time. The demo wires no ad destinations; add `destinations` (e.g.
 * `["meta-capi"]`) to fan a conversion out to an ad platform.
 */
export const subscriptionStarted = defineConversion({
  id: "subscription-started",
  name: "Subscription started",
  trigger: { event: Events.SUBSCRIPTION_STARTED },
  value: { source: "event" },
});

export const creditsPurchased = defineConversion({
  id: "credits-purchased",
  name: "Credits purchased",
  trigger: { event: Events.CREDITS_PURCHASED },
  value: { source: "event" },
});

export const conversions = [subscriptionStarted, creditsPurchased];
