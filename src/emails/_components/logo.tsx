// biome-ignore lint/correctness/noUnusedImports: required for JSX runtime
import React from "react";
import { Section, Text } from "react-email";

// The Forgeline wordmark, rendered above the email card. Pure type + a colored
// mark so it renders crisply everywhere without a hosted asset. To use a real
// logo, swap the <Text> for:
//   <Img src="https://forgeline.dev/logo.png" width="120" alt="Forgeline" />
export function Logo() {
  return (
    <Section className="mb-6 px-2">
      <Text className="m-0 text-[17px] font-bold tracking-tight text-zinc-900">
        <span className="mr-1.5 text-indigo-500">&#9679;</span>
        {"Forgeline"}
      </Text>
    </Section>
  );
}
