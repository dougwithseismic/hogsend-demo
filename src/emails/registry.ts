import type { TemplateRegistry } from "@hogsend/email";
import ActivationConnectRepoEmail from "./activation-connect-repo.js";
import ActivationFirstReviewEmail from "./activation-first-review.js";
import ActivationNudgeEmail from "./activation-nudge.js";
import CreditsDepletedEmail from "./credits-depleted.js";
import CreditsLowBalanceEmail from "./credits-low-balance.js";
import CreditsReceiptEmail from "./credits-receipt.js";
import CreditsTopupNudgeEmail from "./credits-topup-nudge.js";
import ExpansionAddSeatsEmail from "./expansion-add-seats.js";
import ExpansionUsageMilestoneEmail from "./expansion-usage-milestone.js";
import FeedbackNpsEmail from "./feedback-nps.js";
import MagicLinkEmail from "./magic-link.js";
import WeeklyDigestEmail from "./weekly-digest.js";
import WelcomeEmail from "./welcome.js";
import WinbackOfferEmail from "./winback-offer.js";
import WinbackRepoQuietEmail from "./winback-repo-quiet.js";

// Forgeline's template registry — CONTENT. Maps each template key to its
// component + default subject + category (+ optional preview text). Passed to
// `createHogsendClient({ email: { templates } })`, which threads it through the
// engine's `TrackedMailer` to `getTemplate(..., { registry })` at send + render.
//
// The keys MUST match the keys augmented into `@hogsend/email`'s
// `TemplateRegistryMap` (see `./templates.d.ts`) and the `Templates` constants
// journeys send with (see `src/journeys/constants/index.ts`).
//
// `category` drives suppression/frequency caps:
//   - "transactional"  always delivers (exempt from list/category suppression)
//   - "journey"        normal lifecycle category (unsubscribe honored)
export const templates: TemplateRegistry = {
  // --- Transactional ---
  welcome: {
    component: WelcomeEmail,
    defaultSubject: "Welcome to Forgeline",
    category: "transactional",
    preview: (props) => `Welcome to Forgeline, ${props.name}`,
    examples: { name: "Ada", startingCredits: 100 },
  },
  "magic-link": {
    component: MagicLinkEmail,
    defaultSubject: "Your Forgeline sign-in link",
    category: "transactional",
    preview: () => "Your one-tap sign-in link (expires soon)",
  },
  "credits-receipt": {
    component: CreditsReceiptEmail,
    defaultSubject: "Your Forgeline credit pack receipt",
    category: "transactional",
    preview: (props) => `Receipt for your ${props.packName} — ${props.amount}`,
    examples: { packName: "5,000 credits", amount: "$40.00", credits: 5000 },
  },

  // --- Activation ---
  "activation-connect-repo": {
    component: ActivationConnectRepoEmail,
    defaultSubject: "Connect your first repo to start reviewing",
    category: "journey",
    preview: (props) => `${props.name}, connect a repo to start reviewing`,
  },
  "activation-first-review": {
    component: ActivationFirstReviewEmail,
    defaultSubject: "Your first AI review is in ✅",
    category: "journey",
    preview: (props) => `${props.name}, your first AI review is in`,
  },
  "activation-nudge": {
    component: ActivationNudgeEmail,
    defaultSubject: "Still haven't connected a repo?",
    category: "journey",
    preview: (props) => `${props.name}, one step left to start reviewing`,
  },

  // --- Credits / dunning ---
  "credits-topup-nudge": {
    component: CreditsTopupNudgeEmail,
    defaultSubject: "You're through 80% of this month's build credits",
    category: "journey",
    preview: (props) =>
      `${props.name}, ${props.usedPct ?? 80}% of credits used`,
  },
  "credits-low-balance": {
    component: CreditsLowBalanceEmail,
    defaultSubject: "Low on build credits",
    category: "journey",
    preview: (props) => `${props.name}, top up before pipelines pause`,
  },
  "credits-depleted": {
    component: CreditsDepletedEmail,
    defaultSubject: "Your pipelines are paused — out of credits",
    category: "journey",
    preview: (props) => `${props.name}, pipelines paused — out of credits`,
  },

  // --- Expansion ---
  "expansion-usage-milestone": {
    component: ExpansionUsageMilestoneEmail,
    defaultSubject: "50 PRs reviewed this month 🎉",
    category: "journey",
    preview: (props) => `${props.prsReviewed ?? 50} PRs reviewed this month`,
  },
  "expansion-add-seats": {
    component: ExpansionAddSeatsEmail,
    defaultSubject: "Your team is reviewing a lot of PRs",
    category: "journey",
    preview: (props) => `${props.name}, add seats to keep up`,
  },

  // --- Winback ---
  "winback-repo-quiet": {
    component: WinbackRepoQuietEmail,
    defaultSubject: "Your repo's gone quiet",
    category: "journey",
    preview: (props) => `${props.name}, your repo's gone quiet`,
  },
  "winback-offer": {
    component: WinbackOfferEmail,
    defaultSubject: "500 free credits to pick back up",
    category: "journey",
    preview: (props) => `${props.bonusCredits ?? 500} free credits to restart`,
  },

  // --- Feedback + digest ---
  "feedback-nps": {
    component: FeedbackNpsEmail,
    defaultSubject: "Quick one — how's Forgeline treating you?",
    category: "journey",
    preview: (props) =>
      `${props.name}, one-tap: would you recommend Forgeline?`,
  },
  "weekly-digest": {
    component: WeeklyDigestEmail,
    defaultSubject: "Your Forgeline week: 84 reviews, 3 issues caught",
    category: "journey",
    preview: (props) =>
      `Your week: ${props.reviews ?? 84} reviews, ${props.issuesCaught ?? 3} issues caught`,
  },
};
