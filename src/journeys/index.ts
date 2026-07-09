import type { DefinedJourney } from "@hogsend/engine";
import { activationConnectRepo } from "./activation-connect-repo.js";
import { activationFirstReview } from "./activation-first-review.js";
import { creditsDunning } from "./credits-dunning.js";
import { creditsTopupNudge } from "./credits-topup-nudge.js";
import { expansionSeats } from "./expansion-seats.js";
import { feedbackNps } from "./feedback-nps.js";
import { testOnboarding } from "./test-onboarding.js";
import { winbackRepoQuiet } from "./winback-repo-quiet.js";

/**
 * All Forgeline journeys. Passed to `createHogsendClient({ journeys })` and
 * `createWorker({ journeys })`. Each fans out across email + the in-app bell +
 * Discord/Telegram (see the individual files).
 *
 * The registered ids here are the contract the demo seed matches — a
 * `journey_states.journeyId` that isn't one of these renders ZERO in the Studio
 * journeys metric.
 */
export const journeys: DefinedJourney[] = [
  activationConnectRepo,
  activationFirstReview,
  creditsTopupNudge,
  creditsDunning,
  expansionSeats,
  winbackRepoQuiet,
  feedbackNps,
  testOnboarding,
];

// Re-export individual journeys for direct reference (tests, custom wiring).
export {
  activationConnectRepo,
  activationFirstReview,
  creditsDunning,
  creditsTopupNudge,
  expansionSeats,
  feedbackNps,
  testOnboarding,
  winbackRepoQuiet,
};
