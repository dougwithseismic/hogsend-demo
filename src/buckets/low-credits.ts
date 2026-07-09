import { days, defineBucket } from "@hogsend/engine";

/**
 * Low credits — workspaces under 20% of their monthly build-credit allotment.
 * The `credits_pct` contact property is the balance as a percentage of the
 * plan's monthly credits, updated as credits are spent. Entering the bucket is
 * the top-up upsell signal (drives `credits-topup-nudge`).
 *
 * `timeBased` because a new billing period refills the allotment, flipping
 * membership without an inbound event — the reconcile cron owns that leave.
 */
export const lowCredits = defineBucket({
  meta: {
    id: "low-credits",
    name: "Low credits",
    description: "Under 20% of this month's build-credit allotment.",
    enabled: true,
    timeBased: true,
    entryLimit: "once_per_period",
    entryPeriod: days(14),
    criteria: (b) => b.prop("credits_pct").lt(20),
  },
});
