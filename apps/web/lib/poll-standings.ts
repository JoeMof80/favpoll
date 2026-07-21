import type { SupabaseClient } from "@supabase/supabase-js"
import { fetchAllRows } from "@/lib/supabase/paginate"

// Per-poll standings: the sum and count of non-withdrawn pledge allocations
// per favourite, for one poll. POLL SURFACES SHOW THIS POLL'S NUMBERS — the
// poll page, the live display and the card results all put these on their
// bars, so the bars always sum to the favpoll's raised figure (the demo
// card and the Watch-it-live room teach exactly that). The all-time record
// standings live on /record and the topic pages, nowhere else.
//
// Overlaying replaces items' all_time_pledged / all_time_count fields —
// RankingList and the sort comparators read those names, so poll surfaces
// reuse them as "this poll's pledged / count" rather than forking the
// Favourite shape.

export type PollStandings = {
  totals: Map<string, number>
  counts: Map<string, number>
}

const EMPTY: PollStandings = { totals: new Map(), counts: new Map() }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>

/** Standings for a set of polls in two queries, keyed by poll id. */
export async function pollSetStandings(
  supabase: Client,
  pollIds: string[]
): Promise<Map<string, PollStandings>> {
  const byPoll = new Map<string, PollStandings>()
  if (pollIds.length === 0) return byPoll

  // Paginated (fetchAllRows): a popular poll's pledges/allocations exceed
  // PostgREST's 1,000-row default cap, which truncates SILENTLY — bars
  // would under-report.
  const pledges = await fetchAllRows<{ id: string; favpoll_poll_id: string }>(
    (from, to) =>
      supabase
        .from("pledges")
        .select("id, favpoll_poll_id")
        .in("favpoll_poll_id", pollIds)
        .is("withdrawn_at", null)
        .range(from, to)
  )

  const pledgeToPoll = new Map(pledges.map((p) => [p.id, p.favpoll_poll_id]))
  if (pledgeToPoll.size === 0) return byPoll

  const allocations = await fetchAllRows<{
    pledge_id: string
    favourite_id: string
    amount: number | null
  }>((from, to) =>
    supabase
      .from("pledge_allocations")
      .select("pledge_id, favourite_id, amount")
      .in("pledge_id", [...pledgeToPoll.keys()])
      .range(from, to)
  )

  for (const row of allocations) {
    const pollId = pledgeToPoll.get(row.pledge_id)
    if (!pollId) continue
    let standings = byPoll.get(pollId)
    if (!standings) {
      standings = { totals: new Map(), counts: new Map() }
      byPoll.set(pollId, standings)
    }
    standings.totals.set(
      row.favourite_id,
      (standings.totals.get(row.favourite_id) ?? 0) + (row.amount ?? 0)
    )
    standings.counts.set(
      row.favourite_id,
      (standings.counts.get(row.favourite_id) ?? 0) + 1
    )
  }
  return byPoll
}

/** Standings for a single poll. */
export async function pollStandings(
  supabase: Client,
  pollId: string
): Promise<PollStandings> {
  const byPoll = await pollSetStandings(supabase, [pollId])
  return byPoll.get(pollId) ?? EMPTY
}

/**
 * Replace items' all_time_pledged / all_time_count with this poll's numbers
 * (see the module comment for why the field names are reused).
 */
export function overlayStandings<
  T extends { id: string; all_time_pledged: number; all_time_count: number },
>(items: T[], standings: PollStandings): T[] {
  return items.map((item) => ({
    ...item,
    all_time_pledged: standings.totals.get(item.id) ?? 0,
    all_time_count: standings.counts.get(item.id) ?? 0,
  }))
}
