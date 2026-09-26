/**
 * scripts/seed-stories.ts
 * ---------------------------------------------------------------------------
 * Seeds favpolls that are MOTIVATED BY CONSTRUCTION — step 5 of the
 * concept-clarity sequence (references/favpoll-pairing-table-2026-09-23.md
 * §4 and §6). Every favpoll starts as a triple (occasion · charity · topic)
 * picked FROM the table, so its edges are known before a word of copy
 * exists; the Story engine (apps/web/lib/story-engine.ts — the same
 * generator behind the wizard's Generate) writes the edges in; a judge
 * loop retries until the copy passes one judgement: would a relative
 * have written this about a real person? (P1, a real item named, is a
 * lookup.)
 *
 *   Seed bar    person favpolls need 2+ edges; cause favpolls need the
 *               charity edge AND a stated event. Ones and zeros are never
 *               seeded.
 *   Triads      --threes is the chance a charity's pick is a triad when it
 *               has one; charities are drawn in turn, so none repeats until
 *               every eligible charity has a favpoll.
 *   Fiction     every row carries is_exemplar = true — the flag that keeps
 *               fiction OUT of charity totals and the record (§7).
 *
 * Run from apps/web (the engine needs the Anthropic SDK and key, the
 * Supabase env, and the pairing table resolves relatively):
 *
 *   cd apps/web
 *   pnpm tsx --env-file=.env.local ../../scripts/seed-stories.ts --dry-run
 *   pnpm tsx --env-file=.env.local ../../scripts/seed-stories.ts --count=24
 *   pnpm tsx --env-file=.env.local ../../scripts/seed-stories.ts --wipe
 *
 * Flags: --count=N (default 24) · --threes=0.4 (share of triads) ·
 *        --seed=N (deterministic pick) · --model=… (Story model; default
 *        claude-sonnet-5, what prod runs — quality is the point) ·
 *        --judge-model=… (default claude-haiku-4-5) · --dry-run (pick and
 *        print the triples, no model, no writes) · --registers=cause,… (only
 *        these registers) · --occasions=Retirement,… (only these occasion
 *        types) · --refresh (patch the existing cohort: full
 *        canonical items, portraits; copy untouched) · --regen="Name" (rewrite
 *        one seeded favpoll's Story in place) · --rename (fresh unrepeated
 *        names for the cohort, copy kept) · --wipe
 *
 * SAFETY: refuses to run unless the target is staging, or
 * ALLOW_FAVPOLL_SEED=1. Owned by created_by = 'user_seed_story' (no email,
 * so the close cron can never mail). Additive: each run adds a cohort;
 * --wipe removes everything this script ever wrote.
 * ---------------------------------------------------------------------------
 */

import { createHash, randomUUID } from "node:crypto";
import { deflateSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { CauseFamily, Pronoun } from "@favpoll/types";
import {
  aboutNamesEvent,
  BABY_OCCASIONS,
  EFFORT_OCCASIONS,
  generateStory,
  judgeStory,
  storyEdges,
  type StoryInput,
} from "../apps/web/lib/story-engine";
import {
  revealNamesRealItem,
  slipsToSingular,
} from "../apps/web/lib/actions/generate-draft-utils";
import { OCCASION_TYPES_BY_REGISTER } from "../apps/web/lib/registers";
import { OCCASIONS, type OccasionContext } from "../apps/web/lib/occasions";

type Register =
  | "remembering"
  | "celebrating_one"
  | "celebrating_many"
  | "cause";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const SEED_USER = "user_seed_story";

// ── safety ───────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STAGING_REF = "eotqyintgusvzidymumb";
if (
  !SUPABASE_URL.includes(STAGING_REF) &&
  process.env.ALLOW_FAVPOLL_SEED !== "1"
) {
  console.error(
    `\n🚫  Refusing to seed stories.\n    URL: ${SUPABASE_URL}\n    Expected staging ref: ${STAGING_REF}\n    Set ALLOW_FAVPOLL_SEED=1 to override.\n`,
  );
  process.exit(1);
}

// ── args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string, dflt: string) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : dflt;
};
const WIPE = flag("wipe");
// --refresh patches the EXISTING cohort in place (full canonical item set,
// a portrait where photo_url is null) without touching its copy.
const REFRESH = flag("refresh");
// --regen="Carys Bright" rewrites ONE seeded favpoll's Story in place: same
// triple, same name, same items, fresh copy through the judge loop.
const REGEN = opt("regen", "");
// --rename gives every seeded protagonist a fresh, unrepeated name and
// swaps it into the copy; nothing is regenerated.
const RENAME = flag("rename");
// --topic="Dog breed" with --regen moves the poll to that topic first.
const REGEN_TOPIC = opt("topic", "");
// --pick="Painting" with --regen names the favourite the Story is written
// around (else a random item).
const REGEN_PICK = opt("pick", "");
const DRY_RUN = flag("dry-run");
const COUNT = parseInt(opt("count", "24"), 10);
const THREES = parseFloat(opt("threes", "0.4"));
// A regen is a fresh draw each time (two regens in a row named both
// couples "David & Farid" from the same seed, 2026-09-24).
const RNG_SEED = parseInt(
  opt("seed", opt("regen", "") ? String(Date.now() % 100000) : "1"),
  10,
);
const STORY_MODEL = opt("model", "claude-sonnet-5");
// The realism judge runs on the Story model: a smaller judge passed
// anything concrete (founder, 2026-09-24).
const JUDGE_MODEL = opt("judge-model", STORY_MODEL);
// --registers=cause,remembering narrows the pick (re-running one register
// after a judge fix without duplicating the rest of a cohort).
const REGISTERS = opt("registers", "")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean) as Register[];
// --occasions="Retirement,Pet memorial" narrows the pick to those occasion
// types (a gap-targeted cohort for the exemplar bank, 2026-09-25).
const OCCASIONS_ONLY = opt("occasions", "")
  .split(",")
  .map((o) => o.trim().toLowerCase())
  .filter(Boolean);
const MAX_ATTEMPTS = 3;

// ── deterministic rng ────────────────────────────────────────────────────
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(RNG_SEED);
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)];
const chance = (p: number) => rnd() < p;
const between = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
const shuffle = <T>(xs: T[]): T[] => {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// ── the wrapper's pools: names by pronoun, surnames, groups ──────────────
const HE = [
  "David",
  "James",
  "Tom",
  "George",
  "Harry",
  "Arthur",
  "Oliver",
  "Jack",
  "Stanley",
  "Fred",
  "Ben",
  "Marcus",
  "Roy",
  "Derek",
  "Idris",
  "Ravi",
  "Kwame",
  "Patrick",
  "Leon",
  "Sam",
  "Alan",
  "Andrew",
  "Barry",
  "Callum",
  "Clive",
  "Colin",
  "Dan",
  "Dev",
  "Dominic",
  "Eamon",
  "Ewan",
  "Farid",
  "Gareth",
  "Gordon",
  "Graham",
  "Hamish",
  "Hugo",
  "Ian",
  "Jamal",
  "Jonah",
  "Kenneth",
  "Kieran",
  "Lewis",
  "Malcolm",
  "Matthew",
  "Nathan",
  "Neil",
  "Omar",
  "Owen",
  "Paul",
  "Philip",
  "Rhys",
  "Robert",
  "Rory",
  "Seb",
  "Simon",
  "Tariq",
  "Terry",
  "Vikram",
  "Will",
];
const SHE = [
  "Margaret",
  "Sarah",
  "Emma",
  "Belinda",
  "Alice",
  "Grace",
  "Florence",
  "Ivy",
  "Elsie",
  "Edith",
  "Nora",
  "Joan",
  "Priya",
  "Aisha",
  "Yvette",
  "Hannah",
  "Ruth",
  "Carys",
  "Mei",
  "Zara",
  "Amara",
  "Anna",
  "Bea",
  "Bethan",
  "Carol",
  "Claire",
  "Deborah",
  "Diane",
  "Eleanor",
  "Fatima",
  "Fiona",
  "Gemma",
  "Gillian",
  "Harriet",
  "Helen",
  "Iris",
  "Jasmine",
  "Jenny",
  "Judith",
  "Kate",
  "Lauren",
  "Leila",
  "Lorna",
  "Lucy",
  "Maeve",
  "Marion",
  "Naomi",
  "Nicola",
  "Pam",
  "Rachel",
  "Rosa",
  "Sally",
  "Shona",
  "Sophie",
  "Susan",
  "Tess",
  "Una",
  "Val",
  "Wendy",
  "Yasmin",
];
const LAST = [
  "Mitchell",
  "Clarke",
  "Webb",
  "Hartley",
  "Okafor",
  "Patel",
  "Kowalski",
  "Marsh",
  "Fletcher",
  "Nakamura",
  "Bright",
  "Doyle",
  "Sørensen",
  "Abara",
  "Quinn",
  "Lister",
  "Ahmed",
  "Baxter",
  "Begum",
  "Bennett",
  "Bishop",
  "Boateng",
  "Brennan",
  "Carter",
  "Chapman",
  "Choudhury",
  "Coles",
  "Dawson",
  "Devlin",
  "Ellis",
  "Ferris",
  "Gallagher",
  "Gibson",
  "Hale",
  "Hughes",
  "Iqbal",
  "Jarvis",
  "Kaur",
  "Lambert",
  "Lowe",
  "MacLeod",
  "Marsden",
  "Mensah",
  "Morgan",
  "Nash",
  "Odell",
  "Osei",
  "Parry",
  "Pearce",
  "Reid",
  "Rowe",
  "Shah",
  "Singh",
  "Talbot",
  "Thorne",
  "Vance",
  "Walsh",
  "Whitaker",
  "Yates",
  "Zhang",
];

// Draw WITHOUT replacement: the first cohorts drew with it from 20 names
// and repeated Aisha four times in 24 favpolls (founder, 2026-09-24).
function drawer(pool: readonly string[]) {
  let queue: string[] = [];
  return () => {
    if (queue.length === 0) queue = shuffle([...pool]);
    return queue.pop()!;
  };
}
const drawHe = drawer(HE);
const drawShe = drawer(SHE);
const drawLast = drawer(LAST);
const drawAny = () => (chance(0.5) ? drawShe() : drawHe());
// A couple is one he and one she nine times in ten: drawing both names
// at random made half the couples same-sex, which is nothing like the
// population (founder, 2026-09-24: "it doesn't feel representative").
const drawCouple = () =>
  chance(0.9)
    ? chance(0.5)
      ? `${drawShe()} & ${drawHe()}`
      : `${drawHe()} & ${drawShe()}`
    : `${drawAny()} & ${drawAny()}`;

const GROUP_NAMES: Record<string, string[]> = {
  Reunion: [
    "The Class of 2006",
    "The Lower Sixth, 1998",
    "The Ravenscroft rowing eight",
    "The Tuesday night five-a-side",
    "St Bede's, 1987 intake",
    "The Marlow Street mothers' group",
    "Ward 12 nurses, 1994",
    "The Hollowell Youth Orchestra",
  ],
  "Family gathering": [
    "The Hartley family",
    "The Okafors",
    "Four generations of Marshes",
    "The Devlins",
    "The Whitaker cousins",
    "The Begum family",
    "The MacLeods",
    "The Yates clan",
  ],
  "Team celebration": [
    "Ashby Rovers",
    "The Tuesday Quiz Team",
    "Northgate Netball",
    "Marlow Cricket Club firsts",
    "The Leyland bell-ringers",
    "Castle Street Runners",
    "The Vale Ladies' hockey team",
    "Riverside Bowls Club",
  ],
};

// Where the organiser is usually the protagonist, the Story is written
// in the first person most of the time (founder, 2026-09-24: "surely
// quite a lot of them would be in reality").
const FIRST_PERSON_OCCASIONS = new Set([
  "Achievement",
  "Retirement",
  "New home",
  "Citizenship",
  "Coming out",
  "Divorce party",
  "Wedding",
  "Engagement",
  "Anniversary",
  "Renewal of vows",
  "Reunion",
  "New baby",
  "Baby shower",
  "Christening",
]);
const firstPersonHere = (occasion: string) =>
  FIRST_PERSON_OCCASIONS.has(occasion) && chance(0.7);

function protagonist(
  register: Register,
  occasion: string,
): {
  name: string;
  pronoun: Pronoun;
  grouping: "individual" | "couple" | "group";
} {
  // A birth honours the PARENTS on behalf of the child (founder,
  // 2026-09-24): named as a couple, the baby in the context line.
  if (BABY_OCCASIONS.has(occasion)) {
    return {
      name: drawCouple(),
      pronoun: firstPersonHere(occasion) ? "i" : "they",
      grouping: "couple",
    };
  }
  if (register === "celebrating_many") {
    if (GROUP_NAMES[occasion]) {
      // A group's favpoll is organised by one of its own: "we", always
      // (founder, 2026-09-26: "the pronoun should be We").
      return {
        name: pick(GROUP_NAMES[occasion]),
        pronoun: "i",
        grouping: "group",
      };
    }
    return {
      name: drawCouple(),
      pronoun: firstPersonHere(occasion) ? "i" : "they",
      grouping: "couple",
    };
  }
  const she = chance(0.5);
  return {
    name: `${she ? drawShe() : drawHe()} ${drawLast()}`,
    pronoun: firstPersonHere(occasion) ? "i" : she ? "she" : "he",
    grouping: "individual",
  };
}

// The opening line must NAME the occasion (§7: the card carries the
// occasion only through it). The retired occasion catalogue still holds
// the founder-written lines and contexts per occasion — reuse them.
function occasionSpec(occasion: string) {
  return (
    OCCASIONS.find((o) => o.label.toLowerCase() === occasion.toLowerCase()) ??
    null
  );
}
function resolveContext(c: OccasionContext, pronoun: Pronoun): string {
  return typeof c === "string" ? c : c[pronoun === "i" ? "they" : pronoun];
}

// ── portraits ────────────────────────────────────────────────────────────
// Every real favpoll has a photo; a seeded one had the initials tile, so
// the shelf read as a demo (founder, 2026-09-24). Each seeded favpoll gets
// an abstract portrait in its register colour: a tinted ground and three
// soft discs placed by a hash of the name. Drawn as a raster here (no
// image library in scope) and uploaded to the same public bucket real
// photos use, so photo_url is an ordinary URL for the hero AND the OG
// image (Satori renders PNG; it would not render an SVG data URI).
const REGISTER_RGB: Record<string, [number, number, number]> = {
  remembering: [91, 79, 207], // memorial purple
  celebrating_one: [192, 57, 123], // celebration magenta
  celebrating_many: [192, 57, 123],
  cause: [46, 139, 106], // fundraiser green
};

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, data.length);
  const body = new Uint8Array(type.length + data.length);
  body.set(Buffer.from(type), 0);
  body.set(data, type.length);
  const crc = new Uint8Array(4);
  new DataView(crc.buffer).setUint32(0, crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** A 512×512 PNG portrait, deterministic for (name, register). */
export function makePortrait(name: string, register: string): Uint8Array {
  const SIZE = 512;
  const [r0, g0, b0] = REGISTER_RGB[register] ?? REGISTER_RGB.celebrating_one;
  const h = createHash("sha256").update(`${register}:${name}`).digest();
  const u = (i: number) => h[i % h.length] / 255;
  // Ground: the register at a whisper. Discs: three tones of the register,
  // from deep to pale, each with its own alpha, placed by the hash.
  const ground = [
    Math.round(255 - (255 - r0) * 0.1),
    Math.round(255 - (255 - g0) * 0.1),
    Math.round(255 - (255 - b0) * 0.1),
  ];
  const discs = [0, 1, 2].map((i) => {
    const t = 0.15 + i * 0.35; // 0.15 deep, 0.5 mid, 0.85 pale
    return {
      cx: SIZE * (0.2 + 0.6 * u(i * 3)),
      cy: SIZE * (0.2 + 0.6 * u(i * 3 + 1)),
      r: SIZE * (0.22 + 0.2 * u(i * 3 + 2)),
      rgb: [
        Math.round(r0 + (255 - r0) * t),
        Math.round(g0 + (255 - g0) * t),
        Math.round(b0 + (255 - b0) * t),
      ],
      a: 0.85 - i * 0.2,
    };
  });
  const raw = new Uint8Array((SIZE * 3 + 1) * SIZE);
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 3 + 1)] = 0; // filter: none
    for (let x = 0; x < SIZE; x++) {
      let [r, g, b] = ground;
      for (const d of discs) {
        const dx = x - d.cx,
          dy = y - d.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Soft edge over the last 6px so the discs don't alias.
        const cover = Math.max(0, Math.min(1, (d.r - dist) / 6)) * d.a;
        if (cover > 0) {
          r = r + (d.rgb[0] - r) * cover;
          g = g + (d.rgb[1] - g) * cover;
          b = b + (d.rgb[2] - b) * cover;
        }
      }
      const o = y * (SIZE * 3 + 1) + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, SIZE);
  dv.setUint32(4, SIZE);
  ihdr[8] = 8;
  ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", new Uint8Array(0)),
  ]);
}

async function uploadPortrait(
  favpollId: string,
  name: string,
  register: string,
): Promise<string | null> {
  const path = `seed/${favpollId}.png`;
  const { error } = await supabase.storage
    .from("protagonists")
    .upload(path, makePortrait(name, register), {
      contentType: "image/png",
      upsert: true,
    });
  if (error) {
    console.error(`  ✗ portrait upload failed for ${name}: ${error.message}`);
    return null;
  }
  return supabase.storage.from("protagonists").getPublicUrl(path).data
    .publicUrl;
}

// ── candidates: every triple the table motivates ─────────────────────────
type Topic = {
  id: string;
  title: string;
  is_finite: boolean;
  favourites: { id: string; label: string; is_canonical: boolean }[];
};
type Charity = {
  id: string;
  name: string;
  description: string | null;
  activities: string | null;
  cause_family: CauseFamily | null;
  objects?: string | null;
  areas?: { area: string; type: string }[] | null;
};

type Candidate = {
  register: Register;
  occasion: string;
  topic: Topic;
  charity: Charity;
  count: number;
};

// Fine as polls, hopeless as a person's story: nobody has a believable
// ritual around a smell, a sound, a time of day or the weather, and the
// model invented one every time (founder, 2026-09-24). They stay valid for
// causes and for organisers who choose them.
const NO_PERSON_STORY = new Set(["Smell", "Sound", "Time of day", "Weather"]);
// And for a cause the pick has to be able to say something honest about
// the cause: Weather and Landscape never could (founder, 2026-09-24).
const NO_CAUSE_STORY = new Set([...NO_PERSON_STORY, "Landscape"]);

function enumerate(topics: Topic[], charities: Charity[]): Candidate[] {
  const out: Candidate[] = [];
  const all: Register[] = [
    "remembering",
    "celebrating_one",
    "celebrating_many",
    "cause",
  ];
  const registers = REGISTERS.length ? REGISTERS : all;
  for (const register of registers) {
    for (const occasion of OCCASION_TYPES_BY_REGISTER[register]) {
      if (
        OCCASIONS_ONLY.length &&
        !OCCASIONS_ONLY.includes(occasion.toLowerCase())
      )
        continue;
      for (const topic of topics) {
        if (register !== "cause" && NO_PERSON_STORY.has(topic.title)) continue;
        if (register === "cause" && NO_CAUSE_STORY.has(topic.title)) continue;
        for (const charity of charities) {
          const edges = storyEdges({
            register,
            subject: register === "cause" ? "cause" : "someone",
            occasionType: occasion,
            topicTitle: topic.title,
            itemLabels: [],
            charity: {
              name: charity.name,
              description: charity.description,
              activities: charity.activities,
              causeFamily: charity.cause_family,
            },
          });
          // The bar: 2+ edges for a person; the charity edge plus a stated
          // event for a cause (no Honour vertex to score).
          const ok =
            register === "cause"
              ? Boolean(edges.e1 && edges.e2)
              : edges.count >= 2;
          if (ok)
            out.push({
              register,
              occasion,
              topic,
              charity,
              count: edges.count,
            });
        }
      }
    }
  }
  return out;
}

// Spread the cohort: caps per charity, topic and occasion so one row of
// the table cannot dominate, and a register mix that looks like a shelf.
const REGISTER_SHARE: Record<Register, number> = {
  celebrating_one: 0.4,
  celebrating_many: 0.25,
  remembering: 0.2,
  cause: 0.15,
};

function sample(candidates: Candidate[], n: number): Candidate[] {
  // Pick PER CHARITY from a shuffled queue, one triple per charity per
  // pass, so a charity repeats only once every eligible charity has one
  // (the cap-of-three version repeated Age UK and the hospices; founder,
  // 2026-09-24). Within a charity's triples a triad is preferred with
  // probability THREES; otherwise a two. Topic and occasion caps and the
  // register mix still spread the shelf.
  const chosen: Candidate[] = [];
  const perTopic = new Map<string, number>();
  // Two of the same occasion AND topic in a cohort come out alike (two
  // Graduation · Book favpolls both opened "three years of essays";
  // founder, 2026-09-25), and retrieval makes it worse. One per pair.
  const perPair = new Map<string, number>();
  const perOccasion = new Map<string, number>();
  const perRegister = new Map<Register, number>();
  const cap = (m: Map<string, number>, k: string, max: number) =>
    (m.get(k) ?? 0) < max;
  const bump = (m: Map<string, number>, k: string) =>
    m.set(k, (m.get(k) ?? 0) + 1);
  let births = 0;
  const MAX_BIRTHS = Math.max(1, Math.round(n / 12));
  const registerQuota = (r: Register) =>
    REGISTERS.length || OCCASIONS_ONLY.length
      ? n
      : Math.ceil(n * REGISTER_SHARE[r]);
  const byCharity = new Map<string, Candidate[]>();
  for (const c of candidates) {
    const list = byCharity.get(c.charity.id) ?? [];
    list.push(c);
    byCharity.set(c.charity.id, list);
  }
  const fits = (c: Candidate) =>
    !(BABY_OCCASIONS.has(c.occasion) && births >= MAX_BIRTHS) &&
    cap(perTopic, c.topic.id, 2) &&
    cap(perPair, `${c.occasion}|${c.topic.id}`, 1) &&
    cap(perOccasion, c.occasion, OCCASIONS_ONLY.length ? 2 : 3) &&
    (perRegister.get(c.register) ?? 0) < registerQuota(c.register);
  const take = (c: Candidate) => {
    chosen.push(c);
    if (BABY_OCCASIONS.has(c.occasion)) births++;
    bump(perTopic, c.topic.id);
    bump(perPair, `${c.occasion}|${c.topic.id}`);
    bump(perOccasion, c.occasion);
    perRegister.set(c.register, (perRegister.get(c.register) ?? 0) + 1);
  };
  // A gap-targeted run walks the OCCASIONS in turn, so every one asked
  // for gets its share before any repeats; each pick still prefers a
  // charity not yet used.
  if (OCCASIONS_ONLY.length) {
    const usedCharity = new Set<string>();
    for (let pass = 0; chosen.length < n && pass < 8; pass++) {
      for (const occ of OCCASIONS_ONLY) {
        if (chosen.length >= n) break;
        const pool = shuffle(
          candidates.filter((c) => c.occasion.toLowerCase() === occ && fits(c)),
        );
        const fresh = pool.filter((c) => !usedCharity.has(c.charity.id));
        const from = fresh.length ? fresh : pool;
        if (!from.length) continue;
        const wantTriad = chance(THREES);
        const pickFrom = from.filter((c) =>
          wantTriad ? c.count === 3 : c.count < 3,
        );
        const c = pickFrom.length ? pickFrom[0] : from[0];
        take(c);
        usedCharity.add(c.charity.id);
      }
    }
    return chosen;
  }
  const charityIds = shuffle([...byCharity.keys()]);
  for (let pass = 0; chosen.length < n && pass < 8; pass++) {
    for (const id of charityIds) {
      if (chosen.length >= n) break;
      const pool = shuffle(byCharity.get(id) ?? []).filter(fits);
      if (pool.length === 0) continue;
      const wantTriad = chance(THREES);
      const pickFrom = pool.filter((c) =>
        wantTriad ? c.count === 3 : c.count < 3,
      );
      take(pickFrom.length ? pickFrom[0] : pool[0]);
    }
  }
  return chosen;
}

// ── helpers ──────────────────────────────────────────────────────────────
function namedItem(note: string, items: { id: string; label: string }[]) {
  return items.find((i) => revealNamesRealItem(note, [i.label])) ?? null;
}

async function fetchAllIds(
  table: string,
  col: string,
  values: string[] | null,
  select = "id",
): Promise<string[]> {
  const out: string[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    let q = supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE - 1);
    q = values ? q.in(col, values) : q.eq(col, SEED_USER);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    const rows = (data ?? []) as unknown as Record<string, string | null>[];
    for (const r of rows) if (r[select]) out.push(r[select] as string);
    if (rows.length < PAGE) break;
  }
  return out;
}

async function deleteIn(table: string, col: string, ids: string[]) {
  for (let i = 0; i < ids.length; i += 500) {
    const { error } = await supabase
      .from(table)
      .delete()
      .in(col, ids.slice(i, i + 500));
    if (error) throw new Error(`${table} delete: ${error.message}`);
  }
}

async function wipe() {
  console.log("Wiping story seed…");
  const favpollIds = await fetchAllIds("favpolls", "created_by", null);
  if (favpollIds.length === 0) {
    console.log("Nothing to wipe.");
    return;
  }
  const pollIds = await fetchAllIds("favpoll_polls", "favpoll_id", favpollIds);
  const potIds = await fetchAllIds("favpoll_pots", "favpoll_id", favpollIds);
  const pledgeIds = await fetchAllIds("pledges", "favpoll_poll_id", pollIds);
  const protagonistIds = await fetchAllIds(
    "favpolls",
    "created_by",
    null,
    "protagonist_id",
  );
  await deleteIn("pledge_allocations", "pledge_id", pledgeIds);
  await deleteIn("pledges", "favpoll_poll_id", pollIds);
  await deleteIn("favpoll_poll_favourites", "favpoll_poll_id", pollIds);
  await deleteIn("disbursements", "favpoll_id", favpollIds);
  await deleteIn("pot_allocations", "pot_id", potIds);
  await deleteIn("pot_topups", "pot_id", potIds);
  await deleteIn("favpoll_polls", "favpoll_id", favpollIds);
  await deleteIn("favpoll_pots", "favpoll_id", favpollIds);
  await deleteIn("favpoll_charities", "favpoll_id", favpollIds);
  await deleteIn("favpolls", "id", favpollIds);
  await deleteIn("protagonists", "id", protagonistIds);
  await supabase.from("users").delete().eq("id", SEED_USER);
  console.log(`Wiped ${favpollIds.length} favpolls and everything under them.`);
}

// ── the judge loop ───────────────────────────────────────────────────────
// Generate, check P1 (and the cause's event) by lookup and realism by the
// judge, retry up to MAX_ATTEMPTS; the best attempt is returned even when
// none passes, and the caller decides.
type Attempt = {
  story: Awaited<ReturnType<typeof generateStory>>;
  item: { id: string; label: string } | null;
  verdict: string;
  score: number;
};
async function judgeLoop(
  input: StoryInput,
  items: { id: string; label: string }[],
  isCause: boolean,
  occasion: string,
  label: string,
): Promise<{ best: Attempt | null; attempts: number }> {
  let best: Attempt | null = null;
  let attempts = 0;
  for (; attempts < MAX_ATTEMPTS; attempts++) {
    let story;
    try {
      story = await generateStory(input, STORY_MODEL);
    } catch (err) {
      console.error(
        `  ✗ ${label}: generate failed — ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }
    const item = namedItem(story.note, items);
    const event = isCause ? aboutNamesEvent(story.about, occasion) : true;
    // A first-person couple or group keeps "we" in the note: a lookup,
    // and part of the gate rather than a single retry.
    const plural = !(
      input.pronoun === "i" &&
      (input.grouping === "couple" || input.grouping === "group") &&
      slipsToSingular(story.note)
    );
    const verdict = await judgeStory(story, input, story.edges, JUDGE_MODEL);
    const score =
      (item && event && plural ? 1 : 0) + (verdict.realistic ? 2 : 0);
    const v = `P1 ${item ? "✓" : "✗"}${isCause ? ` · event ${event ? "✓" : "✗"}` : ""}${plural ? "" : " · we ✗"} · real ${verdict.realistic ? "✓" : "✗"}${verdict.reason ? ` — ${verdict.reason}` : ""}`;
    if (!best || score > best.score) best = { story, item, verdict: v, score };
    if (score === 3) break;
  }
  return { best, attempts };
}

// ── seed ─────────────────────────────────────────────────────────────────
type Manifest = {
  name: string;
  register: Register;
  occasion: string;
  topic: string;
  charity: string;
  edges: number;
  attempts: number;
  about: string;
  note: string;
  causeLabel: string | null;
  context: string | null;
  favpollId: string | null;
  verdict: string;
};

async function seed() {
  const [
    { data: topicsData, error: tErr },
    { data: charitiesData, error: cErr },
  ] = await Promise.all([
    supabase
      .from("topics")
      .select("id, title, is_finite, favourites(id, label, is_canonical)")
      .eq("is_active", true),
    supabase
      .from("charities")
      .select("id, name, description, activities, cause_family, objects, areas")
      .eq("is_active", true)
      .not("cause_family", "is", null),
  ]);
  if (tErr) throw new Error(tErr.message);
  if (cErr) throw new Error(cErr.message);
  const topics = ((topicsData ?? []) as Topic[]).filter(
    (t) => t.favourites.length >= 5,
  );
  const charities = (charitiesData ?? []) as Charity[];
  if (topics.length === 0 || charities.length === 0)
    throw new Error(
      "Need active topics and charities with a confirmed cause family — run pnpm seed and confirm families first.",
    );

  // Topics already used by seeded favpolls on staging count against the
  // per-topic cap, so a third "Way to spend Sunday" cannot appear across
  // cohorts (founder, 2026-09-26: "don't we have an example very similar
  // to this?").
  const { data: usedRows } = await supabase
    .from("favpolls")
    .select("favpoll_polls(topic_id)")
    .eq("created_by", SEED_USER);
  const usedTopics = new Map<string, number>();
  for (const r of usedRows ?? []) {
    const poll = Array.isArray((r as any).favpoll_polls)
      ? (r as any).favpoll_polls[0]
      : (r as any).favpoll_polls;
    if (poll?.topic_id)
      usedTopics.set(poll.topic_id, (usedTopics.get(poll.topic_id) ?? 0) + 1);
  }
  const candidates = enumerate(topics, charities).filter(
    (c) => (usedTopics.get(c.topic.id) ?? 0) < 2,
  );
  const triads = candidates.filter((c) => c.count === 3).length;
  console.log(
    `Table: ${candidates.length} motivated triples from ${topics.length} topics × ${charities.length} charities (${triads} triads).`,
  );
  const chosen = sample(candidates, COUNT);
  console.log(
    `Picked ${chosen.length} (rng seed ${RNG_SEED}, ${chosen.filter((c) => c.count === 3).length} triads):`,
  );
  for (const c of chosen)
    console.log(
      `  ${"★".repeat(c.count).padEnd(3)} ${c.register.padEnd(16)} ${c.occasion.padEnd(20)} ${c.topic.title.padEnd(24)} ${c.charity.name}`,
    );
  if (DRY_RUN) {
    console.log("\n--dry-run: no model calls, nothing written.");
    return;
  }

  await supabase
    .from("users")
    .upsert({ id: SEED_USER, display_name: "Story Seed" });

  const now = Date.now();
  const DAY = 86_400_000;
  const iso = (t: number) => new Date(t).toISOString();
  const manifest: Manifest[] = [];
  let guestSeq = 0;
  let written = 0;

  for (const c of chosen) {
    const isCause = c.register === "cause";
    const who = isCause ? null : protagonist(c.register, c.occasion);
    const spec = occasionSpec(c.occasion);
    // The catalogue's Achievement lines ("Well done", "Take a bow") are
    // written after the event; a sponsored effort is cheered on before it.
    const isEffort = EFFORT_OCCASIONS.has(c.occasion) && !isCause;
    const isBirth = BABY_OCCASIONS.has(c.occasion);
    const babyName = isBirth ? drawAny() : null;
    const effortName = pick([
      "Marathon",
      "Half marathon",
      "Channel swim",
      "Coast to coast",
      "Three Peaks",
      "London to Brighton",
      "10k",
      "Triathlon",
    ]);
    const openingLine = isBirth
      ? "Congratulations to"
      : isEffort
        ? pick(["Cheering on", "Backing", "Good luck to"])
        : spec
          ? pick(spec.openingLines)
          : null;
    const context = isBirth
      ? c.occasion === "Baby shower"
        ? `Baby ${drawLast()} due ${pick(["October", "November", "December"])}`
        : `Welcoming ${babyName}`
      : isEffort
        ? `${effortName} · ${pick(["4th", "12th", "19th", "26th"])} ${pick(["October", "November"])}`
        : spec
          ? resolveContext(pick(spec.contexts), who?.pronoun ?? "they")
          : null;

    // Item set follows the item-source rule (lib/poll-items) AND the
    // wizard: a finite topic's items are its closed set; an infinite
    // topic's are its curated rows, which the wizard seeds with EVERY
    // canonical favourite (the founder's instinct, 2026-09-24: "infinite
    // lists should be full"). Nothing here trims the list.
    const items = c.topic.is_finite
      ? c.topic.favourites
      : c.topic.favourites.filter((f) => f.is_canonical);

    const input: StoryInput = {
      register: c.register,
      subject: isCause ? "cause" : "someone",
      occasionType: c.occasion,
      topicTitle: c.topic.title,
      itemLabels: items.map((i) => i.label),
      charity: {
        name: c.charity.name,
        description: c.charity.description,
        activities: c.charity.activities,
        causeFamily: c.charity.cause_family,
        objects: c.charity.objects ?? null,
        areas: c.charity.areas ?? null,
      },
      pronoun: who?.pronoun,
      grouping: who?.grouping,
      displayName: who?.name ?? null,
      fiction: true,
      // The seed chooses the favourite: left to the model it defaults to
      // the same few (Camber Sands, Sissinghurst) cohort after cohort.
      pick: pick(items).label,
    };

    // The judge loop: generate, check P1 by lookup and A1/P2 by the
    // judge, retry up to MAX_ATTEMPTS; the best attempt wins if none
    // passes, and the manifest says so.
    const { best, attempts } = await judgeLoop(
      input,
      items,
      isCause,
      c.occasion,
      who?.name ?? c.charity.name,
    );
    if (!best) {
      manifest.push({
        name: who?.name ?? "(cause)",
        register: c.register,
        occasion: c.occasion,
        topic: c.topic.title,
        charity: c.charity.name,
        edges: c.count,
        attempts,
        about: "",
        note: "",
        causeLabel: null,
        context: null,
        favpollId: null,
        verdict: "no story generated",
      });
      continue;
    }
    const { story, item } = best;
    const passed = best.score === 3;
    if (!passed) {
      console.warn(
        `  ⚠ ${who?.name ?? story.causeLabel ?? c.charity.name}: gate not met after ${attempts} attempt(s) — ${best.verdict}; skipped`,
      );
      manifest.push({
        name: who?.name ?? story.causeLabel ?? "(cause)",
        register: c.register,
        occasion: c.occasion,
        topic: c.topic.title,
        charity: c.charity.name,
        edges: c.count,
        attempts,
        about: story.about,
        note: story.note,
        causeLabel: story.causeLabel,
        context: story.context,
        favpollId: null,
        verdict: best.verdict,
      });
      continue;
    }

    // ── write ──
    // An effort's favpoll closes on the day, so it is always still open.
    const open = EFFORT_OCCASIONS.has(c.occasion) || chance(0.6);
    const closesAt = open
      ? now + between(7, 40) * DAY
      : now - between(3, 60) * DAY;
    const createdAt = closesAt - between(14, 45) * DAY;
    const favpollId = randomUUID();
    const portraitName = who?.name ?? story.causeLabel ?? c.charity.name;
    const photoUrl = await uploadPortrait(favpollId, portraitName, c.register);

    let protagonistId: string | null = null;
    if (who) {
      const { data, error } = await supabase
        .from("protagonists")
        .insert({
          name: who.name,
          about: story.about,
          context,
          pronoun: who.pronoun,
          photo_url: photoUrl,
          created_by: SEED_USER,
        })
        .select("id")
        .single();
      if (error || !data) {
        console.error(
          `  ✗ protagonist insert failed for ${who.name}: ${error?.message}`,
        );
        continue;
      }
      protagonistId = data.id;
    }

    // Pledges: the note's item leads the standings — the payoff should be
    // visible in the numbers too. Settlement total only once closed.
    const nPledges = between(4, 18);
    const amounts = Array.from({ length: nPledges }, () =>
      pick([2, 3, 5, 5, 10, 10, 10, 15, 20, 25, 50]),
    );
    const raised = amounts.reduce((a, b) => a + b, 0);

    const { error: fErr } = await supabase.from("favpolls").insert({
      id: favpollId,
      protagonist_id: protagonistId,
      subject: isCause ? "cause" : "someone",
      cause_label: isCause
        ? (story.causeLabel ?? `${c.charity.name} ${c.occasion.toLowerCase()}`)
        : null,
      description: isCause ? story.about : null,
      context: isCause ? (story.context ?? context) : null,
      photo_url: isCause ? photoUrl : null,
      category: isCause
        ? null
        : c.register === "remembering"
          ? "memorial"
          : "celebration",
      grouping: who?.grouping ?? "individual",
      is_plural: who ? who.grouping !== "individual" : false,
      occasion_type: c.occasion,
      opening_line: openingLine,
      market: "en-GB",
      created_by: SEED_USER,
      created_at: iso(createdAt),
      closes_at: iso(closesAt),
      original_closes_at: iso(closesAt),
      hard_close_at: iso(closesAt + 90 * DAY),
      extension_count: 0,
      closed_at: open ? null : iso(closesAt),
      is_private: false,
      // Memorials stay unlisted, as the hand-made exemplars do.
      is_listed: c.register !== "remembering",
      is_exemplar: true,
      total_raised: open ? 0 : raised,
    });
    if (fErr) {
      console.error(
        `  ✗ favpoll insert failed for ${who?.name ?? c.charity.name}: ${fErr.message}`,
      );
      continue;
    }
    await supabase.from("favpoll_charities").insert({
      favpoll_id: favpollId,
      charity_id: c.charity.id,
      display_order: 0,
    });
    await supabase.from("favpoll_pots").insert({
      favpoll_id: favpollId,
      created_by: SEED_USER,
      total_deposited: 0,
      total_allocated: 0,
    });
    const pollId = randomUUID();
    const { error: pErr } = await supabase.from("favpoll_polls").insert({
      id: pollId,
      favpoll_id: favpollId,
      topic_id: c.topic.id,
      personal_note: story.note,
      created_at: iso(createdAt),
    });
    if (pErr) {
      console.error(
        `  ✗ poll insert failed for ${who?.name ?? c.charity.name}: ${pErr.message}`,
      );
      continue;
    }
    if (!c.topic.is_finite) {
      await supabase.from("favpoll_poll_favourites").insert(
        items.map((f) => ({
          favpoll_poll_id: pollId,
          favourite_id: f.id,
          is_guest_added: false,
          is_hidden: false,
          added_by: SEED_USER,
        })),
      );
    }
    const windowEnd = Math.min(now, closesAt);
    const others = items.filter((i) => i.id !== item?.id);
    const pledgeRows = amounts.map((amount, i) => ({
      id: randomUUID(),
      favpoll_poll_id: pollId,
      clerk_user_id: null,
      // .invalid is reserved (RFC 2606): a fictional pledge can never reach
      // a real inbox. Unique per pledge — one active pledge per email.
      guest_email: `seedstory+${guestSeq++}@example.invalid`,
      guest_token: randomUUID(),
      total_amount: amount,
      fee: 0,
      tip_amount: 0,
      display_name: chance(0.7) ? pick([...HE, ...SHE]) : null,
      is_anonymous: false,
      payment_intent_id: null,
      created_at: iso(createdAt + rnd() * Math.max(1, windowEnd - createdAt)),
      // Top-heavy: the first half of the pledges back the note's item.
      favourite_id:
        item && i < Math.ceil(nPledges / 2)
          ? item.id
          : pick(others.length ? others : items).id,
    }));
    const { error: plErr } = await supabase
      .from("pledges")
      .insert(pledgeRows.map(({ favourite_id: _f, ...row }) => row));
    if (plErr)
      console.error(
        `  ✗ pledges failed for ${who?.name ?? c.charity.name}: ${plErr.message}`,
      );
    else {
      const { error: alErr } = await supabase.from("pledge_allocations").insert(
        pledgeRows.map((r) => ({
          pledge_id: r.id,
          favourite_id: r.favourite_id,
          amount: r.total_amount,
        })),
      );
      if (alErr)
        console.error(
          `  ✗ allocations failed for ${who?.name ?? c.charity.name}: ${alErr.message}`,
        );
    }

    written++;
    console.log(
      `  ✓ ${"★".repeat(c.count).padEnd(3)} ${(who?.name ?? story.causeLabel ?? c.charity.name).padEnd(28)} ${c.occasion} · ${c.topic.title} · ${c.charity.name} (${attempts + (best.score === 3 ? 1 : 0)} attempt${attempts ? "s" : ""}, ${open ? "open" : "closed"})`,
    );
    manifest.push({
      name: who?.name ?? story.causeLabel ?? "(cause)",
      register: c.register,
      occasion: c.occasion,
      topic: c.topic.title,
      charity: c.charity.name,
      edges: c.count,
      attempts: attempts + 1,
      about: story.about,
      note: story.note,
      causeLabel: story.causeLabel,
      context: story.context,
      favpollId,
      verdict: best.verdict,
    });
  }

  const out = join(
    tmpdir(),
    `seed-stories-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );
  writeFileSync(out, JSON.stringify(manifest, null, 2));
  console.log(
    `\nDone: ${written}/${chosen.length} written (${manifest.filter((m) => !m.favpollId).length} skipped at the gate). Manifest: ${out}`,
  );
  console.log("Tear down with: --wipe");
}

// ── refresh: patch the existing cohort in place ──────────────────────────
async function refresh() {
  console.log("Refreshing the existing story seed…");
  const { data: f, error } = await supabase
    .from("favpolls")
    .select(
      "id, subject, category, grouping, cause_label, photo_url, protagonists(id, name, photo_url), favpoll_polls(id, topics(id, is_finite, favourites(id, is_canonical)), favpoll_poll_favourites(favourite_id))",
    )
    .eq("created_by", SEED_USER);
  if (error) throw new Error(error.message);
  const one = <T>(v: T | T[] | null): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : v;
  let items = 0,
    portraits = 0;
  for (const x of f ?? []) {
    const p = one(x.protagonists as any) as {
      id: string;
      name: string;
      photo_url: string | null;
    } | null;
    const poll = one(x.favpoll_polls as any) as any;
    const topic = one(poll?.topics) as {
      id: string;
      is_finite: boolean;
      favourites: { id: string; is_canonical: boolean }[];
    } | null;
    // Full canonical set for infinite topics — add what the curated subset left out.
    if (topic && !topic.is_finite) {
      const have = new Set(
        (poll.favpoll_poll_favourites as { favourite_id: string }[]).map(
          (r) => r.favourite_id,
        ),
      );
      const missing = topic.favourites.filter(
        (fv) => fv.is_canonical && !have.has(fv.id),
      );
      if (missing.length) {
        const { error: e } = await supabase
          .from("favpoll_poll_favourites")
          .insert(
            missing.map((fv) => ({
              favpoll_poll_id: poll.id,
              favourite_id: fv.id,
              is_guest_added: false,
              is_hidden: false,
              added_by: SEED_USER,
            })),
          );
        if (e)
          console.error(
            `  ✗ items for ${p?.name ?? x.cause_label}: ${e.message}`,
          );
        else items += missing.length;
      }
    }
    // A portrait where there is none.
    const register =
      x.subject === "cause"
        ? "cause"
        : x.category === "memorial"
          ? "remembering"
          : x.grouping === "individual"
            ? "celebrating_one"
            : "celebrating_many";
    const name = p?.name ?? x.cause_label ?? x.id;
    if (p && !p.photo_url) {
      const url = await uploadPortrait(x.id, name, register);
      if (url) {
        await supabase
          .from("protagonists")
          .update({ photo_url: url })
          .eq("id", p.id);
        portraits++;
      }
    } else if (!p && !x.photo_url) {
      const url = await uploadPortrait(x.id, name, register);
      if (url) {
        await supabase
          .from("favpolls")
          .update({ photo_url: url })
          .eq("id", x.id);
        portraits++;
      }
    }
  }
  console.log(
    `Refreshed ${f?.length ?? 0} favpolls: ${items} items added, ${portraits} portraits set.`,
  );
}

// ── rename: fresh names, copy kept ───────────────────────────────────────
async function rename() {
  const { data: f, error } = await supabase
    .from("favpolls")
    .select(
      "id, occasion_type, grouping, protagonists(id, name, about, pronoun), favpoll_polls(id, personal_note)",
    )
    .eq("created_by", SEED_USER)
    .eq("subject", "someone");
  if (error) throw new Error(error.message);
  const one = <T>(v: T | T[] | null): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : v;
  const swap = (text: string, from: string, to: string) => {
    // The whole name, its "and" form, and its possessives.
    let out = text.split(from).join(to);
    if (from.includes(" & "))
      out = out
        .split(from.replace(" & ", " and "))
        .join(to.replace(" & ", " and "));
    const fromFirst = from.includes(" & ") ? from : from.split(" ")[0];
    const toFirst = to.includes(" & ") ? to : to.split(" ")[0];
    out = out.split(fromFirst).join(toFirst);
    // Re-form the possessive for the new name: "James' was" must become
    // "Arthur's was", and "Nora's" must become "Carys'".
    const bare = toFirst.replace(/['\u2019]s?$/, "");
    const poss = bare.endsWith("s") ? `${bare}'` : `${bare}'s`;
    return out
      .split(`${bare}'s`)
      .join(poss)
      .split(`${bare}' `)
      .join(`${poss} `)
      .split(`${bare}'.`)
      .join(`${poss}.`);
  };
  let n = 0;
  for (const x of f ?? []) {
    const p = one(x.protagonists as any) as {
      id: string;
      name: string;
      about: string;
      pronoun: Pronoun | null;
    } | null;
    const poll = one(x.favpoll_polls as any) as {
      id: string;
      personal_note: string;
    } | null;
    if (!p || !poll || x.grouping === "group") continue;
    const fresh =
      x.grouping === "couple"
        ? drawCouple()
        : `${p.pronoun === "she" ? drawShe() : drawHe()} ${drawLast()}`;
    const about = swap(p.about, p.name, fresh);
    const note = swap(poll.personal_note, p.name, fresh);
    await supabase
      .from("protagonists")
      .update({ name: fresh, about })
      .eq("id", p.id);
    await supabase
      .from("favpoll_polls")
      .update({ personal_note: note })
      .eq("id", poll.id);
    n++;
    console.log(`  ${p.name.padEnd(22)} → ${fresh}`);
  }
  console.log(`Renamed ${n}.`);
}

// The founder edits the cohort in references/seeded-stories-<date>.md; a
// regen writes its result there too so the file, staging and the review
// page cannot drift (2026-09-25).
const REFS_DIR = join(__dirname, "..", "references");
function syncEditableMd(
  id: string,
  heading: string,
  about: string,
  note: string,
) {
  // Whichever Stories file holds this id (one file per cohort).
  if (!existsSync(REFS_DIR)) return;
  const file = readdirSync(REFS_DIR)
    .filter(
      (f) => /^seeded-stories-.*\.md$/.test(f) && !f.includes("alternatives"),
    )
    .map((f) => join(REFS_DIR, f))
    .find((f) => readFileSync(f, "utf8").includes("`id " + id + "`"));
  if (!file) return;
  const md = readFileSync(file, "utf8");
  const re = new RegExp(
    "(### \\d+\\. )[^\\n]*(\\n`id " +
      id +
      "`[^\\n]*\\n\\n\\*\\*About\\*\\*\\n\\n)([\\s\\S]*?)(\\n\\n\\*\\*Note\\*\\*\\n\\n)([\\s\\S]*?)(?=\\n\\n### |\\n\\n## |$)",
  );
  const m = md.match(re);
  if (!m || m.index === undefined) return;
  const out =
    md.slice(0, m.index) +
    m[1] +
    heading +
    m[2] +
    about +
    m[4] +
    note +
    md.slice(m.index + m[0].length);
  writeFileSync(file, out);
  console.log(`  ↳ ${file.split("/").slice(-2).join("/")} updated`);
}

// ── regen: one seeded favpoll's Story, in place ──────────────────────────
async function regen(name: string) {
  const { data: f, error } = await supabase
    .from("favpolls")
    .select(
      "id, subject, category, grouping, occasion_type, cause_label, protagonists(id, name, pronoun), favpoll_polls(id, topics(title, is_finite, favourites(id, label, is_canonical)), favpoll_poll_favourites(favourite_id)), favpoll_charities(charities(name, description, activities, cause_family, objects, areas))",
    )
    .eq("created_by", SEED_USER);
  if (error) throw new Error(error.message);
  const one = <T>(v: T | T[] | null): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : v;
  const want = name.trim().toLowerCase();
  const x = (f ?? []).find(
    (r: any) =>
      (one(r.protagonists) as any)?.name?.toLowerCase() === want ||
      r.cause_label?.toLowerCase() === want,
  );
  if (!x) throw new Error(`No seeded favpoll named "${name}"`);
  const p = one(x.protagonists as any) as {
    id: string;
    name: string;
    pronoun: Pronoun | null;
  } | null;
  const poll = one(x.favpoll_polls as any) as any;
  const topic = one(poll.topics) as Topic;
  const ch = one(one(x.favpoll_charities as any)?.charities) as Charity;
  const isCause = x.subject === "cause";
  const register: Register = isCause
    ? "cause"
    : x.category === "memorial"
      ? "remembering"
      : x.grouping === "individual"
        ? "celebrating_one"
        : "celebrating_many";
  const curated = new Set(
    (poll.favpoll_poll_favourites as { favourite_id: string }[]).map(
      (r) => r.favourite_id,
    ),
  );
  const items = topic.is_finite
    ? topic.favourites
    : topic.favourites.filter((fv) => curated.has(fv.id));
  const input: StoryInput = {
    register,
    subject: isCause ? "cause" : "someone",
    occasionType: x.occasion_type,
    topicTitle: topic.title,
    itemLabels: items.map((i) => i.label),
    charity: {
      name: ch.name,
      description: ch.description,
      activities: ch.activities,
      causeFamily: ch.cause_family,
      objects: ch.objects ?? null,
      areas: ch.areas ?? null,
    },
    pronoun: p?.pronoun ?? undefined,
    grouping: x.grouping,
    displayName: p?.name ?? x.cause_label,
    fiction: true,
    pick:
      (REGEN_PICK &&
        items.find((i) => i.label.toLowerCase() === REGEN_PICK.toLowerCase())
          ?.label) ||
      pick(items).label,
  };
  // If the table has moved under the favpoll (a row narrowed), the
  // triple may be below the seed bar: re-pick the topic for the same
  // occasion and charity, keeping the name, before writing.
  const bar = isCause
    ? (e: ReturnType<typeof storyEdges>) => Boolean(e.e1 && e.e2)
    : (e: ReturnType<typeof storyEdges>) => e.count >= 2;
  if (REGEN_TOPIC || !bar(storyEdges(input))) {
    const { data: allTopics } = await supabase
      .from("topics")
      .select("id, title, is_finite, favourites(id, label, is_canonical)")
      .eq("is_active", true);
    const options = ((allTopics ?? []) as Topic[])
      .filter(
        (t) =>
          t.favourites.length >= 5 &&
          !(isCause ? NO_CAUSE_STORY : NO_PERSON_STORY).has(t.title),
      )
      .map((t) => ({ t, e: storyEdges({ ...input, topicTitle: t.title }) }))
      .filter(({ e }) => bar(e));
    if (options.length === 0 && !REGEN_TOPIC)
      throw new Error(
        "No topic meets the seed bar for this occasion and charity",
      );
    const wanted = REGEN_TOPIC
      ? ((allTopics ?? []) as Topic[]).find(
          (t) => t.title.toLowerCase() === REGEN_TOPIC.toLowerCase(),
        )
      : null;
    if (REGEN_TOPIC && !wanted) throw new Error(`No topic "${REGEN_TOPIC}"`);
    const best = Math.max(...options.map((o) => o.e.count));
    const newTopic =
      wanted ?? pick(options.filter((o) => o.e.count === best)).t;
    console.log(
      `  topic ${topic.title} → ${newTopic.title} (the old triple fell below the bar)`,
    );
    const newItems = newTopic.is_finite
      ? newTopic.favourites
      : newTopic.favourites.filter((f) => f.is_canonical);
    await supabase
      .from("favpoll_poll_favourites")
      .delete()
      .eq("favpoll_poll_id", poll.id);
    await supabase
      .from("favpoll_polls")
      .update({ topic_id: newTopic.id })
      .eq("id", poll.id);
    if (!newTopic.is_finite)
      await supabase.from("favpoll_poll_favourites").insert(
        newItems.map((f) => ({
          favpoll_poll_id: poll.id,
          favourite_id: f.id,
          is_guest_added: false,
          is_hidden: false,
          added_by: SEED_USER,
        })),
      );
    // Allocations must point at the new items: spread them, the note's
    // item re-leads below.
    const { data: pledges } = await supabase
      .from("pledges")
      .select("id")
      .eq("favpoll_poll_id", poll.id);
    for (const pl of pledges ?? [])
      await supabase
        .from("pledge_allocations")
        .update({ favourite_id: pick(newItems).id })
        .eq("pledge_id", pl.id);
    topic.title = newTopic.title;
    topic.is_finite = newTopic.is_finite;
    topic.favourites = newTopic.favourites;
    items.length = 0;
    items.push(...newItems);
    input.topicTitle = newTopic.title;
    input.itemLabels = newItems.map((i) => i.label);
    input.pick =
      (REGEN_PICK &&
        newItems.find((i) => i.label.toLowerCase() === REGEN_PICK.toLowerCase())
          ?.label) ||
      pick(newItems).label;
  }
  // A birth favpoll seeded with the BABY on the card becomes the parents'
  // (2026-09-24): a couple is named, the baby moves to the context line.
  if (
    p &&
    BABY_OCCASIONS.has(x.occasion_type ?? "") &&
    x.grouping === "individual"
  ) {
    const babyFirst = p.name.split(" ")[0];
    const parents = drawCouple();
    await supabase
      .from("protagonists")
      .update({
        name: parents,
        pronoun: "they",
        context: `Welcoming ${babyFirst}`,
      })
      .eq("id", p.id);
    await supabase
      .from("favpolls")
      .update({
        grouping: "couple",
        is_plural: true,
        opening_line: "Congratulations to",
      })
      .eq("id", x.id);
    console.log(`  ${p.name} → ${parents}, welcoming ${babyFirst}`);
    p.name = parents;
    p.pronoun = "they";
    (x as any).grouping = "couple";
    input.displayName = parents;
    input.pronoun = undefined;
    input.grouping = "couple";
  }
  console.log(
    `Regenerating ${p?.name ?? x.cause_label}: ${x.occasion_type} · ${topic.title} · ${ch.name} (${"★".repeat(storyEdges(input).count) || "no edges"})`,
  );
  const { best, attempts } = await judgeLoop(
    input,
    items,
    isCause,
    x.occasion_type,
    p?.name ?? x.cause_label,
  );
  if (!best || best.score < 3) {
    console.warn(
      `  ⚠ gate not met after ${attempts} attempt(s) — ${best?.verdict ?? "no story"}; nothing written`,
    );
    return;
  }
  const { story, item } = best;
  if (p)
    await supabase
      .from("protagonists")
      .update({ about: story.about })
      .eq("id", p.id);
  else
    await supabase
      .from("favpolls")
      .update({ description: story.about })
      .eq("id", x.id);
  await supabase
    .from("favpoll_polls")
    .update({ personal_note: story.note })
    .eq("id", poll.id);
  // The note's item leads the standings: re-point the first half of the
  // pledges' allocations to it.
  if (item) {
    const { data: pledges } = await supabase
      .from("pledges")
      .select("id")
      .eq("favpoll_poll_id", poll.id)
      .order("created_at");
    const lead = (pledges ?? [])
      .slice(0, Math.ceil((pledges ?? []).length / 2))
      .map((r) => r.id);
    if (lead.length)
      await supabase
        .from("pledge_allocations")
        .update({ favourite_id: item.id })
        .in("pledge_id", lead);
  }
  console.log(
    `  ✓ written (${attempts + 1} attempt${attempts ? "s" : ""})\n  ABOUT: ${story.about}\n  NOTE:  ${story.note}`,
  );
  syncEditableMd(
    x.id,
    `${p?.name ?? x.cause_label} · ${x.occasion_type} · ${topic.title} · ${ch.name}`,
    story.about,
    story.note,
  );
}

(WIPE
  ? wipe()
  : REFRESH
    ? refresh()
    : REGEN
      ? regen(REGEN)
      : RENAME
        ? rename()
        : seed()
).catch((e) => {
  console.error(e);
  process.exit(1);
});
