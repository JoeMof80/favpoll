import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import HonourCharityLoveVenn from "@/components/landing/honour-charity-love-venn"
import { HeroTexture } from "@/components/landing/hero-texture"
import { FadeIn } from "@/components/landing/fade-in"
import { t } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "About — favpoll",
  description:
    "Expressions of joy, for charitable causes, in the name of those we love.",
}

const TRIAD = [
  ["Charity", "Every pledge goes to a cause chosen in someone's name."],
  ["Honour", "Every favpoll is an act of remembrance or celebration."],
  [
    "Love",
    "Every answer is a small piece of what someone genuinely cares about.",
  ],
] as const

export default function AboutPage() {
  return (
    <main className="flex flex-col">
      {/* ── Opening: the brand statement ── */}
      <section className="relative bg-primary text-primary-foreground">
        <HeroTexture />
        <div className="relative mx-auto max-w-330 px-6 py-16 md:py-20">
          <p className="mb-4 text-xs font-medium tracking-widest uppercase opacity-80">
            About favpoll
          </p>
          <h1 className="max-w-3xl text-4xl leading-[1.12] font-light tracking-tight md:text-5xl">
            Expressions of joy, for charitable causes, in the name of those we
            love.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-80">
            favpoll is a charitable polling platform for life's most significant
            moments. Guests pledge real money against their favourite things, in
            the name of someone being honoured. The rankings move in real time.
            The proceeds go to charity.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-330 px-6">
        {/* ── Where it started ── */}
        <section className="border-b border-border py-16">
          <FadeIn>
            <SectionEyebrow className="mb-2">Where it started</SectionEyebrow>
            <h2 className="mb-6 max-w-2xl text-3xl font-light tracking-tight text-foreground">
              A question fifteen years in the making.
            </h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="grid max-w-4xl gap-8 md:grid-cols-2">
              <p className="text-base leading-relaxed text-muted-foreground">
                Is there a way to build a permanent, honest record of what
                people love? Every existing ranking — charts, reviews, polls —
                is too easy. A click costs nothing, a star rating takes two
                seconds, and nobody asks whether you really meant it.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                The answer came from human nature, not technology. People give
                at the moments that matter most — memorials, birthdays,
                retirements. Connect charitable giving with genuine preference,
                and every answer costs someone something. Purple sits in first
                place not because a thousand people clicked it on a Thursday,
                but because families pledged real money in memory of people who
                loved it.
              </p>
            </div>
            <blockquote className="mt-8 border-l-[2.5px] border-primary-muted pl-3 text-lg leading-relaxed text-reveal-foreground italic">
              Data with soul.
            </blockquote>
          </FadeIn>
        </section>

        {/* ── The identity ── */}
        <section className="border-b border-border py-16">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
            <div>
              <FadeIn>
                <SectionEyebrow className="mb-2">
                  Honour · Charity · Love
                </SectionEyebrow>
                <h2 className="mb-6 max-w-xl text-3xl font-light tracking-tight text-foreground">
                  Three things that rarely appear together.
                </h2>
              </FadeIn>
              <div className="flex max-w-xl flex-col gap-5">
                {TRIAD.map(([word, line], i) => (
                  <FadeIn key={word} delay={i * 0.08}>
                    <p className="text-base leading-relaxed">
                      <span className="font-medium text-primary">{word}.</span>{" "}
                      <span className="text-muted-foreground">{line}</span>
                    </p>
                  </FadeIn>
                ))}
                <FadeIn delay={0.3}>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Most charitable platforms have charity without honour. Most
                    tributes have honour and love without charity. favpoll has
                    all three — that intersection is the point.
                  </p>
                </FadeIn>
              </div>
            </div>
            <div className="hidden md:block">
              <HonourCharityLoveVenn
                size={240}
                animate
                className="opacity-90"
              />
            </div>
          </div>
        </section>

        {/* ── Occasion by occasion ── */}
        <section className="border-b border-border py-16">
          <FadeIn>
            <SectionEyebrow className="mb-2">
              Occasion by occasion
            </SectionEyebrow>
            <h2 className="mb-10 max-w-2xl text-3xl font-light tracking-tight text-foreground">
              The same quiet mechanic, tuned to the moment.
            </h2>
          </FadeIn>

          <div className="flex max-w-3xl flex-col gap-12">
            <FadeIn>
              <section id="memorials" className="scroll-mt-20">
                <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground">
                  For memorials
                </h3>
                <p className="mb-4 text-base leading-relaxed text-muted-foreground">
                  favpoll began here, where the need is clearest. A memorial
                  favpoll asks one question the person loved — a favourite
                  colour, a favourite song — and holds their answer back. Guests
                  pledge to the family's chosen charity, and then read it: their
                  voice, one more time. At the service itself, a live display
                  can show the rankings shift as guests pledge from their phones
                  — a shared, living tribute no collection tin could manage.
                </p>
                <div
                  id="wills"
                  className="scroll-mt-20 rounded-xl border border-border bg-background p-5"
                >
                  <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
                    Written in advance
                  </p>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Some favpolls are written by the person themselves and kept
                    in a will or letter of wishes — the questions and the
                    reveals prepared in advance, in their own words. An executor
                    creates the favpoll when the time comes. It is not morbid;
                    it is generous. It says: here is something I want you to
                    know about me, and here is how I want you to be remembered
                    knowing it.
                  </p>
                </div>
              </section>
            </FadeIn>

            <FadeIn>
              <section id="celebrations" className="scroll-mt-20">
                <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground">
                  For celebrations
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Birthdays, retirements, weddings, engagements, graduations,
                  leaving dos. The mechanic is the same; the mood is lighter.
                  Poppy has strong opinions about ice cream, and her guests
                  pledge to charity to find out just how strong. The reveal
                  lands as a punchline rather than a farewell — and the giving
                  is real either way.
                </p>
              </section>
            </FadeIn>

            <FadeIn>
              <section id="fundraisers" className="scroll-mt-20">
                <h3 className="mb-3 text-xl font-medium tracking-tight text-foreground">
                  For fundraisers
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  A favpoll doesn't have to honour one person. A cause can carry
                  one — a village hall roof, a community appeal, a memorial
                  fund. The poll gives people a reason to gather round, the
                  reveal gives them something back, and every pledge goes where
                  it was promised.
                </p>
              </section>
            </FadeIn>
          </div>
        </section>

        {/* ── Where the money goes ── */}
        <section
          id="money"
          className="scroll-mt-20 border-b border-border py-16"
        >
          <FadeIn>
            <SectionEyebrow className="mb-2">
              Where the money goes
            </SectionEyebrow>
            <h2 className="mb-3 max-w-xl text-3xl font-light tracking-tight text-foreground">
              95% reaches your chosen charity.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              A 5% platform fee covers favpoll's costs. The remaining 95%
              reaches your chosen charity in full, processed directly through
              Stripe. You choose up to three charities per favpoll — the pledged
              total is split equally between them — and the fee is always shown
              to guests before they confirm.
            </p>
          </FadeIn>
        </section>

        {/* ── The record ── */}
        <section className="border-b border-border py-16">
          <FadeIn>
            <SectionEyebrow className="mb-2">The record</SectionEyebrow>
            <h2 className="mb-3 max-w-xl text-3xl font-light tracking-tight text-foreground">
              A lasting contribution from a day that meant everything.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Every pledge also feeds the record — favpoll's permanent ranking
              of human favourites, built entirely through acts of generosity. It
              wasn't gamed, and it wasn't passively accumulated. It was paid
              for, freely, by people honouring someone they loved.
            </p>
            <p className="mt-6">
              <Button variant="ghost" asChild>
                <Link href="/rankings">See the record →</Link>
              </Button>
            </p>
          </FadeIn>
        </section>

        {/* ── Close ── */}
        <section className="py-16">
          <FadeIn>
            <div className="flex flex-col items-start gap-5">
              <h2 className="max-w-xl text-3xl font-light tracking-tight text-foreground">
                {t("landing.subheader")}
              </h2>
              <div className="flex flex-wrap items-center gap-3.5">
                <Button asChild size="lg">
                  <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/favpolls">See live favpolls →</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("landing.cta.caption")}
              </p>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  )
}
