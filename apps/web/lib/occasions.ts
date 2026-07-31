import type { Register } from "@/lib/registers"

/**
 * Occasion catalogue for the Generate control (2026-07-30).
 *
 * The occasion is an EPHEMERAL generation input, not a favpoll property:
 * picking one targets the deterministic fields — the opening line and the
 * context subline — which get stamped into the form and saved as ordinary
 * editable values. The about and reveal stay register-level so the
 * generated_drafts cache (keyed by register + topic + charity) keeps
 * seeding without fragmenting across occasions.
 *
 * Each occasion carries SEVERAL variants per field so repeated generate
 * taps feel fresh (matching the about/reveal behaviour). Variant counts
 * are honest — an occasion with only two good opening lines has two, not
 * a padded third.
 *
 * openingLines: hero headline prefixes — rendered as "PREFIX" above the
 * name, so each must read naturally with a name after it.
 * contexts: subline examples (max 40 chars, no full stop) — a date,
 * fact, or event detail. Never a fee promise, an instruction to guests,
 * or bare sentiment: those collide with the about (which owns the
 * "reaches the charity in full" clause) or aren't context at all
 * (founder, 2026-07-30: "Every pledge goes in full" is not context).
 */
/**
 * A context variant is either pronoun-neutral (a plain string) or a
 * per-pronoun record — for lines whose words are gendered ("Husband,
 * father, grandad"; founder-caught on a She memorial, 2026-07-31).
 */
export type OccasionContext = string | { he: string; she: string; they: string }

export type OccasionSpec = {
  /** UI label in the occasion picker. */
  label: string
  register: Register
  /**
   * celebrating_many only — narrows the list by the selected who icon.
   * "pair" shows for Pair, "group" for Group; untagged shows for both.
   */
  grouping?: "pair" | "group"
  openingLines: string[]
  contexts: OccasionContext[]
}

export const OCCASIONS: OccasionSpec[] = [
  // ── Remembering ──────────────────────────────────────────────────────
  {
    label: "Celebration of life",
    register: "remembering",
    openingLines: [
      "Celebrating the life of",
      "In loving memory of",
      "Remembering",
    ],
    contexts: ["1943 – 2026", "A life in full", "Eighty good years"],
  },
  {
    label: "Memorial",
    register: "remembering",
    openingLines: ["In memory of", "In loving memory of", "Remembering"],
    contexts: [
      "1940 – 2024",
      {
        he: "Husband, father, grandad",
        she: "Wife, mother, nan",
        they: "Partner, parent, friend",
      },
      "Always with us",
    ],
  },
  {
    label: "Wake",
    register: "remembering",
    openingLines: ["In loving memory of", "Remembering", "Raising a glass to"],
    contexts: ["1938 – 2026", "Raise a glass to a good life"],
  },
  {
    label: "Remembrance",
    register: "remembering",
    openingLines: ["In remembrance of", "Remembering", "In memory of"],
    contexts: ["Not forgotten", "Ten years on"],
  },
  {
    label: "Tribute",
    register: "remembering",
    openingLines: ["A tribute to", "In tribute to", "Honouring the memory of"],
    contexts: ["Born 1962", "One of a kind"],
  },
  {
    label: "First anniversary",
    register: "remembering",
    openingLines: ["Remembering", "In loving memory of"],
    contexts: ["One year on", "One year on · 14th March"],
  },
  {
    label: "Anniversary of a loss",
    register: "remembering",
    openingLines: ["Remembering", "In memory of"],
    contexts: ["Five years on", "Ten years on this June"],
  },
  {
    label: "A birthday remembered",
    register: "remembering",
    openingLines: ["Remembering", "In loving memory of"],
    contexts: ["Would have been 80 today", "Born this day, 1946"],
  },
  {
    label: "Stone setting",
    register: "remembering",
    openingLines: ["In loving memory of", "In memory of"],
    contexts: ["Stone setting · 12th April", "Unveiled this spring"],
  },
  {
    label: "Ash scattering",
    register: "remembering",
    openingLines: ["Remembering", "In loving memory of"],
    contexts: ["At rest by the sea", "Home to the hills"],
  },
  {
    label: "Bench or tree dedication",
    register: "remembering",
    openingLines: ["Dedicated to", "In memory of"],
    contexts: ["The best seat in the park", "A tree for every season"],
  },
  {
    label: "Month's mind",
    register: "remembering",
    openingLines: ["In memory of", "Remembering"],
    contexts: ["A month on", "Month's mind · 3rd May"],
  },
  {
    label: "Pet memorial",
    register: "remembering",
    openingLines: ["Remembering", "In memory of"],
    contexts: ["Fourteen good years", "The best boy"],
  },

  // ── Celebrating one person ───────────────────────────────────────────
  {
    label: "Birthday",
    register: "celebrating_one",
    openingLines: ["Happy birthday", "Many happy returns", "Celebrating"],
    contexts: ["Born 15th March 1990", "Another lap of the sun"],
  },
  {
    label: "Milestone birthday",
    register: "celebrating_one",
    openingLines: ["Happy birthday", "A big birthday for", "Celebrating"],
    contexts: ["Turning 40", "The big 5-0", "90 years young"],
  },
  {
    label: "First birthday",
    register: "celebrating_one",
    openingLines: ["Happy first birthday", "One today —", "Celebrating"],
    contexts: ["One today", "Born 30th July 2025"],
  },
  {
    label: "Retirement",
    register: "celebrating_one",
    openingLines: [
      "Celebrating the retirement of",
      "Happy retirement",
      "Cheers to the retirement of",
    ],
    contexts: [
      "Joined 1989 · Retiring 2026",
      "37 years of service",
      "The alarm clock is off",
    ],
  },
  {
    label: "Leaving do",
    register: "celebrating_one",
    openingLines: ["Farewell", "A send-off for", "Good luck"],
    contexts: ["Joined March 2019", "Last day · 29th August"],
  },
  {
    label: "New job",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Onwards and upwards for"],
    contexts: ["Starting 1st September", "A big new chapter"],
  },
  {
    label: "Promotion",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Well earned,"],
    contexts: ["Starting 1st February", "New title, same trouble"],
  },
  {
    label: "Work anniversary",
    register: "celebrating_one",
    openingLines: ["Celebrating", "25 years of"],
    contexts: ["Since 2001", "25 years and counting"],
  },
  {
    label: "Graduation",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Hats off to", "Celebrating"],
    contexts: ["Class of 2026", "First in the family"],
  },
  {
    label: "Exam success",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Top marks for", "Well done"],
    contexts: ["Results day · August 2026", "All that revision paid off"],
  },
  {
    label: "Doctorate",
    register: "celebrating_one",
    openingLines: ["Introducing Dr", "Congratulations to", "Hats off to"],
    contexts: ["Doctor at last", "Seven years in the making"],
  },
  {
    label: "Driving test",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Celebrating"],
    contexts: ["Passed first time", "L-plates off at last"],
  },
  {
    label: "Debut or first cap",
    register: "celebrating_one",
    openingLines: ["Celebrating", "A debut for", "Congratulations to"],
    contexts: ["First cap · 2026", "Debut season"],
  },
  {
    label: "Book launch",
    register: "celebrating_one",
    openingLines: ["Celebrating", "Congratulations to"],
    contexts: ["Out 3rd October", "Ten years in the writing"],
  },
  {
    label: "Award",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Take a bow", "Well done"],
    contexts: ["Awarded January 2026"],
  },
  {
    label: "Achievement",
    register: "celebrating_one",
    openingLines: ["Well done", "Take a bow", "Celebrating"],
    contexts: ["2nd November 2025"],
  },
  {
    label: "Christening",
    register: "celebrating_one",
    openingLines: ["Welcome", "Celebrating the christening of", "God bless"],
    contexts: ["Born 3rd April 2026", "Christened 12th July"],
  },
  {
    label: "Naming ceremony",
    register: "celebrating_one",
    openingLines: ["Welcome", "Introducing", "Celebrating the naming of"],
    contexts: ["Named 14th June", "Welcome to the world"],
  },
  {
    label: "Baby shower",
    register: "celebrating_one",
    openingLines: ["Celebrating", "A shower for"],
    contexts: ["Due September 2026", "Nearly time"],
  },
  {
    label: "New baby",
    register: "celebrating_one",
    openingLines: ["Welcome", "Introducing", "Welcome to the world"],
    contexts: ["Born 12th May · 7lb 4oz", "The newest arrival"],
  },
  {
    label: "Bar or bat mitzvah",
    register: "celebrating_one",
    openingLines: ["Mazel tov to", "Celebrating"],
    contexts: ["Called to the Torah", "Thirteen today"],
  },
  {
    label: "First Communion",
    register: "celebrating_one",
    openingLines: ["Celebrating", "God bless"],
    contexts: ["First Communion · May 2026"],
  },
  {
    label: "Confirmation",
    register: "celebrating_one",
    openingLines: ["Celebrating the confirmation of", "God bless"],
    contexts: ["Confirmed 8th June"],
  },
  {
    label: "Ordination",
    register: "celebrating_one",
    openingLines: ["Celebrating the ordination of", "God bless"],
    contexts: ["Ordained June 2026"],
  },
  {
    label: "Recovery",
    register: "celebrating_one",
    openingLines: ["Celebrating", "Here's to", "Welcome back"],
    contexts: [
      "All clear · June 2026",
      "One year on 15th June",
      "Back on form",
    ],
  },
  {
    label: "Sobriety milestone",
    register: "celebrating_one",
    openingLines: ["Celebrating", "Proud of"],
    contexts: ["One year sober", "1,000 days"],
  },
  {
    label: "New home",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "A housewarming for", "New keys for"],
    contexts: ["Keys picked up 1st August", "Home at last"],
  },
  {
    label: "Citizenship",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Welcoming", "Celebrating"],
    contexts: ["Citizen since July 2026", "Officially one of us"],
  },
  {
    label: "Coming out",
    register: "celebrating_one",
    openingLines: ["Celebrating", "Proud of", "Here's to"],
    contexts: ["Out and proud", "Loved as ever"],
  },
  {
    label: "Gender affirmation",
    register: "celebrating_one",
    openingLines: ["Celebrating", "Introducing", "Proud of"],
    contexts: ["Themselves at last", "A name that fits"],
  },
  {
    label: "Divorce party",
    register: "celebrating_one",
    openingLines: ["Celebrating", "A fresh start for"],
    contexts: ["Signed, sealed, single"],
  },
  {
    label: "Hen do",
    register: "celebrating_one",
    openingLines: ["Celebrating", "A hen do for"],
    contexts: ["Bride-to-be", "One last weekend"],
  },
  {
    label: "Stag do",
    register: "celebrating_one",
    openingLines: ["Celebrating", "A stag do for", "Last orders for"],
    contexts: ["Groom-to-be", "One final weekend"],
  },
  {
    label: "Emigration send-off",
    register: "celebrating_one",
    openingLines: ["Farewell", "Bon voyage", "Safe travels"],
    contexts: ["Off to Australia", "Flying 12th September"],
  },
  {
    label: "Passing out parade",
    register: "celebrating_one",
    openingLines: ["Congratulations to", "Saluting"],
    contexts: ["Passing out · April 2026"],
  },
  {
    label: "Gap-year send-off",
    register: "celebrating_one",
    openingLines: ["Bon voyage", "Safe travels"],
    contexts: ["One year, one backpack"],
  },
  {
    label: "Just because",
    register: "celebrating_one",
    openingLines: ["Honouring", "Celebrating", "Here's to"],
    contexts: ["No occasion needed"],
  },

  // ── Celebrating a pair or group ──────────────────────────────────────
  {
    label: "Wedding",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Congratulations to", "Celebrating the wedding of"],
    contexts: ["Married 20th June 2026", "At long last"],
  },
  {
    label: "Engagement",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Congratulations to", "Celebrating the engagement of"],
    contexts: ["Engaged 14th February 2026", "Ring on, date pending"],
  },
  {
    label: "Civil partnership",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Congratulations to", "Celebrating"],
    contexts: ["Partners · 3rd May 2026"],
  },
  {
    label: "Anniversary",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Happy anniversary", "Celebrating"],
    contexts: ["Together since 2005 · 20 years", "Twenty years in"],
  },
  {
    label: "Milestone anniversary",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Happy anniversary", "Celebrating"],
    contexts: [
      "Silver · 25 years",
      "Ruby · 40 years",
      "Golden · 50 years",
      "Diamond · 60 years",
    ],
  },
  {
    label: "Renewal of vows",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Congratulations to", "Celebrating"],
    contexts: ["Vows renewed · June 2026", "Still the ones"],
  },
  {
    label: "Joint birthday",
    register: "celebrating_many",
    openingLines: ["Happy birthday", "Two cakes for", "Celebrating"],
    contexts: ["80 years between them", "Same day, every year"],
  },
  {
    label: "Twins' birthday",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Happy birthday", "Celebrating"],
    contexts: ["Two at once", "Born minutes apart"],
  },
  {
    label: "Joint retirement",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Celebrating the retirement of", "Happy retirement"],
    contexts: ["70 years of service between them"],
  },
  {
    label: "New home together",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Congratulations to", "A housewarming for"],
    contexts: ["Keys in hand", "First home together"],
  },
  {
    label: "Expecting",
    register: "celebrating_many",
    grouping: "pair",
    openingLines: ["Celebrating", "Congratulations to"],
    contexts: ["Due December 2026", "And then there were three"],
  },
  {
    label: "Reunion",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Reuniting", "Celebrating"],
    contexts: ["All back in one room", "20 years since we last met"],
  },
  {
    label: "School reunion",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Reuniting", "Celebrating"],
    contexts: ["Class of 2006", "20 years on"],
  },
  {
    label: "Family gathering",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Celebrating", "Gathering"],
    contexts: ["Four generations, one table"],
  },
  {
    label: "Family send-off",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Farewell", "Bon voyage"],
    contexts: ["Off to New Zealand", "One last gathering before the off"],
  },
  {
    label: "Team celebration",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Celebrating", "Three cheers for"],
    contexts: ["Season 2025/26", "What a season"],
  },
  {
    label: "Championship win",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Champions:", "Celebrating", "Glory for"],
    contexts: ["Champions 2026", "Promoted at last"],
  },
  {
    label: "End of season",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Celebrating", "Three cheers for"],
    contexts: ["Season done · May 2026"],
  },
  {
    label: "Testimonial",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["A testimonial for", "Honouring"],
    contexts: ["15 years of service", "400 appearances"],
  },
  {
    label: "Club anniversary",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Celebrating", "100 years of"],
    contexts: ["Founded 1926", "A century strong"],
  },
  {
    label: "Business anniversary",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Celebrating", "25 years of"],
    contexts: ["Est. 2001", "Open since 2001"],
  },
  {
    label: "Street party",
    register: "celebrating_many",
    grouping: "group",
    openingLines: ["Celebrating", "A street party for"],
    contexts: ["Bunting's up", "The whole street's out"],
  },
  {
    label: "Christmas gathering",
    register: "celebrating_many",
    openingLines: ["Celebrating", "A Christmas gathering for"],
    contexts: ["Christmas 2026", "All together again"],
  },
  {
    label: "New Year's Eve",
    register: "celebrating_many",
    openingLines: ["Celebrating", "Seeing in the year with"],
    contexts: ["NYE 2026", "Out with the old"],
  },
  {
    label: "Joint celebration",
    register: "celebrating_many",
    openingLines: ["Celebrating", "Here's to"],
    contexts: ["Two reasons, one party"],
  },

  // ── Cause ────────────────────────────────────────────────────────────
  {
    label: "Fundraiser",
    register: "cause",
    openingLines: ["In support of", "Fundraising for", "Raising for"],
    contexts: ["2026 appeal", "For local families"],
  },
  {
    label: "Charity night",
    register: "cause",
    openingLines: ["In support of", "A night for"],
    contexts: ["One night, one cause", "Doors at 7"],
  },
  {
    label: "Quiz night",
    register: "cause",
    openingLines: ["In support of", "A quiz night for"],
    contexts: ["Fingers on buzzers", "Teams of six, doors at 7"],
  },
  {
    label: "Coffee morning",
    register: "cause",
    openingLines: ["In support of", "A coffee morning for"],
    contexts: ["Kettle's on", "Cake, coffee and a cause"],
  },
  {
    label: "Bake sale",
    register: "cause",
    openingLines: ["In support of", "Baking for"],
    contexts: ["Everything home-made", "Saturday · village hall"],
  },
  {
    label: "Auction",
    register: "cause",
    openingLines: ["In support of", "Under the hammer for"],
    contexts: ["Lots close 8pm", "All lots donated"],
  },
  {
    label: "Gala or ball",
    register: "cause",
    openingLines: ["In support of", "A gala night for"],
    contexts: ["Summer ball 2026", "Black tie, doors at 7"],
  },
  {
    label: "Open garden",
    register: "cause",
    openingLines: ["In support of", "Gardens open for"],
    contexts: ["Gates open 10–4", "In full bloom"],
  },
  {
    label: "Gig night",
    register: "cause",
    openingLines: ["In support of", "Playing for", "A gig for"],
    contexts: ["One night only", "Doors at 8"],
  },
  {
    label: "Sponsored run",
    register: "cause",
    openingLines: ["Running for", "In support of", "Every mile for"],
    contexts: ["10k · 14th June", "26.2 miles"],
  },
  {
    label: "Sponsored walk",
    register: "cause",
    openingLines: ["Walking for", "In support of"],
    contexts: ["20 miles in a day", "Coast to coast"],
  },
  {
    label: "Sponsored swim",
    register: "cause",
    openingLines: ["Swimming for", "In support of"],
    contexts: ["100 lengths", "5k in open water"],
  },
  {
    label: "Sponsored cycle",
    register: "cause",
    openingLines: ["Riding for", "Pedalling for", "In support of"],
    contexts: ["London to Brighton", "300 miles in May"],
  },
  {
    label: "Sponsored silence",
    register: "cause",
    openingLines: ["Silent for", "In support of"],
    contexts: ["24 hours, not a word"],
  },
  {
    label: "Marathon",
    register: "cause",
    openingLines: ["Running the marathon for", "26.2 miles for"],
    contexts: ["London Marathon 2027", "Race day · 26th April"],
  },
  {
    label: "Head shave",
    register: "cause",
    openingLines: ["Braving the shave for", "In support of"],
    contexts: ["All off on the night", "Clippers at the ready"],
  },
  {
    label: "Dry month",
    register: "cause",
    openingLines: ["Going dry for", "Sober for"],
    contexts: ["31 days, not a drop", "October, off the drink"],
  },
  {
    label: "Movember",
    register: "cause",
    openingLines: ["Growing for", "In support of"],
    contexts: ["One month, one moustache"],
  },
  {
    label: "Christmas Jumper Day",
    register: "cause",
    openingLines: ["In support of", "Jumpers on for"],
    contexts: ["The woollier the better"],
  },
  {
    label: "Dress-down day",
    register: "cause",
    openingLines: ["In support of", "Dressed down for"],
    contexts: ["Last Friday of the month"],
  },
  {
    label: "Emergency appeal",
    register: "cause",
    openingLines: ["In support of", "An urgent appeal for"],
    contexts: ["Every hour counts", "Urgent appeal · 2026"],
  },
  {
    label: "Winter appeal",
    register: "cause",
    openingLines: ["In support of", "A winter appeal for"],
    contexts: ["Winter 2026 appeal", "Warmth where it's needed"],
  },
  {
    label: "In memoriam appeal",
    register: "cause",
    openingLines: ["In memory of", "Giving in memory of"],
    contexts: ["In lieu of flowers", "A gift in their name"],
  },
  {
    label: "School fundraiser",
    register: "cause",
    openingLines: ["In support of", "Raising for"],
    contexts: ["For the school fund", "Summer fair 2026"],
  },
  {
    label: "Church appeal",
    register: "cause",
    openingLines: ["In support of", "Raising for"],
    contexts: ["The roof fund", "Restoration appeal"],
  },
  {
    label: "Community fund",
    register: "cause",
    openingLines: ["In support of", "Raising for"],
    contexts: ["For the hall", "Keep the doors open"],
  },
  {
    label: "Sports club fund",
    register: "cause",
    openingLines: ["In support of", "Backing"],
    contexts: ["New kit fund", "For next season"],
  },
  {
    label: "Hospice appeal",
    register: "cause",
    openingLines: ["In support of", "Giving for"],
    contexts: ["Care close to home"],
  },
  {
    label: "Animal rescue appeal",
    register: "cause",
    openingLines: ["In support of", "Raising for"],
    contexts: ["Food, shelter, second chances"],
  },
]

/** Resolves a context variant for the selected pronoun (they = neutral). */
export function resolveOccasionContext(
  context: OccasionContext,
  pronoun?: "he" | "she" | "they"
): string {
  if (typeof context === "string") return context
  return context[pronoun ?? "they"]
}

/**
 * Occasions available for a register, in catalogue order. For
 * celebrating_many, pass the selected grouping to narrow pair-only /
 * group-only occasions; untagged occasions show for both.
 */
export function occasionsForRegister(
  register: Register,
  grouping?: "pair" | "group"
): OccasionSpec[] {
  return OCCASIONS.filter(
    (o) =>
      o.register === register &&
      (!o.grouping || !grouping || o.grouping === grouping)
  )
}
