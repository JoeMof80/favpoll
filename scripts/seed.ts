import { createClient } from "@supabase/supabase-js"
import { regeneratedPlaceholders } from "./placeholders-regenerated"
import { regeneratedPlaceholdersBatch2 } from "./placeholders-regenerated-2"
import { regeneratedPlaceholdersBatch3 } from "./placeholders-regenerated-3"
import { regeneratedPlaceholdersBatch4 } from "./placeholders-regenerated-4"
import { regeneratedPlaceholdersBatch5 } from "./placeholders-regenerated-5"
import { regeneratedPlaceholdersBatch6 } from "./placeholders-regenerated-6"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const charities = [
  {
    name: "Macmillan Cancer Support",
    description: "Support for people living with cancer",
    registered_number: "261017",
  },
  {
    name: "Marie Curie",
    description: "Care for people living with terminal illness",
    registered_number: "207994",
  },
  {
    name: "Cancer Research UK",
    description: "Research to prevent, diagnose and treat cancer",
    registered_number: "1089464",
  },
  {
    name: "British Heart Foundation",
    description: "Research and support for heart and circulatory diseases",
    registered_number: "225971",
  },
  {
    name: "Age UK",
    description: "Supporting older people to love later life",
    registered_number: "1128267",
  },
  {
    name: "Alzheimer\'s Society",
    description: "Support and research for people affected by dementia",
    registered_number: "296645",
  },
  {
    name: "Oxfam",
    description: "Working to end the injustice of poverty",
    registered_number: "202918",
  },
  {
    name: "Shelter",
    description: "Fighting homelessness and bad housing",
    registered_number: "263710",
  },
  {
    name: "RNLI",
    description: "Saving lives at sea",
    registered_number: "209603",
  },
  {
    name: "Dogs Trust",
    description: "UK\'s largest dog welfare charity",
    registered_number: "227523",
  },
  {
    name: "RSPCA",
    description: "Preventing cruelty and promoting kindness to animals",
    registered_number: "219099",
  },
  {
    name: "St Mungo\'s",
    description: "Helping people to recover from homelessness",
    registered_number: "1079126",
  },
  {
    name: "Mind",
    description: "Mental health support and advocacy",
    registered_number: "219830",
  },
  {
    name: "Samaritans",
    description: "Listening support for anyone in distress",
    registered_number: "219432",
  },
  {
    name: "Crisis",
    description: "Ending homelessness in the UK",
    registered_number: "1082947",
  },
  {
    name: "Trussell Trust",
    description: "Supporting food banks across the UK",
    registered_number: "1110522",
  },
  {
    name: "Médecins Sans Frontières",
    description: "Emergency medical aid in crisis zones",
    registered_number: "1026588",
  },
  {
    name: "Save the Children",
    description: "Protecting children in the UK and around the world",
    registered_number: "213890",
  },
  {
    name: "WWF",
    description:
      "Conservation of nature and reduction of threats to biodiversity",
    registered_number: "1081247",
  },
  {
    name: "National Trust",
    description: "Caring for places of natural beauty and historic interest",
    registered_number: "205846",
  },
  {
    name: "RNIB",
    description: "Support for people with sight loss",
    registered_number: "226227",
  },
  {
    name: "Scope",
    description: "Equality for disabled people",
    registered_number: "208231",
  },
  {
    name: "St Richard\'s Hospice",
    description: "Specialist palliative care in Worcestershire",
    registered_number: "515668",
  },
  {
    name: "Hospice UK",
    description: "Supporting hospice care across the country",
    registered_number: "1003017",
  },
  {
    name: "Comic Relief",
    description: "Using the power of entertainment to change lives",
    registered_number: "326568",
  },
  {
    name: "Children\'s Society",
    description: "Fighting for children who are ignored, abused and forgotten",
    registered_number: "221124",
  },
  {
    name: "Barnardos",
    description: "Transforming the lives of vulnerable children",
    registered_number: "216250",
  },
  {
    name: "NSPCC",
    description: "Protecting children and preventing abuse",
    registered_number: "216401",
  },
  {
    name: "Diabetes UK",
    description: "Supporting people living with diabetes",
    registered_number: "215199",
  },
  {
    name: "Stroke Association",
    description: "Support and research for stroke survivors",
    registered_number: "211015",
  },
]

const categories = [
  { label: "Nature", description: "Natural world and our place in it" },
  {
    label: "Music",
    description: "Songs, genres, and the moments they soundtracked",
  },
  { label: "Film & TV", description: "Stories told on screen" },
  { label: "Food & Drink", description: "Tastes and smells we grew up with" },
  { label: "Places", description: "Locations that stay with us" },
  {
    label: "Sport",
    description: "Games, teams, and the thrill of competition",
  },
  { label: "Literature", description: "Books and the worlds they opened" },
  { label: "Everyday life", description: "Small things that make up a life" },
  { label: "Childhood", description: "What we remember from growing up" },
  { label: "Time", description: "Seasons, moments, and the rhythm of days" },
]

// ---------------------------------------------------------------------------
// Placeholder writing discipline
//
// Every occasion entry has: about, reveal.  (framing removed entirely)
//
// Writing order:
//   1. Reveal first — specific named answer, one concrete detail
//   2. About second — topic area without naming the answer
//   3. Check: does about leak the reveal? If yes, rewrite.
//
// All reveal answers must exist in the topic_items list.
// Marcus Webb (achievement) — marathon runner; placeholder about is charity-free.
// ---------------------------------------------------------------------------

type RegisterKey =
  | "remembering"
  | "celebrating_one"
  | "celebrating_many"
  | "cause"
  | "neutral"

// Raw seed data uses occasion-type keys for readability; normalised to 5
// register keys before writing to the DB.
// Topics with regenerated placeholders use register keys directly (no normalization needed).
type RawTopicPlaceholders = {
  [occasion: string]: { about: string; reveal: string }
}

type TopicPlaceholders = Record<RegisterKey, { about: string; reveal: string }>

const REGISTER_KEYS = new Set<string>([
  "remembering",
  "celebrating_one",
  "celebrating_many",
  "cause",
  "neutral",
])

const OCCASION_TO_REGISTER: Record<string, RegisterKey> = {
  // remembering
  Memorial: "remembering",
  Tribute: "remembering",
  "Celebration of life": "remembering",
  "Pet memorial": "remembering",
  "In memoriam appeal": "remembering",
  // celebrating_one
  Birthday: "celebrating_one",
  "Milestone birthday": "celebrating_one",
  Retirement: "celebrating_one",
  "Leaving do": "celebrating_one",
  Graduation: "celebrating_one",
  Christening: "celebrating_one",
  "Baby shower": "celebrating_one",
  "New baby": "celebrating_one",
  "Bar or bat mitzvah": "celebrating_one",
  Recovery: "celebrating_one",
  "New job": "celebrating_one",
  Promotion: "celebrating_one",
  Achievement: "celebrating_one",
  Award: "celebrating_one",
  "Exam success": "celebrating_one",
  "New home": "celebrating_one",
  Citizenship: "celebrating_one",
  "Coming out": "celebrating_one",
  "Divorce party": "celebrating_one",
  "Just because": "celebrating_one",
  // celebrating_many
  Wedding: "celebrating_many",
  Engagement: "celebrating_many",
  Anniversary: "celebrating_many",
  "Renewal of vows": "celebrating_many",
  Reunion: "celebrating_many",
  "Team celebration": "celebrating_many",
  "Family gathering": "celebrating_many",
  // cause
  Fundraiser: "cause",
  "Sponsored event": "cause",
  "Charity night": "cause",
  // neutral
  default: "neutral",
}

/**
 * Combined register-keyed placeholder map built from all 6 regenerated-batch
 * files.  Duplicate topic titles across batches throw immediately.  Every seed
 * topic title must appear here; extra map entries are future topics not yet in
 * the seed and are listed (not thrown) at startup.
 */
const combinedPlaceholders = (() => {
  const batches: Record<string, Record<RegisterKey, { about: string; reveal: string }>>[] = [
    regeneratedPlaceholders as never,
    regeneratedPlaceholdersBatch2 as never,
    regeneratedPlaceholdersBatch3 as never,
    regeneratedPlaceholdersBatch4 as never,
    regeneratedPlaceholdersBatch5 as never,
    regeneratedPlaceholdersBatch6 as never,
  ]
  const map: Record<string, Record<RegisterKey, { about: string; reveal: string }>> = {}
  for (const batch of batches) {
    for (const [title, data] of Object.entries(batch)) {
      if (map[title]) throw new Error(`Duplicate topic title in placeholder batches: "${title}"`)
      map[title] = data
    }
  }
  return map
})()

/**
 * Converts occasion-keyed raw placeholders to 5-register-keyed placeholders.
 * If the input is already register-keyed (all 5 keys present), passes through directly.
 * First match per register wins.  `cause` falls back to `neutral` if absent.
 */
function normalizeTopicPlaceholders(
  raw: RawTopicPlaceholders | TopicPlaceholders
): TopicPlaceholders {
  const keys = Object.keys(raw)
  if (keys.length > 0 && keys.every((k) => REGISTER_KEYS.has(k))) {
    return raw as TopicPlaceholders
  }
  const result: Partial<TopicPlaceholders> = {}
  for (const [occasion, entry] of Object.entries(raw)) {
    const reg = OCCASION_TO_REGISTER[occasion]
    if (reg && !result[reg]) result[reg] = entry
  }
  if (!result.cause && result.neutral) result.cause = result.neutral
  return result as TopicPlaceholders
}

type TopicSeed = {
  title: string
  description: string
  is_finite: boolean
  categories: string[]
  placeholders: RawTopicPlaceholders | TopicPlaceholders
}

const topics: TopicSeed[] = [
  // ── Finite ──────────────────────────────────────────────────────────────────
  {
    title: "Colour",
    description: "Colour that spoke to them most",
    is_finite: true,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "A teacher and mother with a precise eye for what belonged where — in a room, a garden border, an outfit. Forty years of getting it exactly right.",
        reveal:
          "Hers was purple. She wore it to every occasion that mattered, and grew lavender wherever she could.",
      },
      celebrating_one: {
        about:
          "She's turning forty and has never once made a neutral choice — three weekends deliberating over a single wall, and not a flicker of regret since.",
        reveal:
          "Hers is green. Two trips to the paint shop, no second thoughts. She still brings it up.",
      },
      celebrating_many: {
        about:
          "Two years into the flat and one wall remains unpainted, because they have never agreed on a colour and are in no hurry to.",
        reveal:
          "Hers is blue, his is green, the wall stays white. Not a problem they intend to solve.",
      },
      cause: {
        about:
          "Pick the colour you'd argue for and pledge what it's worth to you. Some of these choices say more about a person than they realise.",
        reveal:
          "Our pick to start things off: yellow — the one that refuses to be ignored.",
      },
      neutral: {
        about:
          "Some people have known their answer to this since childhood and have never felt the need to revisit it.",
        reveal:
          "Theirs is red. No particular reason. It simply always wins.",
      },
    },
  },
  {
    title: "Season",
    description: "Time of year they loved most",
    is_finite: true,
    categories: ["Nature", "Time"],
    placeholders: {
      remembering: {
        about:
          "A keen gardener who measured the year by what was coming back, and was always ready for it before anyone else had noticed.",
        reveal:
          "Hers was spring. She'd have seeds in the ground before the rest of us had thought about it.",
      },
      celebrating_one: {
        about:
          "She plans her whole year around long evenings and warm weekends, then claims, every autumn, to have meant something else entirely.",
        reveal:
          "Hers is summer, whatever she says. The people who know her aren't fooled.",
      },
      celebrating_many: {
        about:
          "They've disagreed about the best time of year since roughly their third date, and show no sign of resolving it.",
        reveal:
          "Hers is spring, his is summer. Five years in, still unsettled, still enjoyed.",
      },
      cause: {
        about:
          "Pick the season you'd defend and pledge what it's worth. Everyone's certain they're right about this one.",
        reveal:
          "Our pick to start: autumn — the one that knows how to make an exit.",
      },
      neutral: {
        about:
          "Some people are entirely loyal to one season, and a little suspicious of anyone who isn't.",
        reveal:
          "Theirs is winter. They like the quiet, and the excuse to stay in.",
      },
    },
  },
  {
    title: "Day of the week",
    description: "Day that felt most like them",
    is_finite: true,
    categories: ["Time", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She had one day of the week entirely her own — a long-established, non-negotiable routine the whole family knew to respect.",
        reveal:
          "Hers was Sunday. Long lunch, garden, radio, in that order, without variation.",
      },
      celebrating_one: {
        about:
          "He has a theory about which day has the best energy that no colleague has yet managed to disprove.",
        reveal:
          "His is Friday. He makes the whole office feel the weekend's started by lunch.",
      },
      celebrating_many: {
        about:
          "They met on one day, got engaged on another, and have been gently arguing about which is better ever since.",
        reveal:
          "Hers is Saturday, his is Friday. The argument is part of the marriage now.",
      },
      cause: {
        about:
          "Pick the day you'd defend and pledge what it's worth. Everyone has a favourite; few will admit why.",
        reveal:
          "Our pick to start: Tuesday — quietly the most underrated day there is.",
      },
      neutral: {
        about:
          "Some people have strong, immovable feelings about the days of the week and will share them unprompted.",
        reveal:
          "Theirs is Sunday. The one day nobody is allowed to schedule anything.",
      },
    },
  },
  {
    title: "Meal of the day",
    description: "Meal they never skipped",
    is_finite: true,
    categories: ["Food & Drink", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She treated one meal of the day as a serious commitment — the one where the real conversations happened, long after the plates were cleared.",
        reveal:
          "Hers was dinner. Still at the table at nine most nights. That was when the day properly began.",
      },
      celebrating_one: {
        about:
          "She approaches one meal in particular with an enthusiasm her friends find both baffling and infectious.",
        reveal:
          "Hers is brunch. Two hours minimum, good coffee, no rushing. She considers this a moral position.",
      },
      celebrating_many: {
        about:
          "Their first proper date was an argument about where to eat that ended somewhere neither suggested and both loved. The template has held.",
        reveal:
          "Theirs is dinner — the longer and later the better. Midnight at the table counts as a good evening.",
      },
      cause: {
        about:
          "Pick the meal you'd defend and pledge what it's worth. It says more about a person than you'd think.",
        reveal:
          "Our pick to start: breakfast — the meal that decides how the rest of the day goes.",
      },
      neutral: {
        about:
          "Some people will reorganise an entire day around protecting one particular meal.",
        reveal:
          "Theirs is lunch. Properly sat down, never at a desk. That part is non-negotiable.",
      },
    },
  },
  {
    title: "Time of day",
    description: "Hour when they were at their best",
    is_finite: true,
    categories: ["Time", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She'd claimed one hour of the day long before anyone else in the house was awake. The shape of her morning was not to be interrupted.",
        reveal:
          "Hers was early morning. Garden done, thinking done, tea made — all before the world woke up.",
      },
      celebrating_one: {
        about:
          "She's at her most vivid in the hours when most people are winding down, and has been known to start dinner at ten.",
        reveal:
          "Hers is evening. The later the better. She says everything gets more interesting after nine.",
      },
      celebrating_many: {
        about:
          "They protect one hour of the day that belongs to nobody else and carries no agenda. It has never once been cancelled.",
        reveal:
          "Theirs is lunchtime. Same hour, same table, no phones. That hour has held them together.",
      },
      cause: {
        about:
          "Pick the hour you'd defend and pledge what it's worth. Morning people and night owls, this is your moment.",
        reveal:
          "Our pick to start: dusk — the hour the day finally lets its shoulders down.",
      },
      neutral: {
        about:
          "Some people know exactly when they're at their best and arrange their lives around it without apology.",
        reveal:
          "Theirs is late night. That's when the good thinking happens, they'll tell you.",
      },
    },
  },
  {
    title: "Decade",
    description: "Era that shaped them most",
    is_finite: true,
    categories: ["Time", "Music", "Film & TV"],
    placeholders: {
      remembering: {
        about:
          "She came of age in a decade she always said had changed everything, and kept a box of photographs from it she'd show to anyone who asked.",
        reveal:
          "Hers was the 1960s. She could tell you exactly where she was when each thing happened.",
      },
      celebrating_one: {
        about:
          "She has never pretended to be neutral about the decade that shaped her, and delivers her views on its music with full conviction.",
        reveal:
          "Hers is the 1980s. She knows every word of every song from 1986 and considers this useful.",
      },
      celebrating_many: {
        about:
          "They grew up to the same music without knowing each other existed, and discovered it on a second date that ran long.",
        reveal:
          "Theirs is the 2000s. The wedding playlist made the overlap embarrassingly plain.",
      },
      cause: {
        about:
          "Pick the decade that shaped you and pledge what it's worth. Everyone thinks theirs was the best one.",
        reveal:
          "Our pick to start: the 1970s — loud, certain, and not remotely sorry.",
      },
      neutral: {
        about:
          "Some people belong, culturally, to one decade and have quietly stayed there ever since.",
        reveal:
          "Theirs is the 1990s. They'll defend it at length, given the smallest opening.",
      },
    },
  },
  // ── Infinite — Nature ────────────────────────────────────────────────────────
  {
    title: "Animal",
    description: "Creature they felt closest to",
    is_finite: false,
    categories: ["Nature", "Childhood"],
    placeholders: {
      remembering: {
        about:
          "A mother and teacher whose garden was as much for the creatures as for herself, with strong opinions about which animals deserved more of our attention.",
        reveal:
          "Hers was the fox. They came to her garden reliably and she always stopped to watch.",
      },
      celebrating_one: {
        about:
          "She's turning forty and still stops dead on every walk for one particular creature, exactly as she has since she was small.",
        reveal:
          "Hers is the owl. She says it's the only one that looks like it's thinking something over.",
      },
      celebrating_many: {
        about:
          "They have a settled, much-enjoyed argument about which animal best suits them, and neither has ever conceded.",
        reveal:
          "Hers is the deer, his is the dog. They've agreed only never to agree.",
      },
      cause: {
        about:
          "Pick the creature you'd defend in an argument and pledge what it's worth. Some of these choices will be controversial.",
        reveal:
          "Our pick to start: the hedgehog — small, determined, and entirely unbothered by any of this.",
      },
      neutral: {
        about:
          "Some people keep a favourite animal the way others keep a favourite chair — settled, and ready when asked.",
        reveal:
          "Theirs is the dog. No elaborate reasoning. The dog was always going to win.",
      },
    },
  },
  {
    title: "Bird",
    description: "Bird that always caught their eye",
    is_finite: false,
    categories: ["Nature"],
    placeholders: {
      remembering: {
        about:
          "She kept a garden largely for other creatures and logged every bird that visited. Decades of notebooks are still in the shed.",
        reveal:
          "Hers was the robin. She could name a bird by its song before it appeared.",
      },
      celebrating_one: {
        about:
          "She's accumulated opinions about birds on weekend walks for years, and a list she insists she doesn't take seriously.",
        reveal:
          "Hers is the puffin. She spotted one from a moving ferry and talked about it for an hour.",
      },
      celebrating_many: {
        about:
          "They went away specifically to settle a long-running disagreement about birds, and came back exactly as divided.",
        reveal:
          "Hers is the kingfisher, his is the puffin. The trip resolved nothing, happily.",
      },
      cause: {
        about:
          "Pick the bird you'd stop to watch and pledge what it's worth. Quiet devotion welcome.",
        reveal:
          "Our pick to start: the heron — patient, unbothered, always exactly where it means to be.",
      },
      neutral: {
        about:
          "Some people notice the birds everyone else walks past, and have a clear favourite ready.",
        reveal:
          "Theirs is the blackbird. Clear voice, unhurried, entirely itself.",
      },
    },
  },
  {
    title: "Flower",
    description: "Bloom that stopped them in their tracks",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She grew the same plant in every garden she ever had — same spot where she could manage it, same care each year.",
        reveal:
          "Hers was lavender. The smell is still entirely hers.",
      },
      celebrating_one: {
        about:
          "She keeps the flat stocked with one particular bloom from April to June, having decided years ago there's no reasonable argument against it.",
        reveal:
          "Hers is the peony. Nobody has yet challenged the policy.",
      },
      celebrating_many: {
        about:
          "She'd chosen her flower years before they met; he agreed the moment he heard it, which she found suspicious.",
        reveal:
          "Theirs is wisteria. She'd known long before the wedding. He knew better than to disagree.",
      },
      cause: {
        about:
          "Pick the bloom that stops you in your tracks and pledge what it's worth.",
        reveal:
          "Our pick to start: the sunflower — impossible to be in a bad mood near.",
      },
      neutral: {
        about:
          "Some people have a flower that's simply theirs, no occasion required.",
        reveal:
          "Theirs is the rose. Predictable, they'll admit. Also correct.",
      },
    },
  },
  {
    title: "Tree",
    description: "Tree they would sit under",
    is_finite: false,
    categories: ["Nature"],
    placeholders: {
      remembering: {
        about:
          "She planted a sapling decades ago and watched it shade a whole lawn. A garden without a proper tree, she'd say, is just a lawn with ambitions.",
        reveal:
          "Hers was the oak. It is now older than most of the people who knew her.",
      },
      celebrating_one: {
        about:
          "She planted hers in her first garden for the structure and the autumn berries, and considers it one of her better decisions.",
        reveal:
          "Hers is the rowan. The berries each autumn are her annual vindication.",
      },
      celebrating_many: {
        about:
          "They planted one together on their first anniversary, in the wrong spot, and have argued about moving it ever since.",
        reveal:
          "Theirs is the silver birch. Still in the wrong place. Still not moving.",
      },
      cause: {
        about:
          "Pick the tree you'd sit under and pledge what it's worth.",
        reveal:
          "Our pick to start: the beech — all that canopy, all that shade, nothing asked in return.",
      },
      neutral: {
        about:
          "Some people have a tree they'd choose without hesitation, usually for reasons they can't fully explain.",
        reveal:
          "Theirs is the willow. You don't notice how much shade it gives until it's gone.",
      },
    },
  },
  {
    title: "Weather",
    description: "Sky that lifted their spirit",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She had a particular relationship with cold, clear mornings — the kind of day she was most herself in.",
        reveal:
          "Hers was crisp frost. Clear sky, cold air, the garden white. She said the best thinking happened then.",
      },
      celebrating_one: {
        about:
          "She has a favourite kind of weather most people wouldn't choose, and will explain at length why they're wrong.",
        reveal:
          "Hers is warm rain. Brief, unexpected, the best quality of light. She's not wrong.",
      },
      celebrating_many: {
        about:
          "They married on a day the forecast had called uncertain, which turned out exactly right — typical, they both agree, of the whole relationship.",
        reveal:
          "Theirs is overcast and mild. Not the day they were promised. Exactly the day they wanted.",
      },
      cause: {
        about:
          "Pick the sky that lifts your spirit and pledge what it's worth.",
        reveal:
          "Our pick to start: golden autumn light — the only light that makes the world look finished.",
      },
      neutral: {
        about:
          "Some people have a kind of weather they'd happily live inside, whatever everyone else thinks of it.",
        reveal:
          "Theirs is the thunderstorm. They'll stand at the window for the whole thing.",
      },
    },
  },
  {
    title: "Landscape",
    description: "View that took their breath away",
    is_finite: false,
    categories: ["Nature", "Places"],
    placeholders: {
      remembering: {
        about:
          "She loved the English countryside with the quiet certainty of someone who'd never felt the need to say so, and walked the same hills for thirty years.",
        reveal:
          "Hers was rolling hills. She still found something new to notice every time.",
      },
      celebrating_one: {
        about:
          "Her opinions on landscape were formed almost entirely on weekend walks, and she's suspicious of anyone who prefers the flat.",
        reveal:
          "Hers is mountains. The only landscape, she says, that asks something of you.",
      },
      celebrating_many: {
        about:
          "They argued about where to get married for a year and chose the one kind of view neither could object to.",
        reveal:
          "Theirs is the coastline. The single answer that ended the argument.",
      },
      cause: {
        about:
          "Pick the view that takes your breath away and pledge what it's worth.",
        reveal:
          "Our pick to start: open moorland — space to think, without being told what to think.",
      },
      neutral: {
        about:
          "Some people have a landscape that returns them to themselves, and know exactly where it is.",
        reveal:
          "Theirs is woodland. Something about the way the light moves in it.",
      },
    },
  },
  // ── Infinite — Places ────────────────────────────────────────────────────────
  {
    title: "Place",
    description: "Where they were happiest",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      remembering: {
        about:
          "Her house was the place everyone came back to — for Sunday lunch, for difficult news, for no reason at all. The kitchen table did most of the work.",
        reveal:
          "Hers was home. Specifically that table. Every conversation worth having happened there.",
      },
      celebrating_one: {
        about:
          "She's been to thirty countries and still rates one ordinary kind of place above every destination she's ever planned.",
        reveal:
          "Hers is the seaside. It has beaten every itinerary she's ever drawn up.",
      },
      celebrating_many: {
        about:
          "They argued about where to get married for a year and landed on the one kind of place neither could object to.",
        reveal:
          "Theirs is the countryside. The single answer that ended the argument.",
      },
      cause: {
        about:
          "Pick the place you're happiest and pledge what it's worth — somewhere you return to, or somewhere you've always meant to go.",
        reveal:
          "Our pick to start: the pub — the one with your name half-worn into the table.",
      },
      neutral: {
        about:
          "Some people have one place that quietly outranks everywhere else they've ever been.",
        reveal:
          "Theirs is the garden. Wherever the day goes, it ends there.",
      },
    },
  },
  {
    title: "Type of holiday",
    description: "How they loved to get away",
    is_finite: false,
    categories: ["Places", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She took exactly one kind of holiday for thirty years and never once considered another. Maps, proper boots, no signal.",
        reveal:
          "Hers was the walking holiday. Everything else, she said, was just going somewhere.",
      },
      celebrating_one: {
        about:
          "She has a position on the best kind of holiday her friends find surprising and have stopped testing.",
        reveal:
          "Hers is camping. The only holiday, she says, where you actually stop.",
      },
      celebrating_many: {
        about:
          "They make holiday decisions the way they make all decisions: mutual, slightly contested, somehow always right.",
        reveal:
          "Theirs is the beach holiday. They said they'd earned it. They had.",
      },
      cause: {
        about:
          "Pick the way you'd most love to get away and pledge what it's worth.",
        reveal:
          "Our pick to start: the city break — no plan, everything worth seeing seen.",
      },
      neutral: {
        about:
          "Some people know exactly what a holiday is for, and won't be talked out of it.",
        reveal:
          "Theirs is the cruise. Someone else handles the itinerary, which is the whole point.",
      },
    },
  },
  {
    title: "Way to travel",
    description: "How they loved to get from A to B",
    is_finite: false,
    categories: ["Places", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She always took the train. You miss everything, she said, if you're in a hurry — and the journey was always part of the point.",
        reveal:
          "Hers was the train. She was right about that, too.",
      },
      celebrating_one: {
        about:
          "She once walked fourteen miles to a restaurant rather than take the bus, and considered this entirely reasonable.",
        reveal:
          "Hers is by bicycle — the only way to arrive somewhere having actually been there.",
      },
      celebrating_many: {
        about:
          "They had something fast and impractical when they first got together, sold it sensibly, and have discussed buying another for years.",
        reveal:
          "Theirs is on motorbike. They keep saying they'll get one again. They probably will.",
      },
      cause: {
        about:
          "Pick how you'd rather get from A to B and pledge what it's worth. It's a whole character portrait.",
        reveal:
          "Our pick to start: on foot — the only way that makes you earn being somewhere.",
      },
      neutral: {
        about:
          "How a person likes to travel tells you most of what you need to know about them.",
        reveal:
          "Theirs is by train. A window seat and an hour to think, and they're content.",
      },
    },
  },
  // ── Infinite — Film & TV ─────────────────────────────────────────────────────
  {
    title: "Film",
    description: "Film they could watch again and again",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      remembering: {
        about:
          "She came back to the same film every year without fail, and her children learned the lines long before they understood them.",
        reveal:
          "Hers was Brief Encounter. She could quote it entire. It never lost anything.",
      },
      celebrating_one: {
        about:
          "She's watched one film so many times she now prefers watching other people see it for the first time.",
        reveal:
          "Hers is Four Weddings and a Funeral. She's stopped counting; she watches the room instead.",
      },
      celebrating_many: {
        about:
          "They argued about which film explained their relationship before realising they were defending the same one from different angles.",
        reveal:
          "Theirs is Local Hero. He came round eventually.",
      },
      cause: {
        about:
          "Pick the film you could watch on any given evening and pledge what it's worth.",
        reveal:
          "Our pick to start: Paddington 2 — the most quietly correct film ever made.",
      },
      neutral: {
        about:
          "Some people have one film that's simply theirs, watched at every turning point for reasons they don't examine.",
        reveal:
          "Theirs is The Shawshank Redemption. They'll say it's about patience. It's about hope.",
      },
    },
  },
  {
    title: "Film genre",
    description: "Kind of story they loved on screen",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      remembering: {
        about:
          "She considered a good documentary a serious commitment and watched them with the full attention she felt they deserved.",
        reveal:
          "Hers was the documentary — the only honest films, she said.",
      },
      celebrating_one: {
        about:
          "She has firm views on what comedy is and isn't, and will deliver them at length if invited.",
        reveal:
          "Hers is comedy. The qualifying list is short and fiercely defended.",
      },
      celebrating_many: {
        about:
          "They agree on exactly one kind of film, absolutely and without discussion. Everything else is still disputed.",
        reveal:
          "Theirs is romance. Settled since the first date.",
      },
      cause: {
        about:
          "Pick the kind of story you love most on screen and pledge what it's worth.",
        reveal:
          "Our pick to start: the western — the genre that knows how to let a silence sit.",
      },
      neutral: {
        about:
          "Some people belong to one genre and judge everything else gently against it.",
        reveal:
          "Theirs is science fiction. The only genre, they'll argue, that takes ideas seriously.",
      },
    },
  },
  {
    title: "TV show",
    description: "Show they always settled in to watch",
    is_finite: false,
    categories: ["Film & TV", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She organised her Sunday evenings around television the way she organised everything — clear priorities, no interruptions.",
        reveal:
          "Hers was the period drama. She watched with complete commitment and remembered every thread.",
      },
      celebrating_one: {
        about:
          "She has rewatched a whole series simply to recommend it properly to a friend, and considered the time well spent.",
        reveal:
          "Hers is the sitcom. She knows exactly which episode to start a beginner on.",
      },
      celebrating_many: {
        about:
          "They keep a shared list and a private list, and the distinction is taken extremely seriously.",
        reveal:
          "Theirs is the nature documentary — the one thing they always watch together without negotiation.",
      },
      cause: {
        about:
          "Pick the programme you always settle in for and pledge what it's worth.",
        reveal:
          "Our pick to start: the quiz show — the most reliable shouting-at-the-television there is.",
      },
      neutral: {
        about:
          "Some people have one show that's their whole evening, given the chance.",
        reveal:
          "Theirs is the crime thriller. Watched properly, no second screen.",
      },
    },
  },
  // ── Infinite — Music ─────────────────────────────────────────────────────────
  {
    title: "Song",
    description: "Song that reminds you of them",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      remembering: {
        about:
          "She sang under her breath without noticing, and her children knew every word to songs they'd never consciously learned.",
        reveal:
          "Hers was Jerusalem — Parry. Always the same verse first.",
      },
      celebrating_one: {
        about:
          "She keeps a playlist she updates monthly and a position on song order that is not up for negotiation.",
        reveal:
          "Hers is Angels — Robbie Williams. She turns it up every time, and has never apologised.",
      },
      celebrating_many: {
        about:
          "They spent a whole evening arguing about the first song and compromised on neither of their choices — and it was perfect.",
        reveal:
          "Theirs is What a Wonderful World — Louis Armstrong. They haven't argued about it since.",
      },
      cause: {
        about:
          "Pick the song that takes you somewhere the moment it starts and pledge what it's worth.",
        reveal:
          "Our pick to start: Waterloo Sunset — The Kinks, which makes everything feel survivable.",
      },
      neutral: {
        about:
          "Some people have a song that came on by accident once and became permanently theirs.",
        reveal:
          "Theirs is Don't Look Back in Anger — Oasis. They can't hear it as anyone else's now.",
      },
    },
  },
  {
    title: "Music genre",
    description: "Music that moved them",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      remembering: {
        about:
          "She had firm views on what made a good song and listened to one kind of music above all, able to explain exactly why.",
        reveal:
          "Hers was folk. The only music, she said, that told the truth.",
      },
      celebrating_one: {
        about:
          "Her taste is wide and eclectic, she'll tell you — though her listening, year after year, says something more specific.",
        reveal:
          "Hers is pop. She insists she listens to everything. Pop wins regardless.",
      },
      celebrating_many: {
        about:
          "They come from different musical worlds and together make something without a name that works perfectly.",
        reveal:
          "Theirs is soul. She brought it; he agreed at once.",
      },
      cause: {
        about:
          "Pick the music that moves you most and pledge what it's worth. Taste is a portrait.",
        reveal:
          "Our pick to start: jazz — the genre that understands changing its mind mid-sentence.",
      },
      neutral: {
        about:
          "Some people live inside one genre and quietly think everyone should.",
        reveal:
          "Theirs is rock. Twenty years of the same instinct, never once wavering.",
      },
    },
  },
  {
    title: "Music era",
    description: "Golden age of music for them",
    is_finite: false,
    categories: ["Music", "Time"],
    placeholders: {
      remembering: {
        about:
          "She could tell you where she was when she first heard every important record of one decade, and kept the albums.",
        reveal:
          "Hers was seventies soul and funk. The decade, she said, that understood what music was for.",
      },
      celebrating_one: {
        about:
          "She has one era rooted in her bones and knows every B-side, which she does not consider a niche concern.",
        reveal:
          "Hers is eighties pop. Every track, every year, 1984 to 1989.",
      },
      celebrating_many: {
        about:
          "They grew up to the same sound in different cities and discovered the overlap on a first date that ran long.",
        reveal:
          "Theirs is the noughties. The wedding playlist made it plain.",
      },
      cause: {
        about:
          "Pick the golden age of music for you and pledge what it's worth. Everyone thinks theirs was best.",
        reveal:
          "Our pick to start: rock and roll — loud, certain, and not remotely sorry.",
      },
      neutral: {
        about:
          "Some people belong to one musical era and have happily never left it.",
        reveal:
          "Theirs is the swinging sixties — not lived through, but claimed entirely.",
      },
    },
  },
  {
    title: "Instrument",
    description: "Sound that moved them most",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      remembering: {
        about:
          "She played quietly, for herself, for fifty years. Never performed. Her children heard it through the walls.",
        reveal:
          "Hers was the piano. Every evening, never for anyone else. That was the whole point.",
      },
      celebrating_one: {
        about:
          "She's played since she was eight with more ambition than precision, and the neighbours have learned to live with Tuesdays.",
        reveal:
          "Hers is the violin. The ambition has always outrun the execution. It's never put her off.",
      },
      celebrating_many: {
        about:
          "She had a clear vision for the music years before they met; he agreed instantly, which she found suspicious.",
        reveal:
          "Theirs is the harp. She'd known for years. He knew better than to argue.",
      },
      cause: {
        about:
          "Pick the sound that moves you most and pledge what it's worth.",
        reveal:
          "Our pick to start: the cello — the instrument that sounds like it means it.",
      },
      neutral: {
        about:
          "Some people have an instrument that's simply theirs, played well or otherwise.",
        reveal:
          "Theirs is the guitar. Nothing flashy, always enough.",
      },
    },
  },
  {
    title: "Type of song",
    description: "Kind of song they always came back to",
    is_finite: false,
    categories: ["Music", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She knew every hymn and every lullaby and moved between them without thinking, singing in the kitchen without noticing.",
        reveal:
          "Hers was the hymn or spiritual — just the best folk songs, she said.",
      },
      celebrating_one: {
        about:
          "She has a karaoke setlist that has been in development for years. It is ambitious. It suits her completely.",
        reveal:
          "Hers is the anthem. Right key, full conviction, no awkward ending.",
      },
      celebrating_many: {
        about:
          "Their story started as one kind of song and has had the texture of something truer ever since.",
        reveal:
          "Theirs is the love song. It started there and stayed there.",
      },
      cause: {
        about:
          "Pick the kind of song you always come back to and pledge what it's worth.",
        reveal:
          "Our pick to start: the song that makes you dance — the only correct response to a hard week.",
      },
      neutral: {
        about:
          "Some people have one type of song that does the job no other can.",
        reveal:
          "Theirs is the song that makes you cry — chosen deliberately, for the right reasons.",
      },
    },
  },
  // ── Infinite — Food & Drink ──────────────────────────────────────────────────
  {
    title: "Drink",
    description: "Their go-to cup or glass",
    is_finite: false,
    categories: ["Food & Drink", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She made tea for everyone who came through the door, without asking. The kettle was the first thing on.",
        reveal:
          "Hers was tea. Everything worth talking about, she said, happened over a pot of it.",
      },
      celebrating_one: {
        about:
          "Her opinions on one drink have grown more specific every year, and her friends have stopped arguing.",
        reveal:
          "Hers is coffee. The opinions are extensive and, annoyingly, correct.",
      },
      celebrating_many: {
        about:
          "They chose the drinks for the day with the usual blend of disagreement and eventual total agreement.",
        reveal:
          "Theirs is champagne. For the occasion, they said. Also just right for them.",
      },
      cause: {
        about:
          "Pick the cup or glass that belongs to you and pledge what it's worth.",
        reveal:
          "Our pick to start: a proper stout — the one that tastes like it means it.",
      },
      neutral: {
        about:
          "Some people have one drink they return to at the end of any kind of day.",
        reveal:
          "Theirs is red wine. Kept for Fridays, mostly. The schedule is under review.",
      },
    },
  },
  {
    title: "Comfort food",
    description: "Food that felt like a hug",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      remembering: {
        about:
          "She had a dish she made for anyone who needed it — left in the oven, with a short note. The note was always short.",
        reveal:
          "Hers was shepherd's pie. She'd say she'd barely done anything. She'd done everything.",
      },
      celebrating_one: {
        about:
          "She makes no apologies for her relationship with one comfort food she considers both a treat and a right.",
        reveal:
          "Hers is fish and chips — the only food, she insists, that cannot be improved upon.",
      },
      celebrating_many: {
        about:
          "They've argued about the best version of one dish since their first meal together, and are both better cooks for it.",
        reveal:
          "Theirs is pasta — one of his recipes, one of hers, the contest unresolved.",
      },
      cause: {
        about:
          "Pick the food that feels like a hug and pledge what it's worth.",
        reveal:
          "Our pick to start: a proper roast dinner — the meal that fixes most things.",
      },
      neutral: {
        about:
          "Some people have one dish that means more than the sum of its ingredients.",
        reveal:
          "Theirs is beans on toast. They'll defend it to anyone who looks down on it.",
      },
    },
  },
  {
    title: "Biscuit",
    description: "One they always reached for",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      remembering: {
        about:
          "She kept a tin on the table for visitors; it appeared the moment anyone arrived. That meant everything was fine.",
        reveal:
          "Hers was the hobnob. Tin down, kettle on, the afternoon settled.",
      },
      celebrating_one: {
        about:
          "She has held the same position on biscuits since she was seven, and will not be revisiting it.",
        reveal:
          "Hers is the Bourbon. The conviction has never once wavered.",
      },
      celebrating_many: {
        about:
          "Their biscuit preferences are entirely incompatible, which they've found amusing rather than concerning for years.",
        reveal:
          "Hers is the chocolate digestive, his is something lesser. The tin carries both.",
      },
      cause: {
        about:
          "Pick the biscuit you always reach for and pledge what it's worth.",
        reveal:
          "Our pick to start: the ginger nut — structurally sound, morally serious.",
      },
      neutral: {
        about:
          "Some people have one biscuit that is simply, permanently theirs.",
        reveal:
          "Theirs is the custard cream. Underestimated, they'll tell you — and they're right.",
      },
    },
  },
  // ── Infinite — Sport ─────────────────────────────────────────────────────────
  {
    title: "Sport to watch",
    description: "Game they never missed",
    is_finite: false,
    categories: ["Sport", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She followed one sport with total devotion for forty years — on the radio, never the television, because it asked more of you.",
        reveal:
          "Hers was cricket. She could give you the score of any Test from 1972.",
      },
      celebrating_one: {
        about:
          "She follows one sport with an intensity her friends find both impressive and faintly alarming.",
        reveal:
          "Hers is tennis. She once lost her voice at Wimbledon and noticed the next morning.",
      },
      celebrating_many: {
        about:
          "They've never agreed on a sport in years of trying, and consider this a perfectly healthy arrangement.",
        reveal:
          "Theirs is rugby. They turned up to the same match independently before they'd even met.",
      },
      cause: {
        about:
          "Pick the game you'd never miss and pledge what it's worth.",
        reveal:
          "Our pick to start: snooker — the most soothing tension ever televised.",
      },
      neutral: {
        about:
          "Some people arrange their week around one fixture and have done for decades.",
        reveal:
          "Theirs is football. Watched alone, full attention, no commentary required.",
      },
    },
  },
  {
    title: "Sport to play",
    description: "How they loved to move",
    is_finite: false,
    categories: ["Sport", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She swam every morning until her seventies — the only sport, she said, where you couldn't have your phone.",
        reveal:
          "Hers was swimming. She loved it for exactly that reason.",
      },
      celebrating_one: {
        about:
          "She plays one sport with rather more ambition than her ranking strictly warrants, and makes no apology.",
        reveal:
          "Hers is tennis. She once beat someone half her age and described it for a week.",
      },
      celebrating_many: {
        about:
          "They tried playing against each other once, early on, and have wisely played doubles ever since.",
        reveal:
          "Theirs is badminton. They've never discussed what happened in the singles match.",
      },
      cause: {
        about:
          "Pick the sport you played with real feeling and pledge what it's worth.",
        reveal:
          "Our pick to start: walking — the sport that pretends not to be one.",
      },
      neutral: {
        about:
          "Some people have a sport in their hands or their legs that never quite leaves.",
        reveal:
          "Theirs is golf. The clubs have been ready in the boot for years.",
      },
    },
  },
  {
    title: "Form of exercise",
    description: "How they kept moving",
    is_finite: false,
    categories: ["Sport", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She walked every morning, same route, same pace, for thirty years — where she did her best thinking.",
        reveal:
          "Hers was walking. The lane still feels like hers.",
      },
      celebrating_one: {
        about:
          "She downloaded seventeen fitness apps and uses exactly one, consistently, having found it after two years of looking.",
        reveal:
          "Hers is running. Everything else was just looking for this.",
      },
      celebrating_many: {
        about:
          "They've never had an argument that a long walk didn't resolve. It's a documented fact of the relationship.",
        reveal:
          "Theirs is walking. The walks are the solution to most things.",
      },
      cause: {
        about:
          "Pick how you most love to move and pledge what it's worth.",
        reveal:
          "Our pick to start: dancing — the only exercise that doesn't feel like exercise.",
      },
      neutral: {
        about:
          "How a person keeps moving says something true about them.",
        reveal:
          "Theirs is yoga. They mean to do it properly, and occasionally do.",
      },
    },
  },
  // ── Infinite — Childhood ─────────────────────────────────────────────────────
  {
    title: "Childhood game",
    description: "What they played until dark",
    is_finite: false,
    categories: ["Childhood", "Sport"],
    placeholders: {
      remembering: {
        about:
          "She had strong views on the correct rules of one playground game, passed on with the precision she brought to everything.",
        reveal:
          "Hers was conkers. The rules she taught are still observed.",
      },
      celebrating_one: {
        about:
          "She'd play tomorrow if someone organised it, and has been saying so for ten years.",
        reveal:
          "Hers is rounders. She still has the arm, and is not subtle about it.",
      },
      celebrating_many: {
        about:
          "They spent their first summer together playing something with increasingly arbitrary rules, and remember it as the best afternoon.",
        reveal:
          "Theirs is hide and seek. Nobody won. Both consider it a triumph.",
      },
      cause: {
        about:
          "Pick the game you played until dark and pledge what it's worth.",
        reveal:
          "Our pick to start: British bulldogs — pure effort, certain collisions, no strategy at all.",
      },
      neutral: {
        about:
          "Some people have one childhood game that still says exactly who they are.",
        reveal:
          "Theirs is card games. Played with focus, and no mercy.",
      },
    },
  },
  {
    title: "School subject",
    description: "Lesson they always enjoyed",
    is_finite: false,
    categories: ["Childhood", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She taught one subject for forty years and could find a metaphor for it in anything at all.",
        reveal:
          "Hers was English. Every other subject, she said, was English if you looked properly.",
      },
      celebrating_one: {
        about:
          "She got a detention at fourteen for arguing with the textbook. She was right, and she has never stopped.",
        reveal:
          "Hers is science. She still argues with the textbook. It's still usually wrong.",
      },
      celebrating_many: {
        about:
          "They met in a class — an actual class — that neither of them remembers learning anything in.",
        reveal:
          "Theirs is languages. They met in a French class and speak no French. They consider this irrelevant.",
      },
      cause: {
        about:
          "Pick the lesson you always enjoyed and pledge what it's worth.",
        reveal:
          "Our pick to start: art — the only lesson where being wrong was allowed.",
      },
      neutral: {
        about:
          "Some people were made for one subject and quietly knew it the whole time.",
        reveal:
          "Theirs is history. The only subject, they'll argue, that tells you where you are.",
      },
    },
  },
  // ── Infinite — Literature ────────────────────────────────────────────────────
  {
    title: "Type of book",
    description: "What they loved to read",
    is_finite: false,
    categories: ["Literature", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She read long biographies, nothing abridged, and always had three on the go without ever losing her place in any.",
        reveal:
          "Hers was biography. A life well documented, she said, was a gift worth giving.",
      },
      celebrating_one: {
        about:
          "She reads everything but returns to one kind above all, marking passages and reporting them at dinner.",
        reveal:
          "Hers is travel writing. She reads it wherever she goes, and wherever she doesn't.",
      },
      celebrating_many: {
        about:
          "They share books constantly — not from duty, but because they always have something to say and the other is always interested.",
        reveal:
          "Theirs is the novel. They've yet to agree on one. The conversation is the point.",
      },
      cause: {
        about:
          "Pick what you most love to read and pledge what it's worth. A bookshelf is a portrait.",
        reveal:
          "Our pick to start: nature writing — the kind that teaches you to look properly.",
      },
      neutral: {
        about:
          "Some people have one kind of book that's simply where they live.",
        reveal:
          "Theirs is crime fiction. They solve it first, and will tell you so.",
      },
    },
  },
  {
    title: "Poet",
    description: "Voice that said what they felt",
    is_finite: false,
    categories: ["Literature"],
    placeholders: {
      remembering: {
        about:
          "She always had the right line for the right moment, and wrote them on cards she left for people to find.",
        reveal:
          "Hers was Mary Oliver. You'd come across one of her cards months later and understand.",
      },
      celebrating_one: {
        about:
          "She quoted a poem at a dinner once and made someone cry. She says she doesn't read poetry; there are four collections by her bed.",
        reveal:
          "Hers is Pam Ayres — said without apology, and rightly so.",
      },
      celebrating_many: {
        about:
          "She'd chosen the wedding poem years before they met; she told him on the train to the venue, and he agreed at once.",
        reveal:
          "Theirs is W.B. Yeats. She'd known the poem since she was nineteen.",
      },
      cause: {
        about:
          "Pick the voice that says what you feel and pledge what it's worth.",
        reveal:
          "Our pick to start: Seamus Heaney — the one who makes ordinary ground feel like history.",
      },
      neutral: {
        about:
          "Some people have one poet who simply speaks for them.",
        reveal:
          "Theirs is Philip Larkin. They'd never admit how often the lines turn up unbidden.",
      },
    },
  },
  // ── Infinite — Everyday life ─────────────────────────────────────────────────
  {
    title: "Hobby",
    description: "What they did just for love of it",
    is_finite: false,
    categories: ["Everyday life", "Nature"],
    placeholders: {
      remembering: {
        about:
          "She gardened the way other people pray, and said once that the garden taught her everything she knew about patience.",
        reveal:
          "Hers was gardening. Someone else tends it now, but it is still hers.",
      },
      celebrating_one: {
        about:
          "She took up one pursuit three years ago and now sees everything differently. She'd be horrified to hear it called a hobby.",
        reveal:
          "Hers is photography. She calls it a discipline, and she's right to.",
      },
      celebrating_many: {
        about:
          "They found the shared thing in their second year together, and now have opinions their friends find amusing.",
        reveal:
          "Theirs is cooking. It feeds them in every sense. The knives are, yes, excessive.",
      },
      cause: {
        about:
          "Pick what you do purely for love of it and pledge what it's worth.",
        reveal:
          "Our pick to start: fishing — the only hobby that's mostly sitting still on purpose.",
      },
      neutral: {
        about:
          "Some people have one thing they do for no reason but the doing of it.",
        reveal:
          "Theirs is reading. They always read; now they read properly.",
      },
    },
  },
  {
    title: "Way to spend Sunday",
    description: "Their idea of a perfect day off",
    is_finite: false,
    categories: ["Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She made Sunday the most important day of the week, on a schedule everyone who loved her defended.",
        reveal:
          "Hers was roast dinner with family. Noon arrival, nobody left before four.",
      },
      celebrating_one: {
        about:
          "She has firm views on what Sunday mornings are for, and will not be moved on the matter.",
        reveal:
          "Hers is the lie in. Not negotiable. Sunday mornings are not for early starts.",
      },
      celebrating_many: {
        about:
          "They drive somewhere different every few Sundays — not far, not planned, and somehow always good.",
        reveal:
          "Theirs is a drive in the countryside. He keeps a list; she has opinions about the list.",
      },
      cause: {
        about:
          "Pick your idea of a perfect day off and pledge what it's worth.",
        reveal:
          "Our pick to start: the long walk — the Sunday that earns the evening.",
      },
      neutral: {
        about:
          "Some people have one Sunday shape and protect it fiercely.",
        reveal:
          "Theirs is the pub lunch. Same table, same order, no notes.",
      },
    },
  },
  {
    title: "Smell",
    description: "Scent that took them somewhere",
    is_finite: false,
    categories: ["Everyday life", "Nature"],
    placeholders: {
      remembering: {
        about:
          "She grew lavender in every garden she had, and the smell attached itself to the rooms and the people she'd been near.",
        reveal:
          "Hers was lavender. It doesn't need explaining.",
      },
      celebrating_one: {
        about:
          "She has firm opinions about what the morning ought to smell like, and a machine with settings she defends.",
        reveal:
          "Hers is coffee in morning. Specific beans, specific settings, non-negotiable.",
      },
      celebrating_many: {
        about:
          "They married in a garden rained on the night before, and everyone remarked on the smell — the best thing about the venue, they agree.",
        reveal:
          "Theirs is garden after rain. Nobody had planned it.",
      },
      cause: {
        about:
          "Pick the scent that takes you somewhere instantly and pledge what it's worth.",
        reveal:
          "Our pick to start: sea air — the smell that resets a person.",
      },
      neutral: {
        about:
          "Some people have one smell that drops them straight into another time.",
        reveal:
          "Theirs is old books. Libraries, school halls, the smell of something about to begin.",
      },
    },
  },
  {
    title: "Weather for walk",
    description: "The sky that made them pull on their boots",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She walked every morning without exception, in every kind of weather — but her children knew which one was hers.",
        reveal:
          "Hers was the crisp winter morning. Cold air, clear sky, the garden white.",
      },
      celebrating_one: {
        about:
          "She has very particular views on the right conditions for a walk, and will wait for them rather than compromise.",
        reveal:
          "Hers is a bright spring day — cool enough to walk, warm enough to stop.",
      },
      celebrating_many: {
        about:
          "Their first proper walk was in weather neither would have chosen, and they've sought it out on purpose ever since.",
        reveal:
          "Theirs is after rain. The light, the smell, the empty path.",
      },
      cause: {
        about:
          "Pick the sky that makes you pull on your boots and pledge what it's worth.",
        reveal:
          "Our pick to start: golden hour — the walk that makes the whole day worthwhile.",
      },
      neutral: {
        about:
          "Some people have one kind of walking weather they'd choose over any fine day.",
        reveal:
          "Theirs is blustery and wild. They've never once waited for something gentler.",
      },
    },
  },
]

// ---------------------------------------------------------------------------
// Topic items
// ---------------------------------------------------------------------------

// display_order for finite topics — null/missing means sort alphabetically
const topicItemDisplayOrder: Record<string, Record<string, number>> = {
  "Day of the week": {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  },
  "Meal of the day": {
    Breakfast: 1,
    Brunch: 2,
    Lunch: 3,
    "Afternoon tea": 4,
    Dinner: 5,
    Supper: 6,
  },
  "Time of day": {
    "Early morning": 1,
    "Mid morning": 2,
    Lunchtime: 3,
    Afternoon: 4,
    "Late afternoon": 5,
    Dusk: 6,
    Evening: 7,
    "Late night": 8,
  },
  Decade: {
    "1920s": 1,
    "1930s": 2,
    "1940s": 3,
    "1950s": 4,
    "1960s": 5,
    "1970s": 6,
    "1980s": 7,
    "1990s": 8,
    "2000s": 9,
    "2010s": 10,
    "2020s": 11,
  },
  Season: {
    Spring: 1,
    Summer: 2,
    Autumn: 3,
    Winter: 4,
  },
}

const topicItems: Record<string, string[]> = {
  Colour: [
    "Black",
    "Blue",
    "Brown",
    "Green",
    "Grey",
    "Orange",
    "Pink",
    "Purple",
    "Red",
    "White",
    "Yellow",
  ],
  "Day of the week": [
    "Friday",
    "Monday",
    "Saturday",
    "Sunday",
    "Thursday",
    "Tuesday",
    "Wednesday",
  ],
  Decade: [
    "1920s",
    "1930s",
    "1940s",
    "1950s",
    "1960s",
    "1970s",
    "1980s",
    "1990s",
    "2000s",
    "2010s",
    "2020s",
  ],
  "Meal of the day": [
    "Afternoon tea",
    "Breakfast",
    "Brunch",
    "Dinner",
    "Lunch",
    "Supper",
  ],
  Season: ["Autumn", "Spring", "Summer", "Winter"],
  "Time of day": [
    "Afternoon",
    "Dusk",
    "Early morning",
    "Evening",
    "Late afternoon",
    "Late night",
    "Lunchtime",
    "Mid morning",
  ],
  Animal: [
    "Badger",
    "Cat",
    "Deer",
    "Dog",
    "Dolphin",
    "Duck",
    "Elephant",
    "Fox",
    "Hedgehog",
    "Horse",
    "Owl",
    "Rabbit",
    "Robin",
    "Swan",
  ],
  Bird: [
    "Barn owl",
    "Blackbird",
    "Blue tit",
    "Goldfinch",
    "Heron",
    "Kingfisher",
    "Pheasant",
    "Puffin",
    "Robin",
    "Sparrow",
    "Swan",
    "Wren",
  ],
  Biscuit: [
    "Bourbon",
    "Chocolate digestive",
    "Custard cream",
    "Digestive",
    "Garibaldi",
    "Ginger nut",
    "Hobnob",
    "Jammie Dodger",
    "Malted milk",
    "Pink Wafer",
    "Rich Tea",
    "Shortbread",
    "Tunnock\'s Caramel Wafer",
    "Viennese Whirl",
    "Wagon Wheel",
  ],
  "Childhood game": [
    "Board games",
    "British bulldogs",
    "Building dens",
    "Card games",
    "Conkers",
    "Elastics",
    "French cricket",
    "Hide and seek",
    "Hopscotch",
    "Marbles",
    "Rounders",
    "Skipping",
    "Stuck in the mud",
    "Tag",
  ],
  "Comfort food": [
    "Bacon sandwich",
    "Beans on toast",
    "Bread and butter pudding",
    "Cheese on toast",
    "Cottage pie",
    "Fish and chips",
    "Pasta",
    "Porridge",
    "Rice pudding",
    "Roast dinner",
    "Scrambled eggs",
    "Shepherd\'s pie",
    "Soup",
    "Toast",
  ],
  Drink: [
    "Beer",
    "Champagne",
    "Cider",
    "Coffee",
    "Gin & tonic",
    "Hot chocolate",
    "Juice",
    "Red wine",
    "Soft drink",
    "Stout",
    "Tea",
    "Whisky",
    "White wine",
  ],
  Film: [
    "Brief Encounter",
    "Casablanca",
    "Four Weddings and a Funeral",
    "Gone with the Wind",
    "Gregory\'s Girl",
    "It\'s a Wonderful Life",
    "Lawrence of Arabia",
    "Local Hero",
    "Paddington 2",
    "Schindler\'s List",
    "Some Like It Hot",
    "The Italian Job",
    "The Shawshank Redemption",
    "The Sound of Music",
    "Whisky Galore",
  ],
  "Film genre": [
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Horror",
    "Musical",
    "Romance",
    "Science fiction",
    "Thriller",
    "War film",
    "Western",
  ],
  Flower: [
    "Bluebell",
    "Daffodil",
    "Daisy",
    "Foxglove",
    "Lavender",
    "Lily",
    "Magnolia",
    "Peony",
    "Poppy",
    "Primrose",
    "Rose",
    "Sunflower",
    "Sweet pea",
    "Wisteria",
  ],
  "Form of exercise": [
    "Cycling",
    "Dancing",
    "Football",
    "Gardening",
    "Golf",
    "Pilates",
    "Running",
    "Swimming",
    "Tai chi",
    "Tennis",
    "Walking",
    "Yoga",
  ],
  Hobby: [
    "Birdwatching",
    "Collecting",
    "Cooking",
    "Crosswords or puzzles",
    "Fishing",
    "Gardening",
    "Knitting or sewing",
    "Model making",
    "Painting or drawing",
    "Photography",
    "Playing music",
    "Reading",
    "Volunteering",
    "Walking",
    "Woodwork",
  ],
  Instrument: [
    "Accordion",
    "Banjo",
    "Cello",
    "Drums",
    "Flute",
    "Guitar",
    "Harp",
    "Organ",
    "Piano",
    "Saxophone",
    "Trumpet",
    "Violin",
    "Voice",
  ],
  Landscape: [
    "Chalk downs",
    "City skyline",
    "Coastline",
    "Farmland",
    "Harbour",
    "Loch",
    "Mountains",
    "Open moorland",
    "River valley",
    "Rolling hills",
    "Village green",
    "Woodland",
  ],
  "Music era": [
    "Eighties pop",
    "Jazz age",
    "Nineties indie and dance",
    "Noughties",
    "Rock and roll",
    "Seventies soul and funk",
    "Streaming era",
    "Swinging sixties",
  ],
  "Music genre": [
    "Blues",
    "Classical",
    "Country",
    "Electronic",
    "Folk",
    "Hip-Hop",
    "Jazz",
    "Musical theatre",
    "Pop",
    "Reggae",
    "Rock",
    "Soul",
  ],
  Place: [
    "Abroad",
    "By river",
    "Childhood home",
    "City",
    "Countryside",
    "Garden",
    "Home",
    "Mountains",
    "Pub",
    "Seaside",
  ],
  Poet: [
    "Dylan Thomas",
    "Emily Dickinson",
    "John Betjeman",
    "John Keats",
    "Mary Oliver",
    "Maya Angelou",
    "Pam Ayres",
    "Philip Larkin",
    "R.S. Thomas",
    "Roger McGough",
    "Seamus Heaney",
    "Ted Hughes",
    "W.B. Yeats",
    "Wilfred Owen",
    "William Shakespeare",
  ],
  "School subject": [
    "Art",
    "Drama",
    "English",
    "Geography",
    "History",
    "Languages",
    "Maths",
    "Music",
    "PE",
    "RE",
    "Science",
    "Woodwork or cookery",
  ],
  Smell: [
    "Bonfire",
    "Bread baking",
    "Coffee in morning",
    "Fresh laundry",
    "Freshly cut grass",
    "Garden after rain",
    "Lavender",
    "Old books",
    "Old churches",
    "Petrol",
    "Rain on dry earth",
    "Sea air",
    "Sunscreen",
    "Woodsmoke",
  ],
  Song: [
    "Abide With Me — traditional",
    "Angels — Robbie Williams",
    "Bohemian Rhapsody — Queen",
    "Danny Boy — traditional",
    "Don\'t Look Back in Anger — Oasis",
    "Jerusalem — Parry",
    "My Way — Frank Sinatra",
    "Over the Rainbow — Judy Garland",
    "Waterloo Sunset — The Kinks",
    "What a Wonderful World — Louis Armstrong",
    "Wind Beneath My Wings — Bette Midler",
    "You\'ll Never Walk Alone — traditional",
  ],
  "Sport to play": [
    "Badminton",
    "Bowls",
    "Cricket",
    "Cycling",
    "Darts",
    "Football",
    "Golf",
    "Running",
    "Swimming",
    "Table tennis",
    "Tennis",
    "Walking",
  ],
  "Sport to watch": [
    "Athletics",
    "Bowls",
    "Cricket",
    "Cycling",
    "Darts",
    "Football",
    "Golf",
    "Horse racing",
    "Rugby",
    "Snooker",
    "Swimming",
    "Tennis",
  ],
  Tree: [
    "Apple",
    "Beech",
    "Cherry blossom",
    "Elm",
    "Horse chestnut",
    "Oak",
    "Pine",
    "Rowan",
    "Scots pine",
    "Silver birch",
    "Willow",
    "Yew",
  ],
  "TV show": [
    "Chat show",
    "Cooking show",
    "Crime thriller",
    "Drama series",
    "Nature documentary",
    "News programme",
    "Period drama",
    "Quiz show",
    "Reality show",
    "Sitcom",
    "Soap opera",
    "Sport",
  ],
  "Type of book": [
    "Biography",
    "Children\'s books",
    "Crime fiction",
    "History",
    "Memoir",
    "Nature writing",
    "Novel",
    "Poetry",
    "Science fiction",
    "Self-help",
    "Short stories",
    "Travel writing",
  ],
  "Type of holiday": [
    "Beach holiday",
    "Camping",
    "City break",
    "Countryside retreat",
    "Cruise",
    "Skiing",
    "Staycation",
    "Visiting family",
    "Walking holiday",
    "Winter sun",
  ],
  "Type of song": [
    "Anthem",
    "Folk song",
    "Hymn or spiritual",
    "Love song",
    "Lullaby",
    "Show tune",
    "Song from childhood",
    "Song that makes you cry",
    "Song that makes you dance",
    "Song that tells story",
  ],
  "Way to spend Sunday": [
    "Cooking something special",
    "Doing absolutely nothing",
    "Drive in countryside",
    "Going to church",
    "Lie in",
    "Long walk",
    "Pottering in garden",
    "Pub lunch",
    "Reading all day",
    "Roast dinner with family",
    "Visiting somewhere new",
    "Watching sport",
  ],
  "Way to travel": [
    "By bicycle",
    "By boat",
    "By bus",
    "By car",
    "By plane",
    "By train",
    "On foot",
    "On motorbike",
  ],
  Weather: [
    "Blustery wind",
    "Bright sunshine",
    "Crisp frost",
    "Dewy spring morning",
    "Golden autumn light",
    "Light snow",
    "Misty morning",
    "Overcast and mild",
    "Thunderstorm",
    "Warm rain",
  ],
  "Weather for walk": [
    "After rain",
    "Autumn drizzle",
    "Blustery and wild",
    "Bright spring day",
    "Crisp winter morning",
    "Golden hour",
    "Misty and still",
    "Warm summer evening",
  ],
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedCharities() {
  console.log("Seeding charities…")
  let inserted = 0
  for (const charity of charities) {
    const { data: existing } = await supabase
      .from("charities")
      .select("id")
      .eq("name", charity.name)
      .maybeSingle()
    if (existing) continue
    const { error } = await supabase.from("charities").insert(charity)
    if (error) console.error(`  ✗ ${charity.name}:`, error.message)
    else inserted++
  }
  console.log(
    `  ${inserted} inserted, ${charities.length - inserted} already existed`
  )
}

async function seedCategories() {
  console.log("Seeding categories…")
  let inserted = 0
  for (const cat of categories) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("label", cat.label)
      .maybeSingle()
    if (existing) continue
    const { error } = await supabase.from("categories").insert(cat)
    if (error) console.error(`  ✗ ${cat.label}:`, error.message)
    else inserted++
  }
  console.log(
    `  ${inserted} inserted, ${categories.length - inserted} already existed`
  )
}

async function seedTopics() {
  // Validate total coverage: every seed topic must have an entry in the
  // combined map; extra map entries are future topics (logged, not thrown).
  const seedTitles = topics.map((t) => t.title)
  const mapTitles = new Set(Object.keys(combinedPlaceholders))
  const seedMisses = seedTitles.filter((t) => !mapTitles.has(t))
  if (seedMisses.length > 0) {
    throw new Error(
      `Seed topics missing from combined placeholder map:\n${seedMisses.map((t) => `  "${t}"`).join("\n")}`
    )
  }

  console.log("Seeding topics…")
  let inserted = 0
  let updated = 0
  for (const topic of topics) {
    const placeholders = combinedPlaceholders[topic.title]

    const { data: existing } = await supabase
      .from("topics")
      .select("id, is_finite")
      .eq("title", topic.title)
      .maybeSingle()

    if (existing) {
      const patch: Record<string, unknown> = { placeholders }
      if (existing.is_finite !== topic.is_finite)
        patch.is_finite = topic.is_finite
      await supabase.from("topics").update(patch).eq("id", existing.id)
      updated++
      continue
    }

    const { error } = await supabase.from("topics").insert({
      title: topic.title,
      description: topic.description,
      is_finite: topic.is_finite,
      is_active: true,
      placeholders,
    })
    if (error) console.error(`  ✗ ${topic.title}:`, error.message)
    else inserted++
  }
  console.log(`  ${inserted} inserted, ${updated} updated`)
}

async function seedTopicItems() {
  console.log("Seeding topic items…")
  let inserted = 0

  const { data: allTopics } = await supabase.from("topics").select("id, title")
  const topicByTitle = Object.fromEntries(
    (allTopics ?? []).map((t) => [t.title, t.id])
  )

  for (const [title, items] of Object.entries(topicItems)) {
    const topicId = topicByTitle[title]
    if (!topicId) {
      console.error(`  ✗ Topic not found: ${title}`)
      continue
    }

    const { data: existing } = await supabase
      .from("topic_items")
      .select("label")
      .eq("topic_id", topicId)
    const existingLabels = new Set(
      (existing ?? []).map((i: { label: string }) => i.label.toLowerCase())
    )

    const orderMap = topicItemDisplayOrder[title]
    const toInsert = items
      .filter((label) => !existingLabels.has(label.toLowerCase()))
      .map((label) => ({
        topic_id: topicId,
        label,
        is_canonical: true,
        source: "seed",
        markets: ["en-GB"],
        ...(orderMap?.[label] !== undefined
          ? { display_order: orderMap[label] }
          : {}),
      }))

    if (toInsert.length === 0) continue

    const { error } = await supabase.from("topic_items").insert(toInsert)
    if (error) console.error(`  ✗ Items for "${title}":`, error.message)
    else inserted += toInsert.length
  }

  console.log(`  ${inserted} items inserted`)
}

async function seedTopicCategories() {
  console.log("Seeding topic–category links…")
  let inserted = 0

  const { data: allTopics } = await supabase.from("topics").select("id, title")
  const topicByTitle = Object.fromEntries(
    (allTopics ?? []).map((t) => [t.title, t.id])
  )

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, label")
  const categoryByLabel = Object.fromEntries(
    (allCategories ?? []).map((c: { id: string; label: string }) => [
      c.label,
      c.id,
    ])
  )

  for (const topic of topics) {
    const topicId = topicByTitle[topic.title]
    if (!topicId) continue

    for (const catLabel of topic.categories) {
      const categoryId = categoryByLabel[catLabel]
      if (!categoryId) {
        console.error(`  ✗ Category not found: ${catLabel}`)
        continue
      }

      const { data: existing } = await supabase
        .from("topic_categories")
        .select("topic_id")
        .eq("topic_id", topicId)
        .eq("category_id", categoryId)
        .maybeSingle()

      if (existing) continue

      const { error } = await supabase
        .from("topic_categories")
        .insert({ topic_id: topicId, category_id: categoryId })
      if (error)
        console.error(`  ✗ Link ${topic.title} → ${catLabel}:`, error.message)
      else inserted++
    }
  }

  console.log(`  ${inserted} links inserted`)
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Starting seed…\n")
  await seedCharities()
  await seedCategories()
  await seedTopics()
  await seedTopicItems()
  await seedTopicCategories()
  console.log("\nSeed complete.")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
