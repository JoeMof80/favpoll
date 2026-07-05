"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type DashboardStats = {
  favpolls_total: number;
  favpolls_open: number;
  favpolls_closed: number;
  pledges_count: number;
  total_pledged: number;
  total_tips: number;
  pending_contributions: number;
  active_charities: number;
  charity_issues: number;
  drafts_to_review: number;
};

export type RecentFavpoll = {
  id: string;
  display_name: string;
  category: string | null;
  total_raised: number;
  closed_at: string | null;
  created_at: string;
};

export type RecentPledge = {
  id: string;
  total_amount: number;
  tip_amount: number;
  created_at: string;
  favpoll_name: string;
};

export async function getDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) return { data: null, error: error.message };
  return { data: data as DashboardStats, error: null };
}

export async function getRecentFavpolls(): Promise<{
  data: RecentFavpoll[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("favpolls")
    .select(
      `id, category, total_raised, closed_at, created_at, cause_label,
       protagonist:protagonists ( name )`,
    )
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) return { data: null, error: error.message };

  const rows = (data ?? []).map((ev) => ({
    id: ev.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    display_name: (ev.protagonist as any)?.name ?? ev.cause_label ?? "—",
    category: ev.category,
    total_raised: ev.total_raised ?? 0,
    closed_at: ev.closed_at,
    created_at: ev.created_at,
  }));
  return { data: rows, error: null };
}

export async function getRecentPledges(): Promise<{
  data: RecentPledge[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pledges")
    .select(
      `id, total_amount, tip_amount, created_at,
       favpoll_polls!inner(favpolls!inner(cause_label, protagonists!favpolls_protagonist_id_fkey(name)))`,
    )
    .is("withdrawn_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) return { data: null, error: error.message };

  const rows = (data ?? []).map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const favpoll = (p.favpoll_polls as any)?.favpolls;
    return {
      id: p.id,
      total_amount: p.total_amount,
      tip_amount: p.tip_amount ?? 0,
      created_at: p.created_at,
      favpoll_name: favpoll?.protagonists?.name ?? favpoll?.cause_label ?? "—",
    };
  });
  return { data: rows, error: null };
}
