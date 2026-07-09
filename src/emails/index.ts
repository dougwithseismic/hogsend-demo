// Forgeline's email content. The `templates` registry is passed to
// `createHogsendClient({ email: { templates } })`; `./templates.d.ts` augments
// `@hogsend/email`'s `TemplateRegistryMap` so sends are type-checked.

export { templates } from "./registry.js";

export type {
  ActivationConnectRepoEmailProps,
  ActivationFirstReviewEmailProps,
  ActivationNudgeEmailProps,
  CreditsDepletedEmailProps,
  CreditsLowBalanceEmailProps,
  CreditsReceiptEmailProps,
  CreditsTopupNudgeEmailProps,
  ExpansionAddSeatsEmailProps,
  ExpansionUsageMilestoneEmailProps,
  FeedbackNpsEmailProps,
  MagicLinkEmailProps,
  WeeklyDigestEmailProps,
  WelcomeEmailProps,
  WinbackOfferEmailProps,
  WinbackRepoQuietEmailProps,
} from "./types.js";
