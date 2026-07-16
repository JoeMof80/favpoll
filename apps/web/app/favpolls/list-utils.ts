export type PublicStatusFilter = "all" | "live" | "closed"
export type PublicSortKey =
  | "closing_soonest"
  | "recently_created"
  | "highest_raised"

type Filterable = {
  closes_at: string
  closed_at?: string | null
  total_raised: number
  cause_label?: string | null
  opening_line: string
  protagonist: { name: string } | null
  charities: { charity: { name: string } }[]
  poll: { topic: { title: string } | null } | null
}

export function isLiveFavpoll(
  fp: { closes_at: string; closed_at?: string | null },
  now: Date = new Date()
): boolean {
  return !fp.closed_at && new Date(fp.closes_at) > now
}

// Same grammar as the organiser page's filterAndSort: status, then a
// free-text query over the human-readable fields, then sort. Input order
// is created_at desc, which "recently_created" preserves.
export function filterAndSortPublic<T extends Filterable>(
  favpolls: T[],
  status: PublicStatusFilter,
  sort: PublicSortKey,
  query = "",
  now: Date = new Date()
): T[] {
  const q = query.trim().toLowerCase()
  const filtered = favpolls.filter((fp) => {
    const live = isLiveFavpoll(fp, now)
    if (status === "live" && !live) return false
    if (status === "closed" && live) return false
    if (q) {
      const haystack = [
        fp.protagonist?.name,
        fp.cause_label,
        fp.opening_line,
        fp.poll?.topic?.title,
        ...fp.charities.map((c) => c.charity.name),
      ]
      return haystack.some((s) => s?.toLowerCase().includes(q))
    }
    return true
  })

  const sorted = [...filtered]
  if (sort === "closing_soonest") {
    sorted.sort(
      (a, b) =>
        new Date(a.closes_at).getTime() - new Date(b.closes_at).getTime()
    )
  } else if (sort === "highest_raised") {
    sorted.sort((a, b) => b.total_raised - a.total_raised)
  }
  return sorted
}
