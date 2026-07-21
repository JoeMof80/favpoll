import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"
import { getFavpollHeadline } from "@/lib/display"
import { deriveRankHistory, type PledgeEvent } from "@/lib/rank-history"
import {
  KeepsakeDocument,
  type KeepsakeStanding,
} from "@/components/keepsake/keepsake-document"
import { PrintButton } from "@/components/keepsake/print-button"
import { Button } from "@/components/ui/button"

type Props = { params: Promise<{ id: string }> }

export default async function KeepsakePage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      "*, protagonists!favpolls_protagonist_id_fkey(*), favpoll_charities(charities(name))"
    )
    .eq("id", id)
    .single()

  if (!favpoll) notFound()

  const isClosed =
    !!favpoll.closed_at ||
    (favpoll.closes_at && new Date(favpoll.closes_at) < new Date())
  // The keepsake is a post-close artifact: real standings are shown to
  // everyone, so it only exists once the poll has closed.
  if (!isClosed) notFound()

  const { data: poll } = await supabase
    .from("favpoll_polls")
    .select("id, personal_reveal, topic_id, topics(title)")
    .eq("favpoll_id", id)
    .maybeSingle()

  if (!poll) notFound()

  // Final standings + rank history for this favpoll's poll, from its
  // pledge allocations (non-withdrawn). Same source as the bump chart.
  // Paginated (lib/supabase/paginate) — a keepsake reads the WHOLE poll
  const allocRows = await fetchAllRows<Record<string, unknown>>((from, to) =>
    supabase
      .from("pledge_allocations")
      .select(
        "amount, favourite_id, favourites(label), pledges!inner(created_at, favpoll_poll_id, withdrawn_at)"
      )
      .eq("pledges.favpoll_poll_id", poll.id)
      .is("pledges.withdrawn_at", null)
      .range(from, to)
  )

  const totals = new Map<string, { label: string; amount: number }>()
  const labels: Record<string, string> = {}
  for (const r of allocRows) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = r as any
    const label = row.favourites?.label ?? row.favourite_id
    labels[row.favourite_id] = label
    const cur = totals.get(row.favourite_id) ?? { label, amount: 0 }
    cur.amount += row.amount ?? 0
    totals.set(row.favourite_id, cur)
  }

  const standings: KeepsakeStanding[] = [...totals.entries()]
    .map(([favouriteId, v]) => ({ favouriteId, ...v }))
    .sort((a, b) => b.amount - a.amount)

  // Rank history: one event per pledge (group allocations by pledge).
  // The select above is per-allocation, so re-query grouped by pledge.
  const pledgeRows = await fetchAllRows<{
    created_at: string
    pledge_allocations: unknown
  }>((from, to) =>
    supabase
      .from("pledges")
      .select("created_at, pledge_allocations(amount, favourite_id)")
      .eq("favpoll_poll_id", poll.id)
      .is("withdrawn_at", null)
      .order("created_at", { ascending: true })
      .range(from, to)
  )

  const events: PledgeEvent[] = pledgeRows.map((p) => ({
    createdAt: p.created_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allocations: ((p.pledge_allocations ?? []) as any[]).map((a) => ({
      favouriteId: a.favourite_id,
      amount: a.amount ?? 0,
    })),
  }))
  const rankHistory =
    events.length >= 8 ? deriveRankHistory(events, labels) : null

  // Guests who chose to be named (anonymity model): guest display_name or
  // the account name for signed-in pledgers. Never derived from emails.
  const nameRows = await fetchAllRows<{
    display_name: string | null
    is_anonymous: boolean
    clerk_user_id: string | null
  }>((from, to) =>
    supabase
      .from("pledges")
      .select("display_name, is_anonymous, clerk_user_id")
      .eq("favpoll_poll_id", poll.id)
      .is("withdrawn_at", null)
      .eq("is_anonymous", false)
      .range(from, to)
  )

  const clerkIds = [
    ...new Set(
      nameRows.map((r) => r.clerk_user_id).filter((v): v is string => !!v)
    ),
  ]
  const { data: users } = clerkIds.length
    ? await supabase.from("users").select("id, display_name").in("id", clerkIds)
    : { data: [] }
  const userNames = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u.display_name])
  )
  const guestNames = [
    ...new Set(
      nameRows
        .map((r) =>
          r.clerk_user_id
            ? (userNames[r.clerk_user_id] ?? null)
            : (r.display_name ?? null)
        )
        .filter((v): v is string => !!v && v.trim().length > 0)
    ),
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protagonist = favpoll.protagonists as any
  const isCause = favpoll.subject === "cause"
  const name = isCause ? (favpoll.cause_label ?? "") : (protagonist?.name ?? "")
  const { prefix } = getFavpollHeadline({
    occasionType: favpoll.occasion_type,
    name,
    subject: isCause ? "cause" : "someone",
    openingLine: favpoll.opening_line,
  })

  const closedIso = favpoll.closed_at ?? favpoll.closes_at
  const closedDate = new Date(closedIso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const data = {
    prefix,
    name,
    context: isCause ? null : (protagonist?.context ?? null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topicTitle: (poll.topics as any)?.title ?? "favourites",
    reveal: poll.personal_reveal,
    totalRaised: favpoll.total_raised ?? 0,
    charityNames: (favpoll.favpoll_charities ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ec: any) => ec.charities.name
    ),
    closedDate,
    standings,
    rankHistory,
    guestNames,
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-background print:py-0">
      <div className="mx-auto max-w-[720px] px-4 print:px-0">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/favpolls/${id}`}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Back to favpoll
            </Link>
          </Button>
          <PrintButton />
        </div>
        <div className="rounded-lg border border-border bg-background shadow-sm print:border-0 print:shadow-none">
          <KeepsakeDocument data={data} />
        </div>
      </div>
    </div>
  )
}
