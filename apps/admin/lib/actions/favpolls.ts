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

/** What one page of the oversight list holds. The list is a slice and says
 *  so; search is what finds things beyond it. */
const PAGE_LIMIT = 200

type RawRow = {
  id: string
  category: string | null
  total_raised: number | null
  is_listed: boolean | null
  is_exemplar: boolean | null
  closed_at: string | null
  closes_at: string | null
  created_at: string
  cause_label: string | null
  protagonist: { name: string } | { name: string }[] | null
  favpoll_charities?: {
    charity_id: string
    charities: { name: string } | null
  }[]
}

function toRows(data: unknown[]): OversightFavpoll[] {
  return (data as RawRow[]).map((ev) => {
    const p = Array.isArray(ev.protagonist) ? ev.protagonist[0] : ev.protagonist
    return {
      id: ev.id,
      display_name: p?.name ?? ev.cause_label ?? "—",
      category: ev.category,
      total_raised: ev.total_raised ?? 0,
      is_listed: ev.is_listed ?? true,
      is_exemplar: ev.is_exemplar ?? false,
      closed_at: ev.closed_at,
      closes_at: ev.closes_at,
      created_at: ev.created_at,
      charities: (ev.favpoll_charities ?? [])
        .map((fc) => ({ id: fc.charity_id, name: fc.charities?.name ?? "—" }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    }
  })
}

export type FavpollQuery = {
  /** Matches the display name — a protagonist's name OR a cause label. */
  q?: string
  status?: "all" | "open" | "closed"
}

// THE SEARCH RUNS IN THE DATABASE (founder, 2026-10-25: "why does the favpoll
// page only show one page of 200?"). The 200 came in with the page itself
// (#179) when the platform held a dozen favpolls; by October it held 3,548.
// The list being a slice was the visible half of that. The DANGEROUS half was
// the search box, which filtered the 200 rows already loaded — so anything
// created more than two hundred favpolls ago returned nothing, which looks
// exactly like an answer.
//
// TWO QUERIES, NOT ONE `or`. A favpoll's name is its protagonist's name or
// its cause label, and PostgREST cannot put an embedded resource's column
// inside an `or` — so the protagonist side filters through an inner join and
// the two result sets are merged. They cannot overlap: a favpoll has one or
// the other, never both.
export async function getAllFavpolls(query: FavpollQuery = {}): Promise<{
  data: OversightFavpoll[] | null
  error: string | null
  /** Every favpoll MATCHING THE QUERY, not just the page below. The list is
   *  capped and the footer used to print that cap as if it were the total —
   *  so 199 E2E rows plus one real one read as "200 of 200" and the backlog
   *  behind it was invisible (founder, 2026-10-25). */
  total: number
}> {
  const supabase = createAdminClient()
  const q = query.q?.trim()
  const status = query.status ?? "all"

  const SELECT = `id, category, total_raised, is_listed, is_exemplar, closed_at,
       closes_at, created_at, cause_label, protagonist:protagonists ( name ),
       favpoll_charities ( charity_id, charities ( name ) )`

  /** The status predicate, applied to whichever builder is being assembled.
   *  Typed structurally rather than with the client's generated builder
   *  types, which do not survive the `select(…)` string being a variable. */
  type StatusFilterable<T> = {
    is: (column: string, value: null) => T
    not: (column: string, operator: string, value: null) => T
  }
  const withFilters = <T extends StatusFilterable<T>>(b: T): T => {
    if (status === "open") return b.is("closed_at", null)
    if (status === "closed") return b.not("closed_at", "is", null)
    return b
  }

  // Without a search term one query answers it.
  if (!q) {
    const { data, error, count } = await withFilters(
      supabase.from("favpolls").select(SELECT, { count: "exact" })
    )
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT)

    if (error) return { data: null, error: error.message, total: count ?? 0 }
    return { data: toRows(data ?? []), error: null, total: count ?? 0 }
  }

  const like = `%${q}%`
  const [byCause, byProtagonist] = await Promise.all([
    withFilters(supabase.from("favpolls").select(SELECT, { count: "exact" }))
      .ilike("cause_label", like)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
    withFilters(
      supabase
        .from("favpolls")
        .select(
          `${SELECT.replace("protagonist:protagonists ( name )", "protagonist:protagonists!inner ( name )")}`,
          {
            count: "exact",
          }
        )
    )
      .ilike("protagonists.name", like)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
  ])

  const error = byCause.error ?? byProtagonist.error
  if (error) return { data: null, error: error.message, total: 0 }

  const rows = toRows([...(byCause.data ?? []), ...(byProtagonist.data ?? [])])
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at))
  return {
    data: rows.slice(0, PAGE_LIMIT),
    error: null,
    total: (byCause.count ?? 0) + (byProtagonist.count ?? 0),
  }
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
