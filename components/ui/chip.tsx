import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ChipProps = React.ComponentProps<"button"> & {
  selected?: boolean
}

function Chip({ selected = false, className, ...props }: ChipProps) {
  return (
    <Button
      type="button"
      aria-pressed={selected}
      className={cn(
        "h-auto rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:cursor-pointer",
        selected
          ? "border-[#534AB7] bg-[#534AB7] font-medium text-white hover:bg-[#534AB7]/90"
          : "border-border bg-background font-normal text-muted-foreground shadow-none hover:border-[#AFA9EC] hover:text-[#534AB7]",
        className
      )}
      {...props}
    />
  )
}

export { Chip }
