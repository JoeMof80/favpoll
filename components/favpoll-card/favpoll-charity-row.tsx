import { useFavpollCard } from "./favpoll-card-context"

type FavpollCharityRowProps = {
  name: string
  amountRaised?: string
}

export function FavpollCharityRow({
  name,
  amountRaised,
}: FavpollCharityRowProps) {
  const { size } = useFavpollCard()

  const textClass = size === "full" ? "text-[13px]" : "text-[11px]"

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[8px] text-[#1D9E75]" aria-hidden="true">
          ●
        </span>
        <span className={`${textClass} text-[#5F5E5A]`}>{name}</span>
      </div>
      {amountRaised && (
        <span
          className={`${textClass} font-medium text-[#534AB7]`}
          aria-live="polite"
        >
          {amountRaised}
        </span>
      )}
    </div>
  )
}
