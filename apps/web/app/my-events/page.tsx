import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventSummaryCard } from "@/components/event-summary-card"
import type { Charity } from "@favpoll/types"

export default async function EventsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()

  const { data: events } = await supabase
    .from("events")
    .select(
      `
      id,
      opening_line,
      closes_at,
      closed_at,
      occasion,
      total_raised,
      protagonists!events_protagonist_id_fkey ( name ),
      event_charities ( charities ( id, name, logo_url, registered_number ) ),
      event_polls ( topics ( title ) )
    `
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  type RawEvent = {
    id: string
    opening_line: string
    closes_at: string
    closed_at: string | null
    occasion: string
    total_raised: number
    protagonists: { name: string }
    event_charities: { charities: Charity }[]
    event_polls: { topics: { title: string } | null } | null
  }

  const normalised = ((events ?? []) as unknown as RawEvent[]).map((ev) => ({
    id: ev.id,
    occasion: ev.occasion,
    opening_line: ev.opening_line,
    closes_at: ev.closes_at,
    closed_at: ev.closed_at,
    total_raised: ev.total_raised,
    protagonist: { name: ev.protagonists.name },
    charities: ev.event_charities.map((ec) => ({ charity: ec.charities })),
    poll: ev.event_polls ? { topic: ev.event_polls.topics } : null,
  }))

  return (
    <main className="mx-auto max-w-330 px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-foreground">Your events</h1>
        <Button asChild size="lg">
          <Link href="/events/new">New event</Link>
        </Button>
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
            You haven&apos;t created any events yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/events/new">Create your first event</Link>
          </Button>
        </div>
      )}
    </main>
  )
}
