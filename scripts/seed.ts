import { createClient } from "@supabase/supabase-js";
import { regeneratedPlaceholders } from "./placeholders-regenerated";
import { regeneratedPlaceholdersBatch2 } from "./placeholders-regenerated-2";
import { regeneratedPlaceholdersBatch3 } from "./placeholders-regenerated-3";
import { regeneratedPlaceholdersBatch4 } from "./placeholders-regenerated-4";
import { regeneratedPlaceholdersBatch5 } from "./placeholders-regenerated-5";
import { regeneratedPlaceholdersBatch6 } from "./placeholders-regenerated-6";
import { celebratingManySetOverrides } from "./celebrating-many-groups";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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
];

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
];

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
// All reveal answers must exist in the favourites list.
// Marcus Webb (achievement) — marathon runner; placeholder about is charity-free.
// ---------------------------------------------------------------------------

type RegisterKey =
  | "remembering"
  | "celebrating_one"
  | "celebrating_many"
  | "cause"
  | "neutral";

// Raw seed data uses occasion-type keys for readability; normalised to 5
// register keys before writing to the DB.
// Topics with regenerated placeholders use register keys directly (no normalization needed).
type RawTopicPlaceholders = {
  [occasion: string]: { about: string; reveal: string };
};

type TopicPlaceholders = Record<
  RegisterKey,
  { pronouns: "she" | "he" | "they"; about: string; reveal: string }
>;

type TopicPlaceholders = Record<
  RegisterKey,
  {
    about: string;
    reveal: string;
    pronouns?: "she" | "he" | "they";
    group?: "pair" | "set";
  }
>;

const REGISTER_KEYS = new Set<string>([
  "remembering",
  "celebrating_one",
  "celebrating_many",
  "cause",
  "neutral",
]);

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
};

/**
 * Combined register-keyed placeholder map built from all 6 regenerated-batch
 * files.  Duplicate topic titles across batches throw immediately.  Every seed
 * topic title must appear here; extra map entries are future topics not yet in
 * the seed and are listed (not thrown) at startup.
 */
const combinedPlaceholders = (() => {
  const batches: Record<
    string,
    Record<
      RegisterKey,
      { about: string; reveal: string; pronouns?: "she" | "he" | "they" }
    >
  >[] = [
    regeneratedPlaceholders as never,
    regeneratedPlaceholdersBatch2 as never,
    regeneratedPlaceholdersBatch3 as never,
    regeneratedPlaceholdersBatch4 as never,
    regeneratedPlaceholdersBatch5 as never,
    regeneratedPlaceholdersBatch6 as never,
  ];
  const map: Record<
    string,
    Record<
      RegisterKey,
      {
        about: string;
        reveal: string;
        pronouns?: "she" | "he" | "they";
        group?: "pair" | "set";
      }
    >
  > = {};
  for (const batch of batches) {
    for (const [title, data] of Object.entries(batch)) {
      if (map[title])
        throw new Error(
          `Duplicate topic title in placeholder batches: "${title}"`,
        );
      map[title] = { ...data };
    }
  }
  // Apply group tags to celebrating_many entries
  for (const [title, registers] of Object.entries(map)) {
    if (!registers.celebrating_many) continue;
    const override = celebratingManySetOverrides[title];
    if (override) {
      registers.celebrating_many = { ...override };
    } else {
      registers.celebrating_many = {
        ...registers.celebrating_many,
        group: "pair",
      };
    }
  }
  return map;
})();

type TopicSeed = {
  title: string;
  description: string;
  is_finite: boolean;
  categories: string[];
  placeholders: RawTopicPlaceholders | TopicPlaceholders;
};

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
        reveal: "Theirs is red. No particular reason. It simply always wins.",
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
    description: "Bloom that's entirely theirs",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      remembering: {
        about:
          "She grew the same plant in every garden she ever had — same spot where she could manage it, same care each year.",
        reveal: "Hers was lavender. The smell is still entirely hers.",
      },
      celebrating_one: {
        about:
          "She keeps the flat stocked with one particular bloom from April to June, having decided years ago there's no reasonable argument against it.",
        reveal: "Hers is the peony. Nobody has yet challenged the policy.",
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
        reveal: "Theirs is the rose. Predictable, they'll admit. Also correct.",
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
        about: "Pick the tree you'd sit under and pledge what it's worth.",
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
        reveal: "Theirs is the garden. Wherever the day goes, it ends there.",
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
        reveal: "Hers was the train. She was right about that, too.",
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
        reveal: "Theirs is Local Hero. He came round eventually.",
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
        reveal: "Hers was the documentary — the only honest films, she said.",
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
        reveal: "Theirs is romance. Settled since the first date.",
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
        reveal: "Hers was Jerusalem — Parry. Always the same verse first.",
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
        reveal: "Hers was folk. The only music, she said, that told the truth.",
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
        reveal: "Theirs is soul. She brought it; he agreed at once.",
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
        reveal: "Hers is eighties pop. Every track, every year, 1984 to 1989.",
      },
      celebrating_many: {
        about:
          "They grew up to the same sound in different cities and discovered the overlap on a first date that ran long.",
        reveal: "Theirs is the noughties. The wedding playlist made it plain.",
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
        about: "Pick the sound that moves you most and pledge what it's worth.",
        reveal:
          "Our pick to start: the cello — the instrument that sounds like it means it.",
      },
      neutral: {
        about:
          "Some people have an instrument that's simply theirs, played well or otherwise.",
        reveal: "Theirs is the guitar. Nothing flashy, always enough.",
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
        reveal: "Theirs is the love song. It started there and stayed there.",
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
        reveal: "Hers is the Bourbon. The conviction has never once wavered.",
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
        about: "Pick the game you'd never miss and pledge what it's worth.",
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
        reveal: "Hers was swimming. She loved it for exactly that reason.",
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
        reveal: "Hers was walking. The lane still feels like hers.",
      },
      celebrating_one: {
        about:
          "She downloaded seventeen fitness apps and uses exactly one, consistently, having found it after two years of looking.",
        reveal: "Hers is running. Everything else was just looking for this.",
      },
      celebrating_many: {
        about:
          "They've never had an argument that a long walk didn't resolve. It's a documented fact of the relationship.",
        reveal: "Theirs is walking. The walks are the solution to most things.",
      },
      cause: {
        about: "Pick how you most love to move and pledge what it's worth.",
        reveal:
          "Our pick to start: dancing — the only exercise that doesn't feel like exercise.",
      },
      neutral: {
        about: "How a person keeps moving says something true about them.",
        reveal:
          "Theirs is yoga. They mean to do it properly, and occasionally do.",
      },
    },
  },
  {
    title: "Saying",
    description: "The phrase they always reached for",
    is_finite: false,
    categories: ["Everyday life"],
    placeholders: {
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the saying they always reach for.",
        reveal: "Name the saying and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite saying — the one they always come back to — is a detail worth including.",
        reveal: "Pick the saying and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite saying is one of those things that says something true about a person.",
        reveal: "Pick the saying and say what it means to you.",
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
        reveal: "Hers was conkers. The rules she taught are still observed.",
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
        reveal: "Theirs is card games. Played with focus, and no mercy.",
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
        about: "Pick the lesson you always enjoyed and pledge what it's worth.",
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
        reveal: "Hers is Pam Ayres — said without apology, and rightly so.",
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
        about: "Some people have one poet who simply speaks for them.",
        reveal:
          "Theirs is Philip Larkin. They'd never admit how often the lines turn up unbidden.",
      },
    },
  },
  {
    title: "Author",
    description: "Writer whose books they'd press into anyone's hands",
    is_finite: false,
    categories: ["Literature"],
    placeholders: {
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the author whose books they always return to.",
        reveal: "Name the author and what makes them theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite author — the one they always recommend — is a detail worth including.",
        reveal: "Pick the author and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite author is one of those things that says something true about a person.",
        reveal: "Pick the author and say what they mean to you.",
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
        reveal: "Theirs is reading. They always read; now they read properly.",
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
        about: "Some people have one Sunday shape and protect it fiercely.",
        reveal: "Theirs is the pub lunch. Same table, same order, no notes.",
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
        reveal: "Hers was lavender. It doesn't need explaining.",
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
        reveal: "Theirs is garden after rain. Nobody had planned it.",
      },
      cause: {
        about:
          "Pick the scent that takes you somewhere instantly and pledge what it's worth.",
        reveal: "Our pick to start: sea air — the smell that resets a person.",
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
        reveal: "Theirs is after rain. The light, the smell, the empty path.",
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

  // Nature batch — new topics
  {
    title: "Insect",
    description: "The small creature that makes them stop and look",
    is_finite: false,
    categories: ["Nature", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who turned every spring into a small science project. One creature came back to the kitchen windowsill year after year, watched from egg to wing by a rotating audience of children.",
        reveal:
          "Hers was the butterfly. She raised them from caterpillars on the windowsill every summer and let the children release them.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has taken up something at the bottom of the garden that she will tell you, at length, is the most important hobby a person can have.",
        reveal:
          "Hers is the bee. She keeps a hive at the bottom of the garden and talks about it more than her friends strictly need.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon, raising for the RNLI through favpoll. One creature kept pace with him along the water on the early miles, and he came to look out for it.",
        reveal:
          "His is the dragonfly. He clocked them over the same stretch of canal on every training run and says nothing on the route was faster.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the small creature that makes them stop and look. A favourite insect is a surprisingly telling choice.",
        reveal: "Name the insect and what it is about it.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite insect — the one they always stop for — is a small detail worth including.",
        reveal: "Pick an insect and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite insect is one of those small choices that says something.",
        reveal: "Pick an insect and say what it is about it.",
      },
    },
  },
  {
    title: "Sea creature",
    description: "The one from below the surface they could watch for hours",
    is_finite: false,
    categories: ["Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who loved the sea from a distance and one of its stranger inhabitants most of all. A single image of it hung in her kitchen for as long as anyone could remember.",
        reveal:
          "Hers was the seahorse. She kept a painting of one above the kitchen table for forty years.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has become unexpectedly evangelical about one sea creature and its intelligence. Her friends have learned not to get her started, and then get her started anyway.",
        reveal:
          "Hers is the octopus. She has opinions about how clever they are and will share them unprompted.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon along the coast, raising for the RNLI through favpoll. One set of locals watched him go past from the rocks every single morning.",
        reveal:
          "His is the seal. He passed the same colony on the rocks every morning of training, and the RNLI he raised for works the same water.",
      },
      recovery: {
        about:
          "Claire finished her treatment and found comfort in slow, certain things. One creature, watched on a screen for hours, seemed to embody exactly the pace she needed.",
        reveal:
          "Hers is the sea turtle. She watched hours of footage of them through the long months and found the slow, certain way they moved steadying.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the creature from below the surface that captivates them. A favourite sea creature is a quietly revealing choice.",
        reveal: "Name the sea creature and what draws them to it.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite sea creature — the one they could watch for hours — is worth including.",
        reveal: "Pick a sea creature and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sea creature is one of those choices that says something.",
        reveal: "Pick a sea creature and say what draws you to it.",
      },
    },
  },
  {
    title: "Constellation",
    description: "The shape in the night sky that is theirs",
    is_finite: false,
    categories: ["Nature", "Time"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who always knew where to look up. One shape in the winter sky was hers — the first thing she found, wherever she was, the moment it got dark enough.",
        reveal:
          "Hers was Orion. She could find it from any back garden in any town she ever lived in, and always pointed it out.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has been pointing out the same shape in the sky to reluctant companions since she was nine. She is not deterred by their indifference.",
        reveal:
          "Hers is Cassiopeia. She learned to find it on a camping trip at nine and has shown everyone she's camped with since.",
      },
      engagement: {
        about:
          "Callum and Sophie are not astronomers, but there is one shape in the sky they both know, and they were both looking at it on the night everything changed.",
        reveal:
          "Theirs is the Plough — the one constellation they can both reliably find, looked up at from the hillside the night Callum proposed.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the shape in the night sky that is theirs. A favourite constellation is a lovely thing to know about someone.",
        reveal: "Name the constellation and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite constellation — the one they always find first — is a detail worth including.",
        reveal: "Pick a constellation and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite constellation is one of those quietly personal choices.",
        reveal: "Pick a constellation and say what it means to you.",
      },
    },
  },
  {
    title: "Gemstone",
    description: "The stone that is somehow theirs",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who wore one stone every day of her married life, in defiance of an old superstition she found ridiculous. Fifty years suggested she was right.",
        reveal:
          "Hers was the opal. Her engagement ring held one, against all advice about bad luck, for fifty years.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has worn exactly one kind of stone since she was old enough to choose. She has a rule about it. She does not break the rule.",
        reveal:
          "Hers is the emerald. Her birthstone, she'll tell you, and the only colour of jewellery she'll wear.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She has worn the same small piece of jewellery on every day that mattered in her career — a gift from the head who first believed in her.",
        reveal:
          "Hers is the sapphire. A small one, in a brooch from her first head teacher, worn on every important day since.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the stone that is somehow theirs. A favourite gemstone says more than it should.",
        reveal: "Name the gemstone and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite gemstone — birthstone or otherwise — is a small detail worth including.",
        reveal: "Pick a gemstone and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite gemstone is one of those choices that says something.",
        reveal: "Pick a gemstone and say what it means to you.",
      },
    },
  },

  // Sport batch — new topics (Sport to watch already exists; only its items
  // list is replaced, below)
  {
    title: "Football team",
    description: "The one they'd never give up on",
    is_finite: false,
    categories: ["Sport"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who was taken to her first match at eight and never wavered. She saw the club through everything, good and unbearable, and would not hear a word against it.",
        reveal:
          "Hers was Liverpool. She stood on the Kop as a girl and never supported anyone else for seventy years.",
      },
      retirement: {
        about:
          "David is retiring from engineering, but the other constant of his life continues uninterrupted — the same seat, the same friends, the same hope renewed every August.",
        reveal:
          "His is Newcastle United. Thirty-five years of the same season ticket, the same seat, the same conversations with the same people.",
      },
      promotion: {
        about:
          "Kwame has just made Head of Product. He supports one team with the same analytical intensity he brings to a roadmap, and he is not always wrong about either.",
        reveal:
          "His is Arsenal. He has theories about the team and the workplace, and he believes they are the same theories.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the football team they'd never give up on. The one stitched into their week.",
        reveal: "Name the team and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite football team — the one they were raised on or chose for life — is always worth including.",
        reveal: "Pick the team and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite football team is one of those things that says a great deal in a single word.",
        reveal: "Pick the team and say what it means to you.",
      },
    },
  },
  {
    title: "Footballer",
    description: "The one they'd cross a city to watch",
    is_finite: false,
    categories: ["Sport"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who watched the 1966 final as a teenager and never forgot the captain. She spoke about that summer for the rest of her life.",
        reveal:
          "Hers was Bobby Moore. She saw 1966 as a teenager and said he was the most graceful man she ever watched play.",
      },
      tribute: {
        about:
          "A mentor who had one player he held up as the example of the thing that can't be coached. He used it to make a point about talent, and the point was usually well made.",
        reveal:
          "His was George Best. He said you could teach technique but not whatever Best had.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and came to women's football late, through one tournament, and has one player she now organises her weekends around.",
        reveal:
          "Hers is Lucy Bronze. She started watching after 2022 and says she should have been watching all along.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the footballer they'd cross a city to watch. The one they could talk about for hours.",
        reveal: "Name the footballer and what they mean to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite footballer — the one they'll always defend — is a detail worth including.",
        reveal: "Pick the footballer and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite footballer is one of those things people have very firm views on.",
        reveal: "Pick the footballer and say what they mean to you.",
      },
    },
  },
  {
    title: "Cricket team",
    description: "The one they'd give a summer to",
    is_finite: false,
    categories: ["Sport"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who followed every Test by radio and kept a scorebook in her own hand for forty years, a shelf of them in the spare room.",
        reveal:
          "Hers was England. She listened to every Test on the radio and kept her own scorebook by hand.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years, much of it spent at one ground watching one county, in conditions that would test anyone's commitment. His held.",
        reveal:
          "His is Yorkshire. He has watched them at Headingley for thirty-five years through more disappointment than triumph and regrets nothing.",
      },
      tribute: {
        about:
          "A mentor who held one team, in one era, as the high-water mark of sport itself. He had seen them play and never quite recovered from it.",
        reveal:
          "His was the West Indies. He said the great side of the eighties was the finest thing he ever saw in any sport.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the cricket team they'd give a summer to. The one that runs through their warm months.",
        reveal: "Name the team and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite cricket team — county or country — is a detail worth including.",
        reveal: "Pick the team and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite cricket team is one of those quietly devoted choices.",
        reveal: "Pick the team and say what it means to you.",
      },
    },
  },
  {
    title: "Rugby team",
    description: "The one they'd lose their voice for",
    is_finite: false,
    categories: ["Sport"],
    placeholders: {
      tribute: {
        about:
          "A mentor who admired one team for a quality he found rare — the sense that the result was decided before kick-off. He meant it as the highest compliment.",
        reveal:
          "His was New Zealand — the All Blacks — who he said carried an inevitability no other team in any sport could match.",
      },
      retirement: {
        about:
          "David is retiring, and one of his longest-running commitments is about to get more of his time — the same stand, the same matches, finally without Monday morning looming.",
        reveal:
          "His is Leicester Tigers. He has had a season ticket at Welford Road for thirty years and intends to use it more now.",
      },
      graduation: {
        about:
          "Tom grew up in Wales and has one team tied to every spring of his childhood, and one sound he says explains the whole country in about ninety seconds.",
        reveal:
          "His is Wales. He watched every Six Nations growing up and says nothing else sounds like the Principality Stadium when the anthem starts.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the rugby team they'd lose their voice for. League or union, club or country.",
        reveal: "Name the team and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite rugby team — the one they follow through every campaign — is a detail worth including.",
        reveal: "Pick the team and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite rugby team is one of those loyalties that says something.",
        reveal: "Pick the team and say what it means to you.",
      },
    },
  },
  {
    title: "F1 driver",
    description: "The one they'd set the alarm for",
    is_finite: false,
    categories: ["Sport"],
    placeholders: {
      tribute: {
        about:
          "A mentor who held one driver as the example of total commitment to a craft. He used him to explain what it looked like to do something completely, with nothing held back.",
        reveal:
          "His was Ayrton Senna. He said no one else drove as though the car were an extension of a thought.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has followed one driver across his entire career, through every team and title, and has firm views on each chapter of it.",
        reveal:
          "Hers is Lewis Hamilton. She has followed his whole career and considers the Ferrari move the bravest thing in the sport.",
      },
      promotion: {
        about:
          "Kwame has just made Head of Product. He follows one driver closely and has drawn what he insists are transferable management lessons. The jury, in the form of his team, is out.",
        reveal:
          "His is Max Verstappen. He admires the ruthlessness and has tried to import some of it into his stand-ups.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the F1 driver they'd set the alarm for. The one whose races they refuse to miss.",
        reveal: "Name the driver and what they mean to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite F1 driver — the one they'll always back — is a detail worth including.",
        reveal: "Pick the driver and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite F1 driver is one of those things people will argue about happily for hours.",
        reveal: "Pick the driver and say what they mean to you.",
      },
    },
  },
  {
    title: "Tennis player",
    description: "The one they'd stay up through five sets for",
    is_finite: false,
    categories: ["Sport"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had one player she held up to her pupils, especially the girls, as proof that the fight was about more than the score.",
        reveal:
          "Hers was Billie Jean King. She admired what she did off the court as much as on it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one player tied to one unforgettable afternoon, and a stress response to his matches that her family have learned to leave the room for.",
        reveal:
          "Hers is Andy Murray. She watched the 2013 final on her feet and has never been calm during a Murray match since.",
      },
      recovery: {
        about:
          "Claire finished her treatment and found something steadying in one player's long history of falling and returning. She watched a lot of old finals. They helped.",
        reveal:
          "Hers is Rafael Nadal. She says nobody understood coming back from injury better, and it helped to watch.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the tennis player they'd stay up through five sets for. The one they're loyal to.",
        reveal: "Name the player and what they mean to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite tennis player — the one they always want to win — is a detail worth including.",
        reveal: "Pick the player and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite tennis player is one of those choices people hold with real loyalty.",
        reveal: "Pick the player and say what they mean to you.",
      },
    },
  },
  {
    title: "Sports star",
    description: "The one they'd say was the greatest of all",
    is_finite: false,
    categories: ["Sport"],
    placeholders: {
      tribute: {
        about:
          "A mentor who held up one figure as proof that greatness in sport could mean something far beyond it. He used him to make a point about courage that had nothing to do with boxing.",
        reveal:
          "His was Muhammad Ali. He said Ali was the rare case of someone who was exactly as significant as people claimed.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon, raising for the RNLI through favpoll. He points to one athlete and one summer as the start of the whole improbable journey.",
        reveal:
          "His is Mo Farah. He watched 2012 and something shifted; the marathon was the eventual result.",
      },
      award: {
        about:
          "Amelia, just named Teacher of the Year, has one sporting figure she returns to in the classroom every year as a lesson in what sustained effort looks like. The pupils are always won over.",
        reveal:
          "Hers is Jessica Ennis-Hill. She shows her pupils the 2012 heptathlon every year and it never fails.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the sports star they'd call the greatest of all. Across any sport, the one that settles it.",
        reveal: "Name the sports star and what they mean to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite sports star — across any sport — is a detail worth including.",
        reveal: "Pick the sports star and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sports star is one of those things everyone has an answer to.",
        reveal: "Pick the sports star and say what they mean to you.",
      },
    },
  },
  {
    title: "Sporting moment",
    description: "The one they'd watch again right now",
    is_finite: false,
    categories: ["Sport", "Time"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who remembered one afternoon as the moment the entire country seemed to hold its breath together. She described it the same way every time, and it was always worth hearing.",
        reveal:
          "Hers was 1966. She was at a street party for the final and said the whole country felt like one room that afternoon.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years, and one of his earliest working summers was interrupted by something on the radio that he still describes in detail.",
        reveal:
          "His is Botham's Ashes. He listened to 1981 on a radio at work and says nobody got anything done that week.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon, raising for the RNLI through favpoll. One night of one Olympics planted something that took years to grow into a start line.",
        reveal:
          "His is Super Saturday. He watched 2012 and the idea of running anything at all started there.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the sporting moment they'd watch again right now. The one they'll never forget where they were for.",
        reveal: "Name the moment and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite sporting moment — the one they remember exactly where they were for — is always worth including.",
        reveal: "Pick the moment and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sporting moment is one of those things that takes people straight back.",
        reveal: "Pick the moment and say what it means to you.",
      },
    },
  },

  // Missing topic rows for existing combinedPlaceholders entries (items and
  // 5-register placeholders already existed; only the topic object was absent)
  {
    title: "Cuisine",
    description: "The food culture they'd eat for the rest of their life",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the food culture they'd eat for the rest of their life.",
        reveal: "Name the cuisine and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite cuisine is a detail worth including.",
        reveal: "Pick the cuisine and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite cuisine is one of those choices people defend happily.",
        reveal: "Pick the cuisine and say what it means to you.",
      },
    },
  },
  {
    title: "Pudding",
    description: "The pudding they'd order every time",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the pudding they'd order every time.",
        reveal: "Name the pudding and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite pudding is a detail worth including.",
        reveal: "Pick the pudding and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite pudding is one of those things people judge a meal by.",
        reveal: "Pick the pudding and say what it means to you.",
      },
    },
  },
  {
    title: "Sweet",
    description: "The sweet that takes them straight back",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the sweet that takes them straight back.",
        reveal: "Name the sweet and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite sweet is a small, telling detail.",
        reveal: "Pick the sweet and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sweet is pure childhood for most people.",
        reveal: "Pick the sweet and say what it means to you.",
      },
    },
  },

  // Food & Drink batch 1 — new topics
  {
    title: "Cheese",
    description: "The one they'd build a board around",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who took the cheese course more seriously than the main. One in particular closed every Christmas, with ceremony and a glass of something fortified.",
        reveal:
          "Hers was Stilton. She finished every Christmas with it and a glass of port, and judged the year by the wheel.",
      },
      retirement: {
        about:
          "Thirty-five years of packed lunches and David built every one around the same block of cheese. He has views on strength. Mild was never in contention.",
        reveal:
          "His is mature Cheddar. Thirty-five years of the same lunchtime sandwich, and he was never once tempted to experiment.",
      },
      wedding: {
        about:
          "Emma and James cannot agree on cheese any more than on anything else. The wedding cheeseboard was assembled by treaty, with both camps represented.",
        reveal:
          "Hers is Brie. His is Cheddar. The cheeseboard at the wedding was a negotiated settlement.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the cheese they'd build a board around. A favourite cheese is a more revealing choice than it sounds.",
        reveal: "Name the cheese and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite cheese — the one they always reach for — is a detail worth including.",
        reveal: "Pick a cheese and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite cheese is one of those things people have firm views on.",
        reveal: "Pick a cheese and say what it means to you.",
      },
    },
  },
  {
    title: "Vegetable",
    description: "The one they'd never leave on the plate",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose vegetable patch fed half the street. One crop came up the canes every year in quantities no household could use, which was rather the point.",
        reveal:
          "Hers were runner beans. She grew them up canes every summer and gave away far more than she ever kept.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and treats one vegetable's brief season as a fixture in the year, eaten with an urgency her friends find slightly alarming.",
        reveal:
          "Hers is asparagus. She marks the start of the season like other people mark birthdays, and eats it daily until it's gone.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year and has built lessons in history, geography and chemistry around a single, unglamorous vegetable. The students never forget it.",
        reveal:
          "Hers is the humble potato. She says you can teach a whole syllabus through it, and has.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the vegetable they'd never leave on the plate. A favourite vegetable says something, oddly.",
        reveal: "Name the vegetable and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite vegetable — grown, cooked, or simply loved — is a small detail worth including.",
        reveal: "Pick a vegetable and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite vegetable is one of those quietly telling choices.",
        reveal: "Pick a vegetable and say what it means to you.",
      },
    },
  },
  {
    title: "Sandwich",
    description: "The one they'd order without looking at the menu",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose sandwiches appeared at every gathering, cut a particular way, filled a particular way, and never once varied.",
        reveal:
          "Hers was egg and cress. She made rounds of them for every family gathering, cut into triangles, no exceptions.",
      },
      retirement: {
        about:
          "Thirty-five years of the same lunch, made the same way, eaten at the same desk. David sees no reason a good thing should be improved.",
        reveal:
          "His is the cheese and pickle. Thirty-five years of it, in the same lunchbox, and retirement will not change the recipe.",
      },
      graduation: {
        about:
          "Tom got through four years of late nights on one sandwich more than any other — cheap, warm, and the subject of a structural argument only an architecture student would make.",
        reveal:
          "His is the chip butty. Four years of architecture school ran on them, and he maintains it is a structurally sound sandwich.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the sandwich they'd order without looking at the menu. Everyone has one.",
        reveal: "Name the sandwich and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite sandwich — the reliable order — is a small detail worth including.",
        reveal: "Pick a sandwich and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sandwich is one of those things everyone secretly has a position on.",
        reveal: "Pick a sandwich and say what it means to you.",
      },
    },
  },
  {
    title: "Crisps",
    description: "The packet they'd never share",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and holds her crisp opinions with the conviction of a manifesto. There is a correct flavour. The others are tolerated.",
        reveal:
          "Hers is salt and vinegar. She rations them and quietly judges anyone who reaches for cheese and onion.",
      },
      graduation: {
        about:
          "Tom got through four years partly on one particular bagged snack, eaten by the fistful over a drawing board, in a flavour he defends vigorously.",
        reveal:
          "His are Monster Munch. Studio fuel for four years, the pickled onion ones specifically.",
      },
      leaving: {
        about:
          "Priya kept the studio supplied with one particular snack from a drawer everyone knew about and nobody discussed. The drawer is empty now.",
        reveal:
          "Hers were Quavers. There was a multipack in her bottom drawer that the whole studio quietly relied on.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the packet they'd never share. A favourite crisp is pure character.",
        reveal: "Name the crisps and what makes them theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite crisp — flavour or brand — is a small, telling detail.",
        reveal: "Pick the crisps and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite packet of crisps is one of those things everyone has a firm line on.",
        reveal: "Pick the crisps and say what they mean to you.",
      },
    },
  },
  {
    title: "Takeaway",
    description: "Their Friday-night order",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and has turned ordering in on a Friday into a research project, complete with rankings she will share whether or not you ask.",
        reveal:
          "Hers is the katsu curry. She has tried every version in town and ranks them on a spreadsheet.",
      },
      retirement: {
        about:
          "Thirty-five years of Friday nights, one shop, one order. David has watched a whole family run the place across the decades and still asks after them.",
        reveal:
          "His is fish and chips. Friday night for thirty-five years, same shop, and he tips the boy who is now a grandfather.",
      },
      engagement: {
        about:
          "Callum and Sophie have one order tied to the very beginning — the meal that arrived on a second date that neither of them wanted to end, eaten straight from the cartons.",
        reveal:
          "Theirs is the chicken tikka masala. The first thing they ever shared, on a sofa, on a date that ran late.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and their Friday-night order. A favourite takeaway is a whole character in one dish.",
        reveal: "Name the takeaway and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite takeaway — the order they never deviate from — is a detail worth including.",
        reveal: "Pick the takeaway and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite takeaway is one of those things everyone has an exact order for.",
        reveal: "Pick the takeaway and say what it means to you.",
      },
    },
  },
  {
    title: "Cocktail",
    description: "The one that starts the evening",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and has one drink that signals the evening has properly begun. She orders it first, every time, and the night follows accordingly.",
        reveal:
          "Hers is the espresso martini. She orders one to start every celebration and considers it both a drink and a statement of intent.",
      },
      wedding: {
        about:
          "Emma and James have one drink tied to a particular trip abroad — the one where they decided, over a second round, that they might as well get married.",
        reveal:
          "Theirs is the negroni. They discovered it on the trip that quietly became the engagement.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. There is one drink she permits herself exactly once a year, on the last afternoon of summer term, and the whole staffroom observes it.",
        reveal:
          "Hers is the Aperol spritz. Strictly end-of-term only, and the staffroom knows the ritual.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the cocktail that starts the evening for them. A signature drink is a signature for a reason.",
        reveal: "Name the cocktail and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite cocktail — the one they always order first — is a detail worth including.",
        reveal: "Pick the cocktail and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite cocktail is one of those choices that sets a tone.",
        reveal: "Pick the cocktail and say what it means to you.",
      },
    },
  },

  // Food & Drink batch 2 — new topics
  {
    title: "Cake",
    description: "The one they'd cut for any occasion",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who answered every occasion, good or bad, with the same cake. The recipe was never written down and never needed to be.",
        reveal:
          "Hers was the Victoria sponge. She made one for every birthday, fete and bad day on the street for fifty years.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one cake she defends against all comers, including people who thought they didn't like it until she handed them a slice.",
        reveal:
          "Hers is carrot cake. She insists it is the only cake worth the calories and has converted several sceptics.",
      },
      wedding: {
        about:
          "Emma and James could not agree on a wedding cake, so the cake had two halves, like most of their decisions, and everyone was happy.",
        reveal:
          "Hers is lemon drizzle. His is chocolate fudge cake. The wedding had a tier of each, by treaty.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the cake they'd cut for any occasion. A favourite cake is a warm thing to know.",
        reveal: "Name the cake and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite cake — the one they always make or always ask for — is a detail worth including.",
        reveal: "Pick a cake and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite cake is one of those things everyone lights up about.",
        reveal: "Pick a cake and say what it means to you.",
      },
    },
  },
  {
    title: "Fruit",
    description: "The one they'd pick first from the bowl",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose garden produced one crop the grandchildren queued for every summer, sent down the path with a colander and clear instructions.",
        reveal:
          "Hers was the raspberry. She grew rows of them along the back fence, and the grandchildren were sent to pick them every July.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and rates a destination partly on one fruit and how well it's done there. She has been disappointed in some surprising places.",
        reveal:
          "Hers is the mango. She judges a holiday by whether she can get a good one, and has opinions on ripeness.",
      },
      recovery: {
        about:
          "Claire finished her treatment and found that flavour returned with the season. One fruit, more than anything, told her things were getting back to normal.",
        reveal:
          "Hers is the strawberry. The first thing that tasted of summer again, eaten slowly on a good afternoon.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the fruit they'd pick first from the bowl. A favourite fruit is a small, sunny detail.",
        reveal: "Name the fruit and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite fruit — grown, bought, or hunted down in season — is a detail worth including.",
        reveal: "Pick a fruit and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite fruit is one of those simple, telling choices.",
        reveal: "Pick a fruit and say what it means to you.",
      },
    },
  },
  {
    title: "Chocolate bar",
    description: "The one they'd guard in the multipack",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and has a single chocolate bar she will defend in detail, with reference to texture, ratio and value. She is, annoyingly, persuasive.",
        reveal:
          "Hers is the Twirl. She has strong views on why it beats every other bar in the multipack.",
      },
      graduation: {
        about:
          "Tom got through four years of all-nighters on one bar from the studio vending machine, chosen for its density and its caffeine, in roughly equal measure.",
        reveal:
          "His is the Boost. Studio fuel for four years, eaten at the vending machine at 2am.",
      },
      achievement: {
        about:
          "Marcus just ran his first marathon, raising for the RNLI through favpoll. One bar travelled with him on every long run and the race itself, deployed strategically around mile eighteen.",
        reveal:
          "His is the Snickers. He stuffed one in every running belt and credits it with the back half of the marathon.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the chocolate bar they'd guard in the multipack. Pure character, this one.",
        reveal: "Name the chocolate bar and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite chocolate bar — the one that goes missing first — is a small, telling detail.",
        reveal: "Pick the chocolate bar and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite chocolate bar is one of those things everyone has a firm answer to.",
        reveal: "Pick the chocolate bar and say what it means to you.",
      },
    },
  },
  {
    title: "Ice cream flavour",
    description: "The scoop they'd always go back to",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher with one fixed indulgence at the end of Sunday lunch — the same flavour, in the same bowl, regardless of the season.",
        reveal:
          "Hers was mint choc chip. She had a scoop after every Sunday lunch, all year, weather be damned.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and came round to one flavour only in the last few years, and now considers the decades before it slightly wasted.",
        reveal:
          "Hers is salted caramel. She arrived at it late and has been making up for lost time ever since.",
      },
      christening: {
        about:
          "Lily is too young for any of it, but the family are already taking bets on the flavour she'll demand first. There is an early frontrunner.",
        reveal:
          "The grown-ups predict Lily will be a strawberry child — simple, classic, no nonsense. Time will tell.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the scoop they'd always go back to. A favourite flavour is a small joy worth knowing.",
        reveal: "Name the flavour and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite ice cream flavour — the reliable scoop — is a detail worth including.",
        reveal: "Pick the flavour and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite ice cream flavour is one of those instantly answerable, telling choices.",
        reveal: "Pick the flavour and say what it means to you.",
      },
    },
  },

  // Places batch — new topics (Island/County item lists come from
  // corrections.ts below — globally alphabetical instead of grouped)
  {
    title: "Country",
    description: "The one they keep going back to in their head",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who loved one country above all the others — not the most exotic, just the one that seemed to make most sense of itself. She said it understood how to live.",
        reveal:
          "Hers was Italy. She went twice in her forties and talked about it for the rest of her life.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has been planning one specific trip for nearly a decade. The list of what she will do when she gets there is now longer than some novels.",
        reveal:
          "Hers is Japan. She has been refining the itinerary for eight years and is still not done.",
      },
      wedding: {
        about:
          "Emma and James agreed on the destination after three weeks of impasse. They disagree about whose idea it was. Both have evidence.",
        reveal:
          "Theirs was Greece. Two weeks, an island, one argument about which island, and the first of many decisions they got right together.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the country they keep going back to in their head. A favourite country is a kind of autobiography.",
        reveal: "Name the country and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite country — visited, dreamed of, or simply loved from a distance — is always worth including.",
        reveal: "Pick the country and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite country is one of those things everyone has a strong answer to.",
        reveal: "Pick the country and say what it means to you.",
      },
    },
  },
  {
    title: "City",
    description: "The one that felt most like them",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who visited one city before her children were born and spent the rest of her life using it as a benchmark. She was always right about it.",
        reveal:
          "Hers was Florence. She went once in 1978 and said it was the only city that was exactly what a city should be.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one city she returns to and one she considers hers. They are the same answer.",
        reveal:
          "Hers is New York. She has been four times and considers it the only city she has ever felt fully at home in.",
      },
      leaving: {
        about:
          "Priya spent six years in a city she now knows completely — not as a visitor, as someone who paid attention. She is leaving. The city will carry her fingerprints.",
        reveal:
          "Hers was Manchester. Six years, every neighbourhood, every route on foot. She knows it better than most people born there.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the city that felt most like them. A favourite city is a whole character portrait.",
        reveal: "Name the city and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite city — the one they always defend or always return to — is always worth including.",
        reveal: "Pick the city and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite city is one of those things people are very ready to tell you.",
        reveal: "Pick the city and say what it means to you.",
      },
    },
  },
  {
    title: "County",
    description: "The one they'd claim as home",
    is_finite: true,
    categories: ["Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who returned to the same stretch of one county every September for thirty years, without question and without variation.",
        reveal:
          "Hers was Cornwall. She drove there every September for thirty years and considered it the best decision she ever made.",
      },
      retirement: {
        about:
          "David grew up in one county and spent thirty-five years telling anyone who would listen that nothing compares. He is now free to go and prove it.",
        reveal:
          "His is North Yorkshire. He was born in the Dales and has spent thirty-five years telling everyone about it.",
      },
      graduation: {
        about:
          "Tom grew up in a county that taught him how landscape and built form talk to each other, without anyone explaining that this was what was happening.",
        reveal:
          "His is Pembrokeshire. He grew up on the coast there and thinks about it differently now he studies buildings for a living.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the county they'd claim as home. The one that made them.",
        reveal: "Name the county and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite county — the one they'll always defend — is a detail worth including.",
        reveal: "Pick the county and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite county is one of those things people are surprisingly passionate about.",
        reveal: "Pick the county and say what it means to you.",
      },
    },
  },
  {
    title: "National park",
    description:
      "The landscape they'd walk into and not come out of for a week",
    is_finite: true,
    categories: ["Places", "Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who spent forty years learning one national park properly. She said it was the most honest landscape in England — it never pretended to be anything it wasn't.",
        reveal:
          "Hers was the Lake District. She walked it for forty years and could describe every fell from memory.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with a national park she has made her own, route by route, over a decade of weekends.",
        reveal:
          "Hers is the Peak District. She has hiked every main route in it and is now working on the repeats.",
      },
      anniversary: {
        about:
          "Forty years of anniversaries, and one national park has served as the venue for most of them — the same walk, the same pub at the end, always a slightly different conversation.",
        reveal:
          "Theirs is the Yorkshire Dales. They have walked the same circuit every anniversary since 1987 and have never once arrived at the right time.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the national park they'd walk into and not come out of for a week. Everyone has one.",
        reveal: "Name the national park and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite national park — the landscape they always go back to — is always worth including.",
        reveal: "Pick the national park and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite national park is one of those quietly personal choices.",
        reveal: "Pick the national park and say what it means to you.",
      },
    },
  },
  {
    title: "Landmark or building",
    description: "The one that stopped them in their tracks",
    is_finite: false,
    categories: ["Places", "Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who returned to one landmark repeatedly across her life and found it different each time. She said it was where you measured the distance between who you were and who you had become.",
        reveal:
          "Hers was Stonehenge. She visited every decade and said it changed every time, which she considered proof of something.",
      },
      tribute: {
        about:
          "A mentor who used one building as a lesson every time he visited. He said it was the only structure that told the whole truth about ambition.",
        reveal:
          "His was the Colosseum. He said it was the only building that made history feel like something you could touch.",
      },
      graduation: {
        about:
          "Tom had a landmark before he had a school of thought. He has been building an argument around it for four years. His tutors consider it persuasive.",
        reveal:
          "His is the Forth Bridge. He wrote his first serious essay about it and has not changed his mind.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the landmark or building that stopped them in their tracks. The one you can't explain, you just know.",
        reveal: "Name the landmark and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite landmark or building — the one they always make time for — is a detail worth including.",
        reveal: "Pick the landmark and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite landmark is one of those things that reveals something.",
        reveal: "Pick the landmark and say what it means to you.",
      },
    },
  },
  {
    title: "Island",
    description: "The one they'd find hardest to leave",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who made one trip in her later years that she spoke about for the rest of her life. One island, a few days, a quality of stillness she never entirely left behind.",
        reveal:
          "Hers was Iona. She went once in her fifties and said it was the most peaceful place she had ever stood.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with an island she visited at twenty-two and a promise to herself she has been procrastinating on for eighteen years. The time is arriving.",
        reveal:
          "Hers is Santorini. She went at twenty-two, left promising to return, and has not forgiven herself for taking this long.",
      },
      engagement: {
        about:
          "Callum and Sophie have one island tied to the early days — a trip that went wrong in all the small ways and was perfect for it. They keep meaning to go back.",
        reveal:
          "Theirs is Skye. They drove there in year two, camped in the rain, and agreed it was the best thing they had ever done.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the island they'd find hardest to leave. Everyone has one.",
        reveal: "Name the island and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite island — the one they always talk about — is always worth including.",
        reveal: "Pick the island and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite island is one of those choices that says something.",
        reveal: "Pick the island and say what it means to you.",
      },
    },
  },

  // Music batch — new topics
  {
    title: "Band or artist",
    description: "The one they'd see in any weather",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who measured music by what it asked of a person. One voice, she said, understood what songs were actually for.",
        reveal:
          "Hers was Vera Lynn. She said every generation needed one voice that held things together.",
      },
      tribute: {
        about:
          "A mentor who had one band he held as a benchmark for what popular culture could be. He returned to them in every argument about whether music had been as good since. It was a long argument.",
        reveal:
          "His was the Beatles. He said they were the last time everyone in the country was listening to the same thing at the same moment.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one band she has followed since she was twenty-two, through every venue and era. Eleven gigs. She intends more.",
        reveal:
          "Hers is Arctic Monkeys. She has seen them eleven times and considers this a reasonable number.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the artist or band they'd see in any weather. The one they've followed through every phase.",
        reveal: "Name the artist or band and what they mean to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite band or artist — the one they always come back to — is always worth including.",
        reveal: "Pick the artist or band and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite band or artist is one of those things everyone has a strong answer to.",
        reveal: "Pick the artist or band and say what they mean to you.",
      },
    },
  },
  {
    title: "Composer",
    description: "The one whose music they always came back to",
    is_finite: false,
    categories: ["Music"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who reached for one composer when the world required attention. She said the music had the quality of taking things seriously.",
        reveal:
          "Hers was Elgar. She played the Cello Concerto when she needed to think about something properly.",
      },
      tribute: {
        about:
          "A mentor who had one composer he used as an argument. He said Bach settled everything. His colleagues grew to understand what he meant.",
        reveal:
          "His was Bach. He said Bach was the proof that rigour and beauty weren't opposites.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one composer she came to in her twenties through a difficult winter and has never entirely left. She considers the relationship ongoing.",
        reveal:
          "Hers is Beethoven. She went through a phase in her twenties and never fully came out of it.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the composer whose music they always came back to. A favourite composer is a whole world.",
        reveal: "Name the composer and what they mean to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite composer — the one they put on when everything else is too much — is worth including.",
        reveal: "Pick the composer and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite composer is one of those choices that says something.",
        reveal: "Pick the composer and say what they mean to you.",
      },
    },
  },
  {
    title: "Musical",
    description: "The one they'd see every revival of",
    is_finite: false,
    categories: ["Music", "Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who loved the stage with the completeness she brought to everything. One musical was hers in a way the others weren't — the one she returned to, the one she quoted.",
        reveal:
          "Hers was My Fair Lady. She had seen it four times by the time she was thirty and considered the fifth a formality.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and went to one show that changed her view of what a musical could do. She went back. She booked again. She has converted several sceptics.",
        reveal:
          "Hers is Hamilton. She got tickets eighteen months in advance and would do it again without hesitation.",
      },
      leaving: {
        about:
          "Priya had one show she considered the most honest thing the stage had produced. She saw it twice — once for the songs, once for the argument.",
        reveal:
          "Hers was Chicago. She said it was the only musical that didn't pretend anything.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the musical they'd see every revival of. The one that's entirely theirs.",
        reveal: "Name the musical and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite musical — the one they'd see again without hesitation — is a detail worth including.",
        reveal: "Pick the musical and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite musical is one of those things people are very ready to tell you.",
        reveal: "Pick the musical and say what it means to you.",
      },
    },
  },
  {
    title: "Carol",
    description: "The one that makes it feel like Christmas",
    is_finite: false,
    categories: ["Music", "Time"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who took carols seriously and one in particular. It appeared at the end of every nativity, every carol concert, every Christmas Eve, and it was always hers.",
        reveal:
          "Hers was In the Bleak Midwinter. She said it was the carol that meant Christmas was really happening.",
      },
      christening: {
        about:
          "Lily's christening had one song the family thought was too on-the-nose and sang anyway. It turned out to be exactly right.",
        reveal:
          "They sang Away in a Manger over her, and nobody found this ironic.",
      },
      award: {
        about:
          "Amelia has just been named Teacher of the Year. She leads the school carol concert every December with an enthusiasm that disarms even the reluctant parents. One carol, she says, does all the work.",
        reveal:
          "Hers is O Come All Ye Faithful. She leads it at the school nativity every year and considers it the best thing she does.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the carol that makes it feel like Christmas to them. The one they wait for.",
        reveal: "Name the carol and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite carol — the one they always wait to hear — is a detail worth including.",
        reveal: "Pick the carol and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite carol is one of those things that takes people somewhere immediately.",
        reveal: "Pick the carol and say what it means to you.",
      },
    },
  },

  // Film & TV batch — new topics
  {
    title: "Christmas film",
    description: "The one they watch every year without fail",
    is_finite: false,
    categories: ["Film & TV", "Time"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who treated one Christmas film as an annual appointment, inflexible and non-negotiable. The family built the rest of Christmas Eve around it.",
        reveal:
          "Hers was It's a Wonderful Life. Every Christmas Eve, no exceptions, and the family knew not to schedule anything against it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has a Christmas film she starts watching in November and will not be embarrassed about. She has a whole defence of the timing prepared.",
        reveal:
          "Hers is Elf. She watches it the first weekend of November and considers this a reasonable decision.",
      },
      christening: {
        about:
          "Lily's first Christmas has a film assigned to it already. Her parents have agreed on exactly one thing about how it should be spent.",
        reveal:
          "Her parents have agreed: The Snowman, on Christmas morning, without question.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the Christmas film they watch every year without fail. The one that makes it feel like Christmas.",
        reveal: "Name the film and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite Christmas film — the annual appointment — is always worth including.",
        reveal: "Pick the film and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite Christmas film is one of those things everyone has an opinion on.",
        reveal: "Pick the film and say what it means to you.",
      },
    },
  },
  {
    title: "Actor",
    description: "The one whose films they'll always watch",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had one actor she watched in everything, without exception. She said knowing they were in it was reason enough.",
        reveal:
          "Hers was Maggie Smith. She said nobody else could do as much with a single look.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one actor she will watch in anything — regardless of reviews, plot, or the opinions of her friends.",
        reveal:
          "Hers is Cate Blanchett. She has been saying this since 1998 and sees no reason to revise.",
      },
      graduation: {
        about:
          "Tom graduated from architecture school with strong views about which films were worth watching, developed over four years of watching them instead of sleeping.",
        reveal:
          "His is Daniel Day-Lewis. He says every performance is a masterclass in commitment. He has a theory about this. It is correct.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the actor whose films they'll always watch. The one they'd follow anywhere.",
        reveal: "Name the actor and what makes them theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite actor — the one whose name makes them say yes — is a detail worth including.",
        reveal: "Pick the actor and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite actor is one of those things everyone has a strong view on.",
        reveal: "Pick the actor and say what they mean to you.",
      },
    },
  },

  // Literature batch — new topics
  {
    title: "Book",
    description: "The one they'd press into anyone's hands",
    is_finite: false,
    categories: ["Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who recommended books with the confidence of someone who had never once been wrong about one. She kept a shelf specifically for lending and knew exactly where each copy was.",
        reveal:
          "Hers was Persuasion. She had three copies — one to keep, two to lend — and a list of people who still hadn't given them back.",
      },
      tribute: {
        about:
          "A mentor who handed out books like instructions. One above all he considered essential reading for thinking clearly, and he had a supply specifically for giving away.",
        reveal:
          "His was Homage to Catalonia. He gave it to anyone who needed reminding that writing about what you'd seen was harder and rarer than it looked.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one book she has recommended so often her friends have started giving it back to her on her birthdays. She considers this a sign she chose correctly.",
        reveal:
          "Hers is Middlemarch. She reads it every five years and says it's different every time. Her friends are beginning to believe her.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the book they'd press into anyone's hands. The one that did something to them.",
        reveal: "Name the book and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite book — the one they always recommend — is a detail worth including.",
        reveal: "Pick the book and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite book is one of those things that says something true about a person.",
        reveal: "Pick the book and say what it means to you.",
      },
    },
  },
  {
    title: "Children's book",
    description: "The one they'd read aloud from memory",
    is_finite: false,
    categories: ["Literature", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose reading voice her grandchildren could still describe in detail. One book above all was read so many times the pages had gone soft at the corners.",
        reveal:
          "Hers was The Tiger Who Came to Tea. She read it until the cover fell off and bought a second copy without mentioning it.",
      },
      christening: {
        about:
          "Lily's library is beginning. The first shelf has been agreed. The rest will follow in time, chosen by someone who is currently unable to express a preference.",
        reveal:
          "Her parents have started her with The Very Hungry Caterpillar. They chose it for the pictures. She will come to it for the counting.",
      },
      graduation: {
        about:
          "Tom traces a surprising amount of how he thinks about scale, structure and space back to one book he was read obsessively at age four. His tutors found the connection less odd than he expected.",
        reveal:
          "His is Where the Wild Things Are. He says it taught him everything he needed to know about space and how it feels from the inside.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the children's book they'd read aloud from memory. The one that stayed.",
        reveal: "Name the book and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite children's book — the one they still remember word for word — is always worth including.",
        reveal: "Pick the book and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite children's book is one of those things everyone has kept somewhere.",
        reveal: "Pick the book and say what it means to you.",
      },
    },
  },
  {
    title: "Play",
    description: "The one they'd see in any venue",
    is_finite: false,
    categories: ["Literature", "Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who took the theatre seriously and one play in particular. She had seen it four times in different productions and kept all four programmes.",
        reveal:
          "Hers was A Midsummer Night's Dream. She saw it in four different productions and said each one knew something the others hadn't noticed.",
      },
      tribute: {
        about:
          "A mentor who said the stage was where language was used best, and one play had the best argument of any he had seen. He quoted it when he needed to explain something important.",
        reveal:
          "His was Death of a Salesman. He said it was the most honest thing written about ambition in the twentieth century.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and once queued overnight for a ticket to one play and considers it among the better decisions of her life. She was not cold. She was entirely happy.",
        reveal:
          "Hers is The Curious Incident of the Dog in the Night-Time. She queued overnight for a seat and says it was completely worth it.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the play they'd see in any venue. The words that stayed with them.",
        reveal: "Name the play and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite play — the one they still talk about — is always worth including.",
        reveal: "Pick the play and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite play is one of those quietly revealing choices.",
        reveal: "Pick the play and say what it means to you.",
      },
    },
  },

  // Final batch — new topics (Everyday life / Childhood)
  {
    title: "Board game",
    description: "The one that always ends in an argument",
    is_finite: false,
    categories: ["Everyday life", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who kept a cupboard of games that came out at Christmas and at no other time, in a ritual the family treated with complete seriousness.",
        reveal:
          "Hers was Scrabble. She played it with the full force of a forty-year English teacher and was rarely beaten.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and hosts a games night that her friends have put in the diary months in advance. She takes one game more seriously than the others. Everyone has learned to prepare.",
        reveal:
          "Hers is Catan. She has a strategy she has been refining for six years and is not tired of explaining it.",
      },
      anniversary: {
        about:
          "Forty years together and one game has produced more sustained argument than any other, at every Christmas, every bank holiday and every long evening when there was nothing on.",
        reveal:
          "Theirs is Monopoly. Forty years of it, the same arguments about the rules, and neither of them will ever concede the Old Kent Road question.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the board game that always ends in an argument. The one they'd play anyway.",
        reveal: "Name the game and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite board game — the one they always win at or always lose at — is a detail worth including.",
        reveal: "Pick the game and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite board game is one of those things everyone has a strong position on.",
        reveal: "Pick the game and say what it means to you.",
      },
    },
  },
  {
    title: "Card game",
    description: "The one they'd always suggest",
    is_finite: false,
    categories: ["Everyday life", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose card game knowledge had been assembled over seventy years and was formidable. She said the rules were simple. She was not telling the whole truth.",
        reveal:
          "Hers was Whist. She played it with her mother and taught it to her grandchildren. The rules were, she said, simple. This was not entirely accurate.",
      },
      retirement: {
        about:
          "David spent thirty-five years applying the same logic to engineering problems that he applies to card games — patient, systematic, quietly certain of the outcome. He is now free to play more.",
        reveal:
          "His is Cribbage. He learned it from his father at seven and has applied the same approach to both ever since.",
      },
      leaving: {
        about:
          "Priya introduced the studio to one card game on a long train journey and it became the only thing anyone wanted to do on the Friday afternoon when nothing urgent was happening.",
        reveal:
          "Hers was Rummy. She introduced it to the studio on a train and by the end of the week three people had bought card decks.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the card game they'd always suggest. The one that fills an afternoon without anyone noticing.",
        reveal: "Name the game and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite card game — the one they learned early and never forgot — is a small detail worth including.",
        reveal: "Pick the game and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite card game is one of those things people are surprisingly attached to.",
        reveal: "Pick the game and say what it means to you.",
      },
    },
  },
  {
    title: "Dance",
    description: "The one that gets them on the floor",
    is_finite: false,
    categories: ["Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who danced, properly, in a way her children found equal parts embarrassing and wonderful. One kind above all. She never stopped.",
        reveal:
          "Hers was the waltz. She and her husband danced at every wedding they were ever invited to and nobody else looked as right doing it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and her relationship with one dance is a whole history of nights out, terrible venues and consistently good decisions. She is entirely unembarrassed by any of it.",
        reveal:
          "Hers is the disco. She says it is the only form of dancing that is honest about what dancing is for.",
      },
      wedding: {
        about:
          "Emma and James had one dance at their wedding and practised it for eleven weeks. It looked like they had not practised it at all. This was the whole point.",
        reveal:
          "Theirs is the foxtrot. Eleven weeks of practice to look as though they hadn't. Their teacher said they were the best students she'd ever had at pretending.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the dance that gets them on the floor. Every celebration needs this information.",
        reveal: "Name the dance and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite dance — the one that gets them on the floor regardless — is worth including.",
        reveal: "Pick the dance and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite dance is one of those things that says something.",
        reveal: "Pick the dance and say what it means to you.",
      },
    },
  },
  {
    title: "Item of clothing",
    description: "The one they'd reach for every time",
    is_finite: false,
    categories: ["Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose children could describe one item of her wardrobe exactly, without thinking. It was the piece that meant she was home.",
        reveal:
          "Hers was her cardigan. Navy, slightly bobbled at the elbows. She wore it every evening and her children still picture her in it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 with one item in her wardrobe that is either a signature or an obsession, depending on who you ask. She has six of them.",
        reveal:
          "Hers is the blazer. She has one in every colour that matters and a strong view on which colours matter.",
      },
      retirement: {
        about:
          "Thirty-five years of the same office, the same desk, and a very specific idea of what the right shoes communicated. David is retiring. The shoes stay.",
        reveal:
          "His are his shoes. The same style for thirty-five years, re-soled three times. He says the shoes made the engineer. His team believes him.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the item of clothing they'd reach for every time. The one that is entirely them.",
        reveal: "Name the item and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite item of clothing — the one they wear until it falls apart — is a small portrait.",
        reveal: "Pick the item and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite item of clothing says more about a person than most other things.",
        reveal: "Pick the item and say what it means to you.",
      },
    },
  },
  {
    title: "Radio station",
    description: "The one always on in the background",
    is_finite: false,
    categories: ["Everyday life", "Music"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose kitchen was never quiet. One station played in the background of every meal, every Sunday, every school morning for forty years.",
        reveal:
          "Hers was Radio 4. She said it was the last place where people spoke in full sentences. She was not wrong.",
      },
      retirement: {
        about:
          "Thirty-five years of driving the same route, and David listened to the same station every morning. He is retiring. The morning routine is changing. The station is not.",
        reveal:
          "His is Radio 2. Same station for thirty-five years of the same commute. He has no intention of reconsidering this.",
      },
      leaving: {
        about:
          "Priya had the studio sound designed without anyone realising it was designed at all. One station in the background meant the work went better. The studio has tested this empirically since she left.",
        reveal:
          "Hers was 6 Music. She kept it on from nine to six every day and the studio only noticed when she left.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the radio station that's always on in the background. The soundtrack to the ordinary days.",
        reveal: "Name the station and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite radio station — the one always on in the background — is a detail worth including.",
        reveal: "Pick the station and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite radio station says something about how someone moves through the day.",
        reveal: "Pick the station and say what it means to you.",
      },
    },
  },
  {
    title: "Word",
    description: "The one they'd keep if they could only keep one",
    is_finite: false,
    categories: ["Everyday life", "Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had a word she used more than others — not a catchphrase, just a word she reached for when she meant what she said.",
        reveal:
          "Hers was 'grace'. She used it about people, about moments, about gardening in the rain. She meant it every time.",
      },
      tribute: {
        about:
          "A mentor who chose words with the care of someone who understood their cost. One he used more than others — in meetings, in letters, in the margins of reports he was reviewing.",
        reveal:
          "His was 'rigour'. He used it as a compliment, a challenge, and occasionally a warning. His colleagues understood which was which.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has a word she considers the most useful in the language. She will tell you why. At some length.",
        reveal:
          "Hers is 'nonetheless'. She says it earns its keep in any argument and she uses it accordingly.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the word they'd keep if they could only keep one. Favourite words are a whole portrait.",
        reveal: "Name the word and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite word — the one they reach for when they mean it — is a detail worth including.",
        reveal: "Pick the word and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite word is one of those small things that says something large.",
        reveal: "Pick the word and say what it means to you.",
      },
    },
  },
  {
    title: "Toy",
    description: "The one they played with until it fell apart",
    is_finite: false,
    categories: ["Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who kept one toy in a box in the spare room long after anyone would have considered it necessary. She knew exactly which one.",
        reveal:
          "Hers was a stuffed rabbit. She kept it in the spare room for forty years. She maintained this was practical.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and will tell you, without prompting, about one toy from her childhood in enough detail to identify the manufacturer and the year. She considers this normal.",
        reveal:
          "Hers was a Sindy doll. The full wardrobe, the accessories, the house extension that was technically a shoebox. She built the whole thing herself.",
      },
      christening: {
        about:
          "Lily is already accumulating things. One has come from a grandmother who had very specific views about what a first toy should be.",
        reveal:
          "Her grandmother brought a wooden rattle. Indestructible, she said, unlike everything else. She was right.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the toy they played with until it fell apart. The first favourite possession.",
        reveal: "Name the toy and what it meant to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite childhood toy — the one that lasted — is a detail worth including.",
        reveal: "Pick the toy and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite childhood toy says something about who someone was and probably still is.",
        reveal: "Pick the toy and say what it means to you.",
      },
    },
  },
  {
    title: "Cartoon",
    description: "The one they'd watch before school without fail",
    is_finite: false,
    categories: ["Childhood", "Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who sat with her children every Saturday morning for a decade and said nothing, which her children understood to mean she was also watching.",
        reveal:
          "Hers was Tom and Jerry. She said it was the most honest cartoon about the relationship between effort and outcome.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one cartoon she maintains holds up completely, has rewatched recently as evidence, and is prepared to defend in detail.",
        reveal:
          "Hers is Scooby-Doo. She says the format is perfect and the commentary on property ownership is underrated.",
      },
      graduation: {
        about:
          "Tom grew up watching one cartoon he now considers more structurally sophisticated than most television he has encountered since. His tutors are not surprised.",
        reveal:
          "His is Wallace and Gromit. He says the spatial logic of the sets is impeccable. He has a talk prepared on this.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the cartoon they watched before school without fail. The one that's still in there somewhere.",
        reveal: "Name the cartoon and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite cartoon — the one they could still hum the theme to — is always worth including.",
        reveal: "Pick the cartoon and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite childhood cartoon is one of those things everyone has kept.",
        reveal: "Pick the cartoon and say what it means to you.",
      },
    },
  },

  // Gaps batch A — Food & Drink
  {
    title: "Breakfast cereal",
    description: "The one in the cupboard they'd never run out of",
    is_finite: false,
    categories: ["Food & Drink", "Childhood"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who started every winter morning the same way for fifty years, the proper way, and would tell you so.",
        reveal:
          "Hers was porridge. Made on the hob, never the microwave, with a pinch of salt and a firm view on the matter.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one breakfast she refuses to apologise for, despite what the box and her dentist suggest.",
        reveal:
          "Hers is Crunchy Nut. She knows it's a children's cereal and has made her peace with that.",
      },
      christening: {
        about:
          "Lily is too young for breakfast opinions, but the family are already placing bets on where she'll land. There's an early favourite.",
        reveal:
          "The family predict Lily will be a Coco Pops child. The evidence so far is inconclusive but promising.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the breakfast cereal they'd never run out of. The small daily loyalty.",
        reveal: "Name the cereal and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite breakfast cereal — the cupboard constant — is a detail worth including.",
        reveal: "Pick the cereal and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite breakfast cereal is one of those small, telling everyday choices.",
        reveal: "Pick the cereal and say what it means to you.",
      },
    },
  },
  {
    title: "Type of tea",
    description: "The one they'd put the kettle on for",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher with exacting standards on exactly one thing, applied without exception for fifty years. You learned how she took it or you didn't make it twice.",
        reveal:
          "Hers was builder's tea. Strong enough to stand a spoon in, milk no sugar, and woe betide anyone who made it weak.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years, and the most reliable ritual of his working day is the one thing that doesn't have to change.",
        reveal:
          "His is Yorkshire Tea. Thirty-five years, the same mug, the same two minutes of brewing he timed by instinct.",
      },
      recovery: {
        about:
          "Claire finished her treatment, and one mild, settling thing got her through the worst of it. The taste is permanently linked now to the road back.",
        reveal:
          "Hers is peppermint. She drank gallons of it through treatment and it still tastes like getting better.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the tea they'd put the kettle on for. The cup that fixes most things.",
        reveal: "Name the tea and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite type of tea — and how they take it — is a detail worth including.",
        reveal: "Pick the tea and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite tea is one of those small things people feel strongly about.",
        reveal: "Pick the tea and say what it means to you.",
      },
    },
  },
  {
    title: "Pizza topping",
    description: "The one they'd defend to the death",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and holds the single most divisive position in food, cheerfully, at every opportunity, with no intention of backing down.",
        reveal: "Hers is pineapple, and she will fight you about it.",
      },
      graduation: {
        about:
          "Tom got through architecture school on a rotation of late-night deliveries, and one topping did most of the heavy lifting.",
        reveal:
          "His is pepperoni. Four years of studio deadlines were fuelled almost entirely by it.",
      },
      leaving: {
        about:
          "Priya leaves behind a studio whose pizza habits she permanently altered with one suggestion that nobody has been able to walk back.",
        reveal:
          "Hers was nduja. She introduced the studio to it and changed the standing Friday order forever.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the pizza topping they'd defend to the death. The hill they'll happily die on.",
        reveal: "Name the topping and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite pizza topping — the order they never change — is a detail worth including.",
        reveal: "Pick the topping and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite pizza topping is one of those things people are happily unreasonable about.",
        reveal: "Pick the topping and say what it means to you.",
      },
    },
  },
  {
    title: "Pie",
    description: "The one they'd order every time",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose winter Sundays meant one thing coming out of the oven, made to a method she never wrote down.",
        reveal:
          "Hers was steak and kidney. She made one every Sunday in winter and the pastry was a closely guarded matter.",
      },
      tribute: {
        about:
          "A mentor who judged establishments, and occasionally people, by one simple item and whether they got it right.",
        reveal:
          "His was a proper pork pie. He believed it was the truest test of whether a place knew what it was doing.",
      },
      achievement: {
        about:
          "Marcus ran his first marathon, raising for the RNLI through favpoll. One comforting dish became the ritual meal the night before every long run.",
        reveal:
          "His is fish pie. Carb-loading the night before the marathon, and now permanently associated with the start line.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the pie they'd order every time. The proper comfort of it.",
        reveal: "Name the pie and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite pie — sweet or savoury — is a detail worth including.",
        reveal: "Pick the pie and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite pie is one of those deeply comforting, telling choices.",
        reveal: "Pick the pie and say what it means to you.",
      },
    },
  },
  {
    title: "Sauce or condiment",
    description: "The one they'd put on everything",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose Sunday roast came with one thing made from scratch, from the garden, because the jarred version was not to be spoken of.",
        reveal:
          "Hers was mint sauce. Made fresh from the garden every Sunday with the lamb, never from a jar.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has a firm side in the nation's oldest breakfast dispute. She does not consider it a matter of opinion.",
        reveal:
          "Hers is brown sauce, and she considers the ketchup-versus-brown-sauce question long settled.",
      },
      promotion: {
        about:
          "Kwame just made Head of Product. He applies one condiment to nearly everything and treats the exceptions as a research question.",
        reveal:
          "His is sriracha. He has a theory that it improves roughly ninety per cent of foods and is collecting evidence.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the sauce or condiment they'd put on everything. The bottle that follows them around.",
        reveal: "Name the sauce and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite sauce or condiment — the one always within reach — is a detail worth including.",
        reveal: "Pick the sauce and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite sauce or condiment is one of those small, surprisingly revealing choices.",
        reveal: "Pick the sauce and say what it means to you.",
      },
    },
  },
  {
    title: "Coffee order",
    description: "The one they'd recite without thinking",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and has one order and an exacting sense of who makes it properly. The map of acceptable cafés is small and hard-won.",
        reveal:
          "Hers is a flat white, and she has notes on every café within a mile of her flat.",
      },
      leaving: {
        about:
          "Priya leaves a studio that drinks differently because of her, and a local café that will notice the gap immediately.",
        reveal:
          "Hers was a cortado. She trained the whole studio onto it and the nearest café knew her order by sight.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years and has no intention of complicating the one drink that has reliably started every working day.",
        reveal:
          "His is instant, two sugars, and he is entirely unbothered by what anyone thinks of that.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the coffee order they'd recite without thinking. The order that's pure them.",
        reveal: "Name the order and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite coffee order — exact and non-negotiable — is a detail worth including.",
        reveal: "Pick the order and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite coffee order is one of those small, precise, telling things.",
        reveal: "Pick the order and say what it means to you.",
      },
    },
  },
  {
    title: "Spirit",
    description: "The one they'd pour at the end of the day",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who allowed herself exactly one indulgence, once a year, in a particular glass kept for the purpose.",
        reveal:
          "Hers was a small sherry, and only ever a small one, taken at Christmas and on no other occasion.",
      },
      tribute: {
        about:
          "A mentor who had firm and well-reasoned views on how one drink should be served, and shared them whether or not you'd asked.",
        reveal:
          "His was a good single malt — Scotch, no ice, and no negotiation on either point.",
      },
      retirement: {
        about:
          "David is retiring, and one of the small pleasures he plans to give its due is a drink he's always rather rushed.",
        reveal:
          "His is gin, properly made, which he intends to have more time to appreciate.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the spirit they'd pour at the end of the day. The considered one.",
        reveal: "Name the spirit and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite spirit — and exactly how they take it — is a detail worth including.",
        reveal: "Pick the spirit and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite spirit is one of those choices people hold with quiet conviction.",
        reveal: "Pick the spirit and say what it means to you.",
      },
    },
  },
  {
    title: "Wine",
    description: "The one they'd open for the occasion",
    is_finite: false,
    categories: ["Food & Drink"],
    placeholders: {
      wedding: {
        about:
          "Emma and James have never agreed on a bottle in their lives and saw no reason to start at the wedding. The solution was simply to have both.",
        reveal:
          "Hers is a crisp Sauvignon Blanc. His is a heavy Malbec. The wedding bar stocked both in quantity.",
      },
      anniversary: {
        about:
          "Forty years, and one drink reserved strictly for the occasions that earned it. This is unquestionably one.",
        reveal:
          "Theirs is Champagne, saved for the things worth marking, of which forty years is certainly one.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and came round to red wine through one style in particular, having spent her thirties insisting it wasn't for her.",
        reveal:
          "Hers is a good Rioja, arrived at after years of claiming not to like red.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the wine they'd open for the occasion. The bottle they reach for.",
        reveal: "Name the wine and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite wine — the one they always come back to — is a detail worth including.",
        reveal: "Pick the wine and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite wine is one of those quietly characterful choices.",
        reveal: "Pick the wine and say what it means to you.",
      },
    },
  },

  // Gaps batch B — Nature
  {
    title: "Dog breed",
    description: "The one they'd always have at their feet",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had the same breed her whole life, one after another, each named after a composer, each devoted to her entirely.",
        reveal:
          "Hers was the Labrador. She had four across her life, all called after composers, all hopelessly loyal.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years and has been promised, at last, the dog he's been quietly researching for a decade.",
        reveal:
          "His is the Border Collie. He has read everything about them and is finally about to have the time one demands.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one breed she defends as the perfect dog, to the visible irritation of every other dog owner she knows.",
        reveal:
          "Hers is the Dachshund. She maintains they are the ideal dog and has never once been talked out of it.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the dog breed they'd always have at their feet. The faithful constant.",
        reveal: "Name the breed and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite dog breed — the one they always come back to — is a detail worth including.",
        reveal: "Pick the breed and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite dog breed is one of those warm, telling choices.",
        reveal: "Pick the breed and say what it means to you.",
      },
    },
  },
  {
    title: "Cat breed",
    description: "The one they'd let rule the house",
    is_finite: false,
    categories: ["Nature", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who shared her house, and arguably handed it over, to a succession of one particular kind of cat across fifty years.",
        reveal:
          "Hers was the British Shorthair. Dignified, unbothered, and in complete charge of the household at all times.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has strong views on cats, most of which resolve to one breed she considers superior in every measurable way.",
        reveal:
          "Hers is the Maine Coon. She says anything smaller is barely a cat at all.",
      },
      recovery: {
        about:
          "Claire finished her treatment, and one small, insistent companion sat with her through most of it, demanding nothing but presence.",
        reveal:
          "Hers is the Ragdoll. It draped itself across her for the duration and she credits it with a good deal.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the cat breed they'd let rule the house. The one that runs the place.",
        reveal: "Name the breed and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite cat breed — the one they'd have curled up nearby — is a detail worth including.",
        reveal: "Pick the breed and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite cat breed is one of those quietly characterful choices.",
        reveal: "Pick the breed and say what it means to you.",
      },
    },
  },
  {
    title: "Butterfly",
    description: "The one they'd stop the walk for",
    is_finite: false,
    categories: ["Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who planted her whole garden to draw one species in, and counted the summer a success when they arrived.",
        reveal:
          "Hers was the Red Admiral. She planted buddleia the length of the fence just to bring them in, every August.",
      },
      recovery: {
        about:
          "Claire finished her treatment in spring, and one early arrival in the garden became, without her quite deciding it, a small private marker of the season turning.",
        reveal:
          "Hers is the Brimstone. The first one of the year, she says, is the moment winter properly lets go.",
      },
      christening: {
        about:
          "Lily's christening fell on a bright day, and one visitor to the churchyard garden was quietly adopted by the family as a good omen.",
        reveal:
          "A Peacock butterfly settled on the wall through the whole service, and the family have decided it counts for something.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the butterfly they'd stop the walk for. The flash of colour they look for.",
        reveal: "Name the butterfly and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite butterfly — the one they always point out — is a lovely detail to include.",
        reveal: "Pick the butterfly and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite butterfly is one of those small, attentive choices.",
        reveal: "Pick the butterfly and say what it means to you.",
      },
    },
  },
  {
    title: "Dinosaur",
    description: "The one they knew everything about aged six",
    is_finite: false,
    categories: ["Nature", "Childhood"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and can still, on request, deliver the full set of facts about one dinosaur that she committed to memory at the age of six and never released.",
        reveal:
          "Hers is the Stegosaurus. She has retained every fact about it since 1991 and will share them unprompted.",
      },
      graduation: {
        about:
          "Tom traces his interest in how big things hold themselves up — eventually, architecture — back to one creature he was obsessed with as a small boy.",
        reveal:
          "His is the Diplodocus. He says it was the first thing that made him wonder how anything that size stayed standing.",
      },
      christening: {
        about:
          "Lily's nursery is being decorated, and one creature has, by family vote, been chosen to preside over it.",
        reveal:
          "The family have settled on the Triceratops for the nursery wall. It won by a clear margin.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the dinosaur they knew everything about aged six. The first great obsession.",
        reveal: "Name the dinosaur and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite dinosaur — the childhood obsession that lingered — is a fun detail to include.",
        reveal: "Pick the dinosaur and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite dinosaur is one of those things almost everyone secretly still has.",
        reveal: "Pick the dinosaur and say what it means to you.",
      },
    },
  },
  {
    title: "Mythical creature",
    description: "The one they'd most want to be real",
    is_finite: false,
    categories: ["Childhood", "Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who collected one creature in every form — bookends, a door knocker, a brass one on the mantel — across a whole life.",
        reveal:
          "Hers was the dragon. Her house was quietly full of them, in brass and wood and one stained-glass panel she made herself.",
      },
      graduation: {
        about:
          "Tom grew up in Wales on a particular set of stories, and one creature from them has stayed with him longer than he'd readily admit.",
        reveal:
          "His is the dragon — the Welsh one specifically, which he insists is a different animal entirely.",
      },
      christening: {
        about:
          "Lily's bookshelf is being assembled by relatives with strong views, and one creature keeps recurring across the chosen titles.",
        reveal:
          "The unicorn has appeared on roughly half the books she's been given. The family take this as a sign.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the mythical creature they'd most want to be real. The one from their imagination.",
        reveal: "Name the creature and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite mythical creature — the one that captured them young — is a lovely detail to include.",
        reveal: "Pick the creature and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite mythical creature is one of those choices that says something about the imagination behind it.",
        reveal: "Pick the creature and say what it means to you.",
      },
    },
  },

  // Gaps batch C — Places
  {
    title: "Mountain or peak",
    description: "The one they'd climb again tomorrow",
    is_finite: false,
    categories: ["Places", "Nature"],
    placeholders: {
      engagement: {
        about:
          "Callum and Sophie got engaged in the Lake District after a climb that didn't go entirely to plan — wrong path, right answer.",
        reveal:
          "Theirs is Helvellyn. He proposed near the top, out of breath, having rehearsed it for the wrong summit.",
      },
      retirement: {
        about:
          "David is retiring from engineering with a list — and one mountain at the top of it, climbed once, with hundreds more behind it waiting.",
        reveal:
          "His is Ben Nevis. He climbed it for his sixtieth and intends the rest of the Munros to fill his retirement.",
      },
      achievement: {
        about:
          "Marcus ran his first marathon, raising for the RNLI through favpoll. One climb, early on, was where he first thought he might actually be able to do this.",
        reveal:
          "His is Snowdon. The first proper thing he climbed when he started getting fit, and the moment he believed the marathon was possible.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the mountain or peak they'd climb again tomorrow. The one that's theirs.",
        reveal: "Name the mountain and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite mountain or peak — the climb they'd repeat in a heartbeat — is a detail worth including.",
        reveal: "Pick the mountain and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite mountain is one of those choices that says where someone feels most alive.",
        reveal: "Pick the mountain and say what it means to you.",
      },
    },
  },
  {
    title: "River",
    description: "The one they'd always walk beside",
    is_finite: false,
    categories: ["Places", "Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher with one river she returned to every spring, on foot, for the quality of quiet she said it kept better than anywhere.",
        reveal:
          "Hers was the Wye. She walked its banks every spring and said it was the most peaceful water in the country.",
      },
      tribute: {
        about:
          "A mentor who treated one river as a text — something to be walked and read, end to end, for what it could teach. He got a surprising distance along it.",
        reveal:
          "His was the Thames. He said you could read the whole history of the country in it if you walked far enough.",
      },
      leaving: {
        about:
          "Priya spent six years beside one river and walked it in all conditions. She leaves knowing its moods better than most lifelong locals.",
        reveal:
          "Hers was the Mersey. Six years living beside it, and she walked it daily whatever the weather threw.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the river they'd always walk beside. The water they go back to.",
        reveal: "Name the river and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite river — the one they walk to think — is a detail worth including.",
        reveal: "Pick the river and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite river is one of those quietly grounding choices.",
        reveal: "Pick the river and say what it means to you.",
      },
    },
  },
  {
    title: "Castle",
    description: "The one that stayed with them",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher with one castle she returned to on the wildest stretch of coast, because she said nowhere else made her feel so small in a good way.",
        reveal:
          "Hers was Bamburgh, on the Northumberland coast, where she said the sea and the stone belonged together.",
      },
      tribute: {
        about:
          "A mentor who held one ruined castle, perched impossibly on a headland, as the most theatrical thing anyone had ever built on these islands.",
        reveal:
          "His was Dunnottar, on its cliff, which he said was the most dramatic thing built in Britain.",
      },
      graduation: {
        about:
          "Tom studied architecture, and one castle near where he grew up did the early teaching — about scale, intent, and how stone makes a statement.",
        reveal:
          "His is Caernarfon. He says it taught him more about how buildings hold power than any lecture did.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the castle that stayed with them. The one that stopped them dead.",
        reveal: "Name the castle and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite castle — the one they always make time for — is a detail worth including.",
        reveal: "Pick the castle and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite castle is one of those choices that reveals what moves someone.",
        reveal: "Pick the castle and say what it means to you.",
      },
    },
  },
  {
    title: "Garden to visit",
    description: "The one they'd lose an afternoon in",
    is_finite: false,
    categories: ["Places", "Nature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who made an annual pilgrimage to one garden and returned each time full of plans her own borders never entirely lived up to. She didn't mind.",
        reveal:
          "Hers was Sissinghurst. She went every June and came home with a notebook of things to try and never quite did.",
      },
      anniversary: {
        about:
          "Forty years, and one garden walked in the same season every time — the same circuit of the same lake, the colours a little different each year.",
        reveal:
          "Theirs is Stourhead. They walk the lake every autumn and have done for most of forty years.",
      },
      recovery: {
        about:
          "Claire finished her treatment and chose one garden for the first proper day out. The particular hush of the place did something she's grateful for.",
        reveal:
          "Hers is the Lost Gardens of Heligan. She went the week after treatment ended and says it was exactly the right kind of quiet.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the garden they'd lose an afternoon in. The green place they return to.",
        reveal: "Name the garden and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite garden to visit — the one they always come back to — is a lovely detail to include.",
        reveal: "Pick the garden and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite garden is one of those restorative, telling choices.",
        reveal: "Pick the garden and say what it means to you.",
      },
    },
  },
  {
    title: "Beach",
    description: "The one they'd drive hours to reach",
    is_finite: false,
    categories: ["Places"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher with one vast empty beach she returned to for the room it gave her head. She walked the length of it and back, working things out.",
        reveal:
          "Hers was Holkham. Miles of empty sand, and she said there was nowhere better to think.",
      },
      wedding: {
        about:
          "Emma and James have one stretch of Welsh coast tied to the beginning of everything, and arranged the wedding so they could see it from the day.",
        reveal:
          "Theirs is Rhossili. They got engaged at the far end of it and came back to marry within sight of the same spot.",
      },
      achievement: {
        about:
          "Marcus ran his first marathon, raising for the RNLI through favpoll. He trained on the coast, and one long beach took the brunt of the early-morning miles.",
        reveal:
          "His is Woolacombe. He did half his marathon training on it and credits the soft sand with everything.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the beach they'd drive hours to reach. The stretch of coast that's theirs.",
        reveal: "Name the beach and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite beach — the one worth the journey — is a detail worth including.",
        reveal: "Pick the beach and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite beach is one of those choices that takes someone straight back.",
        reveal: "Pick the beach and say what it means to you.",
      },
    },
  },

  // Gaps batch D — Culture
  {
    title: "TV programme",
    description: "The one they'd never miss",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose Sunday evenings had a fixed shape, built around one gentle programme she would not hear criticised.",
        reveal:
          "Hers was Last of the Summer Wine. She watched it on Sunday evenings for thirty years and refused to admit it had ever ended.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years, taking with him an encyclopaedic command of one sitcom that his colleagues will, on balance, miss.",
        reveal:
          "His is Only Fools and Horses. He can quote whole episodes and frequently does, regardless of whether anyone has asked.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one programme that reliably undoes her every autumn, no matter how composed she claims to be going in.",
        reveal:
          "Hers is The Great British Bake Off. She has watched every series and cries at the showstoppers without fail.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the TV programme they'd never miss. The one that owns a slot in their week.",
        reveal: "Name the programme and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite TV programme — the appointment they keep — is a detail worth including.",
        reveal: "Pick the programme and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite TV programme is one of those things people are very loyal to.",
        reveal: "Pick the programme and say what it means to you.",
      },
    },
  },
  {
    title: "Video game",
    description: "The one they'd lose a weekend to",
    is_finite: false,
    categories: ["Everyday life", "Childhood"],
    placeholders: {
      birthday: {
        about:
          "Sarah is turning 40 and has one game she's never stopped playing — picked up on a Game Boy as a child, still her reliable way to switch her brain off, or on.",
        reveal:
          "Hers is Tetris. She has been playing since a Game Boy in 1991 and still reaches for it when she needs to think.",
      },
      graduation: {
        about:
          "Tom studied architecture, and points, only half-joking, to one game's worlds as an early education in how a designed space invites you through it.",
        reveal:
          "His is The Legend of Zelda. He says its worlds taught him as much about space as anything he studied.",
      },
      leaving: {
        about:
          "Priya leaves behind a studio Friday tradition entirely of her making — a tournament with standings, grudges, and a trophy she bought herself.",
        reveal:
          "Hers was Mario Kart. The studio tournament she started is now an institution she's leaving behind.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the video game they'd lose a weekend to. The one they always come back to.",
        reveal: "Name the game and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite video game — from any era — is a detail worth including.",
        reveal: "Pick the game and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite video game is one of those things people light up about.",
        reveal: "Pick the game and say what it means to you.",
      },
    },
  },
  {
    title: "Car",
    description: "The one they'd keep in the garage forever",
    is_finite: false,
    categories: ["Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who kept one car for three decades, gave it a name, and was genuinely bereaved when it could go no further.",
        reveal:
          "Hers was the Morris Minor. She drove the same one for thirty years and named it, and mourned it when it finally went.",
      },
      tribute: {
        about:
          "A mentor who held one car up as proof that engineering could be art, and considered the matter closed to discussion.",
        reveal:
          "His was the Jaguar E-Type. He said it was the most beautiful object ever made for the road and would not entertain debate.",
      },
      retirement: {
        about:
          "David is retiring from engineering, and has one vehicle he holds up as a near-perfect piece of design — honest, fixable, and right the first time.",
        reveal:
          "His is the Land Rover Defender. Thirty-five years as an engineer and it's the only design he says was never improved by changing it.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the car they'd keep in the garage forever. The one they'd never sell.",
        reveal: "Name the car and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite car — owned, or just longed after — is a detail worth including.",
        reveal: "Pick the car and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite car is one of those choices people hold with real feeling.",
        reveal: "Pick the car and say what it means to you.",
      },
    },
  },
  {
    title: "Comedian",
    description: "The one who could always make them laugh",
    is_finite: false,
    categories: ["Film & TV"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who quoted one comedian endlessly and accurately, and held her up as the finest observer of the small and the everyday.",
        reveal:
          "Hers was Victoria Wood. She had every routine by heart and said nobody else wrote about ordinary life so exactly.",
      },
      tribute: {
        about:
          "A mentor who admired one comedian for a particular trick — slipping something true past you while you were helpless. He aspired to it in his own way.",
        reveal:
          "His was Billy Connolly. He said nobody else could make a serious point land while you were still laughing.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one comedian whose oldest material still reduces her to tears, however many times she's heard it.",
        reveal:
          "Hers is Peter Kay. She can't get through the garlic bread bit without losing it, every single time.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the comedian who could always make them laugh. The one whose timing they love.",
        reveal: "Name the comedian and what makes them theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite comedian — the one they quote constantly — is a detail worth including.",
        reveal: "Pick the comedian and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite comedian is one of those things that says a lot about a sense of humour.",
        reveal: "Pick the comedian and say what they mean to you.",
      },
    },
  },
  {
    title: "TV theme tune",
    description: "The one that meant the night was starting",
    is_finite: false,
    categories: ["Film & TV", "Music"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had one theme tune she associated with hiding behind the sofa as a girl, and never lost her delight in being scared by it.",
        reveal:
          "Hers was the Doctor Who theme. She said no other piece of television music ever properly frightened her, and she loved it for that.",
      },
      retirement: {
        about:
          "David is retiring, and one piece of music has marked the start of his weekend for as long as he can remember — the signal that the working week was truly over.",
        reveal:
          "His is the Match of the Day theme. Thirty-five years of Saturday nights began with it the moment it played.",
      },
      tribute: {
        about:
          "A mentor with a great fondness for one theme he considered a small masterpiece, played in full, every time, before anyone was allowed to speak.",
        reveal:
          "His was the Inspector Morse theme. He said it was the most elegant minute of music television ever produced.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the TV theme tune that meant the night was starting. The few bars they'd know anywhere.",
        reveal: "Name the theme and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite TV theme tune — the one that takes them straight back — is a lovely detail to include.",
        reveal: "Pick the theme and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite TV theme tune is one of those things that lands instantly.",
        reveal: "Pick the theme and say what it means to you.",
      },
    },
  },
  {
    title: "Painter or artist",
    description: "The one whose work they'd cross a city to see",
    is_finite: false,
    categories: ["Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who travelled to see one painter's work whenever she could, and stood before the late paintings as though they were weather.",
        reveal:
          "Hers was Turner. She made the trip to see the late seascapes whenever they were shown and stood a long time in front of them.",
      },
      tribute: {
        about:
          "A mentor drawn to one painter for the stillness — the sense, he said, that you'd walked in on something private and ought to lower your voice.",
        reveal:
          "His was Vermeer. He said more happened in one quiet Vermeer room than in most epic canvases.",
      },
      award: {
        about:
          "Amelia, just named Teacher of the Year, has one living artist she uses to teach her pupils how to actually look at something. It works every time.",
        reveal:
          "Hers is Hockney. She takes her class to see a show every year and says he makes them look properly for once.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the painter or artist whose work they'd cross a city to see. The one that moves them.",
        reveal: "Name the artist and what they mean to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite painter or artist — the one they always stop for — is a detail worth including.",
        reveal: "Pick the artist and say what makes them theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite painter or artist is one of those choices that reveals what someone responds to.",
        reveal: "Pick the artist and say what they mean to you.",
      },
    },
  },
  {
    title: "Famous painting",
    description: "The one they'd hang above the fireplace",
    is_finite: false,
    categories: ["Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who kept one painting where she'd see it daily, and read it as a quiet lesson about how to let things go well.",
        reveal:
          "Hers was The Fighting Temeraire. She had a print in the hall and said it was about endings done with dignity.",
      },
      tribute: {
        about:
          "A mentor who held one painting as the truest thing he knew about solitude — a late-night diner that said more, he claimed, than a shelf of novels.",
        reveal:
          "His was Nighthawks. He said it understood loneliness better than anything written about it.",
      },
      recovery: {
        about:
          "Claire finished her treatment and spent an unhurried hour with one set of paintings, on a bench, going nowhere. She still thinks of that hour.",
        reveal:
          "Hers is Water Lilies. She sat in front of them on a gallery bench for an hour the month she finished treatment.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the famous painting they'd hang above the fireplace. The one that stops them.",
        reveal: "Name the painting and what it means to them.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite painting — the one they'd live with — is a detail worth including.",
        reveal: "Pick the painting and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite painting is one of those choices that says something about what someone sees.",
        reveal: "Pick the painting and say what it means to you.",
      },
    },
  },

  // Gaps batch E — Everyday / Childhood / Time
  {
    title: "Fairy tale",
    description: "The one they'd want read at bedtime",
    is_finite: false,
    categories: ["Childhood", "Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who returned to one story above all others in the classroom, because she said every child in front of her needed to hear it at least once.",
        reveal:
          "Hers was The Ugly Duckling. She read it to thirty years of classes and said it was the only one that mattered.",
      },
      graduation: {
        about:
          "Tom studied architecture and traces a faintly ridiculous through-line from one childhood tale to a career spent thinking about height and ambition.",
        reveal:
          "His is Jack and the Beanstalk. He says it's the first story that made him think about what you build and how high.",
      },
      christening: {
        about:
          "Lily's bedtime stories are being carefully vetted, and one has been judged the gentlest introduction to the whole strange genre.",
        reveal:
          "The family have started Lily on Goldilocks, chosen for being the least frightening of the options.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the fairy tale they'd want read at bedtime. The one that shaped how they saw the world.",
        reveal: "Name the tale and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite fairy tale — the one they never tired of — is a lovely detail to include.",
        reveal: "Pick the tale and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite fairy tale is one of those choices that reaches a long way back.",
        reveal: "Pick the tale and say what it means to you.",
      },
    },
  },
  {
    title: "Christmas tradition",
    description: "The one that wouldn't be Christmas without",
    is_finite: false,
    categories: ["Time", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher whose Christmas began on a fixed date, in a fixed way, to a particular record, and woe betide anyone who suggested doing it early or late.",
        reveal:
          "Hers was decorating the tree. Always the first Sunday of December, always to the same record, never to be rushed.",
      },
      anniversary: {
        about:
          "Forty years, and one fixed point in every Christmas — a walk taken on the same day, the same loop, with the same good-natured dispute about direction.",
        reveal:
          "Theirs is the Boxing Day walk. Same route, same forty years, same argument about which way round.",
      },
      christening: {
        about:
          "Lily is too small to know, but her first Christmas is being used to launch a new family ritual. The committee has not yet agreed what goes in the box.",
        reveal:
          "Lily's first Christmas starts a tradition: the family have agreed on a Christmas Eve box, and the contents are already disputed.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the Christmas tradition it wouldn't be Christmas without. The fixed point of their year.",
        reveal: "Name the tradition and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite Christmas tradition — the non-negotiable one — is a warm detail to include.",
        reveal: "Pick the tradition and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite Christmas tradition is one of those things people hold onto fiercely.",
        reveal: "Pick the tradition and say what it means to you.",
      },
    },
  },
  {
    title: "Regional or dialect word",
    description: "The one that gives away where they're from",
    is_finite: false,
    categories: ["Everyday life", "Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who had one word for the children in her care, used so often and so warmly it became how a generation remembered her.",
        reveal:
          "Hers was 'bonny'. She called every child she ever taught it, and meant it about every one of them.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years, and one word covered all his highest praise — for work, for weather, for company. It meant everything was as it should be.",
        reveal:
          "His is 'gradely'. A good day, a good job, a good pint — all of it gradely, for thirty-five years.",
      },
      leaving: {
        about:
          "Priya leaves behind a studio that now speaks very slightly differently — one word she carried with her that everyone picked up without noticing.",
        reveal:
          "Hers was 'mither'. She brought it south with her and the studio adopted it within a fortnight.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the regional or dialect word that gives away where they're from. The word that's pure them.",
        reveal: "Name the word and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite regional or dialect word — the one they can't shake — is a lovely detail to include.",
        reveal: "Pick the word and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite regional or dialect word is one of those things that says exactly where someone's from.",
        reveal: "Pick the word and say what it means to you.",
      },
    },
  },

  // Orphans batch — Month, Festival or holiday
  {
    title: "Month",
    description: "The one they'd live in all year if they could",
    is_finite: true,
    categories: ["Time"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who loved one month above the rest — the new school year settled, the year turning, the light she always said was the best of it.",
        reveal:
          "Hers was October. The turn of the leaves, the new school year settled, the light she liked best.",
      },
      anniversary: {
        about:
          "Forty years, and one month that has always belonged to the two of them, marked the same way each time it comes round.",
        reveal:
          "Theirs is May. They married in it, forty years ago, and still call it the best month for it.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has one month she has always felt ownership of, and has never seen the need to pretend otherwise.",
        reveal:
          "Hers is June — her birthday month, and the one she'd choose to live in if she had to pick.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the month they'd live in all year if they could. The one that feels most like them.",
        reveal: "Name the month and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite month — and why that one — is a small, telling detail to include.",
        reveal: "Pick the month and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite month is one of those quietly revealing choices.",
        reveal: "Pick the month and say what it means to you.",
      },
    },
  },
  {
    title: "Festival or holiday",
    description: "The one they'd never let pass unmarked",
    is_finite: false,
    categories: ["Time", "Everyday life"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who loved one occasion more than any of the warmer, easier ones — the cold, the crowd, the ritual of it.",
        reveal:
          "Hers was Bonfire Night. She loved the cold and the crowd and the toffee more than any warmer occasion.",
      },
      anniversary: {
        about:
          "Forty New Years seen in together, always the same way, always the same song at the end of it.",
        reveal:
          "Theirs is Hogmanay. Forty New Years seen in together, the same way, the same song.",
      },
      christening: {
        about:
          "Lily was christened in spring, and the family have quietly adopted one occasion as hers to grow up with.",
        reveal:
          "Lily was christened near Easter, and the family have quietly adopted it as her occasion.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the festival or holiday they'd never let pass unmarked. The one that's theirs.",
        reveal: "Name the occasion and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite festival or holiday — the one they go all out for — is a detail worth including.",
        reveal: "Pick the occasion and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite festival or holiday is one of those choices that says a lot about someone.",
        reveal: "Pick the occasion and say what it means to you.",
      },
    },
  },

  // Comic-topic-fix — Comic or annual
  {
    title: "Comic or annual",
    description: "The one they couldn't wait to get every week",
    is_finite: false,
    categories: ["Childhood", "Literature"],
    placeholders: {
      memorial: {
        about:
          "A beloved mother and teacher who saved her own childhood comics and brought them out on rainy lunchtimes for decades of grateful classes.",
        reveal:
          "Hers was the Beano. She kept her childhood copies in a tin and read them to thirty years of wet-playtime classes.",
      },
      retirement: {
        about:
          "David is retiring after thirty-five years in engineering, and traces the original spark to one comic and one space pilot read under the covers.",
        reveal:
          "His was the Eagle. He credits Dan Dare with the fact that he became an engineer at all.",
      },
      birthday: {
        about:
          "Sarah is turning 40 and has never stopped reading the comics she loved as a child — the complete set is on the shelf and well-thumbed.",
        reveal:
          "Hers is Asterix. She has the whole run and rereads them more often than she'll admit at forty.",
      },
      celebration: {
        about:
          "Tell their story — who they are, what makes this celebration worth having, and the comic or annual they couldn't wait to get every week. The one they read cover to cover.",
        reveal: "Name the comic and what makes it theirs.",
      },
      other: {
        about:
          "Tell us who this person is and why you're gathering. A favourite comic or annual — the one that defined their Saturdays — is a lovely detail to include.",
        reveal: "Pick the comic and say what makes it theirs.",
      },
      default: {
        about:
          "Tell us who this is for and what the occasion is. A favourite comic or annual is one of those choices that reaches straight back to childhood.",
        reveal: "Pick the comic and say what it means to you.",
      },
    },
  },
];

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
  // Expanded — 1900s and 1910s added at the start; rest renumbered.
  Decade: {
    "1900s": 1,
    "1910s": 2,
    "1920s": 3,
    "1930s": 4,
    "1940s": 5,
    "1950s": 6,
    "1960s": 7,
    "1970s": 8,
    "1980s": 9,
    "1990s": 10,
    "2000s": 11,
    "2010s": 12,
    "2020s": 13,
  },
  Season: {
    Spring: 1,
    Summer: 2,
    Autumn: 3,
    Winter: 4,
  },
  Month: {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  },
  "Festival or holiday": {
    "New Year": 1,
    "Burns Night": 2,
    "Valentine's Day": 3,
    "Shrove Tuesday": 4,
    "St David's Day": 5,
    Holi: 6,
    "St Patrick's Day": 7,
    Easter: 8,
    Passover: 9,
    Vaisakhi: 10,
    "St George's Day": 11,
    "May Day": 12,
    "Eid al-Fitr": 13,
    Midsummer: 14,
    "Harvest festival": 15,
    Halloween: 16,
    Diwali: 17,
    "Bonfire Night": 18,
    "St Andrew's Day": 19,
    Hanukkah: 20,
    Christmas: 21,
    "Boxing Day": 22,
    Hogmanay: 23,
  },
};

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
    "1900s",
    "1910s",
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
    "Bat",
    "Bear",
    "Camel",
    "Cat",
    "Cheetah",
    "Chimpanzee",
    "Cow",
    "Deer",
    "Dog",
    "Dolphin",
    "Donkey",
    "Elephant",
    "Ferret",
    "Fox",
    "Giraffe",
    "Goat",
    "Gorilla",
    "Guinea pig",
    "Hamster",
    "Hare",
    "Hedgehog",
    "Hippopotamus",
    "Horse",
    "Kangaroo",
    "Koala",
    "Lemur",
    "Leopard",
    "Lion",
    "Meerkat",
    "Mole",
    "Monkey",
    "Mouse",
    "Otter",
    "Owl",
    "Panda",
    "Penguin",
    "Pig",
    "Polar bear",
    "Pony",
    "Rabbit",
    "Raccoon",
    "Rat",
    "Red panda",
    "Red squirrel",
    "Reindeer",
    "Rhinoceros",
    "Sheep",
    "Sloth",
    "Squirrel",
    "Stoat",
    "Tiger",
    "Tortoise",
    "Weasel",
    "Wolf",
    "Zebra",
  ],
  Bird: [
    "Avocet",
    "Barn owl",
    "Blackbird",
    "Blackcap",
    "Blue tit",
    "Brambling",
    "Bullfinch",
    "Buzzard",
    "Canada goose",
    "Carrion crow",
    "Chaffinch",
    "Chiffchaff",
    "Coal tit",
    "Collared dove",
    "Coot",
    "Cormorant",
    "Cuckoo",
    "Curlew",
    "Dipper",
    "Dunnock",
    "Fieldfare",
    "Firecrest",
    "Gannet",
    "Goldcrest",
    "Goldfinch",
    "Goosander",
    "Great spotted woodpecker",
    "Great tit",
    "Green woodpecker",
    "Greenfinch",
    "Greylag goose",
    "Grey wagtail",
    "Guillemot",
    "Hen harrier",
    "Heron",
    "Herring gull",
    "Hobby",
    "House martin",
    "House sparrow",
    "Jackdaw",
    "Jay",
    "Kestrel",
    "Kingfisher",
    "Lapwing",
    "Linnet",
    "Little egret",
    "Little owl",
    "Long-tailed tit",
    "Magpie",
    "Mallard",
    "Marsh tit",
    "Meadow pipit",
    "Merlin",
    "Mistle thrush",
    "Moorhen",
    "Mute swan",
    "Nightingale",
    "Nuthatch",
    "Oystercatcher",
    "Peregrine falcon",
    "Pheasant",
    "Pied wagtail",
    "Puffin",
    "Raven",
    "Red kite",
    "Redwing",
    "Reed bunting",
    "Robin",
    "Rook",
    "Sand martin",
    "Siskin",
    "Skylark",
    "Snipe",
    "Song thrush",
    "Sparrowhawk",
    "Starling",
    "Stonechat",
    "Swallow",
    "Swift",
    "Tawny owl",
    "Teal",
    "Treecreeper",
    "Tufted duck",
    "Waxwing",
    "Whitethroat",
    "Wood pigeon",
    "Wren",
    "Yellowhammer",
  ],
  Biscuit: [
    "Biscoff",
    "Bourbon",
    "Chocolate chip cookie",
    "Chocolate digestive",
    "Chocolate finger",
    "Custard cream",
    "Digestive",
    "Fig roll",
    "Garibaldi",
    "Ginger nut",
    "Gingerbread",
    "Hobnob",
    "Jaffa Cake",
    "Jammie Dodger",
    "Malted milk",
    "Nice biscuit",
    "Oreo",
    "Party ring",
    "Penguin",
    "Pink Wafer",
    "Rich Tea",
    "Shortbread",
    "Tunnock's Caramel Wafer",
    "Tunnock's Tea Cake",
    "Viennese Whirl",
    "Wagon Wheel",
  ],
  "Childhood game": [
    "Board games",
    "British bulldogs",
    "Building dens",
    "Card games",
    "Catch",
    "Conkers",
    "Elastics",
    "French cricket",
    "Hide and seek",
    "Hopscotch",
    "It (Tag)",
    "Kick the can",
    "Leapfrog",
    "Marbles",
    "Rounders",
    "Simon Says",
    "Skipping",
    "Stuck in the mud",
    "Swingball",
    "What's the time, Mr Wolf?",
  ],
  "Comfort food": [
    "Bacon sandwich",
    "Bangers and mash",
    "Beans on toast",
    "Bubble and squeak",
    "Cheese on toast",
    "Chilli con carne",
    "Chips",
    "Cottage pie",
    "Crumpets",
    "Fish and chips",
    "Full English breakfast",
    "Jacket potato",
    "Lasagne",
    "Macaroni cheese",
    "Mashed potato",
    "Pasta",
    "Pie and mash",
    "Porridge",
    "Risotto",
    "Roast dinner",
    "Sausage roll",
    "Scrambled eggs",
    "Shepherd's pie",
    "Soup",
    "Spaghetti bolognese",
    "Stew",
    "Toad in the hole",
    "Toast",
    "Welsh rarebit",
  ],
  Drink: [
    "Ale",
    "Apple juice",
    "Beer",
    "Bitter",
    "Brandy",
    "Builder's tea",
    "Cappuccino",
    "Champagne",
    "Cider",
    "Coffee",
    "Cola",
    "Earl Grey",
    "Espresso",
    "Gin & tonic",
    "Green tea",
    "Herbal tea",
    "Hot chocolate",
    "Juice",
    "Lager",
    "Latte",
    "Lemonade",
    "Milkshake",
    "Mulled wine",
    "Orange juice",
    "Peppermint tea",
    "Pimm's",
    "Port",
    "Prosecco",
    "Red wine",
    "Rosé",
    "Rum",
    "Sherry",
    "Smoothie",
    "Sparkling water",
    "Squash",
    "Stout",
    "Tea",
    "Vodka",
    "Whisky",
    "White wine",
  ],
  Film: [
    "Amélie",
    "Argo",
    "Brief Encounter",
    "Brokeback Mountain",
    "Casablanca",
    "Cinema Paradiso",
    "Clueless",
    "E.T.",
    "Four Weddings and a Funeral",
    "Gone with the Wind",
    "Gregory\'s Girl",
    "It\'s a Wonderful Life",
    "Jurassic Park",
    "La La Land",
    "Lawrence of Arabia",
    "Local Hero",
    "Notting Hill",
    "Paddington 2",
    "Pulp Fiction",
    "Schindler\'s List",
    "Some Like It Hot",
    "Spirited Away",
    "The Italian Job",
    "The Shawshank Redemption",
    "The Sound of Music",
    "To Kill a Mockingbird",
    "Toy Story",
    "Whisky Galore",
    "Wings of the Dove",
  ],
  "Film genre": [
    "Action",
    "Animation",
    "Biopic",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Horror",
    "Musical",
    "Romance",
    "Romantic comedy",
    "Science fiction",
    "Spy thriller",
    "Superhero",
    "Thriller",
    "War film",
    "Western",
    "World cinema",
  ],
  Flower: [
    "Anemone",
    "Aster",
    "Begonia",
    "Bluebell",
    "Buttercup",
    "Camellia",
    "Carnation",
    "Chrysanthemum",
    "Clematis",
    "Cornflower",
    "Cosmos",
    "Crocus",
    "Daffodil",
    "Dahlia",
    "Daisy",
    "Delphinium",
    "Forget-me-not",
    "Foxglove",
    "Freesia",
    "Fuchsia",
    "Geranium",
    "Gerbera",
    "Gladiolus",
    "Hellebore",
    "Hollyhock",
    "Honeysuckle",
    "Hyacinth",
    "Hydrangea",
    "Iris",
    "Jasmine",
    "Lavender",
    "Lilac",
    "Lily",
    "Lily of the valley",
    "Lupin",
    "Magnolia",
    "Marigold",
    "Nasturtium",
    "Orchid",
    "Pansy",
    "Peony",
    "Petunia",
    "Poppy",
    "Primrose",
    "Rose",
    "Snapdragon",
    "Snowdrop",
    "Sunflower",
    "Sweet pea",
    "Tulip",
    "Violet",
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
    "Book club",
    "Calligraphy",
    "Climbing",
    "Collecting",
    "Cooking",
    "Crosswords or puzzles",
    "Drawing or sketching",
    "Fishing",
    "Gardening",
    "Knitting or sewing",
    "Lego",
    "Metal detecting",
    "Model making",
    "Origami",
    "Painting",
    "Photography",
    "Playing music",
    "Pottery",
    "Reading",
    "Singing",
    "Volunteering",
    "Walking",
    "Woodwork",
  ],
  Instrument: [
    "Accordion",
    "Bagpipes",
    "Banjo",
    "Bass guitar",
    "Cello",
    "Clarinet",
    "Double bass",
    "Drums",
    "Fiddle",
    "Flute",
    "French horn",
    "Guitar",
    "Harmonica",
    "Harp",
    "Harpsichord",
    "Keyboard",
    "Mandolin",
    "Oboe",
    "Organ",
    "Piano",
    "Recorder",
    "Saxophone",
    "Sitar",
    "Trombone",
    "Trumpet",
    "Tuba",
    "Ukulele",
    "Viola",
    "Violin",
    "Voice",
  ],
  Landscape: [
    "Beach",
    "Canal",
    "Chalk downs",
    "City skyline",
    "Cliffs",
    "Coastline",
    "Estuary",
    "Farmland",
    "Fenland",
    "Forest",
    "Harbour",
    "Heath",
    "Lake",
    "Loch",
    "Marsh",
    "Meadow",
    "Mountains",
    "Open moorland",
    "River valley",
    "Rolling hills",
    "Sand dunes",
    "Village green",
    "Waterfall",
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
    "Afrobeats",
    "Blues",
    "Bluegrass",
    "Classical",
    "Country",
    "Drum and bass",
    "Electronic",
    "Folk",
    "Gospel",
    "Grime",
    "Heavy metal",
    "Hip-hop",
    "House",
    "Indie",
    "Jazz",
    "Musical theatre",
    "New wave",
    "Opera",
    "Pop",
    "Punk",
    "R&B",
    "Reggae",
    "Rock",
    "Soul",
    "Techno",
    "World music",
  ],
  Place: [
    "Allotment",
    "Café",
    "Church",
    "Cinema",
    "City",
    "Countryside",
    "Garden",
    "Home",
    "Kitchen",
    "Library",
    "Market",
    "Museum",
    "Park",
    "Pub",
    "Seaside",
    "Sports ground",
    "Theatre",
    "Village",
  ],
  Poet: [
    "Alfred Lord Tennyson",
    "Carol Ann Duffy",
    "Dylan Thomas",
    "Elizabeth Bishop",
    "Emily Brontë",
    "Emily Dickinson",
    "Gerard Manley Hopkins",
    "John Betjeman",
    "John Keats",
    "John Masefield",
    "Langston Hughes",
    "Mary Oliver",
    "Maya Angelou",
    "Pam Ayres",
    "Philip Larkin",
    "R.S. Thomas",
    "Roger McGough",
    "Rupert Brooke",
    "Seamus Heaney",
    "Simon Armitage",
    "Sylvia Plath",
    "Ted Hughes",
    "W.B. Yeats",
    "Walt Whitman",
    "Wilfred Owen",
    "William Blake",
    "William Shakespeare",
  ],
  Author: [
    "Agatha Christie",
    "Aldous Huxley",
    "Ali Smith",
    "Anthony Trollope",
    "Barbara Pym",
    "Bernardine Evaristo",
    "Bram Stoker",
    "Charles Dickens",
    "Charlotte Brontë",
    "Chimamanda Ngozi Adichie",
    "Colm Tóibín",
    "Douglas Adams",
    "Elizabeth Gaskell",
    "Evelyn Waugh",
    "George Eliot",
    "George Orwell",
    "Hilary Mantel",
    "Ian McEwan",
    "J.K. Rowling",
    "J.R.R. Tolkien",
    "James Baldwin",
    "Jane Austen",
    "Kazuo Ishiguro",
    "Ken Follett",
    "Maeve Binchy",
    "Muriel Spark",
    "P.G. Wodehouse",
    "Roald Dahl",
    "Terry Pratchett",
    "Thomas Hardy",
    "Virginia Woolf",
    "Zadie Smith",
  ],
  "School subject": [
    "Art",
    "Biology",
    "Chemistry",
    "Classics",
    "Design and technology",
    "Drama",
    "Economics",
    "English",
    "Food technology",
    "Geography",
    "History",
    "Languages",
    "Maths",
    "Music",
    "PE",
    "Physics",
    "Psychology",
    "RE",
    "Science",
  ],
  Smell: [
    "Beeswax polish",
    "Bonfire",
    "Bread baking",
    "Church candles",
    "Coffee in the morning",
    "Cut grass",
    "Damp earth",
    "Fresh laundry",
    "Freshly cut grass",
    "Garden after rain",
    "Lavender",
    "Library",
    "Old books",
    "Old churches",
    "Petrol",
    "Pine trees",
    "Rain on dry earth",
    "Sea air",
    "Sunscreen",
    "The sea",
    "Tobacco",
    "Warm tarmac",
    "Woodsmoke",
  ],
  Saying: [
    "A stitch in time",
    "Better late than never",
    "Better out than in",
    "Do as I say, not as I do",
    "Every cloud has a silver lining",
    "It'll be grand",
    "Just say yes",
    "Least said, soonest mended",
    "Make do and mend",
    "Measure twice, cut once",
    "Mustn't grumble",
    "One foot in front of the other",
    "Onwards and upwards",
    "Pick your battles",
    "Strong opinions, loosely held",
    "There's no such thing as a daft question",
    "This too shall pass",
    "Waste not, want not",
    "Where there's a will, there's a way",
    "Worse things happen at sea",
  ],
  Song: [
    "Abide With Me — traditional",
    "Amazing Grace — traditional",
    "Angels — Robbie Williams",
    "Bohemian Rhapsody — Queen",
    "Bridge Over Troubled Water — Simon & Garfunkel",
    "Candle in the Wind — Elton John",
    "Dancing Queen — ABBA",
    "Danny Boy — traditional",
    "Don\'t Look Back in Anger — Oasis",
    "Hey Jude — The Beatles",
    "Imagine — John Lennon",
    "Jerusalem — Parry",
    "Mr Brightside — The Killers",
    "My Way — Frank Sinatra",
    "Over the Rainbow — Judy Garland",
    "Perfect — Ed Sheeran",
    "Somewhere Only We Know — Keane",
    "The Winner Takes It All — ABBA",
    "Tiny Dancer — Elton John",
    "Waterloo Sunset — The Kinks",
    "What a Wonderful World — Louis Armstrong",
    "White Christmas — Bing Crosby",
    "Wind Beneath My Wings — Bette Midler",
    "Yesterday — The Beatles",
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
    "American football",
    "Athletics",
    "Badminton",
    "Baseball",
    "Basketball",
    "Boxing",
    "Cricket",
    "Cycling",
    "Darts",
    "Equestrian",
    "Fencing",
    "Football",
    "Formula 1",
    "Golf",
    "Gymnastics",
    "Hockey",
    "Horse racing",
    "Ice hockey",
    "Judo",
    "Motorcycling",
    "Netball",
    "Rowing",
    "Rugby league",
    "Rugby union",
    "Sailing",
    "Snooker",
    "Squash",
    "Swimming",
    "Table tennis",
    "Tennis",
    "Triathlon",
    "Volleyball",
    "Water polo",
    "Wrestling",
  ],
  Tree: [
    "Alder",
    "Apple",
    "Ash",
    "Aspen",
    "Beech",
    "Blackthorn",
    "Cedar",
    "Cherry blossom",
    "Crab apple",
    "Cypress",
    "Douglas fir",
    "Elder",
    "Elm",
    "Field maple",
    "Hawthorn",
    "Hazel",
    "Holly",
    "Hornbeam",
    "Horse chestnut",
    "Juniper",
    "Larch",
    "Lime",
    "London plane",
    "Magnolia",
    "Monkey puzzle",
    "Oak",
    "Pear",
    "Poplar",
    "Rowan",
    "Scots pine",
    "Silver birch",
    "Spruce",
    "Sweet chestnut",
    "Sycamore",
    "Walnut",
    "Whitebeam",
    "Willow",
    "Yew",
  ],
  "TV show": [
    "Animated series",
    "Chat show",
    "Cooking show",
    "Crime thriller",
    "Current affairs",
    "Documentary",
    "Drama series",
    "Game show",
    "Historical drama",
    "Horror",
    "Nature documentary",
    "News programme",
    "Panel show",
    "Period drama",
    "Quiz show",
    "Reality show",
    "Sci-fi series",
    "Sitcom",
    "Soap opera",
    "Sport",
    "Talk show",
  ],
  "Type of book": [
    "Biography",
    "Children's book",
    "Classic novel",
    "Crime fiction",
    "Graphic novel",
    "History",
    "Literary fiction",
    "Memoir",
    "Nature writing",
    "Novel",
    "Philosophy",
    "Poetry collection",
    "Popular science",
    "Romance",
    "Science fiction",
    "Self-help",
    "Short stories",
    "Thriller",
    "Travel writing",
  ],
  "Type of holiday": [
    "Activity holiday",
    "Beach holiday",
    "Camping",
    "City break",
    "Countryside retreat",
    "Cruise",
    "Cycling holiday",
    "Festival",
    "Golf holiday",
    "Island holiday",
    "Package holiday",
    "Road trip",
    "Safari",
    "Sailing holiday",
    "Self-catering",
    "Skiing",
    "Spa break",
    "Staycation",
    "Surf holiday",
    "Visiting family",
    "Walking holiday",
    "Winter sun",
    "Yoga retreat",
  ],
  "Type of song": [
    "Anthem",
    "Folk song",
    "Gospel song",
    "Hymn or spiritual",
    "Jazz standard",
    "Lullaby",
    "Love song",
    "Musical theatre number",
    "National anthem",
    "Nursery rhyme",
    "Protest song",
    "Sea shanty",
    "Show tune",
    "Song from childhood",
    "Song that makes you cry",
    "Song that makes you dance",
    "Song that tells a story",
    "Soul ballad",
    "Work song",
  ],
  "Way to spend Sunday": [
    "A long bath",
    "Allotment",
    "Cinema",
    "Cooking something special",
    "Doing absolutely nothing",
    "Drive in the countryside",
    "Farmers market",
    "Going to church",
    "Lie in",
    "Long walk",
    "Pottering in the garden",
    "Pub lunch",
    "Reading all day",
    "Roast dinner with family",
    "Sport",
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
    "Blue sky",
    "Blustery wind",
    "Bright sunshine",
    "Crisp frost",
    "Dewy spring morning",
    "Drizzle",
    "First snow",
    "Fog",
    "Gale",
    "Golden autumn light",
    "Hazy heat",
    "Heavy rain",
    "Heavy snow",
    "Hot still day",
    "Light snow",
    "Misty morning",
    "Overcast and mild",
    "Rainbow after rain",
    "Sea fret",
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

  // Nature batch — new topics
  Insect: [
    "Ant",
    "Bee",
    "Beetle",
    "Bumblebee",
    "Butterfly",
    "Caterpillar",
    "Cicada",
    "Cricket",
    "Damselfly",
    "Dragonfly",
    "Firefly",
    "Glow-worm",
    "Grasshopper",
    "Honeybee",
    "Hoverfly",
    "Lacewing",
    "Ladybird",
    "Mayfly",
    "Moth",
    "Praying mantis",
    "Stag beetle",
    "Wasp",
    "Weevil",
  ],
  "Sea creature": [
    "Anglerfish",
    "Barracuda",
    "Clownfish",
    "Crab",
    "Cuttlefish",
    "Dolphin",
    "Eel",
    "Great white shark",
    "Hermit crab",
    "Humpback whale",
    "Jellyfish",
    "Lobster",
    "Manta ray",
    "Narwhal",
    "Nautilus",
    "Octopus",
    "Orca",
    "Oyster",
    "Pufferfish",
    "Seahorse",
    "Seal",
    "Sea turtle",
    "Shark",
    "Shrimp",
    "Squid",
    "Starfish",
    "Stingray",
    "Swordfish",
    "Tuna",
    "Walrus",
    "Whale",
  ],
  Constellation: [
    "Andromeda",
    "Aquarius",
    "Aries",
    "Cancer",
    "Capricorn",
    "Cassiopeia",
    "Cygnus",
    "Draco",
    "Gemini",
    "Leo",
    "Libra",
    "Lyra",
    "Orion",
    "Pegasus",
    "Perseus",
    "Pisces",
    "Sagittarius",
    "Scorpius",
    "Taurus",
    "The Plough",
    "Ursa Minor",
    "Virgo",
  ],
  Gemstone: [
    "Agate",
    "Amber",
    "Amethyst",
    "Aquamarine",
    "Citrine",
    "Diamond",
    "Emerald",
    "Garnet",
    "Jade",
    "Jasper",
    "Lapis lazuli",
    "Malachite",
    "Moonstone",
    "Obsidian",
    "Onyx",
    "Opal",
    "Pearl",
    "Peridot",
    "Quartz",
    "Rose quartz",
    "Ruby",
    "Sapphire",
    "Tanzanite",
    "Tiger's eye",
    "Topaz",
    "Tourmaline",
    "Turquoise",
    "Zircon",
  ],

  // Sport batch — new topics
  "Football team": [
    "Aberdeen",
    "AC Milan",
    "Ajax",
    "Arsenal",
    "Aston Villa",
    "Barcelona",
    "Bayern Munich",
    "Birmingham City",
    "Blackburn Rovers",
    "Bolton Wanderers",
    "Borussia Dortmund",
    "Bournemouth",
    "Bradford City",
    "Brentford",
    "Brighton & Hove Albion",
    "Bristol City",
    "Burnley",
    "Cardiff City",
    "Celtic",
    "Charlton Athletic",
    "Chelsea",
    "Coventry City",
    "Crystal Palace",
    "Derby County",
    "Dundee United",
    "Everton",
    "Fulham",
    "Hearts",
    "Hibernian",
    "Hull City",
    "Inter Milan",
    "Ipswich Town",
    "Juventus",
    "Leeds United",
    "Leicester City",
    "Liverpool",
    "Luton Town",
    "Manchester City",
    "Manchester United",
    "Middlesbrough",
    "Millwall",
    "Newcastle United",
    "Norwich City",
    "Nottingham Forest",
    "Paris Saint-Germain",
    "Porto",
    "Portsmouth",
    "Preston North End",
    "Queens Park Rangers",
    "Rangers",
    "Reading",
    "Real Madrid",
    "Sheffield United",
    "Sheffield Wednesday",
    "Southampton",
    "Stoke City",
    "Sunderland",
    "Swansea City",
    "Tottenham Hotspur",
    "Watford",
    "West Bromwich Albion",
    "West Ham United",
    "Wolverhampton Wanderers",
    "Wrexham",
  ],
  Footballer: [
    "Alan Shearer",
    "Beth Mead",
    "Bobby Charlton",
    "Bobby Moore",
    "Cristiano Ronaldo",
    "David Beckham",
    "Dennis Bergkamp",
    "Diego Maradona",
    "Eric Cantona",
    "Erling Haaland",
    "Frank Lampard",
    "Franz Beckenbauer",
    "Gary Lineker",
    "George Best",
    "Gordon Banks",
    "Harry Kane",
    "Johan Cruyff",
    "Jude Bellingham",
    "Kelly Smith",
    "Kenny Dalglish",
    "Kevin De Bruyne",
    "Kylian Mbappé",
    "Leah Williamson",
    "Lionel Messi",
    "Lucy Bronze",
    "Marta",
    "Mohamed Salah",
    "Paolo Maldini",
    "Paul Gascoigne",
    "Paul Scholes",
    "Pelé",
    "Roberto Baggio",
    "Ronaldinho",
    "Ronaldo (Brazil)",
    "Roy Keane",
    "Ryan Giggs",
    "Steven Gerrard",
    "Thierry Henry",
    "Vinícius Júnior",
    "Zinedine Zidane",
  ],
  "Cricket team": [
    "Australia",
    "Bangladesh",
    "Derbyshire",
    "Durham",
    "England",
    "Essex",
    "Glamorgan",
    "Gloucestershire",
    "Hampshire",
    "India",
    "Ireland",
    "Kent",
    "Lancashire",
    "Leicestershire",
    "Middlesex",
    "New Zealand",
    "Northamptonshire",
    "Nottinghamshire",
    "Pakistan",
    "Somerset",
    "South Africa",
    "Sri Lanka",
    "Surrey",
    "Sussex",
    "Warwickshire",
    "West Indies",
    "Worcestershire",
    "Yorkshire",
    "Zimbabwe",
  ],
  "Rugby team": [
    "Argentina",
    "Australia",
    "Bath",
    "Bristol Bears",
    "British & Irish Lions",
    "Edinburgh",
    "England",
    "Exeter Chiefs",
    "Fiji",
    "France",
    "Glasgow Warriors",
    "Gloucester",
    "Harlequins",
    "Ireland",
    "Italy",
    "Leeds Rhinos",
    "Leicester Tigers",
    "Leinster",
    "Munster",
    "New Zealand",
    "Newcastle Falcons",
    "Northampton Saints",
    "Ospreys",
    "Sale Sharks",
    "Saracens",
    "Scotland",
    "South Africa",
    "St Helens",
    "Ulster",
    "Wales",
    "Warrington Wolves",
    "Wigan Warriors",
  ],
  "F1 driver": [
    "Alain Prost",
    "Alex Albon",
    "Ayrton Senna",
    "Carlos Sainz",
    "Charles Leclerc",
    "Damon Hill",
    "Esteban Ocon",
    "Fernando Alonso",
    "George Russell",
    "Graham Hill",
    "Isack Hadjar",
    "Jackie Stewart",
    "James Hunt",
    "Jenson Button",
    "Jim Clark",
    "Juan Manuel Fangio",
    "Kimi Antonelli",
    "Kimi Räikkönen",
    "Lando Norris",
    "Lewis Hamilton",
    "Max Verstappen",
    "Michael Schumacher",
    "Mika Häkkinen",
    "Nico Hülkenberg",
    "Nigel Mansell",
    "Niki Lauda",
    "Oliver Bearman",
    "Oscar Piastri",
    "Pierre Gasly",
    "Sebastian Vettel",
    "Sergio Pérez",
    "Stirling Moss",
    "Valtteri Bottas",
  ],
  "Tennis player": [
    "Andre Agassi",
    "Andy Murray",
    "Aryna Sabalenka",
    "Billie Jean King",
    "Björn Borg",
    "Boris Becker",
    "Carlos Alcaraz",
    "Chris Evert",
    "Coco Gauff",
    "Emma Raducanu",
    "Iga Świątek",
    "Jack Draper",
    "Jannik Sinner",
    "Jimmy Connors",
    "John McEnroe",
    "Justine Henin",
    "Maria Sharapova",
    "Martina Hingis",
    "Martina Navratilova",
    "Monica Seles",
    "Novak Djokovic",
    "Pete Sampras",
    "Rafael Nadal",
    "Roger Federer",
    "Serena Williams",
    "Stefan Edberg",
    "Steffi Graf",
    "Tim Henman",
    "Venus Williams",
  ],
  "Sports star": [
    "Andy Murray",
    "Anthony Joshua",
    "Ayrton Senna",
    "Bradley Wiggins",
    "Carl Lewis",
    "Chris Hoy",
    "Daley Thompson",
    "Diego Maradona",
    "Don Bradman",
    "Ian Botham",
    "Jack Nicklaus",
    "Jesse Owens",
    "Jessica Ennis-Hill",
    "Jonny Wilkinson",
    "Katarina Johnson-Thompson",
    "Lennox Lewis",
    "Lewis Hamilton",
    "Lionel Messi",
    "Michael Jordan",
    "Michael Phelps",
    "Mike Tyson",
    "Mo Farah",
    "Muhammad Ali",
    "Nadia Comăneci",
    "Pelé",
    "Roger Federer",
    "Serena Williams",
    "Seve Ballesteros",
    "Shane Warne",
    "Simone Biles",
    "Steve Redgrave",
    "Sugar Ray Robinson",
    "Tiger Woods",
    "Tyson Fury",
    "Usain Bolt",
  ],
  "Sporting moment": [
    "1966 World Cup final",
    "Bannister's four-minute mile",
    "Botham's Ashes 1981",
    "Coe and Ovett 1980",
    "England win the Cricket World Cup 2019",
    "England win the Rugby World Cup 2003",
    "Euro 96",
    "Frankel's unbeaten run",
    "Headingley 2019",
    "Italia 90",
    "Jonny Wilkinson's drop goal 2003",
    "Leicester City win the league",
    "Lionesses win Euro 2022",
    "Liverpool in Istanbul 2005",
    "Manchester United's treble 1999",
    "Murray wins Wimbledon 2013",
    "Red Rum's third Grand National",
    "Seve wins the Open 1984",
    "Steve Redgrave's fifth gold",
    "Super Saturday 2012",
    "The Miracle of Medinah 2012",
    "The Rumble in the Jungle",
    "Tiger Woods' 2019 Masters",
    "Torvill and Dean's Boléro",
    "Usain Bolt in Beijing 2008",
  ],

  // Missing topicItems for existing combinedPlaceholders entries
  Cuisine: [
    "American",
    "Brazilian",
    "British",
    "Caribbean",
    "Chinese",
    "Ethiopian",
    "Filipino",
    "French",
    "German",
    "Greek",
    "Hungarian",
    "Indian",
    "Indonesian",
    "Italian",
    "Japanese",
    "Korean",
    "Lebanese",
    "Malaysian",
    "Mexican",
    "Moroccan",
    "Nepalese",
    "Persian",
    "Polish",
    "Portuguese",
    "Scandinavian",
    "Spanish",
    "Sri Lankan",
    "Thai",
    "Turkish",
    "Vietnamese",
  ],
  Pudding: [
    "Apple pie",
    "Baked Alaska",
    "Bakewell tart",
    "Banana split",
    "Banoffee pie",
    "Bread and butter pudding",
    "Cheesecake",
    "Chocolate cake",
    "Chocolate fondant",
    "Chocolate mousse",
    "Christmas pudding",
    "Crème brûlée",
    "Crumble",
    "Eton mess",
    "Fruit salad",
    "Ice cream",
    "Jam roly-poly",
    "Knickerbocker glory",
    "Lemon meringue pie",
    "Lemon tart",
    "Pavlova",
    "Profiteroles",
    "Rice pudding",
    "Spotted dick",
    "Sticky toffee pudding",
    "Summer pudding",
    "Tarte tatin",
    "Tiramisu",
    "Treacle tart",
    "Trifle",
    "Victoria sponge",
  ],
  Sweet: [
    "Aniseed balls",
    "Black Jacks",
    "Bonbons",
    "Butterscotch",
    "Chewits",
    "Cola bottles",
    "Dolly mixtures",
    "Drumstick lollies",
    "Flying saucers",
    "Foam shrimps",
    "Fruit pastilles",
    "Fudge",
    "Gobstoppers",
    "Humbugs",
    "Jelly babies",
    "Jelly beans",
    "Liquorice",
    "Liquorice allsorts",
    "Love Hearts",
    "Marshmallows",
    "Midget Gems",
    "Murray Mints",
    "Parma violets",
    "Pear drops",
    "Pineapple chunks",
    "Rainbow drops",
    "Refreshers",
    "Rhubarb and custard",
    "Sherbet lemons",
    "Toffee",
    "Werther's Original",
    "Wine gums",
  ],

  // Food & Drink batch 1 — new topics (Crisps comes from corrections.ts below)
  Cheese: [
    "Brie",
    "Caerphilly",
    "Camembert",
    "Cheddar",
    "Cheshire",
    "Comté",
    "Cornish Yarg",
    "Cottage cheese",
    "Cream cheese",
    "Double Gloucester",
    "Edam",
    "Emmental",
    "Feta",
    "Goat's cheese",
    "Gorgonzola",
    "Gouda",
    "Gruyère",
    "Halloumi",
    "Lancashire",
    "Manchego",
    "Mascarpone",
    "Mature cheddar",
    "Mozzarella",
    "Paneer",
    "Parmesan",
    "Pecorino",
    "Provolone",
    "Red Leicester",
    "Ricotta",
    "Roquefort",
    "Stilton",
    "Taleggio",
    "Wensleydale",
  ],
  Vegetable: [
    "Artichoke",
    "Asparagus",
    "Aubergine",
    "Beetroot",
    "Broad bean",
    "Broccoli",
    "Brussels sprout",
    "Butternut squash",
    "Cabbage",
    "Carrot",
    "Cauliflower",
    "Celeriac",
    "Celery",
    "Chard",
    "Courgette",
    "Cucumber",
    "Fennel",
    "Garlic",
    "Green bean",
    "Kale",
    "Leek",
    "Lettuce",
    "Mangetout",
    "Mushroom",
    "Onion",
    "Pak choi",
    "Parsnip",
    "Pea",
    "Pepper",
    "Potato",
    "Pumpkin",
    "Radish",
    "Rocket",
    "Runner bean",
    "Shallot",
    "Spinach",
    "Spring onion",
    "Swede",
    "Sweet potato",
    "Sweetcorn",
    "Tomato",
    "Turnip",
    "Watercress",
  ],
  Sandwich: [
    "BLT",
    "Bacon",
    "Cheese",
    "Cheese and onion",
    "Cheese and pickle",
    "Chicken",
    "Chicken Caesar",
    "Chip butty",
    "Club",
    "Coronation chicken",
    "Cucumber",
    "Egg and cress",
    "Egg mayonnaise",
    "Falafel wrap",
    "Fish finger",
    "Ham",
    "Ham and cheese",
    "Hummus and salad",
    "Jam",
    "Peanut butter",
    "Ploughman's",
    "Prawn mayonnaise",
    "Reuben",
    "Roast beef",
    "Sausage",
    "Smoked salmon",
    "Tuna mayonnaise",
    "Tuna melt",
    "Turkey",
  ],
  Takeaway: [
    "Bao buns",
    "Biryani",
    "Burrito",
    "Chicken tikka masala",
    "Chips and curry sauce",
    "Chow mein",
    "Doner kebab",
    "Egg fried rice",
    "Fish and chips",
    "Fried chicken",
    "Gyros",
    "Katsu curry",
    "Kebab",
    "Korma",
    "Loaded fries",
    "Margherita pizza",
    "Noodles",
    "Onion bhaji",
    "Pad thai",
    "Pepperoni pizza",
    "Pho",
    "Prawn crackers",
    "Ramen",
    "Saag paneer",
    "Spring rolls",
    "Sushi",
    "Sweet and sour chicken",
    "Wings",
  ],
  Cocktail: [
    "Aperol spritz",
    "Bellini",
    "Bloody Mary",
    "Caipirinha",
    "Cosmopolitan",
    "Daiquiri",
    "Espresso martini",
    "French 75",
    "Gimlet",
    "Long Island iced tea",
    "Mai tai",
    "Manhattan",
    "Margarita",
    "Martini",
    "Mimosa",
    "Mojito",
    "Moscow mule",
    "Negroni",
    "Old fashioned",
    "Paloma",
    "Piña colada",
    "Pimm's",
    "Pornstar martini",
    "Sea breeze",
    "Sex on the beach",
    "Tequila sunrise",
    "Whiskey sour",
    "White Russian",
  ],

  // Food & Drink batch 2 — new topics
  Cake: [
    "Angel cake",
    "Bakewell tart",
    "Banana bread",
    "Battenberg",
    "Black Forest gateau",
    "Carrot cake",
    "Cheesecake",
    "Chocolate cake",
    "Chocolate fudge cake",
    "Coffee and walnut cake",
    "Cupcake",
    "Eccles cake",
    "Fairy cake",
    "Fruit cake",
    "Ginger cake",
    "Lemon drizzle",
    "Madeira cake",
    "Marble cake",
    "Millionaire's shortbread",
    "Red velvet",
    "Rock cake",
    "Scone",
    "Simnel cake",
    "Swiss roll",
    "Victoria sponge",
    "Welsh cake",
  ],
  Fruit: [
    "Apple",
    "Apricot",
    "Banana",
    "Blackberry",
    "Blackcurrant",
    "Blueberry",
    "Cherry",
    "Clementine",
    "Cranberry",
    "Damson",
    "Date",
    "Fig",
    "Gooseberry",
    "Grape",
    "Grapefruit",
    "Kiwi",
    "Lemon",
    "Lime",
    "Lychee",
    "Mango",
    "Melon",
    "Nectarine",
    "Orange",
    "Papaya",
    "Passion fruit",
    "Peach",
    "Pear",
    "Pineapple",
    "Plum",
    "Pomegranate",
    "Raspberry",
    "Redcurrant",
    "Rhubarb",
    "Satsuma",
    "Strawberry",
    "Tangerine",
    "Watermelon",
  ],
  "Chocolate bar": [
    "Aero",
    "Boost",
    "Bounty",
    "Caramac",
    "Crunchie",
    "Curly Wurly",
    "Dairy Milk",
    "Double Decker",
    "Flake",
    "Fudge",
    "Galaxy",
    "Kinder Bueno",
    "Kit Kat",
    "Lion bar",
    "Maltesers",
    "Mars bar",
    "Milkybar",
    "Munchies",
    "Picnic",
    "Ripple",
    "Snickers",
    "Star bar",
    "Toffee Crisp",
    "Topic",
    "Turkish Delight",
    "Twirl",
    "Twix",
    "Wispa",
    "Yorkie",
  ],
  "Ice cream flavour": [
    "Banana",
    "Bubblegum",
    "Butterscotch",
    "Caramel",
    "Chocolate",
    "Chocolate chip",
    "Clotted cream",
    "Coconut",
    "Coffee",
    "Cookie dough",
    "Honeycomb",
    "Lemon sorbet",
    "Mango sorbet",
    "Mint choc chip",
    "Neapolitan",
    "Peanut butter",
    "Pistachio",
    "Praline",
    "Raspberry ripple",
    "Rum and raisin",
    "Salted caramel",
    "Strawberry",
    "Toffee",
    "Tutti frutti",
    "Vanilla",
  ],
  Country: [
    "Australia",
    "Austria",
    "Barbados",
    "Belgium",
    "Brazil",
    "Cambodia",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Czech Republic",
    "Denmark",
    "Egypt",
    "England",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Germany",
    "Ghana",
    "Greece",
    "Iceland",
    "India",
    "Indonesia",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kenya",
    "Madagascar",
    "Maldives",
    "Malta",
    "Mexico",
    "Morocco",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "Norway",
    "Peru",
    "Portugal",
    "Scotland",
    "Senegal",
    "South Africa",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Tanzania",
    "Thailand",
    "Turkey",
    "United States",
    "Vietnam",
    "Wales",
  ],
  City: [
    "Amsterdam",
    "Athens",
    "Bangkok",
    "Barcelona",
    "Bath",
    "Berlin",
    "Bologna",
    "Bruges",
    "Budapest",
    "Cairo",
    "Cape Town",
    "Chicago",
    "Copenhagen",
    "Dublin",
    "Dubrovnik",
    "Edinburgh",
    "Florence",
    "Glasgow",
    "Hanoi",
    "Havana",
    "Hong Kong",
    "Istanbul",
    "Kyoto",
    "Lisbon",
    "Liverpool",
    "London",
    "Los Angeles",
    "Madrid",
    "Manchester",
    "Marrakech",
    "Melbourne",
    "Mexico City",
    "Milan",
    "Mumbai",
    "Munich",
    "Naples",
    "New York",
    "Osaka",
    "Oxford",
    "Paris",
    "Prague",
    "Reykjavik",
    "Rio de Janeiro",
    "Rome",
    "San Francisco",
    "Seville",
    "Singapore",
    "Stockholm",
    "Sydney",
    "Tokyo",
    "Venice",
    "Vienna",
    "York",
    "Zurich",
  ],
  "National park": [
    "Brecon Beacons",
    "Broads",
    "Cairngorms",
    "Dartmoor",
    "Exmoor",
    "Lake District",
    "Loch Lomond and The Trossachs",
    "New Forest",
    "North York Moors",
    "Northumberland",
    "Peak District",
    "Pembrokeshire Coast",
    "Snowdonia",
    "South Downs",
    "Yorkshire Dales",
  ],
  "Landmark or building": [
    "Acropolis",
    "Alhambra",
    "Angkor Wat",
    "Arc de Triomphe",
    "Avebury",
    "Big Ben",
    "Blenheim Palace",
    "Buckingham Palace",
    "Chatsworth",
    "Cliffs of Moher",
    "Colosseum",
    "Durham Cathedral",
    "Eden Project",
    "Edinburgh Castle",
    "Eiffel Tower",
    "Forth Bridge",
    "Giant's Causeway",
    "Glastonbury Tor",
    "Golden Gate Bridge",
    "Great Wall of China",
    "Hadrian's Wall",
    "Iona Abbey",
    "Kew Gardens",
    "Leaning Tower of Pisa",
    "Machu Picchu",
    "Niagara Falls",
    "Parthenon",
    "Petra",
    "Pompeii",
    "Pyramids of Giza",
    "Sagrada Família",
    "St Paul's Cathedral",
    "Statue of Liberty",
    "Stonehenge",
    "Sydney Opera House",
    "Taj Mahal",
    "Tintern Abbey",
    "Tower Bridge",
    "Tower of London",
    "Uluru",
    "Versailles",
    "Westminster Abbey",
    "White Cliffs of Dover",
    "Windsor Castle",
    "York Minster",
  ],

  // Music batch — new topics
  "Band or artist": [
    "ABBA",
    "Adele",
    "Arctic Monkeys",
    "Beatles",
    "Beyoncé",
    "Bob Dylan",
    "Coldplay",
    "David Bowie",
    "Dire Straits",
    "Ed Sheeran",
    "Elton John",
    "Elvis Presley",
    "Fleetwood Mac",
    "Frank Sinatra",
    "Johnny Cash",
    "Kate Bush",
    "Led Zeppelin",
    "Madonna",
    "Michael Jackson",
    "Oasis",
    "Pink Floyd",
    "Queen",
    "Radiohead",
    "Rolling Stones",
    "Taylor Swift",
    "The Kinks",
    "U2",
    "Vera Lynn",
  ],
  Composer: [
    "Bach",
    "Beethoven",
    "Bernstein",
    "Brahms",
    "Britten",
    "Chopin",
    "Debussy",
    "Dvořák",
    "Elgar",
    "Grieg",
    "Handel",
    "Haydn",
    "Holst",
    "Mahler",
    "Mendelssohn",
    "Mozart",
    "Puccini",
    "Rachmaninoff",
    "Ravel",
    "Schubert",
    "Shostakovich",
    "Sibelius",
    "Tchaikovsky",
    "Vaughan Williams",
    "Verdi",
    "Vivaldi",
  ],
  Musical: [
    "Annie",
    "Billy Elliot",
    "Cats",
    "Chicago",
    "Come from Away",
    "Grease",
    "Hamilton",
    "Into the Woods",
    "Jersey Boys",
    "Jesus Christ Superstar",
    "Joseph and the Amazing Technicolor Dreamcoat",
    "Les Misérables",
    "Little Shop of Horrors",
    "Mamma Mia!",
    "Mary Poppins",
    "Miss Saigon",
    "Moulin Rouge!",
    "My Fair Lady",
    "Nine to Five",
    "Oklahoma!",
    "Oliver!",
    "Phantom of the Opera",
    "Rent",
    "Rocky Horror Show",
    "Six",
    "Sweeney Todd",
    "The Book of Mormon",
    "The Sound of Music",
    "West Side Story",
    "Wicked",
  ],
  Carol: [
    "Away in a Manger",
    "Deck the Halls",
    "Ding Dong Merrily on High",
    "God Rest Ye Merry Gentlemen",
    "Good King Wenceslas",
    "Hark! The Herald Angels Sing",
    "Have Yourself a Merry Little Christmas",
    "In the Bleak Midwinter",
    "It Came Upon the Midnight Clear",
    "Joy to the World",
    "O Come All Ye Faithful",
    "O Holy Night",
    "O Little Town of Bethlehem",
    "Once in Royal David's City",
    "Rudolph the Red-Nosed Reindeer",
    "Silent Night",
    "The First Noel",
    "The Twelve Days of Christmas",
    "We Three Kings",
    "We Wish You a Merry Christmas",
    "While Shepherds Watched",
    "Winter Wonderland",
  ],

  // Film & TV batch — new topics
  "Christmas film": [
    "A Christmas Carol",
    "Arthur Christmas",
    "Die Hard",
    "Elf",
    "Four Christmases",
    "Gremlins",
    "Holiday Inn",
    "Home Alone",
    "Home Alone 2",
    "It's a Wonderful Life",
    "Klaus",
    "Miracle on 34th Street",
    "National Lampoon's Christmas Vacation",
    "Nativity!",
    "Paddington 2",
    "Polar Express",
    "Scrooge",
    "Scrooged",
    "The Holiday",
    "The Muppet Christmas Carol",
    "The Nightmare Before Christmas",
    "The Snowman",
    "White Christmas",
    "While You Were Sleeping",
  ],
  Actor: [
    "Anthony Hopkins",
    "Audrey Hepburn",
    "Carey Mulligan",
    "Cate Blanchett",
    "Celia Imrie",
    "Daniel Craig",
    "Daniel Day-Lewis",
    "Denzel Washington",
    "Emma Thompson",
    "Gary Oldman",
    "Helen Mirren",
    "Humphrey Bogart",
    "Ian McKellen",
    "Idris Elba",
    "Judi Dench",
    "Katharine Hepburn",
    "Keira Knightley",
    "Maggie Smith",
    "Mark Rylance",
    "Meryl Streep",
    "Michael Caine",
    "Nicole Kidman",
    "Olivia Colman",
    "Paul Newman",
    "Peter Sellers",
    "Ralph Fiennes",
    "Sean Connery",
    "Tom Hanks",
    "Viola Davis",
    "Yul Brynner",
  ],

  // Literature batch — new topics
  Book: [
    "1984",
    "A Room with a View",
    "Atonement",
    "Birdsong",
    "Brideshead Revisited",
    "Circe",
    "Dracula",
    "Emma",
    "Far from the Madding Crowd",
    "Hamnet",
    "Harry Potter and the Philosopher's Stone",
    "Homage to Catalonia",
    "Jane Eyre",
    "Middlemarch",
    "Never Let Me Go",
    "Normal People",
    "On the Road",
    "Oranges Are Not the Only Fruit",
    "Persuasion",
    "Pride and Prejudice",
    "Rebecca",
    "Small Island",
    "Tess of the d'Urbervilles",
    "The Autograph Man",
    "The God of Small Things",
    "The Kite Runner",
    "The Road",
    "The Secret History",
    "To Kill a Mockingbird",
    "Wuthering Heights",
  ],
  "Children's book": [
    "A Bear Called Paddington",
    "Alice's Adventures in Wonderland",
    "Charlotte's Web",
    "Danny the Champion of the World",
    "Five on a Treasure Island",
    "Goodnight Mister Tom",
    "Harriet the Spy",
    "Harry Potter and the Philosopher's Stone",
    "His Dark Materials",
    "Just William",
    "Katy",
    "Milly-Molly-Mandy",
    "Northern Lights",
    "Pippi Longstocking",
    "Swallows and Amazons",
    "The BFG",
    "The Gruffalo",
    "The Hobbit",
    "The House at Pooh Corner",
    "The Lion, the Witch and the Wardrobe",
    "The Secret Garden",
    "The Tiger Who Came to Tea",
    "The Very Hungry Caterpillar",
    "The Wind in the Willows",
    "Treasure Island",
    "Watership Down",
    "Where the Wild Things Are",
    "Winnie-the-Pooh",
  ],
  Play: [
    "A Midsummer Night's Dream",
    "A Streetcar Named Desire",
    "A View from the Bridge",
    "An Inspector Calls",
    "Arcadia",
    "Blood Brothers",
    "Copenhagen",
    "Death of a Salesman",
    "Hamlet",
    "Jerusalem",
    "King Lear",
    "Macbeth",
    "Much Ado About Nothing",
    "My Children! My Africa!",
    "Othello",
    "Our Town",
    "Private Lives",
    "Romeo and Juliet",
    "Rosencrantz and Guildenstern Are Dead",
    "The Crucible",
    "The Curious Incident of the Dog in the Night-Time",
    "The Glass Menagerie",
    "The History Boys",
    "The Importance of Being Earnest",
    "The Tempest",
    "Three Sisters",
    "Top Girls",
    "Translations",
    "Uncle Vanya",
    "Waiting for Godot",
  ],

  // Final batch — new topics (Comic or annual / Month / Festival or holiday
  // are added with their topic objects in the orphans/comic-fix step)
  "Board game": [
    "Battleship",
    "Boggle",
    "Catan",
    "Chess",
    "Cluedo",
    "Connect Four",
    "Cranium",
    "Draughts",
    "Exploding Kittens",
    "Game of Life",
    "Go",
    "Guess Who?",
    "Jenga",
    "Ker-Plunk",
    "Ludo",
    "Mastermind",
    "Monopoly",
    "Operation",
    "Pictionary",
    "Risk",
    "Scrabble",
    "Sequence",
    "Snakes and Ladders",
    "Taboo",
    "Trivial Pursuit",
    "Uno",
  ],
  "Card game": [
    "Bridge",
    "Canasta",
    "Cheat",
    "Cribbage",
    "Dobble",
    "Gin Rummy",
    "Go Fish",
    "Happy Families",
    "Old Maid",
    "Patience",
    "Pontoon",
    "Racing Demon",
    "Rummy",
    "Snap",
    "Solitaire",
    "Speed",
    "Spades",
    "Whist",
  ],
  Dance: [
    "Ballet",
    "Ballroom",
    "Bhangra",
    "Breakdancing",
    "Cha-cha",
    "Ceilidh",
    "Charleston",
    "Contemporary",
    "Country line dancing",
    "Disco",
    "Flamenco",
    "Foxtrot",
    "Highland fling",
    "Jive",
    "Lindy hop",
    "Maypole",
    "Morris dancing",
    "Paso doble",
    "Polka",
    "Quickstep",
    "Salsa",
    "Samba",
    "Street dance",
    "Swing",
    "Tango",
    "Tap",
    "Viennese waltz",
    "Waltz",
  ],
  "Item of clothing": [
    "Belt",
    "Blazer",
    "Boots",
    "Cardigan",
    "Coat",
    "Denim jacket",
    "Dress",
    "Dungarees",
    "Flat cap",
    "Gilet",
    "Gloves",
    "Hat",
    "Hoodie",
    "Jeans",
    "Jumper",
    "Kilt",
    "Leather jacket",
    "Loafers",
    "Overcoat",
    "Scarf",
    "Shirt",
    "Shoes",
    "Suit",
    "Sunglasses",
    "Tie",
    "Trainers",
    "Trousers",
    "Waistcoat",
    "Wellington boots",
  ],
  "Radio station": [
    "5 Live",
    "6 Music",
    "Absolute Radio",
    "Classic FM",
    "Heart",
    "Jazz FM",
    "Kerrang!",
    "Kiss FM",
    "LBC",
    "Magic FM",
    "Planet Rock",
    "Radio 1",
    "Radio 2",
    "Radio 3",
    "Radio 4",
    "Radio 4 Extra",
    "Radio 5 Live",
    "Scala Radio",
    "Times Radio",
    "talkSPORT",
  ],
  Word: [
    "Abundance",
    "Arcane",
    "Benevolent",
    "Bespoke",
    "Cadence",
    "Crestfallen",
    "Diaphanous",
    "Ebullient",
    "Elegy",
    "Ephemeral",
    "Equanimity",
    "Ethereal",
    "Foible",
    "Glimmer",
    "Grace",
    "Hiraeth",
    "Ineffable",
    "Labyrinthine",
    "Lacuna",
    "Liminal",
    "Luminous",
    "Mellifluous",
    "Nonchalant",
    "Nonetheless",
    "Numinous",
    "Petrichor",
    "Plinth",
    "Quixotic",
    "Resilience",
    "Rigour",
    "Serendipity",
    "Sonder",
    "Solace",
    "Susurrus",
    "Vellichor",
    "Wabi-sabi",
    "Wanderlust",
    "Zephyr",
  ],
  Toy: [
    "Action Man",
    "Barbie",
    "Brio train set",
    "Buzz Lightyear",
    "Chemistry set",
    "Etch A Sketch",
    "Fisher-Price telephone",
    "Frisbee",
    "Furby",
    "Hot Wheels",
    "Hula hoop",
    "K'Nex",
    "Lego",
    "Meccano",
    "My Little Pony",
    "Play-Doh",
    "Playmobil",
    "Rubik's Cube",
    "Scalextric",
    "Sindy",
    "Space Hopper",
    "Spirograph",
    "Stickle Bricks",
    "Stuffed rabbit",
    "Subbuteo",
    "Tamagotchi",
    "Teddy bear",
    "Thomas the Tank Engine",
    "Tiddlywinks",
    "View-Master",
    "Water pistol",
    "Wooden rattle",
    "Yo-yo",
  ],
  Cartoon: [
    "Adventure Time",
    "Bagpuss",
    "Battle of the Planets",
    "Bob the Builder",
    "Danger Mouse",
    "Dogtanian",
    "DuckTales",
    "He-Man",
    "Inspector Gadget",
    "Ivor the Engine",
    "Jungle Book",
    "M.A.S.K.",
    "Mickey Mouse",
    "My Little Pony",
    "Noggin the Nog",
    "Paddington",
    "Pingu",
    "Postman Pat",
    "Roobarb",
    "Scooby-Doo",
    "She-Ra",
    "SuperTed",
    "The Animals of Farthing Wood",
    "The Clangers",
    "The Magic Roundabout",
    "Thunderbirds",
    "Thundercats",
    "Tintin",
    "Tom and Jerry",
    "Transformers",
    "Trumpton",
    "Wacky Races",
    "Wallace and Gromit",
    "Willo the Wisp",
  ],

  // Gaps batch A — Food & Drink
  "Breakfast cereal": [
    "All-Bran",
    "Alpen",
    "Bran Flakes",
    "Cheerios",
    "Coco Pops",
    "Corn Flakes",
    "Crunchy Nut",
    "Frosties",
    "Fruit 'n Fibre",
    "Golden Grahams",
    "Granola",
    "Grape-Nuts",
    "Honey Loops",
    "Muesli",
    "Oatibix",
    "Porridge",
    "Puffed Wheat",
    "Ready Brek",
    "Rice Krispies",
    "Shredded Wheat",
    "Shreddies",
    "Special K",
    "Sugar Puffs",
    "Sultana Bran",
    "Weetabix",
    "Weetos",
  ],
  "Type of tea": [
    "Assam",
    "Breakfast tea",
    "Builder's tea",
    "Camomile",
    "Chai",
    "Darjeeling",
    "Earl Grey",
    "English breakfast",
    "Fruit tea",
    "Ginger tea",
    "Green tea",
    "Herbal tea",
    "Lady Grey",
    "Lapsang souchong",
    "Lemon and ginger",
    "Mint tea",
    "Oolong",
    "Peppermint",
    "Rooibos",
    "White tea",
    "Yorkshire Tea",
  ],
  "Pizza topping": [
    "Anchovies",
    "Artichoke",
    "Bacon",
    "BBQ chicken",
    "Capers",
    "Chilli",
    "Chorizo",
    "Goat's cheese",
    "Ham",
    "Jalapeños",
    "Margherita",
    "Meat feast",
    "Mozzarella",
    "Mushroom",
    "Nduja",
    "Olives",
    "Onion",
    "Pancetta",
    "Parma ham",
    "Pepperoni",
    "Peppers",
    "Pineapple",
    "Rocket",
    "Salami",
    "Spinach",
    "Sweetcorn",
    "Tuna",
  ],
  Pie: [
    "Apple pie",
    "Banana cream pie",
    "Banoffee pie",
    "Beef and ale pie",
    "Cheese and onion pie",
    "Cherry pie",
    "Chicken and mushroom pie",
    "Chicken pie",
    "Cottage pie",
    "Fish pie",
    "Game pie",
    "Key lime pie",
    "Lemon meringue pie",
    "Meat and potato pie",
    "Melton Mowbray pork pie",
    "Mince pie",
    "Pecan pie",
    "Pork pie",
    "Pumpkin pie",
    "Rhubarb pie",
    "Scotch pie",
    "Shepherd's pie",
    "Stargazy pie",
    "Steak and kidney pie",
    "Steak pie",
  ],
  "Sauce or condiment": [
    "Aioli",
    "Apple sauce",
    "Barbecue sauce",
    "Bread sauce",
    "Brown sauce",
    "Chilli sauce",
    "Chutney",
    "Cranberry sauce",
    "Dijon mustard",
    "English mustard",
    "French dressing",
    "Gravy",
    "Hollandaise",
    "Horseradish",
    "Ketchup",
    "Mayonnaise",
    "Mint sauce",
    "Pesto",
    "Piccalilli",
    "Ranch",
    "Salad cream",
    "Soy sauce",
    "Sriracha",
    "Sweet chilli",
    "Tabasco",
    "Tartare sauce",
    "Worcestershire sauce",
  ],
  "Coffee order": [
    "Americano",
    "Cappuccino",
    "Cortado",
    "Decaf",
    "Espresso",
    "Filter coffee",
    "Flat white",
    "Frappé",
    "Iced coffee",
    "Instant coffee",
    "Latte",
    "Macchiato",
    "Mocha",
    "Oat latte",
    "Piccolo",
    "Ristretto",
    "Turkish coffee",
    "White coffee",
  ],
  Spirit: [
    "Absinthe",
    "Amaretto",
    "Bourbon",
    "Brandy",
    "Calvados",
    "Cognac",
    "Dark rum",
    "Gin",
    "Irish whiskey",
    "Mezcal",
    "Port",
    "Rye whiskey",
    "Scotch whisky",
    "Sherry",
    "Sloe gin",
    "Tequila",
    "Vermouth",
    "Vodka",
    "White rum",
  ],
  Wine: [
    "Beaujolais",
    "Bordeaux",
    "Burgundy",
    "Cabernet Sauvignon",
    "Champagne",
    "Chardonnay",
    "Chenin Blanc",
    "Chianti",
    "Malbec",
    "Merlot",
    "Pinot Grigio",
    "Pinot Noir",
    "Port",
    "Prosecco",
    "Rioja",
    "Rosé",
    "Sancerre",
    "Sauvignon Blanc",
    "Shiraz",
    "Tempranillo",
    "Viognier",
    "Zinfandel",
  ],

  // Gaps batch B — Nature
  "Dog breed": [
    "Basset Hound",
    "Beagle",
    "Bichon Frise",
    "Border Collie",
    "Border Terrier",
    "Boxer",
    "British Bulldog",
    "Cavalier King Charles Spaniel",
    "Chihuahua",
    "Cocker Spaniel",
    "Corgi",
    "Dachshund",
    "Dalmatian",
    "Dobermann",
    "English Setter",
    "French Bulldog",
    "German Shepherd",
    "Golden Retriever",
    "Great Dane",
    "Greyhound",
    "Jack Russell",
    "Labrador",
    "Lurcher",
    "Newfoundland",
    "Pointer",
    "Pomeranian",
    "Poodle",
    "Pug",
    "Rottweiler",
    "Saint Bernard",
    "Samoyed",
    "Schnauzer",
    "Shih Tzu",
    "Spaniel",
    "Springer Spaniel",
    "Staffordshire Bull Terrier",
    "Vizsla",
    "Weimaraner",
    "Welsh Terrier",
    "West Highland Terrier",
    "Whippet",
    "Yorkshire Terrier",
  ],
  "Cat breed": [
    "Abyssinian",
    "Bengal",
    "Birman",
    "Bombay",
    "British Shorthair",
    "Burmese",
    "Cornish Rex",
    "Devon Rex",
    "Egyptian Mau",
    "Exotic Shorthair",
    "Himalayan",
    "Maine Coon",
    "Manx",
    "Norwegian Forest Cat",
    "Persian",
    "Ragdoll",
    "Russian Blue",
    "Scottish Fold",
    "Siamese",
    "Siberian",
    "Somali",
    "Sphynx",
    "Tabby",
    "Tonkinese",
    "Tortoiseshell",
    "Turkish Angora",
  ],
  Butterfly: [
    "Brimstone",
    "Chalkhill Blue",
    "Comma",
    "Common Blue",
    "Dingy Skipper",
    "Gatekeeper",
    "Holly Blue",
    "Large White",
    "Marbled White",
    "Meadow Brown",
    "Orange-tip",
    "Painted Lady",
    "Peacock",
    "Purple Emperor",
    "Red Admiral",
    "Ringlet",
    "Silver-washed Fritillary",
    "Small Copper",
    "Small Tortoiseshell",
    "Speckled Wood",
    "Swallowtail",
    "Wall Brown",
    "White Admiral",
  ],
  Dinosaur: [
    "Allosaurus",
    "Ankylosaurus",
    "Apatosaurus",
    "Archaeopteryx",
    "Brachiosaurus",
    "Brontosaurus",
    "Compsognathus",
    "Deinonychus",
    "Dilophosaurus",
    "Diplodocus",
    "Gallimimus",
    "Iguanodon",
    "Megalosaurus",
    "Parasaurolophus",
    "Pteranodon",
    "Pterodactyl",
    "Spinosaurus",
    "Stegosaurus",
    "Triceratops",
    "Tyrannosaurus rex",
    "Velociraptor",
  ],
  "Mythical creature": [
    "Banshee",
    "Basilisk",
    "Centaur",
    "Cerberus",
    "Chimera",
    "Cyclops",
    "Dragon",
    "Dwarf",
    "Elf",
    "Fairy",
    "Faun",
    "Genie",
    "Giant",
    "Goblin",
    "Gorgon",
    "Griffin",
    "Hydra",
    "Kraken",
    "Leprechaun",
    "Loch Ness Monster",
    "Mermaid",
    "Minotaur",
    "Ogre",
    "Pegasus",
    "Phoenix",
    "Pixie",
    "Selkie",
    "Sphinx",
    "Troll",
    "Unicorn",
    "Werewolf",
    "Yeti",
  ],
  "Mountain or peak": [
    "Aconcagua",
    "Ben Macdui",
    "Ben Nevis",
    "Cadair Idris",
    "Catbells",
    "Denali",
    "Eiger",
    "Etna",
    "Everest",
    "Helvellyn",
    "Ingleborough",
    "K2",
    "Kilimanjaro",
    "Matterhorn",
    "Mont Blanc",
    "Mount Fuji",
    "Pen y Fan",
    "Pendle Hill",
    "Scafell Pike",
    "Schiehallion",
    "Slieve Donard",
    "Snowdon",
    "Suilven",
    "Table Mountain",
    "Tryfan",
    "Vesuvius",
  ],
  River: [
    "Amazon",
    "Avon",
    "Cam",
    "Clyde",
    "Danube",
    "Dee",
    "Exe",
    "Ganges",
    "Loire",
    "Mekong",
    "Mersey",
    "Mississippi",
    "Nile",
    "Ouse",
    "Rhine",
    "Seine",
    "Severn",
    "Spey",
    "Tay",
    "Thames",
    "Trent",
    "Tweed",
    "Tyne",
    "Volga",
    "Wye",
    "Yangtze",
    "Zambezi",
  ],
  Castle: [
    "Alnwick",
    "Arundel",
    "Bamburgh",
    "Bodiam",
    "Caernarfon",
    "Cardiff",
    "Carlisle",
    "Conwy",
    "Corfe",
    "Dover",
    "Dunnottar",
    "Durham",
    "Edinburgh",
    "Eilean Donan",
    "Harlech",
    "Hever",
    "Kenilworth",
    "Leeds Castle",
    "Lincoln",
    "Ludlow",
    "Pembroke",
    "Raglan",
    "Stirling",
    "Tintagel",
    "Tower of London",
    "Urquhart",
    "Warwick",
    "Windsor",
  ],
  "Garden to visit": [
    "Alnwick Garden",
    "Blenheim Palace",
    "Bodnant Garden",
    "Chatsworth",
    "Crathes Castle",
    "Eden Project",
    "Great Dixter",
    "Hatfield House",
    "Hidcote",
    "Levens Hall",
    "Lost Gardens of Heligan",
    "Mount Stewart",
    "Nymans",
    "Powis Castle",
    "RHS Harlow Carr",
    "RHS Hyde Hall",
    "RHS Rosemoor",
    "RHS Wisley",
    "Sissinghurst",
    "Stourhead",
    "Trentham Gardens",
  ],
  Beach: [
    "Bamburgh",
    "Bondi",
    "Bournemouth",
    "Brighton",
    "Camber Sands",
    "Copacabana",
    "Cromer",
    "Filey",
    "Formby",
    "Holkham",
    "Luskentyre",
    "Lyme Regis",
    "Newquay",
    "Porthcurno",
    "Rhossili",
    "Saunton Sands",
    "Scarborough",
    "St Ives",
    "Tenby",
    "Three Cliffs Bay",
    "Watergate Bay",
    "West Wittering",
    "Weston-super-Mare",
    "Whitby",
    "Whitehaven Beach",
    "Woolacombe",
  ],
  "TV programme": [
    "Blackadder",
    "Brideshead Revisited",
    "Casualty",
    "Cheers",
    "Coronation Street",
    "Countryfile",
    "Dad's Army",
    "Doctor Who",
    "Downton Abbey",
    "EastEnders",
    "Fawlty Towers",
    "Friends",
    "Gavin & Stacey",
    "Gogglebox",
    "Grange Hill",
    "Inspector Morse",
    "Last of the Summer Wine",
    "Line of Duty",
    "Only Fools and Horses",
    "Peaky Blinders",
    "Porridge",
    "Question Time",
    "Sherlock",
    "Strictly Come Dancing",
    "The Crown",
    "The Great British Bake Off",
    "The Office",
    "The Repair Shop",
    "The Thick of It",
    "The Vicar of Dibley",
    "Top Gear",
    "University Challenge",
    "Yes Minister",
  ],
  "Video game": [
    "Angry Birds",
    "Animal Crossing",
    "Call of Duty",
    "Candy Crush",
    "Civilization",
    "Donkey Kong",
    "Doom",
    "FIFA",
    "Final Fantasy",
    "Football Manager",
    "Fortnite",
    "GoldenEye 007",
    "Grand Theft Auto",
    "Guitar Hero",
    "Halo",
    "Mario Kart",
    "Minecraft",
    "Mortal Kombat",
    "Pac-Man",
    "Pokémon",
    "Pong",
    "Red Dead Redemption",
    "SimCity",
    "Sonic the Hedgehog",
    "Space Invaders",
    "Street Fighter",
    "Super Mario Bros",
    "Tetris",
    "The Last of Us",
    "The Legend of Zelda",
    "The Sims",
    "Tomb Raider",
    "Wii Sports",
    "World of Warcraft",
  ],
  Car: [
    "Alfa Romeo Spider",
    "Aston Martin DB5",
    "Audi Quattro",
    "Austin Mini",
    "Bentley",
    "BMW M3",
    "Citroën 2CV",
    "DeLorean",
    "Ferrari Testarossa",
    "Fiat 500",
    "Ford Cortina",
    "Ford Escort",
    "Ford Mustang",
    "Jaguar E-Type",
    "Lamborghini Countach",
    "Land Rover Defender",
    "Lotus Esprit",
    "McLaren F1",
    "Mercedes-Benz SL",
    "MG MGB",
    "Mini Cooper",
    "Morris Minor",
    "Porsche 911",
    "Range Rover",
    "Reliant Robin",
    "Rolls-Royce",
    "Tesla Model S",
    "Triumph Spitfire",
    "Vauxhall Astra",
    "Volkswagen Beetle",
    "Volkswagen Camper van",
    "Volkswagen Golf",
    "Volvo Estate",
  ],
  Comedian: [
    "Bill Bailey",
    "Billy Connolly",
    "Dara Ó Briain",
    "Dave Allen",
    "Dawn French",
    "Eddie Izzard",
    "Frank Skinner",
    "French and Saunders",
    "Jack Dee",
    "Jasper Carrott",
    "Jennifer Saunders",
    "Jo Brand",
    "Joan Rivers",
    "Ken Dodd",
    "Lee Mack",
    "Les Dawson",
    "Michael McIntyre",
    "Morecambe and Wise",
    "Peter Kay",
    "Rob Brydon",
    "Robin Williams",
    "Ronnie Barker",
    "Ronnie Corbett",
    "Rowan Atkinson",
    "Sarah Millican",
    "Spike Milligan",
    "Steve Coogan",
    "Stewart Lee",
    "Tim Vine",
    "Tommy Cooper",
    "Victoria Wood",
  ],
  "TV theme tune": [
    "Antiques Roadshow",
    "Blackadder",
    "Cheers",
    "Coronation Street",
    "Dad's Army",
    "Doctor Who",
    "EastEnders",
    "Fawlty Towers",
    "Friends",
    "Game of Thrones",
    "Grandstand",
    "Hawaii Five-O",
    "Inspector Morse",
    "Knight Rider",
    "Last of the Summer Wine",
    "Match of the Day",
    "Mission: Impossible",
    "Only Fools and Horses",
    "Ski Sunday",
    "Star Trek",
    "Tales of the Unexpected",
    "Test Match Special",
    "The A-Team",
    "The Archers",
    "The Simpsons",
    "The Twilight Zone",
    "The X-Files",
    "Thunderbirds",
  ],
  "Painter or artist": [
    "Botticelli",
    "Caravaggio",
    "Cézanne",
    "Constable",
    "da Vinci",
    "Dalí",
    "Degas",
    "Frida Kahlo",
    "Gauguin",
    "Hockney",
    "Hopper",
    "Klimt",
    "Lowry",
    "Magritte",
    "Matisse",
    "Michelangelo",
    "Monet",
    "Munch",
    "O'Keeffe",
    "Picasso",
    "Pollock",
    "Raphael",
    "Rembrandt",
    "Renoir",
    "Rothko",
    "Rubens",
    "Titian",
    "Turner",
    "van Gogh",
    "Vermeer",
    "Warhol",
    "Whistler",
  ],
  "Famous painting": [
    "A Sunday on La Grande Jatte",
    "American Gothic",
    "Bathers at Asnières",
    "Christina's World",
    "Girl with a Pearl Earring",
    "Guernica",
    "Las Meninas",
    "Nighthawks",
    "Ophelia",
    "Sunflowers",
    "The Arnolfini Portrait",
    "The Birth of Venus",
    "The Fighting Temeraire",
    "The Garden of Earthly Delights",
    "The Great Wave off Kanagawa",
    "The Hay Wain",
    "The Kiss",
    "The Lady of Shalott",
    "The Last Supper",
    "The Mona Lisa",
    "The Night Watch",
    "The Persistence of Memory",
    "The Scream",
    "The Starry Night",
    "Wanderer above the Sea of Fog",
    "Water Lilies",
    "Whistler's Mother",
  ],
  "Fairy tale": [
    "Aladdin",
    "Beauty and the Beast",
    "Cinderella",
    "Goldilocks and the Three Bears",
    "Hansel and Gretel",
    "Jack and the Beanstalk",
    "Little Red Riding Hood",
    "Pinocchio",
    "Puss in Boots",
    "Rapunzel",
    "Rumpelstiltskin",
    "Sleeping Beauty",
    "Snow White",
    "The Elves and the Shoemaker",
    "The Emperor's New Clothes",
    "The Frog Prince",
    "The Gingerbread Man",
    "The Little Mermaid",
    "The Princess and the Pea",
    "The Three Billy Goats Gruff",
    "The Three Little Pigs",
    "The Tortoise and the Hare",
    "The Ugly Duckling",
    "Thumbelina",
  ],
  "Christmas tradition": [
    "Advent calendar",
    "Boxing Day walk",
    "Carol singing",
    "Charades",
    "Christmas crackers",
    "Christmas Eve box",
    "Christmas jumper",
    "Decorating the tree",
    "Hanging the stockings",
    "Leaving out a mince pie for Santa",
    "Midnight Mass",
    "Mulled wine",
    "Pantomime",
    "Pigs in blankets",
    "Pulling the wishbone",
    "Putting the star on top",
    "Reading The Night Before Christmas",
    "Secret Santa",
    "The Christmas roast",
    "The King's Speech",
    "The Radio Times ritual",
    "Watching It's a Wonderful Life",
    "Wrapping presents on Christmas Eve",
  ],
  "Regional or dialect word": [
    "Bairn",
    "Barm",
    "Bobbins",
    "Bonny",
    "Brew",
    "Buzzing",
    "Canny",
    "Chuffed",
    "Clarts",
    "Cob",
    "Cwtch",
    "Gander",
    "Ginnel",
    "Gradely",
    "Lush",
    "Mardy",
    "Mither",
    "Nesh",
    "Nowt",
    "Oggin",
    "Owt",
    "Plodge",
    "Scran",
    "Snicket",
    "Stotting",
    "Ta-ra",
    "Tatie",
    "Twitten",
    "Wazzock",
    "Wick",
  ],
  "Comic or annual": [
    "2000 AD",
    "Asterix",
    "Beano",
    "Bunty",
    "Commando",
    "Dandy",
    "Disney comics",
    "Doctor Who Magazine",
    "Eagle",
    "Girl",
    "Hornet",
    "Judy",
    "Look-In",
    "Mandy",
    "Match",
    "Misty",
    "Nutty",
    "Ranger",
    "Roy of the Rovers",
    "Shoot!",
    "Smash!",
    "Sparky",
    "Tiger",
    "Topper",
    "Valiant",
    "Viz",
    "Whizzer and Chips",
  ],
  Month: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  "Festival or holiday": [
    "Bonfire Night",
    "Boxing Day",
    "Burns Night",
    "Christmas",
    "Diwali",
    "Easter",
    "Eid al-Fitr",
    "Halloween",
    "Hanukkah",
    "Harvest festival",
    "Hogmanay",
    "Holi",
    "May Day",
    "Midsummer",
    "New Year",
    "Passover",
    "Shrove Tuesday",
    "St Andrew's Day",
    "St David's Day",
    "St George's Day",
    "St Patrick's Day",
    "Vaisakhi",
    "Valentine's Day",
  ],
  Island: [
    "Arran",
    "Azores",
    "Bali",
    "Barbados",
    "Barra",
    "Canary Islands",
    "Cape Verde",
    "Capri",
    "Corfu",
    "Crete",
    "Cuba",
    "Cyprus",
    "Eigg",
    "Faroe Islands",
    "Fiji",
    "Harris",
    "Ibiza",
    "Iceland",
    "Iona",
    "Ischia",
    "Islay",
    "Isle of Man",
    "Isle of Wight",
    "Jamaica",
    "Jura",
    "Lewis",
    "Lindisfarne",
    "Lundy",
    "Madeira",
    "Majorca",
    "Maldives",
    "Malta",
    "Mauritius",
    "Menorca",
    "Mull",
    "Mykonos",
    "Orkney",
    "Rhodes",
    "Santorini",
    "Sardinia",
    "Seychelles",
    "Shetland",
    "Sicily",
    "Skye",
    "Sri Lanka",
    "St Lucia",
    "Staffa",
    "Zanzibar",
  ],
  County: [
    "Aberdeenshire",
    "Anglesey",
    "Antrim",
    "Argyll and Bute",
    "Armagh",
    "Ayrshire",
    "Bedfordshire",
    "Berkshire",
    "Bristol",
    "Buckinghamshire",
    "Cambridgeshire",
    "Carmarthenshire",
    "Ceredigion",
    "Cheshire",
    "City of Edinburgh",
    "City of Glasgow",
    "Conwy",
    "Cornwall",
    "County Durham",
    "Cumbria",
    "Denbighshire",
    "Derbyshire",
    "Devon",
    "Dorset",
    "Down",
    "Dumfries and Galloway",
    "East Riding of Yorkshire",
    "East Sussex",
    "Essex",
    "Fermanagh",
    "Fife",
    "Flintshire",
    "Gloucestershire",
    "Greater London",
    "Greater Manchester",
    "Gwynedd",
    "Hampshire",
    "Herefordshire",
    "Hertfordshire",
    "Highlands",
    "Isle of Wight",
    "Kent",
    "Lancashire",
    "Leicestershire",
    "Lincolnshire",
    "Londonderry",
    "Merseyside",
    "Monmouthshire",
    "Norfolk",
    "North Yorkshire",
    "Northamptonshire",
    "Northumberland",
    "Nottinghamshire",
    "Orkney",
    "Oxfordshire",
    "Pembrokeshire",
    "Perth and Kinross",
    "Powys",
    "Rutland",
    "Scottish Borders",
    "Shetland",
    "Shropshire",
    "Somerset",
    "South Yorkshire",
    "Staffordshire",
    "Stirling",
    "Suffolk",
    "Surrey",
    "Swansea",
    "Tyne and Wear",
    "Tyrone",
    "Vale of Glamorgan",
    "Warwickshire",
    "West Midlands",
    "West Sussex",
    "West Yorkshire",
    "Wiltshire",
    "Worcestershire",
    "Wrexham",
  ],
  Crisps: [
    "Cheese and onion",
    "Chipsticks",
    "Doritos",
    "Frazzles",
    "Hula Hoops",
    "Kettle Chips",
    "Mini Cheddars",
    "Monster Munch",
    "Pickled onion",
    "Prawn cocktail",
    "Pringles",
    "Quavers",
    "Ready salted",
    "Roast beef",
    "Salt and vinegar",
    "Scampi Fries",
    "Sea salt",
    "Skips",
    "Smoky bacon",
    "Sour cream and chive",
    "Squares",
    "Twiglets",
    "Worcester sauce",
    "Wotsits",
  ],
};

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

// charity name → topic titles (title-matched, fail-loud)
const CHARITY_TOPIC_SEED: Record<string, string[]> = {
  "Dogs Trust": ["Animal"],
  RSPCA: ["Animal", "Bird"],
  WWF: ["Animal", "Bird", "Landscape"],
  "National Trust": ["Landscape", "Tree", "Way to spend Sunday"],
  RNLI: ["Way to travel"],
  "Marie Curie": ["Season", "Colour"],
  Mind: ["Hobby"],
  "British Heart Foundation": ["Form of exercise"],
};

async function seedCharityTopics() {
  console.log("Seeding charity topics…");

  const { data: charityRows } = await supabase
    .from("charities")
    .select("id, name");
  const { data: topicRows } = await supabase.from("topics").select("id, title");

  const charityByName = new Map(
    (charityRows ?? []).map((r: { id: string; name: string }) => [
      r.name,
      r.id,
    ]),
  );
  const topicByTitle = new Map(
    (topicRows ?? []).map((r: { id: string; title: string }) => [
      r.title,
      r.id,
    ]),
  );

  let inserted = 0;
  let skipped = 0;

  for (const [charityName, topicTitles] of Object.entries(CHARITY_TOPIC_SEED)) {
    const charityId = charityByName.get(charityName);
    if (!charityId)
      throw new Error(`seedCharityTopics: charity "${charityName}" not found`);

    for (const topicTitle of topicTitles) {
      const topicId = topicByTitle.get(topicTitle);
      if (!topicId)
        throw new Error(
          `seedCharityTopics: topic "${topicTitle}" not found (charity "${charityName}")`,
        );

      const { data: existing } = await supabase
        .from("charity_topics")
        .select("charity_id")
        .eq("charity_id", charityId)
        .eq("topic_id", topicId)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from("charity_topics")
        .insert({ charity_id: charityId, topic_id: topicId });
      if (error)
        console.error(`  ✗ ${charityName} → ${topicTitle}:`, error.message);
      else inserted++;
    }
  }

  console.log(`  ${inserted} inserted, ${skipped} already existed`);
}

async function seedCharities() {
  console.log("Seeding charities…");
  let inserted = 0;
  for (const charity of charities) {
    const { data: existing } = await supabase
      .from("charities")
      .select("id")
      .eq("name", charity.name)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from("charities").insert(charity);
    if (error) console.error(`  ✗ ${charity.name}:`, error.message);
    else inserted++;
  }
  console.log(
    `  ${inserted} inserted, ${charities.length - inserted} already existed`,
  );
}

async function seedCategories() {
  console.log("Seeding categories…");
  let inserted = 0;
  for (const cat of categories) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("label", cat.label)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from("categories").insert(cat);
    if (error) console.error(`  ✗ ${cat.label}:`, error.message);
    else inserted++;
  }
  console.log(
    `  ${inserted} inserted, ${categories.length - inserted} already existed`,
  );
}

async function seedTopics() {
  console.log("Seeding topics…");
  let inserted = 0;
  let updated = 0;
  for (const topic of topics) {
    const placeholders = combinedPlaceholders[topic.title];

    const { data: existing } = await supabase
      .from("topics")
      .select("id, is_finite")
      .eq("title", topic.title)
      .maybeSingle();

    if (existing) {
      const patch: Record<string, unknown> = { placeholders };
      if (existing.is_finite !== topic.is_finite)
        patch.is_finite = topic.is_finite;
      await supabase.from("topics").update(patch).eq("id", existing.id);
      updated++;
      continue;
    }

    const { error } = await supabase.from("topics").insert({
      title: topic.title,
      description: topic.description,
      is_finite: topic.is_finite,
      is_active: true,
      placeholders,
    });
    if (error) console.error(`  ✗ ${topic.title}:`, error.message);
    else inserted++;
  }
  console.log(`  ${inserted} inserted, ${updated} updated`);
}

async function seedTopicItems() {
  console.log("Seeding topic items…");
  let inserted = 0;

  const { data: allTopics } = await supabase.from("topics").select("id, title");
  const topicByTitle = Object.fromEntries(
    (allTopics ?? []).map((t) => [t.title, t.id]),
  );

  for (const [title, items] of Object.entries(topicItems)) {
    const topicId = topicByTitle[title];
    if (!topicId) {
      console.error(`  ✗ Topic not found: ${title}`);
      continue;
    }

    const { data: existing } = await supabase
      .from("favourites")
      .select("label")
      .eq("topic_id", topicId);
    const existingLabels = new Set(
      (existing ?? []).map((i: { label: string }) => i.label.toLowerCase()),
    );

    const orderMap = topicItemDisplayOrder[title];
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
      }));

    if (toInsert.length === 0) continue;

    const { error } = await supabase.from("favourites").insert(toInsert);
    if (error) console.error(`  ✗ Items for "${title}":`, error.message);
    else inserted += toInsert.length;
  }

  console.log(`  ${inserted} items inserted`);
}

async function seedTopicCategories() {
  console.log("Seeding topic–category links…");
  let inserted = 0;

  const { data: allTopics } = await supabase.from("topics").select("id, title");
  const topicByTitle = Object.fromEntries(
    (allTopics ?? []).map((t) => [t.title, t.id]),
  );

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, label");
  const categoryByLabel = Object.fromEntries(
    (allCategories ?? []).map((c: { id: string; label: string }) => [
      c.label,
      c.id,
    ]),
  );

  for (const topic of topics) {
    const topicId = topicByTitle[topic.title];
    if (!topicId) continue;

    for (const catLabel of topic.categories) {
      const categoryId = categoryByLabel[catLabel];
      if (!categoryId) {
        console.error(`  ✗ Category not found: ${catLabel}`);
        continue;
      }

      const { data: existing } = await supabase
        .from("topic_categories")
        .select("topic_id")
        .eq("topic_id", topicId)
        .eq("category_id", categoryId)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase
        .from("topic_categories")
        .insert({ topic_id: topicId, category_id: categoryId });
      if (error)
        console.error(`  ✗ Link ${topic.title} → ${catLabel}:`, error.message);
      else inserted++;
    }
  }

  console.log(`  ${inserted} links inserted`);
}

// ---------------------------------------------------------------------------
// Placeholder application and validation
// ---------------------------------------------------------------------------

/**
 * Applies register-keyed placeholder sets to every topic row that has an
 * entry in combinedPlaceholders, regardless of which seed path created the
 * row.  Throws (with the full list) if any map title has no topic row —
 * those topics must be created first (by this seed or another).
 */
async function applyAllPlaceholders() {
  console.log("Applying placeholders to all topics…");

  const { data: rows } = await supabase.from("topics").select("id, title");
  const idByTitle = new Map(
    (rows ?? []).map((r: { id: string; title: string }) => [r.title, r.id]),
  );

  const missing: string[] = [];
  let patched = 0;

  for (const [title, placeholders] of Object.entries(combinedPlaceholders)) {
    const id = idByTitle.get(title);
    if (!id) {
      missing.push(title);
      continue;
    }
    const { error } = await supabase
      .from("topics")
      .update({ placeholders })
      .eq("id", id);
    if (error) console.error(`  ✗ placeholders for "${title}":`, error.message);
    else patched++;
  }

  if (missing.length > 0) {
    throw new Error(
      `Placeholder map has ${missing.length} title(s) with no topic row ` +
        `(these topics must be created before this seed runs):\n` +
        missing.map((t) => `  "${t}"`).join("\n"),
    );
  }

  console.log(`  ${patched} topics had placeholders applied`);
}

const ALL_REGISTER_KEYS: RegisterKey[] = [
  "remembering",
  "celebrating_one",
  "celebrating_many",
  "cause",
  "neutral",
];

/**
 * Asserts that every active topic whose title appears in combinedPlaceholders
 * has a complete, non-empty placeholder set (all 5 register keys present, each
 * with non-empty about and reveal strings).  Throws listing every offender.
 * This is the bidirectional fail-loud guard: applyAllPlaceholders() ensures
 * the writes succeeded; this confirms what's in the DB is correct.
 */
async function assertAllTopicsHavePlaceholders() {
  console.log("Asserting placeholder completeness…");

  const { data: rows } = await supabase
    .from("topics")
    .select("title, placeholders")
    .eq("is_active", true);

  const covered = new Set(Object.keys(combinedPlaceholders));
  const bad: string[] = [];

  for (const row of rows ?? []) {
    if (!covered.has(row.title)) continue; // topic not in the map — skip
    const ph = row.placeholders as Record<
      string,
      { pronouns?: string; about?: string; reveal?: string }
    > | null;
    if (!ph) {
      bad.push(`"${row.title}": no placeholders`);
      continue;
    }
    const missingKeys = ALL_REGISTER_KEYS.filter(
      (k) => !ph[k]?.about || !ph[k]?.reveal,
    );
    if (missingKeys.length > 0) {
      bad.push(
        `"${row.title}": missing/empty keys — ${missingKeys.join(", ")}`,
      );
    }
    const cm = ph["celebrating_many"] as { group?: string } | undefined;
    if (cm && !cm.group) {
      bad.push(`"${row.title}": celebrating_many missing group field`);
    }
  }

  if (bad.length > 0) {
    throw new Error(
      `${bad.length} active topic(s) have incomplete placeholder sets:\n` +
        bad.map((b) => `  ${b}`).join("\n"),
    );
  }

  console.log(
    "  ✓ All active topics in the map have complete 5-register placeholder sets",
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Starting seed…\n");
  await seedCharities();
  await seedCategories();
  await seedTopics();
  await applyAllPlaceholders();
  await assertAllTopicsHavePlaceholders();
  await seedTopicItems();
  await seedTopicCategories();
  await seedCharityTopics();
  console.log("\nSeed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
