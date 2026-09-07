import type { Metadata } from "next"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { HeroTexture } from "@/components/landing/hero-texture"
import { FadeIn } from "@/components/landing/fade-in"
import { ContactForm } from "@/components/contact-form"

// The spec of the product — true of every favpoll, whatever the occasion.
// Moved here from /features on 2026-08-16 (founder): the basics aren't a
// feature, and About is where the product states what it is. The fee line
// stays out — "Where the money goes" makes that argument above.
const BASICS: { label: string; body: string }[] = [
  {
    label: "Free to create",
    body: "No fee to set one up, and none taken from the gift.",
  },
  {
    label: "One to three charities",
    body: "Name up to three. The proceeds are split equally between them.",
  },
  {
    label: "Up to 90 days",
    body: "It closes on its own when the date arrives, and the proceeds go on their way.",
  },
  {
    // Rewritten 2026-09-03: since the wizard edits (#604), Event, Charity
    // and Topic lock the moment any money lands — the old "change the
    // charities any time" claim had become false, and the truth is the
    // stronger trust line.
    label: "Editable after publishing",
    body: "Change the story, the goal or the closing date any time before it closes. The charity and topic lock the moment a guest pledges — nobody's gift can be redirected.",
  },
  {
    // Rewritten 2026-09-03 for the three-notch model: this described
    // unlisted while wearing the Private label, and the strongest tier
    // went unstated.
    label: "Private if you need it",
    body: "A link-only favpoll never appears on the public favpolls page. A private one goes further: guests must sign in, and shared links preview no details.",
  },
  {
    label: "Nothing to sign up for",
    body: "A guest pledges with an email address. No account, no app.",
  },
]

// Operational questions neither the marketing nor the basics answer — the
// anxieties that make an organiser hesitate before creating. Kept
// product-true (see the brand skill). Four items retired 2026-08-16 when
// The basics arrived above: run length, editability, account-free pledging
// and unlisted privacy restated the spec grid word for word. What remains
// is the questions with a real answer behind them — goal-as-milestone, the
// shared pot, and what closing means. The fee question lives in the
// "Where the money goes" section, not here.
// Answers are ReactNode since 2026-09-03: first mentions of features
// link to their /features sections — the reference the FAQ leans on.
const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "If I set a goal, does pledging stop once it's reached?",
    a: "No. A goal is a milestone, not a finish line. The favpoll stays open until its closing date, and every pledge after the goal still counts.",
  },
  {
    q: "Can someone pledge for a guest who can't pay?",
    a: (
      <>
        Yes. Anyone can top up a{" "}
        <Link
          href="/features#shared-fund"
          className="text-primary underline-offset-4 hover:underline"
        >
          shared pot
        </Link>
        , so a child or a guest without means can still take part — and nobody
        sees who used it.
      </>
    ),
  },
  {
    // The wall left /features on 2026-08-19 — folded into the live display,
    // where the founder judged it has most of its value. It lands here so its
    // facts stay somewhere an evaluator can find them, which is the reason
    // the capability grid gave for keeping it on /features in the first place
    // ("absence reads as absence"). About is the spec now; /features is not.
    q: "Can guests see who pledged?",
    a: (
      <>
        Names and favourites, never amounts. The guest book shows who backed
        what — on the favpoll itself and on the{" "}
        <Link
          href="/features#display"
          className="text-primary underline-offset-4 hover:underline"
        >
          live display
        </Link>{" "}
        — and anyone can appear as “Someone” instead.
      </>
    ),
  },
  {
    // THE PRIVACY PROMISE LANDS HERE (founder, 2026-08-19) because /features
    // stopped making it. Two bullets carrying it were dropped from that page
    // the same day — the shared pot's "nobody sees who used it" and the
    // keepsake's "No individual amounts — what people gave stays theirs" —
    // leaving the pitch silent on a question anyone giving money in front of
    // other people actually asks.
    //
    // It is a decided model, not a description of current behaviour: the wall
    // is "presence, not size ... never amounts" (2026-07-05), keepsake-csv.ts
    // keeps per-guest amounts out of the export, and the organiser's own
    // dashboard reads aggregates only — total_raised, goal_amount, and the
    // pot's deposited/allocated. Nobody has a screen that shows who gave what.
    q: "Does anyone see how much I gave?",
    a: (
      <>
        No. favpoll shows presence, not size — the guest book, the{" "}
        <Link
          href="/features#keepsake"
          className="text-primary underline-offset-4 hover:underline"
        >
          keepsake
        </Link>{" "}
        and the spreadsheet export carry names and favourites, never what any
        one person gave. Standings show what each favourite raised between
        everyone, and the organiser sees the total.
      </>
    ),
  },
  {
    q: "What happens when a favpoll closes?",
    a: "Pledging ends and the standings are final, and the proceeds go to the charities you chose. The reveal needs no waiting — every guest saw it the moment they pledged.",
  },
]

export const metadata: Metadata = {
  title: "About — favpoll",
  description:
    "Expressions of joy, for charitable causes, in the name of those we love.",
}

// A lean about page: the soul (the brand statement), the founder's plain
// two-paragraph definition (2026-07-17 — a charity partner wants the
// mechanics stated, not demoed) with the fee + record principles in its
// tail, the spec (The basics, from /features 2026-08-16), and a way to
// reach us. The Charity · Honour · Love triad was
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
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-auto min-h-11 px-6 py-2 text-base"
            >
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
                towards it; favpoll takes no platform fee. Pledging reveals the
                rankings and — optionally — the subject&apos;s favourite.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <p className="text-base leading-relaxed text-muted-foreground">
                Every pledge also feeds{" "}
                <Link
                  href="/record"
                  className="text-primary underline-offset-4 hover:underline"
                >
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
                favpoll takes no platform fee from donations — only card
                processing costs apply. Payments are processed by Stripe, and
                favpoll is supported by optional contributions — never by your
                pledge.
              </p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-base leading-relaxed text-muted-foreground">
                The recipient is always a registered charity. favpoll never
                raises money for projects or individuals — a cause favpoll means
                a charitable cause, with a registered charity as the recipient.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── Written in advance — the wills differentiator. Nothing
            deep-links here any more (the footer blurb it once had is
            gone); it stays as founder conviction, kept 2026-09-03. ── */}
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

        {/* ── The basics — the spec grid, moved from /features 2026-08-16.
            The same dl grammar it had there: a spec sheet is scanned, and
            label-plus-line is the scanning grammar. ── */}
        <section
          id="basics"
          className="scroll-mt-20 border-b border-border py-16"
        >
          <FadeIn>
            <SectionEyebrow className="mb-2">The basics</SectionEyebrow>
            <h2 className="mb-6 max-w-xl text-3xl font-light tracking-tight text-foreground">
              True of every favpoll, whatever the occasion.
            </h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <dl className="grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-2">
              {BASICS.map((item) => (
                <div key={item.label}>
                  <dt className="mb-1 text-base font-medium text-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-base leading-relaxed text-muted-foreground">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </section>

        {/* ── FAQ — the operational questions the marketing doesn't answer.
            Two-column (heading left, accordion right) to match the Contact
            section below and fill the width. Native <details> — no client
            JS in this server page. ── */}
        <section id="faq" className="scroll-mt-20 border-b border-border py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
            <FadeIn>
              <SectionEyebrow className="mb-2">Good to know</SectionEyebrow>
              <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
                FAQ
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                A few practical things worth knowing before you create a
                favpoll.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div>
                {FAQ_ITEMS.map(({ q, a }) => (
                  <details
                    key={q}
                    className="group border-b border-border py-4 first:border-t"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
                      <span>{q}</span>
                      <ChevronDown
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
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
