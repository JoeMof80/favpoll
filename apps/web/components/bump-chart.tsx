import type { RankHistory } from "@/lib/rank-history"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

// Bump chart: rank over time, ordinal only (no amounts). The leader in
// primary, the rest muted; a favourite's line starts where it first
// receives a pledge. Static SVG, no chart library.
//
// Two modes: a favpoll's poll (step-per-pledge, no axis) and a topic's
// all-time record (weekly buckets, dated x-axis via `axisLabels`).

const ROW_H = 26 // px per rank row
const PAD_L = 12
const PAD_R = 120 // room for right-edge labels
const PAD_Y = 16
const DOT_R = 3
const AXIS_H = 22 // extra bottom space when axisLabels are shown

type Props = {
  history: RankHistory
  /** Eyebrow above the chart */
  title?: string
  /** Caption below the chart */
  caption?: string
  /** ISO date per step; when present, renders a few dated x-axis ticks */
  axisLabels?: string[]
  /** Preview mode: lines only (no labels/axis/title/caption), fits any
   *  width. Used as the clickable teaser in the topic right column. */
  compact?: boolean
  className?: string
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export function BumpChart({
  history,
  title = "The story of the poll",
  caption = "Positions only — how each favourite ranked as pledges came in.",
  axisLabels,
  compact = false,
  className,
}: Props) {
  const { series, steps } = history
  if (series.length === 0 || steps < 2) return null

  const maxRank = Math.max(
    ...series.flatMap((s) => s.points.map((p) => p.rank))
  )
  const padR = compact ? PAD_L : PAD_R
  const width = 640
  const plotW = width - PAD_L - padR
  const hasAxis = !compact && !!axisLabels && axisLabels.length === steps
  const height = PAD_Y * 2 + maxRank * ROW_H + (hasAxis ? AXIS_H : 0)

  const x = (step: number) =>
    PAD_L + (steps <= 1 ? 0 : (step / (steps - 1)) * plotW)
  const y = (rank: number) => PAD_Y + (rank - 0.5) * ROW_H
  const axisY = PAD_Y + maxRank * ROW_H + AXIS_H - 6

  // Show at most ~5 evenly-spaced date ticks so labels never collide.
  const tickSteps = hasAxis
    ? Array.from(
        new Set([
          0,
          Math.round((steps - 1) * 0.25),
          Math.round((steps - 1) * 0.5),
          Math.round((steps - 1) * 0.75),
          steps - 1,
        ])
      )
    : []

  if (compact) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="Rank over time for each favourite"
        className={`text-primary ${className ?? ""}`}
      >
        {series.map((s) => {
          const isLeader = s.finalRank === 1
          const path = s.points
            .map((p, j) => `${j === 0 ? "M" : "L"} ${x(p.step)} ${y(p.rank)}`)
            .join(" ")
          return (
            <path
              key={s.favouriteId}
              d={path}
              fill="none"
              stroke={isLeader ? "currentColor" : "var(--chart-3)"}
              strokeWidth={isLeader ? 2.5 : 1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isLeader ? 1 : 0.5}
            />
          )
        })}
      </svg>
    )
  }

  return (
    <div className={className}>
      {title && (
        <SectionEyebrow variant="muted" className="mb-3 font-semibold">
          {title}
        </SectionEyebrow>
      )}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          role="img"
          aria-label="Rank over time for each favourite as pledges came in"
          className="min-w-[520px] text-primary"
        >
          {series.map((s) => {
            const isLeader = s.finalRank === 1
            const path = s.points
              .map((p, j) => `${j === 0 ? "M" : "L"} ${x(p.step)} ${y(p.rank)}`)
              .join(" ")
            const last = s.points[s.points.length - 1]
            return (
              <g key={s.favouriteId}>
                <path
                  d={path}
                  fill="none"
                  stroke={isLeader ? "currentColor" : "var(--chart-3)"}
                  strokeWidth={isLeader ? 2.5 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isLeader ? 1 : 0.55}
                />
                {s.points.map((p) => (
                  <circle
                    key={p.step}
                    cx={x(p.step)}
                    cy={y(p.rank)}
                    r={DOT_R}
                    fill={isLeader ? "currentColor" : "var(--chart-3)"}
                    opacity={isLeader ? 1 : 0.55}
                  />
                ))}
                <text
                  x={x(last.step) + 8}
                  y={y(last.rank)}
                  dominantBaseline="middle"
                  className={
                    isLeader
                      ? "fill-foreground text-[13px] font-medium"
                      : "fill-muted-foreground text-[13px]"
                  }
                >
                  {s.label}
                </text>
              </g>
            )
          })}
          {hasAxis &&
            tickSteps.map((step) => (
              <text
                key={step}
                x={x(step)}
                y={axisY}
                textAnchor={
                  step === 0 ? "start" : step === steps - 1 ? "end" : "middle"
                }
                className="fill-muted-foreground text-[11px]"
              >
                {shortDate(axisLabels![step])}
              </text>
            ))}
        </svg>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}
