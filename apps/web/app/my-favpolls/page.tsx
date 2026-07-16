import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewFavpollButton } from "@/components/new-favpoll-button"
import { NewFavpollFab } from "@/components/new-favpoll-fab"
import { createAdminClient } from "@/lib/supabase/admin"
import { OrganizerPageClient } from "./organizer-page-client"
import type { OrganizerFavpoll } from "@/components/organizer-row/utils"

export const metadata = {
  title: "Your favpolls — favpoll",
}

export default async function MyFavpollsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()

  const { data: rawFavpolls } = await supabase
    .from("favpolls")
    .select(
      `
      id,
      live_slug,
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
      created_at,
      protagonists!favpolls_protagonist_id_fkey ( name ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number, description ) ),
      favpoll_polls ( id, personal_reveal, topics ( title ), pledges ( count ) ),
      favpoll_pots ( total_deposited, total_allocated )
    `
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  type RawPot = { total_deposited: number; total_allocated: number }
  type RawFavpoll = {
    id: string
    live_slug: string
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
    protagonists: { name: string } | null
    favpoll_charities: {
      charities: {
        id: string
        name: string
        logo_url: string | null
        registered_number: string | null
        description: string | null
        created_at: string
      }
    }[]
    favpoll_polls: {
      id: string
      personal_reveal: string | null
      topics: { title: string } | null
      pledges: { count: number }[]
    } | null
    favpoll_pots: RawPot | null
  }

  const favpolls: OrganizerFavpoll[] = (
    (rawFavpolls ?? []) as unknown as RawFavpoll[]
  ).map((ev) => ({
    id: ev.id,
    live_slug: ev.live_slug,
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
    created_at: ev.created_at,
    protagonist: ev.protagonists ?? null,
    charities: ev.favpoll_charities.map((ec) => ({ charity: ec.charities })),
    poll: ev.favpoll_polls
      ? { id: ev.favpoll_polls.id, topic: ev.favpoll_polls.topics ?? null }
      : null,
    pot: ev.favpoll_pots ?? null,
    pledge_count: ev.favpoll_polls?.pledges?.[0]?.count ?? 0,
    has_reveal: !!ev.favpoll_polls?.personal_reveal,
  }))

  return (
    <main className="mx-auto max-w-330 px-4 pt-8 pb-16">
      {favpolls.length > 0 ? (
        <OrganizerPageClient favpolls={favpolls} />
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any favpolls yet.
          </p>
          <NewFavpollButton className="mt-4">
            Create your first favpoll
          </NewFavpollButton>
        </div>
      )}
      <NewFavpollFab />
    </main>
  )
}
