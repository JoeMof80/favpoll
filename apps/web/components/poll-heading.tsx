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

// "Favourite" is the EYEBROW — quiet, above the topic word at full size
// (founder, 2026-09-01: the hero router cards' grammar from #614, brought
// to every PollHeading surface). The old three-step shrink-and-truncate
// retires with it: the topic word owns the whole width and simply wraps
// in the rare case it must, so "CHRISTMAS TRADITION" never becomes
// "CHRISTMAS TRADI…".
//
// Plain spans, no aria theatre: sequential text already reads as one
// phrase ("Favourite" "Colour"), and an sr-only twin collided with the
// reveal's own sr-only machinery in poll-section.
// The eyebrow is quieter by SIZE alone — smaller, full-strength ink
// (founder, 2026-09-01: one lever, not both; size won over opacity).
const TOPIC_TEXT: Record<string, string> = {
  lg: "text-[17px]",
  md: "text-[15px]",
  sm: "text-[11px]",
}
const EYEBROW_TEXT: Record<string, string> = {
  lg: "text-[10px]",
  md: "text-[10px]",
  sm: "text-[8px]",
}

function HeadingLines({
  topicTitle,
  size,
  topicClass,
  align = "start",
}: {
  topicTitle: string
  size: FavpollCardSize
  topicClass: string
  align?: "start" | "center"
}) {
  return (
    <>
      <span
        className={cn(
          "flex min-w-0 flex-col font-medium uppercase",
          align === "center" ? "items-center" : "items-start"
        )}
      >
        <span
          className={cn(
            EYEBROW_TEXT[size],
            topicClass,
            "leading-tight tracking-[0.18em]"
          )}
        >
          Favourite
        </span>
        <span
          className={cn(
            TOPIC_TEXT[size],
            topicClass,
            "leading-tight tracking-[0.09em] wrap-break-word"
          )}
        >
          {topicTitle}
        </span>
      </span>
    </>
  )
}

export function PollHeading({
  topicTitle,
  size = "lg",
  onPledge,
  inert = false,
}: Props) {
  if (onPledge) {
    return (
      <Button
        type="button"
        className="h-auto w-full min-w-0 py-1.5"
        onClick={onPledge}
      >
        <HeadingLines
          topicTitle={topicTitle}
          size={size}
          topicClass="text-primary-foreground"
          align="center"
        />
      </Button>
    )
  }

  if (inert) {
    // A HEADER, not button chrome (founder, 2026-08-02). min-h-9, not
    // h-9: a single-line topic lands at the old ribbon height so the
    // sticky offsets above the poll keep holding; a wrapping one may
    // grow rather than truncate.
    return (
      <div className="flex min-h-9 w-full min-w-0 flex-col justify-center">
        <HeadingLines
          topicTitle={topicTitle}
          size={size}
          topicClass="text-primary"
        />
      </div>
    )
  }

  // The quiet default — SectionLabel's old tone, in the two-line grammar.
  return (
    <div className="flex min-w-0 flex-col">
      <HeadingLines
        topicTitle={topicTitle}
        size={size}
        topicClass="text-primary-muted"
      />
    </div>
  )
}
