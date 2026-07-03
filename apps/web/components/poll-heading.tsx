import { SectionLabel } from "@/components/favpoll-card/section-label"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "./ui/button"
import type { FavpollCardSize } from "./favpoll-card/types"

type Props = {
  topicTitle: string
  size?: FavpollCardSize
  onPledge?: () => void
  /**
   * Form preview: render the same primary pill guests see on the live page,
   * but inert — clicking does nothing (the reveal has its own edit button;
   * see PR #137). A tooltip explains what the pill will do once live.
   */
  previewPill?: boolean
}

export function PollHeading({
  topicTitle,
  size = "lg",
  onPledge,
  previewPill,
}: Props) {
  const label = `Favourite ${topicTitle}`
  const textClass =
    size === "lg"
      ? "text-[17px]"
      : size === "md"
        ? "text-[15px]"
        : "text-[11px]"
  const pillClass = `${textClass} w-full font-medium tracking-[0.09em] uppercase`

  if (onPledge) {
    return (
      <Button type="button" className={pillClass} onClick={onPledge}>
        {label}
      </Button>
    )
  }

  if (previewPill) {
    return (
      <TooltipProvider>
        <Tooltip content="Guests tap this to pledge once your favpoll is live">
          <Button
            type="button"
            className={`${pillClass} cursor-default`}
            aria-label={`${label} — guests tap this to pledge once your favpoll is live`}
          >
            {label}
          </Button>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return <SectionLabel title={label} size={size} />
}
