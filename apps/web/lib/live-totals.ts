import type { SupabaseClient } from "@supabase/supabase-js"

// favpolls.total_raised is a settlement figure — written once, at close, by
// the close cron — so it reads £0 for a favpoll's entire live life. The poll
// page computes its live total per-poll by summing non-withdrawn pledges;
// card lists get the same numbers here via the favpoll_live_totals RPC in
// one round trip. Closed favpolls keep their stored settlement figure.
type WithTotal = {
  id: string
  closed_at?: string | null
  total_raised: number
}

export async function withLiveTotals<T extends WithTotal>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  favpolls: T[]
): Promise<T[]> {
  const liveIds = favpolls.filter((f) => !f.closed_at).map((f) => f.id)
  if (liveIds.length === 0) return favpolls

  const { data } = await supabase.rpc("favpoll_live_totals", {
    p_favpoll_ids: liveIds,
  })

  const totals = new Map<string, number>(
    ((data ?? []) as { favpoll_id: string; raised: number }[]).map((r) => [
      r.favpoll_id,
      Number(r.raised),
    ])
  )

  return favpolls.map((f) =>
    f.closed_at ? f : { ...f, total_raised: totals.get(f.id) ?? 0 }
  )
}
