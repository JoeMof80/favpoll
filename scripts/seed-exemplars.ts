/**
 * scripts/seed-exemplars.ts
 * ---------------------------------------------------------------------------
 * Seeds a handful of hand-crafted exemplar events — closed events with
 * is_exemplar = true — used as inspiration content in the "See events like
 * this" door on the New Event form.
 *
 * Exemplars are written to be outgrown by genuine events; don't over-seed.
 * Each has a vivid About (teases topic domain; never states the favourite),
 * populated pledge data so results render, and personal_reveal set.
 *
 * Run order:  pnpm seed   (reference data)   →   this script (exemplars).
 *
 * Run (staging):
 *   cd apps/web && \
 *     NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     pnpm tsx ../../scripts/seed-exemplars.ts
 *
 * SAFETY: refuses to run unless the target looks like staging, or you set
 * ALLOW_EVENT_SEED=1 explicitly.
 *
 * IDEMPOTENT: owned by created_by = 'user_seed_exemplar'. Re-running is a
 * no-op if the target event count is already met.
 *
 * To remove:
 *   delete from events where created_by = 'user_seed_exemplar';
 *   delete from protagonists where created_by = 'user_seed_exemplar';
 * ---------------------------------------------------------------------------
 */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEED_USER_ID = "user_seed_exemplar"

// ─────────────────────── Safety guard ────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const STAGING_REF = "eotqyintgusvzidymumb"
const isStaging = SUPABASE_URL.includes(STAGING_REF)
const allowOverride = process.env.ALLOW_EVENT_SEED === "1"

if (!isStaging && !allowOverride) {
  console.error(
    `\n🚫  Refusing to seed exemplars.\n` +
      `    URL: ${SUPABASE_URL}\n` +
      `    Expected staging ref: ${STAGING_REF}\n` +
      `    Set ALLOW_EVENT_SEED=1 to override.\n`
  )
  process.exit(1)
}

// ─────────────────────── Exemplar definitions ────────────────────────────────

/**
 * One entry per exemplar. 'topicTitle' and 'charityName' are resolved to IDs
 * at runtime by looking up the reference data seeded by seed.ts.
 *
 * About rule: tease the topic domain, weave in why-of-the-charity if
 * appropriate — but NEVER state the specific favourite. That is reserved for
 * personal_reveal. About → reveal is escalation (domain → specific).
 */
const EXEMPLARS = [
  {
    // Model exemplar — Memorial / Colour / Marie Curie
    register: "remembering" as const,
    occasionType: "Memorial",
    name: "Belinda Johnson",
    context: "1940 – 2024",
    about:
      "A beloved mother, teacher, and friend who spent her life bringing people together. Her home was full of deliberate colour — every room had a story, and the shade she always came back to said more about her than most words could. Marie Curie nurses were with her at the end, and she would have wanted them remembered here.",
    topicTitle: "Colour",
    charityName: "Marie Curie",
    personal_reveal:
      "Cornflower blue. She kept a pot of cornflowers on the windowsill every summer.",
    pledgeAmounts: [20, 15, 10, 10, 5, 5, 5, 3, 3, 2],
    closedDaysAgo: 45,
  },
  {
    // Birthday / Biscuit / RNLI
    register: "celebrating_one" as const,
    occasionType: "Birthday",
    name: "Sarah Mitchell",
    context: "Turning 40",
    about:
      "Sarah is forty and has never met a biscuit she didn't take seriously. She has strong opinions and is not afraid to share them, which is part of why everyone is here. She supports the RNLI because she grew up near the coast and means it.",
    topicTitle: "Biscuit",
    charityName: "RNLI",
    personal_reveal:
      "The Bourbon. She once ate four packets in one sitting, and she has no regrets.",
    pledgeAmounts: [10, 10, 10, 5, 5, 5, 3, 3],
    closedDaysAgo: 20,
  },
  {
    // Retirement / Place / British Heart Foundation
    register: "celebrating_one" as const,
    occasionType: "Retirement",
    name: "David Clarke",
    context: "After 35 years",
    about:
      "After thirty-five years building the engineering team from four people to four hundred, David is finally putting down his laptop. He has a shortlist of places he's never had time to actually go to — and now he does. His charity of choice looks after the hearts of people who worked as hard as he did.",
    topicTitle: "Place",
    charityName: "British Heart Foundation",
    personal_reveal:
      "The Dordogne. He kept a photo of it on his desk for thirty years.",
    pledgeAmounts: [50, 20, 20, 10, 10, 5, 5, 5],
    closedDaysAgo: 30,
  },
  {
    // Wedding / Song / Shelter
    register: "celebrating_many" as const,
    occasionType: "Wedding",
    name: "Emma & James",
    context: "Married June 2025",
    about:
      "Emma and James met at a rainy music festival in 2019 and haven't been apart since. Music runs through everything they do together. They asked for pledges to Shelter in lieu of gifts — because a roof over your head matters, and they wanted to share the good fortune.",
    topicTitle: "Song",
    charityName: "Shelter",
    personal_reveal:
      "Fields of Gold. It played at their first dance and neither of them planned it.",
    pledgeAmounts: [50, 50, 25, 25, 20, 10, 10, 10, 5, 5],
    closedDaysAgo: 14,
  },
  {
    // Achievement / Comfort food / Macmillan Cancer Support
    register: "celebrating_one" as const,
    occasionType: "Achievement",
    name: "Marcus Webb",
    context: "First marathon",
    about:
      "Marcus just ran his first marathon — raising over £4,000 for Macmillan along the way. He trained for eight months, mostly in the dark, mostly in the rain. He has thoughts about comfort food that got him through the long runs, and now is the time to share them.",
    topicTitle: "Comfort food",
    charityName: "Macmillan Cancer Support",
    personal_reveal:
      "Shepherd's pie. He made a batch every Sunday from September, and it got him to the start line.",
    pledgeAmounts: [20, 20, 10, 10, 10, 5, 5, 3],
    closedDaysAgo: 10,
  },
  {
    // Cause / Film / Oxfam
    register: "cause" as const,
    occasionType: "Fundraiser",
    name: "The Hargreaves Memorial Fund",
    context: null,
    about:
      "This poll raises money for Oxfam in memory of the Hargreaves family, who believed in practical acts of generosity. Pick the film that best captures what they stood for. The one with the most pledges will be screened at the memorial event.",
    topicTitle: "Film",
    charityName: "Oxfam",
    personal_reveal:
      "It's a Wonderful Life. They watched it every Christmas Eve without fail.",
    pledgeAmounts: [30, 20, 15, 15, 10, 5],
    closedDaysAgo: 60,
  },
]

// ─────────────────────── Helpers ─────────────────────────────────────────────

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString()
}

function closingDate(closedDaysAgo: number): string {
  // closes_at was set before the event closed
  return new Date(
    Date.now() - (closedDaysAgo + 3) * 86400000
  ).toISOString()
}

// ─────────────────────── Main ─────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding exemplar events…")

  // Check how many exemplars already exist
  const { count: existing } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("created_by", SEED_USER_ID)

  if ((existing ?? 0) >= EXEMPLARS.length) {
    console.log(
      `✓  ${existing} exemplar(s) already exist — nothing to do.`
    )
    return
  }

  // Fetch topics and charities for ID lookup
  const [{ data: topics }, { data: charities }] = await Promise.all([
    supabase
      .from("topics")
      .select("id, title, is_finite, topic_items ( id, label )")
      .eq("is_active", true),
    supabase.from("charities").select("id, name").eq("is_active", true),
  ])

  const topicByTitle = new Map(
    (topics ?? []).map((t) => [t.title, t])
  )
  const charityByName = new Map(
    (charities ?? []).map((c) => [c.name, c])
  )

  let created = 0

  for (const ex of EXEMPLARS) {
    // Idempotency: skip if an event with this protagonist name already exists
    const { count: exists } = await supabase
      .from("protagonists")
      .select("id", { count: "exact", head: true })
      .eq("name", ex.name)
      .eq("created_by", SEED_USER_ID)

    if ((exists ?? 0) > 0) {
      console.log(`  ↳ skip  ${ex.name} (already seeded)`)
      continue
    }

    const topic = topicByTitle.get(ex.topicTitle)
    if (!topic) {
      console.warn(`  ⚠  Topic not found: "${ex.topicTitle}" — skipping ${ex.name}`)
      continue
    }

    const charity = charityByName.get(ex.charityName)
    if (!charity) {
      console.warn(`  ⚠  Charity not found: "${ex.charityName}" — skipping ${ex.name}`)
      continue
    }

    // 1. Protagonist
    const { data: protagonist, error: protError } = await supabase
      .from("protagonists")
      .insert({
        name: ex.name,
        about: ex.about,
        context: ex.context,
        created_by: SEED_USER_ID,
      })
      .select("id")
      .single()

    if (protError || !protagonist) {
      console.error(`  ✗  protagonist insert failed for ${ex.name}:`, protError?.message)
      continue
    }

    // 2. Event (closed, exemplar)
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        protagonist_id: protagonist.id,
        register: ex.register,
        occasion_type: ex.occasionType,
        opening_line: null,
        market: "en-GB",
        created_by: SEED_USER_ID,
        closes_at: closingDate(ex.closedDaysAgo),
        closed_at: daysAgo(ex.closedDaysAgo),
        is_private: false,
        is_exemplar: true,
        total_raised: ex.pledgeAmounts.reduce((a, b) => a + b, 0),
      })
      .select("id")
      .single()

    if (eventError || !event) {
      console.error(`  ✗  event insert failed for ${ex.name}:`, eventError?.message)
      continue
    }

    // 3. Event charity
    await supabase.from("event_charities").insert({
      event_id: event.id,
      charity_id: charity.id,
    })

    // 4. Event pot (mandatory — every event must have one)
    await supabase.from("event_pots").insert({
      event_id: event.id,
      amount: 0,
      currency: "gbp",
    })

    // 5. Event poll
    const { data: eventPoll, error: pollError } = await supabase
      .from("event_polls")
      .insert({
        event_id: event.id,
        topic_id: topic.id,
        personal_reveal: ex.personal_reveal,
      })
      .select("id")
      .single()

    if (pollError || !eventPoll) {
      console.error(`  ✗  event_poll insert failed for ${ex.name}:`, pollError?.message)
      continue
    }

    // 6. Event poll items (for finite topics; infinite gets event_poll_items)
    const topicItems = (topic as { topic_items: { id: string; label: string }[] }).topic_items ?? []
    const isFinite = (topic as { is_finite: boolean }).is_finite

    if (isFinite && topicItems.length > 0) {
      await supabase.from("event_poll_items").insert(
        topicItems.map((item) => ({
          event_poll_id: eventPoll.id,
          topic_item_id: item.id,
        }))
      )
    }

    // 7. Pledge allocations (simulated pledges to show results)
    const pledgeAmounts = ex.pledgeAmounts
    const itemsForAlloc = isFinite && topicItems.length > 0
      ? topicItems
      : topicItems.slice(0, 5) // fallback for infinite

    if (itemsForAlloc.length > 0) {
      // Distribute pledge amounts: first item gets the most, spread across items
      const guestId = "user_seed_exemplar_guest"

      for (let i = 0; i < pledgeAmounts.length; i++) {
        const amount = pledgeAmounts[i]
        // Assign to item in a top-heavy distribution (0,0,1,1,2,2,…)
        const itemIndex = Math.min(
          Math.floor(i / Math.ceil(pledgeAmounts.length / Math.max(itemsForAlloc.length, 1))),
          itemsForAlloc.length - 1
        )
        const item = itemsForAlloc[itemIndex]

        const { data: pledge } = await supabase
          .from("pledges")
          .insert({
            event_poll_id: eventPoll.id,
            guest_token: `exemplar-${event.id}-${i}`,
            amount,
            currency: "gbp",
            status: "succeeded",
          })
          .select("id")
          .single()

        if (pledge) {
          await supabase.from("pledge_allocations").insert({
            pledge_id: pledge.id,
            topic_item_id: item.id,
            amount,
          })
        }
      }
    }

    console.log(
      `  ✓  ${ex.name} (${ex.register} / ${ex.occasionType ?? "—"} / ${ex.topicTitle})`
    )
    created++
  }

  console.log(`\n✅  Done — ${created} exemplar(s) created.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
