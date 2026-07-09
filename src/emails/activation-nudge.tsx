// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Divider, Title } from "./_components/ui.js";
import type { ActivationNudgeEmailProps } from "./types.js";

// Rendered for the `activation-nudge` key — last-touch nudge for workspaces
// that still haven't connected a repo.
export default function ActivationNudgeEmail({
  name = "there",
  connectUrl = "https://forgeline.dev/connect",
  unsubscribeUrl,
}: ActivationNudgeEmailProps) {
  return (
    <Layout
      preview="Still haven't connected a repo? Here's the one-minute path."
      eyebrow="One step left"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Still haven't connected a repo?</Title>
      <Body>
        Hi {name} — no pressure, but your credits are sitting idle. The moment a
        repo is connected, Forgeline reviews the next PR automatically. That's
        the whole setup.
      </Body>
      <Divider />
      <Button href={connectUrl}>Connect a repo</Button>
    </Layout>
  );
}
