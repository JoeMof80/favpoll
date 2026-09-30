import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { RegisterScope } from "@/components/register-scope"
import { PageGround, PRIMARY_WASH } from "@/components/page-ground"
import { paletteForFavpoll } from "@/lib/register-palette"
import {
  ORGANIZER_FAVPOLL_COLUMNS,
  mapOrganizerFavpoll,
  type RawOrganizerRow,
} from "@/lib/organizer-favpolls"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
import type { WallEntry } from "@/components/guest-book"
import { ManageClient, type ManageFavpoll } from "./manage-client"
import { favpollLocks, readLockInputs, lockReason } from "@/lib/favpoll-locks"
import { consentPosture } from "@/lib/charity-consent"
import type { Charity, Favourite } from "@favpoll/types"
import { fetchAllRows } from "@/lib/supabase/paginate"
import { pollStandings } from "@/lib/poll-standings"
import { deriveRankHistory } from "@/lib/rank-history"
import { pledgeTimeline } from "@/components/manage/pledges-over-time"
import { getWizardData } from "@/app/favpolls/new/wizard-data"
import type { TopicWithMeta } from "@favpoll/types"

export const metadata = {
  title: "Manage favpoll — favpoll",
}

// THE MANAGE PAGE: the favpoll's COMPLETE RECORD in administrative
// context — every authored thing in full (including the reveal, visible
// at rest nowhere else), every setting with its control, the share kit.
// Content is read-only here with the toolbar's Edit door into the
// wizard: the wizard stays THE editor. Owner-only.
//
// The base select and mapping are the organiser surfaces' shared ones
// (lib/organizer-favpolls); this page extends them with the ledger
// fields and wider joins.
export default async function ManageFavpollPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()
  const { data: raw } = await supabase
    .from("favpolls")
    .select(
      `${ORGANIZER_FAVPOLL_COLUMNS},
      created_by,
      description,
      photo_url,
      is_private,
      show_guest_amounts,
      appeal_id,
      appeals ( name, charity_id ),
      protagonists!favpolls_protagonist_id_fkey ( name, context, about, photo_url ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number, description, created_at, consent_status, consent_contacted_at, registered_email ) ),
      favpoll_polls (
        id,
        topic_id,
        subset_id,
        personal_note,
        topics ( title, is_finite ),
        topic_subsets ( title ),
        pledges ( count ),
        favpoll_poll_favourites ( id, is_hidden, is_guest_added, favourites ( id, label, source ) )
      ),
      favpoll_pots ( total_deposited, total_allocated )`
    )
    .eq("id", id)
    .single()

  if (!raw) notFound()
  if ((raw as { created_by?: string }).created_by !== userId) {
    redirect("/my-favpolls")
  }

  // The shared row, widened with this page's extras. The join overrides
  // are structural supersets, so mapOrganizerFavpoll takes the row as-is.
  type RawRow = Omit<RawOrganizerRow, "protagonists" | "favpoll_polls"> & {
    created_by: string
    description: string | null
    photo_url: string | null
    is_private: boolean | null
    appeal_id: string | null
    appeals: { name: string; charity_id: string } | null
    protagonists: {
      name: string
      context: string | null
      about: string | null
      photo_url: string | null
    } | null
    favpoll_polls:
      | (NonNullable<RawOrganizerRow["favpoll_polls"]> & {
          topic_id: string | null
          subset_id: string | null
          topics: { title: string; is_finite: boolean | null } | null
          favpoll_poll_favourites: {
            id: string
            is_hidden: boolean | null
            is_guest_added: boolean | null
            favourites: { id: string; label: string; source: string } | null
          }[]
        })
      | null
  }

  const [ev] = await withLiveTotals(supabase, [raw as unknown as RawRow])

  // The guest book, the guest page's own query (capped at 24, newest
  // first) — the organiser is always entitled, so labels always resolve.
  // The manage page shows EVERYTHING: picks AND amounts, regardless of
  // the guest's display choice (not a public surface).
  type WallRow = {
    id: string
    display_name: string | null
    is_anonymous: boolean | null
    clerk_user_id: string | null
    created_at: string
    total_amount: number
    pot_allocation_id: string | null
    message: string | null
    pledge_allocations: { favourites: { label: string } | null }[] | null
  }
  const pollId = ev.favpoll_polls?.id ?? null
  let wallEntries: WallEntry[] = []
  if (pollId) {
    const { data: wallRows } = await supabase
      .from("pledges")
      .select(
        `id, display_name, is_anonymous, clerk_user_id, created_at,
         total_amount, pot_allocation_id, message,
         pledge_allocations ( favourites ( label ) )`
      )
      .eq("favpoll_poll_id", pollId)
      .is("withdrawn_at", null)
      .order("created_at", { ascending: false })
      .limit(24)
    const rows = (wallRows ?? []) as unknown as WallRow[]
    const clerkIds = [
      ...new Set(
        rows.map((r) => r.clerk_user_id).filter((v): v is string => !!v)
      ),
    ]
    const { data: wallUsers } = clerkIds.length
      ? await supabase
          .from("users")
          .select("id, display_name")
          .in("id", clerkIds)
      : { data: [] as { id: string; display_name: string | null }[] }
    const names = Object.fromEntries(
      (wallUsers ?? []).map((u) => [u.id, u.display_name])
    )
    // Organiser sees everything — picks AND amounts (not a public surface)
    wallEntries = rows.map((r) => ({
      id: r.id,
      name: r.is_anonymous
        ? null
        : r.clerk_user_id
          ? (names[r.clerk_user_id] ?? null)
          : (r.display_name ?? null),
      labels: (r.pledge_allocations ?? [])
        .map((a) => a.favourites?.label)
        .filter((l): l is string => typeof l === "string"),
      amount: r.total_amount > 0 ? r.total_amount : undefined,
      message: r.message || null,
      created_at: r.created_at,
    }))
  }
  const isCause = ev.subject === "cause"

  // WHAT THE ROWS MAY CHANGE (step 3, 2026-09-29): the per-field locks
  // the wizard's edit page reads (lib/favpoll-locks), the charity list
  // for the picker (active, plus this favpoll's own — register-added
  // charities sit inactive until approved), and the consent posture.
  const locks = favpollLocks(
    await readLockInputs(supabase, id, pollId, ev.created_by ?? null)
  )
  const { data: activeCharities } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("name")
  const pickerCharities = [...((activeCharities ?? []) as Charity[])]
  for (const ec of ev.favpoll_charities ?? []) {
    const own = ec.charities as unknown as Charity | null
    if (own && !pickerCharities.some((c) => c.id === own.id))
      pickerCharities.push(own)
  }
  // THE DASHBOARD (founder, 2026-09-30): the story of the poll for the
  // organiser — the standings with this poll's numbers, the rank
  // history (the favpoll page draws it for closed polls only, since
  // guests' standings are gated; the organiser is entitled throughout),
  // and the running total by day. One chronological, paginated pass
  // over the pledges feeds the last two.
  type HistoryRow = {
    created_at: string
    total_amount: number | null
    pledge_allocations: {
      amount: number | null
      favourite_id: string
      favourites: { label: string } | null
    }[]
  }
  const [standings, historyRows] = pollId
    ? await Promise.all([
        pollStandings(supabase, pollId),
        fetchAllRows<{
          created_at: string
          total_amount: number | null
          pledge_allocations: unknown
        }>((from, to) =>
          supabase
            .from("pledges")
            .select(
              `created_at, total_amount,
               pledge_allocations ( amount, favourite_id, favourites ( label ) )`
            )
            .eq("favpoll_poll_id", pollId)
            .is("withdrawn_at", null)
            .order("created_at", { ascending: true })
            .range(from, to)
        ),
      ])
    : [
        {
          totals: new Map<string, number>(),
          counts: new Map<string, number>(),
        },
        [],
      ]
  // The client's fallback types say the to-one embed is an array; it is
  // an object at runtime (the favpoll page's own cast).
  const history = historyRows as unknown as HistoryRow[]
  const RANK_HISTORY_MIN_PLEDGES = 8
  let rankHistory = null
  if (history.length >= RANK_HISTORY_MIN_PLEDGES) {
    const labels: Record<string, string> = {}
    const events = history.map((r) => ({
      createdAt: r.created_at,
      allocations: (r.pledge_allocations ?? []).map((a) => {
        labels[a.favourite_id] = a.favourites?.label ?? a.favourite_id
        return { favouriteId: a.favourite_id, amount: a.amount ?? 0 }
      }),
    }))
    rankHistory = deriveRankHistory(events, labels)
  }
  const timeline = pledgeTimeline(history)
  const rankHistoryDates = rankHistory
    ? [...history]
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        .map((r) => r.created_at)
    : null

  const appealName = ev.appeals?.name ?? null
  const charityLockReason = appealName
    ? `Locked — part of ${appealName}.`
    : locks.charity
      ? lockReason(locks, "charity")
      : null
  const topicLockReason = locks.topic ? lockReason(locks, "topic") : null

  // THE TOPIC PICKER's catalogue (step 4, 2026-09-30) — the wizard's own
  // list, loaded only while the topic can still change.
  const isOpen = !ev.closed_at && new Date(ev.closes_at) > new Date()
  let topicPicker: {
    topics: TopicWithMeta[]
    categories: Awaited<ReturnType<typeof getWizardData>>["categories"]
    suggested: TopicWithMeta[]
  } | null = null
  if (isOpen && !locks.topic) {
    const data = await getWizardData()
    const charityIds = (ev.favpoll_charities ?? [])
      .map((ec) => (ec.charities as unknown as { id: string } | null)?.id)
      .filter((v): v is string => !!v)
    const suggestedIds = charityIds.flatMap(
      (c) => data.suggestedTopicIds[c] ?? []
    )
    topicPicker = {
      topics: data.topics,
      categories: data.categories,
      suggested: data.topics.filter((t) => suggestedIds.includes(t.id)),
    }
  }

  const favpoll: ManageFavpoll = {
    ...mapOrganizerFavpoll(ev),
    // ── The record's ledger fields ──
    isPrivate: ev.is_private ?? false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- new column, TS types lag migration
    show_guest_amounts: (ev as any).show_guest_amounts === true,
    context: ev.protagonists?.context ?? null,
    about: (isCause ? ev.description : ev.protagonists?.about) ?? null,
    reveal: ev.favpoll_polls?.personal_note ?? null,
    photoUrl: (isCause ? ev.photo_url : ev.protagonists?.photo_url) ?? null,
    favourites: (ev.favpoll_polls?.favpoll_poll_favourites ?? [])
      .filter((f) => f.favourites)
      .map((f) => ({
        id: f.favourites!.id,
        rowId: f.id,
        label: f.favourites!.label,
        source: f.favourites!.source,
        isGuestAdded: !!f.is_guest_added,
        isHidden: !!f.is_hidden,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    topicIsFinite: ev.favpoll_polls?.topics?.is_finite === true,
    topicId: ev.favpoll_polls?.topic_id ?? null,
    subsetId: ev.favpoll_polls?.subset_id ?? null,
    charityLockReason,
    topicLockReason,
  }

  // The standings list's items: this poll's favourites with this poll's
  // numbers (lib/poll-standings' field reuse), pledged ones only.
  const standingItems: Favourite[] = favpoll.favourites
    .filter((f) => (standings.counts.get(f.id) ?? 0) > 0)
    .map((f) => ({
      id: f.id,
      topic_id: "",
      label: f.label,
      all_time_pledged: standings.totals.get(f.id) ?? 0,
      all_time_count: standings.counts.get(f.id) ?? 0,
      is_canonical: !f.isGuestAdded,
      source: f.isGuestAdded ? "guest" : "organiser",
      markets: [],
      favpoll_count: 0,
      total_pledge_count: 0,
      created_at: "",
      favpoll_poll_item_id: f.rowId,
      is_hidden: f.isHidden,
      is_guest_added: f.isGuestAdded,
    }))

  const palette = paletteForFavpoll({
    category: (favpoll.category ?? null) as FavpollCategory | null,
    subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
  })

  return (
    <RegisterScope palette={palette}>
      {/* The guest page's own ground (PageLayout's register wash), so
          manage and the favpoll it manages read as one place
          (founder, 2026-09-03). */}
      <main className="min-h-[calc(100vh-3.5rem)] bg-primary/5">
        <PageGround color={PRIMARY_WASH} />
        <ManageClient
          favpoll={favpoll}
          wallEntries={wallEntries}
          pickerCharities={pickerCharities}
          consentGatingActive={consentPosture() === "consent-first"}
          dashboard={{ standingItems, rankHistory, rankHistoryDates, timeline }}
          topicPicker={topicPicker}
        />
      </main>
    </RegisterScope>
  )
}
