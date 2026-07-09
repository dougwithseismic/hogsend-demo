// Prop types for the Forgeline email templates. These are CONTENT — they live
// alongside the `.tsx` files and the registry, and you edit them freely. The
// open `TemplateRegistryMap` in `@hogsend/email` is augmented with these in
// `./templates.d.ts`, which is what makes `send({ template, props })` type-check.
//
// Forgeline = AI code review + CI on build credits. Copy stays date-free ("this
// month", never "since March") so the demo reseeds cleanly.

// --- Transactional ----------------------------------------------------------

export interface WelcomeEmailProps {
  name?: string;
  /** Free build credits granted on signup (shown in copy). */
  startingCredits?: number;
  connectUrl?: string;
  unsubscribeUrl?: string;
}

export interface MagicLinkEmailProps {
  /** The one-tap sign-in URL. Required — there's no safe default. */
  loginUrl: string;
  /** Minutes until the link expires (shown in copy). */
  expiresInMinutes?: number;
  name?: string;
}

export interface CreditsReceiptEmailProps {
  name?: string;
  /** The credit pack purchased, e.g. "5,000 credits". */
  packName: string;
  /** Credits added to the workspace balance. */
  credits?: number;
  /** Pre-formatted total incl. currency, e.g. "$40.00". */
  amount: string;
  /** Human invoice/receipt number, e.g. "FL-10248". */
  invoiceNumber?: string;
  /** New pooled balance after the top-up. */
  newBalance?: number;
  invoiceUrl?: string;
  unsubscribeUrl?: string;
}

// --- Activation -------------------------------------------------------------

export interface ActivationConnectRepoEmailProps {
  name?: string;
  connectUrl?: string;
  unsubscribeUrl?: string;
}

export interface ActivationFirstReviewEmailProps {
  name?: string;
  /** The PR number the first review ran on. */
  prNumber?: number;
  /** Issues the review flagged (drives the celebrate copy). */
  issuesFound?: number;
  repo?: string;
  reviewUrl?: string;
  unsubscribeUrl?: string;
}

export interface ActivationNudgeEmailProps {
  name?: string;
  connectUrl?: string;
  unsubscribeUrl?: string;
}

// --- Credits / dunning ------------------------------------------------------

export interface CreditsTopupNudgeEmailProps {
  name?: string;
  /** Percentage of this month's credits already used (shown in copy). */
  usedPct?: number;
  /** Credits still remaining this period. */
  creditsRemaining?: number;
  buyUrl?: string;
  unsubscribeUrl?: string;
}

export interface CreditsLowBalanceEmailProps {
  name?: string;
  creditsRemaining?: number;
  buyUrl?: string;
  unsubscribeUrl?: string;
}

export interface CreditsDepletedEmailProps {
  name?: string;
  /** Where the semantic "Buy credits" action lands after the click is recorded. */
  landingUrl?: string;
  buyUrl?: string;
  unsubscribeUrl?: string;
}

// --- Expansion --------------------------------------------------------------

export interface ExpansionUsageMilestoneEmailProps {
  name?: string;
  /** PRs reviewed this month (the milestone). */
  prsReviewed?: number;
  /** Issues the reviews caught this month. */
  issuesCaught?: number;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
}

export interface ExpansionAddSeatsEmailProps {
  name?: string;
  /** Current seats on the plan. */
  seats?: number;
  seatsUrl?: string;
  unsubscribeUrl?: string;
}

// --- Winback ----------------------------------------------------------------

export interface WinbackRepoQuietEmailProps {
  name?: string;
  /** The repo that's gone quiet (shown in copy when known). */
  repo?: string;
  connectUrl?: string;
  unsubscribeUrl?: string;
}

export interface WinbackOfferEmailProps {
  name?: string;
  /** Bonus credits offered to restart. */
  bonusCredits?: number;
  claimUrl?: string;
  unsubscribeUrl?: string;
}

// --- Feedback + digest ------------------------------------------------------

export interface FeedbackNpsEmailProps {
  name?: string;
  /**
   * Where a 0–10 answer lands after the click is recorded. Defaults to the
   * engine-hosted answer page (`HOSTED_ANSWER_HREF`), which offers a free-text
   * box (ingested as `feedback.submitted.comment`).
   */
  landingUrl?: string;
  unsubscribeUrl?: string;
}

export interface WeeklyDigestEmailProps {
  name?: string;
  /** Reviews shipped this week. */
  reviews?: number;
  /** Issues the reviews caught this week. */
  issuesCaught?: number;
  /** Pipeline runs this week. */
  buildsRun?: number;
  /** Credits spent this week. */
  creditsUsed?: number;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
}
