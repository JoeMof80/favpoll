import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { RegisterScope } from "@/components/register-scope"
import { paletteForFavpoll } from "@/lib/register-palette"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
import type { OrganizerFavpoll } from "@/components/organizer-row/utils"
import { ManageClient } from "./manage-client"

export const metadata = {
  title: "Manage favpoll — favpoll",
}

// THE MANAGE HUB (candidate B of the my-favpolls redesign, drafted
// 2026-09-02): one page per favpoll for the organiser running it — the
// control room the old accordion row squeezed into a drawer. Owner-only.
//
// DRAFT NOTE: the select + mapping duplicate app/my-favpolls/page.tsx;
// extract a shared fetch when the design is adopted.
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
      `
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
      created_at,
      created_by,
      protagonists!favpolls_protagonist_id_fkey ( name ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number, description, created_at ) ),
      favpoll_polls ( id, personal_reveal, topics ( title ), pledges ( count ) ),
      favpoll_pots ( total_deposited, total_allocated )
    `
    )
    .eq("id", id)
    .single()

  if (!raw) notFound()
  if ((raw as { created_by?: string }).created_by !== userId) {
    redirect("/my-favpolls")
  }

  type RawRow = {
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

  const [ev] = await withLiveTotals(supabase, [raw as unknown as RawRow])

  const favpoll: OrganizerFavpoll = {
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
    protagonist: ev.protagonists ?? null,
    charities: ev.favpoll_charities.map((ec) => ({ charity: ec.charities })),
    poll: ev.favpoll_polls
      ? { id: ev.favpoll_polls.id, topic: ev.favpoll_polls.topics ?? null }
      : null,
    pot: ev.favpoll_pots ?? null,
    pledge_count: ev.favpoll_polls?.pledges?.[0]?.count ?? 0,
    has_reveal: !!ev.favpoll_polls?.personal_reveal,
  }

  const palette = paletteForFavpoll({
    category: (favpoll.category ?? null) as FavpollCategory | null,
    subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
  })

  return (
    <RegisterScope palette={palette}>
      <main className="min-h-screen bg-muted">
        <ManageClient favpoll={favpoll} />
      </main>
    </RegisterScope>
  )
}
