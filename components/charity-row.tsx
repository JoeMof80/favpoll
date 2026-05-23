import type { Charity } from "@/types"
import { useFavpollCard } from "@/components/favpoll-card/favpoll-card-context"

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
  const { size } = useFavpollCard()

  const logoClass = size === "full" ? "h-8 w-8" : "h-6 w-6"
  const nameClass = size === "full" ? "text-sm" : "text-xs"
  const amountClass = size === "full" ? "text-sm" : "text-xs"

  return (
    <div className="flex items-center gap-3">
      {charity.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={charity.logo_url}
          alt={charity.name}
          className={`${logoClass} rounded object-contain`}
        />
      ) : (
        <div
          className={`flex ${logoClass} shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary`}
          aria-hidden="true"
        >
          {charity.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate ${nameClass} font-medium text-foreground`}>
          {charity.name}
        </p>
        {charity.registered_number && (
          <p className="text-xs text-muted-foreground">
            Charity no. {charity.registered_number}
          </p>
        )}
      </div>
      {amountRaised > 0 && (
        <p className={`shrink-0 ${amountClass} font-medium text-primary`}>
          {GBP.format(amountRaised)}
        </p>
      )}
    </div>
  )
}
