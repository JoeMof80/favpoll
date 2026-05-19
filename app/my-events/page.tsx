import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { DeleteEventButton } from "@/app/events/delete-event-button"
import type { EventWithDetails } from "@/types"

const OCCASION_LABELS: Record<string, string> = {
  memorial: "Memorial",
  birthday: "Birthday",
  retirement: "Retirement",
  wedding: "Wedding",
  other: "Event",
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function isClosed(closesAt: string) {
  return new Date(closesAt) < new Date()
}

function daysUntilClose(closesAt: string): number {
  const diff = new Date(closesAt).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function EventsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()

  const { data: events } = await supabase
    .from("events")
    .select(
      "*, protagonists!events_protagonist_id_fkey(*), event_charities(charities(name)), event_polls(topics(title))"
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  return (
    <main className="mx-auto max-w-2xl px-4 pt-10 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-foreground">Your events</h1>
        <Button asChild size="lg">
          <Link href="/events/new">New event</Link>
        </Button>
      </div>

      {events && events.length > 0 ? (
        <ul className="mt-8 space-y-3" role="list">
          {(events as EventWithDetails[]).map((event) => {
            const closed = isClosed(event.closes_at)
            const days = daysUntilClose(event.closes_at)
            const polls =
              (
                event as unknown as {
                  event_polls: { topics: { title: string } }[]
                }
              ).event_polls ?? []
            const topicTitle = polls[0]?.topics?.title ?? null

            return (
              <li
                key={event.id}
                className="rounded-lg border border-border bg-card transition-colors hover:border-primary/30 hover:bg-secondary/30"
              >
                <div className="flex items-start justify-between px-5 py-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="group min-w-0 flex-1 focus:outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {OCCASION_LABELS[event.occasion] ?? "Event"}
                      </span>
                      {closed && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-base font-medium text-foreground">
                      {event.protagonists.name}
                    </p>
                    {topicTitle && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {topicTitle}
                      </p>
                    )}
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {(
                        event as unknown as {
                          event_charities: { charities: { name: string } }[]
                        }
                      ).event_charities
                        ?.map((ec) => ec.charities.name)
                        .join(", ")}
                    </p>
                  </Link>

                  <div className="ml-4 flex shrink-0 flex-col items-end gap-2">
                    <div className="text-right">
                      {closed ? (
                        <p className="text-xs text-muted-foreground">
                          Closed {formatDate(event.closes_at)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {days === 0
                            ? "Closes today"
                            : days === 1
                              ? "1 day left"
                              : `${days} days left`}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-primary group-hover:underline">
                        View →
                      </p>
                    </div>
                    <DeleteEventButton eventId={event.id} />
                  </div>
                </div>
              </li>
            )
          })}
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
