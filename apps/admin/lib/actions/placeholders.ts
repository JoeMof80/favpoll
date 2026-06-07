"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  VALID_REGISTERS,
  type Topic,
  type PlaceholdersMap,
  type RegisterKey,
} from "@/lib/occasions";

export async function getTopics(): Promise<{
  data: Topic[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("topics")
    .select("id, title, is_finite, placeholders")
    .order("title");

  if (error) return { data: null, error: error.message };
  return { data: data as Topic[], error: null };
}

export async function getTopicById(
  topicId: string,
): Promise<{ data: Topic | null; error: string | null }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("topics")
    .select("id, title, is_finite, placeholders")
    .eq("id", topicId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Topic, error: null };
}

export async function updatePlaceholder(
  topicId: string,
  register: RegisterKey,
  about: string,
  reveal: string,
): Promise<{ error: string | null }> {
  if (!(VALID_REGISTERS as readonly string[]).includes(register)) {
    return { error: `Invalid register: "${register}"` };
  }

  const supabase = createAdminClient();

  const { data: topic, error: fetchError } = await supabase
    .from("topics")
    .select("placeholders")
    .eq("id", topicId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const current: PlaceholdersMap = (topic as any)?.placeholders ?? {};
  const merged: PlaceholdersMap = { ...current, [register]: { about, reveal } };

  const { error: updateError } = await supabase
    .from("topics")
    .update({ placeholders: merged })
    .eq("id", topicId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/placeholders");
  revalidatePath(`/placeholders/${topicId}`);
  return { error: null };
}

export async function getTopicItems(topicId: string): Promise<{
  data: { id: string; label: string; display_order: number | null }[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("topic_items")
    .select("id, label, display_order")
    .eq("topic_id", topicId)
    .eq("is_canonical", true)
    .order("label");

  if (error) return { data: null, error: error.message };
  return {
    data: data as { id: string; label: string; display_order: number | null }[],
    error: null,
  };
}

export async function updateItemDisplayOrder(
  itemId: string,
  displayOrder: number | null,
  topicId: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("topic_items")
    .update({ display_order: displayOrder })
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath("/placeholders");
  revalidatePath(`/placeholders/${topicId}`);
  return { error: null };
}
