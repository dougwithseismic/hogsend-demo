import { days, defineBucket } from "@hogsend/engine";

/**
 * Trial ending — workspaces on a Team/Business trial with fewer than 3 days
 * left. The `on_trial` + `trial_days_left` contact properties are set by the
 * billing code as the trial ticks down. A conversion-pressure segment for the
 * Studio to slice by.
 *
 * `timeBased`: the clock (not an event) crosses the 3-day threshold, so the
 * reconcile cron owns entry as the trial winds down.
 */
export const trialEnding = defineBucket({
  meta: {
    id: "trial-ending",
    name: "Trial ending",
    description: "Team/Business trial with under 3 days left.",
    enabled: true,
    timeBased: true,
    entryLimit: "once_per_period",
    entryPeriod: days(30),
    criteria: (b) =>
      b.all(b.prop("on_trial").eq(true), b.prop("trial_days_left").lte(3)),
  },
});
