// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Bullets, Button, Divider, Title } from "./_components/ui.js";
import type { WelcomeEmailProps } from "./types.js";

// Rendered for the `welcome` key. Forgeline runs AI code review + CI on build
// credits — this is the first thing a new workspace owner reads.
export default function WelcomeEmail({
  name = "there",
  startingCredits = 100,
  connectUrl = "https://forgeline.dev/connect",
  unsubscribeUrl,
}: WelcomeEmailProps) {
  return (
    <Layout
      preview="Connect a repo and your first AI review runs in minutes."
      eyebrow="Welcome to Forgeline"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Welcome to Forgeline, {name}</Title>
      <Body>
        Forgeline reviews your pull requests and runs your pipelines. Every
        pipeline run and every AI review spends build credits — your workspace
        starts with {startingCredits} free credits.
      </Body>
      <Bullets
        items={[
          "Connect a repo — GitHub, GitLab, or Bitbucket",
          "Open a PR and Forgeline posts an AI review",
          "Pipeline runs cost 2 credits, an AI review costs 5",
        ]}
      />
      <Divider />
      <Button href={connectUrl}>Connect your first repo</Button>
    </Layout>
  );
}
