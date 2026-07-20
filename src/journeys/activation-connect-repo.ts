import { days } from "@hogsend/core";
import { defineJourney, sendEmail, sendFeedItem } from "@hogsend/engine";
import { announceNewWorkspace } from "./channels.js";
import { toStr } from "./coerce.js";
import { Events, Templates } from "./constants/index.js";

/**
 * Activation — connect the first repo. The front door: a new workspace lands,
 * and we push (across email + the in-app bell + a Discord #new-workspaces post)
 * until a repo is connected.
 *
 * Multi-channel: welcome email + bell "Welcome to Forgeline" + a #new-workspaces
 * announcement, then two timed nudges if the repo still isn't connected.
 *
 * `repo.connected` is BOTH the goal and `exitOn`: when it fires the engine
 * exits the run cleanly (aborting the pending wait), so no nudge is sent. We
 * only ever act on the TIMEOUT branch of each wait, never the event's payload —
 * which is why awaiting an exitOn event is safe here.
 */
export const activationConnectRepo = defineJourney({
  meta: {
    id: "activation-connect-repo",
    name: "Activation — Connect a repo",
    enabled: true,
    trigger: { event: Events.WORKSPACE_CREATED },
    entryLimit: "once",
    suppress: days(0),
    exitOn: [{ event: Events.REPO_CONNECTED }],
    // Causal instrument: 15% of would-have-entered workspaces are held out so
    // the Impact tab can report the journey's true conversion lift.
    holdout: { percent: 15 },
    version: "v3-welcome-copy-test",
    // Scope the Impact lift readout to the credits conversion (instead of
    // "any conversion definition"), so ambient subscription noise stays out.
    goal: "credits-purchased",
  },

  run: async (user, ctx) => {
    const workspace = toStr(user.properties.workspace) ?? "your workspace";

    // Recorded A/B arm — deterministic per user, replayed verbatim within the
    // enrollment. Unconditional and first, so arm-vs-holdout lift stays causal.
    const copy = await ctx.variant("welcome-copy", ["control", "benefit-led"]);

    // 1. Welcome across email + bell, and flag the new workspace in Discord.
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.WELCOME,
      subject:
        copy === "benefit-led"
          ? "Your first AI review is one repo away"
          : "Welcome to Forgeline",
      journeyName: user.journeyName,
    });
    await sendFeedItem({
      recipient: { userId: user.id },
      type: "welcome",
      title: "Welcome to Forgeline",
      body: "Connect a repo and your first AI review runs on the next PR.",
      actionUrl: "https://forgeline.dev/connect",
      journeyStateId: user.stateId,
    });
    await announceNewWorkspace(`🚀 New workspace: ${workspace}`);

    // 2. Wait a day for the connect. If it lands, exitOn pulls us out here.
    const first = await ctx.waitForEvent({
      event: Events.REPO_CONNECTED,
      timeout: days(1),
      label: "await-connect-1",
    });
    if (!first.timedOut) return;

    // 3. Still no repo — the explicit connect email, then wait two more days.
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.ACTIVATION_CONNECT_REPO,
      subject: "Connect your first repo to start reviewing",
      journeyName: user.journeyName,
    });
    const second = await ctx.waitForEvent({
      event: Events.REPO_CONNECTED,
      timeout: days(2),
      label: "await-connect-2",
    });
    if (!second.timedOut) return;

    // 4. Last touch.
    await sendEmail({
      to: user.email,
      userId: user.id,
      journeyStateId: user.stateId,
      template: Templates.ACTIVATION_NUDGE,
      subject: "Still haven't connected a repo?",
      journeyName: user.journeyName,
    });
  },
});
