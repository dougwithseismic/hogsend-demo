/**
 * Forgeline event + template constants. Typed `as const` objects instead of
 * magic strings keep journey triggers / sends consistent and refactor-safe.
 *
 * Forgeline is a credit-based B2B dev-tool SaaS: connect a repo, every pipeline
 * run and every AI PR review spends build credits, buy credit packs to keep
 * going. These constants model that product's lifecycle.
 */

// The union of template keys you've REGISTERED (src/emails/registry.ts + the
// `templates.d.ts` augmentation). The `satisfies` on `Templates` below makes a
// key that was never registered a COMPILE error, so a journey can't send an
// email that doesn't exist. Aliased to avoid clashing with the local
// `TemplateName` exported at the bottom of this file.
import type { TemplateName as RegisteredTemplateKey } from "@hogsend/email";

export const Events = {
  // --- Signup / workspace lifecycle ---
  WORKSPACE_CREATED: "workspace.created",
  MEMBER_INVITED: "member.invited",
  SEAT_ADDED: "seat.added",

  // --- Activation ---
  REPO_CONNECTED: "repo.connected",
  BUILD_RUN: "build.run",
  BUILD_PASSED: "build.passed",
  BUILD_FAILED: "build.failed",
  PR_REVIEWED: "pr.reviewed",

  // --- Credits / billing ---
  CREDITS_PURCHASED: "credits.purchased",
  CREDITS_SPENT: "credits.spent",
  CREDITS_LOW: "credits.low", // crossed 20%-remaining threshold
  CREDITS_DEPLETED: "credits.depleted", // hit zero → pipelines paused
  PLAN_UPGRADED: "plan.upgraded",
  SUBSCRIPTION_STARTED: "subscription.started",

  // --- Engagement / churn signals ---
  REPO_DORMANT: "repo.dormant", // no builds in 14d (worker-emitted)
  USAGE_MILESTONE: "usage.milestone", // e.g. 50 PRs reviewed

  // --- Feedback (NPS via email semantic links OR an in-app bell survey) ---
  FEEDBACK_SUBMITTED: "feedback.submitted",

  // --- Multi-channel identity + engagement (Discord / Telegram) ---
  DISCORD_LINKED: "discord.linked", // member linked their Discord → cold-connect
  TELEGRAM_LINKED: "telegram.linked", // member linked their Telegram
  DISCORD_REACTION_ADDED: "discord.reaction_added", // this contact reacted (reactor)
  DISCORD_REACTION_RECEIVED: "discord.reaction_received", // this contact's msg got a reaction

  // Built-in journey lifecycle events (emitted by journeys / the engine). The
  // welcome/pro/free-path events are used by the bundled `test-onboarding`
  // smoke-test journey.
  JOURNEY_WELCOME_FIRED: "journey.welcome_fired",
  JOURNEY_PRO_PATH: "journey.pro_path",
  JOURNEY_FREE_PATH: "journey.free_path",
  JOURNEY_COMPLETED: "journey.completed",

  // Generic bucket-transition events (emitted by the engine on any bucket
  // join/leave). Bind a journey to the TYPED per-bucket refs
  // (`powerTeams.entered` etc.) rather than these generic forms.
  BUCKET_ENTERED: "bucket:entered",
  BUCKET_LEFT: "bucket:left",

  // The smoke-test event the bundled test-onboarding journey listens for.
  TEST_SIGNUP: "test.signup",
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

/**
 * The union of bucket ids registered in `src/buckets/index.ts`. Prefer the
 * per-bucket typed refs `bucket.entered` / `bucket.left` (e.g.
 * `powerTeams.entered`) in journey triggers — they're literal-typed off the
 * bucket's own id and need no hand-maintained union. This union is kept for the
 * seed's id contract and for binding to ANY bucket generically.
 */
export type BucketId =
  | "power-teams"
  | "low-credits"
  | "trial-ending"
  | "dormant-repos";

export const Templates = {
  // Transactional — sent one-off / at signup / on purchase.
  WELCOME: "welcome",
  MAGIC_LINK: "magic-link",
  CREDITS_RECEIPT: "credits-receipt",

  // Activation — connect a repo, ship a first AI review.
  ACTIVATION_CONNECT_REPO: "activation-connect-repo",
  ACTIVATION_FIRST_REVIEW: "activation-first-review",
  ACTIVATION_NUDGE: "activation-nudge",

  // Credits / dunning — top-up upsell → low → depleted (pipelines paused).
  CREDITS_TOPUP_NUDGE: "credits-topup-nudge",
  CREDITS_LOW_BALANCE: "credits-low-balance",
  CREDITS_DEPLETED: "credits-depleted",

  // Expansion — heavy usage → add seats.
  EXPANSION_USAGE_MILESTONE: "expansion-usage-milestone",
  EXPANSION_ADD_SEATS: "expansion-add-seats",

  // Winback — dormant repo revival + bonus-credit offer.
  WINBACK_REPO_QUIET: "winback-repo-quiet",
  WINBACK_OFFER: "winback-offer",

  // Feedback + digest.
  FEEDBACK_NPS: "feedback-nps",
  WEEKLY_DIGEST: "weekly-digest",
} as const satisfies Record<string, RegisteredTemplateKey>;

export type TemplateName = (typeof Templates)[keyof typeof Templates];
