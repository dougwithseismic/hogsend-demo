// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Callout, Divider, Title } from "./_components/ui.js";
import type { CreditsTopupNudgeEmailProps } from "./types.js";

// Rendered for the `credits-topup-nudge` key — the 80%-consumed upsell, sent
// from the credits-topup-nudge journey.
export default function CreditsTopupNudgeEmail({
  name = "there",
  usedPct = 80,
  creditsRemaining,
  buyUrl = "https://forgeline.dev/billing/credits",
  unsubscribeUrl,
}: CreditsTopupNudgeEmailProps) {
  return (
    <Layout
      preview="You're through 80% of this month's build credits."
      eyebrow="Credits running down"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>You're through {usedPct}% of this month's credits</Title>
      <Body>
        Hi {name} — your workspace has used {usedPct}% of this month's build
        credits. Pipelines and AI reviews keep running until the balance hits
        zero, then they pause.
      </Body>
      <Callout tone="warn">
        <Body>
          {creditsRemaining
            ? `About ${creditsRemaining.toLocaleString()} credits left. A top-up pack pools instantly across the team.`
            : "A top-up pack pools instantly across the team — no plan change needed."}
        </Body>
      </Callout>
      <Divider />
      <Button href={buyUrl}>Buy a credit pack</Button>
    </Layout>
  );
}
