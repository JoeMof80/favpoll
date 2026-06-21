/**
 * scripts/seed-favpolls.ts
 * ---------------------------------------------------------------------------
 * Generates dozens of realistic favpolls (with protagonists, polls,
 * favourites, pledges, allocations, charities and shared funds) so favpoll
 * can be observed under load and with a populated UI.
 *
 * This is SEPARATE from scripts/seed.ts on purpose:
 *   - seed.ts seeds reference data (charities, categories, topics, favourites).
 *   - seed-favpolls.ts seeds *activity* on top of that reference data.
 *
 * Run order:  pnpm seed   (reference data)   →   this script (favpolls).
 *
 * Run (staging) — same pattern as seed.ts in PROJECT.md:
 *   cd apps/web && \
 *     NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     pnpm tsx ../../scripts/seed-favpolls.ts
 *
 * SAFETY: refuses to run unless the target looks like staging, or you set
 * ALLOW_FAVPOLL_SEED=1 explicitly. Fake favpolls in production would be bad.
 *
 * IDEMPOTENT / ADDITIVE: every row it creates is owned by SEED_USER_ID. On
 * each run it tops the favpoll count up to TARGET_FAVPOLLS — it never deletes.
 * Re-running with the same target is a no-op; raising the target adds more.
 *
 * To remove seed data later (manual, scoped to the seed user):
 *   delete from favpolls where created_by = 'user_seed_scale';
 *   (cascades to favpoll_polls, favpoll_poll_favourites, pledges, allocations, pots…)
 *   delete from protagonists where created_by = 'user_seed_scale';
 *
 * ASSUMPTIONS / CAVEATS (read these):
 *   - The record (favourites.all_time_pledged / all_time_count) is maintained
 *     by the Postgres trigger on pledge_allocations. This script therefore does
 *     NOT write those columns — inserting allocations updates them. Running on a
 *     shared staging DB WILL move the global record numbers. That is the point
 *     of a scale test, but be aware of it.
 *   - event_count and total_pledge_count on favourites are left untouched. If
 *     they are not trigger-maintained, the inclusion threshold (3 favpolls) and
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

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ───────────────────────── Config — tweak freely ──────────────────────────

const SEED_USER_ID = "user_seed_scale";
const TARGET_FAVPOLLS = 40; // "dozens"

const CLOSED_FRACTION = 0.4; // share of favpolls already closed
const PRIVATE_FRACTION = 0.1; // share marked is_private
const SHARED_FUND_FRACTION = 0.25; // share with a non-zero shared fund
const AUTH_PLEDGE_FRACTION = 0.2; // share of pledges from signed-in users
const WITHDRAWN_FRACTION = 0.0; // see CAVEATS — keep 0 to protect the record
const GUEST_ITEM_EVENT_FRACTION = 0.15; // share of infinite-topic favpolls that
//                                        get one guest-suggested item (feeds
//                                        the admin contributions queue)

const FEE_RATE = 0.05; // 5% platform fee (brand fact)

// A small pool of signed-in "users" so authed pledges and my-favpolls have data.
const SEED_USERS = Array.from({ length: 8 }, (_, i) => ({
  id: `user_seed_${String(i + 1).padStart(3, "0")}`,
  email: `seed.guest${i + 1}@example.test`,
  display_name: `Seed Guest ${i + 1}`,
}));

// Topics that recur more often, so their items accumulate across many favpolls
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
]);

// Favpoll type mix — weighted {register, occasionType} pairs.
type FavpollType = { register: string; occasionType: string | null };
const FAVPOLL_TYPE_WEIGHTS: Array<{ et: FavpollType; weight: number }> = [
  { et: { register: "remembering", occasionType: "Memorial" }, weight: 10 },
  { et: { register: "remembering", occasionType: "Tribute" }, weight: 4 },
  { et: { register: "celebrating_one", occasionType: "Birthday" }, weight: 12 },
  {
    et: { register: "celebrating_one", occasionType: "Retirement" },
    weight: 8,
  },
  { et: { register: "celebrating_many", occasionType: "Wedding" }, weight: 8 },
  {
    et: { register: "celebrating_many", occasionType: "Engagement" },
    weight: 5,
  },
  {
    et: { register: "celebrating_many", occasionType: "Anniversary" },
    weight: 6,
  },
  {
    et: { register: "celebrating_one", occasionType: "Leaving do" },
    weight: 6,
  },
  {
    et: { register: "celebrating_one", occasionType: "Graduation" },
    weight: 6,
  },
  {
    et: { register: "celebrating_one", occasionType: "Christening" },
    weight: 4,
  },
  {
    et: { register: "celebrating_one", occasionType: "Achievement" },
    weight: 5,
  },
  { et: { register: "celebrating_one", occasionType: "Recovery" }, weight: 4 },
  { et: { register: "celebrating_one", occasionType: "Award" }, weight: 3 },
  { et: { register: "celebrating_one", occasionType: "Promotion" }, weight: 4 },
  { et: { register: "neutral", occasionType: null }, weight: 4 },
  { et: { register: "neutral", occasionType: null }, weight: 3 },
];

function pickFavpollType(): FavpollType {
  const total = FAVPOLL_TYPE_WEIGHTS.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const { et, weight } of FAVPOLL_TYPE_WEIGHTS) {
    r -= weight;
    if (r <= 0) return et;
  }
  return FAVPOLL_TYPE_WEIGHTS[0].et;
}

// Default poll closing period (days) by register / occasion_type.
function closingDays(register: string, occasionType: string | null): number {
  if (
    occasionType === "Tribute" ||
    occasionType === "Retirement" ||
    occasionType === "Anniversary"
  )
    return 21;
  if (register === "remembering") return 30;
  if (register === "cause") return 21;
  return 14;
}

// Field limits (from PROJECT.md "Field character limits").
const LIMITS = { name: 40, context: 40, about: 300, reveal: 280 };

// Protagonist name pool — individuals, couples, and groups, varied length.
const NAME_POOL = [
  "Gretchen Hughes",
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
  "Elizabeth Vance",
  "Dev Sharma",
  "Bridget O'Connell",
  "Yusuf",
  "The Thursday Quiz Team",
  "Nana Rose",
  "Olu Adeyemi",
  "Frances Whittaker",
];

// Context strings keyed loosely by occasion_type (kept <= 40 chars).
function contextFor(occasionType: string | null): string | null {
  const year = 1932 + randInt(0, 60);
  switch (occasionType) {
    case "Memorial":
    case "Tribute":
      return `${year} – 2025`;
    case "Birthday":
      return `Turning ${pick([30, 40, 50, 60, 70, 80, 90])}`;
    case "Retirement":
      return `After ${randInt(20, 40)} years`;
    case "Wedding":
      return "On their wedding day";
    case "Engagement":
      return "Newly engaged";
    case "Anniversary":
      return `${randInt(10, 60)} years together`;
    case "Leaving do":
      return "Moving on";
    case "Graduation":
      return "Class of 2025";
    case "Christening":
      return "Newly arrived";
    case "Achievement":
      return "A first marathon";
    case "Recovery":
      return "On the mend";
    case "Award":
      return "Award winner";
    case "Promotion":
      return "Newly promoted";
    default:
      return null;
  }
}

const SOLEMN_REGISTERS = new Set(["remembering"]);

// Neutral about templates — never name a favourite (so they can't leak a
// reveal), coherent with the generated name, varied length for layout testing.
function aboutFor(name: string, register: string): string {
  const solemn = SOLEMN_REGISTERS.has(register);
  const short = solemn
    ? `${name} is remembered with great affection by everyone here.`
    : `${name} is being celebrated by the people who know them best.`;
  const medium = solemn
    ? `Family and friends are gathering to remember ${name}. Everyone in the room is carrying a story, and this is a quiet way to share a little of one.`
    : `Friends and family are gathering for ${name}. There is a lot to celebrate and plenty of opinions in the room — this is a chance to add yours.`;
  const long = solemn
    ? `Family, friends, and colleagues are gathering to remember ${name}. There are more stories than there is time to tell them, and everyone here has at least one. This is a small, shared way to mark what they meant to all of us — quietly, generously, together.`
    : `Friends, family, and colleagues are gathering to mark this occasion for ${name}. There are more stories than there is time to tell them, and everyone here has at least one. This is a chance to add something of your own to the collection — quietly, generously, together.`;
  return clamp(pick([short, medium, medium, long]), LIMITS.about);
}

// Extra candidate guest-suggested items for a few common infinite topics.
// Used only when a favpoll qualifies for a guest item; deduped against the
// existing canonical list before insert.
const GUEST_ITEM_CANDIDATES: Record<string, string[]> = {
  Film: [
    "The Wizard of Oz",
    "Notting Hill",
    "Chariots of Fire",
    "Billy Elliot",
  ],
  Song: [
    "Caledonia — Dougie MacLean",
    "Fields of Gold — Sting",
    "Three Little Birds — Bob Marley",
  ],
  "Comfort food": [
    "Sunday crumble",
    "Cheese toastie",
    "Macaroni cheese",
    "Sausage and mash",
  ],
  Hobby: ["Wild swimming", "Pottery", "Allotment", "Bell ringing"],
  Place: ["The allotment", "The lido", "The corner café"],
  Drink: ["Bovril", "Dandelion and burdock", "Builder's tea"],
  Biscuit: ["Nice biscuit", "Fig roll", "Party ring"],
};

// ───────────────────────────── Helpers ────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function chance(p: number): boolean {
  return Math.random() < p;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function clamp(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86400000).toISOString();
}
function weightedPickKey(weights: Record<string, number>): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [k, w] of Object.entries(weights)) {
    if ((r -= w) <= 0) return k;
  }
  return Object.keys(weights)[0];
}

// Realistic, long-tailed pledge count per favpoll: most modest, a few busy.
function pledgeCountForFavpoll(): number {
  const roll = Math.random();
  if (roll < 0.15) return randInt(0, 3); // sparse / nearly-empty polls
  if (roll < 0.75) return randInt(4, 30); // typical
  if (roll < 0.95) return randInt(30, 70); // busy
  return randInt(70, 120); // a handful of stress cases
}

// Pledge amounts in pence, clustered around common round figures.
function pledgeAmountPence(): number {
  const pounds = pick([
    2, 5, 5, 10, 10, 10, 15, 20, 20, 25, 30, 50, 50, 75, 100, 100, 250,
  ]);
  // small jitter on some so totals aren't all round
  const jitter = chance(0.2) ? randInt(0, 99) : 0;
  return pounds * 100 + jitter;
}

// Split a pence total across `parts`, each >= 1 penny, summing exactly.
function splitPence(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  const out = Array.from({ length: parts }, () => base);
  for (let i = 0; i < remainder; i++) out[i] += 1;
  return shuffle(out);
}
const toPounds = (pence: number) => Math.round(pence) / 100;

// ───────────────────────────── Seed types ─────────────────────────────────

type Topic = {
  id: string;
  title: string;
  is_finite: boolean;
  placeholders: Record<string, { about?: string; reveal?: string }> | null;
};
type Favourite = { id: string; topic_id: string; label: string };

// ───────────────────────────── Main flow ──────────────────────────────────

async function ensureSeedUsers() {
  const rows = [
    {
      id: SEED_USER_ID,
      email: "scale.organiser@example.test",
      display_name: "Scale Test Organiser",
    },
    ...SEED_USERS,
  ];
  for (const row of rows) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", row.id)
      .maybeSingle();
    if (existing) continue;
    const { error } = await supabase.from("users").insert(row);
    if (error) console.error(`  ✗ user ${row.id}:`, error.message);
  }
}

async function loadReferenceData() {
  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, is_finite, placeholders")
    .eq("is_active", true);

  // PostgREST caps a single select at 1000 rows; page through favourites
  // explicitly since the table now holds several thousand rows.
  const items: Favourite[] = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data: page } = await supabase
      .from("favourites")
      .select("id, topic_id, label")
      .eq("is_canonical", true)
      .range(offset, offset + PAGE - 1);
    if (!page || page.length === 0) break;
    items.push(...(page as Favourite[]));
    if (page.length < PAGE) break;
  }

  const { data: charities } = await supabase
    .from("charities")
    .select("id")
    .eq("is_active", true);

  return {
    topics: (topics ?? []) as Topic[],
    items,
    charityIds: (charities ?? []).map((c) => c.id as string),
  };
}

async function createOneFavpoll(
  topics: Topic[],
  itemsByTopic: Map<string, Favourite[]>,
  charityIds: string[],
) {
  const { register, occasionType } = pickFavpollType();

  // Pick a topic, weighting the popular core so items recur across favpolls.
  const weightedTopics = topics.flatMap((t) =>
    Array(POPULAR_TOPICS.has(t.title) ? 4 : 1).fill(t),
  );
  const topic = pick(weightedTopics);
  const allItems = itemsByTopic.get(topic.id) ?? [];
  if (allItems.length === 0) return null; // topic has no items; skip

  const closed = chance(CLOSED_FRACTION);
  const closing = closingDays(register, occasionType);

  let createdAt: string;
  let closesAt: string;
  let closedAt: string | null = null;
  let extensionCount = 0;
  // null unless the favpoll has actually been extended — so the app can detect
  // extended favpolls via `original_closes_at IS NOT NULL` if it does so.
  let originalClosesAt: string | null = null;

  if (closed) {
    const created = -(closing + randInt(5, 90));
    createdAt = daysFromNow(created);
    closesAt = daysFromNow(created + closing);
    closedAt = closesAt;
  } else {
    const createdAgo = randInt(1, 40);
    createdAt = daysFromNow(-createdAgo);
    closesAt = daysFromNow(randInt(2, 28));
    extensionCount = chance(0.15) ? 1 : chance(0.05) ? 2 : 0;
    if (extensionCount > 0) {
      originalClosesAt = new Date(
        new Date(closesAt).getTime() - extensionCount * 7 * 86400000,
      ).toISOString();
    }
  }
  const hardCloseAt = new Date(
    new Date(createdAt).getTime() + 90 * 86400000,
  ).toISOString();

  const name = clamp(pick(NAME_POOL), LIMITS.name);

  // 1) protagonist
  const { data: protagonist, error: pErr } = await supabase
    .from("protagonists")
    .insert({
      name,
      context: contextFor(occasionType),
      about: aboutFor(name, register),
      created_by: SEED_USER_ID,
    })
    .select("id")
    .single();
  if (pErr || !protagonist) {
    console.error("  ✗ protagonist:", pErr?.message);
    return null;
  }

  // 2) favpoll
  const { data: favpoll, error: eErr } = await supabase
    .from("favpolls")
    .insert({
      protagonist_id: protagonist.id,
      occasion_type: occasionType,
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
    .single();
  if (eErr || !favpoll) {
    console.error("  ✗ favpoll:", eErr?.message);
    return null;
  }

  // 3) shared fund (mandatory — every favpoll gets one, seeded at 0)
  const fund = chance(SHARED_FUND_FRACTION) ? pick([20, 50, 100, 200]) : 0;
  await supabase.from("favpoll_pots").insert({
    favpoll_id: favpoll.id,
    created_by: SEED_USER_ID,
    total_deposited: fund,
    total_allocated: 0,
  });

  // 4) charities (1–3, equal split, max 3)
  const chosenCharities = shuffle(charityIds).slice(0, randInt(1, 3));
  await supabase.from("favpoll_charities").insert(
    chosenCharities.map((charity_id, i) => ({
      favpoll_id: favpoll.id,
      charity_id,
      display_order: i,
    })),
  );

  // 5) favpoll poll (one per favpoll; reveal from placeholder copy; no framing)
  const reveal =
    (occasionType && topic.placeholders?.[occasionType]?.reveal) ??
    topic.placeholders?.["default"]?.reveal ??
    null;
  const { data: poll, error: pollErr } = await supabase
    .from("favpoll_polls")
    .insert({
      favpoll_id: favpoll.id,
      topic_id: topic.id,
      personal_reveal: reveal ? clamp(reveal, LIMITS.reveal) : null,
    })
    .select("id")
    .single();
  if (pollErr || !poll) {
    console.error("  ✗ favpoll_poll:", pollErr?.message);
    return null;
  }

  // 6) poll favourites — finite: all; infinite: a random subset
  let pollItems: Favourite[];
  if (topic.is_finite) {
    pollItems = allItems;
  } else {
    const n = Math.min(allItems.length, randInt(6, 12));
    pollItems = shuffle(allItems).slice(0, n);
  }

  await supabase.from("favpoll_poll_favourites").insert(
    pollItems.map((it) => ({
      favpoll_poll_id: poll.id,
      favourite_id: it.id,
      is_guest_added: false,
    })),
  );

  // 6b) optional guest-suggested favourite (infinite topics only) → contributions
  if (
    !topic.is_finite &&
    chance(GUEST_ITEM_EVENT_FRACTION) &&
    GUEST_ITEM_CANDIDATES[topic.title]
  ) {
    const existingLabels = new Set(allItems.map((i) => i.label.toLowerCase()));
    const candidate = pick(GUEST_ITEM_CANDIDATES[topic.title]);
    if (!existingLabels.has(candidate.toLowerCase())) {
      const { data: newItem } = await supabase
        .from("favourites")
        .insert({
          topic_id: topic.id,
          label: candidate,
          is_canonical: false,
          source: "guest",
          markets: ["en-GB"],
          review_status: "pending_review",
        })
        .select("id, topic_id, label")
        .single();
      if (newItem) {
        await supabase.from("favpoll_poll_favourites").insert({
          favpoll_poll_id: poll.id,
          favourite_id: newItem.id,
          is_guest_added: true,
          added_by: pick(SEED_USERS).id,
        });
        pollItems.push(newItem as Favourite);
      }
    }
  }

  // 7) pledges + allocations
  const pledgeCount = pledgeCountForFavpoll();
  const upperBound = closedAt ? new Date(closedAt).getTime() : Date.now();
  const lowerBound = new Date(createdAt).getTime();

  const pledgeRows: Record<string, unknown>[] = [];
  const plannedAllocations: { itemId: string; amountPence: number }[][] = [];

  for (let i = 0; i < pledgeCount; i++) {
    const totalPence = pledgeAmountPence();
    const feePence = Math.round(totalPence * FEE_RATE);
    const at = new Date(
      lowerBound + Math.random() * (upperBound - lowerBound),
    ).toISOString();

    const parts = Math.min(randInt(1, 3), pollItems.length);
    const chosenItems = shuffle(pollItems).slice(0, parts);
    const splits = splitPence(totalPence, parts);

    const authed = chance(AUTH_PLEDGE_FRACTION);
    pledgeRows.push({
      favpoll_poll_id: poll.id,
      clerk_user_id: authed ? pick(SEED_USERS).id : null,
      guest_email: authed ? null : `pledger${randInt(1, 99999)}@example.test`,
      guest_token: authed ? null : crypto.randomUUID(),
      total_amount: toPounds(totalPence),
      fee: toPounds(feePence),
      withdrawn_at: chance(WITHDRAWN_FRACTION) ? at : null,
      created_at: at,
    });
    plannedAllocations.push(
      chosenItems.map((it, idx) => ({
        itemId: it.id,
        amountPence: splits[idx],
      })),
    );
  }

  let pledgedGrossPence = 0;
  if (pledgeRows.length > 0) {
    const { data: inserted, error: plErr } = await supabase
      .from("pledges")
      .insert(pledgeRows)
      .select("id");
    if (plErr || !inserted) {
      console.error("  ✗ pledges:", plErr?.message);
    } else {
      const allocationRows: Record<string, unknown>[] = [];
      inserted.forEach((p, idx) => {
        const withdrawn = pledgeRows[idx].withdrawn_at != null;
        for (const a of plannedAllocations[idx]) {
          allocationRows.push({
            pledge_id: p.id,
            favourite_id: a.itemId,
            amount: toPounds(a.amountPence),
          });
          if (!withdrawn) pledgedGrossPence += a.amountPence;
        }
      });
      // Insert allocations in chunks — the trigger fires per row, which is
      // part of what we're stress-testing.
      const CHUNK = 500;
      for (let i = 0; i < allocationRows.length; i += CHUNK) {
        const { error: aErr } = await supabase
          .from("pledge_allocations")
          .insert(allocationRows.slice(i, i + CHUNK));
        if (aErr) console.error("  ✗ allocations:", aErr.message);
      }
    }
  }

  // 8) closed favpolls record total_raised (gross). Open favpolls compute live.
  if (closedAt) {
    await supabase
      .from("favpolls")
      .update({ total_raised: toPounds(pledgedGrossPence) })
      .eq("id", favpoll.id);
  }

  return {
    occasion: occasionType ?? register,
    topic: topic.title,
    pledges: pledgeRows.length,
  };
}

async function seedFavpolls() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const STAGING_REF = "eotqyintgusvzidymumb"; // from PROJECT.md
  if (!url.includes(STAGING_REF) && process.env.ALLOW_FAVPOLL_SEED !== "1") {
    console.error(
      "Refusing to seed favpolls: target does not look like staging.\n" +
        "Set ALLOW_FAVPOLL_SEED=1 to override (do NOT do this against production).",
    );
    process.exit(1);
  }

  console.log("Seeding favpolls…\n");
  await ensureSeedUsers();

  const { topics, items, charityIds } = await loadReferenceData();
  if (topics.length === 0 || items.length === 0 || charityIds.length === 0) {
    console.error(
      "Reference data missing. Run `pnpm seed` first (topics, favourites, charities).",
    );
    process.exit(1);
  }

  const itemsByTopic = new Map<string, Favourite[]>();
  for (const it of items) {
    const arr = itemsByTopic.get(it.topic_id) ?? [];
    arr.push(it);
    itemsByTopic.set(it.topic_id, arr);
  }

  // Idempotent top-up: only create up to TARGET_FAVPOLLS for the seed user.
  const { count } = await supabase
    .from("favpolls")
    .select("id", { count: "exact", head: true })
    .eq("created_by", SEED_USER_ID);
  const existing = count ?? 0;
  const toCreate = Math.max(0, TARGET_FAVPOLLS - existing);

  console.log(
    `  ${existing} seed favpolls exist; creating ${toCreate} more.\n`,
  );

  let created = 0;
  let pledgeTotal = 0;
  for (let i = 0; i < toCreate; i++) {
    try {
      const result = await createOneFavpoll(topics, itemsByTopic, charityIds);
      if (result) {
        created++;
        pledgeTotal += result.pledges;
        console.log(
          `  ✓ [${created}/${toCreate}] ${result.occasion} · ${result.topic} · ${result.pledges} pledges`,
        );
      }
    } catch (err) {
      console.error(`  ✗ favpoll ${i + 1} failed:`, (err as Error).message);
    }
  }

  console.log(`\n${created} favpolls created, ${pledgeTotal} pledges total.`);

  // NOTE: favourites.event_count / total_pledge_count are intentionally not
  // written here. If the inclusion threshold (3 favpolls) and any UI reading them
  // are NOT trigger-maintained, add a backfill that recomputes from
  // favpoll_poll_favourites / pledge_allocations once you've confirmed the intended
  // source of truth. Left out deliberately to avoid corrupting those columns.

  console.log("\nSeed-favpolls complete.");
}

seedFavpolls().catch((err) => {
  console.error("Seed-favpolls failed:", err);
  process.exit(1);
});
