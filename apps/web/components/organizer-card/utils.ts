export type OrganizerCardFavpoll = {
  id: string
  opening_line: string
  closes_at: string
  closed_at: string | null
  occasion_type: string | null
  category: string | null
  grouping: string | null
  subject: string
  cause_label: string | null
  total_raised: number
  is_listed: boolean
  created_at: string
  protagonist: { name: string } | null
  charities: {
    charity: {
      id: string
      name: string
      logo_url: string | null
      registered_number: string | null
      description: string | null
      created_at: string
    }
  }[]
  poll: { id: string; topic: { title: string } | null } | null
  pot: { total_deposited: number; total_allocated: number } | null
}

export type StatusFilter = "all" | "active" | "closed"
export type SortKey = "closing_soonest" | "recently_created" | "highest_raised"

export const WARNING_THRESHOLD_DAYS = 7

export function isFavpollClosed(
  fp: OrganizerCardFavpoll,
  now: Date = new Date()
): boolean {
  return !!fp.closed_at || new Date(fp.closes_at) < now
}

export function daysRemaining(
  closesAt: string,
  now: Date = new Date()
): number {
  return Math.ceil(
    (new Date(closesAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
}

export function filterAndSort(
  favpolls: OrganizerCardFavpoll[],
  status: StatusFilter,
  sort: SortKey,
  now: Date = new Date()
): OrganizerCardFavpoll[] {
  const filtered = favpolls.filter((fp) => {
    const closed = isFavpollClosed(fp, now)
    if (status === "active") return !closed
    if (status === "closed") return closed
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
  // recently_created: preserve server order (created_at desc)

  return sorted
}
