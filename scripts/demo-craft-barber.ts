/**
 * scripts/demo-craft-barber.ts
 * ---------------------------------------------------------------------------
 * DEV ONLY. An example favpoll for Craft Barber Co, Nantwich: "24 Hours of
 * Haircuts" for Mind on Saturday 6 February 2027 (Brandon and Adam cutting
 * for 24 hours straight, from their Instagram post of 20 October 2026).
 * The founder saw the poster in the shop window on 2026-11-05 and the idea
 * is to be the fifth sponsor with the favpoll on the wall for the 24 hours.
 *
 * The shape, settled in conversation the same day: topic Song, the shop's
 * own playlist as a CLOSED list (guest additions off, so the poll stays a
 * poll and every pick is something they can play), your pick plays while
 * you are in the chair. The enacted ending (the song on top at hour 24
 * plays the last cut out) was dropped the same day: a promise the shop
 * would have to keep at hour 24 for a moment most pledgers would not be
 * there for. The playlist here is twenty from the canon as a stand-in for
 * theirs. The pledges are fictional.
 *
 * Mind (219830) already has an account row on staging; nothing is created
 * for it. The mark and banner are crops of the shop's own poster, for the
 * example only.
 *
 *   cd apps/web
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-craft-barber.ts <mark.png> <banner.jpg>
 *
 * IDEMPOTENT by cause_label + owner. SAFETY: refuses to run against
 * anything but the staging/dev project. Delete when the demo goes.
 * ---------------------------------------------------------------------------
 */

import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

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
const LABEL = "24 Hours of Haircuts"
const CONTEXT = "Saturday 6 February 2027"
const TOPIC_TITLE = "Song"
const CHARITY_NUMBER = "219830"
// Hour 24. The poster gives no start time; 9am to 9am is the example's.
const CLOSES_AT = "2027-02-07T09:00:00.000Z"

// Cause register: an instruction to the reader.
const ABOUT =
  "Brandon and Adam are cutting hair for 24 hours straight for Mind. Pick " +
  "your favourite song from the shop's playlist and give what it's worth. " +
  "If you're in the chair, your pick goes on while you're cut."

// Cause reveal shape: "Our pick to start: …"
const NOTE =
  "Our pick to start: Mr Brightside. Nobody has ever sat through the " +
  "chorus in silence in this chair."

// Twenty from the canon, standing in for the shop's own playlist.
const PLAYLIST = [
  "Mr Brightside — The Killers",
  "Don't Look Back in Anger — Oasis",
  "Wonderwall — Oasis",
  "Bohemian Rhapsody — Queen",
  "Dancing Queen — ABBA",
  "Hey Jude — The Beatles",
  "Let It Be — The Beatles",
  "Stand by Me — Ben E. King",
  "Three Little Birds — Bob Marley",
  "Tiny Dancer — Elton John",
  "Here I Go Again — Whitesnake",
  "The Best — Tina Turner",
  "Waterloo Sunset — The Kinks",
  "Angels — Robbie Williams",
  "Perfect — Ed Sheeran",
  "Somewhere Only We Know — Keane",
  "What a Wonderful World — Louis Armstrong",
  "Imagine — John Lennon",
  "Always Look on the Bright Side of Life — Monty Python",
  "Yesterday — The Beatles",
]

// Fictional customers. First names only, @example.invalid.
const PLEDGES: {
  name: string | null
  amount: number
  pick: string
  message?: string
}[] = [
  {
    name: "Callum",
    amount: 5,
    pick: "Mr Brightside — The Killers",
    message: "Skin fade and the chorus. Standard.",
  },
  {
    name: "Jess",
    amount: 10,
    pick: "Don't Look Back in Anger — Oasis",
    message: "If this isn't the last song at 9am I'm coming back.",
  },
  {
    name: "Dev",
    amount: 3,
    pick: "Three Little Birds — Bob Marley",
    message: "Needed this one today. Cheers lads.",
  },
  { name: null, amount: 20, pick: "Mr Brightside — The Killers" },
  {
    name: "Mark",
    amount: 5,
    pick: "Here I Go Again — Whitesnake",
    message: "Hair like it's 1987, song to match.",
  },
  {
    name: "Sophie",
    amount: 5,
    pick: "Dancing Queen — ABBA",
    message: "Booked the 2am slot for the full experience.",
  },
  {
    name: "Liam",
    amount: 2,
    pick: "Wonderwall — Oasis",
    message: "Somebody had to.",
  },
  {
    name: "Nan Pat",
    amount: 10,
    pick: "What a Wonderful World — Louis Armstrong",
    message: "For my grandson, who talks to Brandon more than he talks to me.",
  },
  {
    name: "Ryan",
    amount: 5,
    pick: "Don't Look Back in Anger — Oasis",
    message: "The 24-hour mark needs a singalong.",
  },
  { name: null, amount: 5, pick: "Stand by Me — Ben E. King" },
  {
    name: "Aaron",
    amount: 15,
    pick: "Don't Look Back in Anger — Oasis",
    message: "Putting my money where the mullet is. Not literally.",
  },
  {
    name: "Chloe",
    amount: 3,
    pick: "Tiny Dancer — Elton John",
    message: "Hold me closer, Adam, but mind the ears.",
  },
  { name: null, amount: 10, pick: "Mr Brightside — The Killers" },
  {
    name: "Tom",
    amount: 5,
    pick: "Bohemian Rhapsody — Queen",
    message: "Six minutes. Enough for a beard trim too.",
  },
]

const [markPath, bannerPath] = process.argv.slice(2)
if (!markPath || !bannerPath) {
  console.error("Usage: demo-craft-barber.ts <mark.png> <banner.jpg>")
  process.exit(1)
}

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

  const { data: charity, error: charityError } = await supabase
    .from("charities")
    .select("id")
    .eq("registered_number", CHARITY_NUMBER)
    .single()
  if (charityError || !charity)
    throw new Error(`Mind is not on this database: ${charityError?.message}`)

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id, favourites ( id, label )")
    .eq("title", TOPIC_TITLE)
    .single()
  if (topicError || !topic) throw new Error(`topic: ${topicError?.message}`)
  const favourites = (
    topic as unknown as { favourites: { id: string; label: string }[] }
  ).favourites
  const byLabel = new Map(favourites.map((f) => [f.label, f.id]))
  for (const label of [...PLAYLIST, ...PLEDGES.map((p) => p.pick)]) {
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
      occasion_type: "Sponsored event",
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
      // The point of the shape: the list is the shop's playlist, closed.
      allow_guest_items: false,
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
      PLAYLIST.map((label) => ({
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
        guest_email: `craft-${i}@example.invalid`,
        total_amount: p.amount,
        display_name: p.name,
        is_anonymous: p.name === null,
        message: p.message ?? null,
        guest_book_display: "pick",
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

  const urls: Record<string, string> = {}
  for (const [key, file, ext, type] of [
    ["photo_url", markPath, "png", "image/png"],
    ["banner_url", bannerPath, "jpg", "image/jpeg"],
  ] as const) {
    const path = `seed/${favpoll.id}-${key}.${ext}`
    const { error } = await supabase.storage
      .from("protagonists")
      .upload(path, readFileSync(file), { contentType: type, upsert: true })
    if (error) console.error(`  ✗ ${key}: ${error.message}`)
    else
      urls[key] = supabase.storage
        .from("protagonists")
        .getPublicUrl(path).data.publicUrl
  }
  await supabase.from("favpolls").update(urls).eq("id", favpoll.id)

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
