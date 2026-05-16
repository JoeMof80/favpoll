import type { Charity } from '@/types'

type Props = {
  charities: Charity[]
  totalRaised: number
}

const GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
})

export function CharityBanner({ charities, totalRaised }: Props) {
  const perCharity = charities.length > 0 ? totalRaised / charities.length : 0

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="space-y-3">
        {charities.map((charity) => (
          <div key={charity.id} className="flex items-center gap-3">
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
              <p className="truncate text-sm font-medium text-foreground">{charity.name}</p>
              {charity.registered_number && (
                <p className="text-xs text-muted-foreground">
                  Charity no. {charity.registered_number}
                </p>
              )}
            </div>
            {totalRaised > 0 && (
              <p className="shrink-0 text-sm font-medium text-primary">
                {GBP.format(perCharity)}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3 text-right">
        <p className="text-lg font-medium text-primary">{GBP.format(totalRaised)}</p>
        <p className="text-xs text-muted-foreground">raised so far</p>
      </div>
    </div>
  )
}
