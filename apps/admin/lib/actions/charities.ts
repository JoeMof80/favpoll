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
      "id, name, description, logo_url, impact_statement, registered_number, verification_status, verified_name, verified_at, consent_status, consent_contacted_at, consent_decided_at, is_active, market, created_at, cause_family, cause_family_suggested, activities",
    )
    .order("name", { ascending: true });

  if (market) {
    query = query.eq("market", market);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };
  return { data: data as Charity[], error: null };
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

  const { error } = await supabase.from("charities").insert({
    name,
    description: input.description?.trim() || null,
    impact_statement: input.impact_statement?.trim() || null,
    registered_number: registeredNumber,
    registered_email: contact.email,
    registered_website: contact.website,
    activities: purpose.activities,
    classification: purpose.classification,
    objects: purpose.objects,
    areas: purpose.areas,
    grant_making: purpose.grantMaking,
    // Hand-entered by an admin, so this IS the confirmed value.
    cause_family: family.family,
    logo_url: input.logo_url?.trim() || null,
    market: input.market,
    is_active: true,
    ...(await verificationFields(name, registeredNumber)),
  });

  if (error) return { error: error.message };

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

  revalidatePath("/charities");
  return { error: null };
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

  const { data: links, error: linkError } = await supabase
    .from("favpoll_charities")
    .select("charity_id");
  if (linkError) return { data: null, error: linkError.message };

  const counts = new Map<string, number>();
  for (const l of (links ?? []) as { charity_id: string }[]) {
    counts.set(l.charity_id, (counts.get(l.charity_id) ?? 0) + 1);
  }
  if (counts.size === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("charities")
    .select(
      "id, name, registered_number, registered_email, consent_contacted_at, cause_family, cause_family_suggested, activities, perfect_topic_id, perfect_topic_suggested_id, perfect_topic_reason, perfect_subset_id, perfect_subset_suggested_id, signature_events, registered_website, perfect_topic:topics!charities_perfect_topic_id_fkey(title), perfect_subset:topic_subsets!charities_perfect_subset_id_fkey(title)",
    )
    .eq("consent_status", "pending")
    .in("id", [...counts.keys()])
    .order("name", { ascending: true });
  if (error) return { data: null, error: error.message };

  const rows = (data ?? [])
    .map((c) => {
      const { perfect_topic, perfect_subset, ...rest } = c as Omit<
        ConsentQueueRow,
        "favpoll_count" | "perfect_topic_title" | "perfect_subset_title"
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
      return {
        ...rest,
        perfect_topic_title: pt?.title ?? null,
        perfect_subset_title: ps?.title ?? null,
        favpoll_count: counts.get(rest.id) ?? 0,
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
  const { data, error } = await supabase
    .from("charities")
    .select(
      "id, name, cause_family, perfect_topic_id, perfect_topic_suggested_id, perfect_topic_reason, perfect_subset_id, perfect_subset_suggested_id, signature_events",
    )
    .eq("is_active", true)
    .is("perfect_topic_id", null)
    .not("perfect_topic_suggested_id", "is", null)
    .order("name", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as PerfectTopicQueueRow[], error: null };
}

/** "No topic of its own" — the other real answer (a hospice, a
 * grant-maker). Clearing the suggestion is what takes the charity off the
 * queue; a later backfill --all may suggest again. */
export async function dismissPerfectTopicSuggestion(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("charities")
    .update({
      perfect_topic_suggested_id: null,
      perfect_subset_suggested_id: null,
    })
    .eq("id", id);
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
