'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FavpollCardProvider } from './favpoll-card-context'
import { FavpollHeader } from './favpoll-header'
import { FavpollPoll } from './favpoll-poll'
import { FavpollCharityRow } from './favpoll-charity-row'
import type { FavpollCardProps, PollStep } from './types'

const STEPS: PollStep[] = ['choose', 'pledge', 'pledged']
const STEP_LABELS: Record<PollStep, string> = {
  choose: 'Choose',
  pledge: 'Pledge',
  pledged: 'Pledged',
}

export function FavpollCard({
  size = 'full',
  step,
  showSteps = false,
  onStepChange,
  showSharedFund = false,
  charities,
  poll,
  protagonistName,
  protagonistInitials,
  protagonistAvatarSrc,
  eyebrow,
  dateLabel,
}: FavpollCardProps) {
  const [internalStep, setInternalStep] = useState<PollStep>(step ?? 'choose')
  const activeStep = step ?? internalStep

  const handleStepChange = (s: PollStep) => {
    setInternalStep(s)
    onStepChange?.(s)
  }

  return (
    <FavpollCardProvider value={{ size }}>
      <div className="overflow-hidden rounded-[10px] border border-[#D3D1C7] bg-white">
        <div className="px-4 pt-4">
          <FavpollHeader
            protagonistName={protagonistName}
            protagonistInitials={protagonistInitials}
            protagonistAvatarSrc={protagonistAvatarSrc}
            eyebrow={eyebrow}
            dateLabel={dateLabel}
          />
        </div>

        {showSteps && (
          <div role="list" aria-label="Steps" className="flex items-center justify-center gap-2 py-3">
            {STEPS.map((s, i) => {
              const isActive = activeStep === s
              return (
                <Button
                  key={s}
                  variant="ghost"
                  size="icon"
                  role="listitem"
                  aria-label={`${STEP_LABELS[s]}, step ${i + 1} of ${STEPS.length}`}
                  aria-current={isActive ? 'step' : undefined}
                  onClick={() => handleStepChange(s)}
                  className={cn(
                    'h-1.5 rounded-full p-0 transition-[width] duration-200',
                    isActive ? 'bg-[#534AB7]' : 'bg-[#D3D1C7]'
                  )}
                  style={{ width: isActive ? 20 : 6 }}
                />
              )
            })}
          </div>
        )}

        <div className="px-4 pb-4">
          <FavpollPoll
            poll={poll}
            step={activeStep}
            showSharedFund={showSharedFund}
          />
        </div>

        {charities.length > 0 && (
          <div className="space-y-1.5 border-t border-[#D3D1C7] px-4 py-2.5">
            {charities.map((c) => (
              <FavpollCharityRow key={c.name} {...c} />
            ))}
          </div>
        )}
      </div>
    </FavpollCardProvider>
  )
}
