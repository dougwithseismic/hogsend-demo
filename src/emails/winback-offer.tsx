// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Callout, Divider, Title } from "./_components/ui.js";
import type { WinbackOfferEmailProps } from "./types.js";

// Rendered for the `winback-offer` key — the bonus-credit revival offer in the
// winback-repo-quiet and credits-dunning journeys.
export default function WinbackOfferEmail({
  name = "there",
  bonusCredits = 500,
  claimUrl = "https://forgeline.dev/dashboard",
  unsubscribeUrl,
}: WinbackOfferEmailProps) {
  return (
    <Layout
      preview={`${bonusCredits} free credits to pick back up.`}
      eyebrow="On the house"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>{bonusCredits} free credits to pick back up</Title>
      <Body>
        Hi {name} — here's {bonusCredits} build credits, on us. Connect a repo
        or open a PR and Forgeline gets straight back to reviewing.
      </Body>
      <Callout tone="brand">
        <Body>
          The credits are already on your workspace balance. No card, no plan
          change — just open your next pull request.
        </Body>
      </Callout>
      <Divider />
      <Button href={claimUrl}>Pick back up</Button>
    </Layout>
  );
}
