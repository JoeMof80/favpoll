import type { Charity } from "@/types"
import { CharityRow } from "./charity-row"

type Props = {
  charities: Charity[]
  totalRaised: number
}

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

export function CharityBanner({ charities, totalRaised }: Props) {
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
        <p className="text-xs text-muted-foreground">raised so far</p>
      </div>
    </div>
  )
}
