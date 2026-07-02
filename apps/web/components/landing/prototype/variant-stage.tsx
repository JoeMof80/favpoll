// PROTOTYPE — "stage" variant: demo-first, single centred column. The demo
// card IS the hero; everything else is a quiet vertical story beneath it.
import Link from "next/link"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import HonourCharityLoveVenn from "@/components/landing/honour-charity-love-venn"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { RankingBar } from "@/components/ui/ranking-bar"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import { StaticDemoCard } from "./static-demo-card"
import type { LandingData } from "./types"

const STEPS = [
  ["Introduce them", "Their story, their occasion — the answer withheld."],
  ["Guests pledge", "Each guest backs their own favourite, for charity."],
  ["The reveal", "Only after giving do guests learn what they loved."],
] as const

export function VariantStage({
  favpolls,
  recordItems,
  showRecord,
  recordMax,
  charities,
}: LandingData) {
  return (
    <main className="flex flex-col">
      {/* ── Hero: centred pitch, then the demo card on a stage ── */}
      <section className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-16 text-center">
          <SectionEyebrow className="mb-4">
            In memory of someone special
          </SectionEyebrow>
          <h1 className="mb-5 max-w-2xl text-5xl leading-[1.12] font-light tracking-tight text-foreground">
            {t("landing.headline")}
          </h1>
          <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            {t("landing.subheader")}
          </p>
          <div className="mb-14 flex items-center gap-3.5">
            <Button asChild size="lg">
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/favpolls">See live favpolls →</Link>
            </Button>
          </div>

          <div className="flex w-full max-w-md flex-col">
            <StaticDemoCard className="flex h-130 flex-col rounded-xl shadow-xl" />
            <p className="mt-3 text-xs font-medium tracking-[0.07em] text-muted-foreground uppercase">
              A finished favpoll — reveal disclosed, pledges landed
            </p>
          </div>
        </div>
      </section>

      {/* ── Three steps, one inline strip ── */}
      <section className="border-b border-border py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-6 text-center md:flex-row md:items-start md:gap-8 md:text-left">
          {STEPS.map(([heading, body], i) => (
            <div
              key={heading}
              className="flex flex-1 flex-col items-center gap-2 md:items-start"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary text-sm font-medium text-primary">
                {i + 1}
              </div>
              <h3 className="text-base font-medium text-foreground">
                {heading}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live favpolls ── */}
      {favpolls.length > 0 && (
        <section className="border-b border-border bg-primary/5 py-16">
          <div className="mx-auto max-w-330 px-6">
            <div className="mb-8 text-center">
              <SectionEyebrow className="mb-2">Live right now</SectionEyebrow>
              <h2 className="text-3xl font-light tracking-tight text-foreground">
                Favpolls open for pledges today.
              </h2>
            </div>
            <LiveFavpollsCarousel favpolls={favpolls} />
          </div>
        </section>
      )}

      {/* ── The record ── */}
      {showRecord && (
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <SectionEyebrow className="mb-2">The record</SectionEyebrow>
            <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
              What people love most.
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-muted-foreground">
              Every pledge feeds a permanent ranking of human favourites — built
              through acts of generosity.
            </p>
            <ol
              className="space-y-3 text-left"
              aria-label="Top all-time favourites"
            >
              {recordItems.map((item) => (
                <li key={item.id}>
                  <RankingBar
                    label={item.label}
                    amount={formatCurrency(
                      item.all_time_pledged,
                      MARKET_DEFAULTS["en-GB"]
                    )}
                    widthPercent={Math.round(
                      (item.all_time_pledged / recordMax) * 100
                    )}
                    barClassName="bg-chart-2"
                  />
                </li>
              ))}
            </ol>
            <p className="mt-6">
              <Button variant="ghost" asChild>
                <Link href="/rankings">See the full record →</Link>
              </Button>
            </p>
          </div>
        </section>
      )}

      {/* ── Money + will, side by side ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto grid max-w-330 gap-12 px-6 md:grid-cols-2">
          <div>
            <SectionEyebrow className="mb-2">
              Where the money goes
            </SectionEyebrow>
            <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
              95% reaches your chosen charity.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              A 5% platform fee covers favpoll's costs. The rest reaches your
              chosen charity in full, processed directly through Stripe.
              {charities.length > 0 && (
                <>
                  {" "}
                  Charities on favpoll include{" "}
                  {charities.map((c) => c.name).join(", ")} and more.
                </>
              )}
            </p>
          </div>
          <div>
            <SectionEyebrow className="mb-2">Written in advance</SectionEyebrow>
            <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
              A favpoll can be part of a will.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              The questions and the reveals can be written in advance and kept
              in a will or letter of wishes. Guests receive your answer in your
              voice, after they have pledged.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA with venn watermark ── */}
      <section className="relative overflow-hidden py-24">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
          aria-hidden="true"
        >
          <HonourCharityLoveVenn size={520} animate={false} />
        </div>
        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
          <SectionEyebrow className="mb-2">
            Honour · Charity · Love
          </SectionEyebrow>
          <h2 className="mb-8 text-3xl font-light tracking-tight text-foreground">
            {t("landing.subheader")}
          </h2>
          <div className="flex items-center gap-3.5">
            <Button asChild size="lg">
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/favpolls">See live favpolls →</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("landing.cta.caption")}
          </p>
        </div>
      </section>
    </main>
  )
}
