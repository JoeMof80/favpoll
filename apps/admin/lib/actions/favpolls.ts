"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export type OversightFavpoll = {
  id: string
  display_name: string
  category: string | null
  total_raised: number
  is_listed: boolean
  is_exemplar: boolean
  closed_at: string | null
  closes_at: string | null
  created_at: string
  /** Ascending by id — the deterministic order the Gift Aid split uses */
  charities: { id: string; name: string }[]
}

export async function getAllFavpolls(): Promise<{
  data: OversightFavpoll[] | null
  error: string | null
  /** Every favpoll on the platform, not just the page below. The list is
   *  capped at 200 and the footer used to print that cap as if it were the
   *  total — so 199 E2E rows plus one real one read as "200 of 200" and the
   *  backlog behind it was invisible (founder, 2026-10-25). */
  total: number
}> {
  const supabase = createAdminClient()

  const {
    data,
    error,
    count: total,
  } = await supabase
    .from("favpolls")
    .select(
      `id, category, total_raised, is_listed, is_exemplar, closed_at,
       closes_at, created_at, cause_label, protagonist:protagonists ( name ),
       favpoll_charities ( charity_id, charities ( name ) )`,
      // The count comes back with the page — PostgREST counts every matching
      // row, not just the limited slice — so the honest total costs no extra
      // round trip and the mocked call order in the tests is unchanged.
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return { data: null, error: error.message, total: total ?? 0 }

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
    charities: (
      (ev.favpoll_charities ?? []) as unknown as {
        charity_id: string
        charities: { name: string } | null
      }[]
    )
      .map((fc) => ({ id: fc.charity_id, name: fc.charities?.name ?? "—" }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  }))
  return { data: rows, error: null, total: total ?? rows.length }
}

export async function setListed(
  favpollId: string,
  isListed: boolean
): Promise<{ error: string | null }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("favpolls")
    .update({ is_listed: isListed })
    .eq("id", favpollId)

  if (error) return { error: error.message }
  revalidatePath("/favpolls")
  return { error: null }
}

/**
 * Close a favpoll immediately: sets closed_at and freezes total_raised
 * from non-withdrawn pledges (same computation as the close-favpolls
 * cron). Deliberately does NOT send the organiser email — an admin
 * close is an intervention, not the scheduled lifecycle event.
 */
export async function closeFavpollNow(
  favpollId: string
): Promise<{ error: string | null }> {
  const supabase = createAdminClient()

  const { data: pledgeRows, error: pledgeErr } = await supabase
    .from("pledges")
    .select("total_amount, favpoll_polls!inner(favpoll_id)")
    .eq("favpoll_polls.favpoll_id", favpollId)
    .is("withdrawn_at", null)

  if (pledgeErr) return { error: pledgeErr.message }

  const totalRaised = (pledgeRows ?? []).reduce(
    (sum: number, row: { total_amount: number }) =>
      sum + (row.total_amount ?? 0),
    0
  )

  const { error } = await supabase
    .from("favpolls")
    .update({ closed_at: new Date().toISOString(), total_raised: totalRaised })
    .eq("id", favpollId)

  if (error) return { error: error.message }
  revalidatePath("/favpolls")
  return { error: null }
}
