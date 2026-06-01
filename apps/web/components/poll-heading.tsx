"use client"

import { Gift, ChartBarDecreasing } from "lucide-react"
import { PollTitle } from "@/components/favpoll-card/poll-title"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"

type Props = {
  topicTitle: string
  reveal: string | null
  protagonistFirstName?: string
  onResetPledge?: () => void
  onViewResults?: () => void
}

export function PollHeading({
  topicTitle,
  reveal,
  protagonistFirstName,
  onResetPledge,
  onViewResults,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <PollTitle title={topicTitle} />
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

      {reveal && (
        <PollReveal
          personalReveal={reveal}
          protagonistFirstName={protagonistFirstName}
          role="status"
          aria-live="polite"
        />
      )}
    </div>
  )
}
