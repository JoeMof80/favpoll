"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  searchRegister,
  verifyCharityNumber,
  type RegisterSearchResult,
  type VerificationStatus,
} from "@/lib/charity-commission";

/** Live search of the Register of Charities for the admin typeahead. */
export async function searchCharityRegister(
  query: string,
): Promise<RegisterSearchResult[]> {
  return searchRegister(query);
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
  is_active: boolean;
  market: string;
  created_at: string;
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
  const result = await verifyCharityNumber(registeredNumber, name);
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
      "id, name, description, logo_url, impact_statement, registered_number, verification_status, verified_name, verified_at, is_active, market, created_at",
    )
    .order("name", { ascending: true });

  if (market) {
    query = query.eq("market", market);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };
  return { data: data as Charity[], error: null };
}

export async function createCharity(input: {
  name: string;
  description?: string;
  impact_statement?: string;
  registered_number?: string;
  logo_url?: string;
  market: string;
}): Promise<{ error: string | null }> {
  if (!input.name.trim()) return { error: "Name is required." };
  if (!VALID_MARKETS.includes(input.market)) {
    return {
      error: `Invalid market. Must be one of: ${VALID_MARKETS.join(", ")}.`,
    };
  }

  const supabase = createAdminClient();

  const name = input.name.trim();
  const registeredNumber = input.registered_number?.trim() || null;

  const { error } = await supabase.from("charities").insert({
    name,
    description: input.description?.trim() || null,
    impact_statement: input.impact_statement?.trim() || null,
    registered_number: registeredNumber,
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
  },
): Promise<{ error: string | null }> {
  if (data.name !== undefined && !data.name.trim()) {
    return { error: "Name cannot be empty." };
  }

  const updates: Record<string, string | null> = {};
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
