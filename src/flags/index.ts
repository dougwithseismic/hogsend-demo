import { type DefinedFlag, defineFlag } from "@hogsend/core";

/**
 * Native feature flags (0.50) — code-first contracts, state (targeting /
 * rollout / on-off) owned by the operator in Studio. The boot reconciler
 * creates missing rows disabled; the demo seed enables them with realistic
 * rollouts so the Studio Flags view has live-looking state.
 */

/** Staged rollout of the parallel pipeline executor. */
export const parallelPipelines = defineFlag({
  key: "parallel-pipelines",
  name: "Parallel pipeline execution",
  type: "boolean",
  description:
    "Run review pipelines for independent PRs concurrently instead of queueing per repo.",
});

/** Multivariate copy experiment on the AI review summary format. */
export const reviewSummaryStyle = defineFlag({
  key: "review-summary-style",
  name: "Review summary style",
  type: "multivariate",
  description:
    "Which format the AI review summary renders in on the PR comment.",
  variants: [
    { key: "concise", value: "concise", weight: 40 },
    { key: "detailed", value: "detailed", weight: 40 },
    { key: "checklist", value: "checklist", weight: 20 },
  ],
  defaultValue: "concise",
});

/** Paid-plan-only convenience: auto top-up when credits run out. */
export const creditsAutoTopup = defineFlag({
  key: "credits-auto-topup",
  name: "Credits auto top-up",
  type: "boolean",
  description:
    "Offer automatic credit-pack purchase when the balance hits zero (paid plans only).",
});

export const flags: DefinedFlag[] = [
  parallelPipelines,
  reviewSummaryStyle,
  creditsAutoTopup,
];
