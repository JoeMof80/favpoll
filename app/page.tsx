import Link from "next/link"
import { HomeCarousel } from "@/components/home-carousel"

const OCCASIONS = [
  "Memorial service",
  "Funeral collection",
  "Birthday celebration",
  "Retirement",
  "Wedding",
  "Anniversary",
  "Leaving do",
]

const HOW_IT_WORKS = [
  {
    step: 1,
    heading: "Create an event",
    body: "Name the person you are celebrating, choose a charity, and pick the poll topics.",
  },
  {
    step: 2,
    heading: "Share your link",
    body: "Send the link to friends and family. No accounts needed — anyone can participate.",
  },
  {
    step: 3,
    heading: "Guests make a pledge",
    body: "Each guest pledges a donation and splits it across their favourite options.",
  },
  {
    step: 4,
    heading: "The charity receives",
    body: "Every penny goes directly to your chosen charity, with live rankings of the results.",
  },
]

const RANKING_CARDS = [
  { topic: "Colour", leader: "Sky blue", amount: "£124" },
  { topic: "Season", leader: "Autumn", amount: "£98" },
  { topic: "Film", leader: "The Shawshank Redemption", amount: "£87" },
  { topic: "Song", leader: "Bohemian Rhapsody", amount: "£76" },
]

export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium tracking-widest text-primary uppercase">
            Donate with meaning
          </span>
          <h1 className="mt-5 text-5xl leading-tight font-bold tracking-tight text-foreground">
            Share what you love.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Create a charitable poll for any occasion. Guests pledge donations
            against their favourite things — and every pledge builds a permanent
            record of what people cherish most.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/events/new"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              Create an event
            </Link>
            <Link
              href="#how-it-works"
              className="rounded text-sm text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
              How it works →
            </Link>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="border-t border-border px-6 py-12">
        <div className="mx-auto max-w-330">
          <p className="mb-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            For every occasion
          </p>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((label) => (
              <span
                key={label}
                className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-border bg-muted/30 px-6 py-16"
      >
        <div className="mx-auto max-w-330">
          <h2 className="mb-10 text-xl font-semibold text-foreground">
            How it works
          </h2>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step} className="flex flex-col gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                  aria-hidden="true"
                >
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  {item.heading}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Example event mockup */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-330">
          <p className="mb-8 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            See it in action
          </p>
          <HomeCarousel />
        </div>
      </section>

      {/* Rankings preview */}
      <section className="border-t border-border bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-330">
          <p className="mb-8 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Live rankings
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RANKING_CARDS.map((card) => (
              <div
                key={card.topic}
                className="rounded-xl border border-border bg-card px-5 py-4"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {card.topic}
                </p>
                <p className="mt-1 truncate text-base font-semibold text-foreground">
                  {card.leader}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {card.amount} pledged
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-330 items-center justify-between">
          <span className="text-sm font-semibold text-foreground">FavPoll</span>
          <span className="text-xs text-muted-foreground">
            Every pledge goes to charity
          </span>
        </div>
      </footer>
    </main>
  )
}
