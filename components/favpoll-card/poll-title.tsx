import { useFavpollCard } from "./favpoll-card-context"

type PollTitleProps = {
  title: string
  protagonistFirstName?: string
  pledged?: boolean
}

export function PollTitle({ title }: PollTitleProps) {
  const { size } = useFavpollCard()

  const textClass =
    size === "full"
      ? "text-[17px]"
      : size === "demo"
        ? "text-[15px]"
        : "text-[11px]"

  const label = `Favourite ${title}`

  return (
    <h3
      className={`${textClass} text-[11px] font-medium tracking-[0.09em] text-[#7F77DD] uppercase`}
    >
      {label}
    </h3>
  )
}
