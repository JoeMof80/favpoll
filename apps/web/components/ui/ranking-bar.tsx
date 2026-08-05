import { cn } from "@/lib/utils"

type Props = {
  label: string
  amount: string
  widthPercent: number
  barClassName?: string
  barStyle?: React.CSSProperties
  className?: string
  labelSuffix?: React.ReactNode
  /** "display" = projector scale (the live page) — larger text, thicker bar */
  size?: "default" | "display"
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
  size = "default",
  tone = "default",
  emphasis = false,
}: Props) {
  const isDisplay = size === "display"
  const onBand = tone === "band"
  return (
    <div className={className}>
      <div
        className={cn(
          "flex justify-between",
          isDisplay ? "mb-1.5 text-lg" : "mb-1 text-sm"
        )}
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
          isDisplay ? "h-2" : "h-1.5"
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
