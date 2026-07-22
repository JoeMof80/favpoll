export type PublicStatusFilter = "all" | "live" | "closed"
export type PublicSortKey =
  | "closing_soonest"
  | "recently_created"
  | "highest_raised"

type Filterable = {
  closes_at: string
  closed_at?: string | null
  created_at?: string
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

export type FavpollGroup<T> = { label: string | null; items: T[] }

const DAY = 86_400_000

// Date-based sorts read better in sections; the ranked sort doesn't (its
// order already says it — headers would add ink without information).
// Under "Closing soonest", closed favpolls fall to their own group at the
// END: ascending closes_at would otherwise lead the list with the past.
export function groupPublic<T extends Filterable>(
  sorted: T[],
  sort: PublicSortKey,
  now: Date = new Date()
): FavpollGroup<T>[] {
  if (sort === "highest_raised" || sorted.length === 0) {
    return [{ label: null, items: sorted }]
  }

  const sequential = (items: T[], labelFor: (fp: T) => string) => {
    const groups: FavpollGroup<T>[] = []
    for (const fp of items) {
      const label = labelFor(fp)
      const last = groups[groups.length - 1]
      if (last && last.label === label) last.items.push(fp)
      else groups.push({ label, items: [fp] })
    }
    return groups
  }

  if (sort === "closing_soonest") {
    const live = sorted.filter((fp) => isLiveFavpoll(fp, now))
    const closed = sorted.filter((fp) => !isLiveFavpoll(fp, now))
    const groups = sequential(live, (fp) => {
      const ms = new Date(fp.closes_at).getTime() - now.getTime()
      if (ms <= DAY) return "Closing today"
      if (ms <= 7 * DAY) return "Closing this week"
      return "Closing later"
    })
    if (closed.length > 0) {
      // most recently closed first — the freshest results lead the archive
      groups.push({ label: "Closed", items: [...closed].reverse() })
    }
    return groups
  }

  // recently_created (input order is created_at desc)
  return sequential(sorted, (fp) => {
    const created = fp.created_at ? new Date(fp.created_at).getTime() : 0
    const age = now.getTime() - created
    if (age <= 7 * DAY) return "New this week"
    if (age <= 31 * DAY) return "This month"
    return "Earlier"
  })
}
