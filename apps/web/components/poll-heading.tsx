"use client"

import { PollTitle } from "@/components/favpoll-card/poll-title"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { getPollHint } from "@/lib/display"

type Props = {
  topicTitle: string
  reveal: string | null
  protagonistFirstName?: string
  pledged?: boolean
}

export function PollHeading({
  topicTitle,
  reveal,
  protagonistFirstName,
  pledged,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <PollTitle title={topicTitle} />
        {protagonistFirstName && !pledged && (
          <p className="text-sm text-[#888780] italic">
            &ndash; {getPollHint(protagonistFirstName)}
          </p>
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
