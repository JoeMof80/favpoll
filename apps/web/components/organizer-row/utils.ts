export type OrganizerFavpoll = {
  id: string
  /** Unguessable capability for the live display URL (/live/[slug]) */
  live_slug: string
  /**
   * 12-char code behind the short QR target (/p/[code]). QR-ONLY — the link
   * an organiser copies stays /favpolls/<id>. See the migration
   * 20260806100000_favpoll_short_code.sql.
   */
  short_code: string
  opening_line: string
  closes_at: string
  closed_at: string | null
  occasion_type: string | null
  category: string | null
  grouping: string | null
  subject: string
  cause_label: string | null
  total_raised: number
  goal_amount: number | null
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
  pledge_count: number
  has_reveal: boolean
}

export type StatusFilter = "all" | "active" | "closed"
export type SortKey = "closing_soonest" | "recently_created" | "highest_raised"

export const WARNING_THRESHOLD_DAYS = 7

export function isFavpollClosed(
  fp: OrganizerFavpoll,
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
  favpolls: OrganizerFavpoll[],
  status: StatusFilter,
  sort: SortKey,
  query = "",
  now: Date = new Date()
): OrganizerFavpoll[] {
  const q = query.trim().toLowerCase()
  const filtered = favpolls.filter((fp) => {
    const closed = isFavpollClosed(fp, now)
    if (status === "active" && closed) return false
    if (status === "closed" && !closed) return false
    if (q) {
      const haystack = [
        fp.protagonist?.name,
        fp.cause_label,
        fp.opening_line,
        fp.poll?.topic?.title,
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
  // recently_created: preserve server order (created_at desc)

  return sorted
}
