import { FavpollMarkGlyph } from "@/components/landing/hero-texture"
import { BumpChart } from "@/components/bump-chart"
import type { RankHistory } from "@/lib/rank-history"
import { formatPounds, formatPoundsExact } from "@/lib/i18n"

// The keepsake: the story of the day as a single certificate. Something a
// guest would KEEP — a brand-drawn frame, a centred composition — not a
// report that happens to be printable. Ordinal standings, the reveal, the
// total; no per-guest amounts (the amounts-private default holds here
// too).
//
// TWO VARIANTS, the SAME TWO the live display has (founder, 2026-08-15) —
// tribute and fundraiser, defaulted from the register, overridable. Two
// different documents in one frame (founder, 2026-08-15: "make them
// meaningfully different, or consolidate them"):
//
//   tribute    — a remembrance. The topic and the reveal lead: the reveal
//                is a bordered quote under the poll's topic ribbon, the
//                standings are five dot-leader rows given room, and the
//                money is one closing sentence. No bars, no chart —
//                nothing that reads as a dashboard.
//   fundraiser — an achievement. The amount raised is the centrepiece,
//                and the race is the story: ten standings with bars and
//                the bump chart.
//
// TWO ORIENTATIONS (founder, 2026-08-16), a toggle like the variant. The
// composition is centred, so portrait mostly means narrower and taller —
// only the fundraiser's race zone changes shape, stacking the chart under
// the standings instead of beside them.
//
// EMPTY SPACE IS THE POINT (founder, 2026-08-16: "make better use of empty
// space to convey quality") — the tribute shows five standings, not ten,
// and the foot is a two-line colophon, not a names roll. The named-guest
// list still travels in the CSV export; it just no longer prints.

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
  /** Pledge goal in pounds; null = none was set. Only a REACHED goal
   *  prints — an unmet goal on a finished sheet reads as a shortfall. */
  goalAmount: number | null
  charityNames: string[]
  closedDate: string
  standings: KeepsakeStanding[]
  rankHistory: RankHistory | null
  /** Non-anonymous guest names who pledged — CSV export only, not printed */
  guestNames: string[]
}

function charityLabel(names: string[]): string {
  if (names.length === 0) return "charity"
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(", ") + " and " + names.at(-1)!
}

export type KeepsakeVariant = "tribute" | "fundraiser"
export type KeepsakeOrientation = "landscape" | "portrait"

// The tribute keeps five: the final word is really about the top few, and
// "and N more favourites" carries the rest. The fundraiser keeps ten
// because the crowded race is its character.
const TOP_N_TRIBUTE = 5
const TOP_N_FUNDRAISER = 10
const CHART_LANES = 5
const CHART_HIGHLIGHT = 5

export function KeepsakeDocument({
  data,
  variant = "fundraiser",
  orientation = "landscape",
}: {
  data: KeepsakeData
  variant?: KeepsakeVariant
  orientation?: KeepsakeOrientation
}) {
  const max = data.standings[0]?.amount ?? 0
  const goalReached =
    data.goalAmount != null && data.totalRaised >= data.goalAmount
  const isTribute = variant === "tribute"
  const isPortrait = orientation === "portrait"
  const topN = isTribute ? TOP_N_TRIBUTE : TOP_N_FUNDRAISER
  const shown = data.standings.slice(0, topN)
  const rest = data.standings.length - shown.length
  const restLine =
    rest > 0
      ? `and ${rest} more ${rest === 1 ? "favourite" : "favourites"}`
      : null
  // The two-line Favourite grammar (founder sweep, 2026-09-06),
  // LEFT-aligned to the 150mm content column shared by the quote's
  // gutter and the standings list.
  const topicHeading = (
    <h2 className="w-full max-w-[150mm] text-left">
      <span className="block text-[17px] font-medium tracking-[0.09em] text-primary/55 uppercase">
        Favourite
      </span>
      <span className="block text-[17px] font-medium tracking-[0.09em] text-primary uppercase">
        {data.topicTitle}
      </span>
    </h2>
  )

  return (
    <article
      data-variant={variant}
      data-orientation={orientation}
      className="relative h-full w-full bg-background text-foreground [-webkit-print-color-adjust:exact] [print-color-adjust:exact]"
    >
      {/* ── The frame (founder's design, 2026-08-16; corners rotated as a
          pinwheel 2026-08-31 — TR 90°, BR 180°, BL 270°): the rules drawn
          in the mark's own line language, each side's pair continuing the
          poll lines of the glyph whose lines now point along it (TL feeds
          the top, TR the right, BR the bottom, BL the left).

          All geometry is the glyph's at 2px per unit, in a SQUARE 20×20
          box (viewBox 10×10, the 10×9 glyph centred — the half-unit pad
          is what keeps the rotated corners' features at one shared set of
          offsets). Per corner, measured from its own two edges: the long
          poll line's centre 10px in, the short line's 14px, both end-caps
          on the axis 10px from the adjacent edge, line tips at 19px. */}
      {(
        [
          ["top-[4mm] left-[4mm]", 0],
          ["top-[4mm] right-[4mm]", 90],
          ["bottom-[4mm] right-[4mm]", 180],
          ["bottom-[4mm] left-[4mm]", 270],
        ] as const
      ).map(([pos, rot]) => (
        <svg
          key={pos}
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 10 10"
          className={`pointer-events-none absolute ${pos} text-primary`}
        >
          <g transform={`translate(5 5) rotate(${rot}) translate(-5 -4.5)`}>
            <FavpollMarkGlyph />
          </g>
        </svg>
      ))}
      {/* Horizontal rules — the top pair continues TL's poll lines, the
          bottom pair BR's (rotated 180°, its lines point back along the
          bottom), so both pairs sit at the SAME offsets: long line centre
          10px in from the edge, short 14px. Each starts a breath (3px)
          past its glyph's line tip, with the mark's own 2-unit stagger
          (4px) between the two ends — outer long, inner short, every
          side. */}
      {(
        [
          [
            "top-[calc(4mm+9px)]",
            "right-[calc(4mm+22px)] left-[calc(4mm+22px)]",
          ],
          [
            "top-[calc(4mm+13px)]",
            "right-[calc(4mm+26px)] left-[calc(4mm+26px)]",
          ],
          [
            "bottom-[calc(4mm+9px)]",
            "right-[calc(4mm+22px)] left-[calc(4mm+22px)]",
          ],
          [
            "bottom-[calc(4mm+13px)]",
            "right-[calc(4mm+26px)] left-[calc(4mm+26px)]",
          ],
        ] as const
      ).map(([y, ends]) => (
        <span
          key={y}
          aria-hidden="true"
          className={`pointer-events-none absolute ${ends} ${y} h-[2px] rounded-full bg-primary/50`}
        />
      ))}
      {/* Vertical rules — with the pinwheel these are poll lines too: the
          right pair continues TR's (rotated 90°, lines pointing down), the
          left pair BL's (270°, pointing up). Same offsets as the
          horizontals — long 10px in, short 14px — and the same 22/26 end
          insets against the square corner boxes. */}
      {(
        [
          [
            "left-[calc(4mm+9px)]",
            "top-[calc(4mm+22px)] bottom-[calc(4mm+22px)]",
          ],
          [
            "left-[calc(4mm+13px)]",
            "top-[calc(4mm+26px)] bottom-[calc(4mm+26px)]",
          ],
          [
            "right-[calc(4mm+9px)]",
            "top-[calc(4mm+22px)] bottom-[calc(4mm+22px)]",
          ],
          [
            "right-[calc(4mm+13px)]",
            "top-[calc(4mm+26px)] bottom-[calc(4mm+26px)]",
          ],
        ] as const
      ).map(([x, ends]) => (
        <span
          key={x}
          aria-hidden="true"
          className={`pointer-events-none absolute ${ends} ${x} w-[2px] rounded-full bg-primary/50`}
        />
      ))}

      {/* The print: compressions exist because the printed sheet is 20mm
          shorter than the screen one (10mm margins each side) — the worst
          landscape fundraiser case fits the screen and overlapped the foot
          in print. */}
      <div
        className={`flex h-full w-full flex-col pt-[14mm] pb-[10mm] print:pt-[11mm] print:pb-[9mm] ${
          isPortrait ? "px-[14mm]" : "px-[16mm]"
        }`}
      >
        {/* ── The head: occasion, name. No seal — the frame carries the
            brand now (founder, 2026-08-16: unsure about the seal; with the
            mark in all four corners a fifth repetition crowded the top). */}
        <header className="flex flex-col items-center text-center">
          <p className="text-xs font-medium tracking-widest text-primary-muted uppercase">
            {data.prefix}
          </p>
          <h1 className="mt-[1.5mm] text-4xl font-medium tracking-tight text-reveal-foreground">
            {data.name}
          </h1>
          {data.context && (
            <p className="mt-[1.5mm] text-sm text-muted-foreground">
              {data.context}
            </p>
          )}
        </header>

        {isTribute ? (
          /* ── Tribute: topic and reveal lead, the money closes quietly ──
             The topic, reveal and standings are one grouped section
             (founder, 2026-08-16) — they all tell the favourite's story —
             so the distributed space falls around the group, not inside
             it. Portrait spreads the blocks evenly down the tall middle;
             centring them left one deep void above the topic and none
             below (measured at 1600x1000). */
          <div
            className={`flex min-h-0 flex-1 flex-col items-center gap-[10mm] py-[4mm] ${
              isPortrait ? "justify-evenly" : "justify-center"
            }`}
          >
            <div className="flex w-full flex-col gap-[6mm]">
              <section className="flex w-full flex-col items-center">
                {/* The topic above the reveal, in the poll's own ribbon
                    style (PollHeading: uppercase, tracked, primary) so the
                    keepsake echoes what guests saw all day (founder,
                    2026-08-16 — supersedes the earlier 2xl heading). */}
                {topicHeading}
                {/* The quote's pl matches the list's text gutter below (7mm
                  number column + 8px gap − 2px rule), so the quote's text
                  and the list's labels share a left edge. */}
                {data.reveal && (
                  <p className="mt-[5mm] max-w-[150mm] border-l-2 border-primary-muted pl-[calc(7mm+8px-2px)] text-left text-lg leading-relaxed text-primary/80 italic">
                    {data.reveal}
                  </p>
                )}
              </section>

              <section className="w-full">
                <ol className="mx-auto w-[150mm] max-w-full space-y-[3.5mm]">
                  {shown.map((s, i) => (
                    <li
                      key={s.favouriteId}
                      className="flex items-baseline gap-2"
                    >
                      {/* Left-aligned so the numeral sits flush with the box
                        edge — and the quote's rule above it. */}
                      <span className="w-[7mm] shrink-0 text-sm text-muted-foreground tabular-nums">
                        {i + 1}
                      </span>
                      <span
                        className={
                          i === 0 ? "font-medium text-foreground" : undefined
                        }
                      >
                        {s.label}
                      </span>
                      {/* The dot leader, sitting on the baseline: an empty flex
                        item's baseline is its bottom edge, so the dotted
                        border lands exactly where the text sits. */}
                      <span
                        aria-hidden="true"
                        className="h-[0.16em] min-w-[6mm] flex-1 border-b border-dotted border-border"
                      />
                      <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                        {formatPoundsExact(s.amount)}
                      </span>
                    </li>
                  ))}
                </ol>
                {restLine && (
                  <p className="mt-[3mm] text-center text-sm text-muted-foreground">
                    {restLine}
                  </p>
                )}
              </section>
            </div>

            <p className="text-base">
              Together, guests gave{" "}
              <span className="font-medium text-reveal-foreground">
                {formatPoundsExact(data.totalRaised)}
              </span>{" "}
              to {charityLabel(data.charityNames)}
              {/* The reached goal joins the one money sentence — the
                  tribute stays a remembrance, not a scoreboard. */}
              {goalReached
                ? ` — reaching the ${formatPounds(data.goalAmount!)} goal.`
                : "."}
            </p>
          </div>
        ) : (
          /* ── Fundraiser: the total is the centrepiece, the race the story ──
             Without the chart the whole middle is one justify-evenly column —
             total, reveal, standings — so all four gaps (head→total included)
             come out equal (founder, 2026-08-16). No py: padding would add to
             the first and last gaps and break the evenness. */
          <div
            className={
              data.rankHistory
                ? "flex min-h-0 flex-1 flex-col gap-[4mm] py-[2.5mm] print:gap-[3mm] print:py-[1mm]"
                : "flex min-h-0 flex-1 flex-col justify-evenly"
            }
          >
            <section className="text-center">
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Together, guests raised
              </p>
              <p className="mt-[1mm] text-5xl font-medium tracking-tight text-primary print:text-4xl">
                {formatPoundsExact(data.totalRaised)}
              </p>
              <p className="mt-[1.5mm] text-sm text-muted-foreground">
                for {charityLabel(data.charityNames)}
              </p>
              {goalReached && (
                <p className="mt-[1.5mm] text-xs font-medium tracking-widest text-primary uppercase">
                  {formatPounds(data.goalAmount!)} goal reached
                </p>
              )}
            </section>

            {/* With the chart, this wrapper is the race zone (side by side in
                landscape — a landscape shape — stacked in portrait). Without
                it, the reveal and standings group into one section (founder,
                2026-08-16) so the distributed space falls around them, not
                between them. */}
            <div
              className={
                data.rankHistory
                  ? isPortrait
                    ? "mx-auto flex min-h-0 w-full max-w-[160mm] flex-1 flex-col gap-[6mm]"
                    : "grid min-h-0 flex-1 grid-cols-[1.05fr_1fr] items-start gap-[12mm]"
                  : "mx-auto flex w-full max-w-[150mm] flex-col gap-[7mm]"
              }
            >
              {/* The topic heads the reveal, as in the tribute (founder,
                  2026-08-16); the standings carry it only when there is no
                  reveal above them to do so. */}
              {!data.rankHistory && data.reveal && (
                <section className="mx-auto w-full max-w-[150mm]">
                  {topicHeading}
                  <p className="mt-[3mm] border-l-2 border-primary-muted pl-[calc(7mm+8px-2px)] text-base leading-relaxed text-primary/80 italic">
                    {data.reveal}
                  </p>
                </section>
              )}
              <section
                className={
                  data.rankHistory ? undefined : "mx-auto w-full max-w-[150mm]"
                }
              >
                {(data.rankHistory || !data.reveal) && topicHeading}
                {/* Compact rows when the chart shares the page; roomy ones
                    when it does not. Print stays compact either way — the
                    printed sheet is 20mm shorter. */}
                <ol
                  className={
                    data.rankHistory
                      ? "mt-[2mm] space-y-[1mm] text-sm print:space-y-[0.5mm]"
                      : "mt-[3mm] space-y-[2.5mm] text-sm print:space-y-[0.5mm]"
                  }
                >
                  {shown.map((s, i) => (
                    <li key={s.favouriteId} className="flex items-center gap-2">
                      <span className="w-[7mm] shrink-0 text-muted-foreground tabular-nums">
                        {i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span
                            className={
                              i === 0
                                ? "font-medium text-foreground"
                                : undefined
                            }
                          >
                            {s.label}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            {formatPoundsExact(s.amount)}
                          </span>
                        </span>
                        <span
                          className={`mt-px block overflow-hidden rounded-full bg-muted print:h-[0.6mm] ${
                            data.rankHistory ? "h-1" : "h-1.5"
                          }`}
                        >
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
                {restLine && (
                  <p className="mt-[1.5mm] text-sm text-muted-foreground print:mt-[1mm]">
                    {restLine}
                  </p>
                )}
              </section>

              {data.rankHistory && (
                <section className="break-inside-avoid">
                  <BumpChart
                    history={data.rankHistory}
                    title="The story of the day"
                    caption="Positions only — how each favourite ranked as pledges came in."
                    highlightTop={CHART_HIGHLIGHT}
                    maxSeries={CHART_LANES}
                  />
                  {/* The reveal rides in the chart's column — the standings
                      column is the tall one in landscape, and a centred
                      reveal between the total and the race cost the exact
                      height that pushed row ten into the foot. */}
                  {data.reveal && (
                    <p className="mt-[4mm] max-w-[110mm] border-l-2 border-primary-muted pl-4 text-base leading-relaxed text-primary/80 italic print:mt-[2mm] print:text-sm">
                      {data.reveal}
                    </p>
                  )}
                </section>
              )}
            </div>
          </div>
        )}

        {/* ── The foot: the issuer signs — the full lockup (mark and
            wordmark, as the site header draws it, at colophon scale), then
            the brand statement, then the provenance line (founder,
            2026-08-16: the mark moved here when the seal left the head;
            the names roll and ornament were cut earlier; the named guests
            still travel in the CSV) ── */}
        <footer className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <svg width="18" height="16.2" viewBox="0 0 10 9" aria-hidden="true">
              <FavpollMarkGlyph />
            </svg>
            <span className="text-lg tracking-tight">
              fav<span className="opacity-60">poll</span>
            </span>
          </span>
          <p className="mt-[1.5mm] text-xs text-muted-foreground italic">
            Expressions of joy, for charitable causes, in the name of those we
            love.
          </p>
          <p className="mt-[1mm] text-xs text-muted-foreground">
            Closed {data.closedDate} · favpoll.com
          </p>
        </footer>
      </div>
    </article>
  )
}
