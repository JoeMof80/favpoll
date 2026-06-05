import type { FavpollCardSize } from "./types"

type PollTitleProps = {
  title: string
  size?: FavpollCardSize
}

export function PollTitle({ title, size = "lg" }: PollTitleProps) {
  const textClass =
    size === "lg"
      ? "text-[17px]"
      : size === "md"
        ? "text-[15px]"
        : "text-[11px]"

  return (
    <h3
      className={`${textClass} font-medium tracking-[0.09em] text-[#7F77DD] uppercase`}
    >
      {title}
    </h3>
  )
}
