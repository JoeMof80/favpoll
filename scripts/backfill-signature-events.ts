/**
 * scripts/backfill-signature-events.ts
 * ---------------------------------------------------------------------------
 * Reads every active charity's website (lib/charity-events.ts) for the
 * fundraising events it already holds and writes charities.signature_events
 * + website_read_at. A suggestion for the outreach queue; never touched by
 * the generator.
 *
 * Run from apps/web, after migration 20260927120000:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-signature-events.ts
 *   --all re-reads sites already read.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { suggestSignatureEvents } from "../apps/web/lib/charity-events";
import { OCCASION_TYPES_BY_REGISTER } from "../apps/web/lib/registers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const ALL = process.argv.includes("--all");

async function main() {
  const { data: topics } = await supabase
    .from("topics")
    .select("title")
    .eq("is_active", true);
  const topicTitles = (topics ?? []).map((t) => t.title as string);
  const occasionTypes = [
    ...new Set(Object.values(OCCASION_TYPES_BY_REGISTER).flat()),
  ];

  let q = supabase
    .from("charities")
    .select("id, name, registered_website, activities, website_read_at")
    .eq("is_active", true)
    .not("registered_website", "is", null)
    .order("name");
  if (!ALL) q = q.is("website_read_at", null);
  const { data: charities, error } = await q;
  if (error) throw new Error(error.message);

  let n = 0;
  for (const c of charities ?? []) {
    const events = await suggestSignatureEvents({
      name: c.name,
      website: c.registered_website,
      activities: c.activities,
      occasionTypes,
      topicTitles,
    });
    const { error: uErr } = await supabase
      .from("charities")
      .update({
        signature_events: events.length ? events : null,
        website_read_at: new Date().toISOString(),
      })
      .eq("id", c.id);
    if (uErr) console.error(`  ✗ ${c.name}: ${uErr.message}`);
    else {
      n++;
      console.log(
        `  ${events.length ? "✓" : "–"} ${c.name}: ${
          events.length
            ? events
                .map(
                  (e) =>
                    `${e.name} (${e.kind}${e.when ? `, ${e.when}` : ""}${e.occasionType ? ` → ${e.occasionType}` : ""}${e.topic ? ` · ${e.topic}` : ""})`,
                )
                .join("; ")
            : "nothing on the site"
        }`,
      );
    }
  }
  console.log(`${n} read`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
