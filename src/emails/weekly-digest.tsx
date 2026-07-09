// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Bullets, Button, Divider, Title } from "./_components/ui.js";
import type { WeeklyDigestEmailProps } from "./types.js";

// Rendered for the `weekly-digest` key — the weekly Forgeline recap.
export default function WeeklyDigestEmail({
  name = "there",
  reviews = 84,
  issuesCaught = 3,
  buildsRun,
  creditsUsed,
  dashboardUrl = "https://forgeline.dev/dashboard",
  unsubscribeUrl,
}: WeeklyDigestEmailProps) {
  return (
    <Layout
      preview={`Your Forgeline week: ${reviews} reviews, ${issuesCaught} issues caught.`}
      eyebrow="Your week"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>
        Your Forgeline week: {reviews} reviews, {issuesCaught} issues caught
      </Title>
      <Body>
        Hi {name} — here's what Forgeline did across your workspace this week.
      </Body>
      <Bullets
        marker="→"
        items={[
          `${reviews} pull requests reviewed`,
          `${issuesCaught} issue${issuesCaught === 1 ? "" : "s"} caught before merge`,
          buildsRun
            ? `${buildsRun.toLocaleString()} pipeline runs`
            : "Pipelines ran clean",
          creditsUsed
            ? `${creditsUsed.toLocaleString()} build credits spent`
            : "Credits spent this week",
        ]}
      />
      <Divider />
      <Button href={dashboardUrl}>Open your dashboard</Button>
    </Layout>
  );
}
