// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Divider, Title } from "./_components/ui.js";
import type { WinbackRepoQuietEmailProps } from "./types.js";

// Rendered for the `winback-repo-quiet` key — opens the winback-repo-quiet
// journey when a repo goes dormant.
export default function WinbackRepoQuietEmail({
  name = "there",
  repo,
  connectUrl = "https://forgeline.dev/dashboard",
  unsubscribeUrl,
}: WinbackRepoQuietEmailProps) {
  return (
    <Layout
      preview="Your repo's gone quiet — no pipeline runs in two weeks."
      eyebrow="Quiet repo"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Your repo's gone quiet</Title>
      <Body>
        Hi {name} — {repo ? `${repo} hasn't` : "your connected repo hasn't"} had
        a pipeline run in two weeks. If the team moved to another repo, connect
        it and reviews pick up where they left off.
      </Body>
      <Divider />
      <Button href={connectUrl}>Open your dashboard</Button>
    </Layout>
  );
}
