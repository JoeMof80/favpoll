/**
 * scripts/audit-e2e-data.mjs
 *
 * READ ONLY. Reports what the E2E favpolls in a Supabase project actually
 * contain — favpolls, their polls, their pledges, and how much E2E money is
 * being counted into each charity's public total.
 *
 * Companion to unlist-e2e-favpolls.mjs. Unlisting takes the favpolls off
 * /favpolls and the homepage carousel (both filter is_listed), but the
 * charities index total does NOT filter — all_charity_stats() sums every
 * pledge for a charity regardless of is_listed, is_private or closed_at.
 * This script quantifies that.
 *
 *   node scripts/audit-e2e-data.mjs .env.production-web
 *
 * Writes nothing. Prints no credentials.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [envPath] = process.argv.slice(2);
if (!envPath) {
  console.error("Usage: node scripts/audit-e2e-data.mjs <envfile>");
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
  console.error(`Missing Supabase vars in ${envPath}`);
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});
console.log("Project ref:", url.replace(/^https:\/\//, "").split(".")[0]);
console.log("READ ONLY — nothing is written.\n");

const money = (n) => `£${(Number(n) || 0).toFixed(2)}`;

// ── 1. The E2E favpolls ────────────────────────────────────────────────────
const { data: byCause } = await db
  .from("favpolls")
  .select(
    "id,cause_label,is_listed,is_private,closed_at,total_raised,created_at",
  )
  .like("cause_label", "E2E%");

const { data: prots } = await db
  .from("protagonists")
  .select("id,name")
  .like("name", "E2E%");
const protIds = (prots ?? []).map((p) => p.id);

let byProt = [];
if (protIds.length) {
  const { data } = await db
    .from("favpolls")
    .select(
      "id,cause_label,is_listed,is_private,closed_at,total_raised,created_at",
    )
    .in("protagonist_id", protIds);
  byProt = data ?? [];
}

const favpolls = [...(byCause ?? []), ...byProt];
const ids = favpolls.map((f) => f.id);

console.log("── FAVPOLLS ──────────────────────────────────────────────");
console.log(`total:      ${favpolls.length}`);
console.log(`  listed:   ${favpolls.filter((f) => f.is_listed).length}`);
console.log(`  private:  ${favpolls.filter((f) => f.is_private).length}`);
console.log(`  open:     ${favpolls.filter((f) => !f.closed_at).length}`);
console.log(`  closed:   ${favpolls.filter((f) => f.closed_at).length}`);
const settled = favpolls.reduce((a, f) => a + (Number(f.total_raised) || 0), 0);
console.log(`  settlement total_raised (sum): ${money(settled)}`);

// ── 2. Their polls and pledges ─────────────────────────────────────────────
const { data: polls } = await db
  .from("favpoll_polls")
  .select("id,favpoll_id")
  .in("favpoll_id", ids);
const pollIds = (polls ?? []).map((p) => p.id);

let pledges = [];
if (pollIds.length) {
  const { data } = await db
    .from("pledges")
    .select("id,favpoll_poll_id,total_amount,withdrawn_at,created_at")
    .in("favpoll_poll_id", pollIds);
  pledges = data ?? [];
}
const live = pledges.filter((p) => !p.withdrawn_at);
const pledgeTotal = live.reduce((a, p) => a + (Number(p.total_amount) || 0), 0);

console.log("\n── PLEDGES ───────────────────────────────────────────────");
console.log(`polls:      ${polls?.length ?? 0}`);
console.log(
  `pledges:    ${pledges.length}  (withdrawn: ${pledges.length - live.length})`,
);
console.log(`live value: ${money(pledgeTotal)}`);
console.log(
  "  (test-mode Stripe — no real money moved, but these are real rows)",
);

// ── 3. Charity contamination ───────────────────────────────────────────────
// Mirrors all_charity_stats(): raised per favpoll, split equally across its
// charities. That RPC does NOT filter is_listed/is_private/closed_at, so
// every pound below is currently inside a public charity total.
const raisedByFavpoll = new Map();
for (const p of live) {
  const poll = (polls ?? []).find((q) => q.id === p.favpoll_poll_id);
  if (!poll) continue;
  raisedByFavpoll.set(
    poll.favpoll_id,
    (raisedByFavpoll.get(poll.favpoll_id) ?? 0) + (Number(p.total_amount) || 0),
  );
}

const { data: fcs } = await db
  .from("favpoll_charities")
  .select("favpoll_id,charity_id")
  .in("favpoll_id", ids);

const countByFavpoll = new Map();
for (const fc of fcs ?? []) {
  countByFavpoll.set(
    fc.favpoll_id,
    (countByFavpoll.get(fc.favpoll_id) ?? 0) + 1,
  );
}

const perCharity = new Map();
for (const fc of fcs ?? []) {
  const raised = raisedByFavpoll.get(fc.favpoll_id) ?? 0;
  const n = countByFavpoll.get(fc.favpoll_id) || 1;
  perCharity.set(
    fc.charity_id,
    (perCharity.get(fc.charity_id) ?? 0) + raised / n,
  );
}

console.log("\n── CHARITY TOTALS POLLUTED ───────────────────────────────");
if (!perCharity.size) {
  console.log("none — no E2E favpoll is attached to a charity");
} else {
  const charityIds = [...perCharity.keys()];
  const { data: charities } = await db
    .from("charities")
    .select("id,name")
    .in("id", charityIds);
  const nameOf = new Map((charities ?? []).map((c) => [c.id, c.name]));
  const rows = [...perCharity.entries()].sort((a, b) => b[1] - a[1]);
  for (const [cid, amount] of rows) {
    console.log(`  ${money(amount).padStart(10)}  ${nameOf.get(cid) ?? cid}`);
  }
  console.log(
    `\n  ${money([...perCharity.values()].reduce((a, b) => a + b, 0))} of E2E money is inside public charity totals.`,
  );
  console.log(
    "  Unlisting does NOT remove this — all_charity_stats() ignores is_listed.",
  );
}
