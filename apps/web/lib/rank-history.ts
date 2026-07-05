// Rank-over-time derivation for the bump chart ("Purple rising 5th → 1st").
// Reconstructs ordinal standings from timestamped pledge allocations — no
// snapshot table needed. Ordinal only: amounts never leave this module, so
// the chart is safe for the memorial register and the amounts-private
// default (growth doc §9).

export type PledgeEvent = {
  createdAt: string
  /** favourite_id → amount pledged in this event */
  allocations: { favouriteId: string; amount: number }[]
}

export type RankPoint = { step: number; rank: number }

export type RankSeries = {
  favouriteId: string
  label: string
  finalRank: number
  points: RankPoint[]
}

export type RankHistory = {
  series: RankSeries[]
  /** Number of pledge events (steps) — the x-axis length */
  steps: number
  /** Lead-change annotations: the step at which a new favourite took #1 */
  leadChanges: { step: number; favouriteId: string; label: string }[]
}

/**
 * Collapse a per-event rank series to its inflection points: keep the
 * first and last, and any corner of a flat run (rank differs from the
 * previous or next point). A 110-pledge poll where a favourite barely
 * moves becomes a handful of points, so the chart reads as clean steps
 * instead of a dense dotted band.
 */
function simplifyPoints(points: RankPoint[]): RankPoint[] {
  if (points.length <= 2) return points
  const kept: RankPoint[] = []
  for (let i = 0; i < points.length; i++) {
    if (
      i === 0 ||
      i === points.length - 1 ||
      points[i].rank !== points[i - 1].rank ||
      points[i].rank !== points[i + 1].rank
    ) {
      kept.push(points[i])
    }
  }
  return kept
}

/**
 * Build rank-over-time from pledge events. Only favourites that ever
 * receive a pledge appear. Ranks are dense (ties share a rank, next rank
 * skips) and recomputed after each event. Events are sorted by time; the
 * result has one step per event.
 */
export function deriveRankHistory(
  events: PledgeEvent[],
  labels: Record<string, string>
): RankHistory {
  const ordered = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const totals = new Map<string, number>()
  const pointsByFav = new Map<string, RankPoint[]>()
  const leadChanges: RankHistory["leadChanges"] = []
  let currentLeader: string | null = null

  ordered.forEach((event, step) => {
    for (const alloc of event.allocations) {
      totals.set(
        alloc.favouriteId,
        (totals.get(alloc.favouriteId) ?? 0) + alloc.amount
      )
    }

    // Rank every favourite seen so far by cumulative total (desc). Ties
    // break by label for a stable ordering; dense ranking.
    const ranked = [...totals.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return (labels[a[0]] ?? a[0]).localeCompare(labels[b[0]] ?? b[0])
    })

    let rank = 0
    let lastTotal = Number.POSITIVE_INFINITY
    ranked.forEach(([favId, total], i) => {
      if (total < lastTotal) {
        rank = i + 1
        lastTotal = total
      }
      const arr = pointsByFav.get(favId) ?? []
      arr.push({ step, rank })
      pointsByFav.set(favId, arr)
    })

    const leader = ranked[0]?.[0] ?? null
    if (leader && leader !== currentLeader) {
      currentLeader = leader
      leadChanges.push({
        step,
        favouriteId: leader,
        label: labels[leader] ?? leader,
      })
    }
  })

  const series: RankSeries[] = [...pointsByFav.entries()]
    .map(([favouriteId, points]) => ({
      favouriteId,
      label: labels[favouriteId] ?? favouriteId,
      finalRank: points[points.length - 1]?.rank ?? 0,
      points: simplifyPoints(points),
    }))
    .sort((a, b) => a.finalRank - b.finalRank)

  return { series, steps: ordered.length, leadChanges }
}

// ─── Weekly bucketing (topic/record all-time charts) ────────────────────────
// The favpoll chart uses one step per pledge (a single 30-90 day poll). An
// all-time topic chart spans months, so we bucket events into weeks and label
// the axis with real dates — "Purple took the lead in March", not "step 47".

/** Monday 00:00 UTC of the week containing `iso`, as an ISO date string. */
function weekStart(iso: string): string {
  const d = new Date(iso)
  const day = (d.getUTCDay() + 6) % 7 // 0 = Monday
  d.setUTCDate(d.getUTCDate() - day)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export type BucketedEvents = {
  /** One merged event per week that had activity, chronological */
  buckets: PledgeEvent[]
  /** weekStart ISO for each bucket — parallel to `buckets` and to the
   *  RankHistory steps derived from them (used as x-axis labels) */
  bucketDates: string[]
}

/**
 * Merge pledge events into weekly buckets. Each bucket's allocations are the
 * concatenation of that week's events; feeding these to deriveRankHistory
 * yields one cumulative-through-that-week ranking per step.
 */
export function bucketEventsByWeek(events: PledgeEvent[]): BucketedEvents {
  const byWeek = new Map<string, PledgeEvent["allocations"]>()
  for (const e of events) {
    const key = weekStart(e.createdAt)
    const arr = byWeek.get(key) ?? []
    arr.push(...e.allocations)
    byWeek.set(key, arr)
  }
  const weeks = [...byWeek.keys()].sort()
  return {
    buckets: weeks.map((w) => ({ createdAt: w, allocations: byWeek.get(w)! })),
    bucketDates: weeks,
  }
}
