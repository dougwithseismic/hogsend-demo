// Module augmentation — this is what makes `emailService.send({ template, props })`
// fully type-checked against Forgeline's templates. `@hogsend/email` ships an
// empty `TemplateRegistryMap`; here we declare each template key and the props
// its component expects. Keep keys in sync with `./registry.ts` and the
// `Templates` constants in `src/journeys/constants/index.ts`.

import type {
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

declare module "@hogsend/email" {
  interface TemplateRegistryMap {
    welcome: WelcomeEmailProps;
    "magic-link": MagicLinkEmailProps;
    "credits-receipt": CreditsReceiptEmailProps;
    "activation-connect-repo": ActivationConnectRepoEmailProps;
    "activation-first-review": ActivationFirstReviewEmailProps;
    "activation-nudge": ActivationNudgeEmailProps;
    "credits-topup-nudge": CreditsTopupNudgeEmailProps;
    "credits-low-balance": CreditsLowBalanceEmailProps;
    "credits-depleted": CreditsDepletedEmailProps;
    "expansion-usage-milestone": ExpansionUsageMilestoneEmailProps;
    "expansion-add-seats": ExpansionAddSeatsEmailProps;
    "winback-repo-quiet": WinbackRepoQuietEmailProps;
    "winback-offer": WinbackOfferEmailProps;
    "feedback-nps": FeedbackNpsEmailProps;
    "weekly-digest": WeeklyDigestEmailProps;
  }
}
