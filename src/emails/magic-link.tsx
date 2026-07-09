// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Layout } from "./_components/layout.js";
import { Body, Button, Divider, Title } from "./_components/ui.js";
import type { MagicLinkEmailProps } from "./types.js";

// Rendered for the `magic-link` key — transactional sign-in link.
export default function MagicLinkEmail({
  loginUrl,
  expiresInMinutes = 15,
  name,
}: MagicLinkEmailProps) {
  return (
    <Layout preview="Your one-tap Forgeline sign-in link.">
      <Title>Sign in to Forgeline</Title>
      <Body>
        {name ? `Hi ${name} — ` : ""}tap the button to sign in. This link
        expires in {expiresInMinutes} minutes and can only be used once.
      </Body>
      <Divider />
      <Button href={loginUrl}>Sign in</Button>
    </Layout>
  );
}
