import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { HeroTexture } from "@/components/landing/hero-texture"
import { FadeIn } from "@/components/landing/fade-in"
import {
  PackArtefact,
  PhoneArtefact,
  DisplayArtefact,
} from "@/components/landing/feature-artefacts"

// What a favpoll actually does, for the reader who has understood the idea
// and now wants the capability list — a hospice fundraising manager, a
// charity partner, someone deciding whether to recommend it. The homepage
// tells the story; this page answers "but what does it do".
//
// Grouped by READER (organiser, guest, the room, charity) rather than by
// feature, because those are the three people in every favpoll and the order
// they arrive in. Section ids are stable: the process overview links here,
// and deep links into a section should keep working.
//
// Copy lives inline rather than in messages/en-GB.json, following /about —
// the nearest neighbour and the other long-form content page. The landing
// and register pages use t() because their strings are tuned and re-tuned in
// isolation; prose this long is unreadable as key/value pairs.
//
// Deliberately NOT here: Gift Aid, which is effectively confirmed but not
// contractually settled — it is the most attractive line this page could
// carry and the most damaging to get wrong. And the keepsake page, which
// needs work before it is advertised.

export const metadata: Metadata = {
  title: "Features — favpoll",
  description:
    "What a favpoll does: the print pack, the live display, the shared fund, and 100% of every pledge to a registered charity.",
}

type Item = { label: string; body: string }

const ORGANISER: Item[] = [
  {
    label: "Free to create",
    body: "No fee to set one up, and none taken from the gift.",
  },
  {
    label: "A topic, or your own items",
    body: "Pick one of favpoll's topics — favourite biscuit, favourite song, favourite dog breed — or add items nobody has thought of yet.",
  },
  {
    label: "One to three charities",
    body: "Name up to three. The proceeds are split equally between them.",
  },
  {
    label: "A goal, if you want one",
    body: "A milestone rather than a finish line: the favpoll stays open either way, and every pledge after it still counts.",
  },
  {
    label: "A closing date, up to 90 days",
    body: "It closes on its own when the date arrives, and the proceeds go on their way.",
  },
  {
    label: "The story",
    body: "A photo, a few lines about the person or the cause, and the reveal that waits for guests who have pledged.",
  },
  {
    label: "Editable after publishing",
    body: "Change the details, the charities or the closing date any time before it closes.",
  },
  {
    label: "Private if you need it",
    body: "An unlisted favpoll is reachable only by the people you share it with, and never appears on the public favpolls page.",
  },
]

const GUEST: Item[] = [
  {
    label: "Nothing to sign up for",
    body: "A guest pledges with an email address. No account, no app.",
  },
  {
    label: "Their own favourite",
    body: "Pick from the list, or add one that isn't on it.",
  },
  {
    label: "Pledge what it's worth",
    body: "The amount is theirs to decide. Card payments are handled by Stripe.",
  },
  {
    label: "The reveal",
    body: "Pledging shows where their favourite stands — and, where the organiser has written one, the favourite the favpoll was holding.",
  },
  {
    label: "The shared fund",
    body: "Anyone can top it up so a guest without means — a child, usually — still takes part. Nobody sees who used it.",
  },
]

const ROOM: Item[] = [
  {
    label: "Standings that move",
    body: "The rankings re-order as pledges land, so the room watches its own answer arrive.",
  },
  {
    label: "The guest wall",
    body: "Who backed what, as it happens.",
  },
  {
    label: "A code the room can scan",
    body: "Large enough to read from across the room, and shown on both sides of the screen on a wide one.",
  },
  {
    label: "Two ways to run it",
    body: "The fundraiser leads with the total climbing. The tribute turns the volume down: the person leads, and the money stays quiet.",
  },
]

const CHARITY: Item[] = [
  {
    label: "100% of every pledge",
    body: "favpoll takes no fee from donations. The whole pledge reaches the charity.",
  },
  {
    label: "Registered charities only",
    body: "favpoll is not a crowdfunding platform. The recipient is always a registered charity — never a project fund, and never the organiser.",
  },
  {
    label: "The number is shown",
    body: "The registered charity number appears on the printed cards, on the favpoll page and on the screen in the room.",
  },
  {
    label: "Paid out on close",
    body: "When a favpoll closes, the proceeds go to the charities the organiser named.",
  },
]

function ItemList({ items }: { items: Item[] }) {
  return (
    <dl className="grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-2">
      {items.map((item) => (
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
  )
}

function Section({
  id,
  eyebrow,
  heading,
  lead,
  children,
}: {
  id: string
  eyebrow: string
  heading: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border py-16">
      <FadeIn>
        <SectionEyebrow className="mb-2">{eyebrow}</SectionEyebrow>
        <h2 className="mb-4 max-w-xl text-3xl font-light tracking-tight text-foreground">
          {heading}
        </h2>
        {lead && (
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {lead}
          </p>
        )}
      </FadeIn>
      <FadeIn delay={0.08}>{children}</FadeIn>
    </section>
  )
}

export default function FeaturesPage() {
  return (
    <main className="flex flex-col">
      <section className="relative bg-primary text-primary-foreground">
        <HeroTexture />
        <div className="relative mx-auto max-w-330 px-6 py-16 md:py-20">
          <p className="mb-4 text-xs font-medium tracking-widest uppercase opacity-80">
            Features
          </p>
          <h1 className="max-w-3xl text-4xl leading-[1.12] font-light tracking-tight md:text-5xl">
            Everything a favpoll can do.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed opacity-90">
            From the card on the table to the screen in the room — and every
            penny to the charity.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls">See favpoll in action →</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-330 px-6">
        {/* The fee, on its own and near the top. It is the most unusual thing
            about the product and the first question a charity partner asks;
            buried inside the charities section it reads as a detail. */}
        <section className="border-b border-border py-12">
          <FadeIn>
            <p className="max-w-3xl text-2xl leading-relaxed font-light tracking-tight text-foreground">
              favpoll takes no fee. 100% of every pledge reaches the charity in
              full.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Payments are processed by Stripe. favpoll is supported by optional
              contributions from guests who choose to add one — never by the
              pledge itself.
            </p>
          </FadeIn>
        </section>

        <Section
          id="organisers"
          eyebrow="For organisers"
          heading="Setting one up."
          lead="A favpoll asks one question and gathers the answers. Everything below is set when you create it, and most of it can be changed afterwards."
        >
          <ItemList items={ORGANISER} />
        </Section>

        {/* The print pack — the most tangible thing favpoll makes, and the
            one that appears nowhere else on the site. */}
        <section
          id="print-pack"
          className="scroll-mt-20 border-b border-border py-16"
        >
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <FadeIn>
              <SectionEyebrow className="mb-2">The print pack</SectionEyebrow>
              <h2 className="mb-4 max-w-xl text-3xl font-light tracking-tight text-foreground">
                Something to put on the tables.
              </h2>
              <p className="mb-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Every favpoll comes with a pack to print: an A4 poster for the
                door, A5 cards for the tables, and eight wallet cards to a sheet
                — credit-card size, so they slip into an order of service or a
                pocket.
              </p>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                Each one carries the topic, the charity and its registered
                number, the three steps a guest needs, and a code that opens the
                favpoll on their phone.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <PackArtefact />
            </FadeIn>
          </div>
        </section>

        <Section
          id="guests"
          eyebrow="For guests"
          heading="Taking part."
          lead="A guest scans a code or follows a link. There is nothing between them and the question."
        >
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_auto]">
            <ItemList items={GUEST} />
            <PhoneArtefact />
          </div>
        </Section>

        <Section
          id="the-room"
          eyebrow="On the day"
          heading="The screen in the room."
          lead="Open the live display on any screen — a television, a projector, a laptop on a table — and the room follows one question together."
        >
          <div className="flex flex-col gap-10">
            <ItemList items={ROOM} />
            <DisplayArtefact />
          </div>
        </Section>

        <Section
          id="charities"
          eyebrow="For charities"
          heading="Where the money goes."
        >
          <ItemList items={CHARITY} />
        </Section>

        <Section
          id="beyond"
          eyebrow="Beyond the day"
          heading="What outlasts it."
        >
          <div className="grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-base font-medium text-foreground">
                Written into a will
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                A favpoll can be specified in a will or a letter of wishes — the
                questions and the reveal written in advance, for an executor to
                create when the time comes.
              </p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2 text-base font-medium text-foreground">
                The record
                <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Coming soon
                </span>
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Every pledge adds to a permanent ranking of favourites. Nothing
                on it is gamed or free — every standing was paid for.
              </p>
            </div>
          </div>
        </Section>

        <section className="py-16">
          <FadeIn>
            <h2 className="mb-6 max-w-xl text-3xl font-light tracking-tight text-foreground">
              Start one.
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/favpolls/new">Create a favpoll</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Free to create · 100% goes to charity
              </p>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  )
}
