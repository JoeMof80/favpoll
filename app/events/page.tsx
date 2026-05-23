import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { EventCard } from "@/components/event-card"
import { EventCardEmpty } from "@/components/event-card-empty"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

export const metadata = {
  title: "Live events — favpoll",
  description:
    "Real charitable polls happening right now. Pledge your favourites and honour the people behind them.",
}

export default async function LiveEventsPage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      id,
      occasion_label,
      description,
      closes_at,
      total_raised,
      protagonist:protagonists ( name ),
      charities:event_charities (
        charity:charities ( id, name, logo_url, registered_number )
      ),
      event_polls (
        topic:topics ( title )
      )
    `
    )
    .eq("is_private", false)
    .is("closed_at", null)
    .order("created_at", { ascending: false })
    .limit(24)

  console.log("ERROR DETAILS:", error)
  console.log("EVENTS DATA:", events)

  return (
    <main className="mx-auto max-w-330 px-6 py-12">
      <div className="mb-10">
        <SectionEyebrow className="mb-3">Live events</SectionEyebrow>
        <h1 className="mb-3 text-[32px] font-medium tracking-tight text-foreground">
          Happening right now
        </h1>
        <p className="max-w-120 text-[14px] leading-relaxed text-muted-foreground">
          Real events, real people, real causes. Pledge to any of these — or{" "}
          <Link href="/events/new" className="text-[#534AB7]">
            create your own.
          </Link>
        </p>
      </div>

      {events?.length === 0 ? (
        <EventCardEmpty />
      ) : (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {(events ?? []).map((ev) => {
            const rawEvent = ev as unknown as {
              id: string
              occasion_label: string
              description: string | null
              closes_at: string
              total_raised: number
              protagonist: { name: string }
              charities: { charity: import("@/types").Charity }[]
              event_polls: { topic: { title: string; topic_items: string[] } | null }[]
            }
            const eventCardProps = {
              ...rawEvent,
              poll: rawEvent.event_polls?.[0] ?? null,
            }
            return <EventCard key={ev.id} event={eventCardProps} />
          })}
        </ul>
      )}
    </main>
  )
}
