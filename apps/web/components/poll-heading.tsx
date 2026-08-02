import { SectionLabel } from "@/components/favpoll-card/section-label"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import type { FavpollCardSize } from "./favpoll-card/types"

type Props = {
  topicTitle: string
  size?: FavpollCardSize
  onPledge?: () => void
  /**
   * Renders the pledge-button CHROME without the button — for previews
   * (the edit form) that must look like the guest page. A static div,
   * not a disabled button: there is nothing to enable.
   */
  inert?: boolean
}

export function PollHeading({
  topicTitle,
  size = "lg",
  onPledge,
  inert = false,
}: Props) {
  const label = `Favourite ${topicTitle}`
  // Long titles step DOWN in size (and tighten tracking) before they ever
  // truncate — the ribbon is the card's question, and "CHRISTMAS TRADI…"
  // makes the guest guess. Ellipsis remains only as a last-resort guard.
  const fit = label.length > 30 ? 2 : label.length > 22 ? 1 : 0
  const SCALE: Record<string, string[]> = {
    lg: ["text-[17px]", "text-[15px]", "text-[13px]"],
    md: ["text-[15px]", "text-[13px]", "text-[12px]"],
    sm: ["text-[11px]", "text-[10px]", "text-[10px]"],
  }
  const textClass = SCALE[size][fit]
  const trackingClass = fit > 0 ? "tracking-[0.05em]" : "tracking-[0.09em]"

  if (onPledge) {
    return (
      <Button
        type="button"
        className={`${textClass} ${trackingClass} w-full min-w-0 font-medium uppercase`}
        onClick={onPledge}
      >
        <span className="truncate">{label}</span>
      </Button>
    )
  }

  if (inert) {
    // A HEADER, not button chrome (founder, 2026-08-02) — primary
    // uppercase type at the button's exact height so the sticky offsets
    // above the poll keep holding.
    return (
      <div
        className={cn(
          textClass,
          trackingClass,
          "flex h-9 w-full min-w-0 items-center font-medium text-primary uppercase"
        )}
      >
        <span className="truncate">{label}</span>
      </div>
    )
  }

  return <SectionLabel title={label} size={size} />
}
