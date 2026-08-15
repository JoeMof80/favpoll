import { FavpollMarkGlyph } from "@/components/landing/hero-texture"
import { BumpChart } from "@/components/bump-chart"
import type { RankHistory } from "@/lib/rank-history"
import { formatPoundsExact } from "@/lib/i18n"

// The keepsake: "the story of the day" as a single A4 sheet. Ordinal
// standings, the reveal, the total, and the guests who took part — no
// per-guest amounts (the amounts-private default holds here too).
//
// TWO VARIANTS, and deliberately the SAME TWO the live display already has
// (founder, 2026-08-15) — tribute and fundraiser, defaulted from the
// register, overridable. Reusing that axis rather than inventing one means
// the screen in the room and the sheet afterwards tell the same story the
// same way, and there is no second vocabulary for an organiser to learn.
//
//   tribute    — the person leads and the money stays quiet. The total is a
//                line, not a headline, and the names get room.
//   fundraiser — the total IS the headline, because on a fundraiser what
//                was raised is the achievement being kept.
//
// ONE SHEET, deliberately (founder). It claimed to be one and printed two.
// The standings cap at TOP_N with a line for the rest, and the chart draws
// far fewer lanes — what fell off was never the point of a keepsake.

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

export type KeepsakeVariant = "tribute" | "fundraiser"

// TEN standings, in TWO COLUMNS. A single column of ten ran to 99mm and was
// the reason the sheet would not fit; two columns halve that for the same
// content, which is a better trade than the one I was making — I had cut to
// eight, then six, shaving the thing a keepsake is FOR to make room for the
// thing it is decorated with.
//
// Measured against the worst case throughout: a keepsake WITH a reveal, on
// a busy favpoll. Uncapped and single-column that came to 334mm against
// 277mm of printable page.
const TOP_N = 10
const CHART_LANES = 4
const CHART_HIGHLIGHT = 5
// Names are the POINT of a keepsake, so this cap is high and the remainder
// is absorbed by the "and everyone who took part" line that was already
// there. Uncapped, a busy favpoll's fifty names ran to 42mm and pushed a
// keepsake with a reveal onto a second page.
const MAX_NAMES = 30

export function KeepsakeDocument({
  data,
  variant = "fundraiser",
}: {
  data: KeepsakeData
  variant?: KeepsakeVariant
}) {
  const max = data.standings[0]?.amount ?? 0
  const shown = data.standings.slice(0, TOP_N)
  const rest = data.standings.length - shown.length
  const isTribute = variant === "tribute"

  const total = (
    <>
      <p className="text-sm text-muted-foreground">Together, guests raised</p>
      <p
        className={
          isTribute
            ? "mt-1 text-xl font-medium text-foreground"
            : "mt-1 text-4xl font-medium text-primary"
        }
      >
        {formatPoundsExact(data.totalRaised)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        for {charityLabel(data.charityNames)}
      </p>
    </>
  )

  return (
    <article className="mx-auto max-w-[720px] bg-background px-10 py-8 text-foreground print:px-0 print:py-0">
      {/* Header */}
      <header className="flex flex-col items-center border-b border-border pb-4 text-center">
        <span className="mb-3 inline-flex text-primary">
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

      {/* On a fundraiser the total is the headline and comes first — what
          was raised IS the achievement being kept. On a tribute it waits
          until the end and speaks quietly. */}
      {!isTribute && <section className="mt-6 text-center">{total}</section>}

      {/* Reveal */}
      {data.reveal && (
        <section className="mt-6">
          <p className="border-l-2 border-primary-muted pl-4 text-lg leading-relaxed text-reveal-foreground italic">
            {data.reveal}
          </p>
        </section>
      )}

      {/* Final standings */}
      <section className="mt-6">
        <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Favourite {data.topicTitle.toLowerCase()} — the final word
        </h2>
        {/* Flows DOWN the left column then down the right — 1-5, 6-10 — not
            across in pairs. A ranking is read in order, and a grid's default
            row-first flow put 1 beside 2. Rows computed from the count so a
            short list does not leave a hole. */}
        <ol
          className="mt-2 grid grid-flow-col grid-cols-2 gap-x-8 gap-y-1"
          style={{
            gridTemplateRows: `repeat(${Math.ceil(shown.length / 2)}, auto)`,
          }}
        >
          {shown.map((s, i) => (
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
                    {formatPoundsExact(s.amount)}
                  </span>
                </span>
                <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-muted">
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
        {rest > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            and {rest} more {rest === 1 ? "favourite" : "favourites"} — the full
            list is in the CSV.
          </p>
        )}
      </section>

      {/* The story of the poll */}
      {data.rankHistory && (
        <section className="mt-6 break-inside-avoid">
          <BumpChart
            history={data.rankHistory}
            title="The story of the day"
            caption="Positions only — how each favourite ranked as pledges came in."
            highlightTop={CHART_HIGHLIGHT}
            maxSeries={CHART_LANES}
          />
        </section>
      )}

      {/* Total + thanks */}
      <section className="mt-6 break-inside-avoid border-t border-border pt-5 text-center">
        {isTribute && total}
        {data.guestNames.length > 0 && (
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">With thanks to </span>
            {data.guestNames.slice(0, MAX_NAMES).join(", ")}
            {" — and everyone who took part."}
          </p>
        )}
      </section>

      <footer className="mt-6 text-center text-xs text-muted-foreground">
        <p className="italic">
          Expressions of joy, for charitable causes, in the name of those we
          love.
        </p>
        <p className="mt-1">favpoll.com · {data.closedDate}</p>
      </footer>
    </article>
  )
}
