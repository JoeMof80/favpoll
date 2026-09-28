"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminTopic = {
  id: string;
  title: string;
  /** A catalogue topic (no organiser made it): the only kind a subset
   *  can have as its parent. */
  is_catalogue: boolean;
  /** The topic's approved, listed SUBSETS (favpoll-topic-rules §1): a
   *  charity's perfect topic may be one of these, confirmed beside it. */
  subsets: { id: string; title: string }[];
};

export async function getTopics(): Promise<{
  data: AdminTopic[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("topics")
    .select(
      "id, title, created_by, topic_subsets(id, title, status, is_active)",
    )
    .eq("is_active", true)
    .order("title");

  if (error) return { data: null, error: error.message };
  type Raw = {
    id: string;
    title: string;
    created_by: string | null;
    topic_subsets:
      | { id: string; title: string; status: string; is_active: boolean }[]
      | null;
  };
  return {
    data: ((data ?? []) as Raw[]).map((t) => ({
      id: t.id,
      title: t.title,
      is_catalogue: t.created_by == null,
      subsets: (t.topic_subsets ?? [])
        .filter((s) => s.status === "approved" && s.is_active)
        .map((s) => ({ id: s.id, title: s.title }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    })),
    error: null,
  };
}
