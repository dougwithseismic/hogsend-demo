// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Divider, Title } from "./_components/ui.js";
import type { CreditsLowBalanceEmailProps } from "./types.js";

// Rendered for the `credits-low-balance` key — a follow-up when the balance is
// nearly gone (credits-topup-nudge + credits-dunning journeys).
export default function CreditsLowBalanceEmail({
  name = "there",
  creditsRemaining,
  buyUrl = "https://forgeline.dev/billing/credits",
  unsubscribeUrl,
}: CreditsLowBalanceEmailProps) {
  return (
    <Layout
      preview="Low on build credits — top up before pipelines pause."
      eyebrow="Low balance"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Low on build credits</Title>
      <Body>
        Hi {name} —{" "}
        {creditsRemaining
          ? `you're down to about ${creditsRemaining.toLocaleString()} credits.`
          : "your workspace is nearly out of credits."}{" "}
        When the balance hits zero, pipeline runs and AI reviews pause until you
        top up.
      </Body>
      <Divider />
      <Button href={buyUrl}>Top up now</Button>
    </Layout>
  );
}
