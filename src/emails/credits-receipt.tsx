// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import {
  Body,
  Bullets,
  Button,
  Callout,
  Divider,
  Title,
} from "./_components/ui.js";
import type { CreditsReceiptEmailProps } from "./types.js";

// Rendered for the `credits-receipt` key — transactional top-up receipt.
export default function CreditsReceiptEmail({
  name,
  packName,
  credits,
  amount,
  invoiceNumber,
  newBalance,
  invoiceUrl = "https://forgeline.dev/billing",
  unsubscribeUrl,
}: CreditsReceiptEmailProps) {
  return (
    <Layout
      preview={`Receipt for your ${packName} — ${amount}.`}
      eyebrow="Payment received"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Title>Your credit pack receipt</Title>
      <Body>
        {name ? `Thanks, ${name}. ` : "Thanks. "}Your top-up went through and
        the credits are pooled across your workspace.
      </Body>
      <Callout tone="success">
        <Bullets
          marker="•"
          items={[
            `Pack: ${packName}`,
            credits
              ? `Credits added: ${credits.toLocaleString()}`
              : "Credits added",
            `Charged: ${amount}`,
            invoiceNumber ? `Invoice: ${invoiceNumber}` : "Invoice attached",
            newBalance
              ? `New balance: ${newBalance.toLocaleString()} credits`
              : "Balance updated",
          ]}
        />
      </Callout>
      <Divider />
      <Button href={invoiceUrl} variant="secondary">
        View invoice
      </Button>
    </Layout>
  );
}
