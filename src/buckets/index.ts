import { dormantRepos } from "./dormant-repos.js";
import { lowCredits } from "./low-credits.js";
import { powerTeams } from "./power-teams.js";
import { trialEnding } from "./trial-ending.js";

/**
 * All defined buckets for Forgeline. Passed to `createHogsendClient({ buckets })`
 * and `createWorker({ buckets })`.
 *
 * No `DefinedBucket[]` annotation: that base type re-widens each bucket's `id`
 * literal back to `string` and erases the typed `bucket.entered` / `bucket.left`
 * refs. Letting the array infer keeps every member's literal id (e.g.
 * `powerTeams.entered` stays `"bucket:entered:power-teams"`), so journeys can
 * bind to a bucket transition with full typo-safety.
 */
export const buckets = [powerTeams, lowCredits, trialEnding, dormantRepos];

// Re-export individual buckets for direct reference (journey triggers, tests).
export { dormantRepos, lowCredits, powerTeams, trialEnding };
