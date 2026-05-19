import Link from "next/link"
import { HeroDemoPanel } from "@/components/hero-demo-panel"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
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
    .limit(6)

  return (
    <main className="flex flex-col">
      <HeroDemoPanel />

      {/* Live events */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <p className="mb-2 text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
                Live events
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/events">See all →</Link>
            </Button>
          </div>

          {events && events.length > 0 ? (
            <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {(
                events as unknown as Parameters<typeof EventCard>[0]["event"][]
              )?.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  className="w-72 shrink-0 snap-start"
                />
              ))}
            </ul>
          ) : (
            <div className="py-16 text-center">
              <p className="mb-2 text-[15px] font-medium text-foreground">
                No live events yet
              </p>
              <p className="mx-auto mb-6 max-w-70 text-[13px] leading-relaxed text-muted-foreground">
                Create the first favpoll event and it will appear here.
              </p>
              <Button asChild>
                <Link href="/events/new">Create an event</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border py-20 text-center">
        <div className="mx-auto max-w-lg px-6">
          <p className="mb-6 text-[13px] leading-relaxed text-muted-foreground italic">
            Expressions of joy, for charitable causes,
            <br />
            in the name of those we love.
          </p>
          <Button asChild size="lg">
            <Link href="/events/new">Create an event</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
