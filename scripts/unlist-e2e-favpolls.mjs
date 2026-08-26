/**
 * scripts/unlist-e2e-favpolls.mjs
 *
 * Sweeps E2E débris out of a Supabase project's public listings.
 *
 * WHY THIS EXISTS: until 2026-08-26 the CI E2E job ran against PRODUCTION on
 * every push to main (`github.head_ref` is empty on a push, so the base URL
 * fell through to the E2E_BASE_URL secret), while `e2e/global-teardown.ts`
 * swept STAGING — the database the tests had never touched. Roughly 45 "E2E
 * Cause Test" favpolls accumulated on the public /favpolls shelf. The job is
 * pull-request-only now; this clears what was already left behind.
 *
 * UNLIST, NOT DELETE — the same doctrine as the teardown. `is_listed = false`
 * takes them off the shelf and the carousel, keeps the rows, and is trivially
 * reversible. Pledge allocations and any money rows stay pointed at something
 * that still exists.
 *
 * Reads credentials from the env file you name; prints only the project ref.
 *
 *   node scripts/unlist-e2e-favpolls.mjs .env.production-web            # dry run
 *   node scripts/unlist-e2e-favpolls.mjs .env.production-web --apply    # writes
 *
 * Run from the repo root. Requires @supabase/supabase-js (present in apps/web),
 * so if resolution fails, run it from apps/web with a ../../ path.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [envPath] = process.argv.slice(2);
const APPLY = process.argv.includes("--apply");

if (!envPath) {
  console.error(
    "Usage: node scripts/unlist-e2e-favpolls.mjs <envfile> [--apply]",
  );
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i).trim(),
        l
          .slice(i + 1)
          .trim()
          .replace(/^["']|["']$/g, ""),
      ];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    `Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in ${envPath}`,
  );
  process.exit(1);
}

console.log("Project ref:", url.replace(/^https:\/\//, "").split(".")[0]);
console.log("Mode:", APPLY ? "APPLY (writes)" : "DRY RUN (no writes)");

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Cause favpolls — the E2E name lives on cause_label
const { data: causes, error: e1 } = await db
  .from("favpolls")
  .select("id,cause_label,is_listed,created_at")
  .like("cause_label", "E2E%");
if (e1) {
  console.error(e1);
  process.exit(1);
}

// Protagonist favpolls — the E2E name lives on the protagonist
const { data: prots } = await db
  .from("protagonists")
  .select("id,name")
  .like("name", "E2E%");
const protIds = (prots ?? []).map((p) => p.id);
let protFavpolls = [];
if (protIds.length) {
  const { data } = await db
    .from("favpolls")
    .select("id,is_listed,created_at")
    .in("protagonist_id", protIds);
  protFavpolls = data ?? [];
}

const all = [...(causes ?? []), ...protFavpolls];
const listed = all.filter((f) => f.is_listed);
const dates = all
  .map((f) => f.created_at)
  .filter(Boolean)
  .sort();

console.log(`\nE2E favpolls found: ${all.length}  (listed: ${listed.length})`);
console.log(`  cause_label E2E%: ${causes?.length ?? 0}`);
console.log(
  `  protagonist E2E%: ${protFavpolls.length} (from ${protIds.length} protagonists)`,
);
if (dates.length) {
  console.log(
    `  created between ${dates[0]?.slice(0, 10)} and ${dates.at(-1)?.slice(0, 10)}`,
  );
}

if (!APPLY) {
  console.log("\nDry run — nothing written. Re-run with --apply to unlist.");
  process.exit(0);
}
if (!listed.length) {
  console.log("\nNothing listed. No writes needed.");
  process.exit(0);
}

const { data: done, error: e2 } = await db
  .from("favpolls")
  .update({ is_listed: false })
  .in(
    "id",
    listed.map((f) => f.id),
  )
  .select("id");
if (e2) {
  console.error(e2);
  process.exit(1);
}
console.log(
  `\n✓ Unlisted ${done?.length ?? 0} favpolls (rows kept, reversible).`,
);
