import { days } from "@hogsend/core";
import { defineJourney, sendEmail, sendFeedItem } from "@hogsend/engine";
import { dormantRepos } from "../buckets/index.js";
import { dmDiscord, dmTelegram } from "./channels.js";
import { toStr } from "./coerce.js";
import { Events, Templates } from "./constants/index.js";

/**
 * Winback — dormant repo revival. Triggered when a workspace enters the
 * `dormant-repos` bucket (no `build.run` in 14 days). A pipeline run exits.
 *
 * Multi-channel: "repo's gone quiet" email + a bell alert + Discord & Telegram
 * "come back, 500 credits" DMs, then a bonus-credit offer a few days later.
 */
export const winbackRepoQuiet = defineJourney({
  meta: {
    id: "winback-repo-quiet",
    name: "Winback — Repo quiet",
    enabled: true,
    trigger: { event: dormantRepos.entered },
    entryLimit: "once_per_period",
    entryPeriod: days(30),
    suppress: days(14),
    exitOn: [{ event: Events.BUILD_RUN }],
    // 15% holdout — winback is the classic "does it actually work?" journey.
    holdout: { percent: 15 },
    version: "v2-multichannel-offer",
  },

  run: async (user, ctx) => {
    const repo = toStr(user.properties.repo);

    // 1. Reach out on every connected channel.
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.WINBACK_REPO_QUIET,
      subject: "Your repo's gone quiet",
      journeyName: user.journeyName,
      props: repo
        ? { name: toStr(user.properties.name) ?? "there", repo }
        : undefined,
    });
    await sendFeedItem({
      recipient: { userId: user.id },
      type: "winback",
      title: "Your repo's gone quiet",
      body: "No pipeline run in two weeks. Open a PR and reviews pick right back up.",
      actionUrl: "https://forgeline.dev/dashboard",
      journeyStateId: user.stateId,
    });
    await dmDiscord(
      user.email,
      "Your Forgeline repo's gone quiet — here's 500 credits to pick back up.",
    );
    if (user.properties.telegram_linked) {
      await dmTelegram(
        user.email,
        "Your Forgeline repo's gone quiet — 500 credits are waiting to pick back up.",
      );
    }

    // 2. Four days later, the bonus-credit offer (distinct idempotency label).
    await ctx.sleep({ duration: days(4), label: "pre-offer" });
    if (!(await ctx.guard.isSubscribed())) return;
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.WINBACK_OFFER,
      subject: "500 free credits to pick back up",
      journeyName: user.journeyName,
      idempotencyLabel: "winback",
    });
  },
});
