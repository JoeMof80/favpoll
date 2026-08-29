import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import type { Charity } from "@favpoll/types"
import type { FavpollCardSize } from "@/components/favpoll-card/types"
import { formatPounds } from "@/lib/i18n"

type Props = {
  charity: Charity
  amountRaised: number
  size?: FavpollCardSize
  /**
   * Link the name to the charity page. Off by default: CharityRow often
   * renders inside a card that is itself a link (FavpollSummaryCard /
   * FavpollListCard), and a nested <a> is invalid HTML that breaks
   * hydration. Only enable where the row is not inside another anchor.
   */
  linkToCharity?: boolean
  /**
   * A second line under the amount, in the "Charity no." line's style —
   * the mobile footer's "of the £500 goal". Forces the amount to show even
   * at £0, since the caption only makes sense beneath a figure.
   */
  amountCaption?: React.ReactNode
}

export function CharityRow({
  charity,
  amountRaised,
  size = "lg",
  linkToCharity = false,
  amountCaption,
}: Props) {
  const logoClass = size === "lg" ? "h-8 w-8" : "h-6 w-6"
  const nameClass = size === "lg" ? "text-sm" : "text-sm"
  const amountClass = size === "lg" ? "text-sm" : "text-sm"

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
          {linkToCharity ? (
            <Link
              href={`/charities/${charity.id}`}
              className="hover:text-primary hover:underline"
            >
              {charity.name}
            </Link>
          ) : (
            charity.name
          )}
        </p>
        {charity.registered_number && size === "lg" && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Charity no. {charity.registered_number}
            {charity.verification_status === "verified" && (
              <BadgeCheck
                className="size-3.5 shrink-0 text-primary"
                role="img"
                aria-label="Verified with the Charity Commission"
              />
            )}
          </p>
        )}
      </div>
      {(amountRaised > 0 || amountCaption) && (
        <div className="flex shrink-0 flex-col items-end" aria-live="polite">
          <p className={`${amountClass} font-medium text-primary`}>
            {formatPounds(amountRaised)}
          </p>
          {amountCaption && (
            <p className="text-xs whitespace-nowrap text-muted-foreground">
              {amountCaption}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
