import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { EventCard } from "@/components/event-card"
import { EventCardEmpty } from "@/components/event-card-empty"

export const metadata = {
  title: "Live events — favpoll",
  description:
    "Real charitable polls happening right now. Pledge your favourites and honour the people behind them.",
}

export default async function LiveEventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from("events")
    .select(
      `
      id,
      occasion,
      description,
      closes_at,
      total_raised,
      protagonist:protagonists ( name ),
      charities:event_charities (
        charity:charities ( name )
      ),
      polls:event_polls (
        personal_framing,
        topic:topics ( title )
      )
    `
    )
    .eq("is_private", false)
    .is("closed_at", null)
    .order("created_at", { ascending: false })
    .limit(24)

  return (
    <main className="mx-auto max-w-330 px-6 py-12">
      <div className="mb-10">
        <p className="mb-3 text-[11px] font-medium tracking-[0.1em] text-[#534AB7] uppercase">
          Live events
        </p>
        <h1 className="mb-3 text-[32px] font-medium tracking-tight text-foreground">
          Happening right now
        </h1>
        <p className="max-w-[480px] text-[14px] leading-relaxed text-muted-foreground">
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
          {(
            events as unknown as Parameters<typeof EventCard>[0]["event"][]
          )?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </main>
  )
}
