import { CapabilityGrid } from "@/components/landing/capability-grid"
import { ProcessOverview } from "@/components/landing/process-overview"
import Link from "next/link"
import { fetchLiveFavpolls } from "@/lib/live-favpolls"
import { Button } from "@/components/ui/button"
import { LandingHero } from "@/components/landing/hero"
import { OpenRightNow } from "@/components/landing/open-right-now"
import { HeroTexture } from "@/components/landing/hero-texture"
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
  // The shelf's query lives in lib/live-favpolls now, shared with the three
  // register pages, which show the same shelf filtered to their own register
  // (2026-08-28). It was ~90 lines of select, row types and topic
  // normalisation; four copies would have drifted the first time a column
  // moved.
  const normalised = await fetchLiveFavpolls()

  const totalLive = normalised.reduce((sum, f) => sum + f.total_raised, 0)

  return (
    <main className="flex flex-col">
      {/* ── Purple hero band with the live demo ── */}
      <LandingHero liveCount={normalised.length} totalLive={totalLive} router />

      <ProcessOverview />

      <CapabilityGrid />

      {/* "Create or curate your favpoll" and "Watch it live" lived here until
          2026-08-08. Both were single-capability deep-dives that the
          capability grid above now summarises and /features covers properly —
          Custom topics duplicated the first, Live display the second. The page
          was ten sections and meandering. Recover them from
          `git show main~1:apps/web/components/landing/anyone-can-answer.tsx`
          if they are wanted on /features. ── */}

      {/* ── The shelf: real favpoll cards always sit on the brand pastel
          (bg-muted), matching /favpolls — white cards on light purple is the
          convention wherever the actual product appears; the illustration
          vignettes above keep the fainter bg-primary/5. In dark mode both
          resolve to cards lifted off the purple page. ── */}
      {/* minimum={1}, keeping home's own threshold. The component's default
          of three is for the REGISTER pages, which show a slice that can be
          thin long after the whole is healthy. Home shows every open favpoll
          there is, so one is still the truth about the platform. */}
      <OpenRightNow favpolls={normalised} minimum={1} />

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

      {/* Create · Share · Watch was retired here on 2026-08-09. By this point
          the page has told the arc twice — Start to finish shows it end to
          end, the capability grid names the parts — so a third telling in
          three generic verbs was glib. Its one non-duplicated asset was the
          wizard vignette, the only glimpse of what CREATING a favpoll looks
          like; that belongs on /features#organisers, which has no artefact.
          Recover it from
          `git show main:apps/web/components/landing/how-it-works-three-beat.tsx`. ── */}

      {/* ── The validator's checklist — universal trust facts (page
          architecture model, 2026-08-04): register-neutral versions of
          the reassurance grid the register pages carry. ── */}
      <section className="w-full bg-primary/5">
        <div className="mx-auto grid w-full max-w-330 gap-8 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
          {(["free", "charity", "nofave", "phone"] as const).map((key) => (
            <div key={key}>
              <p className="mb-1 font-medium text-foreground">
                {t(`home.assure.${key}.label`)}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`home.assure.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA: the brand statement on the monogram band, closing
          the page the way the hero opened it ── */}
      <section className="relative w-full bg-primary text-primary-foreground">
        <HeroTexture />
        <div className="relative mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <h2 className="mb-5 max-w-2xl text-3xl font-light tracking-tight">
              {t("landing.subheader")}
            </h2>
            {/* No caption under this button any more (2026-08-08). It read
                "Free to create · 100% goes to charity", which the trust grid
                now directly above says at more length — and the fee was
                being stated three times on one page (hero button, that grid,
                here). landing.cta.caption is retired with it. */}
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-auto min-h-11 px-6 py-2 text-base"
            >
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}
