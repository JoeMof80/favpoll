"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TopicSubset } from "@favpoll/types";
import { SUBSET_MIN_ITEMS } from "@/lib/subsets";

// SUBSETS (favpoll-topic-rules §1): a named subset of ONE topic's items.
// The scan (scripts/propose-subsets.ts) writes proposals; the admin
// approves, rejects, trims and renames here (ruling 2: admin-made).
// Only an approved, active subset reaches the picker (step 3).

export type SubsetRow = TopicSubset & {
  topic_title: string;
  items: { favourite_id: string; label: string }[];
};

export async function getSubsets(): Promise<{
  data: SubsetRow[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("topic_subsets")
    .select(
      "id, topic_id, title, is_active, status, source, reason, reviewed_at, created_at, topics(title), topic_subset_items(favourite_id, favourites(label))",
    )
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };

  type Raw = TopicSubset & {
    topics: { title: string } | { title: string }[] | null;
    topic_subset_items:
      | {
          favourite_id: string;
          favourites: { label: string } | { label: string }[] | null;
        }[]
      | null;
  };
  const one = <T>(x: T | T[] | null | undefined): T | null =>
    Array.isArray(x) ? x[0] ?? null : x ?? null;

  const rows: SubsetRow[] = ((data ?? []) as Raw[]).map((r) => {
    const { topics, topic_subset_items, ...rest } = r;
    return {
      ...rest,
      topic_title: one(topics)?.title ?? "",
      items: (topic_subset_items ?? [])
        .map((i) => ({
          favourite_id: i.favourite_id,
          label: one(i.favourites)?.label ?? "",
        }))
        .filter((i) => i.label)
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  });
  rows.sort(
    (a, b) =>
      a.topic_title.localeCompare(b.topic_title) ||
      a.title.localeCompare(b.title),
  );
  return { data: rows, error: null };
}

/** Approve: the subset joins the shelf. Refused under six items. */
export async function approveSubset(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { data: items, error: cErr } = await supabase
    .from("topic_subset_items")
    .select("favourite_id")
    .eq("subset_id", id);
  if (cErr) return { error: cErr.message };
  if ((items ?? []).length < SUBSET_MIN_ITEMS) {
    return {
      error: `A subset needs at least ${SUBSET_MIN_ITEMS} items on the parent's list.`,
    };
  }
  const { error } = await supabase
    .from("topic_subsets")
    .update({
      status: "approved",
      is_active: true,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/subsets");
  return { error: null };
}

export async function rejectSubset(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("topic_subsets")
    .update({
      status: "rejected",
      is_active: false,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/subsets");
  return { error: null };
}

/** Trim an item from a subset (any status: an approved subset can lose
 *  an item too, as long as six remain — checked at approval, and here). */
export async function removeSubsetItem(
  subsetId: string,
  favouriteId: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { data: sub, error: sErr } = await supabase
    .from("topic_subsets")
    .select("status, topic_subset_items(favourite_id)")
    .eq("id", subsetId)
    .single();
  if (sErr) return { error: sErr.message };
  const count = (
    (sub as { topic_subset_items?: unknown[] } | null)?.topic_subset_items ?? []
  ).length;
  if (
    (sub as { status?: string } | null)?.status === "approved" &&
    count <= SUBSET_MIN_ITEMS
  ) {
    return {
      error: `An approved subset keeps at least ${SUBSET_MIN_ITEMS} items.`,
    };
  }
  const { error } = await supabase
    .from("topic_subset_items")
    .delete()
    .eq("subset_id", subsetId)
    .eq("favourite_id", favouriteId);
  if (error) return { error: error.message };
  revalidatePath("/subsets");
  return { error: null };
}

/** Topic grammar: singular, basic level, reads after "Favourite". The
 *  admin's rename is the one place a proposal's name gets corrected. */
export async function renameSubset(
  id: string,
  title: string,
): Promise<{ error: string | null }> {
  const clean = title.trim().replace(/\s+/g, " ");
  if (!clean) return { error: "A subset needs a name." };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("topic_subsets")
    .update({ title: clean })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/subsets");
  return { error: null };
}

/** Delist or relist an approved subset. Never deleted: favpolls point
 *  at it. */
export async function setSubsetActive(
  id: string,
  active: boolean,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("topic_subsets")
    .update({ is_active: active })
    .eq("id", id)
    .eq("status", "approved");
  if (error) return { error: error.message };
  revalidatePath("/subsets");
  return { error: null };
}
