"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  VALID_OCCASIONS,
  type Topic,
  type PlaceholdersMap,
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
  occasion: string,
  about: string,
  reveal: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { data: topic, error: fetchError } = await supabase
    .from("topics")
    .select("placeholders")
    .eq("id", topicId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const current: PlaceholdersMap = (topic as any)?.placeholders ?? {};
  const merged: PlaceholdersMap = { ...current, [occasion]: { about, reveal } };

  const { error: updateError } = await supabase
    .from("topics")
    .update({ placeholders: merged })
    .eq("id", topicId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/placeholders");
  revalidatePath(`/placeholders/${topicId}`);
  return { error: null };
}

export async function addOccasion(
  topicId: string,
  occasion: string,
  about: string,
  reveal: string,
): Promise<{ error: string | null }> {
  if (!(VALID_OCCASIONS as readonly string[]).includes(occasion)) {
    return { error: `Invalid occasion: "${occasion}"` };
  }

  const supabase = createAdminClient();

  const { data: topic, error: fetchError } = await supabase
    .from("topics")
    .select("placeholders")
    .eq("id", topicId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const current: PlaceholdersMap = (topic as any)?.placeholders ?? {};

  if (Object.prototype.hasOwnProperty.call(current, occasion)) {
    return {
      error: `Occasion "${occasion}" already exists. Use Save to update it.`,
    };
  }

  const merged: PlaceholdersMap = { ...current, [occasion]: { about, reveal } };

  const { error: updateError } = await supabase
    .from("topics")
    .update({ placeholders: merged })
    .eq("id", topicId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/placeholders");
  revalidatePath(`/placeholders/${topicId}`);
  return { error: null };
}

export async function getTopicItems(
  topicId: string,
): Promise<{
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

export async function deleteOccasion(
  topicId: string,
  occasion: string,
): Promise<{ error: string | null }> {
  if (occasion === "default") {
    return { error: "The default occasion cannot be deleted." };
  }

  const supabase = createAdminClient();

  const { data: topic, error: fetchError } = await supabase
    .from("topics")
    .select("placeholders")
    .eq("id", topicId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const current: PlaceholdersMap = (topic as any)?.placeholders ?? {};
  const updated: PlaceholdersMap = { ...current };
  delete updated[occasion];

  const { error: updateError } = await supabase
    .from("topics")
    .update({ placeholders: updated })
    .eq("id", topicId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/placeholders");
  revalidatePath(`/placeholders/${topicId}`);
  return { error: null };
}
