import { SectionLabel } from "@/components/favpoll-card/section-label"
import { Button } from "./ui/button"
import type { FavpollCardSize } from "./favpoll-card/types"

type Props = {
  topicTitle: string
  size?: FavpollCardSize
  onPledge?: () => void
}

export function PollHeading({ topicTitle, size = "lg", onPledge }: Props) {
  const label = `Favourite ${topicTitle}`
  const textClass =
    size === "lg"
      ? "text-[17px]"
      : size === "md"
        ? "text-[15px]"
        : "text-[11px]"

  if (onPledge) {
    return (
      <Button
        type="button"
        className={`${textClass} w-full font-medium tracking-[0.09em] uppercase`}
        onClick={onPledge}
      >
        {label}
      </Button>
    )
  }

  return <SectionLabel title={label} size={size} />
}
