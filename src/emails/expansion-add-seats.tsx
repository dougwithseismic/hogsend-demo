// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Bullets, Button, Divider, Title } from "./_components/ui.js";
import type { ExpansionAddSeatsEmailProps } from "./types.js";

// Rendered for the `expansion-add-seats` key — the seats upsell in the
// expansion-seats journey.
export default function ExpansionAddSeatsEmail({
  name = "there",
  seats,
  seatsUrl = "https://forgeline.dev/settings/seats",
  unsubscribeUrl,
}: ExpansionAddSeatsEmailProps) {
  return (
    <Layout
      preview="Your team is reviewing a lot of PRs — add seats to keep up."
      eyebrow="Grow the team"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Your team is reviewing a lot of PRs</Title>
      <Body>
        Hi {name} — at this volume the whole team gets more out of Forgeline
        when everyone has a seat{seats ? ` (you're on ${seats} today)` : ""}.
        Seats pool the same credits, so nothing about billing gets more
        complicated.
      </Body>
      <Bullets
        items={[
          "Every engineer gets AI reviews on their own PRs",
          "Shared credit pool — one balance for the workspace",
          "Team and Business plans pool 2,000 and 12,000 credits a month",
        ]}
      />
      <Divider />
      <Button href={seatsUrl}>Add seats</Button>
    </Layout>
  );
}
