/**
 * scripts/seed-stories.ts
 * ---------------------------------------------------------------------------
 * Seeds favpolls that are MOTIVATED BY CONSTRUCTION — step 5 of the
 * concept-clarity sequence (references/favpoll-pairing-table-2026-09-23.md
 * §4 and §6). Every favpoll starts as a triple (occasion · charity · topic)
 * picked FROM the table, so its edges are known before a word of copy
 * exists; the Story engine (apps/web/lib/story-engine.ts — the same
 * generator behind the wizard's Generate) writes the edges in; a judge
 * loop retries until the rubric's two model checks pass (A1: the about
 * adds a fact about the person; P2: the note's detail is theirs).
 *
 *   Seed bar    person favpolls need 2+ edges; cause favpolls need the
 *               charity edge AND a stated event. Ones and zeros are never
 *               seeded.
 *   Triads      the share of 3-edge favpolls is a knob (--threes).
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
 *        these registers) · --wipe
 *
 * SAFETY: refuses to run unless the target is staging, or
 * ALLOW_FAVPOLL_SEED=1. Owned by created_by = 'user_seed_story' (no email,
 * so the close cron can never mail). Additive: each run adds a cohort;
 * --wipe removes everything this script ever wrote.
 * ---------------------------------------------------------------------------
 */

import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { CauseFamily, Pronoun } from "@favpoll/types";
import {
  aboutNamesEvent,
  generateStory,
  judgeStory,
  storyEdges,
  type StoryInput,
} from "../apps/web/lib/story-engine";
import { revealNamesRealItem } from "../apps/web/lib/actions/generate-draft-utils";
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
const DRY_RUN = flag("dry-run");
const COUNT = parseInt(opt("count", "24"), 10);
const THREES = parseFloat(opt("threes", "0.4"));
const RNG_SEED = parseInt(opt("seed", "1"), 10);
const STORY_MODEL = opt("model", "claude-sonnet-5");
const JUDGE_MODEL = opt(
  "judge-model",
  process.env.LLM_CLASSIFIER_MODEL_ID ?? "claude-haiku-4-5",
);
// --registers=cause,remembering narrows the pick (re-running one register
// after a judge fix without duplicating the rest of a cohort).
const REGISTERS = opt("registers", "")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean) as Register[];
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
];
const GROUP_NAMES: Record<string, string[]> = {
  Reunion: [
    "The Class of 2006",
    "The Lower Sixth, 1998",
    "Ward 4, Spring 1994",
  ],
  "Family gathering": [
    "The Hartley family",
    "The Okafors",
    "Four generations of Marshes",
  ],
  "Team celebration": [
    "Ashby Rovers",
    "The Tuesday Quiz Team",
    "Northgate Netball",
  ],
};

function protagonist(
  register: Register,
  occasion: string,
): {
  name: string;
  pronoun: Pronoun;
  grouping: "individual" | "couple" | "group";
} {
  if (register === "celebrating_many") {
    if (GROUP_NAMES[occasion]) {
      return {
        name: pick(GROUP_NAMES[occasion]),
        pronoun: "they",
        grouping: "group",
      };
    }
    const a = chance(0.5) ? pick(SHE) : pick(HE);
    let b = chance(0.5) ? pick(SHE) : pick(HE);
    while (b === a) b = pick(HE);
    return { name: `${a} & ${b}`, pronoun: "they", grouping: "couple" };
  }
  const she = chance(0.5);
  return {
    name: `${she ? pick(SHE) : pick(HE)} ${pick(LAST)}`,
    pronoun: she ? "she" : "he",
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
  return typeof c === "string" ? c : c[pronoun];
}

// ── candidates: every triple the table motivates ─────────────────────────
type Topic = {
  id: string;
  title: string;
  is_finite: boolean;
  favourites: { id: string; label: string }[];
};
type Charity = {
  id: string;
  name: string;
  description: string | null;
  activities: string | null;
  cause_family: CauseFamily | null;
};

type Candidate = {
  register: Register;
  occasion: string;
  topic: Topic;
  charity: Charity;
  count: number;
};

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
      for (const topic of topics) {
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
  const chosen: Candidate[] = [];
  const perCharity = new Map<string, number>();
  const perTopic = new Map<string, number>();
  const perOccasion = new Map<string, number>();
  const perRegister = new Map<Register, number>();
  const cap = (m: Map<string, number>, k: string, max: number) =>
    (m.get(k) ?? 0) < max;
  const bump = (m: Map<string, number>, k: string) =>
    m.set(k, (m.get(k) ?? 0) + 1);
  const wantThrees = Math.round(n * THREES);
  const registerQuota = (r: Register) =>
    REGISTERS.length ? n : Math.ceil(n * REGISTER_SHARE[r]);

  const pool = shuffle(candidates);
  // Triads first (they are scarcer), then twos, each pass honouring caps.
  for (const wantCount of [3, 2]) {
    const target = wantCount === 3 ? wantThrees : n;
    for (const c of pool) {
      if (chosen.length >= target) break;
      const isTriad = c.count === 3;
      if (wantCount === 3 && !isTriad) continue;
      if (
        wantCount === 2 &&
        isTriad &&
        chosen.filter((x) => x.count === 3).length >= wantThrees
      )
        continue;
      if (!cap(perCharity, c.charity.id, 3)) continue;
      if (!cap(perTopic, c.topic.id, 2)) continue;
      if (!cap(perOccasion, c.occasion, 3)) continue;
      if ((perRegister.get(c.register) ?? 0) >= registerQuota(c.register))
        continue;
      chosen.push(c);
      bump(perCharity, c.charity.id);
      bump(perTopic, c.topic.id);
      bump(perOccasion, c.occasion);
      perRegister.set(c.register, (perRegister.get(c.register) ?? 0) + 1);
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
      .select("id, title, is_finite, favourites(id, label)")
      .eq("is_active", true),
    supabase
      .from("charities")
      .select("id, name, description, activities, cause_family")
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

  const candidates = enumerate(topics, charities);
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
    const openingLine = spec ? pick(spec.openingLines) : null;
    const context = spec
      ? resolveContext(pick(spec.contexts), who?.pronoun ?? "they")
      : null;

    // Item set follows the item-source rule (lib/poll-items): a finite
    // topic's items are its closed set; an infinite topic gets a curated
    // subset, which must include whatever the note ends up naming.
    const items = c.topic.is_finite
      ? c.topic.favourites
      : shuffle(c.topic.favourites).slice(
          0,
          Math.min(between(8, 14), c.topic.favourites.length),
        );

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
      },
      pronoun: who?.pronoun,
      grouping: who?.grouping,
      displayName: who?.name ?? null,
    };

    // The judge loop: generate, check P1 by lookup and A1/P2 by the
    // judge, retry up to MAX_ATTEMPTS; the best attempt wins if none
    // passes, and the manifest says so.
    let best: {
      story: Awaited<ReturnType<typeof generateStory>>;
      item: { id: string; label: string } | null;
      verdict: string;
      score: number;
    } | null = null;
    let attempts = 0;
    for (; attempts < MAX_ATTEMPTS; attempts++) {
      let story;
      try {
        story = await generateStory(input, STORY_MODEL);
      } catch (err) {
        console.error(
          `  ✗ ${who?.name ?? c.charity.name}: generate failed — ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }
      const item = namedItem(story.note, items);
      // The event check is a lookup (cause register only); the judge
      // answers the two model questions.
      const event = isCause ? aboutNamesEvent(story.about, c.occasion) : true;
      const verdict = await judgeStory(story, input, story.edges, JUDGE_MODEL);
      const score =
        (item && event ? 1 : 0) + (verdict.a1 ? 1 : 0) + (verdict.p2 ? 1 : 0);
      const label = `P1 ${item ? "✓" : "✗"}${isCause ? ` · event ${event ? "✓" : "✗"}` : ""} · A1 ${verdict.a1 ? "✓" : "✗"} · P2 ${verdict.p2 ? "✓" : "✗"}${verdict.reason ? ` — ${verdict.reason}` : ""}`;
      if (!best || score > best.score)
        best = { story, item, verdict: label, score };
      if (score === 3) break;
    }
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
    const open = chance(0.6);
    const closesAt = open
      ? now + between(7, 40) * DAY
      : now - between(3, 60) * DAY;
    const createdAt = closesAt - between(14, 45) * DAY;
    const favpollId = randomUUID();

    let protagonistId: string | null = null;
    if (who) {
      const { data, error } = await supabase
        .from("protagonists")
        .insert({
          name: who.name,
          about: story.about,
          context,
          pronoun: who.pronoun,
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

(WIPE ? wipe() : seed()).catch((e) => {
  console.error(e);
  process.exit(1);
});
