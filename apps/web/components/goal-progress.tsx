import { cn } from "@/lib/utils"

type Props = {
  totalRaised: number
  goalAmount: number
  /** Bar thickness — the banner's h-1.5, the footer's h-1, the display's h-2.5. */
  className?: string
}

// The pledge-goal bar, one source. Green once the goal is met (2026-08-09),
// which is what the live display has always done. The bar caps at 100%; the
// total beside it does not — a goal is a milestone, not a finish line.
export function GoalProgress({ totalRaised, goalAmount, className }: Props) {
  const reached = totalRaised >= goalAmount
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
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
    </div>
  )
}
