/**
 * Scale seed — thousands of synthetic favpolls for launch-scale testing.
 *
 *   pnpm seed:scale                 # seed (default 1,500 favpolls + 3 whales)
 *   pnpm seed:scale -- --favpolls=500
 *   pnpm seed:scale -- --wipe       # remove everything this script created
 *
 * Everything is tagged with created_by = "user_seedscale" so --wipe can
 * find it; the seed user row has NO email, so the close cron can never
 * send mail for seeded favpolls. Pledges are guest-style with
 * @example.com addresses and NULL payment_intent_id (they predate no
 * Stripe event, so the reconcile cron ignores them).
 *
 * The three "whales" (1,500 / 2,600 / 5,200 pledges on one poll) exist to
 * prove the fetchAllRows pagination (#311) end to end: every money figure
 * on their surfaces must equal the full inserted sum, not the first
 * 1,000 rows' worth. Their URLs are printed at the end.
 *
 * Distribution is deterministic for a given --seed (default 1): re-running
 * without --wipe adds a second, identically-shaped cohort.
 */
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEED_USER = "user_seedscale"

// ── args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const WIPE = args.includes("--wipe")
const num = (flag: string, dflt: number) => {
  const a = args.find((x) => x.startsWith(`--${flag}=`))
  return a ? parseInt(a.split("=")[1], 10) : dflt
}
const N_FAVPOLLS = num("favpolls", 1500)
const RNG_SEED = num("seed", 1)

// ── deterministic rng ─────────────────────────────────────────────────────
function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(RNG_SEED)
const pick = <T>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)]
const chance = (p: number) => rnd() < p
const between = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))

// ── pools ─────────────────────────────────────────────────────────────────
const FIRST = [
  "Margaret",
  "David",
  "Sarah",
  "James",
  "Emma",
  "Tom",
  "Belinda",
  "George",
  "Alice",
  "Harry",
  "Grace",
  "Arthur",
  "Florence",
  "Oliver",
  "Ivy",
  "Jack",
  "Elsie",
  "Charlie",
  "Edith",
  "Fred",
  "Nora",
  "Stanley",
  "Mabel",
  "Ron",
  "Vera",
  "Ken",
  "Doris",
  "Bill",
  "Joan",
  "Peter",
  "Sheila",
  "Brian",
  "Pam",
  "Colin",
  "Janet",
  "Derek",
  "Carol",
  "Roy",
  "Linda",
  "Alan",
  "Susan",
  "Keith",
  "Wendy",
  "Barry",
  "Ann",
  "Nigel",
  "Julie",
  "Trevor",
  "Karen",
  "Clive",
]
const LAST = [
  "Whitmore",
  "Ashworth",
  "Pemberton",
  "Caldwell",
  "Hargreaves",
  "Ellison",
  "Braithwaite",
  "Foxton",
  "Merriweather",
  "Oakes",
  "Sutcliffe",
  "Winterbourne",
  "Aldridge",
  "Bexley",
  "Cranfield",
  "Dunmore",
  "Everly",
  "Farrow",
  "Goodwin",
  "Holloway",
  "Ingram",
  "Jessop",
  "Kirkby",
  "Lockwood",
  "Mansfield",
  "Norwood",
  "Ormsby",
  "Prescott",
  "Quinnell",
  "Radcliffe",
  "Stanhope",
  "Thornbury",
  "Underhill",
  "Vickers",
  "Wainwright",
  "Yardley",
]
const CAUSES = [
  "Clean water for every village",
  "A hospice bed for every family",
  "Books for every classroom",
  "Warm homes this winter",
  "Guide dogs for the newly blind",
  "Meals for rough sleepers",
  "Air ambulance night flights",
  "Rewilding the river valley",
]
// About text is MANDATORY in the product (the wizard requires it) — seeded
// favpolls must carry one so surfaces can assume it. Withholds the answer,
// teases the topic, per the About bar.
const ABOUTS: Record<string, string[]> = {
  memorial: [
    "A life remembered in the small things — add your favourite and help the total grow in their name.",
    "Friends and family, near and far: share a favourite, make a pledge, and keep a good name doing good.",
    "In their memory, for causes they'd have backed without hesitation. Every pledge tells them we remember.",
  ],
  celebration: [
    "A milestone worth marking properly — pick a favourite, pledge what it's worth, and sign the day.",
    "Everyone's invited, nobody needs an account. Pledge, pick your favourite, and see where it stands.",
    "One day, one poll, one total that says how loved they are. Join in before it closes.",
  ],
  fundraiser: [
    "Every pledge pushes the total on — pick your favourite and back it with what it's worth to you.",
    "A challenge, a total, and a poll to argue over. Pledge to take part and reveal the standings.",
    "The miles are theirs; the total is ours. Add a favourite and a pledge before the finish line.",
  ],
  cause: [
    "No occasion needed — just a cause worth backing and a question worth answering. Pledge to take part.",
    "Pick the favourite you'd stand behind and pledge its worth. Every penny reaches the charity.",
    "A standing question for a standing cause. Your favourite, your pledge, their gain.",
  ],
}

// The PERSON hero renders protagonists.about ("Tell their story") — a
// different field from favpolls.description (the cause hero's About).
// Withholds the favourite, teases the person.
const PERSON_ABOUTS: Record<string, string[]> = {
  memorial: [
    "There was one answer everyone knew was coming, and nobody ever tired of hearing it.",
    "A quiet life, firmly held opinions, and one favourite that explained the rest.",
    "Ask anyone who knew them — the stories all end up in the same place.",
  ],
  celebration: [
    "Opinionated in the best way, and never more so than on today's question.",
    "There are things everyone knows about them, and one thing worth pledging to find out.",
    "The answer will surprise nobody who knows them — and delight everyone who doesn't.",
  ],
  fundraiser: [
    "Training done, number pinned on, and one favourite carrying them through the miles.",
    "They said they'd never do it. They're doing it. Back them and find out what keeps them going.",
    "Every step for the cause — and one favourite that never leaves their head en route.",
  ],
}

const OPENERS = [
  "A life full of small joys",
  "Everyone welcome, bring a story",
  "In loving memory",
  "One last lap of honour",
  "Raising a glass and a total",
  "For the one who taught us all",
  "Every pledge tells a story",
  "Together for something good",
]
const OCCASIONS: Record<string, string[]> = {
  memorial: ["Memorial", "Tribute"],
  celebration: [
    "Birthday",
    "Retirement",
    "Wedding",
    "Anniversary",
    "Graduation",
    "Leaving do",
  ],
  fundraiser: ["Fundraiser"],
}

// ── helpers ───────────────────────────────────────────────────────────────
function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n))
  return out
}

async function insertAll(
  table: string,
  rows: Record<string, unknown>[],
  batch = 500
) {
  for (const [i, c] of chunk(rows, batch).entries()) {
    const { error } = await supabase.from(table).insert(c)
    if (error) throw new Error(`${table} batch ${i}: ${error.message}`)
  }
  console.log(`  ${table}: ${rows.length} rows`)
}

async function fetchAllIds(
  table: string,
  filterCol: string,
  filterVals: string[] | null,
  col = "id"
): Promise<string[]> {
  const ids: string[] = []
  const valChunks = filterVals ? chunk(filterVals, 100) : [null]
  for (const vals of valChunks) {
    for (let from = 0; ; from += 1000) {
      let q = supabase
        .from(table)
        .select(col)
        .range(from, from + 999)
      if (vals) q = q.in(filterCol, vals)
      else q = q.eq(filterCol, SEED_USER)
      const { data, error } = await q
      if (error) throw new Error(`${table} fetch: ${error.message}`)
      const page = (data ?? []) as unknown as Record<string, string>[]
      ids.push(...page.map((r) => r[col]))
      if (page.length < 1000) break
    }
  }
  return ids
}

async function deleteIn(table: string, col: string, ids: string[]) {
  for (const c of chunk(ids, 100)) {
    const { error } = await supabase.from(table).delete().in(col, c)
    if (error) throw new Error(`${table} delete: ${error.message}`)
  }
  console.log(`  ${table}: deleted for ${ids.length} ${col}s`)
}

// ── wipe ──────────────────────────────────────────────────────────────────
async function wipe() {
  console.log("Wiping scale seed…")
  const favpollIds = await fetchAllIds("favpolls", "created_by", null)
  if (favpollIds.length === 0) {
    console.log("Nothing to wipe.")
    return
  }
  const pollIds = await fetchAllIds("favpoll_polls", "favpoll_id", favpollIds)
  const potIds = await fetchAllIds("favpoll_pots", "favpoll_id", favpollIds)
  const pledgeIds = await fetchAllIds("pledges", "favpoll_poll_id", pollIds)
  const protagonistIds = await fetchAllIds(
    "favpolls",
    "created_by",
    null,
    "protagonist_id"
  )

  await deleteIn("pledge_allocations", "pledge_id", pledgeIds)
  await deleteIn("pledges", "favpoll_poll_id", pollIds)
  await deleteIn("favpoll_poll_favourites", "favpoll_poll_id", pollIds)
  await deleteIn("disbursements", "favpoll_id", favpollIds)
  await deleteIn("pot_allocations", "pot_id", potIds)
  await deleteIn("pot_topups", "pot_id", potIds)
  await deleteIn("favpoll_polls", "favpoll_id", favpollIds)
  await deleteIn("favpoll_pots", "favpoll_id", favpollIds)
  await deleteIn("favpoll_charities", "favpoll_id", favpollIds)
  await deleteIn("favpolls", "id", favpollIds)
  await deleteIn("protagonists", "id", protagonistIds.filter(Boolean))
  await supabase.from("users").delete().eq("id", SEED_USER)
  console.log(`Wiped ${favpollIds.length} favpolls and everything under them.`)
}

// ── seed ──────────────────────────────────────────────────────────────────
type TopicRow = {
  id: string
  title: string
  is_finite: boolean
  is_active: boolean
  favourites: { id: string; label: string }[]
}

async function seed() {
  console.log(
    `Seeding ${N_FAVPOLLS} favpolls + 3 whales (rng seed ${RNG_SEED})…`
  )

  const { data: topicsData, error: tErr } = await supabase
    .from("topics")
    .select("id, title, is_finite, is_active, favourites(id, label)")
  if (tErr) throw new Error(tErr.message)
  const topics = ((topicsData ?? []) as TopicRow[]).filter(
    (t) => t.is_active && t.favourites.length >= 5
  )
  const { data: charitiesData, error: cErr } = await supabase
    .from("charities")
    .select("id")
    .eq("is_active", true)
  if (cErr) throw new Error(cErr.message)
  const charityIds = (charitiesData ?? []).map((c) => c.id)
  if (topics.length === 0 || charityIds.length === 0)
    throw new Error("Need active topics and charities — run pnpm seed first.")

  // The organiser row every favpoll hangs off. NO email — the close cron
  // emails organiser.email, so seeded closes can never send mail.
  await supabase
    .from("users")
    .upsert({ id: SEED_USER, display_name: "Scale Seed" })

  const now = Date.now()
  const DAY = 86_400_000
  const iso = (t: number) => new Date(t).toISOString()

  type Plan = { pledges: number; open: boolean; whale?: boolean }
  const plans: Plan[] = []
  for (let i = 0; i < N_FAVPOLLS; i++) {
    const r = rnd()
    const pledges =
      r < 0.25
        ? between(0, 3)
        : r < 0.65
          ? between(4, 15)
          : r < 0.9
            ? between(16, 60)
            : between(61, 300)
    plans.push({ pledges, open: chance(0.65) })
  }
  // The pagination provers. One open (live surfaces), two closed
  // (settlement, keepsake, rank history — all read the full row set).
  plans.push({ pledges: 1500, open: true, whale: true })
  plans.push({ pledges: 2600, open: false, whale: true })
  plans.push({ pledges: 5200, open: false, whale: true })

  const protagonists: Record<string, unknown>[] = []
  const favpolls: Record<string, unknown>[] = []
  const favpollCharities: Record<string, unknown>[] = []
  const polls: Record<string, unknown>[] = []
  const epfRows: Record<string, unknown>[] = []
  const pots: Record<string, unknown>[] = []
  const pledges: Record<string, unknown>[] = []
  const allocations: Record<string, unknown>[] = []
  const whaleUrls: string[] = []
  let guestSeq = 0

  for (const plan of plans) {
    const isCause = !plan.whale && chance(0.15)
    const category = isCause
      ? null
      : (pick([
          "memorial",
          "celebration",
          "celebration",
          "fundraiser",
        ]) as string)
    const grouping = chance(0.85)
      ? "individual"
      : chance(0.7)
        ? "couple"
        : "group"

    const favpollId = randomUUID()
    let protagonistId: string | null = null
    const name = `${pick(FIRST)} ${pick(LAST)}`
    if (!isCause) {
      protagonistId = randomUUID()
      protagonists.push({
        id: protagonistId,
        name: grouping === "couple" ? `${pick(FIRST)} & ${name}` : name,
        about: pick(
          PERSON_ABOUTS[category ?? "celebration"] ?? PERSON_ABOUTS.celebration
        ),
        context:
          category === "memorial"
            ? `${1930 + between(0, 60)} – ${2024 + between(0, 2)}`
            : null,
        created_by: SEED_USER,
      })
    }

    // Timeline: closed favpolls closed 1–120 days ago; open ones close
    // 30–85 days out (long runway — wipe before they start closing).
    const closedAgo = between(1, 120) * DAY
    const closesAt = plan.open ? now + between(30, 85) * DAY : now - closedAgo
    const createdAt = plan.open
      ? now - between(2, 30) * DAY
      : closesAt - between(14, 60) * DAY

    favpolls.push({
      id: favpollId,
      protagonist_id: protagonistId,
      subject: isCause ? "cause" : "someone",
      cause_label: isCause ? pick(CAUSES) : null,
      category,
      occasion_type: category ? pick(OCCASIONS[category]) : null,
      grouping,
      is_plural: grouping !== "individual",
      opening_line: pick(OPENERS),
      created_by: SEED_USER,
      created_at: iso(createdAt),
      closes_at: iso(closesAt),
      original_closes_at: iso(closesAt),
      hard_close_at: iso(closesAt + 90 * DAY),
      extension_count: 0,
      closed_at: plan.open ? null : iso(closesAt),
      is_private: false,
      is_listed: true,
      description: pick(ABOUTS[category ?? "cause"] ?? ABOUTS.cause),
      goal_amount: chance(0.3) ? pick([100, 250, 500, 1000]) : null,
      total_raised: 0, // settlement figure — patched below for closed polls
    })

    const nCharities = chance(0.7) ? 1 : chance(0.7) ? 2 : 3
    const shuffled = [...charityIds]
      .sort(() => rnd() - 0.5)
      .slice(0, nCharities)
    shuffled.forEach((charityId, i) =>
      favpollCharities.push({
        favpoll_id: favpollId,
        charity_id: charityId,
        display_order: i,
      })
    )

    const topic = pick(topics)
    const pollId = randomUUID()
    // Item set: finite topics use the whole closed set; infinite ones get
    // a curated epf subset (the item-source rule, lib/poll-items).
    let items = topic.favourites
    if (!topic.is_finite) {
      items = [...topic.favourites]
        .sort(() => rnd() - 0.5)
        .slice(0, Math.min(between(8, 18), topic.favourites.length))
      items.forEach((f) =>
        epfRows.push({
          favpoll_poll_id: pollId,
          favourite_id: f.id,
          is_guest_added: false,
          is_hidden: false,
          added_by: SEED_USER,
        })
      )
    }
    polls.push({
      id: pollId,
      favpoll_id: favpollId,
      topic_id: topic.id,
      personal_reveal: chance(0.35)
        ? `Theirs was ${pick(items).label}. Never any doubt.`
        : null,
      created_at: iso(createdAt),
    })

    pots.push({
      favpoll_id: favpollId,
      created_by: SEED_USER,
      total_deposited: chance(0.1) ? pick([10, 20, 50]) : 0,
    })

    // Pledges: guest-style, spread across the favpoll's open window.
    const windowEnd = Math.min(now, closesAt)
    let raised = 0
    for (let p = 0; p < plan.pledges; p++) {
      const pledgeId = randomUUID()
      const amount = pick([
        2,
        5,
        5,
        10,
        10,
        10,
        20,
        20,
        50,
        chance(0.5) ? 100 : 25,
      ])
      raised += amount
      const anonymous = chance(0.2)
      pledges.push({
        id: pledgeId,
        favpoll_poll_id: pollId,
        clerk_user_id: null,
        guest_email: `seedscale+${guestSeq++}@example.com`,
        guest_token: randomUUID(),
        pot_allocation_id: null,
        total_amount: amount,
        fee: 0,
        tip_amount: chance(0.25) ? pick([0.5, 1, 2]) : 0,
        display_name: anonymous ? null : pick(FIRST),
        is_anonymous: anonymous,
        payment_intent_id: null,
        created_at: iso(createdAt + rnd() * Math.max(1, windowEnd - createdAt)),
      })
      // 1–3 favourites, even split, remainder to the first (mirrors
      // lib/pledge-allocations).
      const nAlloc = chance(0.75) ? 1 : chance(0.8) ? 2 : 3
      const chosen = [...items].sort(() => rnd() - 0.5).slice(0, nAlloc)
      const share = Math.floor((amount / nAlloc) * 100) / 100
      chosen.forEach((f, i) =>
        allocations.push({
          pledge_id: pledgeId,
          favourite_id: f.id,
          amount:
            i === 0
              ? Math.round((amount - share * (nAlloc - 1)) * 100) / 100
              : share,
        })
      )
    }
    // Settlement figure only exists once closed (money/standings model).
    if (!plan.open)
      (favpolls[favpolls.length - 1] as { total_raised: number }).total_raised =
        raised
    if (plan.whale) {
      whaleUrls.push(
        `/favpolls/${favpollId}  (${plan.pledges} pledges, £${raised.toFixed(2)}, ${plan.open ? "open" : "closed"}, topic: ${topic.title})`
      )
    }
  }

  await insertAll("protagonists", protagonists)
  await insertAll("favpolls", favpolls)
  await insertAll("favpoll_charities", favpollCharities)
  await insertAll("favpoll_polls", polls)
  await insertAll("favpoll_poll_favourites", epfRows, 1000)
  await insertAll("favpoll_pots", pots)
  await insertAll("pledges", pledges, 1000)
  await insertAll("pledge_allocations", allocations, 1000)

  console.log("\nWhales (pagination provers — totals must equal the full sum):")
  for (const w of whaleUrls) console.log(`  ${w}`)
  console.log(
    `\nDone: ${favpolls.length} favpolls, ${pledges.length} pledges, ${allocations.length} allocations.`
  )
  console.log("Tear down with: pnpm seed:scale -- --wipe")
}

;(WIPE ? wipe() : seed()).catch((e) => {
  console.error(e)
  process.exit(1)
})
