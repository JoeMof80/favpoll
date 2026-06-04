/**
 * scripts/seed-events.ts
 * ---------------------------------------------------------------------------
 * Generates dozens of realistic events (with protagonists, polls, items,
 * pledges, allocations, charities and shared funds) so favpoll can be
 * observed under load and with a populated UI.
 *
 * This is SEPARATE from scripts/seed.ts on purpose:
 *   - seed.ts seeds reference data (charities, categories, topics, items).
 *   - seed-events.ts seeds *activity* on top of that reference data.
 *
 * Run order:  pnpm seed   (reference data)   →   this script (events).
 *
 * Run (staging) — same pattern as seed.ts in PROJECT.md:
 *   cd apps/web && \
 *     NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     pnpm tsx ../../scripts/seed-events.ts
 *
 * SAFETY: refuses to run unless the target looks like staging, or you set
 * ALLOW_EVENT_SEED=1 explicitly. Fake events in production would be bad.
 *
 * IDEMPOTENT / ADDITIVE: every row it creates is owned by SEED_USER_ID. On
 * each run it tops the event count up to TARGET_EVENTS — it never deletes.
 * Re-running with the same target is a no-op; raising the target adds more.
 *
 * To remove seed data later (manual, scoped to the seed user):
 *   delete from events where created_by = 'user_seed_scale';
 *   (cascades to event_polls, event_poll_items, pledges, allocations, pots…)
 *   delete from protagonists where created_by = 'user_seed_scale';
 *
 * ASSUMPTIONS / CAVEATS (read these):
 *   - The record (topic_items.all_time_pledged / all_time_count) is maintained
 *     by the Postgres trigger on pledge_allocations. This script therefore does
 *     NOT write those columns — inserting allocations updates them. Running on a
 *     shared staging DB WILL move the global record numbers. That is the point
 *     of a scale test, but be aware of it.
 *   - event_count and total_pledge_count on topic_items are left untouched. If
 *     they are not trigger-maintained, the inclusion threshold (3 events) and
 *     any UI reading them won't reflect this data without a backfill. Flagged
 *     rather than guessed at — see NOTE near the end.
 *   - WITHDRAWN_FRACTION defaults to 0. Withdrawing a pledge sets withdrawn_at
 *     but does not delete its allocations, so the trigger would leave the record
 *     inflated. Raise it only if you want to exercise the withdrawal path and
 *     accept that the record numbers drift.
 *   - personal_reveal reuses each topic's existing placeholder reveal copy for
 *     the chosen occasion (already on-brand). about is generated from neutral
 *     templates so it stays coherent with the generated protagonist name.
 *     Reveal pronouns ("Hers"/"His") may not match a given protagonist — a
 *     cosmetic mismatch that's fine for test fixtures.
 * ---------------------------------------------------------------------------
 */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ───────────────────────── Config — tweak freely ──────────────────────────

const SEED_USER_ID = "user_seed_scale"
const TARGET_EVENTS = 40 // "dozens"

const CLOSED_FRACTION = 0.4 // share of events already closed
const PRIVATE_FRACTION = 0.1 // share marked is_private
const SHARED_FUND_FRACTION = 0.25 // share with a non-zero shared fund
const AUTH_PLEDGE_FRACTION = 0.2 // share of pledges from signed-in users
const WITHDRAWN_FRACTION = 0.0 // see CAVEATS — keep 0 to protect the record
const GUEST_ITEM_EVENT_FRACTION = 0.15 // share of infinite-topic events that
//                                        get one guest-suggested item (feeds
//                                        the admin contributions queue)

const FEE_RATE = 0.05 // 5% platform fee (brand fact)

// A small pool of signed-in "users" so authed pledges and my-events have data.
const SEED_USERS = Array.from({ length: 8 }, (_, i) => ({
  id: `user_seed_${String(i + 1).padStart(3, "0")}`,
  email: `seed.guest${i + 1}@example.test`,
  display_name: `Seed Guest ${i + 1}`,
}))

// Topics that recur more often, so their items accumulate across many events
// (this is what stresses the record, rankings, and the inclusion threshold).
const POPULAR_TOPICS = new Set([
  "Colour",
  "Biscuit",
  "Film",
  "Song",
  "Comfort food",
  "Drink",
  "Place",
  "Hobby",
  "Sport to watch",
  "Flower",
])

// Occasion mix — keys MUST match events_occasion_check / OCCASION_LIST.
const OCCASION_WEIGHTS: Record<string, number> = {
  memorial: 10,
  tribute: 4,
  birthday: 12,
  retirement: 8,
  wedding: 8,
  engagement: 5,
  anniversary: 6,
  leaving: 6,
  graduation: 6,
  christening: 4,
  achievement: 5,
  recovery: 4,
  award: 3,
  promotion: 4,
  celebration: 4,
  other: 3,
}

// Default poll closing period (days) by occasion — from PROJECT.md.
function closingDays(occasion: string): number {
  if (occasion === "memorial") return 30
  if (["tribute", "retirement", "anniversary"].includes(occasion)) return 21
  return 14
}

// Field limits (from PROJECT.md "Field character limits").
const LIMITS = { name: 40, context: 40, about: 300, reveal: 280 }

// Protagonist name pool — individuals, couples, and groups, varied length.
const NAME_POOL = [
  "Margaret Hughes",
  "Tom",
  "Belinda Carter",
  "David Okafor",
  "Sarah",
  "Priya Nair",
  "James & Sophie",
  "The Wallace Family",
  "Ros Bennett",
  "Kwame Mensah",
  "Emma and James",
  "Grandad Joe",
  "Dr Amelia Stone",
  "Marcus Webb",
  "Claire",
  "The 2025 Netball Squad",
  "Aunty Pat",
  "Callum & Sophie",
  "Mr Ferguson",
  "Lily",
  "Hassan Ali",
  "The Morning Run Club",
  "Eleanor Vance",
  "Dev Sharma",
  "Bridget O'Connell",
  "Yusuf",
  "The Thursday Quiz Team",
  "Nana Rose",
  "Olu Adeyemi",
  "Frances Whittaker",
]

// Context strings keyed loosely by occasion (kept <= 40 chars).
function contextFor(occasion: string): string | null {
  const year = 1932 + randInt(0, 60)
  switch (occasion) {
    case "memorial":
    case "tribute":
      return `${year} – 2025`
    case "birthday":
      return `Turning ${pick([30, 40, 50, 60, 70, 80, 90])}`
    case "retirement":
      return `After ${randInt(20, 40)} years`
    case "wedding":
      return "On their wedding day"
    case "engagement":
      return "Newly engaged"
    case "anniversary":
      return `${randInt(10, 60)} years together`
    case "leaving":
      return "Moving on"
    case "graduation":
      return "Class of 2025"
    case "christening":
      return "Newly arrived"
    case "achievement":
      return "A first marathon"
    case "recovery":
      return "On the mend"
    case "award":
      return "Award winner"
    case "promotion":
      return "Newly promoted"
    default:
      return null
  }
}

const SOLEMN = new Set(["memorial", "tribute", "recovery"])

// Neutral about templates — never name a favourite (so they can't leak a
// reveal), coherent with the generated name, varied length for layout testing.
function aboutFor(name: string, occasion: string): string {
  const solemn = SOLEMN.has(occasion)
  const short = solemn
    ? `${name} is remembered with great affection by everyone here.`
    : `${name} is being celebrated by the people who know them best.`
  const medium = solemn
    ? `Family and friends are gathering to remember ${name}. Everyone in the room is carrying a story, and this is a quiet way to share a little of one.`
    : `Friends and family are gathering for ${name}. There is a lot to celebrate and plenty of opinions in the room — this is a chance to add yours.`
  const long = solemn
    ? `Family, friends, and colleagues are gathering to remember ${name}. There are more stories than there is time to tell them, and everyone here has at least one. This is a small, shared way to mark what they meant to all of us — quietly, generously, together.`
    : `Friends, family, and colleagues are gathering to mark this occasion for ${name}. There are more stories than there is time to tell them, and everyone here has at least one. This is a chance to add something of your own to the collection — quietly, generously, together.`
  return clamp(pick([short, medium, medium, long]), LIMITS.about)
}

// Extra candidate guest-suggested items for a few common infinite topics.
// Used only when an event qualifies for a guest item; deduped against the
// existing canonical list before insert.
const GUEST_ITEM_CANDIDATES: Record<string, string[]> = {
  Film: ["The Wizard of Oz", "Notting Hill", "Chariots of Fire", "Billy Elliot"],
  Song: [
    "Caledonia — Dougie MacLean",
    "Fields of Gold — Sting",
    "Three Little Birds — Bob Marley",
  ],
  "Comfort food": ["Sunday crumble", "Cheese toastie", "Macaroni cheese", "Sausage and mash"],
  Hobby: ["Wild swimming", "Pottery", "Allotment", "Bell ringing"],
  Place: ["The allotment", "The lido", "The corner café"],
  Drink: ["Bovril", "Dandelion and burdock", "Builder's tea"],
  Biscuit: ["Nice biscuit", "Fig roll", "Party ring"],
}

// ───────────────────────────── Helpers ────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function chance(p: number): boolean {
  return Math.random() < p
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function clamp(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…"
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86400000).toISOString()
}
function weightedPickKey(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (const [k, w] of Object.entries(weights)) {
    if ((r -= w) <= 0) return k
  }
  return Object.keys(weights)[0]
}

// Realistic, long-tailed pledge count per event: most modest, a few busy.
function pledgeCountForEvent(): number {
  const roll = Math.random()
  if (roll < 0.15) return randInt(0, 3) // sparse / nearly-empty polls
  if (roll < 0.75) return randInt(4, 30) // typical
  if (roll < 0.95) return randInt(30, 70) // busy
  return randInt(70, 120) // a handful of stress cases
}

// Pledge amounts in pence, clustered around common round figures.
function pledgeAmountPence(): number {
  const pounds = pick([2, 5, 5, 10, 10, 10, 15, 20, 20, 25, 30, 50, 50, 75, 100, 100, 250])
  // small jitter on some so totals aren't all round
  const jitter = chance(0.2) ? randInt(0, 99) : 0
  return pounds * 100 + jitter
}

// Split a pence total across `parts`, each >= 1 penny, summing exactly.
function splitPence(total: number, parts: number): number[] {
  const base = Math.floor(total / parts)
  const remainder = total - base * parts
  const out = Array.from({ length: parts }, () => base)
  for (let i = 0; i < remainder; i++) out[i] += 1
  return shuffle(out)
}
const toPounds = (pence: number) => Math.round(pence) / 100

// ───────────────────────────── Seed types ─────────────────────────────────

type Topic = {
  id: string
  title: string
  is_finite: boolean
  placeholders: Record<string, { about?: string; reveal?: string }> | null
}
type Item = { id: string; topic_id: string; label: string }

// ───────────────────────────── Main flow ──────────────────────────────────

async function ensureSeedUsers() {
  const rows = [
    {
      id: SEED_USER_ID,
      email: "scale.organiser@example.test",
      display_name: "Scale Test Organiser",
    },
    ...SEED_USERS,
  ]
  for (const row of rows) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", row.id)
      .maybeSingle()
    if (existing) continue
    const { error } = await supabase.from("users").insert(row)
    if (error) console.error(`  ✗ user ${row.id}:`, error.message)
  }
}

async function loadReferenceData() {
  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, is_finite, placeholders")
    .eq("is_active", true)

  const { data: items } = await supabase
    .from("topic_items")
    .select("id, topic_id, label")
    .eq("is_canonical", true)

  const { data: charities } = await supabase
    .from("charities")
    .select("id")
    .eq("is_active", true)

  return {
    topics: (topics ?? []) as Topic[],
    items: (items ?? []) as Item[],
    charityIds: (charities ?? []).map((c) => c.id as string),
  }
}

async function createOneEvent(
  topics: Topic[],
  itemsByTopic: Map<string, Item[]>,
  charityIds: string[]
) {
  const occasion = weightedPickKey(OCCASION_WEIGHTS)

  // Pick a topic, weighting the popular core so items recur across events.
  const weightedTopics = topics.flatMap((t) =>
    Array(POPULAR_TOPICS.has(t.title) ? 4 : 1).fill(t)
  )
  const topic = pick(weightedTopics)
  const allItems = itemsByTopic.get(topic.id) ?? []
  if (allItems.length === 0) return null // topic has no items; skip

  const closed = chance(CLOSED_FRACTION)
  const closing = closingDays(occasion)

  let createdAt: string
  let closesAt: string
  let closedAt: string | null = null
  let extensionCount = 0
  // null unless the event has actually been extended — so the app can detect
  // extended events via `original_closes_at IS NOT NULL` if it does so.
  let originalClosesAt: string | null = null

  if (closed) {
    const created = -(closing + randInt(5, 90))
    createdAt = daysFromNow(created)
    closesAt = daysFromNow(created + closing)
    closedAt = closesAt
  } else {
    const createdAgo = randInt(1, 40)
    createdAt = daysFromNow(-createdAgo)
    closesAt = daysFromNow(randInt(2, 28))
    extensionCount = chance(0.15) ? 1 : chance(0.05) ? 2 : 0
    if (extensionCount > 0) {
      originalClosesAt = new Date(
        new Date(closesAt).getTime() - extensionCount * 7 * 86400000
      ).toISOString()
    }
  }
  const hardCloseAt = new Date(
    new Date(createdAt).getTime() + 90 * 86400000
  ).toISOString()

  const name = clamp(pick(NAME_POOL), LIMITS.name)

  // 1) protagonist
  const { data: protagonist, error: pErr } = await supabase
    .from("protagonists")
    .insert({
      name,
      context: contextFor(occasion),
      about: aboutFor(name, occasion),
      created_by: SEED_USER_ID,
    })
    .select("id")
    .single()
  if (pErr || !protagonist) {
    console.error("  ✗ protagonist:", pErr?.message)
    return null
  }

  // 2) event
  const { data: event, error: eErr } = await supabase
    .from("events")
    .insert({
      protagonist_id: protagonist.id,
      occasion,
      market: "en-GB",
      created_by: SEED_USER_ID,
      closes_at: closesAt,
      is_private: chance(PRIVATE_FRACTION),
      closed_at: closedAt,
      extension_count: extensionCount,
      original_closes_at: originalClosesAt,
      hard_close_at: hardCloseAt,
      created_at: createdAt,
    })
    .select("id")
    .single()
  if (eErr || !event) {
    console.error("  ✗ event:", eErr?.message)
    return null
  }

  // 3) shared fund (mandatory — every event gets one, seeded at 0)
  const fund = chance(SHARED_FUND_FRACTION) ? pick([20, 50, 100, 200]) : 0
  await supabase.from("event_pots").insert({
    event_id: event.id,
    created_by: SEED_USER_ID,
    total_deposited: fund,
    total_allocated: 0,
  })

  // 4) charities (1–3, equal split, max 3)
  const chosenCharities = shuffle(charityIds).slice(0, randInt(1, 3))
  await supabase.from("event_charities").insert(
    chosenCharities.map((charity_id, i) => ({
      event_id: event.id,
      charity_id,
      display_order: i,
    }))
  )

  // 5) event poll (one per event; reveal from placeholder copy; no framing)
  const reveal =
    topic.placeholders?.[occasion]?.reveal ??
    topic.placeholders?.["default"]?.reveal ??
    null
  const { data: poll, error: pollErr } = await supabase
    .from("event_polls")
    .insert({
      event_id: event.id,
      topic_id: topic.id,
      personal_reveal: reveal ? clamp(reveal, LIMITS.reveal) : null,
    })
    .select("id")
    .single()
  if (pollErr || !poll) {
    console.error("  ✗ event_poll:", pollErr?.message)
    return null
  }

  // 6) poll items — finite: all; infinite: a random subset
  let pollItems: Item[]
  if (topic.is_finite) {
    pollItems = allItems
  } else {
    const n = Math.min(allItems.length, randInt(6, 12))
    pollItems = shuffle(allItems).slice(0, n)
  }

  await supabase.from("event_poll_items").insert(
    pollItems.map((it) => ({
      event_poll_id: poll.id,
      topic_item_id: it.id,
      is_guest_added: false,
    }))
  )

  // 6b) optional guest-suggested item (infinite topics only) → contributions
  if (
    !topic.is_finite &&
    chance(GUEST_ITEM_EVENT_FRACTION) &&
    GUEST_ITEM_CANDIDATES[topic.title]
  ) {
    const existingLabels = new Set(allItems.map((i) => i.label.toLowerCase()))
    const candidate = pick(GUEST_ITEM_CANDIDATES[topic.title])
    if (!existingLabels.has(candidate.toLowerCase())) {
      const { data: newItem } = await supabase
        .from("topic_items")
        .insert({
          topic_id: topic.id,
          label: candidate,
          is_canonical: false,
          source: "guest",
          markets: ["en-GB"],
          review_status: "pending_review",
        })
        .select("id, topic_id, label")
        .single()
      if (newItem) {
        await supabase.from("event_poll_items").insert({
          event_poll_id: poll.id,
          topic_item_id: newItem.id,
          is_guest_added: true,
          added_by: pick(SEED_USERS).id,
        })
        pollItems.push(newItem as Item)
      }
    }
  }

  // 7) pledges + allocations
  const pledgeCount = pledgeCountForEvent()
  const upperBound = closedAt ? new Date(closedAt).getTime() : Date.now()
  const lowerBound = new Date(createdAt).getTime()

  const pledgeRows: Record<string, unknown>[] = []
  const plannedAllocations: { itemId: string; amountPence: number }[][] = []

  for (let i = 0; i < pledgeCount; i++) {
    const totalPence = pledgeAmountPence()
    const feePence = Math.round(totalPence * FEE_RATE)
    const at = new Date(
      lowerBound + Math.random() * (upperBound - lowerBound)
    ).toISOString()

    const parts = Math.min(randInt(1, 3), pollItems.length)
    const chosenItems = shuffle(pollItems).slice(0, parts)
    const splits = splitPence(totalPence, parts)

    const authed = chance(AUTH_PLEDGE_FRACTION)
    pledgeRows.push({
      event_poll_id: poll.id,
      clerk_user_id: authed ? pick(SEED_USERS).id : null,
      guest_email: authed ? null : `pledger${randInt(1, 99999)}@example.test`,
      guest_token: authed ? null : crypto.randomUUID(),
      total_amount: toPounds(totalPence),
      fee: toPounds(feePence),
      withdrawn_at: chance(WITHDRAWN_FRACTION) ? at : null,
      created_at: at,
    })
    plannedAllocations.push(
      chosenItems.map((it, idx) => ({ itemId: it.id, amountPence: splits[idx] }))
    )
  }

  let pledgedGrossPence = 0
  if (pledgeRows.length > 0) {
    const { data: inserted, error: plErr } = await supabase
      .from("pledges")
      .insert(pledgeRows)
      .select("id")
    if (plErr || !inserted) {
      console.error("  ✗ pledges:", plErr?.message)
    } else {
      const allocationRows: Record<string, unknown>[] = []
      inserted.forEach((p, idx) => {
        const withdrawn = pledgeRows[idx].withdrawn_at != null
        for (const a of plannedAllocations[idx]) {
          allocationRows.push({
            pledge_id: p.id,
            topic_item_id: a.itemId,
            amount: toPounds(a.amountPence),
          })
          if (!withdrawn) pledgedGrossPence += a.amountPence
        }
      })
      // Insert allocations in chunks — the trigger fires per row, which is
      // part of what we're stress-testing.
      const CHUNK = 500
      for (let i = 0; i < allocationRows.length; i += CHUNK) {
        const { error: aErr } = await supabase
          .from("pledge_allocations")
          .insert(allocationRows.slice(i, i + CHUNK))
        if (aErr) console.error("  ✗ allocations:", aErr.message)
      }
    }
  }

  // 8) closed events record total_raised (gross). Open events compute live.
  if (closedAt) {
    await supabase
      .from("events")
      .update({ total_raised: toPounds(pledgedGrossPence) })
      .eq("id", event.id)
  }

  return { occasion, topic: topic.title, pledges: pledgeRows.length }
}

async function seedEvents() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const STAGING_REF = "eotqyintgusvzidymumb" // from PROJECT.md
  if (!url.includes(STAGING_REF) && process.env.ALLOW_EVENT_SEED !== "1") {
    console.error(
      "Refusing to seed events: target does not look like staging.\n" +
        "Set ALLOW_EVENT_SEED=1 to override (do NOT do this against production)."
    )
    process.exit(1)
  }

  console.log("Seeding events…\n")
  await ensureSeedUsers()

  const { topics, items, charityIds } = await loadReferenceData()
  if (topics.length === 0 || items.length === 0 || charityIds.length === 0) {
    console.error(
      "Reference data missing. Run `pnpm seed` first (topics, items, charities)."
    )
    process.exit(1)
  }

  const itemsByTopic = new Map<string, Item[]>()
  for (const it of items) {
    const arr = itemsByTopic.get(it.topic_id) ?? []
    arr.push(it)
    itemsByTopic.set(it.topic_id, arr)
  }

  // Idempotent top-up: only create up to TARGET_EVENTS for the seed user.
  const { count } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("created_by", SEED_USER_ID)
  const existing = count ?? 0
  const toCreate = Math.max(0, TARGET_EVENTS - existing)

  console.log(`  ${existing} seed events exist; creating ${toCreate} more.\n`)

  let created = 0
  let pledgeTotal = 0
  for (let i = 0; i < toCreate; i++) {
    try {
      const result = await createOneEvent(topics, itemsByTopic, charityIds)
      if (result) {
        created++
        pledgeTotal += result.pledges
        console.log(
          `  ✓ [${created}/${toCreate}] ${result.occasion} · ${result.topic} · ${result.pledges} pledges`
        )
      }
    } catch (err) {
      console.error(`  ✗ event ${i + 1} failed:`, (err as Error).message)
    }
  }

  console.log(`\n${created} events created, ${pledgeTotal} pledges total.`)

  // NOTE: topic_items.event_count / total_pledge_count are intentionally not
  // written here. If the inclusion threshold (3 events) and any UI reading them
  // are NOT trigger-maintained, add a backfill that recomputes from
  // event_poll_items / pledge_allocations once you've confirmed the intended
  // source of truth. Left out deliberately to avoid corrupting those columns.

  console.log("\nSeed-events complete.")
}

seedEvents().catch((err) => {
  console.error("Seed-events failed:", err)
  process.exit(1)
})
