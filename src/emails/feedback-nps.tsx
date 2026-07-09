import { EmailAction, HOSTED_ANSWER_HREF } from "@hogsend/email";
// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Section, Text } from "react-email";
import { Events } from "../journeys/constants/index.js";
import { Layout } from "./_components/layout.js";
import { Body, Title } from "./_components/ui.js";
import type { FeedbackNpsEmailProps } from "./types.js";

// Rendered for the `feedback-nps` key — SEMANTIC LINKS end to end. Each of the
// 0–10 buttons is an `EmailAction`: the click IS the answer, firing
// `feedback.submitted { value }` through the full ingest pipeline. The
// feedback-nps journey reads the score via `ctx.waitForEvent → properties`.
// (The same score is askable via an in-app bell survey block — both surfaces
// emit one `feedback.submitted` stream.)
//
// Hoisted payloads — a single `{ value: n }` per score, precomputed so no inline
// double-brace object literal appears in JSX props.
const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const SCORE_PROPS = SCORES.map((value) => ({ value }));

export default function FeedbackNpsEmail({
  name = "there",
  landingUrl = HOSTED_ANSWER_HREF,
  unsubscribeUrl,
}: FeedbackNpsEmailProps) {
  const scoreClass =
    "mx-0.5 inline-block rounded-md border border-solid border-zinc-200 bg-white px-2.5 py-2 text-sm font-semibold text-zinc-700 no-underline";
  return (
    <Layout
      preview="One tap: how likely are you to recommend Forgeline?"
      eyebrow="Quick question"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>How's Forgeline treating you?</Title>
      <Body>
        Hi {name} — one tap. How likely are you to recommend Forgeline to
        another team? 0 is not at all, 10 is absolutely.
      </Body>
      <Section className="my-6 text-center">
        {SCORES.map((n) => (
          <EmailAction
            key={n}
            event={Events.FEEDBACK_SUBMITTED}
            properties={SCORE_PROPS[n]}
            href={landingUrl}
            className={scoreClass}
          >
            {String(n)}
          </EmailAction>
        ))}
      </Section>
      <Text className="m-0 text-center text-xs text-zinc-400">
        Not likely &nbsp;·&nbsp; Very likely
      </Text>
      <Body>Whatever you pick, we read every answer. Thank you.</Body>
    </Layout>
  );
}
