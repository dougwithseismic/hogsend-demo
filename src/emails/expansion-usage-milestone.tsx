// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Callout, Divider, Title } from "./_components/ui.js";
import type { ExpansionUsageMilestoneEmailProps } from "./types.js";

// Rendered for the `expansion-usage-milestone` key — the 50-PR celebrate that
// opens the expansion-seats journey.
export default function ExpansionUsageMilestoneEmail({
  name = "there",
  prsReviewed = 50,
  issuesCaught,
  dashboardUrl = "https://forgeline.dev/dashboard",
  unsubscribeUrl,
}: ExpansionUsageMilestoneEmailProps) {
  return (
    <Layout
      preview={`${prsReviewed} PRs reviewed this month — nice pace.`}
      eyebrow="Milestone"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>{prsReviewed} PRs reviewed this month 🎉</Title>
      <Body>
        Your team crossed {prsReviewed} AI reviews this month, {name}. That's a
        lot of diffs read before merge.
      </Body>
      {issuesCaught && issuesCaught > 0 ? (
        <Callout tone="success">
          <Body>
            Along the way Forgeline flagged {issuesCaught.toLocaleString()}{" "}
            issues worth a second look — bugs, risky changes, and missing tests.
          </Body>
        </Callout>
      ) : null}
      <Divider />
      <Button href={dashboardUrl}>See the breakdown</Button>
    </Layout>
  );
}
