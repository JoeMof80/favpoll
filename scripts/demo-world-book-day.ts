/**
 * scripts/demo-world-book-day.ts
 * ---------------------------------------------------------------------------
 * DEV ONLY. One demo favpoll per school the founder can show a PTA chair
 * on a phone: World Book Day at Church Lane (in support of The Friends of
 * Wistaston Church Lane Academy, 1046749) and, since 2026-11-03, its twin
 * at Berkeley (The Friends of Berkeley School, 1110904, the founder's own
 * primary school). Topic Children's book, fourteen fictional pledges so
 * the standings and the guest book read as a week in progress. Owned by
 * the founder's dev user so each appears in his /my-favpolls and he can
 * add a banner or change the photo from the manage page. See
 * references/channel-strategy-2026-10-29.md, the 2026-11-01 Wistaston
 * cluster entry.
 *
 * The charity row is the same shape as the October hall demos: verified
 * and approved so the page renders, with an impact_statement that says
 * DEMO ONLY. Neither charity has agreed anything.
 *
 * Delete this script when the demos go.
 *
 *   cd apps/web
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-world-book-day.ts church-lane
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-world-book-day.ts berkeley
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-world-book-day.ts meadows
 *
 * IDEMPOTENT by cause_label + owner. SAFETY: refuses to run against
 * anything but the staging/dev project.
 * ---------------------------------------------------------------------------
 */

import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import { makePortrait } from "./seed-portrait"

const STAGING_REF = "eotqyintgusvzidymumb"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
if (!SUPABASE_URL.includes(STAGING_REF)) {
  console.error(
    `\n🚫  Dev only.\n    URL: ${SUPABASE_URL}\n    Expected ref: ${STAGING_REF}\n`
  )
  process.exit(1)
}

const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FOUNDER = "user_3DV8OnUNVvsWvF0AnF4D7EiXPWs"
const CONTEXT = "Thursday 5 March 2027"
const TOPIC_TITLE = "Children's book"
const CLOSES_AT = "2027-03-05T15:30:00.000Z"

type School = {
  label: string
  /** Cause register: an instruction to the reader, the favourite
   *  withheld, the outcome named (an enacted favpoll). */
  about: string
  /** Cause reveal shape, per the topic rules: "Our pick to start: …" */
  note: string
  charity: {
    name: string
    registered_number: string
    verified_name: string
    description: string
  }
}

const SCHOOLS: Record<string, School> = {
  // The About is the founder's own wording, written on manage 2026-11-02
  // and copied back here so the script and the row agree. "Read in
  // assembly" and then "the plaque" came before it.
  "church-lane": {
    label: "World Book Day at Church Lane",
    about:
      "Every Church Lane pupil should have a favourite book. Pick yours and " +
      "give what it is worth. All money raised will go to the school library " +
      "and when the poll closes on World Book Day, we'll frame a copy of the " +
      "winner on the wall.",
    note:
      "Our pick to start: The Gruffalo. Twelve years of Reception and they " +
      "still shout the last line.",
    charity: {
      name: "The Friends of Wistaston Church Lane Academy",
      registered_number: "1046749",
      verified_name: "THE FRIENDS OF WISTASTON CHURCH LANE ACADEMY",
      description:
        "The parents' and teachers' association for Church Lane Academy, " +
        "Wistaston. It raises money through the school year for the things " +
        "the budget does not stretch to.",
    },
  },
  // The same About with the school's name swapped. The note is a
  // placeholder for the founder's own pick as a Berkeley pupil, which
  // only he can write.
  berkeley: {
    label: "World Book Day at Berkeley",
    about:
      "Every Berkeley pupil should have a favourite book. Pick yours and " +
      "give what it is worth. All money raised will go to the school library " +
      "and when the poll closes on World Book Day, we'll frame a copy of the " +
      "winner on the wall.",
    note:
      "Our pick to start: Danny the Champion of the World. The pheasants " +
      "and the raisins, every time.",
    charity: {
      name: "The Friends of Berkeley School",
      registered_number: "1110904",
      verified_name: "THE FRIENDS OF BERKELEY SCHOOL",
      description:
        "The parents' and teachers' association for The Berkeley Academy, " +
        "Wistaston. It raises money through the school year for the things " +
        "the budget does not stretch to.",
    },
  },
  // The Meadows, Madeley Heath (Shaw Education Trust) has no registered
  // PTA and an academy trust is an exempt charity, so the recipient is
  // MADELEY SCHOOLS CHARITY, whose objects are special benefits for the
  // parish's schools. The trustees have agreed nothing (2026-11-03).
  meadows: {
    label: "World Book Day at The Meadows",
    about:
      "Every Meadows pupil should have a favourite book. Pick yours and " +
      "give what it is worth. All money raised will go to the school library " +
      "and when the poll closes on World Book Day, we'll frame a copy of the " +
      "winner on the wall.",
    note:
      "Our pick to start: The Gruffalo. Twelve years of Reception and they " +
      "still shout the last line.",
    charity: {
      name: "Madeley Schools Charity",
      registered_number: "1068236",
      verified_name: "MADELEY SCHOOLS CHARITY",
      description:
        "A charity for the schools of Madeley, Staffordshire. It provides " +
        "the special benefits the local authority does not, and helps young " +
        "people of the parish into education and training.",
    },
  },
}

const key = process.argv[2] ?? "church-lane"
const school = SCHOOLS[key]
if (!school) {
  console.error(
    `Unknown school "${key}". One of: ${Object.keys(SCHOOLS).join(", ")}`
  )
  process.exit(1)
}
const { label: LABEL, about: ABOUT, note: NOTE } = school
const CHARITY = {
  ...school.charity,
  impact_statement:
    "DEMO ONLY — this charity has agreed nothing. Remove before any real use.",
  cause_family: "children",
}

const STARTERS = [
  "The Gruffalo",
  "Fantastic Mr Fox",
  "Matilda",
  "The BFG",
  "Where the Wild Things Are",
  "The Tiger Who Came to Tea",
  "Danny the Champion of the World",
  "The Very Hungry Caterpillar",
  "Harry Potter and the Philosopher's Stone",
  "Diary of a Wimpy Kid",
  "Horrid Henry",
]

// Fictional families. First names only, @example.invalid, so nothing here
// can reach a real inbox or be mistaken for a real person.
const PLEDGES: {
  name: string | null
  amount: number
  pick: string
  message?: string
}[] = [
  {
    name: "Hannah",
    amount: 5,
    pick: "The Gruffalo",
    message: "Mouse voice compulsory in our house.",
  },
  {
    name: "Tom",
    amount: 10,
    pick: "Matilda",
    message: "Read it under the covers with a torch, aged eight.",
  },
  {
    name: "Priya",
    amount: 3,
    pick: "The Tiger Who Came to Tea",
    message: "We still check the cupboard for the tiger.",
  },
  { name: null, amount: 20, pick: "The Gruffalo" },
  {
    name: "Grandma Sue",
    amount: 5,
    pick: "The Very Hungry Caterpillar",
    message: "Read to three children and now a grandson.",
  },
  {
    name: "Liam",
    amount: 2,
    pick: "Diary of a Wimpy Kid",
    message: "The only book he will read without being asked.",
  },
  {
    name: "Amy",
    amount: 5,
    pick: "The BFG",
    message: "Whizzpopping. That is all.",
  },
  {
    name: "Dan",
    amount: 10,
    pick: "Matilda",
    message: "Miss Honey was my Year 3 teacher, near enough.",
  },
  {
    name: "Charlotte",
    amount: 5,
    pick: "Where the Wild Things Are",
    message: "Let the wild rumpus start.",
  },
  { name: null, amount: 5, pick: "Danny the Champion of the World" },
  {
    name: "Mo",
    amount: 3,
    pick: "The Gruffalo",
    message:
      "There's no such thing as a Gruffalo, says my daughter, every single night.",
  },
  {
    name: "Becky",
    amount: 15,
    pick: "Harry Potter and the Philosopher's Stone",
    message: "Still waiting for my letter.",
  },
  {
    name: "Jess",
    amount: 2,
    pick: "The Tiger Who Came to Tea",
    message: "Daddy's beer. Every time.",
  },
  { name: null, amount: 10, pick: "The Gruffalo" },
]

async function main() {
  const { data: existing } = await supabase
    .from("favpolls")
    .select("id, short_code, live_slug")
    .eq("cause_label", LABEL)
    .eq("created_by", FOUNDER)
    .maybeSingle()
  if (existing) {
    console.log(`✓  Already exists: /favpolls/${existing.id}`)
    return
  }

  // Charity: find by number, or create the demo row.
  let { data: charity } = await supabase
    .from("charities")
    .select("id")
    .eq("registered_number", CHARITY.registered_number)
    .maybeSingle()
  if (!charity) {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("charities")
      .insert({
        ...CHARITY,
        verified_at: now,
        verification_status: "verified",
        consent_status: "approved",
        consent_decided_at: now,
        is_active: true,
        market: "en-GB",
      })
      .select("id")
      .single()
    if (error || !data) throw new Error(`charity: ${error?.message}`)
    charity = data
    console.log("  + charity row created (DEMO ONLY)")
  }

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id, is_finite, favourites ( id, label )")
    .eq("title", TOPIC_TITLE)
    .single()
  if (topicError || !topic) throw new Error(`topic: ${topicError?.message}`)
  const favourites = (
    topic as unknown as {
      favourites: { id: string; label: string }[]
    }
  ).favourites
  const byLabel = new Map(favourites.map((f) => [f.label, f.id]))
  for (const label of [...STARTERS, ...PLEDGES.map((p) => p.pick)]) {
    if (!byLabel.has(label)) throw new Error(`Not on the list: ${label}`)
  }

  const hardClose = new Date(CLOSES_AT)
  hardClose.setDate(hardClose.getDate() + 90)
  const { data: favpoll, error: favpollError } = await supabase
    .from("favpolls")
    .insert({
      subject: "cause",
      category: "fundraiser",
      grouping: "individual",
      is_plural: false,
      occasion_type: "Fundraiser",
      opening_line: null,
      cause_label: LABEL,
      context: CONTEXT,
      description: ABOUT,
      created_by: FOUNDER,
      closes_at: CLOSES_AT,
      original_closes_at: CLOSES_AT,
      hard_close_at: hardClose.toISOString(),
      extension_count: 0,
      is_private: false,
      is_listed: true,
      allow_guest_items: true,
      show_guest_amounts: false,
      market: "en-GB",
    })
    .select("id, short_code, live_slug")
    .single()
  if (favpollError || !favpoll)
    throw new Error(`favpoll: ${favpollError?.message}`)

  const { error: charityLinkError } = await supabase
    .from("favpoll_charities")
    .insert({
      favpoll_id: favpoll.id,
      charity_id: charity.id,
      display_order: 0,
    })
  if (charityLinkError)
    throw new Error(`favpoll_charities: ${charityLinkError.message}`)

  const { error: potError } = await supabase.from("favpoll_pots").insert({
    favpoll_id: favpoll.id,
    created_by: FOUNDER,
    total_deposited: 0,
    total_allocated: 0,
  })
  if (potError) throw new Error(`pot: ${potError.message}`)

  const { data: poll, error: pollError } = await supabase
    .from("favpoll_polls")
    .insert({ favpoll_id: favpoll.id, topic_id: topic.id, personal_note: NOTE })
    .select("id")
    .single()
  if (pollError || !poll) throw new Error(`poll: ${pollError?.message}`)

  const { error: startersError } = await supabase
    .from("favpoll_poll_favourites")
    .insert(
      STARTERS.map((label) => ({
        favpoll_poll_id: poll.id,
        favourite_id: byLabel.get(label)!,
      }))
    )
  if (startersError) throw new Error(`starters: ${startersError.message}`)

  let written = 0
  for (const [i, p] of PLEDGES.entries()) {
    const { data: pledge, error: pledgeError } = await supabase
      .from("pledges")
      .insert({
        favpoll_poll_id: poll.id,
        guest_token: randomUUID(),
        guest_email: `wbd-${i}@example.invalid`,
        total_amount: p.amount,
        display_name: p.name,
        is_anonymous: p.name === null,
        message: p.message ?? null,
        guest_book_display: "pick",
        // Spread over the past week so the guest book reads as a week.
        created_at: new Date(
          Date.now() - (PLEDGES.length - i) * 11 * 3600000
        ).toISOString(),
      })
      .select("id")
      .single()
    if (pledgeError || !pledge) {
      console.error(`  ✗ pledge ${i}: ${pledgeError?.message}`)
      continue
    }
    const { error: allocError } = await supabase
      .from("pledge_allocations")
      .insert({
        pledge_id: pledge.id,
        favourite_id: byLabel.get(p.pick)!,
        amount: p.amount,
      })
    if (allocError) console.error(`  ✗ allocation ${i}: ${allocError.message}`)
    else written++
  }

  // The same generated portrait the October demos wear, so nothing is
  // claimed about the real school.
  const path = `seed/${favpoll.id}.png`
  const { error: uploadError } = await supabase.storage
    .from("protagonists")
    .upload(path, makePortrait(LABEL, "cause"), {
      contentType: "image/png",
      upsert: true,
    })
  if (uploadError) console.error(`  ✗ portrait: ${uploadError.message}`)
  else {
    const url = supabase.storage.from("protagonists").getPublicUrl(path)
      .data.publicUrl
    await supabase
      .from("favpolls")
      .update({ photo_url: url })
      .eq("id", favpoll.id)
  }

  console.log(
    `✅  ${LABEL}: ${written}/${PLEDGES.length} pledges\n` +
      `    /favpolls/${favpoll.id}\n` +
      `    /p/${favpoll.short_code}\n` +
      `    /live/${favpoll.live_slug}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
