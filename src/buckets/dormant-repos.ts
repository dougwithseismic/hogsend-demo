import { days, defineBucket } from "@hogsend/engine";
import { Events } from "../journeys/constants/index.js";

/**
 * Dormant repos — workspaces with no `build.run` in the last 14 days. Entering
 * the bucket is the winback signal: it drives the `winback-repo-quiet` journey
 * (dormant repo revival + a bonus-credit offer).
 *
 * `timeBased` — dormancy is an ABSENCE of events, so nothing inbound flips
 * membership; the reconcile cron sweeps a repo into the bucket once the 14-day
 * quiet window elapses.
 */
export const dormantRepos = defineBucket({
  meta: {
    id: "dormant-repos",
    name: "Dormant repos",
    description: "No pipeline run in the last 14 days.",
    enabled: true,
    timeBased: true,
    entryLimit: "once_per_period",
    entryPeriod: days(14),
    criteria: (b) => b.event(Events.BUILD_RUN).within(days(14)).atMost(0),
  },
});
