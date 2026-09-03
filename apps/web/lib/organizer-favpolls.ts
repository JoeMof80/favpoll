import type { OrganizerFavpoll } from "@/components/organizer-row/utils"

// ONE column list and ONE base mapping for the organiser surfaces — the
// console list (app/my-favpolls) and the manage hub
// (app/favpolls/[id]/manage) read the same favpoll shape. Extracted
// 2026-09-03: the manage page shipped shadowing the list's select, and
// two copies of the same shape is how they drift.
//
// The manage hub's select EXTENDS this (created_by, the ledger fields,
// wider joins) and spreads mapOrganizerFavpoll before its own extras —
// its raw row is a structural superset, so the mapper takes it as-is.

export const ORGANIZER_FAVPOLL_COLUMNS = `
  id,
  live_slug,
  short_code,
  opening_line,
  closes_at,
  closed_at,
  occasion_type,
  category,
  grouping,
  subject,
  cause_label,
  total_raised,
  goal_amount,
  is_listed,
  allow_guest_items,
  created_at`

export type RawOrganizerRow = {
  id: string
  live_slug: string
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
  allow_guest_items: boolean | null
  created_at: string
  protagonists: { name: string } | null
  favpoll_charities: {
    charities: OrganizerFavpoll["charities"][number]["charity"]
  }[]
  favpoll_polls: {
    id: string
    personal_reveal: string | null
    topics: { title: string } | null
    pledges: { count: number }[]
  } | null
  favpoll_pots: { total_deposited: number; total_allocated: number } | null
}

export function mapOrganizerFavpoll(ev: RawOrganizerRow): OrganizerFavpoll {
  return {
    id: ev.id,
    live_slug: ev.live_slug,
    short_code: ev.short_code,
    opening_line: ev.opening_line,
    closes_at: ev.closes_at,
    closed_at: ev.closed_at,
    occasion_type: ev.occasion_type,
    category: ev.category,
    grouping: ev.grouping,
    subject: ev.subject,
    cause_label: ev.cause_label,
    total_raised: ev.total_raised,
    goal_amount: ev.goal_amount ?? null,
    is_listed: ev.is_listed ?? true,
    allow_guest_items: ev.allow_guest_items ?? true,
    created_at: ev.created_at,
    protagonist: ev.protagonists ? { name: ev.protagonists.name } : null,
    charities: ev.favpoll_charities.map((ec) => ({ charity: ec.charities })),
    poll: ev.favpoll_polls
      ? { id: ev.favpoll_polls.id, topic: ev.favpoll_polls.topics ?? null }
      : null,
    pot: ev.favpoll_pots ?? null,
    pledge_count: ev.favpoll_polls?.pledges?.[0]?.count ?? 0,
    has_reveal: !!ev.favpoll_polls?.personal_reveal,
  }
}
