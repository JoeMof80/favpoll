// PROTOTYPE — "split" variant (front-runner). Purple hero band with the
// LIVE demo loop + cycling occasion eyebrow/headline; sticky rail with
// scrollspy; interactive reveal-mechanic section (celebration scene);
// record-holder tiles (one champion per topic — no cross-topic bars);
// site footer carrying the money/wills trust content; subtle in-view motion.
// Register-specific copy cycles in the hero; body copy is register-neutral.
import Link from "next/link"
import { FavpollSummaryCard } from "@/components/favpoll-summary-card"
import { HowItWorksThreeBeat } from "@/components/landing/how-it-works-three-beat"
import HonourCharityLoveVenn from "@/components/landing/honour-charity-love-venn"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { SplitHero } from "./split-hero"
import { RevealMechanicDemo } from "./reveal-mechanic-demo"
import { RailNav } from "./rail-nav"
import { RecordHolders } from "./record-holders"
import { SiteFooter } from "./site-footer"
import { FadeIn } from "./fade-in"
import type { LandingData } from "./types"

const NAV = [
  ["#proto-reveal", "The reveal"],
  ["#proto-live", "Live right now"],
  ["#proto-record", "The record"],
  ["#proto-how", "How it works"],
] as const

export function VariantSplit({
  favpolls,
  recordItems,
  showRecord,
}: LandingData) {
  const totalLive = favpolls.reduce((sum, f) => sum + f.total_raised, 0)

  return (
    <>
      <main className="flex flex-col">
        {/* ── Purple hero band with the live demo ── */}
        <SplitHero liveCount={favpolls.length} totalLive={totalLive} />

        {/* ── Sticky rail + product surfaces ── */}
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <div className="md:grid md:grid-cols-[260px_1fr] md:gap-14">
            {/* Left rail */}
            <aside className="hidden md:block">
              <div className="sticky top-20 flex flex-col gap-8">
                <RailNav items={NAV} />
                <Card>
                  <CardContent className="flex flex-col gap-3 pt-2">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Free to create. Guests pledge directly to charity.
                    </p>
                    <Button asChild>
                      <Link href="/favpolls/new">
                        {t("landing.cta.primary")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Right: stacked surfaces */}
            <div className="flex flex-col gap-20">
              <section id="proto-reveal" className="scroll-mt-20">
                <FadeIn>
                  <SectionEyebrow className="mb-2">The reveal</SectionEyebrow>
                  <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
                    Locked until you've given.
                  </h2>
                  <p className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                    Every favpoll holds one answer back — what the person it
                    honours actually loved. Guests pledge first. Then the reveal
                    is theirs.
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <RevealMechanicDemo />
                </FadeIn>
              </section>

              {favpolls.length > 0 && (
                <section id="proto-live" className="scroll-mt-20">
                  <FadeIn>
                    <div className="mb-6 flex items-baseline justify-between">
                      <SectionEyebrow>Live right now</SectionEyebrow>
                      <Button variant="ghost" asChild>
                        <Link href="/favpolls">See all →</Link>
                      </Button>
                    </div>
                  </FadeIn>
                  <ul className="grid gap-4 sm:grid-cols-2" role="list">
                    {favpolls.slice(0, 4).map((f, i) => (
                      <li key={f.id} className="list-none">
                        <FadeIn delay={i * 0.06} className="h-full">
                          <FavpollSummaryCard
                            favpoll={f}
                            className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          />
                        </FadeIn>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {showRecord && (
                <section id="proto-record" className="scroll-mt-20">
                  <FadeIn>
                    <SectionEyebrow className="mb-2">The record</SectionEyebrow>
                    <h2 className="mb-3 max-w-lg text-3xl font-light tracking-tight text-foreground">
                      The current record holders.
                    </h2>
                    <p className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                      Every pledge, on every favpoll, feeds one shared record —
                      each question with its own standing champion.
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
                </section>
              )}

              <section id="proto-how" className="scroll-mt-20">
                <FadeIn>
                  <SectionEyebrow className="mb-6">How it works</SectionEyebrow>
                  <HowItWorksThreeBeat />
                </FadeIn>
              </section>

              <FadeIn>
                <section className="flex items-center gap-8 border-t border-border pt-12">
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
                      <Link href="/favpolls/new">
                        {t("landing.cta.primary")}
                      </Link>
                    </Button>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t("landing.cta.caption")}
                    </p>
                  </div>
                </section>
              </FadeIn>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
