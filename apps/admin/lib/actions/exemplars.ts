"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type ExemplarFavpoll = {
  id: string;
  register: string;
  occasion_type: string | null;
  opening_line: string | null;
  is_exemplar: boolean;
  closed_at: string | null;
  total_raised: number;
  protagonist_name: string | null;
};

export async function getClosedFavpolls(): Promise<{
  data: ExemplarFavpoll[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("favpolls")
    .select(
      `id, register, occasion_type, opening_line, is_exemplar, closed_at,
       total_raised, protagonist:protagonists ( name )`,
    )
    .eq("is_private", false)
    .not("closed_at", "is", null)
    .order("is_exemplar", { ascending: false })
    .order("closed_at", { ascending: false })
    .limit(100);

  if (error) return { data: null, error: error.message };

  const rows = (data ?? []).map((ev) => ({
    id: ev.id,
    register: ev.register,
    occasion_type: ev.occasion_type,
    opening_line: ev.opening_line,
    is_exemplar: ev.is_exemplar,
    closed_at: ev.closed_at,
    total_raised: ev.total_raised,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protagonist_name: (ev.protagonist as any)?.name ?? null,
  }));

  return { data: rows, error: null };
}

export async function setExemplar(
  favpollId: string,
  value: boolean,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("favpolls")
    .update({ is_exemplar: value })
    .eq("id", favpollId);

  if (error) return { error: error.message };

  revalidatePath("/favpolls");
  return { error: null };
}
