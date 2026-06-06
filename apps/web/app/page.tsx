import Link from "next/link"
import { HeroDemoPanel } from "@/components/hero-demo-panel"
import { LiveEventsCarousel } from "@/components/live-events-carousel"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { createAdminClient } from "@/lib/supabase/admin"
import { t } from "@/lib/i18n"

export default async function HomePage() {
  const supabase = createAdminClient()

  const { data: events } = await supabase
    .from("events")
    .select(
      `
      id,
      opening_line,
      description,
      closes_at,
      occasion,
      total_raised,
      protagonist:protagonists ( name ),
      charities:event_charities (
        charity:charities ( id, name, logo_url, registered_number )
      ),
      event_polls (
        id,
        topic_id,
        topics (
          title,
          is_finite,
          topic_items ( id, label )
        ),
        event_poll_items (
          topic_items ( id, label )
        )
      )
    `
    )
    .eq("is_private", false)
    .is("closed_at", null)
    .gt("closes_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(6)

  type RawTopicItem = { id: string; label: string }
  type RawEpi = { topic_items: RawTopicItem }
  type RawPoll = {
    id: string
    topic_id: string | null
    topics: {
      title: string
      is_finite: boolean
      topic_items: RawTopicItem[]
    } | null
    event_poll_items: RawEpi[]
  }
  type RawEvent = {
    id: string
    opening_line: string
    description: string | null
    closes_at: string
    occasion: string
    total_raised: number
    protagonist: { name: string }
    charities: { charity: import("@favpoll/types").Charity }[]
    event_polls: RawPoll | null
  }

  const normalised = ((events ?? []) as unknown as RawEvent[]).map((ev) => {
    const rawPoll = ev.event_polls ?? null
    let poll: {
      id: string
      topic_id: string | null
      topic: { title: string; topic_items: RawTopicItem[] } | null
    } | null = null
    if (rawPoll) {
      const isFinite = rawPoll.topics?.is_finite ?? false
      const topicItems = isFinite
        ? (rawPoll.topics?.topic_items ?? [])
        : (rawPoll.event_poll_items ?? [])
            .map((epi) => epi.topic_items)
            .filter(Boolean)
      poll = {
        id: rawPoll.id,
        topic_id: rawPoll.topic_id,
        topic: rawPoll.topics
          ? { title: rawPoll.topics.title, topic_items: topicItems }
          : null,
      }
    }
    return { ...ev, poll }
  })

  return (
    <main className="flex flex-col">
      <HeroDemoPanel />

      {/* Live events */}
      <section className="border-t border-border bg-primary/5 py-16">
        <div className="mx-auto max-w-330 px-6">
          <div className="mb-8 flex items-baseline justify-between">
            <div>
              <SectionEyebrow className="mb-2">Live events</SectionEyebrow>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/events">See all →</Link>
            </Button>
          </div>

          {normalised.length > 0 ? (
            <LiveEventsCarousel events={normalised} />
          ) : (
            <div className="py-16 text-center">
              <p className="mb-2 text-[15px] font-medium text-foreground">
                No live events yet
              </p>
              <p className="mx-auto mb-6 max-w-70 text-[13px] leading-relaxed text-muted-foreground">
                Create the first favpoll event and it will appear here.
              </p>
              <Button asChild size="lg">
                <Link href="/events/new">{t("landing.cta.primary")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border py-20 text-center">
        <div className="mx-auto max-w-lg px-6">
          <p className="mb-6 text-[13px] leading-relaxed text-muted-foreground italic">
            {t("landing.subheader")}
          </p>
          <Button asChild size="lg">
            <Link href="/events/new">{t("landing.cta.primary")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
