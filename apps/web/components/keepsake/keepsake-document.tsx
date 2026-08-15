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
// ONE SHEET, and LANDSCAPE (founder, 2026-08-15). Portrait made a tall thin
// column of a document that has four things to say, so it either ran to two
// pages or left the bottom third empty. Landscape gives two columns: the
// words on the left, the numbers on the right, the day's header across the
// top and the thanks across the foot.
//
// The extra room also let the sheet say MORE rather than less — a stat line
// under the header, and the standings back to a comfortable single column.

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

// Ten standings in ONE column, which landscape has the height for — portrait
// needed two columns to fit ten at all. Twelve fitted a keepsake with a
// reveal and overflowed a busy one by 4.5mm, so ten is the number that fits
// BOTH worst cases: a long reveal, and a full thanks list.
const TOP_N = 10
const CHART_LANES = 5
const CHART_HIGHLIGHT = 5
// Names are the POINT of a keepsake, so this cap is high and the remainder
// is absorbed by the "and everyone who took part" line that was already
// there. Uncapped, a busy favpoll's fifty names ran to 42mm and pushed a
// keepsake with a reveal onto a second page.
const MAX_NAMES = 26

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
            ? "mt-1 text-2xl font-medium text-foreground"
            : "mt-1 text-5xl font-medium text-primary"
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
    <article className="mx-auto flex h-full w-full max-w-[297mm] flex-col bg-background px-12 py-6 text-foreground print:px-8 print:py-4">
      {/* ── Header band ── */}
      <header className="flex flex-col items-center border-b border-border pb-4 text-center">
        <span className="mb-1.5 inline-flex text-primary">
          <svg width="30" height="27" viewBox="0 0 10 9" aria-hidden="true">
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
        {/* The extra line landscape paid for: what the day amounted to, in
            facts, before either column argues its case. */}
        <p className="mt-2 text-xs text-muted-foreground">
          {data.rankHistory ? `${data.rankHistory.steps} pledges · ` : ""}
          {data.standings.length}{" "}
          {data.standings.length === 1 ? "favourite" : "favourites"} · closed{" "}
          {data.closedDate}
        </p>
      </header>

      {/* ── Two columns: the words, then the numbers ── */}
      <div className="grid flex-1 grid-cols-[1fr_1.15fr] gap-10 pt-4">
        <div className="flex flex-col">
          {data.reveal && (
            <p className="border-l-2 border-primary-muted pl-4 text-base leading-relaxed text-reveal-foreground italic">
              {data.reveal}
            </p>
          )}

          <section className={data.reveal ? "mt-5" : ""}>
            <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Favourite {data.topicTitle.toLowerCase()} — the final word
            </h2>
            <ol className="mt-2 space-y-0.5">
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
              <p className="mt-2 text-sm text-muted-foreground">
                and {rest} more {rest === 1 ? "favourite" : "favourites"} — the
                full list is in the CSV.
              </p>
            )}
          </section>
        </div>

        <div className="flex flex-col">
          <section className="text-center">{total}</section>

          {data.rankHistory && (
            <section className="mt-5 break-inside-avoid">
              <BumpChart
                history={data.rankHistory}
                title="The story of the day"
                caption="Positions only — how each favourite ranked as pledges came in."
                highlightTop={CHART_HIGHLIGHT}
                maxSeries={CHART_LANES}
              />
            </section>
          )}
        </div>
      </div>

      {/* ── Thanks and the brand line, across the foot ── */}
      <footer className="mt-3 border-t border-border pt-3 text-center">
        {data.guestNames.length > 0 && (
          <p className="mx-auto max-w-4xl text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">With thanks to </span>
            {data.guestNames.slice(0, MAX_NAMES).join(", ")}
            {" — and everyone who took part."}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground italic">
          Expressions of joy, for charitable causes, in the name of those we
          love.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">favpoll.com</p>
      </footer>
    </article>
  )
}
