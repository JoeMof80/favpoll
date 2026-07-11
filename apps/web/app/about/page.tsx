import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import HonourCharityLoveVenn from "@/components/landing/honour-charity-love-venn"
import { HeroTexture } from "@/components/landing/hero-texture"
import { FadeIn } from "@/components/landing/fade-in"
import { ContactForm } from "@/components/contact-form"

export const metadata: Metadata = {
  title: "About — favpoll",
  description:
    "Expressions of joy, for charitable causes, in the name of those we love.",
}

// The Charity · Honour · Love triad — favpoll's identity. "Honour" is broadened
// beyond remembrance/celebration so it doesn't fence out fundraisers and causes.
const TRIAD = [
  ["Charity", "Every pledge goes to a cause chosen in someone's name."],
  ["Honour", "Every favpoll marks a moment that matters."],
  [
    "Love",
    "Every answer is a small piece of what someone genuinely cares about.",
  ],
] as const

// A lean, show-don't-tell about page: the landing shows what favpoll is, so this
// states the soul (the brand statement), the principles, and offers a way to
// reach us — no definition, no origin story (that's press/investor material).
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
        {/* ── Principles ── */}
        <section className="border-b border-border py-16">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
            <div>
              <FadeIn>
                <SectionEyebrow className="mb-2">
                  Charity · Honour · Love
                </SectionEyebrow>
                <h2 className="mb-6 max-w-xl text-3xl font-light tracking-tight text-foreground">
                  What every favpoll holds.
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
                    favpoll takes no fee. Every pledge reaches the charity you
                    choose, in full.
                  </p>
                </FadeIn>
                <FadeIn delay={0.38}>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Every pledge also feeds{" "}
                    <Link
                      href="/rankings"
                      className="text-primary hover:underline"
                    >
                      the record
                    </Link>{" "}
                    — favpoll&apos;s permanent ranking of favourites. Nothing on
                    it is gamed or free; every standing was paid for.
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

        {/* ── Contact ── */}
        <section className="py-16">
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
