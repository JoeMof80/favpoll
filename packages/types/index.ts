export type User = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/** The cause families of references/favpoll-pairing-table §2 (2026-09-24).
 *  A charity's family is what gives a favpoll its charity→topic and
 *  occasion↔charity edges. Order = the dropdown order. */
export const CAUSE_FAMILIES = [
  "animals",
  "children",
  "older_people",
  "end_of_life",
  "health_condition",
  "mental_health",
  "homelessness",
  "food_poverty",
  "environment_heritage",
  "sea_rescue",
  "international",
  "entertainment",
] as const;
export type SignatureEvent = {
  name: string;
  kind: string;
  when: string | null;
  occasionType: string | null;
  topic: string | null;
  sourceUrl: string;
};

export type CauseFamily = (typeof CAUSE_FAMILIES)[number];

export const CAUSE_FAMILY_LABELS: Record<CauseFamily, string> = {
  animals: "Animals",
  children: "Children",
  older_people: "Older people",
  end_of_life: "End of life · dementia",
  health_condition: "A health condition",
  mental_health: "Mental health",
  homelessness: "Homelessness",
  food_poverty: "Food poverty",
  environment_heritage: "Environment · heritage",
  sea_rescue: "Sea · rescue",
  international: "International",
  entertainment: "Entertainment-led",
};

export type Charity = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  registered_number: string | null;
  /** Consent gate (2026-09-07): has the charity AGREED to appear and
   *  receive pledges? Enforcement rides CHARITY_CONSENT_POSTURE. */
  consent_status?: "pending" | "approved" | "declined";
  consent_contacted_at?: string | null;
  consent_decided_at?: string | null;
  /** THE REGISTER'S OWN WORDS ARE NOT HERE (step 5 of
   *  references/charity-profiles-2026-09-27.md). Contact, activities,
   *  classification, objects, areas and the grant-making flag were copies
   *  of `register_charities`, kept on the account because the account was
   *  once the only table. They are read from the mirror now
   *  (`mirrorContactAndPurpose`, `purposeFromMirror`), and every
   *  SUGGESTION — the perfect topic, its subset and reason, the cause
   *  family the model guessed, the events read from the site — lives on
   *  `charity_profiles`, keyed by the registered number.
   *
   *  What stays below is what the account AGREED to. Two fields are
   *  overlaid onto this type by the readers that still display them
   *  (admin's queue and table, the wizard's shelf): `registered_email`,
   *  `registered_website`, `activities` and `cause_family_suggested` are
   *  declared as optional so those overlays type, and they are never
   *  columns on `charities` again. */
  registered_email?: string | null;
  registered_website?: string | null;
  activities?: string | null;
  cause_family_suggested?: CauseFamily | null;
  /** On the public catalogue — /charities/[id] 404s when false
   *  (register-added charities arrive inactive, pre-consent). */
  is_active?: boolean;
  /** Admin-curated impact line shown at pledge time; null = none */
  impact_statement?: string | null;
  /** Charity Commission check, written by the admin app; null = never checked */
  verification_status?:
    | "verified"
    | "name_mismatch"
    | "not_found"
    | "removed"
    | "error"
    | null;
  verified_name?: string | null;
  verified_at?: string | null;
  /** The charity's CONFIRMED perfect topic (2026-09-26) — the one the
   *  generator and the wizard read. The model's suggestion and its reason
   *  are the profile's. */
  perfect_topic_id?: string | null;
  /** A SUBSET of the perfect topic's items, when the cause pulls for
   *  a narrower list (a city farm's Farm animal). Must belong to
   *  perfect_topic_id (a trigger enforces it). */
  perfect_subset_id?: string | null;
  /** Admin-CONFIRMED cause family — the only one the generator reads.
   *  null = no cause of its own (a grant-maker), which is a valid answer. */
  cause_family?: CauseFamily | null;
  created_at: string;
};

export type Topic = {
  id: string;
  title: string;
  description: string | null;
  is_finite: boolean;
  is_active: boolean;
  /** In the picker. False once promoted to a subset (favpoll-topic-rules
   *  §1, ruling 8); the favpoll that made it is untouched. */
  is_listed?: boolean;
  created_by: string | null;
  created_at: string;
};

/** A SUBSET (favpoll-topic-rules §1): a named subset of ONE topic's
 *  items, for a cause or an occasion that pulls for it — Farm animal on
 *  Animal. Its own object, shared by whoever points at it; admin-made;
 *  no items, copy or rules of its own. Members live in
 *  `topic_subset_items`, a join to the parent's favourites. */
export type TopicSubset = {
  id: string;
  topic_id: string;
  /** Topic grammar: singular, basic level, reads after "Favourite". */
  title: string;
  /** Delisted from the picker; never deleted (favpolls point at it). */
  is_active: boolean;
  /** Proposed by the scan or the suggester, approved or rejected by an
   *  admin. Only approved subsets reach the picker. */
  status: "proposed" | "approved" | "rejected";
  /** Where it came from: the catalogue scan, the charity suggester, a
   *  promoted homemade topic, or an admin by hand. */
  source: "scan" | "suggester" | "homemade" | "admin";
  /** One sentence for the admin: why this cut is one people ask for. */
  reason: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Favourite = {
  id: string;
  topic_id: string;
  label: string;
  all_time_pledged: number;
  all_time_count: number;
  is_canonical: boolean;
  source: "seed" | "organiser" | "guest";
  review_status?: "pending_review" | "accepted" | "rejected";
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  markets: string[];
  favpoll_count: number;
  total_pledge_count: number;
  created_at: string;
  display_order?: number | null;
  // Present when fetched via favpoll_poll_favourites (infinite topics in favpoll context)
  favpoll_poll_item_id?: string;
  // Visibility state per favpoll poll — set when fetched via favpoll_poll_favourites join
  is_hidden?: boolean;
  is_guest_added?: boolean;
};

export type Protagonist = {
  id: string;
  name: string;
  context: string | null;
  about: string | null;
  photo_url: string | null;
  pronoun: Pronoun | null;
  created_by: string | null;
  created_at: string;
};

export type Register =
  | "remembering"
  | "celebrating_one"
  | "celebrating_many"
  | "cause"
  | "neutral";

export type FavpollCategory = "celebration" | "memorial" | "fundraiser";
export type FavpollGrouping = "individual" | "couple" | "group";
export type FavpollSubject = "someone" | "cause";
/** "i" = the organiser IS the protagonist and writes in the first person
 *  (founder, 2026-09-24: "isn't it just another pronoun?"); a couple or
 *  group in the first person says "we" through its grouping. */
export type Pronoun = "he" | "she" | "they" | "i";

export type Favpoll = {
  id: string;
  protagonist_id: string | null;
  subject: FavpollSubject;
  cause_label: string | null;
  occasion_type: string | null;
  opening_line: string | null;
  market: string;
  created_by: string;
  closes_at: string;
  original_closes_at: string | null;
  hard_close_at: string | null;
  extension_count: number;
  closed_at: string | null;
  /** Picks suspended from this moment (founder, 2026-10-02): the pick
   *  step disappears and every pledge goes to the shared pot until the
   *  close date. Null = open; set = suspended (server-stamped). */
  picks_suspended_at?: string | null;
  /** The first suspension's moment, never cleared: the reveal is out and
   *  stays out (lib/picks-suspended). */
  picks_first_suspended_at?: string | null;
  total_raised: number;
  /** Optional pledge goal in pounds (same unit as total_raised); null = no goal. */
  goal_amount?: number | null;
  is_private: boolean;
  /** Organiser setting: may guests add a favourite that is not listed?
   *  Topic.is_finite still overrides — a finite topic can never be added to. */
  allow_guest_items?: boolean;
  is_plural: boolean | null;
  is_exemplar?: boolean;
  is_listed?: boolean;
  category?: FavpollCategory | null;
  grouping?: FavpollGrouping;
  description: string | null;
  /** Cause favpolls only — person favpolls keep these on the protagonist. */
  photo_url?: string | null;
  context?: string | null;
  created_at: string;
};

export type FavpollPoll = {
  id: string;
  favpoll_id: string;
  /** The parent topic, always — standings and the record read this. */
  topic_id: string;
  /** The subset beside it, when one was picked: the card says its name,
   *  the list is its items (favpoll-topic-rules §1). */
  subset_id?: string | null;
  personal_note: string | null;
  created_at: string;
};

export type Pledge = {
  id: string;
  favpoll_poll_id: string;
  clerk_user_id: string | null;
  guest_email: string | null;
  guest_token: string | null;
  pot_allocation_id: string | null;
  total_amount: number;
  fee: number;
  withdrawn_at: string | null;
  created_at: string;
};

export type PledgeAllocation = {
  id: string;
  pledge_id: string;
  favourite_id: string;
  amount: number;
};

export type FavpollPot = {
  id: string;
  favpoll_id: string;
  created_by: string;
  total_deposited: number;
  total_allocated: number;
  created_at: string;
};

export type PotAllocation = {
  id: string;
  pot_id: string;
  allocated_to: string;
  amount: number;
  created_at: string;
};

export type FavpollInvite = {
  id: string;
  favpoll_id: string;
  email: string;
  created_at: string;
};

export type FavpollPollFavourite = {
  id: string;
  favpoll_poll_id: string;
  favourite_id: string;
  is_guest_added: boolean;
  added_by: string | null;
  is_hidden: boolean;
  hidden_at: string | null;
  hidden_by: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  label: string;
  description: string | null;
  created_at: string;
};

export type TopicCategory = {
  topic_id: string;
  category_id: string;
};

// Joined types for UI
export type FavpollWithDetails = Favpoll & {
  protagonists: Protagonist | null;
  favpoll_charities: { charities: Charity }[];
};

export type FavpollPollWithItems = FavpollPoll & {
  topics: Topic & { favourites: Favourite[] };
};

export type PledgeWithAllocations = Pledge & {
  pledge_allocations: PledgeAllocation[];
};

// Shared types used by EventFormV2 and server actions
export type TopicPlaceholders = Record<
  string,
  {
    about?: string;
    note: string;
    pronouns?: "she" | "he" | "they";
    group?: "pair" | "set";
  }
>;

export type TopicWithMeta = Topic & {
  favourites: Favourite[];
  category_ids: string[];
  placeholders?: TopicPlaceholders;
  /** Set when this picker entry is a SUBSET, not a topic (favpoll-topic-
   *  rules §1): `id` is the subset's id, `title` its name, `favourites`
   *  its members; openness, categories and placeholders are the parent's.
   *  The favpoll stores the parent as its topic and the subset beside it. */
  subset_of?: { topic_id: string; title: string };
};

/** A subset's own record (ruling 4, revised 2026-09-28): picks from its
 *  own favpolls, kept apart from the parent's whole-list record. A
 *  subset's full standing adds the parent's whole-list picks of the same
 *  member (down, never up). */
export type TopicSubsetTotal = {
  subset_id: string;
  favourite_id: string;
  all_time_pledged: number;
  all_time_count: number;
};

export type GeneratedDraft = {
  id: string;
  cache_key: string;
  register: string | null;
  topic_id: string | null;
  primary_charity_id: string | null;
  subject: string | null;
  about: string | null;
  note: string | null;
  model: string | null;
  status: "generated" | "curated" | "rejected";
  created_at: string;
};

export type CanvasPollInput = {
  id?: string;
  topicId: string | null;
  /** A SUBSET of the topic (favpoll-topic-rules §1), stored beside it. */
  subsetId?: string | null;
  topicIsCustom: boolean;
  customTopicTitle: string;
  customTopicItems: string[];
  note: string | null;
  infiniteItems: { canonicalItemIds: string[]; customLabels: string[] } | null;
};

export type CanvasSubmitData = {
  protagonistName: string;
  protagonistAbout?: string | null;
  dateLabel: string | null;
  photoUrl?: string | null;
  category: FavpollCategory | null;
  grouping: FavpollGrouping;
  subject: FavpollSubject;
  causeLabel: string | null;
  pronoun?: Pronoun | null;
  openingLine: string | null;
  description: string | null;
  charityIds: string[];
  closesAt: string;
  isPrivate: boolean;
  isListed: boolean;
  allowGuestItems: boolean;
  showGuestAmounts?: boolean;
  potAmount: number | null;
  /** Optional pledge goal in pounds; null = no goal. */
  goalAmount?: number | null;
  poll: CanvasPollInput;
};

// ─── The charity number as a key ─────────────────────────────────────────────
// `charity_profiles` is keyed by the registered number as the register
// writes it, and from step 5 of the charity-profiles note that key is the
// ONLY link between an account and the register's own words. Both apps and
// the scripts need the same answer to "is this a number, and what is its
// canonical form", so it lives here rather than in four regexes.
//
// Six to ten digits, not the six or seven everyone assumes: the register
// holds 19262026 (a CIO registered in March 2026). A linked charity's
// "-1" suffix is KEPT — it is a different charity, and stripping it would
// silently point at the parent.

export const CHARITY_NUMBER_KEY =
  /^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$/;

/** The profile key for a registered number, or null when it is not one
 *  (a typo, or a regulator we do not mirror). Trimmed and upper-cased;
 *  nothing else is touched. */
export function profileKey(
  registeredNumber: string | null | undefined,
): string | null {
  if (!registeredNumber) return null;
  const key = registeredNumber.trim().toUpperCase();
  return CHARITY_NUMBER_KEY.test(key) ? key : null;
}
