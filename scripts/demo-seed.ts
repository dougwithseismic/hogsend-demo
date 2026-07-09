/**
 * Forgeline demo seed — populates the database with a realistic Series-A-sized
 * dataset so the Hogsend Studio looks like a thriving credit-based dev-tool SaaS.
 *
 * Everything it writes is scoped to a `demo_` externalId / userId prefix (plus
 * the `demo_%` campaign idempotency keys and the fictional @forgeline.dev link
 * minters), so it is fully IDEMPOTENT (deletes prior demo rows first) and never
 * touches real data. It writes DIRECTLY to the tables — it does NOT run any
 * journeys, so no real emails / Discord / Telegram messages are ever sent.
 * Scheduled campaigns are safe by construction: see the §7b SAFETY note.
 *
 *   DATABASE_URL=... pnpm db:seed
 *
 * TIME MODEL — fully relative, rolls forward on every reseed. Every timestamp is
 * derived from a single seed-time anchor `NOW`; nothing is hardcoded to a
 * calendar date, so a reseed next month still looks like "the last N days".
 * Window via SEED_WINDOW_DAYS (default 180 = 6 months; set 90 for last quarter).
 *
 * ID CONTRACT (critical): the Studio metrics map over the CODE registries, so a
 * `journey_states.journeyId` / `email_sends.templateKey` / `bucket_memberships.bucketId`
 * that isn't a REGISTERED id renders ZERO. The ids below MUST match
 * `src/journeys/index.ts`, `src/emails/registry.ts`, and `src/buckets/index.ts`.
 * The same goes for `campaigns.audienceId` (a registered list/bucket id) and
 * `campaigns.templateKey`.
 */
import { randomUUID } from "node:crypto";
import {
  bucketMemberships,
  campaigns,
  connectorDeliveries,
  contacts,
  emailPreferences,
  emailSends,
  type FeedBlock,
  feedItems,
  journeyStates,
  linkClicks,
  links,
  trackedLinks,
  userEvents,
} from "@hogsend/db";
import { inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

// --- Deterministic PRNG so the dataset is stable across runs ---------------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260709);
const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(rand() * arr.length)] as T;
const int = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;
const chance = (p: number) => rand() < p;
/** Weighted pick from [value, weight] pairs. */
function weighted<T>(pairs: readonly (readonly [T, number])[]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r < 0) return v;
  }
  const last = pairs[pairs.length - 1];
  if (!last) throw new Error("weighted() requires at least one pair");
  return last[0];
}

// --- Time model ------------------------------------------------------------
const WINDOW_DAYS = Number(process.env.SEED_WINDOW_DAYS ?? 180);
const NOW = Date.now();
const DAY = 86_400_000;
const HOUR = 3_600_000;
const MIN = 60_000;
const at = (ms: number) => new Date(Math.min(ms, NOW - MIN));
const daysAgo = (d: number, jitterH = 12) =>
  NOW - d * DAY - int(0, jitterH) * HOUR;
/** A recent-weighted "days ago" in [0, span); higher exp = denser toward now. */
const recentDaysAgo = (span: number, exp = 1.3) => span * rand() ** exp;

// --- People + companies ----------------------------------------------------
const FIRST = [
  "Ada",
  "Lin",
  "Marco",
  "Priya",
  "Sofia",
  "Noah",
  "Elena",
  "Diego",
  "Yuki",
  "Omar",
  "Hana",
  "Theo",
  "Maya",
  "Ivan",
  "Zoe",
  "Liam",
  "Nina",
  "Caleb",
  "Aria",
  "Ravi",
  "Mila",
  "Felix",
  "Sara",
  "Jonas",
  "Lena",
  "Kofi",
  "Amara",
  "Tom",
  "Grace",
  "Bo",
  "Iris",
  "Sami",
  "Otto",
  "Vera",
  "Hugo",
  "Nadia",
  "Pablo",
  "Esme",
  "Karl",
  "Tara",
  "Leo",
  "Wren",
  "Cyrus",
  "Dahlia",
  "Jude",
  "Anya",
  "Reza",
  "Cleo",
  "Milo",
  "Freya",
  "Said",
  "Tess",
  "Niko",
  "Ines",
  "Bram",
  "Yara",
  "Emil",
  "Lucia",
  "Arlo",
  "Devi",
  "Soren",
  "Nora",
  "Idris",
  "Beatriz",
] as const;
const LAST = [
  "Okafor",
  "Reyes",
  "Nguyen",
  "Costa",
  "Haddad",
  "Lindqvist",
  "Moreno",
  "Petrov",
  "Kim",
  "Bauer",
  "Silva",
  "Novak",
  "Adeyemi",
  "Rossi",
  "Mbeki",
  "Kowalski",
  "Tan",
  "Fischer",
  "Abate",
  "Singh",
  "Larsen",
  "Mensah",
  "Vasquez",
  "Holm",
  "Dubois",
  "Bianchi",
  "Sato",
  "Walsh",
  "Cohen",
  "Park",
] as const;
const COMPANIES = [
  "Corewave",
  "Northstar",
  "Kettle",
  "Fathom",
  "Peat",
  "Mosaic",
  "Driftly",
  "Pinely",
  "Brightloop",
  "Tideline",
  "Quill",
  "Lumen",
  "Sundeck",
  "Vellum",
  "Foundry",
  "Riverstone",
  "Cobalt",
  "Meridian",
  "Slate",
  "Harbor",
  "Aperture",
  "Beacon",
  "Cinder",
  "Dusklight",
  "Evercode",
  "Flint",
  "Granite",
  "Hollow",
  "Ionize",
  "Junction",
  "Kiln",
  "Loom",
  "Monolith",
  "Nimbus",
  "Orbit",
  "Payload",
  "Quanta",
  "Runway",
  "Sable",
  "Tessellate",
  "Umbra",
  "Vertex",
] as const;
const DOMAINS = [
  "io",
  "dev",
  "app",
  "co",
  "sh",
  "build",
  "tech",
  "cloud",
] as const;
const TZS = [
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Asia/Singapore",
  "Asia/Bengaluru",
  "Australia/Sydney",
  "America/Sao_Paulo",
] as const;
const REPO_NAMES = [
  "web",
  "api",
  "platform",
  "core",
  "monorepo",
  "infra",
  "dashboard",
  "mobile",
  "billing",
  "edge",
  "pipeline",
  "sdk",
  "console",
  "gateway",
  "worker",
] as const;

// Plans + credit economics (drives the numbers). ----------------------------
type Plan = "free" | "team" | "business" | "enterprise";
const PLAN_MIX: readonly (readonly [Plan, number])[] = [
  ["free", 62],
  ["team", 24],
  ["business", 11],
  ["enterprise", 3],
];
const MONTHLY_CREDITS: Record<Plan, number> = {
  free: 100,
  team: 2000,
  business: 12000,
  enterprise: 100000,
};
const PLAN_MRR: Record<Plan, () => number> = {
  free: () => 0,
  team: () => 49 * int(3, 14),
  business: () => 199,
  enterprise: () => int(1200, 1900),
};

// --- Registered ids (MUST match the code registries) -----------------------
const TEMPLATE_META: Record<string, { subject: string; category: string }> = {
  welcome: { subject: "Welcome to Forgeline", category: "transactional" },
  "magic-link": {
    subject: "Your Forgeline sign-in link",
    category: "transactional",
  },
  "credits-receipt": {
    subject: "Your Forgeline credit pack receipt",
    category: "transactional",
  },
  "activation-connect-repo": {
    subject: "Connect your first repo to start reviewing",
    category: "journey",
  },
  "activation-first-review": {
    subject: "Your first AI review is in ✅",
    category: "journey",
  },
  "activation-nudge": {
    subject: "Still haven't connected a repo?",
    category: "journey",
  },
  "credits-topup-nudge": {
    subject: "You're through 80% of this month's build credits",
    category: "journey",
  },
  "credits-low-balance": {
    subject: "Low on build credits",
    category: "journey",
  },
  "credits-depleted": {
    subject: "Your pipelines are paused — out of credits",
    category: "journey",
  },
  "expansion-usage-milestone": {
    subject: "50 PRs reviewed this month 🎉",
    category: "journey",
  },
  "expansion-add-seats": {
    subject: "Your team is reviewing a lot of PRs",
    category: "journey",
  },
  "winback-repo-quiet": {
    subject: "Your repo's gone quiet",
    category: "journey",
  },
  "winback-offer": {
    subject: "500 free credits to pick back up",
    category: "journey",
  },
  "feedback-nps": {
    subject: "Quick one — how's Forgeline treating you?",
    category: "journey",
  },
  "weekly-digest": {
    subject: "Your Forgeline week: 84 reviews, 3 issues caught",
    category: "journey",
  },
};
const tplMeta = (key: string) =>
  TEMPLATE_META[key] ?? { subject: key, category: "journey" };

// Per-template engagement (open rate; click rate is of opened). --------------
const ENGAGEMENT: Record<string, { open: number; click: number }> = {
  welcome: { open: 0.78, click: 0.2 },
  "magic-link": { open: 0.8, click: 0.28 },
  "credits-receipt": { open: 0.72, click: 0.13 },
  "activation-connect-repo": { open: 0.56, click: 0.16 },
  "activation-first-review": { open: 0.64, click: 0.2 },
  "activation-nudge": { open: 0.48, click: 0.11 },
  "credits-topup-nudge": { open: 0.58, click: 0.17 },
  "credits-low-balance": { open: 0.55, click: 0.15 },
  "credits-depleted": { open: 0.62, click: 0.28 }, // dunning — pinned by §1
  "expansion-usage-milestone": { open: 0.66, click: 0.2 },
  "expansion-add-seats": { open: 0.52, click: 0.14 },
  "winback-repo-quiet": { open: 0.44, click: 0.1 },
  "winback-offer": { open: 0.5, click: 0.15 },
  "feedback-nps": { open: 0.6, click: 0.21 },
  "weekly-digest": { open: 0.41, click: 0.12 }, // digest — pinned by §1
};

// Journeys — registered ids + funnel targets (§1) + templates they send. -----
type JourneyCfg = {
  id: string;
  enrolled: number;
  completion: number;
  templates: string[];
};
const JOURNEYS: JourneyCfg[] = [
  {
    id: "activation-connect-repo",
    enrolled: 1240,
    completion: 0.68,
    templates: ["welcome", "activation-connect-repo", "activation-nudge"],
  },
  {
    id: "activation-first-review",
    enrolled: 980,
    completion: 0.72,
    templates: ["activation-first-review", "activation-nudge"],
  },
  {
    id: "credits-topup-nudge",
    enrolled: 860,
    completion: 0.61,
    templates: ["credits-topup-nudge", "credits-low-balance"],
  },
  {
    id: "credits-dunning",
    enrolled: 410,
    completion: 0.38,
    templates: ["credits-depleted", "winback-offer", "credits-low-balance"],
  },
  {
    id: "expansion-seats",
    enrolled: 320,
    completion: 0.55,
    templates: ["expansion-usage-milestone", "expansion-add-seats"],
  },
  {
    id: "winback-repo-quiet",
    enrolled: 540,
    completion: 0.14,
    templates: ["winback-repo-quiet", "winback-offer"],
  },
  {
    id: "feedback-nps",
    enrolled: 730,
    completion: 0.84,
    templates: ["feedback-nps"],
  },
  { id: "test-onboarding", enrolled: 6, completion: 1.0, templates: [] },
];

// Buckets — registered ids + active sizes (§4). ------------------------------
const BUCKETS: { id: string; active: number; left: number }[] = [
  { id: "power-teams", active: 180, left: 90 },
  { id: "low-credits", active: 260, left: 170 },
  { id: "trial-ending", active: 90, left: 120 },
  { id: "dormant-repos", active: 140, left: 100 },
];

const ERRORS = [
  "Provider API timeout after 3 retries",
  "Template render failed: missing prop `name`",
  "Recipient hard-bounced mid-journey",
  "Hatchet task exceeded max duration",
];

// ---------------------------------------------------------------------------
// 1. Contacts (workspaces)
// ---------------------------------------------------------------------------
const CONTACT_COUNT = 3214;
const usedEmails = new Set<string>();

type Contact = {
  externalId: string;
  email: string;
  name: string;
  workspace: string;
  plan: Plan;
  timezone: string;
  discordLinked: boolean;
  telegramLinked: boolean;
  creditsPct: number;
  dormant: boolean;
  onTrial: boolean;
  repo: string;
  firstSeenMs: number;
  lastSeenMs: number;
  properties: Record<string, unknown>;
};

const people: Contact[] = Array.from({ length: CONTACT_COUNT }, (_, i) => {
  const first = pick(FIRST);
  const last = pick(LAST);
  const company = pick(COMPANIES);
  const slug = company.toLowerCase();
  const domain = `${slug}.${pick(DOMAINS)}`;
  const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "");
  let email = `${handle}@${domain}`;
  let n = 2;
  while (usedEmails.has(email)) {
    email = `${handle}${n}@${domain}`;
    n += 1;
  }
  usedEmails.add(email);

  const plan = weighted(PLAN_MIX);
  const monthly = MONTHLY_CREDITS[plan];
  const creditsPct = weighted<number>([
    [int(0, 19), 22], // low
    [int(20, 59), 40], // mid
    [int(60, 100), 38], // healthy
  ]);
  const creditsBalance = Math.round((creditsPct / 100) * monthly);
  const prsTotal = weighted<number>([
    [int(0, 40), 30],
    [int(41, 300), 45],
    [int(301, 2400), 22],
    [int(2401, 9000), 3],
  ]);
  const buildsTotal = prsTotal * int(3, 6) + int(0, 200);
  const reposConnected = prsTotal === 0 ? int(0, 1) : int(1, 8);
  const dormant = reposConnected > 0 && chance(0.11);
  const onTrial = (plan === "team" || plan === "business") && chance(0.18);
  const daysSinceBuild = dormant ? int(14, 60) : int(0, 10);
  const firstSeenMs = daysAgo(int(1, WINDOW_DAYS));
  const lastSeenMs = dormant ? daysAgo(daysSinceBuild) : daysAgo(int(0, 6));
  const discordLinked = chance(0.28);
  const telegramLinked = chance(0.12);

  return {
    externalId: `demo_w${String(i + 1).padStart(4, "0")}`,
    email,
    name: `${first} ${last}`,
    workspace: company,
    plan,
    timezone: pick(TZS),
    discordLinked,
    telegramLinked,
    creditsPct,
    dormant,
    onTrial,
    repo: `${slug}/${pick(REPO_NAMES)}`,
    firstSeenMs,
    lastSeenMs,
    properties: {
      name: `${first} ${last}`,
      workspace: company,
      plan,
      credits_balance: creditsBalance,
      credits_pct: creditsPct,
      credits_purchased_total: prsTotal > 40 ? int(1, 60) * 1000 : 0,
      prs_reviewed_total: prsTotal,
      builds_run_total: buildsTotal,
      repos_connected: reposConnected,
      mrr: PLAN_MRR[plan](),
      on_trial: onTrial,
      trial_days_left: onTrial ? int(0, 3) : null,
      discord_linked: discordLinked,
      telegram_linked: telegramLinked,
      repo: `${slug}/${pick(REPO_NAMES)}`,
      days_since_build: daysSinceBuild,
      source: "demo",
    },
  };
});

const cursor = { i: 0 };
const nextContact = () => people[cursor.i++ % people.length] as Contact;

// ---------------------------------------------------------------------------
// 2. Email preferences (drives Suppressions + unsub tiles)
// ---------------------------------------------------------------------------
type EP = typeof emailPreferences.$inferInsert;
const prefRows: EP[] = people.map((u, i) => {
  const roll = i / people.length;
  // ~1.4% unsubscribed, ~0.8% bounce-suppressed, ~0.2% complaint-suppressed.
  if (roll < 0.014) {
    return {
      userId: u.externalId,
      email: u.email,
      unsubscribedAll: true,
      suppressed: true,
      categories: {},
      suppressedAt: at(daysAgo(int(1, 60))),
    };
  }
  if (roll < 0.022) {
    const lb = at(daysAgo(int(0, 30)));
    return {
      userId: u.externalId,
      email: u.email,
      unsubscribedAll: false,
      suppressed: true,
      bounceCount: int(1, 4),
      categories: {},
      suppressedAt: lb,
      lastBounceAt: lb,
    };
  }
  if (roll < 0.024) {
    return {
      userId: u.externalId,
      email: u.email,
      unsubscribedAll: false,
      suppressed: true,
      categories: {},
      suppressedAt: at(daysAgo(int(0, 20))),
    };
  }
  // Small marketing-category opt-outs otherwise.
  const categories: Record<string, boolean> = chance(0.06)
    ? { "product-updates": false }
    : {};
  return {
    userId: u.externalId,
    email: u.email,
    unsubscribedAll: false,
    suppressed: false,
    categories,
  };
});

// ---------------------------------------------------------------------------
// 3. Journey states (funnel targets from §1)
// ---------------------------------------------------------------------------
type JS = typeof journeyStates.$inferInsert;
type StateMeta = {
  journeyId: string;
  templates: string[];
  contact: Contact;
  status: string;
  createdMs: number;
};
const journeyStateRows: JS[] = [];
const stateMeta: StateMeta[] = [];

for (const j of JOURNEYS) {
  // completion% pins `completed`; the rest of the enrollment splits into a
  // small in-flight (active+waiting ≈ 8.6%) + failed + exited pool, each capped
  // against remaining capacity so `completed=enrolled` (e.g. test-onboarding at
  // 100%) doesn't overshoot the enrolled total.
  const completed = Math.round(j.enrolled * j.completion);
  const remaining = Math.max(0, j.enrolled - completed);
  const inFlight = Math.min(Math.round(j.enrolled * 0.086), remaining);
  const active = Math.round(inFlight * 0.55);
  const waiting = inFlight - active;
  const failed = Math.min(Math.round(j.enrolled * 0.02), remaining - inFlight);
  const exited = remaining - inFlight - failed;
  const counts: Record<string, number> = {
    active,
    waiting,
    completed,
    failed,
    exited,
  };

  for (const status of Object.keys(counts)) {
    for (let k = 0; k < counts[status]!; k++) {
      const u = nextContact();
      let createdMs: number;
      let currentNodeId: string;
      let completedAt: Date | null = null;
      let exitedAt: Date | null = null;
      let errorMessage: string | null = null;
      let updatedMs: number;

      if (status === "active") {
        createdMs = daysAgo(int(0, 6));
        currentNodeId = pick([
          "welcome-sent",
          "await-connect",
          "await-review",
          "pre-seats",
          "await-nps",
        ]);
        updatedMs = createdMs + int(1, 40) * HOUR;
      } else if (status === "waiting") {
        createdMs = daysAgo(int(1, 9));
        currentNodeId = "sleeping";
        updatedMs = createdMs + int(2, 30) * HOUR;
      } else if (status === "completed") {
        createdMs = daysAgo(int(2, WINDOW_DAYS));
        const dur = int(1, 8) * DAY + int(0, 20) * HOUR;
        completedAt = at(createdMs + dur);
        currentNodeId = "journey-complete";
        updatedMs = completedAt.getTime();
      } else if (status === "failed") {
        createdMs = daysAgo(int(2, 40));
        errorMessage = pick(ERRORS);
        currentNodeId = "send-email";
        updatedMs = createdMs + int(1, 24) * HOUR;
      } else {
        createdMs = daysAgo(int(2, WINDOW_DAYS));
        exitedAt = at(createdMs + int(0, 6) * DAY + int(1, 20) * HOUR);
        currentNodeId = "exit-on-event";
        updatedMs = exitedAt.getTime();
      }

      journeyStateRows.push({
        userId: u.externalId,
        userEmail: u.email,
        journeyId: j.id,
        currentNodeId,
        status: status as JS["status"],
        context: { plan: u.plan, workspace: u.workspace },
        errorMessage,
        entryCount: 1,
        completedAt,
        exitedAt,
        createdAt: at(createdMs),
        updatedAt: at(updatedMs),
      });
      stateMeta.push({
        journeyId: j.id,
        templates: j.templates,
        contact: u,
        status,
        createdMs,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Email sends (§1 engagement funnel + 24h/7d/30d tiles)
// ---------------------------------------------------------------------------
const TOTAL_SENDS = 46000;
type SendIntent = {
  templateKey: string;
  contact: Contact;
  journeyStateId: string | null;
};

/** Build the per-send outcome funnel given the send's age in days. */
function buildSend(
  intent: SendIntent,
  sentDaysAgo: number,
): typeof emailSends.$inferInsert {
  const meta = tplMeta(intent.templateKey);
  const eng = ENGAGEMENT[intent.templateKey] ?? { open: 0.5, click: 0.2 };
  const sentMs = NOW - sentDaysAgo * DAY;
  const createdMs = sentMs - int(1, 8) * MIN;

  let status:
    | "queued"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "complained"
    | "failed" = "delivered";
  let sentAt: Date | null = at(sentMs);
  let deliveredAt: Date | null = null;
  let openedAt: Date | null = null;
  let clickedAt: Date | null = null;
  let bouncedAt: Date | null = null;
  let complainedAt: Date | null = null;
  let bounceType: string | null = null;
  let bounceReason: string | null = null;

  const r = rand();
  if (r < 0.01) {
    status = "queued";
    sentAt = null;
  } else if (r < 0.016) {
    // ~0.6% bounce (the overview tile) — hard/soft/transient with a reason.
    status = "bounced";
    bouncedAt = at(sentMs + int(1, 30) * MIN);
    bounceType = pick(["hard", "soft", "transient"]);
    bounceReason = pick([
      "Mailbox does not exist",
      "Mailbox full",
      "Message rejected by recipient server",
    ]);
  } else if (r < 0.018) {
    // ~0.2% complaint.
    status = "complained";
    deliveredAt = at(sentMs + int(1, 20) * MIN);
    complainedAt = at(deliveredAt.getTime() + int(2, 40) * HOUR);
  } else {
    deliveredAt = at(sentMs + int(1, 15) * MIN);
    status = "delivered";
    if (chance(eng.open)) {
      openedAt = at(deliveredAt.getTime() + int(5, 60 * 30) * MIN);
      status = "opened";
      if (chance(eng.click)) {
        clickedAt = at(openedAt.getTime() + int(1, 360) * MIN);
        status = "clicked";
      }
    }
  }

  return {
    journeyStateId: intent.journeyStateId,
    userId: intent.contact.externalId,
    userEmail: intent.contact.email,
    templateKey: intent.templateKey,
    fromEmail: "hello@forgeline.dev",
    toEmail: intent.contact.email,
    subject: meta.subject,
    category: meta.category,
    status,
    sentAt,
    deliveredAt,
    openedAt,
    clickedAt,
    bouncedAt,
    complainedAt,
    bounceType,
    bounceReason,
    messageId:
      status === "queued"
        ? null
        : `fl_${Math.floor(rand() * 1e16).toString(36)}`,
    createdAt: at(createdMs),
    updatedAt: at(
      clickedAt?.getTime() ??
        openedAt?.getTime() ??
        deliveredAt?.getTime() ??
        bouncedAt?.getTime() ??
        complainedAt?.getTime() ??
        sentAt?.getTime() ??
        createdMs,
    ),
  };
}

// Build send INTENTS: journey-tied (so the per-journey funnels light up), then
// standalone (weekly digest + transactional) to reach TOTAL_SENDS.
// `insertedStateIds` is filled after states insert.
function buildSendRows(
  insertedStateIds: string[],
): (typeof emailSends.$inferInsert)[] {
  const intents: SendIntent[] = [];
  insertedStateIds.forEach((stateId, idx) => {
    const meta = stateMeta[idx];
    if (!meta || meta.templates.length === 0) return;
    const len = meta.templates.length;
    const nSends =
      meta.status === "completed"
        ? len
        : meta.status === "active" || meta.status === "waiting"
          ? Math.min(len, int(1, 2))
          : meta.status === "exited"
            ? int(0, 1)
            : meta.status === "failed"
              ? chance(0.5)
                ? 1
                : 0
              : 1;
    for (let k = 0; k < nSends; k++) {
      intents.push({
        templateKey: meta.templates[k % len] as string,
        contact: meta.contact,
        journeyStateId: stateId,
      });
    }
  });

  // Standalone: recurring weekly digest (bulk) + transactional one-offs.
  const STANDALONE_MIX: readonly (readonly [string, number])[] = [
    ["weekly-digest", 56],
    ["magic-link", 18],
    ["credits-receipt", 15],
    ["welcome", 11],
  ];
  while (intents.length < TOTAL_SENDS) {
    intents.push({
      templateKey: weighted(STANDALONE_MIX),
      contact: pick(people),
      journeyStateId: null,
    });
  }
  if (intents.length > TOTAL_SENDS) intents.length = TOTAL_SENDS;

  // Deterministic Fisher-Yates shuffle so recency buckets aren't template-biased.
  for (let i = intents.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [intents[i], intents[j]] = [intents[j]!, intents[i]!];
  }

  // Recency buckets tuned to the overview tiles: 24h≈210, 7d≈1,540, 30d≈6,700.
  return intents.map((intent, i) => {
    let sentDaysAgo: number;
    if (i < 210) sentDaysAgo = rand();
    else if (i < 1540) sentDaysAgo = 1 + rand() * 6;
    else if (i < 6700) sentDaysAgo = 7 + rand() * 23;
    else sentDaysAgo = 30 + recentDaysAgo(WINDOW_DAYS - 30, 1.4);
    return buildSend(intent, sentDaysAgo);
  });
}

// ---------------------------------------------------------------------------
// 5. User events (~34,000; ~9,000 in 30d; NPS ≈ +52; Discord/Telegram)
// ---------------------------------------------------------------------------
type EV = typeof userEvents.$inferInsert;
const eventRows: EV[] = [];
const evt = (
  contact: Contact,
  event: string,
  properties: Record<string, unknown>,
  daysAgoVal: number,
) => {
  eventRows.push({
    userId: contact.externalId,
    event,
    properties: { ...properties, source: "demo" },
    occurredAt: at(NOW - daysAgoVal * DAY),
  });
};

for (const u of people) {
  const firstDays = (NOW - u.firstSeenMs) / DAY;
  // Lifecycle spine.
  evt(
    u,
    "workspace.created",
    { plan: u.plan, workspace: u.workspace },
    firstDays,
  );
  const repos = Number(u.properties.repos_connected) || 0;
  if (repos > 0) {
    evt(
      u,
      "repo.connected",
      { repo: u.repo },
      Math.max(0.1, firstDays - int(0, 2)),
    );
  }
  if (u.plan !== "free" && chance(0.7)) {
    evt(
      u,
      "subscription.started",
      { plan: u.plan },
      recentDaysAgo(firstDays || WINDOW_DAYS),
    );
  }
  if (Number(u.properties.credits_purchased_total) > 0) {
    const packs = int(1, 2);
    for (let p = 0; p < packs; p++) {
      evt(
        u,
        "credits.purchased",
        { pack: pick([1000, 5000, 25000]) },
        recentDaysAgo(WINDOW_DAYS),
      );
    }
  }

  // High-frequency activity — build.run > pr.reviewed > credits.spent. Each
  // iteration = one pipeline run that may produce a PR review + credit spend.
  // Tuned so total user_events lands near ~34,000 (~9,000 in the last 30 days).
  const activity = weighted<number>([
    [int(0, 1), 36],
    [int(1, 4), 44],
    [int(2, 7), 17],
    [int(5, 12), 3],
  ]);
  for (let a = 0; a < activity; a++) {
    const d = recentDaysAgo(WINDOW_DAYS, 1.3);
    evt(u, "build.run", { repo: u.repo, credits: 2 }, d);
    if (chance(0.2)) {
      evt(
        u,
        chance(0.88) ? "build.passed" : "build.failed",
        { repo: u.repo },
        d,
      );
    }
    if (chance(0.55)) {
      evt(
        u,
        "pr.reviewed",
        {
          repo: u.repo,
          pr_number: int(100, 4000),
          issues: int(0, 6),
          credits: 5,
        },
        d,
      );
    }
    if (chance(0.5)) {
      evt(u, "credits.spent", { credits: pick([2, 5, 20]) }, d);
    }
  }

  // Credit thresholds (journey triggers).
  if (u.creditsPct < 20) {
    evt(u, "credits.low", { credits_pct: u.creditsPct }, recentDaysAgo(30));
    if (chance(0.35)) evt(u, "credits.depleted", {}, recentDaysAgo(20));
  }
  if (u.dormant) evt(u, "repo.dormant", { repo: u.repo }, recentDaysAgo(20));
  if (Number(u.properties.prs_reviewed_total) >= 50 && chance(0.5)) {
    evt(
      u,
      "usage.milestone",
      { milestone: "prs_50" },
      recentDaysAgo(WINDOW_DAYS),
    );
  }

  // Multi-channel identity + engagement.
  if (u.discordLinked) {
    evt(
      u,
      "discord.linked",
      { via: "cold-connect" },
      recentDaysAgo(WINDOW_DAYS),
    );
    const reactions = int(0, 8);
    for (let x = 0; x < reactions; x++) {
      evt(
        u,
        chance(0.5) ? "discord.reaction_added" : "discord.reaction_received",
        { emoji: pick(["🔥", "🚀", "👀", "✅", "💬"]) },
        recentDaysAgo(WINDOW_DAYS, 1.4),
      );
    }
  }
  if (u.telegramLinked) {
    evt(
      u,
      "telegram.linked",
      { via: "cold-connect" },
      recentDaysAgo(WINDOW_DAYS),
    );
  }
}

// Feedback / NPS — value 0–10 skewed to promoters → NPS ≈ +52.
const NPS_COUNT = 780;
for (let i = 0; i < NPS_COUNT; i++) {
  const u = pick(people);
  const value = weighted<number>([
    [int(9, 10), 62], // promoters
    [int(7, 8), 28], // passives
    [int(0, 6), 10], // detractors
  ]);
  evt(u, "feedback.submitted", { value }, recentDaysAgo(WINDOW_DAYS, 1.3));
}

// ---------------------------------------------------------------------------
// 6. Bucket memberships (§4 sizes + left rows for trend/dwell)
// ---------------------------------------------------------------------------
type BM = typeof bucketMemberships.$inferInsert;
const bucketRows: BM[] = [];
for (const b of BUCKETS) {
  for (let k = 0; k < b.active; k++) {
    const u = nextContact();
    const enteredMs = daysAgo(int(0, 45));
    bucketRows.push({
      userId: u.externalId,
      userEmail: u.email,
      bucketId: b.id,
      status: "active",
      enteredAt: at(enteredMs),
      lastEvaluatedAt: at(daysAgo(int(0, 3))),
      entryCount: 1,
      source: "demo",
      context: { plan: u.plan, workspace: u.workspace },
    });
  }
  for (let k = 0; k < b.left; k++) {
    const u = nextContact();
    const enteredMs = daysAgo(int(20, WINDOW_DAYS));
    const leftMs = enteredMs + int(2, 30) * DAY;
    bucketRows.push({
      userId: u.externalId,
      userEmail: u.email,
      bucketId: b.id,
      status: "left",
      enteredAt: at(enteredMs),
      leftAt: at(Math.min(leftMs, NOW - DAY)),
      lastEvaluatedAt: at(Math.min(leftMs, NOW - DAY)),
      entryCount: 1,
      source: "demo",
      context: { plan: u.plan, workspace: u.workspace },
    });
  }
}

// ---------------------------------------------------------------------------
// 7. Tracked links + link clicks (~40 links, ~1,800 clicks)
// ---------------------------------------------------------------------------
type TL = typeof trackedLinks.$inferInsert;
const LINK_CAMPAIGNS: {
  url: string;
  event?: string;
  eventProperties?: Record<string, unknown>;
}[] = [
  {
    url: "https://forgeline.dev/billing/credits",
    event: "credits.buy_clicked",
    eventProperties: { intent: "buy" },
  },
  { url: "https://forgeline.dev/connect" },
  { url: "https://forgeline.dev/reviews" },
  { url: "https://forgeline.dev/dashboard" },
  { url: "https://forgeline.dev/settings/seats" },
  { url: "https://forgeline.dev/refer" },
];
// Each link gets a click count (a few campaign links are popular); the same
// count drives the link_clicks rows so `clickCount` and the click funnel agree.
const linkClickCounts: number[] = Array.from({ length: 40 }, () => int(10, 80));
const trackedLinkRows: TL[] = Array.from({ length: 40 }, (_, i) => {
  const c = LINK_CAMPAIGNS[i % LINK_CAMPAIGNS.length]!;
  return {
    source: "demo-email",
    originalUrl: c.url,
    clickCount: linkClickCounts[i]!,
    event: c.event ?? null,
    eventProperties: c.eventProperties ?? null,
    semanticEmittedAt: c.event ? at(daysAgo(int(0, 30))) : null,
    createdAt: at(daysAgo(int(0, WINDOW_DAYS))),
  } satisfies TL;
});

// ---------------------------------------------------------------------------
// 7b. Campaigns (one-shot broadcasts — sent history + upcoming scheduled)
// ---------------------------------------------------------------------------
// SAFETY (this seeds a LIVE instance): the engine's campaign reaper PROMOTES
// any due `scheduled` row into a real send and re-drives stale
// `queued`/`sending` rows. So this seed writes ONLY terminal statuses
// (sent/failed/canceled/expired) plus `scheduled` rows whose audience is the
// OPT-IN `product-updates` list. No demo contact ever gets
// `categories["product-updates"] = true` (§2 writes `false` or `{}`), and an
// opt-in list resolves recipients ONLY from explicit `true` rows — so if a
// scheduled row comes due before the next reseed it completes harmlessly with
// zero sends. NEVER seed a non-terminal campaign against a BUCKET: bucket
// audiences resolve real (fake-address) demo contacts and would fire a real
// provider blast. Cleanup marker = `idempotency_key LIKE 'demo_%'`.
type CampaignRow = typeof campaigns.$inferInsert;

const inDays = (d: number, h = 0) => new Date(NOW + d * DAY + h * HOUR);

/** Counts for a completed blast: ~2–4% skipped (suppressed), a few failures. */
const blastCounts = (total: number) => {
  const skippedCount = Math.round(total * (0.02 + rand() * 0.02));
  const failedCount = int(0, Math.max(2, Math.round(total * 0.004)));
  return {
    totalRecipients: total,
    sentCount: total - skippedCount - failedCount,
    skippedCount,
    failedCount,
  };
};

/** A terminal `sent` broadcast; scheduled-then-sent when `wasScheduled`. */
function sentCampaign(opts: {
  key: string;
  name: string;
  audienceKind: "list" | "bucket";
  audienceId: string;
  templateKey: string;
  subject: string;
  sentDaysAgo: number;
  total: number;
  wasScheduled?: boolean;
}): CampaignRow {
  const startedMs = daysAgo(opts.sentDaysAgo);
  const completedMs = startedMs + int(3, 25) * MIN;
  return {
    name: opts.name,
    status: "sent",
    audienceKind: opts.audienceKind,
    audienceId: opts.audienceId,
    templateKey: opts.templateKey,
    props: {},
    fromEmail: "hello@forgeline.dev",
    subject: opts.subject,
    idempotencyKey: `demo_${opts.key}`,
    ...blastCounts(opts.total),
    scheduledAt: opts.wasScheduled ? at(startedMs) : null,
    startedAt: at(startedMs + int(0, 2) * MIN),
    completedAt: at(completedMs),
    createdAt: at(
      opts.wasScheduled
        ? startedMs - int(2, 6) * DAY
        : startedMs - int(2, 9) * MIN,
    ),
    updatedAt: at(completedMs),
  };
}

const campaignRows: CampaignRow[] = [
  // Upcoming — audience MUST stay the opt-in list (see SAFETY above).
  {
    name: "July product updates",
    status: "scheduled",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "weekly-digest",
    props: {},
    fromEmail: "hello@forgeline.dev",
    subject: "Forgeline in July: parallel reviews, faster queues",
    idempotencyKey: "demo_c_updates_jul",
    scheduledAt: inDays(4, 9),
    createdAt: at(daysAgo(2)),
    updatedAt: at(daysAgo(2)),
  },
  {
    name: "Summer credits promo — 500 free credits",
    status: "scheduled",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "winback-offer",
    props: {},
    fromEmail: "hello@forgeline.dev",
    subject: "500 free build credits for the summer lull",
    idempotencyKey: "demo_c_summer_promo",
    scheduledAt: inDays(9, 6),
    createdAt: at(daysAgo(1)),
    updatedAt: at(daysAgo(1)),
  },
  {
    name: "August product updates",
    status: "scheduled",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "weekly-digest",
    props: {},
    fromEmail: "hello@forgeline.dev",
    subject: "Forgeline in August",
    idempotencyKey: "demo_c_updates_aug",
    scheduledAt: inDays(32, 2),
    createdAt: at(daysAgo(0, 6)),
    updatedAt: at(daysAgo(0, 6)),
  },
  // Sent history — newsletters to the list (growing audience) + bucket blasts.
  sentCampaign({
    key: "c_launch_v2",
    name: "Forgeline 2.0 launch announcement",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "weekly-digest",
    subject: "Forgeline 2.0: parallel AI reviews are here",
    sentDaysAgo: 12,
    total: 2214,
    wasScheduled: true,
  }),
  sentCampaign({
    key: "c_updates_jun",
    name: "June product updates",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "weekly-digest",
    subject: "Forgeline in June: review queues + Slack digests",
    sentDaysAgo: 26,
    total: 2168,
    wasScheduled: true,
  }),
  sentCampaign({
    key: "c_updates_may",
    name: "May product updates",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "weekly-digest",
    subject: "Forgeline in May: monorepo support lands",
    sentDaysAgo: 57,
    total: 2041,
    wasScheduled: true,
  }),
  sentCampaign({
    key: "c_updates_apr",
    name: "April product updates",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "weekly-digest",
    subject: "Forgeline in April: credit packs + usage alerts",
    sentDaysAgo: 88,
    total: 1876,
    wasScheduled: true,
  }),
  sentCampaign({
    key: "c_winback_quiet",
    name: "Win-back: quiet repos, 500 free credits",
    audienceKind: "bucket",
    audienceId: "dormant-repos",
    templateKey: "winback-offer",
    subject: "500 free credits to pick back up",
    sentDaysAgo: 8,
    total: 236,
  }),
  sentCampaign({
    key: "c_topup_low",
    name: "Top-up nudge: low-credit workspaces",
    audienceKind: "bucket",
    audienceId: "low-credits",
    templateKey: "credits-topup-nudge",
    subject: "You're through 80% of this month's build credits",
    sentDaysAgo: 3,
    total: 412,
  }),
  sentCampaign({
    key: "c_seats_power",
    name: "Seat expansion push: power teams",
    audienceKind: "bucket",
    audienceId: "power-teams",
    templateKey: "expansion-add-seats",
    subject: "Your team is reviewing a lot of PRs",
    sentDaysAgo: 18,
    total: 174,
  }),
  // Operator canceled a blast the day before it was due (terminal — safe).
  {
    name: "Trial-ending discount blast",
    status: "canceled",
    audienceKind: "bucket",
    audienceId: "trial-ending",
    templateKey: "winback-offer",
    props: {},
    fromEmail: "hello@forgeline.dev",
    subject: "Your trial ends soon — 20% off the first quarter",
    idempotencyKey: "demo_c_trial_discount",
    scheduledAt: inDays(1, 3),
    canceledAt: at(daysAgo(1)),
    createdAt: at(daysAgo(3)),
    updatedAt: at(daysAgo(1)),
  },
  // A blast that errored mid-run and hit the reaper's give-up window.
  {
    name: "Spring re-engagement re-send",
    status: "failed",
    audienceKind: "bucket",
    audienceId: "dormant-repos",
    templateKey: "winback-repo-quiet",
    props: {},
    fromEmail: "hello@forgeline.dev",
    subject: "Your repo's gone quiet",
    idempotencyKey: "demo_c_spring_resend",
    totalRecipients: 397,
    sentCount: 121,
    skippedCount: 9,
    failedCount: 4,
    startedAt: at(daysAgo(34)),
    completedAt: at(daysAgo(34) + 6 * HOUR),
    createdAt: at(daysAgo(34) - 10 * MIN),
    updatedAt: at(daysAgo(34) + 6 * HOUR),
  },
  // A code-defined campaign whose sendAt was already stale at first reconcile.
  {
    name: "Launch week teaser",
    status: "expired",
    audienceKind: "list",
    audienceId: "product-updates",
    templateKey: "weekly-digest",
    props: {},
    fromEmail: "hello@forgeline.dev",
    subject: "Something big lands next week",
    idempotencyKey: "demo_c_launch_teaser",
    scheduledAt: at(daysAgo(41)),
    createdAt: at(daysAgo(44)),
    updatedAt: at(daysAgo(41)),
  },
];

// ---------------------------------------------------------------------------
// 7c. Managed links (Studio "Links" view — ~15 links, ~4,500 clicks)
// ---------------------------------------------------------------------------
// A managed link is a `links` row plus ONE `tracked_links` row pointing back
// via `link_id` (the Studio view sums `click_count` on read; the detail view
// lists recent `link_clicks`). Every demo link is minted by a fictional
// @forgeline.dev operator — `created_by` is the cleanup marker (visitor-minted
// links carry the real Studio session email, so reseeds never touch them).
type ManagedLinkCfg = {
  label: string;
  url: string;
  campaign: string | null;
  source: "studio" | "discord" | "referral";
  type: "public" | "personal";
  clicks: number;
  createdDaysAgo: number;
  archived?: boolean;
};

const MANAGED_LINKS: ManagedLinkCfg[] = [
  // Launch week — the 2.0 announcement fan-out.
  {
    label: "Launch post — blog",
    url: "https://forgeline.dev/blog/forgeline-2-0",
    campaign: "launch-week",
    source: "studio",
    type: "public",
    clicks: 914,
    createdDaysAgo: 13,
  },
  {
    label: "Launch — Hacker News thread",
    url: "https://news.ycombinator.com/item?id=44712083",
    campaign: "launch-week",
    source: "studio",
    type: "public",
    clicks: 638,
    createdDaysAgo: 12,
  },
  {
    label: "Launch — X announcement",
    url: "https://x.com/forgelinedev/status/1943281907542118400",
    campaign: "launch-week",
    source: "studio",
    type: "public",
    clicks: 402,
    createdDaysAgo: 12,
  },
  {
    label: "Launch — changelog entry",
    url: "https://forgeline.dev/changelog/2-0",
    campaign: "launch-week",
    source: "studio",
    type: "public",
    clicks: 187,
    createdDaysAgo: 12,
  },
  // Evergreen site/docs.
  {
    label: "Docs quickstart",
    url: "https://forgeline.dev/docs/quickstart",
    campaign: "docs",
    source: "studio",
    type: "public",
    clicks: 358,
    createdDaysAgo: 96,
  },
  {
    label: "Pricing",
    url: "https://forgeline.dev/pricing",
    campaign: "site",
    source: "studio",
    type: "public",
    clicks: 264,
    createdDaysAgo: 120,
  },
  {
    label: "Case study — Corewave",
    url: "https://forgeline.dev/customers/corewave",
    campaign: "content",
    source: "studio",
    type: "public",
    clicks: 143,
    createdDaysAgo: 61,
  },
  // Community.
  {
    label: "Discord invite",
    url: "https://discord.gg/forgeline",
    campaign: "community",
    source: "discord",
    type: "public",
    clicks: 517,
    createdDaysAgo: 140,
  },
  {
    label: "Office hours signup",
    url: "https://forgeline.dev/office-hours",
    campaign: "community",
    source: "discord",
    type: "public",
    clicks: 122,
    createdDaysAgo: 33,
  },
  // Lifecycle.
  {
    label: "Referral program",
    url: "https://forgeline.dev/refer",
    campaign: "referrals",
    source: "referral",
    type: "public",
    clicks: 341,
    createdDaysAgo: 88,
  },
  {
    label: "June newsletter CTA",
    url: "https://forgeline.dev/blog/june-roundup",
    campaign: "newsletter-jun",
    source: "studio",
    type: "public",
    clicks: 289,
    createdDaysAgo: 26,
  },
  {
    label: "Credits top-up promo",
    url: "https://forgeline.dev/billing/credits?promo=topup20",
    campaign: "dunning",
    source: "studio",
    type: "public",
    clicks: 176,
    createdDaysAgo: 47,
  },
  // Personal (identity-bearing 1:1 links).
  {
    label: "Renewal follow-up — Northstar",
    url: "https://forgeline.dev/billing/renew",
    campaign: null,
    source: "studio",
    type: "personal",
    clicks: 6,
    createdDaysAgo: 9,
  },
  {
    label: "Onboarding call recap — Kettle",
    url: "https://forgeline.dev/docs/quickstart#connect-a-repo",
    campaign: null,
    source: "studio",
    type: "personal",
    clicks: 3,
    createdDaysAgo: 5,
  },
  // Retired.
  {
    label: "Spring promo (retired)",
    url: "https://forgeline.dev/spring",
    campaign: "spring-promo",
    source: "studio",
    type: "public",
    clicks: 208,
    createdDaysAgo: 105,
    archived: true,
  },
];

const managedLinkRows: (typeof links.$inferInsert)[] = [];
const managedTrackedRows: (typeof trackedLinks.$inferInsert)[] = [];
const managedClickPlan: {
  trackedLinkId: string;
  clicks: number;
  createdMs: number;
}[] = [];

for (const m of MANAGED_LINKS) {
  const linkId = randomUUID();
  const trackedLinkId = randomUUID();
  const createdMs = daysAgo(m.createdDaysAgo);
  const distinctId = m.type === "personal" ? pick(people).externalId : null;
  managedLinkRows.push({
    id: linkId,
    originalUrl: m.url,
    type: m.type,
    label: m.label,
    campaign: m.campaign,
    source: m.source,
    distinctId,
    createdBy: pick(["demo@forgeline.dev", "ops@forgeline.dev"]),
    archivedAt: m.archived ? at(daysAgo(int(2, 14))) : null,
    createdAt: at(createdMs),
    updatedAt: at(createdMs),
  });
  // Mirrors mintLink: one tracked row per managed link, source copied verbatim.
  managedTrackedRows.push({
    id: trackedLinkId,
    linkId,
    emailSendId: null,
    distinctId,
    source: m.source,
    originalUrl: m.url,
    clickCount: m.clicks,
    createdAt: at(createdMs),
    updatedAt: at(createdMs),
  });
  managedClickPlan.push({ trackedLinkId, clicks: m.clicks, createdMs });
}

// ---------------------------------------------------------------------------
// 8. Feed items (in-app bell history, ~7,800)
// ---------------------------------------------------------------------------
type FI = typeof feedItems.$inferInsert;
const FEED_TYPES: {
  type: string;
  title: string;
  body: string;
  survey?: boolean;
  button?: boolean;
}[] = [
  {
    type: "welcome",
    title: "Welcome to Forgeline",
    body: "Connect a repo and your first AI review runs on the next PR.",
    button: true,
  },
  {
    type: "first-review",
    title: "Your first review is in ✅",
    body: "Forgeline read the whole diff and posted its notes.",
    button: true,
  },
  {
    type: "credits-low",
    title: "80% of this month's credits used",
    body: "Pipelines keep running until the balance hits zero.",
    button: true,
  },
  {
    type: "pipelines-paused",
    title: "Pipelines paused — out of credits",
    body: "New PRs won't get an AI review until you top up.",
    button: true,
  },
  {
    type: "milestone",
    title: "50 PRs reviewed this month 🎉",
    body: "Your team is reviewing at real volume. Nice pace.",
  },
  {
    type: "winback",
    title: "Your repo's gone quiet",
    body: "No pipeline run in two weeks. Open a PR to pick back up.",
  },
  {
    type: "nps",
    title: "Quick question 👇",
    body: "How likely are you to recommend Forgeline?",
    survey: true,
  },
];
const feedRows: FI[] = [];
const suppressedInApp = new Set(
  prefRows.filter((p) => p.unsubscribedAll).map((p) => p.userId),
);
for (let i = 0; i < 7800; i++) {
  const u = pick(people);
  if (suppressedInApp.has(u.externalId)) continue;
  const f = pick(FEED_TYPES);
  const createdMs = daysAgo(int(0, WINDOW_DAYS));
  // Status recent-weighted so a fresh reseed shows a few unseen items.
  const ageDays = (NOW - createdMs) / DAY;
  const status: FI["status"] =
    ageDays < 2
      ? weighted<FI["status"]>([
          ["unseen", 6],
          ["seen", 3],
          ["read", 1],
        ])
      : weighted<FI["status"]>([
          ["read", 5],
          ["archived", 3],
          ["seen", 2],
        ]);
  const blocks: FeedBlock[] | null = f.survey
    ? [
        {
          type: "survey",
          event: "feedback.submitted",
          mode: "nps",
          property: "value",
          prompt: f.body,
        },
      ]
    : f.button
      ? [
          {
            type: "button",
            label: "Open",
            url: "https://forgeline.dev/dashboard",
          },
        ]
      : null;
  feedRows.push({
    recipientKey: u.externalId,
    type: f.type,
    title: f.title,
    body: f.body,
    blocks,
    actionUrl: f.survey ? null : "https://forgeline.dev/dashboard",
    category: "in_app",
    status,
    journeyStateId: null, // linked below for ~85% at insert time
    seenAt: status === "unseen" ? null : at(createdMs + int(1, 40) * HOUR),
    readAt:
      status === "read" || status === "archived"
        ? at(createdMs + int(2, 60) * HOUR)
        : null,
    archivedAt:
      status === "archived" ? at(createdMs + int(3, 90) * HOUR) : null,
    createdAt: at(createdMs),
  });
}

// ---------------------------------------------------------------------------
// 9. Connector deliveries (Discord ~70% / Telegram ~30%, ~5,400)
// ---------------------------------------------------------------------------
type CD = typeof connectorDeliveries.$inferInsert;
const DISCORD_ACTIONS = [
  "dmMember",
  "sendChannelMessage",
  "grantRole",
] as const;
const TELEGRAM_ACTIONS = ["sendMessage", "dm"] as const;
const connectorRows: CD[] = Array.from({ length: 5400 }, (_, i) => {
  const isDiscord = rand() < 0.7;
  const connectorId = isDiscord ? "discord" : "telegram";
  const action = isDiscord ? pick(DISCORD_ACTIONS) : pick(TELEGRAM_ACTIONS);
  const createdMs = daysAgo(int(0, WINDOW_DAYS));
  const failed = chance(0.03);
  return {
    connectorId,
    action,
    dedupeKey: `demo_cd_${connectorId}_${i}`,
    status: failed ? "failed" : "sent",
    lastError: failed
      ? pick(["member has DMs closed", "chat not found", "missing permissions"])
      : null,
    result: failed
      ? null
      : {
          messageId: `${isDiscord ? "" : "tg_"}${Math.floor(rand() * 1e17).toString()}`,
        },
    sentAt: failed ? null : at(createdMs + int(1, 20) * MIN),
    createdAt: at(createdMs),
  } satisfies CD;
});

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------
async function chunkInsert<T>(
  rows: T[],
  insert: (batch: T[]) => Promise<unknown>,
  size = 500,
) {
  for (let i = 0; i < rows.length; i += size) {
    await insert(rows.slice(i, i + size));
  }
}

async function main() {
  console.log(
    `Forgeline demo seed — window ${WINDOW_DAYS}d — ${people.length} contacts, ${journeyStateRows.length} journey states.`,
  );

  // 1) Clean prior demo rows (FK-safe order). Deleting the demo tracked_links
  //    cascades to their link_clicks (FK onDelete cascade). Demo tracked links
  //    are tagged with source "demo-email" so cleanup never touches real links.
  await db.delete(emailSends).where(like(emailSends.userId, "demo_%"));
  await db.delete(feedItems).where(like(feedItems.recipientKey, "demo_%"));
  await db.delete(journeyStates).where(like(journeyStates.userId, "demo_%"));
  await db
    .delete(bucketMemberships)
    .where(like(bucketMemberships.userId, "demo_%"));
  await db
    .delete(emailPreferences)
    .where(like(emailPreferences.userId, "demo_%"));
  await db.delete(userEvents).where(like(userEvents.userId, "demo_%"));
  await db
    .delete(connectorDeliveries)
    .where(like(connectorDeliveries.dedupeKey, "demo_cd_%"));
  await db.delete(trackedLinks).where(like(trackedLinks.source, "demo-email"));
  // Managed demo links: the tracked rows must go FIRST (the links FK is ON
  // DELETE set null — deleting `links` first would orphan them past cleanup),
  // and deleting a tracked row cascades its link_clicks. Marker = the
  // fictional @forgeline.dev minter (visitor-minted links carry the real
  // Studio session email and are never touched).
  await db
    .delete(trackedLinks)
    .where(
      inArray(
        trackedLinks.linkId,
        db
          .select({ id: links.id })
          .from(links)
          .where(like(links.createdBy, "%@forgeline.dev")),
      ),
    );
  await db.delete(links).where(like(links.createdBy, "%@forgeline.dev"));
  await db.delete(campaigns).where(like(campaigns.idempotencyKey, "demo_%"));
  await db.delete(contacts).where(like(contacts.externalId, "demo_%"));

  // 2) Contacts
  await chunkInsert(people, (batch) =>
    db.insert(contacts).values(
      batch.map((u) => ({
        externalId: u.externalId,
        email: u.email,
        timezone: u.timezone,
        properties: u.properties,
        firstSeenAt: at(u.firstSeenMs),
        lastSeenAt: at(u.lastSeenMs),
      })),
    ),
  );

  // 3) Email preferences
  await chunkInsert(prefRows, (batch) =>
    db.insert(emailPreferences).values(batch),
  );

  // 4) Journey states (capture ids in order)
  const insertedStateIds: string[] = [];
  for (let i = 0; i < journeyStateRows.length; i += 500) {
    const batch = journeyStateRows.slice(i, i + 500);
    const ret = await db
      .insert(journeyStates)
      .values(batch)
      .returning({ id: journeyStates.id });
    insertedStateIds.push(...ret.map((r) => r.id));
  }

  // 5) Email sends (journey-tied + standalone → TOTAL_SENDS)
  const sendRows = buildSendRows(insertedStateIds);
  await chunkInsert(sendRows, (batch) => db.insert(emailSends).values(batch));

  // 6) User events
  await chunkInsert(
    eventRows,
    (batch) => db.insert(userEvents).values(batch),
    1000,
  );

  // 7) Bucket memberships
  await chunkInsert(bucketRows, (batch) =>
    db.insert(bucketMemberships).values(batch),
  );

  // 8) Tracked links + link clicks
  const insertedLinkIds: string[] = [];
  for (let i = 0; i < trackedLinkRows.length; i += 500) {
    const batch = trackedLinkRows.slice(i, i + 500);
    const ret = await db
      .insert(trackedLinks)
      .values(batch)
      .returning({ id: trackedLinks.id });
    insertedLinkIds.push(...ret.map((r) => r.id));
  }
  // 8b) Managed links (Studio "Links" view): links + 1:1 tracked rows.
  await chunkInsert(managedLinkRows, (batch) => db.insert(links).values(batch));
  await chunkInsert(managedTrackedRows, (batch) =>
    db.insert(trackedLinks).values(batch),
  );

  // 8c) Clicks for both email-rewrite and managed links.
  const UAS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/605",
  ] as const;
  const randomIp = () =>
    `${int(11, 210)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`;
  const clickRows: (typeof linkClicks.$inferInsert)[] = [];
  insertedLinkIds.forEach((linkId, k) => {
    const n = linkClickCounts[k] ?? 0;
    for (let i = 0; i < n; i++) {
      clickRows.push({
        trackedLinkId: linkId,
        ipAddress: randomIp(),
        userAgent: pick(UAS),
        clickedAt: at(NOW - recentDaysAgo(WINDOW_DAYS, 1.4) * DAY),
      });
    }
  });
  // Managed links: clicks land between the link's mint time and now,
  // recent-weighted so fresh links look alive in the detail view.
  for (const plan of managedClickPlan) {
    for (let i = 0; i < plan.clicks; i++) {
      clickRows.push({
        trackedLinkId: plan.trackedLinkId,
        ipAddress: randomIp(),
        userAgent: pick(UAS),
        clickedAt: at(
          plan.createdMs + (1 - rand() ** 1.4) * (NOW - plan.createdMs),
        ),
      });
    }
  }
  await chunkInsert(
    clickRows,
    (batch) => db.insert(linkClicks).values(batch),
    1000,
  );

  // 8d) Campaigns (broadcast history + upcoming scheduled sends).
  await chunkInsert(campaignRows, (batch) =>
    db.insert(campaigns).values(batch),
  );

  // 9) Feed items — link ~85% to a journey state.
  feedRows.forEach((row) => {
    if (chance(0.85) && insertedStateIds.length > 0) {
      row.journeyStateId =
        insertedStateIds[int(0, insertedStateIds.length - 1)]!;
    }
  });
  await chunkInsert(
    feedRows,
    (batch) => db.insert(feedItems).values(batch),
    500,
  );

  // 10) Connector deliveries
  await chunkInsert(
    connectorRows,
    (batch) => db.insert(connectorDeliveries).values(batch),
    1000,
  );

  console.log(
    `Inserted: ${people.length} contacts · ${insertedStateIds.length} journey states · ${sendRows.length} email sends · ${eventRows.length} events · ${bucketRows.length} bucket memberships · ${insertedLinkIds.length} email links + ${managedLinkRows.length} managed links / ${clickRows.length} clicks · ${campaignRows.length} campaigns · ${feedRows.length} feed items · ${connectorRows.length} connector deliveries.`,
  );
  console.log("Forgeline demo seed complete.");
}

await main();
await client.end();
process.exit(0);
