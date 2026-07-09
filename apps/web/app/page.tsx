import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import { HowItWorksThreeBeat } from "@/components/landing/how-it-works-three-beat"
import HonourCharityLoveVenn from "@/components/landing/honour-charity-love-venn"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { meetsCrossTopicThreshold } from "@/lib/record"
import { LandingHero } from "@/components/landing/hero"
import { AnyoneCanAnswer } from "@/components/landing/anyone-can-answer"
import { WatchItHappen } from "@/components/landing/watch-it-happen"
import { RecordHolders } from "@/components/landing/record-holders"
import { FadeIn } from "@/components/landing/fade-in"
import { t } from "@/lib/i18n"

export default async function HomePage() {
  const supabase = createAdminClient()

  const [{ data: favpolls }, { data: topFavourites }, { data: charities }] =
    await Promise.all([
      supabase
        .from("favpolls")
        .select(
          `
          id,
          opening_line,
          description,
          closes_at,
          occasion_type,
          total_raised,
          subject,
          cause_label,
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
        .eq("is_listed", true)
        .is("closed_at", null)
        .gt("closes_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(6),

      // Top favourites for the record section
      supabase
        .from("favourites")
        .select("id, label, all_time_pledged, all_time_count, topics(title)")
        .gt("all_time_pledged", 0)
        .order("all_time_pledged", { ascending: false })
        .limit(6),

      // A small set of active charities for Section 5
      supabase
        .from("charities")
        .select("id, name")
        .eq("is_active", true)
        .limit(3),
    ])

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
    subject: string | null
    cause_label: string | null
    protagonist: { name: string } | null // null for cause favpolls
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

  // Record section: only shown when the total pledged meets the threshold
  type TopFavourite = {
    id: string
    label: string
    all_time_pledged: number
    all_time_count: number
    topics: { title: string } | null
  }
  const recordItems = (topFavourites ?? []) as unknown as TopFavourite[]
  const showRecord = meetsCrossTopicThreshold(recordItems)
  const recordMax = recordItems[0]?.all_time_pledged ?? 1

  const totalLive = normalised.reduce((sum, f) => sum + f.total_raised, 0)

  return (
    <main className="flex flex-col">
      {/* ── Purple hero band with the live demo ── */}
      <LandingHero liveCount={normalised.length} totalLive={totalLive} />

      {/* ── Product surfaces — full-bleed alternating bands (white ·
          bg-primary/5) for section division; each band's inner column matches
          the hero's width. The hero demo does the showing; the sections below
          each add one thing. ── */}
      <section id="anyone" className="w-full scroll-mt-20">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <SectionEyebrow className="mb-2">Anyone can answer</SectionEyebrow>
            <h2 className="mb-6 text-3xl font-light tracking-tight text-foreground">
              Every guest has an answer.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <AnyoneCanAnswer />
          </FadeIn>
        </div>
      </section>

      <section id="watch" className="w-full scroll-mt-20 bg-primary/5">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <SectionEyebrow className="mb-2">Live</SectionEyebrow>
            <h2 className="mb-6 text-3xl font-light tracking-tight text-foreground">
              Watch it happen.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <WatchItHappen />
          </FadeIn>
        </div>
      </section>

      {normalised.length > 0 && (
        <section id="live" className="w-full scroll-mt-20">
          <div className="mx-auto w-full max-w-330 px-6 py-16">
            <FadeIn>
              <div className="mb-6 flex items-baseline justify-between">
                <SectionEyebrow>Open right now</SectionEyebrow>
                <Button variant="ghost" asChild>
                  <Link href="/favpolls">See all →</Link>
                </Button>
              </div>
            </FadeIn>
            <FadeIn>
              <LiveFavpollsCarousel favpolls={normalised} />
            </FadeIn>
          </div>
        </section>
      )}

      {showRecord && (
        <section id="record" className="w-full scroll-mt-20">
          <div className="mx-auto w-full max-w-330 px-6 py-16">
            <FadeIn>
              <SectionEyebrow className="mb-2">The record</SectionEyebrow>
              <h2 className="mb-3 max-w-lg text-3xl font-light tracking-tight text-foreground">
                The current record holders.
              </h2>
              <p className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Every pledge, on every favpoll, feeds one shared record — each
                question with its own standing champion.
              </p>
            </FadeIn>
            <RecordHolders
              items={recordItems}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            />
            <p className="mt-6">
              <Button variant="ghost" asChild>
                <Link href="/rankings">See the full record →</Link>
              </Button>
            </p>
          </div>
        </section>
      )}

      <section id="how" className="w-full scroll-mt-20 bg-primary/5">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <SectionEyebrow className="mb-6">How it works</SectionEyebrow>
            <HowItWorksThreeBeat />
          </FadeIn>
        </div>
      </section>

      <section className="w-full border-t border-border">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <div className="flex items-center gap-8">
              <HonourCharityLoveVenn
                size={120}
                animate
                className="hidden shrink-0 opacity-90 sm:block"
              />
              <div>
                <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">
                  {t("landing.subheader")}
                </h2>
                <Button asChild size="lg">
                  <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("landing.cta.caption")}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}
