import { days, defineBucket } from "@hogsend/engine";
import { Events } from "../journeys/constants/index.js";

/**
 * Power teams — workspaces reviewing at real volume: 200+ PRs reviewed in the
 * last 30 days. This is the expansion signal — entering the bucket drives the
 * `expansion-seats` journey (heavy usage → sell more seats).
 *
 * Rolling 30-day window → `timeBased`: the reconcile cron sweeps the leave when
 * the window rolls past, since no single event signals a drop below 200.
 */
export const powerTeams = defineBucket({
  meta: {
    id: "power-teams",
    name: "Power teams",
    description: "Reviewed 200+ PRs in the last 30 days.",
    enabled: true,
    timeBased: true,
    entryLimit: "once_per_period",
    entryPeriod: days(30),
    criteria: (b) => b.event(Events.PR_REVIEWED).within(days(30)).atLeast(200),
  },
});
