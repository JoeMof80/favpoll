"use client"

import { Gift, ChartBarDecreasing } from "lucide-react"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"
import { Button } from "./ui/button"

type Props = {
  topicTitle: string
  /** When set, the heading renders as a button that fires this callback */
  onPledge?: () => void
  onResetPledge?: () => void
  onViewResults?: () => void
}

export function PollHeading({
  topicTitle,
  onPledge,
  onResetPledge,
  onViewResults,
}: Props) {
  const label = `Favourite ${topicTitle}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <>
          {onPledge ? (
            <Button
              type="button"
              className="flex-1 text-[17px] font-medium tracking-[0.09em] uppercase"
              onClick={onPledge}
            >
              {label}
            </Button>
          ) : (
            <SectionLabel title={label} />
          )}
        </>

        {onResetPledge && (
          <TooltipIconButton
            icon={Gift}
            label="Pledge again"
            onClick={onResetPledge}
          />
        )}
        {onViewResults && (
          <TooltipIconButton
            icon={ChartBarDecreasing}
            label="View results"
            onClick={onViewResults}
          />
        )}
      </div>
    </div>
  )
}
