import type { EventPot, PotAllocation } from "@/types"

type Props = {
  pot: EventPot
  userAllocation: PotAllocation | null
}

export function PotBanner({ pot, userAllocation }: Props) {
  const remaining = pot.total_deposited - pot.total_allocated
  const formattedRemaining = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(remaining)
  const formattedAllocation = userAllocation
    ? new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(userAllocation.amount)
    : null

  return (
    <div
      role="note"
      className="rounded-lg border border-primary/20 bg-secondary px-5 py-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            A shared fund has been created for this event
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Guests who cannot pledge their own money can participate from the
            shared fund.
          </p>
        </div>
        {userAllocation ? (
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium text-primary">
              {formattedAllocation}
            </p>
            <p className="text-xs text-muted-foreground">your allocation</p>
          </div>
        ) : (
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium text-foreground">
              {formattedRemaining}
            </p>
            <p className="text-xs text-muted-foreground">available</p>
          </div>
        )}
      </div>
    </div>
  )
}
