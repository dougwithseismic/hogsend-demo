import { days, minutes } from "@hogsend/core";
import {
  defineJourney,
  sendEmail,
  sendFeedItem,
  sendSurvey,
} from "@hogsend/engine";
import { toNum } from "./coerce.js";
import { Events, Templates } from "./constants/index.js";

/**
 * Feedback — NPS. Triggered at the 50-PR usage milestone. Feeds the Studio NPS
 * breakdown (`feedback.submitted { value }`).
 *
 * The neat trick: the SAME question is askable two ways — the email's 0–10
 * semantic `EmailAction` links AND an in-app bell `survey` block (mode `nps`).
 * Both emit `feedback.submitted { value }`, so `ctx.waitForEvent` doesn't care
 * which surface answered. The awaited event is deliberately NOT in `exitOn`.
 */
export const feedbackNps = defineJourney({
  meta: {
    id: "feedback-nps",
    name: "Feedback — NPS",
    enabled: true,
    trigger: {
      event: Events.USAGE_MILESTONE,
      where: (b) => b.prop("milestone").eq("prs_50"),
    },
    entryLimit: "once_per_period",
    entryPeriod: days(90),
    suppress: days(1),
  },

  run: async (user, ctx) => {
    // 1. Ask on both surfaces — one email (semantic 0–10), one bell survey.
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.FEEDBACK_NPS,
      subject: "Quick one — how's Forgeline treating you?",
      journeyName: user.journeyName,
    });
    await sendSurvey({
      recipient: { userId: user.id },
      event: Events.FEEDBACK_SUBMITTED,
      mode: "nps",
      property: "value",
      title: "Quick question 👇",
      prompt: "How likely are you to recommend Forgeline?",
      minLabel: "Not likely",
      maxLabel: "Very likely",
    });

    // 2. Wait for the answer from EITHER surface (lookback covers a tap between
    //    the sends and this wait being established).
    const answer = await ctx.waitForEvent({
      event: Events.FEEDBACK_SUBMITTED,
      timeout: days(7),
      lookback: minutes(30),
      label: "await-nps",
    });
    if (answer.timedOut) return;

    const score = toNum(answer.properties?.value);
    if (score === undefined) return;

    // 3. Branch on the score.
    if (score >= 9) {
      await sendFeedItem({
        recipient: { userId: user.id },
        type: "nps-thanks",
        title: `Thanks — you scored ${score} 🙏`,
        body: "Glad Forgeline's landing. Would you tell another team? We'd love a quick line.",
        actionUrl: "https://forgeline.dev/refer",
        journeyStateId: user.stateId,
      });
    } else if (score <= 6) {
      await sendFeedItem({
        recipient: { userId: user.id },
        type: "nps-followup",
        title: "Thanks for the honesty",
        body: "That's not the experience we want. Someone from the team will reach out to make it right.",
        actionUrl: "https://forgeline.dev/support",
        journeyStateId: user.stateId,
      });
    }
  },
});
