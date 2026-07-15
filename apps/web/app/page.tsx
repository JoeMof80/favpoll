import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import { HowItWorksThreeBeat } from "@/components/landing/how-it-works-three-beat"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { LandingHero } from "@/components/landing/hero"
import { HeroTexture } from "@/components/landing/hero-texture"
import { AnyoneCanAnswer } from "@/components/landing/anyone-can-answer"
import { WatchItHappen } from "@/components/landing/watch-it-happen"
import { FadeIn } from "@/components/landing/fade-in"
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

  const totalLive = normalised.reduce((sum, f) => sum + f.total_raised, 0)

  return (
    <main className="flex flex-col">
      {/* ── Purple hero band with the live demo ── */}
      <LandingHero liveCount={normalised.length} totalLive={totalLive} />

      <section id="how" className="w-full scroll-mt-20 bg-primary/5">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <SectionEyebrow className="mb-6">How it works</SectionEyebrow>
            <HowItWorksThreeBeat />
          </FadeIn>
        </div>
      </section>

      {/* ── Product surfaces — full-bleed alternating bands (white ·
          bg-primary/5) for section division; each band's inner column matches
          the hero's width. The hero demo does the showing; the sections below
          each add one thing. ── */}
      <section id="anyone" className="w-full scroll-mt-20">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <SectionEyebrow className="mb-6">Custom favpoll</SectionEyebrow>
          </FadeIn>
          <FadeIn delay={0.1}>
            <AnyoneCanAnswer />
          </FadeIn>
        </div>
      </section>

      {/* The section IS the room: full-bleed tint, a floor gradient, and
          overflow-hidden so the foreground phone crops at the section edge */}
      <section
        id="watch"
        className="relative w-full scroll-mt-20 overflow-hidden bg-primary/5"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/10 to-transparent"
        />
        <div className="relative mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <SectionEyebrow className="mb-6">Live favpoll</SectionEyebrow>
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

      {/* ── The record — a principle, not a destination (concept model,
          2026-07). No headline, no tiles, no data claim: one quiet line,
          true from pledge one, and a quiet link to its full home. ── */}
      {/* <section className="w-full">
        <div className="mx-auto w-full max-w-330 px-6 py-10">
          <FadeIn>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {t("landing.record.principle")}{" "}
              <Link
                href="/rankings"
                className="whitespace-nowrap text-primary hover:underline"
              >
                {t("landing.record.link")} →
              </Link>
            </p>
          </FadeIn>
        </div>
      </section> */}

      {/* ── Final CTA: the brand statement on the monogram band, closing
          the page the way the hero opened it ── */}
      <section className="relative w-full bg-primary text-primary-foreground">
        <HeroTexture />
        <div className="relative mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <h2 className="mb-5 max-w-2xl text-3xl font-light tracking-tight">
              {t("landing.subheader")}
            </h2>
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
            <p className="mt-3 text-xs opacity-80">
              {t("landing.cta.caption")}
            </p>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}
