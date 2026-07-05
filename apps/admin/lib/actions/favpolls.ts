"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type OversightFavpoll = {
  id: string;
  display_name: string;
  category: string | null;
  total_raised: number;
  is_listed: boolean;
  is_exemplar: boolean;
  closed_at: string | null;
  closes_at: string | null;
  created_at: string;
};

export async function getAllFavpolls(): Promise<{
  data: OversightFavpoll[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("favpolls")
    .select(
      `id, category, total_raised, is_listed, is_exemplar, closed_at,
       closes_at, created_at, cause_label, protagonist:protagonists ( name )`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { data: null, error: error.message };

  const rows = (data ?? []).map((ev) => ({
    id: ev.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    display_name: (ev.protagonist as any)?.name ?? ev.cause_label ?? "—",
    category: ev.category,
    total_raised: ev.total_raised ?? 0,
    is_listed: ev.is_listed ?? true,
    is_exemplar: ev.is_exemplar ?? false,
    closed_at: ev.closed_at,
    closes_at: ev.closes_at,
    created_at: ev.created_at,
  }));
  return { data: rows, error: null };
}

export async function setListed(
  favpollId: string,
  isListed: boolean,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("favpolls")
    .update({ is_listed: isListed })
    .eq("id", favpollId);

  if (error) return { error: error.message };
  revalidatePath("/favpolls");
  return { error: null };
}

/**
 * Close a favpoll immediately: sets closed_at and freezes total_raised
 * from non-withdrawn pledges (same computation as the close-favpolls
 * cron). Deliberately does NOT send the organiser email — an admin
 * close is an intervention, not the scheduled lifecycle event.
 */
export async function closeFavpollNow(
  favpollId: string,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { data: pledgeRows, error: pledgeErr } = await supabase
    .from("pledges")
    .select("total_amount, favpoll_polls!inner(favpoll_id)")
    .eq("favpoll_polls.favpoll_id", favpollId)
    .is("withdrawn_at", null);

  if (pledgeErr) return { error: pledgeErr.message };

  const totalRaised = (pledgeRows ?? []).reduce(
    (sum: number, row: { total_amount: number }) =>
      sum + (row.total_amount ?? 0),
    0,
  );

  const { error } = await supabase
    .from("favpolls")
    .update({ closed_at: new Date().toISOString(), total_raised: totalRaised })
    .eq("id", favpollId);

  if (error) return { error: error.message };
  revalidatePath("/favpolls");
  return { error: null };
}
