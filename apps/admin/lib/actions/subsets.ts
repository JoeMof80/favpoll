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

// ── PROMOTION (favpoll-topic-rules §1, ruling 8) ─────────────────────────
// An organiser's HOMEMADE topic whose items all sit on a catalogue topic's
// list is a subset that arrived by the wrong door. Promotion CREATES the
// subset for the next organiser and delists the homemade row from the
// picker (is_listed=false — never is_active=false, which the favpoll page
// reads as "unvetted" and hides from guests: the favpoll that made it
// keeps its topic and its items in full view).
// Promotion to a canonical TOPIC is different and in place: the homemade
// row is itself curated (placeholders, categories, accepted items).

export type HomemadeTopic = {
  id: string;
  title: string;
  created_at: string;
  items: string[];
  favpoll_count: number;
};

export async function getHomemadeTopics(): Promise<{
  data: HomemadeTopic[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("topics")
    .select("id, title, created_at, favourites(label), favpoll_polls(count)")
    .not("created_by", "is", null)
    .eq("is_active", true)
    .eq("is_listed", true)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  type Raw = {
    id: string;
    title: string;
    created_at: string;
    favourites: { label: string }[] | null;
    favpoll_polls: { count: number }[] | null;
  };
  return {
    data: ((data ?? []) as Raw[]).map((t) => ({
      id: t.id,
      title: t.title,
      created_at: t.created_at,
      items: (t.favourites ?? [])
        .map((f) => f.label)
        .sort((a, b) => a.localeCompare(b)),
      favpoll_count: t.favpoll_polls?.[0]?.count ?? 0,
    })),
    error: null,
  };
}

/** Promote a homemade topic to a subset of `parentTopicId`, under the
 *  homemade title (or `title`). Items are matched to the parent's list
 *  by label; the parent must already hold at least six of them (ruling
 *  7 — a subset never justifies an item). The subset is approved (the
 *  admin is making it), source "homemade"; the homemade row is delisted. */
export async function promoteHomemadeTopic(
  topicId: string,
  parentTopicId: string,
  title?: string,
): Promise<{ error: string | null; unmatched?: string[] }> {
  const supabase = createAdminClient();
  const { data: homemade, error: hErr } = await supabase
    .from("topics")
    .select("id, title, created_by, favourites(label)")
    .eq("id", topicId)
    .single();
  if (hErr) return { error: hErr.message };
  if (!homemade?.created_by)
    return { error: "Only a homemade topic can be promoted to a subset." };
  if (topicId === parentTopicId)
    return { error: "A topic cannot be a subset of itself." };

  const { data: parent, error: pErr } = await supabase
    .from("topics")
    .select("id, title, created_by, favourites(id, label)")
    .eq("id", parentTopicId)
    .single();
  if (pErr) return { error: pErr.message };
  if (parent?.created_by)
    return { error: "The parent must be a catalogue topic." };

  const norm = (s: string) => s.trim().toLowerCase();
  const byLabel = new Map(
    ((parent?.favourites ?? []) as { id: string; label: string }[]).map((f) => [
      norm(f.label),
      f.id,
    ]),
  );
  const labels = ((homemade.favourites ?? []) as { label: string }[]).map(
    (f) => f.label,
  );
  const ids = [
    ...new Set(
      labels.map((l) => byLabel.get(norm(l))).filter((x): x is string => !!x),
    ),
  ];
  const unmatched = labels.filter((l) => !byLabel.has(norm(l)));
  if (ids.length < SUBSET_MIN_ITEMS) {
    return {
      error: `Only ${ids.length} of its items are on ${parent?.title}'s list; a subset needs ${SUBSET_MIN_ITEMS}. Add the missing ones to ${parent?.title} first, if they earn a place.`,
      unmatched,
    };
  }

  const clean = (title ?? homemade.title).trim().replace(/\s+/g, " ");
  const { data: subset, error: sErr } = await supabase
    .from("topic_subsets")
    .insert({
      topic_id: parentTopicId,
      title: clean,
      status: "approved",
      source: "homemade",
      reason: `Promoted from an organiser's homemade topic "${homemade.title}".`,
      reviewed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (sErr) return { error: sErr.message };
  const { error: iErr } = await supabase
    .from("topic_subset_items")
    .insert(
      ids.map((favourite_id) => ({ subset_id: subset.id, favourite_id })),
    );
  if (iErr) return { error: iErr.message };

  // Delisted, never deleted or deactivated: the favpoll that made it
  // still points here and its guests still see it.
  const { error: dErr } = await supabase
    .from("topics")
    .update({ is_listed: false })
    .eq("id", topicId);
  if (dErr) return { error: dErr.message };

  revalidatePath("/subsets");
  return { error: null, unmatched };
}
