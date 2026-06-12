"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type DraftStatus = "generated" | "curated" | "rejected";

export type GeneratedDraft = {
  id: string;
  cache_key: string;
  register: string;
  subject: "someone" | "cause";
  about: string;
  reveal: string;
  status: DraftStatus;
  topic_title: string;
  charity_name: string | null;
  created_at: string;
};

export async function getGeneratedDrafts(
  filter: DraftStatus = "generated",
): Promise<{ data: GeneratedDraft[] | null; error: string | null }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("generated_drafts")
    .select(
      "id, cache_key, register, subject, about, reveal, status, created_at, topics(title), charities(name)",
    )
    .eq("status", filter)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const rows = (data ?? []).map((row: any) => ({
    id: row.id,
    cache_key: row.cache_key,
    register: row.register,
    subject: row.subject,
    about: row.about,
    reveal: row.reveal,
    status: row.status as DraftStatus,
    topic_title: row.topics?.title ?? "",
    charity_name: row.charities?.name ?? null,
    created_at: row.created_at,
  }));

  return { data: rows, error: null };
}

export async function updateGeneratedDraft(
  id: string,
  fields: { about?: string; reveal?: string },
): Promise<{ error: string | null }> {
  const update: Record<string, string> = {};
  if (fields.about !== undefined) update.about = fields.about;
  if (fields.reveal !== undefined) update.reveal = fields.reveal;

  if (Object.keys(update).length === 0) return { error: "Nothing to update." };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("generated_drafts")
    .update(update)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/generated-drafts");
  return { error: null };
}

export async function setGeneratedDraftStatus(
  id: string,
  status: "curated" | "rejected",
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("generated_drafts")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/generated-drafts");
  return { error: null };
}
