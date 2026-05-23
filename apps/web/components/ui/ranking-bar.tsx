import { cn } from "@/lib/utils"

type Props = {
  label: string
  amount: string
  widthPercent: number
  barClassName?: string
  barStyle?: React.CSSProperties
  className?: string
}

export function RankingBar({
  label,
  amount,
  widthPercent,
  barClassName,
  barStyle,
  className,
}: Props) {
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-sm">
        <span className="truncate pr-2 text-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {amount}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
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
