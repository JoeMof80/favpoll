"use server";

import {
  CAUSE_FAMILIES,
  type CauseFamily,
  type SignatureEvent,
} from "@favpoll/types";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  type RegisterSearchResult,
  type VerificationStatus,
} from "@/lib/charity-commission";
import {
  contactFromMirror,
  purposeFromMirror,
  searchRegisterMirrorFirst,
  verifyOnMirror,
} from "@/lib/register-mirror";

/** Live search of the Register of Charities for the admin typeahead. */
export async function searchCharityRegister(
  query: string,
): Promise<RegisterSearchResult[]> {
  // The register mirror first (2026-09-27), the API for what it lacks.
  return (await searchRegisterMirrorFirst(query)).results;
}

const VALID_MARKETS = ["en-GB"];

export type Charity = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  impact_statement: string | null;
  registered_number: string | null;
  verification_status: VerificationStatus | null;
  verified_name: string | null;
  verified_at: string | null;
  consent_status: "pending" | "approved" | "declined" | null;
  consent_contacted_at: string | null;
  consent_decided_at: string | null;
  is_active: boolean;
  market: string;
  created_at: string;
  /** Cause family (references/favpoll-pairing-table §2): the confirmed
   *  value the generator reads, the model's suggestion, and the register
   *  text it came from. Selected by getCharities. */
  cause_family?: CauseFamily | null;
  cause_family_suggested?: CauseFamily | null;
  activities?: string | null;
};

/** Charity Commission fields for an insert/update, from a (name, number) pair. */
async function verificationFields(
  name: string,
  registeredNumber: string | null,
): Promise<{
  verification_status: VerificationStatus | null;
  verified_name: string | null;
  verified_at: string | null;
}> {
  if (!registeredNumber) {
    return {
      verification_status: null,
      verified_name: null,
      verified_at: null,
    };
  }
  const result = await verifyOnMirror(registeredNumber, name);
  return {
    verification_status: result.status,
    verified_name: result.registeredName,
    verified_at: new Date().toISOString(),
  };
}

export async function getCharities(
  market?: string,
): Promise<{ data: Charity[] | null; error: string | null }> {
  const supabase = createAdminClient();

  let query = supabase
    .from("charities")
    .select(
      "id, name, description, logo_url, impact_statement, registered_number, verification_status, verified_name, verified_at, consent_status, consent_decided_at, consent_contacted_at, is_active, market, created_at, cause_family",
    )
    .order("name", { ascending: true });

  if (market) {
    query = query.eq("market", market);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };

  // The suggested family comes from the PROFILE (step 2) and the
  // register's own words from the MIRROR (step 4); the account row keeps
  // what it agreed to.
  const rows = (data ?? []) as Charity[];
  const numbers = rows.map((c) => c.registered_number);
  const [suggestions, register] = await Promise.all([
    suggestionsByKey(numbers),
    registerByKey(numbers),
  ]);
  return {
    data: rows.map((c) => {
      const key = profileKey(c.registered_number);
      return {
        ...c,
        cause_family_suggested: key
          ? (suggestions.get(key)?.cause_family_suggested ?? null)
          : null,
        activities:
          register.get((c.registered_number ?? "").replace(/\D/g, ""))
            ?.activities ?? null,
      };
    }),
    error: null,
  };
}

/** The form sends the family as a string ("" = no cause of its own). */
function parseCauseFamily(
  value: string | null | undefined,
): { ok: true; family: CauseFamily | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "")
    return { ok: true, family: null };
  if ((CAUSE_FAMILIES as readonly string[]).includes(value))
    return { ok: true, family: value as CauseFamily };
  return { ok: false, error: `Unknown cause family: ${value}` };
}

export async function createCharity(input: {
  name: string;
  description?: string;
  impact_statement?: string;
  registered_number?: string;
  logo_url?: string;
  market: string;
  cause_family?: string;
}): Promise<{ error: string | null }> {
  if (!input.name.trim()) return { error: "Name is required." };
  const family = parseCauseFamily(input.cause_family);
  if (!family.ok) return { error: family.error };
  if (!VALID_MARKETS.includes(input.market)) {
    return {
      error: `Invalid market. Must be one of: ${VALID_MARKETS.join(", ")}.`,
    };
  }

  const supabase = createAdminClient();

  const name = input.name.trim();
  const registeredNumber = input.registered_number?.trim() || null;

  const [contact, purpose] = registeredNumber
    ? await Promise.all([
        contactFromMirror(registeredNumber),
        purposeFromMirror(registeredNumber),
      ])
    : [
        { email: null, website: null },
        {
          activities: null,
          classification: null,
          objects: null,
          areas: null,
          grantMaking: null,
        },
      ];

  const logoUrl = input.logo_url?.trim() || null;
  const { error } = await supabase.from("charities").insert({
    name,
    description: input.description?.trim() || null,
    impact_statement: input.impact_statement?.trim() || null,
    registered_number: registeredNumber,
    // The register's own words are NOT copied here any more (step 4): the
    // number is the link, and contact and purpose are read from the mirror
    // wherever they are shown. Step 5 drops the columns.
    // Hand-entered by an admin, so this IS the confirmed value.
    cause_family: family.family,
    logo_url: logoUrl,
    market: input.market,
    is_active: true,
    ...(await verificationFields(name, registeredNumber)),
  });

  if (error) return { error: error.message };

  // The same guard as updateCharity: an admin may well be adding a charity
  // a wave has already prepared a profile for, scraped image and all.
  if (logoUrl && registeredNumber) {
    await dropScrapedImageByNumber(registeredNumber);
  }

  revalidatePath("/charities");
  return { error: null };
}

export async function updateCharity(
  id: string,
  data: {
    name?: string;
    description?: string;
    impact_statement?: string;
    registered_number?: string;
    logo_url?: string;
    market?: string;
    cause_family?: string;
  },
): Promise<{ error: string | null }> {
  if (data.name !== undefined && !data.name.trim()) {
    return { error: "Name cannot be empty." };
  }

  const updates: Record<string, string | null> = {};
  if (data.cause_family !== undefined) {
    const family = parseCauseFamily(data.cause_family);
    if (!family.ok) return { error: family.error };
    updates.cause_family = family.family;
  }
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.description !== undefined)
    updates.description = data.description.trim() || null;
  if (data.impact_statement !== undefined)
    updates.impact_statement = data.impact_statement.trim() || null;
  if (data.registered_number !== undefined)
    updates.registered_number = data.registered_number.trim() || null;
  if (data.logo_url !== undefined)
    updates.logo_url = data.logo_url.trim() || null;
  if (data.market !== undefined) updates.market = data.market;

  const supabase = createAdminClient();

  // Re-verify against the Charity Commission whenever the number changes.
  // The name for the mismatch check comes from this update or, failing
  // that, the stored row.
  if (data.registered_number !== undefined) {
    let name = data.name?.trim();
    if (!name && updates.registered_number) {
      const { data: existing } = await supabase
        .from("charities")
        .select("name")
        .eq("id", id)
        .single();
      name = (existing as { name: string } | null)?.name ?? "";
    }
    Object.assign(
      updates,
      await verificationFields(name ?? "", updates.registered_number),
    );
  }

  const { error } = await supabase
    .from("charities")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  // A GIVEN LOGO DROPS THE SCRAPED IMAGE (decision 2's second guard). The
  // charity's own og:image lives on the profile for the private page; the
  // moment the charity supplies a logo it must be dropped, not kept as a
  // fallback, or a scraped image ends up served publicly by accident.
  // Here is the moment it has to fire.
  if (updates.logo_url) {
    await dropScrapedImage(id);
  }

  revalidatePath("/charities");
  return { error: null };
}

/** Clears a scraped og:image or favicon from a charity's profile, leaving
 *  a logo the charity GAVE us ('given') alone. Best-effort: a logo that is
 *  saved and an image that is not dropped must not look like a failed
 *  save, but it must be loud in the logs. */
async function dropScrapedImageByNumber(
  registeredNumber: string | null,
): Promise<void> {
  const key = profileKey(registeredNumber);
  if (!key) return;
  const { error } = await createAdminClient()
    .from("charity_profiles")
    .update({
      image_url: null,
      image_source: null,
      updated_at: new Date().toISOString(),
    })
    .eq("registered_number", key)
    .in("image_source", ["og", "favicon"]);
  if (error) {
    console.error(
      "[charity-profile] scraped image not dropped:",
      error.message,
    );
  }
}

/** The same guard, reached from an account id. */
async function dropScrapedImage(charityId: string): Promise<void> {
  const { data: charity } = await createAdminClient()
    .from("charities")
    .select("registered_number")
    .eq("id", charityId)
    .maybeSingle();
  await dropScrapedImageByNumber(
    (charity as { registered_number: string | null } | null)
      ?.registered_number ?? null,
  );
}

export async function deactivateCharity(
  id: string,
): Promise<{ error: string | null; warning?: string }> {
  const supabase = createAdminClient();

  const { data: usages, error: countError } = await supabase
    .from("favpoll_charities")
    .select("id")
    .eq("charity_id", id);

  if (countError) return { error: countError.message };

  const { error } = await supabase
    .from("charities")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/charities");

  const favpollCount = usages?.length ?? 0;
  if (favpollCount > 0) {
    return {
      error: null,
      warning: `This charity is used in ${favpollCount} favpoll${favpollCount === 1 ? "" : "s"}. It will no longer appear as an option for new favpolls.`,
    };
  }

  return { error: null };
}

export async function reactivateCharity(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("charities")
    .update({ is_active: true })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/charities");
  return { error: null };
}

export async function getCharityTopics(
  charityId: string,
): Promise<{ data: string[] | null; error: string | null }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("charity_topics")
    .select("topic_id")
    .eq("charity_id", charityId);

  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((r: { topic_id: string }) => r.topic_id),
    error: null,
  };
}

export async function setCharityTopics(
  charityId: string,
  topicIds: string[],
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { error: delError } = await supabase
    .from("charity_topics")
    .delete()
    .eq("charity_id", charityId);

  if (delError) return { error: delError.message };

  if (topicIds.length > 0) {
    const { error: insError } = await supabase
      .from("charity_topics")
      .insert(
        topicIds.map((topic_id) => ({ charity_id: charityId, topic_id })),
      );

    if (insError) return { error: insError.message };
  }

  revalidatePath("/charities");
  return { error: null };
}

// ─── SUGGESTIONS LIVE ON THE PROFILE (step 2 of the profiles note) ──────────
// A suggestion is a derivation, not an agreement, so it sits on
// `charity_profiles` keyed by registered number — where it can exist for a
// charity with no account at all. The CONFIRMED values stay on the account
// and are still read from `charities`. The old columns are still there,
// carried over by migration 20261004180000 and read by nothing; step 5
// drops them.

/** The normalised profile key for an account's number, or null when the
 *  number is not a shape the key accepts (charity_profiles_unkeyable). */
export function profileKey(registeredNumber: string | null): string | null {
  if (!registeredNumber) return null;
  const key = registeredNumber.trim().toUpperCase();
  return /^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$/.test(key)
    ? key
    : null;
}

type ProfileSuggestions = {
  perfect_topic_suggested_id: string | null;
  perfect_subset_suggested_id: string | null;
  perfect_topic_reason: string | null;
  cause_family_suggested: CauseFamily | null;
  signature_events: SignatureEvent[] | null;
  website_read_at: string | null;
  topic_family: string | null;
};

/** The profiles for a set of account numbers, keyed by the profile key. */
async function suggestionsByKey(
  numbers: (string | null)[],
): Promise<Map<string, ProfileSuggestions>> {
  const keys = [
    ...new Set(numbers.map(profileKey).filter((k): k is string => !!k)),
  ];
  if (keys.length === 0) return new Map();
  const { data, error } = await createAdminClient()
    .from("charity_profiles")
    .select(
      "registered_number, perfect_topic_suggested_id, perfect_subset_suggested_id, perfect_topic_reason, cause_family_suggested, signature_events, website_read_at, topic_family",
    )
    .in("registered_number", keys);
  if (error) {
    console.error("[charities] profiles unreadable:", error.message);
    return new Map();
  }
  return new Map(
    (data ?? []).map((row) => {
      const { registered_number, ...rest } = row as ProfileSuggestions & {
        registered_number: string;
      };
      return [registered_number, rest];
    }),
  );
}

type RegisterContactAndPurpose = {
  email: string | null;
  website: string | null;
  activities: string | null;
};

/** THE REGISTER'S OWN CONTACT AND PURPOSE for a set of account numbers
 *  (step 4 of the charity-profiles note): read from the mirror, not from
 *  the copies on `charities` that step 5 drops. One query for the queue.
 *  A charity registered since the extract has no row and simply shows
 *  nothing — the single-row readers keep the API fallback, a list does
 *  not earn one. */
async function registerByKey(
  numbers: (string | null)[],
): Promise<Map<string, RegisterContactAndPurpose>> {
  const digits = [
    ...new Set(
      numbers
        .map((n) => (n ?? "").replace(/\D/g, ""))
        .filter((n) => n.length > 0),
    ),
  ].map(Number);
  if (digits.length === 0) return new Map();
  const { data, error } = await createAdminClient()
    .from("register_charities")
    .select("registered_number, email, website, activities")
    .in("registered_number", digits);
  if (error) {
    console.error("[charities] mirror unreadable:", error.message);
    return new Map();
  }
  return new Map(
    (
      data as {
        registered_number: number;
        email: string | null;
        website: string | null;
        activities: string | null;
      }[]
    ).map((row) => [
      String(row.registered_number),
      { email: row.email, website: row.website, activities: row.activities },
    ]),
  );
}

/** Titles for the suggested topic and subset ids a set of profiles holds.
 *  The account's CONFIRMED titles arrive on its own joins; a suggestion
 *  lives on the profile, which holds ids and not names. */
async function suggestionTitles(
  profiles: Map<string, ProfileSuggestions>,
): Promise<{ topics: Map<string, string>; subsets: Map<string, string> }> {
  const topicIds = new Set<string>();
  const subsetIds = new Set<string>();
  for (const p of profiles.values()) {
    if (p.perfect_topic_suggested_id)
      topicIds.add(p.perfect_topic_suggested_id);
    if (p.perfect_subset_suggested_id)
      subsetIds.add(p.perfect_subset_suggested_id);
  }
  const supabase = createAdminClient();
  const [topics, subsets] = await Promise.all([
    topicIds.size
      ? supabase
          .from("topics")
          .select("id, title")
          .in("id", [...topicIds])
      : Promise.resolve({ data: [] }),
    subsetIds.size
      ? supabase
          .from("topic_subsets")
          .select("id, title")
          .in("id", [...subsetIds])
      : Promise.resolve({ data: [] }),
  ]);
  return {
    topics: new Map(
      ((topics.data ?? []) as { id: string; title: string }[]).map((t) => [
        t.id,
        t.title,
      ]),
    ),
    subsets: new Map(
      ((subsets.data ?? []) as { id: string; title: string }[]).map((t) => [
        t.id,
        t.title,
      ]),
    ),
  };
}

/** THE REMOVAL CHECK (references/charity-profiles-2026-09-27.md §3) —
 * account charities whose standing on the register is not a clean
 * Registered, with the money pointing at each. Removal is not staleness:
 * a charity that has left the register is WRONG, not old, and money
 * moving to a deregistered charity is the one failure here with real
 * consequences. Written by the mirror load
 * (scripts/register/check-removals.ts) and read here so an admin sees it
 * loudly; the function is register_account_removals(), migration
 * 20261004140000. */
export type RegisterRemoval = {
  charity_id: string;
  name: string;
  registered_number: string | null;
  /** removed = deregistered; gone = absent from the latest extract
   *  (possibly an interrupted load); unknown = no mirror row at all. */
  verdict: "removed" | "gone" | "unknown";
  is_active: boolean;
  consent_status: string | null;
  register_name: string | null;
  register_status: string | null;
  removed_on: string | null;
  extract_date: string | null;
  latest_extract: string | null;
  favpoll_count: number;
  open_count: number;
  raised: number;
  pending_disbursements: number;
  pending_amount: number;
  gift_aid_declarations: number;
};

export async function getRegisterRemovals(): Promise<{
  data: RegisterRemoval[] | null;
  error: string | null;
}> {
  const { data, error } = await createAdminClient().rpc(
    "register_account_removals",
  );
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as RegisterRemoval[], error: null };
}

/** The verdicts by charity id, for a queue row to carry. */
async function removalsById(): Promise<Map<string, RegisterRemoval>> {
  const { data } = await getRegisterRemovals();
  return new Map((data ?? []).map((r) => [r.charity_id, r]));
}

export type ConsentQueueRow = {
  id: string;
  name: string;
  registered_number: string | null;
  registered_email: string | null;
  consent_contacted_at: string | null;
  favpoll_count: number;
  /** Cause family (references/favpoll-pairing-table §2): the confirmed
   *  value, the model's suggestion, and the register text it came from. */
  cause_family: CauseFamily | null;
  cause_family_suggested: CauseFamily | null;
  activities: string | null;
  /** The PERFECT TOPIC (2026-09-26): confirmed id, the model's suggestion,
   *  one sentence why (or why none), and the confirmed topic's title for
   *  the welcome email. */
  perfect_topic_id: string | null;
  perfect_topic_suggested_id: string | null;
  perfect_topic_reason: string | null;
  perfect_topic_title: string | null;
  /** A SUBSET of the perfect topic (favpoll-topic-rules §1): confirmed
   *  id, the suggester's, and the confirmed subset's title. */
  perfect_subset_id: string | null;
  perfect_subset_suggested_id: string | null;
  perfect_subset_title: string | null;
  /** The fundraising events read from its website (2026-09-27). */
  signature_events: SignatureEvent[] | null;
  registered_website: string | null;
  /** The REMOVAL CHECK's verdict, when the register has something to say
   *  about this number: a removed charity must not be invited or
   *  approved. Null is the ordinary case — cleanly Registered. */
  register_verdict: RegisterRemoval["verdict"] | null;
  register_removed_on: string | null;
};

/** CONSENT OUTREACH QUEUE — pending charities in use on at least one
 * favpoll: the ones where pledges are actually waiting on an agreement.
 * favpoll owns outreach (the organiser invite path was retired, web
 * #868); this is the team's list to work. Not-yet-contacted first. */
export async function getConsentQueue(): Promise<{
  data: ConsentQueueRow[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const [{ data: links, error: linkError }, removals] = await Promise.all([
    supabase.from("favpoll_charities").select("charity_id"),
    removalsById(),
  ]);
  if (linkError) return { data: null, error: linkError.message };

  const counts = new Map<string, number>();
  for (const l of (links ?? []) as { charity_id: string }[]) {
    counts.set(l.charity_id, (counts.get(l.charity_id) ?? 0) + 1);
  }
  if (counts.size === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("charities")
    .select(
      "id, name, registered_number, consent_contacted_at, cause_family, perfect_topic_id, perfect_subset_id, perfect_topic:topics!charities_perfect_topic_id_fkey(title), perfect_subset:topic_subsets!charities_perfect_subset_id_fkey(title)",
    )
    .eq("consent_status", "pending")
    .in("id", [...counts.keys()])
    .order("name", { ascending: true });
  if (error) return { data: null, error: error.message };

  // The suggestions, from the profile; the contact and the register's own
  // words, from the mirror. A charity whose number has neither simply has
  // nothing to show — the row still works.
  const numbers = (data ?? []).map(
    (c) => (c as { registered_number: string | null }).registered_number,
  );
  const [suggestions, register] = await Promise.all([
    suggestionsByKey(numbers),
    registerByKey(numbers),
  ]);
  const titles = await suggestionTitles(suggestions);

  const rows = (data ?? [])
    .map((c) => {
      const { perfect_topic, perfect_subset, ...rest } = c as Omit<
        ConsentQueueRow,
        | "favpoll_count"
        | "perfect_topic_title"
        | "perfect_subset_title"
        | "register_verdict"
        | "register_removed_on"
        | "registered_email"
        | "registered_website"
        | "activities"
        | "perfect_topic_suggested_id"
        | "perfect_subset_suggested_id"
        | "perfect_topic_reason"
        | "cause_family_suggested"
        | "signature_events"
      > & {
        perfect_topic?: { title: string } | { title: string }[] | null;
        perfect_subset?: { title: string } | { title: string }[] | null;
      };
      const pt = Array.isArray(perfect_topic)
        ? perfect_topic[0]
        : perfect_topic;
      const ps = Array.isArray(perfect_subset)
        ? perfect_subset[0]
        : perfect_subset;
      const removal = removals.get(rest.id);
      const key = profileKey(rest.registered_number);
      const profile = key ? suggestions.get(key) : undefined;
      const onRegister = register.get(
        (rest.registered_number ?? "").replace(/\D/g, ""),
      );
      // The CONFIRMED titles come from the account's own joins; a
      // suggestion's title is looked up from the profile's ids.
      const suggestedTopic = profile?.perfect_topic_suggested_id
        ? titles.topics.get(profile.perfect_topic_suggested_id)
        : undefined;
      const suggestedSubset = profile?.perfect_subset_suggested_id
        ? titles.subsets.get(profile.perfect_subset_suggested_id)
        : undefined;
      return {
        ...rest,
        registered_email: onRegister?.email ?? null,
        registered_website: onRegister?.website ?? null,
        activities: onRegister?.activities ?? null,
        perfect_topic_suggested_id: profile?.perfect_topic_suggested_id ?? null,
        perfect_subset_suggested_id:
          profile?.perfect_subset_suggested_id ?? null,
        perfect_topic_reason: profile?.perfect_topic_reason ?? null,
        cause_family_suggested: profile?.cause_family_suggested ?? null,
        signature_events: profile?.signature_events ?? null,
        perfect_topic_title: pt?.title ?? suggestedTopic ?? null,
        perfect_subset_title: ps?.title ?? suggestedSubset ?? null,
        favpoll_count: counts.get(rest.id) ?? 0,
        register_verdict: removal?.verdict ?? null,
        register_removed_on: removal?.removed_on ?? null,
      };
    })
    .sort(
      (a, b) =>
        Number(!!a.consent_contacted_at) - Number(!!b.consent_contacted_at),
    );
  return { data: rows, error: null };
}

/** Stamps the team's outreach — called when a drafted invite is opened.
 * Unconditional, unlike the retired organiser path's first-only rule:
 * the stamp records the MOST RECENT contact, so re-invites re-stamp. */
export async function markCharityContacted(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("charities")
    .update({ consent_contacted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/charities");
  return { error: null };
}

/** CAUSE FAMILY — the admin's confirmation (references/favpoll-pairing-table
 * §2). `cause_family` is the ONLY family the generator reads; the model's
 * `cause_family_suggested` is shown beside it and never used directly. null
 * is a valid, honest answer: a grant-maker has no cause of its own. */
export async function setCauseFamily(
  id: string,
  family: CauseFamily | null,
): Promise<{ error: string | null }> {
  if (family !== null && !CAUSE_FAMILIES.includes(family)) {
    return { error: `Unknown cause family: ${family}` };
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("charities")
    .update({ cause_family: family })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/charities");
  return { error: null };
}

/** PERFECT TOPIC — the admin's confirmation (lib/perfect-topic.ts). Only
 * `perfect_topic_id` reaches the generator and the wizard; the model's
 * suggestion sits beside it. null is a real answer: no topic honestly fits. */
export async function setPerfectTopic(
  id: string,
  topicId: string | null,
  subsetId: string | null = null,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  // The subset must belong to the topic (a trigger enforces it); no topic
  // means no subset.
  const { error } = await supabase
    .from("charities")
    .update({
      perfect_topic_id: topicId,
      perfect_subset_id: topicId ? subsetId : null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/charities");
  return { error: null };
}

/** PERFECT TOPIC QUEUE — every active charity whose suggestion is still
 * unconfirmed, whatever its consent status and whether or not a favpoll
 * uses it. The consent queue shows a suggestion only while the charity is
 * pending AND in use, so an approved charity left the queue carrying its
 * suggestion with it and a charity nobody has picked never entered
 * (founder, 2026-10-02: "where are the perfect topics to be reviewed?").
 * This is that door. */
export type PerfectTopicQueueRow = {
  id: string;
  name: string;
  cause_family: CauseFamily | null;
  perfect_topic_id: string | null;
  perfect_topic_suggested_id: string | null;
  perfect_topic_reason: string | null;
  perfect_subset_id: string | null;
  perfect_subset_suggested_id: string | null;
  signature_events: SignatureEvent[] | null;
};

export async function getPerfectTopicQueue(): Promise<{
  data: PerfectTopicQueueRow[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  // Unconfirmed accounts first, then the profiles that have something to
  // say about them: the suggestion moved to the profile (step 2), so the
  // "has a suggestion" filter is no longer a column on this table.
  const { data, error } = await supabase
    .from("charities")
    .select(
      "id, name, registered_number, cause_family, perfect_topic_id, perfect_subset_id",
    )
    .eq("is_active", true)
    .is("perfect_topic_id", null)
    .order("name", { ascending: true });
  if (error) return { data: null, error: error.message };

  const suggestions = await suggestionsByKey(
    (data ?? []).map(
      (c) => (c as { registered_number: string | null }).registered_number,
    ),
  );
  const rows = (data ?? [])
    .map((c) => {
      const row = c as Omit<
        PerfectTopicQueueRow,
        | "perfect_topic_suggested_id"
        | "perfect_subset_suggested_id"
        | "perfect_topic_reason"
        | "signature_events"
      > & { registered_number: string | null };
      const key = profileKey(row.registered_number);
      const profile = key ? suggestions.get(key) : undefined;
      return {
        ...row,
        perfect_topic_suggested_id: profile?.perfect_topic_suggested_id ?? null,
        perfect_subset_suggested_id:
          profile?.perfect_subset_suggested_id ?? null,
        perfect_topic_reason: profile?.perfect_topic_reason ?? null,
        signature_events: profile?.signature_events ?? null,
      } as PerfectTopicQueueRow;
    })
    .filter((r) => r.perfect_topic_suggested_id != null);
  return { data: rows, error: null };
}

/** "No topic of its own" — the other real answer (a hospice, a
 * grant-maker). Clearing the suggestion is what takes the charity off the
 * queue; a later backfill --all may suggest again. The suggestion lives on
 * the PROFILE now, so that is what is cleared (step 2). */
export async function dismissPerfectTopicSuggestion(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { data: charity } = await supabase
    .from("charities")
    .select("registered_number")
    .eq("id", id)
    .maybeSingle();
  const key = profileKey(
    (charity as { registered_number: string | null } | null)
      ?.registered_number ?? null,
  );
  if (!key) return { error: "That charity has no profile to clear." };
  const { error } = await supabase
    .from("charity_profiles")
    .update({
      perfect_topic_suggested_id: null,
      perfect_subset_suggested_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("registered_number", key);
  if (error) return { error: error.message };
  revalidatePath("/charities");
  return { error: null };
}

/** CONSENT — approve or decline a charity for receiving pledges (the
 * PF/CP posture machinery; see apps/web/lib/charity-consent.ts). Approval
 * also lists the charity — register-added ones arrive is_active=false —
 * and declining delists it. Under the consent-first posture these
 * statuses are what gates money on the web app. */
export async function setCharityConsent(
  id: string,
  status: "approved" | "declined",
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  // THE REMOVAL CHECK, as a guard and not just a warning: approval lists
  // the charity and opens the money rail to it, so a number the register
  // has deregistered is refused here, where the write happens. Declining
  // stays open — it is the way out. A name mismatch is somebody else's
  // problem and does not block.
  if (status === "approved") {
    const { data: charity } = await supabase
      .from("charities")
      .select("name, registered_number")
      .eq("id", id)
      .maybeSingle();
    const number = (charity as { registered_number: string | null } | null)
      ?.registered_number;
    if (number) {
      const check = await verifyOnMirror(
        number,
        (charity as { name: string }).name,
      );
      if (check.status === "removed") {
        return {
          error:
            "The register has removed this charity. It cannot be approved — money must not move to a deregistered charity.",
        };
      }
    }
  }

  const { error } = await supabase
    .from("charities")
    .update({
      consent_status: status,
      consent_decided_at: new Date().toISOString(),
      is_active: status === "approved",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/charities");
  return { error: null };
}
