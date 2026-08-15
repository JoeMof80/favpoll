import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"
import { getFavpollHeadline } from "@/lib/display"
import { deriveRankHistory, type PledgeEvent } from "@/lib/rank-history"
import { type KeepsakeStanding } from "@/components/keepsake/keepsake-document"
import { KeepsakeView } from "@/components/keepsake/keepsake-view"
import { deriveRegister } from "@/lib/registers"
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

  // One round trip for both full-poll reads. The pledge timeline (with
  // labels joined onto each allocation) is the single source for BOTH the
  // final standings and the rank history — previously the same allocation
  // rows were read twice, once per-allocation and once per-pledge.
  // Paginated (lib/supabase/paginate) — a keepsake reads the WHOLE poll.
  const [pledgeRows, nameRows] = await Promise.all([
    fetchAllRows<{
      created_at: string
      pledge_allocations: unknown
    }>((from, to) =>
      supabase
        .from("pledges")
        .select(
          "created_at, pledge_allocations(amount, favourite_id, favourites(label))"
        )
        .eq("favpoll_poll_id", poll.id)
        .is("withdrawn_at", null)
        .order("created_at", { ascending: true })
        .range(from, to)
    ),
    // Guests who chose to be named (anonymity model): guest display_name or
    // the account name for signed-in pledgers. Never derived from emails.
    fetchAllRows<{
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
    ),
  ])

  const totals = new Map<string, { label: string; amount: number }>()
  const labels: Record<string, string> = {}
  const events: PledgeEvent[] = pledgeRows.map((p) => ({
    createdAt: p.created_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allocations: ((p.pledge_allocations ?? []) as any[]).map((a) => {
      const label = a.favourites?.label ?? a.favourite_id
      labels[a.favourite_id] = label
      const cur = totals.get(a.favourite_id) ?? { label, amount: 0 }
      cur.amount += a.amount ?? 0
      totals.set(a.favourite_id, cur)
      return { favouriteId: a.favourite_id, amount: a.amount ?? 0 }
    }),
  }))

  const standings: KeepsakeStanding[] = [...totals.entries()]
    .map(([favouriteId, v]) => ({ favouriteId, ...v }))
    .sort((a, b) => b.amount - a.amount)

  const rankHistory =
    events.length >= 8 ? deriveRankHistory(events, labels) : null

  const clerkIds = [
    ...new Set(
      nameRows.map((r) => r.clerk_user_id).filter((v): v is string => !!v)
    ),
  ]
  // Chunked .in(): a big poll's named-guest list is unbounded, and id
  // filters travel in the URL (see lib/poll-standings IN_CHUNK).
  const users: { id: string; display_name: string | null }[] = []
  for (let i = 0; i < clerkIds.length; i += 100) {
    const { data } = await supabase
      .from("users")
      .select("id, display_name")
      .in("id", clerkIds.slice(i, i + 100))
    users.push(...(data ?? []))
  }
  const userNames = Object.fromEntries(users.map((u) => [u.id, u.display_name]))
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

  // The SAME derivation the live display uses (app/live/[slug]): memorials
  // open quiet, everything else opens with the total. Duplicating the rule
  // rather than the decision — if the display's rule changes, this should
  // follow it.
  const register = deriveRegister(
    favpoll.occasion_type,
    favpoll.subject === "cause" ? null : protagonist?.name,
    favpoll.subject
  )
  const defaultVariant = register === "remembering" ? "tribute" : "fundraiser"

  return (
    <div className="min-h-screen bg-muted/30 pb-8 print:min-h-0 print:bg-background print:pb-0">
      {/* Wide enough for a LANDSCAPE A4 at 100% (1123px) plus the desk's
          padding — the keepsake is landscape now. */}
      <div className="print:max-w-none">
        <KeepsakeView
          data={data}
          favpollId={id}
          defaultVariant={defaultVariant}
          leading={
            <Button asChild variant="ghost" size="sm">
              <Link href={`/favpolls/${id}`}>
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Back
              </Link>
            </Button>
          }
        />
      </div>
    </div>
  )
}
