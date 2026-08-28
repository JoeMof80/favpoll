import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { deriveRegister } from "@/lib/registers"
import type {
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
} from "@favpoll/types"
import type { Register } from "@/lib/registers"

// The one query behind every "Open right now" shelf.
//
// Lifted out of app/page.tsx on 2026-08-28, when the register pages wanted
// the same shelf filtered to their own register. It is ~90 lines of select,
// row types and topic normalisation, and four copies of it would have drifted
// the first time a column moved.
//
// FILTERED IN JS, NOT SQL, and deliberately. The register is not a column —
// it is derived from category, grouping and subject by deriveRegister, and
// the celebration case is "everything that is not a memorial, a fundraiser or
// a cause", which is a clause nobody wants to maintain twice. Fetching a
// wider page and filtering with the product's OWN function means this cannot
// disagree with the wizard, the display or the keepsake about what register a
// favpoll is in.

export type LiveFavpoll = Awaited<ReturnType<typeof fetchLiveFavpolls>>[number]

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

export async function fetchLiveFavpolls({
  registers,
  limit = 6,
}: { registers?: readonly Register[]; limit?: number } = {}) {
  const supabase = createAdminClient()

  // Over-fetch when filtering: the limit has to survive the JS filter, and a
  // register with few open favpolls would otherwise come back empty because
  // the first `limit` rows happened to be other registers.
  const fetchLimit = registers ? limit * 8 : limit

  const { data: favpolls } = await supabase
    .from("favpolls")
    .select(
      `
      id,
      opening_line,
      description,
      closes_at,
      occasion_type,
      total_raised,
      subject,
      cause_label,
      category,
      grouping,
      protagonist:protagonists ( name, photo_url ),
      charities:favpoll_charities (
        charity:charities ( id, name, logo_url, registered_number )
      ),
      favpoll_polls (
        id,
        topic_id,
        topics (
          title,
          is_finite,
          favourites ( id, label )
        ),
        favpoll_poll_favourites (
          favourites ( id, label )
        )
      )
    `
    )
    .eq("is_private", false)
    .eq("is_listed", true)
    .is("closed_at", null)
    .gt("closes_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(fetchLimit)

  type RawFavourite = { id: string; label: string }
  type RawEpf = { favourites: RawFavourite }
  type RawPoll = {
    id: string
    topic_id: string | null
    topics: {
      title: string
      is_finite: boolean
      favourites: RawFavourite[]
    } | null
    favpoll_poll_favourites: RawEpf[]
  }
  type RawFavpoll = {
    id: string
    opening_line: string
    description: string | null
    closes_at: string
    occasion_type: string | null
    total_raised: number
    subject: string | null
    cause_label: string | null
    category: string | null
    grouping: string | null
    protagonist: { name: string; photo_url: string | null } | null // null for cause favpolls
    charities: { charity: import("@favpoll/types").Charity }[]
    favpoll_polls: RawPoll | null
  }

  // Live favpolls carry a settlement total_raised of 0 until close — overlay
  // the real sums so the carousel cards and the hero's "raised by open
  // favpolls" stat are live (see lib/live-totals).
  const withTotals = await withLiveTotals(
    supabase,
    (favpolls ?? []) as unknown as RawFavpoll[]
  )

  const normalised = withTotals.map((ev) => {
    const rawPoll = ev.favpoll_polls ?? null
    let poll: {
      id: string
      topic_id: string | null
      topic: { title: string; favourites: RawFavourite[] } | null
    } | null = null
    if (rawPoll) {
      const isFinite = rawPoll.topics?.is_finite ?? false
      const favourites = isFinite
        ? (rawPoll.topics?.favourites ?? [])
        : (rawPoll.favpoll_poll_favourites ?? [])
            .map((epf) => epf.favourites)
            .filter(Boolean)
      poll = {
        id: rawPoll.id,
        topic_id: rawPoll.topic_id,
        topic: rawPoll.topics
          ? { title: rawPoll.topics.title, favourites }
          : null,
      }
    }
    return { ...ev, poll }
  })

  const filtered = registers
    ? normalised.filter((f) =>
        registers.includes(
          deriveRegister(
            (f.category ?? null) as FavpollCategory | null,
            (f.grouping ?? "individual") as FavpollGrouping,
            (f.subject ?? undefined) as FavpollSubject | undefined
          )
        )
      )
    : normalised

  return filtered.slice(0, limit)
}
