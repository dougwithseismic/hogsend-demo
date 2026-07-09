import { EmailAction } from "@hogsend/email";
// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Section } from "react-email";
import { Layout } from "./_components/layout.js";
import { Body, Callout, Title } from "./_components/ui.js";
import type { CreditsDepletedEmailProps } from "./types.js";

// Rendered for the `credits-depleted` key — pipelines are paused, out of
// credits. Sent from the credits-dunning journey. The "Buy credits" button is a
// SEMANTIC link: clicking it fires `credits.buy_clicked { intent }` through the
// full ingest pipeline (a purchase-intent signal), then redirects to billing.
// Hoisted payload — inline object literals in JSX props trip the scaffolder's
// template-token residue check.
const BUY_INTENT = { intent: "buy" };

export default function CreditsDepletedEmail({
  name = "there",
  landingUrl,
  buyUrl = "https://forgeline.dev/billing/credits",
  unsubscribeUrl,
}: CreditsDepletedEmailProps) {
  const actionHref = landingUrl ?? buyUrl;
  const buttonClass =
    "inline-block rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white no-underline";
  return (
    <Layout
      preview="Your pipelines are paused — you're out of build credits."
      eyebrow="Pipelines paused"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Your pipelines are paused</Title>
      <Body>
        Hi {name} — your workspace hit zero build credits, so Forgeline paused
        pipeline runs and AI reviews. Nothing is lost; everything resumes the
        moment you top up.
      </Body>
      <Callout tone="danger">
        <Body>
          New PRs won't get an AI review and CI won't run until there's a
          balance. A top-up pack pools instantly across the whole team.
        </Body>
      </Callout>
      <Section className="my-6">
        <EmailAction
          event="credits.buy_clicked"
          properties={BUY_INTENT}
          href={actionHref}
          className={buttonClass}
        >
          Buy credits & resume
        </EmailAction>
      </Section>
    </Layout>
  );
}
