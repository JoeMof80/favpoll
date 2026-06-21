import Link from "next/link"
import { HeroDemoPanel } from "@/components/hero-demo-panel"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { createAdminClient } from "@/lib/supabase/admin"
import { t } from "@/lib/i18n"

export default async function HomePage() {
  const supabase = createAdminClient()

  const { data: favpolls } = await supabase
    .from("favpolls")
    .select(
      `
      id,
      opening_line,
      description,
      closes_at,
      occasion_type,
      total_raised,
      protagonist:protagonists ( name ),
      charities:favpoll_charities (
        charity:charities ( id, name, logo_url, registered_number )
      ),
      favpoll_polls (
        id,
        topic_id,
        topics (
          title,
          is_finite,
          favourites ( id, label )
        ),
        favpoll_poll_favourites (
          favourites ( id, label )
        )
      )
    `
    )
    .eq("is_private", false)
    .is("closed_at", null)
    .gt("closes_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(6)

  type RawFavourite = { id: string; label: string }
  type RawEpf = { favourites: RawFavourite }
  type RawPoll = {
    id: string
    topic_id: string | null
    topics: {
      title: string
      is_finite: boolean
      favourites: RawFavourite[]
    } | null
    favpoll_poll_favourites: RawEpf[]
  }
  type RawFavpoll = {
    id: string
    opening_line: string
    description: string | null
    closes_at: string
    occasion_type: string | null
    total_raised: number
    protagonist: { name: string }
    charities: { charity: import("@favpoll/types").Charity }[]
    favpoll_polls: RawPoll | null
  }

  const normalised = ((favpolls ?? []) as unknown as RawFavpoll[]).map((ev) => {
    const rawPoll = ev.favpoll_polls ?? null
    let poll: {
      id: string
      topic_id: string | null
      topic: { title: string; favourites: RawFavourite[] } | null
    } | null = null
    if (rawPoll) {
      const isFinite = rawPoll.topics?.is_finite ?? false
      const favourites = isFinite
        ? (rawPoll.topics?.favourites ?? [])
        : (rawPoll.favpoll_poll_favourites ?? [])
            .map((epf) => epf.favourites)
            .filter(Boolean)
      poll = {
        id: rawPoll.id,
        topic_id: rawPoll.topic_id,
        topic: rawPoll.topics
          ? { title: rawPoll.topics.title, favourites }
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
              <SectionEyebrow className="mb-2">Live favpolls</SectionEyebrow>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/favpolls">See all →</Link>
            </Button>
          </div>

          {normalised.length > 0 ? (
            <LiveFavpollsCarousel favpolls={normalised} />
          ) : (
            <div className="py-16 text-center">
              <p className="mb-2 text-[15px] font-medium text-foreground">
                No live favpolls yet
              </p>
              <p className="mx-auto mb-6 max-w-70 text-[13px] leading-relaxed text-muted-foreground">
                Create the first favpoll and it will appear here.
              </p>
              <Button asChild size="lg">
                <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
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
            <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
