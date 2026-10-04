/**
 * scripts/backfill-perfect-topic.ts
 * ---------------------------------------------------------------------------
 * Suggests a PERFECT TOPIC and writes it to the PROFILE
 * (charity_profiles.perfect_topic_suggested_id + perfect_subset_suggested_id
 * + perfect_topic_reason). Step 2 of
 * references/charity-profiles-2026-09-27.md: "backfills become profile
 * preparation — write to charity_profiles for any registered number, not
 * only account rows".
 *
 * It never touches a CONFIRMED topic: charities.perfect_topic_id is an
 * admin's or the charity's decision, and it stays on the account.
 *
 * The charity's words come from the MIRROR (register_charities), not from
 * the copies on `charities` — those are dropped in step 5.
 *
 * Two audiences, one pipeline:
 *
 *   (default) ACCOUNT charities — the ones on favpolls, whose suggestions
 *   the admin consent queue shows.
 *
 *   --wave    OUTREACH CANDIDATES — charity_outreach_candidates(): a
 *   register charity with a website, a classification the rule floor maps,
 *   income above the floor, and no account. That filter is decision 4's
 *   real cost lever: 172k charities become ~12.9k before a single call.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-perfect-topic.ts
 *     --wave[=<label>]   candidates instead of accounts; the label is
 *                        written to the spend ledger as the wave
 *     --income=<pounds>  the wave's income floor (default 100000)
 *     --limit=<n>        stop after n charities (default 50 for a wave)
 *     --all              re-suggest where a suggestion already exists
 *
 * The spend cap (lib/model-spend.ts) is enforced inside the model call,
 * and this loop stops as soon as it bites — the same cap an admin's click
 * pays into.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import type { CauseFamily } from "../packages/types";
import {
  PERFECT_TOPIC_MODEL,
  catalogueForSuggestion,
  suggestPerfectTopic,
} from "../apps/web/lib/perfect-topic";
import { proposeSubsetFromSuggestion } from "../apps/web/lib/subset-from-suggestion";
import {
  forgetSpendCache,
  spendAvailable,
  spendSummary,
} from "../apps/web/lib/model-spend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const args = process.argv.slice(2);
const flag = (n: string) => args.some((a) => a === `--${n}`);
const opt = (n: string) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;

const ALL = flag("all");
const WAVE = flag("wave") || opt("wave") !== null;
const WAVE_LABEL = opt("wave");
const INCOME_FLOOR = Number(opt("income") ?? 100000);
const LIMIT = Number(opt("limit") ?? (WAVE ? 50 : 0)) || 0;

type Target = {
  registeredNumber: string;
  /** The confirmed cause family, where an account holds one. */
  causeFamily: CauseFamily | null;
  hasSuggestion: boolean;
};

/** The outreach wave's candidates, in income order. */
async function waveTargets(): Promise<Target[]> {
  // A cushion over the limit, because the rows still needing work are
  // filtered here and not in SQL: the function answers "who is eligible",
  // not "who is unfinished". Unlimited is 12,893 rows and more than the
  // API will serialise inside its statement timeout.
  const { data, error } = await supabase.rpc("charity_outreach_candidates", {
    p_income_floor: INCOME_FLOOR,
    p_limit: LIMIT > 0 ? LIMIT * 5 : 500,
  });
  if (error) throw new Error(`candidates: ${error.message}`);
  return (
    (data ?? []) as {
      registered_number: string;
      has_topic_suggestion: boolean;
    }[]
  ).map((r) => ({
    registeredNumber: r.registered_number,
    causeFamily: null,
    hasSuggestion: r.has_topic_suggestion,
  }));
}

/** Account charities: the consent queue's own list. A confirmed topic is
 *  skipped entirely — there is nothing left to suggest. */
async function accountTargets(): Promise<Target[]> {
  const { data, error } = await supabase
    .from("charities")
    .select("registered_number, cause_family, perfect_topic_id")
    .eq("is_active", true)
    .not("registered_number", "is", null)
    .is("perfect_topic_id", null)
    .order("name");
  if (error) throw new Error(error.message);
  const numbers = (data ?? [])
    .map((c) => ({
      number: String(c.registered_number).trim().toUpperCase(),
      causeFamily: (c.cause_family as CauseFamily | null) ?? null,
    }))
    .filter((c) =>
      /^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$/.test(c.number),
    );
  if (numbers.length === 0) return [];
  const { data: profiles } = await supabase
    .from("charity_profiles")
    .select(
      "registered_number, perfect_topic_suggested_id, perfect_topic_reason",
    )
    .in(
      "registered_number",
      numbers.map((n) => n.number),
    );
  const suggested = new Map(
    (profiles ?? []).map((p) => [
      p.registered_number as string,
      p.perfect_topic_suggested_id != null || p.perfect_topic_reason != null,
    ]),
  );
  return numbers.map((n) => ({
    registeredNumber: n.number,
    causeFamily: n.causeFamily,
    hasSuggestion: suggested.get(n.number) ?? false,
  }));
}

type MirrorRow = {
  registered_number: number;
  name: string;
  activities: string | null;
  objects: string | null;
  classification: { what: string[]; who: string[]; how: string[] } | null;
  areas: { type: string; description: string }[] | null;
};

/** The charity's own words, from the mirror, in one round trip per chunk. */
async function mirrorRows(numbers: string[]): Promise<Map<string, MirrorRow>> {
  const digits = numbers
    .filter((n) => /^[0-9]+$/.test(n))
    .map((n) => Number(n));
  const byNumber = new Map<string, MirrorRow>();
  for (let i = 0; i < digits.length; i += 500) {
    const { data, error } = await supabase
      .from("register_charities")
      .select(
        "registered_number, name, activities, objects, classification, areas",
      )
      .in("registered_number", digits.slice(i, i + 500));
    if (error) throw new Error(`mirror: ${error.message}`);
    for (const row of (data ?? []) as MirrorRow[]) {
      byNumber.set(String(row.registered_number), row);
    }
  }
  return byNumber;
}

/** The register has no grant-making flag; the How classification is it. A
 *  charity that only makes grants is a grant-maker (lib/register-mirror). */
function grantMaking(row: MirrorRow): boolean | null {
  const how = row.classification?.how ?? [];
  return how.length === 0 ? null : how.every((h) => /grant/i.test(h));
}

async function main() {
  const budget = await spendSummary();
  console.log(
    `spend this month: $${budget.spentUsd.toFixed(2)} of $${budget.capUsd.toFixed(2)} (model-spend cap)`,
  );
  if (budget.remainingUsd <= 0) {
    console.log("the cap is reached — nothing will be suggested");
    return;
  }

  const { data: topics, error: tErr } = await supabase
    .from("topics")
    .select(
      "id, title, is_finite, favourites(label, is_canonical), topic_subsets(id, title, status, is_active, topic_subset_items(favourites(label)))",
    )
    .eq("is_active", true);
  if (tErr) throw new Error(tErr.message);
  const catalogue = catalogueForSuggestion(topics ?? []);

  let targets = WAVE ? await waveTargets() : await accountTargets();
  if (!ALL) targets = targets.filter((t) => !t.hasSuggestion);
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);
  console.log(
    `${targets.length} ${WAVE ? `candidates (income >= £${INCOME_FLOOR.toLocaleString("en-GB")})` : "account charities"} to suggest for`,
  );
  if (targets.length === 0) return;

  const mirror = await mirrorRows(targets.map((t) => t.registeredNumber));

  let n = 0;
  for (const target of targets) {
    if (!(await spendAvailable())) {
      console.log("  … the spend cap is reached — stopping here");
      break;
    }
    const row = mirror.get(target.registeredNumber);
    if (!row) {
      console.log(`  – ${target.registeredNumber}: not in the mirror`);
      continue;
    }
    const s = await suggestPerfectTopic({
      name: row.name,
      activities: row.activities,
      objects: row.objects,
      causeFamily: target.causeFamily,
      grantMaking: grantMaking(row),
      areas: (row.areas ?? []).map((a) => ({
        area: a.description,
        type: a.type,
      })),
      topics: catalogue,
      registeredNumber: target.registeredNumber,
      wave: WAVE_LABEL,
    });
    forgetSpendCache();
    if (!s) {
      console.log(`  – ${row.name}: nothing to say`);
      continue;
    }
    // An existing subset by name, or the proposal written as a PROPOSED
    // topic_subsets row for /subsets — never the charity's private list.
    const suggestedSubsetId =
      s.subsetId ??
      (s.topicId && s.proposedSubset
        ? await proposeSubsetFromSuggestion(
            supabase,
            s.topicId,
            s.proposedSubset,
            s.reason,
          )
        : null);
    // Upsert, not update: an account charity the register has removed has
    // no floor profile, and its suggestion still has to land somewhere.
    const { error: uErr } = await supabase.from("charity_profiles").upsert(
      {
        registered_number: target.registeredNumber,
        perfect_topic_suggested_id: s.topicId,
        perfect_subset_suggested_id: suggestedSubsetId,
        perfect_topic_reason: s.reason,
        status: "drafted",
        generated_at: new Date().toISOString(),
        model: PERFECT_TOPIC_MODEL(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "registered_number" },
    );
    if (uErr) console.error(`  ✗ ${row.name}: ${uErr.message}`);
    else {
      n++;
      const topic = catalogue.find((t) => t.id === s.topicId);
      const subset = topic?.subsets?.find((x) => x.id === s.subsetId)?.title;
      console.log(
        `  ✓ ${row.name}: ${topic?.title ?? "none"}${subset ? ` › ${subset}` : ""}${s.proposedSubset ? ` › proposed ${s.proposedSubset.title} [${s.proposedSubset.items.join(", ")}]` : ""} — ${s.reason}`,
      );
    }
  }
  const after = await spendSummary();
  console.log(
    `${n} suggested · spend now $${after.spentUsd.toFixed(2)} of $${after.capUsd.toFixed(2)}${WAVE_LABEL ? ` · wave "${WAVE_LABEL}"` : ""}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
