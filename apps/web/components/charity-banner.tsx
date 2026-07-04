import type { Charity } from "@favpoll/types"
import { CharityRow } from "./charity-row"

type Props = {
  charities: Charity[]
  totalRaised: number
  /** Optional pledge goal in pounds — renders an understated progress bar. */
  goalAmount?: number | null
}

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

export function CharityBanner({ charities, totalRaised, goalAmount }: Props) {
  const perCharity = charities.length > 0 ? totalRaised / charities.length : 0

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="space-y-3">
        {charities.map((charity) => (
          <CharityRow
            key={charity.id}
            charity={charity}
            amountRaised={perCharity}
          />
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3 text-right">
        <p className="text-lg font-medium text-primary">
          {GBP.format(totalRaised)}
        </p>
        <p className="text-xs text-muted-foreground">
          {goalAmount
            ? `raised of the ${GBP.format(goalAmount)} goal`
            : "raised so far"}
        </p>
        {goalAmount ? (
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Progress towards the pledge goal"
            aria-valuemin={0}
            aria-valuemax={goalAmount}
            aria-valuenow={Math.min(totalRaised, goalAmount)}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.min(100, (totalRaised / goalAmount) * 100)}%`,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
