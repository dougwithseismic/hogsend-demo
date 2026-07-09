// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Callout, Divider, Title } from "./_components/ui.js";
import type { ActivationFirstReviewEmailProps } from "./types.js";

// Rendered for the `activation-first-review` key — the celebrate-first-value
// email sent once a workspace's first PR gets an AI review.
export default function ActivationFirstReviewEmail({
  name = "there",
  prNumber,
  issuesFound,
  repo,
  reviewUrl = "https://forgeline.dev/reviews",
  unsubscribeUrl,
}: ActivationFirstReviewEmailProps) {
  return (
    <Layout
      preview="Your first AI review is in — here's what it found."
      eyebrow="First review"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Your first AI review is in ✅</Title>
      <Body>
        Nice work, {name}. Forgeline reviewed{" "}
        {prNumber ? `PR #${prNumber}` : "your pull request"}
        {repo ? ` in ${repo}` : ""} and posted its notes right on the diff.
      </Body>
      <Callout tone="brand">
        <Body>
          {issuesFound && issuesFound > 0
            ? `It flagged ${issuesFound} issue${issuesFound === 1 ? "" : "s"} worth a look before you merge.`
            : "It read the whole diff and had no blocking concerns — a clean pass."}
        </Body>
      </Callout>
      <Divider />
      <Button href={reviewUrl}>Open the review</Button>
    </Layout>
  );
}
