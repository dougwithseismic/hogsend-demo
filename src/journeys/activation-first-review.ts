import { days } from "@hogsend/core";
import { defineJourney, sendEmail, sendFeedItem } from "@hogsend/engine";
import { dmDiscord } from "./channels.js";
import { toNum, toStr } from "./coerce.js";
import { Events, Templates } from "./constants/index.js";

/**
 * Activation — first AI review. Repo connected; push to first value (a PR that
 * gets reviewed), then celebrate it across email + bell + a Discord DM.
 *
 * `pr.reviewed` is the GOAL, so it is deliberately NOT in `exitOn` — we READ it
 * via `ctx.waitForEvent` and branch on its properties (PR number, issues found).
 */
export const activationFirstReview = defineJourney({
  meta: {
    id: "activation-first-review",
    name: "Activation — First review",
    enabled: true,
    trigger: { event: Events.REPO_CONNECTED },
    entryLimit: "once",
    suppress: days(0),
    exitOn: [{ event: Events.WORKSPACE_CREATED }],
  },

  run: async (user, ctx) => {
    // 1. Connected — nudge them to open a PR via the bell.
    await sendFeedItem({
      recipient: { userId: user.id },
      type: "activation",
      title: "You're connected ✅",
      body: "Open a pull request and Forgeline posts its first AI review.",
      actionUrl: "https://forgeline.dev/dashboard",
      journeyStateId: user.stateId,
    });

    // 2. Wait for the first review (the goal — read, don't exit on it).
    const reviewed = await ctx.waitForEvent({
      event: Events.PR_REVIEWED,
      timeout: days(3),
      label: "await-first-review",
    });

    if (reviewed.timedOut) {
      // No review yet — a gentle nudge and out.
      await sendEmail({
        to: user.email,
        userId: user.id,
        journeyStateId: user.stateId,
        template: Templates.ACTIVATION_NUDGE,
        subject: "Still haven't connected a repo?",
        journeyName: user.journeyName,
      });
      return;
    }

    // 3. First review landed — celebrate across email + bell + Discord DM.
    const prNumber = toNum(reviewed.properties?.pr_number);
    const issuesFound = toNum(reviewed.properties?.issues);
    const name = toStr(user.properties.name) ?? "there";
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.ACTIVATION_FIRST_REVIEW,
      subject: "Your first AI review is in ✅",
      journeyName: user.journeyName,
      props: { name, prNumber, issuesFound },
    });
    await sendFeedItem({
      recipient: { userId: user.id },
      type: "first-review",
      title: "Your first review is in ✅",
      body: "Forgeline read the whole diff and posted its notes.",
      blocks: [
        {
          type: "button",
          label: "Open the review",
          url: "https://forgeline.dev/reviews",
        },
      ],
      journeyStateId: user.stateId,
    });
    await dmDiscord(
      user.email,
      "nice — your first Forgeline review just landed ✅",
    );
  },
});
