import { FavpollMarkGlyph } from "@/components/landing/hero-texture"
import { BumpChart } from "@/components/bump-chart"
import type { RankHistory } from "@/lib/rank-history"

// The keepsake: "the story of the day" as a single A4 sheet. Ordinal
// standings, the reveal, the total, and the guests who took part — no
// per-guest amounts (the amounts-private default holds here too). Styled
// to look right on screen and to print cleanly (see print CSS in globals).

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

export type KeepsakeStanding = {
  favouriteId: string
  label: string
  amount: number
}

export type KeepsakeData = {
  prefix: string
  name: string
  context: string | null
  topicTitle: string
  reveal: string | null
  totalRaised: number
  charityNames: string[]
  closedDate: string
  standings: KeepsakeStanding[]
  rankHistory: RankHistory | null
  /** Non-anonymous guest names who pledged, for the thank-you line */
  guestNames: string[]
}

function charityLabel(names: string[]): string {
  if (names.length === 0) return "charity"
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(", ") + " and " + names.at(-1)!
}

export function KeepsakeDocument({ data }: { data: KeepsakeData }) {
  const max = data.standings[0]?.amount ?? 0

  return (
    <article className="mx-auto max-w-[720px] bg-background px-10 py-12 text-foreground print:px-0 print:py-0">
      {/* Header */}
      <header className="flex flex-col items-center border-b border-border pb-6 text-center">
        <span className="mb-4 inline-flex text-primary">
          <svg width="36" height="32" viewBox="0 0 10 9" aria-hidden="true">
            <FavpollMarkGlyph />
          </svg>
        </span>
        <p className="text-xs font-medium tracking-widest text-primary uppercase">
          {data.prefix}
        </p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight text-reveal-foreground">
          {data.name}
        </h1>
        {data.context && (
          <p className="mt-1 text-sm text-muted-foreground">{data.context}</p>
        )}
      </header>

      {/* Reveal */}
      {data.reveal && (
        <section className="mt-8">
          <p className="border-l-2 border-primary-muted pl-4 text-lg leading-relaxed text-reveal-foreground italic">
            {data.reveal}
          </p>
        </section>
      )}

      {/* Final standings */}
      <section className="mt-8">
        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Favourite {data.topicTitle.toLowerCase()} — the final word
        </h2>
        <ol className="mt-3 space-y-2">
          {data.standings.map((s, i) => (
            <li key={s.favouriteId} className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-sm text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <span className="flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={
                      i === 0
                        ? "font-medium text-foreground"
                        : "text-foreground"
                    }
                  >
                    {s.label}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {GBP.format(s.amount)}
                  </span>
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className={`block h-full rounded-full ${i === 0 ? "bg-primary" : "bg-chart-3"}`}
                    style={{
                      width: `${max > 0 ? (s.amount / max) * 100 : 0}%`,
                    }}
                  />
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* The story of the poll */}
      {data.rankHistory && (
        <section className="mt-8 break-inside-avoid">
          <BumpChart
            history={data.rankHistory}
            title="The story of the day"
            caption="Positions only — how each favourite ranked as pledges came in."
          />
        </section>
      )}

      {/* Total + thanks */}
      <section className="mt-8 break-inside-avoid border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">Together, guests raised</p>
        <p className="mt-1 text-3xl font-medium text-primary">
          {GBP.format(data.totalRaised)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          for {charityLabel(data.charityNames)}
        </p>
        {data.guestNames.length > 0 && (
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">With thanks to </span>
            {data.guestNames.join(", ")}
            {" — and everyone who took part."}
          </p>
        )}
      </section>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        <p className="italic">
          Expressions of joy, for charitable causes, in the name of those we
          love.
        </p>
        <p className="mt-1">favpoll.com · {data.closedDate}</p>
      </footer>
    </article>
  )
}
