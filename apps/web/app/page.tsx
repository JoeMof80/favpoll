import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import { HowItWorksThreeBeat } from "@/components/landing/how-it-works-three-beat"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { LandingHero } from "@/components/landing/hero"
import { HeroTexture } from "@/components/landing/hero-texture"
import { AnyoneCanAnswer } from "@/components/landing/anyone-can-answer"
import { WatchItHappen } from "@/components/landing/watch-it-happen"
import { RecordFlow } from "@/components/landing/record-flow"
import { FadeIn } from "@/components/landing/fade-in"
import { t } from "@/lib/i18n"

// The landing renders live data (open-favpoll count, raised total, the
// shelf) but has no request-dependent APIs, so Next cached its FIRST
// render indefinitely — the page froze at whatever the DB held that
// moment (found on prod: 3 of 4 favpolls). ISR at 60s keeps it static-
// fast and at most a minute stale.
export const revalidate = 60

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
      category,
      protagonist:protagonists ( name, photo_url ),
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
    category: string | null
    protagonist: { name: string; photo_url: string | null } | null // null for cause favpolls
    charities: { charity: import("@favpoll/types").Charity }[]
    favpoll_polls: RawPoll | null
  }

  // Live favpolls carry a settlement total_raised of 0 until close — overlay
  // the real sums so the carousel cards and the hero's "raised by open
  // favpolls" stat are live (see lib/live-totals).
  const withTotals = await withLiveTotals(
    supabase,
    (favpolls ?? []) as unknown as RawFavpoll[]
  )

  const normalised = withTotals.map((ev) => {
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
          {/* The headline, explained clause by clause — one sentence per
              beat for the visitor who reads rather than watches the demo.
              The organiser vignettes below keep telling Create/Share/Watch;
              this strip is the GUEST arc in words. */}
          <FadeIn>
            <div className="mb-14 grid gap-8 md:grid-cols-3">
              {(["pick", "pledge", "reveal"] as const).map((beat) => (
                <div key={beat}>
                  <h3 className="mb-2 text-sm font-medium tracking-widest text-primary uppercase">
                    {t(`landing.how.${beat}.label`)}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {t(`landing.how.${beat}.body`)}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn>
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
            <WatchItHappen />
          </FadeIn>
        </div>
      </section>

      {/* ── The record — three favpolls, one topic, one permanent ranking.
          The vignette acts out the principle line (many polls feed the
          record; a pledge on any of them moves its standing — nothing moves
          unpaid). White band: also the breath between the watch room and
          the shelf, so the room's floor gradient has a light section to
          land on. Quiet "coming soon" until the record earns its public
          stage — the vignette is illustration, not the record itself. ── */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div className="max-w-md">
                <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">
                  The record
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t("landing.record.principle")}
                </p>
                <p className="mt-3 text-sm font-medium tracking-widest text-primary-muted uppercase">
                  {t("landing.record.status")}
                </p>
              </div>
              <RecordFlow />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── The shelf: real favpoll cards always sit on the brand pastel
          (bg-muted), matching /favpolls — white cards on light purple is the
          convention wherever the actual product appears; the illustration
          vignettes above keep the fainter bg-primary/5. In dark mode both
          resolve to cards lifted off the purple page. ── */}
      {normalised.length > 0 && (
        <section id="live" className="w-full scroll-mt-20 bg-muted">
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
