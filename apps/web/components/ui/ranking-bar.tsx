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
}: Props) {
  const isDisplay = size === "display"
  return (
    <div className={className}>
      <div
        className={cn(
          "flex justify-between",
          isDisplay ? "mb-1.5 text-xl" : "mb-1 text-sm"
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5 pr-2">
          <span className="truncate text-foreground">{label}</span>
          {labelSuffix}
        </span>
        <span className="shrink-0 text-muted-foreground tabular-nums">
          {amount}
        </span>
      </div>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          isDisplay ? "h-2.5" : "h-1.5"
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
