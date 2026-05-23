import type { Charity } from "@/types"

type Props = {
  charity: Charity
  amountRaised: number
}

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

export function CharityRow({ charity, amountRaised }: Props) {
  return (
    <div className="flex items-center gap-3">
      {charity.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={charity.logo_url}
          alt={charity.name}
          className="h-8 w-8 rounded object-contain"
        />
      ) : (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary"
          aria-hidden="true"
        >
          {charity.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {charity.name}
        </p>
        {charity.registered_number && (
          <p className="text-xs text-muted-foreground">
            Charity no. {charity.registered_number}
          </p>
        )}
      </div>
      {amountRaised > 0 && (
        <p className="shrink-0 text-sm font-medium text-primary">
          {GBP.format(amountRaised)}
        </p>
      )}
    </div>
  )
}
