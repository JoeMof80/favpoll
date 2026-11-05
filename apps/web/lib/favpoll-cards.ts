import { pollTitle } from "@/lib/poll-title"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { deriveRegister } from "@/lib/registers"
import type {
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
} from "@favpoll/types"
import type { Register } from "@/lib/registers"

// THE ONE QUERY BEHIND THE CARDS. The /favpolls page's select and
// normalisation, lifted out of app/favpolls/page.tsx on 2026-11-05 when
// the home shelf and the three register pages stopped showing a carousel
// of summary cards and started showing a sample of the /favpolls cards
// themselves (founder: "rather than the carousel, should the homepage show
// a sample from the favpolls page?"). The page keeps its filters, its
// exemplar fallback and its pledged-results pass; this holds what the two
// share, so a column cannot move on one and not the other.
//
// It replaced lib/live-favpolls.ts (2026-08-28 → 2026-11-05), whose shape
// the register filter below keeps: FILTERED IN JS BY deriveRegister, not
// in SQL, because the register is not a column and the celebration case
// is "everything that is not a memorial, a fundraiser or a cause" — a
// clause nobody wants to maintain twice.

export const FAVPOLL_CARD_SELECT = `
  id,
  subject,
  cause_label,
  category,
  grouping,
  opening_line,
  description,
  closes_at,
  closed_at,
  created_at,
  occasion_type,
  total_raised,
  is_exemplar,
  allow_guest_items,
  show_guest_amounts,
  photo_url,
  banner_url,
  protagonist:protagonists ( name, photo_url, about ),
  charities:favpoll_charities (
    charity:charities ( id, name, logo_url, registered_number, impact_statement )
  ),
  favpoll_polls (
    id,
    topic_id,
    subset_id,
    personal_note,
    topics (
      title,
      is_finite,
      favourites ( id, label )
    ),
    topic_subsets ( title ),
    favpoll_poll_favourites (
      favourites ( id, label )
    )
  )
`

export type RawFavourite = { id: string; label: string }
type RawEpf = { favourites: RawFavourite }
export type RawPoll = {
  id: string
  topic_id: string | null
  subset_id?: string | null
  topic_subsets?: { title: string } | { title: string }[] | null
  personal_note: string | null
  topics: {
    title: string
    is_finite: boolean
    favourites: RawFavourite[]
  } | null
  favpoll_poll_favourites: RawEpf[]
}
export type RawFavpoll = {
  id: string
  subject: string
  cause_label: string | null
  category: string | null
  grouping: string | null
  opening_line: string
  description: string | null
  closes_at: string
  closed_at: string | null
  created_at: string
  occasion_type: string | null
  total_raised: number
  is_exemplar: boolean
  allow_guest_items: boolean | null
  show_guest_amounts: boolean | null
  photo_url: string | null
  banner_url: string | null
  protagonist: {
    name: string
    photo_url: string | null
    about: string | null
  } | null
  charities: { charity: import("@favpoll/types").Charity }[]
  favpoll_polls: RawPoll | null
}

export type FavpollCardPoll = {
  id: string
  topic_id: string | null
  /** Content-free: the flip card's step 3 promises the personal
   *  note when one exists (2026-09-17). Never the text itself. */
  has_note: boolean
  topic: {
    title: string
    is_finite: boolean
    favourites: RawFavourite[]
  } | null
}

export type FavpollCard = Omit<RawFavpoll, "favpoll_polls"> & {
  poll: FavpollCardPoll | null
}

/** The row as the list card wants it: one poll, its favourites resolved. */
export function normaliseFavpollCard(fp: RawFavpoll): FavpollCard {
  const rawPoll = fp.favpoll_polls ?? null
  let poll: FavpollCardPoll | null = null
  if (rawPoll) {
    const isFinite = rawPoll.topics?.is_finite ?? false
    const epiItems = (rawPoll.favpoll_poll_favourites ?? [])
      .map((epf) => epf.favourites)
      .filter(Boolean)
    // Catalogue fallback: non-finite topics with no poll-specific items
    // fall back to the catalogue's own favourites (same fix as the
    // detail page — founder, 2026-09-22).
    // A subset poll carries its rows whatever the parent's openness.
    const favourites =
      isFinite && !rawPoll.subset_id
        ? (rawPoll.topics?.favourites ?? [])
        : epiItems.length > 0
          ? epiItems
          : (rawPoll.topics?.favourites ?? [])
    poll = {
      id: rawPoll.id,
      topic_id: rawPoll.topic_id,
      has_note: !!rawPoll.personal_note,
      topic: rawPoll.topics
        ? {
            // The subset's name (favpoll-topic-rules §1, ruling 4).
            title: pollTitle(rawPoll) ?? rawPoll.topics.title,
            is_finite: isFinite,
            favourites,
          }
        : null,
    }
  }
  const { favpoll_polls: _stripped, ...rest } = fp
  return { ...rest, poll }
}

/**
 * A page's registers. /celebrations is TWO of them — celebrating_one and
 * celebrating_many — because deriveRegister splits a birthday from a wedding
 * and both belong on the same page. Kept here rather than at the call sites
 * so three pages cannot each remember it differently.
 */
export const REGISTERS_BY_PAGE = {
  memorials: ["remembering"],
  celebrations: ["celebrating_one", "celebrating_many"],
  fundraisers: ["cause"],
} as const satisfies Record<string, readonly Register[]>

/**
 * The shelf's sample: open favpolls, soonest to close first, so the
 * section earns its "Open right now" heading and the sample changes on
 * its own. Over-fetches when filtering so a register with few open
 * favpolls does not come back empty because the first `limit` rows
 * happened to be other registers.
 */
export async function fetchOpenFavpollCards({
  registers,
  limit = 8,
}: { registers?: readonly Register[]; limit?: number } = {}) {
  const supabase = createAdminClient()
  const fetchLimit = registers ? limit * 8 : limit

  const { data } = await supabase
    .from("favpolls")
    .select(FAVPOLL_CARD_SELECT)
    .eq("is_private", false)
    .eq("is_listed", true)
    .is("closed_at", null)
    .gt("closes_at", new Date().toISOString())
    .order("closes_at", { ascending: true })
    .limit(fetchLimit)

  const withTotals = await withLiveTotals(
    supabase,
    (data ?? []) as unknown as RawFavpoll[]
  )
  const cards = withTotals.map(normaliseFavpollCard)

  const filtered = registers
    ? cards.filter((f) =>
        registers.includes(
          deriveRegister(
            (f.category ?? null) as FavpollCategory | null,
            (f.grouping ?? "individual") as FavpollGrouping,
            (f.subject ?? undefined) as FavpollSubject | undefined
          )
        )
      )
    : cards

  return filtered.slice(0, limit)
}
