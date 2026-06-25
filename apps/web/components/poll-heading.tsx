"use client"

import { Gift, ChartBarDecreasing } from "lucide-react"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"

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
        <div className="min-w-0">
          {onPledge ? (
            <button
              type="button"
              onClick={onPledge}
              className="cursor-pointer text-left text-[17px] font-medium tracking-[0.09em] text-[#7F77DD] uppercase transition-opacity hover:opacity-70"
            >
              {label}
            </button>
          ) : (
            <SectionLabel title={label} />
          )}
        </div>

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
