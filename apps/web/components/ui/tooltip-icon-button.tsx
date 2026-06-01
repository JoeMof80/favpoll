"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"

type Props = {
  icon: LucideIcon
  label: string
  onClick: () => void
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function TooltipIconButton({
  icon: Icon,
  label,
  onClick,
  side = "left",
  className,
}: Props) {
  return (
    <TooltipProvider>
      <Tooltip content={label} side={side}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={
            className ?? "shrink-0 text-muted-foreground hover:text-foreground"
          }
          onClick={onClick}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </Tooltip>
    </TooltipProvider>
  )
}
