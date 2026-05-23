import { useFavpollCard } from "./favpoll-card-context"

type PollTitleProps = {
  title: string
}

export function PollTitle({ title }: PollTitleProps) {
  const { size } = useFavpollCard()

  const textClass =
    size === "full"
      ? "text-[17px]"
      : size === "demo"
        ? "text-[15px]"
        : "text-[11px]"

  return (
    <h3
      className={`${textClass} text-[11px] font-medium tracking-[0.09em] text-[#7F77DD] uppercase`}
    >
      Favourite {title}
    </h3>
  )
}
