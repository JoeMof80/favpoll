import { cn } from "@/lib/utils"

type Props = {
  totalRaised: number
  goalAmount: number
  /** Bar thickness — the banner's h-1.5, the footer's h-1, the display's h-2.5. */
  className?: string
  /** PACE (founder, 2026-10-17): how far the poll's run has come, 0–1.
   *  A tick at that point on the track — fill behind it is behind pace,
   *  past it ahead — so money and time read on one object. */
  elapsed?: number | null
}

// The pledge-goal bar, one source. Green once the goal is met (2026-08-09),
// which is what the live display has always done. The bar caps at 100%; the
// total beside it does not — a goal is a milestone, not a finish line.
export function GoalProgress({
  totalRaised,
  goalAmount,
  className,
  elapsed,
}: Props) {
  const reached = totalRaised >= goalAmount
  const tick = elapsed == null ? null : Math.min(1, Math.max(0, elapsed))
  return (
    <div
      className={cn("relative h-1.5 w-full rounded-full bg-muted", className)}
      role="progressbar"
      aria-label="Progress towards the pledge goal"
      aria-valuemin={0}
      aria-valuemax={goalAmount}
      aria-valuenow={Math.min(totalRaised, goalAmount)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          reached ? "bg-success" : "bg-primary"
        )}
        style={{ width: `${Math.min(100, (totalRaised / goalAmount) * 100)}%` }}
      />
      {tick !== null && (
        <span
          aria-hidden="true"
          title="Today"
          className="absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
          style={{ left: `${tick * 100}%` }}
        />
      )}
    </div>
  )
}
