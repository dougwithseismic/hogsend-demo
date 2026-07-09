import { days } from "@hogsend/core";
import { defineJourney, sendEmail, sendFeedItem } from "@hogsend/engine";
import { powerTeams } from "../buckets/index.js";
import { grantPowerTeamRole, postWin } from "./channels.js";
import { Events, Templates } from "./constants/index.js";

/**
 * Expansion — heavy usage → sell seats. Triggered when a workspace enters the
 * `power-teams` bucket (200+ PRs reviewed in 30 days). Adding a seat exits.
 *
 * Multi-channel: milestone + add-seats emails + a bell "50 PRs this month 🎉" +
 * a Discord #wins post and a "power-team" role grant.
 */
export const expansionSeats = defineJourney({
  meta: {
    id: "expansion-seats",
    name: "Expansion — Add seats",
    enabled: true,
    // Bind to the power-teams bucket entry (typed ref → typo-safe). A
    // `usage.milestone` (prs_50) trigger is the alternative entry point.
    trigger: { event: powerTeams.entered },
    entryLimit: "once_per_period",
    entryPeriod: days(30),
    suppress: days(7),
    exitOn: [{ event: Events.SEAT_ADDED }],
  },

  run: async (user, ctx) => {
    // 1. Celebrate the milestone across email + bell, post the win + grant role.
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.EXPANSION_USAGE_MILESTONE,
      subject: "50 PRs reviewed this month 🎉",
      journeyName: user.journeyName,
    });
    await sendFeedItem({
      recipient: { userId: user.id },
      type: "milestone",
      title: "50 PRs reviewed this month 🎉",
      body: "Your team is reviewing at real volume. Nice pace.",
      actionUrl: "https://forgeline.dev/dashboard",
      journeyStateId: user.stateId,
    });
    await postWin(`🏆 A power team just crossed 50 AI reviews this month.`);
    await grantPowerTeamRole(user.email);

    // 2. A few days later, the seats upsell.
    await ctx.sleep({ duration: days(3), label: "pre-seats" });
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.EXPANSION_ADD_SEATS,
      subject: "Your team is reviewing a lot of PRs",
      journeyName: user.journeyName,
    });
  },
});
