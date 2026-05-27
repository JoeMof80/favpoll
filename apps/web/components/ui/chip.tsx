import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ChipProps = React.ComponentProps<"button"> & {
  selected?: boolean
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
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
  ...props
}: ChipProps) {
  return (
    <Button
      type="button"
      aria-pressed={selected}
      className={cn(
        "h-auto rounded-full border transition-all duration-200 hover:cursor-pointer",
        chipSizeClasses[size],
        readOnly
          ? "pointer-events-none border-border bg-background font-normal text-muted-foreground/60 shadow-none"
          : selected
            ? "border-[#534AB7] bg-[#534AB7] font-medium text-white hover:bg-[#534AB7]/90"
            : "border-border bg-muted font-normal text-muted-foreground shadow-none hover:border-[#AFA9EC] hover:text-[#534AB7]",
        className
      )}
      {...props}
    />
  )
}

export { Chip }
