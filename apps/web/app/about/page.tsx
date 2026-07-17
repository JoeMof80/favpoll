import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { HeroTexture } from "@/components/landing/hero-texture"
import { FadeIn } from "@/components/landing/fade-in"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "About — favpoll",
  description:
    "Expressions of joy, for charitable causes, in the name of those we love.",
}

// A lean about page: the soul (the brand statement), the founder's plain
// two-paragraph definition (2026-07-17 — a charity partner wants the
// mechanics stated, not demoed) with the fee + record principles in its
// tail, and a way to reach us. The Charity · Honour · Love triad was
// retired from the page same day: it's internal mythology (a design
// principle we evaluate copy against), not reader copy. No origin story
// (press/investor material).
export default function AboutPage() {
  return (
    <main className="flex flex-col">
      {/* ── Top: the soul ── */}
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
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls">See favpoll in action →</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-330 px-6">
        {/* ── The definition — the mechanics, stated plainly ── */}
        <section className="border-b border-border py-16">
          <FadeIn>
            <SectionEyebrow className="mb-2">What a favpoll is</SectionEyebrow>
            <h2 className="mb-6 max-w-xl text-3xl font-light tracking-tight text-foreground">
              Three parts, one act of giving.
            </h2>
          </FadeIn>
          <div className="flex max-w-2xl flex-col gap-5">
            <FadeIn delay={0.08}>
              <p className="text-base leading-relaxed text-muted-foreground">
                A favpoll can stand alone or accompany a life event. It has
                three parts: a topic (Dog breed), one to three charities (Dogs
                Trust), and a subject — somebody to honour, or a cause to
                support.
              </p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base leading-relaxed text-muted-foreground">
                Guests pick their favourite (Golden Retriever) and pledge money
                towards it; 100% goes to the charity. Pledging reveals the
                rankings and — optionally — the subject&apos;s favourite.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <p className="text-base leading-relaxed text-muted-foreground">
                Every pledge also feeds{" "}
                <Link href="/record" className="text-primary hover:underline">
                  the record
                </Link>{" "}
                — favpoll&apos;s permanent ranking of favourites. Nothing on it
                is gamed or free; every standing was paid for.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── Where the money goes — the due-diligence section; the footer's
            "Where the money goes" blurb deep-links here ── */}
        <section
          id="money"
          className="scroll-mt-20 border-b border-border py-16"
        >
          <FadeIn>
            <SectionEyebrow className="mb-2">
              Where the money goes
            </SectionEyebrow>
            <h2 className="mb-6 max-w-xl text-3xl font-light tracking-tight text-foreground">
              All of it, to the charity.
            </h2>
          </FadeIn>
          <div className="flex max-w-2xl flex-col gap-5">
            <FadeIn delay={0.08}>
              <p className="text-base leading-relaxed text-muted-foreground">
                favpoll takes no fee from donations. 100% of every pledge
                reaches your chosen charity in full. Payments are processed by
                Stripe.
              </p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base leading-relaxed text-muted-foreground">
                The recipient is always a registered charity. favpoll never
                raises money for projects or individuals — a cause favpoll means
                a charitable cause, with a registered charity as the recipient.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <p className="text-base leading-relaxed text-muted-foreground">
                Guests pledge with just an email — no account needed.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── Written in advance — the wills differentiator; the footer's
            "Written in advance" blurb deep-links here ── */}
        <section
          id="wills"
          className="scroll-mt-20 border-b border-border py-16"
        >
          <FadeIn>
            <SectionEyebrow className="mb-2">Written in advance</SectionEyebrow>
            <h2 className="mb-6 max-w-xl text-3xl font-light tracking-tight text-foreground">
              In your own words, ahead of time.
            </h2>
          </FadeIn>
          <div className="flex max-w-2xl flex-col gap-5">
            <FadeIn delay={0.08}>
              <p className="text-base leading-relaxed text-muted-foreground">
                A favpoll can be kept in a will or letter of wishes. The
                questions and the reveals are written in advance, in your own
                words; when the time comes, an executor creates the favpoll
                exactly as you set it down.
              </p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base leading-relaxed text-muted-foreground">
                Reveals written this way speak in the first person — &ldquo;Mine
                was purple. I wore it to every occasion that mattered.&rdquo; A
                last word, kept exactly as it was given.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="scroll-mt-20 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
            <FadeIn>
              <SectionEyebrow className="mb-2">Get in touch</SectionEyebrow>
              <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
                We&apos;d love to hear from you.
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Whether you&apos;re a charity wondering how favpoll works, a
                partner with an idea, or a writer with a question — this reaches
                us.
              </p>
            </FadeIn>
            <ContactForm />
          </div>
        </section>
      </div>
    </main>
  )
}
