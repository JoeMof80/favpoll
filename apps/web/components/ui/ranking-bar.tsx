import { cn } from "@/lib/utils"

type Props = {
  label: string
  amount: string
  widthPercent: number
  barClassName?: string
  barStyle?: React.CSSProperties
  className?: string
  labelSuffix?: React.ReactNode
  /**
   * "band" = the bar sits on a coloured band (the landing hero's glass
   * cards), so its ink and track come from the band's foreground rather
   * than the page's. Without this the labels are page-ink on a dark
   * surface and vanish.
   */
  tone?: "default" | "band"
  /** Leader emphasis: medium label, full-ink amount (the record's top row) */
  emphasis?: boolean
}

export function RankingBar({
  label,
  amount,
  widthPercent,
  barClassName,
  barStyle,
  className,
  labelSuffix,
  tone = "default",
  emphasis = false,
}: Props) {
  const onBand = tone === "band"
  return (
    <div className={className}>
      <div
        // ONE SIZE (founder, 2026-10-04): the room shows the favpoll page,
        // not an enlarged copy of it, and an organiser who needs it bigger
        // zooms the browser — which scales everything at once.
        className="mb-1 flex justify-between text-sm"
      >
        <span className="flex min-w-0 items-center gap-1.5 pr-2">
          <span
            className={cn(
              "truncate",
              onBand ? "text-primary-foreground" : "text-foreground",
              emphasis && "font-medium"
            )}
          >
            {label}
          </span>
          {labelSuffix}
        </span>
        <span
          className={cn(
            "shrink-0 tabular-nums",
            emphasis && "font-medium",
            onBand
              ? emphasis
                ? "text-primary-foreground"
                : "text-primary-foreground/75"
              : emphasis
                ? "text-foreground"
                : "text-muted-foreground"
          )}
        >
          {amount}
        </span>
      </div>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full",
          onBand ? "bg-primary-foreground/20" : "bg-muted",
          "h-1.5"
        )}
        role="presentation"
      >
        <div
          className={cn("h-full rounded-full bg-primary", barClassName)}
          style={{ width: `${widthPercent}%`, ...barStyle }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
