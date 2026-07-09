import { days } from "@hogsend/core";
import { defineJourney, sendEmail, sendFeedItem } from "@hogsend/engine";
import { dmTelegram } from "./channels.js";
import { Events, Templates } from "./constants/index.js";

/**
 * Credits — the 80%-consumed top-up nudge. Triggered when a workspace crosses
 * the 20%-remaining threshold (`credits.low`). Buying credits (`credits.purchased`)
 * exits the journey.
 *
 * Multi-channel: top-up email + a bell "80% of credits used" with a Buy button +
 * a Telegram DM for workspaces that linked Telegram.
 */
export const creditsTopupNudge = defineJourney({
  meta: {
    id: "credits-topup-nudge",
    name: "Credits — Top-up nudge",
    enabled: true,
    trigger: { event: Events.CREDITS_LOW },
    entryLimit: "once_per_period",
    entryPeriod: days(30),
    suppress: days(7),
    exitOn: [{ event: Events.CREDITS_PURCHASED }],
  },

  run: async (user, ctx) => {
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.CREDITS_TOPUP_NUDGE,
      subject: "You're through 80% of this month's build credits",
      journeyName: user.journeyName,
    });
    await sendFeedItem({
      recipient: { userId: user.id },
      type: "credits-low",
      title: "80% of this month's credits used",
      body: "Pipelines and AI reviews keep running until the balance hits zero.",
      blocks: [
        {
          type: "button",
          label: "Buy a credit pack",
          url: "https://forgeline.dev/billing/credits",
        },
      ],
      journeyStateId: user.stateId,
    });
    if (user.properties.telegram_linked) {
      await dmTelegram(
        user.email,
        "Heads up — your Forgeline workspace is down to its last 20% of build credits.",
      );
    }

    // Give them a couple of days, then the low-balance follow-up. A purchase in
    // the meantime already exited the journey via `exitOn`.
    await ctx.sleep({ duration: days(2), label: "post-topup" });
    if (!(await ctx.guard.isSubscribed())) return;
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.CREDITS_LOW_BALANCE,
      subject: "Low on build credits",
      journeyName: user.journeyName,
    });
  },
});
