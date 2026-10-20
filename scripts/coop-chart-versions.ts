/**
 * scripts/coop-chart-versions.ts
 * ---------------------------------------------------------------------------
 * Checking our Funeral song members against Co-op Funeralcare's published
 * chart (2025 edition, ~93,000 services) turned up two things the chart
 * decides and we had wrong.
 *
 * 1. A DEFECT. "You'll Never Walk Alone — traditional" is not traditional:
 *    it is a 1945 Rodgers and Hammerstein show tune from Carousel, and the
 *    recording the chart names is Gerry and The Pacemakers'. "traditional"
 *    is right for Abide With Me (Lyte, 1847) and Amazing Grace; it is
 *    simply an error here, so the credit is corrected.
 *
 * 2. THE FIRST TWO-VERSION PAIR. The chart's number three is Eva Cassidy's
 *    "Somewhere Over the Rainbow"; our list had Judy Garland's. Both have
 *    standing — Garland's is the original and a favourite in its own right,
 *    Cassidy's is the funeral recording — so BOTH are in the catalogue
 *    (founder, 2026-10-13: "why not both? multiple versions because of
 *    cover versions"). See the versions rule in topic rules §C.
 *
 * Not changed: "Time to Say Goodbye — Andrea Bocelli", which the chart
 * credits to Bocelli AND Sarah Brightman. Incomplete is not wrong — he is
 * the lead artist and most listings credit him alone — so that one is a
 * founder call rather than a defect.
 *
 * Run on each database, from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/coop-chart-versions.ts
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/coop-chart-versions.ts
 *
 * Idempotent. --dry-run says what it would do.
 *
 * THE RENAME IS GUARDED, and the guard earned its place on the first run:
 * production carries no history on any of the 40 Song items, but DEV had 44
 * picks on "You'll Never Walk Alone — traditional" from the seeded exemplars.
 * A label that has been picked is a record of what somebody chose, so the
 * rename refuses by default and dev needs --force-seeded-rename, which is
 * only ever right where the picks are fiction. On a database with real picks
 * the answer is to add the correct credit as a second item, never to rewrite
 * the one they chose.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const DRY = process.argv.includes("--dry-run")
/**
 * Renaming a label that has been PICKED rewrites what somebody chose, so the
 * rename refuses by default. Dev and staging are the exception and need this
 * flag: their picks come from the seeded exemplars, which are fiction and were
 * removed from production on 2026-10-01 precisely because they must not touch
 * the record. Never pass it against production — there, an item with history
 * has history because a guest put it there.
 */
const FORCE = process.argv.includes("--force-seeded-rename")

const RECREDITS = [
  {
    from: "You'll Never Walk Alone — traditional",
    to: "You'll Never Walk Alone — Gerry and The Pacemakers",
  },
  // The chart credits the duet. "Andrea Bocelli" alone was incomplete
  // rather than wrong, so it was left as the founder's call; he took it
  // (2026-10-15). Same shape as "Simon & Garfunkel".
  {
    from: "Time to Say Goodbye — Andrea Bocelli",
    to: "Time to Say Goodbye — Andrea Bocelli & Sarah Brightman",
  },
]
/** Joins Funeral song as well: it is the chart's recording. */
const SECOND_VERSION = "Over the Rainbow — Eva Cassidy"

async function main() {
  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("title", "Song")
    .maybeSingle()
  if (!topic) {
    console.log("No Song topic here — nothing to do.")
    return
  }

  const { data: favs } = await supabase
    .from("favourites")
    .select("id, label, all_time_count, event_count, total_pledge_count")
    .eq("topic_id", topic.id)
  const byLabel = new Map((favs ?? []).map((f) => [f.label.toLowerCase(), f]))

  // ── 1. The credits ───────────────────────────────────────────────────────
  for (const RECREDIT of RECREDITS) {
    const wrong = byLabel.get(RECREDIT.from.toLowerCase())
    if (!wrong) {
      console.log(`Credit: "${RECREDIT.from}" is not here — already done.`)
    } else if (
      (wrong.all_time_count || wrong.event_count || wrong.total_pledge_count) &&
      !FORCE
    ) {
      // A label someone has picked is a record of what they picked. Renaming
      // it would rewrite their pick, so this stops rather than guesses.
      console.log(
        `Credit: REFUSING to rename "${RECREDIT.from}" — it has history ` +
          `(${wrong.all_time_count} picks, ${wrong.event_count} events). ` +
          `Pass --force-seeded-rename if and only if that history is the ` +
          `seeded exemplars (dev/staging), never on production.`
      )
    } else if (DRY) {
      console.log(`→ would recredit to "${RECREDIT.to}"`)
    } else {
      const { error } = await supabase
        .from("favourites")
        .update({ label: RECREDIT.to })
        .eq("id", wrong.id)
      if (error) throw new Error(error.message)
      console.log(`Credit: recredited to "${RECREDIT.to}"`)
    }
  }

  // ── 2. The second version ────────────────────────────────────────────────
  let versionId = byLabel.get(SECOND_VERSION.toLowerCase())?.id
  if (versionId) {
    console.log(`Version: "${SECOND_VERSION}" already on the Song list.`)
  } else if (DRY) {
    console.log(`→ would add "${SECOND_VERSION}" to the Song list`)
  } else {
    const { data: created, error } = await supabase
      .from("favourites")
      .insert({
        topic_id: topic.id,
        label: SECOND_VERSION,
        is_canonical: true,
        source: "seed",
        markets: ["en-GB"],
      })
      .select("id")
      .single()
    if (error) throw new Error(error.message)
    versionId = created.id
    console.log(`Version: added "${SECOND_VERSION}"`)
  }

  const { data: subset } = await supabase
    .from("topic_subsets")
    .select("id, topic_subset_items(favourite_id)")
    .eq("topic_id", topic.id)
    .eq("title", "Funeral song")
    .maybeSingle()
  if (!subset) {
    console.log("No Funeral song subset here — the item is enough.")
    return
  }
  const have = new Set(
    (subset.topic_subset_items ?? []).map((i) => i.favourite_id)
  )
  if (DRY) {
    console.log(
      versionId && have.has(versionId)
        ? `Funeral song: ${have.size} members, already a member.`
        : `→ would add it to Funeral song (${have.size} → ${have.size + 1}, ` +
            `ruling 7's ceiling is 16)`
    )
    return
  }
  if (!versionId || have.has(versionId)) {
    console.log(`Funeral song: ${have.size} members, nothing to add.`)
    return
  }
  const { error } = await supabase
    .from("topic_subset_items")
    .insert({ subset_id: subset.id, favourite_id: versionId })
  if (error) throw new Error(error.message)
  console.log(`Funeral song: ${have.size} → ${have.size + 1} members`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
