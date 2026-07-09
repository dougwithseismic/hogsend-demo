import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, magicLink } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sendMagicLinkEmail, sendOtpEmail } from "./emails.js";
import * as schema from "./schema.js";

/**
 * The demo site's `*.hogsend.com` SSO — a SIBLING of the docs and course
 * Better Auth instances, NOT the engine's Studio auth (which keeps its own
 * users at /api/auth with the "hogsend" cookie prefix). All three sites point
 * at the SAME user DB (SSO_DATABASE_URL — the course app owns it and its
 * migrations), sign with the SAME secret (SSO_AUTH_SECRET), and — in
 * production — set the session cookie on the shared parent domain
 * (AUTH_COOKIE_DOMAIN = `.hogsend.com`). That trio is what makes ONE login
 * work across `*.hogsend.com`: someone signed in on hogsend.com or the course
 * is already signed in here, and a sign-in here follows them back.
 *
 * Mounted at /api/sso/* (see src/routes/sso.ts); the default "better-auth"
 * cookie prefix is DELIBERATE — it must match the docs/course cookie name for
 * the shared cookie to be read, and it cannot clash with the engine's
 * "hogsend"-prefixed Studio cookie on this same origin. Passwordless,
 * matching the siblings: a 6-digit email code (primary) + a magic link
 * (fallback).
 *
 * Everything is lazy + env-gated: with SSO_AUTH_SECRET or SSO_DATABASE_URL
 * unset, no auth instance (and no DB connection) is ever created and the SSO
 * routes stay unmounted — the demo runs exactly as before.
 */

export function ssoConfigured(): boolean {
  return Boolean(process.env.SSO_AUTH_SECRET && process.env.SSO_DATABASE_URL);
}

type SsoAuth = ReturnType<typeof buildAuth>;

let cached: SsoAuth | null = null;

export function getSsoAuth(): SsoAuth {
  cached ??= buildAuth();
  return cached;
}

function buildAuth() {
  const baseURL = process.env.API_PUBLIC_URL ?? "http://localhost:3002";
  // Cross-subdomain SSO: `.hogsend.com` in production, UNSET in local dev
  // (localhost has no shared parent domain — host-only cookie).
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;

  // The shared user DB is a SECOND Postgres (the course app's), separate from
  // the demo engine's own DATABASE_URL. Small pool — this instance only reads
  // and writes auth rows.
  const sql = postgres(process.env.SSO_DATABASE_URL as string, { max: 5 });
  const db = drizzle(sql, { schema });

  return betterAuth({
    basePath: "/api/sso",
    baseURL,
    secret: process.env.SSO_AUTH_SECRET,
    trustedOrigins: [baseURL],
    database: drizzleAdapter(db, { provider: "pg", schema }),
    // Passwordless only — email code / magic link.
    emailAndPassword: { enabled: false },
    ...(cookieDomain
      ? {
          advanced: {
            crossSubDomainCookies: { enabled: true, domain: cookieDomain },
          },
        }
      : {}),
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    plugins: [
      // Primary passwordless method: a 6-digit code the visitor types on the
      // same tab (no inbox round-trip). Creates the user on first sign-in.
      emailOTP({
        otpLength: 6,
        expiresIn: 60 * 15,
        disableSignUp: false,
        sendVerificationOTP: async ({ email, otp, type }) => {
          if (type === "sign-in") {
            await sendOtpEmail(email, otp);
          }
        },
      }),
      // Fallback: the single-use link, for visitors who'd rather click.
      magicLink({
        expiresIn: 60 * 15,
        disableSignUp: false,
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail(email, url);
        },
      }),
    ],
  });
}
