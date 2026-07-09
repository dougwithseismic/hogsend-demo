/**
 * Server-side forwarding to the DOGFOOD Hogsend instance (t.hogsend.com) — the
 * engine that runs hogsend.com's own lifecycle. This demo app is itself a
 * Hogsend engine, so to be unambiguous: `HOGSEND_API_KEY` etc. talk to THIS
 * demo's data plane; the `HOGSEND_INGEST_*` pair here talks to the dogfood
 * engine, exactly like the docs and course sites do. That's how "someone did
 * the demo" becomes a lifecycle event next to their docs/course activity.
 *
 * Ported from the docs site's lib/ingest.ts (same env names, same contracts).
 * The ingest key never leaves the server; every helper soft-fails (null/false)
 * so an unconfigured or down dogfood never breaks the demo itself.
 */

type IngestEventBody = {
  name: string;
  /** The contact's email — the primary identity arm. NEVER the auth user id
   * as top-level `userId`: a raw auth id mints a phantom external_id twin. */
  email?: string;
  contactProperties?: Record<string, unknown>;
  eventProperties?: Record<string, unknown>;
};

export function ingestConfigured(): boolean {
  return Boolean(
    process.env.HOGSEND_INGEST_URL && process.env.HOGSEND_INGEST_KEY,
  );
}

/** The identified-bell chain needs the ingest pair plus the mint secret. */
export function feedTokenConfigured(): boolean {
  return Boolean(
    process.env.HOGSEND_INGEST_URL &&
      process.env.HOGSEND_INGEST_KEY &&
      process.env.HOGSEND_FEED_TOKEN_SECRET,
  );
}

function ingestBase(): string {
  return (process.env.HOGSEND_INGEST_URL ?? "").replace(/\/+$/, "");
}

/**
 * forwardToIngest — POSTs one lifecycle event to the dogfood /v1/events.
 * Returns true on a 2xx; throws nothing — failures come back false.
 */
export async function forwardToIngest(
  body: IngestEventBody,
  idempotencyKey: string,
): Promise<boolean> {
  const ingestKey = process.env.HOGSEND_INGEST_KEY;
  if (!ingestConfigured() || !ingestKey) return false;
  try {
    const upstream = await fetch(`${ingestBase()}/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ingestKey}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    return upstream.ok;
  } catch {
    return false;
  }
}

/**
 * Secret-path contact fold: assert { email, userId } onto ONE contact via
 * PUT /v1/contacts. A signed-in visitor proved their email (OTP / magic-link),
 * so their Better Auth id becomes the contact's external_id — the canonical
 * feed recipient key. Idempotent upsert; false on any failure.
 */
export async function foldContactIdentity(input: {
  email: string;
  userId: string;
  firstName?: string;
}): Promise<boolean> {
  const ingestKey = process.env.HOGSEND_INGEST_KEY;
  if (!ingestConfigured() || !ingestKey) return false;
  try {
    const upstream = await fetch(`${ingestBase()}/v1/contacts`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ingestKey}`,
      },
      body: JSON.stringify({
        email: input.email,
        userId: input.userId,
        ...(input.firstName
          ? { properties: { firstName: input.firstName } }
          : {}),
      }),
      signal: AbortSignal.timeout(5000),
    });
    return upstream.ok;
  } catch {
    return false;
  }
}

/**
 * The contact's CANONICAL feed key (its `external_id`) for this email — the
 * recipient key journeys write to and the bell must poll. NOT always the
 * Better Auth id: a contact identified earlier (the docs, the course, a
 * PostHog sync) keeps its own external_id, with the auth id linked only as an
 * alias. Null when unconfigured, unknown, or on failure (caller falls back to
 * the auth id, correct for a fresh contact).
 */
export async function resolveContactKey(input: {
  email: string;
}): Promise<string | null> {
  const ingestKey = process.env.HOGSEND_INGEST_KEY;
  if (!ingestConfigured() || !ingestKey) return null;
  try {
    const url = new URL(`${ingestBase()}/v1/contacts/find`);
    url.searchParams.set("email", input.email);
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${ingestKey}` },
      signal: AbortSignal.timeout(2500),
    });
    if (!upstream.ok) return null;
    const body = (await upstream.json().catch(() => null)) as {
      contacts?: Array<{ externalId?: string | null }>;
    } | null;
    const externalId = body?.contacts?.[0]?.externalId;
    return typeof externalId === "string" && externalId ? externalId : null;
  } catch {
    return null;
  }
}

/**
 * Mint the browser feed userToken via the dogfood-hosted signer
 * (POST /v1/course/feed-token, shared `x-course-token-secret`). The endpoint
 * name says "course" because the course shipped it first — it is the ONE mint
 * the dogfood exposes and the docs site already reuses it verbatim; so do we.
 * Null on any failure.
 */
export async function mintFeedToken(
  userId: string,
): Promise<{ token: string; expiresInSeconds: number } | null> {
  const secret = process.env.HOGSEND_FEED_TOKEN_SECRET;
  if (!process.env.HOGSEND_INGEST_URL || !secret) return null;
  try {
    const upstream = await fetch(`${ingestBase()}/v1/course/feed-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-course-token-secret": secret,
      },
      body: JSON.stringify({ userId }),
      signal: AbortSignal.timeout(5000),
    });
    if (!upstream.ok) return null;
    const body = (await upstream.json().catch(() => null)) as {
      token?: unknown;
      expiresInSeconds?: unknown;
    } | null;
    if (!body || typeof body.token !== "string") return null;
    return {
      token: body.token,
      expiresInSeconds:
        typeof body.expiresInSeconds === "number"
          ? body.expiresInSeconds
          : 3600,
    };
  } catch {
    return null;
  }
}
