// PROTOTYPE — baseline variant: the existing seven-section landing, extracted
// verbatim from app/page.tsx so it can sit beside the redesign variants.
// When the prototype resolves, the winner replaces this in app/page.tsx.
import Link from "next/link"
import { HeroDemoPanel } from "@/components/hero-demo-panel"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import { HowItWorksThreeBeat } from "@/components/landing/how-it-works-three-beat"
import HonourCharityLoveVenn from "@/components/landing/honour-charity-love-venn"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SectionHeader } from "@/components/landing/section-header"
import { RankingBar } from "@/components/ui/ranking-bar"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import type { LandingData } from "./types"

export function VariantCurrent({
  favpolls,
  recordItems,
  showRecord,
  recordMax,
  charities,
}: LandingData) {
  return (
    <main className="flex flex-col">
      {/* ── Section 1: Hero ── */}
      <HeroDemoPanel />

      {/* ── Section 2: How it works ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <SectionHeader
            className="mb-10"
            eyebrow="How it works"
            title="A question that withholds. A reveal that discloses."
            lede="The withhold-then-disclose mechanic is what makes a favpoll different from a collection. Guests give something first. Then they receive."
          />
          <HowItWorksThreeBeat />
        </div>
      </section>

      {/* ── Section 3: Live favpolls ── */}
      <section className="border-b border-border bg-primary/5 py-16">
        <div className="mx-auto max-w-330 px-6">
          <div className="mb-8 flex items-baseline justify-between">
            <SectionEyebrow>Live right now</SectionEyebrow>
            <Button variant="ghost" asChild>
              <Link href="/favpolls">See all →</Link>
            </Button>
          </div>

          {favpolls.length > 0 ? (
            <LiveFavpollsCarousel favpolls={favpolls} />
          ) : (
            <div className="py-16 text-center">
              <p className="mb-2 text-base font-medium text-foreground">
                No live favpolls yet
              </p>
              <p className="mx-auto mb-6 max-w-70 text-sm leading-relaxed text-muted-foreground">
                Create the first favpoll and it will appear here.
              </p>
              <Button asChild size="lg">
                <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Section 4: The record (gated on data sufficiency) ── */}
      {showRecord && (
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-330 px-6">
            <SectionHeader
              className="mb-10"
              eyebrow="The record"
              title="A lasting, collectively funded measure of what people love most."
              lede="Every pledge contributes to a permanent ranking of human favourites. Not a dataset — a record, built through acts of generosity."
            />
            <ol
              className="max-w-lg space-y-3"
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
                  {item.topics?.title && (
                    <p className="mt-0.5 text-xs tracking-[0.07em] text-muted-foreground uppercase">
                      {item.topics.title}
                    </p>
                  )}
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

      {/* ── Section 5: Where the money goes ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <SectionHeader
            className="mb-6"
            eyebrow="Where the money goes"
            title="95% reaches your chosen charity."
            lede="A 5% platform fee covers favpoll's costs. The remaining 95% reaches your chosen charity in full, processed directly through Stripe. You choose up to three charities per favpoll — the pledged total is split equally between them."
          />
          {charities.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Charities on favpoll include{" "}
              {charities.map((c) => c.name).join(", ")} and more.
            </p>
          )}
        </div>
      </section>

      {/* ── Section 6: Written in advance ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <SectionHeader
            eyebrow="Written in advance"
            title="A favpoll can be part of a will."
            lede="The questions and the reveals can be written in advance — by you, in your own words — and kept in a will or letter of wishes. An executor creates the favpoll when the time comes. Guests receive your answer in your voice, after they have pledged. It is one of the quietest and most lasting things this platform makes possible."
          />
        </div>
      </section>

      {/* ── Section 7: Honour · Charity · Love + final CTA ── */}
      <section className="py-16">
        <div className="mx-auto max-w-330 px-6">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
            <div>
              <SectionHeader
                className="mb-8"
                eyebrow="Honour · Charity · Love"
                title={t("landing.subheader")}
                lede="Every favpoll sits at the intersection of three things that rarely appear together. That is what makes it different."
              />
              <div className="flex flex-wrap items-center gap-3.5">
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

            <div className="hidden md:block">
              <HonourCharityLoveVenn
                size={280}
                animate
                className="opacity-90"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
