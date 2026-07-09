// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Bullets, Button, Divider, Title } from "./_components/ui.js";
import type { ActivationConnectRepoEmailProps } from "./types.js";

// Rendered for the `activation-connect-repo` key — sent from the
// activation-connect-repo journey when a workspace hasn't connected a repo yet.
export default function ActivationConnectRepoEmail({
  name = "there",
  connectUrl = "https://forgeline.dev/connect",
  unsubscribeUrl,
}: ActivationConnectRepoEmailProps) {
  return (
    <Layout
      preview="Connect a repo and Forgeline starts reviewing your PRs."
      eyebrow="Get started"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Connect your first repo</Title>
      <Body>
        Hi {name} — Forgeline can't review anything until it's connected to a
        repo. It takes about a minute, and your free credits are already
        waiting.
      </Body>
      <Bullets
        items={[
          "Pick a repo and grant read access",
          "Forgeline watches for new pull requests",
          "Your first AI review posts on the next PR",
        ]}
      />
      <Divider />
      <Button href={connectUrl}>Connect a repo</Button>
    </Layout>
  );
}
