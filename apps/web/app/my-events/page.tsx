import { auth } from "@clerk/nextjs/server"
import { NewEventButton } from "@/components/new-event-button"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventSummaryCard } from "@/components/event-summary-card"
import type { Charity } from "@favpoll/types"

export default async function EventsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()

  const { data: events } = await supabase
    .from("favpolls")
    .select(
      `
      id,
      opening_line,
      closes_at,
      closed_at,
      occasion_type,
      total_raised,
      protagonists!favpolls_protagonist_id_fkey ( name ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number ) ),
      favpoll_polls ( topics ( title ) )
    `
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  type RawEvent = {
    id: string
    opening_line: string
    closes_at: string
    closed_at: string | null
    occasion_type: string | null
    total_raised: number
    protagonists: { name: string }
    favpoll_charities: { charities: Charity }[]
    favpoll_polls: { topics: { title: string } | null } | null
  }

  const normalised = ((events ?? []) as unknown as RawEvent[]).map((ev) => ({
    id: ev.id,
    occasion_type: ev.occasion_type,
    opening_line: ev.opening_line,
    closes_at: ev.closes_at,
    closed_at: ev.closed_at,
    total_raised: ev.total_raised,
    protagonist: { name: ev.protagonists.name },
    charities: ev.favpoll_charities.map((ec) => ({ charity: ec.charities })),
    poll: ev.favpoll_polls ? { topic: ev.favpoll_polls.topics } : null,
  }))

  return (
    <main className="mx-auto max-w-330 px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-foreground">Your favpolls</h1>
        <NewEventButton size="lg">New favpoll</NewEventButton>
      </div>

      {normalised.length > 0 ? (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
        >
          {normalised.map((ev) => (
            <li key={ev.id} className="list-none">
              <EventSummaryCard event={ev} className="h-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any favpolls yet.
          </p>
          <NewEventButton className="mt-4">
            Create your first favpoll
          </NewEventButton>
        </div>
      )}
    </main>
  )
}
