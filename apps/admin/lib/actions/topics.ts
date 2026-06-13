"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminTopic = {
  id: string;
  title: string;
};

export async function getTopics(): Promise<{
  data: AdminTopic[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("topics")
    .select("id, title")
    .eq("is_active", true)
    .order("title");

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as AdminTopic[], error: null };
}
