import { days } from "@hogsend/core";
import { defineJourney, sendEmail, sendFeedItem } from "@hogsend/engine";
import { dmDiscord, dmTelegram } from "./channels.js";
import { Events, Templates } from "./constants/index.js";

/**
 * Credits — dunning. Pipelines paused (`credits.depleted`); recover them. This
 * is the dunning funnel: depleted → bonus-offer → final. Buying credits exits.
 *
 * Multi-channel: depleted / offer / final emails + a bell "Pipelines paused"
 * alert with a Buy button + Discord & Telegram DMs to the owner.
 *
 * Two `sendEmail` sites share the nearest wait label, so the final low-balance
 * send carries a distinct `idempotencyLabel` (dunning-final) — required so the
 * engine's replay-safety keying can tell the two apart.
 */
export const creditsDunning = defineJourney({
  meta: {
    id: "credits-dunning",
    name: "Credits — Dunning",
    enabled: true,
    trigger: { event: Events.CREDITS_DEPLETED },
    entryLimit: "once_per_period",
    entryPeriod: days(30),
    suppress: days(7),
    exitOn: [{ event: Events.CREDITS_PURCHASED }],
  },

  run: async (user, ctx) => {
    // 1. Pipelines paused — hit every connected channel.
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.CREDITS_DEPLETED,
      subject: "Your pipelines are paused — out of credits",
      journeyName: user.journeyName,
    });
    await sendFeedItem({
      recipient: { userId: user.id },
      type: "pipelines-paused",
      title: "Pipelines paused — out of credits",
      body: "New PRs won't get an AI review and CI won't run until you top up.",
      blocks: [
        {
          type: "button",
          label: "Buy credits & resume",
          url: "https://forgeline.dev/billing/credits",
        },
      ],
      journeyStateId: user.stateId,
    });
    await dmDiscord(
      user.email,
      "⚠️ Your Forgeline pipelines are paused — the workspace is out of build credits.",
    );
    if (user.properties.telegram_linked) {
      await dmTelegram(
        user.email,
        "⚠️ Your Forgeline pipelines are paused — out of build credits.",
      );
    }

    // 2. A day later, the bonus-credit offer.
    await ctx.sleep({ duration: days(1), label: "pre-offer" });
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.WINBACK_OFFER,
      subject: "500 free credits to pick back up",
      journeyName: user.journeyName,
    });

    // 3. Three days later, the final low-balance touch (distinct idempotency
    //    label — same nearest wait label as another send in this journey).
    await ctx.sleep({ duration: days(3), label: "pre-final" });
    if (!(await ctx.guard.isSubscribed())) return;
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.CREDITS_LOW_BALANCE,
      subject: "Low on build credits",
      journeyName: user.journeyName,
      idempotencyLabel: "dunning-final",
    });
  },
});
