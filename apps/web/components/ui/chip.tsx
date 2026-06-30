import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ChipProps = React.ComponentProps<"button"> & {
  selected?: boolean
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
  /** When provided, renders a × button inside the chip and the chip is non-interactive. */
  onRemove?: () => void
  /** aria-label for the × button. Defaults to "Remove". */
  removeLabel?: string
}

const chipSizeClasses: Record<NonNullable<ChipProps["size"]>, string> = {
  sm: "h-5 px-2.5 text-[11px]",
  md: "h-6 px-3 text-xs",
  lg: "h-7 px-4 text-sm",
}

function Chip({
  selected = false,
  readOnly = false,
  size = "md",
  className,
  onRemove,
  removeLabel = "Remove",
  children,
  ...props
}: ChipProps) {
  if (onRemove) {
    return (
      <div
        className={cn(
          "inline-flex min-w-0 shrink items-center gap-1 rounded-full border font-medium whitespace-normal",
          chipSizeClasses[size],
          "border-[#534AB7] bg-[#534AB7] text-white",
          className
        )}
      >
        <span className="min-w-0 truncate">{children}</span>
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:opacity-70"
          aria-label={removeLabel}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <Button
      type="button"
      aria-pressed={selected}
      className={cn(
        "h-auto min-w-0 shrink rounded-full border whitespace-normal transition-all duration-200 hover:cursor-pointer",
        chipSizeClasses[size],
        readOnly
          ? "pointer-events-none border-border bg-background font-normal text-muted-foreground/60 shadow-none"
          : selected
            ? "border-[#534AB7] bg-[#534AB7] font-medium text-white hover:bg-[#534AB7]/90"
            : "border-border bg-muted font-normal text-muted-foreground shadow-none hover:border-[#AFA9EC] hover:text-[#534AB7]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export { Chip }
