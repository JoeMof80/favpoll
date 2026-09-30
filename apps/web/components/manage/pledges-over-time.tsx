import { formatAmount } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

// PLEDGES OVER TIME (the dashboard, 2026-09-30): the running total by
// day, as one line — the chart most organisers look at first, and the
// only one on the dashboard that needed data the page didn't already
// hold (one pass over the pledges' timestamps). Static SVG, no library,
// the bump chart's own idiom.

export type TimelinePoint = { date: string; total: number }

/** Cumulative daily totals from pledge rows, oldest first. */
export function pledgeTimeline(
  rows: { created_at: string; total_amount: number | null }[]
): TimelinePoint[] {
  const byDay = new Map<string, number>()
  for (const r of rows) {
    const day = r.created_at.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + (r.total_amount ?? 0))
  }
  let running = 0
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => {
      running += amount
      return { date, total: running }
    })
}

const W = 600
const H = 160
const PAD_X = 8
const PAD_TOP = 12
const PAD_BOTTOM = 24

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export function PledgesOverTime({
  points,
  className,
}: {
  points: TimelinePoint[]
  className?: string
}) {
  if (points.length === 0) return null
  const first = new Date(points[0]!.date).getTime()
  const last = new Date(points[points.length - 1]!.date).getTime()
  const span = Math.max(1, last - first)
  const max = Math.max(1, points[points.length - 1]!.total)
  const x = (iso: string) =>
    PAD_X + ((new Date(iso).getTime() - first) / span) * (W - PAD_X * 2)
  const y = (v: number) => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOTTOM)
  // A step from each day's total to the next: money arrives in lumps,
  // not slopes.
  const coords = points.map((p) => [x(p.date), y(p.total)] as const)
  const line =
    points.length === 1
      ? `M${PAD_X},${coords[0]![1]} H${W - PAD_X}`
      : coords
          .map(([px, py], i) => (i === 0 ? `M${px},${py}` : `H${px} V${py}`))
          .join(" ") + ` H${W - PAD_X}`
  const area = `${line} V${H - PAD_BOTTOM} H${PAD_X} Z`

  return (
    <figure className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <SectionEyebrow variant="muted" className="font-semibold">
          Pledges over time
        </SectionEyebrow>
        <span className="text-sm font-medium text-foreground tabular-nums">
          {formatAmount(points[points.length - 1]!.total)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Running total of pledges, ${formatAmount(points[points.length - 1]!.total)} by ${shortDate(points[points.length - 1]!.date)}`}
      >
        <path d={area} className="fill-primary/10" />
        <path
          d={line}
          className="stroke-primary"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <text
          x={PAD_X}
          y={H - 6}
          className="fill-muted-foreground"
          fontSize={11}
        >
          {shortDate(points[0]!.date)}
        </text>
        <text
          x={W - PAD_X}
          y={H - 6}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize={11}
        >
          {shortDate(points[points.length - 1]!.date)}
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        The running total as pledges came in, by day.
      </figcaption>
    </figure>
  )
}
