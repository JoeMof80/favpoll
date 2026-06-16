"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_MARKETS = ["en-GB"];

export type Charity = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  registered_number: string | null;
  is_active: boolean;
  market: string;
  created_at: string;
};

export async function getCharities(
  market?: string,
): Promise<{ data: Charity[] | null; error: string | null }> {
  const supabase = createAdminClient();

  let query = supabase
    .from("charities")
    .select(
      "id, name, description, logo_url, registered_number, is_active, market, created_at",
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

  const { error } = await supabase.from("charities").insert({
    name: input.name.trim(),
    description: input.description?.trim() || null,
    registered_number: input.registered_number?.trim() || null,
    logo_url: input.logo_url?.trim() || null,
    market: input.market,
    is_active: true,
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
  if (data.registered_number !== undefined)
    updates.registered_number = data.registered_number.trim() || null;
  if (data.logo_url !== undefined)
    updates.logo_url = data.logo_url.trim() || null;
  if (data.market !== undefined) updates.market = data.market;

  const supabase = createAdminClient();

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

  const eventCount = usages?.length ?? 0;
  if (eventCount > 0) {
    return {
      error: null,
      warning: `This charity is used in ${eventCount} event${eventCount === 1 ? "" : "s"}. It will no longer appear as an option for new events.`,
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
