/**
 * scripts/demo-hopes-and-beams.ts
 * ---------------------------------------------------------------------------
 * DEV ONLY. One demo favpoll per Hopes and Beams event (charity 1201764,
 * a CIO on Broad Street, Crewe: disability sport and education for
 * children, dementia-friendly activities for older people). Found by the
 * founder's local-events sweep on 2026-11-08; see the entry of that date
 * in references/channel-strategy-2026-10-29.md. The charity is organiser
 * and recipient in one body, and its objects name dementia, which the
 * channel note calls favpoll's best cause fit.
 *
 * Three of their five listed events take a favourite; the Christmas fair
 * and the bingo do not, so they get nothing:
 *
 *   open-mic   Spoken Word Open Mic Night, Fri 13 Nov 2026     → Poem
 *   choir      Crewe Male Voice Choir Xmas Concert, Mon 14 Dec → Carol, the
 *              leader sung as the encore (the founder's settled ruling)
 *   santa      Breakfast with Santa, Sat 5 Dec 2026            → Christmas
 *              song, the leader opens the room's playlist
 *
 * Fourteen-ish fictional pledges each, first names only, @example.invalid.
 * Owned by the founder's dev user so each appears in his /my-favpolls.
 * The charity row is the same shape as the October hall demos: verified
 * and approved so the page renders, impact_statement DEMO ONLY. Hopes and
 * Beams have agreed nothing and have not been contacted.
 *
 * Delete this script when the demos go.
 *
 *   cd apps/web
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-hopes-and-beams.ts open-mic
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-hopes-and-beams.ts choir
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-hopes-and-beams.ts santa
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

const CHARITY = {
  name: "Hopes and Beams",
  registered_number: "1201764",
  verified_name: "HOPES AND BEAMS",
  description:
    "A Crewe charity for children and young people with physical, learning " +
    "or sensory disabilities, through sport, teaching and recreation, and " +
    "for older people, with activities that reduce loneliness. It runs " +
    "the community restaurant Poppy's on Broad Street.",
  impact_statement:
    "DEMO ONLY — this charity has agreed nothing. Remove before any real use.",
  cause_family: "children",
}

type Pledge = {
  name: string | null
  amount: number
  pick: string
  message?: string
}

type Event = {
  label: string
  context: string
  closesAt: string
  topic: string
  /** Cause register: an instruction to the reader, the favourite
   *  withheld, charity-free. */
  about: string
  /** Cause reveal shape, per the topic rules: "Our pick to start: …" */
  note: string
  /** A closed list (the choir's repertoire, the room's playlist) makes a
   *  closer race; an open one suits a night where people bring their own. */
  allowGuestItems: boolean
  starters: string[]
  pledges: Pledge[]
}

const EVENTS: Record<string, Event> = {
  "open-mic": {
    label: "Spoken Word Open Mic Night",
    context: "Friday 13 November 2026",
    closesAt: "2026-11-13T21:00:00.000Z",
    topic: "Poem",
    about:
      "An evening of poems, short stories and monologues for Hopes and " +
      "Beams. Pick the poem you would most want to hear read aloud and " +
      "give what it is worth.",
    note:
      "Our pick to start: The Owl and the Pussy-Cat. The runcible spoon " +
      "still gets a laugh.",
    allowGuestItems: true,
    starters: [
      "The Owl and the Pussy-Cat",
      "Jabberwocky",
      "If—",
      "Daffodils",
      "Warning",
      "Do Not Go Gentle into That Good Night",
      "The Highwayman",
      "Sea Fever",
      "Still I Rise",
      "Leisure",
      "Invictus",
      "Adlestrop",
    ],
    pledges: [
      {
        name: "Sophie",
        amount: 5,
        pick: "Warning",
        message: "Purple, with a red hat that doesn't go.",
      },
      {
        name: "Ray",
        amount: 10,
        pick: "If—",
        message: "On my dad's wall, and now on mine.",
      },
      {
        name: "Nadia",
        amount: 3,
        pick: "Jabberwocky",
        message: "The only poem my son asks for twice.",
      },
      { name: null, amount: 20, pick: "The Owl and the Pussy-Cat" },
      {
        name: "Carol",
        amount: 5,
        pick: "Daffodils",
        message: "Learned it at Edleston Road and never lost it.",
      },
      {
        name: "Josh",
        amount: 2,
        pick: "Invictus",
        message: "Read it before every exam. Still passed some.",
      },
      {
        name: "Beth",
        amount: 5,
        pick: "The Highwayman",
        message: "The moon was a ghostly galleon. Shivers, every time.",
      },
      {
        name: "Mike",
        amount: 10,
        pick: "Sea Fever",
        message: "A tall ship and a star. Say no more.",
      },
      { name: null, amount: 5, pick: "Still I Rise" },
      {
        name: "Anita",
        amount: 3,
        pick: "Leisure",
        message: "No time to stand and stare. Guilty.",
      },
      {
        name: "Dev",
        amount: 15,
        pick: "Do Not Go Gentle into That Good Night",
        message: "For my grandad, who did not.",
      },
      { name: null, amount: 10, pick: "The Owl and the Pussy-Cat" },
    ],
  },
  choir: {
    label: "Crewe Male Voice Choir Christmas Concert",
    context: "Monday 14 December 2026",
    closesAt: "2026-12-14T20:30:00.000Z",
    topic: "Carol",
    about:
      "Crewe Male Voice Choir sing for Hopes and Beams. Pick the carol " +
      "you most want to hear and give what it is worth. When the poll " +
      "closes at the interval, the choir sing the leader as the encore.",
    note:
      "Our pick to start: In the Bleak Midwinter. The quiet one that " +
      "empties the room of talk.",
    allowGuestItems: false,
    starters: [
      "In the Bleak Midwinter",
      "O Holy Night",
      "Silent Night",
      "Hark! The Herald Angels Sing",
      "O Come All Ye Faithful",
      "Once in Royal David's City",
      "The First Noel",
      "Ding Dong Merrily on High",
      "God Rest Ye Merry Gentlemen",
      "Good King Wenceslas",
      "O Little Town of Bethlehem",
      "We Three Kings",
    ],
    pledges: [
      {
        name: "Margaret",
        amount: 10,
        pick: "O Holy Night",
        message: "If the tenor holds the top note I will cry. Again.",
      },
      {
        name: "Steve",
        amount: 5,
        pick: "Hark! The Herald Angels Sing",
        message: "The descant. Always the descant.",
      },
      {
        name: "Lynne",
        amount: 5,
        pick: "In the Bleak Midwinter",
        message: "Snow on snow on snow.",
      },
      { name: null, amount: 20, pick: "Silent Night" },
      {
        name: "Pete",
        amount: 3,
        pick: "Good King Wenceslas",
        message: "I was the page, aged nine. Froze.",
      },
      {
        name: "Jan",
        amount: 10,
        pick: "Once in Royal David's City",
        message: "One boy, one verse, the whole hall holding its breath.",
      },
      {
        name: "Tony",
        amount: 2,
        pick: "Ding Dong Merrily on High",
        message: "Glo-o-o-o-o-ria. Lungs permitting.",
      },
      {
        name: "Helen",
        amount: 5,
        pick: "O Come All Ye Faithful",
        message: "Dad's carol. He sang it louder than the choir.",
      },
      { name: null, amount: 5, pick: "O Holy Night" },
      {
        name: "Graham",
        amount: 15,
        pick: "In the Bleak Midwinter",
        message: "Harold Darke's setting, if the choir are asking.",
      },
      {
        name: "Sue",
        amount: 5,
        pick: "The First Noel",
        message: "First one I learned, last one I'll forget.",
      },
      { name: null, amount: 10, pick: "Silent Night" },
      {
        name: "Rob",
        amount: 3,
        pick: "We Three Kings",
        message: "Star of wonder, star of night. Big finish.",
      },
    ],
  },
  santa: {
    label: "Breakfast with Santa",
    context: "Saturday 5 December 2026",
    closesAt: "2026-12-05T09:00:00.000Z",
    topic: "Christmas song",
    about:
      "Breakfast with Santa at Hopes and Beams. Pick the Christmas song " +
      "the room should hear first and give what it is worth. The leader " +
      "opens the playlist on the morning.",
    note:
      "Our pick to start: Walking in the Air. The one everybody hums and " +
      "nobody can sing.",
    allowGuestItems: false,
    starters: [
      "Walking in the Air",
      "All I Want for Christmas Is You",
      "Fairytale of New York",
      "Last Christmas",
      "Merry Xmas Everybody",
      "I Wish It Could Be Christmas Everyday",
      "Rockin' Around the Christmas Tree",
      "Jingle Bell Rock",
      "Driving Home for Christmas",
      "Santa Claus Is Comin' to Town",
      "Rudolph the Red-Nosed Reindeer",
      "Frosty the Snowman",
      "White Christmas",
      "Step into Christmas",
    ],
    pledges: [
      {
        name: "Kelly",
        amount: 5,
        pick: "Rudolph the Red-Nosed Reindeer",
        message: "Like a lightbulb! Shouted, not sung, by a four-year-old.",
      },
      {
        name: "Darren",
        amount: 10,
        pick: "Fairytale of New York",
        message: "Before the kids are up, obviously.",
      },
      {
        name: "Jo",
        amount: 3,
        pick: "Walking in the Air",
        message: "She watches the window the whole way through.",
      },
      { name: null, amount: 20, pick: "Merry Xmas Everybody" },
      {
        name: "Aisha",
        amount: 5,
        pick: "All I Want for Christmas Is You",
        message: "Car karaoke champion, three years running.",
      },
      {
        name: "Grandad Ken",
        amount: 10,
        pick: "White Christmas",
        message: "Bing. There is no other version.",
      },
      {
        name: "Sam",
        amount: 2,
        pick: "Santa Claus Is Comin' to Town",
        message: "He knows when you are sleeping. Useful, December.",
      },
      {
        name: "Chloe",
        amount: 5,
        pick: "Last Christmas",
        message: "Lost Whamageddon on the 2nd. Worth it.",
      },
      { name: null, amount: 5, pick: "Driving Home for Christmas" },
      {
        name: "Ben",
        amount: 5,
        pick: "I Wish It Could Be Christmas Everyday",
        message: "The school bell at the end. Every time.",
      },
      {
        name: "Emma",
        amount: 15,
        pick: "Walking in the Air",
        message: "Our lad signs along to it. Whole room watches him.",
      },
      { name: null, amount: 10, pick: "Jingle Bell Rock" },
    ],
  },
}

const key = process.argv[2] ?? ""
const event = EVENTS[key]
if (!event) {
  console.error(
    `Unknown event "${key}". One of: ${Object.keys(EVENTS).join(", ")}`
  )
  process.exit(1)
}

async function main() {
  const { data: existing } = await supabase
    .from("favpolls")
    .select("id, short_code, live_slug")
    .eq("cause_label", event.label)
    .eq("created_by", FOUNDER)
    .maybeSingle()
  if (existing) {
    console.log(`✓  Already exists: /favpolls/${existing.id}`)
    return
  }

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
    .eq("title", event.topic)
    .single()
  if (topicError || !topic) throw new Error(`topic: ${topicError?.message}`)
  const favourites = (
    topic as unknown as { favourites: { id: string; label: string }[] }
  ).favourites
  const byLabel = new Map(favourites.map((f) => [f.label, f.id]))
  for (const label of [
    ...event.starters,
    ...event.pledges.map((p) => p.pick),
  ]) {
    if (!byLabel.has(label)) throw new Error(`Not on the list: ${label}`)
  }

  const hardClose = new Date(event.closesAt)
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
      cause_label: event.label,
      context: event.context,
      description: event.about,
      created_by: FOUNDER,
      closes_at: event.closesAt,
      original_closes_at: event.closesAt,
      hard_close_at: hardClose.toISOString(),
      extension_count: 0,
      is_private: false,
      is_listed: true,
      allow_guest_items: event.allowGuestItems,
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
    .insert({
      favpoll_id: favpoll.id,
      topic_id: topic.id,
      personal_note: event.note,
    })
    .select("id")
    .single()
  if (pollError || !poll) throw new Error(`poll: ${pollError?.message}`)

  const { error: startersError } = await supabase
    .from("favpoll_poll_favourites")
    .insert(
      event.starters.map((label) => ({
        favpoll_poll_id: poll.id,
        favourite_id: byLabel.get(label)!,
      }))
    )
  if (startersError) throw new Error(`starters: ${startersError.message}`)

  let written = 0
  for (const [i, p] of event.pledges.entries()) {
    const { data: pledge, error: pledgeError } = await supabase
      .from("pledges")
      .insert({
        favpoll_poll_id: poll.id,
        guest_token: randomUUID(),
        guest_email: `hb-${key}-${i}@example.invalid`,
        total_amount: p.amount,
        display_name: p.name,
        is_anonymous: p.name === null,
        message: p.message ?? null,
        guest_book_display: "pick",
        created_at: new Date(
          Date.now() - (event.pledges.length - i) * 11 * 3600000
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

  // The generated portrait the other demos wear, so nothing is claimed
  // about the real charity's look. The founder can swap it on manage.
  const path = `seed/${favpoll.id}.png`
  const { error: uploadError } = await supabase.storage
    .from("protagonists")
    .upload(path, makePortrait(event.label, "cause"), {
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
    `✅  ${event.label}: ${written}/${event.pledges.length} pledges\n` +
      `    /favpolls/${favpoll.id}\n` +
      `    /p/${favpoll.short_code}\n` +
      `    /live/${favpoll.live_slug}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
