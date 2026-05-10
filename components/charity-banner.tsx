import type { Charity } from '@/types'

type Props = {
  charity: Charity
  totalRaised: number
}

export function CharityBanner({ charity, totalRaised }: Props) {
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(totalRaised)

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
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
            className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary"
            aria-hidden="true"
          >
            {charity.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-foreground">{charity.name}</p>
          {charity.registered_number && (
            <p className="text-xs text-muted-foreground">
              Charity no. {charity.registered_number}
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-medium text-primary">{formatted}</p>
        <p className="text-xs text-muted-foreground">raised so far</p>
      </div>
    </div>
  )
}
