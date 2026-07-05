import type { RankHistory } from "@/lib/rank-history"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

// Bump chart: rank over time, ordinal only (no amounts). The story of the
// poll — the leader in primary, the rest muted; a favourite's line starts
// where it first receives a pledge. Static SVG, no chart library.

const ROW_H = 26 // px per rank row
const PAD_L = 12
const PAD_R = 120 // room for right-edge labels
const PAD_Y = 16
const DOT_R = 3

export function BumpChart({
  history,
  className,
}: {
  history: RankHistory
  className?: string
}) {
  const { series, steps } = history
  if (series.length === 0 || steps < 2) return null

  const maxRank = Math.max(
    ...series.flatMap((s) => s.points.map((p) => p.rank))
  )
  const width = 640
  const plotW = width - PAD_L - PAD_R
  const height = PAD_Y * 2 + maxRank * ROW_H

  const x = (step: number) =>
    PAD_L + (steps <= 1 ? 0 : (step / (steps - 1)) * plotW)
  const y = (rank: number) => PAD_Y + (rank - 0.5) * ROW_H

  return (
    <div className={className}>
      <SectionEyebrow variant="muted" className="mb-3 font-semibold">
        The story of the poll
      </SectionEyebrow>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          role="img"
          aria-label="Rank over time for each favourite as pledges came in"
          className="min-w-[520px] text-primary"
        >
          {series.map((s, i) => {
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
        </svg>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Positions only — how each favourite ranked as pledges came in.
      </p>
    </div>
  )
}
